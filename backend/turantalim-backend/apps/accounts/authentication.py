from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _

class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication with error messages"""
    
    def authenticate_header(self, request):
        return 'Bearer'
    
    def get_validated_token(self, raw_token):
        try:
            return super().get_validated_token(raw_token)
        except AuthenticationFailed:
            raise AuthenticationFailed(
                _('Invalid or expired authentication token')
            )
