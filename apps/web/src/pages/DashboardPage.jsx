import React from 'react';
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
  Calendar
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
    setActiveJobForAnalysis
  } = useCareer();

  const profileStrength = currentUser?.profileStrength?.score || 85;
  const checklist = currentUser?.profileStrength?.checklist || {
    personal: true,
    skills: true,
    education: true,
    experience: true,
    projects: true,
    preferences: true
  };

  // High match jobs (80%+)
  const recommendedJobs = jobs.filter(j => (j.matchScore || 0) >= 80).slice(0, 3);
  const activeApplicationsCount = applications.filter(a => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length;
  const interviewsCount = applications.filter(a => a.status === 'INTERVIEW').length;

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
          <p className="text-[11px] text-slate-400">HyperLocal Tech (Thu)</p>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Personal Contact Info
              </span>
              <span className="text-emerald-400 font-semibold">Done</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Categorized Skills (10+)
              </span>
              <span className="text-emerald-400 font-semibold">Done</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Projects with GitHub Links
              </span>
              <span className="text-emerald-400 font-semibold">2 Listed</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Education & Degree
              </span>
              <span className="text-emerald-400 font-semibold">Verified</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Work / Internship Experience
              </span>
              <span className="text-emerald-400 font-semibold">Added</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Docker Gap */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Docker</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                    High Gap
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Required in 80% of Full Stack roles. Containerize Node APIs & build docker-compose.
                </p>
              </div>
              <Link
                to="/learning"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
              >
                <span>3h Guided Path</span> <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* AWS Cloud */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">AWS Cloud</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                    Medium
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Preferred qualification for FinFlow & CogniMesh. Master EC2, S3, and IAM basics.
                </p>
              </div>
              <Link
                to="/learning"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
              >
                <span>6h Hands-on</span> <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Redis Caching */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Redis</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                    Medium
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  High-speed caching & queues. Boost backend throughput for REST endpoints.
                </p>
              </div>
              <Link
                to="/learning"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
              >
                <span>4h Official Course</span> <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAnalyze={(j) => setActiveJobForAnalysis(j)}
            />
          ))}
        </div>
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
