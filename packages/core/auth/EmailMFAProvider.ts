/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Email-based MFA Provider Implementation
 * Task: T-1752989143997-938 - Implement email-based verification
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import crypto from 'crypto';
import { z } from 'zod';
import { MFAMethodType,
  MFAMethodStatus,
  MFAVerificationResult,
  EmailConfiguration,
  EmailVerification,
  MFAVerificationRequest,
  MFAVerificationResponse,
  MFAEnrollmentRequest,
  MFAEnrollmentResponse }
  MFA_CONSTANTS
 from '../types/MFATypes';
import { ErrorFactory } from '../errors/ErrorFactory';

// ========================================
// Configuration & Types
// ========================================


interface EmailMFAConfig { encryption: {;
  algorithm: 'aes-256-gcm' }
  keyDerivation: 'pbkdf2';
  iterations: number;


};
  templates: { ,
  verificationCode: string;
  enrollmentCode: string };
  rateLimit: { ,
  maxDailyEmails: number;
  cooldownMinutes: number };


interface EmailTemplate { subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string }


interface EmailSendResult { messageId: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: Date }


interface RiskAssessmentContext {
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceFingerprint?: string;
  previousAttempts: number;
  // ========================================
  // Email Service Interface
  // ========================================



interface EmailService { sendEmail(to: string, template: EmailTemplate, variables: Record<string, string>): Promise<EmailSendResult>;
  validateEmailAddress(email: string): Promise<boolean> }

  checkEmailReputation(email: string): Promise<{ valid: boolean; risk: number }>;

// ========================================
// Database Interface
// ========================================


interface EmailMFAStorage {
  // Configuration management
  saveConfiguration(config: EmailConfiguration): Promise<void>;
  getConfiguration(userId: string): Promise<EmailConfiguration | null>;
  getConfigurationById(configId: string): Promise<EmailConfiguration | null>;
  updateConfiguration(configId: string, updates: Partial<EmailConfiguration>): Promise<void>;
  deleteConfiguration(configId: string): Promise<void>;
  // Verification management
  saveVerification(verification: EmailVerification): Promise<void>;
  getVerification(verificationId: string): Promise<EmailVerification | null>;
  getActiveVerifications(userId: string): Promise<EmailVerification>;
  deleteVerification(verificationId: string): Promise<void>;
  // Rate limiting


  getRateLimitState(userId: string, action: string): Promise<{ count: number; windowStart: Date } | null>;
  updateRateLimitState(userId: string, action: string, count: number): Promise<void>;
  // Audit logging
  logVerificationAttempt(attempt: unknown): Promise<void>;
  logSecurityEvent(event: unknown): Promise<void>;

// ========================================
// Input Validation Schemas
// ========================================
const EmailEnrollmentSchema = z.object({ )
  methodType: z.literal(MFAMethodType.EMAIL)
  displayName: z.string().min(1).max(100)
  emailAddress: z.string().email().max(320) // RFC 5321 limit }
});
const EmailVerificationSchema = z.object({ )
  configurationId: z.string().uuid() }
  code: z.string().regex(/^\d{6}$/), // 6-digit numeric code
  backupCode: z.boolean().optional();
  });

// ========================================
// Email MFA Provider Implementation
// ========================================

export class EmailMFAProvider { private config: EmailMFAConfig;
  private emailService: EmailService;
  private storage: EmailMFAStorage;
  private encryptionKey: Buffer;
  constructor();
    config: EmailMFAConfig
    emailService: EmailService
    storage: EmailMFAStorage
    encryptionKey: string
    this.config = config;
    this.emailService = emailService;
    this.storage = storage;
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
  // ========================================
  // Enrollment Methods
  // ========================================
  async enrollMethod(userId: string, request: MFAEnrollmentRequest): Promise<MFAEnrollmentResponse> {

    // Validate input
    const validated = EmailEnrollmentSchema.parse(request);
    // Check if user already has email MFA configured
    const existingConfig = await this.storage.getConfiguration(userId);
    if (existingConfig && existingConfig.status !== MFAMethodStatus.REVOKED) {
      throw ErrorFactory.createMFAConfigurationError()
        'already_configured'
        undefined
        { userId }
          operation: 'enroll_email_mfa' }
      );
    // Validate email address
    const emailValid = await this.emailService.validateEmailAddress(validated.emailAddress);
    if (!emailValid) { throw ErrorFactory.createMFAConfigurationError()
        'invalid_email'
        validated.emailAddress
        { userId }
          operation: 'enroll_email_mfa' }
      );
    // Check email reputation
    const reputation = await this.emailService.checkEmailReputation(validated.emailAddress);
    if (!reputation.valid || reputation.risk > 70) { throw ErrorFactory.createMFAConfigurationError()
        'unsuitable_email'
        validated.emailAddress
        { userId }
          operation: 'enroll_email_mfa' }
      );
    // Create configuration
    const configurationId = crypto.randomUUID();
    const configuration: EmailConfiguration = { 
  id: configurationId
  userId
  methodType: MFAMethodType.EMAIL
  status: MFAMethodStatus.PENDING
  isPrimary: false
  displayName: validated.displayName
  emailAddress: validated.emailAddress
  isVerified: false
  failedAttempts: 0
  createdAt: new Date()
  updatedAt: new Date() }
};
    // Save configuration
    await this.storage.saveConfiguration(configuration);
    // Send verification email
    await this.sendEnrollmentVerification(userId, validated.emailAddress);
    return { configurationId
  methodType: MFAMethodType.EMAIL
  requiresVerification: true
  expiresAt: new Date(Date.now() + MFA_CONSTANTS.EMAIL.TOKEN_EXPIRY * 1000) }
};
  async completeEnrollment(userId: string, verificationId: string, code: string): Promise<void> {

    const verification = await this.storage.getVerification(verificationId);
    if (!verification || verification.userId !== userId) {
      throw ErrorFactory.createMFAVerificationError('invalid_code', { userId, operation: 'verify_mfa_code' });
    if (verification.expiresAt < new Date()) {
      await this.storage.deleteVerification(verificationId);
      throw ErrorFactory.createMFAVerificationError('expired', { userId, operation: 'verify_mfa_code' });
    // Decrypt and verify code
    const decryptedCode = this.decryptToken(verification.encryptedToken);
    if (decryptedCode !== code) {
      verification.attempts++;
      await this.storage.saveVerification(verification);
      if (verification.attempts >= 3) {
        await this.storage.deleteVerification(verificationId);
        throw ErrorFactory.createMFAVerificationError('too_many_attempts', { userId, operation: 'verify_mfa_code' });
      throw ErrorFactory.createMFAVerificationError('invalid_code', { userId, operation: 'verify_mfa_code' });
    // Update configuration to active
    const configuration = await this.storage.getConfiguration(userId);
    if (configuration) { configuration.status = MFAMethodStatus.ACTIVE;
      configuration.isVerified = true;
      configuration.updatedAt = new Date();
      await this.storage.updateConfiguration(configuration.id, configuration);
    // Clean up verification
    await this.storage.deleteVerification(verificationId);
  // ========================================
  // Verification Methods
  // ========================================
  async initiateVerification(userId: string, configurationId: string, context: RiskAssessmentContext): Promise<string> {

    // Get configuration
    const configuration = await this.storage.getConfigurationById(configurationId);
    if (!configuration || configuration.userId !== userId) {
      throw ErrorFactory.createMFAConfigurationError()
        'invalid_config'
        undefined
        { userId }
          operation: 'challenge_user' }
      );
    if (configuration.status !== MFAMethodStatus.ACTIVE) {
      throw ErrorFactory.createMFAVerificationError('method_not_active', { userId, operation: 'challenge_user' });
    // Check rate limits
    await this.checkRateLimit(userId, 'email_send');
    // Clean up expired verifications
    await this.cleanupExpiredVerifications(userId);
    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const verificationId = crypto.randomUUID();
    // Assess risk
    const riskScore = await this.assessRisk(context);
    // Create verification record
    const verification: EmailVerification = { 
  id: verificationId
  userId
  emailAddress: configuration.emailAddress
  encryptedToken: this.encryptToken(verificationCode)
  expiresAt: new Date(Date.now() + MFA_CONSTANTS.EMAIL.TOKEN_EXPIRY * 1000)
  attempts: 0
  metadata: {
  ipAddress: context.ipAddress
  userAgent: context.userAgent
  location: context.location }
  riskScore
};
    // Save verification
    await this.storage.saveVerification(verification);
    // Send verification email
    await this.sendVerificationEmail()
      configuration.emailAddress
      verificationCode
      configuration.displayName
      riskScore > 50 // Include security warning for high-risk attempts
    );
    // Update rate limit
    await this.updateRateLimit(userId, 'email_send');
    return verificationId;
  async verifyCode(request: MFAVerificationRequest, context: RiskAssessmentContext): Promise<MFAVerificationResponse> { const startTime = Date.now();
  try {
  // Validate input
  const validated = EmailVerificationSchema.parse(request);
  // Get configuration
  const configuration = await this.storage.getConfigurationById(validated.configurationId);
  if (!configuration) {
  return {
  success: false
  result: MFAVerificationResult.METHOD_DISABLED }
};
      // Check if account is locked
      if (configuration.lockedUntil && configuration.lockedUntil > new Date()) { return {
  success: false
  result: MFAVerificationResult.USER_LOCKED
  lockoutDuration: Math.ceil((configuration.lockedUntil.getTime() - Date.now()) / 1000) }
};
      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimitForVerification(configuration.userId);
      if (!rateLimitCheck.allowed) { return {
  success: false
  result: MFAVerificationResult.RATE_LIMITED
  remainingAttempts: rateLimitCheck.remainingAttempts }
};
      // Find active verification
      const verifications = await this.storage.getActiveVerifications(configuration.userId);
      const activeVerification = verifications.find(v => !this.isExpired(v));
      if (!activeVerification) { return {
  success: false
  result: MFAVerificationResult.EXPIRED }
};
      // Verify code
      const decryptedCode = this.decryptToken(activeVerification.encryptedToken);
      const codeMatches = this.constantTimeCompare(validated.code, decryptedCode);
      // Log attempt
      await this.logVerificationAttempt({ )
  userId: configuration.userId
  configurationId: validated.configurationId
  success: codeMatches
  result: codeMatches ? MFAVerificationResult.SUCCESS : MFAVerificationResult.INVALID_CODE
  ipAddress: context.ipAddress
  userAgent: context.userAgent
  processingTimeMs: Date.now() - startTime
  codeLength: validated.code.length
  riskScore: activeVerification.metadata.riskScore }
});
      if (!codeMatches) { // Increment failed attempts
  activeVerification.attempts++;
  await this.storage.saveVerification(activeVerification);
  configuration.failedAttempts++;
  // Lock account after too many failures
  if (configuration.failedAttempts >= MFA_CONSTANTS.SECURITY.MAX_FAILED_ATTEMPTS) {
  configuration.lockedUntil = new Date(Date.now() + MFA_CONSTANTS.SECURITY.LOCKOUT_DURATION * 1000);
  // Log security event
  await this.storage.logSecurityEvent({)
  userId: configuration.userId
  eventType: 'brute_force'
  severity: 'high'
  description: 'Account locked due to repeated failed MFA attempts'
  metadata: {
  ipAddress: context.ipAddress
  userAgent: context.userAgent
  methodType: MFAMethodType.EMAIL
  attemptCount: configuration.failedAttempts }

  createdAt: new Date()
            resolved: false;
  });
        await this.storage.updateConfiguration(configuration.id, configuration);
        return { success: false
  result: MFAVerificationResult.INVALID_CODE
  remainingAttempts: Math.max(0, MFA_CONSTANTS.SECURITY.MAX_FAILED_ATTEMPTS - configuration.failedAttempts) }
};
      // Success - clean up and reset counters
      await this.storage.deleteVerification(activeVerification.id);
      configuration.failedAttempts = 0;
      configuration.lockedUntil = undefined;
      configuration.lastUsedAt = new Date();
      configuration.updatedAt = new Date();
      await this.storage.updateConfiguration(configuration.id, configuration);
      return { success: true
  result: MFAVerificationResult.SUCCESS }
};
 catch (error) { // Log processing error
  await this.logVerificationAttempt({)
  userId: 'unknown'
  configurationId: request.configurationId
  success: false
  result: MFAVerificationResult.INVALID_CODE
  ipAddress: context.ipAddress
  userAgent: context.userAgent
  processingTimeMs: Date.now() - startTime }
});
      throw error;
  // ========================================
  // Email Sending Methods
  // ========================================
  private async sendEnrollmentVerification(userId: string, emailAddress: string): Promise<void> { const verificationCode = this.generateVerificationCode();
  const verificationId = crypto.randomUUID();
  const verification: EmailVerification = {
  id: verificationId
  userId
  emailAddress
  encryptedToken: this.encryptToken(verificationCode)
  expiresAt: new Date(Date.now() + MFA_CONSTANTS.EMAIL.TOKEN_EXPIRY * 1000)
  attempts: 0
  metadata: {
  ipAddress: '0.0.0.0', // Enrollment context
  userAgent: 'enrollment'
  riskScore: 0 }
};
    await this.storage.saveVerification(verification);
    const template: EmailTemplate = { 
  subject: 'Complete Your Email MFA Setup'
  htmlTemplate: this.config.templates.enrollmentCode
  textTemplate: this.config.templates.enrollmentCode
  variables: ['code', 'displayName', 'expiryMinutes'] }
};
    await this.emailService.sendEmail(emailAddress, template, { )
  code: verificationCode
  displayName: 'PromptScape Account'
  expiryMinutes: '10' }
});
  private async sendVerificationEmail(emailAddress: string)
  code: string
    displayName: string
    includeSecurityWarning: boolean = false): Promise<void> { 
  const template: EmailTemplate = {
  subject: 'Your PromptScape Verification Code'
  htmlTemplate: this.config.templates.verificationCode
  textTemplate: this.config.templates.verificationCode
  variables: ['code', 'displayName', 'expiryMinutes', 'securityWarning'] }
};
    await this.emailService.sendEmail(emailAddress, template, { )
  code
  displayName
  expiryMinutes: '10'
  securityWarning: includeSecurityWarning ? 'This login attempt appears to be from an unusual location or device.' : '' }
});
  // ========================================
  // Security & Utility Methods
  // ========================================
  private generateVerificationCode(): string {
    // Generate cryptographically secure 6-digit code
    const code = crypto.randomInt(100000, 999999);
    return code.toString();
  private encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(this.encryptionKey, salt, this.config.encryption.iterations, 32, 'sha256');
    const cipher = crypto.createCipherGCM(this.config.encryption.algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Combine salt + iv + authTag + encrypted
    return Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'hex')]).toString('base64');
  private decryptToken(encryptedToken: string): string {
    const combined = Buffer.from(encryptedToken, 'base64');
    const salt = combined.subarray(0, 32);
    const iv = combined.subarray(32, 48);
    const authTag = combined.subarray(48, 64);
    const encrypted = combined.subarray(64);
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(this.encryptionKey, salt, this.config.encryption.iterations, 32, 'sha256');
    const decipher = crypto.createDecipherGCM(this.config.encryption.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
  private async assessRisk(context: RiskAssessmentContext): Promise<number> {

    let riskScore = 0;
    // Base risk assessment
    if (context.previousAttempts > 2) riskScore += 20;
    if (!context.location) riskScore += 10;
    if (!context.deviceFingerprint) riskScore += 15;
    // Additional risk factors could include:
    // - Geolocation analysis
    // - IP reputation checking
    // - Device fingerprinting
    // - Time-based analysis
    return Math.min(riskScore, 100);
  private async checkRateLimit(userId: string, action: string): Promise<void> {

    const state = await this.storage.getRateLimitState(userId, action);
    if (state) {
      const windowAge = Date.now() - state.windowStart.getTime();
      const windowDuration = MFA_CONSTANTS.EMAIL.RATE_LIMIT_WINDOW * 1000;
      if (windowAge < windowDuration && state.count >= MFA_CONSTANTS.EMAIL.MAX_DAILY_SENDS) {
        throw ErrorFactory.createMFAVerificationError('rate_limit', { userId, operation: 'send_verification_email' });
  private async updateRateLimit(userId: string, action: string): Promise<void> { const state = await this.storage.getRateLimitState(userId, action);
    if (state) {
      const windowAge = Date.now() - state.windowStart.getTime();
      const windowDuration = MFA_CONSTANTS.EMAIL.RATE_LIMIT_WINDOW * 1000;
      if (windowAge < windowDuration) {
        await this.storage.updateRateLimitState(userId, action, state.count + 1) } else { await this.storage.updateRateLimitState(userId, action, 1) } else {
      await this.storage.updateRateLimitState(userId, action, 1);
  private async checkRateLimitForVerification(userId: string): Promise<{ allowed: boolean; remainingAttempts: number }> {

    const state = await this.storage.getRateLimitState(userId, 'email_verify');
    if (!state) {
      return { allowed: true, remainingAttempts: 5 };
    const windowAge = Date.now() - state.windowStart.getTime();
    const windowDuration = 15 * 60 * 1000; // 15 minutes;
    if (windowAge > windowDuration) {
      return { allowed: true, remainingAttempts: 5 };
    const remainingAttempts = Math.max(0, 5 - state.count);
    return { allowed: remainingAttempts > 0 }
  remainingAttempts
};
  private async cleanupExpiredVerifications(userId: string): Promise<void> { const verifications = await this.storage.getActiveVerifications(userId);
  for (const verification of verifications) {
  if (this.isExpired(verification)) {
  await this.storage.deleteVerification(verification.id);
  private isExpired(verification: EmailVerification): boolean {
  return verification.expiresAt < new Date();
  private async logVerificationAttempt(attempt: unknown): Promise<void> {
  await this.storage.logVerificationAttempt({)
  id: crypto.randomUUID()
  ...attempt
  attemptedAt: new Date() }
});
  // ========================================
  // Management Methods
  // ========================================
  async updateEmailAddress(userId: string, configurationId: string, newEmailAddress: string): Promise<void> { const configuration = await this.storage.getConfigurationById(configurationId);
    if (!configuration || configuration.userId !== userId) {
      throw ErrorFactory.createMFAConfigurationError()
        'invalid_config'
        undefined
        { userId }
          operation: 'challenge_user' }
      );
    // Validate new email
    const emailValid = await this.emailService.validateEmailAddress(newEmailAddress);
    if (!emailValid) { throw ErrorFactory.createMFAConfigurationError()
        'invalid_email'
        newEmailAddress
        { userId }
          operation: 'update_email_address' }
      );
    // Update configuration
    configuration.emailAddress = newEmailAddress;
    configuration.isVerified = false;
    configuration.status = MFAMethodStatus.PENDING;
    configuration.updatedAt = new Date();
    await this.storage.updateConfiguration(configurationId, configuration);
    // Send verification to new email
    await this.sendEnrollmentVerification(userId, newEmailAddress);
  async disableMethod(userId: string, configurationId: string): Promise<void> { const configuration = await this.storage.getConfigurationById(configurationId);
    if (!configuration || configuration.userId !== userId) {
      throw ErrorFactory.createMFAConfigurationError()
        'invalid_config'
        undefined
        { userId }
          operation: 'challenge_user' }
      );
    configuration.status = MFAMethodStatus.DISABLED;
    configuration.updatedAt = new Date();
    await this.storage.updateConfiguration(configurationId, configuration);
  async revokeMethod(userId: string, configurationId: string): Promise<void> { const configuration = await this.storage.getConfigurationById(configurationId);
    if (!configuration || configuration.userId !== userId) {
      throw ErrorFactory.createMFAConfigurationError()
        'invalid_config'
        undefined
        { userId }
          operation: 'challenge_user' }
      );
    configuration.status = MFAMethodStatus.REVOKED;
    configuration.updatedAt = new Date();
    await this.storage.updateConfiguration(configurationId, configuration);
    // Clean up any pending verifications
    const verifications = await this.storage.getActiveVerifications(userId);
    for (const verification of verifications) {
      await this.storage.deleteVerification(verification.id);

export default EmailMFAProvider;