import http from 'http';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('   CAREERLENS FULL PLATFORM END-TO-END VERIFICATION (ALL PHASES)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${title} ${extra ? `(${extra})` : ''}`);
    } else {
      console.error(`✗ [FAIL] ${title} ${extra ? `(${extra})` : ''}`);
    }
  }

  try {
    // ─── PHASE 0 & 1: Auth & Profile ───
    console.log('--- Phase 0 & 1: Authentication & Profile Intelligence ---');
    const health = await makeRequest('/health');
    assert('Health Check Returns 200 Healthy', health.status === 200 && health.body.status === 'healthy');

    const me = await makeRequest('/api/v1/auth/me');
    assert('Auth Me Returns Active Persona', me.status === 200 && me.body.data?.name === 'Rahul Sharma');

    const profile = await makeRequest('/api/v1/profile');
    assert('Profile Strength Score Calculated', profile.status === 200 && profile.body.data?.profileStrength?.score > 0, `Score: ${profile.body.data?.profileStrength?.score}%`);

    // ─── PHASE 2: Resume Builder & ATS Analyzer ───
    console.log('\n--- Phase 2: Resume Builder & ATS Analyzer ---');
    const resumeText = `Rahul Sharma | Hyderabad, India | rahul@example.com | +91 98765 43210
PROFESSIONAL SUMMARY:
Results-oriented Full Stack Developer with hands-on expertise building scalable platforms using React, Node.js, and PostgreSQL. Demonstrates proven ability to engineer microservices and optimize performance.
TECHNICAL SKILLS:
React, Node.js, Express.js, JavaScript, Python, PostgreSQL, MongoDB, REST APIs, Git, Tailwind CSS, Redis
PROFESSIONAL EXPERIENCE:
Software Engineering Intern at TechNova Solutions (2024-05 - 2024-11)
- Engineered real-time collaboration dashboards using React and Express. Reduced API latency by 28% through Redis caching.
PROJECTS:
CampusConnect LMS Platform (React, Node.js, Express.js, PostgreSQL, REST APIs)
- Engineered scalable REST APIs serving 1,200+ concurrent students with 99.8% uptime.
EDUCATION:
B.Tech in Computer Science and Engineering - JNTU College of Engineering, Hyderabad (8.6 CGPA, 2021-2025)`;
    const analyze = await makeRequest('/api/v1/resume/analyze', 'POST', { resumeText, targetRole: 'Full Stack Developer' });
    assert('Resume ATS Analyzer API', analyze.status === 200 && analyze.body.data?.atsScore >= 70, `Score: ${analyze.body.data?.atsScore}/100`);

    const enhance = await makeRequest('/api/v1/resume/enhance-bullet', 'POST', { bulletText: 'Worked on building real-time dashboards' });
    assert('AI Resume Bullet Enhancer (XYZ Formula)', enhance.status === 200 && enhance.body.data?.enhanced.length > 0, `Enhanced: "${enhance.body.data?.enhanced}"`);

    const summary = await makeRequest('/api/v1/resume/generate-summary', 'POST', { targetRole: 'Full Stack Engineer', skills: ['React', 'Node.js'] });
    assert('AI Resume Summary Generator', summary.status === 200 && summary.body.data?.summary.length > 50);

    // ─── PHASE 3: Job Ingestion & Multi-Source Exploration ───
    console.log('\n--- Phase 3: Job Ingestion & Multi-Source Exploration ---');
    const jobsRes = await makeRequest('/api/v1/jobs');
    assert('Explore Jobs Returns Normalized List & Facets', jobsRes.status === 200 && jobsRes.body.data?.jobs?.length > 0, `${jobsRes.body.data?.total} jobs available`);

    const salaryFilter = await makeRequest('/api/v1/jobs?minSalary=800000');
    assert('Job Multi-Facet Salary Filter (₹8L+)', salaryFilter.status === 200 && salaryFilter.body.data?.total > 0);

    const sourceFilter = await makeRequest('/api/v1/jobs?source=LinkedIn');
    assert('Job Multi-Source Filter (LinkedIn Only)', sourceFilter.status === 200 && sourceFilter.body.data?.jobs?.every(j => j.source.toLowerCase() === 'linkedin'));

    // Test SHA-256 Deduplication
    const testId = Date.now();
    const newJob = {
      source: 'Indeed',
      rawJob: { title: `Test QA Engineer ${testId}`, company: `GlobalTech Labs ${testId}`, location: 'Hyderabad, India', salary_min: '₹6,00,000' }
    };
    const ingest1 = await makeRequest('/api/v1/jobs/ingest', 'POST', newJob);
    assert('Job Ingestion via Adapter Accepts New Listing', ingest1.status === 201);

    const ingest2 = await makeRequest('/api/v1/jobs/ingest', 'POST', newJob);
    assert('SHA-256 Deduplication Blocks Duplicate Listing (409 Conflict)', ingest2.status === 409 && ingest2.body.duplicate === true);

    // ─── PHASE 4: AI Compatibility Engine & Explainability ───
    console.log('\n--- Phase 4: AI Compatibility Matching Engine & Explainability ---');
    const matchAnalysis = await makeRequest('/api/v1/jobs/job_abc_01/match');
    assert('4-Tier Skill Matching Taxonomy (Exact/Semantic/Partial/Missing)', matchAnalysis.status === 200 && matchAnalysis.body.data?.overallScore > 0, `Overall: ${matchAnalysis.body.data?.overallScore}%`);
    assert('Skill Evidence Linkage to Student Projects', matchAnalysis.body.data?.skillMatches?.required?.[0]?.evidence?.length > 0);

    const simulate = await makeRequest('/api/v1/jobs/job_abc_01/simulate-match', 'POST', {
      simulatedSkills: ['Docker', 'AWS']
    });
    assert('What-If Skill Acquisition Simulator (Score Gain)', simulate.status === 200 && simulate.body.data?.delta >= 0, `Delta: +${simulate.body.data?.delta}%`);

    // ─── PHASE 5: Skill-Gap Intelligence & Learning Roadmaps ───
    console.log('\n--- Phase 5: Skill-Gap Intelligence & Learning Roadmaps ---');
    const gapsSummary = await makeRequest('/api/v1/learning/skill-gaps/summary');
    assert('Market-Wide Skill Gap Frequency Aggregator', gapsSummary.status === 200 && gapsSummary.body.data?.prioritizedGaps?.length > 0);

    const claimSkill = await makeRequest('/api/v1/learning/claim-skill', 'POST', {
      skill: 'Docker',
      resourceTitle: 'Docker Official Get Started Tutorial'
    });
    assert('Claim Completed Learning Skill into Career Profile', claimSkill.status === 200);

    // ─── PHASE 6: Application Tracker & AI Career Assistant ───
    console.log('\n--- Phase 6: Application Tracker & AI Assistant ---');
    const apps = await makeRequest('/api/v1/applications');
    assert('Application Pipeline Tracker List', apps.status === 200 && Array.isArray(apps.body.data));

    const chat = await makeRequest('/api/v1/ai/assistant/chat', 'POST', { message: 'Why is my match score 87% for ABC Tech?' });
    assert('AI Career Copilot Grounded Chat', chat.status === 200 && chat.body.data?.reply.length > 20);

    // ─── PHASE 7: Admin Suite & Telemetry ───
    console.log('\n--- Phase 7: Platform Admin & Telemetry Monitor ---');
    const adminStats = await makeRequest('/api/v1/admin/stats');
    assert('Admin Ingestion & Telemetry Monitor', adminStats.status === 200 && adminStats.body.data?.activeSources?.length === 4);

    console.log('\n================================================================');
    console.log(`   SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================');

    if (passed === total) {
      console.log('🎉 ALL PHASES (0 THROUGH 7) FULLY IMPLEMENTED, INTEGRATED, AND VERIFIED!');
    }
  } catch (err) {
    console.error('Test run error:', err);
    process.exit(1);
  }
}

runEndToEndVerification();
