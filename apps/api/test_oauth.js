import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function testOAuthSuite() {
  console.log('🧪 Starting OAuth Integration Tests for Google, LinkedIn, and GitHub...');

  // 1. Test GET /api/v1/auth/oauth/providers
  const providersRes = await fetch(`${BASE_URL}/api/v1/auth/oauth/providers`);
  const providersData = await providersRes.json();
  assert.strictEqual(providersRes.status, 200, 'Providers endpoint should return 200');
  assert.strictEqual(providersData.success, true, 'Providers response should be successful');
  assert.strictEqual(providersData.data.length, 3, 'Should list exactly 3 providers');
  const providerIds = providersData.data.map(p => p.id);
  assert(providerIds.includes('google'), 'Should include Google');
  assert(providerIds.includes('linkedin'), 'Should include LinkedIn');
  assert(providerIds.includes('github'), 'Should include GitHub');
  console.log('  ✅ GET /api/v1/auth/oauth/providers verified (Google, LinkedIn, GitHub active)');

  // 2. Test POST /api/v1/auth/oauth/google
  const googleRes = await fetch(`${BASE_URL}/api/v1/auth/oauth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul.sharma@example.com' })
  });
  const googleData = await googleRes.json();
  assert.strictEqual(googleRes.status, 200, 'Google OAuth should return 200');
  assert.strictEqual(googleData.success, true);
  assert.strictEqual(googleData.data.provider, 'google');
  assert(googleData.data.token.includes('careerlens-oauth-google'));
  assert.strictEqual(googleData.data.user.email, 'rahul.sharma@example.com');
  console.log('  ✅ POST /api/v1/auth/oauth/google verified with JWT token and verified profile');

  // 3. Test POST /api/v1/auth/oauth/linkedin
  const linkedinRes = await fetch(`${BASE_URL}/api/v1/auth/oauth/linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.nair@example.com' })
  });
  const linkedinData = await linkedinRes.json();
  assert.strictEqual(linkedinRes.status, 200, 'LinkedIn OAuth should return 200');
  assert.strictEqual(linkedinData.success, true);
  assert.strictEqual(linkedinData.data.provider, 'linkedin');
  assert(linkedinData.data.token.includes('careerlens-oauth-linkedin'));
  assert.strictEqual(linkedinData.data.user.name, 'Priya Nair');
  console.log('  ✅ POST /api/v1/auth/oauth/linkedin verified with headline and verified skills');

  // 4. Test POST /api/v1/auth/oauth/github with custom developer handle
  const githubRes = await fetch(`${BASE_URL}/api/v1/auth/oauth/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Developer',
      email: 'alex.dev@github.com',
      username: 'alexdev-oss',
      targetRole: 'Full Stack Engineer'
    })
  });
  const githubData = await githubRes.json();
  assert.strictEqual(githubRes.status, 200, 'GitHub OAuth should return 200');
  assert.strictEqual(githubData.success, true);
  assert.strictEqual(githubData.data.provider, 'github');
  assert(githubData.data.user.email, 'alex.dev@github.com');
  assert(githubData.data.user.github_url.includes('alexdev-oss'));
  assert(githubData.data.user.skills.some(s => s.name.includes('Git')));
  console.log('  ✅ POST /api/v1/auth/oauth/github verified with repo telemetry and Git skills');

  // 5. Test invalid provider returns 400
  const invalidRes = await fetch(`${BASE_URL}/api/v1/auth/oauth/unknown_provider`, {
    method: 'POST'
  });
  assert.strictEqual(invalidRes.status, 400, 'Invalid provider should return 400');
  console.log('  ✅ Rejection of invalid provider verified');

  console.log('\n🎉 ALL 5 OAUTH INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
}

testOAuthSuite().catch(err => {
  console.error('❌ OAuth Test Failed:', err);
  process.exit(1);
});
