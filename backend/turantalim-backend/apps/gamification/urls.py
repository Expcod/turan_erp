from django.urls import path
from apps.gamification import views

urlpatterns = [
    path('coins/me/', views.MyCoinsView.as_view(), name='my-coins'),
    path('coins/<int:student_id>/', views.StudentCoinsView.as_view(), name='student-coins'),
    path('coins/transactions/', views.CoinTransactionsView.as_view(), name='coin-transactions'),
    path('leaderboard/<int:group_id>/', views.GroupLeaderboardView.as_view(), name='group-leaderboard'),
    path('achievements/<int:student_id>/', views.StudentAchievementsView.as_view(), name='student-achievements'),
]
