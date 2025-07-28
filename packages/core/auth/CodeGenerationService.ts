/**
 * Secure Code Generation and Validation System
 * Task: T-1752989143997-705 - Create code generation and validation system
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import crypto from 'crypto';
import { z } from 'zod';

// ========================================
// Types and Interfaces
// ========================================

export enum CodeType {
  EMAIL_VERIFICATION = 'email_verification',
  SMS_VERIFICATION = 'sms_verification',
  TOTP_SECRET = 'totp_secret',
  BACKUP_CODE = 'backup_code',
  RECOVERY_TOKEN = 'recovery_token',
  API_TOKEN = 'api_token'
  export enum CodeFormat {
  NUMERIC = 'numeric',           // 123456
  ALPHANUMERIC = 'alphanumeric', // A1B2C3
  ALPHA = 'alpha',               // ABCDEF
  BASE32 = 'base32',             // JBSWY3DPEHPK3PXP
  HEX = 'hex',                   // 1a2b3c4d
  UUID = 'uuid'                  // 550e8400-e29b-41d4-a716-446655440000
  export interface CodeGenerationOptions {
  type: CodeType;,
  format: CodeFormat;
  length: number;
  expiryMinutes?: number;
  userContext?: {,
  userId: string;,
  ipAddress: string;
  userAgent: string;
};
  customCharset?: string;
  excludeSimilar?: boolean;      // Exclude 0, O, I, l, 1
  enforceComplexity?: boolean;   // For passwords/tokens
}
export interface GeneratedCode {
  code: string;,
  hashedCode: string;
  salt: string;,
  type: CodeType;
  format: CodeFormat;
  expiresAt?: Date;
  metadata: {,
  generatedAt: Date;
  userId?: string;
  ipAddress?: string;
  entropy: number;,
  algorithm: string;
};
}
export interface CodeValidationResult {
  valid: boolean;
  reason?: 'expired' | 'invalid' | 'rate_limited' | 'used' | 'format_mismatch';
  remainingAttempts?: number;
  metadata?: {,
  validatedAt: Date;,
  timingAttackSafe: boolean;
  processingTimeMs: number;
};
}
export interface CodeValidationOptions {
  allowExpired?: boolean;
  constantTimeValidation?: boolean;
  rateLimitingEnabled?: boolean;
  maxAttempts?: number;
  // ========================================
  // Character Sets and Patterns
  // ========================================
  const CHARACTER_SETS = {
  [CodeFormat.NUMERIC]: '0123456789',
  [CodeFormat.ALPHA]: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  [CodeFormat.ALPHANUMERIC]: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  [CodeFormat.BASE32]: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  [CodeFormat.HEX]: '0123456789ABCDEF',
};
const SIMILAR_CHARACTERS = ['0', 'O', 'I', 'l', '1'];
const CODE_PATTERNS = {
  [CodeFormat.NUMERIC]: /^\d+$/,
  [CodeFormat.ALPHA]: /^[A-Z]+$/,
  [CodeFormat.ALPHANUMERIC]: /^[A-Z0-9]+$/,
  [CodeFormat.BASE32]: /^[A-Z2-7]+$/,
  [CodeFormat.HEX]: /^[0-9A-F]+$/i,
  [CodeFormat.UUID]: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// ========================================
// Validation Schemas
// ========================================
const CodeGenerationSchema = z.object({)
  type: z.nativeEnum(CodeType),
  format: z.nativeEnum(CodeFormat),
  length: z.number().min(4).max(64),
  expiryMinutes: z.number().min(1).max(43200).optional(), // Max 30 days,
  userContext: z.object({,)
  userId: z.string().uuid(),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
}).optional(),
  customCharset: z.string().min(2).optional(),
  excludeSimilar: z.boolean().optional(),
  enforceComplexity: z.boolean().optional();
  });
const CodeValidationSchema = z.object({)
  code: z.string().min(1),
  hashedCode: z.string().min(1),
  salt: z.string().min(1),
  options: z.object({,)
  allowExpired: z.boolean().optional(),
  constantTimeValidation: z.boolean().optional(),
  rateLimitingEnabled: z.boolean().optional(),
  maxAttempts: z.number().min(1).max(10).optional(),
}).optional()
});

// ========================================
// Entropy Calculator
// ========================================
class EntropyCalculator {
  /**
   * Calculate the entropy of a generated code
   */
  static calculateEntropy(code: string, charset: string): number {
    const charsetSize = charset.length;
    const codeLength = code.length;
    // Shannon entropy: H = L * log2(N)
    // Where L = length, N = charset size
    return codeLength * Math.log2(charsetSize);
  /**
   * Calculate the theoretical time to crack a code
   */
  static calculateCrackTime(entropy: number, attemptsPerSecond: number = 1000): {,
  averageTime: number;
    worstCase: number;,
  unit: string;
    const possibleCombinations = Math.pow(2, entropy);
    const averageAttempts = possibleCombinations / 2;
    const worstCaseAttempts = possibleCombinations;
    const averageSeconds = averageAttempts / attemptsPerSecond;
    const worstCaseSeconds = worstCaseAttempts / attemptsPerSecond;
    // Convert to appropriate time unit
    if (averageSeconds < 60) {
      return { averageTime: averageSeconds, worstCase: worstCaseSeconds, unit: 'seconds' };
    } else if (averageSeconds < 3600) {
      return { averageTime: averageSeconds / 60, worstCase: worstCaseSeconds / 60, unit: 'minutes' };
    } else if (averageSeconds < 86400) {
      return { averageTime: averageSeconds / 3600, worstCase: worstCaseSeconds / 3600, unit: 'hours' };
    } else if (averageSeconds < 31536000) {
      return { averageTime: averageSeconds / 86400, worstCase: worstCaseSeconds / 86400, unit: 'days' };
    } else {
      return { averageTime: averageSeconds / 31536000, worstCase: worstCaseSeconds / 31536000, unit: 'years' };
  /**
   * Validate minimum entropy requirements
   */
  static validateEntropyRequirements(entropy: number, codeType: CodeType): boolean {
  const requirements = {
  [CodeType.EMAIL_VERIFICATION]: 20,  // ~6-digit numeric,
  [CodeType.SMS_VERIFICATION]: 20,    // ~6-digit numeric,
  [CodeType.TOTP_SECRET]: 128,        // ~32 bytes base32,
  [CodeType.BACKUP_CODE]: 40,         // ~8-character alphanumeric,
  [CodeType.RECOVERY_TOKEN]: 128,     // ~32 bytes,
  [CodeType.API_TOKEN]: 256           // ~64 bytes,
};
    return entropy >= requirements[codeType];

// ========================================
// Rate Limiting Service
// ========================================
interface RateLimitState {
  attempts: number;,
  windowStart: Date;
  lastAttempt: Date;
class RateLimitService {
  private limitStates: Map<string, RateLimitState> = new Map();
  private readonly limits = {
    [CodeType.EMAIL_VERIFICATION]: { maxAttempts: 5, windowMinutes: 15 },
    [CodeType.SMS_VERIFICATION]: { maxAttempts: 3, windowMinutes: 15 },
    [CodeType.TOTP_SECRET]: { maxAttempts: 10, windowMinutes: 60 },
    [CodeType.BACKUP_CODE]: { maxAttempts: 3, windowMinutes: 60 },
    [CodeType.RECOVERY_TOKEN]: { maxAttempts: 3, windowMinutes: 60 },
    [CodeType.API_TOKEN]: { maxAttempts: 10, windowMinutes: 60 }
  };
  checkRateLimit(key: string, codeType: CodeType): { allowed: boolean; remainingAttempts: number } {
  const limit = this.limits[codeType];
  const state = this.limitStates.get(key);
  const now = new Date();
  if (!state) {
  // First attempt
  this.limitStates.set(key, {)
  attempts: 1,
  windowStart: now,
  lastAttempt: now,
});
      return { allowed: true, remainingAttempts: limit.maxAttempts - 1 };
    // Check if window has expired
    const windowAge = now.getTime() - state.windowStart.getTime();
    const windowDuration = limit.windowMinutes * 60 * 1000;
    if (windowAge > windowDuration) {
  // Reset window
  this.limitStates.set(key, {)
  attempts: 1,
  windowStart: now,
  lastAttempt: now,
});
      return { allowed: true, remainingAttempts: limit.maxAttempts - 1 };
    // Check attempts within window
    if (state.attempts >= limit.maxAttempts) {
      return { allowed: false, remainingAttempts: 0 };
    // Increment attempts
    state.attempts++;
    state.lastAttempt = now;
    this.limitStates.set(key, state);
    return {
  allowed: true,
  remainingAttempts: limit.maxAttempts - state.attempts,
};
  resetRateLimit(key: string): void {
  this.limitStates.delete(key);
  getRateLimitInfo(key: string, codeType: CodeType): {,
  currentAttempts: number;,
  maxAttempts: number;
  windowMinutes: number;
  timeUntilReset?: number;
  const limit = this.limits[codeType];
  const state = this.limitStates.get(key);
  if (!state) {
  return {
  currentAttempts: 0,
  maxAttempts: limit.maxAttempts,
  windowMinutes: limit.windowMinutes,
};
    const now = new Date();
    const windowAge = now.getTime() - state.windowStart.getTime();
    const windowDuration = limit.windowMinutes * 60 * 1000;
    const timeUntilReset = Math.max(0, windowDuration - windowAge);
    return {
  currentAttempts: state.attempts,
  maxAttempts: limit.maxAttempts,
  windowMinutes: limit.windowMinutes,
  timeUntilReset: timeUntilReset > 0 ? timeUntilReset : undefined,
};

// ========================================
// Main Code Generation Service
// ========================================
}
export class CodeGenerationService {
  private rateLimitService: RateLimitService;
  private hashingAlgorithm: string = 'sha256';
  private saltLength: number = 32;
  constructor() {
    this.rateLimitService = new RateLimitService();
  /**
   * Generate a secure code based on specified options
   */
  async generateCode(options: CodeGenerationOptions): Promise<GeneratedCode> {
    // Validate input
    const validatedOptions = CodeGenerationSchema.parse(options);
    // Generate the actual code
    const code = this.generateSecureCode(validatedOptions);
    // Calculate entropy
    const charset = this.getCharset(validatedOptions);
    const entropy = EntropyCalculator.calculateEntropy(code, charset);
    // Validate entropy meets requirements
    if (!EntropyCalculator.validateEntropyRequirements(entropy, validatedOptions.type)) {
      throw new Error(`Generated code does not meet entropy requirements for ${validatedOptions.type}`);}
    // Generate salt and hash
    const salt = crypto.randomBytes(this.saltLength).toString('hex');
    const hashedCode = this.hashCode(code, salt);
    // Calculate expiry
    const expiresAt = validatedOptions.expiryMinutes ;
      ? new Date(Date.now() + validatedOptions.expiryMinutes * 60 * 1000)
      : undefined;
    return {
  code,
  hashedCode,
  salt,
  type: validatedOptions.type,
  format: validatedOptions.format,
  expiresAt,
  metadata: {,
  generatedAt: new Date(),
  userId: validatedOptions.userContext?.userId,
  ipAddress: validatedOptions.userContext?.ipAddress,
  entropy,
  algorithm: this.hashingAlgorithm,
};
  /**
   * Validate a code against stored hash
   */
  async validateCode(inputCode: string,)
    storedData: GeneratedCode,
    options: CodeValidationOptions = {}
  ): Promise<CodeValidationResult> {
  const startTime = Date.now();
  const defaultOptions: Required<CodeValidationOptions> = {,
  allowExpired: false,
  constantTimeValidation: true,
  rateLimitingEnabled: true,
  maxAttempts: 5,
  ...options
};
    try {
  // Validate input format
  const validationInput = CodeValidationSchema.parse({)
  code: inputCode,
  hashedCode: storedData.hashedCode,
  salt: storedData.salt,
  options: defaultOptions,
});
      // Check rate limiting
      if (defaultOptions.rateLimitingEnabled && storedData.metadata.userId) {
        const rateLimitKey = `${storedData.metadata.userId}:${storedData.type}`;}
        const rateLimit = this.rateLimitService.checkRateLimit(rateLimitKey, storedData.type);
        if (!rateLimit.allowed) {
  return {
  valid: false,
  reason: 'rate_limited',
  remainingAttempts: rateLimit.remainingAttempts,
  metadata: {,
  validatedAt: new Date(),
  timingAttackSafe: false,
  processingTimeMs: Date.now() - startTime,
};
      // Check expiry
      if (!defaultOptions.allowExpired && storedData.expiresAt && storedData.expiresAt < new Date()) {
  return {
  valid: false,
  reason: 'expired',
  metadata: {,
  validatedAt: new Date(),
  timingAttackSafe: defaultOptions.constantTimeValidation,
  processingTimeMs: Date.now() - startTime,
};
      // Validate format
      if (!this.validateCodeFormat(inputCode, storedData.format)) {
  return {
  valid: false,
  reason: 'format_mismatch',
  metadata: {,
  validatedAt: new Date(),
  timingAttackSafe: defaultOptions.constantTimeValidation,
  processingTimeMs: Date.now() - startTime,
};
      // Hash input code and compare
      const inputHash = this.hashCode(inputCode, storedData.salt);
      const isValid = defaultOptions.constantTimeValidation ;
        ? this.constantTimeCompare(inputHash, storedData.hashedCode)
        : inputHash === storedData.hashedCode;
      // Calculate processing time for timing attack protection
      const processingTime = Date.now() - startTime;
      // Ensure minimum processing time for constant-time validation
      if (defaultOptions.constantTimeValidation) {
  const minProcessingTime = 10; // 10ms minimum;
  if (processingTime < minProcessingTime) {
  await new Promise(resolve => setTimeout(resolve, minProcessingTime - processingTime));
  return {
  valid: isValid,
  reason: isValid ? undefined : 'invalid',
  metadata: {,
  validatedAt: new Date(),
  timingAttackSafe: defaultOptions.constantTimeValidation,
  processingTimeMs: Date.now() - startTime,
};
    } catch (error) {
  return {
  valid: false,
  reason: 'invalid',
  metadata: {,
  validatedAt: new Date(),
  timingAttackSafe: false,
  processingTimeMs: Date.now() - startTime,
};
  /**
   * Generate TOTP secret with proper formatting
   */
  async generateTOTPSecret(userId: string): Promise<{,
  secret: string;
  qrCodeData: string;,
  manualEntryKey: string;
  backupCodes: string;
}> {
    // Generate 32-byte secret for TOTP
    const secretOptions: CodeGenerationOptions = {,
  type: CodeType.TOTP_SECRET,
      format: CodeFormat.BASE32,
      length: 32,
      userContext: { userId, ipAddress: '0.0.0.0', userAgent: 'totp-generation' }
    };
    const secretData = await this.generateCode(secretOptions);
    // Generate backup codes
    const backupCodes: string = [];
    for (let i = 0; i < 10; i++) {
  const backupOptions: CodeGenerationOptions = {,
  type: CodeType.BACKUP_CODE,
  format: CodeFormat.ALPHANUMERIC,
  length: 8,
  excludeSimilar: true,
};
      const backupData = await this.generateCode(backupOptions);
      // Format as XXXX-XXXX
      const formatted = `${backupData.code.slice(0, 4)}-${backupData.code.slice(4, 8)}`;}
      backupCodes.push(formatted);
    // Format for manual entry (space-separated groups of 4)
    const manualEntryKey = secretData.code.match(/.{1,4}/g)?.join(' ') || secretData.code;
    // Create QR code data URL format
    const issuer = 'PromptScape';
    const accountName = userId; // Could be email or username;
    const qrCodeData = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secretData.code}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;}
    return {
  secret: secretData.code,
  qrCodeData,
  manualEntryKey,
  backupCodes
};
  /**
   * Generate recovery token for account recovery
   */
  async generateRecoveryToken(userId: string): Promise<GeneratedCode> {
    return this.generateCode({)
  type: CodeType.RECOVERY_TOKEN,
      format: CodeFormat.HEX,
      length: 64, // 32 bytes
      expiryMinutes: 60, // 1 hour
      userContext: { userId, ipAddress: '0.0.0.0', userAgent: 'recovery-generation' }
    });
  /**
   * Generate API token
   */
  async generateAPIToken(userId: string, expiryDays?: number): Promise<GeneratedCode> {
    return this.generateCode({)
  type: CodeType.API_TOKEN,
      format: CodeFormat.HEX,
      length: 64, // 32 bytes
      expiryMinutes: expiryDays ? expiryDays * 24 * 60 : undefined,
      userContext: { userId, ipAddress: '0.0.0.0', userAgent: 'api-token-generation' }
    });
  /**
   * Get rate limit information for a user and code type
   */
  getRateLimitInfo(userId: string, codeType: CodeType) {
    const key = `${userId}:${codeType}`;}
    return this.rateLimitService.getRateLimitInfo(key, codeType);
  /**
   * Reset rate limit for a user and code type
   */
  resetRateLimit(userId: string, codeType: CodeType): void {
    const key = `${userId}:${codeType}`;}
    this.rateLimitService.resetRateLimit(key);
  // ========================================
  // Private Helper Methods
  // ========================================
  private generateSecureCode(options: CodeGenerationOptions): string {
  if (options.format === CodeFormat.UUID) {
  return crypto.randomUUID();
  const charset = this.getCharset(options);
  const codeArray: string = [];
  // Use cryptographically secure random number generation
  for (let i = 0; i < options.length; i++) {
  const randomIndex = crypto.randomInt(0, charset.length);
  codeArray.push(charset[randomIndex]);
  let code = codeArray.join('');
  // Apply complexity requirements for certain code types
  if (options.enforceComplexity) {
  code = this.enforceComplexity(code, charset);
  return code;
  private getCharset(options: CodeGenerationOptions): string {,
  if (options.customCharset) {
  return options.customCharset;
  let charset = CHARACTER_SETS[options.format];
  if (options.excludeSimilar) {
  for (const char of SIMILAR_CHARACTERS) {
  charset = charset.replace(new RegExp(char, 'g'), '');
  return charset;
  private enforceComplexity(code: string, charset: string): string {,
  // Ensure at least one character from each category if applicable
  const hasNumbers = /\d/.test(charset);
  const hasLetters = /[A-Z]/.test(charset);
  if (hasNumbers && hasLetters) {
  if (!/\d/.test(code)) {
  // Replace random position with number
  const numbers = charset.match(/\d/g) || [];
  const randomPos = crypto.randomInt(0, code.length);
  const randomNumber = numbers[crypto.randomInt(0, numbers.length)];
  code = code.substring(0, randomPos) + randomNumber + code.substring(randomPos + 1);
  if (!/[A-Z]/.test(code)) {
  // Replace random position with letter
  const letters = charset.match(/[A-Z]/g) || [];
  const randomPos = crypto.randomInt(0, code.length);
  const randomLetter = letters[crypto.randomInt(0, letters.length)];
  code = code.substring(0, randomPos) + randomLetter + code.substring(randomPos + 1);
  return code;
  private hashCode(code: string, salt: string): string {,
  return crypto.createHash(this.hashingAlgorithm)
  .update(code + salt)
  .digest('hex');
  private constantTimeCompare(a: string, b: string): boolean {,
  if (a.length !== b.length) {
  return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
  result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
  private validateCodeFormat(code: string, format: CodeFormat): boolean {,
  const pattern = CODE_PATTERNS[format];
  return pattern ? pattern.test(code) : true;
  // ========================================
  // Utility Functions
  // ========================================
  export class CodeGenerationUtils {
  /**
  * Analyze the strength of a generated code
  */
  static analyzeCodeStrength(generatedCode: GeneratedCode): {,
  entropy: number;,
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  crackTime: {,
  averageTime: number;,
  worstCase: number;
  unit: string;
};
    recommendations: string;
    const entropy = generatedCode.metadata.entropy;
    const crackTime = EntropyCalculator.calculateCrackTime(entropy);
    let strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
    if (entropy < 30) strength = 'weak';
    else if (entropy < 50) strength = 'moderate';
    else if (entropy < 80) strength = 'strong';
    else strength = 'very_strong';
    const recommendations: string = [];
    if (entropy < 40) {
      recommendations.push('Consider increasing code length');
    if (generatedCode.format === CodeFormat.NUMERIC) {
      recommendations.push('Consider using alphanumeric format for better security');
    if (!generatedCode.expiresAt) {
      recommendations.push('Consider adding expiration time');
    return {
      entropy,
      strength,
      crackTime,
      recommendations
    };
  /**
   * Generate a secure random seed for testing
   */
  static generateTestSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  /**
   * Format code for user display
   */
  static formatCodeForDisplay(code: string, format: CodeFormat): string {
    switch (format) {
    case CodeFormat.NUMERIC:
      // Format as XXX XXX for 6-digit codes
      if (code.length === 6) {
        return `${code.slice(0, 3)} ${code.slice(3)}`;}
      return code;
    case CodeFormat.ALPHANUMERIC:
    case CodeFormat.BASE32:
      // Format in groups of 4
      return code.match(/.{1,4}/g)?.join(' ') || code;
    case CodeFormat.HEX:
      // Format in groups of 8
      return code.match(/.{1,8}/g)?.join(' ') || code;
    default:
      return code;

export default CodeGenerationService;