from rest_framework import serializers
from apps.settings.models import SystemSettings, AuditLog
from core.serializers import BaseSerializer

class SystemSettingsSerializer(serializers.ModelSerializer):
    """System settings serializer"""
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'similarity_threshold', 'audio_processing_enabled',
            'lesson_completion_coins', 'homework_submission_coins',
            'homework_approved_coins', 'attendance_bonus_coins',
            'leaderboard_bonus_coins', 'homework_deadline_hours',
            'max_homework_attempts', 'overdue_payment_day',
            'max_audio_file_size_mb', 'supported_audio_formats',
            'default_lesson_duration_minutes', 'default_payment_method',
            'enable_payme', 'enable_cash_payment',
            'enable_telegram_notifications', 'enable_sms_notifications',
            'enable_email_notifications', 'platform_name',
            'support_email', 'support_phone', 'is_maintenance_mode',
            'maintenance_message', 'updated_at', 'updated_by'
        ]
        read_only_fields = ['updated_at']

class AuditLogSerializer(BaseSerializer):
    """Audit log serializer"""
    
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'admin', 'admin_name', 'action', 'action_display',
            'object_type', 'object_id', 'old_values', 'new_values',
            'notes', 'ip_address', 'created_at'
        ]
        read_only_fields = fields
