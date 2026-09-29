import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Award,
  Layers,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useCareer();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'skills', 'projects', 'experience', 'education'
  const [savedNotification, setSavedNotification] = useState(false);
  const [noticeText, setNoticeText] = useState('Changes saved to CareerLens profile.');

  // Skill Add Modal state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillProficiency, setNewSkillProficiency] = useState('INTERMEDIATE');
  const [newSkillYears, setNewSkillYears] = useState(1);
  const [newSkillEvidence, setNewSkillEvidence] = useState('');

  if (!currentUser) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill = {
      id: `s_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      years: Number(newSkillYears),
      evidence: newSkillEvidence ? [newSkillEvidence] : []
    };

    const updated = {
      ...currentUser,
      skills: [...(currentUser.skills || []), newSkill]
    };
    setCurrentUser(updated);
    setNewSkillName('');
    setNewSkillEvidence('');
    showSaveNotice();
  };

  const handleDeleteSkill = (skillId) => {
    const updated = {
      ...currentUser,
      skills: (currentUser.skills || []).filter(s => s.id !== skillId)
    };
    setCurrentUser(updated);
    showSaveNotice();
  };

  const showSaveNotice = (msg = 'Changes saved to CareerLens profile.') => {
    setNoticeText(msg);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Group skills by category
  const skillsByCategory = (currentUser.skills || []).reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 relative overflow-hidden radial-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl font-black text-white">
                {currentUser.name?.[0] || 'U'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentUser.experience_level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-brand-300 font-medium">{currentUser.headline}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {currentUser.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={async () => {
                if (window.confirm("Clear all profile data (skills, projects, experience, education) to start with a blank slate?")) {
                  try {
                    const res = await fetch('/api/v1/profile/clear', { method: 'POST' }).then(r => r.json());
                    if (res.success) {
                      setCurrentUser(res.data);
                      showSaveNotice("Profile cleared to clean blank state.");
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              title="Clear all profile sample data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear to Blank Slate</span>
            </button>
            {currentUser.github_url && (
              <a href={currentUser.github_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors">
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {currentUser.linkedin_url && (
              <a href={currentUser.linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {currentUser.portfolio_url && (
              <a href={currentUser.portfolio_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-t border-white/10 pt-6 mt-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Preferences' },
            { id: 'skills', label: `Skills & Evidence (${currentUser.skills?.length || 0})` },
            { id: 'projects', label: `Projects (${currentUser.projects?.length || 0})` },
            { id: 'experience', label: 'Experience & Internships' },
            { id: 'education', label: 'Education' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-glow-primary'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {savedNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" /> {noticeText}
        </div>
      )}

      {/* Tab 1: Overview & Preferences */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              Professional Summary
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentUser.summary || <span className="text-slate-500 italic">No summary written yet. Click Settings or use Resume Builder to add a professional summary.</span>}
            </p>
          </div>

          {/* Career Preferences */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              Career Preferences & Targets
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Target Roles</span>
                <span className="font-semibold text-white">{(currentUser.preferred_roles || []).join(', ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Target Locations</span>
                <span className="font-semibold text-white">{(currentUser.preferred_locations || []).join(', ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Work Modes</span>
                <span className="font-semibold text-white">{(currentUser.work_modes || []).join(', ')}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Expected CTC Range</span>
                <span className="font-bold text-emerald-400">{currentUser.expected_salary}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Categorized Skills & Evidence (PRD Section 15 & 16) */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          
          {/* Add Skill Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-brand-400" />
              Add Skill with Project / Experience Evidence
            </h3>
            <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name (e.g. Docker, GraphQL, Redis)"
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Programming">Programming</option>
                <option value="AI">AI/ML</option>
              </select>
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <input
                type="text"
                value={newSkillEvidence}
                onChange={(e) => setNewSkillEvidence(e.target.value)}
                placeholder="Evidence (e.g. LMS Project, Internship)"
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill
              </button>
            </form>
          </div>

          {/* Categorized Skills Display */}
          <div className="space-y-5">
            {Object.keys(skillsByCategory).length === 0 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-2">
                <p className="text-sm font-semibold text-white">No Skills Added Yet</p>
                <p className="text-xs text-slate-400">Use the form above to add your technical proficiencies with project evidence.</p>
              </div>
            )}
            {Object.entries(skillsByCategory).map(([category, skillList]) => (
              <div key={category} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  {category} ({skillList.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillList.map((skill) => (
                    <div 
                      key={skill.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-brand-500/30 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{skill.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-semibold">
                              {skill.proficiency}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{skill.years} {skill.years === 1 ? 'Year' : 'Years'} Exp</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Evidence Connection (PRD Section 16) */}
                      {skill.evidence && skill.evidence.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            <LinkIcon className="w-2.5 h-2.5 text-accent-cyan" />
                            Demonstrated Evidence:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skill.evidence.map((ev, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5 font-medium">
                                {ev}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 3: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(currentUser.projects || []).length === 0 && (
            <div className="col-span-2 glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Projects Listed</p>
              <p className="text-xs text-slate-400">Add your apps and repositories to showcase your technical portfolio.</p>
            </div>
          )}
          {(currentUser.projects || []).map((proj) => (
            <div key={proj.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-brand-400" />
                    {proj.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold border border-white/10">
                    {proj.role}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                {proj.achievements && (
                  <p className="text-xs text-emerald-400 font-medium">
                    🏆 {proj.achievements}
                  </p>
                )}
                
                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(proj.technologies || []).map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3 text-xs">
                {proj.github_url && (
                  <a href={proj.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold">
                    <GithubIcon className="w-3.5 h-3.5" /> Source Code
                  </a>
                )}
                {proj.live_url && (
                  <a href={proj.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent-cyan hover:underline font-semibold">
                    <Globe className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {(currentUser.experience || []).length === 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Work Experience Listed</p>
              <p className="text-xs text-slate-400">Students and freshers can leave this blank or add internships & campus positions.</p>
            </div>
          )}
          {(currentUser.experience || []).map((exp) => (
            <div key={exp.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="font-bold text-white text-base">{exp.role}</h3>
                  <p className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {exp.company} · {exp.employment_type}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {exp.start_date} — {exp.end_date}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(exp.technologies || []).map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Education */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {(currentUser.education || []).length === 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-2">
              <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Education Credentials Listed</p>
              <p className="text-xs text-slate-400">Add your university, degree, and graduation timeline.</p>
            </div>
          )}
          {(currentUser.education || []).map((edu) => (
            <div key={edu.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-brand-400" />
                    {edu.institution}
                  </h3>
                  <p className="text-xs text-brand-300 font-semibold mt-0.5">
                    {edu.degree} in {edu.field} ({edu.course_type})
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {edu.grade}
                </span>
              </div>
              <p className="text-xs text-slate-400">Graduation Timeline: {edu.start_year} — {edu.end_year}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
