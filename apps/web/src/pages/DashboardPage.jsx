import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  Bookmark, 
  CheckSquare, 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen,
  Briefcase,
  CheckCircle2,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import JobCard from '../components/jobs/JobCard';
import MatchExplanationModal from '../components/jobs/MatchExplanationModal';

export default function DashboardPage() {
  const { 
    currentUser, 
    jobs, 
    applications, 
    savedJobs, 
    setIsAIChatOpen,
    activeJobForAnalysis,
    setActiveJobForAnalysis,
    refreshData
  } = useCareer();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/v1/jobs/sync-candidate-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 12 })
      });
      await refreshData();
    } catch (e) {
      console.warn("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const profileStrength = currentUser?.profileStrength?.score ?? (currentUser ? 30 : 0);
  const checklist = currentUser?.profileStrength?.checklist || {
    personal: Boolean(currentUser?.name && currentUser?.email),
    skills: (currentUser?.skills || []).length >= 5,
    education: (currentUser?.education || []).length >= 1,
    experience: (currentUser?.experience || []).length >= 1,
    projects: (currentUser?.projects || []).length >= 2,
    preferences: Boolean((currentUser?.preferred_roles || []).length > 0)
  };

  // High match jobs (80%+)
  const recommendedJobs = jobs.filter(j => (j.matchScore || 0) >= 80).slice(0, 3);
  const activeApplicationsCount = applications.filter(a => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length;
  const interviewsCount = applications.filter(a => a.status === 'INTERVIEW').length;

  // Dynamically compute high-impact skill gaps from market jobs
  const marketGaps = useMemo(() => {
    const gapMap = {};
    const userSkills = (currentUser?.skills || []).map(s => (s.name || '').toLowerCase());
    (jobs || []).forEach(job => {
      (job.required_skills || []).forEach(s => {
        if (!userSkills.includes(s.toLowerCase())) {
          gapMap[s] = (gapMap[s] || 0) + 1;
        }
      });
    });
    return Object.entries(gapMap)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [jobs, currentUser]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 radial-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Career Intelligence Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-accent-cyan bg-clip-text text-transparent">{currentUser?.name?.split(' ')[0] || 'Engineer'}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are currently targeting <strong className="text-white">{(currentUser?.preferred_roles || ['Full Stack Developer'])[0]}</strong> roles in <strong className="text-white">{currentUser?.location || 'Hyderabad, India'}</strong>. Your profile currently matches with {jobs.length} curated opportunities across LinkedIn, Indeed, and Naukri.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Top Matches</span>
            </Link>
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Recommended Jobs */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">High Matches (&gt;80%)</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{jobs.filter(j => j.matchScore >= 80).length}</p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Ready for your profile
          </p>
        </div>

        {/* Saved Jobs */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Saved Jobs</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{jobs.filter(j => j.isSaved).length}</p>
          <Link to="/jobs" className="text-[11px] text-brand-300 hover:underline flex items-center gap-1">
            Review shortlisted <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Applications */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tracked Applications</span>
            <CheckSquare className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{activeApplicationsCount}</p>
          <Link to="/applications" className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1">
            View status tracker <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Interviews */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{interviewsCount}</p>
          <p className="text-[11px] text-slate-400">
            {interviewsCount > 0 ? `${interviewsCount} scheduled` : 'No active interviews'}
          </p>
        </div>

      </div>

      {/* Main Grid: Profile Completeness Meter & Top Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Strength Indicator (PRD Section 17) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Profile Completeness
            </h2>
            <span className="text-sm font-extrabold text-brand-300">{profileStrength}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-brand-500 via-indigo-400 to-accent-cyan h-full rounded-full transition-all duration-700 shadow-glow-primary"
              style={{ width: `${profileStrength}%` }}
            />
          </div>

          {/* Actionable Checklist */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${checklist.personal ? 'text-emerald-400' : 'text-slate-500'}`} /> Personal Contact Info
              </span>
              <span className={checklist.personal ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {checklist.personal ? 'Complete' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${checklist.skills ? 'text-emerald-400' : 'text-slate-500'}`} /> Categorized Skills (5+)
              </span>
              <span className={checklist.skills ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {(currentUser?.skills || []).length} Added
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${checklist.projects ? 'text-emerald-400' : 'text-slate-500'}`} /> Projects with GitHub Links
              </span>
              <span className={checklist.projects ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {(currentUser?.projects || []).length} Listed
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${checklist.education ? 'text-emerald-400' : 'text-slate-500'}`} /> Education & Degree
              </span>
              <span className={checklist.education ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {(currentUser?.education || []).length > 0 ? 'Added' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${checklist.experience ? 'text-emerald-400' : 'text-slate-500'}`} /> Work / Internship Experience
              </span>
              <span className={checklist.experience ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {(currentUser?.experience || []).length > 0 ? 'Added' : 'Pending'}
              </span>
            </div>
          </div>

          <Link
            to="/profile"
            className="w-full block text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Edit Career Profile
          </Link>
        </div>

        {/* Top Skill Gaps to Bridge (PRD Section 31 & 35) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                High-Impact Skill Gaps Across Target Roles
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mastering these 3 skills increases average job match score by +14%</p>
            </div>
            <Link to="/learning" className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1">
              All Roadmaps <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {marketGaps.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 text-center space-y-2">
              <BookOpen className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">No skill gaps identified yet</p>
              <p className="text-[11px] text-slate-500">
                Explore jobs or add skills to your profile to generate real-time gap intelligence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {marketGaps.map((gap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{gap.skill}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                        {gap.count} Jobs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      High-demand skill across target listings. Master this skill to boost compatibility.
                    </p>
                  </div>
                  <Link
                    to="/learning"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
                  >
                    <span>View Roadmap</span> <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Top Compatible Job Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Top Recommended Jobs For You
            </h2>
            <p className="text-xs text-slate-400">Scored against your verified skills, projects, and career preferences</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-brand-300 hover:text-brand-200 flex items-center gap-1 hover:underline"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-white/10 space-y-3">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No active job listings yet</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Ingest live job postings from LinkedIn, Naukri & Indeed matched specifically to your skills and target roles.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleQuickSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Ingesting Jobs...' : 'Fetch Jobs from LinkedIn, Naukri & Indeed'}</span>
              </button>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
              >
                <span>Explore Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAnalyze={(j) => setActiveJobForAnalysis(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Match Explanation Modal */}
      {activeJobForAnalysis && (
        <MatchExplanationModal
          job={activeJobForAnalysis}
          onClose={() => setActiveJobForAnalysis(null)}
        />
      )}

    </div>
  );
}
