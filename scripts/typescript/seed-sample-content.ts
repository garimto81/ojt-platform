/**
 * Seed Sample Content to Supabase
 * Run: npx tsx scripts/seed-sample-content.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('🌱 Starting seed with Supabase Client...\n')

  try {
    // Check connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Connection failed:', testError.message)
      process.exit(1)
    }

    console.log('✅ Connected to Supabase\n')

    // Create Day 1
    console.log('📚 Creating Day 1...')
    const { data: day1, error: day1Error } = await supabase
      .from('curriculum_days')
      .insert({
        day_number: 1,
        title: '포커 프로덕션 기초',
        description: '포커 토너먼트 프로덕션의 기본 개념과 역할을 이해합니다.',
        objectives: [
          '포커 프로덕션의 핵심 역할과 책임 이해',
          '토너먼트 운영의 기본 프로세스 학습',
          '프로덕션 팀 구조와 협업 방식 파악'
        ],
        duration_hours: 8,
        order_index: 1,
        is_active: true
      })
      .select()
      .single()

    if (day1Error) {
      // If day already exists, fetch it
      const { data: existingDay } = await supabase
        .from('curriculum_days')
        .select()
        .eq('day_number', 1)
        .single()

      if (existingDay) {
        console.log('ℹ️  Day 1 already exists, using existing...')
        await createLesson(existingDay.id)
      } else {
        throw day1Error
      }
    } else {
      console.log('✅ Day 1 created')
      if (day1) {
        await createLesson(day1.id)
      }
    }

    console.log('\n🎉 Seed completed successfully!')
  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message)
    process.exit(1)
  }
}

async function createLesson(dayId: number) {
  console.log('\n📝 Creating sample lesson...')

  const sampleContent = `# 포커 프로덕션의 역할과 책임

## 1. 포커 프로덕션이란?

포커 프로덕션은 **라이브 및 온라인 포커 토너먼트의 기획부터 실행, 방송까지 전 과정을 총괄하는 전문 분야**입니다. WSOP(World Series of Poker), WPT(World Poker Tour)와 같은 세계적인 포커 이벤트부터 지역 토너먼트까지, 성공적인 포커 이벤트 뒤에는 항상 숙련된 프로덕션 팀이 있습니다.

### 1.1 프로덕션의 중요성

- **플레이어 경험**: 원활한 토너먼트 진행으로 플레이어 만족도 향상
- **방송 품질**: 시청자에게 흥미진진한 콘텐츠 전달
- **브랜드 가치**: 전문적인 운영으로 이벤트 신뢰도 구축
- **수익 창출**: 효율적인 운영으로 비용 절감 및 수익 극대화

## 2. 프로덕션 팀 구조

### 2.1 Tournament Director (토너먼트 디렉터)
**책임 범위:**
- 토너먼트 규칙 적용 및 분쟁 해결
- 블라인드 구조 및 시간 관리
- 딜러 및 플로어 스태프 총괄
- 최종 의사결정권자

**필수 역량:**
- 10년 이상의 포커 경험
- TDA(Tournament Directors Association) 규칙 숙지
- 위기 관리 능력
- 리더십과 커뮤니케이션 스킬

### 2.2 Production Manager (프로덕션 매니저)
**책임 범위:**
- 전체 프로덕션 일정 관리
- 예산 편성 및 비용 관리
- 벤더 및 파트너사 조율
- 팀원 업무 배정 및 성과 관리

### 2.3 Broadcast Producer (방송 프로듀서)
**책임 범위:**
- 라이브 스트리밍 기획 및 실행
- 카메라 구성 및 앵글 결정
- 코멘터리 팀 관리
- 방송 품질 관리

## 3. 성공적인 프로덕션을 위한 팁

### 3.1 커뮤니케이션
- **명확한 지시**: 모호함 없이 정확하게 전달
- **사전 브리핑**: 예상 시나리오 공유
- **피드백 루프**: 실시간 의견 수렴

### 3.2 위기 관리
- **백업 플랜**: 모든 장비의 예비 준비
- **연락망**: 비상 연락처 사전 공유
- **시뮬레이션**: 위기 상황 사전 훈련

## 요약

포커 프로덕션은 다양한 역할이 유기적으로 협력하는 종합 예술입니다.

성공적인 프로덕션을 위해서는:
- 명확한 역할 분담
- 원활한 커뮤니케이션
- 철저한 사전 준비
- 빠른 의사결정
- 플레이어 중심 사고

가 필요합니다.

---

**학습 시간**: 약 25분 | **난이도**: 초급
`

  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .insert({
      day_id: dayId,
      title: '포커 프로덕션의 역할과 책임',
      content: sampleContent,
      lesson_type: 'theory',
      duration_minutes: 25,
      order_index: 1,
      points_reward: 100,
      is_required: true,
      resources: {
        references: [
          'TDA Rules: https://pokertda.com',
          'WSOP Production Guide'
        ]
      }
    })
    .select()
    .single()

  if (lessonError) {
    if (lessonError.code === '23505') { // Unique constraint violation
      console.log('ℹ️  Lesson already exists')
    } else {
      throw lessonError
    }
  } else {
    console.log('✅ Sample lesson created')
    console.log(`   - Title: ${lesson.title}`)
    console.log(`   - Type: ${lesson.lesson_type}`)
    console.log(`   - Duration: ${lesson.duration_minutes} minutes`)
    console.log(`   - Points: ${lesson.points_reward}`)
  }
}

main()
