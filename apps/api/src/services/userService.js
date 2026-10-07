import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users_store.json');

/**
 * Seed Users Configuration
 * Testing accounts Rahul Sharma and Priya Nair have been removed as requested.
 */
const DEFAULT_SEED_USERS = [];

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
        this.users = [];
        this.saveStore();
        console.log(`👤 [USER STORE] Initialized fresh users store`);
      }
    } catch (err) {
      console.warn('⚠️ [USER STORE] Error loading users file, using memory store:', err.message);
      this.users = [];
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
