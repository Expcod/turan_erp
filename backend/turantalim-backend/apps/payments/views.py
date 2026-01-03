from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.payments.models import Payment, PaymentHistory, PaymentSchedule
from apps.payments.serializers import (
    PaymentSerializer, PaymentConfirmSerializer, PaymentScheduleSerializer,
    PaymeCallbackSerializer
)
from apps.accounts.models import User
from apps.accounts.permissions import IsAdmin
from core.filters import PaymentFilter

class PaymentListView(generics.ListCreateAPIView):
    """List and create payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = PaymentFilter
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Payment.objects.all()
        elif user.is_student:
            return Payment.objects.filter(student=user)
        return Payment.objects.none()
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Payment detail endpoint"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Payment.objects.all()
        elif user.is_student:
            return Payment.objects.filter(student=user)
        return Payment.objects.none()

class ConfirmPaymentView(generics.GenericAPIView):
    """Confirm payment (Admin only)"""
    serializer_class = PaymentConfirmSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        payment = get_object_or_404(Payment, id=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_status = payment.status
        new_status = serializer.validated_data['status']
        
        payment.status = new_status
        if new_status == 'confirmed':
            payment.paid_date = timezone.now()
            payment.is_verified = True
            payment.confirmed_by = request.user
        payment.save()
        
        # Create history record
        PaymentHistory.objects.create(
            payment=payment,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )
        
        return Response(PaymentSerializer(payment).data)

class StudentPaymentsView(generics.ListAPIView):
    """List payments for a student"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id, role='student')
        
        user = self.request.user
        if user.is_admin or user.id == student_id:
            return Payment.objects.filter(student=student)
        
        return Payment.objects.none()

class GroupPaymentsView(generics.ListAPIView):
    """List payments for a group"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Payment.objects.filter(group_id=group_id)

class PaymeWebhookView(generics.GenericAPIView):
    """Payme webhook endpoint"""
    serializer_class = PaymeCallbackSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        # TODO: Implement Payme webhook handling
        return Response({'success': True})

class PaymentScheduleListView(generics.ListCreateAPIView):
    """List and create payment schedules"""
    serializer_class = PaymentScheduleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return PaymentSchedule.objects.all()
