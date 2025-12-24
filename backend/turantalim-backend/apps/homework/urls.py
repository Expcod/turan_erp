from django.urls import path
from apps.homework import views

urlpatterns = [
    path('', views.HomeworkListView.as_view(), name='homework-list'),
    path('<int:pk>/', views.HomeworkDetailView.as_view(), name='homework-detail'),
    path('<int:pk>/submit/', views.SubmitHomeworkView.as_view(), name='submit-homework'),
    path('<int:pk>/review/', views.ReviewHomeworkView.as_view(), name='review-homework'),
    path('lesson/<int:lesson_id>/', views.LessonHomeworkView.as_view(), name='lesson-homework'),
    path('student/<int:student_id>/', views.StudentHomeworkView.as_view(), name='student-homework'),
]
