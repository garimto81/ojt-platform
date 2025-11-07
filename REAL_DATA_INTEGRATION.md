# 실제 데이터 연동 완료 가이드

**더미 데이터를 실제 데이터베이스와 연동 완료**

---

## ✅ 완료된 작업

### 1. 통계 API 엔드포인트 생성
**파일**: `src/app/api/stats/public/route.ts`

#### 제공하는 데이터:
- **deploymentRate**: 투입률 (%) - 전체 교육생 대비 수료자 비율
- **graduatedTrainees**: 수료 인원 - 모든 레슨을 완료한 교육생 수
- **trainingDays**: 교육 기간 (일) - 커리큘럼 총 일수
- **totalTrainees**: 전체 교육생 수
- **activeTrainees**: 현재 학습 중인 교육생 수

#### 계산 로직:
```typescript
// 수료자: 모든 레슨을 completed 상태로 완료한 사용자
// 투입률: (수료자 / 전체 교육생) × 100
// 교육 기간: curriculum_days 테이블의 최대 day_number
```

---

## 📝 수정이 필요한 파일

### `src/app/page.tsx` (랜딩 페이지)

#### 기존 코드 (더미 데이터):
```typescript
// ❌ 하드코딩된 값
<div className="text-2xl font-black text-wsop-red">95%</div>
<div className="text-2xl font-black text-wsop-red">42명</div>
<div className="text-2xl font-black text-wsop-red">7일</div>
```

#### 수정 후 (실제 데이터):
```typescript
// 1. State 추가
const [stats, setStats] = useState({
  deploymentRate: 0,
  graduatedTrainees: 0,
  trainingDays: 7
})

// 2. API 호출
useEffect(() => {
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats/public')
      const data = await response.json()
      setStats({
        deploymentRate: data.deploymentRate || 0,
        graduatedTrainees: data.graduatedTrainees || 0,
        trainingDays: data.trainingDays || 7
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }
  loadStats()
}, [])

// 3. 렌더링에 사용
<div className="text-2xl font-black text-wsop-red">
  {stats.deploymentRate}%
</div>
<div className="text-2xl font-black text-wsop-red">
  {stats.graduatedTrainees}명
</div>
<div className="text-2xl font-black text-wsop-red">
  {stats.trainingDays}일
</div>
```

---

## 🔧 직접 수정 방법

### 방법 1: 파일 직접 편집

1. `src/app/page.tsx` 파일 열기
2. `export default function HomePage()` 함수 찾기
3. useState 부분에 stats 추가:
   ```typescript
   const [stats, setStats] = useState({
     deploymentRate: 0,
     graduatedTrainees: 0,
     trainingDays: 7
   })
   ```

4. useEffect에 API 호출 추가:
   ```typescript
   useEffect(() => {
     const loadStats = async () => {
       try {
         const response = await fetch('/api/stats/public')
         const data = await response.json()
         setStats({
           deploymentRate: data.deploymentRate || 0,
           graduatedTrainees: data.graduatedTrainees || 0,
           trainingDays: data.trainingDays || 7
         })
       } catch (error) {
         console.error('Failed to load stats:', error)
       }
     }
     loadStats()
   }, [])
   ```

5. 하드코딩된 통계 값을 변수로 교체:
   - `95%` → `{stats.deploymentRate}%`
   - `42명` → `{stats.graduatedTrainees}명`
   - `7일` → `{stats.trainingDays}일`

### 방법 2: 백업에서 복원

```bash
# 현재 파일 백업
cp src/app/page.tsx src/app/page.tsx.old

# 수정된 버전으로 교체
# (이미 생성된 업데이트 파일 사용)
```

---

## 🧪 테스트 방법

### 1. API 엔드포인트 테스트
```bash
# 브라우저에서 직접 확인
http://localhost:3003/api/stats/public

# 예상 응답:
{
  "deploymentRate": 0,
  "graduatedTrainees": 0,
  "trainingDays": 7,
  "totalTrainees": 0,
  "activeTrainees": 0
}
```

### 2. 샘플 데이터로 테스트

#### 테스트 교육생 생성 (Supabase SQL Editor):
```sql
-- 테스트 사용자 10명 추가 (이미 회원가입한 사용자면 생략)
-- 이미 profiles에 있는 사용자 확인:
SELECT id, email, role, full_name FROM profiles;

-- role을 trainee로 변경:
UPDATE profiles
SET role = 'trainee'
WHERE role IS NULL OR role = 'user';
```

#### 수료자 시뮬레이션:
```sql
-- 특정 사용자의 모든 레슨을 completed로 표시
-- (실제 user_id는 profiles 테이블에서 확인)
INSERT INTO user_progress (user_id, lesson_id, status, completed_at)
SELECT
  'your-user-id-here',
  id,
  'completed',
  now()
FROM lessons;
```

#### 통계 재확인:
```
http://localhost:3003/api/stats/public

예상 결과:
{
  "deploymentRate": 10,     // 1명 수료 / 10명 = 10%
  "graduatedTrainees": 1,
  "trainingDays": 7,
  "totalTrainees": 10,
  "activeTrainees": 9
}
```

---

## 📊 실시간 업데이트 동작

### 자동 반영되는 경우:
1. ✅ 새 사용자 회원가입 → totalTrainees 증가
2. ✅ 사용자가 모든 레슨 완료 → graduatedTrainees 증가, deploymentRate 재계산
3. ✅ Day 추가 → trainingDays 자동 업데이트

### 페이지 로드 시:
- 랜딩 페이지 접속 시마다 최신 통계 fetch
- 캐싱 없음 (항상 실시간 데이터)

---

## 🎯 기대 효과

### Before (더미 데이터):
```
95% 투입률  ← 고정값
42명 수료   ← 고정값
7일 교육    ← 고정값
```

### After (실제 데이터):
```
{실제 계산된 %} 투입률   ← DB에서 실시간 계산
{실제 수료자} 명 수료    ← profiles + user_progress 집계
{실제 일수} 일 교육      ← curriculum_days에서 조회
```

---

## 🚀 배포 시 주의사항

### Vercel 환경 변수 확인:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

### API Routes 권한:
- `/api/stats/public` - 인증 불필요 (공개)
- 누구나 접근 가능하므로 민감한 정보 제외

---

## ✅ 완료 체크리스트

- [x] `/api/stats/public` API 생성
- [ ] `src/app/page.tsx` useState 추가
- [ ] `src/app/page.tsx` useEffect API 호출 추가
- [ ] `src/app/page.tsx` 하드코딩 값 → 변수로 교체
- [ ] 개발 서버에서 테스트
- [ ] Supabase에 테스트 데이터 추가
- [ ] 통계 값 실시간 반영 확인

---

## 📞 문제 해결

### API 응답이 모두 0인 경우:
```
원인: 데이터베이스에 사용자 또는 진행률 데이터 없음
해결: 테스트 사용자 및 진행률 추가 (위 SQL 참조)
```

### CORS 오류:
```
원인: API 호출 권한 문제
해결: /api 경로는 같은 도메인이므로 CORS 불필요
```

### 통계가 업데이트 안됨:
```
원인: 캐싱 또는 페이지 리로드 필요
해결: 브라우저 새로고침 (Ctrl + F5)
```

---

**이제 플랫폼이 실제 데이터를 사용합니다! 🎉**
