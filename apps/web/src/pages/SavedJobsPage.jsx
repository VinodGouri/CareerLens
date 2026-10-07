import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import {
  Bookmark, Search, Trash2, ExternalLink,
  FolderOpen, ArrowRight, Sparkles, Calendar, Building2, MapPin
} from 'lucide-react';

export default function SavedJobsPage() {
  const { jobs, toggleSaveJob, trackApplication } = useCareer();
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match'); // match, date, company
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/v1/saved-jobs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSavedJobs(data.data);
      } else {
        setSavedJobs(jobs.filter(j => j.isSaved));
      }
    } catch {
      // Fallback: filter from jobs list
      setSavedJobs(jobs.filter(j => j.isSaved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [jobs]);

  const handleUnsave = async (jobId) => {
    await toggleSaveJob(jobId);
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const getRelativePostedTime = (dateStr) => {
    if (!dateStr) return { label: 'Recently', isToday: false };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.round(diffMs / (1000 * 3600));
    const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

    if (diffHours < 1) return { label: 'Posted Just Now', isToday: true };
    if (diffHours <= 12 || date.toDateString() === now.toDateString()) {
      return { label: 'Posted Today', isToday: true };
    }
    if (diffHours <= 36 || diffDays === 1) {
      return { label: 'Posted Yesterday', isToday: false };
    }
    if (diffDays <= 3) {
      return { label: `Posted ${diffDays}d ago`, isToday: false };
    }
    if (diffDays <= 7) {
      return { label: 'Posted 1w ago', isToday: false };
    }
    if (diffDays <= 14) {
      return { label: 'Posted 2w ago', isToday: false };
    }
    return { label: `Posted ${diffDays}d ago`, isToday: false };
  };

  const getApplyButtonDetails = (source) => {
    switch (source?.toLowerCase()) {
      case 'linkedin':
        return {
          label: 'Apply on LinkedIn',
          className: 'bg-[#0077b5] hover:bg-[#006097] text-white shadow-[#0077b5]/30'
        };
      case 'naukri':
        return {
          label: 'Apply on Naukri',
          className: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
        };
      case 'indeed':
        return {
          label: 'Apply on Indeed',
          className: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
        };
      case 'wellfound':
        return {
          label: 'Apply on Wellfound',
          className: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
        };
      default:
        return {
          label: `Apply on ${source || 'Source'}`,
          className: 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-primary'
        };
    }
  };

  // Filter & sort (CRITICAL: Saved jobs are NEVER purged or hidden by date filters!)
  let displayJobs = [...savedJobs];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayJobs = displayJobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.required_skills || []).some(s => s.toLowerCase().includes(q))
    );
  }

  if (sortBy === 'match') {
    displayJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sortBy === 'date') {
    displayJobs.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
  } else if (sortBy === 'company') {
    displayJobs.sort((a, b) => a.company.localeCompare(b.company));
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-accent-amber fill-accent-amber" />
            Saved Opportunities
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {savedJobs.length} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All your saved bookmarked opportunities stay safely in your account regardless of when they were posted (even 1 week or 1 month ago).
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved jobs..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="date">Most Recent</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-6 border border-white/10 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayJobs.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-16 border border-white/10 text-center space-y-4">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">
            {searchQuery ? 'No matching saved jobs' : 'No saved jobs yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Bookmark jobs while exploring. They will remain securely in your app even if posted a week or month ago.'}
          </p>
          {!searchQuery && (
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold shadow-glow-primary hover:opacity-95 transition-all"
            >
              Explore Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        /* Job Cards List */
        <div className="space-y-4">
          {displayJobs.map(job => {
            const postedInfo = getRelativePostedTime(job.posted_at);
            const applyBtn = getApplyButtonDetails(job.source);

            return (
              <div key={job.id} className="glass-panel-interactive rounded-2xl p-5 border border-white/10 group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <Link to={`/jobs/${job.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Company Logo Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-brand-300 font-bold text-lg shadow-inner flex-shrink-0">
                      {job.company?.[0] || 'C'}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                          {job.title}
                        </h3>
                        {job.matchScore && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            job.matchScore >= 85 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            job.matchScore >= 70 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                            'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                          }`}>
                            {job.matchScore}% Match
                          </span>
                        )}
                        {postedInfo.isToday ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                            {postedInfo.label}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-400 border border-white/5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-500" />
                            {postedInfo.label}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{job.salary_min} – {job.salary_max}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(job.required_skills || []).slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={(e) => { e.preventDefault(); handleUnsave(job.id); }}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
                      title="View full details"
                    >
                      Details
                    </Link>

                    {/* Direct Apply Button */}
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackApplication(job.id, 'APPLIED', `Applied directly via ${job.source} redirect from saved jobs.`);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-md ${applyBtn.className}`}
                      title={`Apply on ${job.source}`}
                    >
                      <span>{applyBtn.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Footer tags */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                    {job.work_mode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                    via {job.source}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Persisted in app • Posted: {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
