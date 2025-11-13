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
