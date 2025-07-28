export interface ScalingAnalyticsConfig {
    enableRealTimeAnalytics: boolean;
    analysisInterval: number;
    scalingThresholds: ScalingThresholds;
    loadBalancingConfig: LoadBalancingConfig;
    predictiveScalingConfig: PredictiveScalingConfig;
    performanceTargets: PerformanceTargets;
    costOptimizationConfig: CostOptimizationConfig;
    alertingConfig: ScalingAlertingConfig;
}
export interface ScalingThresholds {
    cpuUtilizationPercent: {
        scaleUp: number;
        scaleDown: number;
    };
    memoryUtilizationPercent: {
        scaleUp: number;
        scaleDown: number;
    };
    responseTimeMs: {
        scaleUp: number;
        scaleDown: number;
    };
    throughputRps: {
        scaleUp: number;
        scaleDown: number;
    };
    errorRatePercent: {
        scaleUp: number;
        scaleDown: number;
    };
    queueDepth: {
        scaleUp: number;
        scaleDown: number;
    };
    connectionCount: {
        scaleUp: number;
        scaleDown: number;
    };
}
export interface LoadBalancingConfig {
    enableIntelligentRouting: boolean;
    routingAlgorithm: LoadBalancingAlgorithm;
    healthCheckConfig: HealthCheckConfig;
    stickySessionConfig: StickySessionConfig;
    circuitBreakerConfig: CircuitBreakerConfig;
    trafficShaping: TrafficShapingConfig;
}
export declare enum LoadBalancingAlgorithm {
    ROUND_ROBIN = "round_robin",
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin",
    LEAST_CONNECTIONS = "least_connections",
    WEIGHTED_LEAST_CONNECTIONS = "weighted_least_connections",
    RESOURCE_BASED = "resource_based",
    RESPONSE_TIME_BASED = "response_time_based",
    GEOGRAPHIC = "geographic",
    ADAPTIVE = "adaptive",
    ML_OPTIMIZED = "ml_optimized",
    export,
    interface,
    HealthCheckConfig
}
export interface CustomHealthCheck {
    checkId: string;
    checkName: string;
    checkType: HealthCheckType;
    endpoint: string;
    expectedResponse: unknown;
    weight: number;
    enabled: boolean;
}
export declare enum HealthCheckType {
    HTTP_GET = "http_get",
    HTTP_POST = "http_post",
    TCP_CONNECT = "tcp_connect",
    DATABASE_QUERY = "database_query",
    CUSTOM_SCRIPT = "custom_script",
    DEPENDENCY_CHECK = "dependency_check",
    export,
    interface,
    StickySessionConfig
}
export declare enum SessionAffinityType {
    COOKIE_BASED = "cookie_based",
    IP_HASH = "ip_hash",
    HEADER_BASED = "header_based",
    CUSTOM = "custom",
    export,
    enum,
    FallbackBehavior
}
//# sourceMappingURL=ApiScalingAnalyticsIntegration.d.ts.map