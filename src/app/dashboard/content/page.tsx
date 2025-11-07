'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  FileText,
  Video,
  BookOpen,
  Trophy,
  Clock,
  Eye,
  Star,
  Edit,
  MoreVertical
} from 'lucide-react'

interface Content {
  id: string
  title: string
  slug: string
  description: string
  type: string
  status: string
  author: {
    name: string
    email: string
  }
  difficulty: string
  estimatedMinutes: number
  viewCount: number
  avgRating: number
  createdAt: string
}

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    type: ''
  })

  useEffect(() => {
    fetchContent()
  }, [filter])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.type) params.append('type', filter.type)

      const res = await fetch(`/api/content?${params}`)
      const data = await res.json()
      setContent(data.content || [])
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ARTICLE': return <FileText className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'GUIDE': return <BookOpen className="h-4 w-4" />
      case 'QUIZ': return <Trophy className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      PUBLISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    }

    const labels: Record<string, string> = {
      DRAFT: '초안',
      IN_REVIEW: '검토 중',
      APPROVED: '승인됨',
      PUBLISHED: '게시됨',
      ARCHIVED: '보관됨',
    }

    return (
      <span className={`status-badge font-bold ${colors[status] || colors.DRAFT}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'text-green-600 dark:text-green-400',
      INTERMEDIATE: 'text-yellow-600 dark:text-yellow-400',
      ADVANCED: 'text-orange-600 dark:text-orange-400',
      EXPERT: 'text-wsop-red dark:text-wsop-red',
    }

    const labels: Record<string, string> = {
      BEGINNER: '초급',
      INTERMEDIATE: '중급',
      ADVANCED: '고급',
      EXPERT: '전문가',
    }

    return (
      <span className={`font-black ${colors[difficulty] || colors.BEGINNER}`}>
        {labels[difficulty] || difficulty}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-wsop-dark-gray shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black">콘텐츠 관리</h1>
              <p className="text-wsop-medium-gray dark:text-gray-400">학습 콘텐츠 생성 및 관리</p>
            </div>
            <Link href="/dashboard/content/new">
              <Button className="btn-primary font-black">
                <Plus className="h-4 w-4 mr-2" />
                콘텐츠 생성
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-6">
        <div className="flex gap-4 mb-6">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 font-bold"
          >
            <option value="">전체 상태</option>
            <option value="DRAFT">초안</option>
            <option value="IN_REVIEW">검토 중</option>
            <option value="APPROVED">승인됨</option>
            <option value="PUBLISHED">게시됨</option>
            <option value="ARCHIVED">보관됨</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 font-bold"
          >
            <option value="">전체 유형</option>
            <option value="ARTICLE">아티클</option>
            <option value="VIDEO">비디오</option>
            <option value="GUIDE">가이드</option>
            <option value="QUIZ">퀴즈</option>
            <option value="EXERCISE">실습</option>
            <option value="TEMPLATE">템플릿</option>
          </select>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wsop-red"></div>
              <span className="ml-2 font-bold">콘텐츠 로딩 중...</span>
            </div>
          </div>
        ) : content.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-wsop-medium-gray mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">콘텐츠가 없습니다</h3>
              <p className="text-wsop-medium-gray dark:text-gray-400 mb-4">
                첫 번째 콘텐츠를 생성해보세요
              </p>
              <Link href="/dashboard/content/new">
                <Button className="btn-primary font-black">
                  <Plus className="h-4 w-4 mr-2" />
                  콘텐츠 생성
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-wsop-medium-gray font-bold">난이도:</span>
                      {getDifficultyBadge(item.difficulty)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-wsop-medium-gray font-bold">소요 시간:</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="h-3 w-3" />
                        {item.estimatedMinutes}분
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-wsop-medium-gray">
                      <span className="flex items-center gap-1 font-bold">
                        <Eye className="h-3 w-3" />
                        {item.viewCount}
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <Star className="h-3 w-3 text-wsop-red" />
                        {item.avgRating.toFixed(1)}
                      </span>
                    </div>

                    {/* Author */}
                    <div className="pt-3 border-t">
                      <p className="text-sm text-wsop-medium-gray font-bold">
                        작성자: {item.author.name}
                      </p>
                      <p className="text-xs text-wsop-medium-gray">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <Link href={`/dashboard/content/${item.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full font-bold">
                          <Edit className="h-3 w-3 mr-1" />
                          편집
                        </Button>
                      </Link>
                      <Link href={`/content/${item.slug}`} className="flex-1">
                        <Button size="sm" className="w-full btn-primary font-bold">
                          <Eye className="h-3 w-3 mr-1" />
                          보기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}