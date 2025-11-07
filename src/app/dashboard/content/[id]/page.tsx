'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  content: string
  lesson_type: string
  duration_minutes: number
  created_at: string
  day_id: number
}

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLesson()
  }, [params.id])

  const fetchLesson = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        setError('레슨을 불러올 수 없습니다.')
        return
      }

      setLesson(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">{error || '레슨을 찾을 수 없습니다.'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        돌아가기
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {lesson.lesson_type.toUpperCase()}
            </span>
          </div>
          <CardTitle className="text-3xl">{lesson.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration_minutes}분</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Day {lesson.day_id}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
