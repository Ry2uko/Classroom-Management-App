from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.exceptions import ValidationError, NotFound
from .models import User, Classroom, Content, Course
from .constants import STRAND_CHOICES, ATTENDANCE_STATUS_VALUES
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
    create_classroom,
    delete_classroom,
    get_classroom_attendance,
    get_student_attendance,
    mark_student_attendance,
)
from pathlib import Path
import environ
import datetime

base_dir = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
environ.Env.read_env(env_file= base_dir / '.env')


def load_session_env(request):
    credentials_path = base_dir / env('CREDENTIALS_PATH', default='credentials.json')
    root_drive_folder_id = env('ROOT_DRIVE_FOLDER_ID', default='')
    attendance_spreadsheet_id = env('ATTENDANCE_SPREADSHEET_ID', default='')

    request.session['credentials_path'] = str(credentials_path)
    request.session['root_folder_id'] = root_drive_folder_id
    request.session['spreadsheet_id'] = attendance_spreadsheet_id


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

    def create(self, request):
        if 'credentials_path' not in request.session:
            return Response(
                { 'error': 'Session environment variables not loaded. Please refresh your token.' },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Duplicate classroom name
        classroom_name = request.data.get('name', None)
        if Classroom.objects.filter(name=classroom_name).exists():
            return Response(
                { 'error': 'Classroom with same name already exists.' },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Invalid grade level
        grade_level = request.data.get('grade', None)
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
        elif Classroom.objects.filter(grade=grade_level, strand=classroom_strand.upper()).exists():
            return Response(
                { 'error': 'Classrooms per grade level should have a unique strand.' },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create classroom
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            classroom = serializer.save()

            # Create classroom Drive folder and spreadsheet
            service_account = ServiceAccount(request.session.get('credentials_path',''))
            root_folder_id = request.session.get('root_folder_id', '')
            spreadsheet_id = request.session.get('spreadsheet_id', '')
            
            results = create_classroom(
                str(classroom),
                service_account.drive_service,
                root_folder_id,
                service_account.sheets_service,
                spreadsheet_id
            )

            classroom.grade_folder_id = results['grade_folder_id']
            classroom.classroom_folder_id = results['classroom_folder_id']
            classroom.sheet_id = results['sheet_id']
            classroom.save()

            serializer = self.get_serializer(classroom)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


class AttendanceView(APIView):
    def get(self, request):
        if 'credentials_path' not in request.session:
            return Response(
                { 'error': 'Session environment variables not loaded. Please refresh your token.' },
                status=status.HTTP_400_BAD_REQUEST,
            )
    
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
        

    def post(self, request):
        # Validations
        if 'credentials_path' not in request.session:
            return Response(
                { 'error': 'Session environment variables not loaded. Please refresh your token.' },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        attendance_data = {
            'late_time': '',
        }

        # Default Values
        attendance_data['late_time'] = ''
        attendance_data['date'] = datetime.date.today().strftime('%Y-%m-%d')

        required_data_values = [
            'student_id', 'classroom_id', 'attendance_status', 'marker_id'
        ]

        for required_data_value in required_data_values:
            data_value = request.data.get(required_data_value, None)

            if required_data_value == 'attendance_status' and data_value == 'L':
                if not (late_time := request.data.get('late_time', None)):
                    return Response(
                        { 'error': 'Missing attendance data: late_time' },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    attendance_data['late_time'] = late_time

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
        student = User.objects.get(
            id=attendance_data['student_id']
        )
        student_marker = User.objects.get(
            id=attendance_data['marker_id']
        )
        classroom = Classroom.objects.get(
            id=attendance_data['classroom_id']
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
        attendance_data['classroom'] = f'{classroom.grade}-{classroom.strand}'
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
    