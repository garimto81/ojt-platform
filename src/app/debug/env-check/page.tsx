'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface EnvCheckResult {
  summary: {
    status: string
    canLogin: boolean
    issues: string[]
  }
  checks: {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: boolean
      value: string
      valid: boolean
      issue: string | null
    }
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: boolean
      preview: string
      length: number
      startsWithEyJ: boolean
      format: string
      issue: string | null
    }
    GEMINI_API_KEY: {
      exists: boolean
      preview: string
      startsWithAIza: boolean
      format: string
      issue: string | null
    }
  }
  troubleshooting?: {
    message: string
    steps: string[]
  }
  debugging: {
    note: string
    logLocation: string
    expectedLog: string
  }
}

export default function EnvCheckPage() {
  const [data, setData] = useState<EnvCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnvCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug/env-check')
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || '환경 변수 확인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvCheck()
  }, [])

  const StatusIcon = ({ valid }: { valid: boolean }) =>
    valid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">환경 변수 확인 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            에러 발생
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
          <button
            onClick={fetchEnvCheck}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          홈으로
        </Link>

        {/* Summary */}
        <div className={`mb-6 p-6 rounded-lg ${
          data.summary.canLogin
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center mb-2">
            {data.summary.canLogin ? (
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 mr-2" />
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              환경 변수 상태: {data.summary.status}
            </h1>
          </div>
          <p className={`text-sm ${
            data.summary.canLogin ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {data.summary.canLogin ? '✅ 로그인 가능' : '❌ 로그인 불가능 - 환경 변수 수정 필요'}
          </p>
          {data.summary.issues.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-red-700 dark:text-red-300 mb-1">발견된 문제:</p>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                {data.summary.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Environment Variables Details */}
        <div className="space-y-4">
          {/* Supabase URL */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                  <StatusIcon valid={data.checks.NEXT_PUBLIC_SUPABASE_URL.valid} />
                  <span className="ml-2">NEXT_PUBLIC_SUPABASE_URL</span>
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-500">상태:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {data.checks.NEXT_PUBLIC_SUPABASE_URL.exists ? '✅ 설정됨' : '❌ 없음'}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">값:</span>
                <span className="font-mono text-gray-900 dark:text-white break-all">
                  {data.checks.NEXT_PUBLIC_SUPABASE_URL.value}
                </span>
              </div>
              {data.checks.NEXT_PUBLIC_SUPABASE_URL.issue && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-red-700 dark:text-red-300 font-semibold">
                    ⚠️ {data.checks.NEXT_PUBLIC_SUPABASE_URL.issue}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supabase Anon Key */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                  <StatusIcon valid={data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWithEyJ} />
                  <span className="ml-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-500">상태:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists ? '✅ 설정됨' : '❌ 없음'}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">미리보기:</span>
                <span className="font-mono text-gray-900 dark:text-white break-all">
                  {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.preview}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">길이:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.length}자
                  {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
                    data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100 &&
                    ' ⚠️ (너무 짧음, 200-300자 예상)'}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">형식:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.format}
                </span>
              </div>
              {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.issue && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-red-700 dark:text-red-300 font-semibold">
                    ⚠️ {data.checks.NEXT_PUBLIC_SUPABASE_ANON_KEY.issue}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>GEMINI_API_KEY (선택사항)</span>
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-500">상태:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {data.checks.GEMINI_API_KEY.exists ? '✅ 설정됨' : '⚠️ 없음 (로그인에는 불필요)'}
                </span>
              </div>
              {data.checks.GEMINI_API_KEY.exists && (
                <>
                  <div className="flex">
                    <span className="w-24 text-gray-500">미리보기:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {data.checks.GEMINI_API_KEY.preview}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500">형식:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {data.checks.GEMINI_API_KEY.format}
                    </span>
                  </div>
                </>
              )}
              <p className="text-gray-500 text-xs mt-2">
                💡 Admin 퀴즈 생성 기능에만 필요합니다. 로그인 및 일반 사용에는 영향 없습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        {data.troubleshooting && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" />
              해결 방법
            </h2>
            <p className="text-yellow-800 dark:text-yellow-300 mb-4">
              {data.troubleshooting.message}
            </p>
            <ol className="space-y-2">
              {data.troubleshooting.steps.map((step, idx) => (
                <li key={idx} className="text-yellow-800 dark:text-yellow-300 text-sm">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Debugging Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3">
            추가 디버깅 정보
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p>💡 {data.debugging.note}</p>
            <p>📍 {data.debugging.logLocation}</p>
            <p className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
              {data.debugging.expectedLog}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={fetchEnvCheck}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 확인
          </button>
          <Link
            href="/"
            className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
