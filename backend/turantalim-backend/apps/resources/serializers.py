from rest_framework import serializers
from apps.resources.models import LessonResource
from core.serializers import BaseSerializer, AudioFileField, DocumentFileField

class LessonResourceSerializer(BaseSerializer):
    """Lesson resource serializer"""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonResource
        fields = [
            'id', 'lesson', 'lesson_title', 'resource_type', 'type_display',
            'title', 'description', 'file', 'file_url', 'file_size',
            'duration_seconds', 'is_required', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['file_size']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class AudioResourceSerializer(LessonResourceSerializer):
    """Audio resource serializer"""
    
    class Meta(LessonResourceSerializer.Meta):
        fields = LessonResourceSerializer.Meta.fields

class DocumentResourceSerializer(LessonResourceSerializer):
    """Document resource serializer"""
    
    class Meta(LessonResourceSerializer.Meta):
        fields = LessonResourceSerializer.Meta.fields
