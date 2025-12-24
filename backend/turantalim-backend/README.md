# TuranTalim Backend - Django REST Framework

A comprehensive Education Resource Planning (ERP) system backend built with Django REST Framework, featuring complete API endpoints for admin, teacher, and student management.

## Features

### Admin Panel
- User management (teachers, students)
- Group and course management
- Payment tracking and confirmation
- System settings configuration
- Audit logging

### Teacher Panel
- Group and lesson management
- Attendance tracking
- Homework submission review
- Student progress monitoring

### Student Panel
- Lesson access with resources
- Homework submission with audio recording
- Payment tracking
- Coins and leaderboard system

## Tech Stack

- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL
- **Async Tasks**: Celery + Redis
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Storage**: S3-compatible (boto3)
- **Payment**: Payme Merchant integration
- **AI**: OpenAI Whisper for audio transcription
- **Real-time**: Django Channels + Redis

## Project Structure

```
backend/
├── config/           # Django configuration
│   ├── settings.py   # Main settings
│   ├── urls.py       # URL routing
│   ├── celery.py     # Celery configuration
│   ├── wsgi.py       # Production server
│   └── asgi.py       # WebSocket support
├── apps/            # Django applications
│   ├── accounts/     # User authentication & management
│   ├── courses/      # Courses and groups
│   ├── groups/       # Group scheduling
│   ├── lessons/      # Lesson management
│   ├── attendance/   # Attendance tracking
│   ├── resources/    # Lesson resources
│   ├── homework/     # Homework with AI scoring
│   ├── payments/     # Payment management
│   ├── gamification/ # Coins and leaderboards
│   ├── notifications/# Telegram, SMS, Email
│   └── settings/     # System configuration
├── core/            # Common utilities
│   ├── exceptions.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── validators.py
│   ├── pagination.py
│   ├── filters.py
│   └── middleware.py
└── requirements.txt # Dependencies
```

## Installation

### 1. Clone and Setup

```bash
cd backend/turantalim-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (optional)
python manage.py seed_data
```

### 5. Redis Setup

```bash
# Install and run Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:latest
```

### 6. Run Development Server

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A config worker -l info

# Terminal 3: Celery Beat (optional)
celery -A config beat -l info
```

## API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/login/                 # User login
POST   /api/v1/auth/refresh/               # Refresh token
POST   /api/v1/auth/logout/                # User logout
POST   /api/v1/auth/register/student/      # Student registration
POST   /api/v1/auth/forgot-password/       # Request password reset
POST   /api/v1/auth/reset-password/        # Reset password
```

### User Management

```
GET    /api/v1/auth/users/me/              # Current user profile
GET    /api/v1/auth/users/                 # List all users (admin)
POST   /api/v1/auth/users/                 # Create user (admin)
GET    /api/v1/auth/users/{id}/            # User detail
PUT    /api/v1/auth/users/{id}/            # Update user
DELETE /api/v1/auth/users/{id}/            # Delete user
```

### Courses & Groups

```
GET    /api/v1/courses/courses/            # List courses
POST   /api/v1/courses/courses/            # Create course (admin)
GET    /api/v1/courses/groups/             # List groups
POST   /api/v1/courses/groups/             # Create group (admin)
GET    /api/v1/courses/groups/{id}/        # Group detail
```

### Lessons & Attendance

```
GET    /api/v1/lessons/                    # List lessons
GET    /api/v1/lessons/{id}/               # Lesson detail
GET    /api/v1/attendance/                 # List attendance
POST   /api/v1/attendance/bulk-mark/       # Bulk mark attendance (teacher)
```

### Homework

```
GET    /api/v1/homework/                   # List homeworks
GET    /api/v1/homework/{id}/              # Homework detail
POST   /api/v1/homework/{id}/submit/       # Submit homework (student)
POST   /api/v1/homework/{id}/review/       # Review homework (teacher)
```

### Payments

```
GET    /api/v1/payments/                   # List payments
POST   /api/v1/payments/{id}/confirm/      # Confirm payment (admin)
POST   /api/v1/payments/payme/webhook/     # Payme webhook
```

### Gamification

```
GET    /api/v1/gamification/coins/me/      # My coins
GET    /api/v1/gamification/leaderboard/{group_id}/  # Group leaderboard
GET    /api/v1/gamification/achievements/{student_id}/ # Student achievements
```

### Notifications

```
GET    /api/v1/notifications/              # List notifications
GET    /api/v1/notifications/unread/       # Unread notifications
POST   /api/v1/notifications/{id}/mark-read/ # Mark as read
```

### System Settings

```
GET    /api/v1/settings/system/            # System settings (admin)
PUT    /api/v1/settings/system/            # Update settings (admin)
GET    /api/v1/settings/audit-logs/        # Audit logs (admin)
```

## Authentication

All protected endpoints require JWT token in the Authorization header:

```bash
Authorization: Bearer <your_token_here>
```

### Get Token

```bash
POST /api/v1/auth/login/
{
  "username": "your_username",
  "password": "your_password"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Permissions

- **Admin**: Full access to all endpoints
- **Teacher**: Access to own groups, lessons, and attendance
- **Student**: Access to own profile, groups, and homeworks

## Environment Variables

Key variables in `.env`:

```
# Database
DB_NAME=turantalim
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost

# Redis & Celery
CELERY_BROKER_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your_secret_key

# Payme Integration
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SERVICE_PASSWORD=your_service_password

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Eskiz SMS
ESKIZ_EMAIL=your_email
ESKIZ_PASSWORD=your_password

# OpenAI
OPENAI_API_KEY=your_api_key

# System Settings
SIMILARITY_THRESHOLD=0.50
```

## Testing

Run tests:

```bash
python manage.py test

# With coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## Deployment

### Docker

```bash
docker build -t turantalim-backend .
docker run -p 8000:8000 --env-file .env turantalim-backend
```

### Production

1. Set `DEBUG=False` in settings
2. Configure allowed hosts
3. Use environment-specific settings
4. Use Gunicorn/uWSGI for application server
5. Configure Nginx as reverse proxy
6. Use SSL/TLS certificates
7. Setup proper logging

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Run migrations: `python manage.py migrate`

### Redis Connection Error
- Start Redis server: `redis-server`
- Check Redis URL in `.env`

### Celery Tasks Not Running
- Ensure Redis is running
- Start Celery worker: `celery -A config worker -l info`
- Check Celery logs

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## License

All rights reserved - TuranTalim Educational Platform
