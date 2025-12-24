from django.contrib import admin
from apps.lessons.models import Lesson, LessonReschedule


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'group', 'scheduled_date', 'start_time', 'duration_minutes', 'status', 'lesson_number']
    list_filter = ['status', 'scheduled_date', 'group', 'group__course']
    search_fields = ['title', 'description', 'group__name']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
    date_hierarchy = 'scheduled_date'
    ordering = ['-scheduled_date', 'start_time']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'group', 'lesson_number', 'status')
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'start_time', 'duration_minutes')
        }),
        ('Details', {
            'fields': ('description', 'notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LessonReschedule)
class LessonRescheduleAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'original_date', 'original_time', 'new_date', 'new_time', 'rescheduled_by', 'created_at']
    list_filter = ['created_at', 'original_date', 'new_date']
    search_fields = ['lesson__title', 'reason', 'rescheduled_by']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
