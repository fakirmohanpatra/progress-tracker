'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  PieChart,
  Layers,
} from 'lucide-react';
import { DashboardMetrics, Topic } from '@/types';
import { ProgressRing } from './ProgressRing';

interface AnalyticsViewProps {
  metrics: DashboardMetrics;
  topics: Topic[];
}

export function AnalyticsView({ metrics, topics }: AnalyticsViewProps) {
  const {
    overallPercentage,
    completedTopics,
    totalTopics,
    currentStreak,
    longestStreak,
    pillars,
    paceStatus,
    currentDay,
    daysRemaining,
    topicsNeededPerDay,
    heatmapData,
  } = metrics;

  // Total study time logged in minutes
  const totalStudyMinutes = heatmapData.reduce((acc, cur) => acc + cur.minutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Difficulty counts
  const easyTotal = topics.filter((t) => t.difficulty === 'Easy').length;
  const easyDone = topics.filter((t) => t.difficulty === 'Easy' && (t.status === 'completed' || t.status === 'mastered')).length;
  const easyPct = easyTotal > 0 ? Math.round((easyDone / easyTotal) * 100) : 0;

  const medTotal = topics.filter((t) => t.difficulty === 'Medium').length;
  const medDone = topics.filter((t) => t.difficulty === 'Medium' && (t.status === 'completed' || t.status === 'mastered')).length;
  const medPct = medTotal > 0 ? Math.round((medDone / medTotal) * 100) : 0;

  const hardTotal = topics.filter((t) => t.difficulty === 'Hard').length;
  const hardDone = topics.filter((t) => t.difficulty === 'Hard' && (t.status === 'completed' || t.status === 'mastered')).length;
  const hardPct = hardTotal > 0 ? Math.round((hardDone / hardTotal) * 100) : 0;

  // Box distribution
  const boxes = [1, 2, 3, 4, 5].map((b) => ({
    box: b,
    count: topics.filter((t) => t.box === b).length,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#0c0e15] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Learning Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">Performance Deep-Dive</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5">
            Interview Preparation Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical metrics on retention, velocity, and mastery trajectory across 90 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right font-mono">
            <div className="text-[10px] uppercase text-slate-400">Total Focus Time</div>
            <div className="text-base font-bold text-amber-300">{totalStudyHours} hrs logged</div>
          </div>
        </div>
      </div>

      {/* Top 3 High-Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Mastery Completion
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {overallPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {completedTopics} of {totalTopics} completed
            </div>
          </div>
          <ProgressRing
            percentage={overallPercentage}
            size={70}
            strokeWidth={7}
            color="#10b981"
            glowColor="rgba(16, 185, 129, 0.3)"
          />
        </div>

        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Consistency Streak
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {currentStreak} Days
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Longest streak: {longestStreak} days
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-7 h-7 text-amber-400 animate-flame" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Required Velocity
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
              {topicsNeededPerDay} / day
            </div>
            <div className="text-xs text-slate-400 mt-1">
              To complete 100% in {daysRemaining} days
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Pillars Comparison & Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar Mastery Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Pillar Mastery Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">Target vs Actual</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* DSA */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-emerald-400">DSA (LeetCode) — Highest Priority</span>
                <span className="font-mono text-slate-300">
                  {pillars.dsa.completed} / {pillars.dsa.total} ({pillars.dsa.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${pillars.dsa.percentage}%` }}
                />
              </div>
            </div>

            {/* System Design */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-indigo-400">System Design Architecture</span>
                <span className="font-mono text-slate-300">
                  {pillars.system_design.completed} / {pillars.system_design.total} ({pillars.system_design.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${pillars.system_design.percentage}%` }}
                />
              </div>
            </div>

            {/* Backend Engineering */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-amber-400">Backend Engineering Concepts</span>
                <span className="font-mono text-slate-300">
                  {pillars.backend.completed} / {pillars.backend.total} ({pillars.backend.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${pillars.backend.percentage}%` }}
                />
              </div>
            </div>

            {/* SQL Sandbox */}
            {metrics.sqlStats && (
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-cyan-400">SQL Sandbox (Query Practice)</span>
                  <span className="font-mono text-slate-300">
                    {metrics.sqlStats.completed} / {metrics.sqlStats.total} ({metrics.sqlStats.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.sqlStats.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Difficulty Depth Breakdown
            </h3>
            <span className="text-xs font-mono text-slate-400">Across All Pillars</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-emerald-400">Easy Foundation</span>
                <span className="font-mono text-slate-300">
                  {easyDone} / {easyTotal} ({easyPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-amber-400">Medium High-Yield (Interview Core)</span>
                <span className="font-mono text-slate-300">
                  {medDone} / {medTotal} ({medPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${medPct}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-rose-400">Hard Mastery (Staff / Top Tier)</span>
                <span className="font-mono text-slate-300">
                  {hardDone} / {hardTotal} ({hardPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Retention Funnel (Leitner Boxes) */}
      <div className="p-5 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Spaced Repetition Retention Funnel
          </h3>
          <span className="text-xs text-slate-400">From Daily Practice to Permanent Memory</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {boxes.map((b) => (
            <div
              key={b.box}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-center"
            >
              <div className="text-[11px] font-mono uppercase text-slate-400">
                Box {b.box}
              </div>
              <div className="text-2xl font-bold font-mono text-white my-1">
                {b.count}
              </div>
              <div className="text-[10px] text-slate-400">
                {b.box === 1
                  ? 'Active / Learning'
                  : b.box === 2
                  ? '3-Day Recall'
                  : b.box === 3
                  ? 'Weekly Retention'
                  : b.box === 4
                  ? 'Bi-Weekly Retention'
                  : 'Permanently Mastered'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
