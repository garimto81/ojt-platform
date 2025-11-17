#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Task Generation Script (Gemini API)
PRD → Task List 자동 생성 (Google Gemini 활용)

Based on PhaseFlow AI task generation
Optimized for ojt-platform Phase 0-6 workflow
"""

import os
import sys
import io
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional

# Windows 인코딩 처리
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    from google.generativeai import GenerativeModel
    import google.generativeai as genai
except ImportError:
    print("❌ google-generativeai 패키지가 설치되지 않았습니다.")
    print("   설치: pip install google-generativeai")
    sys.exit(1)


def load_env_file(env_path: str = ".env.local") -> dict:
    """Load environment variables from .env.local file"""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars


def extract_prd_number(prd_path: str) -> Optional[str]:
    """PRD 파일 경로에서 번호 추출 (예: 0001-prd-feature.md → 0001)"""
    filename = Path(prd_path).name
    match = re.match(r'(\d{4})-prd', filename)
    return match.group(1) if match else None


def read_prd(prd_path: str) -> str:
    """PRD 파일 읽기"""
    if not os.path.exists(prd_path):
        raise FileNotFoundError(f"PRD 파일 없음: {prd_path}")

    with open(prd_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_task_generation_prompt(prd_content: str) -> str:
    """Task List 생성을 위한 프롬프트 반환"""
    return f"""당신은 프로젝트 관리 전문가입니다. 아래 PRD(Product Requirements Document)를 분석하여 Phase 0-6 워크플로우에 맞는 Task List를 생성해주세요.

# PRD 내용:
{prd_content}

# Task List 생성 규칙:

## 필수 포함 사항:
1. **Task 0.0**: Feature branch 생성 (가장 첫 번째 Task)
2. 모든 구현 파일은 대응하는 테스트 파일이 1:1로 존재해야 함
3. E2E 테스트 (Playwright) 작성
4. 체크박스 형식: `- [ ]` (pending), `- [x]` (done), `- [!]` (failed), `- [⏸]` (blocked)

## Task 구조:
```markdown
# Task List: [PRD 제목]

**PRD**: PRD-NNNN
**생성일**: {datetime.now().strftime('%Y-%m-%d')}
**상태**: Phase 0.5 - Task List Generated

---

## Task 0.0: 프로젝트 초기 설정
- [ ] Feature branch 생성: `git checkout -b feature/PRD-NNNN-[feature-name]`
- [ ] 환경 변수 확인: `npm run check-env`
- [ ] 의존성 설치 확인: `npm install`

## Task 1: [주요 기능 1]
### 구현
- [ ] `src/[component].tsx` 작성
- [ ] `src/lib/[utility].ts` 작성

### 테스트 (1:1 매칭)
- [ ] `tests/unit/[component].test.tsx` 작성
- [ ] `tests/unit/[utility].test.ts` 작성

## Task 2: [주요 기능 2]
...

## Task N: E2E 테스트
- [ ] `tests/e2e/[feature].spec.ts` 작성
- [ ] Playwright 테스트 실행: `npm run test:e2e`
- [ ] 모든 테스트 통과 확인

## Task N+1: 문서화 및 배포 준비
- [ ] README.md 업데이트
- [ ] 환경 변수 문서화
- [ ] 배포 체크리스트 확인
```

## 출력 형식:
- 마크다운 형식으로 출력
- 명확하고 실행 가능한 Task 작성
- 각 Task는 1-2시간 내에 완료 가능하도록 세분화
- 테스트 파일은 구현 파일과 1:1 매칭

위 규칙에 따라 Task List를 생성해주세요.
"""


def generate_task_list(prd_content: str, prd_number: Optional[str] = None) -> str:
    """Gemini API를 사용하여 Task List 생성"""
    # API 키 확인 - 환경 변수 또는 .env.local에서 로드
    api_key = os.getenv('GEMINI_API_KEY')

    if not api_key:
        # .env.local 파일에서 로드 시도
        env_vars = load_env_file('.env.local')
        api_key = env_vars.get('GEMINI_API_KEY')

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY가 설정되지 않았습니다.\n"
            "   방법 1: export GEMINI_API_KEY=your_key (Unix/macOS)\n"
            "   방법 2: set GEMINI_API_KEY=your_key (Windows)\n"
            "   방법 3: .env.local 파일에 GEMINI_API_KEY=your_key 추가"
        )

    # Gemini API 초기화
    genai.configure(api_key=api_key)

    # 프롬프트 생성
    prompt = get_task_generation_prompt(prd_content)

    # Gemini API 호출
    print(f"🤖 Gemini API로 Task List 생성 중...")
    print(f"   모델: gemini-1.5-flash")
    print(f"   PRD 크기: {len(prd_content)} chars\n")

    try:
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            generation_config={
                'temperature': 0.7,
                'max_output_tokens': 8000,
            }
        )

        response = model.generate_content(prompt)
        task_list = response.text

        return task_list

    except Exception as e:
        raise RuntimeError(f"Gemini API 호출 실패: {e}")


def save_task_list(task_list: str, prd_number: str, prd_path: str) -> str:
    """Task List를 파일로 저장"""
    # tasks/ 폴더 확인
    tasks_dir = Path("tasks")
    if not tasks_dir.exists():
        tasks_dir.mkdir()

    # 파일명 생성
    prd_filename = Path(prd_path).stem  # 예: 0001-prd-ai-powered-learning
    task_filename = prd_filename.replace("-prd-", "-tasks-") + ".md"
    task_path = tasks_dir / task_filename

    # 저장
    with open(task_path, 'w', encoding='utf-8') as f:
        f.write(task_list)

    return str(task_path)


def main():
    """메인 실행 함수"""
    import argparse

    parser = argparse.ArgumentParser(
        description="AI 기반 Task List 생성 (Gemini API)",
        epilog="예시: python scripts/generate_tasks_gemini.py tasks/prds/0001-prd-feature.md"
    )
    parser.add_argument('prd_path', help='PRD 파일 경로 (예: tasks/prds/0001-prd-feature.md)')
    parser.add_argument('--output', '-o', help='출력 파일 경로 (기본값: tasks/NNNN-tasks-*.md)')
    parser.add_argument('--preview', '-p', action='store_true', help='생성된 Task List를 파일로 저장하지 않고 미리보기')

    args = parser.parse_args()

    try:
        # PRD 번호 추출
        prd_number = extract_prd_number(args.prd_path)
        if not prd_number:
            print(f"⚠️  경고: PRD 파일명에서 번호 추출 실패: {args.prd_path}")
            print(f"   예상 형식: NNNN-prd-feature-name.md")

        # PRD 읽기
        print(f"📄 PRD 읽기: {args.prd_path}")
        prd_content = read_prd(args.prd_path)
        print(f"   ✅ PRD 로드 완료 ({len(prd_content)} chars)\n")

        # Task List 생성
        task_list = generate_task_list(prd_content, prd_number)
        print(f"   ✅ Task List 생성 완료 ({len(task_list)} chars)\n")

        # 미리보기 모드
        if args.preview:
            print("="*80)
            print(task_list)
            print("="*80)
            print("\n💡 파일로 저장하려면 --preview 옵션 제거")
            return

        # 파일 저장
        output_path = args.output or save_task_list(task_list, prd_number, args.prd_path)

        if not args.output:
            output_path = save_task_list(task_list, prd_number, args.prd_path)

        print(f"✅ Task List 저장 완료")
        print(f"   파일: {output_path}\n")

        # 통계
        task_count = task_list.count('## Task ')
        checkbox_count = task_list.count('- [ ]')
        print(f"📊 통계:")
        print(f"   Parent Tasks: {task_count}개")
        print(f"   체크박스: {checkbox_count}개")

        # 다음 단계 안내
        print(f"\n🚀 다음 단계:")
        print(f"   1. Task List 검토: cat {output_path}")
        print(f"   2. Task 0.0 실행 → 브랜치 생성 (이미 main에서 작업 중)")
        print(f"   3. Task 순서대로 구현 시작")

    except FileNotFoundError as e:
        print(f"❌ 파일 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"❌ 설정 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"❌ 실행 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
