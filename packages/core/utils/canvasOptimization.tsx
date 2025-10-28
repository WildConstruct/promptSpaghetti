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
  cullingThreshold: number; // fraction of viewport size as margin
  animationFrameThrottle: number; // ms
  renderDebounce: number; // ms
  memoryCleanupInterval: number; // ms
}

export interface CanvasMetrics {
  fps: number;
  renderTime: number; // last render duration (ms)
  nodeCount: number;
  visibleNodes: number;
  memoryUsage: number; // 0..1 if available
  lastUpdateTime: number;
}

export class CanvasOptimizer {
  private config: PerformanceConfig;
  private metrics: CanvasMetrics;
  private lastFrameTime = 0;
  private frameDurations: number[] = [];
  private memoryCleanupTimer: ReturnType<typeof setInterval> | null = null;
  private rafId: number | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxVisibleNodes: 150,
      cullingThreshold: 0.1,
      animationFrameThrottle: 16,
      renderDebounce: 100,
      memoryCleanupInterval: 30000,
      ...config
    };

    this.metrics = {
      fps: 60,
      renderTime: 0,
      nodeCount: 0,
      visibleNodes: 0,
      memoryUsage: 0,
      lastUpdateTime: Date.now()
    };

    this.startFPSMonitoring();
    this.startMemoryCleanup();
  }

  // FPS monitoring using requestAnimationFrame
  private startFPSMonitoring(): void {
    const measure = (now: number) => {
      if (this.lastFrameTime) {
        const delta = now - this.lastFrameTime;
        this.frameDurations.push(delta);
        if (this.frameDurations.length > 60) this.frameDurations.shift();
        const avg =
          this.frameDurations.reduce((a, b) => a + b, 0) /
          this.frameDurations.length;
        this.metrics.fps = Math.round(1000 / Math.max(avg, 1));
      }
      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(measure);
    };
    this.rafId = requestAnimationFrame(measure);
  }

  private startMemoryCleanup(): void {
    if (this.memoryCleanupTimer) clearInterval(this.memoryCleanupTimer);
    this.memoryCleanupTimer = setInterval(() => {
      this.cleanupMemory();
      this.updateMemoryMetrics();
    }, this.config.memoryCleanupInterval);
  }

  private cleanupMemory(): void {
    // Best-effort memory cleanup hooks (devtools only)
    if (typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch {}
    }
  }

  private updateMemoryMetrics(): void {
    const perf: any = typeof performance !== 'undefined' ? performance : null;
    if (perf && perf.memory) {
      const used = perf.memory.usedJSHeapSize;
      const total =
        perf.memory.totalJSHeapSize || perf.memory.jsHeapSizeLimit || used;
      if (total > 0) {
        this.metrics.memoryUsage = Math.min(1, used / total);
      }
    }
  }

  private updateRenderMetrics(renderTime: number): void {
    this.metrics.renderTime = renderTime;
    this.metrics.lastUpdateTime = Date.now();
  }

  optimizeNodeVisibility(
    nodes: Node[],
    viewport: Viewport,
    canvasSize: { width: number; height: number }
  ): Node[] {
    this.metrics.nodeCount = nodes.length;
    const visibleNodes = this.cullInvisibleNodes(nodes, viewport, canvasSize);
    this.metrics.visibleNodes = visibleNodes.length;
    if (visibleNodes.length > this.config.maxVisibleNodes) {
      return this.prioritizeNodes(visibleNodes).slice(
        0,
        this.config.maxVisibleNodes
      );
    }
    return visibleNodes;
  }

  private cullInvisibleNodes(
    nodes: Node[],
    viewport: Viewport,
    canvasSize: { width: number; height: number }
  ): Node[] {
    const { x, y, zoom } = viewport;
    const t = this.config.cullingThreshold;
    const bounds = {
      left: -x / zoom - t * canvasSize.width,
      top: -y / zoom - t * canvasSize.height,
      right: (-x + canvasSize.width) / zoom + t * canvasSize.width,
      bottom: (-y + canvasSize.height) / zoom + t * canvasSize.height
    };
    return nodes.filter(node => {
      const nx = (node as any).position?.x ?? 0;
      const ny = (node as any).position?.y ?? 0;
      const w = (node as any).width ?? 200;
      const h = (node as any).height ?? 100;
      return (
        nx + w >= bounds.left &&
        nx <= bounds.right &&
        ny + h >= bounds.top &&
        ny <= bounds.bottom
      );
    });
  }

  private prioritizeNodes(nodes: Node[]): Node[] {
    return [...nodes].sort(
      (a, b) => this.getNodeImportance(b) - this.getNodeImportance(a)
    );
  }

  private getNodeImportance(node: Node): number {
    let score = 0;
    if ((node as any).selected) score += 50;
    const type = (node as any).type || '';
    if (String(type).toLowerCase().includes('output')) score += 100;
    const connectionCount = (node as any).data?.connections || 0;
    score += Number(connectionCount) * 5;
    return score;
  }

  optimizeEdges(
    edges: Edge[],
    visibleNodes: Node[],
    viewport: Viewport
  ): Edge[] {
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const filtered = edges.filter(
      e => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
    return viewport.zoom < 0.5
      ? this.simplifyEdgesForZoom(filtered, viewport.zoom)
      : filtered;
  }

  private simplifyEdgesForZoom(edges: Edge[], zoom: number): Edge[] {
    if (zoom < 0.3) {
      return edges.filter(
        e => (e as any).selected || (e as any).data?.important
      );
    }
    return edges;
  }

  getOptimizedRenderSettings(nodeCount: number, zoom: number) {
    return {
      nodesDraggable: nodeCount < 100,
      nodesConnectable: nodeCount < 150,
      elementsSelectable: true,
      showNodeLabels: zoom > 0.6,
      showHandles: zoom > 0.4,
      showMinimap: nodeCount < 200,
      fitViewOnInit: nodeCount < 50,
      animateTransitions: nodeCount < 100 && zoom > 0.5,
      connectionLineType: zoom > 0.5 ? 'smoothstep' : 'straight',
      quality: zoom > 0.8 ? 'high' : zoom > 0.4 ? 'medium' : 'low'
    } as const;
  }

  createThrottledRenderer<T extends (...args: any[]) => void>(
    fn: T,
    delay: number = this.config.renderDebounce
  ): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;
    const wrapper = ((...args: Parameters<T>) => {
      lastArgs = args;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (lastArgs) fn(...lastArgs);
        timeoutId = null;
      }, delay);
    }) as T;
    return wrapper;
  }

  scheduleAnimation(callback: () => void): void {
    const tryFrame = () => {
      const start = performance.now();
      callback();
      const end = performance.now();
      this.updateRenderMetrics(end - start);
    };

    // In very low FPS, throttle slightly
    if (this.metrics.fps < 30) {
      setTimeout(tryFrame, this.config.animationFrameThrottle * 2);
    } else {
      requestAnimationFrame(() => tryFrame());
    }
  }

  getMetrics(): CanvasMetrics {
    return { ...this.metrics };
  }

  isPerformanceGood(): boolean {
    return this.metrics.fps >= 30 && this.metrics.renderTime < 16;
  }

  getPerformanceRecommendations(): string[] {
    const recs: string[] = [];
    if (this.metrics.fps < 30) {
      recs.push('Reduce number of visible nodes');
      recs.push('Disable expensive animations');
    }
    if (this.metrics.renderTime > 16) {
      recs.push('Optimize node rendering complexity');
      recs.push('Use viewport culling');
    }
    if (this.metrics.memoryUsage > 0.8) {
      recs.push('Clear unused node data');
      recs.push('Reduce node history/cache');
    }
    if (this.metrics.visibleNodes > this.config.maxVisibleNodes) {
      recs.push('Implement aggressive viewport culling');
      recs.push('Use node clustering for distant elements');
    }
    return recs;
  }

  cleanup(): void {
    if (this.memoryCleanupTimer) {
      clearInterval(this.memoryCleanupTimer);
      this.memoryCleanupTimer = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.cleanupMemory();
  }
}

// Hook to expose optimizer and live metrics
export function useCanvasOptimization(config?: Partial<PerformanceConfig>) {
  const [optimizer] = React.useState(() => new CanvasOptimizer(config));
  const [metrics, setMetrics] = React.useState<CanvasMetrics>(
    optimizer.getMetrics()
  );

  React.useEffect(() => {
    const interval = setInterval(
      () => setMetrics(optimizer.getMetrics()),
      1000
    );
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
  } as const;
}

// Small overlay component to visualize metrics in dev
export interface PerformanceMonitorProps {
  optimizer: CanvasOptimizer;
  visible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  optimizer,
  visible = true
}) => {
  const [metrics, setMetrics] = React.useState<CanvasMetrics>(
    optimizer.getMetrics()
  );

  React.useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => setMetrics(optimizer.getMetrics()), 250);
    return () => clearInterval(interval);
  }, [optimizer, visible]);

  if (!visible) return null;

  const boxStyle: React.CSSProperties = {
    position: 'fixed',
    top: 10,
    left: 10,
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 12,
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  };

  return (
    <div style={boxStyle}>
      <div>FPS: {metrics.fps}</div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      <div>
        Visible: {metrics.visibleNodes}/{metrics.nodeCount}
      </div>
      <div>Memory: {(metrics.memoryUsage * 100).toFixed(1)}%</div>
    </div>
  );
};
