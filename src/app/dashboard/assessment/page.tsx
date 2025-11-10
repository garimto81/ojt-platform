'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCw,
  FileText,
  Target,
  Award
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const sampleQuestions: Question[] = []

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // 질문이 없을 경우 처리
  if (sampleQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>평가 문제 준비 중</CardTitle>
            <CardDescription>
              현재 이용 가능한 평가 문제가 없습니다. 관리자에게 문의해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              대시보드로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerIndex })
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    sampleQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: sampleQuestions.length,
      percentage: (correct / sampleQuestions.length) * 100
    }
  }

  const retakeAssessment = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setTimeElapsed(0)
  }

  if (showResults) {
    const score = calculateScore()
    const passed = score.percentage >= 80

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-12 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {passed ? (
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </CardTitle>
              <CardDescription className="text-lg">
                {passed
                  ? 'You passed the assessment!'
                  : 'You need 80% to pass. Review the material and try again.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Score Display */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">{score.percentage.toFixed(0)}%</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {score.correct} out of {score.total} questions correct
                </p>
              </div>

              {/* Question Review */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold">Review Your Answers</h3>
                {sampleQuestions.map((q, index) => {
                  const userAnswer = selectedAnswers[q.id]
                  const isCorrect = userAnswer === q.correctAnswer

                  return (
                    <Card key={q.id} className={isCorrect ? 'border-green-500' : 'border-red-500'}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              {index + 1}. {q.question}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {q.options[userAnswer] || 'No answer'}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            )}
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm">
                                <span className="font-semibold">Explanation:</span> {q.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                {!passed && (
                  <Button onClick={retakeAssessment} variant="outline">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Retake Assessment
                  </Button>
                )}
                <Button
                  onClick={() => router.push('/dashboard/learning')}
                  className={passed ? 'bg-ggp-primary hover:bg-orange-600' : ''}
                >
                  {passed ? 'Continue to Next Module' : 'Return to Learning'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {passed && (
                <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-300">
                  <CardContent className="pt-6 text-center">
                    <Award className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">Achievement Unlocked!</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You earned the "Poker Fundamentals Expert" badge
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = sampleQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Module Assessment</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Day 3 - Production Fundamentals
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>15:00</span>
              </div>
              <div className="text-sm">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ggp-primary to-ggp-secondary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{question.question}</p>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswers[question.id] === index

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-ggp-primary bg-orange-50 dark:bg-orange-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-ggp-primary' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-ggp-primary" />}
                      </div>
                      <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="bg-ggp-primary hover:bg-orange-600"
                disabled={selectedAnswers[question.id] === undefined}
              >
                {currentQuestion === sampleQuestions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Assessment Tips</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li>• Read each question carefully</li>
                  <li>• You need 80% to pass this assessment</li>
                  <li>• You can retake the assessment if needed</li>
                  <li>• Review explanations after submission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}