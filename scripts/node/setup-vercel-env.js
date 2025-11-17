#!/usr/bin/env node

/**
 * Vercel 환경 변수 자동 설정 스크립트
 *
 * 이 스크립트는 대화형으로 Supabase와 Gemini API 정보를 입력받아
 * Vercel 프로젝트에 환경 변수를 자동으로 설정합니다.
 *
 * 사용법:
 *   node scripts/setup-vercel-env.js
 *
 * 또는:
 *   npm run setup:vercel
 */

const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8' })
    return { success: true, output }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function checkVercelLogin() {
  console.log('\n🔍 Vercel 로그인 상태 확인 중...\n')
  const result = execCommand('vercel whoami')

  if (!result.success) {
    console.log('❌ Vercel에 로그인되어 있지 않습니다.')
    console.log('\n다음 명령어로 로그인해주세요:')
    console.log('  vercel login\n')
    process.exit(1)
  }

  console.log(`✅ Vercel 로그인됨: ${result.output.trim()}\n`)
}

async function setVercelEnv(name, value, environments = ['production', 'preview']) {
  console.log(`\n📤 ${name} 설정 중...`)

  for (const env of environments) {
    const command = `vercel env add ${name} ${env} <<< "${value}"`
    const result = execCommand(command)

    if (result.success) {
      console.log(`  ✅ ${env}: 설정 완료`)
    } else {
      // 이미 존재하는 경우 업데이트 시도
      const removeResult = execCommand(`vercel env rm ${name} ${env} -y`)
      if (removeResult.success) {
        const addResult = execCommand(command)
        if (addResult.success) {
          console.log(`  ✅ ${env}: 업데이트 완료`)
        } else {
          console.log(`  ⚠️  ${env}: 설정 실패 - 수동으로 설정해주세요`)
        }
      } else {
        console.log(`  ℹ️  ${env}: 이미 존재하거나 설정 건너뜀`)
      }
    }
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 Vercel 환경 변수 자동 설정')
  console.log('='.repeat(60))

  // Vercel 로그인 확인
  await checkVercelLogin()

  console.log('📝 필요한 정보를 입력해주세요.\n')
  console.log('💡 Tip: Supabase 정보는 https://supabase.com → Project Settings → API에서 확인할 수 있습니다.\n')

  // Supabase 정보 입력
  console.log('━'.repeat(60))
  console.log('1️⃣  Supabase 설정')
  console.log('━'.repeat(60))

  const supabaseUrl = await question('\nSupabase Project URL을 입력하세요\n(예: https://xxxxx.supabase.co):\n> ')

  if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
    console.log('\n❌ 올바른 Supabase URL을 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  const supabaseAnonKey = await question('\nSupabase Anon Key를 입력하세요\n(Settings → API → anon public):\n> ')

  if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
    console.log('\n❌ 올바른 Anon Key를 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  const supabaseServiceKey = await question('\nSupabase Service Role Key를 입력하세요\n(Settings → API → service_role) [선택사항, Enter로 건너뛰기]:\n> ')

  // Gemini API 정보 입력
  console.log('\n' + '━'.repeat(60))
  console.log('2️⃣  Google Gemini API 설정')
  console.log('━'.repeat(60))
  console.log('\n💡 Gemini API 키: https://makersuite.google.com/app/apikey')

  const geminiApiKey = await question('\nGemini API Key를 입력하세요:\n> ')

  if (!geminiApiKey || geminiApiKey.length < 20) {
    console.log('\n❌ 올바른 Gemini API Key를 입력해주세요.')
    rl.close()
    process.exit(1)
  }

  // 앱 URL 입력
  console.log('\n' + '━'.repeat(60))
  console.log('3️⃣  앱 URL 설정')
  console.log('━'.repeat(60))

  const appUrl = await question('\nVercel 배포 URL을 입력하세요\n(예: https://your-app.vercel.app) [선택사항, Enter로 건너뛰기]:\n> ')

  rl.close()

  // 확인
  console.log('\n' + '━'.repeat(60))
  console.log('📋 입력된 정보 확인')
  console.log('━'.repeat(60))
  console.log(`\n✅ Supabase URL: ${supabaseUrl}`)
  console.log(`✅ Supabase Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
  console.log(`${supabaseServiceKey ? '✅' : '⚪'} Supabase Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : '(설정 안함)'}`)
  console.log(`✅ Gemini API Key: ${geminiApiKey.substring(0, 15)}...`)
  console.log(`${appUrl ? '✅' : '⚪'} App URL: ${appUrl || '(설정 안함)'}`)

  const confirm = await new Promise((resolve) => {
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl2.question('\n계속 진행하시겠습니까? (y/N): ', (answer) => {
      rl2.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })

  if (!confirm) {
    console.log('\n❌ 취소되었습니다.')
    process.exit(0)
  }

  // Vercel 환경 변수 설정
  console.log('\n' + '━'.repeat(60))
  console.log('⚙️  Vercel 환경 변수 설정 중...')
  console.log('━'.repeat(60))

  try {
    await setVercelEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl)
    await setVercelEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey)

    if (supabaseServiceKey) {
      await setVercelEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey, ['production'])
    }

    await setVercelEnv('GEMINI_API_KEY', geminiApiKey, ['production', 'preview'])

    if (appUrl) {
      await setVercelEnv('NEXT_PUBLIC_APP_URL', appUrl)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ 환경 변수 설정 완료!')
    console.log('='.repeat(60))

    console.log('\n📋 다음 단계:\n')
    console.log('1. Supabase 리디렉션 URL 설정')
    console.log('   → Supabase → Authentication → URL Configuration')
    console.log('   → Redirect URLs에 Vercel 도메인 추가')
    console.log(`   → ${appUrl || 'https://your-app.vercel.app'}`)
    console.log(`   → ${appUrl ? appUrl + '/auth/callback' : 'https://your-app.vercel.app/auth/callback'}`)

    console.log('\n2. Vercel 재배포')
    console.log('   → Vercel 대시보드에서 "Redeploy" 버튼 클릭')
    console.log('   → 또는: git push origin main')

    console.log('\n3. 배포 확인')
    console.log(`   → ${appUrl || 'Vercel 배포 URL'}에 접속하여 테스트`)

    console.log('\n💡 상세 가이드: VERCEL_DEPLOYMENT_GUIDE.md\n')

  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message)
    console.log('\n수동으로 Vercel 대시보드에서 환경 변수를 설정해주세요.')
    console.log('가이드: VERCEL_DEPLOYMENT_GUIDE.md 참조\n')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('\n❌ 예상치 못한 에러:', error)
  process.exit(1)
})
