/**
 * Collaboration Analytics Collector for Epic 23
 * 
 * Extends the existing AnalyticsCollector with specialized collaboration
 * event tracking, real-time metrics collection, and Epic 23 success
 * criteria monitoring.
 * 
 * Integrates seamlessly with WebSocket collaboration system and provides
 * comprehensive telemetry for team productivity and collaboration health.
 */

import { AnalyticsCollector } from './AnalyticsCollector';
import { 
  CollaborationEventType, 
  CollaborationTelemetryEvent, 
  CollaborationContext,
  CollaborationTelemetrySchemas,
  EPIC_23_SUCCESS_CRITERIA
} from './CollaborationTelemetry';
import { AnalyticsWebSocketServer } from '../websocket/AnalyticsWebSocketServer';
import { getDatabase } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

// Collaboration-specific metrics tracking
}
}
interface CollaborationMetrics {
  realTimeLatency: {
    samples: number[];
    p50: number;
    p95: number;
    p99: number;
}
}
  };
  
  conflictResolution: {
    totalConflicts: number;
    resolvedSuccessfully: number;
    averageResolutionTime: number;
    resolutionMethods: Record<string, number>;
  };
  
  workspaceAdoption: {
    totalWorkspaces: number;
    activeWorkspaces: number;
    averageTeamSize: number;
    adoptionRate: number;
  };
  
  userEngagement: {
    dailyActiveCollaborators: number;
    averageSessionDuration: number;
    featureUsageRates: Record<string, number>;
    satisfactionScores: number[];
  };
  
  performance: {
    connectionQuality: Record<string, number>;
    syncSuccessRate: number;
    websocketUptime: number;
    bandwidthUsage: number;
  };
}

// Real-time collaboration session tracking
}
}
interface ActiveCollaborationSession {
  sessionId: string;
  workspaceId: string;
  projectId?: string;
  resourceId?: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  activityCount: number;
  presenceStatus: string;
  clientInfo: {
    userAgent?: string;
    version?: string;
    device?: string;
}
}
  };
}

export class CollaborationAnalyticsCollector {
  private analyticsCollector: AnalyticsCollector;
  private wsAnalyticsServer: AnalyticsWebSocketServer;
  private metrics: CollaborationMetrics;
  private activeSessions: Map<string, ActiveCollaborationSession>;
  private metricsUpdateInterval: NodeJS.Timeout | null;
  
  constructor(
    analyticsCollector: AnalyticsCollector,
    wsAnalyticsServer: AnalyticsWebSocketServer
  ) {
    this.analyticsCollector = analyticsCollector;
    this.wsAnalyticsServer = wsAnalyticsServer;
    this.activeSessions = new Map();
    this.metricsUpdateInterval = null;
    
    // Initialize metrics structure
    this.metrics = {
      realTimeLatency: { samples: [], p50: 0, p95: 0, p99: 0 },
      conflictResolution: { 
        totalConflicts: 0, 
        resolvedSuccessfully: 0, 
        averageResolutionTime: 0,
        resolutionMethods: {}
  }
      workspaceAdoption: { 
        totalWorkspaces: 0, 
        activeWorkspaces: 0, 
        averageTeamSize: 0,
        adoptionRate: 0
  }
      userEngagement: { 
        dailyActiveCollaborators: 0, 
        averageSessionDuration: 0,
        featureUsageRates: {},
        satisfactionScores: []
  }
      performance: { 
        connectionQuality: {}, 
        syncSuccessRate: 0, 
        websocketUptime: 0,
        bandwidthUsage: 0
      }
    };
    
    this.startMetricsCollection();
  }

  /**
   * Record a collaboration telemetry event with validation and processing
   */
  async recordCollaborationEvent(event: CollaborationTelemetryEvent): Promise<void> {

    try {
      // Validate event structure
      const schema = CollaborationTelemetrySchemas[event.eventType];
      if (!schema) {
        throw new Error(`Unknown collaboration event type: ${event.eventType}`);
      }
      
      const validatedEvent = schema.parse(event);
      
      // Update real-time metrics
      this.updateRealTimeMetrics(validatedEvent);
      
      // Track active sessions
      this.updateSessionTracking(validatedEvent);
      
      // Store event in database
      await this.storeCollaborationEvent(validatedEvent);
      
      // Stream real-time updates to connected clients
      await this.streamRealTimeUpdate(validatedEvent);
      
      // Check Epic 23 success criteria
      this.evaluateEpic23Criteria(validatedEvent);
      
      console.log(`📊 Recorded collaboration event: ${event.eventType}`);
      
    } catch (error) {
      console.error('Failed to record collaboration event:', error);
      
      // Record the error but don't fail the operation
      await this.analyticsCollector.recordEvent({
        eventType: 'ERROR_OCCURRENCE' as any,
        userId: event.context.userId,
        timestamp: new Date(),
        data: {
          error: 'collaboration_event_recording_failed',
          originalEventType: event.eventType,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Track collaborative session lifecycle
   */
  async startCollaborativeSession(context: CollaborationContext): Promise<void> {

    const sessionId = uuidv4();
    const session: ActiveCollaborationSession = {
      sessionId,
      workspaceId: context.workspaceId,
      projectId: context.projectId,
      resourceId: context.resourceId,
      userId: context.userId,
      startTime: new Date(),
      lastActivity: new Date(),
      activityCount: 0,
      presenceStatus: 'active',
      clientInfo: {
        userAgent: context.userAgent,
        version: context.clientVersion
      }
    };
    
    this.activeSessions.set(sessionId, session);
    
    await this.recordCollaborationEvent({
      eventType: CollaborationEventType.COLLABORATIVE_SESSION_START,
      context: { ...context, sessionId },
      data: {
        collaboratorCount: this.getActiveCollaboratorCount(context.workspaceId),
        resourceType: 'graph', // Default, should be determined from context
        accessMethod: 'direct', // Default, should be determined from context  
        deviceType: this.detectDeviceType(context.userAgent),
        connectionQuality: 'good', // Default, should be measured
        previousSessionExists: await this.hasPreviousSession(context.userId, context.workspaceId)
      }
    });
  }

  /**
   * End collaborative session and record metrics
   */
  async endCollaborativeSession(sessionId: string): Promise<void> {

    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    const sessionDuration = Date.now() - session.startTime.getTime();
    
    await this.recordCollaborationEvent({
      eventType: CollaborationEventType.COLLABORATIVE_SESSION_END,
      context: {
        workspaceId: session.workspaceId,
        projectId: session.projectId,
        resourceId: session.resourceId,
        userId: session.userId,
        userRole: 'collaborator', // Should be retrieved from session context
        timestamp: new Date(),
        sessionId
  }
      data: {
        sessionDuration,
        activityCount: session.activityCount,
        finalPresenceStatus: session.presenceStatus,
        collaborationQuality: this.assessSessionQuality(session)
      } as any
    });
    
    this.activeSessions.delete(sessionId);
  }

  /**
   * Track real-time conflict resolution
   */
  async recordConflictResolution(
    context: CollaborationContext,
    conflictData: {
      conflictId: string;
      conflictType: string;
      involvedUsers: string[];
      resolutionStrategy: string;
      resolutionTimeMs?: number;
      success: boolean;
    }
  ): Promise<void> {

    const eventType = conflictData.resolutionTimeMs 
      ? CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED
      : CollaborationEventType.CONFLICT_RESOLUTION_TRIGGERED;
    
    await this.recordCollaborationEvent({
      eventType,
      context,
      data: {
        conflictId: conflictData.conflictId,
        conflictType: conflictData.conflictType as any,
        involvedUsers: conflictData.involvedUsers,
        resolutionStrategy: conflictData.resolutionStrategy as any,
        resolutionTimeMs: conflictData.resolutionTimeMs,
        conflictComplexity: this.assessConflictComplexity(conflictData),
        automatedResolution: conflictData.resolutionStrategy !== 'manual_merge',
        userInterventionRequired: conflictData.resolutionStrategy === 'manual_merge',
        dataIntegrityMaintained: conflictData.success
      }
    });
  }

  /**
   * Measure and record collaboration latency
   */
  async recordCollaborationLatency(
    context: CollaborationContext,
    latencyMs: number,
    operationType: string
  ): Promise<void> {

    await this.recordCollaborationEvent({
      eventType: CollaborationEventType.COLLABORATION_LATENCY_MEASURED,
      context,
      data: {
        metricType: 'latency',
        value: latencyMs,
        unit: 'ms',
        threshold: {
          warning: EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET * 1.5,
          critical: EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET * 2
  }
        performanceTier: this.classifyPerformance(latencyMs, EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET),
        networkConditions: {
          connectionType: 'unknown' // Should be detected from client
        }
      }
    });
  }

  /**
   * Get real-time collaboration dashboard data
   */
  async getCollaborationDashboardData(): Promise<any> {

    const currentTime = new Date();
    const activeSessions = Array.from(this.activeSessions.values());
    
    return {
      timestamp: currentTime,
      epic23_progress: {
        real_time_latency: {
          current: this.metrics.realTimeLatency.p95,
          target: EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET,
          status: this.metrics.realTimeLatency.p95 <= EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET
  }
        conflict_resolution_rate: {
          current: this.metrics.conflictResolution.resolvedSuccessfully / this.metrics.conflictResolution.totalConflicts || 0,
          target: EPIC_23_SUCCESS_CRITERIA.CONFLICT_RESOLUTION_SUCCESS_RATE,
          status: (this.metrics.conflictResolution.resolvedSuccessfully / this.metrics.conflictResolution.totalConflicts || 0) >= EPIC_23_SUCCESS_CRITERIA.CONFLICT_RESOLUTION_SUCCESS_RATE
  }
        workspace_adoption: {
          current: this.metrics.workspaceAdoption.adoptionRate,
          target: EPIC_23_SUCCESS_CRITERIA.WORKSPACE_ADOPTION_RATE,
          status: this.metrics.workspaceAdoption.adoptionRate >= EPIC_23_SUCCESS_CRITERIA.WORKSPACE_ADOPTION_RATE
        }
  }
      active_collaboration: {
        total_sessions: activeSessions.length,
        unique_collaborators: new Set(activeSessions.map(s => s.userId)).size,
        active_workspaces: new Set(activeSessions.map(s => s.workspaceId)).size,
        average_session_duration: this.calculateAverageSessionDuration(),
        concurrent_peak: this.getCurrentConcurrentPeak(}
      performance_metrics: {
        ...this.metrics.performance,
        recent_latency: this.metrics.realTimeLatency,
        conflict_resolution: this.metrics.conflictResolution
  }
      user_engagement: {
        ...this.metrics.userEngagement,
        satisfaction_average: this.calculateAverageSatisfaction(}
    };
  }

  // Private helper methods
  
  private updateRealTimeMetrics(event: CollaborationTelemetryEvent): void {
    switch (event.eventType) {
    case CollaborationEventType.COLLABORATION_LATENCY_MEASURED:
      if ('value' in event.data) {
        this.metrics.realTimeLatency.samples.push(event.data.value);
        if (this.metrics.realTimeLatency.samples.length > 1000) {
          this.metrics.realTimeLatency.samples = this.metrics.realTimeLatency.samples.slice(-1000);
        }
        this.updateLatencyPercentiles();
      }
      break;
        
    case CollaborationEventType.CONFLICT_RESOLUTION_TRIGGERED:
      this.metrics.conflictResolution.totalConflicts++;
      break;
        
    case CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED:
      this.metrics.conflictResolution.resolvedSuccessfully++;
      if ('resolutionTimeMs' in event.data && event.data.resolutionTimeMs) {
        this.updateAverageResolutionTime(event.data.resolutionTimeMs);
      }
      break;
    }
  }

  private updateLatencyPercentiles(): void {
    const sorted = [...this.metrics.realTimeLatency.samples].sort((a, b) => a - b);
    const len = sorted.length;
    
    if (len > 0) {
      this.metrics.realTimeLatency.p50 = sorted[Math.floor(len * 0.5)];
      this.metrics.realTimeLatency.p95 = sorted[Math.floor(len * 0.95)];
      this.metrics.realTimeLatency.p99 = sorted[Math.floor(len * 0.99)];
    }
  }

  private updateSessionTracking(event: CollaborationTelemetryEvent): void {
    const session = this.activeSessions.get(event.context.sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.activityCount++;
    }
  }

  private async storeCollaborationEvent(event: CollaborationTelemetryEvent): Promise<void> {

    // Use existing analytics database storage
    const db = getDatabase();
    
    await db.query(`
      INSERT INTO collaboration_events (
        id, event_type, user_id, workspace_id, project_id, resource_id,
        session_id, timestamp, event_data, context_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      event.eventType,
      event.context.userId,
      event.context.workspaceId,
      event.context.projectId || null,
      event.context.resourceId || null,
      event.context.sessionId,
      event.context.timestamp.toISOString(),
      JSON.stringify(event.data),
      JSON.stringify(event.context)
    ]);
  }

  private async streamRealTimeUpdate(event: CollaborationTelemetryEvent): Promise<void> {

    // Stream to analytics WebSocket server for real-time dashboards
    const update = {
      type: 'collaboration_event',
      eventType: event.eventType,
      workspaceId: event.context.workspaceId,
      timestamp: event.context.timestamp,
      summary: this.createEventSummary(event)
    };
    
    this.wsAnalyticsServer.broadcastToTopic('collaboration_analytics', update);
  }

  private evaluateEpic23Criteria(event: CollaborationTelemetryEvent): void {
    // Check if event affects Epic 23 success criteria and emit alerts if needed
    switch (event.eventType) {
    case CollaborationEventType.COLLABORATION_LATENCY_MEASURED:
      if ('value' in event.data && 
            event.data.value > EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET * 2) {
        this.emitEpic23Alert('latency_threshold_exceeded', {
          measured: event.data.value,
          target: EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET
        });
      }
      break;
        
    case CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED:
      const successRate = this.metrics.conflictResolution.resolvedSuccessfully / 
                           this.metrics.conflictResolution.totalConflicts;
      if (successRate < EPIC_23_SUCCESS_CRITERIA.CONFLICT_RESOLUTION_SUCCESS_RATE) {
        this.emitEpic23Alert('conflict_resolution_rate_below_target', {
          current: successRate,
          target: EPIC_23_SUCCESS_CRITERIA.CONFLICT_RESOLUTION_SUCCESS_RATE
        });
      }
      break;
    }
  }

  // Utility methods
  
  private getActiveCollaboratorCount(workspaceId: string): number {
    return Array.from(this.activeSessions.values())
      .filter(session => session.workspaceId === workspaceId).length;
  }

  private detectDeviceType(userAgent?: string): 'desktop' | 'tablet' | 'mobile' {
    if (!userAgent) return 'desktop';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return /iPad|Tablet/.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private async hasPreviousSession(userId: string, workspaceId: string): Promise<boolean> {

    const db = getDatabase();
    const result = await db.query(`
      SELECT COUNT(*) as count FROM collaboration_events 
      WHERE user_id = ? AND workspace_id = ? AND event_type = ?
    `, [userId, workspaceId, CollaborationEventType.COLLABORATIVE_SESSION_START]);
    
    return result[0]?.count > 0;
  }

  private assessSessionQuality(session: ActiveCollaborationSession): string {
    // Assess session quality based on activity count and duration
    const duration = Date.now() - session.startTime.getTime();
    const activityRate = session.activityCount / (duration / 60000); // Activities per minute
    
    if (activityRate > 5) return 'highly_engaged';
    if (activityRate > 2) return 'moderately_engaged';
    if (activityRate > 0.5) return 'lightly_engaged';
    return 'passive';
  }

  private assessConflictComplexity(conflictData: any): 'simple' | 'moderate' | 'complex' {
    if (conflictData.involvedUsers.length > 3) return 'complex';
    if (conflictData.conflictType === 'deletion' || conflictData.conflictType === 'creation') return 'moderate';
    return 'simple';
  }

  private classifyPerformance(value: number, target: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (value <= target * 0.5) return 'excellent';
    if (value <= target) return 'good';
    if (value <= target * 1.5) return 'acceptable';
    return 'poor';
  }

  private updateAverageResolutionTime(newTime: number): void {
    const current = this.metrics.conflictResolution.averageResolutionTime;
    const count = this.metrics.conflictResolution.resolvedSuccessfully;
    this.metrics.conflictResolution.averageResolutionTime = 
      (current * (count - 1) + newTime) / count;
  }

  private calculateAverageSessionDuration(): number {
    const sessions = Array.from(this.activeSessions.values());
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => 
      sum + (Date.now() - session.startTime.getTime()), 0);
    return totalDuration / sessions.length;
  }

  private getCurrentConcurrentPeak(): number {
    // Track daily peak concurrent users
    return Math.max(this.activeSessions.size, this.metrics.userEngagement.dailyActiveCollaborators);
  }

  private calculateAverageSatisfaction(): number {
    const scores = this.metrics.userEngagement.satisfactionScores;
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private createEventSummary(event: CollaborationTelemetryEvent): any {
    // Create a summary for real-time streaming
    return {
      eventType: event.eventType,
      userId: event.context.userId,
      workspaceId: event.context.workspaceId,
      timestamp: event.context.timestamp,
      // Include relevant data points without full event data
      ...(event.eventType.includes('conflict') && { 
        conflictType: 'conflictType' in event.data ? event.data.conflictType : 'unknown' 
  }
    };
  }

  private emitEpic23Alert(alertType: string, data: any): void {
    console.warn(`🚨 Epic 23 Alert: ${alertType}`, data);
    
    // In production, this would integrate with alerting systems
    this.wsAnalyticsServer.broadcastToTopic('epic23_alerts', {
      type: alertType,
      data,
      timestamp: new Date(),
      severity: 'warning'
    });
  }

  private startMetricsCollection(): void {
    // Update metrics every 30 seconds
    this.metricsUpdateInterval = setInterval(() => {
      this.updateAggregatedMetrics();
    }, 30000);
  }

  private updateAggregatedMetrics(): void {
    // Update workspace adoption metrics
    this.metrics.workspaceAdoption.activeWorkspaces = 
      new Set(Array.from(this.activeSessions.values()).map(s => s.workspaceId)).size;
      
    // Update user engagement metrics
    this.metrics.userEngagement.dailyActiveCollaborators = 
      new Set(Array.from(this.activeSessions.values()).map(s => s.userId)).size;
  }

  // Cleanup method
  public destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    this.activeSessions.clear();
  }
}

export { CollaborationAnalyticsCollector };
export default CollaborationAnalyticsCollector;