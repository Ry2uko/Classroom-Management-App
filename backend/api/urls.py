from django.urls import path, include
from rest_framework import routers
from .views import UserViewSet, ClassroomViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
]