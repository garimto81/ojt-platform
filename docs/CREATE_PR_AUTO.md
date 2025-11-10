# 🤖 자동 Pull Request 생성 가이드

GitHub CLI 없이 GitHub API를 사용하여 자동으로 Pull Request를 생성하는 방법입니다.

---

## 🚀 빠른 시작

### 1단계: GitHub Personal Access Token 발급

1. **GitHub 설정 페이지 접속**
   ```
   https://github.com/settings/tokens
   ```

2. **"Generate new token" 클릭**
   - "Generate new token (classic)" 선택

3. **토큰 설정**
   - Note: `OJT Platform PR Creation`
   - Expiration: `90 days` (또는 원하는 기간)
   - 권한 선택:
     - ✅ **repo** (Full control of private repositories)
       - ✅ repo:status
       - ✅ repo_deployment
       - ✅ public_repo
       - ✅ repo:invite
       - ✅ security_events

4. **"Generate token" 클릭**

5. **토큰 복사 및 저장** ⚠️
   - 토큰은 한 번만 표시됩니다!
   - 안전한 곳에 저장하세요

---

### 2단계: PR 자동 생성

#### 방법 1: npm 스크립트 사용 (권장)

```bash
# 환경 변수로 토큰 설정
export GITHUB_TOKEN=ghp_your_token_here

# PR 자동 생성
npm run create-pr
```

#### 방법 2: 직접 스크립트 실행

```bash
# 환경 변수로 토큰 설정
export GITHUB_TOKEN=ghp_your_token_here

# 스크립트 실행
bash scripts/create-pr-api.sh
```

#### 방법 3: 대화형 입력

토큰을 환경 변수로 설정하지 않으면 스크립트가 대화형으로 토큰을 요청합니다:

```bash
npm run create-pr
# → GitHub Personal Access Token을 입력하세요: ghp_xxxxx
```

---

## ✅ 성공 시 출력

```
=====================================================================
✅ Pull Request가 성공적으로 생성되었습니다!
=====================================================================

PR #42
URL: https://github.com/garimto81/ojt-platform/pull/42

🎉 축하합니다! PR이 생성되었습니다.

다음 단계:
1. PR 확인: https://github.com/garimto81/ojt-platform/pull/42
2. Reviewers 지정 (선택사항)
3. Labels 추가 (선택사항)
4. PR 병합
```

---

## 🔧 스크립트 동작 방식

### 자동으로 수행되는 작업:

1. ✅ 현재 브랜치 확인
2. ✅ 저장소 정보 추출
3. ✅ PR 제목 및 본문 구성
4. ✅ GitHub API를 통해 PR 생성
5. ✅ PR URL 반환

### 생성되는 PR 정보:

- **제목**: `fix: 배포 실패 문제 해결 및 환경 설정 자동화`
- **베이스 브랜치**: `main`
- **헤드 브랜치**: 현재 작업 중인 브랜치
- **본문**: 상세한 변경사항 설명 (자동 생성)

---

## 🔐 보안 주의사항

### ⚠️ GitHub Token 관리

**절대 하지 말아야 할 것:**
- ❌ Git 커밋에 토큰 포함
- ❌ 공개 저장소에 토큰 업로드
- ❌ 토큰을 평문으로 저장

**권장 방법:**
- ✅ 환경 변수로 관리 (`export GITHUB_TOKEN=...`)
- ✅ 암호화된 저장소에 보관
- ✅ 필요할 때만 사용
- ✅ 주기적으로 토큰 재발급

### 토큰 만료 시

토큰이 만료되면 다음과 같이 재발급:

1. https://github.com/settings/tokens
2. 기존 토큰 삭제
3. 새 토큰 발급
4. 환경 변수 업데이트

---

## 🐛 문제 해결

### "401 Unauthorized"

**원인:** 토큰이 유효하지 않거나 만료됨

**해결:**
```bash
# 토큰 재발급 후
export GITHUB_TOKEN=ghp_new_token_here
npm run create-pr
```

### "422 Unprocessable Entity"

**원인:** PR이 이미 존재하거나 동일한 변경사항

**해결:**
- 기존 PR 확인: https://github.com/garimto81/ojt-platform/pulls
- 필요시 기존 PR 업데이트 또는 닫기

### "403 Forbidden"

**원인:** 토큰에 필요한 권한이 없음

**해결:**
1. 토큰 재발급
2. **repo** 권한 체크 확인
3. 새 토큰으로 재시도

### "404 Not Found"

**원인:** 저장소 이름이 잘못됨 또는 접근 권한 없음

**해결:**
```bash
# 저장소 확인
git remote -v

# 저장소 주인: garimto81
# 저장소 이름: ojt-platform
```

---

## 📊 스크립트 상세 정보

### 사용하는 GitHub API 엔드포인트

```
POST https://api.github.com/repos/{owner}/{repo}/pulls
```

### 요청 헤더

```http
Authorization: token {GITHUB_TOKEN}
Accept: application/vnd.github.v3+json
Content-Type: application/json
```

### 요청 본문

```json
{
  "title": "PR 제목",
  "body": "PR 본문",
  "head": "feature-branch",
  "base": "main"
}
```

---

## 🎯 고급 사용법

### 환경 변수 영구 설정

#### Bash (Linux/Mac)

```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
source ~/.bashrc
```

#### Windows (PowerShell)

```powershell
# 시스템 환경 변수로 설정
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
```

### 다른 저장소에 PR 생성

스크립트를 수정하여 다른 저장소에도 사용 가능:

```bash
# scripts/create-pr-api.sh 편집
REPO_OWNER="your-username"
REPO_NAME="your-repo"
```

---

## 💡 팁

### 1. 토큰 유효성 테스트

```bash
# 토큰이 유효한지 확인
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### 2. PR 목록 확인

```bash
# 현재 열려있는 PR 목록
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/garimto81/ojt-platform/pulls
```

### 3. 토큰 권한 확인

```bash
# 토큰 권한 확인 (X-OAuth-Scopes 헤더 확인)
curl -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

---

## 🔄 대안 방법

### 1. GitHub Web UI
```
https://github.com/garimto81/ojt-platform/compare/main...현재브랜치
```

### 2. Git + GitHub Auto PR
```bash
# 브랜치 푸시 시 GitHub가 자동으로 PR 생성 제안
git push -u origin feature-branch
```

---

## 📚 관련 문서

- [GitHub API 공식 문서](https://docs.github.com/en/rest/pulls/pulls)
- [Personal Access Token 관리](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [PR 생성 템플릿](../PR_TEMPLATE.md)

---

## ✨ 요약

**가장 간단한 방법:**

```bash
# 1. 토큰 발급 (최초 1회)
# https://github.com/settings/tokens

# 2. 환경 변수 설정
export GITHUB_TOKEN=ghp_your_token_here

# 3. PR 생성
npm run create-pr
```

**완료!** 🎉

---

**작성일:** 2025-11-10
**버전:** 1.0
**작성자:** Claude
