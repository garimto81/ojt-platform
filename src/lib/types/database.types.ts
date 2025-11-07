// GG Production 온보딩 플랫폼 데이터베이스 타입
// Auto-generated from Supabase schema

export type UserRole = 'trainee' | 'trainer' | 'admin'
export type LessonType = 'theory' | 'practical' | 'quiz' | 'video'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'locked'
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'
export type ConditionType = 'points' | 'days_completed' | 'perfect_score' | 'speed'

// ============================================
// Database Tables
// ============================================

export interface Profile {
  id: string // UUID
  email: string
  full_name: string | null
  role: UserRole
  department: string | null
  start_date: string | null // Date
  avatar_url: string | null
  points: number
  created_at: string // Timestamp
  updated_at: string // Timestamp
}

export interface CurriculumDay {
  id: number
  day_number: number
  title: string
  description: string | null
  objectives: string[]
  duration_hours: number
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string // UUID
  day_id: number
  title: string
  content: string | null
  lesson_type: LessonType
  duration_minutes: number
  order_index: number
  points_reward: number
  prerequisites: string[] // UUID[]
  is_required: boolean
  resources: LessonResources | null
  created_at: string
  updated_at: string
}

export interface LessonResources {
  video_url?: string
  pdf_url?: string
  external_links?: string[]
}

export interface UserProgress {
  id: string // UUID
  user_id: string // UUID
  lesson_id: string // UUID
  status: ProgressStatus
  started_at: string | null
  completed_at: string | null
  time_spent_minutes: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string // UUID
  lesson_id: string // UUID
  question: string
  question_type: QuestionType
  options: QuizOption[] | null
  correct_answer: string
  explanation: string | null
  points: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface QuizOption {
  id: string
  text: string
  is_correct: boolean
}

export interface QuizAttempt {
  id: string // UUID
  user_id: string // UUID
  quiz_id: string // UUID
  user_answer: string
  is_correct: boolean
  points_earned: number
  attempted_at: string
  feedback: string | null
}

export interface Achievement {
  id: string // UUID
  name: string
  description: string | null
  icon: string | null
  badge_color: string
  points_required: number | null
  condition_type: ConditionType
  condition_value: Record<string, any>
  created_at: string
}

export interface UserAchievement {
  id: string // UUID
  user_id: string // UUID
  achievement_id: string // UUID
  earned_at: string
}

// ============================================
// Extended Types (with relations)
// ============================================

export interface LessonWithProgress extends Lesson {
  progress?: UserProgress
  day?: CurriculumDay
  quizzes?: Quiz[]
}

export interface CurriculumDayWithLessons extends CurriculumDay {
  lessons: LessonWithProgress[]
}

export interface ProfileWithAchievements extends Profile {
  achievements: UserAchievement[]
}

export interface QuizWithAttempts extends Quiz {
  attempts: QuizAttempt[]
}

// ============================================
// API Response Types
// ============================================

export interface DashboardStats {
  completed_days: number
  total_days: number
  progress_percentage: number
  total_points: number
  rank: number
  total_users: number
  current_day: number
}

export interface LeaderboardEntry {
  user_id: string
  full_name: string
  avatar_url: string | null
  points: number
  completed_days: number
  rank: number
}

export interface LearningProgress {
  user_id: string
  day_progress: DayProgress[]
  overall_completion: number
  total_time_spent: number
}

export interface DayProgress {
  day_number: number
  completed_lessons: number
  total_lessons: number
  is_completed: boolean
  is_locked: boolean
}

// ============================================
// Form/Input Types
// ============================================

export interface UpdateProfileInput {
  full_name?: string
  department?: string
  avatar_url?: string
}

export interface CreateLessonInput {
  day_id: number
  title: string
  content?: string
  lesson_type: LessonType
  duration_minutes: number
  order_index: number
  points_reward?: number
  prerequisites?: string[]
  is_required?: boolean
  resources?: LessonResources
}

export interface UpdateProgressInput {
  lesson_id: string
  status: ProgressStatus
  started_at?: string
  completed_at?: string
  time_spent_minutes?: number
  notes?: string
}

export interface SubmitQuizInput {
  quiz_id: string
  user_answer: string
}

export interface CreateQuizInput {
  lesson_id: string
  question: string
  question_type: QuestionType
  options?: QuizOption[]
  correct_answer: string
  explanation?: string
  points: number
  order_index: number
}

// ============================================
// Utility Types
// ============================================

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? U : never
export type DbResultErr = { error: Error }

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// ============================================
// Supabase Database Type (for reference)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      curriculum_days: {
        Row: CurriculumDay
        Insert: Omit<CurriculumDay, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CurriculumDay, 'id' | 'created_at' | 'updated_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>
      }
      user_progress: {
        Row: UserProgress
        Insert: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>>
      }
      quizzes: {
        Row: Quiz
        Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Quiz, 'id' | 'created_at' | 'updated_at'>>
      }
      quiz_attempts: {
        Row: QuizAttempt
        Insert: Omit<QuizAttempt, 'id' | 'attempted_at'>
        Update: Partial<Omit<QuizAttempt, 'id' | 'attempted_at'>>
      }
      achievements: {
        Row: Achievement
        Insert: Omit<Achievement, 'id' | 'created_at'>
        Update: Partial<Omit<Achievement, 'id' | 'created_at'>>
      }
      user_achievements: {
        Row: UserAchievement
        Insert: Omit<UserAchievement, 'id' | 'earned_at'>
        Update: Partial<Omit<UserAchievement, 'id' | 'earned_at'>>
      }
    }
    Enums: {
      user_role: UserRole
      lesson_type: LessonType
      progress_status: ProgressStatus
      question_type: QuestionType
      condition_type: ConditionType
    }
  }
}
