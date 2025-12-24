from django.utils.translation import gettext_lazy as _
from rest_framework import serializers as drf_serializers

class BaseSerializer(drf_serializers.ModelSerializer):
    """Base serializer with common functionality"""
    created_at = drf_serializers.DateTimeField(read_only=True)
    updated_at = drf_serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True

class MultiLanguageCharField(drf_serializers.CharField):
    """Field for handling multi-language content"""
    pass

class AudioFileField(drf_serializers.FileField):
    """Field for validating audio files"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.allowed_formats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
    
    def to_internal_value(self, data):
        file = super().to_internal_value(data)
        if file.content_type not in self.allowed_formats:
            raise drf_serializers.ValidationError(
                _("Audio format not supported. Use MP3, WAV, OGG, or M4A")
            )
        if file.size > 50 * 1024 * 1024:  # 50MB limit
            raise drf_serializers.ValidationError(
                _("Audio file too large. Maximum size is 50MB")
            )
        return file

class DocumentFileField(drf_serializers.FileField):
    """Field for validating document files (Word documents)"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.allowed_formats = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    def to_internal_value(self, data):
        file = super().to_internal_value(data)
        if file.content_type not in self.allowed_formats:
            raise drf_serializers.ValidationError(
                _("Only Word documents (.docx) are supported")
            )
        if file.size > 20 * 1024 * 1024:  # 20MB limit
            raise drf_serializers.ValidationError(
                _("Document file too large. Maximum size is 20MB")
            )
        return file
