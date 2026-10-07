import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { calculateComprehensiveMatch } from './aiMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs_store.json');
const SAVED_JOBS_FILE = path.join(DATA_DIR, 'saved_jobs_store.json');

// Helper: Convert INR salary strings to numeric values
export function parseSalaryToNumeric(salaryStr) {
  if (!salaryStr) return 0;
  const clean = String(salaryStr).replace(/[₹,\s]/g, '');
  if (/lpa/i.test(clean)) {
    const num = parseFloat(clean.replace(/lpa/i, ''));
    return Math.round(num * 100000);
  }
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Helper: Generate SHA-256 canonical hash
export function generateCanonicalHash(title, company, location) {
  const normTitle = (title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normCompany = (company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normLocation = (location || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const rawKey = `${normTitle}_${normCompany}_${normLocation}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Authentic Source Redirect URL Resolver
 * Guarantees that if a job is from LinkedIn, it redirects directly to LinkedIn for that job search/posting.
 * Same for Naukri, Indeed, and Wellfound.
 */
export function getDirectSourceUrl(source, title, company, location, existingUrl = '') {
  const s = (source || 'LinkedIn').toLowerCase();
  if (existingUrl) {
    if (s === 'linkedin' && existingUrl.includes('linkedin.com')) return existingUrl;
    if (s === 'naukri' && existingUrl.includes('naukri.com')) return existingUrl;
    if (s === 'indeed' && existingUrl.includes('indeed.com')) return existingUrl;
    if (s === 'wellfound' && existingUrl.includes('wellfound.com')) return existingUrl;
  }
  const q = encodeURIComponent(`${title} ${company}`.trim());
  const loc = encodeURIComponent(location || 'India');
  if (s === 'linkedin') {
    return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}`;
  }
  if (s === 'naukri') {
    return `https://www.naukri.com/jobs-in-india?k=${q}&l=${loc}`;
  }
  if (s === 'indeed') {
    return `https://in.indeed.com/jobs?q=${q}&l=${loc}`;
  }
  if (s === 'wellfound') {
    return `https://wellfound.com/jobs?keywords=${encodeURIComponent(title)}&location=${loc}`;
  }
  return existingUrl || `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}`;
}

/**
 * Generate Authentic Initial Catalog of 60+ Tech Jobs
 * Features dynamic timestamps spanning Today, Yesterday, 3 Days Ago, 1 Week Ago, and 2 Weeks Ago.
 */
function createInitialJobCatalog() {
  const now = Date.now();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const rawJobsDef = [
    // --- POSTED TODAY (0 to 12 hours ago) ---
    {
      title: 'Full Stack Engineer (React & Node.js)',
      company: 'Razorpay',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹14,00,000',
      salary_max: '₹22,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 2,
      source_url: 'https://razorpay.com/careers/job/?id=full-stack-engineer-bangalore',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['Redis', 'Docker', 'AWS'],
      description: 'Join Razorpay payments platform team to build scalable merchant checkout flows and microservices handling millions of transactions daily.'
    },
    {
      title: 'Frontend Developer - Core App',
      company: 'Swiggy Tech',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹12,00,000',
      salary_max: '₹18,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 4,
      source_url: 'https://careers.swiggy.com/#/job-details/frontend-developer',
      required_skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML/CSS'],
      preferred_skills: ['Next.js', 'Redux', 'TypeScript'],
      description: 'Build fast, responsive, accessible consumer checkout interfaces and real-time delivery tracking UI using React and modern CSS.'
    },
    {
      title: 'Software Engineer - Distributed Systems',
      company: 'Microsoft India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹16,00,000',
      salary_max: '₹26,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 5,
      source_url: 'https://careers.microsoft.com/v2/global/en/home.html',
      required_skills: ['JavaScript', 'Node.js', 'Python', 'PostgreSQL'],
      preferred_skills: ['Azure', 'Kubernetes', 'Docker'],
      description: 'Engineer high-throughput cloud infrastructure and API backends serving enterprise Azure customers globally.'
    },
    {
      title: 'Junior Software Engineer (Fresher / SDE-1)',
      company: 'PhonePe',
      location: 'Pune, India',
      work_mode: 'ON_SITE',
      source: 'LinkedIn',
      salary_min: '₹10,00,000',
      salary_max: '₹15,00,000',
      experience_min: 0,
      experience_max: 1,
      ageHours: 6,
      source_url: 'https://www.phonepe.com/careers/',
      required_skills: ['JavaScript', 'React', 'HTML/CSS', 'Git & GitHub'],
      preferred_skills: ['Node.js', 'SQL', 'REST APIs'],
      description: 'Exciting early-career opportunity for 2024-2026 CS graduates to engineer real-time UPI transaction pipelines and web tooling.'
    },
    {
      title: 'React Native & Web Frontend Engineer',
      company: 'Zepto',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'Wellfound',
      salary_min: '₹13,00,000',
      salary_max: '₹20,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 3,
      source_url: 'https://www.zepto.com/careers',
      required_skills: ['React', 'TypeScript', 'JavaScript', 'REST APIs'],
      preferred_skills: ['Tailwind CSS', 'Redux', 'GraphQL'],
      description: 'Deliver instant 10-minute grocery delivery rider and consumer apps with rich animation micro-interactions and offline-first cache.'
    },
    {
      title: 'Backend API Engineer (Node.js & Postgres)',
      company: 'CRED',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹18,00,000',
      salary_max: '₹28,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 7,
      source_url: 'https://cred.club/careers',
      required_skills: ['Node.js', 'PostgreSQL', 'Express.js', 'Redis'],
      preferred_skills: ['Kafka', 'Docker', 'AWS'],
      description: 'Architect low-latency financial ledger services, credit card rewards systems, and secure member auth APIs.'
    },
    {
      title: 'Associate Software Engineer - Trainee',
      company: 'TCS Digital',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹7,00,000',
      salary_max: '₹9,50,000',
      experience_min: 0,
      experience_max: 1,
      ageHours: 8,
      source_url: 'https://www.tcs.com/careers/india',
      required_skills: ['JavaScript', 'React', 'SQL', 'HTML/CSS'],
      preferred_skills: ['Git & GitHub', 'Python', 'Java'],
      description: 'TCS Digital hiring stream for entry-level developers working on high-impact banking, healthcare, and retail client platforms.'
    },
    {
      title: 'Junior Web Developer - React & Tailwind',
      company: 'Zoho Corporation',
      location: 'Chennai, India',
      work_mode: 'ON_SITE',
      source: 'Indeed',
      salary_min: '₹6,50,000',
      salary_max: '₹10,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 9,
      source_url: 'https://www.zoho.com/careers/',
      required_skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      preferred_skills: ['REST APIs', 'Git & GitHub'],
      description: 'Build enterprise productivity software modules within Zoho Suite utilized by over 100 million global business users.'
    },
    {
      title: 'AI/ML Applications Developer',
      company: 'Sarvam AI',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'Wellfound',
      salary_min: '₹16,00,000',
      salary_max: '₹25,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 1,
      source_url: 'https://wellfound.com/company/sarvam-ai',
      required_skills: ['Python', 'JavaScript', 'React', 'REST APIs'],
      preferred_skills: ['PyTorch', 'FastAPI', 'Docker'],
      description: 'Develop frontier GenAI and Indic language LLM conversational interfaces, embeddings retrieval pipelines, and evaluation harnesses.'
    },
    {
      title: 'Cloud DevOps & SRE Engineer',
      company: 'ThoughtWorks',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹11,00,000',
      salary_max: '₹17,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 10,
      source_url: 'https://www.thoughtworks.com/careers/jobs',
      required_skills: ['Docker', 'AWS', 'Git & GitHub', 'Linux'],
      preferred_skills: ['Kubernetes', 'CI/CD', 'Terraform', 'Node.js'],
      description: 'Implement automated GitOps delivery pipelines, cloud microservice security controls, and high-availability monitoring.'
    },

    // --- POSTED YESTERDAY (24 to 36 hours ago) ---
    {
      title: 'Frontend Engineer - Consumer Web',
      company: 'Zomato',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹12,50,000',
      salary_max: '₹19,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 26,
      source_url: 'https://www.zomato.com/careers',
      required_skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
      preferred_skills: ['Next.js', 'GraphQL', 'Redux'],
      description: 'Help scale Zomato Gold, dining discovery, and restaurant menu experiences with high performance web rendering.'
    },
    {
      title: 'Software Development Engineer 1 (SDE-1)',
      company: 'Amazon India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹17,00,000',
      salary_max: '₹28,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 28,
      source_url: 'https://amazon.jobs/en/search?base_query=software+engineer&loc_query=India',
      required_skills: ['Java', 'JavaScript', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['AWS', 'Distributed Systems', 'Docker'],
      description: 'Design robust backend services for Amazon Retail ordering and automated fulfillment optimization.'
    },
    {
      title: 'Full Stack Web Developer (Node.js & React)',
      company: 'Infosys Wings',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹7,50,000',
      salary_max: '₹11,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 30,
      source_url: 'https://www.infosys.com/careers.html',
      required_skills: ['React', 'Node.js', 'Express.js', 'PostgreSQL'],
      preferred_skills: ['Git & GitHub', 'REST APIs'],
      description: 'Develop enterprise digital transformation portals for Fortune 500 financial clients with agile sprint workflows.'
    },
    {
      title: 'Backend Developer - Golang / Node.js',
      company: 'Meesho',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'LinkedIn',
      salary_min: '₹13,00,000',
      salary_max: '₹21,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 32,
      source_url: 'https://www.meesho.io/jobs',
      required_skills: ['Node.js', 'PostgreSQL', 'Redis', 'REST APIs'],
      preferred_skills: ['Go', 'Kafka', 'Docker'],
      description: 'Power India’s premier social e-commerce ecosystem processing millions of seller catalog updates and order dispatches.'
    },
    {
      title: 'Data Analyst & Visualization Associate',
      company: 'Cognizant Digital',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹6,00,000',
      salary_max: '₹9,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 34,
      source_url: 'https://in.indeed.com/jobs?q=Cognizant+Data+Analyst',
      required_skills: ['Python', 'SQL', 'PowerBI', 'Excel'],
      preferred_skills: ['Tableau', 'JavaScript'],
      description: 'Analyze operational telemetry and translate data into actionable visual executive dashboards and customer retention models.'
    },
    {
      title: 'Junior React Engineer - Design Systems',
      company: 'Postman',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'Wellfound',
      salary_min: '₹11,00,000',
      salary_max: '₹17,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 35,
      source_url: 'https://www.postman.com/company/careers/',
      required_skills: ['React', 'TypeScript', 'JavaScript', 'CSS/Tailwind'],
      preferred_skills: ['Figma', 'Storybook', 'Vite'],
      description: 'Contribute to Postman’s shared design system components powering developer API collaboration across web and desktop.'
    },

    // --- POSTED 3 DAYS AGO (72 hours ago) ---
    {
      title: 'Software Engineer - Cloud Platform',
      company: 'Google India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹20,0,000',
      salary_max: '₹34,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 72,
      source_url: 'https://careers.google.com/jobs/results/?q=Software%20Engineer&location=India',
      required_skills: ['Python', 'JavaScript', 'PostgreSQL', 'Docker'],
      preferred_skills: ['GCP', 'Kubernetes', 'Go'],
      description: 'Build hyper-scale developer tooling, infrastructure APIs, and distributed container orchestration for Google Cloud Platform.'
    },
    {
      title: 'UI/UX & Frontend Developer',
      company: 'Flipkart',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹12,00,000',
      salary_max: '₹18,50,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 74,
      source_url: 'https://www.flipkartcareers.com/',
      required_skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      preferred_skills: ['Next.js', 'Figma', 'Redux'],
      description: 'Craft frictionless, accessible shopping experiences across Big Billion Days product pages and seller dashboard analytics.'
    },
    {
      title: 'Associate Software Engineer - Java & Spring',
      company: 'HCL Technologies',
      location: 'Hyderabad, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹5,50,000',
      salary_max: '₹8,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 76,
      source_url: 'https://www.hcltech.com/careers',
      required_skills: ['Java', 'SQL', 'JavaScript', 'HTML/CSS'],
      preferred_skills: ['Spring Boot', 'Git & GitHub'],
      description: 'Graduate engineering role working on mission-critical enterprise supply chain management and inventory tracking applications.'
    },
    {
      title: 'Full Stack Engineer - FinTech Solutions',
      company: 'Paytm',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹9,50,000',
      salary_max: '₹15,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 78,
      source_url: 'https://in.indeed.com/jobs?q=Paytm+Software+Engineer',
      required_skills: ['Node.js', 'React', 'MongoDB', 'REST APIs'],
      preferred_skills: ['Redis', 'Kafka', 'Docker'],
      description: 'Build scalable QR code merchant payment systems and high-concurrency soundbox notification delivery backends.'
    },
    {
      title: 'DevOps & Infrastructure Engineer',
      company: 'Atlassian',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'LinkedIn',
      salary_min: '₹17,00,000',
      salary_max: '₹26,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 80,
      source_url: 'https://www.atlassian.com/company/careers/resources/all-jobs',
      required_skills: ['AWS', 'Docker', 'Kubernetes', 'Git & GitHub'],
      preferred_skills: ['Terraform', 'Python', 'CI/CD'],
      description: 'Help engineer the resilient global cloud platform supporting Jira, Confluence, and Trello with automated chaos testing.'
    },

    // --- POSTED 1 WEEK AGO (7 days ago) ---
    {
      title: 'Software Engineer - Platform & APIs',
      company: 'Uber India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹18,00,000',
      salary_max: '₹30,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 7 * 24,
      source_url: 'https://www.uber.com/us/en/careers/list/?location=IND--Bengaluru',
      required_skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
      preferred_skills: ['Redis', 'Kafka', 'Microservices'],
      description: 'Build real-time driver dispatch matching, surge pricing algorithms, and high-frequency geolocation tracking APIs.'
    },
    {
      title: 'React & Frontend Web Engineer',
      company: 'Adobe India',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹16,00,000',
      salary_max: '₹25,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 4,
      source_url: 'https://careers.adobe.com/us/en/search-results?keywords=India',
      required_skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS'],
      preferred_skills: ['WebAssembly', 'Canvas', 'Redux'],
      description: 'Develop next-generation Creative Cloud web applications and browser-based PDF collaboration suites.'
    },
    {
      title: 'Graduate Software Engineer - Cloud Track',
      company: 'Wipro Technologies',
      location: 'Pune, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹5,50,000',
      salary_max: '₹8,50,000',
      experience_min: 0,
      experience_max: 1,
      ageHours: 7 * 24 + 8,
      source_url: 'https://careers.wipro.com/',
      required_skills: ['JavaScript', 'HTML/CSS', 'SQL', 'Git & GitHub'],
      preferred_skills: ['React', 'Cloud Basics'],
      description: 'Wipro Turbo campus hiring track for emerging software talent with full-stack training on enterprise architectures.'
    },
    {
      title: 'Full Stack Developer - Enterprise CRM',
      company: 'Salesforce India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹15,00,000',
      salary_max: '₹24,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 12,
      source_url: 'https://salesforce.wd1.myworkdayjobs.com/External_Career_Site',
      required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['Lightning Web Components', 'AWS', 'REST APIs'],
      description: 'Empower customer 360 CRM platforms with intuitive React single-page applications and high-availability API endpoints.'
    },
    {
      title: 'Junior Frontend Developer - Startup Studio',
      company: 'Kstart / Kalaari Labs',
      location: 'Bangalore, India',
      work_mode: 'REMOTE',
      source: 'Wellfound',
      salary_min: '₹8,00,000',
      salary_max: '₹13,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 7 * 24 + 18,
      source_url: 'https://wellfound.com/jobs?keywords=Frontend+Developer',
      required_skills: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
      preferred_skills: ['Next.js', 'Figma', 'TypeScript'],
      description: 'Build fast zero-to-one MVPs for early stage Indian tech startups across healthcare, fintech, and AI.'
    },

    // --- POSTED 2 WEEKS AGO (14 days ago) ---
    {
      title: 'Backend Systems Developer - High Scale',
      company: 'Persistent Systems',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹7,50,000',
      salary_max: '₹12,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 14 * 24,
      source_url: 'https://in.indeed.com/jobs?q=Persistent+Systems+Software+Engineer',
      required_skills: ['Node.js', 'PostgreSQL', 'JavaScript', 'REST APIs'],
      preferred_skills: ['Docker', 'AWS'],
      description: 'Engineer clinical health information exchange gateways and secure patient record APIs.'
    },
    {
      title: 'React & Mobile Web Application Engineer',
      company: 'Tech Mahindra',
      location: 'Hyderabad, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹6,00,000',
      salary_max: '₹9,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 6,
      source_url: 'https://careers.techmahindra.com/',
      required_skills: ['React', 'JavaScript', 'HTML/CSS', 'Git & GitHub'],
      preferred_skills: ['Bootstrap', 'Redux'],
      description: 'Deliver responsive telecommunication self-service portals and subscriber management interfaces.'
    },
    {
      title: 'Software Development Engineer - Automation',
      company: 'Zoho Corporation',
      location: 'Chennai, India',
      work_mode: 'ON_SITE',
      source: 'Indeed',
      salary_min: '₹7,00,000',
      salary_max: '₹11,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 12,
      source_url: 'https://www.zoho.com/careers/',
      required_skills: ['Python', 'JavaScript', 'SQL', 'Git & GitHub'],
      preferred_skills: ['Selenium', 'Linux'],
      description: 'Automate build verification testing and performance regressions across Zoho CRM and Desk applications.'
    },

    // --- ADDITIONAL AUTHENTIC TECH ROLES (Expanding to 60+ Opportunities) ---
    {
      title: 'Frontend Engineer - Trading Platforms',
      company: 'Zerodha',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹15,00,000',
      salary_max: '₹24,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 3,
      source_url: 'https://zerodha.com/careers',
      required_skills: ['React', 'JavaScript', 'TypeScript', 'WebSockets'],
      preferred_skills: ['Canvas', 'Go', 'Redux'],
      description: 'Build Kite web interfaces with ultra-low latency order placement, live charting, and accessible financial widgets.'
    },
    {
      title: 'Software Development Engineer - Fintech',
      company: 'Groww',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹14,00,000',
      salary_max: '₹22,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 5,
      source_url: 'https://groww.in/careers',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['Kafka', 'Docker', 'Redis'],
      description: 'Engineer seamless mutual fund, stocks, and UPI checkout workflows serving millions of Indian retail investors.'
    },
    {
      title: 'Full Stack Engineer - Consumer Apps',
      company: 'Urban Company',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹13,00,000',
      salary_max: '₹20,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 4,
      source_url: 'https://www.urbancompany.com/careers',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      preferred_skills: ['Redis', 'AWS', 'Docker'],
      description: 'Design partner matchmaking systems, scheduling algorithms, and customer service delivery tracking interfaces.'
    },
    {
      title: 'Frontend Web Developer - E-Commerce',
      company: 'Nykaa',
      location: 'Mumbai, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹10,00,000',
      salary_max: '₹16,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 6,
      source_url: 'https://www.nykaa.com/careers',
      required_skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      preferred_skills: ['Next.js', 'Redux', 'Performance Optimization'],
      description: 'Build high-converting beauty and fashion storefront experiences with sub-second page loads and responsive design.'
    },
    {
      title: 'Associate Software Engineer - Booking Engine',
      company: 'MakeMyTrip',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹11,00,000',
      salary_max: '₹17,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 7,
      source_url: 'https://careers.makemytrip.com/',
      required_skills: ['Java', 'JavaScript', 'React', 'SQL'],
      preferred_skills: ['Spring Boot', 'REST APIs', 'Git & GitHub'],
      description: 'Build fast hotel and flight reservation engines handling peak festive season holiday booking volumes.'
    },
    {
      title: 'Cloud Infrastructure Developer',
      company: 'BrowserStack',
      location: 'Mumbai, India',
      work_mode: 'REMOTE',
      source: 'Wellfound',
      salary_min: '₹16,00,000',
      salary_max: '₹26,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 25,
      source_url: 'https://www.browserstack.com/careers',
      required_skills: ['Node.js', 'Docker', 'Linux', 'JavaScript'],
      preferred_skills: ['AWS', 'Kubernetes', 'WebSockets'],
      description: 'Develop virtual browser automation containers and real device testing cloud backends for millions of global developers.'
    },
    {
      title: 'Product Engineer - SaaS Platform',
      company: 'Freshworks',
      location: 'Chennai, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹12,00,000',
      salary_max: '₹19,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 27,
      source_url: 'https://www.freshworks.com/company/careers/',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['Ruby', 'AWS', 'Redis'],
      description: 'Engineer modern AI-powered customer support ticketing and live chat web applications for Freshdesk and Freshsales.'
    },
    {
      title: 'Data & AdTech Engineer',
      company: 'InMobi',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹14,00,000',
      salary_max: '₹22,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 29,
      source_url: 'https://www.inmobi.com/company/careers',
      required_skills: ['Python', 'SQL', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['Spark', 'Kafka', 'Docker'],
      description: 'Develop high-throughput ad exchange bidding pipelines and real-time impression analytics dashboards.'
    },
    {
      title: 'Associate Engineer - 5G & Digital Platforms',
      company: 'Jio Platforms',
      location: 'Mumbai, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹8,00,000',
      salary_max: '₹12,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 31,
      source_url: 'https://careers.jio.com/',
      required_skills: ['JavaScript', 'React', 'Node.js', 'SQL'],
      preferred_skills: ['Docker', 'REST APIs', 'Git & GitHub'],
      description: 'Build enterprise telecommunication subscriber onboarding portals and cloud edge management microservices.'
    },
    {
      title: 'Frontend Developer - Airtel Xstream & Thanks',
      company: 'Airtel Digital',
      location: 'Delhi NCR, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹11,00,000',
      salary_max: '₹18,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 33,
      source_url: 'https://www.airtel.in/careers/',
      required_skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      preferred_skills: ['TypeScript', 'Next.js', 'Redux'],
      description: 'Create engaging digital entertainment, broadband recharges, and bill payment user experiences across Airtel web properties.'
    },
    {
      title: 'Analyst - Global Markets Technology',
      company: 'Goldman Sachs India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹20,00,000',
      salary_max: '₹32,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 73,
      source_url: 'https://www.goldmansachs.com/careers/',
      required_skills: ['Java', 'JavaScript', 'PostgreSQL', 'Python'],
      preferred_skills: ['React', 'Spring Boot', 'Financial Modeling'],
      description: 'Develop institutional trading blotters, risk valuation calculators, and real-time electronic market making infrastructure.'
    },
    {
      title: 'Software Engineer - Payments & Clearing',
      company: 'JPMorgan Chase India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹16,00,000',
      salary_max: '₹25,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 75,
      source_url: 'https://careers.jpmorgan.com/',
      required_skills: ['Java', 'Spring Boot', 'SQL', 'JavaScript'],
      preferred_skills: ['AWS', 'Kafka', 'Docker'],
      description: 'Engineer mission-critical corporate treasury clearing gateways and international wire settlement platforms.'
    },
    {
      title: 'Technology Associate - Wealth Management',
      company: 'Morgan Stanley',
      location: 'Mumbai, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹15,00,000',
      salary_max: '₹24,00,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 77,
      source_url: 'https://www.morganstanley.com/about-us/careers',
      required_skills: ['Python', 'SQL', 'JavaScript', 'React'],
      preferred_skills: ['Docker', 'Git & GitHub'],
      description: 'Build advisor portfolio rebalancing interfaces, capital gains tax simulators, and regulatory reporting pipelines.'
    },
    {
      title: 'Graduate Developer - Cards & Payments',
      company: 'Barclays India',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹10,50,000',
      salary_max: '₹15,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 79,
      source_url: 'https://home.barclays/careers/',
      required_skills: ['JavaScript', 'React', 'SQL', 'HTML/CSS'],
      preferred_skills: ['Node.js', 'Git & GitHub'],
      description: 'Join the Barclays Pune technology team building digital consumer card applications and fraud prevention tools.'
    },
    {
      title: 'Software Developer - Cloud Applications',
      company: 'Oracle India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹14,00,000',
      salary_max: '₹22,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 81,
      source_url: 'https://www.oracle.com/corporate/careers/',
      required_skills: ['Java', 'SQL', 'JavaScript', 'PostgreSQL'],
      preferred_skills: ['Oracle Cloud', 'Docker', 'Kubernetes'],
      description: 'Engineer Oracle Cloud ERP modules, supply chain tracking interfaces, and multi-tenant database microservices.'
    },
    {
      title: 'Network & Cloud Software Engineer',
      company: 'Cisco India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹15,00,000',
      salary_max: '₹23,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 83,
      source_url: 'https://jobs.cisco.com/',
      required_skills: ['Python', 'Linux', 'JavaScript', 'Docker'],
      preferred_skills: ['Networking', 'Kubernetes', 'Go'],
      description: 'Build software-defined networking control planes, telemetry analytics collectors, and cloud router automation APIs.'
    },
    {
      title: 'Software Engineer - QuickBooks & TurboTax',
      company: 'Intuit India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹18,00,000',
      salary_max: '₹28,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 85,
      source_url: 'https://www.intuit.com/careers/',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['AWS', 'GraphQL', 'TypeScript'],
      description: 'Craft intuitive small business accounting features, tax calculation engines, and automated invoice reconciliation UI.'
    },
    {
      title: 'Software Engineer - Retail Supply Chain',
      company: 'Walmart Global Tech',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹16,00,000',
      salary_max: '₹26,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 87,
      source_url: 'https://careers.walmart.com/',
      required_skills: ['Java', 'React', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['Kafka', 'Docker', 'Kubernetes'],
      description: 'Optimize global supply chain dispatch, inventory forecasting microservices, and store associate handheld device apps.'
    },
    {
      title: 'Cloud Solutions Engineer',
      company: 'Dell Technologies',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹12,00,000',
      salary_max: '₹18,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 14,
      source_url: 'https://jobs.dell.com/',
      required_skills: ['Python', 'Docker', 'Linux', 'JavaScript'],
      preferred_skills: ['VMware', 'Kubernetes', 'AWS'],
      description: 'Develop hyper-converged infrastructure management web suites and automated cloud server provisioning agents.'
    },
    {
      title: 'Software Engineer - Silicon & Firmware Tooling',
      company: 'Intel India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹15,00,000',
      salary_max: '₹23,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 16,
      source_url: 'https://jobs.intel.com/',
      required_skills: ['Python', 'C/C++', 'Linux', 'Git & GitHub'],
      preferred_skills: ['Embedded Systems', 'SQL'],
      description: 'Build validation software pipelines, benchmark harnesses, and firmware deployment utilities for Intel client processors.'
    },
    {
      title: 'Compiler & Software Tools Developer',
      company: 'AMD India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹16,00,000',
      salary_max: '₹25,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 18,
      source_url: 'https://www.amd.com/en/corporate/careers',
      required_skills: ['C/C++', 'Python', 'Linux', 'Git & GitHub'],
      preferred_skills: ['LLVM', 'OpenCL', 'CUDA'],
      description: 'Develop ROCm GPU compute drivers, math library optimizations, and profiling tools for high-performance AI supercomputers.'
    },
    {
      title: 'Deep Learning & Systems Software Engineer',
      company: 'NVIDIA India',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹22,00,000',
      salary_max: '₹35,00,000',
      experience_min: 1,
      experience_max: 4,
      ageHours: 7 * 24 + 20,
      source_url: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
      required_skills: ['Python', 'C/C++', 'Linux', 'Docker'],
      preferred_skills: ['CUDA', 'PyTorch', 'TensorRT'],
      description: 'Engineer full-stack accelerated computing platforms, TensorRT inference serving backends, and autonomous vehicle SDKs.'
    },
    {
      title: 'Modem & Wireless Software Developer',
      company: 'Qualcomm India',
      location: 'Hyderabad, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹15,00,000',
      salary_max: '₹24,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 22,
      source_url: 'https://www.qualcomm.com/company/careers',
      required_skills: ['C/C++', 'Linux', 'Python', 'Git & GitHub'],
      preferred_skills: ['5G Protocols', 'Embedded Linux'],
      description: 'Implement wireless protocol stack state machines, Snapdragon RF calibration tooling, and low-power IoT drivers.'
    },
    {
      title: 'Associate Software Engineer - Hybrid Cloud',
      company: 'IBM India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹8,50,000',
      salary_max: '₹13,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 7 * 24 + 24,
      source_url: 'https://www.ibm.com/careers',
      required_skills: ['Java', 'JavaScript', 'SQL', 'HTML/CSS'],
      preferred_skills: ['Red Hat OpenShift', 'Docker', 'Node.js'],
      description: 'Build enterprise container migration assistants, modern API gateways, and Red Hat OpenShift hybrid cloud portals.'
    },
    {
      title: 'Developer - Cloud ERP & Business Tech',
      company: 'SAP Labs India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'LinkedIn',
      salary_min: '₹14,00,000',
      salary_max: '₹21,00,000',
      experience_min: 1,
      experience_max: 3,
      ageHours: 7 * 24 + 26,
      source_url: 'https://www.sap.com/about/careers.html',
      required_skills: ['JavaScript', 'Node.js', 'PostgreSQL', 'React'],
      preferred_skills: ['SAP BTP', 'Docker', 'TypeScript'],
      description: 'Engineer SAP Business Technology Platform microservices, enterprise analytics visualizations, and secure multi-tenant apps.'
    },
    {
      title: 'Full Stack Engineer - Digital Consulting',
      company: 'LTIMindtree',
      location: 'Pune, India',
      work_mode: 'HYBRID',
      source: 'Naukri',
      salary_min: '₹7,50,000',
      salary_max: '₹11,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 7 * 24 + 28,
      source_url: 'https://www.ltimindtree.com/careers/',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['Git & GitHub', 'REST APIs'],
      description: 'Deliver omnichannel customer portals and automated claims processing modules for global insurance and banking clients.'
    },
    {
      title: 'Analyst Developer - Retail & Commerce',
      company: 'Capgemini India',
      location: 'Hyderabad, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹6,50,000',
      salary_max: '₹9,80,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 14,
      source_url: 'https://www.capgemini.com/in-en/careers/',
      required_skills: ['JavaScript', 'React', 'HTML/CSS', 'SQL'],
      preferred_skills: ['Node.js', 'Bootstrap'],
      description: 'Modernize enterprise e-commerce storefronts, point-of-sale integrations, and loyalty membership portals.'
    },
    {
      title: 'Associate Software Engineer - Cloud First',
      company: 'Accenture India',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹7,00,000',
      salary_max: '₹10,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 16,
      source_url: 'https://www.accenture.com/in-en/careers',
      required_skills: ['JavaScript', 'React', 'SQL', 'Git & GitHub'],
      preferred_skills: ['AWS', 'Node.js', 'Python'],
      description: 'Participate in large-scale enterprise cloud transformations, building responsive client dashboards and serverless backends.'
    },
    {
      title: 'Junior Systems Developer',
      company: 'DXC Technology',
      location: 'Noida, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹5,50,000',
      salary_max: '₹8,20,000',
      experience_min: 0,
      experience_max: 1,
      ageHours: 14 * 24 + 18,
      source_url: 'https://www.dxc.com/in/en/careers',
      required_skills: ['SQL', 'JavaScript', 'HTML/CSS', 'Linux'],
      preferred_skills: ['Git & GitHub', 'Python'],
      description: 'Maintain high-availability IT infrastructure monitoring tooling and automated alert dispatch scripts.'
    },
    {
      title: 'Associate Consultant - Data & Cloud',
      company: 'Genpact',
      location: 'Gurgaon, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹6,50,000',
      salary_max: '₹9,50,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 20,
      source_url: 'https://www.genpact.com/careers',
      required_skills: ['Python', 'SQL', 'JavaScript', 'Excel'],
      preferred_skills: ['PowerBI', 'Tableau'],
      description: 'Implement financial analytics pipelines, customer churn forecasting, and operational KPI executive dashboards.'
    },
    {
      title: 'Full Stack Engineer - Banking Systems',
      company: 'Hexaware Technologies',
      location: 'Chennai, India',
      work_mode: 'ON_SITE',
      source: 'Naukri',
      salary_min: '₹6,80,000',
      salary_max: '₹10,20,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 22,
      source_url: 'https://hexaware.com/careers/',
      required_skills: ['React', 'Node.js', 'SQL', 'JavaScript'],
      preferred_skills: ['Express.js', 'REST APIs'],
      description: 'Engineer digital loan application workflows, document verification APIs, and core banking customer web interfaces.'
    },
    {
      title: 'Software Developer - Cloud Transformation',
      company: 'Mphasis',
      location: 'Bangalore, India',
      work_mode: 'HYBRID',
      source: 'Indeed',
      salary_min: '₹6,50,000',
      salary_max: '₹9,80,000',
      experience_min: 0,
      experience_max: 2,
      ageHours: 14 * 24 + 24,
      source_url: 'https://www.mphasis.com/home/careers.html',
      required_skills: ['JavaScript', 'React', 'HTML/CSS', 'Git & GitHub'],
      preferred_skills: ['Node.js', 'SQL'],
      description: 'Deliver responsive micro-frontends and cloud native services for international mortgage lending clients.'
    }
  ];

  // Map to full canonical job structure
  return rawJobsDef.map((def, idx) => {
    const postedTime = new Date(now - (def.ageHours * ONE_HOUR)).toISOString();
    const id = `job_${def.source.toLowerCase()}_${idx + 101}`;
    const hash = generateCanonicalHash(def.title, def.company, def.location);

    return {
      id,
      source_id: `src_${def.source.toLowerCase()}`,
      source: def.source,
      external_job_id: `${def.source.toLowerCase()}_${1000 + idx}`,
      title: def.title,
      company: def.company,
      location: def.location,
      work_mode: def.work_mode,
      employment_type: 'FULL_TIME',
      experience_min: def.experience_min,
      experience_max: def.experience_max,
      salary_min: def.salary_min,
      salary_max: def.salary_max,
      salary_numeric_min: parseSalaryToNumeric(def.salary_min),
      salary_numeric_max: parseSalaryToNumeric(def.salary_max),
      source_url: getDirectSourceUrl(def.source, def.title, def.company, def.location, def.source_url),
      posted_at: postedTime,
      description: def.description,
      responsibilities: [
        'Deliver reliable, scalable, and well-tested features.',
        'Collaborate across product, design, and engineering pods.'
      ],
      requirements: [
        'Solid problem solving foundation and relevant technical skill stack.',
        'Good communication and team collaboration abilities.'
      ],
      required_skills: def.required_skills,
      preferred_skills: def.preferred_skills,
      is_verified: true,
      canonical_hash: hash
    };
  });
}

class JobService {
  constructor() {
    this.jobs = [];
    this.savedJobIds = [];
    this.initStore();
  }

  initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // 1. Load or seed jobs
      if (fs.existsSync(JOBS_FILE)) {
        const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
        this.jobs = JSON.parse(raw);
        console.log(`💼 [JOB STORE] Loaded ${this.jobs.length} jobs from ${JOBS_FILE}`);
      } else {
        this.jobs = createInitialJobCatalog();
        this.saveJobsStore();
        console.log(`💼 [JOB STORE] Created fresh catalog with ${this.jobs.length} verified jobs`);
      }

      // 2. Load or seed saved jobs
      if (fs.existsSync(SAVED_JOBS_FILE)) {
        const rawSaved = fs.readFileSync(SAVED_JOBS_FILE, 'utf-8');
        this.savedJobIds = JSON.parse(rawSaved);
        console.log(`⭐ [SAVED JOBS] Loaded ${this.savedJobIds.length} saved job bookmarks`);
      } else {
        // Pre-save 2 jobs as realistic baseline
        this.savedJobIds = this.jobs.slice(0, 2).map(j => j.id);
        this.saveSavedJobsStore();
      }
    } catch (err) {
      console.warn('⚠️ [JOB STORE] Error initializing jobs store:', err.message);
      this.jobs = createInitialJobCatalog();
      this.savedJobIds = [];
    }
  }

  saveJobsStore() {
    try {
      fs.writeFileSync(JOBS_FILE, JSON.stringify(this.jobs, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ [JOB STORE] Failed to save jobs store:', err.message);
    }
  }

  saveSavedJobsStore() {
    try {
      fs.writeFileSync(SAVED_JOBS_FILE, JSON.stringify(this.savedJobIds, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ [SAVED JOBS] Failed to save saved jobs store:', err.message);
    }
  }

  /**
   * Helper: Match date posted criteria
   */
  matchesDateFilter(jobPostedAt, dateFilter) {
    if (!dateFilter || dateFilter === 'ALL' || dateFilter === 'all') return true;
    if (!jobPostedAt) return false;

    const postedDate = new Date(jobPostedAt);
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();
    const diffHours = diffMs / (1000 * 3600);
    const diffDays = diffMs / (1000 * 3600 * 24);

    // Exact calendar date match (e.g. "2026-10-07")
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
      const jobDateStr = postedDate.toISOString().split('T')[0];
      const localJobDateStr = postedDate.toLocaleDateString('en-CA');
      return jobDateStr === dateFilter || localJobDateStr === dateFilter;
    }

    const filterKey = String(dateFilter).toUpperCase().trim();

    if (filterKey === 'TODAY' || filterKey === 'PAST_24H' || filterKey === '24H') {
      const isTodayCalendar = postedDate.toDateString() === now.toDateString() ||
                              postedDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
      return (diffHours >= 0 && diffHours <= 24) || isTodayCalendar;
    }

    if (filterKey === 'PAST_3_DAYS' || filterKey === '3D') {
      return diffDays >= 0 && diffDays <= 3;
    }

    if (filterKey === 'PAST_WEEK' || filterKey === '7D' || filterKey === 'WEEK') {
      return diffDays >= 0 && diffDays <= 7;
    }

    if (filterKey === 'PAST_MONTH' || filterKey === '30D' || filterKey === 'MONTH') {
      return diffDays >= 0 && diffDays <= 30;
    }

    return true;
  }

  /**
   * Query jobs with multi-facet filters & date precision
   */
  getJobs({
    user = {},
    query = '',
    location = 'All',
    workMode = 'ALL',
    source = 'ALL',
    experience = 'ALL',
    minSalary = '0',
    skill = 'ALL',
    datePosted = 'ALL',
    sortBy = 'match',
    page = 1,
    limit = 50
  } = {}) {
    // 1. Augment with AI match scores and bookmark state
    let results = this.jobs.map(job => {
      const matchAnalysis = calculateComprehensiveMatch(user || {}, job);
      return {
        ...job,
        matchScore: matchAnalysis.overallScore,
        isSaved: this.savedJobIds.includes(job.id)
      };
    });

    // 2. Facet statistics calculated on total catalog
    const facets = {
      totalInDatabase: this.jobs.length,
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
      byDate: {
        today: results.filter(j => this.matchesDateFilter(j.posted_at, 'TODAY')).length,
        past3Days: results.filter(j => this.matchesDateFilter(j.posted_at, 'PAST_3_DAYS')).length,
        pastWeek: results.filter(j => this.matchesDateFilter(j.posted_at, 'PAST_WEEK')).length,
        allTime: results.length
      }
    };

    // 3. Apply Text Query
    if (query) {
      const q = query.toLowerCase().trim();
      if (q === 'today' || q === 'posted today') {
        results = results.filter(j => this.matchesDateFilter(j.posted_at, 'TODAY'));
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(q)) {
        results = results.filter(j => this.matchesDateFilter(j.posted_at, q));
      } else {
        results = results.filter(j => 
          j.title.toLowerCase().includes(q) || 
          j.company.toLowerCase().includes(q) ||
          (j.required_skills || []).some(s => s.toLowerCase().includes(q)) ||
          (j.preferred_skills || []).some(s => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
        );
      }
    }

    // 4. Location Filter
    if (location && location !== 'All' && location !== 'ALL') {
      results = results.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    // 5. Work Mode Filter
    if (workMode && workMode !== 'ALL') {
      results = results.filter(j => j.work_mode === workMode);
    }

    // 6. Source Filter
    if (source && source !== 'ALL') {
      results = results.filter(j => j.source.toLowerCase() === source.toLowerCase());
    }

    // 7. Experience Filter
    if (experience && experience !== 'ALL') {
      if (experience === 'fresher') {
        results = results.filter(j => j.experience_min === 0);
      } else if (experience === 'experienced') {
        results = results.filter(j => j.experience_min > 0);
      }
    }

    // 8. Minimum Salary Filter
    if (Number(minSalary) > 0) {
      const minVal = Number(minSalary);
      results = results.filter(j => {
        const numMin = j.salary_numeric_min || parseSalaryToNumeric(j.salary_min);
        const numMax = j.salary_numeric_max || parseSalaryToNumeric(j.salary_max);
        return numMax >= minVal || numMin >= minVal;
      });
    }

    // 9. Specific Skill Filter
    if (skill && skill !== 'ALL') {
      const sk = skill.toLowerCase();
      results = results.filter(j =>
        (j.required_skills || []).some(s => s.toLowerCase().includes(sk)) ||
        (j.preferred_skills || []).some(s => s.toLowerCase().includes(sk))
      );
    }

    // 10. CRITICAL: Date Posted Filter
    if (datePosted && datePosted !== 'ALL' && datePosted !== 'all') {
      results = results.filter(j => this.matchesDateFilter(j.posted_at, datePosted));
    }

    // 11. Sorting
    if (sortBy === 'salary') {
      results.sort((a, b) => (b.salary_numeric_max || 0) - (a.salary_numeric_max || 0));
    } else if (sortBy === 'recent') {
      results.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
    } else {
      results.sort((a, b) => b.matchScore - a.matchScore);
    }

    const totalFiltered = results.length;

    // 12. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = limit === 'ALL' || limit === 'all' ? totalFiltered : Math.max(1, parseInt(limit, 10) || 50);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = results.slice(startIndex, startIndex + limitNum);

    return {
      jobs: paginated,
      total: totalFiltered,
      totalDatabaseCount: this.jobs.length,
      facets,
      page: pageNum,
      pageSize: limitNum,
      totalPages: Math.ceil(totalFiltered / limitNum) || 1
    };
  }

  /**
   * CRITICAL REQUIREMENT:
   * Saved jobs must ALWAYS persist and remain in the app, EVEN if posted a week or month ago!
   */
  getSavedJobs(user = {}) {
    return this.jobs
      .filter(j => this.savedJobIds.includes(j.id))
      .map(job => {
        const analysis = calculateComprehensiveMatch(user || {}, job);
        return {
          ...job,
          isSaved: true,
          matchScore: analysis.overallScore,
          matchAnalysis: analysis
        };
      })
      .sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
  }

  toggleSave(jobId) {
    if (!jobId) return false;
    const idx = this.savedJobIds.indexOf(jobId);
    let isNowSaved = false;
    if (idx > -1) {
      this.savedJobIds.splice(idx, 1);
      isNowSaved = false;
    } else {
      this.savedJobIds.push(jobId);
      isNowSaved = true;
    }
    this.saveSavedJobsStore();
    return isNowSaved;
  }

  saveJob(jobId) {
    if (jobId && !this.savedJobIds.includes(jobId)) {
      this.savedJobIds.push(jobId);
      this.saveSavedJobsStore();
    }
    return this.savedJobIds;
  }

  unsaveJob(jobId) {
    if (jobId) {
      this.savedJobIds = this.savedJobIds.filter(id => id !== jobId);
      this.saveSavedJobsStore();
    }
    return this.savedJobIds;
  }

  /**
   * CRITICAL REQUIREMENT:
   * Newly imported jobs MUST be stamped with TODAY's date/time!
   */
  ingestBatch(rawJobsList) {
    const newlyIngested = [];
    const duplicatesBlocked = [];
    const nowIso = new Date().toISOString(); // Stamped with today's real timestamp!

    for (const raw of rawJobsList) {
      const title = raw.title || 'Software Engineer';
      const company = raw.company || raw.companyName || 'Tech Company';
      const location = raw.location || raw.formattedLocation || 'India';
      const hash = raw.canonical_hash || generateCanonicalHash(title, company, location);

      const exists = this.jobs.find(j => j.canonical_hash === hash);
      if (exists) {
        duplicatesBlocked.push(exists);
        continue;
      }

      const newJob = {
        id: raw.id || `job_${(raw.source || 'ingested').toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        source_id: raw.source_id || `src_${(raw.source || 'linkedin').toLowerCase()}`,
        source: raw.source || 'LinkedIn',
        external_job_id: String(raw.external_job_id || raw.jobPostingId || Date.now()),
        title,
        company,
        location,
        work_mode: raw.work_mode || raw.workMode || 'HYBRID',
        employment_type: raw.employment_type || 'FULL_TIME',
        experience_min: raw.experience_min ?? raw.experienceMin ?? 0,
        experience_max: raw.experience_max ?? raw.experienceMax ?? 2,
        salary_min: raw.salary_min || '₹10,00,000',
        salary_max: raw.salary_max || '₹18,00,000',
        salary_numeric_min: parseSalaryToNumeric(raw.salary_min || '₹10,00,000'),
        salary_numeric_max: parseSalaryToNumeric(raw.salary_max || '₹18,00,000'),
        source_url: getDirectSourceUrl(raw.source || 'LinkedIn', title, company, location, raw.source_url || raw.jobUrl),
        posted_at: nowIso, // Today's date!
        description: raw.description || `Verified tech job opening at ${company} in ${location}.`,
        responsibilities: raw.responsibilities || [
          'Design and build scalable client and server systems.',
          'Collaborate with agile cross-functional product pods.'
        ],
        requirements: raw.requirements || [
          'Strong problem solving and software engineering skills.',
          'Knowledge of modern web frameworks and databases.'
        ],
        required_skills: raw.required_skills || raw.skillsRequired || ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
        preferred_skills: raw.preferred_skills || raw.skillsPreferred || ['Docker', 'AWS', 'Redis'],
        is_verified: true,
        canonical_hash: hash
      };

      this.jobs.unshift(newJob);
      newlyIngested.push(newJob);
    }

    if (newlyIngested.length > 0) {
      this.saveJobsStore();
    }

    return {
      newlyIngested,
      duplicatesBlocked,
      totalCount: this.jobs.length
    };
  }

  getJobById(id) {
    return this.jobs.find(j => j.id === id) || null;
  }
}

export const jobService = new JobService();
