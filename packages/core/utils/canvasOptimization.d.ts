/**
 * Canvas Performance Optimization Utilities
 * Epic 8.1: Task 4 - Optimize canvas rendering for smooth 60fps interactions
 *
 * Professional canvas optimization for large graph performance
 */
import React from 'react';
import { Edge, Node, Viewport } from 'reactflow';
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
     * Optimize node visibility based on viewport
     */
    optimizeNodeVisibility(nodes: Node[], viewport: Viewport, canvasSize: {
        width: number;
        height: number;
    }): Node[];
    /**
     * Cull nodes outside viewport
     */
    private cullInvisibleNodes;
    /**
     * Prioritize nodes for rendering
     */
    private prioritizeNodes;
    /**
     * Get node importance score for prioritization
     */
    private getNodeImportance;
    /**
     * Optimize edge rendering
     */
    optimizeEdges(edges: Edge[], visibleNodes: Node[], viewport: Viewport): Edge[];
    /**
     * Simplify edges for low zoom levels
     */
    private simplifyEdgesForZoom;
    /**
     * Create optimized render settings
     */
    getOptimizedRenderSettings(nodeCount: number, zoom: number): {
        nodesDraggable: boolean;
        nodesConnectable: boolean;
        elementsSelectable: boolean;
        showNodeLabels: boolean;
        showHandles: boolean;
        showMinimap: boolean;
        fitViewOnInit: boolean;
        animateTransitions: boolean;
        connectionLineType: string;
        quality: string;
    };
    /**
     * Throttled render function
     */
    createThrottledRenderer<T extends (...args: any[]) => void>(fn: T, delay?: number): T;
    /**
     * Performance-aware animation frame scheduler
     */
    scheduleAnimation(callback: () => void): void;
    /**
     * Get current performance metrics
     */
    getMetrics(): CanvasMetrics;
    /**
     * Check if performance is acceptable
     */
    isPerformanceGood(): boolean;
    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations(): string[];
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
/**
 * Hook for using canvas optimization
 */
export declare function useCanvasOptimization(config?: Partial<PerformanceConfig>): {
    optimizer: CanvasOptimizer;
    metrics: CanvasMetrics;
    isPerformanceGood: boolean;
    recommendations: string[];
};
/**
 * Performance monitoring component
 */
export interface PerformanceMonitorProps {
    optimizer: CanvasOptimizer;
    visible?: boolean;
}
export declare const PerformanceMonitor: React.FC<PerformanceMonitorProps>;
//# sourceMappingURL=canvasOptimization.d.ts.map