from django.urls import path, include
from rest_framework import routers
from .views import UserViewSet, ClassroomViewSet, ContentViewSet, CourseViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'contents', ContentViewSet, basename='content')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]