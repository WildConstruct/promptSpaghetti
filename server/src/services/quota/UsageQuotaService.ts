/**
 * Usage Quota Service - Epic 17
 * 
 * Core service for managing usage quotas, tracking consumption, and enforcing 
 * limits across the platform. Integrates with existing Epic 17 admin controls
 * including rate limiting, fraud detection, and enforcement actions.
 * 
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { RateLimitingService } from '../../../../packages/core/security/RateLimitingService';
import { FraudMonitoringService } from '../fraud/FraudMonitoringService';
import { EnforcementActionService } from '../enforcement/EnforcementActionService';
import { AuditService } from '../auth/services/AuditService';
import {
  UsageQuota,
  UsageTracking,
  QuotaViolation,
  QuotaCheckRequest,
  QuotaCheckResult,
  QuotaUsageSummary,
  UsageAnalytics,
  QuotaEventLog,
  QuotaAdminOperation,
  QuotaTemplate,
  QuotaType,
  TimePeriod,
  EnforcementAction,
  QuotaScope,
  ScopeType,
  ViolationStatus,
  QuotaEventType
 from '../../../../packages/core/types/UsageQuotaTypes';
import { ActionSeverity } from '../../../../packages/core/types/EnforcementTypes';

export class UsageQuotaService {
  private db: Database;
  private rateLimitingService: RateLimitingService;
  private fraudMonitoringService: FraudMonitoringService;
  private enforcementService: EnforcementActionService;
  private auditService: AuditService;

  // Caching for performance
  private quotaCache: Map<string, UsageQuota> = new Map();
  private usageCache: Map<string, number> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    database: Database,
    rateLimitingService: RateLimitingService,
    fraudMonitoringService: FraudMonitoringService,
    enforcementService: EnforcementActionService,
    auditService: AuditService
  ) {
    this.db = database;
    this.rateLimitingService = rateLimitingService;
    this.fraudMonitoringService = fraudMonitoringService;
    this.enforcementService = enforcementService;
    this.auditService = auditService;

    this.initializeService();


  // =============================================================================
  // Core Quota Management
  // =============================================================================

  /**
   * Check if a usage request is within quota limits
   */
  async checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult> {

    const startTime = Date.now();
    
    try {
      console.log(
        `🔍 Checking quota for user ${request.userId},
        type ${request.quotaType},
        resource ${request.resourceIdentifier}`
      );

      // Find applicable quotas
      const quotas = await this.findApplicableQuotas(request);
      if (quotas.length === 0) {
        console.log(`✅ No quotas found for ${request.quotaType}:${request.resourceIdentifier}, allowing request`);
        return this.createAllowedResult();


      // Check each applicable quota (highest priority first)
      const sortedQuotas = quotas.sort((a, b) => b.priority - a.priority);
      
      for (const quota of sortedQuotas) {
        const result = await this.checkSingleQuota(quota, request);
        
        if (!result.allowed) {
          console.log(`❌ Quota ${quota.quotaId} violated for user ${request.userId}`);
          
          // Track the violation
          await this.handleQuotaViolation(quota, request, result);
          
          // Log the event
          await this.logQuotaEvent({
            eventType: 'violation_occurred',
            userId: request.userId,
            quotaId: quota.quotaId,
            eventData: {
              request,
              result,
              violationType: 'quota_exceeded'

            severity: this.getViolationSeverity(result),
            category: 'system'
          });

          return result;



      // All quotas passed, track the usage
      await this.trackUsage(sortedQuotas[0], request);
      
      console.log(`✅ Quota check passed for user ${request.userId}`);
      return this.createAllowedResult(sortedQuotas[0], request);
 catch (error) {
      console.error(`❌ Error checking quota for user ${request.userId}:`, error);
      
      await this.logQuotaEvent({
        eventType: 'system_error',
        userId: request.userId,
        eventData: {
          request,
          error: error.message,
          stack: error.stack

        severity: 'high',
        category: 'system'
      });

      // Fail open by default (configurable)
      return this.createAllowedResult();
 finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ Quota check completed in ${duration}ms`);



  /**
   * Track usage for a quota
   */
  async trackUsage(quota: UsageQuota, request: QuotaCheckRequest): Promise<void> {

    const period = this.getCurrentPeriod(quota.limitPeriod);
    const cacheKey = `usage:${quota.quotaId}:${request.userId}:${period.start.getTime()}`;

    try {
      // Insert usage tracking record
      await this.db.query(`
        INSERT INTO usage_tracking (
          quota_id, user_id, session_id, organization_id,
          resource_identifier, usage_amount, usage_timestamp,
          period_start, period_end, cumulative_usage,
          ip_address, user_agent, additional_metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, 
          COALESCE((
            SELECT SUM(usage_amount) + $6
            FROM usage_tracking 
            WHERE quota_id = $1 AND user_id = $2 
            AND period_start = $7 AND period_end = $8
          ), $6),
          $9, $10, $11)
      `, [
        quota.quotaId,
        request.userId,
        request.metadata?.sessionId,
        request.metadata?.organizationId,
        request.resourceIdentifier,
        request.usageAmount,
        period.start,
        period.end,
        request.metadata?.ipAddress,
        request.metadata?.userAgent,
        JSON.stringify(request.metadata || {})
      ]);

      // Update cache
      const currentUsage = this.usageCache.get(cacheKey) || 0;
      this.usageCache.set(cacheKey, currentUsage + request.usageAmount);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      console.log(`📊 Usage tracked: ${request.usageAmount} ${quota.limitUnit} for quota ${quota.quotaId}`);
 catch (error) {
      console.error(`❌ Error tracking usage for quota ${quota.quotaId}:`, error);
      throw error;



  /**
   * Get current usage for a quota and user
   */
  async getCurrentUsage(quota: UsageQuota, userId: string): Promise<number> {

    const period = this.getCurrentPeriod(quota.limitPeriod);
    const cacheKey = `usage:${quota.quotaId}:${userId}:${period.start.getTime()}`;

    // Check cache first
    if (this.usageCache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.usageCache.get(cacheKey)!;


    try {
      const result = await this.db.query(`
        SELECT COALESCE(SUM(usage_amount), 0) as current_usage
        FROM usage_tracking
        WHERE quota_id = $1 AND user_id = $2
        AND period_start = $3 AND period_end = $4
      `, [quota.quotaId, userId, period.start, period.end]);

      const usage = parseInt(result.rows[0]?.current_usage || '0');

      // Update cache
      this.usageCache.set(cacheKey, usage);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return usage;
 catch (error) {
      console.error(`❌ Error getting current usage for quota ${quota.quotaId}:`, error);
      return 0; // Fail gracefully



  // =============================================================================
  // Quota Violation Handling
  // =============================================================================

  /**
   * Handle quota violation with appropriate enforcement
   */
  async handleQuotaViolation(
    quota: UsageQuota, 
    request: QuotaCheckRequest, 
    result: QuotaCheckResult
  ): Promise<void> {

    try {
      console.log(`🚨 Handling quota violation for quota ${quota.quotaId}, user ${request.userId}`);

      // Create violation record
      const violation: QuotaViolation = {
        violationId: this.generateUuid(),
        quotaId: quota.quotaId,
        userId: request.userId,
        violationTimestamp: new Date(),
        exceededBy: result.currentUsage - result.quotaLimit,
        quotaLimit: result.quotaLimit,
        actualUsage: result.currentUsage,
        severity: this.getViolationSeverity(result),
        impactAssessment: await this.assessViolationImpact(quota, request),
        enforcementAction: quota.enforcementAction,
        enforcementDetails: {
          actionTaken: quota.enforcementAction,
          timestamp: new Date(),
          reason: `Quota exceeded by ${result.currentUsage - result.quotaLimit} ${quota.limitUnit}`,
          automaticAction: true,
          additionalData: {
            quotaName: quota.quotaName,
            resourceIdentifier: request.resourceIdentifier,
            usageAmount: request.usageAmount


        status: 'active',
        appealSubmitted: false
      };

      // Insert violation record
      await this.insertViolation(violation);

      // Execute enforcement action
      await this.executeEnforcementAction(quota, violation, request);

      // Integrate with fraud detection if suspicious patterns
      if (await this.isSuspiciousViolation(violation)) {
        await this.fraudMonitoringService.reportSuspiciousActivity({
          userId: request.userId,
          activityType: 'quota_violation',
          severity: violation.severity,
          details: {
            quotaType: quota.quotaType,
            violationCount: await this.getRecentViolationCount(request.userId),
            enforcementAction: quota.enforcementAction

          timestamp: new Date()
        });


      console.log(`✅ Violation handled for quota ${quota.quotaId}`);
 catch (error) {
      console.error('❌ Error handling quota violation:', error);
      throw error;



  /**
   * Execute enforcement action based on quota configuration
   */
  async executeEnforcementAction(
    quota: UsageQuota, 
    violation: QuotaViolation, 
    request: QuotaCheckRequest
  ): Promise<void> {

    console.log(`⚖️ Executing enforcement action: ${quota.enforcementAction}`);

    switch (quota.enforcementAction) {
    case 'warn':
      await this.sendWarningNotification(violation, quota);
      break;

    case 'throttle':
      await this.applyThrottling(request.userId, quota);
      break;

    case 'soft_block':
      await this.applySoftBlock(request.userId, quota, violation);
      break;

    case 'hard_block':
      await this.applyHardBlock(request.userId, quota, violation);
      break;

    case 'review':
      await this.queueForReview(violation, quota);
      break;

    case 'degrade':
      await this.applyServiceDegradation(request.userId, quota);
      break;

    case 'redirect':
      await this.setupTrafficRedirect(request.userId, quota);
      break;

    case 'upgrade_prompt':
      await this.sendUpgradePrompt(request.userId, quota, violation);
      break;

    default:
      console.warn(`⚠️ Unknown enforcement action: ${quota.enforcementAction}`);



  // =============================================================================
  // Quota Management Operations
  // =============================================================================

  /**
   * Create a new quota
   */
  async createQuota(quota: Omit<UsageQuota, 'quotaId' | 'createdAt' | 'updatedAt'>): Promise<UsageQuota> {

    const quotaId = this.generateUuid();
    const now = new Date();

    const newQuota: UsageQuota = {
      ...quota,
      quotaId,
      createdAt: now,
      updatedAt: now
    };

    try {
      console.log(`📝 Creating new quota: ${newQuota.quotaName}`);

      await this.db.query(`
        INSERT INTO usage_quotas (
          quota_id, quota_name, quota_type, resource_identifier,
          limit_value, limit_period, limit_unit,
          applies_to_type, applies_to_value,
          enforcement_action, reset_behavior, grace_period_minutes,
          burst_allowance, rollover_percentage, hard_limit, priority,
          enabled, created_at, updated_at, created_by,
          configuration, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22

      `, [
        newQuota.quotaId,
        newQuota.quotaName,
        newQuota.quotaType,
        newQuota.resourceIdentifier,
        newQuota.limitValue,
        newQuota.limitPeriod,
        newQuota.limitUnit,
        newQuota.appliesTo.type,
        newQuota.appliesTo.value,
        newQuota.enforcementAction,
        newQuota.resetBehavior,
        newQuota.gracePeriodMinutes,
        newQuota.burstAllowance || 0,
        newQuota.rolloverPercentage || 0,
        newQuota.hardLimit,
        newQuota.priority,
        newQuota.enabled,
        newQuota.createdAt,
        newQuota.updatedAt,
        newQuota.createdBy,
        JSON.stringify(newQuota.configuration),
        JSON.stringify(newQuota.metadata)
      ]);

      // Clear cache
      this.clearQuotaCache();

      // Log event
      await this.logQuotaEvent({
        eventType: 'quota_created',
        quotaId: newQuota.quotaId,
        adminUserId: newQuota.createdBy,
        eventData: { quota: newQuota },
        severity: 'medium',
        category: 'admin'
      });

      console.log(`✅ Quota created successfully: ${quotaId}`);
      return newQuota;
 catch (error) {
      console.error('❌ Error creating quota:', error);
      throw error;



  /**
   * Update an existing quota
   */
  async updateQuota(
    quotaId: string, 
    updates: Partial<UsageQuota>, 
    adminUserId: string
  ): Promise<UsageQuota> {

    try {
      console.log(`📝 Updating quota: ${quotaId}`);

      // Get current quota
      const currentQuota = await this.getQuotaById(quotaId);
      if (!currentQuota) {
        throw new Error(`Quota not found: ${quotaId}`);


      // Merge updates
      const updatedQuota = {
        ...currentQuota,
        ...updates,
        quotaId: currentQuota.quotaId, // Prevent ID changes
        createdAt: currentQuota.createdAt, // Preserve creation time
        updatedAt: new Date()
      };

      // Build dynamic query
      const updateFields = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updates)) {
        if (key === 'quotaId' || key === 'createdAt') continue; // Skip immutable fields
        
        paramCount++;
        
        if (key === 'appliesTo') {
          updateFields.push(`applies_to_type = $${paramCount}`);
          values.push(value.type);
          paramCount++;
          updateFields.push(`applies_to_value = $${paramCount}`);
          values.push(value.value);
 else if (key === 'configuration' || key === 'metadata') {
          updateFields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(JSON.stringify(value));
 else {
          updateFields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(value);



      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');


      // Add updated_at
      paramCount++;
      updateFields.push(`updated_at = $${paramCount}`);
      values.push(updatedQuota.updatedAt);

      // Add WHERE clause
      paramCount++;
      values.push(quotaId);

      await this.db.query(`
        UPDATE usage_quotas 
        SET ${updateFields.join(', ')}
        WHERE quota_id = $${paramCount}
      `, values);

      // Clear cache
      this.clearQuotaCache();

      // Log event
      await this.logQuotaEvent({
        eventType: 'quota_updated',
        quotaId,
        adminUserId,
        eventData: { 
          previousState: currentQuota,
          updates,
          newState: updatedQuota

        severity: 'medium',
        category: 'admin'
      });

      console.log(`✅ Quota updated successfully: ${quotaId}`);
      return updatedQuota;
 catch (error) {
      console.error(`❌ Error updating quota ${quotaId}:`, error);
      throw error;



  /**
   * Get quota by ID
   */
  async getQuotaById(quotaId: string): Promise<UsageQuota | null> {

    // Check cache first
    if (this.quotaCache.has(quotaId)) {
      return this.quotaCache.get(quotaId)!;


    try {
      const result = await this.db.query(`
        SELECT * FROM usage_quotas WHERE quota_id = $1
      `, [quotaId]);

      if (result.rows.length === 0) {
        return null;


      const quota = this.mapDbRowToQuota(result.rows[0]);
      
      // Cache the result
      this.quotaCache.set(quotaId, quota);
      
      return quota;
 catch (error) {
      console.error(`❌ Error getting quota ${quotaId}:`, error);
      return null;



  /**
   * Get user's quota usage summary
   */
  async getUserQuotaSummary(userId: string, period?: { start: Date; end: Date }): Promise<QuotaUsageSummary> {

    const summaryPeriod = period || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    try {
      console.log(`📊 Getting quota usage summary for user: ${userId}`);

      // Get applicable quotas for user
      const quotas = await this.getUserQuotas(userId);
      
      // Get usage details for each quota
      const quotaDetails = await Promise.all(
        quotas.map(async (quota) => {
          const currentUsage = await this.getCurrentUsage(quota, userId);
          const violations = await this.getUserQuotaViolations(userId, quota.quotaId, summaryPeriod);
          
          return {
            quotaId: quota.quotaId,
            quotaName: quota.quotaName,
            quotaType: quota.quotaType,
            currentUsage,
            quotaLimit: quota.limitValue,
            utilizationPercentage: Math.round((currentUsage / quota.limitValue) * 100),
            trend: await this.calculateUsageTrend(quota.quotaId, userId),
            lastViolation: violations.length > 0 ? violations[0].violationTimestamp : undefined,
            violationCount: violations.length
          };

      );

      // Get violation summary
      const totalViolations = await this.getUserViolationCount(userId, summaryPeriod);
      const activeViolations = await this.getUserActiveViolations(userId);

      // Calculate risk score
      const riskScore = this.calculateUserRiskScore(quotaDetails, activeViolations.length);

      // Generate recommendations
      const upgradeRecommendations = await this.generateUpgradeRecommendations(userId, quotaDetails);

      const summary: QuotaUsageSummary = {
        userId,
        summaryPeriod: {
          type: 'day',
          value: 30,
          timezone: 'UTC'

        quotas: quotaDetails,
        totalViolations,
        activeViolations: activeViolations.length,
        riskScore,
        projectedUsage: await this.generateUsageProjections(userId, quotaDetails),
        upgradeRecommendations
      };

      return summary;
 catch (error) {
      console.error(`❌ Error getting user quota summary for ${userId}:`, error);
      throw error;



  // =============================================================================
  // Helper Methods
  // =============================================================================

  /**
   * Find quotas applicable to a request
   */
  private async findApplicableQuotas(request: QuotaCheckRequest): Promise<UsageQuota[]> {

    try {
      const result = await this.db.query(`
        SELECT * FROM usage_quotas
        WHERE quota_type = $1 
        AND (resource_identifier = $2 OR resource_identifier = '*')
        AND enabled = TRUE
        AND (
          (applies_to_type = 'user' AND applies_to_value = $3) OR
          (applies_to_type = 'organization' AND applies_to_value = $4) OR
          (applies_to_type = 'global') OR
          (applies_to_type = 'tier' AND applies_to_value = $5)

        ORDER BY priority DESC, limit_value ASC
      `, [
        request.quotaType,
        request.resourceIdentifier,
        request.userId,
        request.metadata?.organizationId,
        request.metadata?.userTier || 'free'
      ]);

      return result.rows.map(row => this.mapDbRowToQuota(row));
 catch (error) {
      console.error('❌ Error finding applicable quotas:', error);
      return [];



  /**
   * Check a single quota against request
   */
  private async checkSingleQuota(quota: UsageQuota, request: QuotaCheckRequest): Promise<QuotaCheckResult> {

    const currentUsage = await this.getCurrentUsage(quota, request.userId);
    const remainingQuota = Math.max(0, quota.limitValue - currentUsage);
    const utilizationPercentage = Math.round((currentUsage / quota.limitValue) * 100);
    
    // Check if adding this usage would exceed the quota
    const wouldExceed = (currentUsage + request.usageAmount) > quota.limitValue;
    
    // Handle burst allowance
    const effectiveLimit = quota.limitValue + (quota.burstAllowance || 0);
    const hardExceeded = (currentUsage + request.usageAmount) > effectiveLimit;

    // Check warning thresholds
    const warningThresholds = quota.configuration.warningThresholds || [75, 90, 95];
    const warningTriggered = warningThresholds.some(threshold => utilizationPercentage >= threshold);

    const result: QuotaCheckResult = {
      allowed: !wouldExceed || (quota.burstAllowance && !hardExceeded && !quota.hardLimit),
      quotaId: quota.quotaId,
      currentUsage,
      quotaLimit: quota.limitValue,
      remainingQuota,
      utilizationPercentage,
      warningTriggered,
      warningThreshold: warningThresholds.find(t => utilizationPercentage >= t),
      recommendations: []
    };

    if (!result.allowed) {
      result.enforcementAction = quota.enforcementAction;
      result.enforcementReason = `Quota exceeded: ${currentUsage + request.usageAmount}/${quota.limitValue} ${quota.limitUnit}`;
      
      if (quota.gracePeriodMinutes > 0) {
        result.retryAfter = new Date(Date.now() + quota.gracePeriodMinutes * 60000);


      // Add recommendations based on enforcement action
      result.recommendations = this.generateQuotaRecommendations(quota, result);


    return result;


  /**
   * Generate recommendations based on quota state
   */
  private generateQuotaRecommendations(
    quota: UsageQuota,
    result: QuotaCheckResult
  ): Array<{ type: string; title: string; description: string; actionUrl?: string; priority: string }> {
    const recommendations = [];

    if (result.utilizationPercentage >= 90) {
      recommendations.push({
        type: 'upgrade_plan',
        title: 'Consider upgrading your plan',
        description: `You're using ${result.utilizationPercentage}% of your ${quota.quotaName} quota`,
        actionUrl: '/billing/upgrade',
        priority: 'high'
      });


    if (quota.quotaType === 'api_requests' && result.utilizationPercentage >= 75) {
      recommendations.push({
        type: 'optimize_requests',
        title: 'Optimize API usage',
        description: 'Consider batching requests or implementing caching to reduce API calls',
        priority: 'medium'
      });


    if (result.enforcementAction === 'upgrade_prompt') {
      recommendations.push({
        type: 'upgrade_plan',
        title: 'Upgrade required',
        description: 'This quota requires a plan upgrade to continue',
        actionUrl: '/billing/upgrade',
        priority: 'high'
      });


    return recommendations;


  /**
   * Get current time period for quota calculation
   */
  private getCurrentPeriod(limitPeriod: TimePeriod): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (limitPeriod) {
    case 'second':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      end = new Date(start.getTime() + 1000);
      break;

    case 'minute':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
      end = new Date(start.getTime() + 60000);
      break;

    case 'hour':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      end = new Date(start.getTime() + 3600000);
      break;

    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start.getTime() + 86400000);
      break;

    case 'week':
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      end = new Date(start.getTime() + 7 * 86400000);
      break;

    case 'month':
      start = new Date(now.getFullYear(), now.getMonth());
      end = new Date(now.getFullYear(), now.getMonth() + 1);
      break;

    case 'year':
      start = new Date(now.getFullYear(), 0);
      end = new Date(now.getFullYear() + 1, 0);
      break;

    case 'rolling':
      // Rolling 24-hour window
      start = new Date(now.getTime() - 86400000);
      end = now;
      break;

    default:
      throw new Error(`Unsupported limit period: ${limitPeriod}`);


    return { start, end };


  /**
   * Map database row to UsageQuota object
   */
  private mapDbRowToQuota(row: unknown): UsageQuota {
    return {
      quotaId: row.quota_id,
      quotaName: row.quota_name,
      quotaType: row.quota_type,
      resourceIdentifier: row.resource_identifier,
      limitValue: parseInt(row.limit_value),
      limitPeriod: row.limit_period,
      limitUnit: row.limit_unit,
      appliesTo: {
        type: row.applies_to_type,
        value: row.applies_to_value

      enforcementAction: row.enforcement_action,
      resetBehavior: row.reset_behavior,
      gracePeriodMinutes: parseInt(row.grace_period_minutes),
      burstAllowance: parseInt(row.burst_allowance || '0'),
      rolloverPercentage: parseFloat(row.rollover_percentage || '0'),
      hardLimit: row.hard_limit,
      priority: parseInt(row.priority),
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      configuration: JSON.parse(row.configuration),
      metadata: JSON.parse(row.metadata)
    };


  /**
   * Create allowed quota check result
   */
  private createAllowedResult(quota?: UsageQuota, request?: QuotaCheckRequest): QuotaCheckResult {
    return {
      allowed: true,
      quotaId: quota?.quotaId,
      currentUsage: 0,
      quotaLimit: quota?.limitValue || Number.MAX_SAFE_INTEGER,
      remainingQuota: quota?.limitValue || Number.MAX_SAFE_INTEGER,
      utilizationPercentage: 0,
      warningTriggered: false,
      recommendations: []
    };


  /**
   * Initialize the service
   */
  private async initializeService(): Promise<void> {

    console.log('🚀 Initializing Usage Quota Service...');
    
    try {
      // Start background cleanup processes
      this.startBackgroundCleanup();
      
      // Initialize quota cache
      await this.preloadCriticalQuotas();
      
      console.log('✅ Usage Quota Service initialized successfully');
 catch (error) {
      console.error('❌ Failed to initialize Usage Quota Service:', error);
      throw error;



  /**
   * Start background cleanup processes
   */
  private startBackgroundCleanup(): void {
    // Clean expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, expiry] of this.cacheExpiry.entries()) {
        if (expiry < now) {
          this.usageCache.delete(key);
          this.cacheExpiry.delete(key);


    }, 300000);

    // Clean old tracking records (configurable retention)
    setInterval(async () => {
      try {
        await this.db.query(`
          DELETE FROM usage_tracking 
          WHERE usage_timestamp < NOW() - INTERVAL '90 days'
        `);
        console.log('🧹 Cleaned old usage tracking records');
 catch (error) {
        console.error('❌ Error cleaning old tracking records:', error);

    }, 86400000); // Daily cleanup


  /**
   * Preload critical quotas into cache
   */
  private async preloadCriticalQuotas(): Promise<void> {

    try {
      const result = await this.db.query(`
        SELECT * FROM usage_quotas 
        WHERE enabled = TRUE 
        AND quota_type IN ('api_requests', 'graph_executions', 'storage_usage')
        ORDER BY priority DESC
        LIMIT 100
      `);

      for (const row of result.rows) {
        const quota = this.mapDbRowToQuota(row);
        this.quotaCache.set(quota.quotaId, quota);


      console.log(`📋 Preloaded ${result.rows.length} critical quotas into cache`);
 catch (error) {
      console.error('❌ Error preloading quotas:', error);



  // Additional helper methods would be implemented here...
  // (insertViolation, getUserQuotas, calculateUsageTrend, etc.)

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });


  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);


  private clearQuotaCache(): void {
    this.quotaCache.clear();


  private async logQuotaEvent(event: Partial<QuotaEventLog>): Promise<void> {

    // Implementation for logging quota events
    console.log(`📝 Quota event: ${event.eventType}`, event);


  // Placeholder methods - would be fully implemented
  private async insertViolation(_____violation: QuotaViolation): Promise<void> { }
  private async sendWarningNotification(_____violation: QuotaViolation, _____quota: UsageQuota): Promise<void> { }
  private async applyThrottling(_____userId: string, _____quota: UsageQuota): Promise<void> { }
  private async applySoftBlock(
    _____userId: string,
    _____quota: UsageQuota,
    _____violation: QuotaViolation
  ): Promise<void> { }
  private async applyHardBlock(
    _____userId: string,
    _____quota: UsageQuota,
    _____violation: QuotaViolation
  ): Promise<void> { }
  private async queueForReview(_____violation: QuotaViolation, _____quota: UsageQuota): Promise<void> { }
  private async applyServiceDegradation(_____userId: string, _____quota: UsageQuota): Promise<void> { }
  private async setupTrafficRedirect(_____userId: string, _____quota: UsageQuota): Promise<void> { }
  private async sendUpgradePrompt(
    _____userId: string,
    _____quota: UsageQuota,
    _____violation: QuotaViolation
  ): Promise<void> { }
  private getViolationSeverity(_____result: QuotaCheckResult): ActionSeverity { return 'medium'; }
  private async assessViolationImpact(
    _____quota: UsageQuota,
    _____request: QuotaCheckRequest
  ): Promise<unknown> { return {}; }
  private async isSuspiciousViolation(_____violation: QuotaViolation): Promise<boolean> { return false; }
  private async getRecentViolationCount(_____userId: string): Promise<number> { return 0; }
  private async getUserQuotas(_____userId: string): Promise<UsageQuota[]> { return []; }
  private async getUserQuotaViolations(
    _____userId: string,
    _____quotaId: string,
    _____period: unknown
  ): Promise<QuotaViolation[]> { return []; }
  private async calculateUsageTrend(_____quotaId: string, _____userId: string): Promise<string> { return 'stable'; }
  private async getUserViolationCount(_____userId: string, _____period: unknown): Promise<number> { return 0; }
  private async getUserActiveViolations(_____userId: string): Promise<QuotaViolation[]> { return []; }
  private calculateUserRiskScore(_____quotaDetails: unknown[], _____activeViolationCount: number): number { return 0; }
  private async generateUpgradeRecommendations(
    _____userId: string,
    _____quotaDetails: unknown[]
  ): Promise<any[]> { return []; }
  private async generateUsageProjections(
    _____userId: string,
    _____quotaDetails: unknown[]
  ): Promise<any[]> { return []; }
