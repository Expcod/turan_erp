# TuranTalim ERP Frontend

A comprehensive Education Resource Planning (ERP) system frontend built with Next.js 15, featuring Admin, Teacher, and Student panels with a beautiful blue/yellow color scheme and macOS Tahoe Liquid Glass UI design.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Panels Overview](#panels-overview)
- [Component Library](#component-library)
- [Internationalization](#internationalization)
- [Backend Integration](#backend-integration)
- [API Reference](#api-reference)

---

## Features

### Admin Panel
- Dashboard with statistics and analytics
- Group management (CRUD operations)
- Teacher management with credentials
- Student management with coin tracking
- Lesson management with Word document preview
- Payment tracking and confirmation
- System settings (similarity threshold, coins, deadlines)

### Teacher Panel
- Calendar view (monthly/weekly)
- Lesson management with attendance tracking
- Student progress monitoring
- Homework submission review with audio playback
- Accept/Reject submissions with feedback

### Student Panel
- Dashboard with current lesson and stats
- Lesson access with Word preview and audio resources
- Homework submission with audio recording
- Submission history with status tracking
- Leaderboard with coin rankings
- Payment history
- Attendance records
- Profile management

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom Glass UI + shadcn/ui
- **State Management:** React Context API
- **Internationalization:** Custom i18n (Uzbek & Turkish)
- **Icons:** Lucide React

---

## Project Structure

\`\`\`
├── app/
│   ├── admin/                 # Admin panel pages
│   │   ├── groups/           # Group management
│   │   ├── teachers/         # Teacher management
│   │   ├── students/         # Student management
│   │   ├── lessons/          # Lesson management
│   │   ├── payments/         # Payment tracking
│   │   └── settings/         # System settings
│   ├── teacher/              # Teacher panel pages
│   │   ├── calendar/         # Calendar view
│   │   ├── lessons/          # Lesson & attendance
│   │   ├── students/         # Student tracking
│   │   └── submissions/      # Homework review
│   ├── student/              # Student panel pages
│   │   ├── lessons/          # Lesson access & homework
│   │   ├── submissions/      # Submission history
│   │   ├── leaderboard/      # Rankings
│   │   ├── payments/         # Payment history
│   │   ├── attendance/       # Attendance records
│   │   └── profile/          # Profile settings
│   ├── login/                # Authentication
│   ├── forgot-password/      # Password recovery
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── layouts/              # Panel layouts
│   │   ├── admin-layout.tsx
│   │   ├── teacher-layout.tsx
│   │   └── student-layout.tsx
│   ├── ui/                   # Reusable UI components
│   │   ├── glass-button.tsx  # macOS Liquid Glass buttons
│   │   ├── glass-card.tsx    # Glass morphism cards
│   │   ├── glass-input.tsx   # Styled inputs
│   │   ├── glass-select.tsx  # Styled selects
│   │   ├── glass-textarea.tsx
│   │   ├── data-table.tsx    # Data table with pagination
│   │   ├── modal.tsx         # Modal dialogs
│   │   ├── calendar.tsx      # Calendar component
│   │   ├── calendar-view.tsx # Full calendar view
│   │   ├── audio-recorder.tsx# Audio recording
│   │   ├── audio-player.tsx  # Audio playback
│   │   ├── word-preview.tsx  # Word document preview
│   │   ├── file-upload.tsx   # File upload
│   │   ├── stat-card.tsx     # Statistics cards
│   │   ├── status-badge.tsx  # Status indicators
│   │   ├── progress-bar.tsx  # Progress visualization
│   │   ├── lesson-card.tsx   # Lesson display
│   │   ├── attendance-table.tsx
│   │   └── homework-review-card.tsx
│   └── language-switcher.tsx # Language toggle
├── lib/
│   ├── i18n.tsx              # Internationalization
│   ├── user-context.tsx      # User state management
│   └── locales/
│       ├── uz.json           # Uzbek translations
│       └── tr.json           # Turkish translations
└── public/                   # Static assets
\`\`\`

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-repo/turantalim-erp.git

# Navigate to project
cd turantalim-erp

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.turantalim.com
NEXT_PUBLIC_API_VERSION=v1

# Authentication
NEXT_PUBLIC_AUTH_COOKIE_NAME=turantalim_token
JWT_SECRET=your-jwt-secret-key

# File Storage (for audio/documents)
NEXT_PUBLIC_STORAGE_URL=https://storage.turantalim.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
\`\`\`

---

## Panels Overview

### Accessing Panels

| Panel   | URL Path    | Description                    |
|---------|-------------|--------------------------------|
| Admin   | `/admin`    | Full system management         |
| Teacher | `/teacher`  | Teaching & grading interface   |
| Student | `/student`  | Learning & submission portal   |

### Role-Based Access

The application uses role-based access control. After login, users are redirected to their respective panels based on their role.

---

## Component Library

### Glass UI Components

All components follow the macOS Tahoe Liquid Glass design language.

#### GlassButton

\`\`\`tsx
import { GlassButton } from "@/components/ui/glass-button"

// Variants: default, outline, ghost, destructive
<GlassButton variant="default" size="md">
  Click Me
</GlassButton>

// With icon
<GlassButton>
  <PlusIcon className="w-4 h-4 mr-2" />
  Add Item
</GlassButton>

// Loading state
<GlassButton loading>
  Saving...
</GlassButton>
\`\`\`

#### GlassCard

\`\`\`tsx
import { GlassCard } from "@/components/ui/glass-card"

<GlassCard className="p-6">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</GlassCard>
\`\`\`

#### GlassInput

\`\`\`tsx
import { GlassInput } from "@/components/ui/glass-input"

<GlassInput
  label="Email"
  type="email"
  placeholder="Enter email"
  error="Invalid email format"
/>
\`\`\`

#### DataTable

\`\`\`tsx
import { DataTable } from "@/components/ui/data-table"

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
]

<DataTable
  columns={columns}
  data={users}
  onRowClick={(row) => console.log(row)}
/>
\`\`\`

#### Modal

\`\`\`tsx
import { Modal } from "@/components/ui/modal"

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <GlassButton onClick={handleConfirm}>Confirm</GlassButton>
</Modal>
\`\`\`

#### AudioRecorder

\`\`\`tsx
import { AudioRecorder } from "@/components/ui/audio-recorder"

<AudioRecorder
  onRecordingComplete={(blob, duration) => {
    // Handle recorded audio
    uploadAudio(blob)
  }}
  maxDuration={300} // 5 minutes
/>
\`\`\`

#### AudioPlayer

\`\`\`tsx
import { AudioPlayer } from "@/components/ui/audio-player"

<AudioPlayer
  src="/audio/lesson-1.mp3"
  title="Lesson Audio"
/>
\`\`\`

---

## Internationalization

The application supports Uzbek (uz) and Turkish (tr) languages.

### Using Translations

\`\`\`tsx
import { useTranslation } from "@/lib/i18n"

function MyComponent() {
  const { t, locale, setLocale } = useTranslation()
  
  return (
    <div>
      <h1>{t("dashboard")}</h1>
      <p>{t("welcome")}</p>
      
      {/* Switch language */}
      <button onClick={() => setLocale("tr")}>
        Türkçe
      </button>
    </div>
  )
}
\`\`\`

### Adding New Translations

Edit the locale files in `lib/locales/`:

\`\`\`json
// lib/locales/uz.json
{
  "newKey": "Yangi matn"
}

// lib/locales/tr.json
{
  "newKey": "Yeni metin"
}
\`\`\`

---

## Backend Integration

See [BACKEND_INTEGRATION.md](./docs/BACKEND_INTEGRATION.md) for detailed integration guide.

### Quick Start

1. Create an API service file:

\`\`\`tsx
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchWithAuth(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}
\`\`\`

2. Use in components:

\`\`\`tsx
import useSWR from 'swr'
import { fetchWithAuth } from '@/lib/api'

function StudentsList() {
  const { data, error, isLoading } = useSWR(
    '/api/students',
    fetchWithAuth
  )
  
  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return <DataTable data={data} columns={columns} />
}
\`\`\`

---

## API Reference

See [API_REFERENCE.md](./docs/API_REFERENCE.md) for complete API documentation.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.
