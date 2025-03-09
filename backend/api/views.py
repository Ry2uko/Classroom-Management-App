from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.exceptions import ValidationError, NotFound
from .models import User, Classroom, Content, Course, File, ContentAttachment
from .constants import (
    STRAND_CHOICES, 
    ATTENDANCE_STATUS_VALUES, 
    VISIBILITY_CHOICES,
)
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    ClassroomSerializer, 
    ContentSerializer, 
    CourseSerializer
)
from .utils import (
    generate_unique_password,
    ServiceAccount,
    create_folder,
    rename_folder,
    rename_sheet,
    create_classroom,
    create_course,
    delete_course,
    delete_classroom,
    get_classroom_attendance,
    get_student_attendance,
    mark_student_attendance,
    upload_file,
    delete_file,
    delete_folder_by_id,
)
from pathlib import Path
from functools import wraps
import environ
import datetime
import os
import json

base_dir = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
environ.Env.read_env(env_file= base_dir / '.env')

# Helper Functions

def load_session_env(request):
    credentials_path = base_dir / env('CREDENTIALS_PATH', default='credentials.json')
    root_drive_folder_id = env('ROOT_DRIVE_FOLDER_ID', default='')
    attendance_spreadsheet_id = env('ATTENDANCE_SPREADSHEET_ID', default='')

    request.session['credentials_path'] = str(credentials_path)
    request.session['root_folder_id'] = root_drive_folder_id
    request.session['spreadsheet_id'] = attendance_spreadsheet_id


def check_session_credentials(func):
    """ Always used before using Google Drive/Sheets API. """

    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if 'credentials_path' not in request.session:
            return Response(
                { 'error': 'Session environment variables not loaded. Please refresh your token.' },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return func(self, request, *args, **kwargs)

    return wrapper


# Authentication Views

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if 'service_account' not in request.session:
            load_session_env(request)
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if 'service_account' not in request.session:
            load_session_env(request)

        return response


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# Session API

class UserSessionView(APIView):
    def get(self, request):
        user = request.user
        logged_in_as = request.session.get('logged_in_as', user.type)

        return Response({
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'first_name': user.first_name,
            'middle_initial': user.middle_initial,
            'last_name': user.last_name,
            'profile_img': user.profile_img.url if user.profile_img else None,
            'classroom_id': user.classroom.id if user.classroom else None,  
            'type': user.type,
            'role': user.role,
            'logged_in_as': logged_in_as
        })


# User API

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()

        USER_TYPES = ['student', 'admin', 'super_admin', '_admin']  # _admin -> either admin or super_admin
        user_type = self.request.query_params.get('type', None)
        if user_type is not None:
            if (user_type := user_type.lower()) not in USER_TYPES:
                raise ValidationError(f'Invalid user type.')

            if user_type == '_admin':
                queryset = queryset.filter(
                    Q(type='admin') | Q(type='super_admin')
                )
            else:
                queryset = queryset.filter(type=user_type)

        classroom_id = self.request.query_params.get('classroom', None)
        if classroom_id is not None:
            queryset = queryset.filter(classroom__id=classroom_id)
        
        return queryset
    
    def create(self, request):
        request_data = request.data.copy()

        pin_length = 4 if request_data.get('type', 'student') == 'student' else 6
        generated_password = generate_unique_password(pin_length)
        profile_img = request_data.pop('profile_img', None)

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid():
            user = serializer.save()

            if profile_img:
                user.profile_img = profile_img[0]
            user.set_password(generated_password)
            user.save()

            # Write password to text
            with open(base_dir / f"backend/media/passwords/{request_data.get('classroom', '0')}.txt", 'a') as f:
                f.write(f'{user.full_name}\t{generated_password}\n')

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # update method

# Course API

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all().annotate(
            contents_count=Count('contents')
        )
        
        strand = self.request.query_params.get('strand', None)
        if strand is not None:
            strand_choices = [strand_choice[0] for strand_choice in STRAND_CHOICES]
            if (strand := strand.upper()) not in strand_choices:
                raise ValidationError('Invalid strand')
            
            queryset = queryset.filter(
                Q(classroom__strand=strand)|Q(classroom__isnull=True)
            )
        
        major_only = self.request.query_params.get('major_only', False)
        if major_only and strand is not None:
            if major_only.lower() == 'true':
                queryset = queryset.filter(
                    classroom__strand=strand
                )

        return queryset

    @check_session_credentials
    def create(self, request):
        # Duplicate course name
        course_name = request.data.get('name', None)
        if Course.objects.filter(name=course_name).exists():
            return Response(
                { 'error': 'Course with same name already exists.' },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Invalid grade level
        grade_level = request.data.get('grade_level', None)
        if not isinstance(grade_level, int) or not (0 <= grade_level <= 12):
            return Response(
                { 'error': 'Invalid grade level. Grade level must be between 1-12.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Assign default user
        data = request.data.copy()
        if 'assigned' not in data or not data['assigned']:
            data['assigned'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            course = serializer.save()

            # Create course Drive folder
            service_account = ServiceAccount(request.session.get('credentials_path', ''))
            root_folder_id = request.session.get('root_folder_id', '')

            if course.is_major:
                classroom = course.classroom
                if not classroom:
                    return Response(
                        { 'error': 'Classroom is required to create a course.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                classroom_folder_id = classroom.classroom_folder_id
                if not classroom_folder_id:
                    return Response(
                        { 'error': 'Classroom does not have a Google drive folder. '},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Create a grade folder classroom, if it already exists get that id instead
                grade_level_name = f'Grade {course.grade_level}'
                grade_folder_results = create_folder(grade_level_name, service_account.drive_service, root_folder_id)

                if 'error' in grade_folder_results and grade_folder_results['error'] != 'folder already exists':
                    return Response(
                        { 'error': f'Something went wrong. Unable to create course.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                classroom_folder_id = grade_folder_results['folder_id']

            result = create_course(
                str(course),
                service_account.drive_service,
                classroom_folder_id
            )
            if not result:
                return Response(
                    { 'error': f'Something went wrong. Unable to create course.' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            course.course_folder_id = result['course_folder_id']
            course.save()

            serializer = self.get_serializer(course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    @check_session_credentials
    def update(self, request, pk=None):
        try:
            course = Course.objects.get(pk=pk)
        except Exception as e:
            return Response(
                { 'error': 'Course with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        new_name = request.data.get('name', None)
        if new_name and new_name != course.name:
            service_account = ServiceAccount(request.session.get('credentials_path', ''))
            result = rename_folder(
                course.course_folder_id,
                service_account.drive_service,
                new_name,
            )

            if 'error' in result:
                return Response(
                    { 'error': f'Something went wrong. Unable to rename course: {result["error"]}' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            course.name = new_name
            updated = True
        
        new_description = request.data.get('description', None)
        if new_description is not None and new_description != course.description:
            course.description = new_description
            updated = True

        if updated:
            course.save()

        serializer = self.get_serializer(course)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @check_session_credentials
    def destroy(self, request, pk=None):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                { 'error': 'Course with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST,
            )

        service_account = ServiceAccount(request.session.get('credentials_path', ''))

        if course.is_major:
            classroom_folder_id = course.classroom.classroom_folder_id
        else:
            classroom_folder_id = Classroom.objects.filter(
                grade_level=course.grade_level
            ).first().grade_folder_id


        if not classroom_folder_id:
            return Response(
                { 'error': 'Classroom does not have a Google drive folder. '},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = delete_course(
            str(course),
            service_account.drive_service,
            classroom_folder_id
        )

        if not result:
            return Response(
                { 'error': f'Something went wrong. Unable to delete course.' },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(course)
        course.delete()
        serializer.data['id'] = course.id

        return Response(serializer.data, status=status.HTTP_200_OK)


# Classroom API

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    def get_queryset(self):
        queryset = Classroom.objects.all()
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise NotFound(detail='User not found')
            
            queryset = queryset.filter(id=user.classroom.id)

        return queryset

    @check_session_credentials
    def create(self, request):
        # Duplicate classroom name
        classroom_name = request.data.get('name', None)
        if Classroom.objects.filter(name=classroom_name).exists():
            return Response(
                { 'error': 'Classroom with same name already exists.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Invalid grade level
        grade_level = request.data.get('grade_level', None)
        if not isinstance(grade_level, int) or not (0 <= grade_level <= 12):
            return Response(
                { 'error': 'Invalid grade level. Grade level must be between 1-12.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Invalid strand
        strand_choices = [strand_choice[0] for strand_choice in STRAND_CHOICES]
        classroom_strand = request.data.get('strand', None)
        if classroom_strand.upper() not in strand_choices:
            return Response(
                { 'error': 'Invalid strand or strand does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )
        elif Classroom.objects.filter(grade_level=grade_level, strand=classroom_strand.upper()).exists():
            return Response(
                { 'error': 'Classrooms per grade level should have a unique strand.' },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create classroom
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            classroom = serializer.save()

            # Create classroom Drive folder and spreadsheet
            service_account = ServiceAccount(request.session.get('credentials_path', ''))
            root_folder_id = request.session.get('root_folder_id', '')
            spreadsheet_id = request.session.get('spreadsheet_id', '')
            
            result = create_classroom(
                str(classroom),
                service_account.drive_service,
                root_folder_id,
                service_account.sheets_service,
                spreadsheet_id
            )

            if not result:
                return Response(
                    { 'error': f'Something went wrong. Unable to create classroom.' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            classroom.grade_folder_id = result['grade_folder_id']
            classroom.classroom_folder_id = result['classroom_folder_id']
            classroom.sheet_id = result['sheet_id']
            classroom.save()

            serializer = self.get_serializer(classroom)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @check_session_credentials
    def update(self, request, pk=None):
        try:
            classroom = Classroom.objects.get(
                pk=pk
            )
        except Classroom.DoesNotExist:
            return Response(
                { 'error': 'Classroom with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        spreadsheet_id = request.session.get('spreadsheet_id', '')

        new_name = request.data.get('name', None)
        if new_name and new_name != classroom.name:
            result = rename_folder(
                classroom.classroom_folder_id,
                service_account.drive_service,
                f"{str(classroom).split()[0]} {new_name}",
            )
            if 'error' in result:
                return Response(
                    { 'error': f'Something went wrong. Unable to rename classroom: {result["error"]}' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            sheets_result = rename_sheet(
                classroom.sheet_id,
                service_account.sheets_service,
                spreadsheet_id,
                f"{str(classroom).split()[0]} {new_name}"
            )
            if 'error' in sheets_result:
                return Response(
                    { 'error': f'Something went wrong. Unable to rename classroom sheet: {sheets_result["error"]}' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            classroom.name = new_name
            classroom.save()

        serializer = self.get_serializer(classroom)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @check_session_credentials
    def destroy(self, request, pk=None):
        try:
           classroom = Classroom.objects.get(
               pk=pk
           )
        except Classroom.DoesNotExist:
           return Response(
                { 'error': 'Classroom with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete classroom Drive folder and spreadsheet        
        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        root_folder_id = request.session.get('root_folder_id', '')
        spreadsheet_id = request.session.get('spreadsheet_id', '')

        result = delete_classroom(
            str(classroom),
            service_account.drive_service,
            root_folder_id,
            service_account.sheets_service,
            spreadsheet_id         
        )
        
        if not result:
            return Response(
                { 'error': f'Something went wrong. Unable to delete classroom.' },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Delete classroom grade folder if last
        if Classroom.objects.filter(grade_level=classroom.grade_level).count() == 1:
            result = delete_classroom(
                f"Grade {classroom.grade_level}",
                service_account.drive_service,
                root_folder_id
            )

            if not result:
                return Response(
                    { 'error': f'Something went wrong. Unable to delete grade classroom.' },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        serializer = self.get_serializer(classroom)
        classroom.delete()
        serializer.data['id'] = classroom.id
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    

# Content API

class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    
    def get_queryset(self):
        queryset = Content.objects.filter(is_archived=False)
        return queryset

    @check_session_credentials
    def create(self, request):
        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        root_folder_id = request.session.get('root_folder_id', '')
        request_data = request.data.copy()

        if 'created_by' not in request_data:
            request_data['created_by'] = request.user.id

        content_category = request_data.get('content_category', None)
        if content_category and content_category == 'course':
            course_id = request_data.get('course', None)
            if not course_id:
                return Response(
                    { 'error': 'Course is required to create a course content.' },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            classroom = request_data.get('classroom', None)
            if not classroom:
                course = Course.objects.get(pk=course_id)
                request_data['classroom'] = course.classroom.id

            folder_id = course.course_folder_id
            request_data['visibility'] = 'course'
            request_data['grade_level'] = course.classroom.grade_level

        elif content_category and content_category == 'school':
            # Check if 'School Materials' folder exists
            results = service_account.drive_service.files().list(
                q=f"name='School Materials' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                    and '{root_folder_id}' in parents",
                fields="files(id, name)"
            ).execute()

            folders = results.get('files', [])
            if not folders:
                cm_folder_results = create_folder('School Materials', service_account.drive_service, root_folder_id)

                if 'error' in cm_folder_results:
                    return Response(
                        { 'error': f'Something went wrong. Unable to create school materials folder.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                folder_id = cm_folder_results['folder_id']
            else:
                folder_id = folders[0]['id']

            request_data['visibility'] = 'school'
        
        elif content_category and content_category == 'classroom':
            grade_level = request.data.get('grade_level', None)

            if not grade_level:
                # Handle major subjects
                classroom_id = request_data.get('classroom', None)
                if not classroom_id:
                    return Response(
                        { 'error': 'Classroom is required to create a classroom content.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    classroom = Classroom.objects.get(pk=classroom_id)
                except Classroom.DoesNotExist:
                    return Response(
                        { 'error': 'Classroom with that id does not exist.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                request_data['grade_level'] = classroom.grade_level
                parent_folder_id = classroom.classroom_folder_id
            else:
                # Handle core subjects
                results = service_account.drive_service.files().list(
                    q=f"name='Grade {grade_level}' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                        and '{root_folder_id}' in parents",
                    fields="files(id, name)"
                ).execute()

                folders = results.get('files', [])
                if not folders:
                    grade_folder_results = create_folder(f'Grade {grade_level}', service_account.drive_service, root_folder_id)

                    if 'error' in grade_folder_results:
                        return Response(
                            { 'error': f'Something went wrong. Unable to create grade folder.' },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    parent_folder_id = grade_folder_results['folder_id']
                else:
                    parent_folder_id = folders[0]['id']
                
                request_data['grade_level'] = int(grade_level)

            # Check if 'Classroom Materials' folder exists
            results = service_account.drive_service.files().list(
                q=f"name='Classroom Materials' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                    and '{parent_folder_id}' in parents",
                fields="files(id, name)"
            ).execute()

            folders = results.get('files', [])  
            if folders:
                # Check for course named 'Classroom Materials' (special case)
                try:
                    course = Course.objects.get(name='Classroom Materials', classroom=classroom)

                    cm_folder_results = create_folder('Classroom Materials', service_account.drive_service, parent_folder_id, allow_duplicate=True)

                    if 'error' in cm_folder_results:
                        return Response(
                            { 'error': f'Something went wrong. Unable to create classroom materials folder.' },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    folder_id = cm_folder_results['folder_id']
                except Course.DoesNotExist:
                    folder_id = folders[0]['id']
            else:
                cm_folder_results = create_folder('Classroom Materials', service_account.drive_service, parent_folder_id, allow_duplicate=True)

                if 'error' in cm_folder_results:
                    return Response(
                        { 'error': f'Something went wrong. Unable to create classroom materials folder.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                folder_id = cm_folder_results['folder_id']

            request_data['visibility'] = 'classroom'
                    
        elif content_category and content_category == 'announcement':
            content_visibility = request.data.get('visibility', None)
            if not content_visibility:
                return Response(
                    { 'error': 'Visibility is required for announcement content.' },
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif content_visibility.lower() not in [vc[0] for vc in VISIBILITY_CHOICES]:
                return Response(
                    { 'error': 'Invalid content visibility.' },
                    status=status.HTTP_400_BAD_REQUEST
                ) 
            
            # Check if 'Announcements Media' folder exists
            if content_visibility == 'course':
                course_id = request_data.get('course', None)
                if not course_id:
                    return Response(
                        { 'error': 'Course is required to create an announcement folder.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    course = Course.objects.get(pk=course_id)
                    
                except Course.DoesNotExist:
                    return Response(
                        { 'error': 'Course with that id does not exist.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )   
                
                request_data['classroom'] = course.classroom.id
                request_data['grade_level'] = course.classroom.grade_level
                parent_folder_id = course.course_folder_id

            elif content_visibility == 'classroom':
                classroom_id = request_data.get('classroom', None)
                if not classroom_id:
                    return Response(
                        { 'error': 'Classroom is required to create a classroom content.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )     
            
                try:
                    classroom = Classroom.objects.get(pk=classroom_id)
                except Classroom.DoesNotExist:
                    return Response(
                        { 'error': 'Classroom with that id does not exist.' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                request_data['grade_level'] = classroom.grade_level
                parent_folder_id = classroom.classroom_folder_id

            else: 
                parent_folder_id = root_folder_id


            results = service_account.drive_service.files().list(
                q=f"name='Announcements Media' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                    and '{parent_folder_id}' in parents",
                fields="files(id, name)"
            ).execute()

            folders = results.get('files', [])
            if not folders:
                cm_folder_results = create_folder('Announcements Media', service_account.drive_service, parent_folder_id)

                if 'error' in cm_folder_results:
                    return Response(
                        { 'error': f'Something went wrong. Unable to create announcements media folder.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                folder_id = cm_folder_results['folder_id']
            else:
                folder_id = folders[0]['id']   

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid():
            content = serializer.save()
            
            uploaded_files = request.FILES.getlist('files')
            if uploaded_files:
                # Handle file attachment
                content_results = create_folder(content.title, service_account.drive_service, folder_id, allow_duplicate=True)

                if 'error' in content_results:
                    return Response(
                        { 'error': f'Something went wrong. Unable to create content folder.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                content.content_folder_id = content_results['folder_id']
                content.save()

                for uploaded_file in uploaded_files:
                    file_results = upload_file(
                        service_account.drive_service,
                        uploaded_file,
                        uploaded_file.name,
                        uploaded_file.content_type,
                        content.content_folder_id
                    )

                    if 'error' in file_results:
                        return Response(
                            { 'error': f'Something went wrong. Unable to upload file.' },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    # Create file model
                    file = File.objects.create(
                        file_name=os.path.splitext(uploaded_file.name)[0],
                        drive_id=file_results['file_id'],
                        drive_web_link=file_results['webViewLink'],
                        file_type=os.path.splitext(uploaded_file.name)[1][1:].lower(),
                        file_size=uploaded_file.size,
                        mime_type=uploaded_file.content_type,
                        uploaded_by_id=content.created_by.id
                    )

                    # Attach file to content via ContentAttachment
                    ContentAttachment.objects.create(
                        content=content,
                        file=file
                    )

            urls = json.loads(request_data.get('urls', '[]'))
            for url in urls:
                ContentAttachment.objects.create(
                    content=content,
                    url=url,
                    attachment_type='url',
                )

            serializer = self.get_serializer(content)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @check_session_credentials
    def destroy(self, request, pk=None):
        try:
            content = Content.objects.get(pk=pk)
        except Content.DoesNotExist:
            return Response(
                { 'error': 'Content with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        service_account = ServiceAccount(request.session.get('credentials_path', ''))

        # Delete content folder from Google Drive
        result = delete_folder_by_id(content.content_folder_id, service_account.drive_service)
        if 'error' in result:
            return Response(
                { 'error': f'Something went wrong. Unable to delete content folder: {result["error"]}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Delete associated files
        for attachment in content.attachments.all():
            attachment.file.delete()

        serializer = self.get_serializer(content)
        content.delete()
        serializer.data['id'] = content.id

        return Response(serializer.data, status=status.HTTP_200_OK)

    @check_session_credentials
    def update(self, request, pk=None):
        try:
            content = Content.objects.get(pk=pk)
        except Content.DoesNotExist:
            return Response(
                { 'error': 'Content with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        root_folder_id = request.session.get('root_folder_id', '')
        request_data = request.data.copy()
        print(request_data)

        # Archive content
        archive = request_data.get('archive', None)
        if archive is not None:
            content.is_archived = archive
            content.save()
            serializer = self.get_serializer(content)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Update content title
        new_title = request_data.get('title', None)
        if new_title:
            if content.content_folder_id:
                result = rename_folder(
                    content.content_folder_id,
                    service_account.drive_service,
                    new_title
                )

                if 'error' in result:
                    return Response(
                        { 'error': f'Something went wrong. Unable to rename content folder: {result["error"]}' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            content.title = new_title
        
        # Update content urls
        url_content_updated = request_data.get('url_content_updated', None)
        if url_content_updated: # added or removed urls
            for attachment in content.attachments.all():
                if attachment.attachment_type == 'url':
                    attachment.delete()

            if request_data.get('urls', None) is not None:
                urls = json.loads(request_data.get('urls', '[]'))
                for url in urls:
                    ContentAttachment.objects.create(
                        content=content,
                        url=url,
                        attachment_type='url',
                    )

        # Update content files
        file_content_updated = request_data.get('file_content_updated', None)
        if file_content_updated:  # Added or removed files
            if content.content_category == 'classroom':
                parent_folder_id = content.classroom.classroom_folder_id

                results = service_account.drive_service.files().list(
                    q=f"name='Classroom Materials' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                        and '{parent_folder_id}' in parents",
                    fields="files(id, name)"
                ).execute()

                folders = results.get('files', []) 
                folder_id = folders[0]['id']
            elif content.content_category == 'course':
                parent_folder_id = content.course.course_folder_id
            elif content.content_category == 'school':
                results = service_account.drive_service.files().list(
                    q=f"name='School Materials' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                        and '{root_folder_id}' in parents",
                    fields="files(id, name)"
                ).execute()

                folders = results.get('files', [])
                folder_id = folders[0]['id']
            else:  # Announcemetn
                if content.visibility == 'course':
                    parent_folder_id = content.course_folder_id
                elif content.visibility == 'classroom':
                    parent_folder_id = content.classroom_folder_id
                else:
                    parent_folder_id = root_folder_id

                results = service_account.drive_service.files().list(
                    q=f"name='Announcements Media' and mimeType='application/vnd.google-apps.folder' and trashed=False \
                        and '{parent_folder_id}' in parents",
                    fields="files(id, name)"
                ).execute()

                folders = results.get('files', [])
                folder_id = folders[0]['id']

            # Delete content attachments and files
            service_account = ServiceAccount(request.session.get('credentials_path', ''))
            result = delete_folder_by_id(content.content_folder_id, service_account.drive_service)
            
            for attachment in content.attachments.all():
                if attachment.attachment_type == 'file':
                    attachment.file.delete()    
                    attachment.delete() 

            content.content_folder_id = ''
            
            if request_data.get('files', None) is not None:
                # Create new content folder and content attachments + files
                content_results = create_folder(content.title, service_account.drive_service, folder_id, allow_duplicate=True)    
                if 'error' in content_results:
                    return Response(
                        { 'error': f'Something went wrong. Unable to create content folder.' },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                content.content_folder_id = content_results['folder_id']
                uploaded_files = request.FILES.getlist('files')

                for uploaded_file in uploaded_files:
                    file_results = upload_file(
                        service_account.drive_service,
                        uploaded_file,
                        uploaded_file.name,
                        uploaded_file.content_type,
                        content.content_folder_id
                    )

                    if 'error' in file_results:
                        return Response(
                            { 'error': f'Something went wrong. Unable to upload file.' },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    # Create file model
                    file = File.objects.create(
                        file_name=os.path.splitext(uploaded_file.name)[0],
                        drive_id=file_results['file_id'],
                        drive_web_link=file_results['webViewLink'],
                        file_type=os.path.splitext(uploaded_file.name)[1][1:].lower(),
                        file_size=uploaded_file.size,
                        mime_type=uploaded_file.content_type,
                        uploaded_by_id=content.created_by.id
                    )

                    # Attach file to content via ContentAttachment
                    ContentAttachment.objects.create(
                        content=content,
                        file=file
                    )

        # Update content
        new_content = request_data.get('content', None)
        if new_content is not None:
            content.content = new_content 

        # Update content type
        attached_contents = ContentAttachment.objects.filter(
            content=content,
        )

        if attached_contents:
            if content.content == '':
                content.content_type = 'attached'
            else:
                content.content_type = 'mixed'
        else:
            content.content_type = 'text'

        content.save() 
        serializer = self.get_serializer(content)
        return Response(self.get_serializer(content).data, status=status.HTTP_200_OK)


# Attendance API

class AttendanceView(APIView):

    @check_session_credentials
    def get(self, request):
        """ Get classroom or student attendance. """

        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        spreadsheet_id = request.session.get('spreadsheet_id', '')
        sheet_name = ''

        start_date = request.query_params.get('start', None)
        end_date = request.query_params.get('end', None)
        student_id = request.query_params.get('student_id', None)
        classroom_id = request.query_params.get('classroom_id', None)

        result = {}

        if student_id is None and classroom_id is None:
            return Response(
                { 'error': 'Provide either student_id or classroom_id or both.' },
                status=status.HTTP_400_BAD_REQUEST
            )
        elif classroom_id is None:
            # Get student attendance
            student = User.objects.get(
                id=student_id
            )

            sheet_name = str(student.classroom)
            student_attendance_data = get_student_attendance(
                service_account.sheets_service,
                spreadsheet_id,
                sheet_name,
                student_id,
                start_date,
                end_date
            )
            formatted_attendance = []

            if student_attendance_data:
                result['student_id'] = student_attendance_data[0][1]
                result['student_name'] = student_attendance_data[0][2]
                result['classroom_id'] = student_attendance_data[0][3]

            for student_attendance in student_attendance_data:
                formatted_attendance.append({
                    'date': student_attendance[0],
                    'attendance_status': student_attendance[5],
                    'late_time': student_attendance[6],
                    'marked_by': student_attendance[7],
                    'marker_id': student_attendance[8],
                })

            result['attendance'] = formatted_attendance
        else:
            # Get classroom attendance
            classroom = Classroom.objects.get(
                id=classroom_id
            )

            sheet_name = str(classroom)
            classroom_attendance_data = get_classroom_attendance(
                service_account.sheets_service,
                spreadsheet_id,
                sheet_name,
                start_date,
                end_date
            )
            formatted_attendance = []

            if classroom_attendance_data:
                result['classroom_id'] = classroom_attendance_data[0][3]
                result['classroom_name'] = classroom_attendance_data[0][4]

            for classroom_attendance in classroom_attendance_data:
                formatted_attendance.append({
                    'date': classroom_attendance[0],
                    'student_id': classroom_attendance[1],
                    'student_name': classroom_attendance[2],
                    'attendance_status': classroom_attendance[5],
                    'late_time': classroom_attendance[6],
                    'marked_by': classroom_attendance[7],
                    'marker_id': classroom_attendance[8],
                })
            
            result['attendance'] = formatted_attendance

        return Response(result, status=status.HTTP_200_OK)
    
    @check_session_credentials
    def post(self, request):
        """ Mark student attendance. """

        # Validations
        attendance_data = { 'late_time': '', }

        attendance_data['date'] = datetime.date.today().strftime('%Y-%m-%d')
        required_data_values = [
            'student_id', 'classroom_id', 'attendance_status', 'marker_id'
        ]

        for required_data_value in required_data_values:
            data_value = request.data.get(required_data_value, None)

            # Late attendance status and late time
            if required_data_value == 'attendance_status' and data_value == 'L':
                if not (late_time := request.data.get('late_time', None)):
                    return Response(
                        { 'error': 'Missing attendance data: late_time' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    attendance_data['late_time'] = late_time

            # Missing attendance data
            if not data_value:
                return Response(
                    { 'error': f'Missing attendance data: {required_data_value}' },
                    status=status.HTTP_400_BAD_REQUEST
                )

            attendance_data[required_data_value] = data_value

        if (att_date := request.data.get('date', '')):
            attendance_data['date'] = att_date

        if request.data.get('attendance_status', '') not in ATTENDANCE_STATUS_VALUES:
            return Response(
                { 'error': f'Invalid attendance status. Choose one: P, L, A, E.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Arrange attendance data
        try:
            student = User.objects.get(
                id=attendance_data['student_id']
            )
        except User.DoesNotExist:
            return Response(
                { 'error': 'Student with that id (student_id) does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student_marker = User.objects.get(
                id=attendance_data['marker_id']
            )
        except User.DoesNotExist:
            return Response(
                { 'error': 'Student with that id (marker_id) does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )


        try:
            classroom = Classroom.objects.get(
                id=attendance_data['classroom_id']
            )
        except Classroom.DoesNotExist:
            return Response(
                { 'error': 'Classroom with that id does not exist.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        service_account = ServiceAccount(request.session.get('credentials_path', ''))
        spreadsheet_id = request.session.get('spreadsheet_id', '')
        sheet_name = str(classroom)

        # Check if attendance has been marked for that student today already
        student_attendance = get_student_attendance(
            service_account.sheets_service,
            spreadsheet_id,
            sheet_name,
            student.id,
            attendance_data['date'],
            attendance_data['date'],
        )
        if student_attendance:
            return Response(
                { 'error': 'Attendance for this student has already been marked for this date.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance_data['student_name'] = student.full_name
        attendance_data['classroom'] = f'{classroom.grade_level}-{classroom.strand}'
        att_prefix = ''
        if student_marker.role == 'teacher':
            if student_marker.sex == 'M':
                att_prefix = 'Sir '
            else:
                att_prefix = 'Ms '

        attendance_data['marked_by'] = att_prefix + student_marker.username
        
        # Mark student attendance
        result = mark_student_attendance(
            service_account.sheets_service,
            spreadsheet_id,
            sheet_name,
            attendance_data,
        )

        if not result:
            return Response(
                { 'error': f'Something went wrong. Unable to mark attendance.' },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response(attendance_data, status=status.HTTP_201_CREATED)
    
    # update API