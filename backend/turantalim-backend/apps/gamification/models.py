from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from apps.accounts.models import User
from apps.courses.models import Group

class StudentCoin(models.Model):
    """Track student coins balance"""
    
    student = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='coin_balance',
        limit_choices_to={'role': 'student'}
    )
    
    total_coins = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    coins_earned = models.PositiveIntegerField(
        default=0,
        help_text=_("Total coins earned")
    )
    
    coins_spent = models.PositiveIntegerField(
        default=0,
        help_text=_("Total coins spent/redeemed")
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_coins'
        verbose_name = _('Student Coin')
        verbose_name_plural = _('Student Coins')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.total_coins} coins"
    
    def add_coins(self, amount, reason=''):
        """Add coins to student balance"""
        self.total_coins += amount
        self.coins_earned += amount
        self.save()
        
        CoinTransaction.objects.create(
            student=self.student,
            transaction_type='earned',
            amount=amount,
            reason=reason
        )
    
    def subtract_coins(self, amount, reason=''):
        """Subtract coins from student balance"""
        if amount <= self.total_coins:
            self.total_coins -= amount
            self.coins_spent += amount
            self.save()
            
            CoinTransaction.objects.create(
                student=self.student,
                transaction_type='spent',
                amount=amount,
                reason=reason
            )
            return True
        return False


class CoinTransaction(models.Model):
    """Coin transaction history"""
    
    TRANSACTION_TYPE_CHOICES = (
        ('earned', _('Earned')),
        ('spent', _('Spent')),
        ('bonus', _('Bonus')),
        ('penalty', _('Penalty')),
        ('refund', _('Refund')),
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='coin_transactions',
        limit_choices_to={'role': 'student'}
    )
    
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES
    )
    
    amount = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    
    reason = models.TextField(
        help_text=_("Reason for transaction")
    )
    
    related_homework = models.ForeignKey(
        'homework.Homework',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coin_transactions'
    )
    
    related_lesson = models.ForeignKey(
        'lessons.Lesson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coin_transactions'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'coin_transactions'
        ordering = ['-created_at']
        verbose_name = _('Coin Transaction')
        verbose_name_plural = _('Coin Transactions')
    
    def __str__(self):
        return f"{self.student.username} - {self.amount} coins ({self.transaction_type})"


class Leaderboard(models.Model):
    """Leaderboard rankings"""
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leaderboard_entries',
        limit_choices_to={'role': 'student'}
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='leaderboards'
    )
    
    rank = models.PositiveIntegerField(default=0)
    
    coins = models.PositiveIntegerField(default=0)
    
    lessons_completed = models.PositiveIntegerField(default=0)
    
    homeworks_completed = models.PositiveIntegerField(default=0)
    
    attendance_percentage = models.FloatField(default=0.0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leaderboards'
        ordering = ['-coins', '-lessons_completed']
        unique_together = [('student', 'group')]
        verbose_name = _('Leaderboard')
        verbose_name_plural = _('Leaderboards')
    
    def __str__(self):
        return f"#{self.rank} - {self.student.get_full_name()} ({self.coins} coins)"


class Achievement(models.Model):
    """Student achievements and badges"""
    
    ACHIEVEMENT_TYPE_CHOICES = (
        ('lesson_master', _('Lesson Master')),
        ('homework_hero', _('Homework Hero')),
        ('attendance_champion', _('Attendance Champion')),
        ('coin_collector', _('Coin Collector')),
        ('leaderboard_winner', _('Leaderboard Winner')),
        ('perfect_week', _('Perfect Week')),
        ('comeback_kid', _('Comeback Kid')),
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='achievements',
        limit_choices_to={'role': 'student'}
    )
    
    achievement_type = models.CharField(
        max_length=50,
        choices=ACHIEVEMENT_TYPE_CHOICES
    )
    
    title = models.CharField(max_length=255)
    
    description = models.TextField()
    
    icon = models.ImageField(
        upload_to='achievements/',
        null=True,
        blank=True
    )
    
    points = models.PositiveIntegerField(default=10)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievements'
        ordering = ['-earned_at']
        unique_together = [('student', 'achievement_type')]
        verbose_name = _('Achievement')
        verbose_name_plural = _('Achievements')
    
    def __str__(self):
        return f"{self.student.username} - {self.title}"
