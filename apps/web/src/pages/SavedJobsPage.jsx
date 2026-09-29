import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import JobCard from '../components/jobs/JobCard';
import {
  Bookmark, Search, SlidersHorizontal, Trash2, ExternalLink,
  Sparkles, FolderOpen, ArrowRight
} from 'lucide-react';

export default function SavedJobsPage() {
  const { jobs, toggleSaveJob } = useCareer();
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match'); // match, date, company
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, [jobs]);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/v1/saved-jobs');
      const data = await res.json();
      if (data.success) {
        setSavedJobs(data.data);
      }
    } catch {
      // Fallback: filter from jobs list
      setSavedJobs(jobs.filter(j => j.isSaved));
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    await toggleSaveJob(jobId);
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
  };

  // Filter & sort
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-accent-amber" />
            Saved Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved jobs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="date">Latest</option>
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
        <div className="glass-panel rounded-2xl p-16 border border-white/10 text-center">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">
            {searchQuery ? 'No matching saved jobs' : 'No saved jobs yet'}
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Bookmark jobs while exploring to save them here for quick access and comparison.'}
          </p>
          {!searchQuery && (
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold shadow-glow-primary hover:opacity-95 transition-all"
            >
              Explore Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        /* Job Grid */
        <div className="space-y-4">
          {displayJobs.map(job => (
            <div key={job.id} className="glass-panel-interactive rounded-2xl p-5 border border-white/10 group">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/jobs/${job.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Company Logo Placeholder */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-cyan/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-brand-300">{job.company.charAt(0)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white truncate">{job.title}</h3>
                      {job.matchScore && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          job.matchScore >= 85 ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30' :
                          job.matchScore >= 70 ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30' :
                          'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{job.company} • {job.location}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.required_skills || []).slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[10px] text-slate-400 font-medium">
                          {skill}
                        </span>
                      ))}
                      {(job.required_skills || []).length > 4 && (
                        <span className="text-[10px] text-slate-500">+{job.required_skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); handleUnsave(job.id); }}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-all"
                    title="View details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                  {job.work_mode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                  {job.salary_range}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                  via {job.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
