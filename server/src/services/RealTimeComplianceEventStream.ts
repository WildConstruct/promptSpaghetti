/**
 * Real-Time Compliance Event Stream Service
 * 
 * Provides streaming capabilities for real-time compliance events with
 * WebSocket support, event filtering, subscription management, and
 * multi-channel event distribution for compliance dashboards.
 * 
 * Part of Epic 19 - Privacy & Compliance Framework  
 * Task: T-1752989143998-286 - Create real-time compliance monitoring
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { RealTimeEvent, ComplianceViolationEvent, MonitoringMetrics } from './RealTimeComplianceMonitor';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

export interface EventStreamConfig {
  streamId: string;
  port?: number;
  enableWebSocket: boolean;
  enableServerSentEvents: boolean;
  enableWebhooks: boolean;
  
  // Subscription Management
  maxSubscribers: number;
  subscriptionTimeout: number; // minutes
  heartbeatInterval: number; // seconds
  
  // Event Filtering
  enableFiltering: boolean;
  maxFilterComplexity: number;
  
  // Rate Limiting
  rateLimitEnabled: boolean;
  eventsPerMinute: number;
  burstLimit: number;
  
  // Security
  requireAuthentication: boolean;
  allowedOrigins: string[];
  encryptionEnabled: boolean;
  
  // Persistence
  bufferEvents: boolean;
  bufferSize: number;
  bufferRetention: number; // hours
}

export interface EventSubscription {
  subscriptionId: string;
  userId: string;
  clientId: string;
  
  // Channel Configuration
  channels: SubscriptionChannel[];
  
  // Filtering
  filters: EventFilter[];
  
  // Rate Limiting
  personalRateLimit?: number;
  rateLimitWindow: number; // minutes
  
  // Subscription State
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  
  // Delivery Configuration
  deliveryMode: 'realtime' | 'batch' | 'hybrid';
  batchSize?: number;
  batchInterval?: number; // seconds
  
  metadata: Record<string, any>;
}

export interface SubscriptionChannel {
  type: 'websocket' | 'sse' | 'webhook' | 'redis';
  endpoint?: string;
  headers?: Record<string, string>;
  connection?: WebSocket;
  isConnected: boolean;
  lastPing?: Date;
  
  // Delivery Status
  messagesDelivered: number;
  deliveryErrors: number;
  lastError?: string;
}

export interface EventFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface StreamMetrics {
  activeSubscriptions: number;
  totalEventsStreamed: number;
  eventsPerSecond: number;
  averageDeliveryLatency: number;
  deliverySuccessRate: number;
  connectionErrors: number;
  filterEvaluations: number;
  rateLimitHits: number;
  timestamp: Date;
}

export interface DeliveryReceipt {
  subscriptionId: string;
  eventId: string;
  deliveredAt: Date;
  channel: string;
  deliveryLatency: number;
  success: boolean;
  error?: string;
}

export class RealTimeComplianceEventStream extends EventEmitter {
  private config: EventStreamConfig;
  private auditService: AuditService;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  
  // Subscription Management
  private subscriptions = new Map<string, EventSubscription>();
  private wsServer?: WebSocket.Server;
  private isRunning = false;
  
  // Event Buffering
  private eventBuffer: RealTimeEvent[] = [];
  private violationBuffer: ComplianceViolationEvent[] = [];
  
  // Rate Limiting
  private rateLimitCounters = new Map<string, { count: number; resetTime: Date }>();
  
  // Metrics
  private metrics: StreamMetrics;
  private metricsInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  
  constructor(
    config: EventStreamConfig,
    dependencies: {
      auditService: AuditService;
      databaseService: DatabaseService;
      redisService: RedisService;
    }
  ) {
    super();
    this.config = config;
    this.auditService = dependencies.auditService;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize the event stream service
   */
  public async initialize(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Event stream is already running');
    }

    // Initialize WebSocket server if enabled
    if (this.config.enableWebSocket) {
      await this.initializeWebSocketServer();
    }

    // Load existing subscriptions from persistence
    await this.loadSubscriptions();

    // Start periodic tasks
    this.startMetricsCollection();
    this.startPeriodicCleanup();

    this.isRunning = true;

    await this.auditService.logEvent({
      type: 'EVENT_STREAM_STARTED',
      userId: 'system',
      details: {
        streamId: this.config.streamId,
        websocketEnabled: this.config.enableWebSocket,
        port: this.config.port
      }
    });

    this.emit('stream_initialized', { streamId: this.config.streamId });
  }

  /**
   * Initialize WebSocket server
   */
  private async initializeWebSocketServer(): Promise<void> {
    const port = this.config.port || 8080;
    
    this.wsServer = new WebSocket.Server({
      port,
      verifyClient: (info) => {
        // Origin verification
        if (this.config.allowedOrigins.length > 0) {
          const origin = info.origin;
          return this.config.allowedOrigins.includes(origin);
        }
        return true;
      }
    });

    this.wsServer.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    this.wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
      this.emit('websocket_error', error);
    });

    console.log(`WebSocket server started on port ${port}`);
  }

  /**
   * Handle new WebSocket connection
   */
  private handleWebSocketConnection(ws: WebSocket, req: any): void {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleWebSocketMessage(ws, clientId, message);
      } catch (error) {
        this.sendWebSocketError(ws, 'Invalid JSON message');
      }
    });

    ws.on('close', () => {
      this.handleWebSocketDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleWebSocketDisconnection(clientId);
    });

    // Send connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connection_established',
      clientId,
      timestamp: new Date()
    }));
  }

  /**
   * Handle WebSocket message
   */
  private async handleWebSocketMessage(
    ws: WebSocket, 
    clientId: string, 
    message: any
  ): Promise<void> {
    switch (message.type) {
      case 'subscribe':
        await this.handleSubscribeMessage(ws, clientId, message);
        break;
      case 'unsubscribe':
        await this.handleUnsubscribeMessage(clientId, message);
        break;
      case 'ping':
        this.handlePingMessage(ws, clientId);
        break;
      case 'update_filters':
        await this.handleUpdateFiltersMessage(clientId, message);
        break;
      default:
        this.sendWebSocketError(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle subscription message
   */
  private async handleSubscribeMessage(
    ws: WebSocket, 
    clientId: string, 
    message: any
  ): Promise<void> {
    try {
      // Validate subscription request
      if (!message.userId) {
        this.sendWebSocketError(ws, 'userId required for subscription');
        return;
      }

      // Check subscription limits
      if (this.subscriptions.size >= this.config.maxSubscribers) {
        this.sendWebSocketError(ws, 'Maximum subscribers reached');
        return;
      }

      // Create subscription
      const subscription: EventSubscription = {
        subscriptionId: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: message.userId,
        clientId,
        channels: [{
          type: 'websocket',
          connection: ws,
          isConnected: true,
          messagesDelivered: 0,
          deliveryErrors: 0,
          lastPing: new Date()
        }],
        filters: message.filters || [],
        personalRateLimit: message.rateLimit,
        rateLimitWindow: message.rateLimitWindow || 1,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        deliveryMode: message.deliveryMode || 'realtime',
        batchSize: message.batchSize,
        batchInterval: message.batchInterval,
        metadata: message.metadata || {}
      };

      // Store subscription
      this.subscriptions.set(subscription.subscriptionId, subscription);
      this.metrics.activeSubscriptions = this.subscriptions.size;

      // Save to persistence
      await this.persistSubscription(subscription);

      // Send subscription confirmation
      ws.send(JSON.stringify({
        type: 'subscription_confirmed',
        subscriptionId: subscription.subscriptionId,
        filters: subscription.filters,
        timestamp: new Date()
      }));

      // Send buffered events if applicable
      if (this.config.bufferEvents) {
        await this.sendBufferedEvents(subscription);
      }

      await this.auditService.logEvent({
        type: 'EVENT_SUBSCRIPTION_CREATED',
        userId: subscription.userId,
        details: {
          subscriptionId: subscription.subscriptionId,
          clientId,
          filtersCount: subscription.filters.length
        }
      });

    } catch (error) {
      this.sendWebSocketError(ws, `Subscription failed: ${error.message}`);
    }
  }

  /**
   * Handle unsubscribe message
   */
  private async handleUnsubscribeMessage(clientId: string, message: any): Promise<void> {
    const subscriptionId = message.subscriptionId;
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription && subscription.clientId === clientId) {
      await this.removeSubscription(subscriptionId);
    }
  }

  /**
   * Handle ping message for heartbeat
   */
  private handlePingMessage(ws: WebSocket, clientId: string): void {
    // Update last activity for all subscriptions from this client
    for (const subscription of this.subscriptions.values()) {
      if (subscription.clientId === clientId) {
        subscription.lastActivity = new Date();
        subscription.channels.forEach(channel => {
          if (channel.type === 'websocket' && channel.connection === ws) {
            channel.lastPing = new Date();
          }
        });
      }
    }

    // Send pong response
    ws.send(JSON.stringify({
      type: 'pong',
      timestamp: new Date()
    }));
  }

  /**
   * Handle filter update message
   */
  private async handleUpdateFiltersMessage(clientId: string, message: any): Promise<void> {
    const subscriptionId = message.subscriptionId;
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription && subscription.clientId === clientId) {
      subscription.filters = message.filters || [];
      await this.persistSubscription(subscription);

      // Send confirmation
      const wsChannel = subscription.channels.find(c => c.type === 'websocket');
      if (wsChannel?.connection) {
        wsChannel.connection.send(JSON.stringify({
          type: 'filters_updated',
          subscriptionId,
          filters: subscription.filters,
          timestamp: new Date()
        }));
      }
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleWebSocketDisconnection(clientId: string): void {
    // Mark subscriptions as disconnected
    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (subscription.clientId === clientId) {
        subscription.channels.forEach(channel => {
          if (channel.type === 'websocket') {
            channel.isConnected = false;
          }
        });
        
        // Remove subscription if no other channels
        const activeChannels = subscription.channels.filter(c => c.isConnected);
        if (activeChannels.length === 0) {
          this.removeSubscription(subscriptionId);
        }
      }
    }
  }

  /**
   * Stream event to subscribers
   */
  public async streamEvent(event: RealTimeEvent): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Buffer event if enabled
    if (this.config.bufferEvents) {
      this.bufferEvent(event);
    }

    // Process subscriptions
    const deliveryPromises: Promise<DeliveryReceipt>[] = [];

    for (const subscription of this.subscriptions.values()) {
      if (!subscription.isActive) {
        continue;
      }

      // Apply filters
      if (this.config.enableFiltering && !this.passesFilters(event, subscription.filters)) {
        continue;
      }

      // Check rate limits
      if (this.config.rateLimitEnabled && this.isRateLimited(subscription)) {
        continue;
      }

      // Deliver event
      for (const channel of subscription.channels) {
        if (channel.isConnected) {
          deliveryPromises.push(this.deliverEvent(event, subscription, channel));
        }
      }
    }

    // Wait for deliveries
    const receipts = await Promise.allSettled(deliveryPromises);
    const successfulDeliveries = receipts.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;

    // Update metrics
    this.metrics.totalEventsStreamed++;
    this.metrics.deliverySuccessRate = 
      (this.metrics.deliverySuccessRate * 0.9) + ((successfulDeliveries / receipts.length) * 0.1);

    this.emit('event_streamed', {
      eventId: event.eventId,
      deliveryCount: successfulDeliveries,
      totalSubscriptions: receipts.length
    });
  }

  /**
   * Stream violation event to subscribers
   */
  public async streamViolation(violation: ComplianceViolationEvent): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Buffer violation if enabled
    if (this.config.bufferEvents) {
      this.bufferViolation(violation);
    }

    // Convert violation to stream event format
    const streamEvent: RealTimeEvent = {
      eventId: violation.violationId,
      eventType: 'policy_violation',
      timestamp: violation.detectedAt,
      source: 'compliance_monitor',
      context: violation.context,
      payload: {
        operation: 'compliance_violation',
        violation: violation
      },
      priority: violation.severity === 'critical' ? 'critical' : 'high',
      tags: ['compliance', 'violation', violation.severity],
      metadata: violation.metadata
    };

    await this.streamEvent(streamEvent);
  }

  /**
   * Check if event passes subscription filters
   */
  private passesFilters(event: RealTimeEvent, filters: EventFilter[]): boolean {
    for (const filter of filters) {
      if (!this.evaluateFilter(event, filter)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate single filter against event
   */
  private evaluateFilter(event: RealTimeEvent, filter: EventFilter): boolean {
    const fieldValue = this.getEventFieldValue(event, filter.field);
    
    switch (filter.operator) {
      case 'eq':
        return fieldValue === filter.value;
      case 'ne':
        return fieldValue !== filter.value;
      case 'gt':
        return fieldValue > filter.value;
      case 'gte':
        return fieldValue >= filter.value;
      case 'lt':
        return fieldValue < filter.value;
      case 'lte':
        return fieldValue <= filter.value;
      case 'contains':
        const searchValue = filter.caseSensitive ? filter.value : filter.value.toLowerCase();
        const searchIn = filter.caseSensitive ? fieldValue : (fieldValue || '').toLowerCase();
        return searchIn.includes(searchValue);
      case 'regex':
        const regex = new RegExp(filter.value, filter.caseSensitive ? '' : 'i');
        return regex.test(fieldValue || '');
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
      default:
        return true;
    }
  }

  /**
   * Get field value from event
   */
  private getEventFieldValue(event: RealTimeEvent, field: string): any {
    const parts = field.split('.');
    let value: any = event;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Check if subscription is rate limited
   */
  private isRateLimited(subscription: EventSubscription): boolean {
    const key = subscription.subscriptionId;
    const limit = subscription.personalRateLimit || this.config.eventsPerMinute;
    const windowMs = subscription.rateLimitWindow * 60 * 1000;
    
    const now = new Date();
    const counter = this.rateLimitCounters.get(key);
    
    if (!counter || counter.resetTime <= now) {
      this.rateLimitCounters.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + windowMs)
      });
      return false;
    }
    
    if (counter.count >= limit) {
      this.metrics.rateLimitHits++;
      return true;
    }
    
    counter.count++;
    return false;
  }

  /**
   * Deliver event to specific channel
   */
  private async deliverEvent(
    event: RealTimeEvent,
    subscription: EventSubscription,
    channel: SubscriptionChannel
  ): Promise<DeliveryReceipt> {
    const startTime = Date.now();
    
    try {
      let success = false;
      
      switch (channel.type) {
        case 'websocket':
          success = await this.deliverViaWebSocket(event, channel);
          break;
        case 'webhook':
          success = await this.deliverViaWebhook(event, channel);
          break;
        case 'redis':
          success = await this.deliverViaRedis(event, channel);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }
      
      if (success) {
        channel.messagesDelivered++;
      } else {
        channel.deliveryErrors++;
      }
      
      const deliveryLatency = Date.now() - startTime;
      this.updateDeliveryMetrics(deliveryLatency);
      
      return {
        subscriptionId: subscription.subscriptionId,
        eventId: event.eventId,
        deliveredAt: new Date(),
        channel: channel.type,
        deliveryLatency,
        success
      };
      
    } catch (error) {
      channel.deliveryErrors++;
      channel.lastError = error.message;
      
      return {
        subscriptionId: subscription.subscriptionId,
        eventId: event.eventId,
        deliveredAt: new Date(),
        channel: channel.type,
        deliveryLatency: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deliver event via WebSocket
   */
  private async deliverViaWebSocket(
    event: RealTimeEvent, 
    channel: SubscriptionChannel
  ): Promise<boolean> {
    if (!channel.connection || channel.connection.readyState !== WebSocket.OPEN) {
      channel.isConnected = false;
      return false;
    }

    const message = {
      type: 'event',
      event: event,
      timestamp: new Date()
    };

    try {
      channel.connection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      channel.isConnected = false;
      return false;
    }
  }

  /**
   * Deliver event via webhook
   */
  private async deliverViaWebhook(
    event: RealTimeEvent, 
    channel: SubscriptionChannel
  ): Promise<boolean> {
    // Implementation would make HTTP POST to webhook endpoint
    console.log(`Delivering event ${event.eventId} via webhook to ${channel.endpoint}`);
    return true;
  }

  /**
   * Deliver event via Redis pub/sub
   */
  private async deliverViaRedis(
    event: RealTimeEvent, 
    channel: SubscriptionChannel
  ): Promise<boolean> {
    try {
      await this.redisService.publish(channel.endpoint || 'compliance_events', JSON.stringify(event));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update delivery metrics
   */
  private updateDeliveryMetrics(latency: number): void {
    this.metrics.averageDeliveryLatency = 
      (this.metrics.averageDeliveryLatency * 0.9) + (latency * 0.1);
  }

  /**
   * Send WebSocket error
   */
  private sendWebSocketError(ws: WebSocket, message: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message,
        timestamp: new Date()
      }));
    }
  }

  /**
   * Buffer event for new subscribers
   */
  private bufferEvent(event: RealTimeEvent): void {
    if (this.eventBuffer.length >= this.config.bufferSize) {
      this.eventBuffer.shift(); // Remove oldest
    }
    this.eventBuffer.push(event);
  }

  /**
   * Buffer violation for new subscribers
   */
  private bufferViolation(violation: ComplianceViolationEvent): void {
    if (this.violationBuffer.length >= this.config.bufferSize) {
      this.violationBuffer.shift(); // Remove oldest
    }
    this.violationBuffer.push(violation);
  }

  /**
   * Send buffered events to new subscription
   */
  private async sendBufferedEvents(subscription: EventSubscription): Promise<void> {
    // Send buffered regular events
    for (const event of this.eventBuffer) {
      if (this.passesFilters(event, subscription.filters)) {
        for (const channel of subscription.channels) {
          if (channel.isConnected) {
            await this.deliverEvent(event, subscription, channel);
          }
        }
      }
    }

    // Send buffered violations
    for (const violation of this.violationBuffer) {
      await this.streamViolation(violation);
    }
  }

  /**
   * Remove subscription
   */
  private async removeSubscription(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    // Close WebSocket connections
    subscription.channels.forEach(channel => {
      if (channel.type === 'websocket' && channel.connection) {
        channel.connection.close();
      }
    });

    // Remove from memory
    this.subscriptions.delete(subscriptionId);
    this.metrics.activeSubscriptions = this.subscriptions.size;

    // Remove from persistence
    await this.databaseService.execute(
      'DELETE FROM event_subscriptions WHERE subscription_id = ?',
      [subscriptionId]
    );

    await this.auditService.logEvent({
      type: 'EVENT_SUBSCRIPTION_REMOVED',
      userId: subscription.userId,
      details: { subscriptionId }
    });
  }

  /**
   * Persist subscription to database
   */
  private async persistSubscription(subscription: EventSubscription): Promise<void> {
    try {
      await this.databaseService.execute(`
        INSERT OR REPLACE INTO event_subscriptions (
          subscription_id, user_id, client_id, filters, 
          delivery_mode, created_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        subscription.subscriptionId,
        subscription.userId,
        subscription.clientId,
        JSON.stringify(subscription.filters),
        subscription.deliveryMode,
        subscription.createdAt,
        JSON.stringify(subscription.metadata)
      ]);
    } catch (error) {
      console.error('Failed to persist subscription:', error);
    }
  }

  /**
   * Load subscriptions from database
   */
  private async loadSubscriptions(): Promise<void> {
    try {
      const rows = await this.databaseService.query(
        'SELECT * FROM event_subscriptions WHERE created_at > ?',
        [new Date(Date.now() - (24 * 60 * 60 * 1000))] // Last 24 hours
      );

      // Note: WebSocket connections won't be restored, only other channel types
      for (const row of rows) {
        const subscription: EventSubscription = {
          subscriptionId: row.subscription_id,
          userId: row.user_id,
          clientId: row.client_id,
          channels: [], // WebSocket connections need to be re-established
          filters: JSON.parse(row.filters),
          rateLimitWindow: 1,
          createdAt: new Date(row.created_at),
          lastActivity: new Date(),
          isActive: false, // Mark as inactive until reconnection
          deliveryMode: row.delivery_mode,
          metadata: JSON.parse(row.metadata)
        };

        this.subscriptions.set(subscription.subscriptionId, subscription);
      }
    } catch (error) {
      console.warn('Failed to load subscriptions:', error);
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 60000); // Every minute
  }

  /**
   * Collect and report metrics
   */
  private async collectMetrics(): Promise<void> {
    this.metrics.timestamp = new Date();
    
    // Calculate events per second
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    const recentEvents = this.eventBuffer.filter(event => 
      (now - event.timestamp.getTime()) < timeWindow
    );
    this.metrics.eventsPerSecond = recentEvents.length / 60;

    // Save metrics to Redis
    await this.redisService.setWithExpiry(
      `event_stream_metrics:${this.config.streamId}`,
      JSON.stringify(this.metrics),
      3600 // 1 hour
    );

    this.emit('metrics_updated', this.metrics);
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup();
    }, 300000); // Every 5 minutes
  }

  /**
   * Perform periodic cleanup
   */
  private async performCleanup(): Promise<void> {
    const now = new Date();
    const timeout = this.config.subscriptionTimeout * 60 * 1000;

    // Remove inactive subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (now.getTime() - subscription.lastActivity.getTime() > timeout) {
        await this.removeSubscription(subscriptionId);
      }
    }

    // Clean up rate limit counters
    for (const [key, counter] of this.rateLimitCounters.entries()) {
      if (counter.resetTime <= now) {
        this.rateLimitCounters.delete(key);
      }
    }

    // Clean up event buffer
    const bufferRetentionMs = this.config.bufferRetention * 60 * 60 * 1000;
    this.eventBuffer = this.eventBuffer.filter(event => 
      (now.getTime() - event.timestamp.getTime()) < bufferRetentionMs
    );
    
    this.violationBuffer = this.violationBuffer.filter(violation => 
      (now.getTime() - violation.detectedAt.getTime()) < bufferRetentionMs
    );
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): StreamMetrics {
    return {
      activeSubscriptions: 0,
      totalEventsStreamed: 0,
      eventsPerSecond: 0,
      averageDeliveryLatency: 0,
      deliverySuccessRate: 1.0,
      connectionErrors: 0,
      filterEvaluations: 0,
      rateLimitHits: 0,
      timestamp: new Date()
    };
  }

  /**
   * Get current stream status
   */
  public getStreamStatus(): {
    streamId: string;
    running: boolean;
    metrics: StreamMetrics;
    subscriptions: number;
    bufferSize: number;
  } {
    return {
      streamId: this.config.streamId,
      running: this.isRunning,
      metrics: this.metrics,
      subscriptions: this.subscriptions.size,
      bufferSize: this.eventBuffer.length + this.violationBuffer.length
    };
  }

  /**
   * Stop the event stream
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all subscriptions
    for (const subscriptionId of this.subscriptions.keys()) {
      await this.removeSubscription(subscriptionId);
    }

    await this.auditService.logEvent({
      type: 'EVENT_STREAM_STOPPED',
      userId: 'system',
      details: {
        streamId: this.config.streamId,
        finalMetrics: this.metrics
      }
    });

    this.emit('stream_stopped', { streamId: this.config.streamId });
  }
}