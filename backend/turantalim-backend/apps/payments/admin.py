from django.contrib import admin
from apps.payments.models import Payment, PaymentHistory, PaymentSchedule


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'group', 'amount', 'currency', 'payment_method', 'status', 'due_date', 'paid_date', 'is_verified']
    list_filter = ['status', 'payment_method', 'is_verified', 'due_date', 'created_at']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'group__name', 'payme_order_id', 'payme_transaction_id']
    readonly_fields = ['created_at', 'updated_at', 'paid_date']
    list_editable = ['status', 'is_verified']
    raw_id_fields = ['student', 'group', 'confirmed_by']
    date_hierarchy = 'due_date'
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('student', 'group', 'status')
        }),
        ('Payment Details', {
            'fields': ('amount', 'currency', 'payment_method', 'due_date')
        }),
        ('Payme Integration', {
            'fields': ('payme_order_id', 'payme_transaction_id'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('is_verified', 'confirmed_by', 'paid_date', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_pending']
    
    @admin.action(description='Mark selected payments as confirmed')
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed', is_verified=True)
    
    @admin.action(description='Mark selected payments as pending')
    def mark_as_pending(self, request, queryset):
        queryset.update(status='pending', is_verified=False)


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ['payment', 'old_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['old_status', 'new_status', 'created_at']
    search_fields = ['payment__student__username', 'notes']
    readonly_fields = ['created_at']
    raw_id_fields = ['payment', 'changed_by']
    ordering = ['-created_at']


@admin.register(PaymentSchedule)
class PaymentScheduleAdmin(admin.ModelAdmin):
    list_display = ['group', 'amount', 'frequency', 'day_of_month', 'is_active']
    list_filter = ['frequency', 'is_active']
    search_fields = ['group__name']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_active']
    ordering = ['group__name']
