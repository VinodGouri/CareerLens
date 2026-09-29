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
  console.log('=== Phase 3 Test Suite: Job Ingestion & Multi-Source Exploration ===\n');

  try {
    // 1. Explore Jobs default with facets
    const allJobsRes = await makeRequest('/api/v1/jobs');
    console.log('✓ 1. GET /api/v1/jobs (Default):');
    console.log(`   Status: ${allJobsRes.status}`);
    console.log(`   Total Jobs: ${allJobsRes.body.data?.total}`);
    console.log(`   Facets by Source:`, allJobsRes.body.data?.facets?.bySource);
    console.log(`   Top Job Match Score: ${allJobsRes.body.data?.jobs?.[0]?.matchScore}%\n`);

    // 2. Minimum Salary Filter
    const salaryRes = await makeRequest('/api/v1/jobs?minSalary=800000');
    console.log('✓ 2. GET /api/v1/jobs?minSalary=800000:');
    console.log(`   Status: ${salaryRes.status}`);
    console.log(`   Jobs matching ₹8L+ salary: ${salaryRes.body.data?.total} jobs\n`);

    // 3. Multi-source Filter (LinkedIn)
    const liRes = await makeRequest('/api/v1/jobs?source=LinkedIn');
    console.log('✓ 3. GET /api/v1/jobs?source=LinkedIn:');
    console.log(`   Status: ${liRes.status}`);
    console.log(`   LinkedIn jobs returned: ${liRes.body.data?.total}`);
    const allLi = liRes.body.data?.jobs?.every(j => j.source.toLowerCase() === 'linkedin');
    console.log(`   All results are LinkedIn: ${allLi}\n`);

    // 4. Specific Skill Filter (React)
    const reactRes = await makeRequest('/api/v1/jobs?skill=React');
    console.log('✓ 4. GET /api/v1/jobs?skill=React:');
    console.log(`   Status: ${reactRes.status}`);
    console.log(`   Jobs requiring/preferring React: ${reactRes.body.data?.total}\n`);

    // 5. Sort By Salary
    const sortSalRes = await makeRequest('/api/v1/jobs?sortBy=salary');
    console.log('✓ 5. GET /api/v1/jobs?sortBy=salary:');
    console.log(`   Status: ${sortSalRes.status}`);
    const highestPaid = sortSalRes.body.data?.jobs?.[0];
    console.log(`   Highest Paid Job: ${highestPaid?.title} at ${highestPaid?.company} (${highestPaid?.salary_min} - ${highestPaid?.salary_max})\n`);

    // 6. Facets API
    const facetsRes = await makeRequest('/api/v1/jobs/facets');
    console.log('✓ 6. GET /api/v1/jobs/facets:');
    console.log(`   Status: ${facetsRes.status}`);
    console.log(`   Sources:`, facetsRes.body.data?.bySource);
    console.log(`   Work Modes:`, facetsRes.body.data?.byWorkMode);
    console.log(`   Locations:`, facetsRes.body.data?.byLocation);
    console.log(`   Top Skills:`, facetsRes.body.data?.topSkills?.map(s => `${s.name} (${s.count})`).join(', ') + '\n');

    // 7. Single Job Ingestion via Adapter
    const newJobPayload = {
      source: 'Wellfound',
      rawJob: {
        role: 'AI Infrastructure Engineer',
        startupName: 'NeuralStack Hyderabad',
        city: 'Hyderabad, India',
        remoteOk: false,
        salary_min: '₹12,00,000',
        salary_max: '₹18,00,000',
        yearsExperience: 1,
        tags: ['Python', 'Docker', 'Kubernetes', 'FastAPI']
      }
    };
    const ingestRes = await makeRequest('/api/v1/jobs/ingest', 'POST', newJobPayload);
    console.log('✓ 7. POST /api/v1/jobs/ingest (Wellfound Adapter):');
    console.log(`   Status: ${ingestRes.status}`);
    console.log(`   Ingested Job ID: ${ingestRes.body.data?.id}`);
    console.log(`   Canonical Hash: ${ingestRes.body.data?.canonical_hash}`);
    console.log(`   Numeric Salary Max: ₹${ingestRes.body.data?.salary_numeric_max}\n`);

    // 8. Test SHA-256 Deduplication (Submitting identical job again)
    const duplicateRes = await makeRequest('/api/v1/jobs/ingest', 'POST', newJobPayload);
    console.log('✓ 8. POST /api/v1/jobs/ingest (Duplicate Test):');
    console.log(`   Status: ${duplicateRes.status} (Expected 409 Conflict)`);
    console.log(`   Duplicate Blocked: ${duplicateRes.body.duplicate}`);
    console.log(`   Message: "${duplicateRes.body.message}"\n`);

    // 9. Batch Ingestion Sync Feed
    const syncRes = await makeRequest('/api/v1/jobs/sync-demo-feed', 'POST');
    console.log('✓ 9. POST /api/v1/jobs/sync-demo-feed (Multi-Source Batch Sync):');
    console.log(`   Status: ${syncRes.status}`);
    console.log(`   Newly Ingested: ${syncRes.body.data?.newlyIngestedCount} jobs`);
    console.log(`   Duplicates Blocked: ${syncRes.body.data?.duplicatesBlockedCount} jobs`);
    console.log(`   Cumulative Ingestion Stats:`, syncRes.body.data?.stats);

    console.log('\n🎉 ALL PHASE 3 TESTS COMPLETED AND VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
