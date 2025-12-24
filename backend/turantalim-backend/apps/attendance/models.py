from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.lessons.models import Lesson
from apps.accounts.models import User

class Attendance(models.Model):
    """Student attendance tracking"""
    
    STATUS_CHOICES = (
        ('present', _('Present')),
        ('absent', _('Absent')),
        ('late', _('Late')),
        ('excused', _('Excused')),
    )
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendances',
        limit_choices_to={'role': 'student'}
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='absent'
    )
    
    marked_at = models.DateTimeField(auto_now_add=True)
    
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='marked_attendances',
        limit_choices_to={'role': 'teacher'}
    )
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'attendances'
        unique_together = [('lesson', 'student')]
        verbose_name = _('Attendance')
        verbose_name_plural = _('Attendances')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.lesson.title} ({self.status})"
