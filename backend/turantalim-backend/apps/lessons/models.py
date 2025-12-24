from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.courses.models import Group

class Lesson(models.Model):
    """Lesson model"""
    
    STATUS_CHOICES = (
        ('scheduled', _('Scheduled')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
        ('rescheduled', _('Rescheduled')),
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    
    title = models.CharField(max_length=255)
    
    description = models.TextField(blank=True)
    
    scheduled_date = models.DateField()
    
    start_time = models.TimeField()
    
    duration_minutes = models.PositiveIntegerField(default=90)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    
    lesson_number = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Sequence number in course")
    )
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lessons'
        ordering = ['scheduled_date', 'start_time']
        verbose_name = _('Lesson')
        verbose_name_plural = _('Lessons')
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_date}"
    
    @property
    def is_upcoming(self):
        from datetime import datetime
        lesson_datetime = datetime.combine(self.scheduled_date, self.start_time)
        return lesson_datetime > datetime.now()


class LessonReschedule(models.Model):
    """Lesson rescheduling history"""
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='reschedules'
    )
    
    original_date = models.DateField()
    original_time = models.TimeField()
    
    new_date = models.DateField()
    new_time = models.TimeField()
    
    reason = models.TextField()
    
    rescheduled_by = models.CharField(max_length=255)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lesson_reschedules'
        verbose_name = _('Lesson Reschedule')
        verbose_name_plural = _('Lesson Reschedules')
    
    def __str__(self):
        return f"Reschedule: {self.lesson.title}"
