from django.urls import path
from apps.lessons import views

urlpatterns = [
    # Lessons
    path('', views.LessonListView.as_view(), name='lesson-list'),
    path('<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('<int:pk>/reschedule/', views.RescheduleLessonView.as_view(), name='reschedule-lesson'),
    path('group/<int:group_id>/', views.GroupLessonsView.as_view(), name='group-lessons'),
    
    # Reschedule history
    path('reschedules/', views.RescheduleHistoryView.as_view(), name='reschedule-list'),
]
