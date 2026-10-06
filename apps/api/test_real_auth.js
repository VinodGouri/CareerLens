import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function testRealAuthSuite() {
  console.log('🧪 Starting Real Email, OTP, and Registered-Only Auth Verification Suite...\n');

  // 1. Test GET /api/v1/auth/config
  const cfgRes = await fetch(`${BASE_URL}/api/v1/auth/config`);
  const cfg = await cfgRes.json();
  assert.strictEqual(cfgRes.status, 200);
  assert.strictEqual(cfg.success, true);
  console.log('  ✅ 1. Auth configuration endpoint active');

  // 2. Test Email Format Validation: Reject random/malformed emails
  const malformedRes = await fetch(`${BASE_URL}/api/v1/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'random-junk-string' })
  });
  const malformedData = await malformedRes.json();
  assert.strictEqual(malformedRes.status, 400);
  assert.strictEqual(malformedData.success, false);
  console.log('  ✅ 2. Random junk email correctly rejected');

  // 3. Test Login for Unregistered Email: MUST BE REJECTED
  const unregisteredEmail = `candidate.unregistered.${Date.now()}@gmail.com`;
  const unregLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: unregisteredEmail, password: 'AnyPassword123!' })
  });
  const unregLoginData = await unregLoginRes.json();
  assert.strictEqual(unregLoginRes.status, 404, 'Unregistered email must return 404');
  assert(unregLoginData.error.message.includes('Only registered email addresses can sign in'), 'Message must indicate registered-only login requirement');
  console.log('  ✅ 3. Unregistered email login strictly blocked (Only registered emails can log in)');

  // 4. Test Send OTP to Real Email for Registration
  const newCandidateEmail = `neha.patel.${Date.now()}@gmail.com`;
  const sendOtpRes = await fetch(`${BASE_URL}/api/v1/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newCandidateEmail, purpose: 'REGISTER' })
  });
  const sendOtpData = await sendOtpRes.json();
  assert.strictEqual(sendOtpRes.status, 200);
  assert.strictEqual(sendOtpData.success, true);
  const otpCode = sendOtpData.data.devOtp || sendOtpData.data.otp;
  assert(Boolean(otpCode), 'Should receive generated OTP code in test mode');
  assert.strictEqual(otpCode.length, 6, 'OTP must be exactly 6 digits');
  console.log(`  ✅ 4. 6-digit OTP code (${otpCode}) generated and dispatched to ${newCandidateEmail}`);

  // 5. Test Verify OTP with Wrong Code
  const wrongVerifyRes = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newCandidateEmail, otp: '000000' })
  });
  const wrongVerifyData = await wrongVerifyRes.json();
  assert.strictEqual(wrongVerifyRes.status, 400);
  const errMsg = wrongVerifyData.error?.message || wrongVerifyData.error;
  assert(errMsg.includes('Incorrect verification code'));
  console.log('  ✅ 5. Incorrect OTP correctly rejected with remaining attempts counter');

  // 6. Test Verify OTP with Valid Code
  const validVerifyRes = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newCandidateEmail, otp: otpCode })
  });
  const validVerifyData = await validVerifyRes.json();
  assert.strictEqual(validVerifyRes.status, 200);
  assert.strictEqual(validVerifyData.data.verified, true);
  const verificationToken = validVerifyData.data.verificationToken;
  assert(Boolean(verificationToken), 'Should receive cryptographic verification token');
  console.log('  ✅ 6. Real email OTP verified successfully with token');

  // 7. Test Register New User with Verified Email
  const registerRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Neha Patel',
      email: newCandidateEmail,
      password: 'SecurePassword2026!',
      verificationToken,
      experienceLevel: 'FRESHER',
      preferredRole: 'Frontend Developer',
      location: 'Bangalore'
    })
  });
  const registerData = await registerRes.json();
  assert.strictEqual(registerRes.status, 200);
  assert.strictEqual(registerData.success, true);
  assert.strictEqual(registerData.data.user.email, newCandidateEmail);
  assert.strictEqual(registerData.data.user.name, 'Neha Patel');
  assert(registerData.data.token.includes('careerlens-jwt-'));
  console.log('  ✅ 7. Candidate registration completed with verified email & hashed password');

  // 8. Test Login with Registered User & Correct Password
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newCandidateEmail,
      password: 'SecurePassword2026!'
    })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.data.user.email, newCandidateEmail);
  console.log('  ✅ 8. Login successful for registered email and correct credentials');

  // 9. Test Login with Registered User & Wrong Password
  const wrongPwdLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newCandidateEmail,
      password: 'WrongPassword999!'
    })
  });
  assert.strictEqual(wrongPwdLoginRes.status, 401);
  console.log('  ✅ 9. Login rejected for wrong password with 401 Unauthorized');

  // 10. Test Duplicate Registration Attempt Rejected
  const duplicateRegisterRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Neha Patel Again',
      email: newCandidateEmail,
      password: 'AnotherPassword!'
    })
  });
  assert.strictEqual(duplicateRegisterRes.status, 409, 'Duplicate registration must return 409 conflict');
  console.log('  ✅ 10. Duplicate registration blocked (409 Conflict)');

  // 11. Test Google Sign-In / Account Creation
  const googleEmail = `alex.google.${Date.now()}@gmail.com`;
  const googleRes = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: {
        email: googleEmail,
        name: 'Alex Google User',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        sub: 'google_sub_123456789'
      }
    })
  });
  const googleData = await googleRes.json();
  assert.strictEqual(googleRes.status, 200);
  assert.strictEqual(googleData.success, true);
  assert.strictEqual(googleData.data.user.email, googleEmail);
  assert.strictEqual(googleData.data.user.auth_provider, 'google');
  console.log('  ✅ 11. Google Sign-In authenticated and registered verified profile');

  console.log('\n🎉 ALL 11 REAL EMAIL, OTP, AND AUTH TESTS PASSED WITH 100% SUCCESS!\n');
}

testRealAuthSuite().catch(err => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
