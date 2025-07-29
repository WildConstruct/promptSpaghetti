/**
 * Real-time Security Event Monitoring System
 * Provides comprehensive security event tracking and alerting
 * 
 * Integrates with Epic 18 security framework for real-time threat monitoring
 */
import { EventEmitter } from 'events';
import { SecurityValidation } from '../validation/security';
import { AdvancedSecurityAnalyzer, SecurityAnalysisResult } from '../validation/advanced-security';

// Security event types
export enum SecurityEventType {
  VALIDATION_FAILURE = 'validation_failure',
  INJECTION_ATTEMPT = 'injection_attempt',
  PATTERN_MATCH = 'pattern_match',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  ANOMALY_DETECTED = 'anomaly_detected',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
  // Security event severity levels
  export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  // Security event interface
  export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  source: string;
  userId?: string;
  sessionId?: string;
  input: {
  raw: string;
  sanitized?: string;
  size: number;
  type: string;
};
  analysis: {
  riskScore: number;
  threatsDetected: string;
  confidence: number;
  validationResult: boolean;
};
  context: {
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  component: string;
};
  metadata: Record<string, any>;

// Alert configuration
}
export interface AlertConfig {
  enabled: boolean;
  severityThreshold: SecurityEventSeverity;
  rateThreshold: {
  events: number;
  timeWindowMs: number;
};
  channels: AlertChannel;
}
export interface AlertChannel {
  type: 'webhook' | 'email' | 'slack' | 'console';
  config: Record<string, any>;
  enabled: boolean;
  // Monitoring statistics
}
export interface SecurityMonitoringStats {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  averageRiskScore: number;
  topThreats: Array<{ threat: string; count: number }>;
  timeRange: {
  start: Date;
  end: Date;
};
/**
 * Real-time Security Event Monitor
 */
}
export class SecurityEventMonitor extends EventEmitter {
  private events: SecurityEvent = [];
  private alertConfig: AlertConfig;
  private rateLimitTracker = new Map<string, number>();
  private readonly maxEventHistory = 10000;
  private readonly cleanupIntervalMs = 300000; // 5 minutes
  constructor(alertConfig?: Partial<AlertConfig>) {,
  super();
  this.alertConfig = {
  enabled: true,
  severityThreshold: SecurityEventSeverity.MEDIUM,
  rateThreshold: {
  events: 10,
  timeWindowMs: 60000 // 1 minute,
},
  channels: [,
        {
          type: 'console',
          config: { level: 'warn' },
          enabled: true],
      ...alertConfig
    };
    // Start cleanup interval
    setInterval(() => this.cleanupOldEvents(), this.cleanupIntervalMs);
  /**
   * Record a security event
   */
  recordEvent();
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    source: string,
    input: { raw: string; type: string },
    analysis: SecurityAnalysisResult,
    context: Partial<SecurityEvent['context']> = {},
    metadata: Record<string, any> = {}
  ): SecurityEvent {
  const event: SecurityEvent = {,
  id: this.generateEventId(),
  timestamp: new Date(),
  type,
  severity,
  source,
  input: {
  raw: input.raw,
  size: input.raw.length,
  type: input.type,
  sanitized: SecurityValidation.sanitizeString(input.raw),
},
  analysis: {
  riskScore: analysis.riskScore,
  threatsDetected: analysis.threatsDetected,
  confidence: analysis.confidence,
  validationResult: analysis.isSecure,
},
  context: {
  component: source,
  ...context
}
      metadata
    };
    // Add to event history
    this.events.push(event);
    this.trimEventHistory();
    // Check for rate limiting
    this.updateRateLimit(event);
    // Emit event for real-time processing
    this.emit('securityEvent', event);
    // Check if alert should be triggered
    if (this.shouldTriggerAlert(event)) {
      this.triggerAlert(event);
    return event;
  /**
   * Record validation failure event
   */
  recordValidationFailure();
    input: string,
    inputType: string,
    source: string,
    analysis: SecurityAnalysisResult,
    context?: Partial<SecurityEvent['context']>
  ): SecurityEvent {
    const severity = analysis.riskScore > 0.8 ? SecurityEventSeverity.HIGH :;
                    analysis.riskScore > 0.5 ? SecurityEventSeverity.MEDIUM :
                    SecurityEventSeverity.LOW;
    return this.recordEvent()
      SecurityEventType.VALIDATION_FAILURE,
      severity,
      source,
      { raw: input, type: inputType },
      analysis,
      context,
      { patterns: analysis.threatsDetected }
    );
  /**
   * Record injection attempt
   */
  recordInjectionAttempt();
    input: string,
    inputType: string,
    source: string,
    detectedPatterns: string,
    context?: Partial<SecurityEvent['context']>
  ): SecurityEvent {
  const analysis: SecurityAnalysisResult = {,
  isSecure: false,
  riskScore: 0.9,
  threatsDetected: detectedPatterns,
  confidence: 0.85,
};
    return this.recordEvent()
      SecurityEventType.INJECTION_ATTEMPT,
      SecurityEventSeverity.CRITICAL,
      source,
      { raw: input, type: inputType },
      analysis,
      context,
      { injectionPatterns: detectedPatterns }
    );
  /**
   * Record anomalous activity
   */
  recordAnomaly();
    description: string,
    source: string,
    riskScore: number,
    metadata: Record<string, any> = {}
  ): SecurityEvent {
  const analysis: SecurityAnalysisResult = {,
  isSecure: riskScore < 0.5,
  riskScore,
  threatsDetected: [description],
  confidence: 0.7,
};
    const severity = riskScore > 0.8 ? SecurityEventSeverity.HIGH :;
                    riskScore > 0.5 ? SecurityEventSeverity.MEDIUM :
                    SecurityEventSeverity.LOW;
    return this.recordEvent()
      SecurityEventType.ANOMALY_DETECTED,
      severity,
      source,
      { raw: description, type: 'anomaly' },
      analysis,
      {},
      metadata
    );
  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 100, severity?: SecurityEventSeverity): SecurityEvent {
  let filteredEvents = this.events;
  if (severity) {
  filteredEvents = filteredEvents.filter(event => event.severity === severity);
  return filteredEvents
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, limit);
  /**
  * Get security monitoring statistics
  */
  getStats(timeRangeMs: number = 3600000): SecurityMonitoringStats { // Default 1 hour,
  const now = new Date();
  const startTime = new Date(now.getTime() - timeRangeMs);
  const recentEvents = this.events.filter(;);
  event => event.timestamp >= startTime
  );
  const eventsByType = Object.values(SecurityEventType).reduce((acc, type) => {
  acc[type] = recentEvents.filter(event => event.type === type).length;
  return acc;
}, {} as Record<SecurityEventType, number>);
    const eventsBySeverity = Object.values(SecurityEventSeverity).reduce((acc, severity) => {
      acc[severity] = recentEvents.filter(event => event.severity === severity).length;
      return acc;
    }, {} as Record<SecurityEventSeverity, number>);
    const averageRiskScore = recentEvents.length > 0 ?;
      recentEvents.reduce((sum, event) => sum + event.analysis.riskScore, 0) / recentEvents.length :
      0;
    // Calculate top threats
    const threatCounts = new Map<string, number>();
    recentEvents.forEach(event => {)
  event.analysis.threatsDetected.forEach(threat => {)
  threatCounts.set(threat, (threatCounts.get(threat) || 0) + 1);
      });
    });
    const topThreats = Array.from(threatCounts.entries());
      .map(([threat, count]) => ({ threat, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return {
  totalEvents: recentEvents.length,
  eventsByType,
  eventsBySeverity,
  averageRiskScore,
  topThreats,
  timeRange: {
  start: startTime,
  end: now,
};
  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  /**
   * Add alert channel
   */
  addAlertChannel(channel: AlertChannel): void {
  this.alertConfig.channels.push(channel);
  /**
  * Remove alert channel
  */
  removeAlertChannel(channelType: string): void {,
  this.alertConfig.channels = this.alertConfig.channels.filter()
  channel => channel.type !== channelType
  );
  /**
  * Generate dashboard data for monitoring UI
  */
  getDashboardData(): any {,
  const stats = this.getStats();
  const recentCritical = this.getRecentEvents(50, SecurityEventSeverity.CRITICAL);
  return {
  overview: {
  totalEvents: stats.totalEvents,
  criticalEvents: stats.eventsBySeverity[SecurityEventSeverity.CRITICAL],
  averageRiskScore: stats.averageRiskScore,
  topThreat: stats.topThreats[0]?.threat || 'None',
},
  charts: {
  eventsByType: stats.eventsByType,
  eventsBySeverity: stats.eventsBySeverity,
  riskScoreDistribution: this.getRiskScoreDistribution(),
  timelineData: this.getTimelineData(),
},
  alerts: {
  recentCritical: recentCritical.slice(0, 10),
  alertConfig: this.alertConfig,
};
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private trimEventHistory(): void {
    if (this.events.length > this.maxEventHistory) {
      this.events = this.events.slice(-this.maxEventHistory);
  private updateRateLimit(event: SecurityEvent): void {
    const key = `${event.context.ipAddress || 'unknown'}_${event.userId || 'anonymous'}`;}
    const now = Date.now();
    const windowStart = now - this.alertConfig.rateThreshold.timeWindowMs;
    // Get existing timestamps for this key
    const timestamps = this.rateLimitTracker.get(key) || [];
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);
    recentTimestamps.push(now);
    this.rateLimitTracker.set(key, recentTimestamps);
    // Check if rate limit exceeded
    if (recentTimestamps.length > this.alertConfig.rateThreshold.events) {
      this.recordEvent()
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        SecurityEventSeverity.HIGH,
        'rate_limiter',
        { raw: `Rate limit exceeded: ${recentTimestamps.length} events`, type: 'rate_limit' }
}
        {
  isSecure: false,
  riskScore: 0.8,
  threatsDetected: ['Rate limit exceeded'],
  confidence: 1.0,
}
        event.context,
        { eventCount: recentTimestamps.length, timeWindow: this.alertConfig.rateThreshold.timeWindowMs }
      );
  private shouldTriggerAlert(event: SecurityEvent): boolean {
  if (!this.alertConfig.enabled) {
  return false;
  const severityLevels = {
  [SecurityEventSeverity.LOW]: 1,
  [SecurityEventSeverity.MEDIUM]: 2,
  [SecurityEventSeverity.HIGH]: 3,
  [SecurityEventSeverity.CRITICAL]: 4,
};
    return severityLevels[event.severity] >= severityLevels[this.alertConfig.severityThreshold];
  private async triggerAlert(event: SecurityEvent): Promise<void> {
    const alertPromises = this.alertConfig.channels;
      .filter(channel => channel.enabled)
      .map(channel => this.sendAlert(channel, event));
    try {
      await Promise.allSettled(alertPromises);
      this.emit('alertSent', event);
    } catch (error) {
      this.emit('alertError', error, event);
  private async sendAlert(channel: AlertChannel, event: SecurityEvent): Promise<void> {
    switch (channel.type) {
      case 'console':
        console.warn(`🚨 Security Alert [${event.severity.toUpperCase()}]:`, {},}
  type: event.type,
          source: event.source,
          threats: event.analysis.threatsDetected,
          riskScore: event.analysis.riskScore;
  });
        break;
      case 'webhook':
        if (channel.config.url) {
  await this.sendWebhookAlert(channel.config.url, event);
  break;
  case 'email':,
  // Email implementation would go here
  break;
  case 'slack':,
  // Slack implementation would go here
  break;
  private async sendWebhookAlert(url: string, event: SecurityEvent): Promise<void> {,
  try {
  const response = await fetch(url, {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({,)
  alert: 'Security Event',
  severity: event.severity,
  type: event.type,
  timestamp: event.timestamp.toISOString(),
  details: {
  source: event.source,
  riskScore: event.analysis.riskScore,
  threats: event.analysis.threatsDetected,
  input: event.input.sanitized,
}
      });
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);}
    } catch (error) {
  console.error('Failed to send webhook alert:', error);
  private cleanupOldEvents(): void {,
  const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours;
  this.events = this.events.filter(event => event.timestamp > cutoffTime);
  // Clean up rate limit tracker
  const now = Date.now();
  const windowStart = now - this.alertConfig.rateThreshold.timeWindowMs;
  for (const [key, timestamps] of this.rateLimitTracker.entries()) {
  const recentTimestamps = timestamps.filter(ts => ts > windowStart);
  if (recentTimestamps.length === 0) {
  this.rateLimitTracker.delete(key);
} else {
  this.rateLimitTracker.set(key, recentTimestamps);
  private getRiskScoreDistribution(): Record<string, number> {,
  const buckets = {
  'Low (0.0-0.3)': 0,
  'Medium (0.3-0.6)': 0,
  'High (0.6-0.8)': 0,
  'Critical (0.8-1.0)': 0,
};
    this.events.forEach(event => {)
  const score = event.analysis.riskScore;
      if (score < 0.3) buckets['Low (0.0-0.3)']++;
      else if (score < 0.6) buckets['Medium (0.3-0.6)']++;
      else if (score < 0.8) buckets['High (0.6-0.8)']++;
      else buckets['Critical (0.8-1.0)']++;
    });
    return buckets;
  private getTimelineData(): Array<{ timestamp: string; events: number; riskScore: number }> {
    const buckets = new Map<string, { events: number; totalRisk: number }>();
    const now = new Date();
    // Create hourly buckets for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const hourKey = hour.toISOString().slice(0, 13) + ':00:00.000Z';
      buckets.set(hourKey, { events: 0, totalRisk: 0 });
    // Fill buckets with event data
    this.events.forEach(event => {)
  const hourKey = event.timestamp.toISOString().slice(0, 13) + ':00:00.000Z';
  const bucket = buckets.get(hourKey);
  if (bucket) {
  bucket.events++;
  bucket.totalRisk += event.analysis.riskScore;
});
    // Convert to timeline format
    return Array.from(buckets.entries()).map(([timestamp, data]) => ({)
  timestamp,
  events: data.events,
  riskScore: data.events > 0 ? data.totalRisk / data.events : 0,
}));

// Singleton instance for application use
export const securityMonitor = new SecurityEventMonitor();

// Integration helpers for Epic 18 security framework
export const result = validationFn(...args);
      if (!result && typeof input === 'string') {
        // Record validation failure
        const analyzer = new AdvancedSecurityAnalyzer();
        const analysis = analyzer.analyzeInput(input);
        securityMonitor.recordValidationFailure()
          input,
          'string',
          source,
          analysis
        );
      return result;
    }) as T;
  }
  /**
   * Create monitoring middleware for API endpoints
   */
  createApiMiddleware: (source: string) => {,
    return (req: any, res: any, next: any) => {
      // Monitor request body for security issues
      if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        const analyzer = new AdvancedSecurityAnalyzer();
        const analysis = analyzer.analyzeInput(bodyStr);
        if (!analysis.isSecure) {
          securityMonitor.recordValidationFailure()
            bodyStr,
            'api_request',
            source,
            analysis,
            {
              endpoint: req.path,
              userAgent: req.get('user-agent'),
              ipAddress: req.ip);
          if (analysis.riskScore > 0.8) {
            return res.status(400).json({ error: 'Request contains suspicious content' });
      next();
    };
};

export default SecurityEventMonitor;