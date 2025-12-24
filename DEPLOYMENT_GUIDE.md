# TuranTalim - Complete Setup & Deployment Guide

This comprehensive guide covers setting up both the backend and frontend, and deploying to production.

## Prerequisites

- **Python** 3.9+
- **Node.js** 18+
- **PostgreSQL** 12+
- **Redis** 6+
- **Docker** (optional, for containerized deployment)
- **Git**

## Backend Setup (Django)

### Step 1: Clone and Environment

```bash
cd backend/turantalim-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Environment Configuration

```bash
# Copy example environment
cp .env.example .env

# Edit with your configuration
nano .env
```

**Key settings to configure**:

```env
# Database
DB_NAME=turantalim_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-random-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Celery & Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# JWT Tokens
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Payme Payment
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SERVICE_PASSWORD=your_service_password
PAYME_CALLBACK_URL=https://yourdomain.com/api/v1/payments/payme/webhook/

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_GROUP_ID=your_admin_group_id

# Eskiz SMS
ESKIZ_EMAIL=your_email@example.com
ESKIZ_PASSWORD=your_password

# OpenAI Whisper
OPENAI_API_KEY=your_openai_api_key

# S3 Storage (Optional)
USE_S3=False
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_STORAGE_BUCKET_NAME=your_bucket

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=noreply@turantalim.com
```

### Step 3: Database Setup

```bash
# Install PostgreSQL and create database
createdb turantalim_db
createuser -P postgres  # Set password for postgres user

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Follow prompts to create admin account

# Load initial data (optional)
python manage.py loaddata initial_data.json
```

### Step 4: Test Development Server

```bash
# Terminal 1: Start Django development server
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Start Celery worker
celery -A config worker -l info

# Terminal 3: Start Celery Beat (scheduled tasks)
celery -A config beat -l info

# Terminal 4: Start Redis (if not running as service)
redis-server
```

Visit `http://localhost:8000/api/v1/docs/` to verify API is working.

## Frontend Setup (Next.js)

### Step 1: Install Dependencies

```bash
cd frontend

# Using pnpm (recommended)
pnpm install

# Or npm
npm install

# Or yarn
yarn install
```

### Step 2: Environment Configuration

```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TuranTalim ERP
NEXT_PUBLIC_APP_TAGLINE=Educational Resource Planning Platform
EOF
```

### Step 3: Configure API Integration

Update `lib/user-context.tsx` with backend URL:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  // ... rest of implementation
}
```

### Step 4: Run Development Server

```bash
# Start Next.js development server
pnpm dev
# or
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Create Docker Compose File

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: turantalim_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend/turantalim-backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    environment:
      - DEBUG=False
      - DJANGO_SETTINGS_MODULE=config.settings
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/turantalim_db
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"
    volumes:
      - ./backend/turantalim-backend:/app

  celery:
    build: ./backend/turantalim-backend
    command: celery -A config worker -l info
    environment:
      - DEBUG=False
      - DJANGO_SETTINGS_MODULE=config.settings
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/turantalim_db
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
      - backend

  celery-beat:
    build: ./backend/turantalim-backend
    command: celery -A config beat -l info
    environment:
      - DEBUG=False
      - DJANGO_SETTINGS_MODULE=config.settings
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/turantalim_db
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  redis_data:
```

#### Backend Dockerfile

Create `backend/turantalim-backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy project
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Deploy with Docker Compose

```bash
# Create .env file for docker-compose
cat > .env << EOF
DB_PASSWORD=your_secure_password
SECRET_KEY=your-django-secret-key
PAYME_MERCHANT_ID=your_merchant_id
# ... other environment variables
EOF

# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# View logs
docker-compose logs -f
```

### Option 2: Linux Server Deployment

#### Backend Setup (Gunicorn + Nginx)

```bash
# SSH into server
ssh user@your_server_ip

# Install system packages
sudo apt update
sudo apt install -y postgresql postgresql-contrib redis-server nginx python3-pip python3-venv git

# Clone repository
git clone https://github.com/your-repo/turantalim.git
cd turantalim/backend/turantalim-backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with production settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

#### Create Systemd Service Files

**Create `/etc/systemd/system/gunicorn.service`:**

```ini
[Unit]
Description=gunicorn daemon for turantalim
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/turantalim/backend/turantalim-backend
ExecStart=/path/to/venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Create `/etc/systemd/system/celery.service`:**

```ini
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=www-data
WorkingDirectory=/path/to/turantalim/backend/turantalim-backend
ExecStart=/path/to/venv/bin/celery -A config worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Enable and Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn celery
sudo systemctl start gunicorn celery
```

#### Nginx Configuration

**Create `/etc/nginx/sites-available/turantalim`:**

```nginx
upstream gunicorn {
    server 127.0.0.1:8000;
}

upstream nextjs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name turantalim.com www.turantalim.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name turantalim.com www.turantalim.com;

    ssl_certificate /etc/letsencrypt/live/turantalim.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/turantalim.com/privkey.pem;

    # API Backend
    location /api/ {
        proxy_pass http://gunicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /path/to/turantalim/backend/turantalim-backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /path/to/turantalim/backend/turantalim-backend/media/;
    }

    # Frontend
    location / {
        proxy_pass http://nextjs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/turantalim /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d turantalim.com -d www.turantalim.com
```

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/v1/health/

# Database
python manage.py dbshell

# Redis
redis-cli ping
```

### Logs

```bash
# Django logs
tail -f /var/log/gunicorn/turantalim.log

# Celery logs
sudo journalctl -u celery -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup & Restore

```bash
# Backup database
pg_dump turantalim_db > backup.sql

# Restore database
psql turantalim_db < backup.sql

# Backup media files
tar -czf media_backup.tar.gz media/
```

## Troubleshooting

### Backend not responding
```bash
# Check status
sudo systemctl status gunicorn

# Restart service
sudo systemctl restart gunicorn

# Check logs
sudo journalctl -u gunicorn -n 50
```

### Celery tasks not running
```bash
# Restart Celery
sudo systemctl restart celery

# Check if Redis is running
redis-cli ping

# Monitor tasks
celery -A config inspect active
```

### Database connection issues
```bash
# Test connection
psql -h localhost -U postgres -d turantalim_db

# Check PostgreSQL status
sudo systemctl status postgresql
```

## Performance Optimization

### Caching
Enable Redis caching in Django settings for frequently accessed data.

### Database
- Add indexes to frequently queried fields
- Regular vacuum and analyze operations
- Monitor slow queries

### Frontend
- Enable static file compression (gzip)
- Optimize images and assets
- Implement lazy loading

### Celery
- Monitor task queue depth
- Adjust worker concurrency based on CPU cores
- Use task rate limiting for heavy tasks

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure secure ALLOWED_HOSTS
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS appropriately
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] Backup critical data regularly
- [ ] Implement WAF (optional)

## Support & Contact

- Documentation: https://docs.turantalim.com
- Support Email: support@turantalim.com
- Telegram: @turantalim_support
- Issues: https://github.com/turantalim/issues
