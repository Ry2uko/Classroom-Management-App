from django.shortcuts import render
from django.db.models import Count, Q
from django.contrib.auth import logout
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
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


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

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
        print('SESSION:', user)
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



class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
