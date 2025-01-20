from rest_framework import serializers 
from .models import User, Classroom, Content, Course


class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ('id', 'username', 'first_name', 'middle_initial', 'last_name', 'type', 'role', 'sex', 'profile_img', 'classroom')


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    contents_count = serializers.IntegerField()
    
    class Meta:
        model = Course
        fields = '__all__'
