from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.courses.models import Group

class LessonSchedule(models.Model):
    """Lesson schedule template for group"""
    
    DAY_CHOICES = (
        (0, _('Monday')),
        (1, _('Tuesday')),
        (2, _('Wednesday')),
        (3, _('Thursday')),
        (4, _('Friday')),
        (5, _('Saturday')),
        (6, _('Sunday')),
    )
    
    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='lesson_schedule'
    )
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    
    start_time = models.TimeField(help_text=_("Lesson start time"))
    
    duration_minutes = models.PositiveIntegerField(
        default=90,
        help_text=_("Lesson duration in minutes")
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lesson_schedules'
        verbose_name = _('Lesson Schedule')
        verbose_name_plural = _('Lesson Schedules')
    
    def __str__(self):
        return f"{self.group.name} - {self.get_day_of_week_display()}"


class LessonGenerator:
    """Generate lessons from schedule"""
    
    @staticmethod
    def generate_lessons_for_group(group):
        """Generate lessons for a group based on schedule"""
        from apps.lessons.models import Lesson
        from datetime import datetime, timedelta
        
        schedule = group.lesson_schedule
        current_date = group.start_date
        
        lessons = []
        while current_date <= group.end_date:
            if current_date.weekday() == schedule.day_of_week:
                lesson = Lesson.objects.create(
                    group=group,
                    title=f"{group.course.name} - Lesson {Lesson.objects.filter(group=group).count() + 1}",
                    scheduled_date=current_date,
                    start_time=schedule.start_time,
                    duration_minutes=schedule.duration_minutes,
                    status='scheduled'
                )
                lessons.append(lesson)
            current_date += timedelta(days=1)
        
        return lessons
