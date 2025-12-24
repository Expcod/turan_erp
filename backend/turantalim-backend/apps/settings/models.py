from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from core.validators import SimilarityThresholdValidator, CoinAmountValidator

class SystemSettings(models.Model):
    """Global system settings"""
    
    # AI Settings
    similarity_threshold = models.FloatField(
        default=0.50,
        validators=[SimilarityThresholdValidator()],
        help_text=_("Similarity score threshold for homework (0-1)")
    )
    
    audio_processing_enabled = models.BooleanField(
        default=True,
        help_text=_("Enable audio transcription and scoring")
    )
    
    # Coin Settings
    lesson_completion_coins = models.PositiveIntegerField(
        default=10,
        validators=[CoinAmountValidator()],
        help_text=_("Coins awarded for lesson completion")
    )
    
    homework_submission_coins = models.PositiveIntegerField(
        default=5,
        validators=[CoinAmountValidator()],
        help_text=_("Coins awarded for homework submission")
    )
    
    homework_approved_coins = models.PositiveIntegerField(
        default=10,
        validators=[CoinAmountValidator()],
        help_text=_("Coins awarded when homework is approved")
    )
    
    attendance_bonus_coins = models.PositiveIntegerField(
        default=2,
        validators=[CoinAmountValidator()],
        help_text=_("Coins awarded for perfect attendance")
    )
    
    leaderboard_bonus_coins = models.PositiveIntegerField(
        default=50,
        validators=[CoinAmountValidator()],
        help_text=_("Coins awarded for leaderboard first place")
    )
    
    # Deadline Settings
    homework_deadline_hours = models.PositiveIntegerField(
        default=24,
        help_text=_("Hours until homework deadline")
    )
    
    max_homework_attempts = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text=_("Maximum homework submission attempts")
    )
    
    overdue_payment_day = models.PositiveIntegerField(
        default=5,
        help_text=_("Days after due date to mark payment overdue")
    )
    
    # Audio Settings
    max_audio_file_size_mb = models.PositiveIntegerField(
        default=50,
        help_text=_("Maximum audio file size in MB")
    )
    
    supported_audio_formats = models.CharField(
        max_length=255,
        default='mp3,wav,ogg,m4a',
        help_text=_("Comma-separated list of supported audio formats")
    )
    
    # Lesson Settings
    default_lesson_duration_minutes = models.PositiveIntegerField(
        default=90,
        help_text=_("Default lesson duration in minutes")
    )
    
    # Payment Settings
    default_payment_method = models.CharField(
        max_length=20,
        choices=[('payme', 'Payme'), ('cash', _('Cash'))],
        default='payme'
    )
    
    enable_payme = models.BooleanField(
        default=True,
        help_text=_("Enable Payme payment integration")
    )
    
    enable_cash_payment = models.BooleanField(
        default=True,
        help_text=_("Enable cash payments")
    )
    
    # Notification Settings
    enable_telegram_notifications = models.BooleanField(
        default=True,
        help_text=_("Enable Telegram notifications")
    )
    
    enable_sms_notifications = models.BooleanField(
        default=True,
        help_text=_("Enable SMS notifications")
    )
    
    enable_email_notifications = models.BooleanField(
        default=True,
        help_text=_("Enable email notifications")
    )
    
    # System Info
    platform_name = models.CharField(
        max_length=255,
        default='TuranTalim ERP',
        help_text=_("Platform name")
    )
    
    support_email = models.EmailField(
        blank=True,
        help_text=_("Support email address")
    )
    
    support_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text=_("Support phone number")
    )
    
    # Maintenance
    is_maintenance_mode = models.BooleanField(
        default=False,
        help_text=_("Enable maintenance mode")
    )
    
    maintenance_message = models.TextField(
        blank=True,
        help_text=_("Maintenance message displayed to users")
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Who made the last update")
    )
    
    class Meta:
        db_table = 'system_settings'
        verbose_name = _('System Settings')
        verbose_name_plural = _('System Settings')
    
    def __str__(self):
        return 'System Settings'
    
    def save(self, *args, **kwargs):
        # Only allow one settings instance
        if not self.pk:
            if SystemSettings.objects.exists():
                self.pk = SystemSettings.objects.first().pk
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        """Load system settings (singleton pattern)"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class AuditLog(models.Model):
    """Admin action audit log"""
    
    ACTION_CHOICES = (
        ('create', _('Create')),
        ('update', _('Update')),
        ('delete', _('Delete')),
        ('approve', _('Approve')),
        ('reject', _('Reject')),
        ('payment_confirm', _('Confirm Payment')),
    )
    
    admin = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    object_type = models.CharField(max_length=100)
    
    object_id = models.PositiveIntegerField()
    
    old_values = models.JSONField(null=True, blank=True)
    
    new_values = models.JSONField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
    
    def __str__(self):
        return f"{self.admin} - {self.action} - {self.object_type}"
