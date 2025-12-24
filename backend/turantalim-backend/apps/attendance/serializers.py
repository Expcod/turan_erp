from rest_framework import serializers
from apps.attendance.models import Attendance
from core.serializers import BaseSerializer

class AttendanceSerializer(BaseSerializer):
    """Attendance serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'lesson', 'lesson_title', 'student', 'student_name',
            'status', 'status_display', 'marked_at', 'marked_by', 'marked_by_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['marked_at']

class AttendanceListSerializer(serializers.ModelSerializer):
    """Simplified attendance list serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.id', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_id', 'student_name', 'status']

class BulkAttendanceSerializer(serializers.Serializer):
    """Bulk attendance marking serializer"""
    
    lesson_id = serializers.IntegerField()
    attendance_data = AttendanceListSerializer(many=True)
