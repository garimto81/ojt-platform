# Production Deployment Checklist

웹 환경(프로덕션)으로 마이그레이션을 위한 체크리스트

---

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

## 🐛 문제 발생 시

### 배포 실패
- [ ] Vercel 배포 로그 확인
- [ ] 환경 변수 재확인
- [ ] DEPLOYMENT_ISSUES.md 참고

### 인증 오류
- [ ] Supabase Redirect URLs 재확인
- [ ] API 키 유효성 확인
- [ ] CORS 설정 확인

### 기능 오류
- [ ] 브라우저 콘솔 에러 확인
- [ ] Vercel Runtime Logs 확인
- [ ] 환경 변수 누락 확인

---

## 📊 완료 기준

- [x] 모든 체크리스트 완료
- [x] 프로덕션 URL 정상 작동
- [x] 모든 기능 테스트 통과
- [x] 에러 없음

---

## 📚 참고 문서

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md)
- [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md)

---

## 🎉 완료 후

- [ ] 팀에 배포 완료 알림
- [ ] 배포 URL 공유
- [ ] 문서 업데이트
- [ ] 이슈 종료
