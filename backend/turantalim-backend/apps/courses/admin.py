from django.contrib import admin
from apps.courses.models import Course, Group


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'level', 'duration_weeks', 'lessons_per_week', 'is_active', 'created_at']
    list_filter = ['level', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_active']
    ordering = ['name']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'teacher', 'student_count', 'status', 'start_date', 'end_date', 'is_active']
    list_filter = ['status', 'is_active', 'course', 'teacher', 'start_date']
    search_fields = ['name', 'course__name', 'teacher__username', 'teacher__first_name', 'teacher__last_name']
    readonly_fields = ['created_at', 'updated_at', 'student_count']
    filter_horizontal = ['students']
    list_editable = ['status', 'is_active']
    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'course', 'teacher', 'status')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'max_students')
        }),
        ('Students', {
            'fields': ('students',),
            'classes': ('collapse',)
        }),
        ('Additional Info', {
            'fields': ('description', 'is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_count(self, obj):
        return obj.students.count()
    student_count.short_description = 'Students'
