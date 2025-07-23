/**
 * Security Event Policy Manager
 *
 * Advanced policy management system that integrates security event logging policies
 * with the existing PromptScape security infrastructure, providing centralized
 * policy enforcement, monitoring, and compliance management.
 */
import { SecurityEventType, SecurityEventSeverity, ComplianceFramework, securityEventPolicyEngine } from './SecurityEventLoggingPolicies';
import { auditManagementSystem } from '../audit/AuditManagementSystem';
import { AuditEventType, AuditSeverity, ComplianceFramework as AuditComplianceFramework } from '../audit/AuditManagementSystem';
/**
 * Advanced Security Event Policy Manager
 *
 * Provides centralized management of security event policies, enforcement,
 * monitoring, and integration with existing PromptScape infrastructure.
 */
export class SecurityEventPolicyManager {
    config;
    notificationChannels = new Map();
    policyMetrics = new Map();
    eventProcessingQueue = [];
    processingInProgress = false;
    constructor(config) {
        this.config = config;
        this.initializeNotificationChannels();
        this.startBatchProcessing();
    }
    /**
     * Initialize notification channels
     */
    initializeNotificationChannels() {
        // Email notification channel
        this.notificationChannels.set('email_security', {
            channel_id: 'email_security',
            channel_type: 'email',
            endpoint: 'security-team@promptscape.com',
            enabled: true,
            severity_filter: [SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL],
            rate_limit: {
                max_per_minute: 10,
                burst_limit: 20
            }
        });
        // Slack notification channel
        this.notificationChannels.set('slack_security', {
            channel_id: 'slack_security',
            channel_type: 'slack',
            endpoint: 'https://hooks.slack.com/services/security-alerts',
            credentials: {
                webhook_token: process.env.SLACK_WEBHOOK_TOKEN || ''
            },
            enabled: true,
            severity_filter: [SecurityEventSeverity.MEDIUM, SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL],
            rate_limit: {
                max_per_minute: 15,
                burst_limit: 30
            }
        });
        // SIEM integration channel
        this.notificationChannels.set('siem_integration', {
            channel_id: 'siem_integration',
            channel_type: 'siem',
            endpoint: process.env.SIEM_ENDPOINT || 'https://siem.promptscape.internal/api/events',
            credentials: {
                api_key: process.env.SIEM_API_KEY || '',
                tenant_id: process.env.SIEM_TENANT_ID || ''
            },
            enabled: this.config.integration_config.siem_integration_enabled,
            severity_filter: Object.values(SecurityEventSeverity),
            rate_limit: {
                max_per_minute: 100,
                burst_limit: 200
            }
        });
        // Dashboard notification channel
        this.notificationChannels.set('dashboard_alerts', {
            channel_id: 'dashboard_alerts',
            channel_type: 'dashboard',
            endpoint: '/api/security/dashboard/alerts',
            enabled: true,
            severity_filter: Object.values(SecurityEventSeverity)
        });
        // SMS notification channel for critical events
        this.notificationChannels.set('sms_critical', {
            channel_id: 'sms_critical',
            channel_type: 'sms',
            endpoint: process.env.SMS_SERVICE_ENDPOINT || '',
            credentials: {
                api_key: process.env.SMS_API_KEY || '',
                sender_id: process.env.SMS_SENDER_ID || 'PromptScape'
            },
            enabled: true,
            severity_filter: [SecurityEventSeverity.CRITICAL],
            rate_limit: {
                max_per_minute: 5,
                burst_limit: 10
            }
        });
    }
    /**
     * Process security event through policy engine
     */
    async processSecurityEvent(event) {
        const startTime = Date.now();
        const result = {
            event_id: event.event_id,
            policies_matched: [],
            actions_executed: [],
            notifications_sent: [],
            compliance_impact: [],
            escalations_triggered: [],
            automated_responses: [],
            processing_time_ms: 0,
            errors: []
        };
        try {
            // Process event through policy engine
            const policyResult = securityEventPolicyEngine.processSecurityEvent(event);
            result.policies_matched = policyResult.matched_policies;
            // Execute policy actions
            const actionResults = await this.executePolicyActions(event, policyResult);
            result.actions_executed = actionResults.actions;
            result.automated_responses = actionResults.automated_responses;
            // Send notifications
            const notificationResults = await this.sendNotifications(event, policyResult);
            result.notifications_sent = notificationResults;
            // Assess compliance impact
            const complianceImpact = await this.assessComplianceImpact(event, policyResult);
            result.compliance_impact = complianceImpact;
            // Handle escalations
            if (policyResult.escalation_required) {
                const escalations = await this.handleEscalations(event, policyResult);
                result.escalations_triggered = escalations;
            }
            // Integrate with existing audit system
            if (this.config.integration_config.audit_system_enabled) {
                await this.createAuditEvent(event, result);
            }
            // Update policy metrics
            this.updatePolicyMetrics(policyResult.matched_policies, result);
        }
        catch (error) {
            result.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
        result.processing_time_ms = Date.now() - startTime;
        return result;
    }
    /**
     * Execute policy-defined actions
     */
    async executePolicyActions(event, policyResult) {
        const actions = [];
        const automatedResponses = [];
        for (const actionType of policyResult.actions_triggered) {
            const action = {
                action_id: crypto.randomUUID(),
                action_type: this.categorizeAction(actionType),
                action_name: actionType,
                executed_at: new Date(),
                success: false,
                details: {}
            };
            try {
                switch (actionType) {
                    case 'block_ip':
                        const blockResult = await this.executeIpBlock(event.source_ip || '');
                        action.success = blockResult.success;
                        action.details = blockResult.details;
                        if (blockResult.success) {
                            automatedResponses.push({
                                response_id: crypto.randomUUID(),
                                response_type: 'ip_block',
                                executed_at: new Date(),
                                success: true,
                                details: blockResult.details,
                                rollback_available: true,
                                rollback_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                            });
                        }
                        break;
                    case 'lock_account':
                        const lockResult = await this.executeAccountLock(event.user_id || '');
                        action.success = lockResult.success;
                        action.details = lockResult.details;
                        break;
                    case 'preserve_evidence':
                        const preserveResult = await this.preserveEvidence(event);
                        action.success = preserveResult.success;
                        action.details = preserveResult.details;
                        break;
                    case 'isolate_network_segment':
                        const isolateResult = await this.isolateNetworkSegment(event.source_ip || '');
                        action.success = isolateResult.success;
                        action.details = isolateResult.details;
                        break;
                    default:
                        action.success = true;
                        action.details = { message: `Action ${actionType} logged but not implemented` };
                }
            }
            catch (error) {
                action.success = false;
                action.error_message = error instanceof Error ? error.message : 'Action execution failed';
            }
            actions.push(action);
        }
        return { actions, automated_responses };
    }
    /**
     * Send notifications through configured channels
     */
    async sendNotifications(event, policyResult) {
        const results = [];
        for (const channelType of policyResult.notifications_sent) {
            const channels = Array.from(this.notificationChannels.values())
                .filter(channel => channel.channel_type === channelType &&
                channel.enabled &&
                channel.severity_filter.includes(event.severity));
            for (const channel of channels) {
                const notificationResult = {
                    notification_id: crypto.randomUUID(),
                    channel_id: channel.channel_id,
                    channel_type: channel.channel_type,
                    recipient: channel.endpoint,
                    sent_at: new Date(),
                    success: false
                };
                try {
                    const sendResult = await this.sendNotification(channel, event);
                    notificationResult.success = sendResult.success;
                    notificationResult.delivery_status = sendResult.status;
                }
                catch (error) {
                    notificationResult.error_message = error instanceof Error ? error.message : 'Notification failed';
                }
                results.push(notificationResult);
            }
        }
        return results;
    }
    /**
     * Assess compliance impact of security event
     */
    async assessComplianceImpact(event, policyResult) {
        const complianceImpacts = [];
        for (const framework of policyResult.compliance_requirements) {
            const impact = {
                framework,
                requirement_ids: this.getFrameworkRequirements(framework, event),
                impact_level: this.calculateImpactLevel(event, framework),
                notification_required: event.requires_notification,
                external_notification_required: this.requiresExternalNotification(event, framework)
            };
            // Set reporting deadline based on framework requirements
            if (framework === ComplianceFramework.GDPR && impact.external_notification_required) {
                impact.reporting_deadline = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
            }
            else if (framework === ComplianceFramework.CCPA && impact.external_notification_required) {
                impact.reporting_deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            }
            complianceImpacts.push(impact);
        }
        return complianceImpacts;
    }
    /**
     * Handle event escalations
     */
    async handleEscalations(event, policyResult) {
        const escalations = [];
        // Escalate based on severity
        if (event.severity === SecurityEventSeverity.CRITICAL) {
            escalations.push('ciso_immediate');
            escalations.push('incident_response_team');
        }
        else if (event.severity === SecurityEventSeverity.HIGH) {
            escalations.push('security_manager');
            escalations.push('on_call_analyst');
        }
        // Escalate based on compliance requirements
        if (event.compliance_frameworks.includes(ComplianceFramework.SOX)) {
            escalations.push('compliance_officer');
        }
        if (event.compliance_frameworks.includes(ComplianceFramework.GDPR) && event.requires_notification) {
            escalations.push('data_protection_officer');
        }
        // Execute escalations
        for (const escalation of escalations) {
            await this.executeEscalation(escalation, event);
        }
        return escalations;
    }
    /**
     * Create corresponding audit event in existing audit system
     */
    async createAuditEvent(securityEvent, enforcementResult) {
        try {
            // Map security event to audit event
            const auditEvent = auditManagementSystem.createAuditEvent({
                event_type: this.mapToAuditEventType(securityEvent.event_type),
                severity: this.mapToAuditSeverity(securityEvent.severity),
                title: `Security Policy Violation: ${securityEvent.title}`,
                description: securityEvent.description,
                category: 'security_policy',
                subcategory: securityEvent.category,
                user_id: securityEvent.user_id,
                ip_address: securityEvent.source_ip,
                system_component: securityEvent.system_component,
                risk_score: securityEvent.threat_level,
                risk_factors: securityEvent.indicators,
                compliance_frameworks: this.mapComplianceFrameworks(securityEvent.compliance_frameworks),
                regulatory_impact: securityEvent.regulatory_impact,
                sensitive_data_involved: securityEvent.evidence_preserved,
                tags: securityEvent.tags,
                metadata: {
                    security_event_id: securityEvent.event_id,
                    policies_matched: enforcementResult.policies_matched,
                    actions_executed: enforcementResult.actions_executed.length,
                    automated_responses: enforcementResult.automated_responses.length,
                    processing_time_ms: enforcementResult.processing_time_ms
                },
                alert_triggered: true,
                notification_sent: enforcementResult.notifications_sent.length > 0,
                escalation_level: this.calculateEscalationLevel(securityEvent.severity),
                status: this.mapToAuditStatus(securityEvent.status)
            });
            console.log(`Created audit event ${auditEvent.id} for security event ${securityEvent.event_id}`);
        }
        catch (error) {
            console.error('Failed to create audit event:', error);
        }
    }
    /**
     * Update policy performance metrics
     */
    updatePolicyMetrics(matchedPolicies, result) {
        for (const policyId of matchedPolicies) {
            let metrics = this.policyMetrics.get(policyId);
            if (!metrics) {
                metrics = {
                    policy_id: policyId,
                    events_processed: 0,
                    actions_triggered: 0,
                    false_positives: 0,
                    true_positives: 0,
                    response_time_avg_ms: 0,
                    escalations_count: 0,
                    compliance_violations: 0,
                    effectiveness_score: 100,
                    last_updated: new Date()
                };
            }
            // Update metrics
            metrics.events_processed++;
            metrics.actions_triggered += result.actions_executed.length;
            metrics.escalations_count += result.escalations_triggered.length;
            metrics.compliance_violations += result.compliance_impact.length;
            // Update average response time
            const totalTime = (metrics.response_time_avg_ms * (metrics.events_processed - 1)) + result.processing_time_ms;
            metrics.response_time_avg_ms = totalTime / metrics.events_processed;
            metrics.last_updated = new Date();
            this.policyMetrics.set(policyId, metrics);
        }
    }
    /**
     * Start batch processing for queued events
     */
    startBatchProcessing() {
        if (!this.config.real_time_processing) {
            setInterval(async () => {
                await this.processBatchEvents();
            }, this.config.batch_processing_interval);
        }
    }
    /**
     * Process queued events in batch
     */
    async processBatchEvents() {
        if (this.processingInProgress || this.eventProcessingQueue.length === 0) {
            return;
        }
        this.processingInProgress = true;
        try {
            const batchSize = Math.min(this.config.max_event_batch_size, this.eventProcessingQueue.length);
            const batch = this.eventProcessingQueue.splice(0, batchSize);
            const promises = batch.map(event => this.processSecurityEvent(event));
            await Promise.all(promises);
            console.log(`Processed batch of ${batch.length} security events`);
        }
        catch (error) {
            console.error('Batch processing failed:', error);
        }
        finally {
            this.processingInProgress = false;
        }
    }
    // Helper methods for action execution
    async executeIpBlock(ip) {
        // Implementation would integrate with firewall/WAF
        return { success: true, details: { blocked_ip: ip, duration: '24h' } };
    }
    async executeAccountLock(userId) {
        // Implementation would integrate with identity management system
        return { success: true, details: { locked_user: userId, duration: '1h' } };
    }
    async preserveEvidence(event) {
        // Implementation would capture relevant logs, network traffic, etc.
        return {
            success: true,
            details: {
                evidence_id: crypto.randomUUID(),
                preservation_timestamp: new Date().toISOString(),
                evidence_types: ['logs', 'network_traffic', 'system_state']
            }
        };
    }
    async isolateNetworkSegment(ip) {
        // Implementation would integrate with network infrastructure
        return { success: true, details: { isolated_segment: ip, isolation_time: new Date().toISOString() } };
    }
    async sendNotification(channel, event) {
        // Implementation would integrate with various notification services
        return { success: true, status: 'delivered' };
    }
    async executeEscalation(escalationType, event) {
        // Implementation would trigger escalation procedures
        console.log(`Executing escalation: ${escalationType} for event ${event.event_id}`);
    }
    // Utility mapping methods
    categorizeAction(actionType) {
        const actionMap = {
            'block_ip': 'containment',
            'lock_account': 'containment',
            'preserve_evidence': 'documentation',
            'generate_alert': 'notification',
            'notify_security_team': 'escalation',
            'initiate_investigation': 'analysis'
        };
        return actionMap[actionType] || 'documentation';
    }
    mapToAuditEventType(securityEventType) {
        const typeMap = {
            [SecurityEventType.AUTHENTICATION_FAILURE]: AuditEventType.AUTHENTICATION,
            [SecurityEventType.AUTHORIZATION_VIOLATION]: AuditEventType.AUTHORIZATION,
            [SecurityEventType.CODE_INJECTION_ATTEMPT]: AuditEventType.SECURITY_INCIDENT,
            [SecurityEventType.NETWORK_INTRUSION_ATTEMPT]: AuditEventType.SECURITY_INCIDENT,
            [SecurityEventType.SOX_ITGC_VIOLATION]: AuditEventType.COMPLIANCE_CHECK,
            [SecurityEventType.GDPR_DATA_SUBJECT_REQUEST]: AuditEventType.COMPLIANCE_CHECK
            // Add more mappings as needed
        };
        return typeMap[securityEventType] || AuditEventType.SECURITY_INCIDENT;
    }
    mapToAuditSeverity(securitySeverity) {
        const severityMap = {
            [SecurityEventSeverity.CRITICAL]: AuditSeverity.CRITICAL,
            [SecurityEventSeverity.HIGH]: AuditSeverity.HIGH,
            [SecurityEventSeverity.MEDIUM]: AuditSeverity.MEDIUM,
            [SecurityEventSeverity.LOW]: AuditSeverity.LOW,
            [SecurityEventSeverity.INFO]: AuditSeverity.LOW
        };
        return severityMap[securitySeverity];
    }
    mapComplianceFrameworks(securityFrameworks) {
        const frameworkMap = {
            [ComplianceFramework.SOX]: AuditComplianceFramework.SOX,
            [ComplianceFramework.GDPR]: AuditComplianceFramework.GDPR,
            [ComplianceFramework.CCPA]: AuditComplianceFramework.CCPA,
            [ComplianceFramework.HIPAA]: AuditComplianceFramework.HIPAA,
            [ComplianceFramework.ISO27001]: AuditComplianceFramework.ISO27001
            // Map other frameworks as available
        };
        return securityFrameworks.map(f => frameworkMap[f]).filter(Boolean);
    }
    mapToAuditStatus(securityStatus) {
        // Map security event status to audit status
        return 'ACTIVE'; // Default mapping
    }
    calculateEscalationLevel(severity) {
        const levelMap = {
            [SecurityEventSeverity.CRITICAL]: 5,
            [SecurityEventSeverity.HIGH]: 4,
            [SecurityEventSeverity.MEDIUM]: 3,
            [SecurityEventSeverity.LOW]: 2,
            [SecurityEventSeverity.INFO]: 1
        };
        return levelMap[severity];
    }
    getFrameworkRequirements(framework, event) {
        // Return relevant requirement IDs for the framework
        return [`${framework}_req_001`, `${framework}_req_002`];
    }
    calculateImpactLevel(event, framework) {
        if (event.severity === SecurityEventSeverity.CRITICAL)
            return 'critical';
        if (event.severity === SecurityEventSeverity.HIGH)
            return 'high';
        if (event.severity === SecurityEventSeverity.MEDIUM)
            return 'medium';
        return 'low';
    }
    requiresExternalNotification(event, framework) {
        return event.requires_notification &&
            (framework === ComplianceFramework.GDPR || framework === ComplianceFramework.CCPA);
    }
    /**
     * Public API methods
     */
    /**
     * Add security event to processing queue
     */
    queueSecurityEvent(event) {
        if (this.config.real_time_processing) {
            this.processSecurityEvent(event);
        }
        else {
            this.eventProcessingQueue.push(event);
        }
    }
    /**
     * Get policy performance metrics
     */
    getPolicyMetrics() {
        return Array.from(this.policyMetrics.values());
    }
    /**
     * Get notification channels
     */
    getNotificationChannels() {
        return Array.from(this.notificationChannels.values());
    }
    /**
     * Update notification channel
     */
    updateNotificationChannel(channelId, updates) {
        const channel = this.notificationChannels.get(channelId);
        if (!channel)
            return false;
        const updatedChannel = { ...channel, ...updates };
        this.notificationChannels.set(channelId, updatedChannel);
        return true;
    }
    /**
     * Generate policy effectiveness report
     */
    generatePolicyEffectivenessReport() {
        const metrics = Array.from(this.policyMetrics.values());
        const activePolicies = securityEventPolicyEngine.getPolicies().filter(p => p.enabled);
        const totalEventsProcessed = metrics.reduce((sum, m) => sum + m.events_processed, 0);
        const totalFalsePositives = metrics.reduce((sum, m) => sum + m.false_positives, 0);
        const totalComplianceViolations = metrics.reduce((sum, m) => sum + m.compliance_violations, 0);
        const avgResponseTime = metrics.reduce((sum, m) => sum + m.response_time_avg_ms, 0) / metrics.length || 0;
        const topPerforming = metrics
            .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
            .slice(0, 5);
        return {
            total_policies: securityEventPolicyEngine.getPolicies().length,
            active_policies: activePolicies.length,
            avg_response_time: avgResponseTime,
            total_events_processed: totalEventsProcessed,
            false_positive_rate: totalEventsProcessed > 0 ? (totalFalsePositives / totalEventsProcessed) * 100 : 0,
            compliance_violation_rate: totalEventsProcessed > 0 ? (totalComplianceViolations / totalEventsProcessed) * 100 : 0,
            top_performing_policies: topPerforming,
            recommendations: this.generatePolicyRecommendations(metrics)
        };
    }
    generatePolicyRecommendations(metrics) {
        const recommendations = [];
        const highResponseTime = metrics.filter(m => m.response_time_avg_ms > 5000);
        if (highResponseTime.length > 0) {
            recommendations.push('Consider optimizing policy detection rules for improved response time');
        }
        const highFalsePositives = metrics.filter(m => m.false_positives / m.events_processed > 0.1);
        if (highFalsePositives.length > 0) {
            recommendations.push('Review and tune detection rules to reduce false positive rates');
        }
        const lowEffectiveness = metrics.filter(m => m.effectiveness_score < 70);
        if (lowEffectiveness.length > 0) {
            recommendations.push('Evaluate and potentially disable or redesign low-performing policies');
        }
        return recommendations;
    }
}
// Default configuration
export const defaultPolicyManagerConfig = {
    enabled: true,
    real_time_processing: true,
    batch_processing_interval: 60000, // 1 minute
    max_event_batch_size: 100,
    retention_policy: {
        default_retention_days: 1095, // 3 years
        compliance_retention_overrides: {
            [ComplianceFramework.SOX]: 2555, // 7 years
            [ComplianceFramework.GDPR]: 2190, // 6 years
            [ComplianceFramework.CCPA]: 1095, // 3 years
            [ComplianceFramework.HIPAA]: 2190, // 6 years
            [ComplianceFramework.ISO27001]: 1095, // 3 years
            [ComplianceFramework.PCI_DSS]: 1095, // 3 years
            [ComplianceFramework.NIST]: 1095, // 3 years
            [ComplianceFramework.FERPA]: 2190, // 6 years
            [ComplianceFramework.GLBA]: 2190, // 6 years
            [ComplianceFramework.FEDRAMP]: 2190 // 6 years
        }
    },
    notification_config: {
        channels: [],
        escalation_delays: {
            [SecurityEventSeverity.CRITICAL]: 0, // Immediate
            [SecurityEventSeverity.HIGH]: 300000, // 5 minutes
            [SecurityEventSeverity.MEDIUM]: 900000, // 15 minutes
            [SecurityEventSeverity.LOW]: 3600000, // 1 hour
            [SecurityEventSeverity.INFO]: 7200000 // 2 hours
        },
        retry_attempts: 3
    },
    integration_config: {
        audit_system_enabled: true,
        siem_integration_enabled: true,
        compliance_reporting_enabled: true
    }
};
// Global security event policy manager instance
export const securityEventPolicyManager = new SecurityEventPolicyManager(defaultPolicyManagerConfig);
// Utility functions for common operations
export export const queueSecurityEvent = (event) => securityEventPolicyManager.queueSecurityEvent(event);
export default SecurityEventPolicyManager;
