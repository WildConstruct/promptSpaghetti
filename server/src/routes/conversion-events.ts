/**
 * Conversion Events API Routes - Story 30.2 Task 2
 * 
 * Server-side API endpoints for conversion event tracking, streaming,
 * and analytics processing.
 * 
 * Features:
 * - Batch conversion event ingestion
 * - Real-time WebSocket streaming
 * - Event validation and deduplication
 * - Privacy-compliant data processing
 * - Rate limiting and security
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConversionEvent } from '../../packages/core/analytics/ConversionTracker';
import { EnhancedConversionEvent } from '../../packages/core/analytics/ConversionFunnelArchitecture';

export interface ConversionEventBatch {
  events: EnhancedConversionEvent[];
  metadata: {
    batchId: string;
    timestamp: number;
    source: string;
    version?: string;
    clientId?: string;
  };
}

export interface ConversionEventQuery {
  startTime?: number;
  endTime?: number;
  userId?: string;
  sessionId?: string;
  eventType?: string;
  funnelId?: string;
  limit?: number;
  offset?: number;
}

export interface ConversionEventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  processedEvent?: EnhancedConversionEvent;
}

export interface ConversionEventResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: string[];
  metadata?: {
    processed: number;
    duplicates: number;
    invalid: number;
    batchId: string;
  };
}

/**
 * Conversion Events Service
 * Handles all conversion event processing logic
 */
class ConversionEventsService {
  private eventStore: Map<string, EnhancedConversionEvent> = new Map();
  private recentEventHashes: Map<string, number> = new Map();
  private streamingClients: Map<string, any> = new Map();
  
  private readonly DEDUPLICATION_WINDOW = 60000; // 1 minute
  private readonly MAX_EVENTS_PER_BATCH = 1000;
  private readonly MAX_EVENT_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Process batch of conversion events
   */
  public async processBatch(batch: ConversionEventBatch): Promise<ConversionEventResponse> {
    const { events, metadata } = batch;
    
    // Validate batch size
    if (events.length > this.MAX_EVENTS_PER_BATCH) {
      return {
        success: false,
        message: `Batch size exceeds maximum of ${this.MAX_EVENTS_PER_BATCH} events`,
        errors: ['BATCH_TOO_LARGE']
      };
    }

    let processed = 0;
    let duplicates = 0;
    let invalid = 0;
    const processedEvents: EnhancedConversionEvent[] = [];
    const errors: string[] = [];

    for (const event of events) {
      try {
        const validationResult = this.validateEvent(event);
        
        if (!validationResult.isValid) {
          invalid++;
          errors.push(`Event ${event.id}: ${validationResult.errors.join(', ')}`);
          continue;
        }

        if (this.isDuplicateEvent(event)) {
          duplicates++;
          continue;
        }

        // Process and store event
        const processedEvent = this.processEvent(event, metadata);
        this.storeEvent(processedEvent);
        processedEvents.push(processedEvent);
        processed++;

        // Stream to real-time subscribers
        this.streamEventToSubscribers(processedEvent);

      } catch (error) {
        invalid++;
        errors.push(`Event ${event.id}: Processing error - ${error}`);
      }
    }

    return {
      success: true,
      message: `Processed ${processed} events`,
      data: processedEvents,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        processed,
        duplicates,
        invalid,
        batchId: metadata.batchId
      }
    };
  }

  /**
   * Validate conversion event
   */
  private validateEvent(event: EnhancedConversionEvent): ConversionEventValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!event.id) errors.push('Event ID is required');
    if (!event.userId) errors.push('User ID is required');
    if (!event.type) errors.push('Event type is required');
    if (!event.timestamp) errors.push('Timestamp is required');

    // Timestamp validation
    const now = Date.now();
    const eventAge = now - event.timestamp;
    
    if (eventAge < 0) {
      errors.push('Event timestamp cannot be in the future');
    } else if (eventAge > this.MAX_EVENT_AGE) {
      errors.push('Event is too old to process');
    } else if (eventAge > 24 * 60 * 60 * 1000) {
      warnings.push('Event is more than 24 hours old');
    }

    // Value validation
    if (event.value !== undefined && event.value < 0) {
      errors.push('Event value cannot be negative');
    }

    // Privacy consent validation
    if (!event.privacyConsent) {
      errors.push('Privacy consent information is required');
    } else {
      if (!event.privacyConsent.analytics) {
        errors.push('Analytics consent is required for event processing');
      }
    }

    // Attribution data validation
    if (event.attributionData) {
      if (!Array.isArray(event.attributionData.touchpoints)) {
        errors.push('Touchpoints must be an array');
      }
      
      if (!event.attributionData.primaryAttribution) {
        warnings.push('Primary attribution is missing');
      }
    }

    // Real-time processing validation
    if (event.realTimeProcessing) {
      if (!event.realTimeProcessing.streamId) {
        warnings.push('Stream ID is missing');
      }
      if (!event.realTimeProcessing.batchId) {
        warnings.push('Batch ID is missing');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedEvent: errors.length === 0 ? event : undefined
    };
  }

  /**
   * Check for duplicate events
   */
  private isDuplicateEvent(event: EnhancedConversionEvent): boolean {
    const eventHash = this.generateEventHash(event);
    const now = Date.now();
    
    const lastSeen = this.recentEventHashes.get(eventHash);
    if (lastSeen && (now - lastSeen) < this.DEDUPLICATION_WINDOW) {
      return true;
    }
    
    this.recentEventHashes.set(eventHash, now);
    
    // Clean up old hashes periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanupOldHashes();
    }
    
    return false;
  }

  private generateEventHash(event: EnhancedConversionEvent): string {
    const hashData = {
      userId: event.userId,
      type: event.type,
      timestamp: Math.floor(event.timestamp / 1000), // Round to second
      value: event.value,
      sessionId: event.sessionId
    };
    
    return Buffer.from(JSON.stringify(hashData)).toString('base64').substring(0, 16);
  }

  private cleanupOldHashes(): void {
    const now = Date.now();
    for (const [hash, timestamp] of this.recentEventHashes.entries()) {
      if ((now - timestamp) > this.DEDUPLICATION_WINDOW) {
        this.recentEventHashes.delete(hash);
      }
    }
  }

  /**
   * Process individual event
   */
  private processEvent(
    event: EnhancedConversionEvent, 
    metadata: ConversionEventBatch['metadata']
  ): EnhancedConversionEvent {
    // Enrich event with server-side metadata
    const processedEvent: EnhancedConversionEvent = {
      ...event,
      realTimeProcessing: {
        ...event.realTimeProcessing,
        processed: true,
        latency: Date.now() - event.timestamp,
        serverId: this.generateServerId(),
        batchId: metadata.batchId,
        processedAt: Date.now()
      },
      metadata: {
        ...event.metadata,
        serverProcessed: true,
        batchSource: metadata.source,
        apiVersion: metadata.version || '1.0'
      }
    };

    return processedEvent;
  }

  /**
   * Store event
   */
  private storeEvent(event: EnhancedConversionEvent): void {
    this.eventStore.set(event.id, event);
    
    // TODO: Integrate with actual database/storage
    // For now, keep in-memory with size limit
    if (this.eventStore.size > 10000) {
      const oldestKey = this.eventStore.keys().next().value;
      this.eventStore.delete(oldestKey);
    }
  }

  /**
   * Stream event to WebSocket subscribers
   */
  private streamEventToSubscribers(event: EnhancedConversionEvent): void {
    const streamingPayload = {
      type: 'conversion_event',
      event,
      timestamp: Date.now()
    };

    for (const [clientId, socket] of this.streamingClients.entries()) {
      try {
        if (socket.readyState === 1) { // WebSocket.OPEN
          socket.send(JSON.stringify(streamingPayload));
        } else {
          this.streamingClients.delete(clientId);
        }
      } catch (error) {
        console.error(`Failed to stream to client ${clientId}:`, error);
        this.streamingClients.delete(clientId);
      }
    }
  }

  /**
   * Query events
   */
  public queryEvents(query: ConversionEventQuery): EnhancedConversionEvent[] {
    let events = Array.from(this.eventStore.values());

    // Apply filters
    if (query.startTime) {
      events = events.filter(e => e.timestamp >= query.startTime!);
    }
    
    if (query.endTime) {
      events = events.filter(e => e.timestamp <= query.endTime!);
    }
    
    if (query.userId) {
      events = events.filter(e => e.userId === query.userId);
    }
    
    if (query.sessionId) {
      events = events.filter(e => e.sessionId === query.sessionId);
    }
    
    if (query.eventType) {
      events = events.filter(e => e.type === query.eventType);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return events.slice(offset, offset + limit);
  }

  /**
   * Add streaming client
   */
  public addStreamingClient(clientId: string, socket: any): void {
    this.streamingClients.set(clientId, socket);
  }

  /**
   * Remove streaming client
   */
  public removeStreamingClient(clientId: string): void {
    this.streamingClients.delete(clientId);
  }

  /**
   * Get processing metrics
   */
  public getMetrics(): {
    totalEvents: number;
    recentEvents: number;
    activeStreams: number;
    hashTableSize: number;
  } {
    const now = Date.now();
    const recentEvents = Array.from(this.eventStore.values())
      .filter(e => (now - e.timestamp) < 60000).length; // Last minute

    return {
      totalEvents: this.eventStore.size,
      recentEvents,
      activeStreams: this.streamingClients.size,
      hashTableSize: this.recentEventHashes.size
    };
  }

  private generateServerId(): string {
    return `srv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

// Global service instance
const conversionEventsService = new ConversionEventsService();

/**
 * Register conversion events routes
 */
export async function registerConversionEventRoutes(fastify: FastifyInstance) {
  // Rate limiting schema
  const rateLimitOptions = {
    max: 1000, // requests per minute
    timeWindow: '1 minute'
  };

  /**
   * POST /api/conversion-events/batch
   * Process batch of conversion events
   */
  fastify.post('/api/conversion-events/batch', {
    config: { rateLimit: rateLimitOptions },
    schema: {
      body: {
        type: 'object',
        required: ['events', 'metadata'],
        properties: {
          events: {
            type: 'array',
            items: { type: 'object' },
            maxItems: 1000
          },
          metadata: {
            type: 'object',
            required: ['batchId', 'timestamp', 'source'],
            properties: {
              batchId: { type: 'string' },
              timestamp: { type: 'number' },
              source: { type: 'string' },
              version: { type: 'string' },
              clientId: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array' },
            errors: { type: 'array', items: { type: 'string' } },
            metadata: {
              type: 'object',
              properties: {
                processed: { type: 'number' },
                duplicates: { type: 'number' },
                invalid: { type: 'number' },
                batchId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: ConversionEventBatch }>, reply: FastifyReply) => {
    try {
      const result = await conversionEventsService.processBatch(request.body);
      
      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error processing conversion events batch:', error);
      reply.code(500).send({
        success: false,
        message: 'Internal server error processing events',
        errors: ['INTERNAL_ERROR']
      });
    }
  });

  /**
   * GET /api/conversion-events
   * Query conversion events
   */
  fastify.get('/api/conversion-events', {
    config: { rateLimit: { ...rateLimitOptions, max: 500 } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startTime: { type: 'number' },
          endTime: { type: 'number' },
          userId: { type: 'string' },
          sessionId: { type: 'string' },
          eventType: { type: 'string' },
          funnelId: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 1000 },
          offset: { type: 'number', minimum: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: ConversionEventQuery }>, reply: FastifyReply) => {
    try {
      const events = conversionEventsService.queryEvents(request.query);
      
      reply.send({
        success: true,
        data: events,
        total: events.length,
        limit: request.query.limit || 100,
        offset: request.query.offset || 0
      });
    } catch (error) {
      fastify.log.error('Error querying conversion events:', error);
      reply.code(500).send({
        success: false,
        message: 'Internal server error querying events'
      });
    }
  });

  /**
   * GET /api/conversion-events/metrics
   * Get processing metrics
   */
  fastify.get('/api/conversion-events/metrics', {
    config: { rateLimit: { ...rateLimitOptions, max: 100 } }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = conversionEventsService.getMetrics();
      
      reply.send({
        success: true,
        data: metrics,
        timestamp: Date.now()
      });
    } catch (error) {
      fastify.log.error('Error getting conversion metrics:', error);
      reply.code(500).send({
        success: false,
        message: 'Internal server error getting metrics'
      });
    }
  });

  /**
   * POST /api/conversion-events/validate
   * Validate conversion event structure
   */
  fastify.post('/api/conversion-events/validate', {
    config: { rateLimit: rateLimitOptions },
    schema: {
      body: {
        type: 'object',
        required: ['event'],
        properties: {
          event: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { event: EnhancedConversionEvent } }>, reply: FastifyReply) => {
    try {
      const validationResult = (conversionEventsService as any).validateEvent(request.body.event);
      
      reply.send({
        success: true,
        data: validationResult
      });
    } catch (error) {
      fastify.log.error('Error validating conversion event:', error);
      reply.code(500).send({
        success: false,
        message: 'Internal server error validating event'
      });
    }
  });

  /**
   * WebSocket endpoint for real-time streaming
   * GET /api/conversion-events/stream (upgraded to WebSocket)
   */
  fastify.register(async function (fastify) {
    fastify.get('/api/conversion-events/stream', { websocket: true }, (connection, request) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      conversionEventsService.addStreamingClient(clientId, connection.socket);
      
      // Send welcome message
      connection.socket.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: Date.now(),
        message: 'Connected to conversion events stream'
      }));

      // Handle client messages
      connection.socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'ping') {
            connection.socket.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          fastify.log.error('Error handling WebSocket message:', error);
        }
      });

      // Handle disconnect
      connection.socket.on('close', () => {
        conversionEventsService.removeStreamingClient(clientId);
        fastify.log.info(`Client ${clientId} disconnected from conversion events stream`);
      });

      fastify.log.info(`Client ${clientId} connected to conversion events stream`);
    });
  });

  fastify.log.info('Conversion events routes registered');
}

export default registerConversionEventRoutes;