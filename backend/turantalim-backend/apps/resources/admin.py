from django.contrib import admin
from apps.resources.models import LessonResource


@admin.register(LessonResource)
class LessonResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'resource_type', 'file_size_display', 'is_required', 'order', 'created_at']
    list_filter = ['resource_type', 'is_required', 'created_at', 'lesson__group']
    search_fields = ['title', 'description', 'lesson__title']
    readonly_fields = ['created_at', 'updated_at', 'file_size']
    list_editable = ['is_required', 'order']
    raw_id_fields = ['lesson']
    ordering = ['lesson', 'order']
    
    fieldsets = (
        (None, {
            'fields': ('lesson', 'resource_type', 'title')
        }),
        ('File', {
            'fields': ('file', 'file_size', 'duration_seconds')
        }),
        ('Details', {
            'fields': ('description', 'is_required', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"
    file_size_display.short_description = 'File Size'
