from rest_framework import serializers 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User, Classroom, Content, Course
from .constants import USER_TYPES
import re

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):   
    full_name = serializers.CharField()
    password = serializers.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields.pop('username', None)
        self.fields['full_name'] = serializers.CharField()
        self.fields['type'] = serializers.CharField()
        self.fields['password'] = serializers.CharField(write_only=True)

    def validate(self, attrs):
        full_name = attrs.get('full_name')  # FIRST_NAME MIDDLE_INITIAL LAST_NAME
        password = attrs.get('password')
        account_type = attrs.get('type')

        """"
        Dev Note: Validating a user's full name is tricky because there could me multiple combinations
        where the first name could be one or more names or one or more last names. Initially,
        middle initials are supposed to be optional, but upon further thinknig, having the
        middle initial optional complicates a LOT of stuff.

        For example: "John Mark A. Delos Reyes"
        In this case, the first and last name can be easily differentiated, by first identifying
        which is the middle initial, which in this case "A.". Then the first name is just the left part of
        the middle initial, and the last name is the right part.

        Problems arise when the middle initial is not provided: "John Mark Delos Reyes"
        It's intuitive to think that "Delos Reyes" is the last name, but programatically,
        there's no way to really tell which is the actual last name as there could be multiple combinations.
        For this case, it's either "Mark Delos Reyes", "Delos Reyes", or "Reyes". While, there COULD be
        a solution for this, at this point, it's just better to just not make it option. Hence the decision
        , and also to make up for its term "Full Name" lol.
        """

        # Check user type if valid
        # Student admins can either log in as a student or an admin
        # While, teachers can only log in as admins
        if account_type.lower() not in [user_type[0] for user_type in USER_TYPES]:
            raise serializers.ValidationError({ 'detail': 'Invalid account type.' })

        # Validate full name
        splitted = full_name.title().split()
        middle_initial_regex = r'^[A-Z]\.?$';
        first_name = []
        last_name = []
        middle_initial = ''

        for name in splitted:
            if (matched := re.match(middle_initial_regex, name)):
                middle_initial = matched[0][0]
                continue

            if not middle_initial:
                first_name.append(name)
            else:
                last_name.append(name)
            
        first_name = ' '.join(first_name)
        last_name = ' '.join(last_name)

        if not middle_initial or not last_name:
            raise serializers.ValidationError({ 'detail': 'Invalid full name format.' })

        # Authenticate user by full name
        self.user = authenticate(
            request=self.context.get('request'),
            first_name=first_name,
            middle_initial=middle_initial,
            account_type=account_type,
            last_name=last_name,
            password=password,
        )

        if not self.user:
            raise serializers.ValidationError({
                'detail': 'Invalid credentials.'
            })
        
        attrs['username'] = self.user.username
        attrs['full_name'] = full_name
        attrs['type'] = self.user.type
        data = super().validate(attrs)

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        
        return token


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
    contents_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
