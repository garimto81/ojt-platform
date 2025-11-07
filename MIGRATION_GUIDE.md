# 🚀 Supabase 마이그레이션 실행 가이드

**빠른 시작: 복사 & 붙여넣기 방식**

---

## 📋 Step 1: Supabase SQL Editor 접속

1. 브라우저에서 접속:
   ```
   https://supabase.com/dashboard/project/cbvansmxutnogntbyswi/sql
   ```

2. **New Query** 버튼 클릭

---

## 🔧 Step 2: 스키마 생성 (001_initial_schema.sql)

### 2-1. SQL 파일 열기
```
파일 경로: ggp-platform/supabase/migrations/001_initial_schema.sql
```

### 2-2. 전체 내용 복사
- **Ctrl+A** (전체 선택)
- **Ctrl+C** (복사)

### 2-3. SQL Editor에 붙여넣기
- SQL Editor 창에 **Ctrl+V** (붙여넣기)

### 2-4. 실행
- **RUN** 버튼 클릭 또는 **Ctrl+Enter**

### 2-5. 성공 확인
실행 후 하단에 다음과 같은 메시지가 표시되어야 합니다:
```
Success. No rows returned
```

또는 각 테이블 생성마다:
```
CREATE TABLE
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
CREATE POLICY
```

---

## 📊 Step 3: 초기 데이터 삽입 (002_seed_data.sql)

### 3-1. 새 쿼리 생성
- **New Query** 버튼 다시 클릭

### 3-2. SQL 파일 열기
```
파일 경로: ggp-platform/supabase/migrations/002_seed_data.sql
```

### 3-3. 전체 내용 복사 & 붙여넣기
- **Ctrl+A** → **Ctrl+C** → SQL Editor에 **Ctrl+V**

### 3-4. 실행
- **RUN** 버튼 클릭 또는 **Ctrl+Enter**

### 3-5. 성공 확인
실행 후 다음과 같은 메시지가 표시됩니다:
```
✅ 데이터베이스 초기화 완료!
📚 7일 커리큘럼 생성됨
📝 샘플 레슨 및 퀴즈 생성됨
🏆 업적 시스템 설정됨
```

---

## ✅ Step 4: 마이그레이션 확인

### 4-1. 테이블 목록 확인
새 쿼리에서 실행:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과:** (8개 테이블)
```
achievements
curriculum_days
lessons
profiles
quiz_attempts
quizzes
user_achievements
user_progress
```

### 4-2. 커리큘럼 데이터 확인
```sql
SELECT day_number, title, description
FROM curriculum_days
ORDER BY day_number;
```

**예상 결과:** 7개 행
```
1 | Day 1: 포커 기초 - 룰과 구조 | ...
2 | Day 2: 포커 기초 - 용어와 전략 | ...
3 | Day 3: 프로덕션 스킬 - 장비와 시스템 | ...
4 | Day 4: 프로덕션 스킬 - 라이브 운영 | ...
5 | Day 5: 실전 시뮬레이션 - 준비 | ...
6 | Day 6: 실전 시뮬레이션 - 실행 | ...
7 | Day 7: 최종 평가 | ...
```

### 4-3. 레슨 개수 확인
```sql
SELECT COUNT(*) as total_lessons FROM lessons;
```

**예상 결과:**
```
total_lessons: 20+ (최소 20개 이상)
```

### 4-4. 퀴즈 개수 확인
```sql
SELECT COUNT(*) as total_quizzes FROM quizzes;
```

**예상 결과:**
```
total_quizzes: 5+ (Day 1 퀴즈 5문제)
```

### 4-5. 업적 개수 확인
```sql
SELECT name, icon, badge_color FROM achievements ORDER BY created_at;
```

**예상 결과:** 9개 업적
```
첫 걸음           🎯 #D4AF37
포커 기초 마스터  ♠️ #ED1C24
프로덕션 전문가   🎬 #D4AF37
실전 준비 완료    🔥 #ED1C24
현장 투입 인증    🏆 #D4AF37
포인트 헌터       💎 #1565C0
포인트 마스터     👑 #D4AF37
완벽주의자        ⭐ #ED1C24
스피드러너        ⚡ #F57C00
```

### 4-6. RLS 정책 확인
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**예상 결과:** 15+ 정책

### 4-7. 트리거 확인
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**예상 결과:**
- on_auth_user_created (auth.users)
- update_profiles_updated_at (profiles)
- update_curriculum_days_updated_at (curriculum_days)
- update_lessons_updated_at (lessons)
- update_user_progress_updated_at (user_progress)
- on_lesson_completed (user_progress)

---

## 🧪 Step 5: 테스트 쿼리 실행

### 5-1. Day별 레슨 통계
```sql
SELECT
  cd.day_number,
  cd.title,
  COUNT(l.id) as lesson_count,
  SUM(l.points_reward) as total_points
FROM curriculum_days cd
LEFT JOIN lessons l ON l.day_id = cd.id
GROUP BY cd.id, cd.day_number, cd.title
ORDER BY cd.day_number;
```

### 5-2. 레슨 타입별 분류
```sql
SELECT
  lesson_type,
  COUNT(*) as count,
  AVG(duration_minutes) as avg_duration
FROM lessons
GROUP BY lesson_type
ORDER BY count DESC;
```

### 5-3. 샘플 레슨 상세 조회
```sql
SELECT
  l.title,
  l.lesson_type,
  l.duration_minutes,
  l.points_reward,
  cd.day_number,
  cd.title as day_title
FROM lessons l
JOIN curriculum_days cd ON cd.id = l.day_id
WHERE cd.day_number = 1
ORDER BY l.order_index;
```

---

## 🐛 문제 해결

### 문제 1: "relation already exists" 에러
**원인:** 테이블이 이미 존재

**해결:**
```sql
-- 기존 테이블 삭제 (⚠️ 데이터 손실 주의!)
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_days CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 그 후 001_initial_schema.sql 다시 실행
```

### 문제 2: "function already exists" 에러
**원인:** 함수가 이미 존재

**해결:**
```sql
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_user_points() CASCADE;

-- 그 후 001_initial_schema.sql 다시 실행
```

### 문제 3: "policy already exists" 에러
**원인:** RLS 정책이 이미 존재

**해결:**
```sql
-- 특정 테이블의 모든 정책 삭제
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- ... (모든 정책 삭제)

-- 또는 전체 초기화
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 그 후 001_initial_schema.sql 다시 실행
```

### 문제 4: 데이터 삽입 실패
**원인:** 외래 키 제약 조건

**확인:**
```sql
-- curriculum_days가 먼저 생성되었는지 확인
SELECT * FROM curriculum_days;

-- lessons가 curriculum_days를 참조하는지 확인
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';
```

**해결:** 001_initial_schema.sql을 먼저 완전히 실행한 후 002_seed_data.sql 실행

---

## 🎉 완료 확인

모든 단계가 성공하면:

✅ **8개 테이블 생성됨**
✅ **7일 커리큘럼 데이터 삽입됨**
✅ **20+ 레슨 생성됨**
✅ **5+ 퀴즈 생성됨**
✅ **9개 업적 생성됨**
✅ **RLS 정책 활성화됨**
✅ **자동화 트리거 작동 중**

---

## 📱 다음 단계

마이그레이션 완료 후:

1. **테스트 사용자 생성**
   - 앱에서 회원가입
   - `profiles` 테이블에 자동 생성 확인

2. **학습 진행 테스트**
   - Day 1 레슨 시작
   - `user_progress` 테이블에 기록 확인

3. **포인트 시스템 테스트**
   - 레슨 완료
   - `profiles.points` 자동 업데이트 확인

4. **API 엔드포인트 개발**
   - `/api/curriculum` - 커리큘럼 조회
   - `/api/progress` - 진행률 업데이트
   - `/api/quiz` - 퀴즈 제출

---

**준비 완료! 이제 Phase 3: 학습 시스템 구현을 시작할 수 있습니다! 🚀**
