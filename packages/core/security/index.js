/**
 * Security Integration Framework
 * Epic 31 - Security Integration Framework
 *
 * Unified exports for security monitoring, alerting, and dashboard components
 */
// Core security components
export { default as CrossSystemAlertingSystem } from './AlertingSystem';
export { default as UnifiedMonitoringDashboard } from './UnifiedMonitoringDashboard';
// Epic 31 Security Integration Framework - New Components
export { default as SecurityIncidentResponseService } from './SecurityIncidentResponseService';
export { default as SecurityDataIntegrityMonitor } from './SecurityDataIntegrityMonitor';
export { default as SecurityReliabilityEngineer } from './SecurityReliabilityEngineer';
export { default as SecurityCapacityManager } from './SecurityCapacityManager';
export { default as SecurityFailoverManager } from './SecurityFailoverManager';
export { default as SecurityDisasterRecoveryManager } from './SecurityDisasterRecoveryManager';
// Re-export existing security components for convenience
export { default as RateLimiter } from './RateLimiter';
export { default as ComplianceMonitor } from '../services/ComplianceMonitor';
export { default as AdaptiveThrottlingRules } from './AdaptiveThrottlingRules';
export { default as ComplianceSecurityDashboard } from './dashboard/ComplianceSecurityDashboard';
export { default as SecurityDashboardWorkflow } from './dashboard/SecurityDashboardWorkflow';
// Utility functions for security integration
export const createDefaultAlertingConfig = () => ({
    enabled: true,
    default_severity_threshold: 'medium',
    notification_settings: {
        batch_notifications: false,
        batch_interval: 300000, // 5 minutes
        quiet_hours: {
            start: '22:00',
            end: '08:00',
            timezone: 'UTC'
        }
    },
    escalation_settings: {
        auto_escalation_enabled: true,
        escalation_timeout: 1800000, // 30 minutes
        max_escalation_levels: 3
    },
    retention: {
        events_retention_days: 90,
        resolved_events_retention_days: 30,
        archive_after_days: 365
    },
    integrations: {
        siem_integration: {
            enabled: false,
            endpoint: '',
            api_key: ''
        },
        ticketing_integration: {
            enabled: false,
            system: 'jira',
            endpoint: '',
            credentials: {}
        }
    }
});
export const createSecurityEvent = (type, severity, title, description, source, details = {}) => ({
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    source,
    timestamp: Date.now(),
    title,
    description,
    details: {
        affected_systems: [],
        affected_users: [],
        ip_addresses: [],
        user_agents: [],
        request_patterns: [],
        data_accessed: [],
        ...details
    },
    metadata: {
        threat_level: 0,
        confidence_score: 0.8,
        auto_detected: true,
        related_events: []
    },
    status: 'active'
});
export const createEmailNotificationAction = (email, priority = 'normal') => ({
    type: 'email',
    target: email,
    priority,
    rate_limit: {
        max_per_hour: 10,
        max_per_day: 50
    }
});
export const createSlackNotificationAction = (channel, priority = 'normal') => ({
    type: 'slack',
    target: channel,
    priority,
    rate_limit: {
        max_per_hour: 20,
        max_per_day: 100
    }
});
export const createWebhookNotificationAction = (url, priority = 'normal') => ({
    type: 'webhook',
    target: url,
    priority,
    rate_limit: {
        max_per_hour: 100,
        max_per_day: 1000
    }
});
export const createBasicAlertRule = (name, eventTypes, severityThreshold, notifications) => ({
    name,
    description: `Alert rule for ${eventTypes.join(', ')} events`,
    enabled: true,
    conditions: {
        event_types: eventTypes,
        severity_threshold: severityThreshold,
        source_systems: []
    },
    actions: {
        notifications
    },
    created_by: 'system'
});
export const createCriticalSecurityAlertRule = (notifications) => ({
    name: 'Critical Security Events',
    description: 'Alert for all critical security events',
    enabled: true,
    conditions: {
        event_types: ['security_breach', 'data_leak', 'unauthorized_access'],
        severity_threshold: 'critical',
        source_systems: []
    },
    actions: {
        notifications,
        escalation: {
            trigger_after: 300000, // 5 minutes
            escalate_to: ['security-team@company.com', 'incident-commander@company.com'],
            escalation_message: 'Critical security event requires immediate attention',
            auto_assign: true
        },
        automation: [
            {
                type: 'block_ip',
                parameters: { duration: 3600000 }, // 1 hour
                confirmation_required: false,
                timeout: 3600000
            }
        ]
    },
    created_by: 'system'
});
export const createPerformanceAlertRule = (notifications) => ({
    name: 'Performance Degradation',
    description: 'Alert for performance-related issues',
    enabled: true,
    conditions: {
        event_types: ['system_failure', 'anomaly_detected'],
        severity_threshold: 'medium',
        source_systems: ['api-gateway', 'database', 'cache-layer'],
        frequency_threshold: {
            count: 3,
            time_window: 300000 // 5 minutes
        }
    },
    actions: {
        notifications,
        escalation: {
            trigger_after: 900000, // 15 minutes
            escalate_to: ['devops-team@company.com'],
            auto_assign: false
        }
    },
    suppression: {
        duplicate_window: 600000, // 10 minutes
        similar_event_threshold: 0.8
    },
    created_by: 'system'
});
// Security event severity mapping utilities
export const mapThreatLevelToSeverity = (threatLevel) => {
    if (threatLevel >= 8)
        return 'critical';
    if (threatLevel >= 6)
        return 'high';
    if (threatLevel >= 3)
        return 'medium';
    return 'low';
};
export const calculateRiskScore = (event, historicalData) => {
    let score = 0;
    // Base severity score
    const severityScores = { low: 1, medium: 3, high: 6, critical: 10 };
    score += severityScores[event.severity];
    // Impact multipliers
    if (event.details.affected_users && event.details.affected_users.length > 0) {
        score *= 1 + (event.details.affected_users.length / 100);
    }
    if (event.details.affected_systems && event.details.affected_systems.length > 1) {
        score *= 1.5;
    }
    // Historical pattern analysis
    if (historicalData) {
        const recentSimilarEvents = historicalData.filter(e => e.type === event.type &&
            e.source === event.source &&
            Date.now() - e.timestamp < 86400000 // Last 24 hours
        );
        if (recentSimilarEvents.length > 3) {
            score *= 2; // Pattern indicates potential attack
        }
    }
    return Math.min(score, 100); // Cap at 100
};
export const generateSecurityReport = (events, timeRange) => {
    const filteredEvents = events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
    const criticalEvents = filteredEvents.filter(e => e.severity === 'critical');
    const resolvedEvents = filteredEvents.filter(e => e.status === 'resolved');
    const responseTimesMs = resolvedEvents
        .filter(e => e.resolution)
        .map(e => (e.resolution.resolved_at - e.timestamp));
    const avgResponseTime = responseTimesMs.length > 0
        ? responseTimesMs.reduce((sum, time) => sum + time, 0) / responseTimesMs.length
        : 0;
    // Count by type
    const typeCounts = {};
    filteredEvents.forEach(e => {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    const topThreats = Object.entries(typeCounts)
        .map(([type, count]) => ({ type: type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    // Count by affected systems
    const systemCounts = {};
    filteredEvents.forEach(e => {
        e.details.affected_systems.forEach(system => {
            systemCounts[system] = (systemCounts[system] || 0) + 1;
        });
    });
    const affectedSystems = Object.entries(systemCounts)
        .map(([system, incident_count]) => ({ system, incident_count }))
        .sort((a, b) => b.incident_count - a.incident_count);
    // Generate recommendations
    const recommendations = [];
    if (criticalEvents.length > filteredEvents.length * 0.1) {
        recommendations.push('High number of critical events detected - review security posture');
    }
    if (avgResponseTime > 3600000) { // 1 hour
        recommendations.push('Average response time exceeds 1 hour - improve incident response procedures');
    }
    if (topThreats.length > 0 && topThreats[0].count > filteredEvents.length * 0.3) {
        recommendations.push(`${topThreats[0].type} events are dominant - focus prevention efforts here`);
    }
    const unresolvedCount = filteredEvents.filter(e => e.status !== 'resolved').length;
    if (unresolvedCount > filteredEvents.length * 0.2) {
        recommendations.push('High number of unresolved events - ensure adequate staffing');
    }
    return {
        summary: {
            total_events: filteredEvents.length,
            critical_count: criticalEvents.length,
            resolved_count: resolvedEvents.length,
            avg_response_time: avgResponseTime
        },
        top_threats: topThreats,
        affected_systems: affectedSystems,
        recommendations
    };
};
