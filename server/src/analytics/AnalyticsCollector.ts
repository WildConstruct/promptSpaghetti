import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics event types for comprehensive tracking
 */
export enum AnalyticsEventType {
  // Execution events
  GRAPH_EXECUTION_START = 'graph_execution_start',
  GRAPH_EXECUTION_COMPLETE = 'graph_execution_complete',
  GRAPH_EXECUTION_ERROR = 'graph_execution_error',
  NODE_EXECUTION_START = 'node_execution_start',
  NODE_EXECUTION_COMPLETE = 'node_execution_complete',
  NODE_EXECUTION_ERROR = 'node_execution_error',
  
  // User interaction events
  USER_SESSION_START = 'user_session_start',
  USER_SESSION_END = 'user_session_end',
  NODE_CREATED = 'node_created',
  NODE_UPDATED = 'node_updated',
  NODE_DELETED = 'node_deleted',
  CONNECTION_CREATED = 'connection_created',
  CONNECTION_DELETED = 'connection_deleted',
  CANVAS_INTERACTION = 'canvas_interaction',
  
  // Performance events
  PERFORMANCE_METRIC = 'performance_metric',
  MEMORY_USAGE = 'memory_usage',
  TOKEN_USAGE = 'token_usage',
  API_CALL = 'api_call',
  
  // Business events
  FEATURE_USAGE = 'feature_usage',
  ERROR_OCCURRENCE = 'error_occurrence',
  CONVERSION_EVENT = 'conversion_event'
}

/**
 * Base analytics event structure
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
}

/**
 * Graph execution analytics event
 */
export interface GraphExecutionEvent extends AnalyticsEvent {
  type: AnalyticsEventType.GRAPH_EXECUTION_START | 
        AnalyticsEventType.GRAPH_EXECUTION_COMPLETE | 
        AnalyticsEventType.GRAPH_EXECUTION_ERROR;
  metadata: {
    graphId: string;
    nodeCount: number;
    connectionCount: number;
    executionTimeMs?: number;
    seed?: number;
    success: boolean;
    errorMessage?: string;
    outputLength?: number;
  };
}

/**
 * Node execution analytics event
 */
export interface NodeExecutionEvent extends AnalyticsEvent {
  type: AnalyticsEventType.NODE_EXECUTION_START | 
        AnalyticsEventType.NODE_EXECUTION_COMPLETE | 
        AnalyticsEventType.NODE_EXECUTION_ERROR;
  metadata: {
    nodeId: string;
    nodeType: string;
    graphId: string;
    executionTimeMs?: number;
    inputSize?: number;
    outputSize?: number;
    success: boolean;
    errorMessage?: string;
  };
}

/**
 * User interaction analytics event
 */
export interface UserInteractionEvent extends AnalyticsEvent {
  type: AnalyticsEventType.NODE_CREATED | 
        AnalyticsEventType.NODE_UPDATED | 
        AnalyticsEventType.NODE_DELETED |
        AnalyticsEventType.CONNECTION_CREATED |
        AnalyticsEventType.CONNECTION_DELETED |
        AnalyticsEventType.CANVAS_INTERACTION;
  metadata: {
    nodeId?: string;
    nodeType?: string;
    connectionId?: string;
    canvasPosition?: { x: number; y: number };
    interactionType?: string;
    graphId: string;
  };
}

/**
 * Token usage analytics event
 */
export interface TokenUsageEvent extends AnalyticsEvent {
  type: AnalyticsEventType.TOKEN_USAGE;
  metadata: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    nodeId: string;
    graphId: string;
  };
}

/**
 * Performance metrics event
 */
export interface PerformanceMetricEvent extends AnalyticsEvent {
  type: AnalyticsEventType.PERFORMANCE_METRIC;
  metadata: {
    metricName: string;
    metricValue: number;
    metricUnit: string;
    nodeId?: string;
    graphId?: string;
    component: string;
  };
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  /** Enable/disable analytics collection */
  enabled: boolean;
  /** Sample rate (0-1) for non-critical events */
  sampleRate: number;
  /** Buffer size before flushing to storage */
  bufferSize: number;
  /** Buffer flush interval in milliseconds */
  flushInterval: number;
  /** Enable privacy mode (anonymize sensitive data) */
  privacyMode: boolean;
  /** Maximum events to retain in memory */
  maxEvents: number;
  /** Data retention period in milliseconds */
  retentionPeriod: number;
}

/**
 * Analytics data aggregation window
 */
export interface AnalyticsWindow {
  startTime: number;
  endTime: number;
  events: AnalyticsEvent[];
  metrics: {
    totalEvents: number;
    eventsByType: Map<AnalyticsEventType, number>;
    uniqueUsers: number;
    uniqueSessions: number;
    averageExecutionTime: number;
    totalTokenUsage: number;
    totalCost: number;
    errorRate: number;
  };
}

/**
 * Comprehensive analytics collector extending existing metrics infrastructure
 */
export class AnalyticsCollector extends EventEmitter {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private currentSessionId: string = uuidv4();
  private sessionStartTime: number = Date.now();

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      bufferSize: 100,
      flushInterval: 10000, // 10 seconds
      privacyMode: false,
      maxEvents: 10000,
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...config
    };

    if (this.config.enabled) {
      this.startCollection();
    }
  }

  /**
   * Start analytics collection
   */
  startCollection(): void {
    if (!this.config.enabled) return;

    console.log('Starting analytics collection');
    
    // Record session start
    this.recordEvent({
      id: uuidv4(),
      type: AnalyticsEventType.USER_SESSION_START,
      timestamp: this.sessionStartTime,
      sessionId: this.currentSessionId,
      metadata: {
        userAgent: process.env.USER_AGENT || 'server',
        platform: process.platform,
        nodeVersion: process.version
      }
    });

    // Start periodic flush
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);

    // Start cleanup routine
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // cleanup every minute
  }

  /**
   * Stop analytics collection
   */
  stopCollection(): void {
    if (!this.config.enabled) return;

    console.log('Stopping analytics collection');

    // Record session end
    this.recordEvent({
      id: uuidv4(),
      type: AnalyticsEventType.USER_SESSION_END,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        sessionDuration: Date.now() - this.sessionStartTime,
        eventsRecorded: this.events.length
      }
    });

    // Flush remaining events
    this.flushEvents();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Record a graph execution start event
   */
  recordGraphExecutionStart(graphId: string, nodeCount: number, connectionCount: number, seed?: number): void {
    const event: GraphExecutionEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.GRAPH_EXECUTION_START,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        graphId,
        nodeCount,
        connectionCount,
        seed,
        success: false
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record a graph execution completion event
   */
  recordGraphExecutionComplete(
    graphId: string, 
    executionTimeMs: number, 
    outputLength: number,
    nodeCount: number,
    connectionCount: number
  ): void {
    const event: GraphExecutionEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.GRAPH_EXECUTION_COMPLETE,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        graphId,
        nodeCount,
        connectionCount,
        executionTimeMs,
        outputLength,
        success: true
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record a graph execution error event
   */
  recordGraphExecutionError(
    graphId: string, 
    errorMessage: string,
    nodeCount: number,
    connectionCount: number,
    executionTimeMs?: number
  ): void {
    const event: GraphExecutionEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.GRAPH_EXECUTION_ERROR,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        graphId,
        nodeCount,
        connectionCount,
        executionTimeMs,
        errorMessage,
        success: false
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record a node execution event
   */
  recordNodeExecution(
    nodeId: string,
    nodeType: string,
    graphId: string,
    executionTimeMs: number,
    success: boolean,
    inputSize?: number,
    outputSize?: number,
    errorMessage?: string
  ): void {
    const eventType = success 
      ? AnalyticsEventType.NODE_EXECUTION_COMPLETE 
      : AnalyticsEventType.NODE_EXECUTION_ERROR;

    const event: NodeExecutionEvent = {
      id: uuidv4(),
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        nodeId,
        nodeType,
        graphId,
        executionTimeMs,
        inputSize,
        outputSize,
        success,
        errorMessage
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record token usage event
   */
  recordTokenUsage(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    estimatedCost: number,
    nodeId: string,
    graphId: string
  ): void {
    const event: TokenUsageEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.TOKEN_USAGE,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        provider,
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost,
        nodeId,
        graphId
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record user interaction event
   */
  recordUserInteraction(
    interactionType: AnalyticsEventType,
    graphId: string,
    metadata: Record<string, any> = {}
  ): void {
    const event: UserInteractionEvent = {
      id: uuidv4(),
      type: interactionType,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        graphId,
        ...metadata
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(
    metricName: string,
    metricValue: number,
    metricUnit: string,
    component: string,
    nodeId?: string,
    graphId?: string
  ): void {
    const event: PerformanceMetricEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.PERFORMANCE_METRIC,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      metadata: {
        metricName,
        metricValue,
        metricUnit,
        component,
        nodeId,
        graphId
      }
    };
    
    this.recordEvent(event);
  }

  /**
   * Get analytics data for a time window
   */
  getAnalyticsWindow(startTime: number, endTime: number): AnalyticsWindow {
    const windowEvents = this.events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );

    const eventsByType = new Map<AnalyticsEventType, number>();
    const uniqueUsers = new Set<string>();
    const uniqueSessions = new Set<string>();
    let totalExecutionTime = 0;
    let executionEventCount = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let errorCount = 0;

    windowEvents.forEach(event => {
      // Count events by type
      eventsByType.set(event.type, (eventsByType.get(event.type) || 0) + 1);
      
      // Track unique users and sessions
      if (event.userId) uniqueUsers.add(event.userId);
      uniqueSessions.add(event.sessionId);

      // Calculate metrics
      if (event.type === AnalyticsEventType.GRAPH_EXECUTION_COMPLETE) {
        const graphEvent = event as GraphExecutionEvent;
        if (graphEvent.metadata.executionTimeMs) {
          totalExecutionTime += graphEvent.metadata.executionTimeMs;
          executionEventCount++;
        }
      }

      if (event.type === AnalyticsEventType.TOKEN_USAGE) {
        const tokenEvent = event as TokenUsageEvent;
        totalTokens += tokenEvent.metadata.totalTokens;
        totalCost += tokenEvent.metadata.estimatedCost;
      }

      if (event.type.includes('error')) {
        errorCount++;
      }
    });

    return {
      startTime,
      endTime,
      events: windowEvents,
      metrics: {
        totalEvents: windowEvents.length,
        eventsByType,
        uniqueUsers: uniqueUsers.size,
        uniqueSessions: uniqueSessions.size,
        averageExecutionTime: executionEventCount > 0 ? totalExecutionTime / executionEventCount : 0,
        totalTokenUsage: totalTokens,
        totalCost,
        errorRate: windowEvents.length > 0 ? (errorCount / windowEvents.length) * 100 : 0
      }
    };
  }

  /**
   * Get current analytics summary
   */
  getCurrentSummary(): any {
    const oneHourAgo = Date.now() - 3600000;
    const window = this.getAnalyticsWindow(oneHourAgo, Date.now());
    
    return {
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      totalEventsRecorded: this.events.length,
      lastHour: window.metrics,
      bufferSize: this.events.length,
      isCollectionActive: this.config.enabled && this.flushTimer !== null
    };
  }

  /**
   * Record an analytics event
   */
  private recordEvent(event: AnalyticsEvent): void {
    if (!this.config.enabled) return;

    // Apply sampling for non-critical events
    if (!this.isCriticalEvent(event.type) && Math.random() > this.config.sampleRate) {
      return;
    }

    // Apply privacy mode if enabled
    if (this.config.privacyMode) {
      event = this.anonymizeEvent(event);
    }

    this.events.push(event);
    this.emit('event_recorded', event);

    // Check if buffer is full
    if (this.events.length >= this.config.bufferSize) {
      this.flushEvents();
    }

    // Prevent memory overflow
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }
  }

  /**
   * Check if an event type is critical (always recorded)
   */
  private isCriticalEvent(eventType: AnalyticsEventType): boolean {
    const criticalEvents = [
      AnalyticsEventType.GRAPH_EXECUTION_ERROR,
      AnalyticsEventType.NODE_EXECUTION_ERROR,
      AnalyticsEventType.ERROR_OCCURRENCE,
      AnalyticsEventType.USER_SESSION_START,
      AnalyticsEventType.USER_SESSION_END
    ];
    
    return criticalEvents.includes(eventType);
  }

  /**
   * Anonymize sensitive data in events
   */
  private anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
    const anonymized = { ...event };
    
    // Remove or hash sensitive fields
    if (anonymized.userId) {
      anonymized.userId = this.hashString(anonymized.userId);
    }
    
    // Remove sensitive metadata
    if (anonymized.metadata) {
      const { userAgent, ...cleanMetadata } = anonymized.metadata;
      anonymized.metadata = cleanMetadata;
    }
    
    return anonymized;
  }

  /**
   * Simple hash function for anonymization
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Flush events to persistent storage
   */
  private flushEvents(): void {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    // Emit flush event for storage handlers
    this.emit('events_flushed', eventsToFlush);
    
    console.log(`Flushed ${eventsToFlush.length} analytics events`);
  }

  /**
   * Clean up old events beyond retention period
   */
  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    const originalLength = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
    
    const removedCount = originalLength - this.events.length;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old analytics events`);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!this.config.enabled && this.flushTimer) {
      this.stopCollection();
    } else if (this.config.enabled && !this.flushTimer) {
      this.startCollection();
    }
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        exportTime: Date.now(),
        sessionId: this.currentSessionId,
        config: this.config,
        events: this.events
      }, null, 2);
    }
    
    // CSV export (simplified)
    const headers = ['id', 'type', 'timestamp', 'sessionId', 'userId', 'metadata'];
    const rows = this.events.map(event => [
      event.id,
      event.type,
      event.timestamp,
      event.sessionId,
      event.userId || '',
      JSON.stringify(event.metadata)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}