/**
 * Real-time Security Event Monitoring System
 * Provides comprehensive security event tracking and alerting
 *
 * Integrates with Epic 18 security framework for real-time threat monitoring
 */
import { EventEmitter } from 'events';
import { SecurityAnalysisResult } from '../validation/advanced-security';
export declare enum SecurityEventType {
    VALIDATION_FAILURE = "validation_failure",
    INJECTION_ATTEMPT = "injection_attempt",
    PATTERN_MATCH = "pattern_match",
    THRESHOLD_EXCEEDED = "threshold_exceeded",
    ANOMALY_DETECTED = "anomaly_detected",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
}
export declare enum SecurityEventSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: SecurityEventType;
    severity: SecurityEventSeverity;
    source: string;
    userId?: string;
    sessionId?: string;
    input: {,
        raw: string;
        sanitized?: string;
        size: number;
        type: string;
    };
    analysis: {,
        riskScore: number;
        threatsDetected: string[];
        confidence: number;
        validationResult: boolean;
    };
    context: {,
        userAgent?: string;
        ipAddress?: string;
        endpoint?: string;
        component: string;
    };
    metadata: Record<string, any>;
}
export interface AlertConfig {
    enabled: boolean;
    severityThreshold: SecurityEventSeverity;
    rateThreshold: {,
        events: number;
        timeWindowMs: number;
    };
    channels: AlertChannel[];
}
export interface AlertChannel {
    type: 'webhook' | 'email' | 'slack' | 'console';
    config: Record<string, any>;
    enabled: boolean;
}
export interface SecurityMonitoringStats {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<SecurityEventSeverity, number>;
    averageRiskScore: number;
    topThreats: Array<{,
        threat: string;
        count: number;
    }>;
    timeRange: {,
        start: Date;
        end: Date;
    };
}
/**
 * Real-time Security Event Monitor
 */
export declare class SecurityEventMonitor extends EventEmitter {
    private events;
    private alertConfig;
    private rateLimitTracker;
    private readonly maxEventHistory;
    private readonly cleanupIntervalMs;
    constructor(alertConfig?: Partial<AlertConfig>);
    /**
     * Record a security event
     */
    recordEvent(type: SecurityEventType, severity: SecurityEventSeverity, source: string, input: {)
        raw: string;
        type: string;
    }, analysis: SecurityAnalysisResult, context?: Partial<SecurityEvent['context']>, metadata?: Record<string, any>): SecurityEvent;
    /**
     * Record validation failure event
     */
    recordValidationFailure()
      input: string,
      inputType: string,
      source: string,
      analysis: SecurityAnalysisResult,
      context?: Partial<SecurityEvent['context']>
    ): SecurityEvent;
    /**
     * Record injection attempt
     */
    recordInjectionAttempt()
      input: string,
      inputType: string,
      source: string,
      detectedPatterns: string[],
      context?: Partial<SecurityEvent['context']>
    ): SecurityEvent;
    /**
     * Record anomalous activity
     */
    recordAnomaly()
      description: string,
      source: string,
      riskScore: number,
      metadata?: Record<string,
      any>
    ): SecurityEvent;
    /**
     * Get recent security events
     */
    getRecentEvents(limit?: number, severity?: SecurityEventSeverity): SecurityEvent[];
    /**
     * Get security monitoring statistics
     */
    getStats(timeRangeMs?: number): SecurityMonitoringStats;
    /**
     * Update alert configuration
     */
    updateAlertConfig(config: Partial<AlertConfig>): void;
    /**
     * Add alert channel
     */
    addAlertChannel(channel: AlertChannel): void;
    /**
     * Remove alert channel
     */
    removeAlertChannel(channelType: string): void;
    /**
     * Generate dashboard data for monitoring UI
     */
    getDashboardData(): any;
    private generateEventId;
    private trimEventHistory;
    private updateRateLimit;
    private shouldTriggerAlert;
    private triggerAlert;
    private sendAlert;
    private sendWebhookAlert;
    private cleanupOldEvents;
    private getRiskScoreDistribution;
    private getTimelineData;
}
export declare     /**
     * Create monitoring middleware for API endpoints
     */
    createApiMiddleware: (source: string) => (req: any, res: any, next: any) => any;
};
export default SecurityEventMonitor;
//# sourceMappingURL=security-monitor.d.ts.map