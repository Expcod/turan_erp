from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.settings.models import SystemSettings, AuditLog
from apps.settings.serializers import SystemSettingsSerializer, AuditLogSerializer
from apps.accounts.permissions import IsAdmin

class SystemSettingsView(generics.RetrieveUpdateAPIView):
    """Get/update system settings (Admin only)"""
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_object(self):
        return SystemSettings.load()

class AuditLogListView(generics.ListAPIView):
    """List audit logs (Admin only)"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return AuditLog.objects.all().order_by('-created_at')
