from django.urls import path
from apps.settings import views

urlpatterns = [
    path('system/', views.SystemSettingsView.as_view(), name='system-settings'),
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-logs'),
]
