'use client';

import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  RotateCw,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  Code2,
  Network,
  Server,
  Target,
  ExternalLink,
  Award,
  Terminal,
  Briefcase,
} from 'lucide-react';
import { DashboardMetrics, Topic, ViewTab, ReviewOutcome } from '@/types';
import { ProgressRing } from './ProgressRing';
import { formatTimeAgo, triggerConfetti } from '@/lib/utils';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  onSelectTab: (tab: ViewTab) => void;
  onOpenTopic: (topic: Topic) => void;
  onQuickReview: (topicId: string, outcome: ReviewOutcome, confidence: number) => Promise<void>;
}

export function DashboardView({
  metrics,
  onSelectTab,
  onOpenTopic,
  onQuickReview,
}: DashboardViewProps) {
  const {
    overallPercentage,
    completedTopics,
    totalTopics,
    remainingTopics,
    currentStreak,
    longestStreak,
    weeklyCompletedCount,
    dueForReviewCount,
    currentDay,
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
    applicationStats,
  } = metrics;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Core Philosophy & "Am I on Track?" Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0d111d] via-[#111625] to-[#0d111d] p-5 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 font-mono">
                Learning Operating System
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                Day {currentDay} of 90
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Am I on track for the 90-day goal?</span>
              {paceStatus === 'ahead' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Ahead of Schedule
                </span>
              )}
              {paceStatus === 'on_track' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> On Track
                </span>
              )}
              {paceStatus === 'behind' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Velocity Needed
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Target pace expects <strong className="text-white font-mono">{expectedCompletedByNow} topics</strong> completed by Day {currentDay}. You have conquered <strong className="text-emerald-400 font-mono">{completedTopics} topics</strong>. Maintaining <strong className="text-indigo-300 font-mono">{topicsNeededPerDay} topics/day</strong> guarantees 100% interview readiness in {daysRemaining} days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('review_queue')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Review Queue ({dueForReviewCount})</span>
            </button>
            <button
              onClick={() => onSelectTab('dsa')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 transition-all flex items-center gap-2 active:scale-95"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>LeetCode Practice</span>
            </button>
            {applicationStats && applicationStats.interviewsScheduled > 0 && (
              <button
                onClick={() => onSelectTab('applications')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 transition-all flex items-center gap-2 active:scale-95"
              >
                <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                <span>Interviews ({applicationStats.interviewsScheduled})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Overall Progress */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Overall 90-Day Progress
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {overallPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">
              <span className="text-emerald-400 font-semibold">{completedTopics}</span> / {totalTopics} completed
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {remainingTopics} remaining • {daysRemaining} days left
            </div>
          </div>
          <ProgressRing
            percentage={overallPercentage}
            size={76}
            strokeWidth={7}
            color="#10b981"
            glowColor="rgba(16, 185, 129, 0.3)"
          />
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-amber-400 animate-flame" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-amber-300">
              {currentStreak} <span className="text-xs font-normal text-amber-400/80">days</span>
            </div>
            <div className="text-[11px] text-slate-400">
              All-time best: {longestStreak} days
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Today
          </div>
        </div>

        {/* Topics Due for Revision */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Due For Revision
            </span>
            <RotateCw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-300">
              {dueForReviewCount} <span className="text-xs font-normal text-rose-400/80">topics</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Spaced repetition active
            </div>
          </div>
          <button
            onClick={() => onSelectTab('review_queue')}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
          >
            Review deck <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Weekly Completion */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Weekly Done
            </span>
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-indigo-300">
              +{weeklyCompletedCount}
            </div>
            <div className="text-[11px] text-slate-400">
              Past 7 days velocity
            </div>
          </div>
          <div className="text-[10px] font-mono text-indigo-400">
            ~{(weeklyCompletedCount / 7).toFixed(1)} topics/day
          </div>
        </div>

        {/* Remaining Topics */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Remaining
            </span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {remainingTopics}
            </div>
            <div className="text-[11px] text-slate-400">
              Unfinished syllabus
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {pillars.dsa.pending} DSA • {pillars.system_design.pending} Sys • {pillars.backend.pending} BE
          </div>
        </div>
      </div>

      {/* 3. Core Technical Pillars & Sandboxes Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: DSA */}
        <div
          onClick={() => onSelectTab('dsa')}
          className="group relative p-5 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 bg-gradient-to-b from-[#0c1214] to-[#080c0d] transition-all cursor-pointer shadow-lg hover:shadow-emerald-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  DSA (LeetCode)
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Highest Priority
                </span>
              </div>
            </div>
            <ProgressRing
              percentage={pillars.dsa.percentage}
              size={56}
              strokeWidth={5}
              color="#10b981"
              glowColor="rgba(16, 185, 129, 0.4)"
            />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            Blind 75 & NeetCode 150 patterns: Two Pointers, Sliding Window, Monotonic Stack, Trees, DP & Graphs.
          </p>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-mono">
            <span className="text-slate-400">
              <strong className="text-emerald-400 font-semibold">{pillars.dsa.completed}</strong> / {pillars.dsa.total} mastered
            </span>
            <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open pillar <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pillar 2: System Design */}
        <div
          onClick={() => onSelectTab('system_design')}
          className="group relative p-5 rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 bg-gradient-to-b from-[#0e111f] to-[#090b14] transition-all cursor-pointer shadow-lg hover:shadow-indigo-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  System Design
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Architecture & Scale
                </span>
              </div>
            </div>
            <ProgressRing
              percentage={pillars.system_design.percentage}
              size={56}
              strokeWidth={5}
              color="#6366f1"
              glowColor="rgba(99, 102, 241, 0.4)"
            />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            Consistent Hashing, Caching Strategies, CAP Theorem, Rate Limiters, TinyURL & Real-time Chat systems.
          </p>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-mono">
            <span className="text-slate-400">
              <strong className="text-indigo-400 font-semibold">{pillars.system_design.completed}</strong> / {pillars.system_design.total} mastered
            </span>
            <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open pillar <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pillar 3: Backend Engineering */}
        <div
          onClick={() => onSelectTab('backend')}
          className="group relative p-5 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 bg-gradient-to-b from-[#16120b] to-[#0c0a06] transition-all cursor-pointer shadow-lg hover:shadow-amber-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Backend Engineering
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Core Concepts
                </span>
              </div>
            </div>
            <ProgressRing
              percentage={pillars.backend.percentage}
              size={56}
              strokeWidth={5}
              color="#f59e0b"
              glowColor="rgba(245, 158, 11, 0.4)"
            />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            TCP/UDP internals, epoll/event loops, B+ Trees vs LSM, ACID & MVCC, Idempotency, and Transactional Outbox.
          </p>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-mono">
            <span className="text-slate-400">
              <strong className="text-amber-400 font-semibold">{pillars.backend.completed}</strong> / {pillars.backend.total} mastered
            </span>
            <span className="text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open pillar <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pillar 4: SQL Sandbox */}
        <div
          onClick={() => onSelectTab('sql_practice')}
          className="group relative p-5 rounded-2xl border border-slate-800/90 hover:border-cyan-500/40 bg-gradient-to-b from-[#081318] to-[#050b0e] transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  SQL Sandbox
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Interactive Drills
                </span>
              </div>
            </div>
            <ProgressRing
              percentage={sqlStats?.percentage ?? 0}
              size={56}
              strokeWidth={5}
              color="#06b6d4"
              glowColor="rgba(6, 182, 212, 0.4)"
            />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            Joins, Window functions, DENSE_RANK, Aggregations & Subqueries with real-time SQLite execution.
          </p>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-mono">
            <span className="text-slate-400">
              <strong className="text-cyan-400 font-semibold">{sqlStats?.completed ?? 0}</strong> / {sqlStats?.total ?? 8} solved
            </span>
            <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open sandbox <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 4. Two Column Layout: Today's Focus + Today's Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Focus Deck */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Today&apos;s Focus
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Day {currentDay} Target
              </span>
            </div>
            <span className="text-xs text-slate-400">What should I complete today?</span>
          </div>

          <div className="space-y-3">
            {todaysFocus.map((topic) => {
              const pillarColor =
                topic.pillar === 'dsa'
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : topic.pillar === 'system_design'
                  ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                  : 'border-amber-500/30 text-amber-400 bg-amber-500/10';

              const diffColor =
                topic.difficulty === 'Easy'
                  ? 'text-emerald-400'
                  : topic.difficulty === 'Medium'
                  ? 'text-amber-400'
                  : 'text-rose-400';

              return (
                <div
                  key={topic.id}
                  onClick={() => onOpenTopic(topic)}
                  className="p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${pillarColor}`}>
                        {topic.pillar === 'dsa' ? 'DSA' : topic.pillar === 'system_design' ? 'Sys Design' : 'Backend'}
                      </span>
                      <span className="text-xs text-slate-400">{topic.category}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-medium ${diffColor}`}>
                      {topic.difficulty}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    {topic.title}
                    {topic.external_url && (
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {topic.key_intuition || topic.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Review Queue */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">
                Topics Due for Revision
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {dueForReviewCount} Due Now
              </span>
            </div>
            <span className="text-xs text-slate-400">What should I revise today?</span>
          </div>

          {dueForReview.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">All Revisions Cleared!</div>
              <div className="text-xs text-slate-400 mt-1">
                Your spaced repetition queue is clean for today. Great retention!
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dueForReview.slice(0, 3).map((topic) => (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Box {topic.box} ({topic.box === 1 ? '1-Day' : topic.box === 2 ? '3-Day' : topic.box === 3 ? '7-Day' : topic.box === 4 ? '14-Day' : '30-Day'})
                    </span>
                    <button
                      onClick={() => onOpenTopic(topic)}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      View notes →
                    </button>
                  </div>

                  <div className="font-semibold text-sm text-white">
                    {topic.title}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    {topic.key_intuition}
                  </p>

                  {/* Immediate Spaced Repetition Recall Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={async () => {
                        await onQuickReview(topic.id, 'forgot', 1);
                      }}
                      className="flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all active:scale-95"
                    >
                      Forgot (Box 1)
                    </button>
                    <button
                      onClick={async () => {
                        await onQuickReview(topic.id, 'struggled', 3);
                      }}
                      className="flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                    >
                      Struggled
                    </button>
                    <button
                      onClick={async () => {
                        await onQuickReview(topic.id, 'remembered', 5);
                        triggerConfetti();
                      }}
                      className="flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all active:scale-95"
                    >
                      Remembered ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Upcoming Revisions Schedule */}
      <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Upcoming Revisions Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400">What should I revisit next week?</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
          {upcomingRevisions.map((rev) => (
            <div
              key={rev.date}
              className={`p-3 rounded-xl border text-center transition-all ${
                rev.topics.length > 0
                  ? 'border-indigo-500/30 bg-indigo-950/10 hover:bg-indigo-950/20'
                  : 'border-slate-800/80 bg-slate-900/40'
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-400 truncate">
                {rev.dayLabel}
              </div>
              <div className="text-lg font-bold font-mono text-white my-1">
                {rev.topics.length}
              </div>
              <div className="text-[10px] text-slate-400">
                {rev.topics.length === 1 ? '1 topic' : `${rev.topics.length} topics`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. GitHub-style 90-Day Activity Heatmap */}
      <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              90-Day Learning Intensity Grid
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-300 inline-block" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-max">
            {heatmapData.map((d) => {
              let bg = 'bg-slate-800/60';
              if (d.count >= 4) bg = 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
              else if (d.count === 3) bg = 'bg-emerald-500';
              else if (d.count === 2) bg = 'bg-emerald-700';
              else if (d.count === 1) bg = 'bg-emerald-900';

              return (
                <div
                  key={d.date}
                  className={`w-3 h-3 rounded-sm ${bg} transition-all hover:scale-125 cursor-pointer`}
                  title={`${d.date}: ${d.count} activities (${d.minutes} mins studied)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Recently Completed Items */}
      <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Recently Completed Items
            </h3>
          </div>
          <span className="text-xs text-slate-400">What have I completed?</span>
        </div>

        <div className="space-y-2">
          {recentCompleted.map((topic) => (
            <div
              key={topic.id}
              onClick={() => onOpenTopic(topic)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {topic.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="capitalize">{topic.pillar.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{topic.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-400">
                  {'★'.repeat(topic.confidence)}{'☆'.repeat(5 - topic.confidence)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {formatTimeAgo(topic.completed_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
