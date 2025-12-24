from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.shortcuts import get_object_or_404

from apps.resources.models import LessonResource
from apps.resources.serializers import LessonResourceSerializer
from apps.lessons.models import Lesson
from apps.accounts.permissions import IsAdmin, IsTeacher

class LessonResourceListView(generics.ListCreateAPIView):
    """List and upload lesson resources (Admin/Teacher only)"""
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return LessonResource.objects.all()
        elif user.is_teacher:
            return LessonResource.objects.filter(lesson__group__teacher=user)
        else:  # student
            return LessonResource.objects.filter(lesson__group__students=user)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class LessonResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Resource detail endpoint"""
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LessonResource.objects.all()
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class LessonResourcesView(generics.ListCreateAPIView):
    """List resources for a specific lesson"""
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        user = self.request.user
        if user.is_admin or (user.is_teacher and lesson.group.teacher == user) or user in lesson.group.students.all():
            return LessonResource.objects.filter(lesson=lesson).order_by('order')
        
        return LessonResource.objects.none()

class DownloadResourceView(generics.GenericAPIView):
    """Download lesson resource"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        resource = get_object_or_404(LessonResource, id=pk)
        lesson = resource.lesson
        
        # Check if user has access
        user = request.user
        if not (user.is_admin or (user.is_teacher and lesson.group.teacher == user) or user in lesson.group.students.all()):
            return Response(
                {'error': 'You do not have permission'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if resource.file:
            return FileResponse(
                resource.file.open('rb'),
                as_attachment=True,
                filename=resource.file.name
            )
        
        return Response(
            {'error': 'File not found'},
            status=status.HTTP_404_NOT_FOUND
        )
