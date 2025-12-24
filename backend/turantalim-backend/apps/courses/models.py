from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import User

class Course(models.Model):
    """Course/Subject model"""
    
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text=_("Course name (Turkish)")
    )
    
    description = models.TextField(
        blank=True,
        help_text=_("Course description (Turkish)")
    )
    
    level = models.CharField(
        max_length=50,
        choices=[
            ('beginner', _('Beginner')),
            ('intermediate', _('Intermediate')),
            ('advanced', _('Advanced')),
            ('professional', _('Professional')),
        ],
        default='beginner'
    )
    
    duration_weeks = models.PositiveIntegerField(
        default=12,
        help_text=_("Course duration in weeks")
    )
    
    lessons_per_week = models.PositiveIntegerField(
        default=2,
        help_text=_("Number of lessons per week")
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['name']
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
    
    def __str__(self):
        return self.name


class Group(models.Model):
    """Student group model"""
    
    STATUS_CHOICES = (
        ('active', _('Active')),
        ('paused', _('Paused')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    )
    
    name = models.CharField(
        max_length=255,
        help_text=_("Group name")
    )
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='groups',
        help_text=_("Course assigned to group")
    )
    
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='teaching_groups',
        limit_choices_to={'role': 'teacher'},
        help_text=_("Group teacher")
    )
    
    students = models.ManyToManyField(
        User,
        related_name='student_groups',
        limit_choices_to={'role': 'student'},
        blank=True,
        help_text=_("Students in group")
    )
    
    start_date = models.DateField(
        help_text=_("Group start date")
    )
    
    end_date = models.DateField(
        help_text=_("Group end date")
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    max_students = models.PositiveIntegerField(
        default=30,
        help_text=_("Maximum number of students")
    )
    
    description = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'groups'
        ordering = ['-created_at']
        verbose_name = _('Group')
        verbose_name_plural = _('Groups')
        unique_together = [('course', 'name', 'start_date')]
    
    def __str__(self):
        return f"{self.name} - {self.course.name}"
    
    @property
    def student_count(self):
        return self.students.count()
    
    @property
    def is_full(self):
        return self.student_count >= self.max_students
