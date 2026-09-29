// CareerLens AI Matching & Explainability Engine
// Multi-factor weighted match score conforming to PRD Section 33 formula:
// Required Skills (40%), Preferred Skills (15%), Experience (15%), Role Alignment (10%), Project Relevance (10%), Location & Mode (5%), Education (5%)

const SYNONYMS_AND_SEMANTICS = {
  "react": ["react.js", "reactjs", "frontend", "next.js", "javascript"],
  "node.js": ["nodejs", "node", "express", "express.js", "backend", "javascript"],
  "express.js": ["express", "node.js", "nodejs", "rest apis"],
  "postgresql": ["postgres", "sql", "relational database", "rdbms", "mysql", "database"],
  "mongodb": ["nosql", "database", "mongoose"],
  "javascript": ["js", "es6", "typescript"],
  "typescript": ["ts", "javascript"],
  "rest apis": ["rest", "api", "backend", "express", "fastapi", "microservices"],
  "docker": ["containers", "containerization", "devops", "kubernetes"],
  "kubernetes": ["k8s", "docker", "containers", "orchestration"],
  "aws": ["cloud", "amazon web services", "ec2", "s3", "lambda"],
  "gcp": ["google cloud", "cloud"],
  "redis": ["caching", "in-memory database", "key-value store"],
  "tailwind css": ["tailwind", "css", "responsive design", "html/css"],
  "python": ["fastapi", "django", "machine learning", "data structures", "algorithms"],
  "graphql": ["api", "rest apis", "apollo"],
  "ci/cd": ["devops", "github actions", "docker", "pipeline"],
  "testing": ["jest", "vitest", "unit testing", "react testing library"]
};

// Foundational relations for PARTIAL match detection (confidence: 0.50)
const FOUNDATIONAL_RELATIONS = {
  "typescript": ["javascript", "es6", "web development"],
  "next.js": ["react", "javascript", "html/css"],
  "fastapi": ["python"],
  "django": ["python"],
  "docker": ["linux", "git & github"],
  "kubernetes": ["docker"],
  "aws": ["linux", "rest apis"],
  "graphql": ["rest apis"],
  "redis": ["postgresql", "mongodb", "database"],
  "microservices": ["node.js", "express.js", "rest apis"],
  "ci/cd pipelines": ["git & github", "linux"]
};

function normalizeSkill(str) {
  return (str || '').toLowerCase().trim().replace(/[-_.]/g, ' ');
}

/**
 * 4-Tier Skill Matching Taxonomy:
 * 1. EXACT (1.00): direct exact skill name match
 * 2. SEMANTIC (0.85): direct synonym or ecosystem equivalent
 * 3. PARTIAL (0.50): candidate has foundational technology or evidence in projects/experience
 * 4. MISSING (0.00): no verifiable evidence
 */
export function computeSkillMatch(candidateSkills, requiredSkill, candidateProjects = [], candidateExperience = []) {
  const normRequired = normalizeSkill(requiredSkill);
  
  // 1. Exact Match
  const exact = candidateSkills.find(s => {
    const ns = normalizeSkill(s.name);
    return ns === normRequired || ns.includes(normRequired) || normRequired.includes(ns);
  });
  if (exact) {
    return {
      skill: requiredSkill,
      matchedWith: exact.name,
      matchType: "EXACT",
      confidence: 1.0,
      evidence: exact.evidence || ["Verified in Technical Skills"]
    };
  }

  // 2. Semantic Match
  const relatedList = SYNONYMS_AND_SEMANTICS[normRequired] || [];
  for (const related of relatedList) {
    const sem = candidateSkills.find(s => {
      const ns = normalizeSkill(s.name);
      return ns === related || ns.includes(related);
    });
    if (sem) {
      return {
        skill: requiredSkill,
        matchedWith: sem.name,
        matchType: "SEMANTIC",
        confidence: 0.85,
        evidence: sem.evidence || [`Demonstrated via semantic relation with ${sem.name}`]
      };
    }
  }

  // 3. Partial Match: Foundational skills or mentioned in projects/experience
  const foundationList = FOUNDATIONAL_RELATIONS[normRequired] || [];
  for (const found of foundationList) {
    const foundSkill = candidateSkills.find(s => normalizeSkill(s.name) === found || normalizeSkill(s.name).includes(found));
    if (foundSkill) {
      return {
        skill: requiredSkill,
        matchedWith: foundSkill.name,
        matchType: "PARTIAL",
        confidence: 0.50,
        evidence: [`Foundational prerequisite ${foundSkill.name} is present; transferable to ${requiredSkill}`]
      };
    }
  }

  // Check if mentioned in projects or experience text
  const projEvidence = [];
  candidateProjects.forEach(p => {
    const pText = `${p.name} ${p.description} ${(p.technologies || []).join(' ')}`.toLowerCase();
    if (pText.includes(normRequired)) {
      projEvidence.push(`Referenced in project: ${p.name}`);
    }
  });

  candidateExperience.forEach(e => {
    const eText = `${e.role} ${e.company} ${e.description} ${(e.technologies || []).join(' ')}`.toLowerCase();
    if (eText.includes(normRequired)) {
      projEvidence.push(`Mentioned in experience: ${e.company}`);
    }
  });

  if (projEvidence.length > 0) {
    return {
      skill: requiredSkill,
      matchedWith: requiredSkill,
      matchType: "PARTIAL",
      confidence: 0.50,
      evidence: projEvidence
    };
  }

  // 4. Missing
  return {
    skill: requiredSkill,
    matchedWith: null,
    matchType: "MISSING",
    confidence: 0.0,
    evidence: []
  };
}

export function calculateComprehensiveMatch(userProfile, job, customWeights = {}, simulatedSkills = []) {
  const weights = {
    requiredSkills: customWeights.requiredSkills ?? 0.40,
    preferredSkills: customWeights.preferredSkills ?? 0.15,
    experience: customWeights.experience ?? 0.15,
    roleAlignment: customWeights.roleAlignment ?? 0.10,
    projectRelevance: customWeights.projectRelevance ?? 0.10,
    location: customWeights.location ?? 0.05,
    education: customWeights.education ?? 0.05,
  };

  // Merge simulated skills if candidate is testing "What-If" scenarios
  const baseSkills = userProfile.skills || [];
  const addedSimSkills = (simulatedSkills || []).map(s => ({
    id: `sim_${s}`,
    name: s,
    category: 'Simulated',
    proficiency: 'INTERMEDIATE',
    evidence: ['Simulated Skill Acquisition']
  }));
  const userSkills = [...baseSkills, ...addedSimSkills];

  const reqSkills = job.required_skills || [];
  const prefSkills = job.preferred_skills || [];
  const userProjects = userProfile.projects || [];
  const userExp = userProfile.experience || [];

  // 1. Required Skills Score (using 4-tier confidence weights: EXACT=1.0, SEMANTIC=0.85, PARTIAL=0.50, MISSING=0.0)
  const reqMatches = reqSkills.map(s => computeSkillMatch(userSkills, s, userProjects, userExp));
  const reqEarnedPoints = reqMatches.reduce((acc, m) => acc + (m.confidence || 0), 0);
  const requiredSkillsScore = reqSkills.length > 0 ? (reqEarnedPoints / reqSkills.length) * 100 : 100;

  // 2. Preferred Skills Score
  const prefMatches = prefSkills.map(s => computeSkillMatch(userSkills, s, userProjects, userExp));
  const prefEarnedPoints = prefMatches.reduce((acc, m) => acc + (m.confidence || 0), 0);
  const preferredSkillsScore = prefSkills.length > 0 ? (prefEarnedPoints / prefSkills.length) * 100 : 80;

  // 3. Experience Score
  let experienceScore = 85;
  const userExpYears = userProfile.experience_level === 'FRESHER' ? 0.5 : 1.5;
  if (userExpYears >= (job.experience_min || 0)) {
    experienceScore = 95;
  } else {
    experienceScore = 65;
  }

  // 4. Role Alignment Score
  const userPreferredRoles = (userProfile.preferred_roles || []).map(r => r.toLowerCase());
  const jobTitle = (job.title || '').toLowerCase();
  const roleAligned = userPreferredRoles.some(r => jobTitle.includes(r.toLowerCase()) || r.toLowerCase().includes(jobTitle.split(' ')[0]));
  const roleAlignmentScore = roleAligned ? 95 : 75;

  // 5. Project Relevance Score
  let relevantProjectsCount = 0;
  for (const proj of userProjects) {
    const tech = (proj.technologies || []).map(t => normalizeSkill(t));
    const hasJobTech = reqSkills.some(rs => tech.some(t => t.includes(normalizeSkill(rs)) || normalizeSkill(rs).includes(t)));
    if (hasJobTech) relevantProjectsCount++;
  }
  const projectRelevanceScore = userProjects.length > 0 ? Math.min(100, (relevantProjectsCount / userProjects.length) * 100 + 20) : 60;

  // 6. Location & Work Mode Score
  let locationScore = 80;
  const userLocs = (userProfile.preferred_locations || []).map(l => l.toLowerCase());
  const jobLoc = (job.location || '').toLowerCase();
  if (job.work_mode === 'REMOTE' || userLocs.some(l => jobLoc.includes(l))) {
    locationScore = 100;
  } else if (job.work_mode === 'HYBRID') {
    locationScore = 85;
  }

  // 7. Education Score
  const hasDegree = (userProfile.education || []).some(e => ['B.Tech', 'B.E.', 'MCA', 'B.Sc'].some(d => (e.degree || '').includes(d)));
  const educationScore = hasDegree ? 100 : 80;

  // Overall Weighted Score
  const overallScore = Math.min(100, Math.round(
    (requiredSkillsScore * weights.requiredSkills) +
    (preferredSkillsScore * weights.preferredSkills) +
    (experienceScore * weights.experience) +
    (roleAlignmentScore * weights.roleAlignment) +
    (projectRelevanceScore * weights.projectRelevance) +
    (locationScore * weights.location) +
    (educationScore * weights.education)
  ));

  // Skill Gaps Calculation (Missing or Partial)
  const skillGaps = [];
  reqMatches.filter(m => m.matchType === "MISSING" || m.matchType === "PARTIAL").forEach(m => {
    skillGaps.push({
      skill: m.skill,
      importance: m.matchType === "MISSING" ? "HIGH" : "MEDIUM",
      requirementType: "REQUIRED",
      matchType: m.matchType,
      reason: m.matchType === "MISSING" 
        ? `Mandatory qualification for ${job.title}. Missing direct evidence.`
        : `Partial prerequisite detected (${m.matchedWith}). Strengthen with direct project implementation.`,
      recommendedAction: `Complete hands-on module and build a project feature utilizing ${m.skill}.`
    });
  });

  prefMatches.filter(m => m.matchType === "MISSING").forEach(m => {
    skillGaps.push({
      skill: m.skill,
      importance: "LOW",
      requirementType: "PREFERRED",
      matchType: "MISSING",
      reason: `Preferred qualification that sets apart top applicants at ${job.company}.`,
      recommendedAction: `Explore overview tutorials for ${m.skill} to discuss in technical interviews.`
    });
  });

  // Natural Language Fit Explanations
  const exactCount = reqMatches.filter(m => m.matchType === "EXACT").length;
  const semanticCount = reqMatches.filter(m => m.matchType === "SEMANTIC").length;
  const partialCount = reqMatches.filter(m => m.matchType === "PARTIAL").length;
  const missingCount = reqMatches.filter(m => m.matchType === "MISSING").length;

  const explanation = {
    summary: `Your profile matches ${overallScore}% of criteria for ${job.title} at ${job.company}. (${exactCount} Exact, ${semanticCount} Semantic, ${partialCount} Partial, ${missingCount} Missing).`,
    highlights: [
      `Direct exact alignment on ${exactCount} core skills: ${reqMatches.filter(m => m.matchType === 'EXACT').map(m => m.skill).join(', ') || 'foundation'}.`,
      userProjects.length > 0 ? `Portfolio contains ${relevantProjectsCount} verified projects matching tech requirements.` : 'Demonstrated practical capabilities.',
      job.work_mode === 'REMOTE' || locationScore === 100 ? `Location (${job.location}) and work mode (${job.work_mode}) match your preferences.` : `Role is in ${job.location} with ${job.work_mode} model.`
    ],
    growthOpportunities: skillGaps.length > 0
      ? `Closing high-priority gaps in ${skillGaps.slice(0, 2).map(g => g.skill).join(' and ')} can boost your match score to ~${Math.min(98, overallScore + 12)}%.`
      : `Profile is well-aligned! Focus on refining resume bullets for ATS readability.`
  };

  return {
    jobId: job.id,
    overallScore,
    weights,
    scoreBreakdown: {
      requiredSkillsScore: Math.round(requiredSkillsScore),
      preferredSkillsScore: Math.round(preferredSkillsScore),
      experienceScore: Math.round(experienceScore),
      roleAlignmentScore: Math.round(roleAlignmentScore),
      projectRelevanceScore: Math.round(projectRelevanceScore),
      locationScore: Math.round(locationScore),
      educationScore: Math.round(educationScore)
    },
    skillMatches: {
      required: reqMatches,
      preferred: prefMatches
    },
    taxonomyCounts: {
      exact: exactCount,
      semantic: semanticCount,
      partial: partialCount,
      missing: missingCount
    },
    skillGaps,
    explanation,
    simulatedSkills
  };
}
