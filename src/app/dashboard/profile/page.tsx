'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  BookOpen,
  Target,
  Edit2,
  Save,
  X,
  Loader2,
  LogOut
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [progressStats, setProgressStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)
      setFormData({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        location: profileData?.location || ''
      })

      // Load progress statistics
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('status')
        .eq('user_id', user.id)

      const completed = progressData?.filter(p => p.status === 'completed').length || 0
      const inProgress = progressData?.filter(p => p.status === 'in_progress').length || 0
      const total = progressData?.length || 0

      setProgressStats({
        completed,
        inProgress,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      })

    } catch (error) {
      console.error('Load profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        alert(`저장 실패: ${error.message}`)
      } else {
        alert('✅ 프로필이 업데이트되었습니다')
        setEditing(false)
        loadProfile()
      }
    } catch (error) {
      console.error('Save profile error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return

    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Loader2 className="h-8 w-8 animate-spin text-wsop-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      <div className="container py-8 max-w-5xl">
        <h1 className="text-3xl font-black mb-8">내 프로필</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>프로필 정보</CardTitle>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-wsop-red hover:bg-wsop-red hover:text-white rounded transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                    수정
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          location: profile?.location || ''
                        })
                      }}
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
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-wsop-red to-red-700 rounded-full flex items-center justify-center text-white text-3xl font-black">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-black">{profile?.full_name || 'Unknown User'}</h3>
                  <p className="text-sm text-wsop-medium-gray">{profile?.role || 'trainee'}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    이름
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                    />
                  ) : (
                    <p className="text-wsop-medium-gray">{profile?.full_name || '설정되지 않음'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    이메일
                  </label>
                  <p className="text-wsop-medium-gray">{profile?.email || '설정되지 않음'}</p>
                  <p className="text-xs text-wsop-medium-gray mt-1">이메일은 변경할 수 없습니다</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    전화번호
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                      placeholder="010-1234-5678"
                    />
                  ) : (
                    <p className="text-wsop-medium-gray">{profile?.phone || '설정되지 않음'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    위치
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-3 border-2 border-wsop-light-gray rounded-lg focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black"
                      placeholder="서울, 대한민국"
                    />
                  ) : (
                    <p className="text-wsop-medium-gray">{profile?.location || '설정되지 않음'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    가입일
                  </label>
                  <p className="text-wsop-medium-gray">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>학습 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-wsop-red to-red-700 rounded-lg text-white">
                  <Trophy className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-3xl font-black">{profile?.points || 0}</div>
                  <div className="text-sm opacity-90">포인트</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wsop-medium-gray">완료한 레슨</span>
                    <span className="font-bold">{progressStats?.completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wsop-medium-gray">진행 중인 레슨</span>
                    <span className="font-bold">{progressStats?.inProgress || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wsop-medium-gray">전체 진행률</span>
                    <span className="font-bold text-wsop-red">{progressStats?.percentage || 0}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-wsop-light-gray rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-wsop-red to-red-700 h-3 rounded-full transition-all"
                    style={{ width: `${progressStats?.percentage || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>계정 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  로그아웃
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
