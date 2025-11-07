'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, ArrowLeft } from 'lucide-react'

interface HomePageContent {
  hero: {
    badge: string
    title: string
    subtitle: string
    metric: string
  }
  education: {
    title: string
    subtitle: string
    features: Array<{
      title: string
      description: string
    }>
  }
  stats: {
    title: string
    metrics: Array<{
      number: string
      label: string
    }>
  }
  program: {
    title: string
    days: Array<{
      day: string
      title: string
      topics: string[]
    }>
  }
  cta: {
    title: string
    subtitle: string
  }
}

const defaultContent: HomePageContent = {
  hero: {
    badge: 'GG PRODUCTION 사내 전용',
    title: '포커 프로덕션 전문가 온보딩 플랫폼',
    subtitle: '신규 입사자가 포커 프로덕션 현장 투입까지',
    metric: '21일 → 7일'
  },
  education: {
    title: '교육 시스템',
    subtitle: 'GG PRODUCTION 현장 검증 커리큘럼',
    features: [
      {
        title: '체계적 커리큘럼',
        description: '포커 기초부터 라이브 방송 운영까지 단계별 학습'
      },
      {
        title: '실전 중심 교육',
        description: '실제 토너먼트 영상과 시나리오 기반 실습'
      },
      {
        title: '선배 멘토링',
        description: '현직 프로덕션 팀원의 1:1 코칭 및 피드백'
      },
      {
        title: '현장 투입 검증',
        description: '최종 평가 통과 후 즉시 실무 배치'
      }
    ]
  },
  stats: {
    title: '2024년 교육 성과',
    metrics: [
      { number: '21일 → 7일', label: '온보딩 기간' },
      { number: '95%', label: '현장 투입률' },
      { number: '42명', label: '수료 인원' }
    ]
  },
  program: {
    title: '7일 교육 프로그램',
    days: [
      {
        day: 'DAY 1-2',
        title: '포커 기초',
        topics: ['텍사스 홀덤 룰', '핸드 랭킹', '베팅 구조', '토너먼트 용어']
      },
      {
        day: 'DAY 3-4',
        title: '프로덕션 스킬',
        topics: ['카메라 스위칭', '그래픽 오버레이', '오디오 믹싱', '스트림 관리']
      },
      {
        day: 'DAY 5-6',
        title: '실전 시뮬레이션',
        topics: ['3시간 모의 방송', '긴급 상황 대응', '팀 협업 훈련', '품질 관리']
      },
      {
        day: 'DAY 7',
        title: '최종 평가',
        topics: ['이론 테스트', '실무 평가', '현장 투입 승인']
      }
    ]
  },
  cta: {
    title: '지금 바로 시작하세요',
    subtitle: 'GG PRODUCTION 사내 계정으로 로그인'
  }
}

export default function PageEditorPage() {
  const router = useRouter()
  const [content, setContent] = useState<HomePageContent>(defaultContent)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // localStorage에 저장
    localStorage.setItem('homepage-content', JSON.stringify(content))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)

    // TODO: API로 서버에 저장
    // await fetch('/api/admin/homepage', {
    //   method: 'POST',
    //   body: JSON.stringify(content)
    // })
  }

  const handlePreview = () => {
    localStorage.setItem('homepage-content', JSON.stringify(content))
    window.open('/', '_blank')
  }

  return (
    <div className="min-h-screen bg-wsop-light-gray dark:bg-wsop-dark-gray">
      {/* Header */}
      <div className="bg-white dark:bg-wsop-black border-b border-wsop-light-gray dark:border-wsop-medium-gray sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="btn-ghost inline-flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                뒤로
              </button>
              <h1 className="text-2xl font-black text-wsop-black dark:text-white">
                메인 페이지 편집기
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="btn-secondary inline-flex items-center"
              >
                <Eye className="h-5 w-5 mr-2" />
                미리보기
              </button>
              <button
                onClick={handleSave}
                className="btn-primary inline-flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {saved ? '저장됨' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <section className="bg-white dark:bg-wsop-dark-gray rounded-lg p-6 mb-6 border border-wsop-light-gray dark:border-wsop-medium-gray">
          <h2 className="text-xl font-bold text-wsop-black dark:text-white mb-4">Hero 섹션</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                배지 텍스트
              </label>
              <input
                type="text"
                value={content.hero.badge}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, badge: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                메인 제목
              </label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                부제목
              </label>
              <input
                type="text"
                value={content.hero.subtitle}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                핵심 지표
              </label>
              <input
                type="text"
                value={content.hero.metric}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, metric: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="bg-white dark:bg-wsop-dark-gray rounded-lg p-6 mb-6 border border-wsop-light-gray dark:border-wsop-medium-gray">
          <h2 className="text-xl font-bold text-wsop-black dark:text-white mb-4">교육 시스템</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                섹션 제목
              </label>
              <input
                type="text"
                value={content.education.title}
                onChange={(e) => setContent({
                  ...content,
                  education: { ...content.education, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                부제목
              </label>
              <input
                type="text"
                value={content.education.subtitle}
                onChange={(e) => setContent({
                  ...content,
                  education: { ...content.education, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-wsop-black dark:text-white">주요 기능</h3>
            {content.education.features.map((feature, index) => (
              <div key={index} className="bg-wsop-light-gray dark:bg-wsop-black p-4 rounded">
                <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                  제목 {index + 1}
                </label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => {
                    const newFeatures = [...content.education.features]
                    newFeatures[index].title = e.target.value
                    setContent({
                      ...content,
                      education: { ...content.education, features: newFeatures }
                    })
                  }}
                  className="w-full px-4 py-2 mb-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-dark-gray text-wsop-black dark:text-white"
                />

                <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                  설명 {index + 1}
                </label>
                <textarea
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...content.education.features]
                    newFeatures[index].description = e.target.value
                    setContent({
                      ...content,
                      education: { ...content.education, features: newFeatures }
                    })
                  }}
                  rows={2}
                  className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-dark-gray text-wsop-black dark:text-white"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-wsop-dark-gray rounded-lg p-6 mb-6 border border-wsop-light-gray dark:border-wsop-medium-gray">
          <h2 className="text-xl font-bold text-wsop-black dark:text-white mb-4">교육 성과</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
              섹션 제목
            </label>
            <input
              type="text"
              value={content.stats.title}
              onChange={(e) => setContent({
                ...content,
                stats: { ...content.stats, title: e.target.value }
              })}
              className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.stats.metrics.map((metric, index) => (
              <div key={index} className="bg-wsop-light-gray dark:bg-wsop-black p-4 rounded">
                <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                  숫자
                </label>
                <input
                  type="text"
                  value={metric.number}
                  onChange={(e) => {
                    const newMetrics = [...content.stats.metrics]
                    newMetrics[index].number = e.target.value
                    setContent({
                      ...content,
                      stats: { ...content.stats, metrics: newMetrics }
                    })
                  }}
                  className="w-full px-4 py-2 mb-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-dark-gray text-wsop-black dark:text-white"
                />

                <label className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                  라벨
                </label>
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => {
                    const newMetrics = [...content.stats.metrics]
                    newMetrics[index].label = e.target.value
                    setContent({
                      ...content,
                      stats: { ...content.stats, metrics: newMetrics }
                    })
                  }}
                  className="w-full px-4 py-2 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-dark-gray text-wsop-black dark:text-white"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end gap-3 sticky bottom-4">
          <button
            onClick={handlePreview}
            className="btn-secondary inline-flex items-center"
          >
            <Eye className="h-5 w-5 mr-2" />
            미리보기
          </button>
          <button
            onClick={handleSave}
            className="btn-primary inline-flex items-center shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {saved ? '저장 완료!' : '변경사항 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
