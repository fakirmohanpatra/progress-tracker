import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Topic,
  ReviewLog,
  DailyLog,
  PillarType,
  TopicStatus,
  Difficulty,
  DashboardMetrics,
  PillarStats,
  ReviewOutcome,
  JobApplication,
  ApplicationStatus,
  SqlStats,
} from '@/types';
import { LEITNER_INTERVALS_DAYS } from './db';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing from environment variables.');
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseInstance;
}

// -------------------------------------------------------------
// Topics CRUD
// -------------------------------------------------------------

export async function supabaseGetTopics(filters?: {
  pillar?: PillarType;
  category?: string;
  status?: TopicStatus;
  difficulty?: Difficulty;
  search?: string;
  dueOnly?: boolean;
}): Promise<Topic[]> {
  const sb = getSupabase();
  let query = sb.from('topics').select('*');

  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters?.dueOnly) {
    query = query
      .not('next_review_at', 'is', null)
      .lte('next_review_at', new Date().toISOString());
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,category.ilike.%${filters.search}%,key_intuition.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  query = query.order('priority', { ascending: true }).order('day_target', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getTopics error:', error);
    return [];
  }
  return (data || []) as Topic[];
}

export async function supabaseGetTopicById(id: string): Promise<Topic | undefined> {
  const sb = getSupabase();
  const { data, error } = await sb.from('topics').select('*').eq('id', id).maybeSingle();
  if (error || !data) return undefined;
  return data as Topic;
}

export async function supabaseCreateTopic(
  topic: Partial<Topic> & { title: string; pillar: PillarType; category: string }
): Promise<Topic> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = topic.id || `${topic.pillar}-${slug}-${Date.now().toString().slice(-4)}`;

  const newTopic = {
    id,
    pillar: topic.pillar,
    category: topic.category,
    title: topic.title,
    slug,
    difficulty: topic.difficulty || 'Medium',
    priority: topic.priority ?? 2,
    status: topic.status || 'pending',
    confidence: topic.confidence ?? 1,
    day_target: topic.day_target ?? 1,
    external_url: topic.external_url || null,
    summary: topic.summary || '',
    key_intuition: topic.key_intuition || '',
    pitfalls: topic.pitfalls || '',
    notes: topic.notes || '',
    code_snippet: topic.code_snippet || null,
    time_complexity: topic.time_complexity || null,
    space_complexity: topic.space_complexity || null,
    box: topic.box ?? 1,
    last_reviewed_at: null,
    next_review_at: null,
    times_reviewed: 0,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await sb.from('topics').insert(newTopic).select().single();
  if (error) throw error;
  return data as Topic;
}

export async function supabaseUpdateTopic(
  id: string,
  updates: Partial<Topic>
): Promise<Topic | undefined> {
  const sb = getSupabase();
  const current = await supabaseGetTopicById(id);
  if (!current) return undefined;

  const now = new Date().toISOString();
  let completedAt = current.completed_at;

  if (
    (updates.status === 'completed' || updates.status === 'mastered') &&
    current.status !== 'completed' &&
    current.status !== 'mastered'
  ) {
    completedAt = now;
  } else if (updates.status === 'pending') {
    completedAt = null;
  }

  const payload: Record<string, unknown> = {
    ...updates,
    completed_at: completedAt,
    updated_at: now,
  };

  const { data, error } = await sb
    .from('topics')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateTopic error:', error);
    return undefined;
  }

  if (completedAt && !current.completed_at) {
    await supabaseRecordDailyCompletion();
  }

  return data as Topic;
}

export async function supabaseDeleteTopic(id: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb.from('topics').delete().eq('id', id);
  return !error;
}

// -------------------------------------------------------------
// Spaced Repetition Reviews
// -------------------------------------------------------------

function calculateNextReview(fromTimestamp: number, box: number): string {
  const safeBox = Math.min(Math.max(box, 1), 5);
  const intervalDays = LEITNER_INTERVALS_DAYS[safeBox];
  const nextMs = fromTimestamp + intervalDays * 24 * 60 * 60 * 1000;
  return new Date(nextMs).toISOString();
}

export async function supabaseRecordTopicReview(
  topicId: string,
  confidence: number,
  outcome: ReviewOutcome,
  notes?: string
): Promise<{ topic: Topic; log: ReviewLog }> {
  const sb = getSupabase();
  const topic = await supabaseGetTopicById(topicId);
  if (!topic) throw new Error(`Topic with id ${topicId} not found`);

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  let nextBox = topic.box;
  if (outcome === 'remembered') {
    nextBox = Math.min(5, topic.box + 1);
  } else if (outcome === 'forgot') {
    nextBox = 1;
  } else if (outcome === 'struggled') {
    nextBox = Math.max(1, topic.box - 1);
  }

  const nextReviewAt = calculateNextReview(nowMs, nextBox);
  const logId = `rev-${topicId}-${nowMs}`;

  // 1. Insert review history
  await sb.from('reviews').insert({
    id: logId,
    topic_id: topicId,
    reviewed_at: nowIso,
    confidence_rating: confidence,
    outcome,
    box_before: topic.box,
    box_after: nextBox,
    notes: notes || null,
  });

  // 2. Update topic metadata
  let newStatus = topic.status;
  if (newStatus === 'pending') newStatus = 'in_progress';
  if (nextBox >= 4 && confidence >= 4) newStatus = 'mastered';
  else if (newStatus !== 'mastered') newStatus = 'completed';

  const { data: updatedTopic } = await sb
    .from('topics')
    .update({
      box: nextBox,
      confidence,
      last_reviewed_at: nowIso,
      next_review_at: nextReviewAt,
      times_reviewed: (topic.times_reviewed || 0) + 1,
      status: newStatus,
      completed_at: topic.completed_at || nowIso,
      updated_at: nowIso,
    })
    .eq('id', topicId)
    .select()
    .single();

  // 3. Record daily review count
  await supabaseRecordDailyReview();

  const log: ReviewLog = {
    id: logId,
    topic_id: topicId,
    topic_title: topic.title,
    pillar: topic.pillar,
    reviewed_at: nowIso,
    confidence_rating: confidence,
    outcome,
    box_before: topic.box,
    box_after: nextBox,
    notes,
  };

  return { topic: (updatedTopic as Topic) || topic, log };
}

export async function supabaseGetReviewHistory(limit = 20): Promise<ReviewLog[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('reviews')
    .select('*, topics(title, pillar)')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    topic_id: r.topic_id,
    topic_title: r.topics?.title || 'Unknown Topic',
    pillar: r.topics?.pillar || 'dsa',
    reviewed_at: r.reviewed_at,
    confidence_rating: r.confidence_rating,
    outcome: r.outcome,
    box_before: r.box_before,
    box_after: r.box_after,
    notes: r.notes,
  }));
}

// -------------------------------------------------------------
// Daily Activity Logs
// -------------------------------------------------------------

async function supabaseRecordDailyCompletion() {
  const sb = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await sb.from('daily_logs').select('*').eq('date', today).maybeSingle();

  if (existing) {
    await sb
      .from('daily_logs')
      .update({
        topics_completed_count: (existing.topics_completed_count || 0) + 1,
        study_time_minutes: (existing.study_time_minutes || 0) + 25,
      })
      .eq('date', today);
  } else {
    await sb.from('daily_logs').insert({
      id: `log-${today}`,
      date: today,
      topics_completed_count: 1,
      topics_reviewed_count: 0,
      study_time_minutes: 30,
      streak_count: 1,
      created_at: new Date().toISOString(),
    });
  }
}

async function supabaseRecordDailyReview() {
  const sb = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await sb.from('daily_logs').select('*').eq('date', today).maybeSingle();

  if (existing) {
    await sb
      .from('daily_logs')
      .update({
        topics_reviewed_count: (existing.topics_reviewed_count || 0) + 1,
        study_time_minutes: (existing.study_time_minutes || 0) + 15,
      })
      .eq('date', today);
  } else {
    await sb.from('daily_logs').insert({
      id: `log-${today}`,
      date: today,
      topics_completed_count: 0,
      topics_reviewed_count: 1,
      study_time_minutes: 15,
      streak_count: 1,
      created_at: new Date().toISOString(),
    });
  }
}

export async function supabaseLogStudyTime(minutes: number): Promise<void> {
  const sb = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await sb.from('daily_logs').select('*').eq('date', today).maybeSingle();

  if (existing) {
    await sb
      .from('daily_logs')
      .update({
        study_time_minutes: (existing.study_time_minutes || 0) + minutes,
      })
      .eq('date', today);
  } else {
    await sb.from('daily_logs').insert({
      id: `log-${today}`,
      date: today,
      topics_completed_count: 0,
      topics_reviewed_count: 0,
      study_time_minutes: minutes,
      streak_count: 1,
      created_at: new Date().toISOString(),
    });
  }
}

// -------------------------------------------------------------
// Dashboard Metrics Calculation
// -------------------------------------------------------------

export async function supabaseGetDashboardMetrics(): Promise<DashboardMetrics> {
  const sb = getSupabase();
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Settings
  const { data: settingsData } = await sb.from('app_settings').select('*');
  const settingsMap: Record<string, string> = {};
  if (settingsData) {
    for (const r of settingsData) settingsMap[r.key] = r.value;
  }

  const startDateStr = settingsMap.start_date || nowIso.split('T')[0];
  const targetDays = parseInt(settingsMap.target_days || '90', 10);

  const startMs = new Date(startDateStr).getTime();
  const diffDays = Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000));
  const elapsedDays = diffDays < 0 ? 0 : Math.min(targetDays, diffDays + 1);
  const daysRemaining = Math.max(0, targetDays - elapsedDays);

  // 2. All Topics
  const { data: topicsData } = await sb
    .from('topics')
    .select('*')
    .order('priority', { ascending: true })
    .order('day_target', { ascending: true });

  const allTopics = (topicsData || []) as Topic[];
  const totalTopics = allTopics.length;
  const completedTopicsList = allTopics.filter((t) => t.status === 'completed' || t.status === 'mastered');
  const completedCount = completedTopicsList.length;
  const masteredCount = allTopics.filter((t) => t.status === 'mastered').length;
  const remainingCount = totalTopics - completedCount;
  const overallPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const expectedCompletedByNow = elapsedDays > 0 ? Math.round((elapsedDays / targetDays) * totalTopics) : 0;
  let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (elapsedDays > 0) {
    if (completedCount >= expectedCompletedByNow + 2) paceStatus = 'ahead';
    else if (completedCount < expectedCompletedByNow - 2) paceStatus = 'behind';
  }

  const topicsNeededPerDay = daysRemaining > 0 ? Number((remainingCount / daysRemaining).toFixed(1)) : 0;

  // 3. Pillar Stats
  const buildPillarStats = (pillar: PillarType, title: string): PillarStats => {
    const pTopics = allTopics.filter((t) => t.pillar === pillar);
    const total = pTopics.length;
    const completed = pTopics.filter((t) => t.status === 'completed' || t.status === 'mastered').length;
    const inProgress = pTopics.filter((t) => t.status === 'in_progress').length;
    const mastered = pTopics.filter((t) => t.status === 'mastered').length;
    const pending = pTopics.filter((t) => t.status === 'pending').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dueForReview = pTopics.filter((t) => t.next_review_at && t.next_review_at <= nowIso).length;

    return {
      pillar,
      title,
      total,
      completed,
      inProgress,
      mastered,
      pending,
      percentage,
      dueForReview,
    };
  };

  const pillars = {
    dsa: buildPillarStats('dsa', 'DSA (LeetCode)'),
    system_design: buildPillarStats('system_design', 'System Design'),
    backend: buildPillarStats('backend', 'Backend (.NET SDE2)'),
  };

  // 4. Due For Review
  const dueForReview = allTopics
    .filter((t) => t.next_review_at && t.next_review_at <= nowIso)
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime()
    );

  // 5. Today's Focus
  const targetDayBenchmark = elapsedDays === 0 ? 1 : elapsedDays;
  const todaysFocusCandidates = allTopics
    .filter((t) => t.status === 'in_progress' || (t.status === 'pending' && t.day_target <= targetDayBenchmark + 3))
    .sort((a, b) => a.priority - b.priority || a.day_target - b.day_target);

  const todaysFocus = (
    todaysFocusCandidates.length > 0 ? todaysFocusCandidates : allTopics.filter((t) => t.status === 'pending')
  ).slice(0, 3);

  // 6. Daily Logs & Streaks
  const { data: logsData } = await sb
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(40);

  const recentLogs = (logsData || []) as DailyLog[];
  let currentStreak = 0;
  let checkDate = new Date();

  for (let i = 0; i < 40; i++) {
    const curDateStr = checkDate.toISOString().split('T')[0];
    const log = recentLogs.find((l) => l.date === curDateStr);
    if (log && (log.topics_completed_count > 0 || log.topics_reviewed_count > 0 || log.study_time_minutes > 0)) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      if (i === 0) {
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
        continue;
      }
      break;
    }
  }

  let longestStreak = currentStreak;
  let running = 0;
  for (const log of recentLogs.slice().reverse()) {
    if (log.topics_completed_count > 0 || log.topics_reviewed_count > 0) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  const todayStr = nowIso.split('T')[0];
  const todayLog = recentLogs.find((l) => l.date === todayStr);
  const todayCompletedCount = todayLog ? todayLog.topics_completed_count : 0;

  // 7. Weekly Completed
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyCompletedCount = allTopics.filter(
    (t) => t.completed_at && t.completed_at >= sevenDaysAgo
  ).length;

  // 8. Recently Completed Items
  const recentCompleted = allTopics
    .filter((t) => t.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  // 9. Upcoming Revisions (next 7 days)
  const upcomingRevisions: DashboardMetrics['upcomingRevisions'] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 1; i <= 7; i++) {
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayLabel =
      i === 1
        ? 'Tomorrow'
        : `${dayNames[targetDate.getDay()]} (${targetDate.getMonth() + 1}/${targetDate.getDate()})`;

    const matchingTopics = allTopics
      .filter((t) => {
        if (!t.next_review_at) return false;
        const reviewDateStr = t.next_review_at.split('T')[0];
        return reviewDateStr === dateStr;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        pillar: t.pillar,
        box: t.box,
      }));

    upcomingRevisions.push({
      date: dateStr,
      dayLabel,
      topics: matchingTopics,
    });
  }

  // 10. Heatmap Data (90 days)
  const logsMap = new Map(recentLogs.map((l) => [l.date, l]));
  const heatmapData: { date: string; count: number; minutes: number }[] = [];
  for (let d = 89; d >= 0; d--) {
    const dayObj = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const ds = dayObj.toISOString().split('T')[0];
    const log = logsMap.get(ds);
    const count = log ? log.topics_completed_count + log.topics_reviewed_count : 0;
    const minutes = log ? log.study_time_minutes : 0;
    heatmapData.push({ date: ds, count, minutes });
  }

  const sqlStats = await supabaseGetSqlStats();
  const applications = await supabaseGetApplications();
  const activeApps = applications.filter((a) => !['rejected', 'withdrawn', 'offer'].includes(a.status)).length;
  const upcomingInterviews = applications.filter(
    (a) => a.interview_date && new Date(a.interview_date).getTime() >= now.getTime() - 24 * 60 * 60 * 1000
  ).length;
  const offers = applications.filter((a) => a.status === 'offer').length;

  return {
    totalTopics,
    completedTopics: completedCount,
    remainingTopics: remainingCount,
    masteredTopics: masteredCount,
    overallPercentage,
    currentStreak,
    longestStreak,
    todayCompletedCount,
    weeklyCompletedCount,
    dueForReviewCount: dueForReview.length,
    currentDay: elapsedDays,
    daysRemaining,
    expectedCompletedByNow,
    paceStatus,
    topicsNeededPerDay,
    pillars,
    todaysFocus,
    dueForReview,
    upcomingRevisions,
    recentCompleted,
    heatmapData,
    sqlStats,
    applicationStats: {
      total: applications.length,
      active: activeApps,
      interviewsScheduled: upcomingInterviews,
      offers,
    },
  };
}

export async function supabaseResetDatabase(): Promise<void> {
  const sb = getSupabase();
  const now = Date.now();
  const tomorrowDate = new Date(now + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  await sb.from('reviews').delete().neq('id', '___');
  await sb.from('daily_logs').delete().neq('id', '___');

  await sb.from('app_settings').upsert([
    { key: 'start_date', value: tomorrowDate },
    { key: 'target_days', value: '90' },
    { key: 'daily_target_topics', value: '3' },
  ]);

  // Reset all topics to pending, level 1, box 1
  await sb.from('topics').update({
    status: 'pending',
    confidence: 1,
    box: 1,
    completed_at: null,
    last_reviewed_at: null,
    next_review_at: null,
    times_reviewed: 0,
  }).neq('id', '___');
}

// -------------------------------------------------------------
// SQL Practice Progress
// -------------------------------------------------------------

export async function supabaseGetCompletedSqlChallenges(): Promise<string[]> {
  const sb = getSupabase();
  try {
    const { data, error } = await sb.from('sql_progress').select('challenge_id');
    if (!error && data) {
      return data.map((r: { challenge_id: string }) => r.challenge_id);
    }
  } catch {
    // fallback to app_settings
  }

  try {
    const { data, error } = await sb.from('app_settings').select('value').eq('key', 'sql_completed_challenges').single();
    if (!error && data?.value) {
      return JSON.parse(data.value);
    }
  } catch {
    // ignore
  }
  return [];
}

export async function supabaseToggleSqlChallenge(
  challengeId: string,
  completed?: boolean
): Promise<{ completed: boolean; completedIds: string[] }> {
  const sb = getSupabase();
  const current = await supabaseGetCompletedSqlChallenges();
  const exists = current.includes(challengeId);
  const shouldBeCompleted = completed !== undefined ? completed : !exists;

  let nextIds: string[];
  if (shouldBeCompleted) {
    nextIds = Array.from(new Set([...current, challengeId]));
  } else {
    nextIds = current.filter((id) => id !== challengeId);
  }

  try {
    if (shouldBeCompleted) {
      await sb.from('sql_progress').upsert({ challenge_id: challengeId, completed_at: new Date().toISOString() });
    } else {
      await sb.from('sql_progress').delete().eq('challenge_id', challengeId);
    }
  } catch {
    // ignore
  }

  try {
    await sb.from('app_settings').upsert({
      key: 'sql_completed_challenges',
      value: JSON.stringify(nextIds),
    });
  } catch (err) {
    console.error('Failed to save sql_completed_challenges to app_settings:', err);
  }

  return { completed: shouldBeCompleted, completedIds: nextIds };
}

export async function supabaseGetSqlStats(): Promise<SqlStats> {
  const completedIds = await supabaseGetCompletedSqlChallenges();
  const completed = completedIds.length;
  const total = 8;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

// -------------------------------------------------------------
// Job Applications CRUD
// -------------------------------------------------------------

export async function supabaseGetApplications(filters?: {
  status?: ApplicationStatus;
  search?: string;
}): Promise<JobApplication[]> {
  const sb = getSupabase();
  let applications: JobApplication[] = [];

  try {
    let query = sb.from('job_applications').select('*').order('applied_date', { ascending: false });
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    const { data, error } = await query;
    if (!error && data) {
      applications = data as JobApplication[];
    } else {
      throw error;
    }
  } catch {
    try {
      const { data } = await sb.from('app_settings').select('value').eq('key', 'job_applications').single();
      if (data?.value) {
        applications = JSON.parse(data.value);
        if (filters?.status) {
          applications = applications.filter((a) => a.status === filters.status);
        }
      }
    } catch {
      applications = [];
    }
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.point_of_contact && a.point_of_contact.toLowerCase().includes(q)) ||
        (a.comment && a.comment.toLowerCase().includes(q))
    );
  }

  return applications;
}

export async function supabaseGetApplicationById(id: string): Promise<JobApplication | undefined> {
  const apps = await supabaseGetApplications();
  return apps.find((a) => a.id === id);
}

export async function supabaseCreateApplication(
  data: Partial<JobApplication> & { company: string }
): Promise<JobApplication> {
  const sb = getSupabase();
  const nowIso = new Date().toISOString();
  const today = nowIso.split('T')[0];
  const id = data.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newApp: JobApplication = {
    id,
    company: data.company.trim(),
    role: (data.role || 'Software Engineer').trim(),
    applied_date: data.applied_date || today,
    status: data.status || 'applied',
    point_of_contact: data.point_of_contact ? data.point_of_contact.trim() : null,
    interview_date: data.interview_date || null,
    comment: data.comment ? data.comment.trim() : null,
    location: data.location ? data.location.trim() : null,
    job_url: data.job_url ? data.job_url.trim() : null,
    salary_range: data.salary_range ? data.salary_range.trim() : null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  try {
    await sb.from('job_applications').insert(newApp);
  } catch {
    // ignore
  }

  try {
    const all = await supabaseGetApplications();
    const updated = [newApp, ...all.filter((a) => a.id !== id)];
    await sb.from('app_settings').upsert({
      key: 'job_applications',
      value: JSON.stringify(updated),
    });
  } catch (err) {
    console.error('Failed to sync job_applications in app_settings:', err);
  }

  return newApp;
}

export async function supabaseUpdateApplication(
  id: string,
  updates: Partial<JobApplication>
): Promise<JobApplication | undefined> {
  const sb = getSupabase();
  const current = await supabaseGetApplicationById(id);
  if (!current) return undefined;

  const nowIso = new Date().toISOString();
  const updatedApp: JobApplication = {
    ...current,
    ...updates,
    updated_at: nowIso,
  };

  try {
    await sb.from('job_applications').update({ ...updates, updated_at: nowIso }).eq('id', id);
  } catch {
    // ignore
  }

  try {
    const all = await supabaseGetApplications();
    const updatedList = all.map((a) => (a.id === id ? updatedApp : a));
    await sb.from('app_settings').upsert({
      key: 'job_applications',
      value: JSON.stringify(updatedList),
    });
  } catch (err) {
    console.error('Failed to sync update in app_settings:', err);
  }

  return updatedApp;
}

export async function supabaseDeleteApplication(id: string): Promise<boolean> {
  const sb = getSupabase();
  try {
    await sb.from('job_applications').delete().eq('id', id);
  } catch {
    // ignore
  }

  try {
    const all = await supabaseGetApplications();
    const updatedList = all.filter((a) => a.id !== id);
    await sb.from('app_settings').upsert({
      key: 'job_applications',
      value: JSON.stringify(updatedList),
    });
    return true;
  } catch {
    return false;
  }
}
