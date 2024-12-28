from django.shortcuts import render
from rest_framework import viewsets
from .models import User, Classroom
from .serializers import UserSerializer, ClassroomSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer