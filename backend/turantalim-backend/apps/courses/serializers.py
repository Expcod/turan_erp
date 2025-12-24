from rest_framework import serializers
from apps.courses.models import Course, Group
from apps.groups.models import LessonSchedule
from core.serializers import BaseSerializer

class CourseSerializer(BaseSerializer):
    """Course serializer"""
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'level', 'duration_weeks',
            'lessons_per_week', 'is_active', 'created_at', 'updated_at'
        ]

class GroupSerializer(BaseSerializer):
    """Group serializer with nested data"""
    
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'course', 'course_name', 'teacher', 'teacher_name',
            'start_date', 'end_date', 'status', 'max_students', 'student_count',
            'is_full', 'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['student_count', 'is_full']

class GroupDetailSerializer(GroupSerializer):
    """Detailed group serializer with students"""
    
    students = serializers.SerializerMethodField()
    
    def get_students(self, obj):
        from apps.accounts.serializers import UserListSerializer
        return UserListSerializer(
            obj.students.all(),
            many=True
        ).data

class LessonScheduleSerializer(BaseSerializer):
    """Lesson schedule serializer"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = LessonSchedule
        fields = [
            'id', 'group', 'group_name', 'day_of_week', 'day_display',
            'start_time', 'duration_minutes', 'is_active', 'created_at', 'updated_at'
        ]
