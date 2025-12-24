# Backend Integration Guide

This document provides comprehensive guidance on integrating the TuranTalim ERP Frontend with your backend API.

## Table of Contents

1. [API Configuration](#api-configuration)
2. [Authentication](#authentication)
3. [API Service Setup](#api-service-setup)
4. [Data Fetching Patterns](#data-fetching-patterns)
5. [File Uploads](#file-uploads)
6. [Real-time Updates](#real-time-updates)
7. [Error Handling](#error-handling)
8. [Expected API Endpoints](#expected-api-endpoints)

---

## API Configuration

### Environment Setup

\`\`\`env
# .env.local
NEXT_PUBLIC_API_URL=https://api.turantalim.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_STORAGE_URL=https://storage.turantalim.com
\`\`\`

### API Client Configuration

Create a centralized API configuration:

\`\`\`tsx
// lib/config.ts
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: 30000,
  retries: 3,
}

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}${endpoint}`
}
\`\`\`

---

## Authentication

### Login Flow

\`\`\`tsx
// lib/auth.ts
import { getApiUrl } from './config'

interface LoginCredentials {
  username: string
  password: string
}

interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    username: string
    role: 'admin' | 'teacher' | 'student'
    fullName: string
    email?: string
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Login failed')
  }

  const data = await response.json()
  
  // Store tokens
  localStorage.setItem('token', data.token)
  localStorage.setItem('refreshToken', data.refreshToken)
  
  return data
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem('token')
  
  try {
    await fetch(getApiUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }
}

export async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  
  const response = await fetch(getApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  const data = await response.json()
  localStorage.setItem('token', data.token)
  
  return data.token
}
\`\`\`

### Integrating with User Context

Update the existing user context to use real API:

\`\`\`tsx
// lib/user-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout } from './auth'

interface User {
  id: string
  username: string
  role: 'admin' | 'teacher' | 'student'
  fullName: string
  email?: string
  avatar?: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(getApiUrl('/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(username: string, password: string) {
    setIsLoading(true)
    try {
      const data = await apiLogin({ username, password })
      setUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    await apiLogout()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
\`\`\`

---

## API Service Setup

### Base API Service

\`\`\`tsx
// lib/api.ts
import { getApiUrl } from './config'
import { refreshToken } from './auth'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      error.message || `HTTP Error ${response.status}`,
      response.status,
      error.code
    )
  }
  return response.json()
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem('token')

  const makeRequest = async (authToken: string | null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    return fetch(getApiUrl(endpoint), {
      ...options,
      headers,
    })
  }

  let response = await makeRequest(token)

  // If unauthorized, try to refresh token
  if (response.status === 401 && token) {
    try {
      token = await refreshToken()
      response = await makeRequest(token)
    } catch {
      // Refresh failed, redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      throw new ApiError('Session expired', 401)
    }
  }

  return handleResponse<T>(response)
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => fetchWithAuth<T>(endpoint),
  
  post: <T>(endpoint: string, data: unknown) => 
    fetchWithAuth<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: unknown) => 
    fetchWithAuth<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(endpoint: string, data: unknown) => 
    fetchWithAuth<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string) => 
    fetchWithAuth<T>(endpoint, {
      method: 'DELETE',
    }),
}
\`\`\`

---

## Data Fetching Patterns

### Using SWR for Data Fetching

\`\`\`tsx
// hooks/use-students.ts
import useSWR from 'swr'
import { api } from '@/lib/api'

interface Student {
  id: string
  fullName: string
  username: string
  groupId: string
  groupName: string
  coins: number
  attendance: number
  paymentStatus: 'paid' | 'pending' | 'overdue'
}

interface StudentsResponse {
  data: Student[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useStudents(page = 1, limit = 10, groupId?: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(groupId && { groupId }),
  })

  const { data, error, isLoading, mutate } = useSWR<StudentsResponse>(
    `/students?${params}`,
    api.get
  )

  return {
    students: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useStudent(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Student>(
    id ? `/students/${id}` : null,
    api.get
  )

  return {
    student: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
\`\`\`

### Using in Components

\`\`\`tsx
// app/admin/students/page.tsx
'use client'

import { useState } from 'react'
import { useStudents } from '@/hooks/use-students'
import { DataTable } from '@/components/ui/data-table'
import { GlassButton } from '@/components/ui/glass-button'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const { students, pagination, isLoading, isError, refresh } = useStudents(page)

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load students</p>
        <GlassButton onClick={() => refresh()}>Retry</GlassButton>
      </div>
    )
  }

  const columns = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'groupName', label: 'Group' },
    { key: 'coins', label: 'Coins' },
    { key: 'paymentStatus', label: 'Payment' },
  ]

  return (
    <div>
      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        pagination={{
          currentPage: page,
          totalPages: pagination?.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
\`\`\`

---

## File Uploads

### Audio Upload

\`\`\`tsx
// lib/upload.ts
import { getApiUrl } from './config'

export async function uploadAudio(
  blob: Blob,
  metadata: {
    lessonId: string
    type: 'submission' | 'resource'
  }
): Promise<{ url: string; duration: number }> {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  
  formData.append('audio', blob, 'recording.webm')
  formData.append('lessonId', metadata.lessonId)
  formData.append('type', metadata.type)

  const response = await fetch(getApiUrl('/upload/audio'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  return response.json()
}

export async function uploadDocument(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('document', file)

  const response = await fetch(getApiUrl('/upload/document'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  return response.json()
}
\`\`\`

### Using Audio Upload in Components

\`\`\`tsx
// Example: Homework submission
import { AudioRecorder } from '@/components/ui/audio-recorder'
import { uploadAudio } from '@/lib/upload'
import { api } from '@/lib/api'

function HomeworkSubmission({ lessonId }: { lessonId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRecordingComplete(blob: Blob, duration: number) {
    setIsSubmitting(true)
    try {
      // Upload audio file
      const { url } = await uploadAudio(blob, {
        lessonId,
        type: 'submission',
      })

      // Create submission record
      await api.post('/submissions', {
        lessonId,
        audioUrl: url,
        duration,
      })

      // Success notification
      toast.success('Homework submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit homework')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AudioRecorder
      onRecordingComplete={handleRecordingComplete}
      disabled={isSubmitting}
    />
  )
}
\`\`\`

---

## Real-time Updates

### WebSocket Integration (Optional)

\`\`\`tsx
// lib/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  connect() {
    const token = localStorage.getItem('token')
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    
    this.ws = new WebSocket(`${wsUrl}/ws?token=${token}`)

    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      const handlers = this.listeners.get(type)
      handlers?.forEach((handler) => handler(data))
    }

    this.ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000)
    }
  }

  subscribe(event: string, handler: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export const wsService = new WebSocketService()
\`\`\`

### Using WebSocket for Live Updates

\`\`\`tsx
// hooks/use-live-submissions.ts
import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { wsService } from '@/lib/websocket'

export function useLiveSubmissions() {
  const { mutate } = useSWRConfig()

  useEffect(() => {
    const unsubscribe = wsService.subscribe('submission:new', () => {
      // Revalidate submissions data when new submission arrives
      mutate((key) => typeof key === 'string' && key.includes('/submissions'))
    })

    return unsubscribe
  }, [mutate])
}
\`\`\`

---

## Error Handling

### Global Error Boundary

\`\`\`tsx
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Something went wrong
          </h2>
          <p className="text-foreground/70 mb-6">
            {this.state.error?.message}
          </p>
          <GlassButton
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </GlassButton>
        </GlassCard>
      )
    }

    return this.props.children
  }
}
\`\`\`

### Toast Notifications

\`\`\`tsx
// lib/toast.ts
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  loading: (message: string) => sonnerToast.loading(message),
}
\`\`\`

---

## Expected API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups` | List all groups |
| GET | `/groups/:id` | Get group details |
| POST | `/groups` | Create new group |
| PUT | `/groups/:id` | Update group |
| DELETE | `/groups/:id` | Delete group |
| GET | `/groups/:id/students` | List group students |
| GET | `/groups/:id/lessons` | List group lessons |

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teachers` | List all teachers |
| GET | `/teachers/:id` | Get teacher details |
| POST | `/teachers` | Create teacher |
| PUT | `/teachers/:id` | Update teacher |
| DELETE | `/teachers/:id` | Delete teacher |
| GET | `/teachers/:id/groups` | Get teacher's groups |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List students |
| GET | `/students/:id` | Get student details |
| POST | `/students` | Create student |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |
| GET | `/students/:id/submissions` | Get submissions |
| GET | `/students/:id/attendance` | Get attendance |
| GET | `/students/:id/payments` | Get payments |

### Lessons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lessons` | List lessons |
| GET | `/lessons/:id` | Get lesson details |
| POST | `/lessons` | Create lesson |
| PUT | `/lessons/:id` | Update lesson |
| DELETE | `/lessons/:id` | Delete lesson |
| GET | `/lessons/:id/content` | Get Word content |
| POST | `/lessons/:id/audio` | Upload audio resource |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/submissions` | List submissions |
| GET | `/submissions/:id` | Get submission |
| POST | `/submissions` | Create submission |
| PATCH | `/submissions/:id/review` | Accept/reject |
| GET | `/submissions/:id/audio` | Get audio file |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendance` | List attendance |
| POST | `/attendance` | Mark attendance |
| PUT | `/attendance/:id` | Update attendance |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| POST | `/payments` | Record payment |
| PATCH | `/payments/:id/confirm` | Confirm cash payment |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get settings |
| PUT | `/settings` | Update settings |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard` | Get coin rankings |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/audio` | Upload audio file |
| POST | `/upload/document` | Upload document |

---

## Response Formats

### Success Response

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
\`\`\`

### Paginated Response

\`\`\`json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
\`\`\`

### Error Response

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
\`\`\`

---

## Backend Requirements

Your backend should implement:

1. **JWT Authentication** with access/refresh token pattern
2. **Role-based authorization** (admin, teacher, student)
3. **File storage** for audio files and documents
4. **Word document parsing** for lesson content preview
5. **Audio transcription** integration (for similarity checking)
6. **WebSocket support** (optional, for real-time updates)

### Recommended Tech Stack

- **Node.js/Express** or **Python/FastAPI** for API
- **PostgreSQL** for database
- **Redis** for caching and sessions
- **S3/MinIO** for file storage
- **Whisper API** for audio transcription
