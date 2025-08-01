// Location Verification Service - Epic 19 Implementation
// Orchestrates location-based security challenges using existing infrastructure

import { GeolocationService, GeolocationData } from './GeolocationService';
import { 
  VerificationThresholdService, 
  VerificationRequirement 
 from '../../services/VerificationThresholdService';
import { ChallengeService } from './ChallengeService';
import { 
  VerificationCodeManager, 
  VerificationCodeType,
  DeliveryChannel,
  CodeGenerationRequest,
  CodeValidationRequest 
 from '../../../../packages/core/security/VerificationCodeManager';
import { EmailService } from './EmailService';
import { AuditService } from './AuditService';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';



export interface LocationContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  deviceFingerprint?: string;
  geoLocation?: {
    country?: string;
    city?: string;
    timezone?: string;



  };




export interface LocationChallengeRequirement {
  required: boolean;
  challengeId?: string;
  challengeType?: LocationChallengeType;
  verificationCodeId?: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  expiresAt?: Date;
  deliveryMethod?: 'email' | 'sms' | 'totp' | 'manual_review';
  gracePeriodHours?: number;
  message?: string;





export enum LocationChallengeType {
  EMAIL_VERIFICATION = 'email_verification',
  SMS_VERIFICATION = 'sms_verification',
  TOTP_VERIFICATION = 'totp_verification',
  MULTIPLE_FACTOR = 'multiple_factor',
  MANUAL_REVIEW = 'manual_review',
  ADMIN_APPROVAL = 'admin_approval'




export interface LocationVerificationAttempt {
  id: string;
  userId: string;
  challengeId: string;
  verificationCodeId?: string;
  ipAddress: string;
  locationData: GeolocationData;
  riskScore: number;
  challengeType: LocationChallengeType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  metadata: {
    userAgent: string;
    sessionId?: string;
    deviceFingerprint?: string;
    reasons: string[];
    deliveryMethod?: string;
    gracePeriodApplied?: boolean;



  };




export interface LocationVerificationConfig {
  // Risk thresholds for different challenge types
  emailVerificationThreshold: number;      // 30 - Low risk
  smsVerificationThreshold: number;        // 50 - Medium risk
  totpVerificationThreshold: number;       // 70 - High risk
  manualReviewThreshold: number;           // 85 - Critical risk
  
  // Challenge expiration times (milliseconds)
  emailCodeExpiry: number;                 // 15 minutes
  smsCodeExpiry: number;                   // 5 minutes
  totpCodeExpiry: number;                  // 3 minutes
  manualReviewExpiry: number;              // 24 hours
  
  // Grace periods
  trustedLocationGraceDays: number;        // 30 days
  verificationGracePeriod: number;         // 24 hours
  
  // Rate limiting
  maxVerificationAttempts: number;         // 3 attempts
  verificationCooldown: number;            // 15 minutes
  
  // Feature flags
  enableSMSVerification: boolean;
  enableTOTPVerification: boolean;
  enableManualReview: boolean;
  enableGracePeriods: boolean;





export class LocationVerificationService {
  private config: LocationVerificationConfig;

  constructor(
    private geolocationService: GeolocationService,
    private verificationThresholdService: VerificationThresholdService,
    private challengeService: ChallengeService,
    private verificationCodeManager: VerificationCodeManager,
    private emailService: EmailService,
    private auditService: AuditService,
    private db: DatabaseService,
    private redis: RedisService,
    config?: Partial<LocationVerificationConfig>
  ) {
    this.config = {
      emailVerificationThreshold: 30,
      smsVerificationThreshold: 50,
      totpVerificationThreshold: 70,
      manualReviewThreshold: 85,
      emailCodeExpiry: 15 * 60 * 1000,        // 15 minutes
      smsCodeExpiry: 5 * 60 * 1000,           // 5 minutes
      totpCodeExpiry: 3 * 60 * 1000,          // 3 minutes
      manualReviewExpiry: 24 * 60 * 60 * 1000, // 24 hours
      trustedLocationGraceDays: 30,
      verificationGracePeriod: 24 * 60 * 60 * 1000, // 24 hours
      maxVerificationAttempts: 3,
      verificationCooldown: 15 * 60 * 1000,    // 15 minutes
      enableSMSVerification: true,
      enableTOTPVerification: true,
      enableManualReview: true,
      enableGracePeriods: true,
      ...config
    };


  /**
   * Assess if location verification is required for a login attempt
   */
  async assessLocationChallenge(context: LocationContext): Promise<LocationChallengeRequirement> {

    try {
      // Get geolocation data
      const geoData = await this.geolocationService.getGeolocationData(
        context.ipAddress,
        context.geoLocation ? {
          'cf-ipcountry': context.geoLocation.country,
          'cf-timezone': context.geoLocation.timezone
 : undefined
      );

      // Track login location and get analysis
      const locationAnalysis = await this.geolocationService.trackLoginLocation(
        context.userId,
        context.ipAddress,
        geoData
      );

      // Check if user is in grace period
      if (this.config.enableGracePeriods) {
        const gracePeriod = await this.checkGracePeriod(context.userId, geoData);
        if (gracePeriod.active) {
          return {
            required: false,
            riskScore: 0,
            riskLevel: 'low',
            reasons: [`Grace period active until ${gracePeriod.expiresAt?.toLocaleString()}`],
            gracePeriodHours: gracePeriod.remainingHours
          };



      // Assess verification requirement using existing service
      const verificationReq = await this.verificationThresholdService.checkVerificationRequired({
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        deviceFingerprint: context.deviceFingerprint,
        geoLocation: geoData,
        requestedAction: 'login',
        timestamp: new Date()
      });

      // Check if verification is required based on risk score
      if (!this.requiresLocationChallenge(verificationReq, locationAnalysis)) {
        return {
          required: false,
          riskScore: verificationReq.riskScore,
          riskLevel: this.getRiskLevel(verificationReq.riskScore),
          reasons: ['Location verification not required']
        };


      // Generate appropriate challenge based on risk level
      return await this.generateLocationChallenge(context, verificationReq, geoData, locationAnalysis);
 catch (error) {
      await this.auditService.logEvent({
        userId: context.userId,
        action: 'location_verification_error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: context.ipAddress

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });

      // Default to requiring email verification on error
      return {
        required: true,
        challengeType: LocationChallengeType.EMAIL_VERIFICATION,
        riskScore: 50,
        riskLevel: 'medium',
        reasons: ['Error in location assessment - defaulting to verification'],
        deliveryMethod: 'email',
        message: 'Additional verification required for your security'
      };



  /**
   * Verify a location challenge response
   */
  async verifyLocationChallenge(
    challengeId: string, 
    response: string,
    context: Pick<LocationContext, 'userId' | 'ipAddress' | 'userAgent' | 'sessionId'>
  ): Promise<{
    success: boolean;
    remainingAttempts?: number;
    blocked?: boolean;
    gracePeriodSet?: boolean;
    message?: string;
> {

    try {
      // Get verification attempt
      const attempt = await this.getVerificationAttempt(challengeId);
      if (!attempt) {
        return { success: false, message: 'Invalid or expired verification challenge' };


      // Check if attempt has expired
      if (attempt.expiresAt < new Date()) {
        await this.updateVerificationAttempt(challengeId, { status: 'expired' });
        return { success: false, message: 'Verification challenge has expired' };


      // Check if attempt is already completed or failed
      if (attempt.status === 'completed') {
        return { success: true, message: 'Already verified' };


      if (attempt.status === 'failed') {
        return { success: false, blocked: true, message: 'Verification failed - contact support' };


      // Verify the response based on challenge type
      let verificationResult = { success: false, message: 'Invalid verification code' };

      switch (attempt.challengeType) {
      case LocationChallengeType.EMAIL_VERIFICATION:
      case LocationChallengeType.SMS_VERIFICATION:
        if (attempt.verificationCodeId) {
          const validationResult = await this.verificationCodeManager.validateCode({
            userId: attempt.userId,
            code: response,
            type: attempt.challengeType === LocationChallengeType.EMAIL_VERIFICATION 
              ? VerificationCodeType.EMAIL_VERIFICATION 
              : VerificationCodeType.SMS_VERIFICATION,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent
          });
            
          verificationResult = {
            success: validationResult.valid,
            message: validationResult.reason || 'Invalid verification code'
          };

        break;

      case LocationChallengeType.TOTP_VERIFICATION:
        // Would integrate with TOTP service
        const totpResult = await this.verifyTOTPCode(attempt.userId, response);
        verificationResult = {
          success: totpResult.success,
          message: totpResult.message || 'TOTP verification failed'
        };
        break;

      default:
        verificationResult = { success: false, message: 'Unsupported challenge type' };


      // Update attempt count
      const newAttempts = attempt.attempts + 1;
      const remainingAttempts = Math.max(0, attempt.maxAttempts - newAttempts);

      if (verificationResult.success) {
        // Mark as completed
        await this.updateVerificationAttempt(challengeId, {
          status: 'completed',
          completedAt: new Date(),
          attempts: newAttempts
        });

        // Set grace period for this location
        const gracePeriodSet = await this.setLocationGracePeriod(
          attempt.userId,
          attempt.locationData
        );

        // Log successful verification
        await this.auditService.logEvent({
          userId: attempt.userId,
          action: 'location_verification_success',
          details: {
            challengeId,
            challengeType: attempt.challengeType,
            attempts: newAttempts,
            gracePeriodSet

          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          severity: 'info'
        });

        return { 
          success: true, 
          gracePeriodSet,
          message: 'Location verified successfully' 
        };
 else {
        // Handle failed attempt
        if (remainingAttempts === 0) {
          // Mark as failed
          await this.updateVerificationAttempt(challengeId, {
            status: 'failed',
            attempts: newAttempts
          });

          // Log failed verification
          await this.auditService.logEvent({
            userId: attempt.userId,
            action: 'location_verification_failed',
            details: {
              challengeId,
              challengeType: attempt.challengeType,
              totalAttempts: newAttempts,
              reason: 'max_attempts_exceeded'

            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            sessionId: context.sessionId,
            severity: 'warning'
          });

          return { 
            success: false, 
            blocked: true,
            message: 'Maximum verification attempts exceeded' 
          };
 else {
          // Update attempt count
          await this.updateVerificationAttempt(challengeId, {
            attempts: newAttempts
          });

          return { 
            success: false, 
            remainingAttempts,
            message: verificationResult.message || `Invalid code. ${remainingAttempts} attempts remaining.`
          };


 catch (error) {
      await this.auditService.logEvent({
        userId: context.userId,
        action: 'location_verification_error',
        details: {
          challengeId,
          error: error instanceof Error ? error.message : 'Unknown error'

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });

      return { success: false, message: 'Verification service error' };



  /**
   * Get user's location verification history
   */
  async getLocationVerificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<LocationVerificationAttempt[]> {

    const result = await this.db.query(`
      SELECT * FROM location_verification_attempts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => this.mapDatabaseRowToAttempt(row));


  /**
   * Check if location challenge is required
   */
  private requiresLocationChallenge(
    verificationReq: VerificationRequirement,
    locationAnalysis: any
  ): boolean {
    // Always require verification for new locations
    if (locationAnalysis.isNewLocation) {
      return true;


    // Require verification based on risk score thresholds
    if (verificationReq.riskScore >= this.config.emailVerificationThreshold) {
      return true;


    // Require verification for suspicious indicators
    if (locationAnalysis.suspiciousIndicators.length > 0) {
      return true;


    // Require verification if explicitly required
    if (verificationReq.required) {
      return true;


    return false;


  /**
   * Generate appropriate location challenge based on risk level
   */
  private async generateLocationChallenge(
    context: LocationContext,
    verificationReq: VerificationRequirement,
    geoData: GeolocationData,
    locationAnalysis: any
  ): Promise<LocationChallengeRequirement> {

    const riskScore = verificationReq.riskScore;
    let challengeType: LocationChallengeType;
    let deliveryMethod: string;
    let expiry: number;

    // Determine challenge type based on risk score
    if (riskScore >= this.config.manualReviewThreshold) {
      challengeType = LocationChallengeType.MANUAL_REVIEW;
      deliveryMethod = 'manual_review';
      expiry = this.config.manualReviewExpiry;
 else if (riskScore >= this.config.totpVerificationThreshold && this.config.enableTOTPVerification) {
      challengeType = LocationChallengeType.TOTP_VERIFICATION;
      deliveryMethod = 'totp';
      expiry = this.config.totpCodeExpiry;
 else if (riskScore >= this.config.smsVerificationThreshold && this.config.enableSMSVerification) {
      challengeType = LocationChallengeType.SMS_VERIFICATION;
      deliveryMethod = 'sms';
      expiry = this.config.smsCodeExpiry;
 else {
      challengeType = LocationChallengeType.EMAIL_VERIFICATION;
      deliveryMethod = 'email';
      expiry = this.config.emailCodeExpiry;


    // Generate challenge ID
    const challengeId = this.generateChallengeId();
    const expiresAt = new Date(Date.now() + expiry);

    // Create verification attempt record
    const attempt: LocationVerificationAttempt = {
      id: challengeId,
      userId: context.userId,
      challengeId,
      ipAddress: context.ipAddress,
      locationData: geoData,
      riskScore,
      challengeType,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.config.maxVerificationAttempts,
      createdAt: new Date(),
      expiresAt,
      metadata: {
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        deviceFingerprint: context.deviceFingerprint,
        reasons: this.buildChallengeReasons(verificationReq, locationAnalysis),
        deliveryMethod,
        gracePeriodApplied: false

    };

    // Generate verification code if needed
    let verificationCodeId: string | undefined;
    if (challengeType === LocationChallengeType.EMAIL_VERIFICATION || 
        challengeType === LocationChallengeType.SMS_VERIFICATION) {
      
      const codeType = challengeType === LocationChallengeType.EMAIL_VERIFICATION 
        ? VerificationCodeType.EMAIL_VERIFICATION 
        : VerificationCodeType.SMS_VERIFICATION;
      
      const verificationCode = await this.verificationCodeManager.generateCode({
        userId: context.userId,
        type: codeType,
        deliveryChannel: challengeType === LocationChallengeType.EMAIL_VERIFICATION 
          ? DeliveryChannel.EMAIL 
          : DeliveryChannel.SMS,
        deliveryAddress: 'user@example.com', // TODO: Get from user database
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        expirationMinutes: Math.floor(expiry / (60 * 1000)),
        metadata: {
          challengeId,
          location: `${geoData.city}, ${geoData.country}`

      });

      if (verificationCode) {
        verificationCodeId = verificationCode.codeId;
        attempt.verificationCodeId = verificationCodeId;

        // Send verification email/SMS
        await this.sendVerificationMessage(context, geoData, verificationCode, challengeType);



    // Store verification attempt
    await this.storeVerificationAttempt(attempt);

    // Log challenge generation
    await this.auditService.logEvent({
      userId: context.userId,
      action: 'location_challenge_generated',
      details: {
        challengeId,
        challengeType,
        riskScore,
        deliveryMethod,
        location: `${geoData.city}, ${geoData.country}`,
        reasons: attempt.metadata.reasons

      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      severity: 'info'
    });

    return {
      required: true,
      challengeId,
      challengeType,
      verificationCodeId,
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      reasons: attempt.metadata.reasons,
      expiresAt,
      deliveryMethod: deliveryMethod as any,
      message: this.buildChallengeMessage(challengeType, geoData)
    };


  /**
   * Send verification message (email or SMS)
   */
  private async sendVerificationMessage(
    context: LocationContext,
    geoData: GeolocationData,
    verificationCode: { code: string; codeId: string },
    challengeType: LocationChallengeType
  ): Promise<void> {

    if (challengeType === LocationChallengeType.EMAIL_VERIFICATION) {
      await this.emailService.sendLocationVerification(context.userId, {
        code: verificationCode.code,
        location: {
          city: geoData.city,
          country: geoData.country,
          region: geoData.region

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        expiryMinutes: Math.floor(this.config.emailCodeExpiry / (60 * 1000)),
        timestamp: new Date()
      });
 else if (challengeType === LocationChallengeType.SMS_VERIFICATION) {
      // SMS implementation would go here
      console.log(`SMS verification not yet implemented: ${verificationCode.code}`);



  /**
   * Build challenge reasons array
   */
  private buildChallengeReasons(
    verificationReq: VerificationRequirement,
    locationAnalysis: any
  ): string[] {
    const reasons = [];

    if (locationAnalysis.isNewLocation) {
      reasons.push('New login location detected');


    if (locationAnalysis.suspiciousIndicators.includes('vpn_detected')) {
      reasons.push('VPN usage detected');


    if (locationAnalysis.suspiciousIndicators.includes('tor_exit_node')) {
      reasons.push('Tor network usage detected');


    if (locationAnalysis.suspiciousIndicators.includes('proxy_detected')) {
      reasons.push('Proxy usage detected');


    if (verificationReq.riskScore >= 70) {
      reasons.push('High risk score detected');


    if (reasons.length === 0) {
      reasons.push('Additional security verification required');


    return reasons;


  /**
   * Build user-friendly challenge message
   */
  private buildChallengeMessage(
    challengeType: LocationChallengeType,
    geoData: GeolocationData
  ): string {
    const location = `${geoData.city}, ${geoData.country}`;

    switch (challengeType) {
    case LocationChallengeType.EMAIL_VERIFICATION:
      return `We detected a login from ${location}. Please check your email for a verification code.`;
    case LocationChallengeType.SMS_VERIFICATION:
      return `We detected a login from ${location}. Please check your phone for a verification code.`;
    case LocationChallengeType.TOTP_VERIFICATION:
      return `We detected a login from ${location}. Please enter your authenticator code.`;
    case LocationChallengeType.MANUAL_REVIEW:
      return `We detected a high-risk login from ${location}. Your account is under manual review.`;
    default:
      return `We detected a login from ${location}. Additional verification is required.`;



  // Additional helper methods would be implemented here...

  private async checkGracePeriod(userId: string, geoData: GeolocationData): Promise<{
    active: boolean;
    expiresAt?: Date;
    remainingHours?: number;
> {

    // Implementation for checking grace period
    return { active: false };


  private async setLocationGracePeriod(userId: string, geoData: GeolocationData): Promise<boolean> {

    // Implementation for setting grace period
    return true;


  private async verifyTOTPCode(userId: string, code: string): Promise<{ success: boolean; message?: string }> {

    // Would integrate with TOTP service
    return { success: false, message: 'TOTP verification not implemented' };


  private generateChallengeId(): string {
    return `loc_challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private async getVerificationAttempt(challengeId: string): Promise<LocationVerificationAttempt | null> {

    const result = await this.db.query(`
      SELECT * FROM location_verification_attempts WHERE challenge_id = $1
    `, [challengeId]);

    return result.rows.length > 0 ? this.mapDatabaseRowToAttempt(result.rows[0]) : null;


  private async storeVerificationAttempt(attempt: LocationVerificationAttempt): Promise<void> {

    await this.db.query(`
      INSERT INTO location_verification_attempts (
        id, user_id, challenge_id, verification_code_id, ip_address, 
        location_data, risk_score, challenge_type, status, attempts, 
        max_attempts, created_at, expires_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      attempt.id,
      attempt.userId,
      attempt.challengeId,
      attempt.verificationCodeId,
      attempt.ipAddress,
      JSON.stringify(attempt.locationData),
      attempt.riskScore,
      attempt.challengeType,
      attempt.status,
      attempt.attempts,
      attempt.maxAttempts,
      attempt.createdAt,
      attempt.expiresAt,
      JSON.stringify(attempt.metadata)
    ]);


  private async updateVerificationAttempt(
    challengeId: string,
    updates: Partial<LocationVerificationAttempt>
  ): Promise<void> {

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`);
      values.push(updates.status);


    if (updates.attempts !== undefined) {
      setClause.push(`attempts = $${paramIndex++}`);
      values.push(updates.attempts);


    if (updates.completedAt !== undefined) {
      setClause.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);


    values.push(challengeId);

    await this.db.query(`
      UPDATE location_verification_attempts 
      SET ${setClause.join(', ')}
      WHERE challenge_id = $${paramIndex}
    `, values);


  private mapDatabaseRowToAttempt(row: any): LocationVerificationAttempt {
    return {
      id: row.id,
      userId: row.user_id,
      challengeId: row.challenge_id,
      verificationCodeId: row.verification_code_id,
      ipAddress: row.ip_address,
      locationData: JSON.parse(row.location_data),
      riskScore: parseFloat(row.risk_score),
      challengeType: row.challenge_type,
      status: row.status,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      completedAt: row.completed_at,
      metadata: JSON.parse(row.metadata)
    };


  /**
   * Initialize database schema for location verification
   */
  async initializeSchema(): Promise<void> {

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS location_verification_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        challenge_id VARCHAR(255) UNIQUE NOT NULL,
        verification_code_id UUID,
        ip_address INET NOT NULL,
        location_data JSONB NOT NULL,
        risk_score NUMERIC(5,2) NOT NULL,
        challenge_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        metadata JSONB

    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_location_verification_user 
      ON location_verification_attempts(user_id);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_location_verification_status 
      ON location_verification_attempts(status, expires_at);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_location_verification_challenge 
      ON location_verification_attempts(challenge_id);
    `);


  /**
   * Get risk level from risk score
   */
  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';

