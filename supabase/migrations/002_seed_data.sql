-- GG Production 온보딩 플랫폼 초기 데이터
-- Version: 1.0.0
-- Description: 7일 커리큘럼 및 샘플 데이터

-- ============================================
-- 1. CURRICULUM DAYS (7일 커리큘럼)
-- ============================================
INSERT INTO public.curriculum_days (day_number, title, description, objectives, duration_hours, order_index) VALUES
(1, 'Day 1: 포커 기초 - 룰과 구조',
 '텍사스 홀덤의 기본 규칙과 토너먼트 구조를 학습합니다.',
 ARRAY['홀덤 기본 룰 이해', '핸드 랭킹 암기', '베팅 라운드 숙지', '포지션 개념'],
 8, 1),

(2, 'Day 2: 포커 기초 - 용어와 전략',
 '포커 전문 용어와 기초 전략을 학습합니다.',
 ARRAY['토너먼트 용어 숙지', '블라인드 구조 이해', '칩 카운팅', '기본 전략'],
 8, 2),

(3, 'Day 3: 프로덕션 스킬 - 장비와 시스템',
 '방송 장비와 프로덕션 시스템을 학습합니다.',
 ARRAY['카메라 시스템 이해', '오디오 장비 운용', '스위칭 기초', '그래픽 오버레이'],
 8, 3),

(4, 'Day 4: 프로덕션 스킬 - 라이브 운영',
 '실시간 방송 운영 기술을 학습합니다.',
 ARRAY['스트림 관리', '카메라 앵글 선택', '오디오 믹싱', '실시간 문제 해결'],
 8, 4),

(5, 'Day 5: 실전 시뮬레이션 - 준비',
 '3시간 모의 방송을 위한 준비 훈련입니다.',
 ARRAY['장비 셋업', '사전 체크리스트', '팀 역할 분담', '긴급 상황 대응'],
 8, 5),

(6, 'Day 6: 실전 시뮬레이션 - 실행',
 '실제 토너먼트 형식의 3시간 모의 방송을 진행합니다.',
 ARRAY['라이브 방송 진행', '팀 협업', '품질 관리', '피드백 수집'],
 8, 6),

(7, 'Day 7: 최종 평가',
 '이론 테스트와 실무 평가를 통해 현장 투입 여부를 결정합니다.',
 ARRAY['이론 테스트 (60점 이상)', '실무 평가', '최종 피드백', '현장 투입 승인'],
 8, 7);

-- ============================================
-- 2. LESSONS (Day별 레슨)
-- ============================================

-- Day 1 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(1, '텍사스 홀덤 기본 룰', '# 텍사스 홀덤 기본 룰

## 게임 구조
- 2명~10명 플레이어
- 2장의 홀 카드 + 5장의 커뮤니티 카드
- 최고의 5장 조합으로 승부

## 베팅 라운드
1. **Pre-flop**: 홀 카드 2장 받은 후
2. **Flop**: 커뮤니티 카드 3장 오픈 후
3. **Turn**: 4번째 카드 오픈 후
4. **River**: 5번째 카드 오픈 후

## 기본 액션
- **Fold**: 패 버리기
- **Call**: 현재 베팅액 맞추기
- **Raise**: 베팅 금액 올리기
- **Check**: 베팅 없이 넘기기', 'theory', 45, 1, 50),

(1, '핸드 랭킹 완벽 정리', '# 포커 핸드 랭킹 (강한 순서)

1. **Royal Flush** (로얄 플러시)
   - A-K-Q-J-10 같은 무늬

2. **Straight Flush** (스트레이트 플러시)
   - 5장 연속 숫자, 같은 무늬

3. **Four of a Kind** (포카드)
   - 같은 숫자 4장

4. **Full House** (풀하우스)
   - 트리플 + 페어

5. **Flush** (플러시)
   - 같은 무늬 5장

6. **Straight** (스트레이트)
   - 연속된 숫자 5장

7. **Three of a Kind** (트리플)
   - 같은 숫자 3장

8. **Two Pair** (투페어)
   - 페어 2개

9. **One Pair** (원페어)
   - 같은 숫자 2장

10. **High Card** (하이카드)
    - 아무 조합도 없을 때', 'theory', 30, 2, 50),

(1, '베팅 구조와 블라인드', '# 베팅 구조

## 블라인드 시스템
- **Small Blind (SB)**: 최소 강제 베팅
- **Big Blind (BB)**: SB의 2배
- 매 핸드마다 시계방향으로 이동

## 베팅 리미트
- **No Limit**: 제한 없음 (WSOP 메인 이벤트)
- **Pot Limit**: 팟 금액까지만
- **Fixed Limit**: 정해진 금액만

## 토너먼트 블라인드
- 시간에 따라 블라인드 증가
- 예: 25/50 → 50/100 → 100/200...', 'theory', 30, 3, 50),

(1, 'Day 1 퀴즈', '', 'quiz', 20, 4, 100);

-- Day 2 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(2, '포커 전문 용어', '# 필수 포커 용어

## 포지션
- **UTG (Under The Gun)**: 블라인드 다음 첫 번째
- **MP (Middle Position)**: 중간 포지션
- **CO (Cut Off)**: 딜러 바로 앞
- **BTN (Button)**: 딜러 포지션
- **SB/BB**: 스몰/빅 블라인드

## 액션 용어
- **3-bet**: 리레이즈
- **4-bet**: 리리레이즈
- **All-in**: 모든 칩 베팅
- **Showdown**: 최종 카드 공개

## 토너먼트 용어
- **Buy-in**: 참가비
- **Re-entry**: 재입장
- **Bubble**: 상금권 직전
- **Final Table**: 최종 테이블', 'theory', 40, 1, 50),

(2, '칩 카운팅과 관리', '# 칩 카운팅

## 칩 단위
- **White**: 25
- **Red**: 100
- **Green**: 500
- **Black**: 1,000
- **Purple**: 5,000

## 칩 카운팅 기술
1. 20개씩 묶어서 세기
2. 컬러별로 분류
3. 빠른 계산 연습

## 스택 관리
- **Short Stack**: 10BB 이하
- **Medium Stack**: 20-40BB
- **Big Stack**: 50BB 이상', 'theory', 30, 2, 50),

(2, '기본 전략 개념', '# 포커 기본 전략

## Starting Hands
- **Premium**: AA, KK, QQ, AK
- **Strong**: JJ, TT, AQ, AJs
- **Playable**: 99-22, KQ, suited connectors

## 포지션별 플레이
- **Early**: 타이트하게
- **Middle**: 선택적으로
- **Late**: 공격적으로

## 팟 오즈 기초
- 팟 사이즈 vs 콜 금액
- 이길 확률 계산
- EV (Expected Value) 개념', 'theory', 40, 3, 50),

(2, 'Day 2 퀴즈', '', 'quiz', 20, 4, 100);

-- Day 3 레슨
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(3, '카메라 시스템 이해', '# 포커 방송 카메라 시스템

## 카메라 구성
1. **Table Cam**: 테이블 전체 샷
2. **Hole Card Cam**: 홀 카드 촬영 (RFID)
3. **Player Cam**: 개별 플레이어
4. **Audience Cam**: 관중석

## 카메라 앵글
- **Wide Shot**: 전체 분위기
- **Close-up**: 플레이어 표정
- **Insert**: 칩, 카드 클로즈업

## 스위칭 타이밍
- 액션 발생 시 해당 플레이어
- Showdown 시 핸드 공개
- 중요한 결정 시 클로즈업', 'theory', 45, 1, 50),

(3, '오디오 시스템 운용', '# 오디오 장비와 믹싱

## 마이크 종류
- **Dealer Mic**: 딜러 음성
- **Player Mic**: 개별 플레이어 (Lav)
- **Ambient Mic**: 현장음

## 오디오 레벨
- Dealer: -12dB
- Players: -18dB
- Ambient: -24dB

## 믹싱 기술
- 액션 발생 시 해당 플레이어 믹싱
- 배경음악 레벨 조절
- 노이즈 제거', 'theory', 40, 2, 50),

(3, '그래픽 오버레이 시스템', '# 방송 그래픽

## 필수 그래픽
1. **Player Info**: 이름, 칩 스택
2. **Hand Info**: 커뮤니티 카드
3. **Pot Size**: 현재 팟 금액
4. **Timer**: 블라인드 남은 시간

## 그래픽 타이밍
- Pre-flop: 플레이어 정보
- Flop/Turn/River: 카드 애니메이션
- Showdown: 승자 강조

## 소프트웨어
- vMix, OBS 사용법
- 그래픽 템플릿 관리', 'practical', 45, 3, 50),

(3, 'Day 3 실습', '', 'practical', 30, 4, 100);

-- Day 4-7 레슨들 (간략하게)
INSERT INTO public.lessons (day_id, title, content, lesson_type, duration_minutes, order_index, points_reward) VALUES
(4, '스트림 관리', '# 라이브 스트리밍 관리...', 'theory', 45, 1, 50),
(4, '실시간 문제 해결', '# 방송 중 긴급 상황 대응...', 'practical', 45, 2, 50),
(4, 'Day 4 실습', '', 'practical', 30, 3, 100),

(5, '장비 셋업 체크리스트', '# 방송 전 준비 사항...', 'practical', 60, 1, 50),
(5, '팀 역할과 커뮤니케이션', '# 팀워크와 역할 분담...', 'theory', 40, 2, 50),
(5, '모의 방송 준비', '', 'practical', 60, 3, 100),

(6, '3시간 모의 방송', '# 실전 시뮬레이션...', 'practical', 180, 1, 200),
(6, '피드백 세션', '', 'theory', 30, 2, 50),

(7, '이론 최종 테스트', '', 'quiz', 60, 1, 300),
(7, '실무 최종 평가', '', 'practical', 120, 2, 200);

-- ============================================
-- 3. QUIZZES (샘플 퀴즈)
-- ============================================

-- Day 1 퀴즈 가져오기
DO $$
DECLARE
  day1_quiz_lesson_id UUID;
BEGIN
  SELECT id INTO day1_quiz_lesson_id FROM public.lessons WHERE title = 'Day 1 퀴즈';

  INSERT INTO public.quizzes (lesson_id, question, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (day1_quiz_lesson_id, '텍사스 홀덤에서 각 플레이어가 받는 홀 카드는 몇 장인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "1장", "is_correct": false},
     {"id": "b", "text": "2장", "is_correct": true},
     {"id": "c", "text": "3장", "is_correct": false},
     {"id": "d", "text": "4장", "is_correct": false}
   ]'::jsonb,
   'b', '텍사스 홀덤에서는 각 플레이어가 2장의 홀 카드를 받습니다.', 10, 1),

  (day1_quiz_lesson_id, '다음 중 가장 강한 핸드는?', 'multiple_choice',
   '[
     {"id": "a", "text": "Four of a Kind", "is_correct": false},
     {"id": "b", "text": "Full House", "is_correct": false},
     {"id": "c", "text": "Straight Flush", "is_correct": true},
     {"id": "d", "text": "Flush", "is_correct": false}
   ]'::jsonb,
   'c', 'Straight Flush는 로얄 플러시 다음으로 두 번째로 강한 핸드입니다.', 10, 2),

  (day1_quiz_lesson_id, 'Small Blind는 Big Blind의 몇 배인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "0.5배", "is_correct": true},
     {"id": "b", "text": "1배", "is_correct": false},
     {"id": "c", "text": "2배", "is_correct": false},
     {"id": "d", "text": "3배", "is_correct": false}
   ]'::jsonb,
   'a', 'Small Blind는 Big Blind의 절반 금액입니다.', 10, 3),

  (day1_quiz_lesson_id, 'Flop에서 공개되는 커뮤니티 카드는 몇 장인가?', 'multiple_choice',
   '[
     {"id": "a", "text": "1장", "is_correct": false},
     {"id": "b", "text": "2장", "is_correct": false},
     {"id": "c", "text": "3장", "is_correct": true},
     {"id": "d", "text": "5장", "is_correct": false}
   ]'::jsonb,
   'c', 'Flop에서는 3장의 커뮤니티 카드가 동시에 공개됩니다.', 10, 4),

  (day1_quiz_lesson_id, 'WSOP 메인 이벤트의 베팅 구조는?', 'multiple_choice',
   '[
     {"id": "a", "text": "No Limit", "is_correct": true},
     {"id": "b", "text": "Pot Limit", "is_correct": false},
     {"id": "c", "text": "Fixed Limit", "is_correct": false},
     {"id": "d", "text": "Mixed Limit", "is_correct": false}
   ]'::jsonb,
   'a', 'WSOP 메인 이벤트는 No Limit Texas Holdem 형식입니다.', 10, 5);
END $$;

-- ============================================
-- 4. ACHIEVEMENTS (업적)
-- ============================================
INSERT INTO public.achievements (name, description, icon, badge_color, points_required, condition_type, condition_value) VALUES
('첫 걸음', '첫 번째 레슨 완료', '🎯', '#D4AF37', 0, 'days_completed', '{"days": 1}'::jsonb),
('포커 기초 마스터', 'Day 1-2 완료', '♠️', '#ED1C24', 0, 'days_completed', '{"days": 2}'::jsonb),
('프로덕션 전문가', 'Day 3-4 완료', '🎬', '#D4AF37', 0, 'days_completed', '{"days": 4}'::jsonb),
('실전 준비 완료', 'Day 5-6 완료', '🔥', '#ED1C24', 0, 'days_completed', '{"days": 6}'::jsonb),
('현장 투입 인증', '최종 평가 통과', '🏆', '#D4AF37', 0, 'days_completed', '{"days": 7}'::jsonb),
('포인트 헌터', '500 포인트 획득', '💎', '#1565C0', 500, 'points', '{"target": 500}'::jsonb),
('포인트 마스터', '1000 포인트 획득', '👑', '#D4AF37', 1000, 'points', '{"target": 1000}'::jsonb),
('완벽주의자', '모든 퀴즈 만점', '⭐', '#ED1C24', 0, 'perfect_score', '{"type": "all_quizzes"}'::jsonb),
('스피드러너', '3일 내 완료', '⚡', '#F57C00', 0, 'speed', '{"days": 3}'::jsonb);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 데이터베이스 초기화 완료!';
  RAISE NOTICE '📚 7일 커리큘럼 생성됨';
  RAISE NOTICE '📝 샘플 레슨 및 퀴즈 생성됨';
  RAISE NOTICE '🏆 업적 시스템 설정됨';
END $$;
