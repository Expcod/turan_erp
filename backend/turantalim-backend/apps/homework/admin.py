from django.contrib import admin
from apps.homework.models import Homework, HomeworkTranscript


@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'status', 'attempt_number', 'similarity_score', 'is_similarity_passed', 'deadline', 'is_late', 'coins_earned']
    list_filter = ['status', 'is_similarity_passed', 'is_late', 'deadline', 'lesson__group']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'lesson__title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'submission_date', 'reviewed_date']
    list_editable = ['status']
    raw_id_fields = ['student', 'lesson', 'reviewed_by']
    date_hierarchy = 'deadline'
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('lesson', 'student', 'status', 'attempt_number')
        }),
        ('Content', {
            'fields': ('description', 'audio_submission')
        }),
        ('AI Analysis', {
            'fields': ('transcription', 'similarity_score', 'is_similarity_passed'),
            'classes': ('collapse',)
        }),
        ('Teacher Review', {
            'fields': ('teacher_feedback', 'reviewed_by', 'reviewed_date'),
            'classes': ('collapse',)
        }),
        ('Deadline & Rewards', {
            'fields': ('deadline', 'submission_date', 'is_late', 'coins_earned')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(HomeworkTranscript)
class HomeworkTranscriptAdmin(admin.ModelAdmin):
    list_display = ['homework', 'language', 'confidence_score', 'processing_time_seconds', 'created_at']
    list_filter = ['language', 'created_at']
    search_fields = ['homework__student__username', 'raw_text', 'cleaned_text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
