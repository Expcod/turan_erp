from rest_framework import serializers
from apps.groups.models import LessonSchedule
from core.serializers import BaseSerializer

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
