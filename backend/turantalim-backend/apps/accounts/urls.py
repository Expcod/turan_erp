from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts import views

urlpatterns = [
    # Authentication
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('register/student/', views.StudentRegisterView.as_view(), name='student-register'),
    path('register/teacher/', views.TeacherRegisterView.as_view(), name='teacher-register'),
    
    # User Management
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Password Reset
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    
    # Teachers (Admin only)
    path('teachers/', views.TeacherListView.as_view(), name='teacher-list'),
    path('teachers/<int:pk>/', views.TeacherDetailView.as_view(), name='teacher-detail'),
    
    # Students (Admin only)
    path('students/', views.StudentListView.as_view(), name='student-list'),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    
    # Student Dashboard
    path('student/dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
]
