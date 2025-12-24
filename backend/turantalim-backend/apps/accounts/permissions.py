from rest_framework import permissions
from django.utils.translation import gettext_lazy as _

class IsAdmin(permissions.BasePermission):
    """Only admin can access"""
    message = _('Admin access required')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsTeacher(permissions.BasePermission):
    """Only teacher can access"""
    message = _('Teacher access required')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_teacher

class IsStudent(permissions.BasePermission):
    """Only student can access"""
    message = _('Student access required')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student

class IsAdminOrTeacher(permissions.BasePermission):
    """Admin or Teacher"""
    message = _('Admin or Teacher access required')
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['admin', 'teacher'])

class IsOwnUserOrAdmin(permissions.BasePermission):
    """User can only edit own profile or admin can edit any"""
    message = _('Can only edit own profile')
    
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_admin

class IsTeacherOfGroup(permissions.BasePermission):
    """Teacher can only access their own groups"""
    message = _('You can only access your own groups')
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_teacher or request.user.is_admin
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return obj.teacher == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """Only admin can modify, others can read"""
    message = _('Admin access required for modifications')
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsGroupStudent(permissions.BasePermission):
    """Only students in the group can access"""
    message = _('You are not a member of this group')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student
    
    def has_object_permission(self, request, view, obj):
        # obj should be the lesson or similar with group relation
        if hasattr(obj, 'group'):
            return request.user in obj.group.students.all()
        return False
