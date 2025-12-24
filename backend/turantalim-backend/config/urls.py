from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="TuranTalim API",
        default_version='v1',
        description="TuranTalim ERP Backend API",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1 endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/courses/', include('apps.courses.urls')),
    path('api/v1/lessons/', include('apps.lessons.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/resources/', include('apps.resources.urls')),
    path('api/v1/homework/', include('apps.homework.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/system/', include('apps.settings.urls')),
    
    # API Documentation
    path('api/v1/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/v1/docs/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
