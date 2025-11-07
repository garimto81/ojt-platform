'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, XCircle, Trophy, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface QuizOption {
  id: string
  text: string
  is_correct: boolean
}

interface Quiz {
  id: string
  lesson_id: string
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: QuizOption[] | null
  correct_answer: string
  explanation: string | null
  points: number
  order_index: number
  userAttempt: any | null
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string
  const supabase = createClient()

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [submittedQuizzes, setSubmittedQuizzes] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')

  useEffect(() => {
    loadQuizzes()
  }, [lessonId])

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      // Fetch lesson info
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('title, curriculum_days(day_number, title)')
        .eq('id', lessonId)
        .single()

      if (lessonData) {
        const day = (lessonData as any).curriculum_days
        setLessonTitle(`Day ${day.day_number}: ${lessonData.title}`)
      }

      // Fetch quizzes
      const response = await fetch(`/api/quiz/${lessonId}`)
      const data = await response.json()

      if (data.quizzes) {
        setQuizzes(data.quizzes)

        // Pre-populate already attempted quizzes
        const attempted: { [key: string]: any } = {}
        data.quizzes.forEach((quiz: Quiz) => {
          if (quiz.userAttempt) {
            attempted[quiz.id] = {
              is_correct: quiz.userAttempt.is_correct,
              points_earned: quiz.userAttempt.points_earned,
              user_answer: quiz.userAttempt.user_answer,
              correct_answer: quiz.correct_answer,
              explanation: quiz.explanation
            }
          }
        })
        setSubmittedQuizzes(attempted)
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (quizId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [quizId]: answer }))
  }

  const handleSubmitAnswer = async () => {
    const currentQuiz = quizzes[currentQuizIndex]
    const userAnswer = userAnswers[currentQuiz.id]

    if (!userAnswer) {
      alert('답을 선택해주세요')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: currentQuiz.id,
          user_answer: userAnswer
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmittedQuizzes(prev => ({
          ...prev,
          [currentQuiz.id]: result
        }))
      } else {
        alert(`제출 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('답안 제출 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1)
    }
  }

  const calculateScore = () => {
    const submitted = Object.values(submittedQuizzes)
    const correct = submitted.filter((s: any) => s.is_correct).length
    const totalPoints = submitted.reduce((sum: number, s: any) => sum + s.points_earned, 0)
    return { correct, total: quizzes.length, totalPoints }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Loader2 className="h-8 w-8 animate-spin text-wsop-red" />
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <div className="container py-8">
          <Link href={`/dashboard/learning/${lessonId}`} className="inline-flex items-center text-wsop-medium-gray hover:text-wsop-black dark:hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            레슨으로 돌아가기
          </Link>
          <div className="max-w-2xl mx-auto bg-white dark:bg-wsop-dark-gray rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-black mb-4">이 레슨에는 퀴즈가 없습니다</h2>
            <p className="text-wsop-medium-gray mb-6">다른 레슨을 확인해보세요</p>
            <Link href="/dashboard/learning" className="btn-primary">
              학습 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuiz = quizzes[currentQuizIndex]
  const isSubmitted = !!submittedQuizzes[currentQuiz.id]
  const result = submittedQuizzes[currentQuiz.id]
  const allCompleted = Object.keys(submittedQuizzes).length === quizzes.length
  const score = calculateScore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      <div className="container py-8">
        <Link href={`/dashboard/learning/${lessonId}`} className="inline-flex items-center text-wsop-medium-gray hover:text-wsop-black dark:hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          레슨으로 돌아가기
        </Link>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-wsop-dark-gray rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-black mb-2">{lessonTitle} - 퀴즈</h1>
            <div className="flex items-center justify-between">
              <p className="text-wsop-medium-gray">
                문제 {currentQuizIndex + 1} / {quizzes.length}
              </p>
              {allCompleted && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-wsop-medium-gray">점수</div>
                    <div className="text-xl font-black text-wsop-red">{score.correct} / {score.total}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-wsop-medium-gray">획득 포인트</div>
                    <div className="text-xl font-black text-wsop-red flex items-center">
                      <Trophy className="h-5 w-5 mr-1" />
                      {score.totalPoints}P
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-white dark:bg-wsop-dark-gray rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold flex-1">{currentQuiz.question}</h2>
                <div className="ml-4 text-sm font-bold text-wsop-red whitespace-nowrap">
                  {currentQuiz.points}점
                </div>
              </div>

              {/* Question Type Badge */}
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-wsop-light-gray text-wsop-black mb-6">
                {currentQuiz.question_type === 'multiple_choice' && '객관식'}
                {currentQuiz.question_type === 'true_false' && 'O/X'}
                {currentQuiz.question_type === 'short_answer' && '주관식'}
              </div>
            </div>

            {/* Answer Options */}
            {currentQuiz.question_type === 'multiple_choice' && currentQuiz.options && (
              <div className="space-y-3 mb-6">
                {currentQuiz.options.map((option) => {
                  const isSelected = userAnswers[currentQuiz.id] === option.id
                  const showResult = isSubmitted
                  const isCorrectOption = option.is_correct
                  const isUserAnswer = result?.user_answer === option.id

                  return (
                    <button
                      key={option.id}
                      onClick={() => !isSubmitted && handleAnswerChange(currentQuiz.id, option.id)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResult
                          ? isCorrectOption
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : isUserAnswer && !isCorrectOption
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-wsop-light-gray dark:border-wsop-medium-gray'
                          : isSelected
                          ? 'border-wsop-red bg-wsop-red/5'
                          : 'border-wsop-light-gray dark:border-wsop-medium-gray hover:border-wsop-red'
                      } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{option.text}</span>
                        {showResult && isCorrectOption && (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                        )}
                        {showResult && isUserAnswer && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-600 ml-2" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {currentQuiz.question_type === 'true_false' && (
              <div className="space-y-3 mb-6">
                {['true', 'false'].map((option) => {
                  const isSelected = userAnswers[currentQuiz.id] === option
                  const showResult = isSubmitted
                  const isCorrectOption = currentQuiz.correct_answer === option
                  const isUserAnswer = result?.user_answer === option

                  return (
                    <button
                      key={option}
                      onClick={() => !isSubmitted && handleAnswerChange(currentQuiz.id, option)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResult
                          ? isCorrectOption
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : isUserAnswer && !isCorrectOption
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-wsop-light-gray dark:border-wsop-medium-gray'
                          : isSelected
                          ? 'border-wsop-red bg-wsop-red/5'
                          : 'border-wsop-light-gray dark:border-wsop-medium-gray hover:border-wsop-red'
                      } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1 font-bold">{option === 'true' ? 'O (참)' : 'X (거짓)'}</span>
                        {showResult && isCorrectOption && (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                        )}
                        {showResult && isUserAnswer && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-600 ml-2" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {currentQuiz.question_type === 'short_answer' && (
              <div className="mb-6">
                <textarea
                  value={userAnswers[currentQuiz.id] || ''}
                  onChange={(e) => !isSubmitted && handleAnswerChange(currentQuiz.id, e.target.value)}
                  disabled={isSubmitted}
                  className="w-full p-4 border-2 border-wsop-light-gray dark:border-wsop-medium-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black disabled:opacity-50"
                  rows={4}
                  placeholder="답을 입력하세요..."
                />
              </div>
            )}

            {/* Result Feedback */}
            {isSubmitted && (
              <div className={`p-4 rounded-lg mb-6 ${
                result.is_correct
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-500'
              }`}>
                <div className="flex items-center mb-2">
                  {result.is_correct ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      <span className="font-bold text-green-700 dark:text-green-400">정답입니다! +{result.points_earned}점</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600 mr-2" />
                      <span className="font-bold text-red-700 dark:text-red-400">오답입니다</span>
                    </>
                  )}
                </div>
                {result.explanation && (
                  <p className="text-sm text-wsop-medium-gray">{result.explanation}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuizIndex === 0}
                className="px-4 py-2 rounded font-bold text-wsop-medium-gray hover:text-wsop-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                이전 문제
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !userAnswers[currentQuiz.id]}
                  className="btn-primary flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      제출 중...
                    </>
                  ) : (
                    '답안 제출'
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  {currentQuizIndex < quizzes.length - 1 ? (
                    <button onClick={handleNext} className="btn-primary">
                      다음 문제
                    </button>
                  ) : (
                    <Link href={`/dashboard/learning/${lessonId}`} className="btn-primary">
                      레슨으로 돌아가기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {quizzes.map((quiz, index) => {
              const isCompleted = !!submittedQuizzes[quiz.id]
              const isCorrect = submittedQuizzes[quiz.id]?.is_correct
              const isCurrent = index === currentQuizIndex

              return (
                <button
                  key={quiz.id}
                  onClick={() => setCurrentQuizIndex(index)}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${
                    isCurrent
                      ? 'bg-wsop-red text-white scale-110'
                      : isCompleted
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-wsop-light-gray text-wsop-medium-gray hover:bg-wsop-red hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
