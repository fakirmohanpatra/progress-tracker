'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Table,
  Check,
  Sparkles,
  TerminalSquare,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { SqlChallenge } from '@/types';
import { triggerConfetti } from '@/lib/utils';

interface SqlPracticeViewProps {
  onProgressUpdate?: () => void;
}

export function SqlPracticeView({ onProgressUpdate }: SqlPracticeViewProps = {}) {
  const [challenges, setChallenges] = useState<SqlChallenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ columns: string[]; rows: Record<string, unknown>[]; executionTimeMs: number; rowCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [schemaData, setSchemaData] = useState<Record<string, string[]> | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unsolved' | 'solved'>('all');

  // Load challenges and saved progress from API
  useEffect(() => {
    fetch('/api/sql-practice')
      .then((res) => res.json())
      .then((data) => {
        if (data.challenges && data.challenges.length > 0) {
          setChallenges(data.challenges);
          setActiveChallengeId(data.challenges[0].id);
          setSqlQuery(data.challenges[0].initialQuery);
        }
        if (data.completedChallengeIds) {
          setCompletedChallenges(new Set(data.completedChallengeIds));
        }
        if (data.schema) {
          setSchemaData(data.schema);
        }
      })
      .catch((err) => console.error('Failed to load SQL challenges:', err));
  }, []);

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const handleSelectChallenge = (c: SqlChallenge) => {
    setActiveChallengeId(c.id);
    setSqlQuery(c.initialQuery);
    setResults(null);
    setError(null);
    setShowHint(false);
    setShowSolution(false);
  };

  const executeSql = async () => {
    if (!sqlQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sql-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to execute SQL query');
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSolved = async (challengeId?: string) => {
    const id = challengeId || activeChallenge?.id;
    if (!id) return;

    const isCurrentlySolved = completedChallenges.has(id);
    const nextSolved = !isCurrentlySolved;

    if (nextSolved) {
      triggerConfetti();
    }

    setCompletedChallenges((prev) => {
      const next = new Set(prev);
      if (nextSolved) next.add(id);
      else next.delete(id);
      return next;
    });

    try {
      const res = await fetch('/api/sql-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_completed',
          challengeId: id,
          completed: nextSolved,
        }),
      });
      const data = await res.json();
      if (data.completedChallengeIds) {
        setCompletedChallenges(new Set(data.completedChallengeIds));
      }
      onProgressUpdate?.();
    } catch (err) {
      console.error('Failed to save SQL progress:', err);
    }
  };

  // Run with Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      executeSql();
    }
  };

  const solvedCount = completedChallenges.size;
  const totalCount = challenges.length;
  const completionPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const filteredChallenges = challenges.filter((c) => {
    if (filterMode === 'solved') return completedChallenges.has(c.id);
    if (filterMode === 'unsolved') return !completedChallenges.has(c.id);
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0c0e15] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TerminalSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                SQL Sandbox & Command Workbench
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Interactive SQLite Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Frequently asked SDE2 SQL interview queries: Joins, Window functions, Aggregations & Subqueries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Progress Tracker Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20">
            <div className="text-right">
              <div className="text-[11px] font-mono text-cyan-300 font-bold">
                {solvedCount} / {totalCount} Solved
              </div>
              <div className="text-[9px] font-mono text-slate-400">{completionPercentage}% Completed</div>
            </div>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowSchema(!showSchema)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
          >
            <Table className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showSchema ? 'Hide Schema' : 'View Sandbox Schema'}</span>
          </button>
        </div>
      </div>

      {/* Schema Drawer (Expandable) */}
      {showSchema && schemaData && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-[#0f121d] flex-shrink-0 animate-in fade-in duration-200">
          <div className="text-xs font-mono font-semibold uppercase text-indigo-300 mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            Sandbox Database Tables & Columns
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[11px] font-mono">
            {Object.entries(schemaData).map(([tbl, cols]) => (
              <div key={tbl} className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">{tbl}</div>
                <div className="space-y-0.5 text-slate-400">
                  {cols.map((col) => (
                    <div key={col} className="truncate">{col}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split Workbench */}
      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left: Challenge Directory */}
        <div className="w-72 flex-shrink-0 flex flex-col p-4 rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-lg">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SDE2 Interview Problems
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
              {solvedCount}/{challenges.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 my-2.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({challenges.length})
            </button>
            <button
              onClick={() => setFilterMode('unsolved')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'unsolved'
                  ? 'bg-slate-800 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todo ({challenges.length - solvedCount})
            </button>
            <button
              onClick={() => setFilterMode('solved')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                filterMode === 'solved'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({solvedCount})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredChallenges.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No challenges match filter
              </div>
            ) : (
              filteredChallenges.map((c) => {
                const isSelected = activeChallenge?.id === c.id;
                const isSolved = completedChallenges.has(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChallenge(c)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/20 text-white shadow-sm'
                        : 'border-transparent hover:border-slate-800 hover:bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{c.title}</span>
                      {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{c.category}</span>
                      <span
                        className={
                          c.difficulty === 'Easy'
                            ? 'text-emerald-400'
                            : c.difficulty === 'Medium'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {c.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center & Right: Editor and Execution Console */}
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-xl overflow-hidden min-w-0">
          {activeChallenge ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Challenge Header & Description */}
              <div className="p-4 border-b border-slate-800 bg-[#090b12] space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeChallenge.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeChallenge.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        activeChallenge.difficulty === 'Easy'
                          ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                          : activeChallenge.difficulty === 'Medium'
                          ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                          : 'text-rose-400 border-rose-500/20 bg-rose-500/10'
                      }`}
                    >
                      {activeChallenge.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800 flex items-center gap-1 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSolution(!showSolution);
                        if (!showSolution) setSqlQuery(activeChallenge.solutionQuery);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800 flex items-center gap-1 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showSolution ? 'Hide Solution' : 'Solution'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleSolved()}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        completedChallenges.has(activeChallenge.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30'
                          : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300'
                      }`}
                      title={completedChallenges.has(activeChallenge.id) ? 'Click to unmark' : 'Mark as solved'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{completedChallenges.has(activeChallenge.id) ? 'Solved ✓' : 'Mark Solved'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeChallenge.description}
                </p>

                {showHint && (
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-mono animate-in fade-in duration-150">
                    💡 Expected Output: {activeChallenge.expectedOutputHint}
                  </div>
                )}
              </div>

              {/* SQL Code Editor Area */}
              <div className="flex-1 flex flex-col min-h-0 border-b border-slate-800">
                <div className="px-4 py-2 bg-[#08090e] border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Query Editor</span>
                    <span className="text-[10px] text-slate-600">• Press ⌘+Enter to execute</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSqlQuery(activeChallenge.initialQuery)}
                      className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[11px]"
                      title="Reset query"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={executeSql}
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{loading ? 'Running...' : 'Run Query'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-3 bg-[#06070a] relative min-h-[160px]">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={8}
                    className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    placeholder="Write SQL query here..."
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Query Execution Result Grid */}
              <div className="h-60 flex-shrink-0 flex flex-col bg-[#090b12] overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Query Results
                    </span>
                    {results && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {results.rowCount} rows ({results.executionTimeMs} ms)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-2">
                  {error ? (
                    <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs font-mono flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">SQL Execution Error</div>
                        <div className="text-[11px] text-rose-400/90 mt-0.5">{error}</div>
                      </div>
                    </div>
                  ) : results && results.rows.length > 0 ? (
                    <table className="w-full text-xs font-mono text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-900/60 sticky top-0">
                          {results.columns.map((col) => (
                            <th key={col} className="p-2 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {results.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            {results.columns.map((col) => (
                              <td key={col} className="p-2 truncate max-w-[200px]">
                                {row[col] !== null ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : results && results.rows.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      Query executed successfully with 0 rows returned.
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 text-xs font-mono">
                      Click &ldquo;Run Query&rdquo; or press ⌘+Enter to execute SQL on the sandbox database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a SQL challenge on the left to begin practice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
