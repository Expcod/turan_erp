from django.contrib import admin
from apps.attendance.models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'status', 'marked_by', 'marked_at']
    list_filter = ['status', 'marked_at', 'lesson__group', 'lesson__scheduled_date']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'lesson__title']
    readonly_fields = ['marked_at']
    list_editable = ['status']
    raw_id_fields = ['student', 'lesson', 'marked_by']
    ordering = ['-marked_at']
    
    fieldsets = (
        (None, {
            'fields': ('lesson', 'student', 'status')
        }),
        ('Details', {
            'fields': ('marked_by', 'notes', 'marked_at'),
        }),
    )
