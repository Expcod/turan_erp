from django.urls import path
from apps.notifications import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('unread/', views.UnreadNotificationsView.as_view(), name='unread-notifications'),
    path('<int:pk>/mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('preferences/me/', views.NotificationPreferenceView.as_view(), name='notification-preferences'),
]
