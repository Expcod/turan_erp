from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.lessons.models import Lesson
from apps.accounts.models import User

class Homework(models.Model):
    """Homework submission model"""
    
    STATUS_CHOICES = (
        ('assigned', _('Assigned')),
        ('submitted', _('Submitted')),
        ('under_review', _('Under Review')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('second_chance', _('Second Chance')),
    )
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='homeworks'
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='homeworks',
        limit_choices_to={'role': 'student'}
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='assigned'
    )
    
    description = models.TextField(
        help_text=_("Homework description (Turkish)")
    )
    
    audio_submission = models.FileField(
        upload_to='homework_submissions/%Y/%m/',
        null=True,
        blank=True,
        help_text=_("Student's audio submission")
    )
    
    submission_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When student submitted")
    )
    
    attempt_number = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Submission attempt number")
    )
    
    # AI Scoring
    similarity_score = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text=_("Similarity score (0-1)")
    )
    
    transcription = models.TextField(
        blank=True,
        help_text=_("Transcribed text from audio")
    )
    
    is_similarity_passed = models.BooleanField(
        null=True,
        blank=True,
        help_text=_("Whether passed similarity check")
    )
    
    # Teacher Review
    teacher_feedback = models.TextField(
        blank=True,
        help_text=_("Teacher's feedback")
    )
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_homeworks',
        limit_choices_to={'role': 'teacher'}
    )
    
    reviewed_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When teacher reviewed")
    )
    
    # Deadline
    deadline = models.DateTimeField(
        help_text=_("Homework deadline")
    )
    
    is_late = models.BooleanField(
        default=False,
        help_text=_("Whether submitted after deadline")
    )
    
    # Coins reward
    coins_earned = models.PositiveIntegerField(
        default=0,
        help_text=_("Coins earned for submission")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'homeworks'
        ordering = ['-created_at']
        verbose_name = _('Homework')
        verbose_name_plural = _('Homeworks')
        unique_together = [('lesson', 'student', 'attempt_number')]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.lesson.title} (Attempt {self.attempt_number})"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return timezone.now() > self.deadline
    
    @property
    def can_submit(self):
        return self.status in ['assigned', 'second_chance']


class HomeworkTranscript(models.Model):
    """Store transcription data from OpenAI Whisper"""
    
    homework = models.OneToOneField(
        Homework,
        on_delete=models.CASCADE,
        related_name='transcript'
    )
    
    raw_text = models.TextField(
        help_text=_("Raw transcription from Whisper")
    )
    
    cleaned_text = models.TextField(
        help_text=_("Cleaned and processed transcription")
    )
    
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text=_("Whisper confidence score")
    )
    
    language = models.CharField(
        max_length=10,
        default='tr',
        help_text=_("Detected language")
    )
    
    processing_time_seconds = models.FloatField(
        help_text=_("Time taken to process")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'homework_transcripts'
        verbose_name = _('Homework Transcript')
        verbose_name_plural = _('Homework Transcripts')
