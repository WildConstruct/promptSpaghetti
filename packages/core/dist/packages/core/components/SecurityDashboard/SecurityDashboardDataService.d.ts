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
    default: console.log;
    'Unknown WebSocket message type:': any;
    data: any;
}
//# sourceMappingURL=SecurityDashboardDataService.d.ts.map