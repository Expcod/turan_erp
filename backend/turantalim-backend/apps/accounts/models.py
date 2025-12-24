from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from core.validators import RoleValidator, PhoneNumberValidator

class User(AbstractUser):
    """Extended User model with role-based access"""
    
    ROLE_CHOICES = (
        ('admin', _('Administrator')),
        ('teacher', _('Teacher')),
        ('student', _('Student')),
    )
    
    # Use email as the username field for authentication
    email = models.EmailField(_('email address'), unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='student',
        validators=[RoleValidator()],
        help_text=_("User role in the system")
    )
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[PhoneNumberValidator()],
        help_text=_("Uzbek phone number")
    )
    
    date_of_birth = models.DateField(blank=True, null=True)
    
    bio = models.TextField(blank=True, null=True)
    
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True
    )
    
    language = models.CharField(
        max_length=2,
        choices=[('uz', 'Uzbek'), ('tr', 'Turkish')],
        default='uz'
    )
    
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Email verified status")
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text=_("User account status")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_teacher(self):
        return self.role == 'teacher'
    
    @property
    def is_student(self):
        return self.role == 'student'


class UserVerification(models.Model):
    """Email verification tokens"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='verification'
    )
    
    token = models.CharField(max_length=255, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    expires_at = models.DateTimeField()
    
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_verifications'
        verbose_name = _('User Verification')
        verbose_name_plural = _('User Verifications')
    
    def __str__(self):
        return f"Verification for {self.user.email}"


class PasswordResetToken(models.Model):
    """Password reset tokens"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='reset_token'
    )
    
    token = models.CharField(max_length=255, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    expires_at = models.DateTimeField()
    
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = _('Password Reset Token')
        verbose_name_plural = _('Password Reset Tokens')
    
    def __str__(self):
        return f"Reset token for {self.user.email}"
