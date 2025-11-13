'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContentProcessorPage() {
  const [rawContent, setRawContent] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!rawContent.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setProcessing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/process-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_content: rawContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '처리 실패')
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err.message || 'AI 처리 중 오류 발생')
    } finally {
      setProcessing(false)
    }
  }

  const exampleContent = `포커 게임은 52장의 카드를 사용합니다. 플레이어들은 각자 2장의 카드를 받고 뭐 그런 거 있잖아요. 아무튼 중요한 건 블라인드 베팅부터 시작하는데요. 스몰 블라인드랑 빅 블라인드가 있어요. 그 다음에 프리플랍이고 플랍이고 턴이고 리버까지 가면서 카드가 5장 나오는데 이걸로 조합을 만들어야 해요. 로얄 플러쉬가 제일 좋고요. 그 다음이 스트레이트 플러쉬, 포카드, 풀하우스 뭐 이런 식으로요. 베팅은 콜, 레이즈, 폴드 이렇게 할 수 있구요. 포지션이 중요한데 버튼이 제일 좋아요.`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-wsop-black mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-wsop-red" />
          AI 콘텐츠 정리 시스템
        </h1>
        <p className="text-wsop-medium-gray">
          "개떡같이" 입력해도 AI가 "찰떡같이" 정리해드립니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">📝 원본 입력</h2>

          <textarea
            className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
            placeholder="여기에 대충 작성한 내용을 입력하세요..."
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
          />

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleProcess}
              disabled={processing}
              className="bg-wsop-red hover:bg-wsop-red/90 flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI 정리 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI로 정리하기
                </>
              )}
            </Button>

            <Button
              onClick={() => setRawContent(exampleContent)}
              variant="outline"
            >
              예시 보기
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </Card>

        {/* 결과 섹션 */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">✨ AI 정리 결과</h2>

          {!result && !processing && (
            <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
              <p>AI 정리 결과가 여기에 표시됩니다</p>
            </div>
          )}

          {processing && (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-wsop-red mx-auto mb-4" />
                <p className="text-gray-600">AI가 콘텐츠를 분석하고 있습니다...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* 메타 정보 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-blue-600 font-semibold">난이도</p>
                  <p className="text-lg font-bold text-blue-900">{result.difficulty_level}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-green-600 font-semibold">학습 시간</p>
                  <p className="text-lg font-bold text-green-900">{result.estimated_duration_minutes}분</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-purple-600 font-semibold">목표</p>
                  <p className="text-lg font-bold text-purple-900">{result.learning_objectives?.length}개</p>
                </div>
              </div>

              {/* 학습 목표 */}
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  학습 목표
                </h3>
                <ul className="space-y-1">
                  {result.learning_objectives?.map((obj: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-wsop-red">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 핵심 개념 */}
              <div>
                <h3 className="font-bold mb-2">핵심 개념</h3>
                <div className="flex flex-wrap gap-2">
                  {result.key_concepts?.map((concept: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* 요약 */}
              {result.summary && (
                <div>
                  <h3 className="font-bold mb-2">요약</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {result.summary}
                  </p>
                </div>
              )}

              {/* 정리된 콘텐츠 */}
              <div>
                <h3 className="font-bold mb-2">정리된 콘텐츠</h3>
                <div className="prose prose-sm max-w-none bg-white border rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {result.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 사용 가이드 */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          사용 방법
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-900 mb-1">1. 입력</p>
            <p className="text-blue-700">체계적이지 않아도 괜찮습니다. 자유롭게 작성하세요.</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-1">2. AI 정리</p>
            <p className="text-blue-700">버튼 클릭 한 번으로 구조화된 콘텐츠로 변환됩니다.</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-1">3. 검토</p>
            <p className="text-blue-700">결과를 확인하고 필요시 수정하여 사용하세요.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
