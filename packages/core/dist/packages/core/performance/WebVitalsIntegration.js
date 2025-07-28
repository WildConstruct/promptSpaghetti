/**
 * Enhanced Web Vitals Integration for Epic 18
 * Standardized Web Vitals measurement using official web-vitals package
 */
import { getCLS, getFCP, getFID, getLCP, getTTI, onCLS, onFCP, onFID, onLCP, onTTI } from 'web-vitals';
import { EventEmitter } from 'events';
export class WebVitalsIntegration extends EventEmitter {
    config;
    metrics = new Map();
    sessionId;
    startTime;
    isInitialized = false;
    constructor(config = {}) {
        super();
        this.config = { ...defaultConfig, ...config };
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        /**
         * Initialize Web Vitals tracking
         */
        initialize();
        void {
            : .isInitialized || !this.config.enabled, return: ,
            if(, window) { }
        } === 'undefined';
        {
            console.warn('Web Vitals can only be measured in browser environment');
            return;
            // Check sampling rate
            if (Math.random() > this.config.samplingRate) {
                console.log('Web Vitals tracking skipped due to sampling rate');
                return;
                this.isInitialized = true;
                console.log('🚀 Web Vitals tracking initialized');
                // Set up metric collection with the reportAllChanges option
                const options = { reportAllChanges: this.config.reportAllChanges };
                // Collect Web Vitals metrics
                onFCP(this.handleMetric.bind(this), options);
                onLCP(this.handleMetric.bind(this), options);
                onFID(this.handleMetric.bind(this), options);
                onCLS(this.handleMetric.bind(this), options);
                onTTI(this.handleMetric.bind(this), options);
                // Set up page visibility change handler for final reporting
                document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
                // Set up beforeunload handler for final reporting
                window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
                this.emit('initialized', { sessionId: this.sessionId });
                /**
                 * Get current Web Vitals snapshot
                 */
                getCurrentVitals();
                Promise < WebVitalsAnalytics > {
                    return: new Promise((resolve) => {
                        if (typeof window === 'undefined') {
                            resolve(this.createEmptyAnalytics());
                            return;
                            // Force collection of current metrics
                            getCLS((metric) => this.handleMetric(metric), { reportAllChanges: false });
                            getFCP((metric) => this.handleMetric(metric));
                            getFID((metric) => this.handleMetric(metric));
                            getLCP((metric) => this.handleMetric(metric), { reportAllChanges: false });
                            getTTI((metric) => this.handleMetric(metric));
                            // Allow time for metrics collection
                            setTimeout(() => {
                                resolve(this.generateAnalytics());
                            }, 100);
                        }
                    }),
                    /**
                     * Get metric by name
                     */
                    getMetric(name) {
                        return this.metrics.get(name);
                        /**
                        * Get all metrics
                        */
                        getAllMetrics();
                        EnhancedMetric;
                        {
                            return Array.from(this.metrics.values());
                            /**
                            * Clear collected metrics
                            */
                            clearMetrics();
                            void {
                                this: .metrics.clear(),
                                this: .emit('metrics-cleared'),
                                /**
                                * Send analytics data to endpoint
                                */
                                async sendAnalytics(data) {
                                    if (!this.config.enableAnalytics || !this.config.analyticsEndpoint) {
                                        return false;
                                        const analyticsData = data || await this.getCurrentVitals();
                                        try {
                                            const response = await fetch(this.config.analyticsEndpoint, {});
                                            method: 'POST',
                                                headers;
                                            {
                                                'Content-Type';
                                                'application/json',
                                                ;
                                            }
                                            body: JSON.stringify(analyticsData);
                                        }
                                        finally { }
                                        ;
                                        if (response.ok) {
                                            this.emit('analytics-sent', analyticsData);
                                            return true;
                                        }
                                        else {
                                            console.warn('Failed to send Web Vitals analytics:', response.statusText);
                                            return false;
                                        }
                                        try { }
                                        catch (error) {
                                            console.error('Error sending Web Vitals analytics:', error);
                                            this.emit('analytics-error', error);
                                            return false;
                                        }
                                    }
                                },
                                handleMetric(metric) {
                                    const enhancedMetric = this.enhanceMetric(metric);
                                    this.metrics.set(metric.name, enhancedMetric);
                                    if (this.config.enableConsoleLogging) {
                                        console.log(`📊 ${metric.name}:`, {});
                                    }
                                },
                                value: metric.value,
                                rating: enhancedMetric.rating,
                                delta: metric.delta,
                                id: metric.id };
                            ;
                            this.emit('metric-collected', enhancedMetric);
                            // Check for poor performance and emit warnings
                            if (enhancedMetric.rating === 'poor') {
                                this.emit('poor-performance', enhancedMetric);
                            }
                        }
                    },
                    enhanceMetric(metric) {
                        const rating = this.calculateRating(metric);
                        const connectionInfo = this.getConnectionInfo();
                        return {
                            ...metric,
                            rating,
                            timestamp: Date.now(),
                            url: window.location.href,
                            userAgent: navigator.userAgent,
                            connectionType: connectionInfo.type,
                            deviceMemory: connectionInfo.deviceMemory,
                            effectiveType: connectionInfo.effectiveType,
                        };
                    },
                    calculateRating(metric) {
                        const thresholds = this.config.thresholds[metric.name];
                        if (!thresholds)
                            return 'good';
                        if (metric.value <= thresholds.good)
                            return 'good';
                        if (metric.value <= thresholds.poor)
                            return 'needs-improvement';
                        return 'poor';
                    },
                    getConnectionInfo() {
                        // Type assertion for experimental APIs
                        const nav = navigator;
                        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
                        return {
                            type: connection?.type,
                            deviceMemory: nav.deviceMemory,
                            effectiveType: connection?.effectiveType,
                        };
                    },
                    generateSessionId() {
                        return `wv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    },
                    generateAnalytics() {
                        const metrics = this.getAllMetrics();
                        return {
                            sessionId: this.sessionId,
                            timestamp: Date.now(),
                            metrics,
                            summary: {
                                fcp: this.getMetricSummary('FCP'),
                                lcp: this.getMetricSummary('LCP'),
                                fid: this.getMetricSummary('FID'),
                                cls: this.getMetricSummary('CLS'),
                                tti: this.getMetricSummary('TTI'),
                            },
                            deviceInfo: this.getDeviceInfo(),
                            pageInfo: this.getPageInfo()
                        };
                    },
                    createEmptyAnalytics() {
                        return {
                            sessionId: this.sessionId,
                            timestamp: Date.now(),
                            metrics: [],
                            summary: {
                                fcp: { value: 0, rating: 'good' },
                                lcp: { value: 0, rating: 'good' },
                                fid: { value: 0, rating: 'good' },
                                cls: { value: 0, rating: 'good' },
                                tti: { value: 0, rating: 'good' }
                            },
                            deviceInfo: {
                                userAgent: 'Node.js',
                                viewport: { width: 0, height: 0 },
                                devicePixelRatio: 1,
                                hardwareConcurrency: 1
                            },
                            pageInfo: {
                                url: '',
                                referrer: '',
                                title: '',
                                loadTime: 0,
                            },
                            getMetricSummary(name) {
                                const metric = this.getMetric(name);
                                return {
                                    value: metric?.value || 0,
                                    rating: metric?.rating || 'good',
                                };
                            },
                            getDeviceInfo() {
                                if (typeof window === 'undefined') {
                                    return {
                                        userAgent: 'Node.js',
                                        viewport: { width: 0, height: 0 },
                                        devicePixelRatio: 1,
                                        hardwareConcurrency: 1
                                    };
                                    const connectionInfo = this.getConnectionInfo();
                                    return {
                                        userAgent: navigator.userAgent,
                                        viewport: {
                                            width: window.innerWidth,
                                            height: window.innerHeight,
                                        },
                                        devicePixelRatio: window.devicePixelRatio,
                                        connectionType: connectionInfo.type,
                                        deviceMemory: connectionInfo.deviceMemory,
                                        hardwareConcurrency: navigator.hardwareConcurrency
                                    };
                                }
                            },
                            getPageInfo() {
                                if (typeof window === 'undefined') {
                                    return {
                                        url: '',
                                        referrer: '',
                                        title: '',
                                        loadTime: 0,
                                    };
                                    const loadTime = Date.now() - this.startTime;
                                    return {
                                        url: window.location.href,
                                        referrer: document.referrer,
                                        title: document.title,
                                        loadTime
                                    };
                                }
                            },
                            handleVisibilityChange() {
                                if (document.visibilityState === 'hidden') {
                                    this.sendFinalReport();
                                }
                            },
                            handleBeforeUnload() {
                                this.sendFinalReport();
                            },
                            async sendFinalReport() {
                                const analytics = await this.getCurrentVitals();
                                this.emit('final-report', analytics);
                                if (this.config.enableAnalytics) {
                                    await this.sendAnalytics(analytics);
                                    /**
                                    * Create a performance observer for custom metrics
                                    */
                                    createPerformanceObserver(entryTypes, string, callback, (entries) => void );
                                    PerformanceObserver | null;
                                    {
                                        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
                                            return null;
                                            try {
                                                const observer = new PerformanceObserver((list) => {
                                                    callback(list.getEntries());
                                                });
                                                observer.observe({ entryTypes });
                                                return observer;
                                            }
                                            catch (error) {
                                                console.warn('Failed to create PerformanceObserver:', error);
                                                return null;
                                                /**
                                                 * Get Web Vitals configuration
                                                 */
                                                getConfig();
                                                WebVitalsConfig;
                                                {
                                                    return { ...this.config };
                                                    /**
                                                     * Update configuration
                                                     */
                                                    updateConfig(newConfig, (Partial));
                                                    void {
                                                        this: .config = { ...this.config, ...newConfig },
                                                        this: .emit('config-updated', this.config),
                                                        // Default instance for easy usage
                                                        const: webVitals = new WebVitalsIntegration(),
                                                        // Auto-initialize in browser environment
                                                        if(, window) { }
                                                    } !== 'undefined';
                                                    {
                                                        // Initialize after DOM is ready
                                                        if (document.readyState === 'loading') {
                                                            document.addEventListener('DOMContentLoaded', () => webVitals.initialize());
                                                        }
                                                        else {
                                                            webVitals.initialize();
                                                            export default WebVitalsIntegration;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };
                    }
                };
            }
        }
    }
}
