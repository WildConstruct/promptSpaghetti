/**
 * Cross-System Alerting and Notification System
 * Epic 31 - Security Integration Framework
 *
 * Unified alerting system for security events across all analytics and monitoring systems
 */
export class CrossSystemAlertingSystem {
    config;
    alertRules = new Map();
    activeAlerts = new Map();
    eventHistory = [];
    alertMetrics;
    notificationQueue = [];
    processingTimer;
    escalationTimers = new Map();
    constructor(config) {
        this.config = config;
        this.alertMetrics = this.initializeMetrics();
        this.startProcessing();
    }
    // Event ingestion and processing
    async ingestSecurityEvent(event) {
        // Validate and enrich event
        const enrichedEvent = await this.enrichEvent(event);
        // Store event in history
        this.eventHistory.push(enrichedEvent);
        // Update metrics
        this.updateMetrics(enrichedEvent);
        // Process against alert rules
        await this.processEventAgainstRules(enrichedEvent);
        // Cleanup old events
        this.cleanupOldEvents();
    }
    async processEventAgainstRules(event) {
        const matchingRules = this.findMatchingRules(event);
        for (const rule of matchingRules) {
            if (!rule.enabled)
                continue;
            // Check for suppression
            if (await this.shouldSuppressAlert(event, rule)) {
                continue;
            }
            // Create or update alert
            const alertId = this.generateAlertId(event, rule);
            if (this.activeAlerts.has(alertId)) {
                // Update existing alert
                const existingAlert = this.activeAlerts.get(alertId);
                existingAlert.metadata.related_events = existingAlert.metadata.related_events || [];
                existingAlert.metadata.related_events.push(event.id);
            }
            else {
                // Create new alert
                event.status = 'active';
                this.activeAlerts.set(alertId, event);
                // Queue for notification
                this.notificationQueue.push({
                    alert: event,
                    rule,
                    timestamp: Date.now()
                });
                // Setup escalation if configured
                if (rule.actions.escalation) {
                    this.setupEscalation(alertId, rule.actions.escalation);
                }
                // Execute automation actions
                if (rule.actions.automation) {
                    await this.executeAutomationActions(event, rule.actions.automation);
                }
            }
        }
    }
    // Alert rule management
    createAlertRule(rule) {
        const ruleId = this.generateRuleId();
        const fullRule = {
            ...rule,
            id: ruleId,
            created_at: Date.now(),
            last_modified: Date.now()
        };
        this.alertRules.set(ruleId, fullRule);
        return ruleId;
    }
    updateAlertRule(ruleId, updates) {
        const rule = this.alertRules.get(ruleId);
        if (!rule)
            return false;
        const updatedRule = {
            ...rule,
            ...updates,
            id: ruleId, // Ensure ID doesn't change
            last_modified: Date.now()
        };
        this.alertRules.set(ruleId, updatedRule);
        return true;
    }
    deleteAlertRule(ruleId) {
        return this.alertRules.delete(ruleId);
    }
    getAlertRule(ruleId) {
        return this.alertRules.get(ruleId) || null;
    }
    getAllAlertRules() {
        return Array.from(this.alertRules.values());
    }
    // Alert management
    getActiveAlerts(filters) {
        let alerts = Array.from(this.activeAlerts.values());
        if (filters) {
            if (filters.severity) {
                alerts = alerts.filter(alert => alert.severity === filters.severity);
            }
            if (filters.type) {
                alerts = alerts.filter(alert => alert.type === filters.type);
            }
            if (filters.source) {
                alerts = alerts.filter(alert => alert.source === filters.source);
            }
            if (filters.status) {
                alerts = alerts.filter(alert => alert.status === filters.status);
            }
        }
        return alerts.sort((a, b) => {
            // Sort by severity first, then by timestamp
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (severityDiff !== 0)
                return severityDiff;
            return b.timestamp - a.timestamp;
        });
    }
    async acknowledgeAlert(alertId, userId) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert)
            return false;
        alert.status = 'investigating';
        alert.assigned_to = userId;
        // Cancel escalation timer
        const escalationTimer = this.escalationTimers.get(alertId);
        if (escalationTimer) {
            clearTimeout(escalationTimer);
            this.escalationTimers.delete(alertId);
        }
        return true;
    }
    async resolveAlert(alertId, resolution) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert)
            return false;
        alert.status = 'resolved';
        alert.resolution = {
            ...resolution,
            resolved_at: Date.now()
        };
        // Remove from active alerts after a delay (for audit purposes)
        setTimeout(() => {
            this.activeAlerts.delete(alertId);
        }, 24 * 60 * 60 * 1000); // 24 hours
        return true;
    }
    async escalateAlert(alertId, escalatedBy) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert)
            return false;
        alert.status = 'escalated';
        // Send escalation notifications
        await this.sendEscalationNotifications(alert, escalatedBy);
        return true;
    }
    // Notification system
    async sendNotification(alert, action) {
        try {
            // Check rate limits
            if (await this.isRateLimited(action)) {
                console.warn(`Rate limit exceeded for notification action: ${action.type}`);
                return false;
            }
            // Format message
            const message = await this.formatNotificationMessage(alert, action);
            // Send based on type
            switch (action.type) {
                case 'email':
                    return await this.sendEmailNotification(action.target, message, alert);
                case 'sms':
                    return await this.sendSMSNotification(action.target, message);
                case 'slack':
                    return await this.sendSlackNotification(action.target, message, alert);
                case 'webhook':
                    return await this.sendWebhookNotification(action.target, alert);
                case 'pagerduty':
                    return await this.sendPagerDutyNotification(action.target, alert);
                case 'teams':
                    return await this.sendTeamsNotification(action.target, message, alert);
                case 'discord':
                    return await this.sendDiscordNotification(action.target, message, alert);
                default:
                    console.error(`Unknown notification type: ${action.type}`);
                    return false;
            }
        }
        catch (error) {
            console.error(`Failed to send notification:`, error);
            return false;
        }
    }
    // Metrics and reporting
    getAlertMetrics(timeRange) {
        if (timeRange) {
            return this.calculateMetricsForTimeRange(timeRange);
        }
        return { ...this.alertMetrics };
    }
    generateSecurityReport(timeRange) {
        const events = this.eventHistory.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
        const criticalAlerts = events.filter(e => e.severity === 'critical');
        const resolvedAlerts = events.filter(e => e.status === 'resolved' && e.resolution);
        const avgResponseTime = resolvedAlerts.length > 0
            ? resolvedAlerts.reduce((sum, alert) => {
                const responseTime = (alert.resolution?.resolved_at || 0) - alert.timestamp;
                return sum + responseTime;
            }, 0) / resolvedAlerts.length
            : 0;
        // Generate daily counts
        const dailyCounts = this.generateDailyAlertCounts(events, timeRange);
        const topSources = this.getTopAlertSources(events);
        const responseTimeTrend = this.generateResponseTimeTrend(resolvedAlerts, timeRange);
        return {
            summary: {
                total_events: events.length,
                critical_alerts: criticalAlerts.length,
                avg_response_time: avgResponseTime,
                false_positive_rate: this.calculateFalsePositiveRate(events)
            },
            trends: {
                daily_alert_counts: dailyCounts,
                top_alert_sources: topSources,
                response_time_trend: responseTimeTrend
            },
            recommendations: this.generateRecommendations(events)
        };
    }
    // Private helper methods
    async enrichEvent(event) {
        const enriched = { ...event };
        // Add correlation ID if not present
        if (!enriched.metadata.correlation_id) {
            enriched.metadata.correlation_id = this.generateCorrelationId();
        }
        // Enhance with threat intelligence
        enriched.metadata.threat_level = await this.calculateThreatLevel(event);
        enriched.metadata.confidence_score = await this.calculateConfidenceScore(event);
        // Add geographic enrichment for IP addresses
        if (event.details.ip_addresses && event.details.ip_addresses.length > 0) {
            enriched.details.geographic_location = await this.enrichWithGeolocation(event.details.ip_addresses[0]);
        }
        return enriched;
    }
    findMatchingRules(event) {
        const matchingRules = [];
        for (const rule of this.alertRules.values()) {
            if (this.doesEventMatchRule(event, rule)) {
                matchingRules.push(rule);
            }
        }
        return matchingRules;
    }
    doesEventMatchRule(event, rule) {
        const { conditions } = rule;
        // Check event type
        if (conditions.event_types.length > 0 && !conditions.event_types.includes(event.type)) {
            return false;
        }
        // Check severity threshold
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        if (severityOrder[event.severity] < severityOrder[conditions.severity_threshold]) {
            return false;
        }
        // Check source systems
        if (conditions.source_systems.length > 0 && !conditions.source_systems.includes(event.source)) {
            return false;
        }
        // Check custom conditions
        if (conditions.custom_conditions) {
            for (const condition of conditions.custom_conditions) {
                if (!this.evaluateCustomCondition(event, condition)) {
                    return false;
                }
            }
        }
        // Check frequency threshold
        if (conditions.frequency_threshold) {
            const recentSimilarEvents = this.getRecentSimilarEvents(event, conditions.frequency_threshold.time_window);
            if (recentSimilarEvents.length < conditions.frequency_threshold.count) {
                return false;
            }
        }
        return true;
    }
    evaluateCustomCondition(event, condition) {
        const fieldValue = this.getNestedFieldValue(event, condition.field);
        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case 'contains':
                return String(fieldValue).includes(String(condition.value));
            case 'greater_than':
                return Number(fieldValue) > Number(condition.value);
            case 'less_than':
                return Number(fieldValue) < Number(condition.value);
            case 'matches_regex':
                return new RegExp(condition.value).test(String(fieldValue));
            default:
                return false;
        }
    }
    getNestedFieldValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    async shouldSuppressAlert(event, rule) {
        if (!rule.suppression)
            return false;
        const now = Date.now();
        const suppressionWindow = rule.suppression.duplicate_window;
        // Check for recent similar alerts
        const recentSimilarAlerts = Array.from(this.activeAlerts.values()).filter(alert => {
            const timeDiff = now - alert.timestamp;
            return (timeDiff <= suppressionWindow &&
                alert.type === event.type &&
                alert.source === event.source &&
                this.calculateEventSimilarity(alert, event) >= rule.suppression.similar_event_threshold);
        });
        return recentSimilarAlerts.length > 0;
    }
    calculateEventSimilarity(event1, event2) {
        let similarity = 0;
        let factors = 0;
        // Type similarity
        if (event1.type === event2.type)
            similarity += 0.3;
        factors += 0.3;
        // Source similarity
        if (event1.source === event2.source)
            similarity += 0.2;
        factors += 0.2;
        // Severity similarity
        if (event1.severity === event2.severity)
            similarity += 0.1;
        factors += 0.1;
        // Details similarity (simplified)
        const commonIPs = event1.details.ip_addresses?.filter(ip => event2.details.ip_addresses?.includes(ip)).length || 0;
        if (commonIPs > 0)
            similarity += 0.2;
        factors += 0.2;
        // User similarity
        const commonUsers = event1.details.affected_users?.filter(user => event2.details.affected_users?.includes(user)).length || 0;
        if (commonUsers > 0)
            similarity += 0.2;
        factors += 0.2;
        return factors > 0 ? similarity / factors : 0;
    }
    setupEscalation(alertId, escalation) {
        const timer = setTimeout(async () => {
            const alert = this.activeAlerts.get(alertId);
            if (alert && alert.status === 'active') {
                await this.escalateAlert(alertId, 'system');
            }
            this.escalationTimers.delete(alertId);
        }, escalation.trigger_after);
        this.escalationTimers.set(alertId, timer);
    }
    async executeAutomationActions(event, actions) {
        for (const action of actions) {
            try {
                if (action.confirmation_required) {
                    // Queue for manual confirmation
                    continue;
                }
                await this.executeAutomationAction(event, action);
                // Set auto-revert timer if specified
                if (action.timeout) {
                    setTimeout(async () => {
                        await this.revertAutomationAction(event, action);
                    }, action.timeout);
                }
            }
            catch (error) {
                console.error(`Failed to execute automation action ${action.type}:`, error);
            }
        }
    }
    async executeAutomationAction(event, action) {
        // This would integrate with actual security systems
        console.log(`Executing automation action: ${action.type}`, action.parameters);
        // Implementation would depend on the specific action type
        switch (action.type) {
            case 'block_ip':
                // Integration with firewall/WAF
                break;
            case 'disable_user':
                // Integration with identity management system
                break;
            case 'quarantine_system':
                // Integration with infrastructure management
                break;
            // ... other action types
        }
    }
    async revertAutomationAction(event, action) {
        console.log(`Auto-reverting action: ${action.type}`, action.parameters);
        // Implementation for reverting actions
    }
    startProcessing() {
        if (this.config.enabled) {
            this.processingTimer = setInterval(() => {
                this.processNotificationQueue();
            }, 5000); // Process every 5 seconds
        }
    }
    async processNotificationQueue() {
        if (this.notificationQueue.length === 0)
            return;
        const now = Date.now();
        const batch = this.config.notification_settings.batch_notifications
            ? this.getBatchedNotifications()
            : this.notificationQueue.splice(0, 10); // Process up to 10 at a time
        for (const item of batch) {
            // Check quiet hours
            if (this.isInQuietHours(now)) {
                // Re-queue for later unless critical
                if (item.alert.severity !== 'critical') {
                    continue;
                }
            }
            // Send notifications for this alert
            for (const notificationAction of item.rule.actions.notifications) {
                await this.sendNotification(item.alert, notificationAction);
            }
        }
    }
    getBatchedNotifications() {
        // Simple batching - group by severity and send together
        const batch = this.notificationQueue.splice(0, 50);
        return batch;
    }
    isInQuietHours(timestamp) {
        const quietHours = this.config.notification_settings.quiet_hours;
        if (!quietHours)
            return false;
        const date = new Date(timestamp);
        const currentHour = date.getHours();
        const currentMinute = date.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const [startHour, startMinute] = quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = quietHours.end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        }
        else {
            // Crosses midnight
            return currentTime >= startTime || currentTime <= endTime;
        }
    }
    async formatNotificationMessage(alert, action) {
        if (action.template) {
            // Use custom template
            return this.renderTemplate(action.template, alert);
        }
        // Default message format
        return `🚨 Security Alert: ${alert.title}
    
Severity: ${alert.severity.toUpperCase()}
Type: ${alert.type}
Source: ${alert.source}
Time: ${new Date(alert.timestamp).toISOString()}

Description: ${alert.description}

Affected Systems: ${alert.details.affected_systems.join(', ')}
${alert.details.ip_addresses ? `IP Addresses: ${alert.details.ip_addresses.join(', ')}` : ''}

Alert ID: ${alert.id}`;
    }
    renderTemplate(template, alert) {
        return template
            .replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const value = this.getNestedFieldValue(alert, path);
            return value !== undefined ? String(value) : match;
        });
    }
    // Notification method implementations (simplified)
    async sendEmailNotification(to, message, alert) {
        console.log(`Sending email to ${to}:`, message);
        return true; // Would integrate with actual email service
    }
    async sendSMSNotification(to, message) {
        console.log(`Sending SMS to ${to}:`, message);
        return true; // Would integrate with SMS service
    }
    async sendSlackNotification(channel, message, alert) {
        console.log(`Sending Slack message to ${channel}:`, message);
        return true; // Would integrate with Slack API
    }
    async sendWebhookNotification(url, alert) {
        console.log(`Sending webhook to ${url}:`, alert);
        return true; // Would make HTTP request
    }
    async sendPagerDutyNotification(integrationKey, alert) {
        console.log(`Sending PagerDuty alert:`, alert);
        return true; // Would integrate with PagerDuty API
    }
    async sendTeamsNotification(webhook, message, alert) {
        console.log(`Sending Teams message:`, message);
        return true; // Would integrate with Teams API
    }
    async sendDiscordNotification(webhook, message, alert) {
        console.log(`Sending Discord message:`, message);
        return true; // Would integrate with Discord API
    }
    async sendEscalationNotifications(alert, escalatedBy) {
        // Send escalation notifications to higher-level personnel
        console.log(`Alert ${alert.id} escalated by ${escalatedBy}`);
    }
    async isRateLimited(action) {
        // Simple rate limiting implementation
        return false; // Would implement actual rate limiting
    }
    initializeMetrics() {
        return {
            total_alerts: 0,
            alerts_by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
            alerts_by_type: {
                security_breach: 0,
                anomaly_detected: 0,
                policy_violation: 0,
                system_failure: 0,
                suspicious_activity: 0,
                data_leak: 0,
                unauthorized_access: 0
            },
            alerts_by_source: {},
            response_times: {
                mean_acknowledgment_time: 0,
                mean_resolution_time: 0,
                p95_response_time: 0
            },
            escalation_stats: {
                total_escalations: 0,
                escalation_rate: 0
            },
            false_positive_rate: 0,
            time_range: {
                start: Date.now(),
                end: Date.now()
            }
        };
    }
    updateMetrics(event) {
        this.alertMetrics.total_alerts++;
        this.alertMetrics.alerts_by_severity[event.severity]++;
        this.alertMetrics.alerts_by_type[event.type]++;
        if (!this.alertMetrics.alerts_by_source[event.source]) {
            this.alertMetrics.alerts_by_source[event.source] = 0;
        }
        this.alertMetrics.alerts_by_source[event.source]++;
    }
    calculateMetricsForTimeRange(timeRange) {
        const events = this.eventHistory.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
        const metrics = this.initializeMetrics();
        metrics.time_range = timeRange;
        for (const event of events) {
            metrics.total_alerts++;
            metrics.alerts_by_severity[event.severity]++;
            metrics.alerts_by_type[event.type]++;
            if (!metrics.alerts_by_source[event.source]) {
                metrics.alerts_by_source[event.source] = 0;
            }
            metrics.alerts_by_source[event.source]++;
        }
        return metrics;
    }
    cleanupOldEvents() {
        const cutoffTime = Date.now() - (this.config.retention.events_retention_days * 24 * 60 * 60 * 1000);
        this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoffTime);
    }
    getRecentSimilarEvents(event, timeWindow) {
        const cutoffTime = Date.now() - timeWindow;
        return this.eventHistory.filter(e => e.timestamp > cutoffTime &&
            e.type === event.type &&
            e.source === event.source);
    }
    generateRuleId() {
        return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateAlertId(event, rule) {
        return `alert_${event.id}_${rule.id}`;
    }
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async calculateThreatLevel(event) {
        // Simplified threat level calculation
        const severityScores = { low: 2, medium: 4, high: 7, critical: 10 };
        return severityScores[event.severity];
    }
    async calculateConfidenceScore(event) {
        // Simplified confidence calculation
        return event.metadata.auto_detected ? 0.8 : 0.95;
    }
    async enrichWithGeolocation(ipAddress) {
        // Simplified geolocation enrichment
        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown'
        };
    }
    generateDailyAlertCounts(events, timeRange) {
        const dailyCounts = {};
        for (const event of events) {
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
        return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
    }
    getTopAlertSources(events) {
        const sourceCounts = {};
        for (const event of events) {
            sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
        }
        return Object.entries(sourceCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    generateResponseTimeTrend(resolvedAlerts, timeRange) {
        const dailyResponseTimes = {};
        for (const alert of resolvedAlerts) {
            if (alert.resolution) {
                const date = new Date(alert.timestamp).toISOString().split('T')[0];
                const responseTime = alert.resolution.resolved_at - alert.timestamp;
                if (!dailyResponseTimes[date]) {
                    dailyResponseTimes[date] = [];
                }
                dailyResponseTimes[date].push(responseTime);
            }
        }
        return Object.entries(dailyResponseTimes).map(([date, times]) => ({
            date,
            avg_response_time: times.reduce((sum, time) => sum + time, 0) / times.length
        }));
    }
    calculateFalsePositiveRate(events) {
        const resolvedEvents = events.filter(e => e.status === 'resolved');
        if (resolvedEvents.length === 0)
            return 0;
        const falsePositives = resolvedEvents.filter(e => e.resolution?.notes.toLowerCase().includes('false positive'));
        return falsePositives.length / resolvedEvents.length;
    }
    generateRecommendations(events) {
        const recommendations = [];
        // High volume recommendations
        if (events.length > 1000) {
            recommendations.push('Consider implementing more specific alert rules to reduce noise');
        }
        // High false positive rate
        const falsePositiveRate = this.calculateFalsePositiveRate(events);
        if (falsePositiveRate > 0.2) {
            recommendations.push('High false positive rate detected - review and tune alert rules');
        }
        // Frequent sources
        const topSources = this.getTopAlertSources(events);
        if (topSources.length > 0 && topSources[0].count > events.length * 0.3) {
            recommendations.push(`Consider investigating ${topSources[0].source} as it generates ${Math.round(topSources[0].count / events.length * 100)}% of alerts`);
        }
        return recommendations;
    }
    destroy() {
        if (this.processingTimer) {
            clearInterval(this.processingTimer);
        }
        // Clear all escalation timers
        for (const timer of this.escalationTimers.values()) {
            clearTimeout(timer);
        }
        this.alertRules.clear();
        this.activeAlerts.clear();
        this.eventHistory = [];
        this.notificationQueue = [];
        this.escalationTimers.clear();
    }
}
export default CrossSystemAlertingSystem;
