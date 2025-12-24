from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.gamification.models import StudentCoin, CoinTransaction, Leaderboard, Achievement
from apps.gamification.serializers import (
    StudentCoinSerializer, CoinTransactionSerializer,
    LeaderboardSerializer, AchievementSerializer
)
from apps.accounts.models import User
from apps.accounts.permissions import IsAdmin
from apps.courses.models import Group

class MyCoinsView(generics.RetrieveAPIView):
    """Get current user's coin balance"""
    serializer_class = StudentCoinSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        coin_balance, _ = StudentCoin.objects.get_or_create(student=self.request.user)
        return coin_balance

class StudentCoinsView(generics.RetrieveAPIView):
    """Get specific student's coin balance"""
    serializer_class = StudentCoinSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id, role='student')
        coin_balance, _ = StudentCoin.objects.get_or_create(student=student)
        return coin_balance

class CoinTransactionsView(generics.ListAPIView):
    """List coin transactions for current user"""
    serializer_class = CoinTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CoinTransaction.objects.filter(student=self.request.user).order_by('-created_at')

class GroupLeaderboardView(generics.ListAPIView):
    """Get leaderboard for a group - dynamically calculated"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from django.db.models import Avg, Count, Q
        from apps.homework.models import Homework
        from apps.lessons.models import Lesson
        
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, id=group_id)
        
        # Get all students in the group
        students = group.students.all()
        
        leaderboard_data = []
        for student in students:
            # Get student's coins
            coin_balance, _ = StudentCoin.objects.get_or_create(student=student)
            
            # Get student's completed lessons count (lessons where student submitted homework)
            student_completed_lessons = Homework.objects.filter(
                student=student,
                lesson__group=group,
                status__in=['approved', 'submitted', 'reviewed']
            ).count()
            
            # Get average homework score
            approved_homeworks = Homework.objects.filter(
                student=student,
                lesson__group=group,
                status='approved',
                similarity_score__isnull=False
            )
            
            avg_score = 0
            if approved_homeworks.exists():
                avg_score = int(approved_homeworks.aggregate(avg=Avg('similarity_score'))['avg'] * 100)
            
            leaderboard_data.append({
                'student_id': student.id,
                'student_first_name': student.first_name,
                'student_last_name': student.last_name,
                'student_email': student.email,
                'student_avatar': student.avatar.url if student.avatar else None,
                'total_coins': coin_balance.total_coins,
                'completed_lessons': student_completed_lessons,
                'average_score': avg_score,
                'group_name': group.name
            })
        
        # Sort by coins (descending)
        leaderboard_data.sort(key=lambda x: x['total_coins'], reverse=True)
        
        return Response(leaderboard_data)

class StudentAchievementsView(generics.ListAPIView):
    """Get achievements for a student"""
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id, role='student')
        
        # Check permissions
        user = self.request.user
        if user.is_admin or user.id == student_id:
            return Achievement.objects.filter(student=student).order_by('-earned_at')
        
        return Achievement.objects.none()
