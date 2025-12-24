# Quick Start Guide - TuranTalim Backend

Get the backend up and running in 5 minutes!

## Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6+
- Git

## One-Command Setup

### macOS/Linux

```bash
# Clone project
git clone <repo_url>
cd turan\ erp/backend/turantalim-backend

# Run setup script (create this script)
./setup.sh
```

### Windows (PowerShell)

```powershell
cd "turan erp/backend/turantalim-backend"
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Manual Setup (3 Steps)

### Step 1: Install & Configure (2 min)

```bash
# Virtual environment
python -m venv venv
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Edit .env with your database credentials
```

### Step 2: Database (1 min)

```bash
# Migrate database
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

### Step 3: Run (2 min)

```bash
# In Terminal 1: Django server
python manage.py runserver

# In Terminal 2: Celery worker
celery -A config worker -l info

# In Terminal 3: Redis (if not running as service)
redis-server
```

## Verification

✅ **Backend ready** → Visit `http://localhost:8000/api/v1/docs/`
✅ **Admin panel** → Go to `http://localhost:8000/admin/`
✅ **API docs** → Interactive Swagger UI available

## Default Admin Login

After running `python manage.py createsuperuser`:
- URL: `http://localhost:8000/admin/`
- Use credentials you created

## API Test Examples

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### Get Current User
```bash
curl http://localhost:8000/api/v1/auth/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Courses
```bash
curl http://localhost:8000/api/v1/courses/courses/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Commands

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run tests
python manage.py test

# Load sample data
python manage.py seed_data

# Start shell
python manage.py shell

# Check database
python manage.py dbshell
```

## Folder Structure Overview

```
backend/turantalim-backend/
├── manage.py                 # Django entry point
├── requirements.txt          # Python dependencies
├── .env.example             # Example env file
├── config/
│   ├── settings.py          # Main configuration
│   ├── urls.py              # URL routing
│   ├── celery.py            # Celery config
│   └── wsgi.py              # Production server
├── apps/
│   ├── accounts/            # Auth & users
│   ├── courses/             # Courses & groups
│   ├── lessons/             # Lessons
│   ├── homework/            # Homework & AI
│   ├── payments/            # Payments
│   ├── gamification/        # Coins & leaderboards
│   └── notifications/       # Messages
└── core/
    ├── permissions.py       # Access control
    ├── serializers.py       # Data formatting
    └── validators.py        # Input validation
```

## Environment Variables Quick Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `turantalim` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure_pass` |
| `SECRET_KEY` | Django secret | `random-key-123` |
| `OPENAI_API_KEY` | Whisper API key | `sk-...` |
| `PAYME_MERCHANT_ID` | Payme ID | `merchant_id` |
| `TELEGRAM_BOT_TOKEN` | Bot token | `123:ABC...` |

## Troubleshooting

### Issue: "ModuleNotFoundError"
```bash
# Activate venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "Database connection refused"
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux

# Check connection
psql -U postgres -c "SELECT 1"
```

### Issue: "Redis connection error"
```bash
# Start Redis
redis-server
# or
brew services start redis  # macOS
sudo systemctl start redis # Linux

# Test connection
redis-cli ping
# Should return: PONG
```

### Issue: "Migration error"
```bash
# Reset database (warning: deletes data)
python manage.py migrate 0001 --plan
python manage.py migrate zero  # Remove all migrations
python manage.py migrate       # Re-apply all

# Or create new migration
python manage.py makemigrations
python manage.py migrate
```

## Testing the API

### With cURL

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.access')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/auth/users/me/
```

### With Python

```python
import requests

# Login
response = requests.post('http://localhost:8000/api/v1/auth/login/', json={
    'username': 'admin',
    'password': 'admin'
})
token = response.json()['access']

# Get data
headers = {'Authorization': f'Bearer {token}'}
users = requests.get('http://localhost:8000/api/v1/auth/users/', headers=headers)
print(users.json())
```

### With curl Script

Create `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"
USERNAME="admin"
PASSWORD="admin"

# Get token
TOKEN=$(curl -s -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.access')

echo "Token: $TOKEN"

# Test endpoints
echo "\n=== Users ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/auth/users/me/ | jq

echo "\n=== Courses ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/courses/courses/ | jq

echo "\n=== Groups ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/courses/groups/ | jq
```

Run with: `chmod +x test_api.sh && ./test_api.sh`

## Next Steps

1. ✅ Backend is running
2. 📖 Read [Backend Integration Guide](../frontend/docs/BACKEND_INTEGRATION.md) for frontend setup
3. 🚀 Start building frontend features
4. 📝 Check [Deployment Guide](../DEPLOYMENT_GUIDE.md) for production setup

## Documentation Links

- **API Documentation**: http://localhost:8000/api/v1/docs/
- **Backend README**: `./README.md`
- **Integration Guide**: `../frontend/docs/BACKEND_INTEGRATION.md`
- **Deployment**: `../DEPLOYMENT_GUIDE.md`

## Support

- 📧 Email: support@turantalim.com
- 💬 Telegram: @turantalim_support
- 🐛 Issues: Report via GitHub

---

**You're ready to go! Happy coding! 🚀**
