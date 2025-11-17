# 📚 문서 안내 (Documentation Guide)

GG Production 학습 플랫폼의 모든 문서를 쉽게 찾을 수 있도록 정리한 가이드입니다.

---

## 🚀 빠른 시작

프로젝트를 처음 시작하시나요? 아래 문서를 순서대로 읽어보세요:

1. [QUICK_START.md](../QUICK_START.md) - 20분 빠른 시작 가이드
2. [DEVELOPMENT.md](../DEVELOPMENT.md) - 개발 워크플로우 이해하기
3. [CLAUDE.md](../CLAUDE.md) - AI 개발 도구 활용법

---

## 📖 핵심 문서

### 🛠️ 개발 & 기여

- [CONTRIBUTING.md](../CONTRIBUTING.md) - 기여 가이드라인
- [DEVELOPMENT.md](../DEVELOPMENT.md) - 개발 워크플로우, 마이그레이션, PR 자동화
- [CLAUDE.md](../CLAUDE.md) - Claude Code 활용 가이드

### 🚀 배포 & 운영

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Vercel 배포 완전 가이드
- [TESTING.md](../TESTING.md) - Unit, E2E, 성능 테스트

### 🆘 문제 해결

- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 일반적인 문제 및 해결책
- [CHANGELOG.md](../CHANGELOG.md) - 버전 히스토리

---

## 📂 역할별 문서 추천

### 신규 개발자
1. [QUICK_START.md](../QUICK_START.md) - 환경 설정 (20분)
2. [CONTRIBUTING.md](../CONTRIBUTING.md) - 코드 스타일, PR 프로세스
3. [DEVELOPMENT.md](../DEVELOPMENT.md) - 개발 워크플로우

### 배포 담당자
1. [DEPLOYMENT.md](../DEPLOYMENT.md) - 배포 절차
2. [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 배포 문제 해결
3. [CHANGELOG.md](../CHANGELOG.md) - 버전 확인

### QA/테스터
1. [TESTING.md](../TESTING.md) - 테스트 실행 방법
2. [tests/e2e/README.md](../tests/e2e/README.md) - E2E 테스트 상세
3. [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 테스트 문제 해결

---

## 📁 하위 문서

### 스크립트
- [scripts/README.md](../scripts/README.md) - 자동화 스크립트 사용법

### 작업 관리
- [tasks/README.md](../tasks/README.md) - PRD 및 Task List 관리

### 테스트
- [tests/e2e/README.md](../tests/e2e/README.md) - Playwright E2E 테스트 가이드

---

## 🗂️ 레거시 문서

이전 문서들은 참조용으로 아카이브에 보관되어 있습니다:

- [archive/](./archive/) - 구버전 문서 (27개)
  - `setup/` - 환경 설정 가이드 (6개)
  - `deployment/` - 배포 가이드 (6개)
  - `development/` - 개발 가이드 (5개)
  - `testing/` - 테스트 가이드 (2개)
  - `architecture/` - 아키텍처 문서 (1개)
  - `reference/` - 참조 문서 (2개)
  - `planning/` - 계획 문서 (2개)

**주의**: 아카이브 문서는 참조용입니다. 최신 정보는 루트 폴더의 통합 문서를 참조하세요.

---

## 🔍 문서 찾기 팁

### 검색 방법

**키워드로 검색**:
```bash
# 모든 문서에서 검색
grep -r "키워드" *.md

# 특정 주제 검색
grep -r "Supabase" *.md
grep -r "배포" *.md
```

**파일명으로 찾기**:
```bash
# README 파일 찾기
find . -name "README.md" -not -path "./node_modules/*"

# 모든 .md 파일 찾기
find . -name "*.md" -not -path "./node_modules/*"
```

---

## 📋 문서 업데이트 이력

### v2.0.0 (2025-01-17) - 대대적 구조 개편
- 27개 문서 → 9개 핵심 문서로 통합 (67% 감소)
- 역할 기반 네비게이션 추가
- 레거시 문서 아카이브로 이동
- 모든 문서 한글화 (일부 기술 용어 제외)

### v1.0.0 (2025-01-13) - 초기 문서화
- 카테고리별 문서 분리 (setup, deployment, development, testing)
- 총 27개 개별 문서 작성

---

## 💡 문서 기여

문서 개선에 참여하고 싶으신가요?

1. 오타 또는 잘못된 정보 발견 시 [이슈 등록](https://github.com/garimto81/ojt-platform/issues)
2. 문서 개선 제안은 [Pull Request](https://github.com/garimto81/ojt-platform/pulls) 생성
3. [CONTRIBUTING.md](../CONTRIBUTING.md) 참조

---

## 🆘 추가 도움말

- **Slack**: #ojt-platform-dev 채널
- **Email**: support@ggproduction.com
- **GitHub Issues**: [문제 보고](https://github.com/garimto81/ojt-platform/issues)

---

**버전**: 2.0.0 | **최종 업데이트**: 2025-01-17
