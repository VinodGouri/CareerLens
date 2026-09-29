import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle,
  FolderGit2,
  Briefcase,
  Check,
  Sliders,
  PlusCircle,
  MinusCircle,
  Lightbulb
} from 'lucide-react';
import MatchScoreBadge from '../ui/MatchScoreBadge';
import { Link } from 'react-router-dom';

export default function MatchExplanationModal({ job, onClose }) {
  if (!job || !job.matchAnalysis) return null;

  const [activeTab, setActiveTab] = useState('anatomy'); // 'anatomy', 'taxonomy', 'simulator', 'action_plan'
  const [selectedPreset, setSelectedPreset] = useState('standard'); // 'standard', 'skill_heavy', 'project_heavy'
  const [simulatedSkills, setSimulatedSkills] = useState([]);

  const baseAnalysis = job.matchAnalysis;

  // Weight Presets
  const WEIGHT_PRESETS = {
    standard: {
      name: 'Standard PRD Formula',
      weights: { requiredSkills: 0.40, preferredSkills: 0.15, experience: 0.15, roleAlignment: 0.10, projectRelevance: 0.10, location: 0.05, education: 0.05 }
    },
    skill_heavy: {
      name: 'Technical Skills Focus (55%)',
      weights: { requiredSkills: 0.45, preferredSkills: 0.15, experience: 0.10, roleAlignment: 0.10, projectRelevance: 0.10, location: 0.05, education: 0.05 }
    },
    project_heavy: {
      name: 'Hands-on Projects Focus (25%)',
      weights: { requiredSkills: 0.35, preferredSkills: 0.10, experience: 0.10, roleAlignment: 0.10, projectRelevance: 0.25, location: 0.05, education: 0.05 }
    }
  };

  // Recalculate match score dynamically based on active preset & simulated skills
  const dynamicAnalysis = useMemo(() => {
    const weights = WEIGHT_PRESETS[selectedPreset].weights;
    const reqSkills = job.required_skills || [];
    const prefSkills = job.preferred_skills || [];

    // Simulate adding missing skills
    const simSet = new Set(simulatedSkills.map(s => s.toLowerCase()));

    const simReqMatches = (baseAnalysis.skillMatches?.required || []).map(m => {
      if (simSet.has(m.skill.toLowerCase())) {
        return { ...m, matchType: 'EXACT', confidence: 1.0, evidence: ['Simulated Skill Acquisition (In Progress / Completed)'] };
      }
      return m;
    });

    const simPrefMatches = (baseAnalysis.skillMatches?.preferred || []).map(m => {
      if (simSet.has(m.skill.toLowerCase())) {
        return { ...m, matchType: 'EXACT', confidence: 1.0, evidence: ['Simulated Skill Acquisition'] };
      }
      return m;
    });

    const reqEarned = simReqMatches.reduce((acc, m) => acc + (m.confidence || 0), 0);
    const reqScore = reqSkills.length > 0 ? (reqEarned / reqSkills.length) * 100 : 100;

    const prefEarned = simPrefMatches.reduce((acc, m) => acc + (m.confidence || 0), 0);
    const prefScore = prefSkills.length > 0 ? (prefEarned / prefSkills.length) * 100 : 80;

    const expScore = baseAnalysis.scoreBreakdown?.experienceScore ?? 85;
    const roleScore = baseAnalysis.scoreBreakdown?.roleAlignmentScore ?? 85;
    const projScore = baseAnalysis.scoreBreakdown?.projectRelevanceScore ?? 80;
    const locScore = baseAnalysis.scoreBreakdown?.locationScore ?? 90;
    const eduScore = baseAnalysis.scoreBreakdown?.educationScore ?? 95;

    const computedOverall = Math.min(100, Math.round(
      (reqScore * weights.requiredSkills) +
      (prefScore * weights.preferredSkills) +
      (expScore * weights.experience) +
      (roleScore * weights.roleAlignment) +
      (projScore * weights.projectRelevance) +
      (locScore * weights.location) +
      (eduScore * weights.education)
    ));

    return {
      overallScore: computedOverall,
      scoreBreakdown: {
        requiredSkillsScore: Math.round(reqScore),
        preferredSkillsScore: Math.round(prefScore),
        experienceScore: Math.round(expScore),
        roleAlignmentScore: Math.round(roleScore),
        projectRelevanceScore: Math.round(projScore),
        locationScore: Math.round(locScore),
        educationScore: Math.round(eduScore)
      },
      skillMatches: {
        required: simReqMatches,
        preferred: simPrefMatches
      },
      delta: computedOverall - baseAnalysis.overallScore
    };
  }, [selectedPreset, simulatedSkills, baseAnalysis, job]);

  const scoreItems = [
    { label: "Required Skills (40%)", score: dynamicAnalysis.scoreBreakdown.requiredSkillsScore, weight: "40%" },
    { label: "Preferred Skills (15%)", score: dynamicAnalysis.scoreBreakdown.preferredSkillsScore, weight: "15%" },
    { label: "Experience Level (15%)", score: dynamicAnalysis.scoreBreakdown.experienceScore, weight: "15%" },
    { label: "Role Alignment (10%)", score: dynamicAnalysis.scoreBreakdown.roleAlignmentScore, weight: "10%" },
    { label: "Project Relevance (10%)", score: dynamicAnalysis.scoreBreakdown.projectRelevanceScore, weight: "10%" },
    { label: "Location & Mode (5%)", score: dynamicAnalysis.scoreBreakdown.locationScore, weight: "5%" },
    { label: "Education (5%)", score: dynamicAnalysis.scoreBreakdown.educationScore, weight: "5%" }
  ];

  // Missing skills available for simulation
  const missingSkillsList = useMemo(() => {
    const list = [];
    (baseAnalysis.skillMatches?.required || []).forEach(m => {
      if (m.matchType === 'MISSING' || m.matchType === 'PARTIAL') list.push(m.skill);
    });
    (baseAnalysis.skillMatches?.preferred || []).forEach(m => {
      if (m.matchType === 'MISSING') list.push(m.skill);
    });
    return Array.from(new Set(list));
  }, [baseAnalysis]);

  const toggleSimulateSkill = (skill) => {
    setSimulatedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] glass-panel rounded-3xl border border-white/20 flex flex-col shadow-2xl overflow-hidden bg-[#090d16]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded border border-brand-500/30">
                PRD Section 33 Formula
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                4-Tier Taxonomy
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Why {dynamicAnalysis.overallScore}% Compatibility for {job.title}?
            </h2>
            <p className="text-xs text-slate-400">{job.company} • {job.location} ({job.work_mode})</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-slate-900/40 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'anatomy', label: 'Match Anatomy & Weights', icon: Cpu },
            { id: 'taxonomy', label: '4-Tier Skill Taxonomy', icon: Layers },
            { id: 'simulator', label: 'What-If Simulator', icon: Sparkles, badge: dynamicAnalysis.delta > 0 ? `+${dynamicAnalysis.delta}%` : null },
            { id: 'action_plan', label: 'Action Plan & Gaps', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-white bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-brand-400" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Banner with Dynamic Match Score */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-slate-950/60 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 radial-glow">
            <div className="flex items-center gap-4">
              <MatchScoreBadge score={dynamicAnalysis.overallScore} size="lg" />
              <div>
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wide">Overall Match Fit</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {dynamicAnalysis.overallScore >= 80 ? 'Exceptional Fit — Recommended to Apply' :
                   dynamicAnalysis.overallScore >= 70 ? 'Strong Candidate Alignment' : 'Moderate Match — Bridging Suggested'}
                </p>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {baseAnalysis.explanation?.summary}
                </p>
              </div>
            </div>

            {dynamicAnalysis.delta > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center sm:text-right flex-shrink-0 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase text-emerald-300">Simulated Gain</span>
                <p className="text-xl font-black text-emerald-400">+{dynamicAnalysis.delta}%</p>
              </div>
            )}
          </div>

          {/* TAB 1: Match Anatomy & Weights */}
          {activeTab === 'anatomy' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Formula Preset Switcher */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
                    Weight Distribution Model:
                  </span>
                  <span className="text-slate-400">Section 33 Standard</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPreset(key)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedPreset === key
                          ? 'bg-brand-600/30 border-brand-500 text-white shadow-glow-primary'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <p className="font-bold">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7 Weighted Components Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Multidimensional Score Components
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scoreItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="font-bold text-white">{item.score}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            item.score >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-rose-500 to-pink-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Natural Language Highlights */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                  AI Match Reasoning
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {baseAnalysis.explanation?.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent-cyan font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: 4-Tier Skill Taxonomy Matrix */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold">EXACT (100%)</p>
                    <p className="text-[10px] text-slate-400">Direct verified match</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="font-bold">SEMANTIC (85%)</p>
                    <p className="text-[10px] text-slate-400">Equivalent technology</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold">PARTIAL (50%)</p>
                    <p className="text-[10px] text-slate-400">Foundational basis</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="font-bold">MISSING (0%)</p>
                    <p className="text-[10px] text-slate-400">No verified evidence</p>
                  </div>
                </div>
              </div>

              {/* Required Skills Taxonomy List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Required Core Qualifications ({dynamicAnalysis.skillMatches?.required?.length})
                </h4>
                <div className="space-y-2">
                  {dynamicAnalysis.skillMatches?.required?.map((m, idx) => {
                    const isExact = m.matchType === 'EXACT';
                    const isSemantic = m.matchType === 'SEMANTIC';
                    const isPartial = m.matchType === 'PARTIAL';
                    const isMissing = m.matchType === 'MISSING';

                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          isExact ? 'bg-emerald-500/10 border-emerald-500/30' :
                          isSemantic ? 'bg-indigo-500/10 border-indigo-500/30' :
                          isPartial ? 'bg-amber-500/10 border-amber-500/30' :
                          'bg-rose-500/10 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {isExact && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />}
                          {isSemantic && <Cpu className="w-4 h-4 text-indigo-400 mt-0.5" />}
                          {isPartial && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />}
                          {isMissing && <XCircle className="w-4 h-4 text-rose-400 mt-0.5" />}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{m.skill}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                                isExact ? 'bg-emerald-500/20 text-emerald-300' :
                                isSemantic ? 'bg-indigo-500/20 text-indigo-300' :
                                isPartial ? 'bg-amber-500/20 text-amber-300' :
                                'bg-rose-500/20 text-rose-300'
                              }`}>
                                {m.matchType} ({Math.round((m.confidence || 0) * 100)}%)
                              </span>
                            </div>
                            {m.matchedWith && m.matchedWith !== m.skill && (
                              <p className="text-[11px] text-slate-400 mt-0.5">Matched with: <strong>{m.matchedWith}</strong></p>
                            )}
                            {m.evidence?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {m.evidence.map((ev, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 flex items-center gap-1 font-mono">
                                    <FolderGit2 className="w-3 h-3 text-brand-300" />
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {isMissing && (
                          <button
                            onClick={() => toggleSimulateSkill(m.skill)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] whitespace-nowrap self-start sm:self-auto flex items-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-accent-cyan" />
                            <span>Simulate Skill</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Preferred / Bonus Qualifications ({dynamicAnalysis.skillMatches?.preferred?.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {dynamicAnalysis.skillMatches?.preferred?.map((m, idx) => {
                    const isMatched = m.matchType !== 'MISSING';
                    return (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isMatched ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-slate-900/60 border-white/5 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isMatched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          <span className="font-semibold text-white">{m.skill}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase">{m.matchType}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: What-If Skill Acquisition Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive ROI Skill Simulator
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toggle missing skills below to see the exact return-on-investment (ROI) of learning them before applying to {job.company}.
                </p>
              </div>

              {/* Simulator Action Pills */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Missing Skills for {job.title}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {missingSkillsList.map(skill => {
                    const isSimulated = simulatedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSimulateSkill(skill)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                          isSimulated
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-glow-emerald'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            isSimulated ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                          }`}>
                            {isSimulated ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{skill}</p>
                            <p className="text-[11px] text-slate-400">
                              {isSimulated ? 'Skill marked as acquired' : 'Click to simulate learning'}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          isSimulated ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-slate-400'
                        }`}>
                          {isSimulated ? 'Active' : '+ROI'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Impact Comparison */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase">Simulated Impact Summary</span>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className="text-lg font-bold text-slate-400 line-through">Base: {baseAnalysis.overallScore}%</span>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                    <span className="text-2xl font-black text-emerald-400">Simulated: {dynamicAnalysis.overallScore}%</span>
                  </div>
                </div>

                <Link
                  to="/learning"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Learning Paths for Selected</span>
                </Link>
              </div>

            </div>
          )}

          {/* TAB 4: Action Plan & Gaps */}
          {activeTab === 'action_plan' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Targeted Career Growth Strategy
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {baseAnalysis.explanation?.growthOpportunities}
                </p>
              </div>

              {/* Priority Gaps List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Prioritized Skill Gaps
                </h4>
                <div className="space-y-2.5">
                  {baseAnalysis.skillGaps?.map((gap, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{gap.skill}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                            gap.importance === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {gap.importance} Priority
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">{gap.reason}</p>
                        <p className="text-accent-cyan text-[11px] mt-0.5 font-medium">• {gap.recommendedAction}</p>
                      </div>

                      <Link
                        to="/learning"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 text-brand-200 border border-brand-500/40 font-bold whitespace-nowrap text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <span>Bridge Gap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-3">
            <Link
              to="/resume"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              Optimize in Resume Builder
            </Link>
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-primary transition-all"
            >
              <span>Apply on {job.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
