from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.lessons.models import Lesson
from core.serializers import AudioFileField, DocumentFileField

class LessonResource(models.Model):
    """Lesson resources (Word documents and audio files)"""
    
    RESOURCE_TYPE_CHOICES = (
        ('document', _('Word Document')),
        ('audio', _('Audio File')),
        ('supplementary', _('Supplementary Material')),
    )
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='resources'
    )
    
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        help_text=_("Type of resource")
    )
    
    title = models.CharField(
        max_length=255,
        help_text=_("Resource title (Turkish)")
    )
    
    description = models.TextField(
        blank=True,
        help_text=_("Resource description (Turkish)")
    )
    
    file = models.FileField(
        upload_to='lesson_resources/%Y/%m/'
    )
    
    file_size = models.BigIntegerField(
        help_text=_("File size in bytes")
    )
    
    duration_seconds = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Audio duration in seconds")
    )
    
    is_required = models.BooleanField(
        default=True,
        help_text=_("Whether resource is required for lesson")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        help_text=_("Display order")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lesson_resources'
        ordering = ['order', 'created_at']
        verbose_name = _('Lesson Resource')
        verbose_name_plural = _('Lesson Resources')
    
    def __str__(self):
        return f"{self.title} - {self.lesson.title}"
    
    @property
    def is_audio(self):
        return self.resource_type == 'audio'
    
    @property
    def is_document(self):
        return self.resource_type == 'document'
