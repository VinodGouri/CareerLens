import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle, Upload, Plus, X,
  Briefcase, GraduationCap, Code, MapPin, Target, Rocket
} from 'lucide-react';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'skills', title: 'Skills', icon: Code },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'complete', title: 'Ready!', icon: Rocket }
];

const SKILL_CATEGORIES = {
  'Languages': ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust', 'C#', 'PHP', 'Ruby', 'Kotlin', 'Swift'],
  'Frontend': ['React', 'Angular', 'Vue.js', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap', 'SASS'],
  'Backend': ['Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'NestJS', '.NET'],
  'Database': ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase', 'DynamoDB', 'Supabase'],
  'DevOps/Cloud': ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Terraform', 'Linux'],
  'Tools': ['Git', 'GitHub', 'VS Code', 'Figma', 'Postman', 'Jira', 'Notion']
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useCareer();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [education, setEducation] = useState({
    institution: '',
    degree: 'B.Tech',
    field: 'Computer Science',
    year: '2024',
    cgpa: ''
  });
  const [goals, setGoals] = useState({
    targetRoles: [],
    locations: [],
    workMode: '',
    salaryRange: ''
  });

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleGoal = (field, value) => {
    setGoals(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Save onboarding data to the profile
    try {
      await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: selectedSkills.map((name, i) => ({
            id: `s_ob_${i}`,
            name,
            category: 'General',
            proficiency: 'INTERMEDIATE',
            years: 1,
            evidence: []
          })),
          preferred_roles: goals.targetRoles,
          preferred_locations: goals.locations,
          preferred_work_mode: goals.workMode,
          education: education.institution ? [{
            institution: education.institution,
            degree: `${education.degree} in ${education.field}`,
            year: education.year,
            cgpa: education.cgpa
          }] : []
        })
      });
    } catch {
      // Continue even if API is down
    }
    localStorage.setItem('careerlens_onboarded', 'true');
    navigate('/');
  };

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(16,185,129,0.08) 0%, transparent 50%)'
      }} />

      {/* Top Progress Bar */}
      <div className="relative z-10 w-full h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDone ? 'bg-accent-emerald/20 border border-accent-emerald/40' :
                  isActive ? 'bg-brand-500/20 border border-brand-500/40 shadow-glow-primary' :
                  'bg-white/5 border border-white/10'
                }`}>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-accent-emerald" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${
                  isActive ? 'text-brand-300' : isDone ? 'text-accent-emerald' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-8">
        <div className="w-full max-w-2xl">

          {/* ─── Step 0: Welcome ─── */}
          {currentStep === 0 && (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary mx-auto mb-8">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-accent-cyan" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Let's set up your{' '}
                <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
                  career profile
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-md mx-auto mb-8 leading-relaxed">
                This quick setup will take about 2 minutes and helps us deliver highly relevant job matches from day one.
              </p>

              <div className="glass-panel rounded-2xl p-6 max-w-sm mx-auto border border-white/10 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What you'll set up</p>
                <div className="space-y-3">
                  {[
                    { icon: '💻', text: 'Your technical skills' },
                    { icon: '🎓', text: 'Education background' },
                    { icon: '🎯', text: 'Career goals & preferences' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleNext}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white font-semibold text-sm shadow-glow-primary hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Let's Go!
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { localStorage.setItem('careerlens_onboarded', 'true'); navigate('/'); }}
                  className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/10 transition-all"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 1: Skills ─── */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What technologies do you work with?</h2>
                <p className="text-sm text-slate-400">
                  Select your skills — these drive match scores. ({selectedSkills.length} selected)
                </p>
              </div>

              {/* Selected skills tags */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                  {selectedSkills.map(skill => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-200 text-xs font-medium"
                    >
                      {skill}
                      <button onClick={() => toggleSkill(skill)}>
                        <X className="w-3 h-3 hover:text-red-400 transition-colors" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                  <div key={category}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-brand-500/20 border-brand-500/40 text-brand-200'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {selectedSkills.includes(skill) && <span className="mr-1">✓</span>}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Step 2: Education ─── */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your education background</h2>
                <p className="text-sm text-slate-400">Add your most recent qualification</p>
              </div>

              <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 max-w-md mx-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Institution</label>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setEducation(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. JNTU Hyderabad"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Degree</label>
                    <select
                      value={education.degree}
                      onChange={(e) => setEducation(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="B.E.">B.E.</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BSc">BSc</option>
                      <option value="MSc">MSc</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Year</label>
                    <select
                      value={education.year}
                      onChange={(e) => setEducation(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
                    >
                      {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Field of Study</label>
                  <input
                    type="text"
                    value={education.field}
                    onChange={(e) => setEducation(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="Computer Science"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">CGPA / Percentage</label>
                  <input
                    type="text"
                    value={education.cgpa}
                    onChange={(e) => setEducation(prev => ({ ...prev, cgpa: e.target.value }))}
                    placeholder="e.g. 8.4 CGPA or 82%"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Goals ─── */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What are you looking for?</h2>
                <p className="text-sm text-slate-400">This helps us prioritize the right opportunities for you</p>
              </div>

              <div className="space-y-6 max-w-lg mx-auto">
                {/* Target Roles */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Target Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'UI/UX Designer', 'DevOps Engineer', 'Mobile Developer', 'ML Engineer', 'QA Engineer', 'Product Manager'].map(role => (
                      <button
                        key={role}
                        onClick={() => toggleGoal('targetRoles', role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          goals.targetRoles.includes(role)
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-200'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {goals.targetRoles.includes(role) && '✓ '}{role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Preferred Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Hyderabad', 'Bangalore', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Remote'].map(city => (
                      <button
                        key={city}
                        onClick={() => toggleGoal('locations', city)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          goals.locations.includes(city)
                            ? 'bg-accent-emerald/15 border-accent-emerald/40 text-accent-emerald'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {goals.locations.includes(city) && '✓ '}{city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'ONSITE', label: 'On-site', emoji: '🏢' },
                      { value: 'HYBRID', label: 'Hybrid', emoji: '🔀' },
                      { value: 'REMOTE', label: 'Remote', emoji: '🏠' }
                    ].map(mode => (
                      <button
                        key={mode.value}
                        onClick={() => setGoals(prev => ({ ...prev, workMode: mode.value }))}
                        className={`p-3 rounded-xl text-center text-xs border transition-all ${
                          goals.workMode === mode.value
                            ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-lg mb-1">{mode.emoji}</div>
                        <div className="font-semibold">{mode.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Salary (LPA)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['3-5', '5-8', '8-12', '12+'].map(range => (
                      <button
                        key={range}
                        onClick={() => setGoals(prev => ({ ...prev, salaryRange: range }))}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          goals.salaryRange === range
                            ? 'bg-accent-amber/15 border-accent-amber/40 text-accent-amber'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        ₹{range} LPA
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Complete ─── */}
          {currentStep === 4 && (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-accent-emerald/15 border-2 border-accent-emerald/40 flex items-center justify-center mx-auto mb-6 shadow-glow-emerald">
                <Rocket className="w-10 h-10 text-accent-emerald" />
              </div>

              <h2 className="text-3xl font-extrabold text-white mb-3">You're all set! 🎉</h2>
              <p className="text-lg text-slate-300 max-w-md mx-auto mb-8">
                Your career profile is ready. We've already started matching jobs based on your skills and preferences.
              </p>

              {/* Summary */}
              <div className="glass-panel rounded-2xl p-6 max-w-sm mx-auto border border-white/10 mb-8 text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Profile Summary</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skills</span>
                    <span className="text-white font-medium">{selectedSkills.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Roles</span>
                    <span className="text-white font-medium">{goals.targetRoles.length} roles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Locations</span>
                    <span className="text-white font-medium">{goals.locations.join(', ') || 'Any'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Work Mode</span>
                    <span className="text-white font-medium">{goals.workMode || 'Any'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-accent-emerald via-brand-500 to-brand-600 text-white font-semibold text-sm shadow-glow-emerald hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {currentStep > 0 && currentStep < 4 && (
        <div className="relative z-10 border-t border-white/5 py-4 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="text-xs text-slate-500">
              Step {currentStep} of {STEPS.length - 2}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold shadow-glow-primary hover:opacity-95 transition-all"
            >
              {currentStep === 3 ? 'Finish' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
