from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.courses.models import Course, Group
from apps.groups.models import LessonSchedule
from apps.courses.serializers import (
    CourseSerializer, GroupSerializer, GroupDetailSerializer,
    LessonScheduleSerializer
)
from apps.accounts.permissions import IsAdmin, IsTeacher
from core.filters import GroupFilter

class CourseListView(generics.ListCreateAPIView):
    """List and create courses (Admin only)"""
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Course detail endpoint"""
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return Course.objects.all()

class GroupListView(generics.ListCreateAPIView):
    """List and create groups"""
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = GroupFilter
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Group.objects.all()
        elif user.is_teacher:
            return Group.objects.filter(teacher=user)
        else:  # student
            return Group.objects.filter(students=user)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Group detail endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return GroupDetailSerializer
        return GroupSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Group.objects.all()
        elif user.is_teacher:
            return Group.objects.filter(teacher=user)
        else:
            return Group.objects.filter(students=user)

class GroupStudentsView(generics.ListAPIView):
    """List students in a group"""
    serializer_class = GroupDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        group_id = self.kwargs['pk']
        return get_object_or_404(Group, id=group_id)
    
    def get(self, request, *args, **kwargs):
        group = self.get_object()
        serializer = GroupDetailSerializer(group, context={'request': request})
        return Response(serializer.data)

class AddStudentToGroupView(generics.GenericAPIView):
    """Add student to group (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        group = get_object_or_404(Group, id=pk)
        student_id = request.data.get('student_id')
        
        from apps.accounts.models import User
        student = get_object_or_404(User, id=student_id, role='student')
        
        if group.is_full:
            return Response(
                {'error': 'Group is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group.students.add(student)
        return Response({'detail': 'Student added to group'})

class RemoveStudentFromGroupView(generics.GenericAPIView):
    """Remove student from group (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        group = get_object_or_404(Group, id=pk)
        student_id = request.data.get('student_id')
        
        from apps.accounts.models import User
        student = get_object_or_404(User, id=student_id, role='student')
        
        group.students.remove(student)
        return Response({'detail': 'Student removed from group'})

class LessonScheduleListView(generics.ListCreateAPIView):
    """List and create lesson schedules"""
    serializer_class = LessonScheduleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return LessonSchedule.objects.all()

class LessonScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Lesson schedule detail endpoint"""
    serializer_class = LessonScheduleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return LessonSchedule.objects.all()
