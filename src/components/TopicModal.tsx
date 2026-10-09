'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  RotateCw,
  Save,
  Trash2,
} from 'lucide-react';
import { Topic, TopicStatus, Difficulty, PillarType, ReviewOutcome } from '@/types';
import { triggerConfetti, formatDate, formatTimeAgo } from '@/lib/utils';

interface TopicModalProps {
  topic: Topic | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TopicStatus) => Promise<void>;
  onUpdateConfidence: (id: string, confidence: number) => Promise<void>;
  onSaveNotes: (id: string, notes: string, intuition: string, pitfalls: string) => Promise<void>;
  onDeleteTopic?: (id: string) => Promise<void>;
  onQuickReview?: (topicId: string, outcome: ReviewOutcome, confidence: number) => Promise<void>;
}

export function TopicModal({
  topic,
  onClose,
  onUpdateStatus,
  onUpdateConfidence,
  onSaveNotes,
  onDeleteTopic,
  onQuickReview,
}: TopicModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'code'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [notes, setNotes] = useState(topic?.notes || '');
  const [intuition, setIntuition] = useState(topic?.key_intuition || '');
  const [pitfalls, setPitfalls] = useState(topic?.pitfalls || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!topic) return null;

  const handleCopy = () => {
    if (topic.code_snippet) {
      navigator.clipboard.writeText(topic.code_snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: TopicStatus) => {
    if (newStatus === 'completed' || newStatus === 'mastered') {
      triggerConfetti();
    }
    await onUpdateStatus(topic.id, newStatus);
  };

  const handleSaveAll = async () => {
    await onSaveNotes(topic.id, notes, intuition, pitfalls);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${topic.title}"?`)) {
      await onDeleteTopic?.(topic.id);
      onClose();
    }
  };

  const diffColor =
    topic.difficulty === 'Easy'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : topic.difficulty === 'Medium'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#0f121a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0c0e15] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {topic.pillar.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">• {topic.category}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${diffColor}`}>
                {topic.difficulty}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Day {topic.day_target} Target
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{topic.title}</span>
              {topic.external_url && (
                <a
                  href={topic.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Open external problem link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Review Controls Strip */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-[#121622] flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Status:</span>
            <select
              value={topic.status}
              onChange={(e) => handleStatusChange(e.target.value as TopicStatus)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="mastered">Mastered (Box 4-5)</option>
            </select>
          </div>

          {/* Improvement / Readiness Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Readiness:</span>
            <select
              value={topic.confidence || 1}
              onChange={(e) => onUpdateConfidence(topic.id, Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-medium text-[11px] focus:outline-none"
            >
              <option value="1">🌱 Level 1: Need Practice</option>
              <option value="2">📖 Level 2: Theory Understood</option>
              <option value="3">🛠️ Level 3: Working Knowledge</option>
              <option value="4">🎯 Level 4: Interview Ready</option>
              <option value="5">🏆 Level 5: Mastered & Deep</option>
            </select>
          </div>

          {/* Leitner Box indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>Box {topic.box} / 5</span>
            {topic.next_review_at && (
              <span className={new Date(topic.next_review_at).getTime() <= Date.now() ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                • {new Date(topic.next_review_at).getTime() <= Date.now() ? 'Review Due Today' : `Next review: ${formatDate(topic.next_review_at)}`}
              </span>
            )}
          </div>
        </div>

        {/* Quick Review Recall Strip */}
        {onQuickReview && (topic.status !== 'pending' || topic.times_reviewed > 0) && (
          <div className="px-6 py-2 border-b border-slate-800/60 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Spaced Review:</span>
              <span className="text-[11px] text-slate-400">
                {topic.next_review_at && new Date(topic.next_review_at).getTime() <= Date.now()
                  ? '🔥 Due for revision today'
                  : topic.next_review_at
                  ? `Scheduled for ${formatDate(topic.next_review_at)} (Box ${topic.box})`
                  : 'Start initial revision'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  await onQuickReview(topic.id, 'forgot', 1);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all active:scale-95"
                title="Reset to Box 1 (1-Day review)"
              >
                Forgot (Box 1)
              </button>
              <button
                onClick={async () => {
                  await onQuickReview(topic.id, 'struggled', 3);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                title="Demote by 1 Box"
              >
                Struggled
              </button>
              <button
                onClick={async () => {
                  await onQuickReview(topic.id, 'remembered', 5);
                  triggerConfetti();
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all active:scale-95"
                title="Advance to next Box"
              >
                Recall ✓
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800/80 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Intuition
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Engineering Notes
          </button>
          {topic.code_snippet && (
            <button
              onClick={() => setActiveTab('code')}
              className={`pb-2.5 border-b-2 transition-all ${
                activeTab === 'code'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Code / Blueprint
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Problem Summary
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {topic.summary}
                </p>
              </div>

              {/* Intuition Box */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-transparent">
                <div className="text-xs font-mono uppercase text-indigo-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Key Intuition (&quot;Aha!&quot; Moment)
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {topic.key_intuition}
                </p>
              </div>

              {/* Pitfalls */}
              {topic.pitfalls && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-orange-950/10 to-transparent">
                  <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Pitfalls & Edge Cases
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.pitfalls}
                  </p>
                </div>
              )}

              {/* Complexities */}
              {(topic.time_complexity || topic.space_complexity) && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-6 text-xs font-mono">
                  {topic.time_complexity && (
                    <div>
                      <span className="text-slate-400">Time Complexity: </span>
                      <strong className="text-emerald-400">{topic.time_complexity}</strong>
                    </div>
                  )}
                  {topic.space_complexity && (
                    <div>
                      <span className="text-slate-400">Space Complexity: </span>
                      <strong className="text-indigo-400">{topic.space_complexity}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Personal Study Notes & Insights
                </span>
                <button
                  onClick={handleSaveAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                className="w-full p-4 rounded-xl text-xs bg-black/60 border border-slate-800 text-white font-mono focus:outline-none focus:border-slate-600 leading-relaxed"
                placeholder="Add your personal notes, interview reflections, or whiteboard takeaways..."
              />

              {isSaved && (
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Notes successfully saved to SQLite database.
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && topic.code_snippet && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Canonical Implementation
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to clipboard' : 'Copy snippet'}</span>
                </button>
              </div>

              <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto p-4 bg-black/50 rounded-xl border border-slate-800/80">
                <code>{topic.code_snippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0e15] flex items-center justify-between text-xs">
          <button
            onClick={handleDelete}
            className="text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Topic</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
