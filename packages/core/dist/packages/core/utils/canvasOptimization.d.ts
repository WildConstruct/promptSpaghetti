import { Viewport } from 'reactflow';
export interface PerformanceConfig {
    maxVisibleNodes: number;
    cullingThreshold: number;
    animationFrameThrottle: number;
    renderDebounce: number;
    memoryCleanupInterval: number;
}
export interface CanvasMetrics {
    fps: number;
    renderTime: number;
    nodeCount: number;
    visibleNodes: number;
    memoryUsage: number;
    lastUpdateTime: number;
}
export declare class CanvasOptimizer {
    private config;
    private metrics;
    private lastFrameTime;
    private frameCount;
    private renderTimeSum;
    private memoryCleanupTimer?;
    private performanceObserver?;
    constructor(config?: Partial<PerformanceConfig>);
    /**
     * Initialize performance monitoring
     */
    private initializePerformanceMonitoring;
    /**
     * Monitor FPS with RAF
     */
    private monitorFPS;
    /**
     * Update render metrics
     */
    private updateRenderMetrics;
    /**
    * Start memory cleanup interval
    */
    private startMemoryCleanup;
    /**
     * Cleanup memory and unused resources
     */
    private cleanupMemory;
    /**
     * Update memory usage metrics
     */
    private updateMemoryMetrics;
    /**
     * Cull nodes outside viewport
     */
    private cullInvisibleNodes;
    viewport: Viewport;
    canvasSize: {
        width: number;
        height: number;
    };
    Node: any;
}
//# sourceMappingURL=canvasOptimization.d.ts.map