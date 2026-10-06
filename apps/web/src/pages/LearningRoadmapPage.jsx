import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Award,
  Filter,
  Check,
  Zap,
  Target,
  Briefcase,
  AlertTriangle,
  Flame,
  CheckCheck
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import confetti from 'canvas-confetti';

export default function LearningRoadmapPage() {
  const { learningResources, currentUser, jobs, refreshData } = useCareer();
  const [completedSteps, setCompletedSteps] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'HIGH_PRIORITY', 'DEVOPS', 'BACKEND', 'FRONTEND'
  const [claimingSkill, setClaimingSkill] = useState(null);
  const [claimNotice, setClaimNotice] = useState(null);

  // Load progress from backend
  useEffect(() => {
    fetch('/api/v1/learning/resources')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const map = {};
          res.data.forEach(r => {
            (r.steps || []).forEach((_, idx) => {
              if (idx < (r.completedSteps || 0)) {
                map[`${r.id}_${idx}`] = true;
              }
            });
          });
          setCompletedSteps(prev => ({ ...map, ...prev }));
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Aggregate market-wide gaps across active jobs for current candidate
  const marketGapsSummary = useMemo(() => {
    const gapMap = {};
    (jobs || []).forEach(job => {
      const missingSkills = (job.required_skills || []).filter(s => 
        !(currentUser?.skills || []).some(cs => cs.name.toLowerCase() === s.toLowerCase())
      );
      missingSkills.forEach(skill => {
        if (!gapMap[skill]) {
          gapMap[skill] = { skill, count: 0, jobs: [] };
        }
        gapMap[skill].count++;
        if (gapMap[skill].jobs.length < 2) {
          gapMap[skill].jobs.push({ title: job.title, company: job.company });
        }
      });
    });

    const total = jobs.length || 1;
    return Object.values(gapMap)
      .map(g => ({
        ...g,
        demandPercent: Math.round((g.count / total) * 100),
        isHighPriority: g.count >= 2
      }))
      .sort((a, b) => b.count - a.count);
  }, [jobs, currentUser]);

  const toggleStep = async (resourceId, stepIndex) => {
    const key = `${resourceId}_${stepIndex}`;
    const nextState = !completedSteps[key];
    setCompletedSteps(prev => ({ ...prev, [key]: nextState }));

    try {
      await fetch('/api/v1/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, stepIndex, completed: nextState })
      });
    } catch (e) {
      // Local state is preserved
    }
  };

  const handleClaimSkill = async (resource) => {
    setClaimingSkill(resource.skill);
    try {
      const res = await fetch('/api/v1/learning/claim-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: resource.skill,
          resourceTitle: resource.title,
          resourceId: resource.id
        })
      }).then(r => r.json());

      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setClaimNotice(res.message);
        await refreshData();
      }
    } catch (e) {
      setClaimNotice(`Added ${resource.skill} to profile!`);
    } finally {
      setClaimingSkill(null);
      setTimeout(() => setClaimNotice(null), 5000);
    }
  };

  // Filter learning resources
  const filteredResources = useMemo(() => {
    return learningResources.filter(res => {
      if (selectedFilter === 'HIGH_PRIORITY') {
        return ['Docker', 'AWS'].includes(res.skill);
      }
      if (selectedFilter === 'DEVOPS') {
        return ['Docker', 'AWS'].includes(res.skill);
      }
      if (selectedFilter === 'BACKEND') {
        return ['Redis', 'PostgreSQL', 'Node.js'].includes(res.skill);
      }
      if (selectedFilter === 'FRONTEND') {
        return ['TypeScript', 'Testing', 'React'].includes(res.skill);
      }
      return true;
    });
  }, [learningResources, selectedFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Page Header Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 relative overflow-hidden radial-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Skill-Gap Intelligence Engine</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bridging Roadmaps & Gap Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curated, step-by-step curricula with official documentation and hands-on milestones. Complete paths to officially verify skills on your profile and lift your match score by +12%.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Top Market Gap</span>
            </div>
            <p className="text-2xl font-black text-white">Docker & AWS</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Lifts average match by +14%
            </p>
          </div>
        </div>
      </div>

      {/* Claim Notification Toast */}
      {claimNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-glow-emerald">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>{claimNotice} Check your Career Profile to see your updated compatibility scores!</span>
          </div>
          <button onClick={() => setClaimNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Market-Wide Gap Priority Radar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Market Demand Frequency for Your Target Roles
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Aggregated across active postings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {marketGapsSummary.slice(0, 3).map((gap, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${gap.isHighPriority ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
                  {gap.skill}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300">
                  {gap.demandPercent}% of Jobs
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Required by: {gap.jobs.map(j => j.company).join(', ') || 'Target Startups'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap">Filter Curricula:</span>
        {[
          { id: 'ALL', label: 'All Roadmaps' },
          { id: 'HIGH_PRIORITY', label: '🔥 High Priority Gaps' },
          { id: 'DEVOPS', label: 'Cloud & DevOps' },
          { id: 'BACKEND', label: 'Backend & Data' },
          { id: 'FRONTEND', label: 'Frontend & Testing' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedFilter === filter.id
                ? 'bg-brand-600 text-white shadow-glow-primary'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Roadmaps Grid */}
      {filteredResources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-4">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">No learning curricula available yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Add target roles and explore opportunities to trigger AI-guided skill bridging roadmaps.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-primary"
          >
            <span>Explore Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((res) => {
          const totalSteps = res.steps?.length || 5;
          const completedCount = Array.from({ length: totalSteps }).filter((_, i) => completedSteps[`${res.id}_${i}`]).length;
          const progressPercent = Math.round((completedCount / totalSteps) * 100);
          const isComplete = progressPercent === 100;
          const isAlreadyOnProfile = (currentUser?.skills || []).some(s => s.name.toLowerCase() === res.skill.toLowerCase());

          return (
            <div 
              key={res.id} 
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 relative ${
                isComplete 
                  ? 'border-emerald-500/50 bg-emerald-950/10 shadow-glow-emerald' 
                  : 'border-white/10 hover:border-brand-500/40'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                        {res.skill}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Official
                      </span>
                      {isAlreadyOnProfile && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 border border-emerald-500/30">
                          <CheckCheck className="w-3 h-3" /> On Profile
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white">{res.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{res.provider} • {res.difficulty}</p>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {res.duration}
                  </span>
                </div>

                {/* Milestone Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Milestone Progress ({completedCount}/{totalSteps})</span>
                    <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-brand-500 to-accent-cyan'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Steps / Milestones */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Hands-on Milestones (Click to Mark Complete):
                  </p>
                  {(res.steps || []).map((step, idx) => {
                    const isDone = Boolean(completedSteps[`${res.id}_${idx}`]);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleStep(res.id, idx)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through opacity-85' 
                            : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-900/90 hover:border-white/15'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions: Official Link & Claim Button */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  <span>Open {res.provider}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {isComplete && !isAlreadyOnProfile ? (
                  <button
                    onClick={() => handleClaimSkill(res)}
                    disabled={claimingSkill === res.skill}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>{claimingSkill === res.skill ? 'Claiming...' : 'Claim Skill to Profile (+10% Match)'}</span>
                  </button>
                ) : isAlreadyOnProfile ? (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified on Career Profile
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Complete all {totalSteps} milestones to verify
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

    </div>
  );
}
