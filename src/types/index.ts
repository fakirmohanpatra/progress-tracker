export type PillarType = 'dsa' | 'system_design' | 'backend';

export type TopicStatus = 'pending' | 'in_progress' | 'completed' | 'mastered';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ReviewOutcome = 'remembered' | 'struggled' | 'forgot';

export interface ReadinessOption {
  level: number;
  label: string;
  badge: string;
  color: string;
  description: string;
}

export const READINESS_LEVELS: ReadinessOption[] = [
  {
    level: 1,
    label: 'Need Practice',
    badge: '🌱 Level 1',
    color: 'text-slate-400 border-slate-700 bg-slate-800/40',
    description: 'Just started / Need to study fundamentals',
  },
  {
    level: 2,
    label: 'Theory Understood',
    badge: '📖 Level 2',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Know concepts, need hands-on coding practice',
  },
  {
    level: 3,
    label: 'Working Knowledge',
    badge: '🛠️ Level 3',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Can implement in daily production work',
  },
  {
    level: 4,
    label: 'Interview Ready',
    badge: '🎯 Level 4',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Can solve and explain fluently under interview pressure',
  },
  {
    level: 5,
    label: 'Mastered & Deep',
    badge: '🏆 Level 5',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Deep mastery: can discuss CLR/DB internals, trade-offs, and teach others',
  },
];

export interface Topic {
  id: string;
  pillar: PillarType;
  category: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  priority: number; // 1 = Highest (5-star), 2 = High (4-star), 3 = Core (3-star), 4 = Good to know
  status: TopicStatus;
  confidence: number; // 0 to 5 (maps to READINESS_LEVELS)
  day_target: number; // 1 to 90
  external_url?: string | null;
  summary: string;
  key_intuition: string;
  pitfalls: string;
  notes: string;
  code_snippet?: string | null;
  time_complexity?: string | null;
  space_complexity?: string | null;
  box: number; // 1 (1 day), 2 (3 days), 3 (7 days), 4 (14 days), 5 (30 days)
  last_reviewed_at?: string | null;
  next_review_at?: string | null;
  times_reviewed: number;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewLog {
  id: string;
  topic_id: string;
  topic_title?: string;
  pillar?: PillarType;
  reviewed_at: string;
  confidence_rating: number;
  outcome: ReviewOutcome;
  box_before: number;
  box_after: number;
  notes?: string | null;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  topics_completed_count: number;
  topics_reviewed_count: number;
  study_time_minutes: number;
  streak_count: number;
  focus_summary?: string | null;
  created_at: string;
}

export interface AppSettings {
  startDate: string; // YYYY-MM-DD
  targetDays: number; // 90
  dailyGoalTopics: number; // default 3
  currentDay: number; // 1-90 calculated
}

export interface PillarStats {
  pillar: PillarType;
  title: string;
  total: number;
  completed: number;
  inProgress: number;
  mastered: number;
  pending: number;
  percentage: number;
  dueForReview: number;
}

export interface DashboardMetrics {
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  masteredTopics: number;
  overallPercentage: number;
  currentStreak: number;
  longestStreak: number;
  todayCompletedCount: number;
  weeklyCompletedCount: number;
  dueForReviewCount: number;
  currentDay: number; // out of 90
  daysRemaining: number;
  expectedCompletedByNow: number;
  paceStatus: 'ahead' | 'on_track' | 'behind';
  topicsNeededPerDay: number;
  pillars: {
    dsa: PillarStats;
    system_design: PillarStats;
    backend: PillarStats;
  };
  todaysFocus: Topic[];
  dueForReview: Topic[];
  upcomingRevisions: {
    date: string;
    dayLabel: string;
    topics: { id: string; title: string; pillar: PillarType; box: number }[];
  }[];
  recentCompleted: Topic[];
  heatmapData: { date: string; count: number; minutes: number }[];
  sqlStats: SqlStats;
  applicationStats?: {
    total: number;
    active: number;
    interviewsScheduled: number;
    offers: number;
  };
}

export interface SqlStats {
  total: number;
  completed: number;
  percentage: number;
}

export type ViewTab =
  | 'dashboard'
  | 'dsa'
  | 'system_design'
  | 'backend'
  | 'sql_practice'
  | 'calendar'
  | 'review_queue'
  | 'notes'
  | 'analytics'
  | 'applications';

export interface SqlChallenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  initialQuery: string;
  solutionQuery: string;
  expectedOutputHint: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'technical'
  | 'system_design'
  | 'onsite'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  applied_date: string; // YYYY-MM-DD
  status: ApplicationStatus;
  point_of_contact?: string | null;
  interview_date?: string | null; // ISO string or YYYY-MM-DDTHH:mm
  comment?: string | null;
  location?: string | null;
  job_url?: string | null;
  salary_range?: string | null;
  created_at: string;
  updated_at: string;
}
