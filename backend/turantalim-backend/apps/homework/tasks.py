from celery import shared_task
from django.conf import settings
import os
import librosa
import openai
from datetime import timedelta
from django.utils import timezone

@shared_task
def process_homework_audio(homework_id):
    """Process homework audio submission with Whisper AI"""
    from apps.homework.models import Homework, HomeworkTranscript
    
    try:
        homework = Homework.objects.get(id=homework_id)
        
        if not homework.audio_submission:
            return {'status': 'error', 'message': 'No audio file found'}
        
        # Load audio file
        audio_path = homework.audio_submission.path
        
        # Use OpenAI Whisper for transcription
        openai.api_key = settings.OPENAI_API_KEY
        
        with open(audio_path, 'rb') as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        
        transcribed_text = transcript['text']
        confidence = transcript.get('confidence', 0.0)
        
        # Get audio duration
        y, sr = librosa.load(audio_path)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Store transcript
        HomeworkTranscript.objects.update_or_create(
            homework=homework,
            defaults={
                'raw_text': transcribed_text,
                'cleaned_text': transcribed_text.strip(),
                'confidence_score': confidence,
                'language': 'tr',
                'processing_time_seconds': duration
            }
        )
        
        # Check similarity against expected answer
        similarity_score = compute_similarity(transcribed_text, homework.description)
        homework.similarity_score = similarity_score
        homework.transcription = transcribed_text
        homework.is_similarity_passed = similarity_score >= settings.SIMILARITY_THRESHOLD
        
        if homework.is_similarity_passed:
            homework.status = 'approved'
            homework.coins_earned = settings.HOMEWORK_APPROVED_COINS
        else:
            homework.status = 'rejected'
            homework.coins_earned = 0
        
        homework.save()
        
        return {'status': 'success', 'similarity': similarity_score}
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def compute_similarity(answer, expected):
    """Compute similarity between answer and expected response"""
    from difflib import SequenceMatcher
    
    # Simple similarity using SequenceMatcher
    # In production, use more sophisticated NLP methods
    similarity = SequenceMatcher(None, answer.lower(), expected.lower()).ratio()
    return similarity

@shared_task
def generate_group_lessons(group_id):
    """Generate lessons for a group based on schedule"""
    from apps.courses.models import Group
    from apps.groups.models import LessonGenerator
    
    try:
        group = Group.objects.get(id=group_id)
        lessons = LessonGenerator.generate_lessons_for_group(group)
        return {'status': 'success', 'lessons_created': len(lessons)}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@shared_task
def mark_payments_overdue():
    """Mark payments as overdue if past due date"""
    from apps.payments.models import Payment, PaymentHistory
    from apps.settings.models import SystemSettings
    
    settings_obj = SystemSettings.load()
    cutoff_date = timezone.now().date() - timedelta(days=settings_obj.overdue_payment_day)
    
    overdue_payments = Payment.objects.filter(
        status='pending',
        due_date__lt=cutoff_date
    )
    
    count = 0
    for payment in overdue_payments:
        old_status = payment.status
        payment.status = 'overdue'
        payment.save()
        
        PaymentHistory.objects.create(
            payment=payment,
            old_status=old_status,
            new_status='overdue',
            notes='Automatically marked as overdue'
        )
        count += 1
    
    return {'status': 'success', 'payments_marked_overdue': count}

@shared_task
def update_leaderboards(group_id=None):
    """Update leaderboard rankings for groups"""
    from apps.gamification.models import Leaderboard, StudentCoin
    from apps.attendance.models import Attendance
    from apps.homework.models import Homework
    from apps.courses.models import Group
    
    try:
        if group_id:
            groups = Group.objects.filter(id=group_id)
        else:
            groups = Group.objects.all()
        
        updated_count = 0
        
        for group in groups:
            students = group.students.all()
            
            leaderboard_entries = []
            
            for student in students:
                coin_balance = StudentCoin.objects.filter(student=student).first()
                coins = coin_balance.total_coins if coin_balance else 0
                
                lessons_completed = group.lessons.filter(
                    status='completed'
                ).count()
                
                homeworks_completed = Homework.objects.filter(
                    student=student,
                    lesson__group=group,
                    status__in=['approved', 'second_chance']
                ).count()
                
                attendance_records = Attendance.objects.filter(
                    student=student,
                    lesson__group=group
                )
                if attendance_records.exists():
                    present_count = attendance_records.filter(status='present').count()
                    attendance_percentage = (present_count / attendance_records.count()) * 100
                else:
                    attendance_percentage = 0.0
                
                entry, _ = Leaderboard.objects.update_or_create(
                    student=student,
                    group=group,
                    defaults={
                        'coins': coins,
                        'lessons_completed': lessons_completed,
                        'homeworks_completed': homeworks_completed,
                        'attendance_percentage': attendance_percentage
                    }
                )
                leaderboard_entries.append(entry)
            
            # Assign ranks
            sorted_entries = sorted(
                leaderboard_entries,
                key=lambda x: (-x.coins, -x.lessons_completed, -x.homeworks_completed)
            )
            
            for rank, entry in enumerate(sorted_entries, 1):
                entry.rank = rank
                entry.save()
                updated_count += 1
        
        return {'status': 'success', 'leaderboards_updated': updated_count}
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@shared_task
def check_homework_deadlines():
    """Check homework deadlines and send reminders"""
    from apps.homework.models import Homework
    
    try:
        now = timezone.now()
        upcoming_deadline = now + timedelta(hours=1)
        
        homework_list = Homework.objects.filter(
            status__in=['assigned', 'second_chance'],
            deadline__lte=upcoming_deadline,
            deadline__gt=now
        )
        
        count = 0
        for homework in homework_list:
            # TODO: Send notification
            count += 1
        
        return {'status': 'success', 'reminders_sent': count}
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
