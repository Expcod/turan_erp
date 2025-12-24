from rest_framework import serializers
from apps.gamification.models import StudentCoin, CoinTransaction, Leaderboard, Achievement
from core.serializers import BaseSerializer

class CoinTransactionSerializer(BaseSerializer):
    """Coin transaction serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = CoinTransaction
        fields = [
            'id', 'student', 'student_name', 'transaction_type', 'type_display',
            'amount', 'reason', 'related_homework', 'related_lesson', 'created_at'
        ]
        read_only_fields = fields

class StudentCoinSerializer(BaseSerializer):
    """Student coin balance serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    recent_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentCoin
        fields = [
            'id', 'student', 'student_name', 'total_coins',
            'coins_earned', 'coins_spent', 'recent_transactions', 'updated_at'
        ]
        read_only_fields = fields
    
    def get_recent_transactions(self, obj):
        transactions = obj.student.coin_transactions.all()[:5]
        return CoinTransactionSerializer(transactions, many=True).data

class LeaderboardSerializer(BaseSerializer):
    """Leaderboard serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_avatar = serializers.CharField(source='student.avatar', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Leaderboard
        fields = [
            'id', 'student', 'student_name', 'student_avatar', 'group', 'group_name',
            'rank', 'coins', 'lessons_completed', 'homeworks_completed',
            'attendance_percentage', 'last_updated'
        ]
        read_only_fields = fields

class AchievementSerializer(BaseSerializer):
    """Achievement serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_achievement_type_display', read_only=True)
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'student', 'student_name', 'achievement_type', 'type_display',
            'title', 'description', 'icon', 'points', 'earned_at'
        ]
        read_only_fields = fields
