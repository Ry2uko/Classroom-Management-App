from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    UserSessionView,
    UserViewSet, 
    ClassroomViewSet, 
    ContentViewSet, 
    CourseViewSet, 
    LogoutView,
    AttendanceView
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'contents', ContentViewSet, basename='content')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', UserSessionView.as_view(), name='user_session'),
    path('', include(router.urls)),
    path('attendance/', AttendanceView.as_view(), name='attendance'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    