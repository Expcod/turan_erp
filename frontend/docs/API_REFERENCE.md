# TuranTalim ERP - API Reference

Complete API documentation for backend integration.

---

## Base URL

\`\`\`
Production: https://api.turantalim.com/api/v1
Development: http://localhost:8000/api/v1
\`\`\`

## Authentication

All authenticated endpoints require the `Authorization` header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Data Models

### User

\`\`\`typescript
interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
  createdAt: string
  updatedAt: string
}
\`\`\`

### Group

\`\`\`typescript
interface Group {
  id: string
  name: string
  teacherId: string
  teacherName: string
  schedule: string // e.g., "Mon, Wed, Fri - 14:00"
  studentCount: number
  lessonCount: number
  status: 'active' | 'inactive'
  createdAt: string
}
\`\`\`

### Student

\`\`\`typescript
interface Student {
  id: string
  userId: string
  fullName: string
  username: string
  groupId: string
  groupName: string
  coins: number
  totalCoins: number
  attendance: number // percentage
  submissionCount: number
  acceptedCount: number
  paymentStatus: 'paid' | 'pending' | 'overdue'
  lastPaymentDate?: string
  createdAt: string
}
\`\`\`

### Teacher

\`\`\`typescript
interface Teacher {
  id: string
  userId: string
  fullName: string
  username: string
  email: string
  phone?: string
  groupCount: number
  studentCount: number
  status: 'active' | 'inactive'
  createdAt: string
}
\`\`\`

### Lesson

\`\`\`typescript
interface Lesson {
  id: string
  groupId: string
  groupName: string
  title: string
  description?: string
  orderNumber: number
  wordDocumentUrl?: string
  wordContent?: string // Parsed HTML content
  audioResources: AudioResource[]
  homeworkDeadline?: string
  maxAttempts: number
  coinsReward: number
  status: 'draft' | 'published'
  createdAt: string
}

interface AudioResource {
  id: string
  title: string
  url: string
  duration: number // seconds
}
\`\`\`

### Submission

\`\`\`typescript
interface Submission {
  id: string
  studentId: string
  studentName: string
  lessonId: string
  lessonTitle: string
  audioUrl: string
  duration: number
  transcription?: string
  similarityScore?: number
  attemptNumber: number
  status: 'pending' | 'accepted' | 'rejected'
  feedback?: string
  coinsAwarded: number
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
}
\`\`\`

### Attendance

\`\`\`typescript
interface Attendance {
  id: string
  studentId: string
  lessonId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  note?: string
  markedBy: string
  createdAt: string
}
\`\`\`

### Payment

\`\`\`typescript
interface Payment {
  id: string
  studentId: string
  studentName: string
  amount: number
  currency: string
  method: 'cash' | 'card' | 'transfer'
  status: 'pending' | 'confirmed' | 'cancelled'
  period: string // e.g., "2025-01" for January 2025
  confirmedBy?: string
  confirmedAt?: string
  createdAt: string
}
\`\`\`

### Settings

\`\`\`typescript
interface Settings {
  similarityThreshold: number // 0-100
  coinsPerAcceptedHomework: number
  homeworkDeadlineDays: number
  maxHomeworkAttempts: number
  lateSubmissionPenalty: number // coins deducted
}
\`\`\`

---

## Endpoints

### Authentication

#### POST /auth/login

Login and receive tokens.

**Request:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "user-123",
      "username": "admin",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
\`\`\`

#### POST /auth/refresh

Refresh access token.

**Request:**
\`\`\`json
{
  "refreshToken": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
\`\`\`

#### GET /auth/me

Get current authenticated user.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@turantalim.com",
    "role": "admin",
    "avatar": "https://..."
  }
}
\`\`\`

---

### Groups

#### GET /groups

List all groups with optional filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| teacherId | string | Filter by teacher |
| status | string | Filter by status |
| search | string | Search by name |

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "group-1",
      "name": "English A1",
      "teacherId": "teacher-1",
      "teacherName": "John Smith",
      "schedule": "Mon, Wed, Fri - 14:00",
      "studentCount": 12,
      "lessonCount": 24,
      "status": "active"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
\`\`\`

#### POST /groups

Create a new group.

**Request:**
\`\`\`json
{
  "name": "English B1",
  "teacherId": "teacher-1",
  "schedule": "Tue, Thu - 16:00"
}
\`\`\`

---

### Students

#### GET /students

List students with filtering and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| groupId | string | Filter by group |
| paymentStatus | string | Filter by payment status |
| search | string | Search by name |

#### POST /students

Create a new student.

**Request:**
\`\`\`json
{
  "fullName": "Ali Karimov",
  "username": "ali.karimov",
  "password": "securePassword123",
  "groupId": "group-1",
  "email": "ali@example.com"
}
\`\`\`

#### GET /students/:id/submissions

Get student's homework submissions.

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "sub-1",
      "lessonTitle": "Lesson 1: Greetings",
      "status": "accepted",
      "similarityScore": 85,
      "coinsAwarded": 10,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

---

### Lessons

#### GET /lessons/:id/content

Get parsed Word document content.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "html": "<h1>Lesson 1</h1><p>Welcome to...</p>",
    "plainText": "Lesson 1\n\nWelcome to...",
    "images": [
      {
        "id": "img-1",
        "url": "https://storage.../image1.png",
        "alt": "Example diagram"
      }
    ]
  }
}
\`\`\`

#### POST /lessons/:id/audio

Upload audio resource for a lesson.

**Request (multipart/form-data):**
- `audio`: Audio file (mp3, wav, webm)
- `title`: Resource title

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "audio-1",
    "title": "Pronunciation Guide",
    "url": "https://storage.../audio1.mp3",
    "duration": 180
  }
}
\`\`\`

---

### Submissions

#### POST /submissions

Submit homework (student).

**Request (multipart/form-data):**
- `audio`: Audio recording (webm)
- `lessonId`: Lesson ID

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "sub-123",
    "status": "pending",
    "attemptNumber": 1,
    "message": "Homework submitted successfully"
  }
}
\`\`\`

#### PATCH /submissions/:id/review

Review and accept/reject submission (teacher).

**Request:**
\`\`\`json
{
  "status": "accepted",
  "feedback": "Great pronunciation!",
  "coinsAwarded": 10
}
\`\`\`

---

### Attendance

#### POST /attendance

Mark attendance for a lesson.

**Request:**
\`\`\`json
{
  "lessonId": "lesson-1",
  "date": "2025-01-15",
  "records": [
    { "studentId": "student-1", "status": "present" },
    { "studentId": "student-2", "status": "absent" },
    { "studentId": "student-3", "status": "late", "note": "10 minutes late" }
  ]
}
\`\`\`

---

### Payments

#### GET /payments

List payments with filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| studentId | string | Filter by student |
| status | string | Filter by status |
| period | string | Filter by period (YYYY-MM) |
| method | string | Filter by payment method |

#### PATCH /payments/:id/confirm

Confirm cash payment (admin only).

**Request:**
\`\`\`json
{
  "confirmedBy": "admin-1"
}
\`\`\`

---

### Leaderboard

#### GET /leaderboard

Get student rankings by coins.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| limit | number | Number of results (default: 50) |
| groupId | string | Filter by group |
| period | string | Time period: week, month, all |

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "studentId": "student-1",
      "fullName": "Ali Karimov",
      "avatar": "https://...",
      "groupName": "English A1",
      "coins": 250,
      "submissionCount": 20,
      "acceptedCount": 18
    }
  ]
}
\`\`\`

---

### Settings

#### GET /settings

Get system settings.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "similarityThreshold": 70,
    "coinsPerAcceptedHomework": 10,
    "homeworkDeadlineDays": 7,
    "maxHomeworkAttempts": 3,
    "lateSubmissionPenalty": 2
  }
}
\`\`\`

#### PUT /settings

Update system settings (admin only).

**Request:**
\`\`\`json
{
  "similarityThreshold": 75,
  "coinsPerAcceptedHomework": 15
}
\`\`\`

---

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_INVALID_CREDENTIALS | Invalid username or password |
| AUTH_TOKEN_EXPIRED | Access token has expired |
| AUTH_UNAUTHORIZED | User not authorized for this action |
| VALIDATION_ERROR | Request validation failed |
| NOT_FOUND | Resource not found |
| DUPLICATE_ENTRY | Resource already exists |
| LIMIT_EXCEEDED | Rate limit or quota exceeded |
| UPLOAD_FAILED | File upload failed |
| PROCESSING_ERROR | Internal processing error |

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per minute
- **General API:** 100 requests per minute
- **File uploads:** 10 requests per minute

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
\`\`\`

---

## Webhooks (Optional)

Configure webhooks for real-time notifications:

| Event | Description |
|-------|-------------|
| submission.created | New homework submission |
| submission.reviewed | Submission accepted/rejected |
| payment.confirmed | Payment confirmed |
| attendance.marked | Attendance recorded |

Webhook payload:
\`\`\`json
{
  "event": "submission.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": { ... }
}
