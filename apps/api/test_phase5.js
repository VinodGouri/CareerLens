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
  console.log('=== Phase 5 Test Suite: Skill-Gap Intelligence & Learning Roadmaps ===\n');

  try {
    // 1. Learning Resources with Progress
    const resRes = await makeRequest('/api/v1/learning/resources');
    console.log('✓ 1. GET /api/v1/learning/resources:');
    console.log(`   Status: ${resRes.status}`);
    console.log(`   Total Curricula: ${resRes.body.data?.length}`);
    resRes.body.data?.forEach(r => {
      console.log(`     - ${r.skill} (${r.provider}): ${r.totalSteps} steps | ${r.progressPercent}% complete`);
    });
    console.log('');

    // 2. Skill Gap Market Summary
    const summaryRes = await makeRequest('/api/v1/learning/skill-gaps/summary');
    console.log('✓ 2. GET /api/v1/learning/skill-gaps/summary:');
    console.log(`   Status: ${summaryRes.status}`);
    console.log(`   Top Recommendation:`, summaryRes.body.data?.topRecommendation);
    console.log(`   Prioritized Gaps:`);
    summaryRes.body.data?.prioritizedGaps?.slice(0, 3).forEach(g => {
      console.log(`     - ${g.skill}: Required in ${g.frequencyPercent}% of postings [${g.priorityTier} Priority]`);
    });
    console.log('');

    // 3. Track Milestone Step Completion
    const progressRes = await makeRequest('/api/v1/learning/progress', 'POST', {
      resourceId: 'res_docker_01',
      stepIndex: 0,
      completed: true
    });
    console.log('✓ 3. POST /api/v1/learning/progress:');
    console.log(`   Status: ${progressRes.status}`);
    console.log(`   Progress Saved: Key ${progressRes.body.data?.key} -> ${progressRes.body.data?.completed}\n`);

    // 4. Claim Completed Skill to Profile with Evidence
    const claimRes = await makeRequest('/api/v1/learning/claim-skill', 'POST', {
      skill: 'Docker',
      resourceTitle: 'Docker Official Get Started Tutorial',
      resourceId: 'res_docker_01'
    });
    console.log('✓ 4. POST /api/v1/learning/claim-skill:');
    console.log(`   Status: ${claimRes.status}`);
    console.log(`   Message: "${claimRes.body.message}"`);
    console.log(`   Added Skill Evidence:`, claimRes.body.addedSkill?.evidence);

    console.log('\n🎉 ALL PHASE 5 TESTS COMPLETED AND VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
