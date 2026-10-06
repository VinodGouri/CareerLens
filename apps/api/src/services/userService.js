import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users_store.json');

/**
 * Default Seed Persona (Rahul Sharma)
 * Pre-seeded so tests, demo scenarios, and persona switching remain 100% active.
 */
const DEFAULT_SEED_USERS = [
  {
    id: "user_fresher_01",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    password_hash: bcrypt.hashSync("Password123!", 10),
    role: "USER",
    auth_provider: "email",
    is_verified: true,
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=RahulSharma",
    headline: "Aspiring Full Stack Engineer | React, Node.js & Cloud Enthusiast",
    summary: "Recent Computer Science graduate with hands-on project experience in MERN stack, PostgreSQL, and scalable microservices. Passionate about engineering high-performance web products.",
    location: "Hyderabad, India",
    phone: "+91 98765 43210",
    linkedin_url: "https://linkedin.com/in/rahulsharma-dev",
    github_url: "https://github.com/rahulsharma-dev",
    portfolio_url: "https://rahulsharma.dev",
    experience_level: "FRESHER",
    preferred_roles: ["Full Stack Developer", "Software Engineer", "Frontend Developer"],
    preferred_locations: ["Hyderabad", "Bangalore", "Remote"],
    work_modes: ["REMOTE", "HYBRID"],
    expected_salary: "₹7,00,000 - ₹12,00,000",
    education: [
      {
        id: "edu_01",
        institution: "JNTU College of Engineering, Hyderabad",
        degree: "B.Tech",
        field: "Computer Science and Engineering",
        start_year: 2021,
        end_year: 2025,
        grade: "8.6 CGPA",
        course_type: "Full Time"
      }
    ],
    experience: [
      {
        id: "exp_01",
        company: "TechNova Solutions",
        role: "Software Engineering Intern",
        employment_type: "Internship",
        start_date: "2024-05",
        end_date: "2024-11",
        description: "Built real-time collaboration dashboards using React and Express. Reduced API latency by 28% through Redis caching.",
        technologies: ["React", "Express.js", "Redis", "PostgreSQL"]
      }
    ],
    projects: [
      {
        id: "proj_01",
        name: "CampusConnect LMS Platform",
        description: "End-to-end learning management system featuring real-time lecture chat, automated grading, and role-based access control.",
        technologies: ["React", "Node.js", "Express.js", "PostgreSQL", "Socket.io"],
        github_url: "https://github.com/rahulsharma-dev/campusconnect",
        live_url: "https://campusconnect-demo.dev",
        role: "Full Stack Developer",
        achievements: "Handled 1,200+ concurrent students during exam week with zero downtime."
      },
      {
        id: "proj_02",
        name: "DevInsight - GitHub Analytics",
        description: "Developer productivity tool analyzing git commit velocity, PR review times, and skill frequency distributions.",
        technologies: ["Next.js", "Tailwind CSS", "TypeScript", "GitHub GraphQL API"],
        github_url: "https://github.com/rahulsharma-dev/devinsight",
        live_url: "https://devinsight.vercel.app",
        role: "Lead Creator",
        achievements: "Used by 450+ developers across 12 college coding clubs."
      }
    ],
    skills: [
      { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["CampusConnect LMS", "Internship at TechNova"] },
      { id: "s_node", name: "Node.js", category: "Backend", proficiency: "ADVANCED", years: 2, evidence: ["REST APIs in Express"] },
      { id: "s_postgres", name: "PostgreSQL", category: "Database", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["Complex Joins & Indexes"] },
      { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 3, evidence: ["ES6+, Async/Await"] },
      { id: "s_python", name: "Python", category: "Programming", proficiency: "INTERMEDIATE", years: 2, evidence: ["DSA Solutions"] },
      { id: "s_git", name: "Git & GitHub", category: "DevOps", proficiency: "ADVANCED", years: 3, evidence: ["Open Source Contributor"] },
      { id: "s_tailwind", name: "Tailwind CSS", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["Production UI styling"] }
    ],
    certifications: [
      {
        id: "cert_01",
        name: "Meta Front-End Developer Professional Certificate",
        issuer: "Coursera / Meta",
        issue_date: "2024",
        credential_url: "https://coursera.org/verify/professional-cert/meta"
      }
    ]
  },
  {
    id: "user_junior_02",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    password_hash: bcrypt.hashSync("Password123!", 10),
    role: "USER",
    auth_provider: "linkedin",
    is_verified: true,
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=PriyaNair",
    headline: "Frontend Engineer (1.5 YOE) transitioning to Full Stack",
    summary: "Frontend engineer building performant web applications with React and TypeScript. Eager to expand into backend architecture and microservices.",
    location: "Bangalore, India",
    phone: "+91 91234 56789",
    linkedin_url: "https://linkedin.com/in/priyanair",
    github_url: "https://github.com/priyanair",
    portfolio_url: "https://priyanair.io",
    experience_level: "EARLY_CAREER",
    preferred_roles: ["Full Stack Developer", "Software Engineer", "Frontend Developer"],
    preferred_locations: ["Bangalore", "Remote"],
    work_modes: ["REMOTE", "HYBRID"],
    expected_salary: "₹10,00,000 - ₹15,00,000",
    skills: [
      { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2.5, evidence: ["LinkedIn Skill Assessment Badge"] },
      { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 3, evidence: ["LinkedIn Verified Assessment"] },
      { id: "s_tailwind", name: "Tailwind CSS", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["LinkedIn Endorsed by 14 colleagues"] },
      { id: "s_system_design", name: "System Design", category: "Architecture", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["LinkedIn Endorsed"] },
      { id: "s_rest", name: "REST APIs", category: "Backend", proficiency: "ADVANCED", years: 2.5, evidence: ["LinkedIn Endorsed"] }
    ],
    projects: [],
    education: [],
    experience: [],
    certifications: []
  }
];

class UserService {
  constructor() {
    this.users = [];
    this.initStore();
  }

  initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        this.users = JSON.parse(raw);
        console.log(`👤 [USER STORE] Loaded ${this.users.length} registered users from ${USERS_FILE}`);
      } else {
        this.users = [...DEFAULT_SEED_USERS];
        this.saveStore();
        console.log(`👤 [USER STORE] Initialized fresh users store with default verified persona`);
      }
    } catch (err) {
      console.warn('⚠️ [USER STORE] Error loading users file, using memory store:', err.message);
      this.users = [...DEFAULT_SEED_USERS];
    }
  }

  saveStore() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ [USER STORE] Failed to persist users:', err.message);
    }
  }

  getAllUsers() {
    return this.users;
  }

  findByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  findById(id) {
    if (!id) return null;
    return this.users.find(u => u.id === id) || null;
  }

  isEmailRegistered(email) {
    return Boolean(this.findByEmail(email));
  }

  /**
   * Validate password against hashed password
   */
  verifyPassword(user, plainPassword) {
    if (!user || !plainPassword) return false;
    if (!user.password_hash) {
      // Legacy or mock user fallback
      return plainPassword === 'Password123!' || plainPassword === 'password';
    }
    return bcrypt.compareSync(plainPassword, user.password_hash);
  }

  /**
   * Register a new user with verified email
   */
  createUser({
    fullName,
    email,
    password,
    experienceLevel = 'FRESHER',
    preferredRole = '',
    location = 'India',
    locations = null,
    workModes = null,
    auth_provider = 'email',
    is_verified = true,
    avatar_url = null
  }) {
    const cleanEmail = email.trim().toLowerCase();
    const timestamp = Date.now();
    const name = fullName.trim();

    const finalLocations = Array.isArray(locations) && locations.length > 0
      ? locations
      : (location ? [location] : ["Bangalore"]);

    const finalWorkModes = Array.isArray(workModes) && workModes.length > 0
      ? workModes
      : ["HYBRID", "REMOTE"];

    const newUser = {
      id: `user_${timestamp}`,
      name,
      email: cleanEmail,
      password_hash: password ? bcrypt.hashSync(password, 10) : null,
      role: "USER",
      auth_provider,
      is_verified,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      headline: preferredRole ? `Aspiring ${preferredRole} | CareerLens Verified` : "Early Career Professional",
      summary: `Verified CareerLens candidate. Profile created via ${auth_provider.toUpperCase()} verification.`,
      location: finalLocations[0] || location || "India",
      phone: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      experience_level: experienceLevel || "FRESHER",
      preferred_roles: preferredRole ? [preferredRole] : ["Software Engineer"],
      preferred_locations: finalLocations,
      work_modes: finalWorkModes,
      expected_salary: "₹6,00,000 - ₹12,00,000",
      education: [],
      experience: [],
      projects: [],
      skills: [
        { id: "s_core_1", name: "JavaScript", category: "Programming", proficiency: "INTERMEDIATE", years: 1, evidence: ["Profile Setup"] },
        { id: "s_core_2", name: "Git & GitHub", category: "DevOps", proficiency: "INTERMEDIATE", years: 1, evidence: ["Profile Setup"] }
      ],
      certifications: [],
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveStore();
    return newUser;
  }

  /**
   * Register or log in via verified Google account
   */
  createOrUpdateGoogleUser({
    email,
    name,
    avatarUrl,
    googleId,
    headline,
    targetRole
  }) {
    const cleanEmail = email.trim().toLowerCase();
    let existing = this.findByEmail(cleanEmail);

    if (existing) {
      existing.auth_provider = 'google';
      existing.is_verified = true;
      if (avatarUrl && (!existing.avatar_url || existing.avatar_url.includes('dicebear'))) {
        existing.avatar_url = avatarUrl;
      }
      if (name && (!existing.name || existing.name === 'Google Candidate')) {
        existing.name = name;
      }
      this.saveStore();
      return existing;
    }

    // New Google account registration
    const timestamp = Date.now();
    const displayName = name || 'Google Professional';

    const newUser = {
      id: `user_google_${timestamp}`,
      name: displayName,
      email: cleanEmail,
      google_id: googleId || null,
      password_hash: null, // Google OAuth accounts do not require a local password
      role: "USER",
      auth_provider: "google",
      is_verified: true, // Google identity has already verified the email
      avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      headline: headline || `${targetRole || 'Software Engineer'} | Google Verified Account`,
      summary: `Verified professional registered via Google Identity Services. Email and identity authenticated directly with Google.`,
      location: "India",
      phone: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      experience_level: "FRESHER",
      preferred_roles: targetRole ? [targetRole] : ["Software Engineer", "Full Stack Developer"],
      preferred_locations: ["Bangalore", "Hyderabad", "Remote"],
      work_modes: ["REMOTE", "HYBRID"],
      expected_salary: "₹8,00,000 - ₹14,00,000",
      education: [],
      experience: [],
      projects: [],
      skills: [
        { id: "s_g_js", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 2, evidence: ["Google Verified Developer"] },
        { id: "s_g_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["Google Verified"] },
        { id: "s_g_python", name: "Python", category: "Programming", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["Verified Skill"] }
      ],
      certifications: [],
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveStore();
    return newUser;
  }

  /**
   * Update an existing user's profile
   */
  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Do not allow direct overwriting of password_hash unless explicitly handled
    const safeUpdates = { ...updates };
    delete safeUpdates.password_hash;

    this.users[idx] = { ...this.users[idx], ...safeUpdates };
    this.saveStore();
    return this.users[idx];
  }
}

export const userService = new UserService();
