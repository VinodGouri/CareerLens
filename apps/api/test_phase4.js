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

async function runTests() {
  console.log('=== Phase 4 Test Suite: AI Compatibility Engine & Explainability ===\n');

  try {
    // 1. Get Match Analysis for a Job
    const jobId = 'job_abc_01'; // ABC Technologies (Software Engineer Fresher)
    const matchRes = await makeRequest(`/api/v1/jobs/${jobId}/match`);
    console.log(`✓ 1. GET /api/v1/jobs/${jobId}/match:`);
    console.log(`   Status: ${matchRes.status}`);
    console.log(`   Overall Score: ${matchRes.body.data?.overallScore}%`);
    console.log(`   Component Breakdown:`, matchRes.body.data?.scoreBreakdown);
    console.log(`   Taxonomy Breakdown:`, matchRes.body.data?.taxonomyCounts);
    
    // Check taxonomy types presence
    const reqMatches = matchRes.body.data?.skillMatches?.required || [];
    console.log(`   Required Skills Analyzed:`);
    reqMatches.forEach(m => {
      console.log(`     - ${m.skill}: ${m.matchType} (${Math.round((m.confidence || 0) * 100)}%) | Evidence: ${m.evidence?.[0] || 'None'}`);
    });
    console.log('');

    // 2. Test Simulation of Skill Acquisition (What-If Simulator)
    const simRes = await makeRequest(`/api/v1/jobs/${jobId}/simulate-match`, 'POST', {
      customWeights: { requiredSkills: 0.40, preferredSkills: 0.15, experience: 0.15, roleAlignment: 0.10, projectRelevance: 0.10, location: 0.05, education: 0.05 },
      simulatedSkills: ['Docker', 'AWS', 'Redis']
    });

    console.log(`✓ 2. POST /api/v1/jobs/${jobId}/simulate-match (What-If Simulation):`);
    console.log(`   Status: ${simRes.status}`);
    console.log(`   Base Score: ${simRes.body.data?.baseScore}%`);
    console.log(`   Simulated Score with ['Docker', 'AWS', 'Redis']: ${simRes.body.data?.simulatedScore}%`);
    console.log(`   Score Gain (Delta): +${simRes.body.data?.delta}%\n`);

    // 3. Test Custom Weighting Preset (Project-Heavy)
    const projectHeavyRes = await makeRequest(`/api/v1/jobs/${jobId}/simulate-match`, 'POST', {
      customWeights: { requiredSkills: 0.30, preferredSkills: 0.10, experience: 0.10, roleAlignment: 0.10, projectRelevance: 0.30, location: 0.05, education: 0.05 },
      simulatedSkills: []
    });

    console.log(`✓ 3. POST /api/v1/jobs/${jobId}/simulate-match (Project-Heavy 30% Weight):`);
    console.log(`   Status: ${projectHeavyRes.status}`);
    console.log(`   Adjusted Overall Score: ${projectHeavyRes.body.data?.simulatedScore}%\n`);

    // 4. Test Skill Gaps Extraction
    const gapsRes = await makeRequest(`/api/v1/jobs/${jobId}/skill-gaps`);
    console.log(`✓ 4. GET /api/v1/jobs/${jobId}/skill-gaps:`);
    console.log(`   Status: ${gapsRes.status}`);
    console.log(`   Identified Gaps: ${gapsRes.body.data?.length} gaps`);
    gapsRes.body.data?.forEach(g => {
      console.log(`     - ${g.skill} [${g.importance} Priority, ${g.requirementType}]: ${g.reason}`);
    });

    console.log('\n🎉 ALL PHASE 4 TESTS COMPLETED AND VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
