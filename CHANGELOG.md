# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- PRD v3.0.0: Realistic goals, AI quality system, SRS algorithm
- 5 new database tables for AI quality & cost tracking
- Comprehensive folder reorganization plan
- Phase validation scripts (Phase 0-6)

---

## [0.2.1] - 2025-01-14

### Fixed
- Middleware cookie handling to prevent stream corruption [#11]

---

## [0.2.0] - 2025-01-13

### Added
- AI features database schema (migration 004)
  - `lessons.ai_processed` field
  - `lessons.ai_processed_at` field
  - `quizzes.ai_generated` field
- AI quiz generation API (`/api/admin/generate-quiz`)
- AI content processing API foundation

---

## [1.0.0] - 2025-01-13 (Task 1 완료)

### Added
- Authentication system re-enabled [PRD-0001]
- Supabase authentication middleware
- Protected routes for `/dashboard/*`
- Role-based access control (admin/trainer)

### Changed
- Middleware authentication logic restructured
- Cookie-based session management implemented

---

## [0.5.0] - 2025-01-12 (Phase 0.5)

### Added
- Task List generation workflow
- PRD-0001: AI-powered learning platform
- Task List template structure
- Phase 0.5 validation script

---

## [0.1.0] - 2025-01-10 (Initial Release)

### Added
- Next.js 14 App Router setup
- Supabase integration (PostgreSQL + Auth)
- Initial database schema (migrations 001-003)
- Basic dashboard layout
- Curriculum structure (7-day program)
- Lesson viewer component
- Quiz system foundation
- Points & leaderboard system
- E2E testing setup (Playwright)

### Infrastructure
- Vercel deployment configuration
- Environment variable validation
- GitHub Actions CI/CD
- Auto PR/merge workflow

---

## Release Notes Format

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.

---

**마지막 업데이트**: 2025-01-17
