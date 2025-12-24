from django.contrib import admin
from apps.gamification.models import StudentCoin, CoinTransaction, Leaderboard, Achievement


@admin.register(StudentCoin)
class StudentCoinAdmin(admin.ModelAdmin):
    list_display = ['student', 'total_coins', 'coins_earned', 'coins_spent', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['student__username', 'student__first_name', 'student__last_name']
    readonly_fields = ['updated_at']
    ordering = ['-total_coins']
    
    fieldsets = (
        (None, {
            'fields': ('student',)
        }),
        ('Coin Balance', {
            'fields': ('total_coins', 'coins_earned', 'coins_spent')
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(CoinTransaction)
class CoinTransactionAdmin(admin.ModelAdmin):
    list_display = ['student', 'transaction_type', 'amount', 'reason', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'reason']
    readonly_fields = ['created_at']
    raw_id_fields = ['student', 'related_homework', 'related_lesson']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['rank', 'student', 'group', 'coins', 'lessons_completed', 'homeworks_completed', 'attendance_percentage', 'last_updated']
    list_filter = ['group', 'last_updated']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'group__name']
    readonly_fields = ['last_updated']
    raw_id_fields = ['student', 'group']
    ordering = ['group', 'rank']
    
    fieldsets = (
        (None, {
            'fields': ('student', 'group', 'rank')
        }),
        ('Statistics', {
            'fields': ('coins', 'lessons_completed', 'homeworks_completed', 'attendance_percentage')
        }),
        ('Timestamps', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['student', 'achievement_type', 'title', 'points', 'earned_at']
    list_filter = ['achievement_type', 'earned_at']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'title', 'description']
    readonly_fields = ['earned_at']
    raw_id_fields = ['student']
    date_hierarchy = 'earned_at'
    ordering = ['-earned_at']
