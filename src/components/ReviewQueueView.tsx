'use client';

import React, { useState } from 'react';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Eye,
  ArrowRight,
  Code2,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Topic, ReviewOutcome, ReviewLog } from '@/types';
import { triggerConfetti, formatDate, formatTimeAgo } from '@/lib/utils';

interface ReviewQueueViewProps {
  topics: Topic[];
  reviewHistory: ReviewLog[];
  onQuickReview: (topicId: string, outcome: ReviewOutcome, confidence: number) => Promise<void>;
  onOpenTopic: (topic: Topic) => void;
}

export function ReviewQueueView({
  topics,
  reviewHistory,
  onQuickReview,
  onOpenTopic,
}: ReviewQueueViewProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [deckTab, setDeckTab] = useState<'due' | 'early'>('due');

  const nowMs = Date.now();
  const dueTopics = topics
    .filter((t) => t.next_review_at && new Date(t.next_review_at).getTime() <= nowMs)
    .sort((a, b) => (a.priority - b.priority) || (new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime()));

  const completedTopics = topics
    .filter((t) => t.status === 'completed' || t.status === 'mastered' || t.times_reviewed > 0)
    .sort((a, b) => (a.priority - b.priority) || (a.box - b.box));

  // Active topic for flashcard
  const activeTopic =
    topics.find((t) => t.id === selectedTopicId) ||
    (deckTab === 'due' ? dueTopics[0] : completedTopics[0]) ||
    (dueTopics.length > 0 ? dueTopics[0] : completedTopics[0]) ||
    null;

  // Leitner box count distribution
  const boxCounts = [1, 2, 3, 4, 5].map((box) => ({
    box,
    count: topics.filter((t) => t.box === box).length,
    interval: box === 1 ? '1 day' : box === 2 ? '3 days' : box === 3 ? '7 days' : box === 4 ? '14 days' : '30 days',
  }));

  const handleReviewAction = async (outcome: ReviewOutcome, confidence: number) => {
    if (!activeTopic) return;
    await onQuickReview(activeTopic.id, outcome, confidence);
    if (outcome === 'remembered') {
      triggerConfetti();
    }
    setShowAnswer(false);
    // Auto advance to next topic in current list
    const currentList = deckTab === 'due' ? dueTopics : completedTopics;
    const remaining = currentList.filter((t) => t.id !== activeTopic.id);
    if (remaining.length > 0) {
      setSelectedTopicId(remaining[0].id);
    } else {
      setSelectedTopicId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Leitner Box Status Header */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#0c0e15] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Spaced Repetition Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Leitner 5-Box Model</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1.5">
              Spaced Repetition Command Deck
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review topics at expanding intervals to guarantee long-term retention into your interview.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              {dueTopics.length} Topics Due Today
            </span>
          </div>
        </div>

        {/* 5 Leitner Boxes Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {boxCounts.map((b) => (
            <div
              key={b.box}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                b.box === 5
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : b.box === 4
                  ? 'border-indigo-500/30 bg-indigo-950/10'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="text-[11px] font-mono uppercase text-slate-400">
                Box {b.box}
              </div>
              <div className="text-xl font-bold font-mono text-white my-1">
                {b.count}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Every {b.interval}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Flashcard Review Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Flashcard Arena */}
        <div className="lg:col-span-2 space-y-4">
          {activeTopic ? (
            <div className="p-6 rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeTopic.pillar.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{activeTopic.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Current Box: <strong>Box {activeTopic.box}</strong>
                    </span>
                    {activeTopic.next_review_at && new Date(activeTopic.next_review_at).getTime() > nowMs && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Early Review
                      </span>
                    )}
                    <button
                      onClick={() => onOpenTopic(activeTopic)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Open Full Note →
                    </button>
                  </div>
                </div>

                {/* Question / Concept Prompt */}
                <div className="my-6">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Problem & Concept
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {activeTopic.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {activeTopic.summary}
                  </p>
                </div>

                {/* Reveal Answer / Intuition Section */}
                {!showAnswer ? (
                  <div className="py-8 text-center">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Reveal Key Intuition & Blueprint</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Test your mental model first before looking at the solution.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 space-y-3 animate-in fade-in duration-300">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Key Intuition (&quot;Aha!&quot; Moment)
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {activeTopic.key_intuition}
                      </p>
                    </div>

                    {activeTopic.pitfalls && (
                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-mono uppercase text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pitfalls to Avoid
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeTopic.pitfalls}
                        </p>
                      </div>
                    )}

                    {activeTopic.time_complexity && (
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Time: <strong className="text-white">{activeTopic.time_complexity}</strong></span>
                        <span>Space: <strong className="text-white">{activeTopic.space_complexity}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Recall Evaluation Controls */}
              {showAnswer && (
                <div className="pt-5 border-t border-slate-800 mt-6 space-y-2">
                  <div className="text-center text-xs text-slate-400 mb-2">
                    How well did you recall this solution?
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleReviewAction('forgot', 1)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all flex flex-col items-center gap-1 active:scale-95"
                    >
                      <span className="font-bold">Forgot / Blacked Out</span>
                      <span className="text-[10px] text-rose-400/80">Reset to Box 1 (1d)</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('struggled', 3)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex flex-col items-center gap-1 active:scale-95"
                    >
                      <span className="font-bold">Struggled a bit</span>
                      <span className="text-[10px] text-amber-400/80">Keep or Step Back</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('remembered', 5)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex flex-col items-center gap-1 active:scale-95"
                    >
                      <span className="font-bold">Clean Recall ✓</span>
                      <span className="text-[10px] text-emerald-400/80">Advance to Next Box</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0c0e15]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">
                Queue Completely Finished!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All scheduled spaced revisions for today have been conquered. Check back tomorrow or pick any completed topic from the list to review early!
              </p>
              {completedTopics.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setDeckTab('early');
                      setSelectedTopicId(completedTopics[0].id);
                      setShowAnswer(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    Practice Completed Topics Early ({completedTopics.length}) →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Review Queue List & History */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Deck Queue</span>
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              </h3>

              {/* Deck selector toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                <button
                  onClick={() => {
                    setDeckTab('due');
                    if (dueTopics.length > 0) setSelectedTopicId(dueTopics[0].id);
                    else setSelectedTopicId(null);
                    setShowAnswer(false);
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    deckTab === 'due'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Due ({dueTopics.length})
                </button>
                <button
                  onClick={() => {
                    setDeckTab('early');
                    if (completedTopics.length > 0) setSelectedTopicId(completedTopics[0].id);
                    setShowAnswer(false);
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    deckTab === 'early'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Early ({completedTopics.length})
                </button>
              </div>
            </div>

            {deckTab === 'due' ? (
              dueTopics.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No pending cards due today.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dueTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setShowAnswer(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        activeTopic?.id === topic.id
                          ? 'border-indigo-500/60 bg-indigo-950/20 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate">{topic.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Box {topic.box}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {topic.category}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : completedTopics.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                No completed topics yet. Mark topics completed in DSA or System Design to practice them here!
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {completedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setShowAnswer(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeTopic?.id === topic.id
                        ? 'border-indigo-500/60 bg-indigo-950/20 text-white'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{topic.title}</span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        Box {topic.box}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate">{topic.category}</span>
                      {topic.next_review_at && (
                        <span className="font-mono text-[9px] text-slate-400">
                          Due {formatDate(topic.next_review_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Review Log Audit Trail */}
          <div className="p-4 rounded-2xl border border-slate-800/90 bg-[#0c0e15] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Recent Recall History</span>
              <History className="w-3.5 h-3.5 text-slate-500" />
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {reviewHistory.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg border border-slate-800/60 bg-slate-900/30 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="font-medium text-white truncate text-[11px]">
                      {log.topic_title || log.topic_id}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formatTimeAgo(log.reviewed_at)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                      log.outcome === 'remembered'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : log.outcome === 'struggled'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {log.outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
