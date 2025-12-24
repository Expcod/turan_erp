from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import User, UserVerification, PasswordResetToken
from core.serializers import BaseSerializer

class UserSerializer(BaseSerializer):
    """User list and detail serializer"""
    
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone_number',
            'role', 'date_of_birth', 'bio', 'avatar', 'language', 'is_verified',
            'is_active', 'created_at', 'updated_at', 'password', 'confirm_password'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
        }
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.pop('confirm_password', None)
        
        if password and confirm_password:
            if password != confirm_password:
                raise serializers.ValidationError({
                    'confirm_password': _('Passwords do not match')
                })
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserListSerializer(serializers.ModelSerializer):
    """Simplified user list serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT token serializer with custom claims"""
    
    username_field = User.USERNAME_FIELD
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['name'] = user.get_full_name()
        token['email'] = user.email
        return token

class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data.get('username'),
            password=data.get('password')
        )
        
        if not user:
            raise serializers.ValidationError(
                _('Invalid username or password')
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                _('User account is disabled')
            )
        
        data['user'] = user
        return data

class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({
                'confirm_new_password': _('Passwords do not match')
            })
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    """Forgot password serializer"""
    
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    """Reset password serializer"""
    
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({
                'confirm_new_password': _('Passwords do not match')
            })
        return data

class UserVerificationSerializer(serializers.ModelSerializer):
    """User verification serializer"""
    
    class Meta:
        model = UserVerification
        fields = ['token', 'created_at', 'expires_at', 'is_used']
        read_only_fields = ['created_at', 'expires_at', 'is_used']

class TeacherCreateSerializer(serializers.ModelSerializer):
    """Create teacher with credentials"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone_number',
            'password', 'confirm_password', 'language'
        ]
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': _('Passwords do not match')
            })
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': _('Email already registered')
            })
        
        data.pop('confirm_password')
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role='teacher',
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user

class StudentCreateSerializer(serializers.ModelSerializer):
    """Create student with credentials"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone_number',
            'password', 'confirm_password', 'language'
        ]
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': _('Passwords do not match')
            })
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': _('Email already registered')
            })
        
        data.pop('confirm_password')
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role='student',
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user
