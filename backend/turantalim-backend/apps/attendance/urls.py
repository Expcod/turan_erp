from django.urls import path
from apps.attendance import views

urlpatterns = [
    # Attendance
    path('', views.AttendanceListView.as_view(), name='attendance-list'),
    path('<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance-detail'),
    path('lesson/<int:lesson_id>/', views.LessonAttendanceView.as_view(), name='lesson-attendance'),
    path('student/<int:student_id>/', views.StudentAttendanceView.as_view(), name='student-attendance'),
    path('bulk-mark/', views.BulkMarkAttendanceView.as_view(), name='bulk-mark-attendance'),
]
