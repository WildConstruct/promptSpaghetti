/**
 * Temporary Account Lockout Logic - Epic 19 Implementation
 * Advanced temporary lockout system with configurable durations, progressive penalties, and recovery options
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';



export interface TemporaryLockoutConfig {
  enabled: boolean;
  baseDuration: number; // seconds
  maxDuration: number; // seconds
  progressiveMultiplier: number;
  maxProgressiveLevel: number;
  gracePeriod: number; // seconds before lockout takes effect
  warningThreshold: number; // attempts before warning
  cooldownPeriod: number; // seconds between lockout attempts
  bypassRoles: string[];
  exemptIPs: string[];
  exemptUserAgents: string[];







export interface LockoutTrigger {
  id: string;
  name: string;
  type: 'failed_login' | 'rate_limit' | 'suspicious_activity' | 'security_violation' | 'manual';
  enabled: boolean;
  threshold: number;
  timeWindow: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  resetOnSuccess: boolean;
  customDuration?: number; // override default duration
  description: string;







export interface TemporaryLockout {
  id: string;
  userId: string;
  triggerId: string;
  triggerType: LockoutTrigger['type'];
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  timing: {
    createdAt: Date;
    activatesAt: Date; // when lockout becomes active (after grace period)
    expiresAt: Date;
    duration: number; // seconds
    gracePeriod: number; // seconds
    remainingTime: number; // seconds (calculated dynamically)



  };
  
  status: 'pending' | 'active' | 'expired' | 'released' | 'overridden';
  level: number; // progressive lockout level
  
  context: {
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    sessionId?: string;
    triggerData: Record<string, any>;
    violationCount: number;
  };
  
  recovery: {
    allowEarlyRelease: boolean;
    allowGraceExtension: boolean;
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    releaseReason?: string;
  };
  
  metadata: {
    deviceFingerprint: string;
    geolocation?: string;
    riskScore: number;
    relatedLockouts: string[];
    notificationsSent: string[];
    auditTrail: Array<{
      action: string;
      performedBy: string;
      timestamp: Date;
      details: Record<string, any>;
>;
  };




export interface LockoutAttempt {
  id: string;
  userId: string;
  attemptType: 'authentication' | 'api_request' | 'admin_action' | 'resource_access';
  timestamp: Date;
  success: boolean;
  
  details: {
    endpoint: string;
    method: string;
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    responseCode?: number;
    responseTime?: number;
    errorType?: string;
    blocked: boolean;



  };
  
  triggers: {
    evaluated: string[];
    triggered: string[];
    warnings: string[];
  };
  
  consequences: {
    lockoutCreated?: string;
    warningIssued?: boolean;
    additionalRestrictions?: string[];
  };




export interface LockoutWarning {
  id: string;
  userId: string;
  triggerId: string;
  warningType: 'approaching_threshold' | 'grace_period' | 'temporary_restriction' | 'escalation';
  message: string;
  severity: 'info' | 'warning' | 'error';
  
  timing: {
    issuedAt: Date;
    expiresAt: Date;
    acknowledgedAt?: Date;



  };
  
  thresholds: {
    current: number;
    maximum: number;
    remaining: number;
  };
  
  actions: {
    required: string[];
    recommended: string[];
    preventive: string[];
  };


export class TemporaryLockoutService extends EventEmitter {
  private config: TemporaryLockoutConfig;
  private triggers: Map<string, LockoutTrigger> = new Map();
  private activeLockouts: Map<string, TemporaryLockout> = new Map();
  private lockoutHistory: Map<string, TemporaryLockout[]> = new Map();
  private userAttempts: Map<string, LockoutAttempt[]> = new Map();
  private activeWarnings: Map<string, LockoutWarning[]> = new Map();
  private maintenanceInterval: NodeJS.Timeout;

  constructor(config: TemporaryLockoutConfig) {
    super();
    this.config = config;
    this.initializeDefaultTriggers();
    this.startMaintenanceTasks();


  /**
   * Register a lockout trigger
   */
  async registerTrigger(trigger: Omit<LockoutTrigger, 'id'>): Promise<LockoutTrigger> {

    const newTrigger: LockoutTrigger = {
      ...trigger,
      id: this.generateTriggerId()
    };

    await this.validateTrigger(newTrigger);
    this.triggers.set(newTrigger.id, newTrigger);

    await this.logEvent('trigger_registered', 'system', {
      triggerId: newTrigger.id,
      triggerName: newTrigger.name,
      triggerType: newTrigger.type
    });

    this.emit('triggerRegistered', newTrigger);
    return newTrigger;


  /**
   * Evaluate lockout conditions for a user attempt
   */
  async evaluateLockoutConditions(
    userId: string,
    attemptType: LockoutAttempt['attemptType'],
    context: {
      endpoint: string;
      method: string;
      ipAddress: string;
      userAgent: string;
      sessionId?: string;
      success: boolean;
      responseCode?: number;
      responseTime?: number;
      errorType?: string;

  ): Promise<{
    lockoutRequired: boolean;
    lockout?: TemporaryLockout;
    warnings: LockoutWarning[];
    restrictions: string[];
    message?: string;
> {

    // Check if user is exempt
    if (await this.isUserExempt(userId, context.ipAddress, context.userAgent)) {
      return {
        lockoutRequired: false,
        warnings: [],
        restrictions: []
      };


    // Check if user already has an active lockout
    const existingLockout = this.activeLockouts.get(userId);
    if (existingLockout && this.isLockoutActive(existingLockout)) {
      return {
        lockoutRequired: true,
        lockout: existingLockout,
        warnings: [],
        restrictions: this.getLockoutRestrictions(existingLockout),
        message: this.generateLockoutMessage(existingLockout)
      };


    // Record the attempt
    const attempt = await this.recordAttempt(userId, attemptType, context);

    // Evaluate all triggers
    const evaluationResults = await this.evaluateAllTriggers(userId, attempt);
    
    const warnings: LockoutWarning[] = [];
    let lockoutRequired = false;
    let newLockout: TemporaryLockout | undefined;

    // Process trigger results
    for (const result of evaluationResults) {
      if (result.shouldLock) {
        lockoutRequired = true;
        newLockout = await this.createTemporaryLockout(
          userId,
          result.trigger,
          result.violationData,
          context
        );
        break; // Only create one lockout per evaluation
 else if (result.shouldWarn) {
        const warning = await this.createWarning(
          userId,
          result.trigger,
          result.warningData,
          context
        );
        warnings.push(warning);



    // Update attempt with results
    attempt.triggers.triggered = evaluationResults
      .filter(r => r.shouldLock)
      .map(r => r.trigger.id);
    
    attempt.triggers.warnings = warnings.map(w => w.id);
    
    if (newLockout) {
      attempt.consequences.lockoutCreated = newLockout.id;


    return {
      lockoutRequired,
      lockout: newLockout,
      warnings,
      restrictions: newLockout ? this.getLockoutRestrictions(newLockout) : [],
      message: newLockout ? this.generateLockoutMessage(newLockout) : undefined
    };


  /**
   * Request early release from temporary lockout
   */
  async requestEarlyRelease(
    userId: string,
    reason: string,
    requestedBy: string,
    context: {
      ipAddress: string;
      userAgent: string;
      justification?: string;
    }
  ): Promise<{
    success: boolean;
    requiresApproval: boolean;
    approvalRequestId?: string;
    message: string;
> {

    const lockout = this.activeLockouts.get(userId);
    if (!lockout) {
      return {
        success: false,
        requiresApproval: false,
        message: 'No active lockout found'
      };


    if (!lockout.recovery.allowEarlyRelease) {
      return {
        success: false,
        requiresApproval: false,
        message: 'Early release not allowed for this lockout type'
      };


    // Add to audit trail
    lockout.metadata.auditTrail.push({
      action: 'early_release_requested',
      performedBy: requestedBy,
      timestamp: new Date(),
      details: {
        reason,
        justification: context.justification,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent

    });

    if (lockout.recovery.requiresApproval) {
      // Create approval request
      const approvalRequestId = await this.createApprovalRequest(lockout, reason, requestedBy, context);
      
      await this.logEvent('early_release_requested', requestedBy, {
        userId,
        lockoutId: lockout.id,
        reason,
        requiresApproval: true,
        approvalRequestId
      });

      return {
        success: true,
        requiresApproval: true,
        approvalRequestId,
        message: 'Early release request submitted for approval'
      };
 else {
      // Auto-approve based on criteria
      const canAutoApprove = await this.canAutoApproveRelease(lockout, reason);
      
      if (canAutoApprove) {
        await this.releaseLockout(userId, 'early_release', requestedBy, reason);
        
        return {
          success: true,
          requiresApproval: false,
          message: 'Lockout released successfully'
        };
 else {
        return {
          success: false,
          requiresApproval: false,
          message: 'Early release criteria not met'
        };




  /**
   * Manually release a lockout (admin action)
   */
  async releaseLockout(
    userId: string,
    releaseType: 'manual' | 'early_release' | 'grace_extension' | 'override',
    releasedBy: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    lockout?: TemporaryLockout;
> {

    const lockout = this.activeLockouts.get(userId);
    if (!lockout) {
      return {
        success: false,
        message: 'No active lockout found'
      };


    // Update lockout status
    lockout.status = 'released';
    lockout.recovery.releaseReason = reason || 'Manual release';
    lockout.recovery.approvedBy = releasedBy;
    lockout.recovery.approvedAt = new Date();

    // Add to audit trail
    lockout.metadata.auditTrail.push({
      action: 'lockout_released',
      performedBy: releasedBy,
      timestamp: new Date(),
      details: {
        releaseType,
        reason: reason || 'No reason provided'

    });

    // Move to history
    const userHistory = this.lockoutHistory.get(userId) || [];
    userHistory.push(lockout);
    this.lockoutHistory.set(userId, userHistory);

    // Remove from active lockouts
    this.activeLockouts.delete(userId);

    // Clear related warnings
    this.clearUserWarnings(userId);

    await this.logEvent('lockout_released', releasedBy, {
      userId,
      lockoutId: lockout.id,
      releaseType,
      reason,
      originalDuration: lockout.timing.duration,
      actualDuration: Date.now() - lockout.timing.createdAt.getTime()
    });

    // Send release notification
    await this.sendReleaseNotification(userId, lockout, releaseType, releasedBy);

    this.emit('lockoutReleased', {
      userId,
      lockout,
      releaseType,
      releasedBy
    });

    return {
      success: true,
      message: 'Lockout released successfully',
      lockout
    };


  /**
   * Get current lockout status for a user
   */
  async getLockoutStatus(userId: string): Promise<{
    isLocked: boolean;
    lockout?: TemporaryLockout;
    warnings: LockoutWarning[];
    restrictions: string[];
    nextLockoutLevel: number;
    timeSinceLastLockout?: number;
> {

    const lockout = this.activeLockouts.get(userId);
    const warnings = this.activeWarnings.get(userId) || [];
    const history = this.lockoutHistory.get(userId) || [];

    // Update lockout timing if active
    if (lockout && this.isLockoutActive(lockout)) {
      lockout.timing.remainingTime = Math.max(0, 
        Math.ceil((lockout.timing.expiresAt.getTime() - Date.now()) / 1000)
      );


    const lastLockout = history[history.length - 1];
    const timeSinceLastLockout = lastLockout 
      ? Date.now() - lastLockout.timing.expiresAt.getTime()
      : undefined;

    return {
      isLocked: lockout ? this.isLockoutActive(lockout) : false,
      lockout,
      warnings: warnings.filter(w => w.timing.expiresAt > new Date()),
      restrictions: lockout ? this.getLockoutRestrictions(lockout) : [],
      nextLockoutLevel: this.calculateNextLockoutLevel(userId),
      timeSinceLastLockout
    };


  /**
   * Get lockout statistics and analytics
   */
  async getLockoutAnalytics(timeRange: { start: Date; end: Date }): Promise<{
    totalLockouts: number;
    activeLockouts: number;
    lockoutsByType: Array<{ type: string; count: number }>;
    lockoutsBySeverity: Array<{ severity: string; count: number }>;
    averageDuration: number;
    earlyReleaseRate: number;
    topTriggers: Array<{ triggerId: string; name: string; count: number }>;
    userPatterns: Array<{
      userId: string;
      lockoutCount: number;
      averageDuration: number;
      mostCommonTrigger: string;
>;
> {
    const allLockouts = this.getAllLockoutsInRange(timeRange);
    
    const analytics = {
      totalLockouts: allLockouts.length,
      activeLockouts: Array.from(this.activeLockouts.values()).length,
      lockoutsByType: this.groupBy(allLockouts, 'triggerType'),
      lockoutsBySeverity: this.groupBy(allLockouts, 'severity'),
      averageDuration: this.calculateAverageDuration(allLockouts),
      earlyReleaseRate: this.calculateEarlyReleaseRate(allLockouts),
      topTriggers: this.getTopTriggers(allLockouts),
      userPatterns: this.getUserPatterns(allLockouts)
    };

    return analytics;


  // Private helper methods

  private initializeDefaultTriggers(): void {
    const defaultTriggers: Array<Omit<LockoutTrigger, 'id'>> = [
      {
        name: 'Failed Login Attempts',
        type: 'failed_login',
        enabled: true,
        threshold: 5,
        timeWindow: 900, // 15 minutes
        severity: 'medium',
        resetOnSuccess: true,
        description: 'Lock account after multiple failed login attempts'

      {
        name: 'API Rate Limit Violation',
        type: 'rate_limit',
        enabled: true,
        threshold: 100,
        timeWindow: 300, // 5 minutes
        severity: 'low',
        resetOnSuccess: false,
        customDuration: 300, // 5 minutes
        description: 'Temporary lockout for API rate limit violations'

      {
        name: 'Suspicious Activity Detection',
        type: 'suspicious_activity',
        enabled: true,
        threshold: 3,
        timeWindow: 600, // 10 minutes
        severity: 'high',
        resetOnSuccess: false,
        description: 'Lock account for suspicious activity patterns'

      {
        name: 'Security Violation',
        type: 'security_violation',
        enabled: true,
        threshold: 1,
        timeWindow: 3600, // 1 hour
        severity: 'critical',
        resetOnSuccess: false,
        customDuration: 3600, // 1 hour
        description: 'Immediate lockout for security violations'

    ];

    for (const trigger of defaultTriggers) {
      this.registerTrigger(trigger);



  private async evaluateAllTriggers(
    userId: string,
    attempt: LockoutAttempt
  ): Promise<Array<{
    trigger: LockoutTrigger;
    shouldLock: boolean;
    shouldWarn: boolean;
    violationData?: Record<string, any>;
    warningData?: Record<string, any>;
>> {
    const results = [];
    const userAttempts = this.userAttempts.get(userId) || [];

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;

      const result = await this.evaluateTrigger(trigger, userAttempts, attempt);
      results.push({ trigger, ...result });


    return results;


  private async evaluateTrigger(
    trigger: LockoutTrigger,
    userAttempts: LockoutAttempt[],
    currentAttempt: LockoutAttempt
  ): Promise<{
    shouldLock: boolean;
    shouldWarn: boolean;
    violationData?: Record<string, any>;
    warningData?: Record<string, any>;
> {
    const windowStart = new Date(Date.now() - trigger.timeWindow * 1000);
    const relevantAttempts = userAttempts.filter(attempt => 
      attempt.timestamp >= windowStart &&
      this.isAttemptRelevantToTrigger(attempt, trigger)
    );

    const violationCount = relevantAttempts.length;
    const shouldLock = violationCount >= trigger.threshold;
    const shouldWarn = violationCount >= trigger.threshold * 0.8; // Warning at 80% of threshold

    return {
      shouldLock,
      shouldWarn: shouldWarn && !shouldLock,
      violationData: shouldLock ? {
        violationCount,
        threshold: trigger.threshold,
        timeWindow: trigger.timeWindow,
        recentAttempts: relevantAttempts.slice(-5) // Last 5 attempts
 : undefined,
      warningData: shouldWarn ? {
        currentCount: violationCount,
        threshold: trigger.threshold,
        remaining: trigger.threshold - violationCount
 : undefined
    };


  private isAttemptRelevantToTrigger(attempt: LockoutAttempt, trigger: LockoutTrigger): boolean {
    switch (trigger.type) {
    case 'failed_login':
      return attempt.attemptType === 'authentication' && !attempt.success;
    case 'rate_limit':
      return attempt.details.responseCode === 429;
    case 'suspicious_activity':
      return this.isSuspiciousAttempt(attempt);
    case 'security_violation':
      return this.isSecurityViolation(attempt);
    default:
      return false;



  private isSuspiciousAttempt(attempt: LockoutAttempt): boolean {
    // Implement suspicious activity detection logic
    return (
      attempt.details.responseTime && attempt.details.responseTime < 100 || // Too fast
      attempt.details.errorType === 'bot_detected' ||
      attempt.details.userAgent.includes('bot')
    );


  private isSecurityViolation(attempt: LockoutAttempt): boolean {
    // Implement security violation detection logic
    return (
      attempt.details.errorType === 'sql_injection' ||
      attempt.details.errorType === 'xss_attempt' ||
      attempt.details.errorType === 'unauthorized_access'
    );


  private async createTemporaryLockout(
    userId: string,
    trigger: LockoutTrigger,
    violationData: Record<string, any>,
    context: any
  ): Promise<TemporaryLockout> {

    const level = this.calculateLockoutLevel(userId);
    const duration = this.calculateLockoutDuration(trigger, level);
    const gracePeriod = this.calculateGracePeriod(trigger, level);
    const now = new Date();

    const lockout: TemporaryLockout = {
      id: this.generateLockoutId(),
      userId,
      triggerId: trigger.id,
      triggerType: trigger.type,
      severity: trigger.severity,
      timing: {
        createdAt: now,
        activatesAt: new Date(now.getTime() + gracePeriod * 1000),
        expiresAt: new Date(now.getTime() + duration * 1000),
        duration,
        gracePeriod,
        remainingTime: duration

      status: gracePeriod > 0 ? 'pending' : 'active',
      level,
      context: {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        endpoint: context.endpoint,
        sessionId: context.sessionId,
        triggerData: violationData,
        violationCount: violationData.violationCount

      recovery: {
        allowEarlyRelease: trigger.severity !== 'critical',
        allowGraceExtension: level === 1,
        requiresApproval: trigger.severity === 'critical' || level > 3

      metadata: {
        deviceFingerprint: await this.generateDeviceFingerprint(context.userAgent, context.ipAddress),
        geolocation: await this.getGeolocation(context.ipAddress),
        riskScore: this.calculateRiskScore(userId, trigger, violationData),
        relatedLockouts: [],
        notificationsSent: [],
        auditTrail: [{
          action: 'lockout_created',
          performedBy: 'system',
          timestamp: now,
          details: {
            trigger: trigger.name,
            level,
            duration,
            violationData

]

    };

    // Store lockout
    this.activeLockouts.set(userId, lockout);

    // Send notifications
    await this.sendLockoutNotification(userId, lockout);

    await this.logEvent('temporary_lockout_created', 'system', {
      userId,
      lockoutId: lockout.id,
      triggerId: trigger.id,
      triggerType: trigger.type,
      severity: trigger.severity,
      level,
      duration,
      gracePeriod
    });

    this.emit('lockoutCreated', lockout);
    return lockout;


  private async createWarning(
    userId: string,
    trigger: LockoutTrigger,
    warningData: Record<string, any>,
    context: any
  ): Promise<LockoutWarning> {

    const warning: LockoutWarning = {
      id: this.generateWarningId(),
      userId,
      triggerId: trigger.id,
      warningType: 'approaching_threshold',
      message: `Warning: ${warningData.remaining} more violations will result in account lockout`,
      severity: trigger.severity === 'critical' ? 'error' : 'warning',
      timing: {
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + trigger.timeWindow * 1000)

      thresholds: {
        current: warningData.currentCount,
        maximum: warningData.threshold,
        remaining: warningData.remaining

      actions: {
        required: [],
        recommended: ['Review account activity', 'Change password if compromised'],
        preventive: ['Enable MFA', 'Use trusted devices only']

    };

    // Store warning
    const userWarnings = this.activeWarnings.get(userId) || [];
    userWarnings.push(warning);
    this.activeWarnings.set(userId, userWarnings);

    // Send warning notification
    await this.sendWarningNotification(userId, warning);

    this.emit('warningIssued', warning);
    return warning;


  private calculateLockoutLevel(userId: string): number {
    const history = this.lockoutHistory.get(userId) || [];
    const recentLockouts = history.filter(lockout => 
      Date.now() - lockout.timing.createdAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    return Math.min(recentLockouts.length + 1, this.config.maxProgressiveLevel);


  private calculateLockoutDuration(trigger: LockoutTrigger, level: number): number {
    const baseDuration = trigger.customDuration || this.config.baseDuration;
    
    if (level === 1) {
      return baseDuration;

    
    const progressiveDuration = baseDuration * Math.pow(this.config.progressiveMultiplier, level - 1);
    return Math.min(progressiveDuration, this.config.maxDuration);


  private calculateGracePeriod(trigger: LockoutTrigger, level: number): number {
    if (trigger.severity === 'critical') {
      return 0; // No grace period for critical violations

    
    return level === 1 ? this.config.gracePeriod : Math.max(30, this.config.gracePeriod / level);


  private calculateRiskScore(userId: string, trigger: LockoutTrigger, violationData: Record<string, any>): number {
    let score = 0;
    
    // Base score by trigger severity
    const severityScores = { low: 10, medium: 25, high: 50, critical: 100 };
    score += severityScores[trigger.severity];
    
    // Violation count factor
    score += Math.min(violationData.violationCount * 5, 30);
    
    // User history factor
    const history = this.lockoutHistory.get(userId) || [];
    score += Math.min(history.length * 10, 40);
    
    return Math.min(score, 100);


  private isLockoutActive(lockout: TemporaryLockout): boolean {
    const now = new Date();
    return (
      lockout.status === 'active' ||
      (lockout.status === 'pending' && lockout.timing.activatesAt <= now)
    ) && lockout.timing.expiresAt > now;


  private getLockoutRestrictions(lockout: TemporaryLockout): string[] {
    const restrictions = [];
    
    switch (lockout.triggerType) {
    case 'failed_login':
      restrictions.push('Login disabled');
      break;
    case 'rate_limit':
      restrictions.push('API access limited');
      break;
    case 'suspicious_activity':
      restrictions.push('All access suspended');
      break;
    case 'security_violation':
      restrictions.push('Complete account lockdown');
      break;

    
    if (lockout.severity === 'critical') {
      restrictions.push('Requires manual review');

    
    return restrictions;


  private generateLockoutMessage(lockout: TemporaryLockout): string {
    const remainingMinutes = Math.ceil(lockout.timing.remainingTime / 60);
    
    if (lockout.status === 'pending') {
      const graceMinutes = Math.ceil((lockout.timing.activatesAt.getTime() - Date.now()) / (60 * 1000));
      return `Account will be locked in ${graceMinutes} minutes due to ${lockout.triggerType}. Duration: ${remainingMinutes} minutes.`;

    
    return `Account temporarily locked due to ${lockout.triggerType}. Remaining time: ${remainingMinutes} minutes.`;


  private async isUserExempt(userId: string, ipAddress: string, userAgent: string): Promise<boolean> {

    // Check IP exemptions
    if (this.config.exemptIPs.includes(ipAddress)) {
      return true;

    
    // Check user agent exemptions
    if (this.config.exemptUserAgents.some(ua => userAgent.includes(ua))) {
      return true;

    
    // Check role exemptions (would require user service integration)
    // const userRoles = await this.getUserRoles(userId);
    // return this.config.bypassRoles.some(role => userRoles.includes(role));
    
    return false;


  private async recordAttempt(
    userId: string,
    attemptType: LockoutAttempt['attemptType'],
    context: any
  ): Promise<LockoutAttempt> {

    const attempt: LockoutAttempt = {
      id: this.generateAttemptId(),
      userId,
      attemptType,
      timestamp: new Date(),
      success: context.success,
      details: {
        endpoint: context.endpoint,
        method: context.method,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        responseCode: context.responseCode,
        responseTime: context.responseTime,
        errorType: context.errorType,
        blocked: false

      triggers: {
        evaluated: [],
        triggered: [],
        warnings: []

      consequences: {}
    };

    // Store attempt
    const userAttempts = this.userAttempts.get(userId) || [];
    userAttempts.push(attempt);
    
    // Keep only recent attempts (last 1000)
    if (userAttempts.length > 1000) {
      userAttempts.splice(0, userAttempts.length - 1000);

    
    this.userAttempts.set(userId, userAttempts);

    return attempt;


  private clearUserWarnings(userId: string): void {
    this.activeWarnings.delete(userId);


  private calculateNextLockoutLevel(userId: string): number {
    return this.calculateLockoutLevel(userId) + 1;


  private getAllLockoutsInRange(timeRange: { start: Date; end: Date }): TemporaryLockout[] {
    const allLockouts = [];
    
    for (const lockouts of this.lockoutHistory.values()) {
      const filteredLockouts = lockouts.filter(lockout =>
        lockout.timing.createdAt >= timeRange.start &&
        lockout.timing.createdAt <= timeRange.end
      );
      allLockouts.push(...filteredLockouts);

    
    // Add active lockouts in range
    for (const lockout of this.activeLockouts.values()) {
      if (lockout.timing.createdAt >= timeRange.start &&
          lockout.timing.createdAt <= timeRange.end) {
        allLockouts.push(lockout);


    
    return allLockouts;


  private groupBy<T>(array: T[], property: keyof T): Array<{ type: string; count: number }> {
    const groups = array.reduce((acc, item) => {
      const key = String(item[property]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups).map(([type, count]) => ({ type, count }));


  private calculateAverageDuration(lockouts: TemporaryLockout[]): number {
    if (lockouts.length === 0) return 0;
    
    const totalDuration = lockouts.reduce((sum, lockout) => sum + lockout.timing.duration, 0);
    return Math.round(totalDuration / lockouts.length);


  private calculateEarlyReleaseRate(lockouts: TemporaryLockout[]): number {
    if (lockouts.length === 0) return 0;
    
    const earlyReleases = lockouts.filter(lockout => lockout.status === 'released').length;
    return Math.round((earlyReleases / lockouts.length) * 100);


  private getTopTriggers(lockouts: TemporaryLockout[]): Array<{ triggerId: string; name: string; count: number }> {
    const triggerCounts = this.groupBy(lockouts, 'triggerId');
    
    return triggerCounts
      .map(({ type: triggerId, count }) => ({
        triggerId,
        name: this.triggers.get(triggerId)?.name || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);


  private getUserPatterns(lockouts: TemporaryLockout[]): Array<{
    userId: string;
    lockoutCount: number;
    averageDuration: number;
    mostCommonTrigger: string;
> {
    const userGroups = lockouts.reduce((acc, lockout) => {
      if (!acc[lockout.userId]) {
        acc[lockout.userId] = [];

      acc[lockout.userId].push(lockout);
      return acc;
    }, {} as Record<string, TemporaryLockout[]>);

    return Object.entries(userGroups).map(([userId, userLockouts]) => {
      const triggerCounts = this.groupBy(userLockouts, 'triggerId');
      const mostCommonTrigger = triggerCounts.sort((a, b) => b.count - a.count)[0];
      
      return {
        userId,
        lockoutCount: userLockouts.length,
        averageDuration: this.calculateAverageDuration(userLockouts),
        mostCommonTrigger: this.triggers.get(mostCommonTrigger.type)?.name || 'Unknown'
      };
    });


  private startMaintenanceTasks(): void {
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance();
    }, 60 * 1000); // Every minute


  private performMaintenance(): void {
    const now = new Date();

    // Check for expired lockouts
    for (const [userId, lockout] of this.activeLockouts.entries()) {
      if (lockout.timing.expiresAt <= now) {
        this.expireLockout(userId, lockout);
 else if (lockout.status === 'pending' && lockout.timing.activatesAt <= now) {
        this.activateLockout(lockout);



    // Clean up expired warnings
    for (const [userId, warnings] of this.activeWarnings.entries()) {
      const activeWarnings = warnings.filter(warning => warning.timing.expiresAt > now);
      if (activeWarnings.length === 0) {
        this.activeWarnings.delete(userId);
 else {
        this.activeWarnings.set(userId, activeWarnings);



    // Clean up old attempt records
    this.cleanupOldAttempts();


  private expireLockout(userId: string, lockout: TemporaryLockout): void {
    lockout.status = 'expired';
    
    // Move to history
    const userHistory = this.lockoutHistory.get(userId) || [];
    userHistory.push(lockout);
    this.lockoutHistory.set(userId, userHistory);
    
    // Remove from active
    this.activeLockouts.delete(userId);

    this.emit('lockoutExpired', { userId, lockout });


  private activateLockout(lockout: TemporaryLockout): void {
    lockout.status = 'active';
    this.emit('lockoutActivated', lockout);


  private cleanupOldAttempts(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [userId, attempts] of this.userAttempts.entries()) {
      const recentAttempts = attempts.filter(attempt => attempt.timestamp >= cutoff);
      if (recentAttempts.length === 0) {
        this.userAttempts.delete(userId);
 else {
        this.userAttempts.set(userId, recentAttempts);




  // Additional helper methods for notifications, approvals, etc.
  private async sendLockoutNotification(userId: string, lockout: TemporaryLockout): Promise<void> {

    console.log(`Sending lockout notification to user ${userId} for ${lockout.triggerType}`);
    lockout.metadata.notificationsSent.push('lockout_created');


  private async sendWarningNotification(userId: string, warning: LockoutWarning): Promise<void> {

    console.log(`Sending warning notification to user ${userId}: ${warning.message}`);


  private async sendReleaseNotification(userId: string, lockout: TemporaryLockout, releaseType: string, releasedBy: string): Promise<void> {

    console.log(`Sending release notification to user ${userId}, released by ${releasedBy}`);


  private async createApprovalRequest(lockout: TemporaryLockout, reason: string, requestedBy: string, context: any): Promise<string> {

    const approvalId = this.generateApprovalId();
    // Implementation would create approval request in database/queue
    console.log(`Created approval request ${approvalId} for lockout ${lockout.id}`);
    return approvalId;


  private async canAutoApproveRelease(lockout: TemporaryLockout, reason: string): Promise<boolean> {

    // Implementation would check auto-approval criteria
    return lockout.severity === 'low' && lockout.level === 1;


  private async generateDeviceFingerprint(userAgent: string, ipAddress: string): Promise<string> {

    return crypto.createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex');


  private async getGeolocation(ipAddress: string): Promise<string> {

    // Mock implementation - would integrate with geolocation service
    return 'Unknown Location';


  private async validateTrigger(trigger: LockoutTrigger): Promise<void> {

    if (trigger.threshold <= 0) {
      throw new Error('Trigger threshold must be positive');

    
    if (trigger.timeWindow <= 0) {
      throw new Error('Trigger time window must be positive');



  private generateTriggerId(): string {
    return `TRG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;


  private generateLockoutId(): string {
    return `TLO-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private generateWarningId(): string {
    return `TWN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;


  private generateAttemptId(): string {
    return `TAT-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private generateApprovalId(): string {
    return `TAP-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private async logEvent(action: string, performedBy: string, metadata: any): Promise<void> {

    console.log(`Temporary Lockout Event: ${action} by ${performedBy}`, metadata);


  destroy(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);


