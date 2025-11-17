-- ============================================
-- 기존 구조 완전 삭제 스크립트 (간소화 버전)
-- ============================================

-- public 스키마 전체를 삭제하고 다시 생성
-- 이렇게 하면 모든 테이블, 뷰, 함수, 트리거가 한 번에 삭제됩니다.
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- public 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- 기본 권한 설정 (앞으로 생성될 객체에 대해)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;
