/**
 * Dashboard Integration Service - Story 1.5 Task 4
 *
 * Service layer for integrating the real-time dashboard with existing
 * analytics routes and consolidating dashboard functionality.
 */
import { UnifiedEventBus } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
import { AnalyticsAuthorizationService } from './AnalyticsAuthorization';
import { WebSocketStreamingServer } from './WebSocketStreaming';
import { AnalyticsAdapterManager } from './AnalyticsEventAdapters';
interface DashboardIntegrationConfig {
    enableLegacySupport: boolean;
    migrationMode: 'gradual' | 'immediate' | 'parallel';
    cacheEnabled: boolean;
    cacheTTL: number;
    webhookEndpoints: string;
    alertingEnabled: boolean;
}
/**
 * Dashboard Integration Service
 *
 * Manages the integration between the unified dashboard and existing analytics systems
 */
export declare class DashboardIntegrationService {
    private eventBus;
    private eventRepository;
    private authService;
    private wsServer;
    private adapters;
    private config;
    private legacySystems;
    private performanceMetrics;
    private integrationCache;
    constructor();
    eventBus: UnifiedEventBus;
    eventRepository: EventRepository;
    authService: AnalyticsAuthorizationService;
    wsServer: WebSocketStreamingServer;
    adapters: AnalyticsAdapterManager;
    config: Partial<DashboardIntegrationConfig>;
}
export {};
//# sourceMappingURL=DashboardIntegrationService.d.ts.map