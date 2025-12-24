from django.urls import path
from apps.payments import views

urlpatterns = [
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('<int:pk>/confirm/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('student/<int:student_id>/', views.StudentPaymentsView.as_view(), name='student-payments'),
    path('group/<int:group_id>/', views.GroupPaymentsView.as_view(), name='group-payments'),
    path('payme/webhook/', views.PaymeWebhookView.as_view(), name='payme-webhook'),
    path('schedules/', views.PaymentScheduleListView.as_view(), name='schedule-list'),
]
