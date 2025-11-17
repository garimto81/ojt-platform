#!/usr/bin/env node

/**
 * 환경 변수 설정 확인 스크립트
 *
 * 사용법:
 *   node scripts/check-env.js
 *
 * 또는 package.json에 추가:
 *   "check-env": "node scripts/check-env.js"
 */

// Load .env.local file
require('dotenv').config({ path: '.env.local' })

const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase 프로젝트 URL',
    example: 'https://xxxxx.supabase.co',
    required: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase 익명 키',
    example: 'eyJhbGci...',
    required: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase 서비스 역할 키 (프로덕션 필수)',
    example: 'eyJhbGci...',
    required: false,
  },
  {
    name: 'GEMINI_API_KEY',
    description: 'Google Gemini API 키 (AI 퀴즈 생성)',
    example: 'AIzaSy...',
    required: true,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: '애플리케이션 URL',
    example: 'https://your-app.vercel.app 또는 http://localhost:3000',
    required: false,
  },
]

const optionalEnvVars = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL 데이터베이스 URL',
    example: 'postgresql://...',
  },
  {
    name: 'REDIS_URL',
    description: 'Redis 캐시 URL',
    example: 'redis://...',
  },
]

console.log('\n🔍 환경 변수 설정 확인\n')
console.log('=' .repeat(60))

let missingRequired = []
let missingOptional = []

// 필수 환경 변수 확인
console.log('\n📌 필수 환경 변수:\n')
requiredEnvVars.forEach(({ name, description, example, required }) => {
  const value = process.env[name]
  const isSet = !!value
  const status = isSet ? '✅' : (required ? '❌' : '⚠️')

  console.log(`${status} ${name}`)
  console.log(`   설명: ${description}`)

  if (isSet) {
    // 민감한 정보는 일부만 표시
    const displayValue = name.includes('KEY')
      ? `${value.substring(0, 10)}...`
      : value
    console.log(`   값: ${displayValue}`)
  } else {
    console.log(`   예시: ${example}`)
    if (required) {
      missingRequired.push(name)
    }
  }
  console.log('')
})

// 선택적 환경 변수 확인
console.log('\n📎 선택적 환경 변수:\n')
optionalEnvVars.forEach(({ name, description, example }) => {
  const value = process.env[name]
  const isSet = !!value
  const status = isSet ? '✅' : '⚪'

  console.log(`${status} ${name}`)
  console.log(`   설명: ${description}`)

  if (isSet) {
    const displayValue = name.includes('PASSWORD') || name.includes('URL')
      ? `${value.substring(0, 20)}...`
      : value
    console.log(`   값: ${displayValue}`)
  } else {
    console.log(`   예시: ${example}`)
    missingOptional.push(name)
  }
  console.log('')
})

// 결과 요약
console.log('=' .repeat(60))
console.log('\n📊 결과 요약:\n')

if (missingRequired.length === 0) {
  console.log('✅ 모든 필수 환경 변수가 설정되었습니다!')
} else {
  console.log('❌ 다음 필수 환경 변수가 누락되었습니다:')
  missingRequired.forEach(name => console.log(`   - ${name}`))
  console.log('\n💡 .env 파일을 생성하거나 Vercel 환경 변수를 설정해주세요.')
  console.log('   가이드: VERCEL_DEPLOYMENT_GUIDE.md 참조\n')
}

if (missingOptional.length > 0) {
  console.log('\n⚪ 다음 선택적 환경 변수가 설정되지 않았습니다:')
  missingOptional.forEach(name => console.log(`   - ${name}`))
  console.log('   (선택사항이므로 기본 기능은 정상 작동합니다)\n')
}

// 환경별 권장사항
console.log('\n💡 환경별 권장사항:\n')
console.log('🏠 로컬 개발:')
console.log('   - .env.local 파일 생성')
console.log('   - NEXT_PUBLIC_APP_URL=http://localhost:3000')
console.log('')
console.log('🚀 Vercel 프로덕션:')
console.log('   - Vercel 대시보드에서 환경 변수 설정')
console.log('   - NEXT_PUBLIC_APP_URL을 Vercel 도메인으로 설정')
console.log('   - SUPABASE_SERVICE_ROLE_KEY 반드시 설정')
console.log('')

// Exit code
if (missingRequired.length > 0) {
  console.log('❌ 환경 변수 확인 실패\n')
  process.exit(1)
} else {
  console.log('✅ 환경 변수 확인 완료\n')
  process.exit(0)
}
