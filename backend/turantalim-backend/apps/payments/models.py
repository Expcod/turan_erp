from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.courses.models import Group
from apps.accounts.models import User

class Payment(models.Model):
    """Student payment tracking"""
    
    PAYMENT_METHOD_CHOICES = (
        ('payme', 'Payme'),
        ('cash', _('Cash')),
        ('bank_transfer', _('Bank Transfer')),
    )
    
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
        ('overdue', _('Overdue')),
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        limit_choices_to={'role': 'student'}
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    currency = models.CharField(
        max_length=3,
        default='UZS',
        help_text=_("Payment currency")
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='payme'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Payme integration
    payme_order_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_("Payme order ID")
    )
    
    payme_transaction_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_("Payme transaction ID")
    )
    
    # Due date and payment tracking
    due_date = models.DateField(
        help_text=_("Payment due date")
    )
    
    paid_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When payment was confirmed")
    )
    
    # Admin notes
    notes = models.TextField(blank=True)
    
    confirmed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_payments',
        limit_choices_to={'role': 'admin'}
    )
    
    # Verification
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Payment verified by admin")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.amount} {self.currency}"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return (self.status == 'pending' and 
                timezone.now().date() > self.due_date)
    
    @property
    def days_until_due(self):
        from django.utils import timezone
        delta = self.due_date - timezone.now().date()
        return delta.days


class PaymentHistory(models.Model):
    """Payment status change history"""
    
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='history'
    )
    
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_histories'
        verbose_name = _('Payment History')
        verbose_name_plural = _('Payment Histories')
    
    def __str__(self):
        return f"{self.payment.student} - {self.old_status} → {self.new_status}"


class PaymentSchedule(models.Model):
    """Schedule for recurring payments"""
    
    FREQUENCY_CHOICES = (
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('annually', _('Annually')),
    )
    
    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='payment_schedule'
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='monthly'
    )
    
    day_of_month = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text=_("Payment day of month")
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_schedules'
        verbose_name = _('Payment Schedule')
        verbose_name_plural = _('Payment Schedules')
    
    def __str__(self):
        return f"{self.group.name} - {self.amount}"
