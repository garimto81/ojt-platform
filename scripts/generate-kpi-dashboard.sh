#!/bin/bash
# KPI Dashboard 자동 생성
# Usage: bash scripts/generate-kpi-dashboard.sh

set -e

echo "📊 Generating KPI Dashboard..."

# 1. 완료된 작업 수
COMPLETED=$(find tasks -name "*.md" -exec grep -l '\[x\]' {} \; 2>/dev/null | wc -l)
TOTAL=$(find tasks -name "*.md" 2>/dev/null | wc -l)
PROGRESS=0
if [ $TOTAL -gt 0 ]; then
  PROGRESS=$((COMPLETED * 100 / TOTAL))
fi

# 2. 에이전트 성공률
AGENT_SUCCESS="N/A"
if [ -f .claude/evolution/scripts/analyze_quality2.py ]; then
  AGENT_SUCCESS=$(python .claude/evolution/scripts/analyze_quality2.py --summary 2>/dev/null | grep "Average Success" | awk '{print $3}' || echo "N/A")
fi

# 3. 테스트 커버리지
COVERAGE="N/A"
if command -v npm &> /dev/null; then
  if npm run test:ci &> /dev/null; then
    if [ -f coverage/coverage-summary.json ]; then
      COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct' 2>/dev/null || echo "N/A")
      COVERAGE="${COVERAGE}%"
    fi
  fi
fi

# 4. Git 통계
COMMITS_TODAY=$(git log --since="today" --oneline | wc -l)
COMMITS_WEEK=$(git log --since="7 days ago" --oneline | wc -l)

# 5. GitHub Issues
OPEN_ISSUES=$(gh issue list --state open --json number -q '. | length' 2>/dev/null || echo "N/A")
CLOSED_ISSUES=$(gh issue list --state closed --limit 100 --json number -q '. | length' 2>/dev/null || echo "N/A")

# 6. 최근 배포
LAST_DEPLOYMENT=$(vercel ls --limit 1 2>/dev/null | tail -1 | awk '{print $1, $2, $4}' || echo "N/A")

# 7. 마크다운 생성
cat > KPI_DASHBOARD.md <<EOF
# 📊 실시간 KPI 대시보드

**최종 업데이트**: $(date "+%Y-%m-%d %H:%M:%S")

---

## 📈 전체 진행률

| 항목 | 현재 | 목표 | 상태 |
|------|------|------|------|
| **완료 작업** | $COMPLETED / $TOTAL | 100% | $PROGRESS% |
| **에이전트 성공률** | $AGENT_SUCCESS | >80% | $([ "$AGENT_SUCCESS" != "N/A" ] && echo "✅" || echo "⏳") |
| **테스트 커버리지** | $COVERAGE | >80% | $([ "$COVERAGE" != "N/A" ] && echo "✅" || echo "⏳") |

---

## 🚀 개발 활동

| 항목 | 값 |
|------|-----|
| **오늘 커밋** | $COMMITS_TODAY |
| **이번 주 커밋** | $COMMITS_WEEK |
| **Open Issues** | $OPEN_ISSUES |
| **Closed Issues** | $CLOSED_ISSUES |

---

## 🌐 배포 상태

| 항목 | 정보 |
|------|------|
| **최근 배포** | $LAST_DEPLOYMENT |
| **프로덕션 URL** | https://ojt-platform.vercel.app |
| **배포 방식** | Vercel (자동) |

---

## 📅 주간 목표 (v1.0.0 로드맵)

### Week 1-2 (11/18 - 12/1): AI Content System (v0.6.0)
- [ ] AI 콘텐츠 정리 시스템 구현
- [ ] 랜덤 퀴즈 풀 시스템 구현

### Week 3-4 (12/2 - 12/15): UX Enhancement (v0.7.0)
- [ ] Google Analytics 4 연동
- [ ] A/B 테스트 데이터 수집
- [ ] 알림 시스템 구축
- [ ] 게이미피케이션 강화

### Week 5-6 (12/16 - 12/29): Admin + Performance (v0.8.0)
- [ ] 트레이너 대시보드
- [ ] 콘텐츠 검색 기능
- [ ] 성능 최적화 (Bundle size, Lighthouse)
- [ ] 보안 강화 (Rate limiting, CSRF)

### Week 7-8 (12/30 - 1/12): Mobile PWA (v1.0.0)
- [ ] PWA 전환
- [ ] 모바일 UI 개선
- [ ] E2E 테스트 전체
- [ ] 최종 안정화

---

## 🎯 성공 지표 (KPI Targets)

### 사용자 지표
- **일일 활성 사용자 (DAU)**: 목표 50명
- **7일 완강률**: 목표 60%
- **평균 세션 시간**: 목표 20분
- **재방문율**: 목표 70%

### 학습 효과 지표
- **퀴즈 평균 정답률**: 목표 75%
- **레슨 평균 완료 시간**: 목표 25분
- **복습 참여율**: 목표 40%

### 기술 지표
- **Lighthouse Performance**: 목표 90+ 점
- **페이지 로드 시간**: 목표 <2초
- **API 응답 시간**: 목표 <500ms
- **에러율**: 목표 <1%

---

**📄 문서**: [AUTOMATED_WORKFLOW_8WEEKS.md](AUTOMATED_WORKFLOW_8WEEKS.md)
**🤖 에이전트 로그**: \`.agent-quality-v2.jsonl\`
**📋 작업 목록**: [NEXT_DEVELOPMENT_ROADMAP.md](NEXT_DEVELOPMENT_ROADMAP.md)
EOF

echo "✅ KPI Dashboard generated: KPI_DASHBOARD.md"
cat KPI_DASHBOARD.md
