#!/bin/bash

# GitHub API를 사용하여 Pull Request 자동 생성
# GitHub Personal Access Token이 필요합니다

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🚀 GitHub API를 사용한 Pull Request 자동 생성${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN 환경 변수가 설정되지 않았습니다.${NC}"
    echo ""
    echo -e "${BLUE}GitHub Personal Access Token이 필요합니다.${NC}"
    echo ""
    echo "1. https://github.com/settings/tokens 접속"
    echo "2. 'Generate new token' → 'Generate new token (classic)' 클릭"
    echo "3. 권한 선택: repo (Full control of private repositories)"
    echo "4. 토큰 생성 및 복사"
    echo ""
    read -p "GitHub Personal Access Token을 입력하세요: " GITHUB_TOKEN

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ 토큰이 입력되지 않았습니다.${NC}"
        exit 1
    fi
fi

# 저장소 정보 추출
REPO_URL=$(git config --get remote.origin.url)
REPO_OWNER="garimto81"
REPO_NAME="ojt-platform"

# 현재 브랜치
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_BRANCH="main"

echo -e "${GREEN}✅ 저장소: $REPO_OWNER/$REPO_NAME${NC}"
echo -e "${GREEN}✅ 브랜치: $CURRENT_BRANCH → $BASE_BRANCH${NC}"
echo ""

# PR 제목과 본문
PR_TITLE="fix: 배포 실패 문제 해결 및 환경 설정 자동화"

# PR 본문을 파일에서 읽기
PR_BODY=$(cat << 'EOF'
## 🎯 개요

Vercel 배포 실패 문제를 해결하고, Supabase 및 Vercel 환경 변수 설정을 자동화하는 CLI 스크립트를 추가했습니다.

---

## 🐛 수정된 버그

### 1. 초기화 관련 버그 (5개)
- ✅ `GEMINI_API_KEY` 환경 변수 검증 추가
- ✅ `userRole`을 데이터베이스에서 동적으로 가져오도록 수정
- ✅ Supabase 클라이언트 초기화 시 환경 변수 검증 추가
- ✅ 환경 변수 누락 시 명확한 한국어 에러 메시지 제공

**수정 파일:**
- `src/app/api/admin/generate-quiz/route.ts`
- `src/app/dashboard/layout.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/middleware.ts`

### 2. Vercel 배포 실패 문제
- ✅ Google Fonts 네트워크 문제 해결 (Inter 폰트 제거, 시스템 폰트 사용)
- ✅ API Routes 동적 렌더링 설정 (`dynamic='force-dynamic'` 추가)
- ✅ Assessment 페이지 빈 배열 처리
- ✅ TypeScript 타입 에러 수정

**수정 파일:**
- `src/app/layout.tsx`
- `src/app/api/curriculum/route.ts`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/stats/public/route.ts`
- `src/app/dashboard/assessment/page.tsx`
- `prisma/seed.ts`

### 3. 이미지 도메인 설정 개선
- ✅ `domains` 배열을 `remotePatterns`로 변경 (보안 강화)
- ✅ Vercel 도메인 (`**.vercel.app`) 추가

**수정 파일:**
- `next.config.js`

---

## ✨ 추가된 기능

### CLI 자동화 스크립트

#### `npm run setup:supabase`
Supabase 환경 변수를 대화형으로 입력받아 `.env.local` 파일을 자동 생성합니다.

#### `npm run setup:vercel`
Vercel 환경 변수를 자동으로 설정합니다.

#### `npm run check-env`
환경 변수 설정을 확인하고 누락된 항목을 알려줍니다.

**추가 파일:**
- `scripts/check-env.js`
- `scripts/get-supabase-config.js`
- `scripts/setup-vercel-env.js`

---

## 📚 추가된 문서

- **DEPLOYMENT_ISSUES.md** - 배포 문제 분석 및 해결 방안
- **VERCEL_DEPLOYMENT_GUIDE.md** - 완전한 배포 가이드
- **QUICK_SETUP_GUIDE.md** - CLI 자동화 스크립트 사용 가이드
- **NEXT_STEPS.md** - 다음 단계 옵션

---

## 🌐 한국어 기본 설정

- ✅ HTML `lang` 속성을 "ko"로 변경
- ✅ 에러 메시지 한국어 번역
- ✅ 사용자 친화적인 UI 메시지

---

## 🧪 테스트

**로컬 빌드:** ✅ 성공 (20/20 페이지)
**TypeScript:** ✅ 통과
**환경 변수:** ✅ 검증 통과

---

## 📊 변경 통계

- **커밋:** 8개
- **파일 수정:** 18개
- **코드 추가:** 2,500+ 줄
- **문서 추가:** 6개

---

## 🚀 배포 방법

### 로컬 환경 설정
\`\`\`bash
npm run setup:supabase
npm run check-env
npm run dev
\`\`\`

### Vercel 배포
\`\`\`bash
vercel login
npm run setup:vercel
git push origin main
\`\`\`

---

## 📋 병합 후 체크리스트

- [ ] Vercel 자동 배포 확인
- [ ] Supabase Redirect URLs 설정
- [ ] 프로덕션 URL 접속 테스트
- [ ] 로그인/회원가입 테스트

---

## 📖 관련 문서

- [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md)
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md)
- [NEXT_STEPS.md](./NEXT_STEPS.md)
EOF
)

# JSON 이스케이프 처리 함수
json_escape() {
    python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

# PR 본문을 JSON으로 이스케이프
PR_BODY_ESCAPED=$(echo "$PR_BODY" | json_escape)

# JSON 페이로드 생성
JSON_PAYLOAD=$(cat << EOF
{
  "title": "$PR_TITLE",
  "body": $PR_BODY_ESCAPED,
  "head": "$CURRENT_BRANCH",
  "base": "$BASE_BRANCH"
}
EOF
)

echo -e "${YELLOW}📤 Pull Request 생성 중...${NC}"
echo ""

# GitHub API로 PR 생성
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls" \
  -d "$JSON_PAYLOAD")

# HTTP 상태 코드 추출
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    # PR URL 추출
    PR_URL=$(echo "$BODY" | grep -o '"html_url": *"[^"]*"' | head -1 | sed 's/"html_url": *"\(.*\)"/\1/')
    PR_NUMBER=$(echo "$BODY" | grep -o '"number": *[0-9]*' | head -1 | sed 's/"number": *\([0-9]*\)/\1/')

    echo -e "${GREEN}=====================================================================${NC}"
    echo -e "${GREEN}✅ Pull Request가 성공적으로 생성되었습니다!${NC}"
    echo -e "${GREEN}=====================================================================${NC}"
    echo ""
    echo -e "${BLUE}PR #$PR_NUMBER${NC}"
    echo -e "${BLUE}URL: $PR_URL${NC}"
    echo ""
    echo -e "${GREEN}🎉 축하합니다! PR이 생성되었습니다.${NC}"
    echo ""
    echo -e "${YELLOW}다음 단계:${NC}"
    echo "1. PR 확인: $PR_URL"
    echo "2. Reviewers 지정 (선택사항)"
    echo "3. Labels 추가 (선택사항)"
    echo "4. PR 병합"
    echo ""
elif [ "$HTTP_CODE" = "422" ]; then
    ERROR_MSG=$(echo "$BODY" | grep -o '"message": *"[^"]*"' | sed 's/"message": *"\(.*\)"/\1/')
    echo -e "${YELLOW}=====================================================================${NC}"
    echo -e "${YELLOW}⚠️  Pull Request가 이미 존재하거나 동일한 변경사항입니다.${NC}"
    echo -e "${YELLOW}=====================================================================${NC}"
    echo ""
    echo -e "${YELLOW}메시지: $ERROR_MSG${NC}"
    echo ""
    echo "기존 PR 확인:"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/pulls"
    echo ""
else
    echo -e "${RED}=====================================================================${NC}"
    echo -e "${RED}❌ Pull Request 생성 실패${NC}"
    echo -e "${RED}=====================================================================${NC}"
    echo ""
    echo -e "${RED}HTTP 상태 코드: $HTTP_CODE${NC}"
    echo ""
    echo "응답:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${YELLOW}문제 해결:${NC}"
    echo "1. GitHub Token 권한 확인 (repo 권한 필요)"
    echo "2. 브랜치가 원격에 푸시되었는지 확인"
    echo "3. 저장소 이름 확인: $REPO_OWNER/$REPO_NAME"
    echo ""
    exit 1
fi
