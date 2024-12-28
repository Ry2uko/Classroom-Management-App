from rest_framework import serializers 
from .models import User, Classroom


class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ['id', 'username', 'first_name', 'middle_initial', 'last_name', 'type', 'classroom']


class ClassroomSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(type='super_admin'))
    
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'grade', 'strand', 'grade', 'drive_folder', 'created_by', 'created_at']
