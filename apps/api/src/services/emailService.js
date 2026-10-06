import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure fresh environment variables
dotenv.config();

/**
 * CareerLens Email Dispatcher Service
 * Handles real SMTP email delivery (via Gmail App Passwords, custom SMTP, or SendGrid)
 * with graceful local fallback if SMTP credentials are pending in .env.
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // Re-read environment variables in case .env was updated
    dotenv.config();

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (user && pass) {
      try {
        const cleanPass = pass.replace(/\s+/g, ''); // strip spaces from Google App Password
        
        // If host is Gmail, use nodemailer's built-in 'gmail' service configuration
        if (host === 'smtp.gmail.com' || (user && user.toLowerCase().endsWith('@gmail.com'))) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: user.trim(),
              pass: cleanPass
            }
          });
          console.log(`📧 [EMAIL SERVICE] Gmail SMTP initialized for ${user.trim()}`);
        } else {
          this.transporter = nodemailer.createTransport({
            host: host.trim(),
            port,
            secure: port === 465,
            auth: {
              user: user.trim(),
              pass: cleanPass
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          console.log(`📧 [EMAIL SERVICE] Custom SMTP initialized with ${host}:${port} for ${user.trim()}`);
        }
      } catch (err) {
        console.warn('⚠️ [EMAIL SERVICE] Failed to initialize nodemailer transport:', err.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
    }
  }

  isConfigured() {
    this.initTransporter();
    return Boolean(this.transporter);
  }

  /**
   * Verify SMTP connection status
   */
  async verifyConnection() {
    this.initTransporter();
    if (!this.transporter) {
      return { 
        connected: false, 
        error: 'SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in .env' 
      };
    }
    try {
      await this.transporter.verify();
      return { connected: true, message: 'SMTP server is ready to deliver real emails' };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  }

  /**
   * Send an OTP verification email to the user's real email address.
   */
  async sendVerificationOtp(toEmail, otp, purpose = 'REGISTER') {
    this.initTransporter();

    const purposeTitles = {
      REGISTER: {
        subject: `${otp} is your CareerLens Account Verification Code`,
        headline: 'Verify your email to get started',
        subtext: 'Thank you for signing up for CareerLens. Use this 6-digit verification code to verify your email address and activate your account.'
      },
      LOGIN: {
        subject: `${otp} is your CareerLens Login Verification Code`,
        headline: 'Sign in to CareerLens',
        subtext: 'You requested a one-time login code to access your CareerLens account.'
      },
      FORGOT_PASSWORD: {
        subject: `${otp} is your CareerLens Password Reset Code`,
        headline: 'Reset your password',
        subtext: 'You requested a verification code to reset your account password.'
      }
    };

    const details = purposeTitles[purpose] || purposeTitles.REGISTER;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const sender = process.env.EMAIL_FROM || `CareerLens <${user || 'verify@careerlens.io'}>`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${details.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080c15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #080c15; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">CareerLens AI</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500;">AI Career Matching & Skill-Gap Intelligence</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #ffffff;">${details.headline}</h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                ${details.subtext}
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #1e293b; border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #818cf8; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; text-shadow: 0 2px 10px rgba(56,189,248,0.3);">
                  ${otp}
                </div>
                <span style="display: block; font-size: 12px; color: #64748b; margin-top: 10px;">Valid for 10 minutes • Do not share this code with anyone</span>
              </div>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not request this email, you can safely ignore it. No changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0a0f1d; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                CareerLens AI Platform • Built for Students & Professionals in India
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #334155;">
                Automated security transmission • Delivered to ${toEmail}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Attempt real SMTP delivery if configured
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: sender,
          to: toEmail,
          subject: details.subject,
          html: htmlContent,
          text: `Your CareerLens verification code is: ${otp}. It expires in 10 minutes.`
        });
        console.log(`\n================================================================`);
        console.log(`✅ [REAL EMAIL DELIVERED] Real OTP email sent to ${toEmail}`);
        console.log(`   MessageId: ${info.messageId}`);
        console.log(`================================================================\n`);
        return {
          sent: true,
          realDelivery: true,
          messageId: info.messageId,
          email: toEmail
        };
      } catch (err) {
        console.error(`❌ [EMAIL DELIVERY ERROR] Failed to send real email to ${toEmail}:`, err.message);
        if (err.message.includes('Invalid login') || err.message.includes('Username and Password not accepted')) {
          console.error(`👉 Gmail Tip: Make sure to use a 16-character App Password from https://myaccount.google.com/apppasswords rather than your main Google account password.`);
        }
        // Fall back to dev notification so local testing isn't blocked if password is mistyped
        return {
          sent: true,
          realDelivery: false,
          fallbackReason: err.message,
          otp,
          email: toEmail
        };
      }
    }

    // When SMTP credentials are not yet configured in .env:
    console.log(`\n================================================================`);
    console.log(`📨 [LOCAL DEV OTP DISPATCH] (Configure SMTP_USER & SMTP_PASS in .env for real inbox delivery)`);
    console.log(`   To:      ${toEmail}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP:     ${otp}`);
    console.log(`================================================================\n`);

    return {
      sent: true,
      realDelivery: false,
      simulated: true,
      otp,
      email: toEmail
    };
  }
}

export const emailService = new EmailService();
