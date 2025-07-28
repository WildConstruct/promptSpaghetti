export interface IntegrationConfig {
    enableUnifiedProtection: boolean;
    rateLimitingPriority: number;
    throttlingPriority: number;
    integrationMode: IntegrationMode;
    coordinationStrategy: CoordinationStrategy;
    fallbackBehavior: FallbackBehavior;
    analyticsIntegration: boolean;
    crossSystemLearning: boolean;
}
export declare enum IntegrationMode {
    SEQUENTIAL = "sequential",// Apply rate limiting first, then throttling
    PARALLEL = "parallel",// Apply both simultaneously and combine results
    CONDITIONAL = "conditional",// Choose system based on conditions
    HIERARCHICAL = "hierarchical",// Layer protections with priorities
    export,
    enum,
    CoordinationStrategy
}
//# sourceMappingURL=AdaptiveRateLimitingIntegration.d.ts.map