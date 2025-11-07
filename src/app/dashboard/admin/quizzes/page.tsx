'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  day_id: string
  curriculum_days: {
    day_number: number
    title: string
  }
}

interface Quiz {
  id: string
  lesson_id: string
  question: string
  question_type: string
  options: any
  correct_answer: string
  explanation: string
  points: number
  is_active: boolean
  order_index: number
}

export default function AdminQuizzesPage() {
  const supabase = createClient()

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  // Quiz generation options
  const [questionCount, setQuestionCount] = useState(5)
  const [questionTypes, setQuestionTypes] = useState(['multiple_choice', 'true_false'])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedLessonId) {
      loadQuizzes()
    }
  }, [selectedLessonId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Check user role
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      if (!profileData || !['admin', 'trainer'].includes(profileData.role)) {
        alert('관리자 또는 트레이너만 접근 가능합니다.')
        return
      }

      // Load all lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select(`
          *,
          curriculum_days(day_number, title)
        `)
        .order('day_id', { ascending: true })

      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuizzes = async () => {
    try {
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', selectedLessonId)
        .order('order_index', { ascending: true })

      setQuizzes(quizzesData || [])
    } catch (error) {
      console.error('Load quizzes error:', error)
    }
  }

  const handleGenerateQuizzes = async () => {
    if (!selectedLessonId) {
      alert('레슨을 선택해주세요')
      return
    }

    if (!confirm(`AI가 ${questionCount}개의 퀴즈 문제를 생성합니다. 계속하시겠습니까?`)) {
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: selectedLessonId,
          question_count: questionCount,
          question_types: questionTypes
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.count}개의 퀴즈 문제가 생성되었습니다!\n검토 후 활성화해주세요.`)
        loadQuizzes()
      } else {
        alert(`❌ 생성 실패: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Generate quizzes error:', error)
      alert(`생성 중 오류 발생: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleActive = async (quizId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: !currentActive })
        .eq('id', quizId)

      if (error) {
        alert(`상태 변경 실패: ${error.message}`)
      } else {
        loadQuizzes()
      }
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('이 퀴즈를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) {
        alert(`삭제 실패: ${error.message}`)
      } else {
        alert('삭제되었습니다')
        loadQuizzes()
      }
    } catch (error) {
      console.error('Delete quiz error:', error)
    }
  }

  const handleQuestionTypeToggle = (type: string) => {
    setQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Loader2 className="h-8 w-8 animate-spin text-wsop-red" />
      </div>
    )
  }

  if (!profile || !['admin', 'trainer'].includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">접근 권한 없음</h2>
            <p className="text-wsop-medium-gray">관리자 또는 트레이너만 접근 가능합니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      <div className="container py-8">
        <h1 className="text-3xl font-black mb-8">🤖 AI 퀴즈 생성 관리</h1>

        {/* Quiz Generation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-wsop-red" />
              AI 퀴즈 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lesson Selection */}
            <div>
              <label className="block text-sm font-bold mb-2">레슨 선택</label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
              >
                <option value="">레슨을 선택하세요</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    Day {(lesson as any).curriculum_days?.day_number} - {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-bold mb-2">생성할 문제 수</label>
              <input
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
              />
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-bold mb-2">문제 유형 (중복 선택 가능)</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleQuestionTypeToggle('multiple_choice')}
                  className={`px-4 py-2 rounded font-bold transition-all ${
                    questionTypes.includes('multiple_choice')
                      ? 'bg-wsop-red text-white'
                      : 'bg-wsop-light-gray text-wsop-medium-gray hover:bg-wsop-medium-gray'
                  }`}
                >
                  객관식
                </button>
                <button
                  onClick={() => handleQuestionTypeToggle('true_false')}
                  className={`px-4 py-2 rounded font-bold transition-all ${
                    questionTypes.includes('true_false')
                      ? 'bg-wsop-red text-white'
                      : 'bg-wsop-light-gray text-wsop-medium-gray hover:bg-wsop-medium-gray'
                  }`}
                >
                  O/X
                </button>
                <button
                  onClick={() => handleQuestionTypeToggle('short_answer')}
                  className={`px-4 py-2 rounded font-bold transition-all ${
                    questionTypes.includes('short_answer')
                      ? 'bg-wsop-red text-white'
                      : 'bg-wsop-light-gray text-wsop-medium-gray hover:bg-wsop-medium-gray'
                  }`}
                >
                  주관식
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQuizzes}
              disabled={generating || !selectedLessonId || questionTypes.length === 0}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI가 퀴즈를 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  AI 퀴즈 생성하기
                </>
              )}
            </button>

            <p className="text-sm text-wsop-medium-gray">
              💡 생성된 퀴즈는 비활성 상태로 저장됩니다. 검토 후 활성화해주세요.
            </p>
          </CardContent>
        </Card>

        {/* Quiz List */}
        {selectedLessonId && (
          <Card>
            <CardHeader>
              <CardTitle>
                생성된 퀴즈 ({quizzes.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-wsop-medium-gray">아직 생성된 퀴즈가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className={`p-4 border-2 rounded-lg ${
                        quiz.is_active
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-wsop-light-gray dark:border-wsop-medium-gray'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-wsop-medium-gray">Q{index + 1}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              quiz.question_type === 'multiple_choice'
                                ? 'bg-blue-100 text-blue-700'
                                : quiz.question_type === 'true_false'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {quiz.question_type === 'multiple_choice' && '객관식'}
                              {quiz.question_type === 'true_false' && 'O/X'}
                              {quiz.question_type === 'short_answer' && '주관식'}
                            </span>
                            <span className="text-sm font-bold text-wsop-red">{quiz.points}점</span>
                            {quiz.is_active ? (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                활성
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                                비활성
                              </span>
                            )}
                          </div>
                          <p className="font-bold mb-2">{quiz.question}</p>

                          {/* Options for multiple choice */}
                          {quiz.question_type === 'multiple_choice' && quiz.options && (
                            <div className="ml-4 space-y-1 text-sm">
                              {JSON.parse(quiz.options).map((option: any) => (
                                <div
                                  key={option.id}
                                  className={`flex items-center gap-2 ${
                                    option.is_correct ? 'text-green-600 font-bold' : 'text-wsop-medium-gray'
                                  }`}
                                >
                                  {option.is_correct && <CheckCircle className="h-4 w-4" />}
                                  <span>{option.id}. {option.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* True/False answer */}
                          {quiz.question_type === 'true_false' && (
                            <div className="ml-4 text-sm">
                              <span className="text-green-600 font-bold">
                                정답: {quiz.correct_answer === 'true' ? 'O (참)' : 'X (거짓)'}
                              </span>
                            </div>
                          )}

                          {/* Explanation */}
                          {quiz.explanation && (
                            <div className="mt-2 p-3 bg-wsop-light-gray dark:bg-wsop-black rounded text-sm">
                              <span className="font-bold text-wsop-medium-gray">해설:</span> {quiz.explanation}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleActive(quiz.id, quiz.is_active)}
                            className={`p-2 rounded transition-all ${
                              quiz.is_active
                                ? 'bg-gray-200 hover:bg-gray-300'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                            title={quiz.is_active ? '비활성화' : '활성화'}
                          >
                            {quiz.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-2 rounded bg-red-500 hover:bg-red-600 text-white transition-all"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
