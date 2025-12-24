from rest_framework import serializers
from apps.lessons.models import Lesson, LessonReschedule
from core.serializers import BaseSerializer

class LessonSerializer(BaseSerializer):
    """Lesson serializer"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'group', 'group_name', 'title', 'description', 'scheduled_date',
            'start_time', 'duration_minutes', 'status', 'status_display', 'lesson_number',
            'notes', 'is_upcoming', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_upcoming']

class LessonDetailSerializer(LessonSerializer):
    """Detailed lesson serializer with resources and attendance"""
    
    resources = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()
    
    def get_resources(self, obj):
        from apps.resources.serializers import LessonResourceSerializer
        return LessonResourceSerializer(
            obj.resources.all(),
            many=True
        ).data
    
    def get_attendance_count(self, obj):
        return obj.attendances.filter(status='present').count()

class LessonRescheduleSerializer(BaseSerializer):
    """Lesson reschedule serializer"""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = LessonReschedule
        fields = [
            'id', 'lesson', 'lesson_title', 'original_date', 'original_time',
            'new_date', 'new_time', 'reason', 'rescheduled_by', 'created_at'
        ]
