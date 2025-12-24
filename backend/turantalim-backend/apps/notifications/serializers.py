from rest_framework import serializers
from apps.notifications.models import Notification, NotificationPreference, NotificationLog
from core.serializers import BaseSerializer

class NotificationSerializer(BaseSerializer):
    """Notification serializer"""
    
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'recipient_name', 'notification_type', 'type_display',
            'title', 'message', 'related_object_id', 'related_object_type',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['read_at']

class NotificationPreferenceSerializer(BaseSerializer):
    """Notification preference serializer"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'user_name', 'telegram_enabled', 'sms_enabled',
            'email_enabled', 'telegram_chat_id', 'phone_number',
            'payment_notifications', 'homework_notifications',
            'lesson_notifications', 'attendance_notifications',
            'gamification_notifications', 'updated_at'
        ]

class NotificationLogSerializer(BaseSerializer):
    """Notification log serializer"""
    
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    notification_title = serializers.CharField(source='notification.title', read_only=True)
    
    class Meta:
        model = NotificationLog
        fields = [
            'id', 'notification', 'notification_title', 'channel', 'channel_display',
            'status', 'status_display', 'response_code', 'error_message',
            'created_at', 'sent_at'
        ]
        read_only_fields = fields
