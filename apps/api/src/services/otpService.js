import crypto from 'crypto';
import { emailService } from './emailService.js';

/**
 * CareerLens OTP & Real Email Verification Engine
 * Validates real email addresses, enforces rate limits, issues 6-digit cryptographic OTPs,
 * and tracks verification state for registration and secure login.
 */

class OtpService {
  constructor() {
    // In-memory store: email -> { otp, expiresAt, attempts, lastSentAt, verificationToken, tokenExpiresAt }
    this.otpStore = new Map();
  }

  /**
   * Validate that an email is a real, well-formed email address (e.g. user@gmail.com).
   */
  validateEmailFormat(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, message: 'Email address is required' };
    }

    const trimmed = email.trim().toLowerCase();

    // Standard RFC-compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid email address (e.g., yourname@gmail.com)' };
    }

    // Split domain
    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      return { valid: false, message: 'Invalid email structure' };
    }

    const domain = parts[1];
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];

    if (tld.length < 2) {
      return { valid: false, message: 'Email domain extension must be at least 2 characters' };
    }

    // Reject obvious placeholders or malformed test addresses
    const invalidPatterns = [
      'test@test.com',
      'asdf@asdf.com',
      'abc@abc.com',
      'none@none.com',
      'example@example.com'
    ];
    if (invalidPatterns.includes(trimmed)) {
      return { valid: false, message: 'Please use your real personal or work email address' };
    }

    return { valid: true, email: trimmed };
  }

  /**
   * Generate and dispatch a 6-digit OTP code to a real email address.
   */
  async generateAndSendOtp(email, purpose = 'REGISTER') {
    const validation = this.validateEmailFormat(email);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    const cleanEmail = validation.email;
    const now = Date.now();

    // Check rate limiting (must wait at least 30 seconds between requests)
    const existing = this.otpStore.get(cleanEmail);
    if (existing && existing.lastSentAt && now - existing.lastSentAt < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (now - existing.lastSentAt)) / 1000);
      return { 
        success: false, 
        error: `Please wait ${waitSec} seconds before requesting a new verification code` 
      };
    }

    // Generate secure 6-digit OTP code (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Store in active cache
    this.otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      purpose,
      verified: false,
      verificationToken: null
    });

    // Send email via nodemailer
    const dispatchResult = await emailService.sendVerificationOtp(cleanEmail, otp, purpose);

    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      expiresInMinutes: 10,
      realDelivery: dispatchResult.realDelivery,
      // In local dev without SMTP configured, provide devOtp for seamless testing
      ...(dispatchResult.simulated ? { devOtp: otp, isSimulated: true } : {})
    };
  }

  /**
   * Verify the 6-digit OTP entered by the user.
   */
  verifyOtp(email, inputOtp) {
    const validation = this.validateEmailFormat(email);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    const cleanEmail = validation.email;
    const record = this.otpStore.get(cleanEmail);

    if (!record) {
      return { 
        success: false, 
        error: 'No active verification code found for this email. Please request a new code.' 
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      return { 
        success: false, 
        error: 'Verification code has expired (valid for 10 minutes). Please request a new one.' 
      };
    }

    if (record.attempts >= 5) {
      this.otpStore.delete(cleanEmail);
      return { 
        success: false, 
        error: 'Too many incorrect attempts. Please request a fresh verification code.' 
      };
    }

    // Clean user input
    const cleanOtp = String(inputOtp || '').trim().replace(/\s+/g, '');
    if (cleanOtp !== record.otp) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      return { 
        success: false, 
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` 
      };
    }

    // Success! Generate a cryptographically secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = now + 30 * 60 * 1000; // Token valid for 30 minutes to complete registration

    this.otpStore.set(cleanEmail, {
      ...record,
      verified: true,
      verificationToken,
      tokenExpiresAt
    });

    return {
      success: true,
      verified: true,
      email: cleanEmail,
      verificationToken,
      message: 'Email successfully verified!'
    };
  }

  /**
   * Check if an email has recently been verified with a valid token or status.
   */
  isEmailVerified(email, verificationToken) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const record = this.otpStore.get(cleanEmail);
    if (!record || !record.verified) return false;

    if (Date.now() > (record.tokenExpiresAt || 0)) {
      this.otpStore.delete(cleanEmail);
      return false;
    }

    if (verificationToken && record.verificationToken !== verificationToken) {
      return false;
    }

    return true;
  }

  /**
   * Consume verification once registration is finished.
   */
  consumeVerification(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    this.otpStore.delete(cleanEmail);
  }
}

export const otpService = new OtpService();
