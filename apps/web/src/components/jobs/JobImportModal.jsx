import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Link as LinkIcon, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import MatchScoreBadge from '../ui/MatchScoreBadge';

export default function JobImportModal({ isOpen, onClose, onJobIngested }) {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [rawText, setRawText] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleQuickSample = (sampleType) => {
    setError('');
    setResult(null);
    if (sampleType === 'linkedin') {
      setSource('LinkedIn');
      setUrl('https://www.linkedin.com/jobs/view/3982104928');
      setRawText('Frontend Engineer at Swiggy Tech in Bangalore. Required: React, TypeScript, Tailwind CSS, Redux. Preferred: Next.js, GraphQL.');
    } else if (sampleType === 'naukri') {
      setSource('Naukri');
      setUrl('https://www.naukri.com/job-listings-full-stack-developer-paytm-hyderabad-392810');
      setRawText('Full Stack Developer (React + Node) at Paytm in Hyderabad. Required: React, Node.js, PostgreSQL, REST APIs. Preferred: Docker, Redis.');
    } else if (sampleType === 'indeed') {
      setSource('Indeed');
      setUrl('https://in.indeed.com/viewjob?jk=98a72bc1940ef');
      setRawText('Associate Cloud Software Engineer at ThoughtWorks in Pune. Required: JavaScript, React, Python, PostgreSQL. Preferred: AWS, Docker.');
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!url.trim() && !rawText.trim()) {
      setError('Please provide a job posting URL or paste job description text.');
      return;
    }

    setIsIngesting(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/v1/jobs/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          rawText: rawText.trim(),
          source
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to ingest job listing.');
      }

      setResult(data.data);
      if (onJobIngested) onJobIngested(data.data);
    } catch (err) {
      setError(err.message || 'Error processing job ingestion.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl glass-panel rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Multi-Source Ingestion Pipeline</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ingest Job from Portals
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Import a live listing from LinkedIn, Naukri, or Indeed. CareerLens normalizes the schema, runs SHA-256 deduplication, and scores it against your candidate profile.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try Quick Sample Listing:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickSample('linkedin')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0077b5]/20 text-[#38bdf8] border border-[#0077b5]/30 hover:bg-[#0077b5]/30 transition-all"
            >
              + LinkedIn (Swiggy)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSample('naukri')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              + Naukri (Paytm)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSample('indeed')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
            >
              + Indeed (ThoughtWorks)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleIngest} className="mt-5 space-y-4">
          
          {/* Source Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Portal Source
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['LinkedIn', 'Naukri', 'Indeed', 'Wellfound'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    source === s 
                      ? 'bg-brand-600 text-white border-brand-500 shadow-glow-primary' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Job URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Job URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Raw Text / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Job Description / Requirements (Optional)
            </label>
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste job title, company name, skills, or job description excerpt..."
              className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ingest Action Button */}
          <button
            type="submit"
            disabled={isIngesting}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 shadow-glow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isIngesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting & Matching to Profile...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Ingest & Match to My Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Ingestion Result Display */}
        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">Successfully Ingested!</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-white/10 text-slate-200">
                {result.source}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{result.title}</h4>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{result.company}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{result.location}</span>
                </p>
              </div>
              <div className="flex flex-col items-end">
                <MatchScoreBadge score={result.matchScore || 85} size="md" />
                <span className="text-[10px] text-slate-400 mt-1">Profile Compatibility</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              This job has been added to your candidate feed with live skill breakdown and is ready for exploration or 1-click application tracking.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Done & Return to Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
