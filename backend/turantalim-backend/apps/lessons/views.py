from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.lessons.models import Lesson, LessonReschedule
from apps.lessons.serializers import (
    LessonSerializer, LessonDetailSerializer, LessonRescheduleSerializer
)
from apps.courses.models import Group
from apps.accounts.permissions import IsAdmin, IsTeacher, IsTeacherOfGroup
from core.filters import LessonFilter

class LessonListView(generics.ListCreateAPIView):
    """List and create lessons"""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    filter_set_class = LessonFilter
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Lesson.objects.all()
        elif user.is_teacher:
            return Lesson.objects.filter(group__teacher=user)
        else:  # student
            return Lesson.objects.filter(group__students=user)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Lesson detail endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LessonDetailSerializer
        return LessonSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Lesson.objects.all()
        elif user.is_teacher:
            return Lesson.objects.filter(group__teacher=user)
        else:
            return Lesson.objects.filter(group__students=user)
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class GroupLessonsView(generics.ListAPIView):
    """List lessons for a specific group"""
    serializer_class = LessonDetailSerializer
    permission_classes = [IsAuthenticated]
    filter_set_class = LessonFilter
    
    def get_queryset(self):
        group_id = self.kwargs['group_id']
        user = self.request.user
        
        group = get_object_or_404(Group, id=group_id)
        
        # Check if user has access to this group
        if user.is_admin or user.is_teacher and group.teacher == user or user in group.students.all():
            return Lesson.objects.filter(group=group)
        
        return Lesson.objects.none()

class RescheduleLessonView(generics.GenericAPIView):
    """Reschedule a lesson (Admin/Teacher only)"""
    serializer_class = LessonRescheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, id=pk)
        
        # Check permissions
        if not (request.user.is_admin or request.user.is_teacher and lesson.group.teacher == request.user):
            return Response(
                {'error': 'You do not have permission to reschedule this lesson'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_date = request.data.get('new_date')
        new_time = request.data.get('new_time')
        reason = request.data.get('reason', '')
        
        if not new_date or not new_time:
            return Response(
                {'error': 'new_date and new_time are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create reschedule record
        reschedule = LessonReschedule.objects.create(
            lesson=lesson,
            original_date=lesson.scheduled_date,
            original_time=lesson.start_time,
            new_date=new_date,
            new_time=new_time,
            reason=reason,
            rescheduled_by=request.user.get_full_name()
        )
        
        # Update lesson
        lesson.scheduled_date = new_date
        lesson.start_time = new_time
        lesson.status = 'rescheduled'
        lesson.save()
        
        serializer = self.get_serializer(reschedule)
        return Response(serializer.data)

class RescheduleHistoryView(generics.ListAPIView):
    """List rescheduling history"""
    serializer_class = LessonRescheduleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return LessonReschedule.objects.all().order_by('-created_at')
