from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.attendance.models import Attendance
from apps.attendance.serializers import (
    AttendanceSerializer, AttendanceListSerializer, BulkAttendanceSerializer
)
from apps.lessons.models import Lesson
from apps.accounts.models import User
from apps.accounts.permissions import IsTeacher, IsAdmin
from core.filters import AttendanceFilter

class AttendanceListView(generics.ListCreateAPIView):
    """List and mark attendance (Teachers only)"""
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_set_class = AttendanceFilter
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Attendance.objects.all()
        else:
            return Attendance.objects.filter(lesson__group__teacher=user)

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Attendance detail endpoint"""
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Attendance.objects.all()
        else:
            return Attendance.objects.filter(lesson__group__teacher=user)

class LessonAttendanceView(generics.ListAPIView):
    """List attendance for a specific lesson"""
    serializer_class = AttendanceListSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check if user is teacher of this lesson
        if not (self.request.user.is_admin or self.request.user == lesson.group.teacher):
            return Attendance.objects.none()
        
        return Attendance.objects.filter(lesson=lesson).order_by('student__first_name')

class StudentAttendanceView(generics.ListAPIView):
    """List attendance for a specific student"""
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id, role='student')
        
        # Check if user can view this student's attendance
        user = self.request.user
        if user.is_admin:
            return Attendance.objects.filter(student=student)
        elif user.is_teacher:
            return Attendance.objects.filter(
                student=student,
                lesson__group__teacher=user
            )
        elif user.id == student_id:
            return Attendance.objects.filter(student=student)
        
        return Attendance.objects.none()

class BulkMarkAttendanceView(generics.GenericAPIView):
    """Mark attendance for multiple students in a lesson"""
    serializer_class = BulkAttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        attendance_data = request.data.get('attendance_data', [])
        
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check if user is teacher
        if not (request.user.is_admin or request.user == lesson.group.teacher):
            return Response(
                {'error': 'You do not have permission'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        marked_count = 0
        errors = []
        
        for att_data in attendance_data:
            student_id = att_data.get('student')
            att_status = att_data.get('status')
            
            try:
                student = User.objects.get(id=student_id, role='student')
                attendance, created = Attendance.objects.update_or_create(
                    lesson=lesson,
                    student=student,
                    defaults={
                        'status': att_status,
                        'marked_by': request.user,
                        'notes': att_data.get('notes', '')
                    }
                )
                marked_count += 1
            except User.DoesNotExist:
                errors.append(f'Student {student_id} not found')
        
        return Response({
            'marked_count': marked_count,
            'errors': errors
        })
