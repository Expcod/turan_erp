from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.homework.models import Homework, HomeworkTranscript
from apps.homework.serializers import (
    HomeworkSerializer, HomeworkSubmitSerializer, HomeworkReviewSerializer,
    HomeworkListSerializer
)
from apps.lessons.models import Lesson
from apps.accounts.models import User
from apps.accounts.permissions import IsTeacher, IsStudent, IsAdmin
from core.filters import HomeworkFilter

class HomeworkListView(generics.ListCreateAPIView):
    """List homeworks"""
    permission_classes = [IsAuthenticated]
    filter_set_class = HomeworkFilter
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return HomeworkSubmitSerializer
        return HomeworkListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Homework.objects.all()
        elif user.is_teacher:
            return Homework.objects.filter(lesson__group__teacher=user)
        else:  # student
            return Homework.objects.filter(student=user)

class HomeworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Homework detail endpoint"""
    serializer_class = HomeworkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Homework.objects.all()
        elif user.is_teacher:
            return Homework.objects.filter(lesson__group__teacher=user)
        else:
            return Homework.objects.filter(student=user)

class SubmitHomeworkView(generics.GenericAPIView):
    """Submit homework audio (Students only)"""
    serializer_class = HomeworkSubmitSerializer
    permission_classes = [IsAuthenticated, IsStudent]
    
    def post(self, request, pk):
        homework = get_object_or_404(Homework, id=pk, student=request.user)
        
        if not homework.can_submit:
            return Response(
                {'error': 'Cannot submit homework in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if timezone.now() > homework.deadline and not homework.is_late:
            homework.is_late = True
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        homework.audio_submission = request.files['audio_submission']
        homework.submission_date = timezone.now()
        homework.status = 'submitted'
        homework.save()
        
        # TODO: Trigger AI processing task
        
        return Response(
            HomeworkSerializer(homework).data,
            status=status.HTTP_200_OK
        )

class ReviewHomeworkView(generics.GenericAPIView):
    """Review homework submission (Teachers only)"""
    serializer_class = HomeworkReviewSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def post(self, request, pk):
        homework = get_object_or_404(Homework, id=pk)
        
        # Check if teacher is assigned to this group
        if homework.lesson.group.teacher != request.user and not request.user.is_admin:
            return Response(
                {'error': 'You do not have permission'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        feedback = serializer.validated_data.get('feedback', '')
        
        homework.status = new_status
        homework.teacher_feedback = feedback
        homework.reviewed_by = request.user
        homework.reviewed_date = timezone.now()
        
        # Award coins if approved
        if new_status == 'approved':
            from apps.gamification.models import StudentCoin
            coin_balance, _ = StudentCoin.objects.get_or_create(student=homework.student)
            coin_balance.add_coins(homework.coins_earned, f'Homework approved: {homework.lesson.title}')
        
        homework.save()
        
        return Response(HomeworkSerializer(homework).data)

class LessonHomeworkView(generics.ListAPIView):
    """List homeworks for a lesson"""
    serializer_class = HomeworkListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        user = self.request.user
        if user.is_admin or (user.is_teacher and lesson.group.teacher == user):
            return Homework.objects.filter(lesson=lesson)
        elif user in lesson.group.students.all():
            return Homework.objects.filter(lesson=lesson, student=user)
        
        return Homework.objects.none()

class StudentHomeworkView(generics.ListAPIView):
    """List homeworks for a student"""
    serializer_class = HomeworkListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id, role='student')
        
        user = self.request.user
        if user.is_admin or user.id == student_id:
            return Homework.objects.filter(student=student)
        
        return Homework.objects.none()
