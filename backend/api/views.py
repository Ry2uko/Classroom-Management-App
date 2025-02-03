from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.exceptions import ValidationError, NotFound
from .models import User, Classroom, Content, Course
from .constants import STRAND_CHOICES
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    ClassroomSerializer, 
    ContentSerializer, 
    CourseSerializer
)
from .utils import (
    ServiceAccount,
    create_classroom,
)
from pathlib import Path
import environ

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

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
