from rest_framework import serializers
from apps.payments.models import Payment, PaymentHistory, PaymentSchedule
from core.serializers import BaseSerializer

class PaymentHistorySerializer(serializers.ModelSerializer):
    """Payment history serializer"""
    
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'old_status', 'new_status', 'changed_by', 'changed_by_name',
            'notes', 'created_at'
        ]
        read_only_fields = fields

class PaymentSerializer(BaseSerializer):
    """Payment serializer"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    history = PaymentHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'group', 'group_name',
            'amount', 'currency', 'payment_method', 'status', 'status_display',
            'payme_order_id', 'payme_transaction_id', 'due_date', 'paid_date',
            'notes', 'is_verified', 'days_until_due', 'is_overdue',
            'history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['payme_order_id', 'payme_transaction_id', 'paid_date']

class PaymentConfirmSerializer(serializers.Serializer):
    """Payment confirmation serializer"""
    
    payment_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['confirmed', 'failed', 'cancelled'])
    notes = serializers.CharField(max_length=500, required=False)

class PaymentScheduleSerializer(BaseSerializer):
    """Payment schedule serializer"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = PaymentSchedule
        fields = [
            'id', 'group', 'group_name', 'amount', 'frequency',
            'day_of_month', 'is_active', 'created_at', 'updated_at'
        ]

class PaymeCallbackSerializer(serializers.Serializer):
    """Payme webhook callback serializer"""
    
    click_trans_id = serializers.CharField()
    click_payme_trans_id = serializers.CharField()
    merchant_trans_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    sign_time = serializers.CharField()
    sign_string = serializers.CharField()
