from django.urls import path, include
from rest_framework import routers
from .views import UserViewSet, ClassroomViewSet

router = routers.DefaultRouter()
router.register(r'user', UserViewSet)
router.register(r'classroom', ClassroomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]