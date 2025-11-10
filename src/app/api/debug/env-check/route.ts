import { NextResponse } from 'next/server'

/**
 * 환경 변수 상태 확인 API
 *
 * 브라우저에서 직접 접속하여 환경 변수 설정 상태를 확인할 수 있습니다.
 * URL: https://your-app.vercel.app/api/debug/env-check
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  // 환경 변수 상태 체크
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',

    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!supabaseUrl,
      value: supabaseUrl || '❌ NOT SET',
      valid: supabaseUrl ? supabaseUrl.includes('supabase.co') : false,
      issue: !supabaseUrl ? 'Missing' :
             !supabaseUrl.includes('supabase.co') ? 'Invalid format (should contain supabase.co)' :
             null
    },

    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!supabaseKey,
      preview: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : '❌ NOT SET',
      length: supabaseKey ? supabaseKey.length : 0,
      startsWithEyJ: supabaseKey ? supabaseKey.startsWith('eyJ') : false,
      format: supabaseKey ? (
        supabaseKey.startsWith('eyJ') ? '✅ Valid JWT format' :
        supabaseKey.startsWith('sk_') ? '❌ Wrong key type (looks like Stripe key)' :
        supabaseKey.startsWith('pk_') ? '❌ Wrong key type (public key from other service)' :
        '❌ Invalid format (should start with "eyJ")'
      ) : '❌ NOT SET',
      issue: !supabaseKey ? 'Missing' :
             !supabaseKey.startsWith('eyJ') ? 'Wrong key format - should be JWT token starting with "eyJ"' :
             supabaseKey.length < 100 ? 'Key too short - should be 200-300 characters' :
             null
    },

    GEMINI_API_KEY: {
      exists: !!geminiKey,
      preview: geminiKey ? `${geminiKey.substring(0, 15)}...` : '❌ NOT SET (optional)',
      startsWithAIza: geminiKey ? geminiKey.startsWith('AIza') : false,
      format: geminiKey ? (
        geminiKey.startsWith('AIza') ? '✅ Valid format' : '❌ Invalid format (should start with "AIza")'
      ) : '⚠️ NOT SET (only needed for quiz generation)',
      issue: geminiKey ? (
        !geminiKey.startsWith('AIza') ? 'Wrong format - Gemini keys start with "AIza"' : null
      ) : 'Not required for login, only for admin quiz generation'
    }
  }

  // 전체 상태 요약
  const allValid =
    checks.NEXT_PUBLIC_SUPABASE_URL.valid &&
    checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWithEyJ &&
    checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 100

  const summary = {
    status: allValid ? '✅ ALL VALID' : '❌ CONFIGURATION ERROR',
    canLogin: checks.NEXT_PUBLIC_SUPABASE_URL.exists &&
              checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists &&
              checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWithEyJ,
    issues: [
      checks.NEXT_PUBLIC_SUPABASE_URL.issue,
      checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.issue,
    ].filter(Boolean)
  }

  // 문제가 있으면 해결 방법 제시
  const troubleshooting = summary.issues.length > 0 ? {
    message: '환경 변수 설정에 문제가 있습니다. 아래 단계를 따라 수정하세요.',
    steps: [
      '1. Supabase Dashboard 접속: https://supabase.com/dashboard',
      '2. 프로젝트 선택 → Settings → API',
      '3. 다음 값 복사:',
      '   - Project URL (예: https://xxxxx.supabase.co)',
      '   - anon public key (⚠️ service_role 아님!)',
      '4. Vercel Dashboard 접속: https://vercel.com/dashboard',
      '5. 프로젝트 → Settings → Environment Variables',
      '6. 환경 변수 수정:',
      '   - NEXT_PUBLIC_SUPABASE_URL = [Project URL]',
      '   - NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon public key]',
      '7. Environments: Production, Preview, Development 모두 체크',
      '8. Save 후 반드시 Redeploy!',
    ]
  } : null

  return NextResponse.json({
    summary,
    checks,
    troubleshooting,

    // 추가 디버깅 정보
    debugging: {
      note: 'Vercel 로그에서 더 상세한 정보를 확인할 수 있습니다.',
      logLocation: 'Vercel Dashboard → Deployments → 최신 배포 → Functions → View Logs',
      expectedLog: '🔍 Middleware - Supabase Config Check: ...'
    }
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
}
