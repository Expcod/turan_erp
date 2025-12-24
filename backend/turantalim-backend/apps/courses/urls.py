from django.urls import path
from apps.courses import views

urlpatterns = [
    # Courses
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Groups
    path('groups/', views.GroupListView.as_view(), name='group-list'),
    path('groups/<int:pk>/', views.GroupDetailView.as_view(), name='group-detail'),
    path('groups/<int:pk>/students/', views.GroupStudentsView.as_view(), name='group-students'),
    path('groups/<int:pk>/add-student/', views.AddStudentToGroupView.as_view(), name='add-student'),
    path('groups/<int:pk>/remove-student/', views.RemoveStudentFromGroupView.as_view(), name='remove-student'),
    
    # Lesson Schedules
    path('schedules/', views.LessonScheduleListView.as_view(), name='schedule-list'),
    path('schedules/<int:pk>/', views.LessonScheduleDetailView.as_view(), name='schedule-detail'),
]
