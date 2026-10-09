'use client';

import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Network,
  Server,
  Calendar,
  RotateCw,
  FileText,
  BarChart3,
  Flame,
  Terminal,
  Briefcase,
} from 'lucide-react';
import { ViewTab, DashboardMetrics } from '@/types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  metrics: DashboardMetrics | null;
}

interface NavItem {
  id: ViewTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut: string;
  pillarColor?: string;
}

export function Sidebar({ currentTab, onSelectTab, metrics }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      shortcut: '1',
    },
    {
      id: 'dsa',
      label: 'DSA (LeetCode)',
      icon: Code2,
      shortcut: '2',
      badge: metrics ? `${metrics.pillars.dsa.completed}/${metrics.pillars.dsa.total}` : undefined,
      pillarColor: 'text-emerald-400',
    },
    {
      id: 'system_design',
      label: 'System Design',
      icon: Network,
      shortcut: '3',
      badge: metrics ? `${metrics.pillars.system_design.completed}/${metrics.pillars.system_design.total}` : undefined,
      pillarColor: 'text-indigo-400',
    },
    {
      id: 'backend',
      label: 'Backend Engineering',
      icon: Server,
      shortcut: '4',
      badge: metrics ? `${metrics.pillars.backend.completed}/${metrics.pillars.backend.total}` : undefined,
      pillarColor: 'text-amber-400',
    },
    {
      id: 'sql_practice',
      label: 'SQL Sandbox',
      icon: Terminal,
      shortcut: '5',
      badge: metrics?.sqlStats ? `${metrics.sqlStats.completed}/${metrics.sqlStats.total}` : undefined,
      pillarColor: 'text-cyan-400',
    },
    {
      id: 'calendar',
      label: 'Calendar & Roadmap',
      icon: Calendar,
      shortcut: '6',
    },
    {
      id: 'review_queue',
      label: 'Review Queue',
      icon: RotateCw,
      shortcut: '7',
      badge: metrics && metrics.dueForReviewCount > 0 ? `${metrics.dueForReviewCount} due` : undefined,
    },
    {
      id: 'notes',
      label: 'Notes & Cheatsheets',
      icon: FileText,
      shortcut: '8',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      shortcut: '9',
    },
    {
      id: 'applications',
      label: 'Application List',
      icon: Briefcase,
      shortcut: '0',
      badge:
        metrics?.applicationStats && metrics.applicationStats.active > 0
          ? `${metrics.applicationStats.active} active`
          : undefined,
      pillarColor: 'text-violet-400',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between h-screen border-r border-slate-800/80 bg-[#090a0f] text-slate-300 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-mono text-xs font-black text-black">90D</span>
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                90-Day ICC
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  PROD
                </span>
              </div>
              <div className="text-[11px] text-slate-400 tracking-tight font-medium">
                Interview Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Learning OS
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            const isReviewQueue = item.id === 'review_queue';
            const hasReviewDue = isReviewQueue && metrics && metrics.dueForReviewCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? item.pillarColor || 'text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        hasReviewDue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <kbd className="hidden group-hover:inline-block text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">
                    {item.shortcut}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pillar progress breakdown */}
        {metrics && (
          <div className="mx-3 mt-3 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pillar Velocity</span>
              <span className="text-[10px] font-mono text-slate-400">
                {metrics.overallPercentage}% Total
              </span>
            </div>

            {/* DSA */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-emerald-400 font-medium">DSA</span>
                <span className="text-slate-400 font-mono">
                  {metrics.pillars.dsa.percentage}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.pillars.dsa.percentage}%` }}
                />
              </div>
            </div>

            {/* System Design */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-indigo-400 font-medium">System Design</span>
                <span className="text-slate-400 font-mono">
                  {metrics.pillars.system_design.percentage}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.pillars.system_design.percentage}%` }}
                />
              </div>
            </div>

            {/* Backend */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-amber-400 font-medium">Backend</span>
                <span className="text-slate-400 font-mono">
                  {metrics.pillars.backend.percentage}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.pillars.backend.percentage}%` }}
                />
              </div>
            </div>

            {/* SQL Sandbox */}
            {metrics.sqlStats && (
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-cyan-400 font-medium">SQL Sandbox</span>
                  <span className="text-slate-400 font-mono">
                    {metrics.sqlStats.percentage}%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.sqlStats.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info: Streak & Storage */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {metrics && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-flame" />
              <div>
                <div className="text-xs font-bold text-amber-200 font-mono">
                  {metrics.currentStreak} Day Streak
                </div>
                <div className="text-[10px] text-amber-300/70">
                  Best: {metrics.longestStreak} days
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            SQLite WAL DB
          </span>
          <span className="text-slate-400">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
