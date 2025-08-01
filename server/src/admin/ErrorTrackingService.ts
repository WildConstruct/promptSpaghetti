/**
 * Error Tracking Service - Epic 17.4.2
 * 
 * Comprehensive error tracking and monitoring system for Epic 17.
 * Provides error collection, analysis, alerting, and remediation tracking
 * with advanced categorization and intelligent error grouping.
 * 
 * Task: E17-1753114397236-C9648E - Implement error tracking
 * Epic: 17 - Backstage Admin Controls (Story 17.4.2 - Monitoring Dashboard)
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

// ==========================================
// ERROR TRACKING INTERFACES
// ==========================================

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'


export enum ErrorStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
  RECURRING = 'recurring'


export enum ErrorCategory {
  SYSTEM = 'system',
  DATABASE = 'database',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USER_ERROR = 'user_error',
  CONFIGURATION = 'configuration'


export enum ErrorSource {
  CLIENT = 'client',
  SERVER = 'server',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  BACKGROUND_JOB = 'background_job',
  HEALTH_CHECK = 'health_check',
  ADMIN_OPERATION = 'admin_operation'




export interface ErrorEvent {
  errorId: string;
  groupId: string;
  timestamp: Date;
  message: string;
  stackTrace?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  source: ErrorSource;
  environment: string;
  context: ErrorContext;
  fingerprint: string;
  metadata: ErrorMetadata;
  userImpact: UserImpact;
  resolution?: ErrorResolution;







export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  httpMethod?: string;
  httpStatus?: number;
  component: string;
  operation: string;
  parameters?: Record<string, any>;
  additionalData?: Record<string, any>;







export interface ErrorMetadata {
  hostname: string;
  version: string;
  nodeVersion: string;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  requestDuration?: number;
  databaseQueries?: number;
  externalCalls?: number;
  tags: string[];
  customFields: Record<string, any>;







export interface UserImpact {
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  affectedOperations: string[];
  businessCritical: boolean;
  degradedFunctionality: string[];
  workaroundAvailable: boolean;







export interface ErrorResolution {
  resolvedBy: string;
  resolvedAt: Date;
  resolution: string;
  actionsTaken: string[];
  preventionMeasures: string[];
  rootCause?: string;
  timeToResolve: number; // milliseconds







export interface ErrorGroup {
  groupId: string;
  title: string;
  description: string;
  fingerprint: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  status: ErrorStatus;
  firstSeen: Date;
  lastSeen: Date;
  occurrenceCount: number;
  uniqueUsers: number;
  trend: ErrorTrend;
  assignee?: string;
  tags: string[];
  resolution?: ErrorResolution;
  relatedGroups: string[];
  suppressUntil?: Date;







export interface ErrorTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  timeWindow: string;
  dataPoints: TrendDataPoint[];
  peakOccurrences: Date[];
  quietPeriods: Date[];







export interface TrendDataPoint {
  timestamp: Date;
  count: number;
  uniqueUsers: number;
  severity: ErrorSeverity;







export interface ErrorAlert {
  alertId: string;
  groupId: string;
  alertType: 'threshold_exceeded' | 'new_error' | 'severity_increased' | 'user_impact_high';
  threshold?: AlertThreshold;
  triggered: boolean;
  triggeredAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  channels: AlertChannelConfig[];
  suppressUntil?: Date;







export interface AlertThreshold {
  type: 'occurrence_count' | 'error_rate' | 'user_impact' | 'severity_level';
  value: number;
  timeWindow: number; // minutes
  comparison: 'greater_than' | 'less_than' | 'equals';







export interface AlertChannelConfig {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  target: string;
  severity: ErrorSeverity[];
  enabled: boolean;
  cooldownMinutes: number;







export interface ErrorQuery {
  timeRange?: {
    start: Date;
    end: Date;



  };
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  source?: ErrorSource[];
  status?: ErrorStatus[];
  searchText?: string;
  userId?: string;
  component?: string;
  environment?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'occurrences' | 'users_affected';
  sortOrder?: 'asc' | 'desc';




export interface ErrorAnalytics {
  timeRange: string;
  totalErrors: number;
  uniqueErrorGroups: number;
  affectedUsers: number;
  errorRate: number;
  meanTimeToResolution: number;
  severityBreakdown: Record<ErrorSeverity, number>;
  categoryBreakdown: Record<ErrorCategory, number>;
  sourceBreakdown: Record<ErrorSource, number>;
  topErrorGroups: ErrorGroupSummary[];
  trendAnalysis: ErrorTrendAnalysis;
  impactAnalysis: ImpactAnalysis;







export interface ErrorGroupSummary {
  groupId: string;
  title: string;
  occurrences: number;
  uniqueUsers: number;
  severity: ErrorSeverity;
  trend: 'up' | 'down' | 'stable';
  lastSeen: Date;







export interface ErrorTrendAnalysis {
  overallTrend: 'improving' | 'worsening' | 'stable';
  errorRateTrend: number; // percentage change
  resolutionTimeTrend: number; // percentage change
  newErrorsRate: number; // errors per day
  recurringErrorsRate: number; // percentage







export interface ImpactAnalysis {
  highImpactErrors: number;
  businessCriticalErrors: number;
  userExperienceScore: number; // 0-100
  systemStabilityScore: number; // 0-100
  recommendedActions: string[];





// ==========================================
// ERROR TRACKING SERVICE IMPLEMENTATION
// ==========================================

export class ErrorTrackingService {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private errorEvents: Map<string, ErrorEvent> = new Map();
  private alertRules: Map<string, ErrorAlert> = new Map();
  private fingerprintCache: Map<string, string> = new Map();
  private alertCooldowns: Map<string, Date> = new Map();

  constructor(databaseService?: DatabaseService) {
    this.databaseService = databaseService || new DatabaseService();
    this.auditService = new AuditService(this.databaseService);
    this.initializeDefaultAlertRules();


  // ==========================================
  // ERROR CAPTURE AND PROCESSING
  // ==========================================

  async captureError(error: Error | string, context: Partial<ErrorContext> = {}): Promise<string> {

    const startTime = performance.now();
    const errorId = this.generateErrorId();

    try {
      // Normalize error information
      const errorMessage = typeof error === 'string' ? error : error.message;
      const stackTrace = typeof error === 'object' ? error.stack : undefined;

      // Generate error fingerprint for grouping
      const fingerprint = this.generateFingerprint(errorMessage, stackTrace, context);

      // Find or create error group
      let groupId = this.fingerprintCache.get(fingerprint);
      if (!groupId) {
        groupId = await this.createErrorGroup(fingerprint, errorMessage, context);
        this.fingerprintCache.set(fingerprint, groupId);


      // Create error event
      const errorEvent: ErrorEvent = {
        errorId,
        groupId,
        timestamp: new Date(),
        message: errorMessage,
        stackTrace,
        severity: this.determineSeverity(error, context),
        category: this.determineCategory(errorMessage, context),
        source: this.determineSource(context),
        environment: process.env.NODE_ENV || 'development',
        context: this.enrichContext(context),
        fingerprint,
        metadata: await this.generateMetadata(context),
        userImpact: this.assessUserImpact(error, context),
        resolution: undefined
      };

      // Store error event
      this.errorEvents.set(errorId, errorEvent);

      // Update error group
      await this.updateErrorGroup(groupId, errorEvent);

      // Check and trigger alerts
      await this.processAlerts(groupId, errorEvent);

      // Store in database
      await this.storeErrorEvent(errorEvent);

      // Audit error capture
      await this.auditService.logAction({
        userId: context.userId || 'system',
        action: 'error_captured',
        resource: `error_event:${errorId}`,
        details: {
          groupId,
          severity: errorEvent.severity,
          category: errorEvent.category,
          source: errorEvent.source,
          message: errorMessage.substring(0, 200),
          processingTime: performance.now() - startTime,
          timestamp: new Date()

      });

      return errorId;
 catch (captureError) {
      // Fallback: log capture error without recursion
      console.error('Failed to capture error:', captureError);
      
      await this.auditService.logAction({
        userId: 'system',
        action: 'error_capture_failed',
        resource: `error_event:${errorId}`,
        details: {
          originalError: typeof error === 'string' ? error : error.message,
          captureError: captureError.message,
          timestamp: new Date()

      });

      throw captureError;



  async captureHttpError(
    statusCode: number,
    error: Error | string,
    request: { url?: string; method?: string; headers?: Record<string, string> },
    context: Partial<ErrorContext> = {}
  ): Promise<string> {

    const enrichedContext: Partial<ErrorContext> = {
      ...context,
      httpStatus: statusCode,
      url: request.url,
      httpMethod: request.method,
      userAgent: request.headers?.['user-agent'],
      ipAddress: request.headers?.['x-forwarded-for'] || request.headers?.['remote-addr']
    };

    return this.captureError(error, enrichedContext);


  async captureAsyncError(
    operation: string,
    error: Error | string,
    context: Partial<ErrorContext> = {}
  ): Promise<string> {

    const enrichedContext: Partial<ErrorContext> = {
      ...context,
      component: 'async_handler',
      operation,
      source: ErrorSource.BACKGROUND_JOB
    };

    return this.captureError(error, enrichedContext);


  // ==========================================
  // ERROR GROUPING AND FINGERPRINTING
  // ==========================================

  private generateFingerprint(message: string, stackTrace?: string, context: Partial<ErrorContext> = {}): string {
    // Create a consistent fingerprint for grouping similar errors
    const components = [
      this.normalizeErrorMessage(message),
      this.extractStackTraceSignature(stackTrace),
      context.component || 'unknown',
      context.operation || 'unknown'
    ];

    const fingerprintData = components.join('|');
    return crypto.createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);


  private normalizeErrorMessage(message: string): string {
    // Remove variable parts to group similar errors
    return message
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // Replace UUIDs
      .replace(/\/[a-zA-Z0-9\/]+/g, '/PATH') // Replace paths
      .replace(/\b\w+@\w+\.\w+\b/g, 'EMAIL') // Replace emails
      .toLowerCase()
      .trim();


  private extractStackTraceSignature(stackTrace?: string): string {
    if (!stackTrace) return 'no-stack';

    // Extract the first few meaningful stack frames
    const frames = stackTrace.split('\n')
      .filter(line => line.trim().startsWith('at '))
      .slice(0, 3)
      .map(frame => {
        // Extract function name and normalize file paths
        const match = frame.match(/at\s+([^(]+)\s*\(/);
        return match ? match[1].trim() : 'anonymous';
      });

    return frames.join('->') || 'unknown-stack';


  private async createErrorGroup(
    fingerprint: string,
    message: string,
    context: Partial<ErrorContext>
  ): Promise<string> {

    const groupId = this.generateGroupId();
    const now = new Date();

    const errorGroup: ErrorGroup = {
      groupId,
      title: this.generateGroupTitle(message),
      description: message,
      fingerprint,
      category: this.determineCategory(message, context),
      severity: ErrorSeverity.MEDIUM, // Will be updated when first error is added
      status: ErrorStatus.NEW,
      firstSeen: now,
      lastSeen: now,
      occurrenceCount: 0,
      uniqueUsers: 0,
      trend: {
        direction: 'stable',
        changePercentage: 0,
        timeWindow: 'last_hour',
        dataPoints: [],
        peakOccurrences: [],
        quietPeriods: []

      tags: this.generateTags(message, context),
      relatedGroups: [],
      suppressUntil: undefined
    };

    this.errorGroups.set(groupId, errorGroup);
    await this.storeErrorGroup(errorGroup);

    return groupId;


  private async updateErrorGroup(groupId: string, errorEvent: ErrorEvent): Promise<void> {

    const group = this.errorGroups.get(groupId);
    if (!group) return;

    // Update occurrence statistics
    group.occurrenceCount++;
    group.lastSeen = errorEvent.timestamp;

    // Update severity if this error is more severe
    if (this.compareSeverity(errorEvent.severity, group.severity) > 0) {
      group.severity = errorEvent.severity;


    // Update trend analysis
    this.updateTrendAnalysis(group, errorEvent);

    // Update unique users count
    if (errorEvent.context.userId) {
      await this.updateUniqueUsersCount(group, errorEvent.context.userId);


    // Store updated group
    await this.storeErrorGroup(group);


  // ==========================================
  // ERROR CLASSIFICATION AND ANALYSIS
  // ==========================================

  private determineSeverity(error: Error | string, context: Partial<ErrorContext>): ErrorSeverity {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    // Critical severity indicators
    if (lowerMessage.includes('critical') ||
        lowerMessage.includes('fatal') ||
        lowerMessage.includes('security') ||
        lowerMessage.includes('data loss') ||
        context.httpStatus === 500) {
      return ErrorSeverity.CRITICAL;


    // High severity indicators
    if (lowerMessage.includes('database') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('auth') ||
        context.httpStatus && context.httpStatus >= 400 && context.httpStatus < 500) {
      return ErrorSeverity.HIGH;


    // Medium severity indicators
    if (lowerMessage.includes('validation') ||
        lowerMessage.includes('permission') ||
        lowerMessage.includes('not found')) {
      return ErrorSeverity.MEDIUM;


    return ErrorSeverity.LOW;


  private determineCategory(message: string, context: Partial<ErrorContext>): ErrorCategory {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
      return ErrorCategory.DATABASE;

    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout')) {
      return ErrorCategory.NETWORK;

    if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('token')) {
      return ErrorCategory.AUTHENTICATION;

    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return ErrorCategory.VALIDATION;

    if (lowerMessage.includes('security') || lowerMessage.includes('xss') || lowerMessage.includes('injection')) {
      return ErrorCategory.SECURITY;

    if (lowerMessage.includes('performance') || lowerMessage.includes('slow') || lowerMessage.includes('memory')) {
      return ErrorCategory.PERFORMANCE;

    if (context.component?.includes('integration') || lowerMessage.includes('external') || lowerMessage.includes('api')) {
      return ErrorCategory.INTEGRATION;

    if (context.component?.includes('config') || lowerMessage.includes('configuration')) {
      return ErrorCategory.CONFIGURATION;


    return ErrorCategory.SYSTEM;


  private determineSource(context: Partial<ErrorContext>): ErrorSource {
    if (context.component?.includes('admin') || context.operation?.includes('admin')) {
      return ErrorSource.ADMIN_OPERATION;

    if (context.component?.includes('health') || context.operation?.includes('health')) {
      return ErrorSource.HEALTH_CHECK;

    if (context.component?.includes('background') || context.component?.includes('job')) {
      return ErrorSource.BACKGROUND_JOB;

    if (context.component?.includes('database') || context.operation?.includes('db')) {
      return ErrorSource.DATABASE;

    if (context.component?.includes('external') || context.operation?.includes('external')) {
      return ErrorSource.EXTERNAL_SERVICE;

    if (context.httpMethod || context.url) {
      return ErrorSource.SERVER;


    return ErrorSource.SERVER;


  private assessUserImpact(error: Error | string, context: Partial<ErrorContext>): UserImpact {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    let impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'low';
    let businessCritical = false;
    const affectedOperations: string[] = [];
    const degradedFunctionality: string[] = [];
    let workaroundAvailable = true;

    // Assess impact level
    if (lowerMessage.includes('critical') || 
        lowerMessage.includes('data loss') ||
        context.httpStatus === 500) {
      impactLevel = 'critical';
      businessCritical = true;
      workaroundAvailable = false;
 else if (lowerMessage.includes('database') ||
               lowerMessage.includes('auth') ||
               context.httpStatus && context.httpStatus >= 400) {
      impactLevel = 'high';
      businessCritical = context.component?.includes('admin') || false;
 else if (lowerMessage.includes('validation') || lowerMessage.includes('permission')) {
      impactLevel = 'medium';


    // Determine affected operations
    if (context.operation) {
      affectedOperations.push(context.operation);

    if (context.component) {
      affectedOperations.push(context.component);


    // Determine degraded functionality
    if (impactLevel !== 'none') {
      degradedFunctionality.push(context.operation || 'unknown_operation');


    return {
      impactLevel,
      affectedUsers: context.userId ? 1 : 0,
      affectedOperations,
      businessCritical,
      degradedFunctionality,
      workaroundAvailable
    };


  // ==========================================
  // ALERT PROCESSING
  // ==========================================

  private async processAlerts(groupId: string, errorEvent: ErrorEvent): Promise<void> {

    const group = this.errorGroups.get(groupId);
    if (!group) return;

    for (const [alertId, alert] of this.alertRules.entries()) {
      if (alert.groupId !== groupId && alert.groupId !== '*') continue;

      const shouldTrigger = await this.evaluateAlertCondition(alert, group, errorEvent);
      
      if (shouldTrigger && !this.isAlertInCooldown(alertId)) {
        await this.triggerAlert(alert, group, errorEvent);
        this.setAlertCooldown(alertId, Math.min(...alert.channels.map(c => c.cooldownMinutes)));




  private async evaluateAlertCondition(alert: ErrorAlert, group: ErrorGroup, errorEvent: ErrorEvent): Promise<boolean> {

    switch (alert.alertType) {
    case 'new_error':
      return group.occurrenceCount === 1;

    case 'threshold_exceeded':
      if (!alert.threshold) return false;
      return this.checkThresholdExceeded(alert.threshold, group);

    case 'severity_increased':
      return this.compareSeverity(errorEvent.severity, ErrorSeverity.HIGH) >= 0;

    case 'user_impact_high':
      return errorEvent.userImpact.impactLevel === 'high' || 
               errorEvent.userImpact.impactLevel === 'critical';

    default:
      return false;



  private checkThresholdExceeded(threshold: AlertThreshold, group: ErrorGroup): boolean {
    switch (threshold.type) {
    case 'occurrence_count':
      return threshold.comparison === 'greater_than' ? 
        group.occurrenceCount > threshold.value :
        group.occurrenceCount === threshold.value;

    case 'severity_level':
      const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
      const groupSeverityLevel = severityOrder[group.severity];
      return groupSeverityLevel >= threshold.value;

    default:
      return false;



  private async triggerAlert(alert: ErrorAlert, group: ErrorGroup, errorEvent: ErrorEvent): Promise<void> {

    alert.triggered = true;
    alert.triggeredAt = new Date();

    const alertPayload = {
      alertId: alert.alertId,
      groupId: group.groupId,
      groupTitle: group.title,
      severity: errorEvent.severity,
      occurrences: group.occurrenceCount,
      lastError: errorEvent,
      timestamp: new Date()
    };

    // Send alerts through configured channels
    for (const channel of alert.channels) {
      if (!channel.enabled || !channel.severity.includes(errorEvent.severity)) continue;

      try {
        await this.sendAlert(channel, alertPayload);
 catch (error) {
        console.error(`Failed to send alert via ${channel.type}:`, error);



    // Audit alert
    await this.auditService.logAction({
      userId: 'system',
      action: 'error_alert_triggered',
      resource: `error_group:${group.groupId}`,
      details: {
        alertId: alert.alertId,
        alertType: alert.alertType,
        severity: errorEvent.severity,
        channelsNotified: alert.channels.filter(c => c.enabled).length,
        timestamp: new Date()

    });


  // ==========================================
  // ERROR ANALYTICS AND REPORTING
  // ==========================================

  async generateAnalytics(timeRange: { start: Date; end: Date }): Promise<ErrorAnalytics> {

    const events = Array.from(this.errorEvents.values())
      .filter(event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end);

    const groups = Array.from(this.errorGroups.values())
      .filter(group => group.lastSeen >= timeRange.start);

    const totalErrors = events.length;
    const uniqueErrorGroups = new Set(events.map(e => e.groupId)).size;
    const affectedUsers = new Set(events.map(e => e.context.userId).filter(Boolean)).size;

    // Calculate error rate (errors per minute)
    const timeRangeMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60);
    const errorRate = timeRangeMinutes > 0 ? totalErrors / timeRangeMinutes : 0;

    // Calculate mean time to resolution
    const resolvedGroups = groups.filter(g => g.resolution);
    const meanTimeToResolution = resolvedGroups.length > 0 ?
      resolvedGroups.reduce((sum, g) => sum + (g.resolution?.timeToResolve || 0), 0) / resolvedGroups.length :
      0;

    // Breakdowns
    const severityBreakdown = this.calculateBreakdown(events, 'severity') as Record<ErrorSeverity, number>;
    const categoryBreakdown = this.calculateBreakdown(events, 'category') as Record<ErrorCategory, number>;
    const sourceBreakdown = this.calculateBreakdown(events, 'source') as Record<ErrorSource, number>;

    // Top error groups
    const topErrorGroups = groups
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, 10)
      .map(group => ({
        groupId: group.groupId,
        title: group.title,
        occurrences: group.occurrenceCount,
        uniqueUsers: group.uniqueUsers,
        severity: group.severity,
        trend: group.trend.direction === 'increasing' ? 'up' as const :
          group.trend.direction === 'decreasing' ? 'down' as const : 'stable' as const,
        lastSeen: group.lastSeen
      }));

    const analytics: ErrorAnalytics = {
      timeRange: `${timeRange.start.toISOString()} - ${timeRange.end.toISOString()}`,
      totalErrors,
      uniqueErrorGroups,
      affectedUsers,
      errorRate,
      meanTimeToResolution,
      severityBreakdown,
      categoryBreakdown,
      sourceBreakdown,
      topErrorGroups,
      trendAnalysis: this.calculateTrendAnalysis(groups),
      impactAnalysis: this.calculateImpactAnalysis(events, groups)
    };

    return analytics;


  private calculateBreakdown<T extends string>(events: ErrorEvent[], field: keyof ErrorEvent): Record<T, number> {
    const breakdown: Record<string, number> = {};
    
    events.forEach(event => {
      const value = String(event[field]);
      breakdown[value] = (breakdown[value] || 0) + 1;
    });

    return breakdown as Record<T, number>;


  private calculateTrendAnalysis(groups: ErrorGroup[]): ErrorTrendAnalysis {
    const totalGroups = groups.length;
    const increasingGroups = groups.filter(g => g.trend.direction === 'increasing').length;
    const newGroups = groups.filter(g => g.status === ErrorStatus.NEW).length;
    const recurringGroups = groups.filter(g => g.status === ErrorStatus.RECURRING).length;

    return {
      overallTrend: increasingGroups > totalGroups * 0.3 ? 'worsening' :
        increasingGroups < totalGroups * 0.1 ? 'improving' : 'stable',
      errorRateTrend: increasingGroups / totalGroups * 100,
      resolutionTimeTrend: 0, // Would calculate from historical data
      newErrorsRate: newGroups,
      recurringErrorsRate: totalGroups > 0 ? (recurringGroups / totalGroups) * 100 : 0
    };


  private calculateImpactAnalysis(events: ErrorEvent[], groups: ErrorGroup[]): ImpactAnalysis {
    const highImpactErrors = events.filter(e => 
      e.userImpact.impactLevel === 'high' || e.userImpact.impactLevel === 'critical'
    ).length;

    const businessCriticalErrors = events.filter(e => e.userImpact.businessCritical).length;

    // Calculate experience scores (simplified)
    const userExperienceScore = Math.max(0, 100 - (highImpactErrors / events.length * 100));
    const systemStabilityScore = Math.max(0, 100 - (groups.filter(g => g.severity === ErrorSeverity.CRITICAL).length / groups.length * 100));

    const recommendedActions: string[] = [];
    if (highImpactErrors > 0) {
      recommendedActions.push('Address high-impact errors immediately');

    if (businessCriticalErrors > 0) {
      recommendedActions.push('Prioritize business-critical error resolution');

    if (userExperienceScore < 80) {
      recommendedActions.push('Focus on improving user experience');


    return {
      highImpactErrors,
      businessCriticalErrors,
      userExperienceScore: Math.round(userExperienceScore),
      systemStabilityScore: Math.round(systemStabilityScore),
      recommendedActions
    };


  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateGroupTitle(message: string): string {
    // Create a human-readable title from error message
    return message.split('\n')[0].substring(0, 100);


  private generateTags(message: string, context: Partial<ErrorContext>): string[] {
    const tags: string[] = [];
    
    if (context.component) tags.push(`component:${context.component}`);
    if (context.operation) tags.push(`operation:${context.operation}`);
    if (context.httpStatus) tags.push(`http:${context.httpStatus}`);
    
    return tags;


  private enrichContext(context: Partial<ErrorContext>): ErrorContext {
    return {
      component: 'unknown',
      operation: 'unknown',
      ...context
    };


  private async generateMetadata(context: Partial<ErrorContext>): Promise<ErrorMetadata> {

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      hostname: require('os').hostname(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      memoryUsage,
      cpuUsage,
      requestDuration: context.additionalData?.requestDuration,
      tags: [],
      customFields: {}
    };


  private compareSeverity(severity1: ErrorSeverity, severity2: ErrorSeverity): number {
    const order = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return order[severity1] - order[severity2];


  private updateTrendAnalysis(group: ErrorGroup, errorEvent: ErrorEvent): void {
    // Add current data point
    group.trend.dataPoints.push({
      timestamp: errorEvent.timestamp,
      count: group.occurrenceCount,
      uniqueUsers: group.uniqueUsers,
      severity: errorEvent.severity
    });

    // Keep only last 100 data points
    if (group.trend.dataPoints.length > 100) {
      group.trend.dataPoints = group.trend.dataPoints.slice(-100);


    // Calculate trend direction (simplified)
    if (group.trend.dataPoints.length >= 2) {
      const recent = group.trend.dataPoints.slice(-10);
      const older = group.trend.dataPoints.slice(-20, -10);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, p) => sum + p.count, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.count, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.2) {
          group.trend.direction = 'increasing';
          group.trend.changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
 else if (recentAvg < olderAvg * 0.8) {
          group.trend.direction = 'decreasing';
          group.trend.changePercentage = ((olderAvg - recentAvg) / olderAvg) * 100;
 else {
          group.trend.direction = 'stable';
          group.trend.changePercentage = 0;





  private async updateUniqueUsersCount(group: ErrorGroup, userId: string): Promise<void> {

    // In production, would track unique users in database
    // For now, simplified implementation
    if (userId) {
      group.uniqueUsers = Math.max(group.uniqueUsers, 1);



  private isAlertInCooldown(alertId: string): boolean {
    const cooldownUntil = this.alertCooldowns.get(alertId);
    return cooldownUntil ? cooldownUntil > new Date() : false;


  private setAlertCooldown(alertId: string, minutes: number): void {
    const cooldownUntil = new Date(Date.now() + minutes * 60 * 1000);
    this.alertCooldowns.set(alertId, cooldownUntil);


  // ==========================================
  // INITIALIZATION AND CONFIGURATION
  // ==========================================

  private initializeDefaultAlertRules(): void {
    // Critical errors alert
    this.alertRules.set('critical_errors', {
      alertId: 'critical_errors',
      groupId: '*', // All groups
      alertType: 'severity_increased',
      triggered: false,
      channels: [
        {
          type: 'email',
          target: 'admin@system.com',
          severity: [ErrorSeverity.CRITICAL],
          enabled: true,
          cooldownMinutes: 15

      ]
    });

    // High occurrence threshold alert
    this.alertRules.set('high_occurrence', {
      alertId: 'high_occurrence',
      groupId: '*',
      alertType: 'threshold_exceeded',
      threshold: {
        type: 'occurrence_count',
        value: 10,
        timeWindow: 60,
        comparison: 'greater_than'

      triggered: false,
      channels: [
        {
          type: 'slack',
          target: '#alerts',
          severity: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
          enabled: true,
          cooldownMinutes: 30

      ]
    });


  // ==========================================
  // STORAGE METHODS (PLACEHOLDER)
  // ==========================================

  private async storeErrorEvent(errorEvent: ErrorEvent): Promise<void> {

    // In production, would store in database
    console.log(`Storing error event: ${errorEvent.errorId}`);


  private async storeErrorGroup(errorGroup: ErrorGroup): Promise<void> {

    // In production, would store in database
    console.log(`Storing error group: ${errorGroup.groupId}`);


  // ==========================================
  // ALERT SENDING METHODS (PLACEHOLDER)
  // ==========================================

  private async sendAlert(channel: AlertChannelConfig, payload: any): Promise<void> {

    console.log(`Would send ${channel.type} alert to ${channel.target}:`, payload.groupTitle);


  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  async getErrorGroup(groupId: string): Promise<ErrorGroup | null> {

    return this.errorGroups.get(groupId) || null;


  async queryErrors(query: ErrorQuery): Promise<ErrorEvent[]> {

    let events = Array.from(this.errorEvents.values());

    // Apply filters
    if (query.timeRange) {
      events = events.filter(e => 
        e.timestamp >= query.timeRange!.start && e.timestamp <= query.timeRange!.end
      );


    if (query.severity?.length) {
      events = events.filter(e => query.severity!.includes(e.severity));


    if (query.category?.length) {
      events = events.filter(e => query.category!.includes(e.category));


    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      events = events.filter(e => 
        e.message.toLowerCase().includes(searchLower) ||
        e.context.component.toLowerCase().includes(searchLower)
      );


    // Apply sorting
    if (query.sortBy) {
      events.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (query.sortBy) {
        case 'timestamp':
          aVal = a.timestamp.getTime();
          bVal = b.timestamp.getTime();
          break;
        case 'severity':
          aVal = this.compareSeverity(a.severity, ErrorSeverity.LOW);
          bVal = this.compareSeverity(b.severity, ErrorSeverity.LOW);
          break;
        default:
          return 0;


        return query.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });


    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return events.slice(offset, offset + limit);


  async resolveErrorGroup(
    groupId: string, 
    resolvedBy: string, 
    resolution: string, 
    actionsTaken: string[] = []
  ): Promise<void> {

    const group = this.errorGroups.get(groupId);
    if (!group) throw new Error(`Error group not found: ${groupId}`);

    const resolvedAt = new Date();
    const timeToResolve = resolvedAt.getTime() - group.firstSeen.getTime();

    group.status = ErrorStatus.RESOLVED;
    group.resolution = {
      resolvedBy,
      resolvedAt,
      resolution,
      actionsTaken,
      preventionMeasures: [],
      timeToResolve
    };

    await this.storeErrorGroup(group);

    // Audit resolution
    await this.auditService.logAction({
      userId: resolvedBy,
      action: 'error_group_resolved',
      resource: `error_group:${groupId}`,
      details: {
        resolution,
        actionsTaken,
        timeToResolve,
        timestamp: resolvedAt

    });

