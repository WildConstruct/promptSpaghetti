/**
 * Simple in-memory metrics implementation
 */
export class MemoryMetrics {
    constructor() {
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.timers = new Map();
    }
    counter(name, value = 1, tags) {
        const key = this.buildKey(name, tags);
        const current = this.counters.get(key) || 0;
        this.counters.set(key, current + value);
    }
    gauge(name, value, tags) {
        const key = this.buildKey(name, tags);
        this.gauges.set(key, value);
    }
    histogram(name, value, tags) {
        const key = this.buildKey(name, tags);
        const values = this.histograms.get(key) || [];
        values.push(value);
        this.histograms.set(key, values);
    }
    timer(name) {
        const startTime = Date.now();
        const timerId = `${name}-${Math.random()}`;
        return {
            end: () => {
                const duration = Date.now() - startTime;
                this.histogram(name, duration);
            }
        };
    }
    /**
     * Get all metrics data
     */
    getMetrics() {
        const histogramStats = {};
        for (const [key, values] of this.histograms.entries()) {
            if (values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                const count = values.length;
                const min = sorted[0];
                const max = sorted[count - 1];
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / count;
                const p95Index = Math.floor(count * 0.95);
                const p99Index = Math.floor(count * 0.99);
                const p95 = sorted[p95Index] || max;
                const p99 = sorted[p99Index] || max;
                histogramStats[key] = { count, min, max, avg, p95, p99 };
            }
        }
        return {
            counters: Object.fromEntries(this.counters),
            gauges: Object.fromEntries(this.gauges),
            histograms: histogramStats
        };
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.counters.clear();
        this.gauges.clear();
        this.histograms.clear();
        this.timers.clear();
    }
    buildKey(name, tags) {
        if (!tags || Object.keys(tags).length === 0) {
            return name;
        }
        const tagString = Object.entries(tags)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join(',');
        return `${name}{${tagString}}`;
    }
}
/**
 * No-op metrics for testing or when metrics are disabled
 */
export class NoOpMetrics {
    counter() { }
    gauge() { }
    histogram() { }
    timer() {
        return { end: () => { } };
    }
}
