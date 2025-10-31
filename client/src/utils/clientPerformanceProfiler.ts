/**
 * Client-side performance profiler used during development to capture
 * lightweight render, memory, network, and interaction snapshots. The
 * implementation intentionally avoids external dependencies so that it can
 * run inside Jest/JSDOM as well as the browser.
 */

type NumericRecord = Record<string, number>;

export interface RenderMetrics {
  componentCount: number;
  renderTime: number;
  reRenderCount: number;
  mountTime: number;
  updateTime: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  heapUtilization: number;
}

export interface NetworkMetrics {
  requestCount: number;
  totalTransferSize: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHitRate: number;
}

export interface UserInteractionMetrics {
  clickCount: number;
  scrollEvents: number;
  inputEvents: number;
  navigationCount: number;
  averageInteractionTime: number;
}

export interface VitalMetrics {
  FCP: number;
  LCP: number;
  FID: number;
  CLS: number;
  TTFB: number;
}

export interface PerformanceSnapshot {
  timestamp: number;
  render: RenderMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  interactions: UserInteractionMetrics;
  vitals: VitalMetrics;
  customMetrics: NumericRecord;
}

export interface AlertThresholds {
  renderTime: number;
  memoryUsage: number;
  responseTime: number;
  layoutShift: number;
}

export interface ClientProfilingConfig {
  sampleInterval: number;
  trackRenderMetrics: boolean;
  trackMemoryMetrics: boolean;
  trackNetworkMetrics: boolean;
  trackUserInteractions: boolean;
  trackWebVitals: boolean;
  maxSnapshots: number;
  alertThresholds: AlertThresholds;
}

const defaultConfig: ClientProfilingConfig = {
  sampleInterval: 1000,
  trackRenderMetrics: true,
  trackMemoryMetrics: true,
  trackNetworkMetrics: true,
  trackUserInteractions: true,
  trackWebVitals: true,
  maxSnapshots: 3600,
  alertThresholds: {
    renderTime: 16.67,
    memoryUsage: 80,
    responseTime: 2000,
    layoutShift: 0.1
  }
};

type InteractionCounters = {
  clickCount: number;
  scrollEvents: number;
  inputEvents: number;
  navigationCount: number;
  interactionDurations: number[];
  lastInteractionTimestamp: number | null;
};

type WebVitalState = {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
};

export class ClientPerformanceProfiler {
  private readonly config: ClientProfilingConfig;
  private snapshots: PerformanceSnapshot[] = [];
  private isRunning = false;
  private intervalId: number | null = null;
  private observers: PerformanceObserver[] = [];
  private startTime = 0;
  private interactionCounters: InteractionCounters = {
    clickCount: 0,
    scrollEvents: 0,
    inputEvents: 0,
    navigationCount: 0,
    interactionDurations: [],
    lastInteractionTimestamp: null
  };
  private webVitals: WebVitalState = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  };
  private detachListeners: Array<() => void> = [];
  private listenersRegistered = false;

  constructor(config: Partial<ClientProfilingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }

    if (typeof PerformanceObserver !== 'undefined') {
      this.initializeObservers();
    }
  }

  startProfiling(): void {
    if (this.isRunning) {
      console.warn('ClientPerformanceProfiler.startProfiling: already running');
      return;
    }

    if (typeof performance === 'undefined') {
      console.warn('ClientPerformanceProfiler requires the Performance API');
      return;
    }

    this.isRunning = true;
    this.startTime = performance.now();
    this.snapshots = [];
    this.resetCounters();
    this.collectSnapshot();

    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(
        () => this.collectSnapshot(),
        this.config.sampleInterval
      );
    }
  }

  stopProfiling(): PerformanceSnapshot[] {
    if (!this.isRunning) {
      return [...this.snapshots];
    }

    if (this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
    }

    this.intervalId = null;
    this.isRunning = false;
    this.collectSnapshot();
    this.teardownObservers();
    this.teardownListeners();
    this.generateReport();

    return [...this.snapshots];
  }

  getSnapshots(): PerformanceSnapshot[] {
    return [...this.snapshots];
  }

  private collectSnapshot(): void {
    if (typeof performance === 'undefined') {
      return;
    }

    try {
      const snapshot: PerformanceSnapshot = {
        timestamp: performance.now(),
        render: this.collectRenderMetrics(),
        memory: this.collectMemoryMetrics(),
        network: this.collectNetworkMetrics(),
        interactions: this.collectUserInteractionMetrics(),
        vitals: this.collectWebVitals(),
        customMetrics: {}
      };

      this.snapshots.push(snapshot);
      if (this.snapshots.length > this.config.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
      }

      this.checkPerformanceAlerts(snapshot);
    } catch (error) {
      console.error('ClientPerformanceProfiler: failed to collect snapshot', error);
    }
  }

  private collectRenderMetrics(): RenderMetrics {
    if (!this.config.trackRenderMetrics || typeof performance === 'undefined') {
      return { componentCount: 0, renderTime: 0, reRenderCount: 0, mountTime: 0, updateTime: 0 };
    }

    const measures = performance.getEntriesByType('measure');
    const totalRenderTime = measures.reduce((sum, entry) => sum + entry.duration, 0);
    const componentCount =
      typeof document !== 'undefined'
        ? document.querySelectorAll('[data-reactroot], [data-component-id]').length
        : 0;

    return {
      componentCount,
      renderTime: totalRenderTime,
      reRenderCount: measures.length,
      mountTime: measures.length > 0 ? measures[0]?.duration ?? 0 : 0,
      updateTime: totalRenderTime
    };
  }

  private collectMemoryMetrics(): MemoryMetrics {
    if (!this.config.trackMemoryMetrics || typeof performance === 'undefined') {
      return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0, heapUtilization: 0 };
    }

    const memory = (performance as Performance & { memory?: PerformanceMemory }).memory;
    if (!memory) {
      return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0, heapUtilization: 0 };
    }

    const heapUtilization =
      memory.jsHeapSizeLimit > 0
        ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        : 0;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      heapUtilization
    };
  }

  private collectNetworkMetrics(): NetworkMetrics {
    if (!this.config.trackNetworkMetrics || typeof performance === 'undefined') {
      return { requestCount: 0, totalTransferSize: 0, averageResponseTime: 0, errorCount: 0, cacheHitRate: 0 };
    }

    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (resourceEntries.length === 0) {
      return { requestCount: 0, totalTransferSize: 0, averageResponseTime: 0, errorCount: 0, cacheHitRate: 0 };
    }

    let transferSize = 0;
    let responseTotal = 0;
    let cacheHits = 0;

    resourceEntries.forEach(entry => {
      transferSize += entry.transferSize;
      responseTotal += entry.responseEnd - entry.responseStart;
      if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
        cacheHits += 1;
      }
    });

    return {
      requestCount: resourceEntries.length,
      totalTransferSize: transferSize,
      averageResponseTime: responseTotal / resourceEntries.length,
      errorCount: 0,
      cacheHitRate: (cacheHits / resourceEntries.length) * 100
    };
  }

  private collectUserInteractionMetrics(): UserInteractionMetrics {
    if (!this.config.trackUserInteractions) {
      return {
        clickCount: 0,
        scrollEvents: 0,
        inputEvents: 0,
        navigationCount: 0,
        averageInteractionTime: 0
      };
    }

    const durations = this.interactionCounters.interactionDurations;
    const averageInteractionTime =
      durations.length > 0
        ? durations.reduce((sum, value) => sum + value, 0) / durations.length
        : 0;

    return {
      clickCount: this.interactionCounters.clickCount,
      scrollEvents: this.interactionCounters.scrollEvents,
      inputEvents: this.interactionCounters.inputEvents,
      navigationCount: this.interactionCounters.navigationCount,
      averageInteractionTime
    };
  }

  private collectWebVitals(): VitalMetrics {
    if (!this.config.trackWebVitals || typeof performance === 'undefined') {
      return { FCP: 0, LCP: 0, FID: 0, CLS: 0, TTFB: 0 };
    }

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navigation = navigationEntries[0];

    if (navigation) {
      this.webVitals.ttfb = navigation.responseStart - navigation.requestStart;
    }

    const paintEntries = performance.getEntriesByName('first-contentful-paint');
    if (paintEntries[0]) {
      this.webVitals.fcp = paintEntries[0].startTime;
    }

    return {
      FCP: this.webVitals.fcp,
      LCP: this.webVitals.lcp,
      FID: this.webVitals.fid,
      CLS: this.webVitals.cls,
      TTFB: this.webVitals.ttfb
    };
  }

  private initializeObservers(): void {
    if (!this.config.trackWebVitals || typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (layoutShift.hadRecentInput) {
            continue;
          }
          this.webVitals.cls += layoutShift.value ?? 0;
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('ClientPerformanceProfiler: failed to observe layout shifts', error);
    }

    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.webVitals.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('ClientPerformanceProfiler: failed to observe LCP', error);
    }

    try {
      const fidObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const firstInput = entry as PerformanceEventTiming;
          this.webVitals.fid = firstInput.processingStart - firstInput.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('ClientPerformanceProfiler: failed to observe FID', error);
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined' || this.listenersRegistered) {
      return;
    }

    const register = <K extends keyof WindowEventMap>(
      event: K,
      handler: (event: WindowEventMap[K]) => void
    ): void => {
      window.addEventListener(event, handler as EventListener, { passive: true });
      this.detachListeners.push(() =>
        window.removeEventListener(event, handler as EventListener)
      );
    };

    register('click', () => {
      this.interactionCounters.clickCount += 1;
      this.recordInteractionDuration();
    });

    register('scroll', () => {
      this.interactionCounters.scrollEvents += 1;
      this.recordInteractionDuration();
    });

    register('input', () => {
      this.interactionCounters.inputEvents += 1;
      this.recordInteractionDuration();
    });

    register('popstate', () => {
      this.interactionCounters.navigationCount += 1;
    });

    this.listenersRegistered = true;
  }

  private teardownObservers(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private teardownListeners(): void {
    this.detachListeners.forEach(detach => detach());
    this.detachListeners = [];
    this.listenersRegistered = false;
  }

  private resetCounters(): void {
    this.interactionCounters = {
      clickCount: 0,
      scrollEvents: 0,
      inputEvents: 0,
      navigationCount: 0,
      interactionDurations: [],
      lastInteractionTimestamp: null
    };
  }

  private recordInteractionDuration(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const lastTimestamp = this.interactionCounters.lastInteractionTimestamp;
    if (lastTimestamp !== null) {
      this.interactionCounters.interactionDurations.push(now - lastTimestamp);
    }
    this.interactionCounters.lastInteractionTimestamp = now;
  }

  private checkPerformanceAlerts(snapshot: PerformanceSnapshot): void {
    const { renderTime } = snapshot.render;
    const heapUsage = snapshot.memory.heapUtilization;
    const { averageResponseTime } = snapshot.network;
    const { CLS } = snapshot.vitals;

    if (renderTime > this.config.alertThresholds.renderTime) {
      console.warn('[Profiler] High render time detected:', renderTime.toFixed(2), 'ms');
    }
    if (heapUsage > this.config.alertThresholds.memoryUsage) {
      console.warn('[Profiler] Memory usage above threshold:', heapUsage.toFixed(1), '%');
    }
    if (averageResponseTime > this.config.alertThresholds.responseTime) {
      console.warn('[Profiler] Slow network responses detected:', averageResponseTime.toFixed(2), 'ms');
    }
    if (CLS > this.config.alertThresholds.layoutShift) {
      console.warn('[Profiler] Layout shift above threshold:', CLS.toFixed(3));
    }
  }

  private generateReport(): void {
    if (this.snapshots.length === 0 || typeof console === 'undefined') {
      return;
    }

    const durationMs =
      this.snapshots[this.snapshots.length - 1].timestamp - this.startTime;

    const average = (values: number[]): number => {
      if (values.length === 0) {
        return 0;
      }
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

    const renderTimes = this.snapshots.map(snapshot => snapshot.render.renderTime);
    const heapUsage = this.snapshots.map(snapshot => snapshot.memory.heapUtilization);
    const networkTimes = this.snapshots.map(snapshot => snapshot.network.averageResponseTime);

    console.info('[Profiler] Session summary', {
      snapshots: this.snapshots.length,
      durationMs,
      averageRenderTime: average(renderTimes).toFixed(2),
      averageHeapUsage: average(heapUsage).toFixed(2),
      averageNetworkTime: average(networkTimes).toFixed(2)
    });
  }
}

export const clientPerformanceProfiler = new ClientPerformanceProfiler();

