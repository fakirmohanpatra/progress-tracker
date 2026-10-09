import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SEED_TOPICS } from './seed-data';
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
import {
  isSupabaseConfigured,
  supabaseGetTopics,
  supabaseGetTopicById,
  supabaseCreateTopic,
  supabaseUpdateTopic,
  supabaseDeleteTopic,
  supabaseRecordTopicReview,
  supabaseGetReviewHistory,
  supabaseLogStudyTime,
  supabaseGetDashboardMetrics,
  supabaseResetDatabase,
  supabaseGetCompletedSqlChallenges,
  supabaseToggleSqlChallenge,
  supabaseGetSqlStats,
  supabaseGetApplications,
  supabaseGetApplicationById,
  supabaseCreateApplication,
  supabaseUpdateApplication,
  supabaseDeleteApplication,
} from './supabase';

// Singleton database instance across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __db_instance: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (global.__db_instance) {
    return global.__db_instance;
  }

  if (process.env.VERCEL && !isSupabaseConfigured()) {
    throw new Error(
      'Supabase environment variables (SUPABASE_URL and SUPABASE_SECRET_KEY) are missing in Vercel. Please add them in Vercel Project Settings > Environment Variables, then Redeploy.'
    );
  }

  const DATA_DIR = path.join(process.cwd(), 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DB_PATH = path.join(DATA_DIR, 'interview_command_center.db');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  seedIfEmpty(db);

  global.__db_instance = db;
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      pillar TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      confidence INTEGER DEFAULT 1,
      day_target INTEGER DEFAULT 1,
      external_url TEXT,
      summary TEXT,
      key_intuition TEXT,
      pitfalls TEXT,
      notes TEXT,
      code_snippet TEXT,
      time_complexity TEXT,
      space_complexity TEXT,
      box INTEGER DEFAULT 1,
      last_reviewed_at TEXT,
      next_review_at TEXT,
      times_reviewed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_topics_pillar ON topics(pillar);
    CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
    CREATE INDEX IF NOT EXISTS idx_topics_next_review ON topics(next_review_at);

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      confidence_rating INTEGER NOT NULL,
      outcome TEXT NOT NULL,
      box_before INTEGER NOT NULL,
      box_after INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_topic ON reviews(topic_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(reviewed_at);

    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      topics_completed_count INTEGER DEFAULT 0,
      topics_reviewed_count INTEGER DEFAULT 0,
      study_time_minutes INTEGER DEFAULT 0,
      streak_count INTEGER DEFAULT 0,
      focus_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sql_progress (
      challenge_id TEXT PRIMARY KEY,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      applied_date TEXT NOT NULL,
      status TEXT NOT NULL,
      point_of_contact TEXT,
      interview_date TEXT,
      comment TEXT,
      location TEXT,
      job_url TEXT,
      salary_range TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_job_applications_date ON job_applications(applied_date);
  `);
}

// Leitner intervals in days: Box 1: 1d, Box 2: 3d, Box 3: 7d, Box 4: 14d, Box 5: 30d
export const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

function calculateNextReview(fromTimestamp: number, box: number): string {
  const safeBox = Math.min(Math.max(box, 1), 5);
  const intervalDays = LEITNER_INTERVALS_DAYS[safeBox];
  const nextMs = fromTimestamp + intervalDays * 24 * 60 * 60 * 1000;
  return new Date(nextMs).toISOString();
}

function seedIfEmpty(db: Database.Database) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM topics').get() as { count: number };
  if (countRow.count > 0) return;

  const now = Date.now();
  // Set start_date to TOMORROW so today is Day 0 (Kickoff), and Day 1 starts tomorrow!
  const tomorrowDate = new Date(now + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const insertTopic = db.prepare(`
    INSERT INTO topics (
      id, pillar, category, title, slug, difficulty, priority, status, confidence,
      day_target, external_url, summary, key_intuition, pitfalls, notes, code_snippet,
      time_complexity, space_complexity, box, last_reviewed_at, next_review_at,
      times_reviewed, completed_at, created_at, updated_at
    ) VALUES (
      @id, @pillar, @category, @title, @slug, @difficulty, @priority, @status, @confidence,
      @day_target, @external_url, @summary, @key_intuition, @pitfalls, @notes, @code_snippet,
      @time_complexity, @space_complexity, @box, @last_reviewed_at, @next_review_at,
      @times_reviewed, @completed_at, @created_at, @updated_at
    )
  `);

  const seedTransaction = db.transaction(() => {
    // Start date is tomorrow (Day 0 today, Day 1 tomorrow)
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('start_date', tomorrowDate);
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('target_days', '90');
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('daily_target_topics', '3');

    // Pre-seed all topics cleanly: pending status, confidence Level 1 (Need Practice), box 1
    const createdIso = new Date().toISOString();
    for (const t of SEED_TOPICS) {
      insertTopic.run({
        id: t.id,
        pillar: t.pillar,
        category: t.category,
        title: t.title,
        slug: t.slug,
        difficulty: t.difficulty,
        priority: t.priority,
        status: 'pending',
        confidence: 1, // 🌱 Level 1: Need Practice
        day_target: t.day_target,
        external_url: t.external_url || null,
        summary: t.summary,
        key_intuition: t.key_intuition,
        pitfalls: t.pitfalls,
        notes: t.notes,
        code_snippet: t.code_snippet || null,
        time_complexity: t.time_complexity || null,
        space_complexity: t.space_complexity || null,
        box: 1,
        last_reviewed_at: null,
        next_review_at: null,
        times_reviewed: 0,
        completed_at: null,
        created_at: createdIso,
        updated_at: createdIso,
      });
    }
  });

  seedTransaction();
}

// ==========================================
// EXPORTED REPOSITORY API METHODS
// ==========================================

export async function getTopics(filters?: {
  pillar?: PillarType;
  category?: string;
  status?: TopicStatus;
  difficulty?: Difficulty;
  search?: string;
  dueOnly?: boolean;
}): Promise<Topic[]> {
  if (isSupabaseConfigured()) {
    return await supabaseGetTopics(filters);
  }

  const db = getDatabase();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters?.pillar) {
    conditions.push('pillar = @pillar');
    params.pillar = filters.pillar;
  }
  if (filters?.category) {
    conditions.push('category = @category');
    params.category = filters.category;
  }
  if (filters?.status) {
    conditions.push('status = @status');
    params.status = filters.status;
  }
  if (filters?.difficulty) {
    conditions.push('difficulty = @difficulty');
    params.difficulty = filters.difficulty;
  }
  if (filters?.dueOnly) {
    conditions.push('next_review_at IS NOT NULL AND next_review_at <= @now');
    params.now = new Date().toISOString();
  }
  if (filters?.search) {
    conditions.push('(title LIKE @search OR summary LIKE @search OR category LIKE @search OR key_intuition LIKE @search OR notes LIKE @search)');
    params.search = `%${filters.search}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM topics ${whereClause} ORDER BY priority ASC, day_target ASC`;
  return db.prepare(query).all(params) as Topic[];
}

export async function getTopicById(id: string): Promise<Topic | undefined> {
  if (isSupabaseConfigured()) {
    return await supabaseGetTopicById(id);
  }

  const db = getDatabase();
  return db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic | undefined;
}

export async function createTopic(topic: Partial<Topic> & { title: string; pillar: PillarType; category: string }): Promise<Topic> {
  if (isSupabaseConfigured()) {
    return await supabaseCreateTopic(topic);
  }

  const db = getDatabase();
  const now = new Date().toISOString();
  const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = topic.id || `${topic.pillar}-${slug}-${Date.now().toString().slice(-4)}`;

  const stmt = db.prepare(`
    INSERT INTO topics (
      id, pillar, category, title, slug, difficulty, priority, status, confidence,
      day_target, external_url, summary, key_intuition, pitfalls, notes, code_snippet,
      time_complexity, space_complexity, box, last_reviewed_at, next_review_at,
      times_reviewed, completed_at, created_at, updated_at
    ) VALUES (
      @id, @pillar, @category, @title, @slug, @difficulty, @priority, @status, @confidence,
      @day_target, @external_url, @summary, @key_intuition, @pitfalls, @notes, @code_snippet,
      @time_complexity, @space_complexity, @box, @last_reviewed_at, @next_review_at,
      @times_reviewed, @completed_at, @created_at, @updated_at
    )
  `);

  stmt.run({
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
  });

  return (await getTopicById(id))!;
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
  if (isSupabaseConfigured()) {
    return await supabaseUpdateTopic(id, updates);
  }

  const db = getDatabase();
  const current = await getTopicById(id);
  if (!current) return undefined;

  const now = new Date().toISOString();
  let completedAt = current.completed_at;

  // If status is transitioning to completed/mastered and wasn't completed before
  if (
    (updates.status === 'completed' || updates.status === 'mastered') &&
    current.status !== 'completed' &&
    current.status !== 'mastered'
  ) {
    completedAt = now;
  } else if (updates.status === 'pending' || updates.status === 'in_progress') {
    if (updates.status === 'pending') completedAt = null;
  }

  const fields: string[] = ['updated_at = @updated_at'];
  const params: Record<string, unknown> = { id, updated_at: now };

  const updateableKeys: (keyof Topic)[] = [
    'pillar',
    'category',
    'title',
    'difficulty',
    'priority',
    'status',
    'confidence',
    'day_target',
    'external_url',
    'summary',
    'key_intuition',
    'pitfalls',
    'notes',
    'code_snippet',
    'time_complexity',
    'space_complexity',
    'box',
    'next_review_at',
    'last_reviewed_at',
  ];

  for (const key of updateableKeys) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = updates[key];
    }
  }

  if (completedAt !== current.completed_at) {
    fields.push('completed_at = @completed_at');
    params.completed_at = completedAt;
  }

  const sql = `UPDATE topics SET ${fields.join(', ')} WHERE id = @id`;
  db.prepare(sql).run(params);

  // If newly completed, record in daily logs
  if (completedAt && !current.completed_at) {
    recordDailyCompletion();
  }

  return await getTopicById(id);
}

export async function deleteTopic(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await supabaseDeleteTopic(id);
  }

  const db = getDatabase();
  const res = db.prepare('DELETE FROM topics WHERE id = ?').run(id);
  return res.changes > 0;
}

// Spaced Repetition Leitner Box execution
export async function recordTopicReview(
  topicId: string,
  confidence: number,
  outcome: ReviewOutcome,
  notes?: string
): Promise<{ topic: Topic; log: ReviewLog }> {
  if (isSupabaseConfigured()) {
    return await supabaseRecordTopicReview(topicId, confidence, outcome, notes);
  }

  const db = getDatabase();
  const topic = await getTopicById(topicId);
  if (!topic) throw new Error(`Topic with id ${topicId} not found`);

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  let nextBox = topic.box;
  if (outcome === 'remembered') {
    nextBox = Math.min(5, topic.box + 1);
  } else if (outcome === 'forgot') {
    nextBox = 1; // Reset back to daily review
  } else if (outcome === 'struggled') {
    nextBox = Math.max(1, topic.box - 1);
  }

  const nextReviewAt = calculateNextReview(nowMs, nextBox);
  const logId = `rev-${topicId}-${nowMs}`;

  const reviewTx = db.transaction(() => {
    // 1. Insert review history
    db.prepare(`
      INSERT INTO reviews (id, topic_id, reviewed_at, confidence_rating, outcome, box_before, box_after, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, topicId, nowIso, confidence, outcome, topic.box, nextBox, notes || null);

    // 2. Update topic status and review metadata
    let newStatus = topic.status;
    if (newStatus === 'pending') newStatus = 'in_progress';
    if (nextBox >= 4 && confidence >= 4) newStatus = 'mastered';
    else if (newStatus !== 'mastered') newStatus = 'completed';

    db.prepare(`
      UPDATE topics
      SET box = ?,
          confidence = ?,
          last_reviewed_at = ?,
          next_review_at = ?,
          times_reviewed = times_reviewed + 1,
          status = ?,
          completed_at = COALESCE(completed_at, ?),
          updated_at = ?
      WHERE id = ?
    `).run(nextBox, confidence, nowIso, nextReviewAt, newStatus, nowIso, nowIso, topicId);

    // 3. Update daily log reviewed count
    recordDailyReview();
  });

  reviewTx();

  const updated = (await getTopicById(topicId))!;
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

  return { topic: updated, log };
}

export async function getReviewHistory(limit = 20): Promise<ReviewLog[]> {
  if (isSupabaseConfigured()) {
    return await supabaseGetReviewHistory(limit);
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT r.*, t.title as topic_title, t.pillar
    FROM reviews r
    JOIN topics t ON r.topic_id = t.id
    ORDER BY r.reviewed_at DESC
    LIMIT ?
  `).all(limit) as ReviewLog[];
  return rows;
}

// Update daily activity counts
function recordDailyCompletion() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO daily_logs (id, date, topics_completed_count, topics_reviewed_count, study_time_minutes, streak_count, created_at)
    VALUES (?, ?, 1, 0, 30, 1, ?)
    ON CONFLICT(date) DO UPDATE SET
      topics_completed_count = topics_completed_count + 1,
      study_time_minutes = study_time_minutes + 25
  `).run(`log-${today}`, today, nowIso);
}

function recordDailyReview() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO daily_logs (id, date, topics_completed_count, topics_reviewed_count, study_time_minutes, streak_count, created_at)
    VALUES (?, ?, 0, 1, 15, 1, ?)
    ON CONFLICT(date) DO UPDATE SET
      topics_reviewed_count = topics_reviewed_count + 1,
      study_time_minutes = study_time_minutes + 15
  `).run(`log-${today}`, today, nowIso);
}

export async function logStudyTime(minutes: number): Promise<void> {
  if (isSupabaseConfigured()) {
    return await supabaseLogStudyTime(minutes);
  }

  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO daily_logs (id, date, topics_completed_count, topics_reviewed_count, study_time_minutes, streak_count, created_at)
    VALUES (?, ?, 0, 0, ?, 1, ?)
    ON CONFLICT(date) DO UPDATE SET
      study_time_minutes = study_time_minutes + ?
  `).run(`log-${today}`, today, minutes, nowIso, minutes);
}

// ==========================================
// DASHBOARD & ANALYTICS COMPUTATION
// ==========================================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (isSupabaseConfigured()) {
    return await supabaseGetDashboardMetrics();
  }
  const db = getDatabase();
  const now = new Date();
  const nowIso = now.toISOString();

  // Settings
  const settingsRows = db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
  const settingsMap = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));
  const startDateStr = settingsMap.start_date || nowIso.split('T')[0];
  const targetDays = parseInt(settingsMap.target_days || '90', 10);

  const startMs = new Date(startDateStr).getTime();
  const diffDays = Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000));
  // If start_date is tomorrow, elapsedDays is 0 (Day 0: Kickoff)
  const elapsedDays = diffDays < 0 ? 0 : Math.min(targetDays, diffDays + 1);
  const daysRemaining = Math.max(0, targetDays - elapsedDays);

  // All topics
  const allTopics = db.prepare('SELECT * FROM topics ORDER BY priority ASC, day_target ASC').all() as Topic[];
  const totalTopics = allTopics.length;
  const completedTopicsList = allTopics.filter(t => t.status === 'completed' || t.status === 'mastered');
  const completedCount = completedTopicsList.length;
  const masteredCount = allTopics.filter(t => t.status === 'mastered').length;
  const remainingCount = totalTopics - completedCount;
  const overallPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Expected topics completed by elapsed day
  const expectedCompletedByNow = elapsedDays > 0 ? Math.round((elapsedDays / targetDays) * totalTopics) : 0;
  let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (elapsedDays > 0) {
    if (completedCount >= expectedCompletedByNow + 2) paceStatus = 'ahead';
    else if (completedCount < expectedCompletedByNow - 2) paceStatus = 'behind';
  }

  const topicsNeededPerDay = daysRemaining > 0 ? Number((remainingCount / daysRemaining).toFixed(1)) : 0;

  // Pillars breakdown
  const buildPillarStats = (pillar: PillarType, title: string): PillarStats => {
    const pTopics = allTopics.filter(t => t.pillar === pillar);
    const total = pTopics.length;
    const completed = pTopics.filter(t => t.status === 'completed' || t.status === 'mastered').length;
    const inProgress = pTopics.filter(t => t.status === 'in_progress').length;
    const mastered = pTopics.filter(t => t.status === 'mastered').length;
    const pending = pTopics.filter(t => t.status === 'pending').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dueForReview = pTopics.filter(t => t.next_review_at && t.next_review_at <= nowIso).length;

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

  // Due for Review topics
  const dueForReview = allTopics
    .filter(t => t.next_review_at && t.next_review_at <= nowIso)
    .sort((a, b) => (a.priority - b.priority) || (new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime()));

  // Today's Focus: Mix of high-priority pending topics targeting current curriculum day + in-progress topics
  const targetDayBenchmark = elapsedDays === 0 ? 1 : elapsedDays;
  const todaysFocusCandidates = allTopics
    .filter(t => t.status === 'in_progress' || (t.status === 'pending' && t.day_target <= targetDayBenchmark + 3))
    .sort((a, b) => (a.priority - b.priority) || (a.day_target - b.day_target));

  const todaysFocus = (todaysFocusCandidates.length > 0 ? todaysFocusCandidates : allTopics.filter(t => t.status === 'pending')).slice(0, 3);

  // Weekly completed (past 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyCompletedCount = db.prepare(`
    SELECT COUNT(*) as count FROM topics 
    WHERE completed_at IS NOT NULL AND completed_at >= ?
  `).get(sevenDaysAgo) as { count: number };

  const todayStr = nowIso.split('T')[0];
  const todayLog = db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(todayStr) as DailyLog | undefined;
  const todayCompletedCount = todayLog ? todayLog.topics_completed_count : 0;

  // Streak calculation from daily_logs
  const recentLogs = db.prepare('SELECT * FROM daily_logs ORDER BY date DESC LIMIT 40').all() as DailyLog[];
  let currentStreak = 0;
  let checkDate = new Date();
  
  for (let i = 0; i < 40; i++) {
    const curDateStr = checkDate.toISOString().split('T')[0];
    const log = recentLogs.find(l => l.date === curDateStr);
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

  // Longest streak
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

  // Recently Completed Items
  const recentCompleted = allTopics
    .filter(t => t.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  // Upcoming revisions (grouped by date over the next 7 days)
  const upcomingRevisions: DashboardMetrics['upcomingRevisions'] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 1; i <= 7; i++) {
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayLabel = i === 1 ? 'Tomorrow' : `${dayNames[targetDate.getDay()]} (${targetDate.getMonth() + 1}/${targetDate.getDate()})`;

    const matchingTopics = allTopics.filter(t => {
      if (!t.next_review_at) return false;
      const reviewDateStr = t.next_review_at.split('T')[0];
      return reviewDateStr === dateStr;
    }).map(t => ({
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

  // Heatmap data (last 90 days)
  const logsMap = new Map(recentLogs.map(l => [l.date, l]));
  const heatmapData: { date: string; count: number; minutes: number }[] = [];
  for (let d = 89; d >= 0; d--) {
    const dayObj = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const ds = dayObj.toISOString().split('T')[0];
    const log = logsMap.get(ds);
    const count = log ? (log.topics_completed_count + log.topics_reviewed_count) : 0;
    const minutes = log ? log.study_time_minutes : 0;
    heatmapData.push({ date: ds, count, minutes });
  }

  const sqlStats = await getSqlStats();
  const applications = await getApplications();
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
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    todayCompletedCount,
    weeklyCompletedCount: weeklyCompletedCount.count,
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

export async function resetDatabase(): Promise<void> {
  if (isSupabaseConfigured()) {
    return await supabaseResetDatabase();
  }

  const db = getDatabase();
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM daily_logs;
    DELETE FROM app_settings;
    DELETE FROM topics;
    DELETE FROM sql_progress;
    DELETE FROM job_applications;
  `);
  seedIfEmpty(db);
}

// ==========================================
// SQL CHALLENGE PROGRESS API
// ==========================================

export const TOTAL_SQL_CHALLENGES = 8;

export async function getCompletedSqlChallenges(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    return await supabaseGetCompletedSqlChallenges();
  }
  const db = getDatabase();
  const rows = db.prepare('SELECT challenge_id FROM sql_progress').all() as { challenge_id: string }[];
  return rows.map((r) => r.challenge_id);
}

export async function toggleSqlChallenge(
  challengeId: string,
  completed?: boolean
): Promise<{ completed: boolean; completedIds: string[] }> {
  if (isSupabaseConfigured()) {
    return await supabaseToggleSqlChallenge(challengeId, completed);
  }
  const db = getDatabase();
  const existing = db.prepare('SELECT challenge_id FROM sql_progress WHERE challenge_id = ?').get(challengeId);
  const shouldBeCompleted = completed !== undefined ? completed : !existing;
  const nowIso = new Date().toISOString();

  if (shouldBeCompleted) {
    db.prepare('INSERT OR REPLACE INTO sql_progress (challenge_id, completed_at) VALUES (?, ?)').run(
      challengeId,
      nowIso
    );
  } else {
    db.prepare('DELETE FROM sql_progress WHERE challenge_id = ?').run(challengeId);
  }

  const completedIds = await getCompletedSqlChallenges();
  return { completed: shouldBeCompleted, completedIds };
}

export async function getSqlStats(): Promise<SqlStats> {
  if (isSupabaseConfigured()) {
    return await supabaseGetSqlStats();
  }
  const completedIds = await getCompletedSqlChallenges();
  const completed = completedIds.length;
  const total = TOTAL_SQL_CHALLENGES;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

// ==========================================
// JOB APPLICATIONS API
// ==========================================

export async function getApplications(filters?: {
  status?: ApplicationStatus;
  search?: string;
}): Promise<JobApplication[]> {
  if (isSupabaseConfigured()) {
    return await supabaseGetApplications(filters);
  }
  const db = getDatabase();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters?.status) {
    conditions.push('status = @status');
    params.status = filters.status;
  }
  if (filters?.search) {
    conditions.push(
      '(company LIKE @search OR role LIKE @search OR point_of_contact LIKE @search OR comment LIKE @search)'
    );
    params.search = `%${filters.search}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM job_applications ${whereClause} ORDER BY applied_date DESC, created_at DESC`;
  return db.prepare(query).all(params) as JobApplication[];
}

export async function getApplicationById(id: string): Promise<JobApplication | undefined> {
  if (isSupabaseConfigured()) {
    return await supabaseGetApplicationById(id);
  }
  const db = getDatabase();
  return db.prepare('SELECT * FROM job_applications WHERE id = ?').get(id) as JobApplication | undefined;
}

export async function createApplication(
  data: Partial<JobApplication> & { company: string }
): Promise<JobApplication> {
  if (isSupabaseConfigured()) {
    return await supabaseCreateApplication(data);
  }
  const db = getDatabase();
  const nowIso = new Date().toISOString();
  const today = nowIso.split('T')[0];
  const id = data.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const app: JobApplication = {
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

  db.prepare(`
    INSERT INTO job_applications (
      id, company, role, applied_date, status, point_of_contact,
      interview_date, comment, location, job_url, salary_range, created_at, updated_at
    ) VALUES (
      @id, @company, @role, @applied_date, @status, @point_of_contact,
      @interview_date, @comment, @location, @job_url, @salary_range, @created_at, @updated_at
    )
  `).run(app);

  return app;
}

export async function updateApplication(
  id: string,
  updates: Partial<JobApplication>
): Promise<JobApplication | undefined> {
  if (isSupabaseConfigured()) {
    return await supabaseUpdateApplication(id, updates);
  }
  const db = getDatabase();
  const current = await getApplicationById(id);
  if (!current) return undefined;

  const nowIso = new Date().toISOString();
  const updateableKeys: (keyof JobApplication)[] = [
    'company',
    'role',
    'applied_date',
    'status',
    'point_of_contact',
    'interview_date',
    'comment',
    'location',
    'job_url',
    'salary_range',
  ];

  const fields: string[] = ['updated_at = @updated_at'];
  const params: Record<string, unknown> = { id, updated_at: nowIso };

  for (const key of updateableKeys) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = updates[key];
    }
  }

  const sql = `UPDATE job_applications SET ${fields.join(', ')} WHERE id = @id`;
  db.prepare(sql).run(params);

  return await getApplicationById(id);
}

export async function deleteApplication(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return await supabaseDeleteApplication(id);
  }
  const db = getDatabase();
  const res = db.prepare('DELETE FROM job_applications WHERE id = ?').run(id);
  return res.changes > 0;
}
