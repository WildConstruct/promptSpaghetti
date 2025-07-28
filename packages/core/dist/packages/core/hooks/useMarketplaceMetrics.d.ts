export interface MarketplaceMetricsConfig {
    enableAutoTracking?: boolean;
    trackPageViews?: boolean;
    trackUserInteractions?: boolean;
    userId?: string;
    userRole?: 'director' | 'producer' | 'creator' | 'admin';
}
export declare const useMarketplaceMetrics: (config?: MarketplaceMetricsConfig) => void;
export default useMarketplaceMetrics;
//# sourceMappingURL=useMarketplaceMetrics.d.ts.map