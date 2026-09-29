import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft,
  Share2,
  Clock,
  BookOpen
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import MatchScoreBadge from '../components/ui/MatchScoreBadge';
import confetti from 'canvas-confetti';

export default function JobDetailPage() {
  const { id } = useParams();
  const { jobs, toggleSaveJob, trackApplication } = useCareer();
  const [job, setJob] = useState(null);
  const [appliedPromptOpen, setAppliedPromptOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    // Fetch detailed job with live match analysis
    fetch(`/api/v1/jobs/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setJob(res.data);
      })
      .catch(() => {
        const found = jobs.find(j => j.id === id);
        if (found) setJob(found);
      });
  }, [id, jobs]);

  if (!job) {
    return (
      <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
        <p>Loading job details and compatibility intelligence...</p>
      </div>
    );
  }

  const analysis = job.matchAnalysis;

  const handleApplyRedirect = () => {
    window.open(job.source_url, '_blank');
    setAppliedPromptOpen(true);
  };

  const confirmApplied = () => {
    trackApplication(job.id, 'APPLIED', `Applied directly on ${job.source}.`);
    setHasApplied(true);
    setAppliedPromptOpen(false);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Back button */}
      <Link 
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore Jobs
      </Link>

      {/* Main Job Header Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 relative overflow-hidden radial-glow">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl font-black text-brand-300 shadow-xl">
              {job.company?.[0] || 'C'}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30 uppercase tracking-wider">
                {job.source} Verified Listing
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>
              <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSaveJob(job.id)}
              className={`p-3 rounded-2xl border transition-all ${
                job.isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={job.isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleApplyRedirect}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-extrabold text-sm shadow-glow-primary transition-all flex items-center gap-2"
            >
              <span>Apply on {job.source}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attribute Pills */}
        <div className="flex flex-wrap gap-2.5 mt-6 text-xs text-slate-300 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-semibold">
            {job.work_mode}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {job.salary_min} – {job.salary_max}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            {job.experience_min === 0 ? "Fresher Friendly (0 YOE)" : `${job.experience_min} - ${job.experience_max} YOE`}
          </span>
        </div>
      </div>

      {/* Applied Confirmation Banner Prompt */}
      {appliedPromptOpen && (
        <div className="p-4 rounded-2xl bg-brand-950/80 border border-brand-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white">Did you complete your application on {job.source}?</h4>
            <p className="text-xs text-slate-300">Mark it as applied so CareerLens tracks your timeline and interview progress.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={confirmApplied}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Yes, Mark as Applied
            </button>
            <button
              onClick={() => setAppliedPromptOpen(false)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
            >
              Not Yet
            </button>
          </div>
        </div>
      )}

      {/* Two-Column Layout: Job Details & AI Match Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview / Description */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Role Overview</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Key Responsibilities</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Qualifications & Requirements</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preferred Qualifications */}
          {job.preferred_qualifications && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Preferred Qualifications</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {job.preferred_qualifications.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right 1 Col: AI Compatibility Intelligence & Skill Gaps */}
        <div className="space-y-6">
          
          {/* Match Score Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-300">AI Compatibility Fit</span>
              <Sparkles className="w-4 h-4 text-accent-cyan" />
            </div>

            <div className="flex items-center justify-center py-2">
              <MatchScoreBadge score={job.matchScore || analysis?.overallScore || 85} size="lg" />
            </div>

            {analysis && (
              <p className="text-xs text-slate-300 text-center leading-relaxed">
                {analysis.explanation.summary}
              </p>
            )}

            {/* Sub-scores */}
            {analysis && (
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Required Skills (40%)</span>
                  <span className="font-bold text-white">{analysis.scoreBreakdown.requiredSkillsScore}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Experience Alignment (15%)</span>
                  <span className="font-bold text-white">{analysis.scoreBreakdown.experienceScore}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Project Relevance (10%)</span>
                  <span className="font-bold text-white">{analysis.scoreBreakdown.projectRelevanceScore}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Location / Mode (5%)</span>
                  <span className="font-bold text-white">{analysis.scoreBreakdown.locationScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Skill Gaps Card */}
          {analysis && analysis.skillGaps.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Target Skill Gaps
                </h3>
                <Link to="/learning" className="text-xs text-brand-400 hover:underline">
                  Roadmaps
                </Link>
              </div>

              <div className="space-y-2.5">
                {analysis.skillGaps.map((gap, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{gap.skill}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        gap.importance === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {gap.importance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{gap.reason}</p>
                    <Link
                      to="/learning"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-cyan hover:underline mt-1"
                    >
                      <BookOpen className="w-3 h-3" /> Explore Guided Path
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 text-center">
            <h3 className="text-sm font-bold text-white">Ready to Apply?</h3>
            <p className="text-xs text-slate-400">
              Apply directly on {job.source}. CareerLens will help you track responses and interview rounds.
            </p>
            <button
              onClick={handleApplyRedirect}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              <span>Apply on {job.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
