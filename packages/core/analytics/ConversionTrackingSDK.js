/**
 * Conversion Tracking SDK - Story 30.2 Task 2
 *
 * Client-side tracking SDK that extends Epic 1's AnalyticsClient
 * for comprehensive conversion event tracking and real-time streaming.
 *
 * Features:
 * - Real-time conversion event tracking
 * - Automatic session correlation
 * - Privacy-compliant data collection
 * - Offline event buffering
 * - Cross-device user identification
 * - Event validation and deduplication
 */
import { AnalyticsClient } from './AnalyticsClient.js';
/**
 * Enhanced Conversion Tracking SDK
 * Extends Epic 1 AnalyticsClient with advanced conversion tracking capabilities
 */
export class ConversionTrackingSDK extends AnalyticsClient {
    conversionConfig;
    conversionArchitecture;
    sessionManager;
    eventQueue = [];
    offlineBuffer = [];
    streamingConnection = null;
    flushTimer = null;
    isOnline = navigator.onLine;
    recentEventHashes = new Map();
    trackingMetrics = {
        eventsTracked: 0,
        eventsQueued: 0,
        eventsDropped: 0,
        streamingLatency: 0,
        validationErrors: 0,
        duplicatesFiltered: 0,
        offlineEvents: 0,
        privacyBlockedEvents: 0
    };
    constructor(config, conversionArchitecture, sessionManager) {
        super(config);
        this.conversionConfig = {
            enableRealTimeStreaming: true,
            streamingEndpoint: '/api/conversion-events/stream',
            batchSize: 50,
            flushInterval: 5000,
            respectDoNotTrack: true,
            requireExplicitConsent: false,
            enableCrossDeviceTracking: false,
            enableOfflineBuffering: true,
            maxOfflineEvents: 1000,
            eventValidationRules: [],
            deduplicationWindow: 60000, // 1 minute
            enableDebugLogging: false,
            ...config
        };
        this.conversionArchitecture = conversionArchitecture;
        this.sessionManager = sessionManager;
        this.initializeTracking();
        this.setupEventListeners();
        this.startPeriodicFlush();
    }
    initializeTracking() {
        // Initialize WebSocket connection for real-time streaming
        if (this.conversionConfig.enableRealTimeStreaming) {
            this.initializeStreamingConnection();
        }
        // Load offline events from storage
        if (this.conversionConfig.enableOfflineBuffering) {
            this.loadOfflineEvents();
        }
        // Setup default validation rules
        this.setupDefaultValidationRules();
        this.debugLog('ConversionTrackingSDK initialized', {
            config: this.conversionConfig,
            online: this.isOnline
        });
    }
    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.debugLog('Network online - processing offline buffer');
            this.processOfflineBuffer();
            this.initializeStreamingConnection();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.debugLog('Network offline - buffering events');
            this.closeStreamingConnection();
        });
        // Page visibility for pause/resume tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushQueue();
            }
        });
        // Beforeunload to flush remaining events
        window.addEventListener('beforeunload', () => {
            this.flushQueue();
            this.saveOfflineEvents();
        });
    }
    initializeStreamingConnection() {
        if (!this.isOnline || !this.conversionConfig.enableRealTimeStreaming)
            return;
        try {
            const wsUrl = this.conversionConfig.streamingEndpoint.replace('http', 'ws');
            this.streamingConnection = new WebSocket(`${this.conversionConfig.baseUrl}${wsUrl}`);
            this.streamingConnection.onopen = () => {
                this.debugLog('WebSocket connection established');
                this.emit('streaming_connected');
            };
            this.streamingConnection.onclose = () => {
                this.debugLog('WebSocket connection closed');
                this.emit('streaming_disconnected');
                // Attempt to reconnect after delay
                setTimeout(() => {
                    if (this.isOnline) {
                        this.initializeStreamingConnection();
                    }
                }, 5000);
            };
            this.streamingConnection.onerror = (error) => {
                this.debugLog('WebSocket error', error);
                this.emit('streaming_error', error);
            };
        }
        catch (error) {
            this.debugLog('Failed to initialize WebSocket', error);
        }
    }
    closeStreamingConnection() {
        if (this.streamingConnection) {
            this.streamingConnection.close();
            this.streamingConnection = null;
        }
    }
    /**
     * Track conversion event with enhanced capabilities
     */
    async trackConversionEvent(eventType, properties = {}, value, touchpoints = []) {
        try {
            // Check privacy compliance
            if (!this.isTrackingAllowed()) {
                this.trackingMetrics.privacyBlockedEvents++;
                this.debugLog('Event blocked by privacy settings', { eventType });
                return false;
            }
            // Get current context
            const context = await this.getCurrentContext(touchpoints);
            // Create base conversion event
            const baseEvent = {
                id: this.generateEventId(),
                userId: context.userId,
                sessionId: context.sessionId,
                timestamp: Date.now(),
                type: eventType,
                category: this.getCategoryForEventType(eventType),
                value,
                properties: {
                    ...properties,
                    deviceId: context.deviceId,
                    source: context.attribution.source,
                    medium: context.attribution.medium,
                    campaign: context.attribution.campaign
                },
                metadata: {
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    url: window.location.href,
                    timestamp: Date.now()
                }
            };
            // Create enhanced event with attribution
            const enhancedEvent = this.conversionArchitecture.createEnhancedEvent(baseEvent, context.touchpoints, context.privacyConsent);
            // Validate event
            const validationResult = this.validateEvent(enhancedEvent);
            if (!validationResult.isValid) {
                this.trackingMetrics.validationErrors++;
                this.debugLog('Event validation failed', validationResult.errors);
                return false;
            }
            // Check for duplicates
            if (this.isDuplicateEvent(enhancedEvent)) {
                this.trackingMetrics.duplicatesFiltered++;
                this.debugLog('Duplicate event filtered', { eventType, eventId: enhancedEvent.id });
                return false;
            }
            // Queue event for processing
            await this.queueEvent(enhancedEvent);
            // Update session with conversion event
            this.sessionManager.trackConversionEvent(eventType, value, properties);
            this.trackingMetrics.eventsTracked++;
            this.debugLog('Conversion event tracked', { eventType, eventId: enhancedEvent.id });
            return true;
        }
        catch (error) {
            this.debugLog('Error tracking conversion event', error);
            this.reportError('trackConversionEvent', error);
            return false;
        }
    }
    /**
     * Track funnel step progression
     */
    async trackFunnelStep(funnelId, stepId, properties = {}) {
        return this.trackConversionEvent(`funnel_step_${stepId}`, {
            funnelId,
            stepId,
            ...properties
        });
    }
    /**
     * Track attribution touchpoint
     */
    async trackTouchpoint(channel, source, medium, properties = {}) {
        const touchpoint = {
            id: this.generateTouchpointId(),
            timestamp: Date.now(),
            channel: channel,
            source,
            medium,
            position: 1, // Will be calculated based on session history
            influence: 0.5, // Default influence score
            value: properties.value || 0,
            campaign: properties.campaign,
            content: properties.content,
            term: properties.term
        };
        return this.trackConversionEvent('touchpoint_tracked', {
            touchpoint,
            ...properties
        }, undefined, [touchpoint]);
    }
    /**
     * Update user consent preferences
     */
    updateConsentPreferences(consent) {
        this.sessionManager.updateConsentPreferences(consent);
        // If tracking was disabled, flush and clear queues
        if (consent.tracking === false) {
            this.flushQueue();
            this.clearEventData();
        }
        this.debugLog('Consent preferences updated', consent);
    }
    /**
     * Get current tracking metrics
     */
    getTrackingMetrics() {
        return {
            ...this.trackingMetrics,
            queueSize: this.eventQueue.length,
            offlineBufferSize: this.offlineBuffer.length,
            streamingConnected: this.streamingConnection?.readyState === WebSocket.OPEN
        };
    }
    /**
     * Manually flush event queue
     */
    async flushQueue() {
        if (this.eventQueue.length === 0)
            return;
        this.debugLog('Flushing event queue', { queueSize: this.eventQueue.length });
        if (this.isOnline && this.streamingConnection?.readyState === WebSocket.OPEN) {
            await this.flushToStream();
        }
        else {
            await this.flushToAPI();
        }
    }
    async getCurrentContext(additionalTouchpoints = []) {
        const sessionAnalytics = this.sessionManager.getCurrentSessionAnalytics();
        // Get stored touchpoints and merge with new ones
        const existingTouchpoints = this.getStoredTouchpoints();
        const allTouchpoints = [...existingTouchpoints, ...additionalTouchpoints];
        return {
            sessionId: this.getCurrentSessionId(),
            userId: this.getCurrentUserId(),
            deviceId: this.getDeviceId(),
            timestamp: Date.now(),
            touchpoints: allTouchpoints,
            privacyConsent: this.getPrivacyConsent(),
            attribution: this.getAttributionData()
        };
    }
    isTrackingAllowed() {
        // Check Do Not Track
        if (this.conversionConfig.respectDoNotTrack && navigator.doNotTrack === '1') {
            return false;
        }
        // Check explicit consent requirement
        if (this.conversionConfig.requireExplicitConsent) {
            const consent = this.getPrivacyConsent();
            return consent.tracking && consent.analytics;
        }
        return true;
    }
    validateEvent(event) {
        const errors = [];
        // Apply validation rules
        for (const rule of this.conversionConfig.eventValidationRules) {
            const value = this.getNestedProperty(event, rule.field);
            switch (rule.type) {
                case 'required':
                    if (value == null || value === '') {
                        errors.push(`${rule.field} is required: ${rule.errorMessage}`);
                    }
                    break;
                case 'pattern':
                    if (value && typeof value === 'string' && rule.value instanceof RegExp) {
                        if (!rule.value.test(value)) {
                            errors.push(`${rule.field} pattern mismatch: ${rule.errorMessage}`);
                        }
                    }
                    break;
                case 'range':
                    if (typeof value === 'number' && rule.value) {
                        const { min, max } = rule.value;
                        if ((min != null && value < min) || (max != null && value > max)) {
                            errors.push(`${rule.field} out of range: ${rule.errorMessage}`);
                        }
                    }
                    break;
                case 'custom':
                    if (rule.validator && !rule.validator(value)) {
                        errors.push(`${rule.field} custom validation failed: ${rule.errorMessage}`);
                    }
                    break;
            }
        }
        return { isValid: errors.length === 0, errors };
    }
    isDuplicateEvent(event) {
        const eventHash = this.generateEventHash(event);
        const now = Date.now();
        // Check if we've seen this event recently
        const lastSeen = this.recentEventHashes.get(eventHash);
        if (lastSeen && (now - lastSeen) < this.conversionConfig.deduplicationWindow) {
            return true;
        }
        // Store this event hash
        this.recentEventHashes.set(eventHash, now);
        // Clean up old hashes
        for (const [hash, timestamp] of this.recentEventHashes.entries()) {
            if ((now - timestamp) > this.conversionConfig.deduplicationWindow) {
                this.recentEventHashes.delete(hash);
            }
        }
        return false;
    }
    generateEventHash(event) {
        const hashData = {
            userId: event.userId,
            type: event.type,
            timestamp: Math.floor(event.timestamp / 1000), // Round to second
            value: event.value,
            key: event.properties?.key // Include a key property if present
        };
        return btoa(JSON.stringify(hashData)).substring(0, 16);
    }
    async queueEvent(event) {
        const queuedEvent = {
            event,
            timestamp: Date.now(),
            retryCount: 0,
            queuedOffline: !this.isOnline
        };
        if (this.isOnline) {
            this.eventQueue.push(queuedEvent);
            this.trackingMetrics.eventsQueued++;
            // Flush immediately if queue is full
            if (this.eventQueue.length >= this.conversionConfig.batchSize) {
                await this.flushQueue();
            }
        }
        else {
            this.addToOfflineBuffer(queuedEvent);
        }
    }
    addToOfflineBuffer(event) {
        this.offlineBuffer.push(event);
        this.trackingMetrics.offlineEvents++;
        // Enforce buffer size limit
        if (this.offlineBuffer.length > this.conversionConfig.maxOfflineEvents) {
            this.offlineBuffer.shift(); // Remove oldest event
            this.trackingMetrics.eventsDropped++;
        }
        this.saveOfflineEvents();
    }
    async flushToStream() {
        if (!this.streamingConnection || this.streamingConnection.readyState !== WebSocket.OPEN) {
            return this.flushToAPI();
        }
        const events = this.eventQueue.splice(0, this.conversionConfig.batchSize);
        if (events.length === 0)
            return;
        try {
            const startTime = Date.now();
            const payload = {
                type: 'conversion_events_batch',
                events: events.map(qe => qe.event),
                metadata: {
                    batchId: this.generateBatchId(),
                    timestamp: Date.now(),
                    source: 'conversion_tracking_sdk'
                }
            };
            this.streamingConnection.send(JSON.stringify(payload));
            const latency = Date.now() - startTime;
            this.trackingMetrics.streamingLatency = latency;
            this.debugLog('Events streamed successfully', {
                eventCount: events.length,
                latency
            });
        }
        catch (error) {
            this.debugLog('Streaming failed, fallback to API', error);
            // Add events back to queue and try API
            this.eventQueue.unshift(...events);
            await this.flushToAPI();
        }
    }
    async flushToAPI() {
        const events = this.eventQueue.splice(0, this.conversionConfig.batchSize);
        if (events.length === 0)
            return;
        try {
            const response = await this.makeRequest('/analytics/conversion-events/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: events.map(qe => qe.event),
                    metadata: {
                        batchId: this.generateBatchId(),
                        timestamp: Date.now(),
                        source: 'conversion_tracking_sdk'
                    }
                })
            });
            if (response.success) {
                this.debugLog('Events sent to API successfully', {
                    eventCount: events.length
                });
            }
            else {
                throw new Error(response.error || 'API request failed');
            }
        }
        catch (error) {
            this.debugLog('API flush failed', error);
            // Add events back to queue for retry
            events.forEach(event => {
                event.retryCount++;
                if (event.retryCount < 3) {
                    this.eventQueue.push(event);
                }
                else {
                    this.trackingMetrics.eventsDropped++;
                }
            });
            this.reportError('flushToAPI', error);
        }
    }
    async processOfflineBuffer() {
        if (this.offlineBuffer.length === 0)
            return;
        this.debugLog('Processing offline buffer', {
            bufferSize: this.offlineBuffer.length
        });
        // Move offline events to main queue
        this.eventQueue.push(...this.offlineBuffer);
        this.offlineBuffer = [];
        // Flush the queue
        await this.flushQueue();
        // Clear offline storage
        this.saveOfflineEvents();
    }
    startPeriodicFlush() {
        this.flushTimer = setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.flushQueue();
            }
        }, this.conversionConfig.flushInterval);
    }
    setupDefaultValidationRules() {
        const defaultRules = [
            {
                field: 'id',
                type: 'required',
                errorMessage: 'Event ID is required'
            },
            {
                field: 'userId',
                type: 'required',
                errorMessage: 'User ID is required'
            },
            {
                field: 'type',
                type: 'required',
                errorMessage: 'Event type is required'
            },
            {
                field: 'timestamp',
                type: 'range',
                value: { min: Date.now() - 86400000, max: Date.now() + 300000 }, // 24h ago to 5min future
                errorMessage: 'Event timestamp must be recent'
            }
        ];
        this.conversionConfig.eventValidationRules.push(...defaultRules);
    }
    loadOfflineEvents() {
        try {
            const stored = localStorage.getItem('ps_offline_events');
            if (stored) {
                this.offlineBuffer = JSON.parse(stored);
                this.debugLog('Loaded offline events', { count: this.offlineBuffer.length });
            }
        }
        catch (error) {
            this.debugLog('Failed to load offline events', error);
        }
    }
    saveOfflineEvents() {
        try {
            localStorage.setItem('ps_offline_events', JSON.stringify(this.offlineBuffer));
        }
        catch (error) {
            this.debugLog('Failed to save offline events', error);
        }
    }
    clearEventData() {
        this.eventQueue = [];
        this.offlineBuffer = [];
        this.recentEventHashes.clear();
        this.saveOfflineEvents();
        this.debugLog('Event data cleared');
    }
    // Helper methods
    generateEventId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTouchpointId() {
        return `tp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getCurrentSessionId() {
        return sessionStorage.getItem('sessionId') || 'session_' + Date.now();
    }
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'anonymous';
    }
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
    getPrivacyConsent() {
        const stored = localStorage.getItem('ps_consent');
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch (e) {
                // Fallback to conservative defaults
            }
        }
        return {
            tracking: false,
            analytics: true,
            personalization: false,
            crossDevice: false
        };
    }
    getAttributionData() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || 'direct',
            medium: params.get('utm_medium') || 'none',
            campaign: params.get('utm_campaign') || undefined,
            content: params.get('utm_content') || undefined,
            term: params.get('utm_term') || undefined
        };
    }
    getStoredTouchpoints() {
        try {
            const stored = sessionStorage.getItem('ps_touchpoints');
            return stored ? JSON.parse(stored) : [];
        }
        catch (e) {
            return [];
        }
    }
    getCategoryForEventType(eventType) {
        if (eventType.includes('purchase') || eventType.includes('upgrade'))
            return 'revenue';
        if (eventType.includes('view') || eventType.includes('visit'))
            return 'activation';
        if (eventType.includes('signup') || eventType.includes('register'))
            return 'acquisition';
        return 'engagement';
    }
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    debugLog(message, data) {
        if (this.conversionConfig.enableDebugLogging) {
            console.log(`[ConversionTrackingSDK] ${message}`, data);
        }
    }
    reportError(context, error) {
        if (this.conversionConfig.errorReportingEndpoint) {
            // Send error to monitoring service
            fetch(this.conversionConfig.errorReportingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context,
                    error: error.message || String(error),
                    timestamp: Date.now(),
                    userId: this.getCurrentUserId(),
                    sessionId: this.getCurrentSessionId()
                })
            }).catch(e => {
                this.debugLog('Failed to report error', e);
            });
        }
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.closeStreamingConnection();
        this.flushQueue();
        this.saveOfflineEvents();
        this.debugLog('ConversionTrackingSDK destroyed');
    }
}
/**
 * Factory function to create ConversionTrackingSDK instance
 */
export const createConversionTrackingSDK = (config, conversionArchitecture, sessionManager) => {
    return new ConversionTrackingSDK(config, conversionArchitecture, sessionManager);
};
export default ConversionTrackingSDK;
