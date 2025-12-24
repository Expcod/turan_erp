import django_filters
from django.db.models import Q

class BaseFilter(django_filters.FilterSet):
    """Base filter with common functionality"""
    
    created_at = django_filters.DateTimeFromToRangeFilter()
    updated_at = django_filters.DateTimeFromToRangeFilter()

class UserFilter(BaseFilter):
    """Filter for User model"""
    
    search = django_filters.CharFilter(
        method='filter_search',
        label='Search by name or email'
    )
    role = django_filters.CharFilter(field_name='role')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value) |
            Q(email__icontains=value)
        )

class GroupFilter(BaseFilter):
    """Filter for Group model"""
    
    search = django_filters.CharFilter(
        method='filter_search',
        label='Search by name'
    )
    teacher = django_filters.CharFilter(field_name='teacher__id')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(name__icontains=value)

class LessonFilter(BaseFilter):
    """Filter for Lesson model"""
    
    search = django_filters.CharFilter(
        method='filter_search',
        label='Search by title'
    )
    group = django_filters.CharFilter(field_name='group__id')
    status = django_filters.CharFilter(field_name='status')
    scheduled_date = django_filters.DateFromToRangeFilter()
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

class HomeworkFilter(BaseFilter):
    """Filter for Homework model"""
    
    lesson = django_filters.CharFilter(field_name='lesson__id')
    student = django_filters.CharFilter(field_name='student__id')
    status = django_filters.CharFilter(field_name='status')
    attempt_number = django_filters.NumberFilter(field_name='attempt_number')
    
class PaymentFilter(BaseFilter):
    """Filter for Payment model"""
    
    student = django_filters.CharFilter(field_name='student__id')
    status = django_filters.CharFilter(field_name='status')
    payment_method = django_filters.CharFilter(field_name='payment_method')
    amount = django_filters.RangeFilter(field_name='amount')
    due_date = django_filters.DateFromToRangeFilter()

class AttendanceFilter(BaseFilter):
    """Filter for Attendance model"""
    
    student = django_filters.CharFilter(field_name='student__id')
    lesson = django_filters.CharFilter(field_name='lesson__id')
    status = django_filters.CharFilter(field_name='status')
    lesson__group = django_filters.CharFilter(field_name='lesson__group__id')
