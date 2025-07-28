/**
 * Security Dashboard Data Service
 * Task T-1752989143998-955: Implement security dashboard
 *
 * Data service layer for security dashboard that handles API integration,
 * real-time data streaming, caching, and data transformation for security
 * monitoring and incident response operations.
 *
 * Features:
 * - RESTful API integration for security data
 * - Real-time WebSocket streaming
 * - Intelligent caching and data persistence
 * - Data transformation and aggregation
 * - Error handling and retry logic
 * - Performance monitoring and metrics
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import { SecurityMetrics, SecurityAlert, ComplianceStatus } from './SecurityDashboardMain';
export interface SecurityAction {
    type: string;
    payload: unknown;
    timestamp: Date;
    executedBy: string;
}
export interface DataServiceConfig {
    baseUrl: string;
    wsUrl: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
    cacheTimeout: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
}
/**
 * Security Dashboard Data Service
 */
export declare class SecurityDashboardDataService {
    private workspaceId;
    private config;
    private cache;
    private ws;
    private listeners;
    constructor(workspaceId: string, config?: Partial<DataServiceConfig>);
    /**
     * Get current security metrics
     */
    getSecurityMetrics(): Promise<SecurityMetrics>;
    /**
     * Get active security alerts
     */
    getActiveAlerts(filters?: {)
        severity?: string[];
        category?: string[];
        status?: string[];
        limit?: number;
        offset?: number;
    }): Promise<SecurityAlert[]>;
    /**
     * Get compliance status
     */
    getComplianceStatus(): Promise<ComplianceStatus[]>;
    /**
     * Execute a security action
     */
    executeSecurityAction(actionType: string, payload: unknown): Promise<void>;
    /**
     * Update an alert
     */
    updateAlert(alertId: string, updates: Partial<SecurityAlert>): Promise<SecurityAlert>;
    /**
     * Subscribe to real-time events
     */
    on(event: string, callback: Function): void;
    /**
     * Unsubscribe from events
     */
    off(event: string, callback: Function): void;
    /**
     * Emit events to subscribers
     */
    private emit;
    /**
     * Initialize WebSocket connection for real-time updates
     */
    initializeWebSocket(): Promise<void>;
    /**
     * Handle incoming WebSocket messages
     */
    private handleWebSocketMessage;
    /**
     * Make API request with retry logic
     */
    private apiRequest;
    /**
     * Cache management
     */
    private setCache;
    private getFromCache;
    private invalidateCache;
    /**
     * Fallback data methods (for offline/error scenarios)
     */
    private getFallbackSecurityMetrics;
    private getFallbackSecurityAlerts;
    private getFallbackComplianceStatus;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default SecurityDashboardDataService;
//# sourceMappingURL=SecurityDashboardDataService.d.ts.map