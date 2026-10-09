'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  User,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  DollarSign,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types';
import { triggerConfetti } from '@/lib/utils';

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badgeColor: string; dotColor: string }
> = {
  applied: {
    label: 'Applied',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  screening: {
    label: 'Recruiter Screen',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    dotColor: 'bg-purple-400',
  },
  technical: {
    label: 'Technical Round',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    dotColor: 'bg-cyan-400',
  },
  system_design: {
    label: 'System Design',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    dotColor: 'bg-amber-400',
  },
  onsite: {
    label: 'Onsite / Final',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    dotColor: 'bg-indigo-400',
  },
  offer: {
    label: 'Offer Received 🎉',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    dotColor: 'bg-rose-400',
  },
  withdrawn: {
    label: 'Withdrawn',
    badgeColor: 'text-slate-400 border-slate-700 bg-slate-800/40',
    dotColor: 'bg-slate-400',
  },
};

interface ApplicationListViewProps {
  onRefreshMetrics?: () => void;
}

export function ApplicationListView({ onRefreshMetrics }: ApplicationListViewProps = {}) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'interviews' | 'offer' | 'rejected'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // Form State
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('SDE2 Backend');
  const [formAppliedDate, setFormAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<ApplicationStatus>('applied');
  const [formPointOfContact, setFormPointOfContact] = useState('');
  const [formInterviewDate, setFormInterviewDate] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formJobUrl, setFormJobUrl] = useState('');
  const [formSalaryRange, setFormSalaryRange] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load job applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const openAddModal = () => {
    setEditingApplication(null);
    setFormCompany('');
    setFormRole('SDE2 Backend');
    setFormAppliedDate(new Date().toISOString().split('T')[0]);
    setFormStatus('applied');
    setFormPointOfContact('');
    setFormInterviewDate('');
    setFormComment('');
    setFormLocation('');
    setFormJobUrl('');
    setFormSalaryRange('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApplication(app);
    setFormCompany(app.company);
    setFormRole(app.role || '');
    setFormAppliedDate(app.applied_date || new Date().toISOString().split('T')[0]);
    setFormStatus(app.status);
    setFormPointOfContact(app.point_of_contact || '');
    setFormInterviewDate(app.interview_date || '');
    setFormComment(app.comment || '');
    setFormLocation(app.location || '');
    setFormJobUrl(app.job_url || '');
    setFormSalaryRange(app.salary_range || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) return;

    setIsSaving(true);
    try {
      if (editingApplication) {
        // Update
        const res = await fetch(`/api/applications/${editingApplication.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: formCompany.trim(),
            role: formRole.trim(),
            applied_date: formAppliedDate,
            status: formStatus,
            point_of_contact: formPointOfContact.trim() || null,
            interview_date: formInterviewDate || null,
            comment: formComment.trim() || null,
            location: formLocation.trim() || null,
            job_url: formJobUrl.trim() || null,
            salary_range: formSalaryRange.trim() || null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setApplications((prev) =>
            prev.map((a) => (a.id === editingApplication.id ? data.application : a))
          );
          if (formStatus === 'offer') triggerConfetti();
        }
      } else {
        // Create
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: formCompany.trim(),
            role: formRole.trim(),
            applied_date: formAppliedDate,
            status: formStatus,
            point_of_contact: formPointOfContact.trim() || null,
            interview_date: formInterviewDate || null,
            comment: formComment.trim() || null,
            location: formLocation.trim() || null,
            job_url: formJobUrl.trim() || null,
            salary_range: formSalaryRange.trim() || null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setApplications((prev) => [data.application, ...prev]);
          if (formStatus === 'offer') triggerConfetti();
        }
      }

      setIsModalOpen(false);
      onRefreshMetrics?.();
    } catch (err) {
      console.error('Failed to save application:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    if (newStatus === 'offer') triggerConfetti();

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefreshMetrics?.();
    } catch (err) {
      console.error('Failed to update application status:', err);
      loadApplications();
    }
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`Delete application for ${company}?`)) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      try {
        await fetch(`/api/applications/${id}`, { method: 'DELETE' });
        onRefreshMetrics?.();
      } catch (err) {
        console.error('Failed to delete application:', err);
        loadApplications();
      }
    }
  };

  // Metrics computation
  const totalCount = applications.length;
  const activeCount = applications.filter((a) => !['rejected', 'withdrawn', 'offer'].includes(a.status)).length;
  const interviewCount = applications.filter((a) =>
    ['screening', 'technical', 'system_design', 'onsite'].includes(a.status)
  ).length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const upcomingInterviews = applications.filter((a) => {
    if (!a.interview_date) return false;
    const d = new Date(a.interview_date).getTime();
    return d >= Date.now() - 24 * 60 * 60 * 1000;
  });

  // Filter list
  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter === 'active' && ['rejected', 'withdrawn', 'offer'].includes(app.status)) return false;
    if (statusFilter === 'interviews' && !['screening', 'technical', 'system_design', 'onsite'].includes(app.status)) return false;
    if (statusFilter === 'offer' && app.status !== 'offer') return false;
    if (statusFilter === 'rejected' && app.status !== 'rejected') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = app.company.toLowerCase().includes(q);
      const matchRole = app.role.toLowerCase().includes(q);
      const matchContact = app.point_of_contact?.toLowerCase().includes(q);
      const matchComment = app.comment?.toLowerCase().includes(q);
      const matchLocation = app.location?.toLowerCase().includes(q);
      return matchCompany || matchRole || matchContact || matchComment || matchLocation;
    }

    return true;
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${year}-${month}-${day}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatInterviewDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: dateStr.includes('T') ? 'numeric' : undefined,
        minute: dateStr.includes('T') ? '2-digit' : undefined,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Quick Action */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0d101d] via-[#101426] to-[#0c0e18] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Career Pipeline
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Job Application Tracker</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Company Applications & Interview Loop</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Track applied companies, recruiter contacts, technical interview dates, notes, and offer negotiation status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Application</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Total Applied</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Active pipeline: {activeCount}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>In Interview Loop</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1.5">{interviewCount}</div>
          <div className="text-[11px] text-cyan-400/80 mt-0.5 font-mono">Screen / Tech / Onsite</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1.5">
            {upcomingInterviews.length}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-0.5 font-mono">Upcoming rounds</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Offers</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1.5">{offerCount}</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5 font-mono">Celebration target!</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/90 bg-[#0c0e15] shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Rejected / Closed</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300 mt-1.5">{rejectedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Keep going!</div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800/80 bg-[#0c0e15]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, recruiter, notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Active Pipeline ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('interviews')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              statusFilter === 'interviews'
                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Interviews ({interviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('offer')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              statusFilter === 'offer'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Offers ({offerCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* 4. Applications Table */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#0c0e15] shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-mono text-xs">
            Loading job applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">No applications found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No tracked applications match your current filters. Try resetting the search or filter.'
                : 'You have not added any job applications yet. Click below to add your first company application.'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all inline-flex items-center gap-1.5 shadow-md shadow-violet-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Application</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#080a11] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-bold">Company & Role</th>
                  <th className="py-3.5 px-4 font-bold">Applied Date</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Point of Contact</th>
                  <th className="py-3.5 px-4 font-bold">Interview Date</th>
                  <th className="py-3.5 px-4 font-bold">Comment / Notes</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredApplications.map((app) => {
                  const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                  const formattedInterview = formatInterviewDateTime(app.interview_date);
                  const isInterviewNear =
                    app.interview_date &&
                    new Date(app.interview_date).getTime() >= Date.now() - 24 * 60 * 60 * 1000 &&
                    new Date(app.interview_date).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Company & Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-xs text-violet-300 font-mono shadow-sm flex-shrink-0">
                            {app.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{app.company}</span>
                              {app.job_url && (
                                <a
                                  href={app.job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-violet-400 transition-colors"
                                  title="Open job link"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{app.role || 'Software Engineer'}</span>
                              {app.location && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="flex items-center gap-0.5 text-slate-400">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {app.location}
                                  </span>
                                </>
                              )}
                              {app.salary_range && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="flex items-center gap-0.5 text-emerald-400/90 font-mono">
                                    <DollarSign className="w-2.5 h-2.5" />
                                    {app.salary_range}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(app.applied_date)}</span>
                        </div>
                      </td>

                      {/* Status (Interactive Quick Selector) */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            className={`text-[11px] font-semibold font-mono py-1 pl-2.5 pr-6 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${statusConf.badgeColor}`}
                          >
                            <option value="applied" className="bg-[#0f121d] text-white">
                              Applied
                            </option>
                            <option value="screening" className="bg-[#0f121d] text-white">
                              Recruiter Screen
                            </option>
                            <option value="technical" className="bg-[#0f121d] text-white">
                              Technical Round
                            </option>
                            <option value="system_design" className="bg-[#0f121d] text-white">
                              System Design
                            </option>
                            <option value="onsite" className="bg-[#0f121d] text-white">
                              Onsite / Final
                            </option>
                            <option value="offer" className="bg-[#0f121d] text-white">
                              Offer Received 🎉
                            </option>
                            <option value="rejected" className="bg-[#0f121d] text-white">
                              Rejected
                            </option>
                            <option value="withdrawn" className="bg-[#0f121d] text-white">
                              Withdrawn
                            </option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Point of Contact */}
                      <td className="py-3 px-4 text-xs">
                        {app.point_of_contact ? (
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <User className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{app.point_of_contact}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">None listed</span>
                        )}
                      </td>

                      {/* Interview Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formattedInterview ? (
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                              isInterviewNear
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{formattedInterview}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">None</span>
                        )}
                      </td>

                      {/* Comment / Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        {app.comment ? (
                          <div
                            className="text-xs text-slate-300 line-clamp-2"
                            title={app.comment}
                          >
                            {app.comment}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit application"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id, app.company)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                            title="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e111a] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0a0c13]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingApplication ? 'Edit Job Application' : 'Track New Job Application'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Stripe"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. SDE2 Backend Engineer"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Applied Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formAppliedDate}
                    onChange={(e) => setFormAppliedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Recruiter Screen</option>
                    <option value="technical">Technical Round</option>
                    <option value="system_design">System Design</option>
                    <option value="onsite">Onsite / Final</option>
                    <option value="offer">Offer Received 🎉</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              {/* Point of Contact & Interview Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Point of Contact
                  </label>
                  <input
                    type="text"
                    value={formPointOfContact}
                    onChange={(e) => setFormPointOfContact(e.target.value)}
                    placeholder="Recruiter name, email, or LinkedIn"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Interview Date (if any)
                  </label>
                  <input
                    type="datetime-local"
                    value={formInterviewDate}
                    onChange={(e) => setFormInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Location & Salary Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Location / Work Mode
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote / Seattle / Hybrid"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Salary Range / Compensation
                  </label>
                  <input
                    type="text"
                    value={formSalaryRange}
                    onChange={(e) => setFormSalaryRange(e.target.value)}
                    placeholder="e.g. $180k - $210k"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Job URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  placeholder="https://company.com/careers/..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Comments & Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Comments & Interview Notes
                </label>
                <textarea
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Interviewer notes, questions asked, prep focus, feedback..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingApplication ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
