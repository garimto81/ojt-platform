#!/bin/bash

# PR 생성 정보 출력 스크립트

echo "======================================================================"
echo "🚀 Pull Request 생성 가이드"
echo "======================================================================"
echo ""

# 현재 브랜치 확인
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 현재 브랜치: $BRANCH"
echo ""

# 커밋 수 확인
COMMIT_COUNT=$(git rev-list --count HEAD)
echo "📊 총 커밋 수: $COMMIT_COUNT"
echo ""

# 최근 커밋 5개 표시
echo "📝 최근 커밋:"
git log --oneline -7
echo ""

echo "======================================================================"
echo "🔗 PR 생성 방법"
echo "======================================================================"
echo ""
echo "방법 1: 직접 링크로 이동 (가장 빠름)"
echo ""
echo "다음 URL을 브라우저에서 열어주세요:"
echo "https://github.com/garimto81/ojt-platform/compare/main...$BRANCH"
echo ""
echo "======================================================================"
echo ""
echo "방법 2: GitHub 웹사이트에서 수동으로 생성"
echo ""
echo "1. https://github.com/garimto81/ojt-platform 접속"
echo "2. 'Pull requests' 탭 클릭"
echo "3. 'New pull request' 버튼 클릭"
echo "4. base: main, compare: $BRANCH 선택"
echo "5. 'Create pull request' 클릭"
echo ""
echo "======================================================================"
echo ""
echo "📋 PR 제목:"
echo "fix: 배포 실패 문제 해결 및 환경 설정 자동화"
echo ""
echo "======================================================================"
echo ""
echo "📄 PR 본문은 다음 파일을 참고하세요:"
echo "cat PR_TEMPLATE.md"
echo ""
echo "======================================================================"
echo ""
echo "✅ 준비 완료! 위 링크로 PR을 생성하세요!"
echo ""
