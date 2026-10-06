import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  Layout,
  Edit3,
  Briefcase,
  GraduationCap,
  FolderGit2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bot,
  Eye,
  EyeOff,
  RotateCcw,
  Wand2,
  Star,
  Zap,
  Copy,
  Check,
  Loader2,
  ArrowUpDown,
  Palette
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';

/* ─── AI Bullet Enhancement Simulation ─── */
const AI_ENHANCED_BULLETS = {
  default: (text) => {
    // Simulate action-verb + quantification enhancement
    const verbs = ['Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Delivered', 'Orchestrated', 'Implemented', 'Accelerated'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    if (text.length < 30) return `${verb} ${text.toLowerCase()}`;
    return text
      .replace(/^(Contributed to building|Built|Created|Made|Worked on|Helped)/i, verb)
      .replace(/\.$/, ', resulting in measurable performance improvements.');
  }
};

const AI_SUMMARIES = {
  'Full Stack Developer': `Results-driven Full Stack Developer with hands-on expertise building scalable web platforms using React, Node.js, and PostgreSQL. Demonstrates proven ability to architect low-latency REST microservices, achieve 99.8% uptime across production systems, and collaborate effectively in agile environments. Passionate about delivering robust, user-centric engineering solutions.`,
  'Software Engineer': `Motivated Software Engineer with strong fundamentals in data structures, algorithms, and systems design. Experienced in building responsive React frontends and scalable Node.js backends. Track record of reducing API latency by 28% and engineering platforms serving 1,200+ concurrent users.`,
  'Frontend Developer': `Creative Frontend Developer specializing in React ecosystem with deep expertise in component architecture, state management, and performance optimization. Proven ability to craft pixel-perfect, accessible interfaces that delight users while maintaining exceptional code quality.`,
  'Backend Developer': `Detail-oriented Backend Developer skilled in designing RESTful APIs, managing relational databases, and implementing caching strategies. Experienced in building microservices that handle high-throughput workloads with minimal latency and maximum reliability.`
};

/* ─── Template Visual Configs ─── */
const TEMPLATE_STYLES = {
  ats_minimal: {
    name: 'ATS Minimal',
    desc: '100% Parser Safe • Clean Lines',
    icon: '📄',
    headerAlign: 'text-center',
    headerBorder: 'border-b-2 border-slate-800',
    sectionTitle: 'text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-300 pb-0.5 mb-2',
    accentColor: 'text-slate-700',
    linkColor: 'text-slate-800 underline',
    cardClass: '',
    bodyFont: 'font-sans',
  },
  modern: {
    name: 'Modern Indigo',
    desc: 'Sleek • Color Accent Bar',
    icon: '🎨',
    headerAlign: 'text-left',
    headerBorder: '',
    sectionTitle: 'text-[11px] font-bold text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-200 pb-0.5 mb-2',
    accentColor: 'text-indigo-600',
    linkColor: 'text-indigo-700 underline font-semibold',
    cardClass: 'border-l-[6px] border-indigo-600',
    bodyFont: 'font-sans',
  },
  professional: {
    name: 'Professional',
    desc: 'Corporate Standard • Serif Heading',
    icon: '💼',
    headerAlign: 'text-center',
    headerBorder: 'border-b-[3px] border-double border-slate-700',
    sectionTitle: 'text-[11px] font-bold text-slate-800 uppercase tracking-[0.12em] border-b border-slate-400 pb-0.5 mb-2 font-serif',
    accentColor: 'text-slate-700',
    linkColor: 'text-slate-700 underline',
    cardClass: '',
    bodyFont: '',
  },
  fresher: {
    name: 'Fresher First',
    desc: 'Projects Lead • Education Top',
    icon: '🎓',
    headerAlign: 'text-center',
    headerBorder: 'border-b-2 border-emerald-600',
    sectionTitle: 'text-[11px] font-bold text-emerald-700 uppercase tracking-wider border-b-2 border-emerald-200 pb-0.5 mb-2',
    accentColor: 'text-emerald-700',
    linkColor: 'text-emerald-700 underline font-semibold',
    cardClass: 'border-t-[5px] border-emerald-500',
    bodyFont: 'font-sans',
  }
};

/* ─── Default section order per template ─── */
const SECTION_ORDER = {
  ats_minimal: ['summary', 'skills', 'experience', 'projects', 'education'],
  modern: ['summary', 'skills', 'experience', 'projects', 'education'],
  professional: ['summary', 'experience', 'skills', 'projects', 'education'],
  fresher: ['summary', 'education', 'projects', 'skills', 'experience']
};

const SECTION_LABELS = {
  summary: 'Professional Summary',
  skills: 'Technical Skills',
  experience: 'Professional Experience',
  projects: 'Technical Projects',
  education: 'Education'
};

const SECTION_ICONS = {
  summary: Edit3,
  skills: Zap,
  experience: Briefcase,
  projects: FolderGit2,
  education: GraduationCap
};

export default function ResumeBuilderPage() {
  const { currentUser } = useCareer();
  const resumeRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState('ats_minimal');
  const [targetRole, setTargetRole] = useState(currentUser?.preferred_roles?.[0] || 'Full Stack Developer');
  const [summary, setSummary] = useState(currentUser?.summary || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedNotice, setEnhancedNotice] = useState('');
  const [sectionOrder, setSectionOrder] = useState(SECTION_ORDER.ats_minimal);
  const [hiddenSections, setHiddenSections] = useState(new Set());
  const [enhancedBullets, setEnhancedBullets] = useState({}); // { exp_01: 'enhanced text', proj_01: 'enhanced text' }
  const [enhancingItem, setEnhancingItem] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!currentUser) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-4 max-w-lg mx-auto mt-12">
        <FileText className="w-12 h-12 text-slate-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-white">Setup Your Profile First</h2>
          <p className="text-xs text-slate-400 mt-1">
            Fill in your education, projects, and skills to auto-generate an ATS-optimized resume.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-primary"
        >
          <span>Setup Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const style = TEMPLATE_STYLES[selectedTemplate];

  /* ─── Template Change Handler ─── */
  const handleTemplateChange = (id) => {
    setSelectedTemplate(id);
    setSectionOrder(SECTION_ORDER[id]);
  };

  /* ─── AI Summary Enhance ─── */
  const handleAISummaryOptimize = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      const matchedSummary = AI_SUMMARIES[targetRole] || AI_SUMMARIES['Full Stack Developer'];
      setSummary(matchedSummary);
      setIsEnhancing(false);
      showNotice('✨ AI optimized your summary with quantifiable impacts and active verbs!');
    }, 700);
  };

  /* ─── Per-Bullet AI Enhance ─── */
  const handleEnhanceBullet = (itemId, originalText) => {
    setEnhancingItem(itemId);
    setTimeout(() => {
      const enhanced = AI_ENHANCED_BULLETS.default(originalText);
      setEnhancedBullets(prev => ({ ...prev, [itemId]: enhanced }));
      setEnhancingItem(null);
      showNotice(`⚡ Enhanced bullet for "${itemId.substring(0, 20)}..." with action verbs.`);
    }, 500);
  };

  /* ─── Section Toggle ─── */
  const toggleSection = (section) => {
    setHiddenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  /* ─── Move Section ─── */
  const moveSection = (section, direction) => {
    setSectionOrder(prev => {
      const idx = prev.indexOf(section);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  /* ─── Print PDF ─── */
  const handlePrint = () => {
    window.print();
  };

  /* ─── Copy as Text ─── */
  const handleCopyText = () => {
    if (resumeRef.current) {
      const text = resumeRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  /* ─── Notice display ─── */
  const showNotice = (msg) => {
    setEnhancedNotice(msg);
    setTimeout(() => setEnhancedNotice(''), 3500);
  };

  /* ─── Compute ATS score heuristic ─── */
  const computeATSScore = () => {
    let score = 50;
    if (summary && summary.length > 50) score += 10;
    if ((currentUser.skills || []).length >= 5) score += 10;
    if ((currentUser.education || []).length >= 1) score += 8;
    if ((currentUser.experience || []).length >= 1) score += 10;
    if ((currentUser.projects || []).length >= 1) score += 7;
    if (currentUser.email) score += 3;
    if (currentUser.phone) score += 2;
    if (hiddenSections.size === 0) score += 0; else score -= hiddenSections.size * 3;
    return Math.min(score, 100);
  };

  const atsScore = computeATSScore();

  /* ─── Skills grouping helper ─── */
  const groupedSkills = (currentUser.skills || []).reduce((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  /* ─── Section Renderers for the Preview ─── */
  const renderSection = (section) => {
    if (hiddenSections.has(section)) return null;

    switch (section) {
      case 'summary':
        return (
          <div key="summary" className="py-3 border-b border-slate-200">
            <h2 className={style.sectionTitle}>Professional Summary</h2>
            <p className="text-[11px] text-slate-700 leading-relaxed">{summary || 'Write or AI-generate your professional summary in the editor panel.'}</p>
          </div>
        );

      case 'skills':
        return (
          <div key="skills" className="py-3 border-b border-slate-200">
            <h2 className={style.sectionTitle}>Technical Skills</h2>
            {Object.keys(groupedSkills).length > 0 ? (
              <div className="text-[11px] text-slate-700 space-y-0.5">
                {Object.entries(groupedSkills).map(([cat, skills]) => (
                  <p key={cat}>
                    <strong className="text-slate-900">{cat}:</strong>{' '}
                    {skills.join(', ')}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No skills listed yet. Add skills in your profile to populate this section.</p>
            )}
          </div>
        );

      case 'experience':
        return (
          <div key="experience" className="py-3 border-b border-slate-200">
            <h2 className={style.sectionTitle}>Professional Experience</h2>
            {(currentUser.experience || []).length > 0 ? (
              <div className="space-y-2.5">
                {(currentUser.experience || []).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11.5px] text-slate-900">{exp.role} — {exp.company}</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{exp.start_date} – {exp.end_date}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                      {enhancedBullets[exp.id] || exp.description}
                    </p>
                    {exp.technologies && (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">
                        Technologies: {exp.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No professional experience listed yet. Add roles or internships in your profile.</p>
            )}
          </div>
        );

      case 'projects':
        return (
          <div key="projects" className="py-3 border-b border-slate-200">
            <h2 className={style.sectionTitle}>Technical Projects</h2>
            {(currentUser.projects || []).length > 0 ? (
              <div className="space-y-2.5">
                {(currentUser.projects || []).map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11.5px] text-slate-900">{proj.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                        {(proj.technologies || []).join(' | ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                      {enhancedBullets[proj.id] || proj.description}
                    </p>
                    {proj.achievements && (
                      <p className={`text-[10px] font-semibold mt-0.5 ${style.accentColor}`}>
                        • Key Impact: {proj.achievements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No technical projects added yet.</p>
            )}
          </div>
        );

      case 'education':
        return (
          <div key="education" className="py-3 border-b border-slate-200 last:border-b-0">
            <h2 className={style.sectionTitle}>Education</h2>
            {(currentUser.education || []).length > 0 ? (
              (currentUser.education || []).map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="font-bold text-[11.5px] text-slate-900">{edu.institution}</span>
                    <p className="text-[10.5px] text-slate-600">
                      {edu.degree} in {edu.field} ({edu.grade})
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                    {edu.start_year} – {edu.end_year}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 italic">No education history added yet.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview {
            position: fixed !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important;
            margin: 0 !important; padding: 0.5in !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
          }
          @page { margin: 0.4in; size: A4 portrait; }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn print:hidden">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">AI Resume Builder</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                ATS Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Build, optimize for a specific target role, and export pixel-perfect resumes from your career profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Clear resume fields to a clean blank slate?")) {
                  setSummary('');
                  setTargetRole('');
                  setEnhancedBullets({});
                  showNotice("Cleared resume inputs to a blank canvas.");
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5"
              title="Clear resume inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Blank</span>
            </button>
            <button
              onClick={handleCopyText}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Enhanced Notice */}
        {enhancedNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {enhancedNotice}
          </div>
        )}

        {/* Main Dual Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─── Left Control Pane (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Template Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-brand-400" />
                1. Choose Resume Template
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(TEMPLATE_STYLES).map(([id, tmpl]) => (
                  <button
                    key={id}
                    onClick={() => handleTemplateChange(id)}
                    className={`p-3 rounded-xl text-left border transition-all group ${
                      selectedTemplate === id
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow-primary'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tmpl.icon}</span>
                      <div>
                        <p className="font-bold">{tmpl.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{tmpl.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role & AI Tuning */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                2. Target Role & AI Tuning
              </h2>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-400">Professional Summary</label>
                  <button
                    onClick={handleAISummaryOptimize}
                    disabled={isEnhancing}
                    className="text-[11px] font-bold text-accent-cyan hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    {isEnhancing ? 'Optimizing...' : 'AI Enhance'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a professional summary or click AI Enhance to auto-generate one tailored to your target role..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Section Manager — Toggle & Reorder */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-accent-violet" />
                3. Section Order & Visibility
              </h2>
              <div className="space-y-1.5">
                {sectionOrder.map((section, idx) => {
                  const Icon = SECTION_ICONS[section];
                  const isHidden = hiddenSections.has(section);
                  return (
                    <div
                      key={section}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isHidden
                          ? 'bg-slate-900/40 border-white/5 opacity-50'
                          : 'bg-white/5 border-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-semibold ${isHidden ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {SECTION_LABELS[section]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveSection(section, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 transition"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(section, 'down')}
                          disabled={idx === sectionOrder.length - 1}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 transition"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleSection(section)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title={isHidden ? 'Show section' : 'Hide section'}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-Item AI Bullet Enhancer */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-amber-400" />
                4. AI Bullet Enhancer
              </h2>
              <p className="text-[10px] text-slate-500">Click ⚡ to rewrite each bullet point with stronger action verbs and measurable outcomes.</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(currentUser.experience || []).map((exp) => (
                  <div key={exp.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-300 truncate">{exp.role} @ {exp.company}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {enhancedBullets[exp.id] || exp.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEnhanceBullet(exp.id, exp.description)}
                      disabled={enhancingItem === exp.id}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition flex-shrink-0"
                      title="AI Enhance"
                    >
                      {enhancingItem === exp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
                {(currentUser.projects || []).map((proj) => (
                  <div key={proj.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-300 truncate">{proj.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {enhancedBullets[proj.id] || proj.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEnhanceBullet(proj.id, proj.description)}
                      disabled={enhancingItem === proj.id}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition flex-shrink-0"
                      title="AI Enhance"
                    >
                      {enhancingItem === proj.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Sections Sync Status */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
              <h2 className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Profile Data Sync
              </h2>
              <div className="space-y-2 text-slate-400">
                {[
                  { label: `Contact Info (Email, Phone, Links)`, count: null },
                  { label: `Education`, count: (currentUser.education || []).length },
                  { label: `Experience`, count: (currentUser.experience || []).length },
                  { label: `Projects`, count: (currentUser.projects || []).length },
                  { label: `Skills`, count: (currentUser.skills || []).length },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-white/5 last:border-b-0">
                    <span>{item.label}{item.count !== null ? ` (${item.count})` : ''}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── Right Live Preview Pane (7 cols) ─── */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 p-4 rounded-3xl border border-white/10 sticky top-24">
              <div className="flex items-center justify-between pb-3 px-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-400" />
                  <span>Live Formatted Preview (A4)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold flex items-center gap-1 ${
                    atsScore >= 85 ? 'text-emerald-400' : atsScore >= 65 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    <Star className="w-3.5 h-3.5" />
                    ATS Score: {atsScore}/100
                  </span>
                </div>
              </div>

              {/* Resume Sheet Container */}
              <div
                ref={resumeRef}
                id="resume-preview"
                className={`bg-white text-slate-900 rounded-xl p-8 shadow-2xl min-h-[750px] transition-all text-xs ${style.bodyFont} ${style.cardClass}`}
              >
                {/* Header */}
                <div className={`pb-3 ${style.headerBorder} ${style.headerAlign}`}>
                  <h1 className={`text-2xl font-black text-slate-900 tracking-tight ${
                    selectedTemplate === 'professional' ? 'font-serif' : ''
                  }`}>
                    {currentUser.name || 'Your Full Name'}
                  </h1>
                  <p className={`text-xs font-bold mt-0.5 ${style.accentColor}`}>{targetRole || 'Your Target Role'}</p>
                  <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-2 ${
                    style.headerAlign === 'text-center' ? 'justify-center' : ''
                  }`}>
                    {currentUser.email ? <span>{currentUser.email}</span> : <span className="text-slate-400 italic">your.email@domain.com</span>}
                    <span>•</span>
                    {currentUser.phone ? <span>{currentUser.phone}</span> : <span className="text-slate-400 italic">+91 XXXXX XXXXX</span>}
                    <span>•</span>
                    {currentUser.location ? <span>{currentUser.location}</span> : <span className="text-slate-400 italic">City, Country</span>}
                    {currentUser.github_url && (
                      <><span>•</span><a href={currentUser.github_url} className={style.linkColor}>GitHub</a></>
                    )}
                    {currentUser.linkedin_url && (
                      <><span>•</span><a href={currentUser.linkedin_url} className={style.linkColor}>LinkedIn</a></>
                    )}
                    {currentUser.portfolio_url && (
                      <><span>•</span><a href={currentUser.portfolio_url} className={style.linkColor}>Portfolio</a></>
                    )}
                  </div>
                </div>

                {/* Dynamic Sections in configurable order */}
                {sectionOrder.map(section => renderSection(section))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
