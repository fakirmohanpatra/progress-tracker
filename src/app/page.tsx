'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { PillarView } from '@/components/PillarView';
import { CalendarView } from '@/components/CalendarView';
import { ReviewQueueView } from '@/components/ReviewQueueView';
import { NotesView } from '@/components/NotesView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { SqlPracticeView } from '@/components/SqlPracticeView';
import { ApplicationListView } from '@/components/ApplicationListView';
import { TopicModal } from '@/components/TopicModal';
import { NewTopicModal } from '@/components/NewTopicModal';
import { CommandPalette } from '@/components/CommandPalette';
import {
  DashboardMetrics,
  Topic,
  ViewTab,
  PillarType,
  TopicStatus,
  ReviewOutcome,
  ReviewLog,
} from '@/types';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const [defaultNewPillar, setDefaultNewPillar] = useState<PillarType>('dsa');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Fetch all dashboard metrics & curriculum topics
  const loadData = useCallback(async () => {
    try {
      const [dashRes, topicsRes, histRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/topics'),
        fetch('/api/study-time'),
      ]);

      if (dashRes.ok) {
        const m = await dashRes.json();
        setMetrics(m);
      }
      if (topicsRes.ok) {
        const data = await topicsRes.json();
        setTopics(data.topics || []);
      }
      if (histRes.ok) {
        const h = await histRes.json();
        setReviewHistory(h.history || []);
      }
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global keyboard shortcuts (1-8 to switch views, Cmd+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '1') setCurrentTab('dashboard');
      else if (e.key === '2') setCurrentTab('dsa');
      else if (e.key === '3') setCurrentTab('system_design');
      else if (e.key === '4') setCurrentTab('backend');
      else if (e.key === '5') setCurrentTab('sql_practice');
      else if (e.key === '6') setCurrentTab('calendar');
      else if (e.key === '7') setCurrentTab('review_queue');
      else if (e.key === '8') setCurrentTab('notes');
      else if (e.key === '9') setCurrentTab('analytics');
      else if (e.key === '0' || e.key.toLowerCase() === 'a') setCurrentTab('applications');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Topic mutations
  const handleUpdateStatus = async (id: string, status: TopicStatus) => {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    if (selectedTopic && selectedTopic.id === id) {
      setSelectedTopic((prev) => (prev ? { ...prev, status } : null));
    }

    await fetch(`/api/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    loadData();
  };

  const handleUpdateConfidence = async (id: string, confidence: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, confidence } : t))
    );
    if (selectedTopic && selectedTopic.id === id) {
      setSelectedTopic((prev) => (prev ? { ...prev, confidence } : null));
    }

    await fetch(`/api/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confidence }),
    });

    loadData();
  };

  const handleQuickReview = async (topicId: string, outcome: ReviewOutcome, confidence: number) => {
    const res = await fetch(`/api/topics/${topicId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, confidence }),
    });

    if (res.ok) {
      loadData();
    }
  };

  const handleSaveNotes = async (
    id: string,
    notes: string,
    key_intuition: string,
    pitfalls: string
  ) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, notes, key_intuition, pitfalls } : t
      )
    );
    if (selectedTopic && selectedTopic.id === id) {
      setSelectedTopic((prev) =>
        prev ? { ...prev, notes, key_intuition, pitfalls } : null
      );
    }

    await fetch(`/api/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, key_intuition, pitfalls }),
    });

    loadData();
  };

  const handleCreateTopic = async (
    topicData: Partial<Topic> & { title: string; pillar: PillarType; category: string }
  ) => {
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData),
    });

    if (res.ok) {
      loadData();
    }
  };

  const handleDeleteTopic = async (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    loadData();
  };

  const openNewTopicModalWithPillar = (p: PillarType = 'dsa') => {
    setDefaultNewPillar(p);
    setIsNewTopicOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-100">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        metrics={metrics}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header
          currentTab={currentTab}
          metrics={metrics}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNewTopicModal={() => openNewTopicModalWithPillar(currentTab === 'system_design' || currentTab === 'backend' ? currentTab : 'dsa')}
          onRefreshData={loadData}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs flex items-center justify-center h-full">
              Initializing Learning Operating System...
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && metrics && (
                <DashboardView
                  metrics={metrics}
                  onSelectTab={setCurrentTab}
                  onOpenTopic={setSelectedTopic}
                  onQuickReview={handleQuickReview}
                />
              )}

              {currentTab === 'dsa' && (
                <PillarView
                  pillar="dsa"
                  topics={topics.filter((t) => t.pillar === 'dsa')}
                  onOpenTopic={setSelectedTopic}
                  onUpdateTopicStatus={handleUpdateStatus}
                  onUpdateConfidence={handleUpdateConfidence}
                  onSaveNotes={handleSaveNotes}
                  onOpenNewTopicModal={openNewTopicModalWithPillar}
                />
              )}

              {currentTab === 'system_design' && (
                <PillarView
                  pillar="system_design"
                  topics={topics.filter((t) => t.pillar === 'system_design')}
                  onOpenTopic={setSelectedTopic}
                  onUpdateTopicStatus={handleUpdateStatus}
                  onUpdateConfidence={handleUpdateConfidence}
                  onSaveNotes={handleSaveNotes}
                  onOpenNewTopicModal={openNewTopicModalWithPillar}
                />
              )}

              {currentTab === 'backend' && (
                <PillarView
                  pillar="backend"
                  topics={topics.filter((t) => t.pillar === 'backend')}
                  onOpenTopic={setSelectedTopic}
                  onUpdateTopicStatus={handleUpdateStatus}
                  onUpdateConfidence={handleUpdateConfidence}
                  onSaveNotes={handleSaveNotes}
                  onOpenNewTopicModal={openNewTopicModalWithPillar}
                />
              )}

              {currentTab === 'calendar' && (
                <CalendarView
                  topics={topics}
                  metrics={metrics}
                  onOpenTopic={setSelectedTopic}
                />
              )}

              {currentTab === 'review_queue' && (
                <ReviewQueueView
                  topics={topics}
                  reviewHistory={reviewHistory}
                  onQuickReview={handleQuickReview}
                  onOpenTopic={setSelectedTopic}
                />
              )}

              {currentTab === 'notes' && (
                <NotesView
                  topics={topics}
                  onSaveNotes={handleSaveNotes}
                />
              )}

              {currentTab === 'analytics' && metrics && (
                <AnalyticsView
                  metrics={metrics}
                  topics={topics}
                />
              )}

              {currentTab === 'sql_practice' && (
                <SqlPracticeView onProgressUpdate={loadData} />
              )}

              {currentTab === 'applications' && (
                <ApplicationListView onRefreshMetrics={loadData} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TopicModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateConfidence={handleUpdateConfidence}
        onSaveNotes={handleSaveNotes}
        onDeleteTopic={handleDeleteTopic}
        onQuickReview={handleQuickReview}
      />

      <NewTopicModal
        isOpen={isNewTopicOpen}
        defaultPillar={defaultNewPillar}
        onClose={() => setIsNewTopicOpen(false)}
        onCreateTopic={handleCreateTopic}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        topics={topics}
        onSelectTopic={setSelectedTopic}
        onSelectTab={setCurrentTab}
        onOpenNewTopic={() => openNewTopicModalWithPillar('dsa')}
      />
    </div>
  );
}
