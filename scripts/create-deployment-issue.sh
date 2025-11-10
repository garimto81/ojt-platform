#!/bin/bash

# GitHub API를 사용하여 배포 체크리스트 Issue 생성

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}📋 프로덕션 배포 이슈 생성${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN 환경 변수가 필요합니다.${NC}"
    echo ""
    read -p "GitHub Personal Access Token을 입력하세요: " GITHUB_TOKEN

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ 토큰이 입력되지 않았습니다.${NC}"
        exit 1
    fi
fi

# 저장소 정보
REPO_OWNER="garimto81"
REPO_NAME="ojt-platform"

echo -e "${GREEN}✅ 저장소: $REPO_OWNER/$REPO_NAME${NC}"
echo ""

# Issue 제목과 본문
ISSUE_TITLE="🚀 프로덕션 배포: localhost → Vercel 마이그레이션"

# Issue 본문
ISSUE_BODY=$(cat << 'EOF'
## 🎯 목표

localhost:3000 개발 환경에서 Vercel 프로덕션 환경으로 완전 마이그레이션

---

## 📋 배포 전 체크리스트

### 1. 코드 준비
- [x] 모든 버그 수정 완료
- [x] 빌드 테스트 통과
- [x] TypeScript 컴파일 성공
- [x] PR #2 생성 완료

### 2. 환경 변수 설정 (CRITICAL!)
- [ ] Vercel 환경 변수 설정
  ```bash
  vercel login
  npm run setup:vercel
  ```
  필수 환경 변수:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`

### 3. Supabase 설정
- [ ] Redirect URLs 추가
  - [ ] `https://your-app.vercel.app`
  - [ ] `https://your-app.vercel.app/auth/callback`
  - [ ] `https://your-app.vercel.app/**`
- [ ] Site URL 업데이트
- [ ] CORS 설정 확인

---

## 🚀 배포 단계

### 1. PR 병합
- [ ] PR #2 리뷰
- [ ] "Merge pull request" 클릭
- [ ] 브랜치 삭제 (선택)

### 2. 자동 배포 시작
- [ ] Vercel 대시보드 접속
- [ ] 배포 상태 확인
- [ ] 빌드 로그 모니터링

### 3. 배포 완료 확인
- [ ] 배포 성공 확인
- [ ] 프로덕션 URL 접속
- [ ] 메인 페이지 로딩 확인

---

## ✅ 배포 후 검증

### 기능 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 대시보드 접속
- [ ] 커리큘럼 조회
- [ ] 레슨 조회
- [ ] API 엔드포인트 테스트

### 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 최적화
- [ ] API 응답 시간

### 에러 확인
- [ ] Vercel 에러 로그 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] Supabase 연결 확인

---

## 📚 참고 문서

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md)
- [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md)
- [PR #2](https://github.com/garimto81/ojt-platform/pull/2)

---

## ⏱️ 예상 소요 시간

- 환경 변수 설정: 10분
- PR 병합 및 배포: 5분
- 검증: 10분
- **총합: 약 25분**

---

## 🎉 완료 기준

- [ ] 모든 체크리스트 완료
- [ ] 프로덕션 URL 정상 작동
- [ ] 모든 기능 테스트 통과
- [ ] 에러 없음
EOF
)

# JSON 이스케이프
json_escape() {
    python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

ISSUE_BODY_ESCAPED=$(echo "$ISSUE_BODY" | json_escape)

# JSON 페이로드
JSON_PAYLOAD=$(cat << EOF
{
  "title": "$ISSUE_TITLE",
  "body": $ISSUE_BODY_ESCAPED,
  "labels": ["deployment", "production", "enhancement"]
}
EOF
)

echo -e "${YELLOW}📤 Issue 생성 중...${NC}"
echo ""

# GitHub API로 Issue 생성
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues" \
  -d "$JSON_PAYLOAD")

# HTTP 상태 코드 추출
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    ISSUE_URL=$(echo "$BODY" | grep -o '"html_url": *"[^"]*"' | head -1 | sed 's/"html_url": *"\(.*\)"/\1/')
    ISSUE_NUMBER=$(echo "$BODY" | grep -o '"number": *[0-9]*' | head -1 | sed 's/"number": *\([0-9]*\)/\1/')

    echo -e "${GREEN}=====================================================================${NC}"
    echo -e "${GREEN}✅ Issue가 성공적으로 생성되었습니다!${NC}"
    echo -e "${GREEN}=====================================================================${NC}"
    echo ""
    echo -e "${BLUE}Issue #$ISSUE_NUMBER${NC}"
    echo -e "${BLUE}URL: $ISSUE_URL${NC}"
    echo ""
    echo -e "${GREEN}🎉 배포 체크리스트 이슈가 생성되었습니다.${NC}"
    echo ""
    echo -e "${YELLOW}다음 단계:${NC}"
    echo "1. Issue 확인: $ISSUE_URL"
    echo "2. 체크리스트 따라 배포 진행"
    echo "3. 각 단계 완료 시 체크"
    echo "4. 모든 배포 완료 후 Issue 종료"
    echo ""
else
    echo -e "${RED}=====================================================================${NC}"
    echo -e "${RED}❌ Issue 생성 실패${NC}"
    echo -e "${RED}=====================================================================${NC}"
    echo ""
    echo -e "${RED}HTTP 상태 코드: $HTTP_CODE${NC}"
    echo ""
    echo "응답:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    exit 1
fi
