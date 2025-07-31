import { EventEmitter } from 'events';
export var ConnectionState;
(function (ConnectionState) {
    ConnectionState["CONNECTED"] = "connected";
    ConnectionState["CONNECTING"] = "connecting";
    ConnectionState["DISCONNECTED"] = "disconnected";
    ConnectionState["RECONNECTING"] = "reconnecting";
    ConnectionState["FAILED"] = "failed";
    ConnectionState["OFFLINE"] = "offline";
    ConnectionState[ConnectionState["export"] = void 0] = "export";
    ConnectionState[ConnectionState["enum"] = void 0] = "enum";
    ConnectionState[ConnectionState["ConnectionQuality"] = void 0] = "ConnectionQuality";
})(ConnectionState || (ConnectionState = {}));
{
    EXCELLENT = 'excellent',
        GOOD = 'good',
        FAIR = 'fair',
        POOR = 'poor',
        UNKNOWN = 'unknown';
}
 > ;
;
packetLossThreshold: {
    excellent: number;
    good: number;
    fair: number;
}
;
maxHistorySize: number;
offlineDetectionTimeout: number;
onlineCheckUrl: string;
enableNetworkInfoAPI: boolean;
enablePerformanceMonitoring: boolean;
export class ConnectionStateManager extends EventEmitter {
    state = ConnectionState.DISCONNECTED;
    quality = ConnectionQuality.UNKNOWN;
    config;
    stateData;
    pingTimer = null;
    qualityTimer = null;
    offlineTimer = null;
    performanceObserver = null;
    networkChangeHandler = null;
    constructor(config = {}) {
        super();
        this.config = {
            pingInterval: 5000, // 5 seconds,
            qualityCheckInterval: 10000, // 10 seconds,
            latencyThreshold: {
                excellent: 50, // < 50ms,
                good: 150, // < 150ms,
                fair: 300 // < 300ms,
            },
            packetLossThreshold: {
                excellent: 0.01, // < 1%,
                good: 0.05, // < 5%,
                fair: 0.15 // < 15%,
            },
            maxHistorySize: 100,
            offlineDetectionTimeout: 15000, // 15 seconds
            onlineCheckUrl: '/api/health',
            enableNetworkInfoAPI: true,
            enablePerformanceMonitoring: true,
            ...config
        };
        this.stateData = {
            state: ConnectionState.DISCONNECTED,
            quality: ConnectionQuality.UNKNOWN,
            isOnline: navigator.onLine,
            lastConnected: null,
            disconnectedAt: null,
            reconnectAttempts: 0,
            totalDowntime: 0,
            metrics: {
                latency: 0,
                packetLoss: 0,
                bandwidth: 0,
                jitter: 0,
                lastMeasurement: Date.now(),
                measurementCount: 0,
            },
            networkInfo: null,
            stateHistory: []
        };
        this.initializeNetworkMonitoring();
        this.initializePerformanceMonitoring();
        this.startQualityMonitoring();
        /**
         * Get current connection state
         */
        getState();
        ConnectionState;
        {
            return this.state;
            /**
             * Get current connection quality
             */
            getQuality();
            ConnectionQuality;
            {
                return this.quality;
                /**
                 * Get complete state data
                 */
                getStateData();
                ConnectionStateData;
                {
                    return { ...this.stateData };
                    /**
                     * Check if currently online
                     */
                    isOnline();
                    boolean;
                    {
                        return this.stateData.isOnline && this.state === ConnectionState.CONNECTED;
                        /**
                         * Check if connection is stable
                         */
                        isStable();
                        boolean;
                        {
                            return this.isOnline() &&
                                this.quality !== ConnectionQuality.POOR &&
                                this.stateData.metrics.packetLoss < this.config.packetLossThreshold.fair;
                            /**
                             * Update connection state
                             */
                            setState(newState, ConnectionState, reason ?  : string);
                            void {
                                : .state === newState, return: ,
                                const: previousState = this.state,
                                const: timestamp = Date.now(),
                                this: .state = newState,
                                this: .stateData.state = newState,
                                // Update state-specific data
                                switch(newState) {
                                },
                                case: ConnectionState.CONNECTED,
                                this: .stateData.lastConnected = timestamp,
                                this: .stateData.disconnectedAt = null,
                                this: .stateData.reconnectAttempts = 0,
                                this: .stateData.isOnline = true,
                                this: .startPingMonitoring(),
                                break: ,
                                case: ConnectionState.DISCONNECTED,
                                case: ConnectionState.OFFLINE,
                                : .stateData.lastConnected && !this.stateData.disconnectedAt
                            };
                            {
                                this.stateData.disconnectedAt = timestamp;
                                this.stateData.isOnline = false;
                                this.stopPingMonitoring();
                                break;
                                ConnectionState.RECONNECTING;
                                this.stateData.reconnectAttempts++;
                                break;
                                ConnectionState.FAILED;
                                this.stateData.isOnline = false;
                                this.stopPingMonitoring();
                                break;
                                // Update state history
                                this.addToStateHistory(newState, timestamp, reason);
                                // Calculate total downtime
                                if (previousState === ConnectionState.CONNECTED && )
                                    (newState === ConnectionState.DISCONNECTED || newState === ConnectionState.OFFLINE);
                                {
                                    this.updateDowntime();
                                    console.log(`Connection state changed: ${previousState} -> ${newState}${reason ? ` (${reason})` : ''}`);
                                }
                                this.emit('state_changed', {});
                                previousState,
                                    newState,
                                    timestamp,
                                    reason,
                                    stateData;
                                this.getStateData(),
                                ;
                            }
                            ;
                            /**
                             * Update connection quality based on metrics
                             */
                            updateQuality(metrics ?  : Partial);
                            void {
                                if(metrics) {
                                    this.updateMetrics(metrics);
                                    const newQuality = this.calculateQuality();
                                    if (this.quality !== newQuality) {
                                        const previousQuality = this.quality;
                                        this.quality = newQuality;
                                        this.stateData.quality = newQuality;
                                        console.log(`Connection quality changed: ${previousQuality} -> ${newQuality}`);
                                    }
                                    this.emit('quality_changed', {});
                                    previousQuality,
                                        newQuality,
                                        metrics;
                                    { }
                                }, ...this.stateData.metrics
                            },
                                timestamp;
                            Date.now();
                        }
                        ;
                        /**
                         * Update connection metrics
                         */
                        updateMetrics(metrics, (Partial));
                        void {
                            const: timestamp = Date.now(),
                            // Update metrics with exponential moving average
                            if(metrics) { }, : .latency !== undefined
                        };
                        {
                            this.stateData.metrics.latency = this.stateData.metrics.measurementCount === 0
                                ? metrics.latency
                                : (this.stateData.metrics.latency * 0.8) + (metrics.latency * 0.2);
                            if (metrics.packetLoss !== undefined) {
                                this.stateData.metrics.packetLoss = this.stateData.metrics.measurementCount === 0
                                    ? metrics.packetLoss
                                    : (this.stateData.metrics.packetLoss * 0.9) + (metrics.packetLoss * 0.1);
                                if (metrics.bandwidth !== undefined) {
                                    this.stateData.metrics.bandwidth = metrics.bandwidth;
                                    if (metrics.jitter !== undefined) {
                                        this.stateData.metrics.jitter = this.stateData.metrics.measurementCount === 0
                                            ? metrics.jitter
                                            : (this.stateData.metrics.jitter * 0.8) + (metrics.jitter * 0.2);
                                        this.stateData.metrics.lastMeasurement = timestamp;
                                        this.stateData.metrics.measurementCount++;
                                        this.emit('metrics_updated', { ...this.stateData.metrics });
                                        /**
                                         * Perform connection test
                                         */
                                        async;
                                        testConnection();
                                        Promise < ConnectionMetrics > {
                                            const: startTime = performance.now(),
                                            try: {
                                                const: response = await fetch(this.config.onlineCheckUrl, {}),
                                                method: 'HEAD',
                                                cache: 'no-cache',
                                                timeout: 5000,
                                            },
                                            const: endTime = performance.now(),
                                            const: latency = endTime - startTime,
                                            const: metrics, ConnectionMetrics = {
                                                latency,
                                                packetLoss: response.ok ? 0 : 1,
                                                bandwidth: 0, // Would need separate bandwidth test,
                                                jitter: Math.abs(latency - this.stateData.metrics.latency),
                                                lastMeasurement: Date.now(),
                                                measurementCount: this.stateData.metrics.measurementCount + 1,
                                            },
                                            return: metrics
                                        };
                                        try { }
                                        catch (error) {
                                            const endTime = performance.now();
                                            const latency = endTime - startTime;
                                            return {
                                                latency,
                                                packetLoss: 1,
                                                bandwidth: 0,
                                                jitter: 0,
                                                lastMeasurement: Date.now(),
                                                measurementCount: this.stateData.metrics.measurementCount + 1,
                                            };
                                            /**
                                             * Get connection statistics
                                             */
                                            getStatistics();
                                            {
                                                const now = Date.now();
                                                const uptime = this.stateData.lastConnected ? now - this.stateData.lastConnected : 0;
                                                const stateFrequency = this.calculateStateFrequency();
                                                return {
                                                    currentState: this.state,
                                                    currentQuality: this.quality,
                                                    uptime,
                                                    totalDowntime: this.stateData.totalDowntime,
                                                    reconnectAttempts: this.stateData.reconnectAttempts,
                                                    averageLatency: this.stateData.metrics.latency,
                                                    packetLossRate: this.stateData.metrics.packetLoss,
                                                    measurementCount: this.stateData.metrics.measurementCount,
                                                    stateFrequency,
                                                    reliability: this.calculateReliability(),
                                                    lastMeasurement: this.stateData.metrics.lastMeasurement,
                                                };
                                                /**
                                                 * Reset connection state and metrics
                                                 */
                                                reset();
                                                void {
                                                    this: .stopAllTimers(),
                                                    this: .state = ConnectionState.DISCONNECTED,
                                                    this: .quality = ConnectionQuality.UNKNOWN,
                                                    this: .stateData = {
                                                        state: ConnectionState.DISCONNECTED,
                                                        quality: ConnectionQuality.UNKNOWN,
                                                        isOnline: navigator.onLine,
                                                        lastConnected: null,
                                                        disconnectedAt: null,
                                                        reconnectAttempts: 0,
                                                        totalDowntime: 0,
                                                        metrics: {
                                                            latency: 0,
                                                            packetLoss: 0,
                                                            bandwidth: 0,
                                                            jitter: 0,
                                                            lastMeasurement: Date.now(),
                                                            measurementCount: 0,
                                                        },
                                                        networkInfo: null,
                                                        stateHistory: []
                                                    },
                                                    this: .startQualityMonitoring(),
                                                    this: .emit('reset'),
                                                    /**
                                                     * Cleanup and stop monitoring
                                                     */
                                                    cleanup() {
                                                        this.stopAllTimers();
                                                        if (this.performanceObserver) {
                                                            this.performanceObserver.disconnect();
                                                            if (this.networkChangeHandler) {
                                                                window.removeEventListener('online', this.networkChangeHandler);
                                                                window.removeEventListener('offline', this.networkChangeHandler);
                                                                this.removeAllListeners();
                                                                /**
                                                                * Initialize network monitoring
                                                                */
                                                            }
                                                            /**
                                                            * Initialize network monitoring
                                                            */
                                                        }
                                                        /**
                                                        * Initialize network monitoring
                                                        */
                                                    }
                                                    /**
                                                    * Initialize network monitoring
                                                    */
                                                    ,
                                                    /**
                                                    * Initialize network monitoring
                                                    */
                                                    initializeNetworkMonitoring() {
                                                        // Monitor online/offline events
                                                        this.networkChangeHandler = () => {
                                                            const isOnline = navigator.onLine;
                                                            this.stateData.isOnline = isOnline;
                                                            if (isOnline) {
                                                                this.setState(ConnectionState.CONNECTING, 'Browser detected online');
                                                            }
                                                            else {
                                                                this.setState(ConnectionState.OFFLINE, 'Browser detected offline');
                                                            }
                                                            ;
                                                            window.addEventListener('online', this.networkChangeHandler);
                                                            window.addEventListener('offline', this.networkChangeHandler);
                                                            // Network Information API
                                                            if (this.config.enableNetworkInfoAPI && 'connection' in navigator) {
                                                                const connection = navigator.connection;
                                                                const updateNetworkInfo = () => {
                                                                    this.stateData.networkInfo = {
                                                                        type: connection.type || 'unknown',
                                                                        effectiveType: connection.effectiveType || 'unknown',
                                                                        downlink: connection.downlink || 0,
                                                                        rtt: connection.rtt || 0,
                                                                        saveData: connection.saveData || false,
                                                                    };
                                                                    this.emit('network_info_changed', this.stateData.networkInfo);
                                                                };
                                                                connection.addEventListener('change', updateNetworkInfo);
                                                                updateNetworkInfo();
                                                                /**
                                                                 * Initialize performance monitoring
                                                                 */
                                                            }
                                                            /**
                                                             * Initialize performance monitoring
                                                             */
                                                        };
                                                        /**
                                                         * Initialize performance monitoring
                                                         */
                                                    } // Initial update
                                                    /**
                                                     * Initialize performance monitoring
                                                     */
                                                    , // Initial update
                                                    /**
                                                     * Initialize performance monitoring
                                                     */
                                                    initializePerformanceMonitoring() {
                                                        if (!this.config.enablePerformanceMonitoring || !window.PerformanceObserver) {
                                                            return;
                                                            try {
                                                                this.performanceObserver = new PerformanceObserver((entries) => {
                                                                    for (const entry of entries.getEntries()) {
                                                                        if (entry.entryType === 'navigation') {
                                                                            const navEntry = entry;
                                                                            this.updateMetrics({});
                                                                            latency: navEntry.responseEnd - navEntry.requestStart,
                                                                                bandwidth;
                                                                            navEntry.transferSize / (navEntry.loadEventEnd - navEntry.loadEventStart) * 1000,
                                                                            ;
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                            finally { }
                                                            ;
                                                            this.performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
                                                        }
                                                        try { }
                                                        catch (error) {
                                                            console.warn('Performance monitoring not available:', error);
                                                            /**
                                                            * Start ping monitoring
                                                            */
                                                        }
                                                        /**
                                                        * Start ping monitoring
                                                        */
                                                    }
                                                    /**
                                                    * Start ping monitoring
                                                    */
                                                    ,
                                                    /**
                                                    * Start ping monitoring
                                                    */
                                                    startPingMonitoring() {
                                                        if (this.pingTimer)
                                                            return;
                                                        this.pingTimer = setInterval(async () => {
                                                            try {
                                                                const metrics = await this.testConnection();
                                                                this.updateMetrics(metrics);
                                                                this.updateQuality();
                                                                // Detect disconnection based on failed pings
                                                                if (metrics.packetLoss >= 1) {
                                                                    this.handlePingFailure();
                                                                }
                                                                try { }
                                                                catch (error) {
                                                                    this.handlePingFailure();
                                                                }
                                                                this.config.pingInterval;
                                                            }
                                                            finally { }
                                                        });
                                                        /**
                                                         * Stop ping monitoring
                                                         */
                                                    }
                                                    /**
                                                     * Stop ping monitoring
                                                     */
                                                    ,
                                                    /**
                                                     * Stop ping monitoring
                                                     */
                                                    stopPingMonitoring() {
                                                        if (this.pingTimer) {
                                                            clearInterval(this.pingTimer);
                                                            this.pingTimer = null;
                                                            /**
                                                            * Start quality monitoring
                                                            */
                                                        }
                                                        /**
                                                        * Start quality monitoring
                                                        */
                                                    }
                                                    /**
                                                    * Start quality monitoring
                                                    */
                                                    ,
                                                    /**
                                                    * Start quality monitoring
                                                    */
                                                    startQualityMonitoring() {
                                                        if (this.qualityTimer)
                                                            return;
                                                        this.qualityTimer = setInterval(() => {
                                                            this.updateQuality();
                                                        }, this.config.qualityCheckInterval);
                                                        /**
                                                         * Handle ping failure
                                                         */
                                                    }
                                                    /**
                                                     * Handle ping failure
                                                     */
                                                    ,
                                                    /**
                                                     * Handle ping failure
                                                     */
                                                    handlePingFailure() {
                                                        if (this.offlineTimer)
                                                            return; // Already handling
                                                        this.offlineTimer = setTimeout(() => {
                                                            if (this.state === ConnectionState.CONNECTED) {
                                                                this.setState(ConnectionState.DISCONNECTED, 'Ping failures detected');
                                                                this.offlineTimer = null;
                                                            }
                                                            this.config.offlineDetectionTimeout;
                                                        });
                                                        /**
                                                         * Calculate connection quality based on metrics
                                                         */
                                                    }
                                                    /**
                                                     * Calculate connection quality based on metrics
                                                     */
                                                    ,
                                                    /**
                                                     * Calculate connection quality based on metrics
                                                     */
                                                    calculateQuality() {
                                                        if (this.stateData.metrics.measurementCount === 0) {
                                                            return ConnectionQuality.UNKNOWN;
                                                            const latency = this.stateData.metrics.latency;
                                                            const packetLoss = this.stateData.metrics.packetLoss;
                                                            // Determine quality based on thresholds
                                                            if (latency <= this.config.latencyThreshold.excellent && )
                                                                packetLoss <= this.config.packetLossThreshold.excellent;
                                                            {
                                                                return ConnectionQuality.EXCELLENT;
                                                            }
                                                        }
                                                        else if (latency <= this.config.latencyThreshold.good && )
                                                            packetLoss <= this.config.packetLossThreshold.good;
                                                        {
                                                            return ConnectionQuality.GOOD;
                                                        }
                                                    }, else: , if(latency) { }
                                                } <= this.config.latencyThreshold.fair && ;
                                                packetLoss <= this.config.packetLossThreshold.fair;
                                                {
                                                    return ConnectionQuality.FAIR;
                                                }
                                                {
                                                    return ConnectionQuality.POOR;
                                                    /**
                                                     * Add state to history
                                                     */
                                                }
                                                /**
                                                 * Add state to history
                                                 */
                                            }
                                            /**
                                             * Add state to history
                                             */
                                        }
                                        /**
                                         * Add state to history
                                         */
                                    }
                                    /**
                                     * Add state to history
                                     */
                                }
                                /**
                                 * Add state to history
                                 */
                            }
                            /**
                             * Add state to history
                             */
                        }
                        /**
                         * Add state to history
                         */
                    }
                    /**
                     * Add state to history
                     */
                }
                /**
                 * Add state to history
                 */
            }
            /**
             * Add state to history
             */
        }
        /**
         * Add state to history
         */
    }
    /**
     * Add state to history
     */
    addToStateHistory(state, timestamp, reason) {
        this.stateData.stateHistory.push({ state, timestamp, reason });
        // Trim history if too large
        if (this.stateData.stateHistory.length > this.config.maxHistorySize) {
            this.stateData.stateHistory = this.stateData.stateHistory.slice(-this.config.maxHistorySize);
            /**
            * Update total downtime
            */
        }
        /**
        * Update total downtime
        */
    }
    /**
    * Update total downtime
    */
    updateDowntime() {
        if (this.stateData.disconnectedAt && this.stateData.lastConnected) {
            const downtime = Date.now() - this.stateData.disconnectedAt;
            this.stateData.totalDowntime += downtime;
            /**
            * Calculate state frequency
            */
        }
        /**
        * Calculate state frequency
        */
    }
    /**
    * Calculate state frequency
    */
    calculateStateFrequency() {
        const frequency = {
            [ConnectionState.CONNECTED]: 0,
            [ConnectionState.CONNECTING]: 0,
            [ConnectionState.DISCONNECTED]: 0,
            [ConnectionState.RECONNECTING]: 0,
            [ConnectionState.FAILED]: 0,
            [ConnectionState.OFFLINE]: 0,
        };
        for (const entry of this.stateData.stateHistory) {
            frequency[entry.state]++;
            return frequency;
            /**
             * Calculate connection reliability
             */
        }
        /**
         * Calculate connection reliability
         */
    }
    /**
     * Calculate connection reliability
     */
    calculateReliability() {
        if (this.stateData.stateHistory.length === 0)
            return 0;
        const connectedCount = this.stateData.stateHistory.filter();
        ;
        entry => entry.state === ConnectionState.CONNECTED;
        length;
        return connectedCount / this.stateData.stateHistory.length;
        /**
         * Stop all timers
         */
    }
    /**
     * Stop all timers
     */
    stopAllTimers() {
        this.stopPingMonitoring();
        if (this.qualityTimer) {
            clearInterval(this.qualityTimer);
            this.qualityTimer = null;
            if (this.offlineTimer) {
                clearTimeout(this.offlineTimer);
                this.offlineTimer = null;
            }
        }
    }
}
