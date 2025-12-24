from rest_framework import serializers
from apps.homework.models import Homework, HomeworkTranscript
from core.serializers import BaseSerializer, AudioFileField

class HomeworkTranscriptSerializer(serializers.ModelSerializer):
    """Homework transcript serializer"""
    
    class Meta:
        model = HomeworkTranscript
        fields = [
            'id', 'raw_text', 'cleaned_text', 'confidence_score',
            'language', 'processing_time_seconds', 'created_at'
        ]
        read_only_fields = fields

class HomeworkSerializer(BaseSerializer):
    """Homework serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transcript = HomeworkTranscriptSerializer(read_only=True)
    
    class Meta:
        model = Homework
        fields = [
            'id', 'lesson', 'lesson_title', 'student', 'student_name',
            'status', 'status_display', 'description', 'audio_submission',
            'submission_date', 'attempt_number', 'similarity_score',
            'is_similarity_passed', 'teacher_feedback', 'reviewed_by',
            'reviewed_date', 'deadline', 'is_late', 'coins_earned',
            'transcript', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'similarity_score', 'is_similarity_passed', 'submission_date',
            'transcript'
        ]

class HomeworkSubmitSerializer(serializers.ModelSerializer):
    """Homework submission serializer"""
    
    audio_submission = AudioFileField()
    
    class Meta:
        model = Homework
        fields = ['id', 'audio_submission', 'lesson']

class HomeworkReviewSerializer(serializers.Serializer):
    """Homework review serializer"""
    
    homework_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    feedback = serializers.CharField(max_length=1000, required=False)

class HomeworkListSerializer(serializers.ModelSerializer):
    """Homework list serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = Homework
        fields = [
            'id', 'lesson', 'lesson_title', 'student', 'student_name',
            'status', 'attempt_number', 'submission_date', 'is_late',
            'coins_earned'
        ]
