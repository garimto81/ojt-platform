# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Repository**: GG Production Knowledge Platform - Professional Poker Training Platform
**Framework**: Next.js 14 with App Router
**Database**: Supabase (PostgreSQL)
**AI Integration**: Google Gemini API
**PRD**: [tasks/prds/0001-prd-ai-powered-learning-platform.md](tasks/prds/0001-prd-ai-powered-learning-platform.md)

---

## 🎯 핵심 AI 기능 (Core AI Features)

이 플랫폼의 핵심 차별점은 **두 가지 AI 자동화 시스템**입니다:

### 1. 🤖 AI 콘텐츠 정리 시스템
**문제**: 트레이너가 "개떡같이" 입력한 비정형 콘텐츠
**해결**: AI가 "찰떡같이" 구조화하여 정리

**작동 방식**:
- 입력: 비정형/중복/불명확한 텍스트
- AI 처리: Gemini API로 자동 구조 분석 및 재구성
- 출력: 일관된 마크다운 포맷 + 학습 목표 + 핵심 개념 하이라이트

**구현 위치**:
- API: `/api/admin/process-content` (예정)
- UI: `/dashboard/admin/lessons/new` (TipTap 에디터)
- 데이터: `lessons.raw_content` → `lessons.content` (AI 처리)

**기대 효과**: 콘텐츠 작성 시간 70% 단축

### 2. 🎲 AI 랜덤 퀴즈 생성 시스템
**문제**: 퀴즈 수동 제작의 높은 시간 비용
**해결**: 정리된 콘텐츠 기반 무한 문제 생성

**작동 방식**:
- 입력: 정리된 레슨 콘텐츠
- AI 처리: 핵심 개념 추출 → 다양한 유형/난이도 문제 생성
- 출제: 매번 다른 문제 조합 (랜덤 풀에서 선택)

**구현 위치**:
- API: `/api/admin/generate-quiz` (기존)
- 랜덤 출제: `/api/quiz/[lessonId]` (개선 필요)
- 데이터: `quiz_pools` 테이블 (문제 풀 관리)

**기대 효과**: 퀴즈 제작 시간 90% 단축 + 무한 문제 변형

**⚠️ 개발 시 주의사항**:
- AI 기능은 모두 서버 사이드에서만 실행 (GEMINI_API_KEY 보안)
- 원본 콘텐츠 항상 보존 (`raw_content` 필드)
- AI 처리 실패 시 폴백 전략 필수
- 생성된 문제는 트레이너 검토 후 활성화

---

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build (runs check-env prebuild)
npm start                      # Start production server
npm run lint                   # Run ESLint

# Testing
npm test                       # Run Jest in watch mode
npm run test:ci                # Run Jest in CI mode (no watch)

# Environment Setup
npm run check-env              # Validate environment variables
npm run setup:supabase         # Interactive Supabase config setup
npm run setup:vercel           # Interactive Vercel env setup
```

### Database Commands
```bash
npm run db:seed                # Seed database with sample content

# Manual Supabase migrations (requires Supabase CLI)
cd supabase
supabase login
supabase link --project-ref [YOUR-PROJECT-REF]
supabase db push               # Apply migrations to remote
```

---

## Architecture Overview

### Core Structure
```
Next.js App Router (SSR + Client Components)
├── Server Components (default)    # Direct Supabase access via server client
├── Client Components ('use client') # Supabase access via browser client
├── API Routes (/api/*)            # Backend endpoints for mutations
└── Middleware                     # Auth guard + route protection
```

### Authentication Flow
1. **Middleware** (`src/middleware.ts`): Validates all requests, checks Supabase auth
2. **Protected Routes**: `/dashboard/*` requires authentication
3. **Role-Based Access**: Admin/Trainer have additional `/dashboard/admin/*` access
4. **Supabase Clients**:
   - `src/lib/supabase/server.ts`: Server Components & API Routes (SSR)
   - `src/lib/supabase/client.ts`: Client Components (browser)

### Key Design Patterns

#### 1. Dual Supabase Client Pattern
- **Server Client**: Used in Server Components, API Routes, Middleware
  - Access via `createClient()` from `@/lib/supabase/server`
  - Cookie-based session management
  - Direct database access without CORS

- **Browser Client**: Used in Client Components
  - Access via `createClient()` from `@/lib/supabase/client`
  - Client-side auth state management
  - Used for real-time subscriptions

**Critical**: Always import the correct client for your context. Server imports fail in client components and vice versa.

#### 2. Progressive Curriculum System
- 7-day curriculum structure (`curriculum_days` table)
- Each day contains multiple lessons (`lessons` table)
- User progress tracked per lesson (`user_progress` table)
- Prerequisites system prevents skipping ahead

#### 3. AI Quiz Generation & Random Quiz System
**두 단계 AI 프로세스**:

**A. 콘텐츠 정리 (예정)**
- 트레이너가 입력한 비정형 텍스트를 AI가 구조화
- 학습 목표 자동 추출, 핵심 개념 하이라이트
- API: `/api/admin/process-content` (개발 예정)

**B. 퀴즈 자동 생성**
- 정리된 레슨 콘텐츠에서 AI가 문제 생성
- Google Gemini API로 다양한 유형/난이도 문제 생성
- API: `/api/admin/generate-quiz` (POST) - 기존
- 생성된 문제는 `quiz_pools`에 저장 (문제 풀)

**C. 랜덤 출제 시스템** (핵심 차별점)
- 매 시도마다 퀴즈 풀에서 다른 문제 선택
- 학습자 수준별 난이도 자동 조절
- 틀린 문제 우선 재출제 (복습 강화)
- 암기 방지: 동일 개념도 다른 문제로 테스트

**보안**:
- GEMINI_API_KEY는 서버 사이드에서만 사용 (lazy initialization)
- 퀴즈 정답은 클라이언트 노출 차단 (서버 검증만)

#### 4. Points & Gamification
- Automatic point accumulation via database triggers
- Leaderboard system with historical snapshots
- Achievement badges (condition-based)

---

## Database Schema Key Concepts

### Core Tables
```sql
profiles              # User accounts (extends auth.users)
├── role              # trainee | trainer | admin
└── points            # Accumulated from quiz attempts

curriculum_days       # 7-day program structure
└── lessons           # Individual lesson content
    ├── content       # Markdown formatted
    ├── lesson_type   # theory | practical | quiz | video
    └── prerequisites # UUID[] of required lessons

user_progress         # Per-user, per-lesson tracking
├── status            # not_started | in_progress | completed | locked
└── time_spent_minutes

quizzes               # AI-generated or manual
├── question_type     # multiple_choice | true_false | short_answer
├── options           # JSONB: [{id, text, is_correct}]
└── correct_answer

quiz_attempts         # Student submissions
├── is_correct
└── points_earned     # Triggers update profiles.points
```

### RLS (Row Level Security)
- Enabled on all tables
- Users can read own progress, all public lessons
- Only admin/trainer can write lessons/quizzes
- Service role key bypasses RLS (use cautiously)

---

## File Structure Reference

### Critical Paths
```
src/
├── app/
│   ├── api/                        # Backend endpoints
│   │   ├── admin/generate-quiz/    # AI quiz generation
│   │   ├── quiz/[lessonId]/        # Fetch quiz questions
│   │   ├── quiz/submit/            # Submit quiz answers
│   │   └── progress/               # Update user progress
│   ├── dashboard/
│   │   ├── layout.tsx              # Main app layout with sidebar
│   │   ├── learning/[lessonId]/    # Lesson viewer + quiz
│   │   └── admin/                  # Admin-only pages
│   ├── auth/callback/              # OAuth callback handler
│   └── middleware.ts               # Auth guard
├── components/
│   ├── editor/rich-editor.tsx      # TipTap markdown editor
│   └── ui/                         # Shadcn UI components
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-side client
│   │   └── client.ts               # Browser client
│   └── types/database.types.ts     # Full type definitions
└── middleware.ts                   # Route protection

supabase/migrations/
├── 001_initial_schema.sql          # Main schema
├── 002_seed_data.sql               # Sample curriculum
└── 003_sample_lesson_content.sql   # Lesson content
```

### Path Aliases
- `@/*` → `./src/*` (configured in `tsconfig.json`)

---

## Environment Variables

### Required Variables
```bash
# Supabase (Required for all functionality)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Production only

# Database (Alternative connection)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:6543/postgres

# AI (Required only for quiz generation)
GEMINI_API_KEY=AIza...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Environment Variable Validation
- **Automatic**: Runs on every build via `prebuild` script
- **Manual**: Run `npm run check-env` anytime
- **Critical**: Supabase credentials are validated at runtime in middleware, server.ts, and client.ts
- **Key Format Validation**: Anon keys must start with `eyJ` (JWT format)

---

## UI/UX Guidelines

### Design System
- **Theme**: WSOP/GG Production brand (Red #DA1F26, Black, Gold)
- **Components**: Shadcn UI + Radix UI primitives
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom theme (`tailwind.config.ts`)

### Color Classes
```css
.bg-ggp-primary      /* Primary brand red */
.bg-ggp-secondary    /* Secondary accent */
.bg-wsop-red         /* WSOP red variant */
```

### Layout Pattern
- Sidebar navigation (desktop: always visible, mobile: drawer)
- Top bar with breadcrumbs, notifications, user avatar
- Points display in header
- Role-based menu items (admin section conditional)

---

## Common Development Tasks

### Adding a New Lesson Page
1. Content is markdown stored in `lessons.content`
2. Lessons are rendered in `/dashboard/learning/[lessonId]/page.tsx`
3. Progress tracking auto-updates via API call to `/api/progress`

### Creating New API Routes
```typescript
// Example: src/app/api/example/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Always verify auth
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your logic here
}
```

### Testing Quiz Generation
1. Create lesson with substantial markdown content
2. Navigate to `/dashboard/admin/quizzes`
3. Select lesson, click "Generate Quiz"
4. Review generated questions (requires GEMINI_API_KEY)

---

## Deployment

### Vercel (Recommended)
```bash
# Option 1: Automated setup
npm run setup:vercel

# Option 2: Manual via Vercel dashboard
# Add all environment variables from .env.example
# Enable automatic deployments from main branch
```

### Supabase Redirect URLs
After deploying, add your production URL to Supabase:
```
Supabase Dashboard → Authentication → URL Configuration
→ Add to Redirect URLs:
  - https://your-domain.vercel.app/auth/callback
  - https://your-domain.vercel.app/**
```

### Pre-Deployment Checklist
- [ ] Run `npm run check-env` locally
- [ ] Verify database migrations applied to production Supabase
- [ ] Add all env vars to Vercel (especially SUPABASE_SERVICE_ROLE_KEY)
- [ ] Test build locally: `npm run build`
- [ ] Configure Supabase redirect URLs with production domain

---

## Debugging Tips

### Common Issues

**1. "Missing Supabase environment variables"**
- Check `.env.local` exists and has correct values
- Verify keys start with `eyJ` (JWT format)
- Run `npm run check-env` for detailed diagnostics
- Check `/debug/env-check` page in browser for client-side validation

**2. Authentication loops / redirects**
- Clear browser cookies
- Check Supabase redirect URLs include your domain
- Verify middleware.ts is not blocking auth callback route

**3. "Unauthorized" errors**
- Check user role in database: `profiles.role` must be 'admin' or 'trainer' for admin routes
- Verify RLS policies allow the operation
- Check if SUPABASE_SERVICE_ROLE_KEY is set (for admin operations)

**4. Quiz generation fails**
- Ensure GEMINI_API_KEY is set and valid
- Verify lesson has content (not empty markdown)
- Check API logs for Gemini API errors

### Diagnostic Pages
- `/debug/env-check` - Client-side environment variable validation
- `/api/debug/env-check` - Server-side environment diagnostics (detailed logging)

---

## Tech Stack Details

### Frontend
- **Next.js 14**: App Router with React Server Components
- **TypeScript 5.3**: Strict mode enabled
- **Tailwind CSS 3.3**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **TipTap**: Rich text editor for lesson content
- **React Markdown**: Markdown rendering for lesson display

### Backend
- **Supabase**: PostgreSQL database, Auth, Real-time
- **API Routes**: RESTful endpoints (Next.js route handlers)
- **Row Level Security**: Database-level authorization

### AI
- **Google Gemini**: `@google/generative-ai` library
- **Model**: Uses Gemini Pro for quiz generation
- **JSON Output**: Structured responses parsed into quiz format

---

## Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Follow ESLint configuration (`npm run lint`)
- Use `@/` path alias for imports
- Server Components by default, add `'use client'` only when needed

### Database Changes
1. Create migration in `supabase/migrations/`
2. Test locally with `supabase db reset`
3. Push to production: `supabase db push`

### Component Guidelines
- Place reusable UI components in `src/components/ui/`
- Feature-specific components in `src/components/`
- Use Shadcn UI conventions for consistency

---

## Security Notes

- Never commit `.env.local` or `.env.production`
- SUPABASE_SERVICE_ROLE_KEY bypasses RLS - use only in trusted server contexts
- GEMINI_API_KEY validated lazily only when quiz generation is requested
- All API routes must verify user authentication
- Role checks required for admin/trainer operations

---

**Last Updated**: 2025-01-13
**Version**: 1.0.0
