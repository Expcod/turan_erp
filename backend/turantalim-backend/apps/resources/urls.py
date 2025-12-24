from django.urls import path
from apps.resources import views

urlpatterns = [
    # Resources
    path('', views.LessonResourceListView.as_view(), name='resource-list'),
    path('<int:pk>/', views.LessonResourceDetailView.as_view(), name='resource-detail'),
    path('lesson/<int:lesson_id>/', views.LessonResourcesView.as_view(), name='lesson-resources'),
    path('<int:pk>/download/', views.DownloadResourceView.as_view(), name='download-resource'),
]
