// 7-Day Learning Program Structure
// GG Production Knowledge Platform

export interface LearningObjective {
  id: string
  title: string
  completed: boolean
}

export interface LearningActivity {
  id: string
  type: 'video' | 'article' | 'quiz' | 'exercise' | 'simulation' | 'practical' | 'project'
  title: string
  duration: number // minutes
  required: boolean
  contentId?: string
}

export interface DayModule {
  day: number
  title: string
  subtitle: string
  description: string
  objectives: LearningObjective[]
  activities: LearningActivity[]
  assessment?: {
    type: 'quiz' | 'practical' | 'project'
    passingScore: number
    questions?: number
  }
}

export const learningModules: DayModule[] = [
  // Day 1-2: Poker Fundamentals & GGP Philosophy
  {
    day: 1,
    title: 'Welcome to GG Production',
    subtitle: 'Company Culture & Poker Basics',
    description: 'Introduction to GG Production values, poker fundamentals, and industry overview',
    objectives: [
      { id: 'd1-o1', title: 'Understand GGP mission and values', completed: false },
      { id: 'd1-o2', title: 'Learn poker hand rankings and basic rules', completed: false },
      { id: 'd1-o3', title: 'Identify major poker variants (Hold\'em, Omaha, Stud)', completed: false },
      { id: 'd1-o4', title: 'Understand production team roles', completed: false },
    ],
    activities: [
      { id: 'd1-a1', type: 'video', title: 'CEO Welcome & Company Vision', duration: 15, required: true },
      { id: 'd1-a2', type: 'article', title: 'Poker Hand Rankings Guide', duration: 20, required: true },
      { id: 'd1-a3', type: 'video', title: 'Texas Hold\'em Rules Explained', duration: 25, required: true },
      { id: 'd1-a4', type: 'exercise', title: 'Hand Ranking Practice', duration: 15, required: true },
      { id: 'd1-a5', type: 'article', title: 'Production Team Structure', duration: 10, required: true },
      { id: 'd1-a6', type: 'quiz', title: 'Day 1 Knowledge Check', duration: 10, required: true },
    ],
    assessment: {
      type: 'quiz',
      passingScore: 80,
      questions: 20
    }
  },
  {
    day: 2,
    title: 'Advanced Poker Knowledge',
    subtitle: 'Tournament Structures & Game Dynamics',
    description: 'Deep dive into tournament formats, blind structures, and player psychology',
    objectives: [
      { id: 'd2-o1', title: 'Master tournament structures (MTT, SNG, Cash)', completed: false },
      { id: 'd2-o2', title: 'Understand blind levels and antes', completed: false },
      { id: 'd2-o3', title: 'Learn pot odds and basic mathematics', completed: false },
      { id: 'd2-o4', title: 'Identify common player types and behaviors', completed: false },
    ],
    activities: [
      { id: 'd2-a1', type: 'article', title: 'Tournament Formats Explained', duration: 30, required: true },
      { id: 'd2-a2', type: 'video', title: 'Setting Blind Structures', duration: 20, required: true },
      { id: 'd2-a3', type: 'exercise', title: 'Calculate Pot Odds', duration: 25, required: true },
      { id: 'd2-a4', type: 'article', title: 'Player Psychology in Poker', duration: 15, required: false },
      { id: 'd2-a5', type: 'simulation', title: 'Tournament Setup Simulator', duration: 30, required: true },
      { id: 'd2-a6', type: 'quiz', title: 'Poker Knowledge Assessment', duration: 15, required: true },
    ],
    assessment: {
      type: 'quiz',
      passingScore: 85,
      questions: 25
    }
  },

  // Day 3-4: Production Skills & Graphics
  {
    day: 3,
    title: 'Production Fundamentals',
    subtitle: 'Broadcasting Basics & Equipment',
    description: 'Learn broadcasting equipment, software, and production workflow',
    objectives: [
      { id: 'd3-o1', title: 'Identify broadcast equipment and setup', completed: false },
      { id: 'd3-o2', title: 'Master OBS/vMix basics', completed: false },
      { id: 'd3-o3', title: 'Understand camera angles and positioning', completed: false },
      { id: 'd3-o4', title: 'Learn audio mixing fundamentals', completed: false },
    ],
    activities: [
      { id: 'd3-a1', type: 'video', title: 'Broadcast Equipment Overview', duration: 30, required: true },
      { id: 'd3-a2', type: 'article', title: 'OBS Studio Complete Guide', duration: 45, required: true },
      { id: 'd3-a3', type: 'video', title: 'Camera Setup for Poker', duration: 25, required: true },
      { id: 'd3-a4', type: 'exercise', title: 'OBS Scene Creation', duration: 40, required: true },
      { id: 'd3-a5', type: 'article', title: 'Audio Mixing Best Practices', duration: 20, required: false },
      { id: 'd3-a6', type: 'practical', title: 'Setup Mock Broadcast', duration: 60, required: true },
    ],
    assessment: {
      type: 'practical',
      passingScore: 75,
    }
  },
  {
    day: 4,
    title: 'Graphics & Visual Production',
    subtitle: 'Overlays, Animations & Branding',
    description: 'Create and manage broadcast graphics, overlays, and visual elements',
    objectives: [
      { id: 'd4-o1', title: 'Design tournament overlays', completed: false },
      { id: 'd4-o2', title: 'Create player information graphics', completed: false },
      { id: 'd4-o3', title: 'Implement real-time statistics', completed: false },
      { id: 'd4-o4', title: 'Maintain brand consistency', completed: false },
    ],
    activities: [
      { id: 'd4-a1', type: 'video', title: 'Graphics Design Principles', duration: 25, required: true },
      { id: 'd4-a2', type: 'article', title: 'Overlay Templates Guide', duration: 30, required: true },
      { id: 'd4-a3', type: 'exercise', title: 'Create Custom Overlay', duration: 45, required: true },
      { id: 'd4-a4', type: 'video', title: 'Real-time Stats Integration', duration: 20, required: true },
      { id: 'd4-a5', type: 'article', title: 'Brand Guidelines', duration: 15, required: true },
      { id: 'd4-a6', type: 'project', title: 'Design Complete Graphics Package', duration: 90, required: true },
    ],
    assessment: {
      type: 'project',
      passingScore: 80,
    }
  },

  // Day 5-6: Live Operations & Crisis Management
  {
    day: 5,
    title: 'Live Operations',
    subtitle: 'Real-time Production Management',
    description: 'Manage live broadcasts, coordinate teams, and handle real-time decisions',
    objectives: [
      { id: 'd5-o1', title: 'Coordinate multi-camera productions', completed: false },
      { id: 'd5-o2', title: 'Manage live commentary', completed: false },
      { id: 'd5-o3', title: 'Handle commercial breaks and transitions', completed: false },
      { id: 'd5-o4', title: 'Communicate with production team', completed: false },
    ],
    activities: [
      { id: 'd5-a1', type: 'video', title: 'Live Production Workflow', duration: 35, required: true },
      { id: 'd5-a2', type: 'simulation', title: 'Live Switching Simulator', duration: 60, required: true },
      { id: 'd5-a3', type: 'article', title: 'Commentary Coordination', duration: 20, required: true },
      { id: 'd5-a4', type: 'exercise', title: 'Transition Timing Practice', duration: 30, required: true },
      { id: 'd5-a5', type: 'video', title: 'Team Communication Protocols', duration: 15, required: true },
      { id: 'd5-a6', type: 'simulation', title: 'Full Tournament Simulation', duration: 120, required: true },
    ],
  },
  {
    day: 6,
    title: 'Crisis Management',
    subtitle: 'Handling Emergencies & Troubleshooting',
    description: 'Learn to handle technical failures, emergencies, and unexpected situations',
    objectives: [
      { id: 'd6-o1', title: 'Identify common technical issues', completed: false },
      { id: 'd6-o2', title: 'Execute emergency protocols', completed: false },
      { id: 'd6-o3', title: 'Manage stakeholder communication', completed: false },
      { id: 'd6-o4', title: 'Document and learn from incidents', completed: false },
    ],
    activities: [
      { id: 'd6-a1', type: 'article', title: 'Common Technical Failures', duration: 25, required: true },
      { id: 'd6-a2', type: 'video', title: 'Emergency Response Protocols', duration: 20, required: true },
      { id: 'd6-a3', type: 'simulation', title: 'Crisis Scenario: Stream Failure', duration: 30, required: true },
      { id: 'd6-a4', type: 'simulation', title: 'Crisis Scenario: Player Dispute', duration: 30, required: true },
      { id: 'd6-a5', type: 'exercise', title: 'Incident Report Writing', duration: 20, required: true },
      { id: 'd6-a6', type: 'simulation', title: 'Multi-Crisis Management', duration: 45, required: true },
    ],
  },

  // Day 7: Final Assessment & Certification
  {
    day: 7,
    title: 'Final Assessment',
    subtitle: 'Certification & Career Planning',
    description: 'Complete final assessment, receive certification, and plan your career path',
    objectives: [
      { id: 'd7-o1', title: 'Pass comprehensive knowledge test', completed: false },
      { id: 'd7-o2', title: 'Complete practical production project', completed: false },
      { id: 'd7-o3', title: 'Present improvement proposal', completed: false },
      { id: 'd7-o4', title: 'Receive GGP certification', completed: false },
    ],
    activities: [
      { id: 'd7-a1', type: 'quiz', title: 'Comprehensive Knowledge Test', duration: 60, required: true },
      { id: 'd7-a2', type: 'practical', title: 'Solo Production Project', duration: 120, required: true },
      { id: 'd7-a3', type: 'exercise', title: 'Innovation Proposal', duration: 45, required: true },
      { id: 'd7-a4', type: 'video', title: 'Career Path Options', duration: 20, required: false },
      { id: 'd7-a5', type: 'article', title: 'Continuous Learning Resources', duration: 15, required: false },
      { id: 'd7-a6', type: 'video', title: 'Graduation & Next Steps', duration: 10, required: true },
    ],
    assessment: {
      type: 'practical',
      passingScore: 85,
    }
  },
]

// Helper functions
export function getModuleByDay(day: number): DayModule | undefined {
  return learningModules.find(module => module.day === day)
}

export function getTotalActivities(): number {
  return learningModules.reduce((total, module) => total + module.activities.length, 0)
}

export function getTotalDuration(): number {
  return learningModules.reduce((total, module) => {
    const moduleDuration = module.activities.reduce((sum, activity) => sum + activity.duration, 0)
    return total + moduleDuration
  }, 0)
}

export function getRequiredActivities(): number {
  return learningModules.reduce((total, module) => {
    const required = module.activities.filter(a => a.required).length
    return total + required
  }, 0)
}

export function calculateProgress(completedActivities: string[]): {
  overall: number
  byDay: Record<number, number>
} {
  const byDay: Record<number, number> = {}

  learningModules.forEach(module => {
    const completed = module.activities.filter(a => completedActivities.includes(a.id)).length
    const total = module.activities.filter(a => a.required).length
    byDay[module.day] = total > 0 ? (completed / total) * 100 : 0
  })

  const totalRequired = getRequiredActivities()
  const totalCompleted = completedActivities.length
  const overall = totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0

  return { overall, byDay }
}