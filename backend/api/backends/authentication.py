from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from api.models import User


class FullNameAuthBackend(BaseBackend):
    def authenticate(self, request, first_name, middle_initial, last_name, account_type, password):
        # Query user based on given information
        try:
            user = User.objects.get(
                first_name=first_name,
                middle_initial=middle_initial,
                last_name=last_name,
            )   
            
            # 'admin' account type accounts for both 'admin' and 'super_admin' for this context
            if user.role == 'student' and account_type == 'admin' and user.type == 'student':
                return None
            elif user.role == 'teacher' and account_type == 'student':
                return None

        except User.DoesNotExist:
            return None
        
        # Validate password
        if user and check_password(password, user.password):
            return user
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
    
