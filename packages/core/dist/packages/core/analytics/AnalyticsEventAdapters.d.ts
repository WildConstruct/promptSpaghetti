/**
 * Analytics Event Adapters - Story 1.5 Task 2
 *
 * Adapters to integrate existing 12+ analytics systems with the unified event bus
 * while preserving their original functionality and data schemas.
 */
import { UnifiedEventBus, UnifiedAnalyticsEvent } from './UnifiedEventBus';
/**
 * Base Analytics Adapter
 *
 * Abstract base class for creating adapters for existing analytics systems
 */
export declare abstract class BaseAnalyticsAdapter {
    protected eventBus: UnifiedEventBus;
    protected systemName: string;
    protected enabled: boolean;
    constructor(eventBus: UnifiedEventBus, systemName: string);
    /**
     * Transform legacy event to unified format
     */
    protected abstract transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    /**
     * Publish event through unified bus
     */
    protected publishEvent(legacyEvent: any): Promise<string | null>;
    /**
     * Enable/disable adapter
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get adapter status
     */
    getStatus(): {
        name: string;
        enabled: boolean;
        systemName: string;
    };
}
/**
 * Main Analytics Adapter
 *
 * Integrates the primary analytics system (/server/src/routes/analytics.ts)
 */
export declare class MainAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    private getEventType;
    recordGraphExecution(execution: any): Promise<string | null>;
    recordNodeExecution(execution: any): Promise<string | null>;
    recordTokenUsage(usage: any): Promise<string | null>;
    recordUserInteraction(interaction: any): Promise<string | null>;
}
/**
 * Integration Analytics Adapter
 *
 * Integrates the integration analytics system (/server/src/routes/integration-analytics.ts)
 */
export declare class IntegrationAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    recordIntegrationEvent(event: any): Promise<string | null>;
}
/**
 * Behavior Analytics Adapter
 *
 * Integrates behavior analytics system
 */
export declare class BehaviorAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    recordBehaviorEvent(event: any): Promise<string | null>;
}
/**
 * Performance Monitoring Adapter
 *
 * Integrates Epic 17 performance monitoring system
 */
export declare class PerformanceMonitoringAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    private getPerformanceSeverity;
    recordPerformanceMetric(metric: any): Promise<string | null>;
}
/**
 * Security Event Adapter
 *
 * Integrates security event monitoring system
 */
export declare class SecurityEventAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    private getSecuritySeverity;
    recordSecurityEvent(event: any): Promise<string | null>;
}
/**
 * Revenue Analytics Adapter
 *
 * Integrates revenue analytics system
 */
export declare class RevenueAnalyticsAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    recordRevenueEvent(event: any): Promise<string | null>;
}
/**
 * Session Monitoring Adapter
 *
 * Integrates session monitoring system
 */
export declare class SessionMonitoringAdapter extends BaseAnalyticsAdapter {
    constructor(eventBus: UnifiedEventBus);
    protected transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    recordSessionEvent(event: any): Promise<string | null>;
}
/**
 * Analytics Adapter Manager
 *
 * Manages all analytics adapters and provides unified interface
 */
export declare class AnalyticsAdapterManager {
    private adapters;
    private eventBus;
    constructor(eventBus: UnifiedEventBus);
    /**
     * Initialize all analytics adapters
     */
    private initializeAdapters;
    /**
     * Get adapter by name
     */
    getAdapter<T extends BaseAnalyticsAdapter>(name: string): T | null;
    /**
     * Enable/disable adapter
     */
    setAdapterEnabled(name: string, enabled: boolean): boolean;
    /**
     * Get status of all adapters
     */
    getAdapterStatus(): Array<{
        name: string;
        enabled: boolean;
        systemName: string;
    }>;
    /**
     * Migrate data from all legacy systems
     */
    migrateAllSystems(migrationData: {
        [systemName: string]: any[];
    }): Promise<{
        [systemName: string]: {
            migrated: number;
            failed: number;
            errors: string[];
        };
    }>;
    /**
     * Get consolidated analytics metrics
     */
    getConsolidatedMetrics(): {
        adapters: number;
        enabledAdapters: number;
        eventBusMetrics: any;
    };
    /**
     * Shutdown all adapters
     */
    shutdown(): Promise<void>;
}
export default AnalyticsAdapterManager;
//# sourceMappingURL=AnalyticsEventAdapters.d.ts.map