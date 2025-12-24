from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import User

class Notification(models.Model):
    """Notification system"""
    
    NOTIFICATION_TYPE_CHOICES = (
        ('payment_due', _('Payment Due')),
        ('payment_confirmed', _('Payment Confirmed')),
        ('homework_assigned', _('Homework Assigned')),
        ('homework_reviewed', _('Homework Reviewed')),
        ('lesson_scheduled', _('Lesson Scheduled')),
        ('lesson_rescheduled', _('Lesson Rescheduled')),
        ('lesson_cancelled', _('Lesson Cancelled')),
        ('attendance_marked', _('Attendance Marked')),
        ('coins_earned', _('Coins Earned')),
        ('system_message', _('System Message')),
    )
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPE_CHOICES
    )
    
    title = models.CharField(max_length=255)
    
    message = models.TextField()
    
    related_object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Related object ID (payment, homework, etc)")
    )
    
    related_object_type = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Related object type (payment, homework, etc)")
    )
    
    is_read = models.BooleanField(default=False)
    
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
    
    def __str__(self):
        return f"{self.recipient.username} - {self.title}"


class NotificationPreference(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preference'
    )
    
    telegram_enabled = models.BooleanField(
        default=True,
        help_text=_("Receive notifications via Telegram")
    )
    
    sms_enabled = models.BooleanField(
        default=True,
        help_text=_("Receive notifications via SMS")
    )
    
    email_enabled = models.BooleanField(
        default=True,
        help_text=_("Receive notifications via Email")
    )
    
    telegram_chat_id = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Telegram chat ID")
    )
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        help_text=_("Phone number for SMS")
    )
    
    # Notification type preferences
    payment_notifications = models.BooleanField(default=True)
    homework_notifications = models.BooleanField(default=True)
    lesson_notifications = models.BooleanField(default=True)
    attendance_notifications = models.BooleanField(default=True)
    gamification_notifications = models.BooleanField(default=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = _('Notification Preference')
        verbose_name_plural = _('Notification Preferences')
    
    def __str__(self):
        return f"{self.user.username} - Notification Preferences"


class NotificationLog(models.Model):
    """Log of sent notifications"""
    
    CHANNEL_CHOICES = (
        ('telegram', 'Telegram'),
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('in_app', _('In-App')),
    )
    
    STATUS_CHOICES = (
        ('sent', _('Sent')),
        ('failed', _('Failed')),
        ('pending', _('Pending')),
    )
    
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    response_code = models.CharField(max_length=20, blank=True)
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notification_logs'
        ordering = ['-created_at']
        verbose_name = _('Notification Log')
        verbose_name_plural = _('Notification Logs')
    
    def __str__(self):
        return f"{self.notification.recipient.username} - {self.channel} ({self.status})"
