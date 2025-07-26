/**
 * Analytics Event Adapters - Story 1.5 Task 2
 *
 * Adapters to integrate existing 12+ analytics systems with the unified event bus
 * while preserving their original functionality and data schemas.
 */
import { AnalyticsEventType, EventCategory, EventSeverity } from './UnifiedEventBus';
/**
 * Base Analytics Adapter
 *
 * Abstract base class for creating adapters for existing analytics systems
 */
export class BaseAnalyticsAdapter {
    eventBus;
    systemName;
    enabled = true;
    constructor(eventBus, systemName) {
        this.eventBus = eventBus;
        this.systemName = systemName;
    }
    /**
     * Publish event through unified bus
     */
    async publishEvent(legacyEvent) {
        if (!this.enabled)
            return null;
        try {
            const transformedEvent = this.transformEvent(legacyEvent);
            const { id, timestamp, ...eventWithoutIdAndTimestamp } = transformedEvent;
            return await this.eventBus.publishEvent({
                source: this.systemName,
                category: EventCategory.SYSTEM,
                severity: EventSeverity.INFO,
                type: AnalyticsEventType.INFO_EVENT,
                version: '1.0',
                environment: 'production',
                tags: ['adapter', this.systemName],
                data: {},
                metadata: {
                    originalSystem: this.systemName,
                    adaptedAt: Date.now()
                },
                ...eventWithoutIdAndTimestamp
            });
        }
        catch (error) {
            console.error(`[${this.systemName}] Failed to publish event:`, error);
            return null;
        }
    }
    /**
     * Enable/disable adapter
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Get adapter status
     */
    getStatus() {
        return {
            name: this.constructor.name,
            enabled: this.enabled,
            systemName: this.systemName
        };
    }
}
/**
 * Main Analytics Adapter
 *
 * Integrates the primary analytics system (/server/src/routes/analytics.ts)
 */
export class MainAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'main-analytics');
    }
    transformEvent(legacyEvent) {
        return {
            type: this.getEventType(legacyEvent.eventType),
            category: EventCategory.EXECUTION,
            severity: legacyEvent.success ? EventSeverity.INFO : EventSeverity.ERROR,
            sessionId: legacyEvent.sessionId,
            userId: legacyEvent.userId?.toString(),
            organizationId: legacyEvent.organizationId?.toString(),
            data: {
                executionId: legacyEvent.executionId,
                graphId: legacyEvent.graphId,
                nodeId: legacyEvent.nodeId,
                executionTime: legacyEvent.executionTimeMs,
                success: legacyEvent.success,
                errorMessage: legacyEvent.errorMessage,
                ...legacyEvent
            },
            metadata: {
                originalEventType: legacyEvent.eventType,
                cost: legacyEvent.estimatedCostUsd,
                tokens: legacyEvent.totalTokens
            }
        };
    }
    getEventType(legacyType) {
        switch (legacyType) {
            case 'graph_execution': return AnalyticsEventType.GRAPH_EXECUTION;
            case 'node_execution': return AnalyticsEventType.NODE_EXECUTION;
            case 'token_usage': return AnalyticsEventType.TOKEN_USAGE;
            case 'user_interaction': return AnalyticsEventType.USER_INTERACTION;
            case 'performance_metric': return AnalyticsEventType.PERFORMANCE_METRIC;
            default: return AnalyticsEventType.INFO_EVENT;
        }
    }
    // Main analytics integration methods
    async recordGraphExecution(execution) {
        return this.publishEvent({
            eventType: 'graph_execution',
            ...execution
        });
    }
    async recordNodeExecution(execution) {
        return this.publishEvent({
            eventType: 'node_execution',
            ...execution
        });
    }
    async recordTokenUsage(usage) {
        return this.publishEvent({
            eventType: 'token_usage',
            ...usage
        });
    }
    async recordUserInteraction(interaction) {
        return this.publishEvent({
            eventType: 'user_interaction',
            ...interaction
        });
    }
}
/**
 * Integration Analytics Adapter
 *
 * Integrates the integration analytics system (/server/src/routes/integration-analytics.ts)
 */
export class IntegrationAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'integration-analytics');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.INTEGRATION_EVENT,
            category: EventCategory.INTEGRATION,
            severity: legacyEvent.success ? EventSeverity.INFO : EventSeverity.ERROR,
            userId: legacyEvent.context?.userId,
            sessionId: legacyEvent.context?.sessionId,
            data: {
                integrationId: legacyEvent.integrationId,
                integrationType: legacyEvent.integrationType,
                integrationName: legacyEvent.integrationName,
                operation: legacyEvent.operation,
                responseTime: legacyEvent.responseTime,
                dataSize: legacyEvent.dataSize,
                success: legacyEvent.success,
                errorCode: legacyEvent.errorCode,
                errorMessage: legacyEvent.errorMessage,
                costData: legacyEvent.costData
            },
            metadata: {
                integrationVersion: legacyEvent.integrationVersion,
                endpoint: legacyEvent.operationDetails?.endpoint,
                method: legacyEvent.operationDetails?.method,
                environment: legacyEvent.context?.environment,
                region: legacyEvent.context?.region
            },
            tags: ['integration', legacyEvent.integrationType, legacyEvent.operation],
            environment: legacyEvent.context?.environment
        };
    }
    async recordIntegrationEvent(event) {
        return this.publishEvent(event);
    }
}
/**
 * Behavior Analytics Adapter
 *
 * Integrates behavior analytics system
 */
export class BehaviorAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'behavior-analytics');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.USER_BEHAVIOR,
            category: EventCategory.USER,
            severity: EventSeverity.INFO,
            userId: legacyEvent.userId,
            sessionId: legacyEvent.sessionId,
            data: {
                behaviorType: legacyEvent.behaviorType,
                action: legacyEvent.action,
                target: legacyEvent.target,
                duration: legacyEvent.duration,
                sequence: legacyEvent.sequence,
                ...legacyEvent
            },
            metadata: {
                userAgent: legacyEvent.userAgent,
                platform: legacyEvent.platform,
                viewport: legacyEvent.viewport
            },
            tags: ['behavior', legacyEvent.behaviorType, legacyEvent.action]
        };
    }
    async recordBehaviorEvent(event) {
        return this.publishEvent(event);
    }
}
/**
 * Performance Monitoring Adapter
 *
 * Integrates Epic 17 performance monitoring system
 */
export class PerformanceMonitoringAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'performance-monitoring');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.PERFORMANCE_METRIC,
            category: EventCategory.PERFORMANCE,
            severity: this.getPerformanceSeverity(legacyEvent),
            data: {
                metric: legacyEvent.metric,
                value: legacyEvent.value,
                unit: legacyEvent.unit,
                threshold: legacyEvent.threshold,
                nodeType: legacyEvent.nodeType,
                executionTime: legacyEvent.executionTime,
                memoryUsage: legacyEvent.memoryUsage,
                ...legacyEvent
            },
            metadata: {
                performanceCategory: legacyEvent.category,
                baseline: legacyEvent.baseline,
                trend: legacyEvent.trend
            },
            tags: ['performance', legacyEvent.metric, legacyEvent.nodeType]
        };
    }
    getPerformanceSeverity(event) {
        if (event.threshold && event.value > event.threshold * 2)
            return EventSeverity.CRITICAL;
        if (event.threshold && event.value > event.threshold)
            return EventSeverity.WARNING;
        return EventSeverity.INFO;
    }
    async recordPerformanceMetric(metric) {
        return this.publishEvent(metric);
    }
}
/**
 * Security Event Adapter
 *
 * Integrates security event monitoring system
 */
export class SecurityEventAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'security-events');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.SECURITY_EVENT,
            category: EventCategory.SECURITY,
            severity: this.getSecuritySeverity(legacyEvent.riskLevel),
            userId: legacyEvent.userId,
            sessionId: legacyEvent.sessionId,
            data: {
                eventType: legacyEvent.eventType,
                riskLevel: legacyEvent.riskLevel,
                source: legacyEvent.source,
                target: legacyEvent.target,
                action: legacyEvent.action,
                result: legacyEvent.result,
                ipAddress: legacyEvent.ipAddress,
                userAgent: legacyEvent.userAgent,
                ...legacyEvent
            },
            metadata: {
                ruleName: legacyEvent.ruleName,
                ruleId: legacyEvent.ruleId,
                confidence: legacyEvent.confidence,
                remediation: legacyEvent.remediation
            },
            tags: ['security', legacyEvent.eventType, legacyEvent.riskLevel]
        };
    }
    getSecuritySeverity(riskLevel) {
        switch (riskLevel?.toLowerCase()) {
            case 'critical': return EventSeverity.CRITICAL;
            case 'high': return EventSeverity.ERROR;
            case 'medium': return EventSeverity.WARNING;
            case 'low': return EventSeverity.INFO;
            default: return EventSeverity.INFO;
        }
    }
    async recordSecurityEvent(event) {
        return this.publishEvent(event);
    }
}
/**
 * Revenue Analytics Adapter
 *
 * Integrates revenue analytics system
 */
export class RevenueAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'revenue-analytics');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.REVENUE_EVENT,
            category: EventCategory.BUSINESS,
            severity: EventSeverity.INFO,
            userId: legacyEvent.userId,
            organizationId: legacyEvent.organizationId,
            data: {
                revenueType: legacyEvent.revenueType,
                amount: legacyEvent.amount,
                currency: legacyEvent.currency,
                transactionId: legacyEvent.transactionId,
                productId: legacyEvent.productId,
                planId: legacyEvent.planId,
                billingPeriod: legacyEvent.billingPeriod,
                ...legacyEvent
            },
            metadata: {
                paymentMethod: legacyEvent.paymentMethod,
                subscriptionId: legacyEvent.subscriptionId,
                promotionCode: legacyEvent.promotionCode,
                mrr: legacyEvent.mrr,
                ltv: legacyEvent.ltv
            },
            tags: ['revenue', legacyEvent.revenueType, legacyEvent.currency]
        };
    }
    async recordRevenueEvent(event) {
        return this.publishEvent(event);
    }
}
/**
 * Session Monitoring Adapter
 *
 * Integrates session monitoring system
 */
export class SessionMonitoringAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus) {
        super(eventBus, 'session-monitoring');
    }
    transformEvent(legacyEvent) {
        return {
            type: AnalyticsEventType.SESSION_EVENT,
            category: EventCategory.USER,
            severity: EventSeverity.INFO,
            userId: legacyEvent.userId,
            sessionId: legacyEvent.sessionId,
            data: {
                sessionEvent: legacyEvent.sessionEvent,
                duration: legacyEvent.duration,
                pageViews: legacyEvent.pageViews,
                interactions: legacyEvent.interactions,
                exitPage: legacyEvent.exitPage,
                bounceRate: legacyEvent.bounceRate,
                ...legacyEvent
            },
            metadata: {
                entryPoint: legacyEvent.entryPoint,
                referrer: legacyEvent.referrer,
                deviceType: legacyEvent.deviceType,
                browser: legacyEvent.browser,
                os: legacyEvent.os
            },
            tags: ['session', legacyEvent.sessionEvent, legacyEvent.deviceType]
        };
    }
    async recordSessionEvent(event) {
        return this.publishEvent(event);
    }
}
/**
 * Analytics Adapter Manager
 *
 * Manages all analytics adapters and provides unified interface
 */
export class AnalyticsAdapterManager {
    adapters = new Map();
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.initializeAdapters();
    }
    /**
     * Initialize all analytics adapters
     */
    initializeAdapters() {
        // Core analytics adapters
        this.adapters.set('main', new MainAnalyticsAdapter(this.eventBus));
        this.adapters.set('integration', new IntegrationAnalyticsAdapter(this.eventBus));
        this.adapters.set('behavior', new BehaviorAnalyticsAdapter(this.eventBus));
        this.adapters.set('performance', new PerformanceMonitoringAdapter(this.eventBus));
        this.adapters.set('security', new SecurityEventAdapter(this.eventBus));
        this.adapters.set('revenue', new RevenueAnalyticsAdapter(this.eventBus));
        this.adapters.set('session', new SessionMonitoringAdapter(this.eventBus));
        // Additional specialized adapters can be added here
        // this.adapters.set('fraud', new FraudDetectionAdapter(this.eventBus));
        // this.adapters.set('transaction', new TransactionMonitoringAdapter(this.eventBus));
        // this.adapters.set('search', new SearchAnalyticsAdapter(this.eventBus));
        // this.adapters.set('file-browser', new FileBrowserAnalyticsAdapter(this.eventBus));
        // this.adapters.set('system', new SystemMonitoringAdapter(this.eventBus));
    }
    /**
     * Get adapter by name
     */
    getAdapter(name) {
        return this.adapters.get(name) || null;
    }
    /**
     * Enable/disable adapter
     */
    setAdapterEnabled(name, enabled) {
        const adapter = this.adapters.get(name);
        if (adapter) {
            adapter.setEnabled(enabled);
            return true;
        }
        return false;
    }
    /**
     * Get status of all adapters
     */
    getAdapterStatus() {
        return Array.from(this.adapters.values()).map(adapter => adapter.getStatus());
    }
    /**
     * Migrate data from all legacy systems
     */
    async migrateAllSystems(migrationData) {
        const results = {};
        for (const [systemName, events] of Object.entries(migrationData)) {
            const adapter = this.adapters.get(systemName);
            if (adapter) {
                results[systemName] = await this.eventBus.migrateFromLegacySystem(systemName, events, (legacyEvent) => adapter['transformEvent'](legacyEvent));
            }
        }
        return results;
    }
    /**
     * Get consolidated analytics metrics
     */
    getConsolidatedMetrics() {
        const enabledAdapters = Array.from(this.adapters.values())
            .filter(adapter => adapter.getStatus().enabled).length;
        return {
            adapters: this.adapters.size,
            enabledAdapters,
            eventBusMetrics: this.eventBus.getMetrics()
        };
    }
    /**
     * Shutdown all adapters
     */
    async shutdown() {
        for (const adapter of this.adapters.values()) {
            adapter.setEnabled(false);
        }
        this.adapters.clear();
    }
}
export default AnalyticsAdapterManager;
