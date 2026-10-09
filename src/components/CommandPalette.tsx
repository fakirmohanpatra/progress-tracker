'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Code2,
  Network,
  Server,
  Calendar,
  RotateCw,
  FileText,
  BarChart3,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  Briefcase,
} from 'lucide-react';
import { Topic, ViewTab } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewTopic: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  topics,
  onSelectTopic,
  onSelectTab,
  onOpenNewTopic,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter topics
  const matchingTopics = topics.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.key_intuition.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const quickNav = [
    { label: 'Go to Dashboard', tab: 'dashboard' as ViewTab, icon: Sparkles },
    { label: 'Go to DSA (LeetCode)', tab: 'dsa' as ViewTab, icon: Code2 },
    { label: 'Go to System Design', tab: 'system_design' as ViewTab, icon: Network },
    { label: 'Go to Backend Engineering', tab: 'backend' as ViewTab, icon: Server },
    { label: 'Go to SQL Sandbox', tab: 'sql_practice' as ViewTab, icon: Terminal },
    { label: 'Go to 90-Day Calendar', tab: 'calendar' as ViewTab, icon: Calendar },
    { label: 'Go to Review Queue', tab: 'review_queue' as ViewTab, icon: RotateCw },
    { label: 'Go to Notes & Cheatsheets', tab: 'notes' as ViewTab, icon: FileText },
    { label: 'Go to Analytics', tab: 'analytics' as ViewTab, icon: BarChart3 },
    { label: 'Go to Application List', tab: 'applications' as ViewTab, icon: Briefcase },
  ].filter((item) => !query || item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-700/80 bg-[#0f121a] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0c0e15]">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search problems, patterns, concepts, or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs">
          {/* Topics matches */}
          {matchingTopics.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Curriculum Topics ({matchingTopics.length})
              </div>
              {matchingTopics.map((topic) => {
                const pillarBadge =
                  topic.pillar === 'dsa'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : topic.pillar === 'system_design'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-amber-400 bg-amber-500/10';

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      onSelectTopic(topic);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {topic.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {topic.category} • {topic.summary}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded flex-shrink-0 ${pillarBadge}`}>
                      {topic.pillar === 'dsa' ? 'DSA' : topic.pillar === 'system_design' ? 'Sys' : 'BE'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Navigation */}
          {quickNav.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Quick Navigation
              </div>
              {quickNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onSelectTab(item.tab);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenNewTopic();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors font-medium text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Topic / Problem...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
