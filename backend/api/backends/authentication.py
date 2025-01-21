from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from api.models import User


class FullNameAuthBackend(BaseBackend):
    def authenticate(self, request, first_name, middle_initial, last_name, account_type, password):
        try:
            user = User.objects.get(
                first_name=first_name,
                middle_initial=middle_initial,
                last_name=last_name,
            )   

            # 'admin' account type accounts for both 'admin' and 'super_admin' for this context
            user_account_type = 'student' if user.type == 'student' else 'admin'
            if user.role == 'student':
                if account_type == 'admin' and user_account_type != 'admin':
                    # Account type does not match

                    return None
                elif user_account_type == 'admin' and account_type == 'student':
                    # Student admin login as student
                    user.logged_in_as = 'student'
                elif user_account_type == 'admin' and account_type == 'admin':
                    user.logged_in_as = user.account_type
            if user.role == 'teacher':
                if account_type == 'student':
                    return None


        except User.DoesNotExist:
            return None