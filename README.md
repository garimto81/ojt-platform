# 🎓 GG Production Knowledge Platform

**Professional Poker Training Platform with AI-Powered Quiz Generation**

A comprehensive learning management system built for GG Production's poker training program, featuring a 7-day structured curriculum, AI-generated assessments, and gamified learning progression.

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange)

---

## ✨ Key Features

### 🎯 For Learners
- **7-Day Structured Curriculum** - Progressive learning from poker basics to advanced strategies
- **Interactive Lessons** - Rich markdown content with multimedia support
- **AI-Generated Quizzes** - Adaptive assessments based on lesson content
- **Points & Leaderboard** - Gamified learning with competitive rankings
- **Progress Tracking** - Real-time statistics and completion tracking
- **Mobile-Responsive** - Learn anywhere on any device

### 👨‍💼 For Administrators
- **Content Management** - Easy-to-use lesson editor with markdown support
- **AI Quiz Generator** - Automatically create quizzes from lesson content using GPT-4o
- **User Management** - Role-based access control (Admin, Trainer, Trainee)
- **Analytics Dashboard** - Track student progress and engagement

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with WSOP brand theme
- **Lucide Icons** - Modern icon library
- **React Markdown** - Rich content rendering

### Backend
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level authorization
- **Server Components** - Optimized server-side rendering
- **API Routes** - RESTful endpoints for data mutations

### AI Integration
- **OpenAI GPT-4o** - Intelligent quiz generation
- **Structured JSON Output** - Reliable, parseable responses
- **Context-Aware** - Generates questions based on lesson content

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Quick Start

> **⚠️ 중요**: 현재 `.env.local`에 더미(가짜) Supabase 설정이 있습니다.
> 로그인/회원가입이 작동하지 않으므로 **실제 Supabase 프로젝트**를 생성하고 설정해야 합니다.
> 아래 "방법 1"의 `npm run setup:supabase`를 사용하거나 [Supabase](https://supabase.com)에서 프로젝트를 생성하세요.

#### 방법 1: 자동 설정 (권장) ⚡

```bash
# Clone repository
git clone [your-repo-url]
cd ggp-platform

# Install dependencies
npm install

# Supabase 환경 변수 자동 설정
npm run setup:supabase
# → Supabase 정보를 입력하면 .env.local 자동 생성

# 환경 변수 확인
npm run check-env

# Start development server
npm run dev
```

#### 방법 2: 수동 설정

```bash
# Clone repository
git clone [your-repo-url]
cd ggp-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Check environment variables
npm run check-env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

📖 **빠른 시작 가이드**: [QUICK_START.md](./QUICK_START.md)

---

## 🗄️ Database Schema

```sql
profiles              # User accounts and roles
├── curriculum_days   # 7-day program structure
│   └── lessons       # Individual lesson content
│       ├── user_progress      # Completion tracking
│       └── quizzes           # AI-generated questions
│           └── quiz_attempts # Student submissions
├── leaderboard_snapshots     # Historical rankings
└── achievements              # Badges and milestones
```

**Key Features:**
- ✅ Automatic profile creation on signup
- ✅ Trigger-based point accumulation
- ✅ RLS policies for security
- ✅ Optimized indexes for performance

---

## 🎨 UI/UX Highlights

### WSOP Brand Identity
- **Color Palette**: Red (#DA1F26), Black, Gold accents
- **Typography**: Inter font family
- **Design Language**: Bold, professional, competitive

### Responsive Design
- Mobile-first approach
- Adaptive layouts for tablets and desktop
- Touch-optimized interactions

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support

---

## 🤖 AI Quiz Generation

### How It Works

1. **Admin creates lesson content** in markdown
2. **Click "Generate Quiz"** button
3. **GPT-4o analyzes content** and extracts key concepts
4. **Generates 5-20 questions** with:
   - Multiple choice (4 options)
   - True/False statements
   - Short answer questions
5. **Admin reviews** and activates questions
6. **Students take quizzes** and earn points

### Prompt Engineering

The AI system uses a carefully crafted prompt that:
- Understands poker training context
- Generates educational, clear questions
- Provides detailed explanations
- Assigns appropriate difficulty points
- Outputs structured JSON for reliability

---

## 📊 Project Structure

```
ggp-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Main application
│   │   │   ├── learning/       # Curriculum pages
│   │   │   ├── admin/          # Admin tools
│   │   │   └── profile/        # User settings
│   │   └── api/                # Backend endpoints
│   │       ├── quiz/           # Quiz operations
│   │       ├── progress/       # Learning tracking
│   │       └── admin/          # Admin APIs
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Database clients
│   │   └── types/              # TypeScript definitions
│   └── styles/                 # Global styles
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
└── docs/                       # Documentation
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Connect your GitHub repository
3. Add environment variables
4. Deploy! 🎉

---

## 🔐 Security

- **Environment Variables** - Secrets never committed to git
- **Row Level Security** - Database policies protect user data
- **Role-Based Access** - Admin, Trainer, Trainee permissions
- **API Authentication** - Supabase Auth with JWT
- **Input Validation** - Server-side validation for all mutations

---

## 📈 Roadmap

### Phase 1: MVP (✅ Complete)
- [x] User authentication
- [x] 7-day curriculum
- [x] Lesson content pages
- [x] Quiz system
- [x] AI quiz generation
- [x] Leaderboard
- [x] Admin content management

### Phase 2: Enhancement (🚧 In Progress)
- [ ] Real-time notifications
- [ ] Achievement badges
- [ ] Video lesson support
- [ ] Discussion forums
- [ ] Mobile app (React Native)

### Phase 3: Advanced (📋 Planned)
- [ ] Live training sessions
- [ ] Peer review system
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for integrations

---

## 🌐 환경 변수 & 배포

### 환경 변수 확인

프로젝트는 환경 변수 검증 스크립트를 제공합니다:

```bash
# 환경 변수 설정 확인
npm run check-env
```

### 필수 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 서비스 역할 키 (프로덕션)
- `GEMINI_API_KEY` - Google Gemini API 키
- `NEXT_PUBLIC_APP_URL` - 애플리케이션 URL

### Vercel 배포

#### ⚡ CLI 자동 설정 (가장 빠름)

```bash
# 1. Vercel 로그인
vercel login

# 2. Vercel 환경 변수 자동 설정
npm run setup:vercel
# → 대화형으로 Supabase & Gemini 정보 입력
# → Vercel Production/Preview 환경 변수 자동 설정

# 3. Supabase Redirect URLs 설정
# → Supabase Dashboard에서 Vercel 도메인 추가

# 4. 배포
git push origin main
```

#### 🔧 수동 설정

1. **Vercel에 환경 변수 추가**
   - Vercel 대시보드 → Settings → Environment Variables
   - 모든 필수 환경 변수 추가

2. **Supabase 리디렉션 URL 설정**
   - Supabase → Authentication → URL Configuration
   - Vercel 도메인을 Redirect URLs에 추가

3. **배포**
   ```bash
   git push origin main
   # 또는 Vercel CLI 사용
   vercel deploy --prod
   ```

📖 **상세 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) - 완전한 배포 가이드

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines including:

- Development environment setup
- Code style and conventions
- Pull request process
- Testing requirements
- Commit message rules

Quick start:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by GG Production.

---

## 🙋‍♂️ Support

For questions or issues:

- 📧 Email: support@ggproduction.com
- 💬 Discord: [Join our community](https://discord.gg/ggprod)
- 📖 Docs: [Full documentation](https://docs.ggproduction.com)

---

## 🎯 About GG Production

GG Production is a leading poker training organization dedicated to developing professional poker players through structured, evidence-based training programs.

**Website**: [www.ggproduction.com](https://www.ggproduction.com)

---

**Built with ❤️ by the GG Production Team**

**Version**: 0.2.1 | **Status**: Active Development | **Last Updated**: 2025-01-17

---

## 📚 Documentation

### 🚀 Quick Start & Setup
- [QUICK_START.md](./QUICK_START.md) - 20-minute setup guide
- [.env.example](./.env.example) - Environment variable template

### 💻 Development
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow, migrations, PR automation
- [CLAUDE.md](./CLAUDE.md) - Development guide for Claude Code
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

### 🚀 Deployment & Testing
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel deployment guide
- [TESTING.md](./TESTING.md) - Unit, E2E, performance testing

### 🆘 Troubleshooting & Reference
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [PRD v3.0.0](./tasks/prds/0001-prd-ai-powered-learning-platform.md) - Product Requirements

### 📂 Archive
- [docs/archive/](./docs/archive/) - Legacy documentation (organized by category)
