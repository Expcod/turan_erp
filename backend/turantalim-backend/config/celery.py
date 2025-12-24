import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('turantalim')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'mark-payments-overdue-daily': {
        'task': 'apps.homework.tasks.mark_payments_overdue',
        'schedule': crontab(hour=0, minute=0),
    },
    'update-leaderboards-hourly': {
        'task': 'apps.homework.tasks.update_leaderboards',
        'schedule': crontab(minute=0),
    },
    'check-homework-deadlines-hourly': {
        'task': 'apps.homework.tasks.check_homework_deadlines',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
