/**
 * Canvas Performance Optimization Utilities
 * Epic 8.1: Task 4 - Optimize canvas rendering for smooth 60fps interactions
 *
 * Professional canvas optimization for large graph performance
 */
import React from 'react';
export class CanvasOptimizer {
    config;
    metrics;
    lastFrameTime = 0;
    frameCount = 0;
    renderTimeSum = 0;
    memoryCleanupTimer;
    performanceObserver;
    constructor(config = {}) {
        this.config = {
            maxVisibleNodes: 150,
            cullingThreshold: 0.1, // Viewport threshold for culling
            animationFrameThrottle: 16, // ~60fps
            renderDebounce: 100,
            memoryCleanupInterval: 30000, // 30 seconds
            ...config
        };
        this.metrics = {
            fps: 0,
            renderTime: 0,
            nodeCount: 0,
            visibleNodes: 0,
            memoryUsage: 0,
            lastUpdateTime: Date.now()
        };
        this.initializePerformanceMonitoring();
        this.startMemoryCleanup();
    }
    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Monitor React Flow performance
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name.includes('react-flow')) {
                        this.updateRenderMetrics(entry.duration);
                    }
                });
            });
            this.performanceObserver.observe({
                entryTypes: ['measure', 'navigation', 'resource']
            });
        }
        // FPS monitoring
        this.monitorFPS();
    }
    /**
     * Monitor FPS with RAF
     */
    monitorFPS() {
        const measureFrame = (timestamp) => {
            if (this.lastFrameTime) {
                this.frameCount++;
                const delta = timestamp - this.lastFrameTime;
                this.renderTimeSum += delta;
                // Update FPS every second
                if (this.frameCount % 60 === 0) {
                    this.metrics.fps = Math.round(1000 / (this.renderTimeSum / this.frameCount));
                    this.frameCount = 0;
                    this.renderTimeSum = 0;
                }
            }
            this.lastFrameTime = timestamp;
            requestAnimationFrame(measureFrame);
        };
        requestAnimationFrame(measureFrame);
    }
    /**
     * Update render metrics
     */
    updateRenderMetrics(renderTime) {
        this.metrics.renderTime = renderTime;
        this.metrics.lastUpdateTime = Date.now();
    }
    /**
     * Start memory cleanup interval
     */
    startMemoryCleanup() {
        this.memoryCleanupTimer = setInterval(() => {
            this.cleanupMemory();
            this.updateMemoryMetrics();
        }, this.config.memoryCleanupInterval);
    }
    /**
     * Cleanup memory and unused resources
     */
    cleanupMemory() {
        // Force garbage collection if available (Chrome DevTools)
        if ('gc' in window && typeof window.gc === 'function') {
            window.gc();
        }
        // Clear RAF callbacks that might be queued
        if (typeof cancelAnimationFrame !== 'undefined') {
            // Cancel any pending animation frames
            for (let i = 1; i < 1000; i++) {
                cancelAnimationFrame(i);
            }
        }
    }
    /**
     * Update memory usage metrics
     */
    updateMemoryMetrics() {
        if ('performance' in window && 'memory' in performance) {
            const memory = performance.memory;
            this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        }
    }
    /**
     * Optimize node visibility based on viewport
     */
    optimizeNodeVisibility(nodes, viewport, canvasSize) {
        const visibleNodes = this.cullInvisibleNodes(nodes, viewport, canvasSize);
        // Limit total visible nodes for performance
        if (visibleNodes.length > this.config.maxVisibleNodes) {
            // Prioritize selected and important nodes
            const prioritizedNodes = this.prioritizeNodes(visibleNodes);
            return prioritizedNodes.slice(0, this.config.maxVisibleNodes);
        }
        this.metrics.visibleNodes = visibleNodes.length;
        return visibleNodes;
    }
    /**
     * Cull nodes outside viewport
     */
    cullInvisibleNodes(nodes, viewport, canvasSize) {
        const { x, y, zoom } = viewport;
        const threshold = this.config.cullingThreshold;
        const viewportBounds = {
            left: -x / zoom - threshold * canvasSize.width,
            top: -y / zoom - threshold * canvasSize.height,
            right: (-x + canvasSize.width) / zoom + threshold * canvasSize.width,
            bottom: (-y + canvasSize.height) / zoom + threshold * canvasSize.height
        };
        return nodes.filter(node => {
            const nodeX = node.position.x;
            const nodeY = node.position.y;
            const nodeWidth = node.width || 200;
            const nodeHeight = node.height || 100;
            return (nodeX + nodeWidth >= viewportBounds.left &&
                nodeX <= viewportBounds.right &&
                nodeY + nodeHeight >= viewportBounds.top &&
                nodeY <= viewportBounds.bottom);
        });
    }
    /**
     * Prioritize nodes for rendering
     */
    prioritizeNodes(nodes) {
        return nodes.sort((a, b) => {
            // Selected nodes get highest priority
            if (a.selected && !b.selected)
                return -1;
            if (!a.selected && b.selected)
                return 1;
            // Then by importance (output nodes, etc.)
            const importanceA = this.getNodeImportance(a);
            const importanceB = this.getNodeImportance(b);
            return importanceB - importanceA;
        });
    }
    /**
     * Get node importance score for prioritization
     */
    getNodeImportance(node) {
        let score = 0;
        // Output nodes are most important
        if (node.type === 'Output')
            score += 100;
        // Selected nodes are important
        if (node.selected)
            score += 50;
        // Nodes with many connections are important
        const connectionCount = (node.data?.connections || 0);
        score += connectionCount * 5;
        return score;
    }
    /**
     * Optimize edge rendering
     */
    optimizeEdges(edges, visibleNodes, viewport) {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        // Only render edges between visible nodes
        const visibleEdges = edges.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
        // Simplify edge rendering at low zoom levels
        if (viewport.zoom < 0.5) {
            return this.simplifyEdgesForZoom(visibleEdges, viewport.zoom);
        }
        return visibleEdges;
    }
    /**
     * Simplify edges for low zoom levels
     */
    simplifyEdgesForZoom(edges, zoom) {
        if (zoom < 0.3) {
            // At very low zoom, show only critical edges
            return edges.filter(edge => edge.selected || edge.data?.important);
        }
        return edges;
    }
    /**
     * Create optimized render settings
     */
    getOptimizedRenderSettings(nodeCount, zoom) {
        return {
            // Disable expensive features at scale
            nodesDraggable: nodeCount < 100,
            nodesConnectable: nodeCount < 150,
            elementsSelectable: true,
            // Adjust detail level based on zoom
            showNodeLabels: zoom > 0.6,
            showHandles: zoom > 0.4,
            showMinimap: nodeCount < 200,
            // Performance optimizations
            fitViewOnInit: nodeCount < 50,
            animateTransitions: nodeCount < 100 && zoom > 0.5,
            // Connection line settings
            connectionLineType: zoom > 0.5 ? 'smoothstep' : 'straight',
            // Quality settings
            quality: zoom > 0.8 ? 'high' : zoom > 0.4 ? 'medium' : 'low'
        };
    }
    /**
     * Throttled render function
     */
    createThrottledRenderer(fn, delay = this.config.renderDebounce) {
        let timeoutId;
        let lastArgs;
        return ((...args) => {
            lastArgs = args;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                fn(...lastArgs);
            }, delay);
        });
    }
    /**
     * Performance-aware animation frame scheduler
     */
    scheduleAnimation(callback) {
        // Skip frame if performance is poor
        if (this.metrics.fps < 30) {
            setTimeout(callback, this.config.animationFrameThrottle * 2);
            return;
        }
        requestAnimationFrame(() => {
            const startTime = performance.now();
            callback();
            const endTime = performance.now();
            this.updateRenderMetrics(endTime - startTime);
        });
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Check if performance is acceptable
     */
    isPerformanceGood() {
        return this.metrics.fps >= 30 && this.metrics.renderTime < 16;
    }
    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        if (this.metrics.fps < 30) {
            recommendations.push('Reduce number of visible nodes');
            recommendations.push('Disable expensive animations');
        }
        if (this.metrics.renderTime > 16) {
            recommendations.push('Optimize node rendering complexity');
            recommendations.push('Use viewport culling');
        }
        if (this.metrics.memoryUsage > 0.8) {
            recommendations.push('Clear unused node data');
            recommendations.push('Reduce node history/cache');
        }
        if (this.metrics.visibleNodes > this.config.maxVisibleNodes) {
            recommendations.push('Implement aggressive viewport culling');
            recommendations.push('Use node clustering for distant elements');
        }
        return recommendations;
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.memoryCleanupTimer) {
            clearInterval(this.memoryCleanupTimer);
        }
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        this.cleanupMemory();
    }
}
/**
 * Hook for using canvas optimization
 */
export function useCanvasOptimization(config) {
    const [optimizer] = React.useState(() => new CanvasOptimizer(config));
    const [metrics, setMetrics] = React.useState(optimizer.getMetrics());
    React.useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(optimizer.getMetrics());
        }, 1000);
        return () => {
            clearInterval(interval);
            optimizer.cleanup();
        };
    }, [optimizer]);
    return {
        optimizer,
        metrics,
        isPerformanceGood: optimizer.isPerformanceGood(),
        recommendations: optimizer.getPerformanceRecommendations()
    };
}
React.useEffect(() => {
    if (!visible)
        return;
    const interval = setInterval(() => {
        setMetrics(optimizer.getMetrics());
    }, 100);
    return () => clearInterval(interval);
}, [optimizer, visible]);
if (!visible)
    return null;
return style = {};
{
    position: 'fixed',
        top;
    10,
        left;
    10,
        background;
    'rgba(0, 0, 0, 0.8)',
        color;
    'white',
        padding;
    12,
        borderRadius;
    6,
        fontFamily;
    'monospace',
        fontSize;
    12,
        zIndex;
    10000,
        backdropFilter;
    'blur(4px)';
}
    >
        FPS;
{
    metrics.fps;
}
/div>
    < div > Render;
{
    metrics.renderTime.toFixed(1);
}
ms < /div>
    < div > Visible;
{
    metrics.visibleNodes;
}
/{metrics.nodeCount}</div >
    Memory;
{
    (metrics.memoryUsage * 100).toFixed(1);
}
 % /div>
    < /div>;
;
;
