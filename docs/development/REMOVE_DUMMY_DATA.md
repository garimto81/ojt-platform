# 더미 데이터 제거 가이드

**모든 하드코딩된 통계를 실제 데이터베이스 연동으로 교체**

---

## ✅ 완료된 작업

1. ✅ 통계 API 생성 (`/api/stats/public`)
2. ✅ 가이드 문서 작성

---

## 🔧 수정이 필요한 파일

### `src/app/page.tsx` (랜딩 페이지)

#### 1단계: State 추가 (Line 61 근처)

**찾기:**
```typescript
export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()
```

**추가:**
```typescript
export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [stats, setStats] = useState({
    deploymentRate: 0,
    graduatedTrainees: 0,
    trainingDays: 7
  })
  const router = useRouter()
  const supabase = createClient()
```

---

#### 2단계: API 호출 추가 (Line 80 근처)

**찾기:**
```typescript
  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
      setCheckingAuth(false)
    }
    checkUser()
  }, [router, supabase.auth])
```

**다음에 추가:**
```typescript
  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
      setCheckingAuth(false)
    }
    checkUser()
  }, [router, supabase.auth])

  // Load statistics
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

---

#### 3단계: 하드코딩 값 교체

##### A. Hero 섹션 (Line 145)

**변경 전:**
```typescript
<p className="text-3xl font-black text-wsop-black dark:text-white mb-8">
  21일 → 7일
</p>
```

**변경 후:**
```typescript
<p className="text-3xl font-black text-wsop-black dark:text-white mb-8">
  21일 → {stats.trainingDays}일
</p>
```

##### B. Stats Preview Cards (Line 149-162)

**변경 전:**
```typescript
<div className="grid grid-cols-3 gap-4 mt-8">
  <div>
    <div className="text-2xl font-black text-wsop-red">95%</div>
    <div className="text-xs text-wsop-medium-gray">투입률</div>
  </div>
  <div>
    <div className="text-2xl font-black text-wsop-red">42명</div>
    <div className="text-xs text-wsop-medium-gray">수료</div>
  </div>
  <div>
    <div className="text-2xl font-black text-wsop-red">7일</div>
    <div className="text-xs text-wsop-medium-gray">교육기간</div>
  </div>
</div>
```

**변경 후:**
```typescript
<div className="grid grid-cols-3 gap-4 mt-8">
  <div>
    <div className="text-2xl font-black text-wsop-red">{stats.deploymentRate}%</div>
    <div className="text-xs text-wsop-medium-gray">투입률</div>
  </div>
  <div>
    <div className="text-2xl font-black text-wsop-red">{stats.graduatedTrainees}명</div>
    <div className="text-xs text-wsop-medium-gray">수료</div>
  </div>
  <div>
    <div className="text-2xl font-black text-wsop-red">{stats.trainingDays}일</div>
    <div className="text-xs text-wsop-medium-gray">교육기간</div>
  </div>
</div>
```

##### C. Stats Section (Line 293-299)

**변경 전:**
```typescript
<div className="grid md:grid-cols-3 gap-8 text-center">
  <StatCard number="21일 → 7일" label="온보딩 기간" />
  <StatCard number="95%" label="현장 투입률" />
  <StatCard number="42명" label="수료 인원" />
</div>
```

**변경 후:**
```typescript
<div className="grid md:grid-cols-3 gap-8 text-center">
  <StatCard number={`21일 → ${stats.trainingDays}일`} label="온보딩 기간" />
  <StatCard number={`${stats.deploymentRate}%`} label="현장 투입률" />
  <StatCard number={`${stats.graduatedTrainees}명`} label="수료 인원" />
</div>
```

##### D. Training Program Title (Line 305)

**변경 전:**
```typescript
<h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-8 text-center">7일 교육 프로그램</h2>
```

**변경 후:**
```typescript
<h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-8 text-center">{stats.trainingDays}일 교육 프로그램</h2>
```

---

## 🎯 요약

### 변경 사항:
1. ✅ State 추가 (1곳)
2. ✅ API 호출 추가 (1곳)
3. ✅ 하드코딩 값 교체 (8곳)

### 교체된 값:
- ❌ `95%` → ✅ `{stats.deploymentRate}%`
- ❌ `42명` → ✅ `{stats.graduatedTrainees}명`
- ❌ `7일` → ✅ `{stats.trainingDays}일`

---

## ✅ 검증 방법

### 1. 파일 저장 후 개발 서버 확인
```
개발 서버가 자동으로 리로드됩니다.
브라우저: http://localhost:3003
```

### 2. API 응답 확인
```bash
# 브라우저 개발자 도구 → Network 탭
# /api/stats/public 요청 확인

예상 응답:
{
  "deploymentRate": 0,
  "graduatedTrainees": 0,
  "trainingDays": 7,
  "totalTrainees": 0,
  "activeTrainees": 0
}
```

### 3. UI 확인
```
- 랜딩 페이지 로드 시 API 호출
- 통계 값이 0% / 0명 / 7일로 표시됨
- 테스트 데이터 추가 후 실시간 반영 확인
```

---

## 🧪 테스트 데이터 추가

### Supabase SQL Editor에서 실행:

```sql
-- 1. 기존 사용자를 trainee로 변경
UPDATE profiles
SET role = 'trainee'
WHERE email = 'test@example.com';

-- 2. 테스트 수료자 생성
INSERT INTO user_progress (user_id, lesson_id, status, completed_at)
SELECT
  (SELECT id FROM profiles WHERE email = 'test@example.com'),
  id,
  'completed',
  now()
FROM lessons;

-- 3. 통계 확인
SELECT
  COUNT(DISTINCT up.user_id) FILTER (WHERE up.status = 'completed') as completed_users,
  COUNT(DISTINCT p.id) as total_users
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
WHERE p.role = 'trainee';
```

---

## 📊 최종 결과

### Before:
```typescript
// 하드코딩된 더미 데이터
95%    // 고정값
42명   // 고정값
7일    // 고정값
```

### After:
```typescript
// 실시간 데이터베이스 연동
{stats.deploymentRate}%      // DB에서 계산
{stats.graduatedTrainees}명   // DB에서 집계
{stats.trainingDays}일        // DB에서 조회
```

---

## 🚀 다음 단계

### 1. 즉시 적용:
- 위 3단계 코드를 `src/app/page.tsx`에 복사/붙여넣기
- Ctrl+S 저장
- 브라우저 자동 리로드 확인

### 2. 테스트:
- 테스트 사용자로 레슨 완료
- API 응답 확인
- 통계 자동 업데이트 확인

### 3. 배포:
- Git commit & push
- Vercel 자동 배포
- 프로덕션에서 실시간 통계 확인

---

**이제 모든 더미 데이터가 실제 데이터베이스와 연동됩니다! 🎉**
