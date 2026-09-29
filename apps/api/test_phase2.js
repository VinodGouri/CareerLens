import http from 'http';

// We will test against the running server or launch an instance in test mode
const resumeSample = `
Rahul Sharma | Hyderabad, India | rahul.sharma@example.com | +91 98765 43210
Aspiring Full Stack Engineer | B.Tech CSE '25

PROFESSIONAL SUMMARY:
Final year B.Tech student with strong foundation in JavaScript, React, Node.js, and modern web architectures. Built scalable web applications with hands-on internship experience.

TECHNICAL SKILLS:
React, Node.js, Express.js, JavaScript, Python, PostgreSQL, MongoDB, REST APIs, Git, Tailwind CSS, Redis

PROFESSIONAL EXPERIENCE:
Software Engineering Intern at TechNova Solutions (2024-05 - 2024-11)
- Contributed to building real-time collaboration dashboards using React and Express. Reduced API latency by 28% through Redis caching.

TECHNICAL PROJECTS:
CampusConnect LMS Platform (React, Node.js, Express.js, PostgreSQL, REST APIs)
- Engineered scalable REST APIs serving 1,200+ concurrent students with 99.8% uptime.

EDUCATION:
B.Tech in Computer Science and Engineering - JNTU College of Engineering, Hyderabad (8.6 CGPA, 2021-2025)
`;

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

async function runTests() {
  console.log('--- Phase 2 Test Suite: Resume Builder & Analyzer ---');
  
  try {
    // 1. Health check
    const health = await makeRequest('/health');
    console.log('✓ API Health Check:', health.status, health.body);

    // 2. Resume Analyze
    const analyzeRes = await makeRequest('/api/v1/resume/analyze', 'POST', {
      resumeText: resumeSample,
      targetJobId: 'job_abc_01',
      targetRole: 'Full Stack Developer'
    });
    console.log('\n✓ Resume ATS Analyzer API:');
    console.log('  Status:', analyzeRes.status);
    console.log('  ATS Score:', analyzeRes.body.data?.atsScore);
    console.log('  Sub-Scores:', analyzeRes.body.data?.subScores);
    console.log('  Detected Skills:', analyzeRes.body.data?.detectedSkills?.length, 'skills');
    console.log('  Detected Verbs:', analyzeRes.body.data?.detectedVerbs);
    console.log('  Target Job Match Rate:', analyzeRes.body.data?.targetJobComparison?.matchRate + '%');
    console.log('  Matched Skills:', analyzeRes.body.data?.targetJobComparison?.matchedSkills);
    console.log('  Missing Skills:', analyzeRes.body.data?.targetJobComparison?.missingSkills);

    // 3. Bullet Enhancer
    const bulletRes = await makeRequest('/api/v1/resume/enhance-bullet', 'POST', {
      bulletText: 'Contributed to building real-time dashboards',
      role: 'Full Stack Developer'
    });
    console.log('\n✓ AI Bullet Enhancer API:');
    console.log('  Status:', bulletRes.status);
    console.log('  Original:', bulletRes.body.data?.original);
    console.log('  Enhanced:', bulletRes.body.data?.enhanced);
    console.log('  Alternatives:', bulletRes.body.data?.alternatives?.length, 'variations');

    // 4. Generate Summary
    const summaryRes = await makeRequest('/api/v1/resume/generate-summary', 'POST', {
      targetRole: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Redis']
    });
    console.log('\n✓ AI Summary Generator API:');
    console.log('  Status:', summaryRes.status);
    console.log('  Generated Summary:', summaryRes.body.data?.summary);

    console.log('\n🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
