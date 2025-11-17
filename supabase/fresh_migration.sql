-- ============================================
-- 기존 구조 완전 삭제 스크립트
-- ============================================

-- 1. 모든 트리거 삭제
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS update_curriculum_days_updated_at ON public.curriculum_days CASCADE;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons CASCADE;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON public.quizzes CASCADE;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress CASCADE;
DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON public.quiz_attempts CASCADE;
DROP TRIGGER IF EXISTS update_lesson_versions_updated_at ON public.lesson_versions CASCADE;
DROP TRIGGER IF EXISTS update_user_question_history_updated_at ON user_question_history CASCADE;
DROP TRIGGER IF EXISTS update_ai_processing_logs_updated_at ON ai_processing_logs CASCADE;
DROP TRIGGER IF EXISTS update_poker_glossary_updated_at ON poker_glossary CASCADE;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON public.achievements CASCADE;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements CASCADE;
DROP TRIGGER IF EXISTS update_content_creation_metrics_updated_at ON content_creation_metrics CASCADE;

-- 2. 모든 함수 삭제
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.increment_user_points() CASCADE;

-- 3. 모든 테이블 삭제 (외래키 순서 고려하여 역순)
DROP TABLE IF EXISTS public.user_quiz_history CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS content_creation_metrics CASCADE;
DROP TABLE IF EXISTS poker_glossary CASCADE;
DROP TABLE IF EXISTS ai_processing_logs CASCADE;
DROP TABLE IF EXISTS user_question_history CASCADE;
DROP TABLE IF EXISTS lesson_versions CASCADE;
DROP TABLE IF EXISTS public.quiz_pools CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_days CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. RLS 정책 삭제는 테이블과 함께 CASCADE로 삭제됨
-- GG Production 온보딩 플랫폼 데이터베이스 스키마
-- Version: 1.0.0
-- Description: 7일 커리큘럼 학습 관리 시스템

-- ============================================
-- 1. PROFILES (사용자 프로필 확장)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'trainee' CHECK (role IN ('trainee', 'trainer', 'admin')),
  department TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CURRICULUM_DAYS (7일 커리큘럼 구조)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curriculum_days (
  id SERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 7),
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[],
  duration_hours INTEGER DEFAULT 8,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. LESSONS (각 Day별 레슨)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id INTEGER NOT NULL REFERENCES public.curriculum_days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- 마크다운 콘텐츠
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('theory', 'practical', 'quiz', 'video')),
  duration_minutes INTEGER DEFAULT 30,
  order_index INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 10,
  prerequisites UUID[], -- 선수 레슨 ID 배열
  is_required BOOLEAN DEFAULT true,
  resources JSONB, -- {video_url, pdf_url, external_links}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. USER_PROGRESS (학습 진행률)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- 5. QUIZZES (퀴즈 문제)
-- ============================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- [{id: 'a', text: '답변1', is_correct: true}]
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. QUIZ_ATTEMPTS (퀴즈 시도 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT
);

-- ============================================
-- 7. ACHIEVEMENTS (업적 시스템)
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  badge_color TEXT DEFAULT '#D4AF37', -- WSOP Gold
  points_required INTEGER,
  condition_type TEXT CHECK (condition_type IN ('points', 'days_completed', 'perfect_score', 'speed')),
  condition_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. USER_ACHIEVEMENTS (사용자별 획득 업적)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- INDEXES (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_day_id ON public.lessons(day_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ============================================
-- FUNCTIONS (자동 업데이트 함수)
-- ============================================

-- 1. updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 프로필 자동 생성 (회원가입 시)
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 포인트 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles
    SET points = points + (
      SELECT COALESCE(points_reward, 10) FROM public.lessons WHERE id = NEW.lesson_id
    )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (트리거 설정)
-- ============================================

-- updated_at 트리거
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_days_updated_at BEFORE UPDATE ON public.curriculum_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 신규 사용자 프로필 자동 생성
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- 포인트 자동 업데이트
CREATE TRIGGER on_lesson_completed AFTER UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- ============================================
-- ROW LEVEL SECURITY (RLS) 정책
-- ============================================

-- 1. Profiles 테이블
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Curriculum Days (모두 읽기 가능)
ALTER TABLE public.curriculum_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum days are viewable by everyone"
  ON public.curriculum_days FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify curriculum days"
  ON public.curriculum_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Lessons (모두 읽기 가능)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons FOR SELECT
  USING (true);

CREATE POLICY "Only admins/trainers can modify lessons"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- 4. User Progress (본인 것만 접근)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins/trainers can view all progress"
  ON public.user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- 5. Quizzes (모두 읽기 가능)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (true);

CREATE POLICY "Only admins/trainers can modify quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- 6. Quiz Attempts (본인 것만 접근)
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins/trainers can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- 7. Achievements (모두 읽기 가능)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- 8. User Achievements (본인 것만 접근)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view all achievements"
  ON public.user_achievements FOR SELECT
  USING (true);
-- GG Production 온보딩 플랫폼 초기 데이터
-- Version: 1.0.0
-- Description: 7일 커리큘럼 및 샘플 데이터

-- ============================================
-- 1. CURRICULUM DAYS (7일 커리큘럼)
-- ============================================
INSERT INTO public.curriculum_days (day_number, title, description, objectives, duration_hours, order_index) VALUES
(1, 'Day 1: 포커 기초 - 룰과 구조',
 '텍사스 홀덤의 기본 규칙과 토너먼트 구조를 학습합니다.',
 ARRAY['홀덤 기본 룰 이해', '핸드 랭킹 암기', '베팅 라운드 숙지', '포지션 개념'],
 8, 1),

(2, 'Day 2: 포커 기초 - 용어와 전략',
 '포커 전문 용어와 기초 전략을 학습합니다.',
 ARRAY['토너먼트 용어 숙지', '블라인드 구조 이해', '칩 카운팅', '기본 전략'],
 8, 2),

(3, 'Day 3: 프로덕션 스킬 - 장비와 시스템',
 '방송 장비와 프로덕션 시스템을 학습합니다.',
 ARRAY['카메라 시스템 이해', '오디오 장비 운용', '스위칭 기초', '그래픽 오버레이'],
 8, 3),

(4, 'Day 4: 프로덕션 스킬 - 라이브 운영',
 '실시간 방송 운영 기술을 학습합니다.',
 ARRAY['스트림 관리', '카메라 앵글 선택', '오디오 믹싱', '실시간 문제 해결'],
 8, 4),

(5, 'Day 5: 실전 시뮬레이션 - 준비',
 '3시간 모의 방송을 위한 준비 훈련입니다.',
 ARRAY['장비 셋업', '사전 체크리스트', '팀 역할 분담', '긴급 상황 대응'],
 8, 5),

(6, 'Day 6: 실전 시뮬레이션 - 실행',
 '실제 토너먼트 형식의 3시간 모의 방송을 진행합니다.',
 ARRAY['라이브 방송 진행', '팀 협업', '품질 관리', '피드백 수집'],
 8, 6),

(7, 'Day 7: 최종 평가',
 '이론 테스트와 실무 평가를 통해 현장 투입 여부를 결정합니다.',
 ARRAY['이론 테스트 (60점 이상)', '실무 평가', '최종 피드백', '현장 투입 승인'],
 8, 7);

-- ============================================
-- 2. LESSONS (Day별 레슨)
-- ============================================

-- Day 1 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(1, '텍사스 홀덤 기본 룰', '# 텍사스 홀덤 기본 룰

## 게임 구조
- 2명~10명 플레이어
- 2장의 홀 카드 + 5장의 커뮤니티 카드
- 최고의 5장 조합으로 승부

## 베팅 라운드
1. **Pre-flop**: 홀 카드 2장 받은 후
2. **Flop**: 커뮤니티 카드 3장 오픈 후
3. **Turn**: 4번째 카드 오픈 후
4. **River**: 5번째 카드 오픈 후

## 기본 액션
- **Fold**: 패 버리기
- **Call**: 현재 베팅액 맞추기
- **Raise**: 베팅 금액 올리기
- **Check**: 베팅 없이 넘기기', 'theory', 45, 1, 50),

(1, '핸드 랭킹 완벽 정리', '# 포커 핸드 랭킹 (강한 순서)

1. **Royal Flush** (로얄 플러시)
   - A-K-Q-J-10 같은 무늬

2. **Straight Flush** (스트레이트 플러시)
   - 5장 연속 숫자, 같은 무늬

3. **Four of a Kind** (포카드)
   - 같은 숫자 4장

4. **Full House** (풀하우스)
   - 트리플 + 페어

5. **Flush** (플러시)
   - 같은 무늬 5장

6. **Straight** (스트레이트)
   - 연속된 숫자 5장

7. **Three of a Kind** (트리플)
   - 같은 숫자 3장

8. **Two Pair** (투페어)
   - 페어 2개

9. **One Pair** (원페어)
   - 같은 숫자 2장

10. **High Card** (하이카드)
    - 아무 조합도 없을 때', 'theory', 30, 2, 50),

(1, '베팅 구조와 블라인드', '# 베팅 구조

## 블라인드 시스템
- **Small Blind (SB)**: 최소 강제 베팅
- **Big Blind (BB)**: SB의 2배
- 매 핸드마다 시계방향으로 이동

## 베팅 리미트
- **No Limit**: 제한 없음 (WSOP 메인 이벤트)
- **Pot Limit**: 팟 금액까지만
- **Fixed Limit**: 정해진 금액만

## 토너먼트 블라인드
- 시간에 따라 블라인드 증가
- 예: 25/50 → 50/100 → 100/200...', 'theory', 30, 3, 50),

(1, 'Day 1 퀴즈', '', 'quiz', 20, 4, 100);

-- Day 2 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(2, '포커 전문 용어', '# 필수 포커 용어

## 포지션
- **UTG (Under The Gun)**: 블라인드 다음 첫 번째
- **MP (Middle Position)**: 중간 포지션
- **CO (Cut Off)**: 딜러 바로 앞
- **BTN (Button)**: 딜러 포지션
- **SB/BB**: 스몰/빅 블라인드

## 액션 용어
- **3-bet**: 리레이즈
- **4-bet**: 리리레이즈
- **All-in**: 모든 칩 베팅
- **Showdown**: 최종 카드 공개

## 토너먼트 용어
- **Buy-in**: 참가비
- **Re-entry**: 재입장
- **Bubble**: 상금권 직전
- **Final Table**: 최종 테이블', 'theory', 40, 1, 50),

(2, '칩 카운팅과 관리', '# 칩 카운팅

## 칩 단위
- **White**: 25
- **Red**: 100
- **Green**: 500
- **Black**: 1,000
- **Purple**: 5,000

## 칩 카운팅 기술
1. 20개씩 묶어서 세기
2. 컬러별로 분류
3. 빠른 계산 연습

## 스택 관리
- **Short Stack**: 10BB 이하
- **Medium Stack**: 20-40BB
- **Big Stack**: 50BB 이상', 'theory', 30, 2, 50),

(2, '기본 전략 개념', '# 포커 기본 전략

## Starting Hands
- **Premium**: AA, KK, QQ, AK
- **Strong**: JJ, TT, AQ, AJs
- **Playable**: 99-22, KQ, suited connectors

## 포지션별 플레이
- **Early**: 타이트하게
- **Middle**: 선택적으로
- **Late**: 공격적으로

## 팟 오즈 기초
- 팟 사이즈 vs 콜 금액
- 이길 확률 계산
- EV (Expected Value) 개념', 'theory', 40, 3, 50),

(2, 'Day 2 퀴즈', '', 'quiz', 20, 4, 100);

-- Day 3 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(3, '카메라 시스템 이해', '# 포커 방송 카메라 시스템

## 카메라 구성
1. **Table Cam**: 테이블 전체 샷
2. **Hole Card Cam**: 홀 카드 촬영 (RFID)
3. **Player Cam**: 개별 플레이어
4. **Audience Cam**: 관중석

## 카메라 앵글
- **Wide Shot**: 전체 분위기
- **Close-up**: 플레이어 표정
- **Insert**: 칩, 카드 클로즈업

## 스위칭 타이밍
- 액션 발생 시 해당 플레이어
- Showdown 시 핸드 공개
- 중요한 결정 시 클로즈업', 'theory', 45, 1, 50),

(3, '오디오 시스템 운용', '# 오디오 장비와 믹싱

## 마이크 종류
- **Dealer Mic**: 딜러 음성
- **Player Mic**: 개별 플레이어 (Lav)
- **Ambient Mic**: 현장음

## 오디오 레벨
- Dealer: -12dB
- Players: -18dB
- Ambient: -24dB

## 믹싱 기술
- 액션 발생 시 해당 플레이어 믹싱
- 배경음악 레벨 조절
- 노이즈 제거', 'theory', 40, 2, 50),

(3, '그래픽 오버레이 시스템', '# 방송 그래픽

## 필수 그래픽
1. **Player Info**: 이름, 칩 스택
2. **Hand Info**: 커뮤니티 카드
3. **Pot Size**: 현재 팟 금액
4. **Timer**: 블라인드 남은 시간

## 그래픽 타이밍
- Pre-flop: 플레이어 정보
- Flop/Turn/River: 카드 애니메이션
- Showdown: 승자 강조

## 소프트웨어
- vMix, OBS 사용법
- 그래픽 템플릿 관리', 'practical', 45, 3, 50),

(3, 'Day 3 실습', '', 'practical', 30, 4, 100);

-- Day 4-7 레슨들 (간략하게)
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(4, '스트림 관리', '# 라이브 스트리밍 관리...', 'theory', 45, 1, 50),
(4, '실시간 문제 해결', '# 방송 중 긴급 상황 대응...', 'practical', 45, 2, 50),
(4, 'Day 4 실습', '', 'practical', 30, 3, 100),

(5, '장비 셋업 체크리스트', '# 방송 전 준비 사항...', 'practical', 60, 1, 50),
(5, '팀 역할과 커뮤니케이션', '# 팀워크와 역할 분담...', 'theory', 40, 2, 50),
(5, '모의 방송 준비', '', 'practical', 60, 3, 100),

(6, '3시간 모의 방송', '# 실전 시뮬레이션...', 'practical', 180, 1, 200),
(6, '피드백 세션', '', 'theory', 30, 2, 50),

(7, '이론 최종 테스트', '', 'quiz', 60, 1, 300),
(7, '실무 최종 평가', '', 'practical', 120, 2, 200);

-- ============================================
-- 3. QUIZZES (샘플 퀴즈)
-- ============================================

-- Day 1 퀴즈 가져오기
DO $$
DECLARE
  day1_quiz_lesson_id UUID;
BEGIN
  SELECT id INTO day1_quiz_lesson_id FROM public.lessons WHERE title = 'Day 1 퀴즈';

  INSERT INTO public.quizzes (lesson_id, question, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (day1_quiz_lesson_id, '텍사스 홀덤에서 각 플레이어가 받는 홀 카드는 몇 장인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "1장", "is_correct": false},
     {"id": "b", "text": "2장", "is_correct": true},
     {"id": "c", "text": "3장", "is_correct": false},
     {"id": "d", "text": "4장", "is_correct": false}
   ]'::jsonb,
   'b', '텍사스 홀덤에서는 각 플레이어가 2장의 홀 카드를 받습니다.', 10, 1),

  (day1_quiz_lesson_id, '다음 중 가장 강한 핸드는?', 'multiple_choice',
   '[
     {"id": "a", "text": "Four of a Kind", "is_correct": false},
     {"id": "b", "text": "Full House", "is_correct": false},
     {"id": "c", "text": "Straight Flush", "is_correct": true},
     {"id": "d", "text": "Flush", "is_correct": false}
   ]'::jsonb,
   'c', 'Straight Flush는 로얄 플러시 다음으로 두 번째로 강한 핸드입니다.', 10, 2),

  (day1_quiz_lesson_id, 'Small Blind는 Big Blind의 몇 배인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "0.5배", "is_correct": true},
     {"id": "b", "text": "1배", "is_correct": false},
     {"id": "c", "text": "2배", "is_correct": false},
     {"id": "d", "text": "3배", "is_correct": false}
   ]'::jsonb,
   'a', 'Small Blind는 Big Blind의 절반 금액입니다.', 10, 3),

  (day1_quiz_lesson_id, 'Flop에서 공개되는 커뮤니티 카드는 몇 장인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "1장", "is_correct": false},
     {"id": "b", "text": "2장", "is_correct": false},
     {"id": "c", "text": "3장", "is_correct": true},
     {"id": "d", "text": "5장", "is_correct": false}
   ]'::jsonb,
   'c', 'Flop에서는 3장의 커뮤니티 카드가 동시에 공개됩니다.', 10, 4),

  (day1_quiz_lesson_id, 'WSOP 메인 이벤트의 베팅 구조는?', 'multiple_choice',
   '[
     {"id": "a", "text": "No Limit", "is_correct": true},
     {"id": "b", "text": "Pot Limit", "is_correct": false},
     {"id": "c", "text": "Fixed Limit", "is_correct": false},
     {"id": "d", "text": "Mixed Limit", "is_correct": false}
   ]'::jsonb,
   'a', 'WSOP 메인 이벤트는 No Limit Texas Holdem 형식입니다.', 10, 5);
END $$;

-- ============================================
-- 4. ACHIEVEMENTS (업적)
-- ============================================
INSERT INTO public.achievements (name, description, icon, badge_color, points_required, condition_type, condition_value) VALUES
('첫 걸음', '첫 번째 레슨 완료', '🎯', '#D4AF37', 0, 'days_completed', '{"days": 1}'::jsonb),
('포커 기초 마스터', 'Day 1-2 완료', '♠️', '#ED1C24', 0, 'days_completed', '{"days": 2}'::jsonb),
('프로덕션 전문가', 'Day 3-4 완료', '🎬', '#D4AF37', 0, 'days_completed', '{"days": 4}'::jsonb),
('실전 준비 완료', 'Day 5-6 완료', '🔥', '#ED1C24', 0, 'days_completed', '{"days": 6}'::jsonb),
('현장 투입 인증', '최종 평가 통과', '🏆', '#D4AF37', 0, 'days_completed', '{"days": 7}'::jsonb),
('포인트 헌터', '500 포인트 획득', '💎', '#1565C0', 500, 'points', '{"target": 500}'::jsonb),
('포인트 마스터', '1000 포인트 획득', '👑', '#D4AF37', 1000, 'points', '{"target": 1000}'::jsonb),
('완벽주의자', '모든 퀴즈 만점', '⭐', '#ED1C24', 0, 'perfect_score', '{"type": "all_quizzes"}'::jsonb),
('스피드러너', '3일 내 완료', '⚡', '#F57C00', 0, 'speed', '{"days": 3}'::jsonb);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 데이터베이스 초기화 완료!';
  RAISE NOTICE '📚 7일 커리큘럼 생성됨';
  RAISE NOTICE '📝 샘플 레슨 및 퀴즈 생성됨';
  RAISE NOTICE '🏆 업적 시스템 설정됨';
END $$;
-- Sample Lesson Content for GG Production Platform
-- This migration adds comprehensive poker training content for all 7 days

-- Update Day 1 Lessons with content
UPDATE public.lessons
SET
  content = '# 포커 기초 - 게임 규칙과 핸드 랭킹

## 학습 목표
이 레슨을 완료하면 다음을 할 수 있습니다:
- 텍사스 홀덤의 기본 규칙 이해
- 핸드 랭킹 순위 암기
- 게임의 진행 순서 파악

## 텍사스 홀덤 기본 규칙

### 게임 구조
텍사스 홀덤은 2-10명의 플레이어가 참여하는 커뮤니티 카드 포커 게임입니다.

**핵심 요소:**
- **홀 카드**: 각 플레이어에게 2장의 개인 카드 (다른 사람이 볼 수 없음)
- **커뮤니티 카드**: 테이블 중앙에 공개되는 5장의 카드 (모든 플레이어 공유)
- **최종 핸드**: 홀 카드 2장과 커뮤니티 카드 5장 중 최선의 5장 조합

### 게임 진행 순서

1. **프리플랍 (Pre-Flop)**
   - 블라인드 배팅
   - 각 플레이어에게 홀 카드 2장 지급
   - 첫 번째 베팅 라운드

2. **플랍 (Flop)**
   - 커뮤니티 카드 3장 공개
   - 두 번째 베팅 라운드

3. **턴 (Turn)**
   - 커뮤니티 카드 1장 추가 (총 4장)
   - 세 번째 베팅 라운드

4. **리버 (River)**
   - 커뮤니티 카드 1장 추가 (총 5장)
   - 마지막 베팅 라운드

5. **쇼다운 (Showdown)**
   - 남은 플레이어들이 핸드를 공개
   - 최고 핸드가 팟을 가져감

## 핸드 랭킹 (높은 순서부터)

### 1. 로얄 플러시 (Royal Flush)
- **설명**: A-K-Q-J-10 같은 무늬
- **예시**: ♠️A ♠️K ♠️Q ♠️J ♠️10
- **확률**: 0.00015% (649,740:1)

### 2. 스트레이트 플러시 (Straight Flush)
- **설명**: 연속된 5장, 같은 무늬
- **예시**: ♥️9 ♥️8 ♥️7 ♥️6 ♥️5
- **확률**: 0.0014% (72,192:1)

### 3. 포카드 (Four of a Kind)
- **설명**: 같은 숫자 4장
- **예시**: ♠️K ♥️K ♦️K ♣️K ♠️3
- **확률**: 0.024% (4,164:1)

### 4. 풀하우스 (Full House)
- **설명**: 트리플 + 페어
- **예시**: ♠️Q ♥️Q ♦️Q ♣️7 ♠️7
- **확률**: 0.14% (693:1)

### 5. 플러시 (Flush)
- **설명**: 같은 무늬 5장
- **예시**: ♣️K ♣️10 ♣️7 ♣️5 ♣️2
- **확률**: 0.20% (508:1)

### 6. 스트레이트 (Straight)
- **설명**: 연속된 5장 (무늬 무관)
- **예시**: ♠️9 ♥️8 ♦️7 ♣️6 ♠️5
- **확률**: 0.39% (254:1)

### 7. 트리플 (Three of a Kind)
- **설명**: 같은 숫자 3장
- **예시**: ♠️8 ♥️8 ♦️8 ♣️K ♠️5
- **확률**: 2.11% (46:1)

### 8. 투 페어 (Two Pair)
- **설명**: 2개의 페어
- **예시**: ♠️J ♥️J ♦️4 ♣️4 ♠️9
- **확률**: 4.75% (20:1)

### 9. 원 페어 (One Pair)
- **설명**: 같은 숫자 2장
- **예시**: ♠️10 ♥️10 ♦️K ♣️7 ♠️3
- **확률**: 42.26% (1.36:1)

### 10. 하이 카드 (High Card)
- **설명**: 위 조합이 없을 때
- **예시**: ♠️A ♥️K ♦️9 ♣️6 ♠️2
- **확률**: 50.12% (0.995:1)

## 블라인드와 베팅

### 블라인드란?
- **스몰 블라인드 (SB)**: 딜러 왼쪽 플레이어, 최소 베팅액의 절반
- **빅 블라인드 (BB)**: SB 왼쪽 플레이어, 최소 베팅액 전액

### 베팅 액션
- **폴드 (Fold)**: 게임 포기
- **체크 (Check)**: 베팅 없이 넘김 (베팅이 없을 때만)
- **콜 (Call)**: 현재 베팅액과 동일하게 베팅
- **레이즈 (Raise)**: 현재 베팅액보다 더 높게 베팅
- **올인 (All-in)**: 모든 칩 베팅

## 실전 예시

**상황**: 당신은 ♠️A ♥️K를 받았습니다.

**플랍**: ♦️A ♣️7 ♠️2

**현재 핸드**: 원 페어 (에이스)

**가능한 개선**:
- 턴/리버에서 K가 나오면 → 투 페어
- 턴/리버에서 A가 나오면 → 트리플

## 다음 단계
다음 레슨에서는 포지션의 중요성과 프리플랍 전략을 배웁니다.',
  description = '텍사스 홀덤의 기본 규칙, 핸드 랭킹, 게임 진행 순서를 학습합니다.',
  updated_at = now()
WHERE title = 'Poker Basics' AND day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 1 LIMIT 1);

UPDATE public.lessons
SET
  content = '# 포지션의 중요성

## 학습 목표
- 포지션의 개념 이해
- 각 포지션의 장단점 파악
- 포지션별 전략 수립

## 포지션이란?

포지션은 딜러 버튼을 기준으로 한 당신의 위치입니다. **포지션이 늦을수록 유리합니다.**

### 포지션 분류

#### 1. 얼리 포지션 (EP)
- **UTG (Under the Gun)**: BB 다음, 첫 번째 액션
- **UTG+1, UTG+2**: UTG 다음 자리들
- **특징**: 가장 불리한 포지션
- **전략**: 타이트한 핸드 선택 (프리미엄 핸드만)

#### 2. 미들 포지션 (MP)
- **MP1, MP2, MP3**
- **특징**: 중간 포지션
- **전략**: 중간 정도의 핸드 범위

#### 3. 레이트 포지션 (LP)
- **CO (Cut-Off)**: 버튼 바로 이전
- **BTN (Button)**: 딜러 포지션
- **특징**: 가장 유리한 포지션
- **전략**: 넓은 핸드 범위 플레이 가능

#### 4. 블라인드
- **SB (Small Blind)**
- **BB (Big Blind)**
- **특징**: 플랍 이후 첫 번째 액션 (불리)

## 포지션의 장점

### 레이트 포지션의 이점

1. **정보 우위**
   - 다른 플레이어들의 액션을 먼저 봄
   - 상대의 핸드 강도 추측 가능

2. **팟 컨트롤**
   - 팟 크기 조절 가능
   - 블러핑 기회 증가

3. **폴드 에퀴티**
   - 상대를 폴드시킬 확률 증가
   - 스틸 기회 증가

## 포지션별 핸드 선택

### UTG (얼리 포지션)
**권장 핸드 범위: 약 15%**
- 프리미엄 페어: AA, KK, QQ, JJ
- 프리미엄 에이스: AK, AQ (suited)
- 극소수 다른 핸드

### CO (컷오프)
**권장 핸드 범위: 약 25%**
- UTG 범위 +
- 중간 페어: TT, 99, 88
- 수티드 커넥터: 98s, 87s, 76s
- 브로드웨이 핸드: KQ, KJ, QJ

### BTN (버튼)
**권장 핸드 범위: 약 40%**
- 가장 넓은 범위
- 거의 모든 페어
- 많은 수티드 핸드
- 연결된 핸드

## 실전 전략

### 얼리 포지션에서
```
상황: UTG에서 A♠ J♥
행동: FOLD
이유: 오프슈트 AJ는 얼리 포지션에서 너무 약함
```

### 레이트 포지션에서
```
상황: BTN에서 7♦ 6♦, 모두 폴드
행동: RAISE (스틸 시도)
이유: 포지션 + 폴드 에퀴티 + 수티드 커넥터
```

## 포지션과 베팅 사이즈

### 레이트 포지션 레이즈
- **EP 레이즈**: 3BB
- **MP 레이즈**: 2.5BB
- **LP 레이즈**: 2.5-3BB
- **BTN 스틸**: 2.5BB

### 리레이즈 (3-bet)
- **IP (in position)**: 3x 오리지널 레이즈
- **OOP (out of position)**: 4x 오리지널 레이즈

## 다음 단계
다음 레슨에서는 프리플랍 전략과 핸드 레인지를 상세히 다룹니다.',
  description = '포지션의 중요성과 각 포지션별 전략을 학습합니다.',
  updated_at = now()
WHERE title = 'Position Importance' AND day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 1 LIMIT 1);

-- Day 2 Content
UPDATE public.lessons
SET
  content = '# 베팅과 팟 오즈

## 학습 목표
- 팟 오즈의 개념 이해
- 베팅 사이즈 결정 방법 학습
- 밸류 베팅과 블러핑 구분

## 팟 오즈란?

팟 오즈는 **현재 팟의 크기 대비 내가 콜해야 하는 금액의 비율**입니다.

### 계산 방법
```
팟 오즈 = 콜 금액 / (현재 팟 + 콜 금액)
```

### 예시
- 팟: $100
- 상대 베팅: $50
- 내 콜 금액: $50
- 새로운 팟: $150
- 팟 오즈: $50 / $150 = 1:3 = 33.3%

**의미**: 33.3% 이상 승률이면 콜이 이득

## 임플라이드 오즈

### 개념
- **현재 팟 오즈 + 미래에 받을 수 있는 금액**
- 드로우 핸드에 특히 중요

### 예시
```
현재 팟: $100
콜 금액: $20
팟 오즈: 20%

하지만 드로우 완성 시 상대가 추가로 $100 더 베팅할 것으로 예상
임플라이드 오즈: $20 / ($120 + $100) = 9%

→ 9%만 완성되어도 이득
```

## 베팅 사이즈

### 밸류 베팅
**목적**: 더 약한 핸드로부터 콜을 받기 위함

**사이즈**:
- **큰 베팅**: 팟의 75-100% (강한 핸드)
- **중간 베팅**: 팟의 50-66% (중간 핸드)
- **작은 베팅**: 팟의 33-50% (블러프 캐처 유도)

### 블러핑
**목적**: 더 좋은 핸드를 폴드시키기 위함

**사이즈**:
- **리버 블러프**: 팟의 66-75%
- **턴 블러프**: 팟의 50-66%
- **플랍 블러프**: 팟의 33-50%

## 아웃 계산

### 아웃이란?
- **핸드를 개선시킬 수 있는 카드**
- 확률 계산의 기초

### 예시: 플러시 드로우
```
내 핸드: A♠ K♠
플랍: 9♠ 6♠ 2♥

아웃: 13장(♠) - 4장(내 손 + 플랍) = 9 아웃
```

### 아웃 → 확률 변환
**Rule of 4 and 2**
- **플랍에서**: 아웃 x 4 = 턴+리버 확률
- **턴에서**: 아웃 x 2 = 리버 확률

```
플러시 드로우 (9 아웃)
- 플랍: 9 x 4 = 36%
- 턴: 9 x 2 = 18%
```

## 실전 예시

### 상황 1: 드로우 플레이
```
내 핸드: J♥ 10♥
보드: Q♥ 9♣ 2♥
팟: $200
상대 베팅: $100

아웃 계산:
- 플러시: 9장
- 스트레이트: 8장 (K, 8)
- 중복 제거: 약 15 아웃

확률: 15 x 4 = 60%
팟 오즈: $100 / $300 = 33.3%

판단: 60% > 33.3% → CALL
```

### 상황 2: 밸류 베팅
```
내 핸드: A♠ A♥
보드: A♦ K♣ 7♥ 3♠ 2♣
팟: $150

베팅 사이즈 결정:
- 상대가 Kx를 가질 가능성 높음
- $100 (66% 팟) 베팅
- 상대가 콜할 확률 높음
```

## 베팅 패턴 읽기

### 소액 베팅
- **의미**: 드로우 or 약한 메이드 핸드
- **대응**: 레이즈 고려

### 대액 베팅
- **의미**: 강한 핸드 or 폴라라이즈드 블러프
- **대응**: 핸드 강도에 따라 콜/폴드

### 체크-레이즈
- **의미**: 강한 핸드 or 블러프
- **대응**: 포지션과 핸드 고려

## 다음 단계
다음 레슨에서는 블러핑 기법과 핸드 리딩을 배웁니다.',
  description = '팟 오즈 계산과 베팅 사이즈 결정 방법을 학습합니다.',
  updated_at = now()
WHERE title = 'Betting & Pot Odds' AND day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 2 LIMIT 1);

-- Day 3 Content
UPDATE public.lessons
SET
  content = '# 블러핑과 핸드 리딩

## 학습 목표
- 효과적인 블러핑 시기 파악
- 상대 핸드 읽는 방법 학습
- 블러핑 빈도 조절

## 블러핑의 기초

### 블러핑이란?
**약한 핸드로 상대를 폴드시키는 행위**

### 블러핑이 성공하려면
1. **크레디블한 스토리**
2. **올바른 상대 선택**
3. **적절한 보드 텍스처**
4. **충분한 폴드 에퀴티**

## 블러핑 타입

### 1. 퓨어 블러프 (Pure Bluff)
- **정의**: 쇼다운 밸류 없음
- **예시**: 7-2 오프슈트, 드로우 미스

### 2. 세미 블러프 (Semi-Bluff)
- **정의**: 드로우 핸드로 베팅
- **예시**: 플러시 드로우, 스트레이트 드로우
- **장점**: 두 가지 승리 방법
  1. 폴드 유도
  2. 드로우 완성

## 블러핑 적절한 상황

### ✅ 좋은 블러핑 상황

1. **스케어 카드 등장**
```
보드: K♥ 7♣ 2♦ A♠
→ 에이스가 떨어져 상대가 겁먹을 수 있음
```

2. **드라이 보드**
```
보드: K♣ 8♦ 2♥
→ 드로우가 적어 상대도 약할 가능성
```

3. **상대가 위크**
```
상황: 상대가 여러 번 체크
행동: 베팅 (블러프)
```

### ❌ 나쁜 블러핑 상황

1. **웻 보드**
```
보드: 9♠ 8♠ 7♣
→ 많은 드로우, 상대가 강할 가능성
```

2. **콜링 스테이션 상대**
```
특징: 절대 폴드 안 함
대응: 블러프 최소화, 밸류 베팅 위주
```

3. **멀티웨이 팟**
```
상황: 3명 이상 참여
이유: 누군가는 강한 핸드 가능성
```

## 핸드 리딩

### 레인지 기반 사고

**플레이어는 한 장의 카드가 아닌 핸드 레인지를 가짐**

#### 예시 분석
```
상황:
- 상대: UTG 레이즈
- 플랍: A♥ K♠ 5♣
- 상대: 컨티뉴에이션 베팅

상대 레인지:
- 프리미엄 페어: AA, KK, QQ, JJ, TT
- 프리미엄 에이스: AK, AQ
- 포켓: 99, 88

핸드 가능성:
- 탑 페어 이상: 70%
- 오버페어: 20%
- 에어볼: 10%
```

### 베팅 패턴 분석

#### 1. 컨티뉴에이션 베팅 (C-bet)
```
의미: 프리플랍 레이저가 플랍에서 베팅
빈도: 60-80%
레인지: 넓음 (블러프 많음)
```

#### 2. 체크-레이즈
```
의미: 강한 핸드 or 드로우
레인지: 폴라라이즈드
전략: 신중한 대응 필요
```

#### 3. 도노 베팅 (Donk Bet)
```
의미: OOP에서 먼저 베팅
의미: 주로 드로우 or 약한 메이드
전략: 공격적 대응
```

### 피지컬 텔

#### 온라인
- **베팅 타이밍**
  - 즉시 베팅: 강함 or 극약함
  - 오래 생각 후: 중간 핸드
- **베팅 사이즈 패턴**
  - 일관성 없음: 초보
  - 일관성 있음: 숙련자

#### 라이브
- **신체 언어**
  - 떨림: 강한 핸드
  - 과도한 말: 약한 핸드
  - 침착함: 경험 많음

## 블러핑 빈도

### 최적 블러핑 비율

**밸류 : 블러프 = 2:1**

```
리버 베팅 예시:
- 팟: $100
- 베팅: $100

상대가 33.3% 승률 필요
→ 블러프 25%, 밸류 75%
```

### 보드 텍스처별 빈도

- **드라이 보드**: 블러프 30-40%
- **웻 보드**: 블러프 20-30%
- **페어드 보드**: 블러프 40-50%

## 실전 블러핑

### 플랍 블러프
```
내 핸드: A♣ Q♠
보드: K♥ 9♦ 4♣
포지션: BTN
상대: BB (체크)

판단:
- 에이스 하이 (약함)
- 포지션 있음
- 상대 위크 시그널
→ C-BET (블러프)
```

### 리버 블러프
```
내 핸드: 8♠ 7♠
보드: A♥ Q♦ 5♣ 3♠ K♠
액션: 플랍 체크, 턴 체크

판단:
- 플러시 미스
- 스케어 카드 (K)
- 상대 체크 2번
→ 팟의 66% 베팅
```

## 다음 단계
다음 레슨에서는 토너먼트 전략과 ICM을 다룹니다.',
  description = '블러핑 기법과 상대의 핸드를 읽는 방법을 학습합니다.',
  updated_at = now()
WHERE title = 'Bluffing & Hand Reading' AND day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 3 LIMIT 1);

-- Add content to remaining lessons
UPDATE public.lessons
SET
  content = '# 토너먼트 전략 기초\n\n## ICM 이해\n- Independent Chip Model 개념\n- 스택 크기별 전략\n- 버블 플레이\n\n## 토너먼트 단계별 전략\n1. 초기 단계\n2. 중반 단계\n3. 버블 직전\n4. ITM (In The Money)\n5. 파이널 테이블',
  description = '토너먼트 포커의 기본 전략과 ICM 개념을 학습합니다.',
  updated_at = now()
WHERE day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 4 LIMIT 1) AND order_index = 1;

UPDATE public.lessons
SET
  content = '# 캐시 게임 전략\n\n## 캐시 게임 vs 토너먼트\n- 차이점 이해\n- 스택 관리\n- 테이블 선택\n\n## 최적 플레이\n1. 포지션 활용\n2. 3-bet/4-bet 전략\n3. 멀티웨이 팟\n4. 스택 깊이별 조정',
  description = '캐시 게임의 기본 전략과 최적 플레이 방법을 학습합니다.',
  updated_at = now()
WHERE day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 5 LIMIT 1) AND order_index = 1;

UPDATE public.lessons
SET
  content = '# 포커 소프트웨어 활용\n\n## 필수 도구\n1. HUD (Heads-Up Display)\n2. 트래커 소프트웨어\n3. 에퀴티 계산기\n\n## 데이터 분석\n- 통계 읽는 법\n- 리크 찾기\n- 개선 포인트 도출',
  description = '포커 소프트웨어와 데이터 분석 도구 활용법을 학습합니다.',
  updated_at = now()
WHERE day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 6 LIMIT 1) AND order_index = 1;

UPDATE public.lessons
SET
  content = '# 포커 프로로의 여정\n\n## 멘탈 게임\n1. 틸트 관리\n2. 뱅크롤 관리\n3. 스트레스 대처\n\n## 지속적 학습\n- 핸드 리뷰\n- 포럼 참여\n- 코칭 받기\n\n## 커리어 로드맵\n- 단계별 목표\n- 수익 관리\n- 프로의 마인드셋',
  description = '프로 포커 플레이어가 되기 위한 멘탈과 커리어 관리를 학습합니다.',
  updated_at = now()
WHERE day_id = (SELECT id FROM public.curriculum_days WHERE day_number = 7 LIMIT 1) AND order_index = 1;
-- AI 기능을 위한 스키마 확장
-- Version: 2.0.0
-- Description: AI 콘텐츠 정리 및 랜덤 퀴즈 시스템

-- ============================================
-- 1. LESSONS 테이블 확장 (AI 콘텐츠 정리)
-- ============================================

-- 원본 콘텐츠 저장 (AI 처리 전)
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS raw_content TEXT;

-- AI 추출 학습 목표
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];

-- AI 추출 핵심 개념
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS key_concepts TEXT[];

-- AI 분류 난이도
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- AI 처리 완료 여부
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false;

-- AI 처리 시각
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;

-- 예상 학습 시간 (이미 duration_minutes가 있지만 AI가 자동 계산)
-- duration_minutes는 그대로 사용

COMMENT ON COLUMN public.lessons.raw_content IS '트레이너가 입력한 원본 비정형 텍스트 (AI 처리 전)';
COMMENT ON COLUMN public.lessons.content IS 'AI가 정리한 구조화된 마크다운 콘텐츠';
COMMENT ON COLUMN public.lessons.learning_objectives IS 'AI가 추출한 학습 목표 배열';
COMMENT ON COLUMN public.lessons.key_concepts IS 'AI가 추출한 핵심 개념 배열';
COMMENT ON COLUMN public.lessons.difficulty_level IS 'AI가 분류한 난이도 (easy/medium/hard)';
COMMENT ON COLUMN public.lessons.ai_processed IS 'AI 자동 정리 완료 여부';
COMMENT ON COLUMN public.lessons.ai_processed_at IS 'AI 처리 완료 시각';

-- ============================================
-- 2. QUIZZES 테이블 확장 (AI 퀴즈 생성)
-- ============================================

-- 난이도 (기존 points와 별도로 명시적 난이도)
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- 연관 개념 태그 (퀴즈가 다루는 핵심 개념)
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS concept_tags TEXT[];

-- AI 생성 여부
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;

-- 생성 시드 (재현성 보장을 위한 랜덤 시드)
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS generation_seed TEXT;

-- 문제 활성화 여부 (트레이너 검토 후 활성화)
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.quizzes.difficulty IS '명시적 난이도 (easy/medium/hard)';
COMMENT ON COLUMN public.quizzes.concept_tags IS '이 문제가 다루는 핵심 개념 배열';
COMMENT ON COLUMN public.quizzes.ai_generated IS 'AI가 자동 생성한 문제인지 여부';
COMMENT ON COLUMN public.quizzes.generation_seed IS 'AI 생성 재현을 위한 시드값';
COMMENT ON COLUMN public.quizzes.is_active IS '활성화 여부 (트레이너 검토 후 true)';

-- ============================================
-- 3. QUIZ_POOLS 테이블 생성 (문제 풀 관리)
-- ============================================

CREATE TABLE IF NOT EXISTS public.quiz_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,

  -- 통계 정보
  total_questions INTEGER DEFAULT 0, -- 생성 가능한 총 문제 수
  active_questions INTEGER DEFAULT 0, -- 활성화된 문제 수
  difficulty_distribution JSONB, -- {easy: 5, medium: 10, hard: 3}

  -- 메타데이터
  last_generated_at TIMESTAMPTZ,
  generation_count INTEGER DEFAULT 0, -- 총 생성 횟수
  last_selected_at TIMESTAMPTZ, -- 마지막 출제 시각

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(lesson_id)
);

COMMENT ON TABLE public.quiz_pools IS '레슨별 퀴즈 문제 풀 관리';
COMMENT ON COLUMN public.quiz_pools.total_questions IS '해당 레슨의 총 문제 수';
COMMENT ON COLUMN public.quiz_pools.active_questions IS '트레이너가 승인한 활성 문제 수';
COMMENT ON COLUMN public.quiz_pools.difficulty_distribution IS '난이도별 문제 수 분포 JSON';

-- ============================================
-- 4. USER_QUIZ_HISTORY 테이블 생성 (랜덤 출제 이력)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,

  -- 시도 정보
  attempt_number INTEGER DEFAULT 1, -- 몇 번째 시도인지
  is_correct BOOLEAN NOT NULL,
  selected_answer TEXT,
  time_taken_seconds INTEGER, -- 문제 푸는데 걸린 시간

  -- 가중치 (틀린 문제는 다시 나올 확률 높임)
  weight FLOAT DEFAULT 1.0, -- 1.0 기본, 틀리면 증가

  attempted_at TIMESTAMPTZ DEFAULT NOW(),

  -- 인덱스 최적화
  CONSTRAINT user_quiz_unique UNIQUE(user_id, lesson_id, quiz_id, attempt_number)
);

CREATE INDEX idx_user_quiz_history_user ON public.user_quiz_history(user_id);
CREATE INDEX idx_user_quiz_history_lesson ON public.user_quiz_history(lesson_id);
CREATE INDEX idx_user_quiz_history_weight ON public.user_quiz_history(weight DESC); -- 가중치 높은 순

COMMENT ON TABLE public.user_quiz_history IS '사용자별 퀴즈 출제 이력 (랜덤 출제 알고리즘용)';
COMMENT ON COLUMN public.user_quiz_history.weight IS '재출제 가중치 (틀린 문제 우선 출제)';

-- ============================================
-- 5. TRIGGERS (자동 업데이트)
-- ============================================

-- quiz_pools의 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_quiz_pool_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_pools_updated_at
  BEFORE UPDATE ON public.quiz_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_pool_updated_at();

-- 퀴즈 생성 시 quiz_pool 통계 자동 업데이트
CREATE OR REPLACE FUNCTION update_quiz_pool_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- quiz_pools 레코드가 없으면 생성
  INSERT INTO public.quiz_pools (lesson_id, total_questions, active_questions, difficulty_distribution)
  VALUES (NEW.lesson_id, 1, CASE WHEN NEW.is_active THEN 1 ELSE 0 END,
          jsonb_build_object(COALESCE(NEW.difficulty, 'medium'), 1))
  ON CONFLICT (lesson_id)
  DO UPDATE SET
    total_questions = quiz_pools.total_questions + 1,
    active_questions = CASE
      WHEN NEW.is_active THEN quiz_pools.active_questions + 1
      ELSE quiz_pools.active_questions
    END,
    difficulty_distribution = jsonb_set(
      COALESCE(quiz_pools.difficulty_distribution, '{}'::jsonb),
      ARRAY[COALESCE(NEW.difficulty, 'medium')],
      to_jsonb(COALESCE((quiz_pools.difficulty_distribution->>COALESCE(NEW.difficulty, 'medium'))::int, 0) + 1)
    ),
    generation_count = quiz_pools.generation_count + 1,
    last_generated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_pool_insert
  AFTER INSERT ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_pool_on_insert();

-- 퀴즈 활성화 상태 변경 시 quiz_pool 통계 업데이트
CREATE OR REPLACE FUNCTION update_quiz_pool_on_active_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active != NEW.is_active THEN
    UPDATE public.quiz_pools
    SET active_questions = CASE
      WHEN NEW.is_active THEN active_questions + 1
      ELSE active_questions - 1
    END
    WHERE lesson_id = NEW.lesson_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_active_change
  AFTER UPDATE ON public.quizzes
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION update_quiz_pool_on_active_change();

-- ============================================
-- 6. RLS 정책 (보안)
-- ============================================

-- quiz_pools는 모두 읽기 가능, 쓰기는 시스템만
ALTER TABLE public.quiz_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_pools_select_all" ON public.quiz_pools
  FOR SELECT USING (true);

CREATE POLICY "quiz_pools_insert_admin" ON public.quiz_pools
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- user_quiz_history는 본인 것만 조회
ALTER TABLE public.user_quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_quiz_history_select_own" ON public.user_quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_quiz_history_insert_own" ON public.user_quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. 인덱스 최적화
-- ============================================

-- AI 처리된 레슨 빠르게 찾기
CREATE INDEX IF NOT EXISTS idx_lessons_ai_processed ON public.lessons(ai_processed) WHERE ai_processed = true;

-- 난이도별 퀴즈 검색
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(difficulty) WHERE is_active = true;

-- 활성 퀴즈만 빠르게 조회
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON public.quizzes(is_active, lesson_id) WHERE is_active = true;

-- AI 생성 퀴즈 필터링
CREATE INDEX IF NOT EXISTS idx_quizzes_ai_generated ON public.quizzes(ai_generated, lesson_id) WHERE ai_generated = true;

-- ============================================
-- 완료
-- ============================================

-- 마이그레이션 완료 확인
DO $$
BEGIN
  RAISE NOTICE '✅ AI Features Schema Migration Complete';
  RAISE NOTICE '   - lessons 테이블 확장 (raw_content, learning_objectives, etc.)';
  RAISE NOTICE '   - quizzes 테이블 확장 (difficulty, concept_tags, etc.)';
  RAISE NOTICE '   - quiz_pools 테이블 생성 (문제 풀 관리)';
  RAISE NOTICE '   - user_quiz_history 테이블 생성 (랜덤 출제 이력)';
  RAISE NOTICE '   - 자동 트리거 및 RLS 정책 설정';
END $$;
-- Migration 005: Lesson Versions (Content Version Control)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Create lesson_versions table for tracking content changes
CREATE TABLE IF NOT EXISTS lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  raw_content TEXT,
  ai_processed BOOLEAN DEFAULT false,
  change_summary TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_lesson_version UNIQUE(lesson_id, version)
);

-- Create index for faster queries
CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX idx_lesson_versions_created_at ON lesson_versions(created_at DESC);

-- Enable RLS
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Trainers can view all versions of their lessons
CREATE POLICY "Trainers can view lesson versions"
  ON lesson_versions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('trainer', 'admin')
    )
  );

-- Only trainers/admins can insert new versions
CREATE POLICY "Trainers can create lesson versions"
  ON lesson_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('trainer', 'admin')
    )
  );

-- Function to auto-increment version number
CREATE OR REPLACE FUNCTION increment_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign next version number
  SELECT COALESCE(MAX(version), 0) + 1
  INTO NEW.version
  FROM lesson_versions
  WHERE lesson_id = NEW.lesson_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version
CREATE TRIGGER auto_increment_lesson_version
  BEFORE INSERT ON lesson_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_lesson_version();

-- Comments
COMMENT ON TABLE lesson_versions IS 'Version history for lesson content (PRD v3.0.0)';
COMMENT ON COLUMN lesson_versions.version IS 'Auto-incremented version number per lesson';
COMMENT ON COLUMN lesson_versions.change_summary IS 'Description of changes (e.g., "AI processed", "Manual edit")';
-- Migration 006: User Question History (Spaced Repetition System)
-- PRD v3.0.0 - SRS Quiz Algorithm (SuperMemo SM-2)
-- Created: 2025-01-17

-- Create user_question_history table for SRS tracking
CREATE TABLE IF NOT EXISTS user_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

  -- Attempt tracking
  attempts INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,

  -- SRS (Spaced Repetition System) fields
  next_review_at TIMESTAMP WITH TIME ZONE,
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 algorithm
  interval_days INTEGER DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_question UNIQUE(user_id, question_id),
  CONSTRAINT ease_factor_range CHECK (ease_factor >= 1.3 AND ease_factor <= 3.0),
  CONSTRAINT interval_positive CHECK (interval_days > 0)
);

-- Create indexes
CREATE INDEX idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX idx_user_question_history_question_id ON user_question_history(question_id);
CREATE INDEX idx_user_question_history_next_review ON user_question_history(next_review_at);
CREATE INDEX idx_user_question_history_user_review ON user_question_history(user_id, next_review_at);

-- Enable RLS
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own history
CREATE POLICY "Users can view own question history"
  ON user_question_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert/update their own history
CREATE POLICY "Users can update own question history"
  ON user_question_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update next_review_at based on SM-2 algorithm
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_is_correct BOOLEAN,
  p_ease_factor DECIMAL(3,2),
  p_interval_days INTEGER,
  p_consecutive_correct INTEGER
)
RETURNS TABLE(
  new_ease_factor DECIMAL(3,2),
  new_interval_days INTEGER,
  new_next_review_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_ease_factor DECIMAL(3,2);
  v_interval_days INTEGER;
BEGIN
  IF p_is_correct THEN
    -- Correct answer: increase ease factor slightly
    v_ease_factor := GREATEST(1.3, p_ease_factor + 0.1);

    -- Calculate next interval based on consecutive correct answers
    CASE p_consecutive_correct
      WHEN 0 THEN v_interval_days := 1;   -- First time correct: 1 day
      WHEN 1 THEN v_interval_days := 3;   -- Second time: 3 days
      WHEN 2 THEN v_interval_days := 7;   -- Third time: 7 days
      WHEN 3 THEN v_interval_days := 14;  -- Fourth time: 14 days
      ELSE v_interval_days := ROUND(p_interval_days * v_ease_factor)::INTEGER;
    END CASE;
  ELSE
    -- Incorrect answer: decrease ease factor, reset to 1 day
    v_ease_factor := GREATEST(1.3, p_ease_factor - 0.2);
    v_interval_days := 1;
  END IF;

  -- Ensure ease factor stays within bounds
  v_ease_factor := LEAST(3.0, GREATEST(1.3, v_ease_factor));

  RETURN QUERY SELECT
    v_ease_factor,
    v_interval_days,
    (NOW() + (v_interval_days || ' days')::INTERVAL)::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_question_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_question_history_updated_at
  BEFORE UPDATE ON user_question_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_question_history_timestamp();

-- Comments
COMMENT ON TABLE user_question_history IS 'SRS quiz history per user-question pair (PRD v3.0.0)';
COMMENT ON COLUMN user_question_history.ease_factor IS 'SM-2 ease factor (1.3-3.0)';
COMMENT ON COLUMN user_question_history.interval_days IS 'Days until next review';
COMMENT ON COLUMN user_question_history.next_review_at IS 'Scheduled review date (SRS)';
COMMENT ON FUNCTION calculate_next_review IS 'SuperMemo SM-2 algorithm for spaced repetition';
-- Migration 007: AI Processing Logs (Cost Tracking & Debugging)
-- PRD v3.0.0 - Cost Management & Monitoring
-- Created: 2025-01-17

-- Create ai_processing_logs table
CREATE TABLE IF NOT EXISTS ai_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity information
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lesson', 'quiz')),
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('content_cleanup', 'quiz_generation')),

  -- Input/Output
  input_text TEXT NOT NULL,
  output_text TEXT,

  -- AI Model information
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Performance & Cost
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_logs_entity ON ai_processing_logs(entity_type, entity_id);
CREATE INDEX idx_ai_logs_created_at ON ai_processing_logs(created_at DESC);
CREATE INDEX idx_ai_logs_status ON ai_processing_logs(status);
CREATE INDEX idx_ai_logs_operation ON ai_processing_logs(operation);
CREATE INDEX idx_ai_logs_cost ON ai_processing_logs(cost_usd DESC);

-- Enable RLS
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins/trainers can view logs
CREATE POLICY "Admins and trainers can view AI logs"
  ON ai_processing_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  );

-- System can insert logs (service role)
CREATE POLICY "Service role can insert AI logs"
  ON ai_processing_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create materialized view for cost analytics
CREATE MATERIALIZED VIEW ai_cost_analytics AS
SELECT
  DATE(created_at) as date,
  operation,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE status = 'success') as successful_operations,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_operations,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  AVG(processing_time_ms) as avg_processing_time_ms,
  AVG(confidence_score) FILTER (WHERE confidence_score IS NOT NULL) as avg_confidence_score
FROM ai_processing_logs
GROUP BY DATE(created_at), operation
ORDER BY date DESC, operation;

-- Create index on materialized view
CREATE INDEX idx_ai_cost_analytics_date ON ai_cost_analytics(date DESC);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_ai_cost_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ai_cost_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily cost summary
CREATE OR REPLACE FUNCTION get_daily_ai_cost()
RETURNS TABLE(
  date DATE,
  total_cost DECIMAL(10,2),
  operations_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    ROUND(SUM(cost_usd)::DECIMAL, 2) as total_cost,
    COUNT(*)::INTEGER as operations_count
  FROM ai_processing_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check budget alert
CREATE OR REPLACE FUNCTION check_daily_budget_alert(
  p_budget_limit DECIMAL DEFAULT 50.00
)
RETURNS TABLE(
  alert BOOLEAN,
  current_cost DECIMAL(10,2),
  budget_limit DECIMAL(10,2),
  percentage DECIMAL(5,2)
) AS $$
DECLARE
  v_current_cost DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(cost_usd), 0)
  INTO v_current_cost
  FROM ai_processing_logs
  WHERE DATE(created_at) = CURRENT_DATE;

  RETURN QUERY SELECT
    (v_current_cost >= p_budget_limit) as alert,
    v_current_cost,
    p_budget_limit,
    ROUND((v_current_cost / NULLIF(p_budget_limit, 0) * 100)::DECIMAL, 2) as percentage;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE ai_processing_logs IS 'AI processing logs with cost tracking (PRD v3.0.0)';
COMMENT ON COLUMN ai_processing_logs.cost_usd IS 'API cost in USD';
COMMENT ON COLUMN ai_processing_logs.confidence_score IS 'AI confidence score (0-100)';
COMMENT ON VIEW ai_cost_analytics IS 'Daily AI cost and performance analytics';
COMMENT ON FUNCTION get_daily_ai_cost IS 'Get daily AI costs for last 30 days';
COMMENT ON FUNCTION check_daily_budget_alert IS 'Check if daily budget limit exceeded';
-- Migration 008: Content Creation Metrics (Measurable Success Indicators)
-- PRD v3.0.0 - Success Metrics Section
-- Created: 2025-01-17

-- Create content_creation_metrics table
CREATE TABLE IF NOT EXISTS content_creation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Trainer and lesson information
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,

  -- Time tracking
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (saved_at - started_at)) / 60
  ) STORED,

  -- AI usage
  ai_used BOOLEAN DEFAULT false,
  edit_count INTEGER DEFAULT 0, -- Number of times AI result was edited

  -- Content metrics
  final_word_count INTEGER,

  -- Quality feedback
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_metrics_trainer ON content_creation_metrics(trainer_id);
CREATE INDEX idx_content_metrics_lesson ON content_creation_metrics(lesson_id);
CREATE INDEX idx_content_metrics_created_at ON content_creation_metrics(created_at DESC);
CREATE INDEX idx_content_metrics_ai_used ON content_creation_metrics(ai_used);

-- Enable RLS
ALTER TABLE content_creation_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Trainers can view their own metrics
CREATE POLICY "Trainers can view own metrics"
  ON content_creation_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON content_creation_metrics
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Trainers can insert their own metrics
CREATE POLICY "Trainers can insert own metrics"
  ON content_creation_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

-- Function to calculate AI effectiveness
CREATE OR REPLACE FUNCTION get_ai_effectiveness_metrics()
RETURNS TABLE(
  metric_name TEXT,
  ai_enabled DECIMAL(10,2),
  manual DECIMAL(10,2),
  improvement_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  -- Average duration
  WITH stats AS (
    SELECT
      AVG(duration_minutes) FILTER (WHERE ai_used = true) as ai_avg_duration,
      AVG(duration_minutes) FILTER (WHERE ai_used = false) as manual_avg_duration,
      AVG(satisfaction_score) FILTER (WHERE ai_used = true) as ai_avg_satisfaction,
      AVG(satisfaction_score) FILTER (WHERE ai_used = false) as manual_avg_satisfaction,
      AVG(edit_count) FILTER (WHERE ai_used = true) as ai_avg_edits
    FROM content_creation_metrics
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT 'avg_duration_minutes'::TEXT,
         ROUND(ai_avg_duration::DECIMAL, 2),
         ROUND(manual_avg_duration::DECIMAL, 2),
         ROUND(((manual_avg_duration - ai_avg_duration) / NULLIF(manual_avg_duration, 0) * 100)::DECIMAL, 2)
  FROM stats
  UNION ALL
  SELECT 'avg_satisfaction_score'::TEXT,
         ROUND(ai_avg_satisfaction::DECIMAL, 2),
         ROUND(manual_avg_satisfaction::DECIMAL, 2),
         ROUND(((ai_avg_satisfaction - manual_avg_satisfaction) / NULLIF(manual_avg_satisfaction, 0) * 100)::DECIMAL, 2)
  FROM stats
  UNION ALL
  SELECT 'avg_edit_count'::TEXT,
         ROUND(ai_avg_edits::DECIMAL, 2),
         0::DECIMAL,
         NULL::DECIMAL
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AI acceptance rate
CREATE OR REPLACE FUNCTION get_ai_acceptance_rate()
RETURNS TABLE(
  total_ai_sessions INTEGER,
  zero_edits INTEGER,
  acceptance_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_ai_sessions,
    COUNT(*) FILTER (WHERE edit_count = 0)::INTEGER as zero_edits,
    ROUND((COUNT(*) FILTER (WHERE edit_count = 0)::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL, 2) as acceptance_rate
  FROM content_creation_metrics
  WHERE ai_used = true
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE content_creation_metrics IS 'Content creation time tracking (PRD v3.0.0)';
COMMENT ON COLUMN content_creation_metrics.duration_minutes IS 'Auto-calculated from saved_at - started_at';
COMMENT ON COLUMN content_creation_metrics.edit_count IS 'Number of edits to AI-generated content';
COMMENT ON COLUMN content_creation_metrics.satisfaction_score IS 'Trainer satisfaction rating (1-5)';
COMMENT ON FUNCTION get_ai_effectiveness_metrics IS 'Compare AI vs manual content creation';
COMMENT ON FUNCTION get_ai_acceptance_rate IS 'Calculate AI result acceptance rate';
-- Migration 009: Poker Glossary (Domain Terminology Validation)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Create poker_glossary table
CREATE TABLE IF NOT EXISTS poker_glossary (
  term TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  context_examples TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('betting', 'hands', 'positions', 'actions', 'tournament', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_poker_glossary_category ON poker_glossary(category);
CREATE INDEX idx_poker_glossary_aliases ON poker_glossary USING GIN(aliases);

-- Enable RLS
ALTER TABLE poker_glossary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read glossary
CREATE POLICY "Everyone can read poker glossary"
  ON poker_glossary
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins/trainers can modify glossary
CREATE POLICY "Admins and trainers can modify glossary"
  ON poker_glossary
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'trainer')
    )
  );

-- Function to search glossary (including aliases)
CREATE OR REPLACE FUNCTION search_poker_term(p_search_term TEXT)
RETURNS TABLE(
  term TEXT,
  definition TEXT,
  category TEXT,
  matched_by TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.term,
    g.definition,
    g.category,
    CASE
      WHEN LOWER(g.term) = LOWER(p_search_term) THEN 'exact_term'
      WHEN p_search_term = ANY(g.aliases) THEN 'alias'
      WHEN LOWER(g.term) LIKE LOWER('%' || p_search_term || '%') THEN 'partial_term'
      ELSE 'alias_partial'
    END as matched_by
  FROM poker_glossary g
  WHERE LOWER(g.term) = LOWER(p_search_term)
     OR p_search_term = ANY(g.aliases)
     OR LOWER(g.term) LIKE LOWER('%' || p_search_term || '%')
     OR EXISTS (
       SELECT 1 FROM unnest(g.aliases) AS alias
       WHERE LOWER(alias) LIKE LOWER('%' || p_search_term || '%')
     )
  ORDER BY
    CASE
      WHEN LOWER(g.term) = LOWER(p_search_term) THEN 1
      WHEN p_search_term = ANY(g.aliases) THEN 2
      WHEN LOWER(g.term) LIKE LOWER('%' || p_search_term || '%') THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to validate content for unknown terms
CREATE OR REPLACE FUNCTION validate_poker_content(p_content TEXT)
RETURNS TABLE(
  unknown_terms TEXT[],
  suggestion_count INTEGER
) AS $$
DECLARE
  v_words TEXT[];
  v_word TEXT;
  v_unknown_terms TEXT[] := '{}';
BEGIN
  -- Extract words from content (simple tokenization)
  v_words := regexp_split_to_array(LOWER(p_content), '\s+');

  -- Check each capitalized or poker-specific word
  FOREACH v_word IN ARRAY v_words
  LOOP
    -- Skip short words and common words
    IF LENGTH(v_word) > 3 AND v_word !~ '^[0-9]+$' THEN
      -- Check if term exists in glossary
      IF NOT EXISTS (
        SELECT 1 FROM poker_glossary g
        WHERE LOWER(g.term) = v_word
           OR v_word = ANY(g.aliases)
      ) THEN
        -- Add to unknown terms if looks like poker term (contains uppercase in original)
        IF position(upper(substring(v_word, 1, 1)) in p_content) > 0 THEN
          v_unknown_terms := array_append(v_unknown_terms, v_word);
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT
    array_agg(DISTINCT u) FILTER (WHERE u IS NOT NULL) as unknown_terms,
    COUNT(DISTINCT u)::INTEGER as suggestion_count
  FROM unnest(v_unknown_terms) u;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_poker_glossary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_poker_glossary_updated_at
  BEFORE UPDATE ON poker_glossary
  FOR EACH ROW
  EXECUTE FUNCTION update_poker_glossary_timestamp();

-- Comments
COMMENT ON TABLE poker_glossary IS 'Poker terminology dictionary (PRD v3.0.0)';
COMMENT ON COLUMN poker_glossary.aliases IS 'Alternative names (e.g., Korean translations)';
COMMENT ON COLUMN poker_glossary.context_examples IS 'Example sentences using the term';
COMMENT ON FUNCTION search_poker_term IS 'Search glossary by term or alias';
COMMENT ON FUNCTION validate_poker_content IS 'Check content for unknown poker terms';
-- Migration 010: AI Confidence Score (Lessons Table Extension)
-- PRD v3.0.0 - AI Quality System
-- Created: 2025-01-17

-- Add ai_confidence_score column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(5,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100);

-- Create index for filtering by confidence
CREATE INDEX IF NOT EXISTS idx_lessons_ai_confidence ON lessons(ai_confidence_score DESC);

-- Create index for AI processed lessons
CREATE INDEX IF NOT EXISTS idx_lessons_ai_processed ON lessons(ai_processed) WHERE ai_processed = true;

-- Function to categorize confidence level
CREATE OR REPLACE FUNCTION get_confidence_level(p_score DECIMAL)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_score IS NULL THEN 'not_processed'
    WHEN p_score >= 90 THEN 'excellent'  -- Can save immediately
    WHEN p_score >= 70 THEN 'good'       -- Review recommended
    WHEN p_score >= 50 THEN 'fair'       -- Manual editing needed
    ELSE 'poor'                          -- Major revisions required
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get lesson stats by confidence level
CREATE OR REPLACE FUNCTION get_lesson_confidence_stats()
RETURNS TABLE(
  confidence_level TEXT,
  lesson_count INTEGER,
  percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      get_confidence_level(ai_confidence_score) as level,
      COUNT(*) as count
    FROM lessons
    WHERE ai_processed = true
    GROUP BY get_confidence_level(ai_confidence_score)
  ),
  total AS (
    SELECT SUM(count)::INTEGER as total_count
    FROM stats
  )
  SELECT
    s.level,
    s.count::INTEGER,
    ROUND((s.count::DECIMAL / NULLIF(t.total_count, 0) * 100)::DECIMAL, 2) as percentage
  FROM stats s, total t
  ORDER BY
    CASE s.level
      WHEN 'excellent' THEN 1
      WHEN 'good' THEN 2
      WHEN 'fair' THEN 3
      WHEN 'poor' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to recommend lessons for review
CREATE OR REPLACE FUNCTION get_lessons_for_review(
  p_min_confidence DECIMAL DEFAULT 70,
  p_max_confidence DECIMAL DEFAULT 90
)
RETURNS TABLE(
  lesson_id UUID,
  title TEXT,
  confidence_score DECIMAL(5,2),
  confidence_level TEXT,
  ai_processed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id as lesson_id,
    l.title,
    l.ai_confidence_score,
    get_confidence_level(l.ai_confidence_score) as confidence_level,
    l.ai_processed_at
  FROM lessons l
  WHERE l.ai_processed = true
    AND l.ai_confidence_score >= p_min_confidence
    AND l.ai_confidence_score < p_max_confidence
  ORDER BY l.ai_confidence_score DESC, l.ai_processed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Update existing lessons to have NULL confidence score (not yet processed)
UPDATE lessons
SET ai_confidence_score = NULL
WHERE ai_processed = false OR ai_processed IS NULL;

-- Comments
COMMENT ON COLUMN lessons.ai_confidence_score IS 'AI processing confidence (0-100), NULL if not processed';
COMMENT ON FUNCTION get_confidence_level IS 'Categorize confidence score: excellent/good/fair/poor';
COMMENT ON FUNCTION get_lesson_confidence_stats IS 'Distribution of lessons by confidence level';
COMMENT ON FUNCTION get_lessons_for_review IS 'Get lessons needing manual review based on confidence';
