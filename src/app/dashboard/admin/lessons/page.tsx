'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  Edit,
  Save,
  X,
  BookOpen,
  FileText,
  Clock,
  Trophy
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  duration_minutes: number
  points_reward: number
  order_index: number
  day_id: string
  curriculum_days: {
    day_number: number
    title: string
  }
}

export default function AdminLessonsPage() {
  const supabase = createClient()

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    duration_minutes: 30,
    points_reward: 50
  })

  useEffect(() => {
    loadData()
  }, [])

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
        .order('order_index', { ascending: true })

      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      duration_minutes: lesson.duration_minutes,
      points_reward: lesson.points_reward
    })
  }

  const handleSave = async () => {
    if (!selectedLesson) return

    if (!formData.title || !formData.content) {
      alert('제목과 콘텐츠는 필수입니다')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          duration_minutes: formData.duration_minutes,
          points_reward: formData.points_reward,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLesson.id)

      if (error) {
        alert(`저장 실패: ${error.message}`)
      } else {
        alert('✅ 레슨이 업데이트되었습니다')
        setSelectedLesson(null)
        loadData()
      }
    } catch (error: any) {
      console.error('Save lesson error:', error)
      alert(`저장 중 오류 발생: ${error.message}`)
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-3xl font-black mb-8">📝 레슨 콘텐츠 관리</h1>

        {!selectedLesson ? (
          /* Lesson List View */
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-wsop-red text-white text-xs font-bold rounded">
                          Day {(lesson as any).curriculum_days?.day_number}
                        </span>
                        <h3 className="text-lg font-black">{lesson.title}</h3>
                      </div>
                      <p className="text-sm text-wsop-medium-gray mb-3">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-sm text-wsop-medium-gray">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lesson.duration_minutes}분
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {lesson.points_reward}점
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {lesson.content ? `${lesson.content.length}자` : '콘텐츠 없음'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 text-sm font-bold bg-wsop-red text-white hover:bg-red-700 rounded transition-all"
                    >
                      <Edit className="h-4 w-4" />
                      편집
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Edit View */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>레슨 편집</CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-wsop-medium-gray hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
                  >
                    <X className="h-4 w-4" />
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-wsop-red text-white hover:bg-red-700 rounded transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        저장
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">레슨 제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                    placeholder="예: 포커 기초 용어"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                    rows={2}
                    placeholder="레슨에 대한 간단한 설명"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      소요 시간 (분)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      <Trophy className="inline h-4 w-4 mr-1" />
                      포인트 보상
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={formData.points_reward}
                      onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                      className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                    />
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  레슨 콘텐츠 (Markdown 지원)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black font-mono text-sm"
                  rows={20}
                  placeholder="# 레슨 제목&#10;&#10;## 학습 목표&#10;- 목표 1&#10;- 목표 2&#10;&#10;## 내용&#10;여기에 마크다운 형식으로 레슨 콘텐츠를 작성하세요..."
                />
                <p className="text-xs text-wsop-medium-gray mt-2">
                  💡 마크다운 문법을 사용할 수 있습니다. (제목: #, 굵게: **텍스트**, 목록: -, 등)
                </p>
              </div>

              {/* Preview Note */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  💡 저장 후 학습자 페이지에서 실제 렌더링을 확인할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
