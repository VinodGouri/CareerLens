import crypto from 'crypto';

/**
 * CareerLens Canonical Job Ingestion & Multi-Source Normalization Engine
 * 
 * Supports:
 * - LinkedIn Adapter
 * - Naukri Adapter
 * - Indeed Adapter
 * - Wellfound (AngelList) Adapter
 * 
 * Features:
 * - SHA-256 fingerprint deduplication
 * - Salary string to numeric range normalization
 * - Standardized work modes (REMOTE, HYBRID, ON_SITE)
 * - Required vs Preferred skills extraction
 */

// Helper: Convert INR salary strings to numeric values
export function parseSalaryToNumeric(salaryStr) {
  if (!salaryStr) return 0;
  // Extract numbers from "₹6,00,000" or "6 LPA" or "600000"
  const clean = salaryStr.replace(/[₹,\s]/g, '');
  if (/lpa/i.test(clean)) {
    const num = parseFloat(clean.replace(/lpa/i, ''));
    return Math.round(num * 100000);
  }
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Helper: Generate SHA-256 canonical hash for deduplication
export function generateCanonicalHash(title, company, location) {
  const normTitle = (title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normCompany = (company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normLocation = (location || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const rawKey = `${normTitle}_${normCompany}_${normLocation}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * 1. LinkedIn Source Adapter
 * Expects typical LinkedIn API / Scraping JSON structure
 */
export function linkedInAdapter(raw) {
  const title = raw.title || raw.jobTitle || 'Software Engineer';
  const company = raw.companyName || raw.company || 'Tech Company';
  const location = raw.formattedLocation || raw.location || 'Hyderabad, India';
  
  const workModeMap = {
    'on-site': 'ON_SITE',
    'remote': 'REMOTE',
    'hybrid': 'HYBRID'
  };
  const workMode = workModeMap[(raw.workplaceTypes?.[0] || raw.workplaceType || '').toLowerCase()] || 'HYBRID';
  
  const salaryMin = raw.compensation?.minSalaryFormatted || raw.salary_min || '₹6,00,000';
  const salaryMax = raw.compensation?.maxSalaryFormatted || raw.salary_max || '₹10,00,000';

  return {
    id: `job_li_${raw.jobPostingId || Date.now()}`,
    source_id: 'src_linkedin',
    source: 'LinkedIn',
    external_job_id: String(raw.jobPostingId || raw.id || `li_${Date.now()}`),
    title,
    company,
    location,
    work_mode: workMode,
    employment_type: raw.employmentStatus || 'FULL_TIME',
    experience_min: raw.experienceMin ?? 0,
    experience_max: raw.experienceMax ?? 2,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_numeric_min: parseSalaryToNumeric(salaryMin),
    salary_numeric_max: parseSalaryToNumeric(salaryMax),
    source_url: raw.jobUrl || `https://www.linkedin.com/jobs/view/${raw.jobPostingId || 'sample'}`,
    posted_at: raw.listedAt || new Date().toISOString(),
    description: raw.descriptionText || raw.description || 'Exciting software engineering role at leading tech firm.',
    responsibilities: raw.responsibilities || [
      'Build scalable web applications and microservices.',
      'Collaborate with agile cross-functional engineering pods.'
    ],
    requirements: raw.requirements || [
      'Bachelor’s degree in Computer Science or related field.',
      'Hands-on experience with modern JavaScript frameworks.'
    ],
    required_skills: raw.skillsRequired || raw.required_skills || ['React', 'JavaScript', 'Node.js', 'PostgreSQL'],
    preferred_skills: raw.skillsPreferred || raw.preferred_skills || ['Docker', 'AWS', 'Redis'],
    nice_to_have_skills: raw.skillsNiceToHave || ['CI/CD', 'GraphQL'],
    is_verified: true,
    canonical_hash: generateCanonicalHash(title, company, location)
  };
}

/**
 * 2. Naukri Source Adapter
 * Expects typical Naukri recruiter posting format
 */
export function naukriAdapter(raw) {
  const title = raw.jobTitle || raw.title || 'Full Stack Developer';
  const company = raw.companyName || raw.company || 'Enterprise Solutions';
  const location = raw.place || raw.location || 'Bangalore, India';

  let workMode = 'ON_SITE';
  if (/remote/i.test(raw.workMode || location)) workMode = 'REMOTE';
  else if (/hybrid/i.test(raw.workMode || location)) workMode = 'HYBRID';

  const salaryMin = raw.salarySnippet?.min || raw.salary_min || '₹7,00,000';
  const salaryMax = raw.salarySnippet?.max || raw.salary_max || '₹12,00,000';

  return {
    id: `job_nk_${raw.jobId || Date.now()}`,
    source_id: 'src_naukri',
    source: 'Naukri',
    external_job_id: String(raw.jobId || raw.id || `nk_${Date.now()}`),
    title,
    company,
    location,
    work_mode: workMode,
    employment_type: 'FULL_TIME',
    experience_min: raw.experienceRange?.min ?? 0,
    experience_max: raw.experienceRange?.max ?? 3,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_numeric_min: parseSalaryToNumeric(salaryMin),
    salary_numeric_max: parseSalaryToNumeric(salaryMax),
    source_url: raw.applyUrl || `https://www.naukri.com/job-listings-${raw.jobId || 'sample'}`,
    posted_at: raw.createdDate || new Date().toISOString(),
    description: raw.jobDescription || raw.description || 'Full stack engineering opportunity in high-growth team.',
    responsibilities: raw.rolesAndResponsibilities || [
      'Design RESTful web services and API endpoints.',
      'Optimize database queries and implement caching.'
    ],
    requirements: raw.candidateProfile || [
      'Proficiency in React and backend Node.js or Python.',
      'Understanding of relational database design.'
    ],
    required_skills: raw.keySkills || raw.required_skills || ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    preferred_skills: raw.preferredSkills || raw.preferred_skills || ['Docker', 'AWS', 'Redis'],
    nice_to_have_skills: ['Next.js', 'Kafka'],
    is_verified: true,
    canonical_hash: generateCanonicalHash(title, company, location)
  };
}

/**
 * 3. Indeed Source Adapter
 */
export function indeedAdapter(raw) {
  const title = raw.normTitle || raw.title || 'Junior Software Engineer';
  const company = raw.employer || raw.company || 'Innovatech Corp';
  const location = raw.city || raw.location || 'Pune, India';

  let workMode = 'HYBRID';
  if (raw.isRemote || /remote/i.test(location)) workMode = 'REMOTE';
  else if (/on-site|onsite/i.test(raw.attributes?.[0] || '')) workMode = 'ON_SITE';

  const salaryMin = raw.estimatedSalary?.minFormatted || raw.salary_min || '₹6,50,000';
  const salaryMax = raw.estimatedSalary?.maxFormatted || raw.salary_max || '₹10,50,000';

  return {
    id: `job_in_${raw.jk || Date.now()}`,
    source_id: 'src_indeed',
    source: 'Indeed',
    external_job_id: String(raw.jk || raw.id || `in_${Date.now()}`),
    title,
    company,
    location,
    work_mode: workMode,
    employment_type: 'FULL_TIME',
    experience_min: raw.experienceYearsMin ?? 0,
    experience_max: raw.experienceYearsMax ?? 2,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_numeric_min: parseSalaryToNumeric(salaryMin),
    salary_numeric_max: parseSalaryToNumeric(salaryMax),
    source_url: `https://in.indeed.com/viewjob?jk=${raw.jk || 'sample'}`,
    posted_at: raw.pubDate || new Date().toISOString(),
    description: raw.snippet || raw.description || 'Exciting early-career opportunity for tech graduates.',
    responsibilities: [
      'Collaborate on client-facing React web platforms.',
      'Participate in code reviews and test automation.'
    ],
    requirements: [
      'Strong foundational knowledge of HTML, CSS, JavaScript.',
      'Eager to learn and contribute in a fast-paced environment.'
    ],
    required_skills: raw.extractedSkills || raw.required_skills || ['JavaScript', 'React', 'HTML/CSS', 'Git & GitHub'],
    preferred_skills: raw.preferredSkills || ['Node.js', 'TypeScript'],
    nice_to_have_skills: ['Tailwind CSS', 'Vite'],
    is_verified: true,
    canonical_hash: generateCanonicalHash(title, company, location)
  };
}

/**
 * 4. Wellfound (AngelList) Source Adapter
 */
export function wellfoundAdapter(raw) {
  const title = raw.role || raw.title || 'Founding Full Stack Engineer';
  const company = raw.startupName || raw.company || 'NextGen AI Labs';
  const location = raw.city || raw.location || 'Remote, India';
  const workMode = raw.remoteOk ? 'REMOTE' : 'HYBRID';

  const salaryMin = raw.compensationRange?.min || raw.salary_min || '₹8,00,000';
  const salaryMax = raw.compensationRange?.max || raw.salary_max || '₹14,00,000';

  return {
    id: `job_wf_${raw.listingId || Date.now()}`,
    source_id: 'src_wellfound',
    source: 'Wellfound',
    external_job_id: String(raw.listingId || raw.id || `wf_${Date.now()}`),
    title,
    company,
    location,
    work_mode: workMode,
    employment_type: 'FULL_TIME',
    experience_min: raw.yearsExperience ?? 0,
    experience_max: (raw.yearsExperience ?? 0) + 2,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_numeric_min: parseSalaryToNumeric(salaryMin),
    salary_numeric_max: parseSalaryToNumeric(salaryMax),
    source_url: `https://wellfound.com/jobs/${raw.listingId || 'sample'}`,
    posted_at: raw.publishedAt || new Date().toISOString(),
    description: raw.tagline || raw.description || 'High-impact startup role working directly with founders.',
    responsibilities: [
      'Own end-to-end features from UI mockup to cloud deployment.',
      'Build responsive client interfaces and robust backend APIs.'
    ],
    requirements: [
      'High ownership mindset and passion for fast prototyping.',
      'Demonstrated portfolio projects or open-source contributions.'
    ],
    required_skills: raw.tags || raw.required_skills || ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    preferred_skills: ['Next.js', 'Docker', 'AWS'],
    nice_to_have_skills: ['AI/LLM APIs', 'Tailwind CSS'],
    is_verified: true,
    canonical_hash: generateCanonicalHash(title, company, location)
  };
}

/**
 * Master Ingestion Router: Routes raw payload to appropriate source adapter
 */
export function normalizeJobPayload(rawJob, sourceName) {
  const src = (sourceName || rawJob.source || '').toLowerCase();
  switch (src) {
    case 'linkedin':
      return linkedInAdapter(rawJob);
    case 'naukri':
      return naukriAdapter(rawJob);
    case 'indeed':
      return indeedAdapter(rawJob);
    case 'wellfound':
    case 'angellist':
      return wellfoundAdapter(rawJob);
    default:
      return linkedInAdapter(rawJob);
  }
}

/**
 * Deduplication Engine
 */
export class JobIngestionEngine {
  constructor(initialJobs = []) {
    this.seenHashes = new Set();
    this.stats = {
      totalReceived: 0,
      totalIngested: 0,
      totalDuplicatesBlocked: 0,
      bySource: {
        LinkedIn: 0,
        Naukri: 0,
        Indeed: 0,
        Wellfound: 0
      }
    };

    // Pre-populate with existing hashes
    initialJobs.forEach(j => {
      const hash = j.canonical_hash || generateCanonicalHash(j.title, j.company, j.location);
      j.canonical_hash = hash;
      j.salary_numeric_min = j.salary_numeric_min || parseSalaryToNumeric(j.salary_min);
      j.salary_numeric_max = j.salary_numeric_max || parseSalaryToNumeric(j.salary_max);
      this.seenHashes.add(hash);
      if (this.stats.bySource[j.source] !== undefined) {
        this.stats.bySource[j.source]++;
      }
      this.stats.totalIngested++;
    });
  }

  ingest(rawJob, sourceName) {
    this.stats.totalReceived++;
    const canonical = normalizeJobPayload(rawJob, sourceName);
    
    // Check SHA-256 duplicate
    if (this.seenHashes.has(canonical.canonical_hash)) {
      this.stats.totalDuplicatesBlocked++;
      return { success: false, duplicate: true, canonical };
    }

    this.seenHashes.add(canonical.canonical_hash);
    this.stats.totalIngested++;
    if (this.stats.bySource[canonical.source] !== undefined) {
      this.stats.bySource[canonical.source]++;
    }

    return { success: true, duplicate: false, job: canonical };
  }

  ingestBatch(rawJobs, sourceName) {
    const results = {
      ingested: [],
      duplicates: []
    };

    rawJobs.forEach(raw => {
      const res = this.ingest(raw, sourceName || raw.source);
      if (res.success) {
        results.ingested.push(res.job);
      } else {
        results.duplicates.push(res.canonical);
      }
    });

    return results;
  }

  getStats() {
    return { ...this.stats };
  }
}
