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
  Clock
} from 'lucide-react';
import MatchScoreBadge from '../ui/MatchScoreBadge';
import { useCareer } from '../../context/CareerContext';

export default function JobCard({ job, onAnalyze }) {
  const { toggleSaveJob, trackApplication } = useCareer();

  const getSourceBadge = (source) => {
    switch (source?.toLowerCase()) {
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

        {/* Badges: Location, Work Mode, Salary, Source */}
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
            Active
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
          className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-1"
          title={`Apply on ${job.source}`}
        >
          <span>Apply</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </div>
  );
}
