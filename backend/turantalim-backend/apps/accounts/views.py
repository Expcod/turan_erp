from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import timedelta, datetime
import secrets

from apps.accounts.models import User, UserVerification, PasswordResetToken
from apps.accounts.serializers import (
    UserSerializer, UserListSerializer, LoginSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, CustomTokenObtainPairSerializer,
    TeacherCreateSerializer, StudentCreateSerializer
)
from apps.accounts.permissions import IsAdmin, IsStudent
from core.filters import UserFilter

class LoginView(TokenObtainPairView):
    """User login endpoint"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class LogoutView(generics.GenericAPIView):
    """User logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)

class UserListView(generics.ListCreateAPIView):
    """List and create users (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer
    filter_set_class = UserFilter
    pagination_class = None
    
    def get_queryset(self):
        return User.objects.filter(is_active=True)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """User detail endpoint"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=user.id)

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get current authenticated user"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    """Change password endpoint"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Wrong password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'detail': 'Password changed successfully'})

class ForgotPasswordView(generics.GenericAPIView):
    """Request password reset"""
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            token = secrets.token_urlsafe(32)
            expires_at = timezone.now() + timedelta(hours=24)
            
            PasswordResetToken.objects.update_or_create(
                user=user,
                defaults={
                    'token': token,
                    'expires_at': expires_at
                }
            )
            
            # TODO: Send email with reset link
            
            return Response({
                'detail': 'Password reset link sent to your email',
                'token': token  # In production, don't return token
            })
        except User.DoesNotExist:
            return Response(
                {'email': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class ResetPasswordView(generics.GenericAPIView):
    """Reset password with token"""
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=serializer.validated_data['token'],
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            user = reset_token.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            return Response({'detail': 'Password reset successfully'})
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'token': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )

class StudentRegisterView(generics.CreateAPIView):
    """Student registration endpoint"""
    serializer_class = StudentCreateSerializer
    permission_classes = [AllowAny]

class TeacherRegisterView(generics.CreateAPIView):
    """Teacher registration (Admin only)"""
    serializer_class = TeacherCreateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class TeacherListView(generics.ListCreateAPIView):
    """List all teachers"""
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_set_class = UserFilter
    
    def get_queryset(self):
        return User.objects.filter(role='teacher', is_active=True)

class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Teacher detail endpoint"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return User.objects.filter(role='teacher')

class StudentListView(generics.ListCreateAPIView):
    """List all students"""
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_set_class = UserFilter
    
    def get_queryset(self):
        return User.objects.filter(role='student', is_active=True)

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Student detail endpoint"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return User.objects.filter(role='student')


class StudentDashboardView(generics.GenericAPIView):
    """Student dashboard data endpoint"""
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        user = request.user
        
        # Get student's groups
        from apps.courses.models import Group
        from apps.lessons.models import Lesson
        from apps.homework.models import Homework
        from apps.gamification.models import StudentCoin
        from apps.attendance.models import Attendance
        
        # Get coin balance
        coin_balance, _ = StudentCoin.objects.get_or_create(student=user)
        coins = coin_balance.total_coins
        
        # Get student's groups
        student_groups = Group.objects.filter(students=user, status='active')
        
        # Get all lessons for student's groups
        all_lessons = Lesson.objects.filter(group__in=student_groups)
        total_lessons = all_lessons.count()
        completed_lessons = all_lessons.filter(status='completed').count()
        
        # Get homework stats
        all_homeworks = Homework.objects.filter(student=user)
        pending_homework = all_homeworks.filter(status__in=['assigned', 'second_chance']).count()
        
        # Calculate average score from approved homeworks
        approved_homeworks = all_homeworks.filter(status='approved', similarity_score__isnull=False)
        if approved_homeworks.exists():
            average_score = int(approved_homeworks.aggregate(avg=Avg('similarity_score'))['avg'] * 100)
        else:
            average_score = 0
        
        # Get upcoming lessons
        today = timezone.now().date()
        upcoming_lessons = all_lessons.filter(
            scheduled_date__gte=today,
            status__in=['scheduled', 'rescheduled']
        ).order_by('scheduled_date', 'start_time')[:5]
        
        upcoming_lessons_data = []
        for lesson in upcoming_lessons:
            upcoming_lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'date': lesson.scheduled_date.strftime('%Y-%m-%d'),
                'time': lesson.start_time.strftime('%H:%M'),
                'group': lesson.group.name,
                'group_id': lesson.group.id
            })
        
        # Get recent submissions
        recent_submissions = all_homeworks.exclude(
            status='assigned'
        ).order_by('-submission_date', '-updated_at')[:5]
        
        recent_submissions_data = []
        for hw in recent_submissions:
            score = int(hw.similarity_score * 100) if hw.similarity_score else 0
            recent_submissions_data.append({
                'id': hw.id,
                'lesson': hw.lesson.title,
                'lesson_id': hw.lesson.id,
                'status': 'accepted' if hw.status == 'approved' else ('rejected' if hw.status == 'rejected' else 'pending'),
                'score': score,
                'coins': hw.coins_earned
            })
        
        # Get course progress (first active group)
        course_progress = None
        if student_groups.exists():
            first_group = student_groups.first()
            group_lessons = Lesson.objects.filter(group=first_group)
            group_total = group_lessons.count()
            group_completed = group_lessons.filter(status='completed').count()
            progress_percent = int((group_completed / group_total * 100)) if group_total > 0 else 0
            
            course_progress = {
                'group_name': first_group.name,
                'group_id': first_group.id,
                'total_lessons': group_total,
                'completed_lessons': group_completed,
                'progress_percent': progress_percent
            }
        
        # Calculate coins trend (compare with last month)
        from apps.gamification.models import CoinTransaction
        last_month = timezone.now() - timedelta(days=30)
        coins_this_month = CoinTransaction.objects.filter(
            student=user,
            transaction_type='earned',
            created_at__gte=last_month
        ).aggregate(total=Count('amount'))['total'] or 0
        
        two_months_ago = timezone.now() - timedelta(days=60)
        coins_last_month = CoinTransaction.objects.filter(
            student=user,
            transaction_type='earned',
            created_at__gte=two_months_ago,
            created_at__lt=last_month
        ).aggregate(total=Count('amount'))['total'] or 0
        
        coins_trend = 0
        if coins_last_month > 0:
            coins_trend = int(((coins_this_month - coins_last_month) / coins_last_month) * 100)
        elif coins_this_month > 0:
            coins_trend = 100
        
        return Response({
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'avatar': user.avatar.url if user.avatar else None
            },
            'stats': {
                'coins': coins,
                'coins_trend': coins_trend,
                'completed_lessons': completed_lessons,
                'total_lessons': total_lessons,
                'pending_homework': pending_homework,
                'average_score': average_score
            },
            'course_progress': course_progress,
            'upcoming_lessons': upcoming_lessons_data,
            'recent_submissions': recent_submissions_data
        })
