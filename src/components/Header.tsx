'use client';

import React from 'react';
import { Search, Plus, Sparkles, Database, RotateCcw } from 'lucide-react';
import { DashboardMetrics, ViewTab } from '@/types';
import { StudyTimer } from './StudyTimer';

interface HeaderProps {
  currentTab: ViewTab;
  metrics: DashboardMetrics | null;
  onOpenCommandPalette: () => void;
  onOpenNewTopicModal: () => void;
  onRefreshData: () => void;
}

const TAB_TITLES: Record<ViewTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Command Center',
    subtitle: 'Daily learning status, spaced review queue, and 90-day trajectory',
  },
  dsa: {
    title: 'DSA & LeetCode Patterns',
    subtitle: 'Highest priority — Blind 75 / NeetCode 150 core patterns & algorithms',
  },
  system_design: {
    title: 'System Design Architecture',
    subtitle: 'Fundamental scaling blocks & real-world high-throughput case studies',
  },
  backend: {
    title: 'Backend Engineering Concepts',
    subtitle: 'Framework-agnostic systems: protocols, internals, concurrency & reliability',
  },
  calendar: {
    title: '90-Day Curriculum Calendar',
    subtitle: 'Structured week-by-week timeline and daily target schedule',
  },
  review_queue: {
    title: 'Spaced Repetition Command Deck',
    subtitle: 'Leitner 5-box review system for permanent long-term memory retention',
  },
  notes: {
    title: 'Knowledge Base & Notes',
    subtitle: 'Notion-inspired engineering notebook, mental models, and cheatsheets',
  },
  analytics: {
    title: 'Learning Telemetry & Analytics',
    subtitle: 'Pillar mastery curves, study velocity, streak tracking, and projections',
  },
  sql_practice: {
    title: 'SQL Sandbox Workbench',
    subtitle: 'Interactive SQLite sandbox & SDE2 interview challenges with real-time execution',
  },
  applications: {
    title: 'Job Application Pipeline',
    subtitle: 'Track applied companies, recruiter contacts, technical interview dates & offers',
  },
};

export function Header({
  currentTab,
  metrics,
  onOpenCommandPalette,
  onOpenNewTopicModal,
  onRefreshData,
}: HeaderProps) {
  const meta = TAB_TITLES[currentTab];

  const handleReset = async () => {
    if (confirm('Reset curriculum database to initial seeded state? This will preserve all curated topics.')) {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      onRefreshData();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-[#090a0f]/90 backdrop-blur-md">
      {/* Left: View title & Day target badge */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold tracking-tight text-white">
              {meta.title}
            </h1>
            {metrics && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Day {metrics.currentDay} / 90
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-normal truncate max-w-md hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Command Search button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          <span className="hidden md:inline">Search topics, patterns...</span>
          <span className="inline md:hidden">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Focus Pomodoro */}
        <StudyTimer onSessionLogged={onRefreshData} />

        {/* New topic action */}
        <button
          onClick={onOpenNewTopicModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Topic</span>
        </button>

        {/* Database indicator */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800/60"
          title="SQLite database active in WAL mode"
        >
          <Database className="w-3 h-3 text-emerald-400" />
          <span>SQLite Persistent</span>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          title="Reset database to default curriculum"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
