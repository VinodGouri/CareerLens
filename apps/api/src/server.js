import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { SEED_USERS, SEED_JOBS, SEED_LEARNING_RESOURCES, SEED_APPLICATIONS } from './data/seedData.js';
import { calculateComprehensiveMatch } from './services/aiMatcher.js';
import { JobIngestionEngine, parseSalaryToNumeric, generateCanonicalHash } from './services/jobIngestionService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-Memory Data Store (Initialized with realistic seed data)
let users = [...SEED_USERS];
let jobs = [...SEED_JOBS];
const ingestionEngine = new JobIngestionEngine(jobs);
let learningResources = [...SEED_LEARNING_RESOURCES];
let applications = [...SEED_APPLICATIONS];
let savedJobIds = ["job_abc_01", "job_swiggy_03"];

// Helper: Active user session (defaults to Rahul Sharma / Fresher for instant out-of-the-box experience)
let currentUserId = "user_fresher_01";
function getCurrentUser() {
  return users.find(u => u.id === currentUserId) || users[0];
}

/* -------------------------------------------------------------
 * 1. AUTHENTICATION & SWITCH PERSONA
 * ----------------------------------------------------------- */
app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ success: false, error: { message: "User not found" } });
  }
  currentUserId = user.id;
  res.json({ success: true, data: { user, token: "demo-jwt-token-careerlens" } });
});

/* ─── OAuth Providers & Authentication (Google, LinkedIn, GitHub) ─── */
app.get('/api/v1/auth/oauth/providers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'google',
        name: 'Google',
        icon: 'google',
        enabled: true,
        scopes: ['openid', 'email', 'profile'],
        authUrl: '/api/v1/auth/oauth/google',
        description: 'Sign in with your Google account'
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: 'linkedin',
        enabled: true,
        scopes: ['r_liteprofile', 'r_emailaddress'],
        authUrl: '/api/v1/auth/oauth/linkedin',
        description: 'Import professional profile and verified skills from LinkedIn'
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: 'github',
        enabled: true,
        scopes: ['read:user', 'user:email'],
        authUrl: '/api/v1/auth/oauth/github',
        description: 'Sync repositories, code telemetry and developer profile from GitHub'
      }
    ]
  });
});

app.post('/api/v1/auth/oauth/:provider', (req, res) => {
  const { provider } = req.params;
  const { email, name, avatarUrl, username, headline, targetRole } = req.body || {};

  const validProviders = ['google', 'linkedin', 'github'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ success: false, error: { message: `Unsupported OAuth provider: ${provider}` } });
  }

  // Look for existing user by email if provided
  let user = null;
  if (email) {
    user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // If not found by email and no email provided, select appropriate default persona
  if (!user && !email) {
    if (provider === 'google') {
      user = users.find(u => u.id === 'user_fresher_01');
    } else if (provider === 'linkedin') {
      user = users.find(u => u.id === 'user_junior_02');
    } else if (provider === 'github') {
      user = users.find(u => u.id === 'user_fresher_01');
    }
  }

  // If still not matched, synthesize a realistic verified profile for that provider
  if (!user) {
    const timestamp = Date.now();
    const userEmail = email || `${provider}.user.${timestamp}@careerlens.io`;
    const userName = name || (provider === 'github' ? (username || 'GitHub Developer') : (provider === 'linkedin' ? 'LinkedIn Professional' : 'Google Candidate'));

    let initialSkills = [];
    let initialProjects = [];
    let initialHeadline = headline || '';

    if (provider === 'github') {
      initialHeadline = initialHeadline || 'Open Source Contributor & Full Stack Developer';
      initialSkills = [
        { id: "s_git", name: "Git & GitHub", category: "DevOps", proficiency: "EXPERT", years: 3, evidence: ["GitHub Verified Commits"] },
        { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["Open Source Repositories"] },
        { id: "s_node", name: "Node.js", category: "Backend", proficiency: "ADVANCED", years: 2, evidence: ["Production Node Services"] },
        { id: "s_typescript", name: "TypeScript", category: "Programming", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["TypeScript Repos"] },
        { id: "s_docker", name: "Docker", category: "DevOps", proficiency: "INTERMEDIATE", years: 1, evidence: ["Dockerfiles in GitHub"] }
      ];
      initialProjects = [
        {
          id: `proj_gh_${timestamp}`,
          name: "OpenSource Cloud Toolkit",
          description: "Developer utility suite synced from GitHub with automated CI/CD workflows.",
          technologies: ["React", "TypeScript", "Node.js", "Docker"],
          github_url: `https://github.com/${username || 'developer'}/toolkit`,
          live_url: "https://toolkit.dev",
          role: "Lead Maintainer",
          achievements: "150+ GitHub stars, 12 contributors."
        }
      ];
    } else if (provider === 'linkedin') {
      initialHeadline = initialHeadline || 'Software Engineer | Top Skills: React, Node.js & System Design';
      initialSkills = [
        { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2.5, evidence: ["LinkedIn Skill Assessment Badge"] },
        { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 3, evidence: ["LinkedIn Verified Assessment"] },
        { id: "s_tailwind", name: "Tailwind CSS", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["LinkedIn Endorsed by 14 colleagues"] },
        { id: "s_system_design", name: "System Design", category: "Architecture", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["LinkedIn Endorsed"] },
        { id: "s_rest", name: "REST APIs", category: "Backend", proficiency: "ADVANCED", years: 2.5, evidence: ["LinkedIn Endorsed"] }
      ];
    } else {
      // google
      initialHeadline = initialHeadline || 'Cloud-Native Software Engineer | Google Workspace Verified';
      initialSkills = [
        { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 2, evidence: ["Google Verified"] },
        { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["Google Verified"] },
        { id: "s_python", name: "Python", category: "Programming", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["Google Colab Projects"] },
        { id: "s_gcp", name: "Google Cloud Platform", category: "DevOps", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["Google Cloud Certified"] }
      ];
    }

    user = {
      id: `user_${provider}_${timestamp}`,
      email: userEmail,
      name: userName,
      role: "USER",
      auth_provider: provider,
      avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`,
      headline: initialHeadline,
      summary: `Verified candidate authenticated through ${provider.toUpperCase()}. Profile pre-populated with authenticated credentials and skill evidence.`,
      location: "Bangalore, India",
      phone: "+91 98000 12345",
      linkedin_url: provider === 'linkedin' ? `https://linkedin.com/in/${userName.toLowerCase().replace(/[^a-z0-9]/g, '')}` : (user?.linkedin_url || ""),
      github_url: provider === 'github' ? `https://github.com/${username || userName.toLowerCase().replace(/[^a-z0-9]/g, '')}` : (user?.github_url || ""),
      portfolio_url: "",
      experience_level: "EARLY_CAREER",
      preferred_roles: targetRole ? [targetRole] : ["Software Engineer", "Full Stack Developer"],
      preferred_locations: ["Bangalore", "Hyderabad", "Remote"],
      work_modes: ["REMOTE", "HYBRID"],
      expected_salary: "₹8,00,000 - ₹14,00,000",
      education: [
        {
          id: `edu_${timestamp}`,
          institution: "National Institute of Technology",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          start_year: 2020,
          end_year: 2024,
          grade: "8.8 CGPA",
          course_type: "Full Time"
        }
      ],
      experience: [
        {
          id: `exp_${timestamp}`,
          company: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Ecosystem Partner`,
          role: "Software Development Engineer",
          employment_type: "Full Time",
          start_date: "2024-01",
          end_date: "Present",
          description: `Built modern web applications and cloud integrations utilizing ${provider.toUpperCase()} toolchains.`,
          technologies: ["React", "Node.js", "TypeScript"]
        }
      ],
      projects: initialProjects,
      skills: initialSkills,
      certifications: [
        {
          id: `cert_${timestamp}`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Certified Developer`,
          issuer: provider.charAt(0).toUpperCase() + provider.slice(1),
          issue_date: "2024",
          credential_url: `https://${provider}.com/verify`
        }
      ]
    };

    users.push(user);
  } else {
    // Tag user with active auth_provider
    user.auth_provider = provider;
  }

  currentUserId = user.id;

  res.json({
    success: true,
    data: {
      user,
      token: `careerlens-oauth-${provider}-${user.id}-${Date.now()}`,
      provider,
      session: {
        provider,
        authenticatedAt: new Date().toISOString(),
        authType: "OAUTH_2.0"
      }
    }
  });
});


app.post('/api/v1/auth/switch-persona', (req, res) => {
  const { userId } = req.body;
  const found = users.find(u => u.id === userId);
  if (found) {
    currentUserId = found.id;
    return res.json({ success: true, data: found });
  }
  res.status(404).json({ success: false, error: { message: "Persona not found" } });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { fullName, email, password, experienceLevel, preferredRole, location } = req.body;
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, error: { message: "Email already registered" } });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: fullName,
    email,
    phone: "",
    location: location || "India",
    experience_level: experienceLevel || "FRESHER",
    preferred_roles: preferredRole ? [preferredRole] : [],
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    expected_salary: "",
    portfolio_url: "",
    github_url: "",
    linkedin_url: ""
  };

  users.push(newUser);
  currentUserId = newUser.id;

  res.json({ 
    success: true, 
    data: { 
      user: newUser, 
      token: `careerlens-jwt-${newUser.id}` 
    } 
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const user = getCurrentUser();
  res.json({ success: true, data: user });
});

/* -------------------------------------------------------------
 * 2. PROFILE MANAGEMENT
 * ----------------------------------------------------------- */
app.get('/api/v1/profile', (req, res) => {
  const user = getCurrentUser();
  
  // Calculate profile completeness strength
  let checks = {
    personal: Boolean(user.name && user.email && user.location && user.phone),
    skills: (user.skills || []).length >= 5,
    education: (user.education || []).length >= 1,
    experience: (user.experience || []).length >= 1,
    projects: (user.projects || []).length >= 2,
    preferences: Boolean((user.preferred_roles || []).length > 0 && user.expected_salary)
  };
  
  let score = 0;
  if (checks.personal) score += 20;
  if (checks.skills) score += 20;
  if (checks.education) score += 15;
  if (checks.experience) score += 15;
  if (checks.projects) score += 20;
  if (checks.preferences) score += 10;

  res.json({
    success: true,
    data: {
      ...user,
      profileStrength: {
        score,
        checklist: checks
      }
    }
  });
});

app.put('/api/v1/profile', (req, res) => {
  const userIndex = users.findIndex(u => u.id === currentUserId);
  if (userIndex === -1) return res.status(404).json({ success: false, error: { message: "User not found" } });
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  res.json({ success: true, data: users[userIndex] });
});

app.post('/api/v1/profile/clear', (req, res) => {
  const userIndex = users.findIndex(u => u.id === currentUserId);
  if (userIndex === -1) return res.status(404).json({ success: false, error: { message: "User not found" } });
  
  users[userIndex] = {
    ...users[userIndex],
    headline: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    portfolio_url: "",
    phone: "",
    expected_salary: ""
  };
  
  res.json({ success: true, data: users[userIndex], message: "Profile data cleared to clean blank state" });
});

app.post('/api/v1/profile/skills', (req, res) => {
  const user = getCurrentUser();
  const newSkill = {
    id: `s_${Date.now()}`,
    name: req.body.name,
    category: req.body.category || 'General',
    proficiency: req.body.proficiency || 'INTERMEDIATE',
    years: Number(req.body.years) || 1,
    evidence: req.body.evidence || []
  };
  user.skills = [...(user.skills || []), newSkill];
  res.json({ success: true, data: user.skills });
});

app.delete('/api/v1/profile/skills/:id', (req, res) => {
  const user = getCurrentUser();
  user.skills = (user.skills || []).filter(s => s.id !== req.params.id);
  res.json({ success: true, data: user.skills });
});

/* -------------------------------------------------------------
 * 3. JOBS DISCOVERY & SEARCH
 * ----------------------------------------------------------- */
app.get('/api/v1/jobs', (req, res) => {
  const { query, location, workMode, source, experience, minSalary, skill, sortBy = 'match' } = req.query;
  const user = getCurrentUser();

  let results = jobs.map(job => {
    // Automatically augment with live match score
    const matchAnalysis = calculateComprehensiveMatch(user, job);
    return {
      ...job,
      matchScore: matchAnalysis.overallScore,
      isSaved: savedJobIds.includes(job.id)
    };
  });

  // Calculate dynamic facet breakdown before filter restrictions
  const facets = {
    bySource: {
      LinkedIn: results.filter(j => j.source === 'LinkedIn').length,
      Naukri: results.filter(j => j.source === 'Naukri').length,
      Indeed: results.filter(j => j.source === 'Indeed').length,
      Wellfound: results.filter(j => j.source === 'Wellfound').length
    },
    byWorkMode: {
      REMOTE: results.filter(j => j.work_mode === 'REMOTE').length,
      HYBRID: results.filter(j => j.work_mode === 'HYBRID').length,
      ON_SITE: results.filter(j => j.work_mode === 'ON_SITE').length
    },
    byLocation: {
      Hyderabad: results.filter(j => /hyderabad/i.test(j.location)).length,
      Bangalore: results.filter(j => /bangalore/i.test(j.location)).length,
      Pune: results.filter(j => /pune/i.test(j.location)).length,
      Remote: results.filter(j => /remote/i.test(j.location) || j.work_mode === 'REMOTE').length
    },
    byExperience: {
      fresher: results.filter(j => j.experience_min === 0).length,
      experienced: results.filter(j => j.experience_min > 0).length
    }
  };

  // 1. Text Query Filter (Title, Company, Skills, Location)
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.company.toLowerCase().includes(q) ||
      (j.required_skills || []).some(s => s.toLowerCase().includes(q)) ||
      (j.preferred_skills || []).some(s => s.toLowerCase().includes(q))
    );
  }

  // 2. Location Filter
  if (location && location !== 'All') {
    results = results.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
  }

  // 3. Work Mode Filter
  if (workMode && workMode !== 'ALL') {
    results = results.filter(j => j.work_mode === workMode);
  }

  // 4. Source Filter
  if (source && source !== 'ALL') {
    results = results.filter(j => j.source.toLowerCase() === source.toLowerCase());
  }

  // 5. Experience Filter
  if (experience) {
    if (experience === 'fresher') {
      results = results.filter(j => j.experience_min === 0);
    } else if (experience === 'experienced') {
      results = results.filter(j => j.experience_min > 0);
    }
  }

  // 6. Minimum Salary Filter
  if (minSalary && Number(minSalary) > 0) {
    const minVal = Number(minSalary);
    results = results.filter(j => {
      const numMin = j.salary_numeric_min || parseSalaryToNumeric(j.salary_min);
      const numMax = j.salary_numeric_max || parseSalaryToNumeric(j.salary_max);
      return numMax >= minVal || numMin >= minVal;
    });
  }

  // 7. Specific Skill Filter
  if (skill && skill !== 'ALL') {
    const sk = skill.toLowerCase();
    results = results.filter(j =>
      (j.required_skills || []).some(s => s.toLowerCase().includes(sk)) ||
      (j.preferred_skills || []).some(s => s.toLowerCase().includes(sk))
    );
  }

  // 8. Sorting
  if (sortBy === 'salary') {
    results.sort((a, b) => {
      const salB = b.salary_numeric_max || parseSalaryToNumeric(b.salary_max);
      const salA = a.salary_numeric_max || parseSalaryToNumeric(a.salary_max);
      return salB - salA;
    });
  } else if (sortBy === 'recent') {
    results.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
  } else {
    // Default: Best match percentage
    results.sort((a, b) => b.matchScore - a.matchScore);
  }

  res.json({
    success: true,
    data: {
      jobs: results,
      total: results.length,
      facets,
      ingestionStats: ingestionEngine.getStats()
    }
  });
});

app.get('/api/v1/jobs/facets', (req, res) => {
  const facets = {
    totalJobs: jobs.length,
    bySource: {
      LinkedIn: jobs.filter(j => j.source === 'LinkedIn').length,
      Naukri: jobs.filter(j => j.source === 'Naukri').length,
      Indeed: jobs.filter(j => j.source === 'Indeed').length,
      Wellfound: jobs.filter(j => j.source === 'Wellfound').length
    },
    byWorkMode: {
      REMOTE: jobs.filter(j => j.work_mode === 'REMOTE').length,
      HYBRID: jobs.filter(j => j.work_mode === 'HYBRID').length,
      ON_SITE: jobs.filter(j => j.work_mode === 'ON_SITE').length
    },
    byLocation: {
      Hyderabad: jobs.filter(j => /hyderabad/i.test(j.location)).length,
      Bangalore: jobs.filter(j => /bangalore/i.test(j.location)).length,
      Pune: jobs.filter(j => /pune/i.test(j.location)).length,
      Remote: jobs.filter(j => /remote/i.test(j.location) || j.work_mode === 'REMOTE').length
    },
    topSkills: [
      { name: 'React', count: jobs.filter(j => (j.required_skills || []).includes('React')).length },
      { name: 'Node.js', count: jobs.filter(j => (j.required_skills || []).includes('Node.js')).length },
      { name: 'PostgreSQL', count: jobs.filter(j => (j.required_skills || []).includes('PostgreSQL')).length },
      { name: 'JavaScript', count: jobs.filter(j => (j.required_skills || []).includes('JavaScript')).length },
      { name: 'TypeScript', count: jobs.filter(j => (j.required_skills || []).includes('TypeScript')).length },
      { name: 'Docker', count: jobs.filter(j => (j.preferred_skills || []).includes('Docker')).length }
    ],
    ingestionStats: ingestionEngine.getStats()
  };

  res.json({ success: true, data: facets });
});

// Single Job Ingestion via Adapter
app.post('/api/v1/jobs/ingest', (req, res) => {
  const { rawJob, source } = req.body;
  if (!rawJob) {
    return res.status(400).json({ success: false, error: { message: "rawJob payload is required" } });
  }

  const result = ingestionEngine.ingest(rawJob, source);
  if (!result.success && result.duplicate) {
    return res.status(409).json({
      success: false,
      duplicate: true,
      message: "Job listing already exists in database (SHA-256 fingerprint collision detected)",
      canonical_hash: result.canonical.canonical_hash
    });
  }

  jobs.unshift(result.job);
  res.status(201).json({
    success: true,
    data: result.job,
    stats: ingestionEngine.getStats()
  });
});

// Live Multi-Source Ingestion Sync Feed
app.post('/api/v1/jobs/sync-demo-feed', (req, res) => {
  const sampleFeed = [
    {
      source: 'LinkedIn',
      title: 'Frontend Engineer - React / TypeScript',
      company: 'Zepto',
      location: 'Bangalore, India',
      workplaceType: 'hybrid',
      salary_min: '₹12,00,000',
      salary_max: '₹18,00,000',
      experienceMin: 1,
      experienceMax: 3,
      skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Next.js'],
      skillsPreferred: ['Testing', 'GraphQL'],
      description: 'Join Zepto fast grocery delivery engineering team building reactive customer platforms.'
    },
    {
      source: 'Naukri',
      title: 'Junior Backend Developer - Microservices',
      company: 'Paytm Payments Bank',
      location: 'Delhi NCR, India',
      workMode: 'remote',
      salary_min: '₹7,50,000',
      salary_max: '₹12,00,000',
      experienceRange: { min: 0, max: 2 },
      keySkills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'REST APIs'],
      preferredSkills: ['Docker', 'AWS'],
      description: 'Engineer high-throughput idempotent financial endpoints handling 10,000+ requests per second.'
    },
    {
      source: 'Indeed',
      title: 'Associate Cloud Software Engineer',
      company: 'ThoughtWorks Technologies',
      location: 'Hyderabad, India',
      workMode: 'hybrid',
      salary_min: '₹8,50,000',
      salary_max: '₹13,50,000',
      experienceYearsMin: 0,
      experienceYearsMax: 2,
      extractedSkills: ['Java', 'Python', 'React', 'Docker', 'AWS', 'Git & GitHub'],
      description: 'Consult and build distributed enterprise applications using continuous delivery practices.'
    },
    {
      source: 'Wellfound',
      title: 'Full Stack Founding Engineer',
      company: 'Sarvam AI',
      location: 'Bangalore, India',
      remoteOk: true,
      salary_min: '₹14,00,000',
      salary_max: '₹22,00,000',
      yearsExperience: 1,
      tags: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      description: 'Building foundational Indic language GenAI models and developer developer developer platforms.'
    },
    // Intentional duplicate to test and prove SHA-256 deduplication!
    {
      source: 'LinkedIn',
      title: 'Software Engineer - Early Career / Fresher',
      company: 'ABC Technologies',
      location: 'Hyderabad, India',
      salary_min: '₹6,00,000',
      salary_max: '₹10,00,000'
    }
  ];

  const results = ingestionEngine.ingestBatch(sampleFeed);
  results.ingested.forEach(newJob => jobs.unshift(newJob));

  res.json({
    success: true,
    data: {
      newlyIngestedCount: results.ingested.length,
      duplicatesBlockedCount: results.duplicates.length,
      newJobs: results.ingested,
      stats: ingestionEngine.getStats()
    }
  });
});

app.get('/api/v1/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });
  
  const user = getCurrentUser();
  const matchAnalysis = calculateComprehensiveMatch(user, job);

  res.json({
    success: true,
    data: {
      ...job,
      isSaved: savedJobIds.includes(job.id),
      matchAnalysis
    }
  });
});

/* -------------------------------------------------------------
 * 4. AI MATCH ANALYSIS & SKILL GAPS
 * ----------------------------------------------------------- */
app.get('/api/v1/jobs/:id/match', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });
  
  const user = getCurrentUser();
  const analysis = calculateComprehensiveMatch(user, job);
  res.json({ success: true, data: analysis });
});

app.post('/api/v1/jobs/:id/simulate-match', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });

  const { customWeights = {}, simulatedSkills = [] } = req.body;
  const user = getCurrentUser();

  const baseAnalysis = calculateComprehensiveMatch(user, job);
  const simAnalysis = calculateComprehensiveMatch(user, job, customWeights, simulatedSkills);

  res.json({
    success: true,
    data: {
      jobId: job.id,
      baseScore: baseAnalysis.overallScore,
      simulatedScore: simAnalysis.overallScore,
      delta: simAnalysis.overallScore - baseAnalysis.overallScore,
      analysis: simAnalysis
    }
  });
});

app.get('/api/v1/jobs/:id/skill-gaps', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });
  
  const user = getCurrentUser();
  const analysis = calculateComprehensiveMatch(user, job);
  
  // Attach recommended learning resources for each gap
  const gapsWithResources = analysis.skillGaps.map(gap => {
    const matchedResource = learningResources.find(r => r.skill.toLowerCase() === gap.skill.toLowerCase());
    return {
      ...gap,
      resource: matchedResource || null
    };
  });

  res.json({ success: true, data: gapsWithResources });
});

app.get('/api/v1/jobs/:id/related', (req, res) => {
  const currentJob = jobs.find(j => j.id === req.params.id);
  const user = getCurrentUser();
  
  const related = jobs
    .filter(j => j.id !== req.params.id)
    .map(job => {
      const analysis = calculateComprehensiveMatch(user, job);
      return {
        ...job,
        matchScore: analysis.overallScore
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  res.json({ success: true, data: related });
});

/* -------------------------------------------------------------
 * 5. SAVED JOBS & APPLICATION TRACKER
 * ----------------------------------------------------------- */
app.get('/api/v1/saved-jobs', (req, res) => {
  const user = getCurrentUser();
  const saved = jobs.filter(j => savedJobIds.includes(j.id)).map(job => {
    const analysis = calculateComprehensiveMatch(user, job);
    return { ...job, matchScore: analysis.overallScore };
  });
  res.json({ success: true, data: saved });
});

app.post('/api/v1/saved-jobs', (req, res) => {
  const { jobId } = req.body;
  if (!savedJobIds.includes(jobId)) {
    savedJobIds.push(jobId);
  }
  res.json({ success: true, data: savedJobIds });
});

app.delete('/api/v1/saved-jobs/:id', (req, res) => {
  savedJobIds = savedJobIds.filter(id => id !== req.params.id);
  res.json({ success: true, data: savedJobIds });
});

app.get('/api/v1/applications', (req, res) => {
  res.json({ success: true, data: applications });
});

app.post('/api/v1/applications', (req, res) => {
  const { jobId, status = 'APPLIED', notes = '' } = req.body;
  const job = jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });
  
  const user = getCurrentUser();
  const analysis = calculateComprehensiveMatch(user, job);

  const newApp = {
    id: `app_${Date.now()}`,
    user_id: user.id,
    job_id: job.id,
    job_title: job.title,
    company: job.company,
    location: job.location,
    source: job.source,
    status: status,
    applied_at: new Date().toISOString().split('T')[0],
    match_score: analysis.overallScore,
    notes: notes || "Applied via original source link redirected from CareerLens."
  };

  applications.unshift(newApp);
  res.json({ success: true, data: newApp });
});

app.patch('/api/v1/applications/:id', (req, res) => {
  const appIndex = applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) return res.status(404).json({ success: false, error: { message: "Application not found" } });

  applications[appIndex] = { ...applications[appIndex], ...req.body };
  res.json({ success: true, data: applications[appIndex] });
});

app.delete('/api/v1/applications/:id', (req, res) => {
  applications = applications.filter(a => a.id !== req.params.id);
  res.json({ success: true, data: { message: "Application deleted" } });
});

/* -------------------------------------------------------------
 * 6. LEARNING RESOURCES & SKILL GAP INTELLIGENCE
 * ----------------------------------------------------------- */
let userLearningProgress = {}; // key: `${userId}_${resourceId}_${stepIndex}` -> boolean

app.get('/api/v1/learning/resources', (req, res) => {
  const { skill } = req.query;
  const user = getCurrentUser();

  let list = learningResources;
  if (skill) {
    list = list.filter(r => r.skill.toLowerCase() === skill.toLowerCase());
  }

  // Augment with user milestone progress
  const augmented = list.map(r => {
    const totalSteps = r.steps?.length || 5;
    const completedSteps = Array.from({ length: totalSteps })
      .filter((_, idx) => userLearningProgress[`${user.id}_${r.id}_${idx}`])
      .length;
    return {
      ...r,
      totalSteps,
      completedSteps,
      progressPercent: Math.round((completedSteps / totalSteps) * 100),
      isCompleted: completedSteps === totalSteps
    };
  });

  res.json({ success: true, data: augmented });
});

// Market-Wide Skill Gap Aggregator
app.get('/api/v1/learning/skill-gaps/summary', (req, res) => {
  const user = getCurrentUser();
  const gapCounts = {}; // { Docker: { count: 3, type: 'REQUIRED', jobs: [...] } }

  jobs.forEach(job => {
    const analysis = calculateComprehensiveMatch(user, job);
    analysis.skillGaps.forEach(gap => {
      const key = gap.skill;
      if (!gapCounts[key]) {
        gapCounts[key] = {
          skill: gap.skill,
          count: 0,
          importance: gap.importance,
          requirementType: gap.requirementType,
          jobs: [],
          matchedResource: learningResources.find(r => r.skill.toLowerCase() === gap.skill.toLowerCase()) || null
        };
      }
      gapCounts[key].count++;
      if (gapCounts[key].jobs.length < 3) {
        gapCounts[key].jobs.push({ id: job.id, title: job.title, company: job.company });
      }
    });
  });

  const totalJobsCount = jobs.length || 1;
  const prioritizedGaps = Object.values(gapCounts)
    .map(g => ({
      ...g,
      frequencyPercent: Math.round((g.count / totalJobsCount) * 100),
      priorityTier: g.count >= 3 ? 'CRITICAL' : g.count >= 2 ? 'HIGH' : 'MEDIUM'
    }))
    .sort((a, b) => b.count - a.count);

  const topGap = prioritizedGaps[0]?.skill || 'Docker';

  res.json({
    success: true,
    data: {
      prioritizedGaps,
      totalActiveGaps: prioritizedGaps.length,
      topRecommendation: {
        skill: topGap,
        impactStatement: `${topGap} appears in ${prioritizedGaps[0]?.frequencyPercent || 80}% of active target postings. Bridging it lifts your average match score by +10-14%.`
      }
    }
  });
});

// Save Milestone Step Progress
app.post('/api/v1/learning/progress', (req, res) => {
  const { resourceId, stepIndex, completed } = req.body;
  const user = getCurrentUser();
  const key = `${user.id}_${resourceId}_${stepIndex}`;
  userLearningProgress[key] = Boolean(completed);

  res.json({
    success: true,
    data: {
      key,
      completed: Boolean(completed)
    }
  });
});

// Claim Completed Skill to Profile with Evidence
app.post('/api/v1/learning/claim-skill', (req, res) => {
  const { skill, resourceTitle, resourceId } = req.body;
  const user = getCurrentUser();

  if (!skill) {
    return res.status(400).json({ success: false, error: { message: "Skill name is required" } });
  }

  // Check if already on profile
  const exists = (user.skills || []).some(s => s.name.toLowerCase() === skill.toLowerCase());
  if (exists) {
    return res.json({
      success: true,
      message: `${skill} is already registered on your profile.`,
      skills: user.skills
    });
  }

  const newSkill = {
    id: `s_${skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
    name: skill,
    category: ['Docker', 'AWS', 'Kubernetes'].includes(skill) ? 'DevOps' : 'Backend',
    proficiency: 'INTERMEDIATE',
    years: 1,
    evidence: [`Completed verified learning roadmap: ${resourceTitle || skill + ' Path'}`]
  };

  user.skills = [...(user.skills || []), newSkill];

  res.json({
    success: true,
    message: `Congratulations! ${skill} has been officially verified and added to your Career Profile.`,
    addedSkill: newSkill,
    skills: user.skills
  });
});

/* -------------------------------------------------------------
 * 7. AI CAREER ASSISTANT (CHAT)
 * ----------------------------------------------------------- */
app.post('/api/v1/ai/assistant/chat', (req, res) => {
  const { message } = req.body;
  const user = getCurrentUser();
  const q = (message || '').toLowerCase();

  let reply = "";
  if (q.includes("match") || q.includes("score") || q.includes("why")) {
    reply = `Based on your profile as a ${user.experience_level} with strong skills in React, Node.js, and PostgreSQL, you match highest (87-89%) with Full Stack and Frontend roles in Hyderabad and Bangalore. The main areas preventing a 95%+ score across backend roles are Docker containerization and AWS cloud deployment.`;
  } else if (q.includes("learn") || q.includes("gap") || q.includes("next")) {
    reply = `Your top recommended skill to learn next is **Docker**. It appears in 80% of your target Full Stack postings and can be mastered in about 3-5 days. Check out the verified Docker path in your Learning tab: containerize your CampusConnect LMS project and write a \`docker-compose.yml\`!`;
  } else if (q.includes("resume") || q.includes("summary") || q.includes("bullet")) {
    reply = `Here is an ATS-optimized summary tailored for your target roles:\n\n*"Motivated Full Stack Developer with hands-on expertise building responsive React frontends and scalable Node.js microservices. Proven track record engineering web platforms handling 1,200+ users and cutting API response times by 28%. Fast learner passionate about cloud-native engineering."*`;
  } else if (q.includes("job") || q.includes("apply") || q.includes("search")) {
    reply = `I found 2 immediate high-priority recommendations for you:\n1. **Software Engineer** at ABC Technologies (87% Match, Hybrid Hyderabad)\n2. **Junior Full Stack Developer** at FinFlow Labs (82% Match, Remote Bangalore)\nBoth accept freshers and actively value your React + Node.js project portfolio!`;
  } else {
    reply = `Hello ${user.name}! I am your CareerLens intelligence copilot. I continuously analyze your profile against active jobs from LinkedIn, Indeed, and Naukri. Ask me how to improve your match score, what skills to bridge next, or how to polish your resume for a specific role!`;
  }

  res.json({
    success: true,
    data: {
      reply,
      timestamp: new Date().toISOString()
    }
  });
});
/* -------------------------------------------------------------
 * 7.5 RESUME INTELLIGENCE & ATS ANALYZER
 * ----------------------------------------------------------- */
const TECH_SKILLS_TAXONOMY = [
  "React", "Node.js", "Express.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "DynamoDB", "REST APIs", "GraphQL", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "Git", "GitHub", "Linux", "Tailwind CSS", "Next.js", "Redux", "CI/CD",
  "Kafka", "WebSockets", "FastAPI", "Django", "Spring Boot", "Microservices", "HTML5", "CSS3",
  "Jest", "Vite", "SQL", "NoSQL", "DevOps", "Prisma", "System Design", "Algorithms"
];

const ACTION_VERBS = [
  "engineered", "architected", "developed", "implemented", "spearheaded", "built",
  "optimized", "reduced", "automated", "deployed", "accelerated", "overhauled",
  "mentored", "collaborated", "integrated", "refactored", "streamlined", "designed",
  "orchestrated", "delivered", "scaled", "championed"
];

app.post('/api/v1/resume/analyze', (req, res) => {
  const { resumeText = '', targetJobId = null, targetRole = '' } = req.body;
  const text = (resumeText || '').toLowerCase();

  // 1. Detect Skills
  const detectedSkills = TECH_SKILLS_TAXONOMY.filter(skill => {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(resumeText);
  });

  // 2. Detect Action Verbs
  const detectedVerbs = ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(text);
  });

  // 3. Detect Metrics & Quantifiable Achievements
  const metricRegex = /\b(\d+([.,]\d+)?%|\d{2,}\+?|\$\d+|\₹\d+|[0-9]+x|uptime|latency|users|ms|seconds)\b/gi;
  const metricMatches = (resumeText || '').match(metricRegex) || [];

  // 4. Section Presence Check
  const hasContact = /(@|phone|\+91|linkedin|github|email)/i.test(resumeText);
  const hasSummary = /(summary|profile|about me|objective)/i.test(resumeText);
  const hasSkills = /(skills|technologies|proficiencies|tech stack)/i.test(resumeText);
  const hasExperience = /(experience|employment|work history|internship)/i.test(resumeText);
  const hasProjects = /(projects|portfolio|personal projects)/i.test(resumeText);
  const hasEducation = /(education|degree|university|b\.tech|bachelor|college)/i.test(resumeText);

  const sections = [
    { name: "Contact Information", status: hasContact ? "PASS" : "WARN", detail: hasContact ? "Email, location, or portfolio links detected." : "Consider adding clear contact info & LinkedIn/GitHub." },
    { name: "Professional Summary", status: hasSummary ? "PASS" : "WARN", detail: hasSummary ? "Targeted summary section present." : "Add a 2-3 line summary emphasizing target role." },
    { name: "Technical Skills", status: hasSkills ? "PASS" : "FAIL", detail: hasSkills ? `${detectedSkills.length} tech skills categorized.` : "Add a dedicated Technical Skills section." },
    { name: "Work Experience / Internships", status: hasExperience ? "PASS" : "WARN", detail: hasExperience ? "Experience entries identified." : "Add past internships or work experience." },
    { name: "Projects Portfolio", status: hasProjects ? "PASS" : "FAIL", detail: hasProjects ? "Projects demonstrating hands-on building found." : "Add technical projects to demonstrate applied skills." },
    { name: "Education", status: hasEducation ? "PASS" : "WARN", detail: hasEducation ? "Degree & institution found." : "Include degree, institution, and graduation year." }
  ];

  // 5. Calculate Sub-Scores
  const sectionScore = Math.round(
    (sections.filter(s => s.status === 'PASS').length / sections.length) * 100
  );
  const keywordScore = Math.min(100, Math.round((detectedSkills.length / 8) * 100));
  const impactScore = Math.min(100, Math.round((metricMatches.length / 4) * 100));
  const languageScore = Math.min(100, Math.round((detectedVerbs.length / 5) * 100));

  // 6. Target Job Comparison (if provided)
  let targetJobComparison = null;
  if (targetJobId) {
    const job = jobs.find(j => j.id === targetJobId);
    if (job) {
      const required = job.required_skills || [];
      const preferred = job.preferred_skills || [];
      const allJobSkills = [...required, ...preferred];
      
      const matchedJobSkills = allJobSkills.filter(s => 
        detectedSkills.some(ds => ds.toLowerCase() === s.toLowerCase())
      );
      const missingJobSkills = allJobSkills.filter(s => 
        !detectedSkills.some(ds => ds.toLowerCase() === s.toLowerCase())
      );

      const jobMatchRate = allJobSkills.length > 0 
        ? Math.round((matchedJobSkills.length / allJobSkills.length) * 100) 
        : 85;

      targetJobComparison = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        matchRate: jobMatchRate,
        matchedSkills: matchedJobSkills,
        missingSkills: missingJobSkills
      };
    }
  }

  // 7. Overall Weighted ATS Score
  const atsScore = Math.round(
    (sectionScore * 0.30) + 
    (keywordScore * 0.25) + 
    (impactScore * 0.25) + 
    (languageScore * 0.20)
  );

  // 8. Actionable Improvement Suggestions
  const suggestions = [];
  if (impactScore < 70) {
    suggestions.push("Add quantifiable metrics (e.g. 'reduced latency by 28%', 'served 1,200+ users', '99.8% uptime') to make achievements concrete.");
  }
  if (languageScore < 70) {
    suggestions.push("Begin bullet points with strong active verbs like 'Architected', 'Engineered', 'Optimized' instead of passive phrases like 'Responsible for' or 'Helped'.");
  }
  if (detectedSkills.length < 8) {
    suggestions.push("Expand technical keywords to include frameworks, databases, and tooling relevant to your target role.");
  }
  if (!hasSummary) {
    suggestions.push("Include a concise 2-3 line Professional Summary aligned with your target job title.");
  }
  if (targetJobComparison && targetJobComparison.missingSkills.length > 0) {
    suggestions.push(`Add or highlight missing requirements for ${targetJobComparison.jobTitle}: ${targetJobComparison.missingSkills.slice(0, 3).join(', ')}.`);
  }

  res.json({
    success: true,
    data: {
      atsScore,
      subScores: {
        sections: sectionScore,
        keywords: keywordScore,
        impact: impactScore,
        language: languageScore
      },
      detectedSkills,
      detectedVerbs: detectedVerbs.map(v => v.charAt(0).toUpperCase() + v.slice(1)),
      metricsCount: metricMatches.length,
      metricExamples: metricMatches.slice(0, 5),
      detectedSections: sections,
      targetJobComparison,
      improvementSuggestions: suggestions.length > 0 ? suggestions : [
        "Resume is well-structured and highly ATS-optimized! Consider tailoring bullet points slightly for each specific application."
      ]
    }
  });
});

app.post('/api/v1/resume/enhance-bullet', (req, res) => {
  const { bulletText = '', role = 'Software Engineer' } = req.body;
  
  if (!bulletText.trim()) {
    return res.status(400).json({ success: false, error: { message: "Bullet text is required" } });
  }

  // Generate 3 variations using the Google XYZ Formula: Accomplished [X], as measured by [Y], by doing [Z]
  const variations = [
    `Architected and engineered scalable solutions, optimizing response times by 32% while maintaining 99.9% uptime.`,
    `Streamlined core workflows for ${role} domain, driving a 25% decrease in processing latency through targeted caching and query indexing.`,
    `Spearheaded the development and integration of robust microservices, delivering seamless user experiences to over 1,500+ active users.`
  ];

  // Specific heuristic adaptation
  let enhanced = bulletText;
  if (/contributed to|worked on|helped with/i.test(enhanced)) {
    enhanced = enhanced.replace(/contributed to building|worked on|helped with/i, 'Engineered');
    if (!/%|\d+/.test(enhanced)) {
      enhanced += ', improving delivery speed by 25%';
    }
  } else if (!/^(Architected|Engineered|Spearheaded|Delivered|Optimized|Implemented)/i.test(enhanced)) {
    enhanced = `Engineered and deployed ${enhanced.charAt(0).toLowerCase() + enhanced.slice(1)}, improving operational performance by 28%.`;
  }

  res.json({
    success: true,
    data: {
      original: bulletText,
      enhanced,
      alternatives: variations
    }
  });
});

app.post('/api/v1/resume/generate-summary', (req, res) => {
  const { targetRole = 'Full Stack Developer', skills = [] } = req.body;
  const skillsList = skills.length > 0 ? skills.slice(0, 4).join(', ') : 'React, Node.js, and PostgreSQL';
  
  const summary = `Results-oriented ${targetRole} with strong hands-on expertise building scalable platforms using ${skillsList}. Demonstrates proven ability to engineer robust RESTful microservices, optimize performance, and collaborate effectively in high-velocity agile teams. Dedicated to software craftsmanship and continuous learning.`;

  res.json({
    success: true,
    data: { summary }
  });
});

/* -------------------------------------------------------------
 * 8. ADMIN DASHBOARD & SYSTEM HEALTH
 * ----------------------------------------------------------- */
app.get('/api/v1/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      activeSources: [
        { name: "LinkedIn", status: "HEALTHY", lastSync: "12 mins ago", totalJobs: 1420 },
        { name: "Indeed", status: "HEALTHY", lastSync: "18 mins ago", totalJobs: 980 },
        { name: "Naukri", status: "HEALTHY", lastSync: "5 mins ago", totalJobs: 2150 },
        { name: "Wellfound", status: "HEALTHY", lastSync: "25 mins ago", totalJobs: 640 }
      ],
      totalIngestedJobs: 5190,
      deduplicatedJobs: 184,
      aiExtractionSuccessRate: "99.2%",
      averageMatchLatency: "210ms"
    }
  });
});

// Root & Health check
app.get('/health', (req, res) => {
  res.json({ status: "healthy", service: "CareerLens API", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`🚀 CareerLens API Server running on http://localhost:${PORT}`);
});
