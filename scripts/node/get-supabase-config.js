#!/usr/bin/env node

/**
 * Supabase 설정 정보 가져오기 스크립트
 *
 * 이 스크립트는 Supabase 프로젝트에서 필요한 환경 변수 정보를
 * 자동으로 가져와서 .env 파일을 생성합니다.
 *
 * 사용법:
 *   node scripts/get-supabase-config.js
 *
 * 또는:
 *   npm run get:supabase
 */

const { execSync } = require('child_process')
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
    return { success: true, output }
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr }
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 Supabase 설정 정보 가져오기')
  console.log('='.repeat(60))

  console.log('\n이 스크립트는 Supabase 프로젝트에서 필요한 정보를 가져와')
  console.log('.env 파일을 생성합니다.\n')

  // Supabase 프로젝트 확인
  console.log('━'.repeat(60))
  console.log('1️⃣  Supabase 프로젝트 확인')
  console.log('━'.repeat(60))

  const projectRef = await question('\nSupabase Project Reference ID를 입력하세요:\n(Supabase → Project Settings → General → Reference ID)\n> ')

  if (!projectRef || projectRef.length < 10) {
    console.log('\n❌ 올바른 Project Reference ID를 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  console.log('\n📡 Supabase API 정보를 가져오는 중...\n')

  // Supabase URL 구성
  const supabaseUrl = `https://${projectRef}.supabase.co`
  console.log(`✅ Supabase URL: ${supabaseUrl}`)

  // API 키 입력 안내
  console.log('\n━'.repeat(60))
  console.log('2️⃣  Supabase API 키 입력')
  console.log('━'.repeat(60))
  console.log('\n💡 다음 경로에서 API 키를 확인하세요:')
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/settings/api\n`)

  const anonKey = await question('Anon (public) Key를 입력하세요:\n> ')

  if (!anonKey || anonKey.length < 20) {
    console.log('\n❌ 올바른 Anon Key를 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  const serviceKey = await question('\nService Role Key를 입력하세요:\n> ')

  if (!serviceKey || serviceKey.length < 20) {
    console.log('\n❌ 올바른 Service Role Key를 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  // Database URL 구성
  const databaseUrl = `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:6543/postgres`

  console.log('\n━'.repeat(60))
  console.log('3️⃣  추가 설정')
  console.log('━'.repeat(60))

  const geminiKey = await question('\nGoogle Gemini API Key를 입력하세요 [선택사항, Enter로 건너뛰기]:\n> ')

  const appUrl = await question('\n앱 URL을 입력하세요 (기본값: http://localhost:3000) [Enter로 건너뛰기]:\n> ')

  rl.close()

  // .env 파일 생성
  console.log('\n━'.repeat(60))
  console.log('📝 .env 파일 생성')
  console.log('━'.repeat(60))

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# Database URL for Supabase PostgreSQL
# ⚠️ [YOUR-PASSWORD]를 실제 데이터베이스 비밀번호로 변경하세요
DATABASE_URL=${databaseUrl}

${geminiKey ? `# Google Gemini API for AI Quiz Generation
GEMINI_API_KEY=${geminiKey}
` : `# Google Gemini API for AI Quiz Generation
# GEMINI_API_KEY=your-gemini-api-key
`}
# App Configuration
NEXT_PUBLIC_APP_URL=${appUrl || 'http://localhost:3000'}
NODE_ENV=development
`

  const envPath = path.join(process.cwd(), '.env.local')

  // 기존 파일 백업
  if (fs.existsSync(envPath)) {
    const backupPath = `${envPath}.backup.${Date.now()}`
    fs.copyFileSync(envPath, backupPath)
    console.log(`\n⚠️  기존 .env.local 파일을 백업했습니다: ${path.basename(backupPath)}`)
  }

  fs.writeFileSync(envPath, envContent)
  console.log(`\n✅ .env.local 파일이 생성되었습니다!`)

  // 환경 변수 확인
  console.log('\n━'.repeat(60))
  console.log('🔍 환경 변수 확인')
  console.log('━'.repeat(60))

  const checkResult = execCommand('npm run check-env')
  console.log(checkResult.output || checkResult.stderr || '')

  // 다음 단계 안내
  console.log('\n' + '='.repeat(60))
  console.log('✅ 설정 완료!')
  console.log('='.repeat(60))

  console.log('\n📋 다음 단계:\n')

  console.log('1. 데이터베이스 비밀번호 설정')
  console.log('   → .env.local 파일을 열어 DATABASE_URL의 [YOUR-PASSWORD] 부분을')
  console.log('   → 실제 데이터베이스 비밀번호로 변경하세요')
  console.log(`   → Supabase → Project Settings → Database → Password\n`)

  if (!geminiKey) {
    console.log('2. Gemini API 키 설정 (선택사항)')
    console.log('   → https://makersuite.google.com/app/apikey 에서 키 발급')
    console.log('   → .env.local 파일에 GEMINI_API_KEY 추가\n')
  }

  console.log('3. 개발 서버 실행')
  console.log('   → npm run dev\n')

  console.log('4. Vercel 배포를 위한 환경 변수 설정')
  console.log('   → npm run setup:vercel')
  console.log('   → 또는 Vercel 대시보드에서 수동 설정\n')

  console.log('💡 상세 가이드: VERCEL_DEPLOYMENT_GUIDE.md\n')
}

main().catch((error) => {
  console.error('\n❌ 예상치 못한 에러:', error)
  rl.close()
  process.exit(1)
})
