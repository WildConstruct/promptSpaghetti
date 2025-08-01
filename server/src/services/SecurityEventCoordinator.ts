/**
 * Centralized Security Event Coordinator
 * Orchestrates security event processing, correlation, and analysis
 */

import { EventEmitter } from 'events';
import { AuditService } from '../auth/services/AuditService';
import { RiskScoringService } from './RiskScoringService';
import { AnomalyDetectionService } from './AnomalyDetectionService';
import { SecurityAuditService } from './security-audit-service';
import { logger } from '../utils/logger';



export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  source: string;
  correlationId?: string;
  enrichmentData?: Record<string, any>;







export interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    eventTypes: string[];
    timeWindow: number; // minutes
    threshold: number;
    severity: string[];
    userPattern?: string;
    ipPattern?: string;



  };
  actions: {
    alert: boolean;
    blockUser?: boolean;
    requireReauth?: boolean;
    notifyAdmin?: boolean;
    escalate?: boolean;
  };
  enabled: boolean;




export interface SecurityEventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;



  topUsers: Array<{ userId: string; count: number }>;
  topIPs: Array<{ ipAddress: string; count: number }>;
  threatsDetected: number;
  activeAlerts: number;
  averageRiskScore: number;


export class SecurityEventCoordinator extends EventEmitter {
  private auditService: AuditService;
  private riskScoringService: RiskScoringService;
  private anomalyDetectionService: AnomalyDetectionService;
  private securityAuditService: SecurityAuditService;
  private eventQueue: SecurityEvent[] = [];
  private threatRules: Map<string, ThreatDetectionRule> = new Map();
  private recentEvents: Map<string, SecurityEvent[]> = new Map(); // keyed by user ID
  private processingInterval: NodeJS.Timeout | null = null;
  private eventStats: SecurityEventStats;

  constructor(
    auditService: AuditService,
    riskScoringService: RiskScoringService,
    anomalyDetectionService: AnomalyDetectionService,
    securityAuditService: SecurityAuditService
  ) {
    super();
    this.auditService = auditService;
    this.riskScoringService = riskScoringService;
    this.anomalyDetectionService = anomalyDetectionService;
    this.securityAuditService = securityAuditService;
    
    this.eventStats = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      topUsers: [],
      topIPs: [],
      threatsDetected: 0,
      activeAlerts: 0,
      averageRiskScore: 0
    };

    this.initializeDefaultRules();
    this.startProcessing();


  /**
   * Process a security event through the workflow
   */
  public async processEvent(event: SecurityEvent): Promise<void> {

    try {
      // Add correlation ID if not present
      if (!event.correlationId) {
        event.correlationId = this.generateCorrelationId();


      // Enrich event with additional context
      const enrichedEvent = await this.enrichEvent(event);
      
      // Add to processing queue
      this.eventQueue.push(enrichedEvent);
      
      // Update statistics
      this.updateStats(enrichedEvent);
      
      // Check for immediate threats
      await this.checkImmediateThreats(enrichedEvent);
      
      // Store user events for correlation
      this.storeRecentEvent(enrichedEvent);
      
      // Emit event for real-time monitoring
      this.emit('securityEvent', enrichedEvent);
      
      logger.log(`Security event processed: ${event.type} for user ${event.userId}`);
 catch (error) {
      logger.log(`Error processing security event: ${error}`);
      throw error;



  /**
   * Enrich event with additional context and metadata
   */
  private async enrichEvent(event: SecurityEvent): Promise<SecurityEvent> {

    const enrichmentData: Record<string, any> = {};

    try {
      // Add geolocation data if IP address is available
      if (event.ipAddress) {
        enrichmentData.geolocation = await this.getGeolocation(event.ipAddress);
        enrichmentData.knownIP = await this.isKnownIP(event.ipAddress, event.userId);


      // Add device fingerprint analysis
      if (event.userAgent) {
        enrichmentData.deviceInfo = this.parseUserAgent(event.userAgent);
        enrichmentData.knownDevice = await this.isKnownDevice(event.userAgent, event.userId);


      // Add user behavior context
      if (event.userId) {
        enrichmentData.userContext = await this.getUserContext(event.userId);
        enrichmentData.riskScore = await this.riskScoringService.calculateUserRisk(
          event.userId,
          event.type,
          event.details
        );


      // Add time-based context
      enrichmentData.timeContext = this.getTimeContext(event.timestamp);
      
      // Add session context
      if (event.sessionId) {
        enrichmentData.sessionContext = await this.getSessionContext(event.sessionId);


      return {
        ...event,
        enrichmentData
      };
 catch (error) {
      logger.log(`Event enrichment failed: ${error}`);
      return event; // Return original event if enrichment fails



  /**
   * Check for immediate threats that require urgent action
   */
  private async checkImmediateThreats(event: SecurityEvent): Promise<void> {

    // Check against all active threat detection rules
    for (const rule of this.threatRules.values()) {
      if (!rule.enabled) continue;

      if (await this.evaluateThreatRule(rule, event)) {
        await this.handleThreatDetection(rule, event);



    // Check for anomalies using ML-based detection
    const isAnomaly = await this.anomalyDetectionService.detectAnomaly({
      userId: event.userId,
      eventType: event.type,
      timestamp: event.timestamp,
      details: event.details,
      enrichmentData: event.enrichmentData
    });

    if (isAnomaly) {
      await this.handleAnomalyDetection(event);



  /**
   * Evaluate a threat detection rule against an event
   */
  private async evaluateThreatRule(rule: ThreatDetectionRule, event: SecurityEvent): Promise<boolean> {

    // Check if event type matches
    if (!rule.conditions.eventTypes.includes(event.type)) {
      return false;


    // Check severity filter
    if (!rule.conditions.severity.includes(event.severity)) {
      return false;


    // Check user pattern if specified
    if (rule.conditions.userPattern && event.userId) {
      const userPattern = new RegExp(rule.conditions.userPattern);
      if (!userPattern.test(event.userId)) {
        return false;



    // Check IP pattern if specified
    if (rule.conditions.ipPattern && event.ipAddress) {
      const ipPattern = new RegExp(rule.conditions.ipPattern);
      if (!ipPattern.test(event.ipAddress)) {
        return false;



    // Check threshold within time window
    const recentEvents = await this.getRecentEvents(
      event.userId || event.ipAddress || 'global',
      rule.conditions.timeWindow,
      rule.conditions.eventTypes
    );

    return recentEvents.length >= rule.conditions.threshold;


  /**
   * Handle detected threats
   */
  private async handleThreatDetection(rule: ThreatDetectionRule, event: SecurityEvent): Promise<void> {

    this.eventStats.threatsDetected++;
    
    const threatEvent: SecurityEvent = {
      id: this.generateEventId(),
      type: 'threat_detected',
      severity: 'critical',
      timestamp: new Date(),
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: {
        originalEvent: event,
        triggeredRule: rule,
        ruleId: rule.id,
        ruleName: rule.name

      source: 'SecurityEventCoordinator',
      correlationId: event.correlationId
    };

    // Log the threat detection
    await this.auditService.logEvent(
      'threat_detected',
      event.userId || 'system',
      {
        ruleId: rule.id,
        ruleName: rule.name,
        originalEventType: event.type,
        severity: 'critical'

      {
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      }
    );

    // Execute rule actions
    if (rule.actions.alert) {
      this.emit('threatAlert', { rule, event, threatEvent });


    if (rule.actions.blockUser && event.userId) {
      await this.blockUser(event.userId, rule.name);


    if (rule.actions.requireReauth && event.sessionId) {
      await this.requireReauthentication(event.sessionId);


    if (rule.actions.notifyAdmin) {
      await this.notifyAdministrators(rule, event);


    if (rule.actions.escalate) {
      await this.escalateThreat(rule, event);



  /**
   * Handle anomaly detection
   */
  private async handleAnomalyDetection(event: SecurityEvent): Promise<void> {

    const anomalyEvent: SecurityEvent = {
      id: this.generateEventId(),
      type: 'anomaly_detected',
      severity: 'high',
      timestamp: new Date(),
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: {
        originalEvent: event,
        anomalyScore: event.enrichmentData?.riskScore || 0,
        detectionMethod: 'machine_learning'

      source: 'SecurityEventCoordinator',
      correlationId: event.correlationId
    };

    await this.auditService.logEvent(
      'anomaly_detected',
      event.userId || 'system',
      {
        originalEventType: event.type,
        anomalyScore: anomalyEvent.details.anomalyScore,
        severity: 'high'

      {
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      }
    );

    this.emit('anomalyAlert', { event, anomalyEvent });


  /**
   * Add or update a threat detection rule
   */
  public addThreatRule(rule: ThreatDetectionRule): void {
    this.threatRules.set(rule.id, rule);
    logger.log(`Threat detection rule added: ${rule.name}`);


  /**
   * Remove a threat detection rule
   */
  public removeThreatRule(ruleId: string): void {
    this.threatRules.delete(ruleId);
    logger.log(`Threat detection rule removed: ${ruleId}`);


  /**
   * Get current security event statistics
   */
  public getStats(): SecurityEventStats {
    return { ...this.eventStats };


  /**
   * Get recent events for correlation analysis
   */
  private async getRecentEvents(
    key: string,
    timeWindowMinutes: number,
    eventTypes: string[]
  ): Promise<SecurityEvent[]> {

    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const events = this.recentEvents.get(key) || [];
    
    return events.filter(event => 
      event.timestamp >= cutoffTime && 
      eventTypes.includes(event.type)
    );


  /**
   * Store recent event for correlation
   */
  private storeRecentEvent(event: SecurityEvent): void {
    const key = event.userId || event.ipAddress || 'global';
    if (!this.recentEvents.has(key)) {
      this.recentEvents.set(key, []);

    
    const events = this.recentEvents.get(key)!;
    events.push(event);
    
    // Keep only events from last 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.timestamp >= cutoffTime);
    this.recentEvents.set(key, recentEvents);


  /**
   * Update event statistics
   */
  private updateStats(event: SecurityEvent): void {
    this.eventStats.totalEvents++;
    
    // Update event type counts
    this.eventStats.eventsByType[event.type] = 
      (this.eventStats.eventsByType[event.type] || 0) + 1;
    
    // Update severity counts
    this.eventStats.eventsBySeverity[event.severity] = 
      (this.eventStats.eventsBySeverity[event.severity] || 0) + 1;
    
    // Update risk score average
    const riskScore = event.enrichmentData?.riskScore || 0;
    if (riskScore > 0) {
      const currentTotal = this.eventStats.averageRiskScore * (this.eventStats.totalEvents - 1);
      this.eventStats.averageRiskScore = (currentTotal + riskScore) / this.eventStats.totalEvents;



  /**
   * Initialize default threat detection rules
   */
  private initializeDefaultRules(): void {
    // Brute force detection
    this.addThreatRule({
      id: 'brute_force_login',
      name: 'Brute Force Login Detection',
      description: 'Detects multiple failed login attempts',
      conditions: {
        eventTypes: ['login_failed'],
        timeWindow: 15,
        threshold: 5,
        severity: ['medium', 'high', 'critical']

      actions: {
        alert: true,
        blockUser: true,
        notifyAdmin: true

      enabled: true
    });

    // Suspicious location detection
    this.addThreatRule({
      id: 'suspicious_location',
      name: 'Suspicious Location Access',
      description: 'Detects access from unusual locations',
      conditions: {
        eventTypes: ['login_success', 'suspicious_login'],
        timeWindow: 60,
        threshold: 1,
        severity: ['high', 'critical']

      actions: {
        alert: true,
        requireReauth: true,
        notifyAdmin: true

      enabled: true
    });

    // Privilege escalation detection
    this.addThreatRule({
      id: 'privilege_escalation',
      name: 'Privilege Escalation Detection',
      description: 'Detects rapid privilege changes',
      conditions: {
        eventTypes: ['role_assigned', 'permission_granted'],
        timeWindow: 5,
        threshold: 3,
        severity: ['medium', 'high', 'critical']

      actions: {
        alert: true,
        notifyAdmin: true,
        escalate: true

      enabled: true
    });


  /**
   * Helper methods for event enrichment
   */
  private async getGeolocation(_____ipAddress: string): Promise<unknown> {

    // Mock implementation - would integrate with geolocation service
    return { country: 'US', city: 'Unknown', latitude: 0, longitude: 0 };


  private async isKnownIP(_____ipAddress: string, userId?: string): Promise<boolean> {

    // Mock implementation - would check against user's known IPs
    return false;


  private parseUserAgent(_____userAgent: string): unknown {
    // Mock implementation - would parse user agent string
    return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };


  private async isKnownDevice(_____userAgent: string, userId?: string): Promise<boolean> {

    // Mock implementation - would check against user's known devices
    return false;


  private async getUserContext(_____userId: string): Promise<unknown> {

    // Mock implementation - would get user context
    return { lastLogin: new Date(), loginCount: 0, riskLevel: 'low' };


  private getTimeContext(timestamp: Date): unknown {
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    
    return {
      hour,
      day,
      isWeekend: day === 0 || day === 6,
      isBusinessHours: hour >= 9 && hour <= 17,
      isNightTime: hour >= 22 || hour <= 6
    };


  private async getSessionContext(_____sessionId: string): Promise<unknown> {

    // Mock implementation - would get session context
    return { duration: 0, activityCount: 0, lastActivity: new Date() };


  /**
   * Action handlers
   */
  private async blockUser(userId: string, reason: string): Promise<void> {

    logger.log(`Blocking user ${userId} - Reason: ${reason}`);
    // Would integrate with user management service


  private async requireReauthentication(sessionId: string): Promise<void> {

    logger.log(`Requiring re-authentication for session ${sessionId}`);
    // Would integrate with session management service


  private async notifyAdministrators(rule: ThreatDetectionRule, event: SecurityEvent): Promise<void> {

    logger.log(`Notifying administrators - Rule: ${rule.name}, Event: ${event.type}`);
    // Would integrate with notification service


  private async escalateThreat(rule: ThreatDetectionRule, event: SecurityEvent): Promise<void> {

    logger.log(`Escalating threat - Rule: ${rule.name}, Event: ${event.type}`);
    // Would integrate with incident management system


  /**
   * Utility methods
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  /**
   * Start background processing
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000); // Process queue every 5 seconds


  /**
   * Process queued events
   */
  private async processQueue(): Promise<void> {

    if (this.eventQueue.length === 0) return;

    const events = this.eventQueue.splice(0, 100); // Process up to 100 events at a time
    
    for (const event of events) {
      try {
        // Additional processing, correlation analysis, etc.
        await this.performCorrelationAnalysis(event);
        
        // Store in audit log
        await this.auditService.logEvent(
          event.type,
          event.userId || 'system',
          event.details,
          {
            sessionId: event.sessionId,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            enrichmentData: event.enrichmentData
          }
        );
 catch (error) {
        logger.log(`Error processing queued event: ${error}`);




  /**
   * Perform correlation analysis on events
   */
  private async performCorrelationAnalysis(event: SecurityEvent): Promise<void> {

    // Look for related events in the correlation window
    if (event.correlationId) {
      const relatedEvents = await this.findRelatedEvents(event.correlationId);
      
      if (relatedEvents.length > 1) {
        // Analyze patterns across related events
        await this.analyzeEventPattern(relatedEvents);




  /**
   * Find events with the same correlation ID
   */
  private async findRelatedEvents(_____correlationId: string): Promise<SecurityEvent[]> {

    // Would query the audit log for related events
    return [];


  /**
   * Analyze patterns in related events
   */
  private async analyzeEventPattern(_____events: SecurityEvent[]): Promise<void> {

    // Pattern analysis logic
    // Could detect attack chains, coordinated attacks, etc.


  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;

    
    // Process remaining events
    this.processQueue();
    
    logger.log('SecurityEventCoordinator shutdown complete');


