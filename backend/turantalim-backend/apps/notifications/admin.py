from django.contrib import admin
from apps.notifications.models import Notification, NotificationPreference, NotificationLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'recipient__first_name', 'recipient__last_name', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    list_editable = ['is_read']
    raw_id_fields = ['recipient']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('recipient', 'notification_type', 'title', 'message')
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'created_at')
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    @admin.action(description='Mark selected notifications as read')
    def mark_as_read(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_read=True, read_at=timezone.now())
    
    @admin.action(description='Mark selected notifications as unread')
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False, read_at=None)


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'telegram_enabled', 'sms_enabled', 'email_enabled', 'updated_at']
    list_filter = ['telegram_enabled', 'sms_enabled', 'email_enabled']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'telegram_chat_id', 'phone_number']
    readonly_fields = ['updated_at']
    raw_id_fields = ['user']
    
    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        ('Channels', {
            'fields': ('telegram_enabled', 'sms_enabled', 'email_enabled')
        }),
        ('Contact Info', {
            'fields': ('telegram_chat_id', 'phone_number')
        }),
        ('Notification Types', {
            'fields': ('payment_notifications', 'homework_notifications', 'lesson_notifications', 'attendance_notifications', 'gamification_notifications')
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['notification', 'channel', 'status', 'response_code', 'created_at', 'sent_at']
    list_filter = ['channel', 'status', 'created_at']
    search_fields = ['notification__recipient__username', 'error_message']
    readonly_fields = ['created_at', 'sent_at']
    raw_id_fields = ['notification']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
