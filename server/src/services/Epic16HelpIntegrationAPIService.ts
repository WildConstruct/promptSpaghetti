/**
 * Epic 16 Help Integration API Service
 * Task: E16-1753114247189-025428 - Create integration architecture
 * 
 * Server-side API service for Epic 16 Help Integration Architecture.
 * Handles help session management, cross-system transitions, support escalation,
 * and analytics integration for the marketplace help system.
 */

import { Database } from '../database/connection';
import { Epic16SupportEscalationService } from '../admin/Epic16SupportEscalationService';
import { Epic16TicketIntegrationService } from '../../../packages/core/services/Epic16TicketIntegrationService';
import { EventEmitter } from 'events';

// =============================================================================
// API Service Types
// =============================================================================

export interface HelpSessionAPIRequest {
  userId: string;
  sessionType: 'onboarding' | 'feature-discovery' | 'troubleshooting' | 'purchase-assistance' | 'template-creation' | 'marketplace-navigation';
  context: {
    currentView: string;
    templateId?: string;
    searchQuery?: string;
    userRole: 'buyer' | 'seller' | 'admin';
    graphContext?: unknown;
    marketplaceContext?: unknown;
  };
}

export interface HelpContentAPIResponse {
  success: boolean;
  content: HelpContentItem[];
  sessionId?: string;
  metadata: {
    totalItems: number;
    userLevel: string;
    contextualRelevance: number;
    estimatedReadTime: number;
  };
}

export interface HelpContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  filmTerminology?: string;
  actionItems?: string[];
  level: string;
  priority: number;
  estimatedTime: number;
  interactionTracking: {
    viewRequired: boolean;
    completionTracking: boolean;
    feedbackEnabled: boolean;
  };
}

export interface TransitionAPIRequest {
  userId: string;
  fromSystem: 'graph-editor' | 'marketplace';
  toSystem: 'graph-editor' | 'marketplace';
  preserveHelp: boolean;
  currentSessionId?: string;
  transitionData?: Record<string, any>;
}

export interface EscalationAPIRequest {
  sessionId: string;
  userId: string;
  escalationReason: string;
  userDescription: string;
  priority: 'low' | 'medium' | 'high';
  additionalContext?: {
    errorMessages?: string[];
    userActions?: string[];
    systemState?: Record<string, any>;
    attachments?: string[];
  };
}

// =============================================================================
// Epic 16 Help Integration API Service
// =============================================================================

export class Epic16HelpIntegrationAPIService extends EventEmitter {
  private database: Database;
  private supportService: Epic16SupportEscalationService;
  private ticketService: Epic16TicketIntegrationService;
  private activeSessions: Map<string, any> = new Map();
  private analyticsBuffer: unknown[] = [];

  constructor(
    database: Database,
    supportService: Epic16SupportEscalationService,
    ticketService: Epic16TicketIntegrationService
  ) {
    super();
    this.database = database;
    this.supportService = supportService;
    this.ticketService = ticketService;
    
    // Set up analytics flushing
    setInterval(() => this.flushAnalytics(), 30000); // Every 30 seconds
  }

  // =============================================================================
  // Help Content API Methods
  // =============================================================================

  async getContextualHelp(request: HelpSessionAPIRequest): Promise<HelpContentAPIResponse> {
    try {
      const startTime = Date.now();

      // 1. Get or create user profile
      const userProfile = await this.getUserProfile(request.userId);

      // 2. Analyze context for help relevance
      const contextAnalysis = this.analyzeHelpContext(request.context, userProfile);

      // 3. Fetch relevant help content
      const helpContent = await this.fetchHelpContent(request, contextAnalysis);

      // 4. Create or update help session
      const sessionId = await this.createHelpSession(request, helpContent);

      // 5. Track analytics
      this.trackHelpRequest(request, helpContent, Date.now() - startTime);

      const response: HelpContentAPIResponse = {
        success: true,
        content: helpContent,
        sessionId,
        metadata: {
          totalItems: helpContent.length,
          userLevel: userProfile.level,
          contextualRelevance: contextAnalysis.relevanceScore,
          estimatedReadTime: this.calculateReadTime(helpContent)
        }
      };

      return response;
    } catch (error) {
      this.emit('error', {
        method: 'getContextualHelp',
        error: error instanceof Error ? error.message : 'Unknown error',
        request
      });

      return {
        success: false,
        content: [],
        metadata: {
          totalItems: 0,
          userLevel: 'unknown',
          contextualRelevance: 0,
          estimatedReadTime: 0
        }
      };
    }
  }

  async handleSystemTransition(request: TransitionAPIRequest): Promise<{
    success: boolean;
    transitionId: string;
    continuousHelp: boolean;
    bridgeContent?: HelpContentItem[];
  }> {
    try {
      // 1. Validate transition request
      if (!this.isValidTransition(request.fromSystem, request.toSystem)) {
        throw new Error('Invalid system transition requested');
      }

      // 2. Handle existing help session
      let continuousHelp = false;
      let bridgeContent: HelpContentItem[] = [];

      if (request.currentSessionId && request.preserveHelp) {
        const existingSession = this.activeSessions.get(request.currentSessionId);
        if (existingSession) {
          continuousHelp = true;
          bridgeContent = await this.generateBridgeContent(request);
          
          // Update session with transition context
          existingSession.transitionContext = {
            fromSystem: request.fromSystem,
            toSystem: request.toSystem,
            transitionTime: new Date(),
            bridgeContentProvided: bridgeContent.length > 0
          };
          
          this.activeSessions.set(request.currentSessionId, existingSession);
        }
      }

      // 3. Create transition record
      const transitionId = await this.recordSystemTransition(request);

      // 4. Track transition analytics
      this.trackSystemTransition(request, continuousHelp);

      return {
        success: true,
        transitionId,
        continuousHelp,
        bridgeContent: bridgeContent.length > 0 ? bridgeContent : undefined
      };
    } catch (error) {
      this.emit('error', {
        method: 'handleSystemTransition',
        error: error instanceof Error ? error.message : 'Unknown error',
        request
      });

      return {
        success: false,
        transitionId: '',
        continuousHelp: false
      };
    }
  }

  async escalateToSupport(request: EscalationAPIRequest): Promise<{
    success: boolean;
    ticketId: string;
    ticketNumber: string;
    expectedResponse: string;
    supportChannels: string[];
  }> {
    try {
      // 1. Validate escalation request
      const session = this.activeSessions.get(request.sessionId);
      if (!session) {
        throw new Error('Help session not found for escalation');
      }

      // 2. Prepare escalation context
      const escalationContext = {
        helpSession: session,
        userDescription: request.userDescription,
        escalationReason: request.escalationReason,
        priority: request.priority,
        additionalContext: request.additionalContext,
        systemState: {
          timestamp: new Date(),
          userAgent: session.userAgent,
          sessionDuration: Date.now() - session.startTime,
          completedActions: session.completedActions,
          currentContext: session.context
        }
      };

      // 3. Create support ticket via Epic 16 ticket integration
      const supportTicket = await this.ticketService.createMarketplaceTicket({
        type: 'support_request' as any,
        title: `Help System Escalation: ${request.escalationReason}`,
        description: this.generateSupportDescription(escalationContext),
        priority: this.mapPriorityToTicketPriority(request.priority),
        category: 'help_system_escalation' as any,
        buyerId: request.userId,
        metadata: {
          helpSessionId: request.sessionId,
          escalationLevel: (session.escalationLevel || 0) + 1,
          originalContext: escalationContext
        }
      });

      // 4. Update help session
      session.supportTicketId = supportTicket.id;
      session.escalationLevel = (session.escalationLevel || 0) + 1;
      session.requiresHumanAssistance = true;
      session.escalationHistory = session.escalationHistory || [];
      session.escalationHistory.push({
        timestamp: new Date(),
        reason: request.escalationReason,
        priority: request.priority,
        ticketId: supportTicket.id
      });

      this.activeSessions.set(request.sessionId, session);

      // 5. Trigger support escalation service
      await this.supportService.processEscalation({
        ticketId: supportTicket.id,
        priority: this.mapPriorityToTicketPriority(request.priority),
        escalationReason: request.escalationReason,
        originalChannel: 'help_system',
        context: escalationContext
      });

      // 6. Track escalation analytics
      this.trackSupportEscalation(request, supportTicket.id);

      return {
        success: true,
        ticketId: supportTicket.id,
        ticketNumber: supportTicket.metadata?.ticketNumber || supportTicket.id,
        expectedResponse: this.calculateExpectedResponse(request.priority),
        supportChannels: ['email', 'in-app', 'documentation']
      };
    } catch (error) {
      this.emit('error', {
        method: 'escalateToSupport',
        error: error instanceof Error ? error.message : 'Unknown error',
        request
      });

      return {
        success: false,
        ticketId: '',
        ticketNumber: '',
        expectedResponse: 'Unable to process escalation',
        supportChannels: []
      };
    }
  }

  // =============================================================================
  // Session Management API Methods
  // =============================================================================

  async updateHelpSession(
    sessionId: string,
    updates: {
      completedActions?: string[];
      currentStep?: number;
      feedbackRating?: number;
      timeSpent?: number;
      helpfulContent?: string[];
      skippedContent?: string[];
    }
  ): Promise<{ success: boolean; session?: unknown }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Help session not found');
      }

      // Update session data
      Object.assign(session, {
        ...updates,
        lastUpdate: new Date()
      });

      this.activeSessions.set(sessionId, session);

      // Track session update analytics
      this.trackSessionUpdate(sessionId, updates);

      return { success: true, session };
    } catch (error) {
      return { success: false };
    }
  }

  async getHelpSessionAnalytics(sessionId: string): Promise<{
    success: boolean;
    analytics?: {
      duration: number;
      completionRate: number;
      helpfulnessScore: number;
      contentEngagement: Record<string, number>;
      transitionPoints: unknown[];
      escalationEvents: unknown[];
    };
  }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return { success: false };
      }

      const analytics = {
        duration: Date.now() - session.startTime,
        completionRate: session.currentStep / session.totalSteps,
        helpfulnessScore: this.calculateHelpfulnessScore(session),
        contentEngagement: this.calculateContentEngagement(session),
        transitionPoints: session.transitionHistory || [],
        escalationEvents: session.escalationHistory || []
      };

      return { success: true, analytics };
    } catch (error) {
      return { success: false };
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async getUserProfile(userId: string): Promise<unknown> {
    // Implementation would fetch user profile from database
    return {
      id: userId,
      level: 'intermediate',
      preferences: {
        showFilmTerminology: true,
        autoTriggerHelp: true,
        preferredComplexity: 'detailed'
      },
      progress: {
        nodesCreated: 0,
        connectionsBuilt: 0,
        previewsGenerated: 0,
        projectsCompleted: 0
      }
    };
  }

  private analyzeHelpContext(
    context: unknown,
    userProfile: Error
  ): { relevanceScore: number; contextFactors: string[] } {
    let relevanceScore = 50; // Base score
    const contextFactors: string[] = [];

    // Analyze context factors
    if (context.currentView) {
      relevanceScore += 10;
      contextFactors.push('view-specific');
    }

    if (context.templateId) {
      relevanceScore += 15;
      contextFactors.push('template-specific');
    }

    if (context.searchQuery) {
      relevanceScore += 10;
      contextFactors.push('search-context');
    }

    if (userProfile.level === 'beginner') {
      relevanceScore += 20;
      contextFactors.push('beginner-boost');
    }

    return { relevanceScore: Math.min(relevanceScore, 100), contextFactors };
  }

  private async fetchHelpContent(request: HelpSessionAPIRequest, _____analysis: unknown): Promise<HelpContentItem[]> {
    // Mock implementation - would integrate with actual help content system
    const mockContent: HelpContentItem[] = [
      {
        id: 'marketplace-navigation',
        type: 'navigation',
        title: 'Navigating the Marketplace',
        content: 'Learn how to efficiently browse and search the template marketplace',
        level: 'beginner',
        priority: 10,
        estimatedTime: 120,
        interactionTracking: {
          viewRequired: true,
          completionTracking: true,
          feedbackEnabled: true
        }
      }
    ];

    return mockContent.filter(content => content.level === request.context.userRole || content.level === 'beginner');
  }

  private async createHelpSession(request: HelpSessionAPIRequest, content: HelpContentItem[]): Promise<string> {
    const sessionId = `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      userId: request.userId,
      sessionType: request.sessionType,
      startTime: Date.now(),
      currentStep: 0,
      totalSteps: content.length,
      context: request.context,
      content: content,
      completedActions: [],
      escalationLevel: 0,
      requiresHumanAssistance: false
    };

    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  private isValidTransition(from: string, to: string): boolean {
    const validTransitions = [
      ['graph-editor', 'marketplace'],
      ['marketplace', 'graph-editor']
    ];
    
    return validTransitions.some(([f, t]) => f === from && t === to);
  }

  private async generateBridgeContent(request: TransitionAPIRequest): Promise<HelpContentItem[]> {
    // Generate contextual bridge content based on transition
    const bridgeContent: HelpContentItem = {
      id: `bridge_${request.fromSystem}_to_${request.toSystem}`,
      type: 'transition',
      title: `Moving from ${request.fromSystem} to ${request.toSystem}`,
      content: `Here's how to continue your workflow in the ${request.toSystem}`,
      level: 'intermediate',
      priority: 15,
      estimatedTime: 60,
      interactionTracking: {
        viewRequired: false,
        completionTracking: false,
        feedbackEnabled: true
      }
    };

    return [bridgeContent];
  }

  private async recordSystemTransition(request: TransitionAPIRequest): Promise<string> {
    const transitionId = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Record in database
    try {
      await this.database.query(
        `INSERT INTO help_system_transitions (
          id,
          user_id,
          from_system,
          to_system,
          preserve_help,
          transition_data,
          created_at
        )
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [transitionId, request.userId, request.fromSystem, request.toSystem, request.preserveHelp, JSON.stringify(request.transitionData)]
      );
    } catch (error) {
      console.error('Failed to record system transition:', error);
    }

    return transitionId;
  }

  private generateSupportDescription(context: unknown): string {
    return `
    User Help System Escalation
    
    Session Information:
    - Session Type: ${context.helpSession.sessionType}
    - Duration: ${Math.round((Date.now() - context.helpSession.startTime) / 1000)} seconds
    - Current Step: ${context.helpSession.currentStep}/${context.helpSession.totalSteps}
    
    User Description:
    ${context.userDescription}
    
    Escalation Reason:
    ${context.escalationReason}
    
    System Context:
    ${JSON.stringify(context.systemState, null, 2)}
    
    Additional Context:
    ${context.additionalContext ? JSON.stringify(context.additionalContext, null, 2) : 'None provided'}
    `;
  }

  private mapPriorityToTicketPriority(priority: string): unknown {
    const priorityMap = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high'
    };
    return priorityMap[priority] || 'medium';
  }

  private calculateExpectedResponse(priority: string): string {
    const responseTimeMap = {
      'low': '24-48 hours',
      'medium': '8-12 hours',
      'high': '2-4 hours'
    };
    return responseTimeMap[priority] || '24-48 hours';
  }

  private calculateReadTime(content: HelpContentItem[]): number {
    return content.reduce((total, item) => total + item.estimatedTime, 0);
  }

  private calculateHelpfulnessScore(session: unknown): number {
    // Calculate based on user feedback and completion rate
    return Math.round((session.currentStep / session.totalSteps) * 100);
  }

  private calculateContentEngagement(session: unknown): Record<string, number> {
    // Mock implementation
    return {
      'total_views': session.currentStep,
      'completion_rate': session.currentStep / session.totalSteps,
      'time_per_item': (Date.now() - session.startTime) / session.currentStep
    };
  }

  // Analytics tracking methods
  private trackHelpRequest(request: unknown, content: unknown[], duration: number): void {
    this.analyticsBuffer.push({
      event: 'help_content_requested',
      userId: request.userId,
      sessionType: request.sessionType,
      contentCount: content.length,
      duration,
      timestamp: new Date()
    });
  }

  private trackSystemTransition(request: unknown, continuousHelp: boolean): void {
    this.analyticsBuffer.push({
      event: 'system_transition',
      userId: request.userId,
      fromSystem: request.fromSystem,
      toSystem: request.toSystem,
      continuousHelp,
      timestamp: new Date()
    });
  }

  private trackSupportEscalation(request: unknown, ticketId: string): void {
    this.analyticsBuffer.push({
      event: 'support_escalation',
      userId: request.userId,
      sessionId: request.sessionId,
      ticketId,
      priority: request.priority,
      timestamp: new Date()
    });
  }

  private trackSessionUpdate(sessionId: string, updates: unknown): void {
    this.analyticsBuffer.push({
      event: 'help_session_updated',
      sessionId,
      updates,
      timestamp: new Date()
    });
  }

  private async flushAnalytics(): Promise<void> {
    if (this.analyticsBuffer.length === 0) return;

    try {
      // Batch insert analytics data
      const events = this.analyticsBuffer.splice(0);
      await this.database.query(
        `INSERT INTO help_system_analytics (event_type, event_data, created_at)
         SELECT unnest($1::text[]), unnest($2::jsonb[]), unnest($3::timestamp[])`,
        [
          events.map(e => e.event),
          events.map(e => JSON.stringify(e)),
          events.map(e => e.timestamp)
        ]
      );
    } catch (error) {
      console.error('Failed to flush help analytics:', error);
    }
  }
}

export default Epic16HelpIntegrationAPIService;