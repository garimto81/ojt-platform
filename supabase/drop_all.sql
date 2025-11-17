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
DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard CASCADE;
DROP TRIGGER IF EXISTS increment_profile_points ON public.quiz_attempts CASCADE;
DROP TRIGGER IF EXISTS update_lesson_versions_updated_at ON public.lesson_versions CASCADE;
DROP TRIGGER IF EXISTS update_user_question_history_updated_at ON public.user_question_history CASCADE;
DROP TRIGGER IF EXISTS update_ai_processing_logs_updated_at ON public.ai_processing_logs CASCADE;
DROP TRIGGER IF EXISTS update_content_metrics_updated_at ON public.content_metrics CASCADE;
DROP TRIGGER IF EXISTS update_poker_glossary_updated_at ON public.poker_glossary CASCADE;

-- 2. 모든 함수 삭제
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.increment_user_points() CASCADE;

-- 3. 모든 테이블 삭제 (외래키 순서 고려하여 역순)
DROP TABLE IF EXISTS public.poker_glossary CASCADE;
DROP TABLE IF EXISTS public.content_metrics CASCADE;
DROP TABLE IF EXISTS public.ai_processing_logs CASCADE;
DROP TABLE IF EXISTS public.user_question_history CASCADE;
DROP TABLE IF EXISTS public.lesson_versions CASCADE;
DROP TABLE IF EXISTS public.quiz_pools CASCADE;
DROP TABLE IF EXISTS public.leaderboard_snapshots CASCADE;
DROP TABLE IF EXISTS public.leaderboard CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_days CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. RLS 정책 삭제는 테이블과 함께 CASCADE로 삭제됨
