import dotenv from 'dotenv';
import { emailService } from './src/services/emailService.js';

dotenv.config();

async function runSmtpTest() {
  console.log('================================================================');
  console.log('   CAREERLENS SMTP EMAIL DELIVERY DIAGNOSTIC TEST');
  console.log('================================================================\n');

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const targetEmail = process.argv[2] || user;

  console.log(`Current Configuration:`);
  console.log(`  SMTP_HOST: ${host}`);
  console.log(`  SMTP_USER: ${user ? user : '❌ NOT SET'}`);
  console.log(`  SMTP_PASS: ${pass ? '•••••••••••••••• (' + pass.replace(/\s+/g, '').length + ' chars)' : '❌ NOT SET'}`);

  if (!user || !pass) {
    console.log('\n❌ SMTP is not configured yet in .env!');
    console.log('\nTo configure Gmail SMTP:');
    console.log('  1. Go to: https://myaccount.google.com/security');
    console.log('  2. Enable 2-Step Verification if not already active.');
    console.log('  3. Go to: https://myaccount.google.com/apppasswords');
    console.log('  4. Create an App password (name: "CareerLens").');
    console.log('  5. Add your Gmail and the 16-character code into .env:\n');
    console.log('     SMTP_HOST=smtp.gmail.com');
    console.log('     SMTP_PORT=587');
    console.log('     SMTP_USER=your_email@gmail.com');
    console.log('     SMTP_PASS=xxxx xxxx xxxx xxxx');
    console.log('     EMAIL_FROM=CareerLens <your_email@gmail.com>\n');
    process.exit(1);
  }

  console.log('\n🔍 Verifying connection to SMTP server...');
  const verify = await emailService.verifyConnection();
  if (!verify.connected) {
    console.error(`\n❌ SMTP Connection Failed: ${verify.error}`);
    if (verify.error.includes('Invalid login') || verify.error.includes('Username and Password not accepted')) {
      console.log('\n👉 NOTE: You must use a 16-character Google "App Password" rather than your normal password.');
      console.log('   Generate it at: https://myaccount.google.com/apppasswords\n');
    }
    process.exit(1);
  }

  console.log('  ✅ SMTP connection verified successfully!');

  if (!targetEmail) {
    console.log('  ⚠️ No recipient email specified. Pass recipient email: node test_smtp.js user@gmail.com');
    process.exit(0);
  }

  console.log(`\n📨 Sending real test OTP verification email to: ${targetEmail}...`);
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await emailService.sendVerificationOtp(targetEmail, testOtp, 'REGISTER');

  if (result.realDelivery) {
    console.log(`\n🎉 SUCCESS! Real verification email sent to ${targetEmail}!`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Check your inbox (or Spam folder) for code: ${testOtp}`);
  } else {
    console.log(`\n❌ Email delivery fell back to simulation. Reason: ${result.fallbackReason || 'Unknown'}`);
  }
}

runSmtpTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
