# Backend API Integration Guide

This guide provides detailed information on integrating the TuranTalim backend API with the Next.js frontend.

## Base URL

```
Development: http://localhost:8000
Production: https://api.turantalim.com (configure in environment)
```

## Authentication Flow

### 1. User Login

**Endpoint**: `POST /api/v1/auth/login/`

**Request**:
```json
{
  "username": "student1",
  "password": "password123"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 2. Store Tokens

Store both tokens in localStorage/sessionStorage and HTTP-only cookies:

```typescript
// In Next.js
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);
```

### 3. API Requests

Include access token in all requests:

```typescript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};

fetch('/api/v1/auth/users/me/', { headers })
```

### 4. Token Refresh

When access token expires:

```typescript
POST /api/v1/auth/refresh/
{
  "refresh": "your_refresh_token"
}
```

## Admin Panel Integration

### User Management

#### List All Users

```
GET /api/v1/auth/users/
Query Parameters:
  - role: admin|teacher|student
  - is_active: true|false
  - search: search term
  - page: page number
```

#### Create Teacher

```
POST /api/v1/auth/register/teacher/
{
  "username": "teacher1",
  "email": "teacher@example.com",
  "first_name": "Ali",
  "last_name": "Karimov",
  "phone_number": "+998901234567",
  "password": "secure_password",
  "confirm_password": "secure_password",
  "language": "uz"
}
```

#### Create Student

```
POST /api/v1/auth/register/student/
(Same structure as teacher)
```

### Group Management

#### Create Group

```
POST /api/v1/courses/groups/
{
  "name": "Turkish Beginners A1",
  "course": 1,
  "teacher": 5,
  "start_date": "2024-01-15",
  "end_date": "2024-04-15",
  "max_students": 20,
  "description": "Group description"
}
```

#### Set Lesson Schedule

```
POST /api/v1/courses/schedules/
{
  "group": 1,
  "day_of_week": 0,  // 0=Monday, 6=Sunday
  "start_time": "18:00",
  "duration_minutes": 90
}
```

#### Auto-generate Lessons

Once schedule is set, lessons are auto-generated based on group dates.

### Payment Management

#### Create Payment

```
POST /api/v1/payments/
{
  "student": 1,
  "group": 1,
  "amount": "500000",
  "currency": "UZS",
  "payment_method": "payme",
  "due_date": "2024-02-15"
}
```

#### Confirm Payment

```
POST /api/v1/payments/{id}/confirm/
{
  "status": "confirmed",
  "notes": "Payment verified"
}
```

## Teacher Panel Integration

### Manage Groups & Lessons

#### Get My Groups

```
GET /api/v1/courses/groups/?teacher={teacher_id}
```

#### Get Group Lessons

```
GET /api/v1/lessons/group/{group_id}/
```

### Mark Attendance

#### Bulk Mark Attendance

```
POST /api/v1/attendance/bulk-mark/
{
  "lesson_id": 1,
  "attendance_data": [
    {
      "student": 1,
      "status": "present",
      "notes": ""
    },
    {
      "student": 2,
      "status": "absent",
      "notes": "Sick leave"
    }
  ]
}
```

### Homework Review

#### Get Lesson Homeworks

```
GET /api/v1/homework/lesson/{lesson_id}/
```

#### Review Homework

```
POST /api/v1/homework/{homework_id}/review/
{
  "status": "approved",
  "feedback": "Great work!"
}
```

The homework audio will be automatically transcribed and similarity checked by the AI pipeline.

## Student Panel Integration

### Dashboard Data

#### Get Current User Info

```
GET /api/v1/auth/users/me/
```

Response includes coins, role, language preference, etc.

#### Get My Groups

```
GET /api/v1/courses/groups/?students={student_id}
```

#### Get My Lessons

```
GET /api/v1/lessons/?group__students={student_id}
```

#### Get My Coins

```
GET /api/v1/gamification/coins/me/
```

### Homework Submission

#### Get Assigned Homeworks

```
GET /api/v1/homework/?student={student_id}
```

#### Submit Homework

```
POST /api/v1/homework/{homework_id}/submit/
Content-Type: multipart/form-data
- audio_submission: <audio file>
```

The audio is automatically processed:
1. Transcribed using OpenAI Whisper
2. Compared against expected answer
3. Similarity score calculated
4. Coins awarded if approved

### View Lessons & Resources

#### Get Lesson Resources

```
GET /api/v1/resources/lesson/{lesson_id}/
```

Response includes:
- Word documents (downloadable)
- Audio files (streamable)
- Supplementary materials

#### Download Resource

```
GET /api/v1/resources/{resource_id}/download/
```

### Payments

#### Get My Payments

```
GET /api/v1/payments/?student={student_id}
```

#### Payment Status

- `pending`: Not paid yet
- `confirmed`: Payment verified
- `overdue`: Past due date (>5 days)
- `failed`: Payment failed

### Leaderboard & Achievements

#### Get Group Leaderboard

```
GET /api/v1/gamification/leaderboard/{group_id}/
```

Ranked by:
1. Total coins
2. Lessons completed
3. Homeworks completed

#### Get My Achievements

```
GET /api/v1/gamification/achievements/{student_id}/
```

## Notifications

### Get Notifications

```
GET /api/v1/notifications/
```

### Mark as Read

```
POST /api/v1/notifications/{notification_id}/mark-read/
```

### Set Preferences

```
PUT /api/v1/notifications/preferences/me/
{
  "telegram_enabled": true,
  "sms_enabled": true,
  "email_enabled": true,
  "telegram_chat_id": "123456789",
  "phone_number": "+998901234567",
  "payment_notifications": true,
  "homework_notifications": true,
  "lesson_notifications": true,
  "attendance_notifications": true,
  "gamification_notifications": true
}
```

## Frontend Implementation Examples

### React Hook for API Calls

```typescript
import { useCallback, useEffect, useState } from 'react';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
```

### Example Usage

```typescript
// Get current user
const { data: user } = useApi('/api/v1/auth/users/me/');

// Get my groups
const { data: groups } = useApi('/api/v1/courses/groups/');

// Get my coins
const { data: coins } = useApi('/api/v1/gamification/coins/me/');
```

### File Upload

```typescript
async function uploadHomework(homeworkId: number, audioFile: File) {
  const formData = new FormData();
  formData.append('audio_submission', audioFile);

  const token = localStorage.getItem('access_token');
  const response = await fetch(
    `http://localhost:8000/api/v1/homework/${homeworkId}/submit/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return response.json();
}
```

## Error Handling

API returns standard HTTP status codes and error messages:

```json
{
  "detail": "Error message",
  "code": "error_code"
}
```

Common errors:
- `400`: Bad request (validation error)
- `401`: Unauthorized (token missing/invalid)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

### Error Handling in Frontend

```typescript
async function apiCall(url: string, options = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const newToken = await refreshToken();
    localStorage.setItem('access_token', newToken);
    // Retry request
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API error');
  }

  return response.json();
}
```

## Rate Limiting

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Pagination

List endpoints support pagination:

```
GET /api/v1/users/?page=2&page_size=20
```

Response format:
```json
{
  "count": 100,
  "next": "http://api.example.com/users/?page=3",
  "previous": "http://api.example.com/users/?page=1",
  "results": [...]
}
```

## Filtering & Search

Many endpoints support filtering:

```
GET /api/v1/lessons/?status=completed&group=1&scheduled_date__gte=2024-01-01
GET /api/v1/users/?search=Ali&role=student
GET /api/v1/payments/?status=pending&is_overdue=true
```

## WebSocket Support (Real-time)

For real-time notifications, use WebSockets:

```typescript
const ws = new WebSocket(
  `ws://localhost:8000/ws/notifications/`
);

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://turantalim.com` (production)

Update `CORS_ALLOWED_ORIGINS` in backend `.env` as needed.

## API Documentation UI

Access interactive API documentation:
- Swagger UI: `http://localhost:8000/api/v1/docs/`
- ReDoc: `http://localhost:8000/api/v1/docs/redoc/`

## Support

For API issues or questions:
- Email: support@turantalim.com
- Telegram: @turantalim_support
