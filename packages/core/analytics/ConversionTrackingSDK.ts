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
import { AnalyticsClient, AnalyticsClientConfig } from './AnalyticsClient';
import { ConversionArchitectureManager, EnhancedConversionEvent, TouchPoint } from './ConversionFunnelArchitecture';
import { SessionTrackingManager } from './SessionTrackingIntegration';
import { ConversionEvent, ConversionEventType, ConversionCategory } from './ConversionTracker';

export interface ConversionTrackingConfig extends AnalyticsClientConfig {
  // Real-time streaming configuration
  enableRealTimeStreaming: boolean;,
  streamingEndpoint: string;
  batchSize: number;,
  flushInterval: number; // milliseconds,
  // Privacy and consent
  respectDoNotTrack: boolean;,
  requireExplicitConsent: boolean;
  enableCrossDeviceTracking: boolean;
  // Performance and reliability
  enableOfflineBuffering: boolean;,
  maxOfflineEvents: number;
  eventValidationRules: EventValidationRule;,
  deduplicationWindow: number; // milliseconds,
  // Debug and monitoring
  enableDebugLogging: boolean;
  errorReportingEndpoint?: string;
  export interface EventValidationRule {
  field: string;,
  type: 'required' | 'pattern' | 'range' | 'custom';
  value?: unknown;
  validator?: (value: unknown) => boolean;,
  errorMessage: string;
}
export interface QueuedEvent {
  event: EnhancedConversionEvent;,
  timestamp: number;
  retryCount: number;,
  queuedOffline: boolean;
}
export interface TrackingMetrics {
  eventsTracked: number;,
  eventsQueued: number;
  eventsDropped: number;,
  streamingLatency: number;
  validationErrors: number;,
  duplicatesFiltered: number;
  offlineEvents: number;,
  privacyBlockedEvents: number;
}
export interface ConversionContext {
  sessionId: string;,
  userId: string;
  deviceId: string;,
  timestamp: number;
  touchpoints: TouchPoint;,
  privacyConsent: {,
  tracking: boolean;,
  analytics: boolean;
  personalization: boolean;,
  crossDevice: boolean;
};
  attribution: {,
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
};
/**
 * Enhanced Conversion Tracking SDK
 * Extends Epic 1 AnalyticsClient with advanced conversion tracking capabilities
 */
}
export class ConversionTrackingSDK extends AnalyticsClient {
  private conversionConfig: ConversionTrackingConfig;
  private conversionArchitecture: ConversionArchitectureManager;
  private sessionManager: SessionTrackingManager;
  private eventQueue: QueuedEvent = [];
  private offlineBuffer: QueuedEvent = [];
  private streamingConnection: WebSocket | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private recentEventHashes: Map<string, number> = new Map();
  private trackingMetrics: TrackingMetrics = {,
  eventsTracked: 0,
  eventsQueued: 0,
  eventsDropped: 0,
  streamingLatency: 0,
  validationErrors: 0,
  duplicatesFiltered: 0,
  offlineEvents: 0,
  privacyBlockedEvents: 0,
};
  constructor();
    config: ConversionTrackingConfig,
    conversionArchitecture: ConversionArchitectureManager,
    sessionManager: SessionTrackingManager,
    super(config);
    this.conversionConfig = {
  baseUrl: config.baseUrl || '/api',
  enableRealTimeStreaming: config.enableRealTimeStreaming ?? true,
  streamingEndpoint: config.streamingEndpoint || '/api/conversion-events/stream',
  batchSize: config.batchSize || 50,
  flushInterval: config.flushInterval || 5000,
  respectDoNotTrack: config.respectDoNotTrack ?? true,
  requireExplicitConsent: config.requireExplicitConsent ?? false,
  enableCrossDeviceTracking: config.enableCrossDeviceTracking ?? false,
  enableOfflineBuffering: config.enableOfflineBuffering ?? true,
  maxOfflineEvents: config.maxOfflineEvents || 1000,
  eventValidationRules: config.eventValidationRules || [],
  deduplicationWindow: config.deduplicationWindow || 60000, // 1 minute,
  enableDebugLogging: config.enableDebugLogging ?? false,
};
    this.conversionArchitecture = conversionArchitecture;
    this.sessionManager = sessionManager;
    this.initializeTracking();
    this.setupEventListeners();
    this.startPeriodicFlush();
  private initializeTracking(): void {
  // Initialize WebSocket connection for real-time streaming
  if (this.conversionConfig.enableRealTimeStreaming) {
  this.initializeStreamingConnection();
  // Load offline events from storage
  if (this.conversionConfig.enableOfflineBuffering) {
  this.loadOfflineEvents();
  // Setup default validation rules
  this.setupDefaultValidationRules();
  this.debugLog('ConversionTrackingSDK initialized', {)
  config: this.conversionConfig,
  online: this.isOnline,
});
  private setupEventListeners(): void {
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
    });
    // Beforeunload to flush remaining events
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
      this.saveOfflineEvents();
    });
  private initializeStreamingConnection(): void {
    if (!this.isOnline || !this.conversionConfig.enableRealTimeStreaming) return;
    try {
      const wsUrl = this.conversionConfig.streamingEndpoint.replace('http', 'ws');
      this.streamingConnection = new WebSocket(`${this.conversionConfig.baseUrl}${wsUrl}`);}
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
        }, 5000);
      };
      this.streamingConnection.onerror = (error) => {
        this.debugLog('WebSocket error', error);
        this.emit('streaming_error', error);
      };
    } catch (error) {
      this.debugLog('Failed to initialize WebSocket', error);
  private closeStreamingConnection(): void {
    if (this.streamingConnection) {
      this.streamingConnection.close();
      this.streamingConnection = null;
  /**
   * Track conversion event with enhanced capabilities
   */
  public async trackConversionEvent()
    eventType: string,
    properties: Record<string, any> = {},
    value?: number,
    touchpoints: TouchPoint = []): Promise<boolean> {,
    try {
      // Check privacy compliance
      if (!this.isTrackingAllowed()) {
        this.trackingMetrics.privacyBlockedEvents++;
        this.debugLog('Event blocked by privacy settings', { eventType });
        return false;
      // Get current context
      const context = await this.getCurrentContext(touchpoints);
      // Create base conversion event
      const baseEvent: ConversionEvent = {,
  id: this.generateEventId(),
  userId: context.userId,
  sessionId: context.sessionId,
  timestamp: Date.now(),
  type: eventType as ConversionEventType,
  category: this.getCategoryForEventType(eventType) as ConversionCategory,
  value,
  properties: {,
  ...properties,
  deviceId: context.deviceId,
  source: context.attribution.source,
  medium: context.attribution.medium,
  campaign: context.attribution.campaign,
},
  metadata: {,
  userAgent: navigator.userAgent,
  referrer: document.referrer,
  campaignSource: context.attribution.source,
};
      // Create enhanced event with attribution
      const enhancedEvent = this.conversionArchitecture.createEnhancedEvent(;);
        baseEvent,
        context.touchpoints,
        context.privacyConsent
      );
      // Validate event
      const validationResult = this.validateEvent(enhancedEvent);
      if (!validationResult.isValid) {
        this.trackingMetrics.validationErrors++;
        this.debugLog('Event validation failed', validationResult.errors);
        return false;
      // Check for duplicates
      if (this.isDuplicateEvent(enhancedEvent)) {
        this.trackingMetrics.duplicatesFiltered++;
        this.debugLog('Duplicate event filtered', { eventType, eventId: enhancedEvent.id });
        return false;
      // Queue event for processing
      await this.queueEvent(enhancedEvent);
      // Update session with conversion event
      this.sessionManager.trackConversionEvent(eventType, value, properties);
      this.trackingMetrics.eventsTracked++;
      this.debugLog('Conversion event tracked', { eventType, eventId: enhancedEvent.id });
      return true;
    } catch (error) {
      this.debugLog('Error tracking conversion event', error);
      this.reportError('trackConversionEvent', error);
      return false;
  /**
   * Track funnel step progression
   */
  public async trackFunnelStep()
    funnelId: string,
    stepId: string,
    properties: Record<string, any> = {}
  ): Promise<boolean> {
    return this.trackConversionEvent(`funnel_step_${stepId}`, {)}
  }
      funnelId,
      stepId,
      ...properties
    });
  /**
   * Track attribution touchpoint
   */
  public async trackTouchpoint()
    channel: string,
    source: string,
    medium: string,
    properties: Record<string, any> = {}
  ): Promise<boolean> {
  const touchpoint: TouchPoint = {,
  id: this.generateTouchpointId(),
  timestamp: Date.now(),
  channel: channel as any,
  source,
  medium,
  position: 1, // Will be calculated based on session history,
  influence: 0.5, // Default influence score,
  value: properties.value || 0,
  campaign: properties.campaign,
  content: properties.content,
  term: properties.term,
};
    return this.trackConversionEvent('touchpoint_tracked', {)
  touchpoint,
      ...properties
    }, undefined, [touchpoint]);
  /**
   * Update user consent preferences
   */
  public updateConsentPreferences(consent: {)
  tracking?: boolean;
  analytics?: boolean;
  personalization?: boolean;
  crossDevice?: boolean;
}): void {
  this.sessionManager.updateConsentPreferences({)
  trackingConsent: consent.tracking,
  analyticsConsent: consent.analytics,
  personalizationConsent: consent.personalization,
  crossDeviceConsent: consent.crossDevice,
});
    // If tracking was disabled, flush and clear queues
    if (consent.tracking === false) {
  this.flushQueue();
  this.clearEventData();
  this.debugLog('Consent preferences updated', consent);
  /**
  * Get current tracking metrics
  */
  public getTrackingMetrics(): TrackingMetrics & {,
  queueSize: number;,
  offlineBufferSize: number;
  streamingConnected: boolean;
  return {
  ...this.trackingMetrics,
  queueSize: this.eventQueue.length,
  offlineBufferSize: this.offlineBuffer.length,
  streamingConnected: this.streamingConnection?.readyState === WebSocket.OPEN,
};
  /**
   * Manually flush event queue
   */
  public async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    this.debugLog('Flushing event queue', { queueSize: this.eventQueue.length });
    if (this.isOnline && this.streamingConnection?.readyState === WebSocket.OPEN) {
      await this.flushToStream();
    } else {
  await this.flushToAPI();
  private async getCurrentContext(additionalTouchpoints: TouchPoint = []): Promise<ConversionContext> {,
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
  attribution: this.getAttributionData(),
};
  private isTrackingAllowed(): boolean {
    // Check Do Not Track
    if (this.conversionConfig.respectDoNotTrack && navigator.doNotTrack === '1') {
      return false;
    // Check explicit consent requirement
    if (this.conversionConfig.requireExplicitConsent) {
      const consent = this.getPrivacyConsent();
      return consent.tracking && consent.analytics;
    return true;
  private validateEvent(event: EnhancedConversionEvent): { isValid: boolean; errors: string } {
    const errors: string = [];
    // Apply validation rules
    for (const rule of this.conversionConfig.eventValidationRules) {
      const value = this.getNestedProperty(event, rule.field);
      switch (rule.type) {
        case 'required':
          if (value == null || value === '') {
            errors.push(`${rule.field} is required: ${rule.errorMessage}`);}
          break;
        case 'pattern':
          if (value && typeof value === 'string' && rule.value instanceof RegExp) {
            if (!rule.value.test(value)) {
              errors.push(`${rule.field} pattern mismatch: ${rule.errorMessage}`);}
          break;
        case 'range':
          if (typeof value === 'number' && rule.value && typeof rule.value === 'object') {
            const rangeValue = rule.value as { min?: number; max?: number };
            const { min, max } = rangeValue;
            if ((min != null && value < min) || (max != null && value > max)) {
              errors.push(`${rule.field} out of range: ${rule.errorMessage}`);}
          break;
        case 'custom':
          if (rule.validator && !rule.validator(value)) {
            errors.push(`${rule.field} custom validation failed: ${rule.errorMessage}`);}
          break;
    return { isValid: errors.length === 0, errors };
  private isDuplicateEvent(event: EnhancedConversionEvent): boolean {
  const eventHash = this.generateEventHash(event);
  const now = Date.now();
  // Check if we've seen this event recently
  const lastSeen = this.recentEventHashes.get(eventHash);
  if (lastSeen && (now - lastSeen) < this.conversionConfig.deduplicationWindow) {
  return true;
  // Store this event hash
  this.recentEventHashes.set(eventHash, now);
  // Clean up old hashes
  for (const [hash, timestamp] of this.recentEventHashes.entries()) {
  if ((now - timestamp) > this.conversionConfig.deduplicationWindow) {
  this.recentEventHashes.delete(hash);
  return false;
  private generateEventHash(event: EnhancedConversionEvent): string {,
  const hashData = {
  userId: event.userId,
  type: event.type,
  timestamp: Math.floor(event.timestamp / 1000), // Round to second,
  value: event.value,
  key: event.properties?.key // Include a key property if present,
};
    return btoa(JSON.stringify(hashData)).substring(0, 16);
  private async queueEvent(event: EnhancedConversionEvent): Promise<void> {
  const queuedEvent: QueuedEvent = {,
  event,
  timestamp: Date.now(),
  retryCount: 0,
  queuedOffline: !this.isOnline,
};
    if (this.isOnline) {
      this.eventQueue.push(queuedEvent);
      this.trackingMetrics.eventsQueued++;
      // Flush immediately if queue is full
      if (this.eventQueue.length >= this.conversionConfig.batchSize) {
        await this.flushQueue();
    } else {
  this.addToOfflineBuffer(queuedEvent);
  private addToOfflineBuffer(event: QueuedEvent): void {,
  this.offlineBuffer.push(event);
  this.trackingMetrics.offlineEvents++;
  // Enforce buffer size limit
  if (this.offlineBuffer.length > this.conversionConfig.maxOfflineEvents) {
  this.offlineBuffer.shift(); // Remove oldest event
  this.trackingMetrics.eventsDropped++;
  this.saveOfflineEvents();
  private async flushToStream(): Promise<void> {,
  if (!this.streamingConnection || this.streamingConnection.readyState !== WebSocket.OPEN) {
  return this.flushToAPI();
  const events = this.eventQueue.splice(0, this.conversionConfig.batchSize);
  if (events.length === 0) return;
  try {
  const startTime = Date.now();
  const payload = {
  type: 'conversion_events_batch',
  events: events.map(qe => qe.event),
  metadata: {,
  batchId: this.generateBatchId(),
  timestamp: Date.now(),
  source: 'conversion_tracking_sdk',
};
      this.streamingConnection.send(JSON.stringify(payload));
      const latency = Date.now() - startTime;
      this.trackingMetrics.streamingLatency = latency;
      this.debugLog('Events streamed successfully', { )
        eventCount: events.length, 
        latency 
      });
    } catch (error) {
      this.debugLog('Streaming failed, fallback to API', error);
      // Add events back to queue and try API
      this.eventQueue.unshift(...events);
      await this.flushToAPI();
  private async flushToAPI(): Promise<void> {
    const events = this.eventQueue.splice(0, this.conversionConfig.batchSize);
    if (events.length === 0) return;
    try {
      const fetchResponse = await fetch(`${this.conversionConfig.baseUrl}/analytics/conversion-events/batch`, {)}
  },
  method: 'POST',
        headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({,)
  events: events.map(qe => qe.event),
  metadata: {,
  batchId: this.generateBatchId(),
  timestamp: Date.now(),
  source: 'conversion_tracking_sdk',
}
      });
      const response = await fetchResponse.json();
      if (fetchResponse.ok && response.success) {
  this.debugLog('Events sent to API successfully', { )
  eventCount: events.length,
});
      } else {
        throw new Error(response.error || 'API request failed');
    } catch (error) {
      this.debugLog('API flush failed', error);
      // Add events back to queue for retry
      events.forEach(event => {)
  event.retryCount++;
        if (event.retryCount < 3) {
          this.eventQueue.push(event);
        } else {
          this.trackingMetrics.eventsDropped++;
      });
      this.reportError('flushToAPI', error);
  private async processOfflineBuffer(): Promise<void> {
  if (this.offlineBuffer.length === 0) return;
  this.debugLog('Processing offline buffer', { )
  bufferSize: this.offlineBuffer.length,
});
    // Move offline events to main queue
    this.eventQueue.push(...this.offlineBuffer);
    this.offlineBuffer = [];
    // Flush the queue
    await this.flushQueue();
    // Clear offline storage
    this.saveOfflineEvents();
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushQueue();
    }, this.conversionConfig.flushInterval);
  private setupDefaultValidationRules(): void {
  const defaultRules: EventValidationRule = [
  {
  field: 'id',
  type: 'required',
  errorMessage: 'Event ID is required',
}
      {
  field: 'userId',
  type: 'required',
  errorMessage: 'User ID is required',
}
      {
  field: 'type',
  type: 'required',
  errorMessage: 'Event type is required',
}
      {
        field: 'timestamp',
        type: 'range',
        value: { min: Date.now() - 86400000, max: Date.now() + 300000 }, // 24h ago to 5min future
        errorMessage: 'Event timestamp must be recent'];
    this.conversionConfig.eventValidationRules.push(...defaultRules);
  private loadOfflineEvents(): void {
    try {
      const stored = localStorage.getItem('ps_offline_events');
      if (stored) {
        this.offlineBuffer = JSON.parse(stored);
        this.debugLog('Loaded offline events', { count: this.offlineBuffer.length });
    } catch (error) {
  this.debugLog('Failed to load offline events', error);
  private saveOfflineEvents(): void {,
  try {
  localStorage.setItem('ps_offline_events', JSON.stringify(this.offlineBuffer));
} catch (error) {
      this.debugLog('Failed to save offline events', error);
  private clearEventData(): void {
    this.eventQueue = [];
    this.offlineBuffer = [];
    this.recentEventHashes.clear();
    this.saveOfflineEvents();
    this.debugLog('Event data cleared');
  // Helper methods
  private generateEventId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateTouchpointId(): string {
    return `tp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private getCurrentSessionId(): string {
    return sessionStorage.getItem('sessionId') || 'session_' + Date.now();
  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
      localStorage.setItem('deviceId', deviceId);
    return deviceId;
  private getPrivacyConsent(): ConversionContext['privacyConsent'] {
    const stored = localStorage.getItem('ps_consent');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
  // Fallback to conservative defaults
  return {
  tracking: false,
  analytics: true,
  personalization: false,
  crossDevice: false,
};
  private getAttributionData(): ConversionContext['attribution'] {
  const params = new URLSearchParams(window.location.search);
  return {
  source: params.get('utm_source') || 'direct',
  medium: params.get('utm_medium') || 'none',
  campaign: params.get('utm_campaign') || undefined,
  content: params.get('utm_content') || undefined,
  term: params.get('utm_term') || undefined,
};
  private getStoredTouchpoints(): TouchPoint {
  try {
  const stored = sessionStorage.getItem('ps_touchpoints');
  return stored ? JSON.parse(stored) : [];
} catch (e) {
      return [];
  private getCategoryForEventType(eventType: string): string {
    if (eventType.includes('purchase') || eventType.includes('upgrade')) return 'revenue';
    if (eventType.includes('view') || eventType.includes('visit')) return 'activation';
    if (eventType.includes('signup') || eventType.includes('register')) return 'acquisition';
    return 'engagement';
  private getNestedProperty(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => (current as Record<string, unknown>)?.[key], obj);
  private debugLog(message: string, data?: unknown): void {
    if (this.conversionConfig.enableDebugLogging) {
      console.log(`[ConversionTrackingSDK] ${message}`, data);}
  private reportError(context: string, error: unknown): void {
    if (this.conversionConfig.errorReportingEndpoint) {
      // Send error to monitoring service
      fetch(this.conversionConfig.errorReportingEndpoint, {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({),
  context,
  error: error instanceof Error ? error.message : String(error),
  timestamp: Date.now(),
  userId: this.getCurrentUserId(),
  sessionId: this.getCurrentSessionId(),
}
      }).catch(e => {)
  this.debugLog('Failed to report error', e);
      });
  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    this.closeStreamingConnection();
    this.flushQueue();
    this.saveOfflineEvents();
    this.debugLog('ConversionTrackingSDK destroyed');
/**
 * Factory function to create ConversionTrackingSDK instance
 */
export };

export default ConversionTrackingSDK;