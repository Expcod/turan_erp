from celery import shared_task
from django.conf import settings
import requests
from telegram import Bot
from telegram.error import TelegramError
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_telegram_notification(notification_id):
    """Send notification via Telegram"""
    from apps.notifications.models import Notification, NotificationLog, NotificationPreference
    
    try:
        notification = Notification.objects.get(id=notification_id)
        preference = NotificationPreference.objects.filter(user=notification.recipient).first()
        
        if not preference or not preference.telegram_enabled or not preference.telegram_chat_id:
            return {'status': 'skipped', 'reason': 'Telegram not enabled or chat ID not set'}
        
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        
        message = f"<b>{notification.title}</b>\n{notification.message}"
        
        bot.send_message(
            chat_id=preference.telegram_chat_id,
            text=message,
            parse_mode='HTML'
        )
        
        NotificationLog.objects.create(
            notification=notification,
            channel='telegram',
            status='sent'
        )
        
        return {'status': 'success'}
        
    except TelegramError as e:
        NotificationLog.objects.create(
            notification=notification,
            channel='telegram',
            status='failed',
            error_message=str(e)
        )
        logger.error(f"Telegram error: {str(e)}")
        return {'status': 'error', 'message': str(e)}
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def send_sms_notification(notification_id):
    """Send notification via Eskiz SMS"""
    from apps.notifications.models import Notification, NotificationLog, NotificationPreference
    
    try:
        notification = Notification.objects.get(id=notification_id)
        preference = NotificationPreference.objects.filter(user=notification.recipient).first()
        
        if not preference or not preference.sms_enabled or not preference.phone_number:
            return {'status': 'skipped', 'reason': 'SMS not enabled or phone number not set'}
        
        # Get authentication token
        auth_response = requests.post(
            'https://notify.eskiz.uz/api/auth/login',
            data={
                'email': settings.ESKIZ_EMAIL,
                'password': settings.ESKIZ_PASSWORD
            }
        )
        
        if auth_response.status_code != 200:
            return {'status': 'error', 'message': 'Authentication failed'}
        
        token = auth_response.json().get('data', {}).get('token')
        
        # Send SMS
        sms_response = requests.post(
            'https://notify.eskiz.uz/api/message/send',
            data={
                'mobile_phone': preference.phone_number,
                'message': notification.message,
                'from': '4546'  # Sender ID
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if sms_response.status_code == 200:
            NotificationLog.objects.create(
                notification=notification,
                channel='sms',
                status='sent',
                response_code=sms_response.json().get('message', '')
            )
            return {'status': 'success'}
        else:
            NotificationLog.objects.create(
                notification=notification,
                channel='sms',
                status='failed',
                error_message=sms_response.text
            )
            return {'status': 'error', 'message': sms_response.text}
        
    except Exception as e:
        logger.error(f"SMS error: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def send_email_notification(notification_id):
    """Send notification via email"""
    from apps.notifications.models import Notification, NotificationLog, NotificationPreference
    from django.core.mail import send_mail
    
    try:
        notification = Notification.objects.get(id=notification_id)
        preference = NotificationPreference.objects.filter(user=notification.recipient).first()
        
        if not preference or not preference.email_enabled:
            return {'status': 'skipped', 'reason': 'Email not enabled'}
        
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.recipient.email],
            fail_silently=False
        )
        
        NotificationLog.objects.create(
            notification=notification,
            channel='email',
            status='sent'
        )
        
        return {'status': 'success'}
        
    except Exception as e:
        NotificationLog.objects.create(
            notification=notification,
            channel='email',
            status='failed',
            error_message=str(e)
        )
        logger.error(f"Email error: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def send_bulk_notification(notification_ids):
    """Send multiple notifications"""
    results = []
    for notification_id in notification_ids:
        result = send_telegram_notification.delay(notification_id)
        results.append(result)
    
    return {'status': 'success', 'sent': len(results)}
