import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Bookmark, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import MatchScoreBadge from '../ui/MatchScoreBadge';
import { useCareer } from '../../context/CareerContext';

export default function JobCard({ job, onAnalyze }) {
  const { toggleSaveJob, trackApplication } = useCareer();

  const getSourceBadge = (source) => {
    const s = source?.toLowerCase() || '';
    if (s === 'company careers' || s.includes('career') || s.includes('portal') || s.includes('direct')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    switch (s) {
      case 'linkedin':
        return 'bg-[#0077b5]/20 text-[#38bdf8] border-[#0077b5]/40';
      case 'naukri':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'indeed':
        return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
      case 'wellfound':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
    }
  };

  const getApplyButtonDetails = (source, company) => {
    const s = source?.toLowerCase() || '';
    if (s === 'company careers' || s.includes('career') || s.includes('portal') || s.includes('direct')) {
      return {
        label: company ? `Apply on ${company}` : 'Apply on Company Site',
        className: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 shadow-lg'
      };
    }
    switch (s) {
      case 'linkedin':
        return {
          label: 'Apply on LinkedIn',
          className: 'bg-[#0077b5] hover:bg-[#006097] text-white shadow-[#0077b5]/30 shadow-lg'
        };
      case 'naukri':
        return {
          label: 'Apply on Naukri',
          className: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 shadow-lg'
        };
      case 'indeed':
        return {
          label: 'Apply on Indeed',
          className: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 shadow-lg'
        };
      case 'wellfound':
        return {
          label: 'Apply on Wellfound',
          className: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 shadow-lg'
        };
      default:
        return {
          label: `Apply on ${company || source || 'Source'}`,
          className: 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-primary'
        };
    }
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

  const postedInfo = getRelativePostedTime(job.posted_at);
  const applyBtn = getApplyButtonDetails(job.source, job.company);

  return (
    <div className="group glass-panel-interactive rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-brand-500/40 relative">
      
      {/* Top Header: Company, Source, Save Button */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-brand-300 font-bold text-lg shadow-inner">
              {job.company?.[0] || 'C'}
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.company}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveJob(job.id)}
              className={`p-2 rounded-xl border transition-all ${
                job.isSaved 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-glow-amber' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={job.isSaved ? "Saved" : "Save job"}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Badges: Location, Work Mode, Salary, Source, and Posted Date */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-slate-300">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.location}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-medium text-slate-300">
            {job.work_mode}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {job.salary_min} – {job.salary_max}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSourceBadge(job.source)}`}>
            {job.source}
          </span>
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

        {/* AI Match Overview */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MatchScoreBadge score={job.matchScore || 85} size="md" />
            <button
              onClick={() => onAnalyze && onAnalyze(job)}
              className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              Why {job.matchScore || 85}%?
            </button>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Active Role
          </span>
        </div>

        {/* Key Skills breakdown */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(job.required_skills || []).slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300 flex items-center gap-1 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {skill}
              </span>
            ))}
            {(job.preferred_skills || []).slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1 font-medium"
              >
                <AlertCircle className="w-3 h-3 text-amber-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
        >
          View Details
        </Link>
        
        <button
          onClick={() => onAnalyze && onAnalyze(job)}
          className="py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 font-semibold text-xs border border-brand-500/30 transition-colors flex items-center gap-1.5"
          title="Analyze match & skill gap breakdown"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Analyze</span>
        </button>

        <a
          href={job.source_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackApplication(job.id, 'APPLIED', `Applied directly via ${job.source} redirect.`);
          }}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${applyBtn.className}`}
          title={`Apply on ${job.source}`}
        >
          <span>{applyBtn.label}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
