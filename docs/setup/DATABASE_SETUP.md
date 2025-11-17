# 📊 Supabase 데이터베이스 설정 가이드

**GG Production 온보딩 플랫폼 - 데이터베이스 마이그레이션**

---

## 🎯 개요

7일 커리큘럼 학습 관리 시스템을 위한 완전한 데이터베이스 스키마입니다.

### 포함된 테이블:
- ✅ **profiles** - 사용자 프로필 확장
- ✅ **curriculum_days** - 7일 커리큘럼 구조
- ✅ **lessons** - 레슨 콘텐츠
- ✅ **user_progress** - 학습 진행률
- ✅ **quizzes** - 퀴즈 문제
- ✅ **quiz_attempts** - 퀴즈 시도 기록
- ✅ **achievements** - 업적 시스템
- ✅ **user_achievements** - 사용자별 업적

---

## 📋 사전 준비

1. **Supabase 프로젝트 ID 확인**
   ```
   프로젝트: cbvansmxutnogntbyswi
   URL: https://cbvansmxutnogntbyswi.supabase.co
   ```

2. **SQL Editor 접속**
   ```
   https://supabase.com/dashboard/project/cbvansmxutnogntbyswi/sql
   ```

---

## 🚀 Quick Start (빠른 설정)

### 방법 1: Supabase Dashboard에서 직접 실행

#### Step 1: 스키마 생성
1. Supabase Dashboard → **SQL Editor** 클릭
2. **New Query** 버튼 클릭
3. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. **RUN** 버튼 클릭 (Ctrl/Cmd + Enter)

#### Step 2: 초기 데이터 삽입
1. **New Query** 버튼 다시 클릭
2. `supabase/migrations/002_seed_data.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭

#### Step 3: 확인
```sql
-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 커리큘럼 데이터 확인
SELECT * FROM curriculum_days ORDER BY day_number;

-- 레슨 개수 확인
SELECT COUNT(*) FROM lessons;
```

---

## 🔧 방법 2: Supabase CLI 사용 (로컬 개발)

### Step 1: Supabase CLI 설치
```bash
npm install -g supabase
```

### Step 2: 로그인
```bash
supabase login
```

### Step 3: 프로젝트 링크
```bash
cd ggp-platform
supabase link --project-ref cbvansmxutnogntbyswi
```

### Step 4: 마이그레이션 실행
```bash
supabase db push
```

---

## 📊 데이터베이스 구조

### 1️⃣ **profiles** (사용자 프로필)
```sql
id              UUID PRIMARY KEY (auth.users 참조)
email           TEXT NOT NULL
full_name       TEXT
role            TEXT (trainee | trainer | admin)
department      TEXT
start_date      DATE
avatar_url      TEXT
points          INTEGER (기본값: 0)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**특징:**
- 회원가입 시 자동 생성 (트리거)
- 포인트 자동 업데이트 (레슨 완료 시)

---

### 2️⃣ **curriculum_days** (커리큘럼)
```sql
id              SERIAL PRIMARY KEY
day_number      INTEGER (1-7) UNIQUE
title           TEXT
description     TEXT
objectives      TEXT[]
duration_hours  INTEGER
order_index     INTEGER
is_active       BOOLEAN
```

**샘플 데이터:**
- Day 1-2: 포커 기초
- Day 3-4: 프로덕션 스킬
- Day 5-6: 실전 시뮬레이션
- Day 7: 최종 평가

---

### 3️⃣ **lessons** (레슨)
```sql
id                UUID PRIMARY KEY
day_id            INTEGER (curriculum_days 참조)
title             TEXT
content           TEXT (마크다운)
lesson_type       TEXT (theory | practical | quiz | video)
duration_minutes  INTEGER
order_index       INTEGER
points_reward     INTEGER
prerequisites     UUID[]
is_required       BOOLEAN
resources         JSONB
```

**레슨 타입:**
- `theory`: 이론 학습
- `practical`: 실습
- `quiz`: 퀴즈
- `video`: 비디오 콘텐츠

---

### 4️⃣ **user_progress** (진행률)
```sql
id                    UUID PRIMARY KEY
user_id               UUID (auth.users 참조)
lesson_id             UUID (lessons 참조)
status                TEXT (not_started | in_progress | completed | locked)
started_at            TIMESTAMPTZ
completed_at          TIMESTAMPTZ
time_spent_minutes    INTEGER
notes                 TEXT
```

**진행 상태:**
- `not_started`: 미시작
- `in_progress`: 진행 중
- `completed`: 완료
- `locked`: 잠김 (선수 레슨 미완료)

---

### 5️⃣ **quizzes** (퀴즈)
```sql
id              UUID PRIMARY KEY
lesson_id       UUID (lessons 참조)
question        TEXT
question_type   TEXT (multiple_choice | true_false | short_answer)
options         JSONB (선택지 배열)
correct_answer  TEXT
explanation     TEXT
points          INTEGER
order_index     INTEGER
```

**옵션 JSON 형식:**
```json
[
  {"id": "a", "text": "답변1", "is_correct": true},
  {"id": "b", "text": "답변2", "is_correct": false}
]
```

---

### 6️⃣ **quiz_attempts** (퀴즈 시도)
```sql
id              UUID PRIMARY KEY
user_id         UUID
quiz_id         UUID
user_answer     TEXT
is_correct      BOOLEAN
points_earned   INTEGER
attempted_at    TIMESTAMPTZ
feedback        TEXT
```

---

### 7️⃣ **achievements** (업적)
```sql
id                UUID PRIMARY KEY
name              TEXT UNIQUE
description       TEXT
icon              TEXT (이모지)
badge_color       TEXT (HEX 색상)
points_required   INTEGER
condition_type    TEXT (points | days_completed | perfect_score | speed)
condition_value   JSONB
```

**샘플 업적:**
- 🎯 첫 걸음 (첫 레슨 완료)
- ♠️ 포커 기초 마스터 (Day 1-2 완료)
- 🎬 프로덕션 전문가 (Day 3-4 완료)
- 🏆 현장 투입 인증 (최종 평가 통과)
- 💎 포인트 헌터 (500점)
- 👑 포인트 마스터 (1000점)

---

## 🔐 Row Level Security (RLS) 정책

### 기본 원칙:
1. **모든 사용자**: 커리큘럼/레슨 읽기 가능
2. **본인만**: 자신의 진행률/퀴즈 접근
3. **관리자/트레이너**: 모든 데이터 읽기 + 콘텐츠 수정
4. **관리자만**: 사용자 권한 수정

### 주요 정책:

#### profiles
- ✅ 모두 읽기 가능
- ✅ 본인 프로필 수정 가능
- ✅ 관리자는 모든 프로필 수정 가능

#### curriculum_days / lessons
- ✅ 모두 읽기 가능
- ✅ 관리자/트레이너만 수정 가능

#### user_progress
- ✅ 본인 것만 CRUD
- ✅ 관리자/트레이너는 모든 진행률 조회

#### quizzes / quiz_attempts
- ✅ 모두 읽기 가능
- ✅ 본인 시도만 기록 가능
- ✅ 관리자/트레이너는 모든 시도 조회

---

## 🎨 자동화 기능

### 1️⃣ **자동 프로필 생성**
```sql
-- 회원가입 시 자동으로 profiles 테이블에 레코드 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();
```

### 2️⃣ **자동 포인트 업데이트**
```sql
-- 레슨 완료 시 자동으로 포인트 적립
CREATE TRIGGER on_lesson_completed
  AFTER UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_points();
```

### 3️⃣ **updated_at 자동 갱신**
```sql
-- 모든 UPDATE 쿼리 시 updated_at 자동 업데이트
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ 설정 확인 체크리스트

### 1. 테이블 생성 확인
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과:**
- achievements
- curriculum_days
- lessons
- profiles
- quiz_attempts
- quizzes
- user_achievements
- user_progress

### 2. 초기 데이터 확인
```sql
-- 커리큘럼 7일 확인
SELECT day_number, title FROM curriculum_days ORDER BY day_number;

-- 레슨 개수 확인 (최소 20개 이상)
SELECT COUNT(*) as total_lessons FROM lessons;

-- 퀴즈 개수 확인
SELECT COUNT(*) as total_quizzes FROM quizzes;

-- 업적 개수 확인 (9개)
SELECT COUNT(*) as total_achievements FROM achievements;
```

### 3. RLS 정책 확인
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4. 트리거 확인
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## 🔄 마이그레이션 롤백 (필요시)

### 전체 테이블 삭제
```sql
-- ⚠️ 주의: 모든 데이터가 삭제됩니다!
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_days CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 트리거/함수도 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_user_points() CASCADE;
```

---

## 🐛 문제 해결

### 문제 1: "relation already exists" 에러
**해결:**
```sql
DROP TABLE IF EXISTS [테이블명] CASCADE;
-- 그 후 다시 CREATE TABLE 실행
```

### 문제 2: RLS 정책 충돌
**해결:**
```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "[정책명]" ON [테이블명];
-- 그 후 다시 CREATE POLICY 실행
```

### 문제 3: 트리거 중복 에러
**해결:**
```sql
DROP TRIGGER IF EXISTS [트리거명] ON [테이블명];
-- 그 후 다시 CREATE TRIGGER 실행
```

---

## 📚 다음 단계

데이터베이스 설정이 완료되면:

1. **API 엔드포인트 구현** (`/api/curriculum`, `/api/progress`)
2. **대시보드 실시간 데이터 연동**
3. **학습 진도 트래킹 UI 구현**
4. **퀴즈 시스템 구현**
5. **리더보드 구현**

---

## 🎓 샘플 쿼리

### 사용자 진행률 조회
```sql
SELECT
  cd.day_number,
  cd.title,
  COUNT(l.id) as total_lessons,
  COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_lessons
FROM curriculum_days cd
LEFT JOIN lessons l ON l.day_id = cd.id
LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = '[USER_ID]'
GROUP BY cd.id, cd.day_number, cd.title
ORDER BY cd.day_number;
```

### 리더보드 조회
```sql
SELECT
  p.full_name,
  p.points,
  COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.lesson_id END) as completed_lessons,
  RANK() OVER (ORDER BY p.points DESC) as rank
FROM profiles p
LEFT JOIN user_progress up ON up.user_id = p.id
WHERE p.role = 'trainee'
GROUP BY p.id, p.full_name, p.points
ORDER BY rank
LIMIT 10;
```

### 사용자별 업적 조회
```sql
SELECT
  a.name,
  a.description,
  a.icon,
  a.badge_color,
  ua.earned_at
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = '[USER_ID]'
ORDER BY ua.earned_at DESC;
```

---

**설정 완료 후 서버를 재시작하고 http://localhost:3003 에서 테스트하세요!**
