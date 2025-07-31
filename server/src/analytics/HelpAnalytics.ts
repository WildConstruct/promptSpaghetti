/**
 * Help Analytics System (Epic 16)
 * 
 * DEPLOYMENT BLOCKER FIX: Comprehensive analytics system for tracking help
 * system usage, effectiveness, and user behavior patterns to optimize
 * documentation, support flows, and user experience.
 * 
 * Features:
 * - Help interaction tracking
 * - Documentation effectiveness metrics
 * - User journey analysis
 * - Support ticket correlation
 * - Search analytics
 * - Content performance tracking
 * - User satisfaction metrics
 * - Self-service success rates
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsCollector, AnalyticsEventType, AnalyticsEvent } from './AnalyticsCollector';

// Help-specific event types
export enum HelpEventType {
  // Help system interactions
  HELP_SEARCH = 'help_search',
  HELP_ARTICLE_VIEW = 'help_article_view',
  HELP_ARTICLE_HELPFUL = 'help_article_helpful',
  HELP_ARTICLE_NOT_HELPFUL = 'help_article_not_helpful',
  HELP_TOOLTIP_SHOWN = 'help_tooltip_shown',
  HELP_TOOLTIP_DISMISSED = 'help_tooltip_dismissed',
  
  // Documentation usage
  DOCS_PAGE_VIEW = 'docs_page_view',
  DOCS_SEARCH = 'docs_search',
  DOCS_DOWNLOAD = 'docs_download',
  DOCS_EXTERNAL_LINK = 'docs_external_link',
  
  // Support interactions
  SUPPORT_TICKET_CREATED = 'support_ticket_created',
  SUPPORT_CHAT_STARTED = 'support_chat_started',
  SUPPORT_FAQ_VIEWED = 'support_faq_viewed',
  SUPPORT_ESCALATION = 'support_escalation',
  
  // User journey events
  HELP_FLOW_STARTED = 'help_flow_started',
  HELP_FLOW_COMPLETED = 'help_flow_completed',
  HELP_FLOW_ABANDONED = 'help_flow_abandoned',
  ONBOARDING_STEP_VIEWED = 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED = 'onboarding_step_completed',
  
  // Feedback events
  FEEDBACK_SUBMITTED = 'feedback_submitted',
  USER_SATISFACTION_SURVEY = 'user_satisfaction_survey',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  
  // Content events
  VIDEO_TUTORIAL_STARTED = 'video_tutorial_started',
  VIDEO_TUTORIAL_COMPLETED = 'video_tutorial_completed',
  INTERACTIVE_GUIDE_STARTED = 'interactive_guide_started',
  INTERACTIVE_GUIDE_COMPLETED = 'interactive_guide_completed'
}

// Help analytics event interfaces
}
}
export interface HelpEvent extends AnalyticsEvent {
  type: HelpEventType;
  helpSessionId: string;
  userTier?: 'free' | 'pro' | 'enterprise';
  userExperience?: 'beginner' | 'intermediate' | 'advanced';
}

}
}
export interface HelpSearchEvent extends HelpEvent {
  type: HelpEventType.HELP_SEARCH | HelpEventType.DOCS_SEARCH;
  metadata: {
    query: string;
    resultsCount: number;
    selectedResultIndex?: number;
    searchDuration?: number;
    filters?: string[];
    category?: string;
    suggestionsShown?: string[];
    noResultsFound?: boolean;
    correctedQuery?: string;
  };
}

}
}
export interface HelpContentEvent extends HelpEvent {
  type: HelpEventType.HELP_ARTICLE_VIEW | 
        HelpEventType.DOCS_PAGE_VIEW | 
        HelpEventType.VIDEO_TUTORIAL_STARTED |
        HelpEventType.INTERACTIVE_GUIDE_STARTED;
  metadata: {
    contentId: string;
    contentTitle: string;
    contentType: 'article' | 'video' | 'tutorial' | 'faq' | 'guide' | 'reference';
    contentCategory: string;
    contentLength?: number;
    viewDuration?: number;
    scrollDepth?: number;
    exitPoint?: string;
    referrer?: 'search' | 'navigation' | 'related' | 'direct' | 'external';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  };
}

}
}
export interface HelpFeedbackEvent extends HelpEvent {
  type: HelpEventType.HELP_ARTICLE_HELPFUL | 
        HelpEventType.HELP_ARTICLE_NOT_HELPFUL |
        HelpEventType.FEEDBACK_SUBMITTED |
        HelpEventType.USER_SATISFACTION_SURVEY;
  metadata: {
    contentId?: string;
    rating?: number;
    feedbackText?: string;
    feedbackCategory?: 'unclear' | 'outdated' | 'missing_info' | 'error' | 'suggestion';
    satisfactionScore?: number;
    npsScore?: number;
    recommendationLikelihood?: number;
    improvementSuggestions?: string[];
  };
}

}
}
export interface HelpJourneyEvent extends HelpEvent {
  type: HelpEventType.HELP_FLOW_STARTED | 
        HelpEventType.HELP_FLOW_COMPLETED |
        HelpEventType.HELP_FLOW_ABANDONED |
        HelpEventType.ONBOARDING_STEP_VIEWED |
        HelpEventType.ONBOARDING_STEP_COMPLETED;
  metadata: {
    flowId: string;
    flowName: string;
    stepId?: string;
    stepName?: string;
    stepIndex?: number;
    totalSteps?: number;
    timeToComplete?: number;
    exitReason?: 'completed' | 'abandoned' | 'error' | 'timeout';
    completionRate?: number;
    previousStep?: string;
    nextStep?: string;
  };
}

}
}
export interface SupportInteractionEvent extends HelpEvent {
  type: HelpEventType.SUPPORT_TICKET_CREATED |
        HelpEventType.SUPPORT_CHAT_STARTED |
        HelpEventType.SUPPORT_FAQ_VIEWED |
        HelpEventType.SUPPORT_ESCALATION;
  metadata: {
    ticketId?: string;
    chatSessionId?: string;
    faqId?: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    issue: string;
    previousHelpAttempts?: number;
    escalationReason?: string;
    estimatedResolutionTime?: number;
    supportAgent?: string;
  };
}

// Help analytics aggregation interfaces
}
}
export interface HelpAnalyticsSummary {
  timeRange: {
    startTime: number;
    endTime: number;
}
}
  };
  overallMetrics: {
    totalHelpSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    selfServiceSuccessRate: number;
    supportTicketRate: number;
    userSatisfactionAvg: number;
  };
  contentMetrics: {
    mostViewedContent: ContentMetric[];
    leastHelpfulContent: ContentMetric[];
    mostSearchedTerms: SearchTermMetric[];
    contentGaps: string[];
  };
  userJourneyMetrics: {
    onboardingCompletionRate: number;
    averageTimeToValue: number;
    dropoffPoints: DropoffPoint[];
    commonUserPaths: UserPath[];
  };
  supportMetrics: {
    ticketVolume: number;
    avgResolutionTime: number;
    escalationRate: number;
    firstContactResolution: number;
  };
}

}
}
export interface ContentMetric {
  contentId: string;
  title: string;
  category: string;
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  helpfulnessRatio: number;
  averageViewDuration: number;
  exitRate: number;
}
}
}

}
}
export interface SearchTermMetric {
  query: string;
  searchCount: number;
  avgResultsCount: number;
  clickThroughRate: number;
  noResultsRate: number;
  refinementRate: number;
}
}
}

}
}
export interface DropoffPoint {
  stepName: string;
  flowName: string;
  dropoffRate: number;
  usersDropped: number;
  avgTimeAtStep: number;
}
}
}

}
}
export interface UserPath {
  path: string[];
  userCount: number;
  completionRate: number;
  avgDuration: number;
  conversionRate: number;
}
}
}

// Help analytics configuration
}
}
export interface HelpAnalyticsConfig {
  trackDetailedInteractions: boolean;
  enablePersonalization: boolean;
  anonymizeUserData: boolean;
  retentionPeriodDays: number;
  sampleRate: number;
  enableRealTimeAlerts: boolean;
  contentAnalysisEnabled: boolean;
  userJourneyTrackingEnabled: boolean;
}
}
}

/**
 * Comprehensive help analytics system
 */
export class HelpAnalytics extends EventEmitter {
  private analyticsCollector: AnalyticsCollector;
  private config: HelpAnalyticsConfig;
  private helpSessions = new Map<string, HelpSession>();
  private contentMetrics = new Map<string, ContentPerformance>();
  private searchMetrics = new Map<string, SearchPerformance>();

  constructor(
    analyticsCollector: AnalyticsCollector,
    config: Partial<HelpAnalyticsConfig> = {}
  ) {
    super();
    
    this.analyticsCollector = analyticsCollector;
    this.config = {
      trackDetailedInteractions: true,
      enablePersonalization: true,
      anonymizeUserData: false,
      retentionPeriodDays: 90,
      sampleRate: 1.0,
      enableRealTimeAlerts: true,
      contentAnalysisEnabled: true,
      userJourneyTrackingEnabled: true,
      ...config
    };

    // Set up periodic analysis
    this.startPeriodicAnalysis();
  }

  /**
   * Start a help session
   */
  startHelpSession(
    userId?: string,
    userTier?: 'free' | 'pro' | 'enterprise',
    userExperience?: 'beginner' | 'intermediate' | 'advanced',
    context?: Record<string, any>
  ): string {
    const helpSessionId = uuidv4();
    const session: HelpSession = {
      id: helpSessionId,
      userId,
      userTier,
      userExperience,
      startTime: Date.now(),
      events: [],
      context: context || {}
    };

    this.helpSessions.set(helpSessionId, session);

    // Track session start
    const event: HelpJourneyEvent = {
      id: uuidv4(),
      type: HelpEventType.HELP_FLOW_STARTED,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId,
      helpSessionId,
      userTier,
      userExperience,
      metadata: {
        flowId: 'help_session',
        flowName: 'Help Session',
        ...context
      }
    };

    this.recordHelpEvent(event);
    return helpSessionId;
  }

  /**
   * Track help search
   */
  trackHelpSearch(
    helpSessionId: string,
    query: string,
    resultsCount: number,
    options: {
      selectedResultIndex?: number;
      filters?: string[];
      category?: string;
      suggestions?: string[];
      correctedQuery?: string;
    } = {}
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    const event: HelpSearchEvent = {
      id: uuidv4(),
      type: HelpEventType.HELP_SEARCH,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        query: this.config.anonymizeUserData ? this.hashQuery(query) : query,
        resultsCount,
        selectedResultIndex: options.selectedResultIndex,
        filters: options.filters,
        category: options.category,
        suggestionsShown: options.suggestions,
        correctedQuery: options.correctedQuery,
        noResultsFound: resultsCount === 0
      }
    };

    this.recordHelpEvent(event);
    this.updateSearchMetrics(query, resultsCount, options.selectedResultIndex !== undefined);
  }

  /**
   * Track content viewing
   */
  trackContentView(
    helpSessionId: string,
    contentId: string,
    contentTitle: string,
    contentType: 'article' | 'video' | 'tutorial' | 'faq' | 'guide' | 'reference',
    options: {
      category?: string;
      viewDuration?: number;
      scrollDepth?: number;
      referrer?: 'search' | 'navigation' | 'related' | 'direct' | 'external';
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      tags?: string[];
    } = {}
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    const event: HelpContentEvent = {
      id: uuidv4(),
      type: HelpEventType.HELP_ARTICLE_VIEW,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        contentId,
        contentTitle,
        contentType,
        contentCategory: options.category || 'general',
        viewDuration: options.viewDuration,
        scrollDepth: options.scrollDepth,
        referrer: options.referrer,
        difficulty: options.difficulty,
        tags: options.tags
      }
    };

    this.recordHelpEvent(event);
    this.updateContentMetrics(contentId, 'view', options.viewDuration);
  }

  /**
   * Track content feedback
   */
  trackContentFeedback(
    helpSessionId: string,
    contentId: string,
    isHelpful: boolean,
    options: {
      feedbackText?: string;
      feedbackCategory?: 'unclear' | 'outdated' | 'missing_info' | 'error' | 'suggestion';
      rating?: number;
    } = {}
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    const event: HelpFeedbackEvent = {
      id: uuidv4(),
      type: isHelpful ? HelpEventType.HELP_ARTICLE_HELPFUL : HelpEventType.HELP_ARTICLE_NOT_HELPFUL,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        contentId,
        rating: options.rating,
        feedbackText: options.feedbackText,
        feedbackCategory: options.feedbackCategory
      }
    };

    this.recordHelpEvent(event);
    this.updateContentMetrics(contentId, isHelpful ? 'helpful' : 'unhelpful');
  }

  /**
   * Track support interaction
   */
  trackSupportInteraction(
    helpSessionId: string,
    interactionType: 'ticket' | 'chat' | 'faq' | 'escalation',
    options: {
      ticketId?: string;
      category?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      issue?: string;
      previousHelpAttempts?: number;
    } = {}
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    let eventType: HelpEventType;
    switch (interactionType) {
    case 'ticket':
      eventType = HelpEventType.SUPPORT_TICKET_CREATED;
      break;
    case 'chat':
      eventType = HelpEventType.SUPPORT_CHAT_STARTED;
      break;
    case 'faq':
      eventType = HelpEventType.SUPPORT_FAQ_VIEWED;
      break;
    case 'escalation':
      eventType = HelpEventType.SUPPORT_ESCALATION;
      break;
    default:
      eventType = HelpEventType.SUPPORT_TICKET_CREATED;
    }

    const event: SupportInteractionEvent = {
      id: uuidv4(),
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        ticketId: options.ticketId,
        category: options.category || 'general',
        priority: options.priority || 'medium',
        issue: options.issue || '',
        previousHelpAttempts: options.previousHelpAttempts || 0
      }
    };

    this.recordHelpEvent(event);
    
    // Alert on escalations or high-priority tickets
    if (interactionType === 'escalation' || options.priority === 'urgent') {
      this.emit('support_alert', {
        type: interactionType,
        priority: options.priority,
        helpSessionId,
        userId: session.userId
      });
    }
  }

  /**
   * Track user satisfaction
   */
  trackUserSatisfaction(
    helpSessionId: string,
    satisfactionScore: number,
    npsScore?: number,
    options: {
      feedbackText?: string;
      improvementSuggestions?: string[];
      recommendationLikelihood?: number;
    } = {}
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    const event: HelpFeedbackEvent = {
      id: uuidv4(),
      type: HelpEventType.USER_SATISFACTION_SURVEY,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        satisfactionScore,
        npsScore,
        feedbackText: options.feedbackText,
        improvementSuggestions: options.improvementSuggestions,
        recommendationLikelihood: options.recommendationLikelihood
      }
    };

    this.recordHelpEvent(event);
  }

  /**
   * End help session
   */
  endHelpSession(
    helpSessionId: string,
    outcome: 'completed' | 'abandoned' | 'escalated' = 'completed'
  ): void {
    const session = this.helpSessions.get(helpSessionId);
    if (!session) return;

    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    session.outcome = outcome;

    const event: HelpJourneyEvent = {
      id: uuidv4(),
      type: outcome === 'completed' ? 
        HelpEventType.HELP_FLOW_COMPLETED : HelpEventType.HELP_FLOW_ABANDONED,
      timestamp: Date.now(),
      sessionId: this.analyticsCollector.getCurrentSummary().sessionId,
      userId: session.userId,
      helpSessionId,
      userTier: session.userTier,
      userExperience: session.userExperience,
      metadata: {
        flowId: 'help_session',
        flowName: 'Help Session',
        timeToComplete: session.duration,
        exitReason: outcome,
        eventsInSession: session.events.length
      }
    };

    this.recordHelpEvent(event);

    // Clean up session after a delay
    setTimeout(() => {
      this.helpSessions.delete(helpSessionId);
    }, 300000); // 5 minutes
  }

  /**
   * Generate help analytics summary
   */
  async generateAnalyticsSummary(
    startTime: number,
    endTime: number
  ): Promise<HelpAnalyticsSummary> {

    const events = this.getHelpEventsInTimeRange(startTime, endTime);
    const sessions = this.getHelpSessionsInTimeRange(startTime, endTime);

    const summary: HelpAnalyticsSummary = {
      timeRange: { startTime, endTime },
      overallMetrics: this.calculateOverallMetrics(sessions, events),
      contentMetrics: this.calculateContentMetrics(events),
      userJourneyMetrics: this.calculateUserJourneyMetrics(sessions, events),
      supportMetrics: this.calculateSupportMetrics(events)
    };

    // Emit summary for real-time dashboards
    this.emit('analytics_summary', summary);

    return summary;
  }

  /**
   * Get content performance data
   */
  getContentPerformance(contentId?: string): ContentPerformance[] {
    if (contentId) {
      const performance = this.contentMetrics.get(contentId);
      return performance ? [performance] : [];
    }
    
    return Array.from(this.contentMetrics.values());
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(): SearchPerformance[] {
    return Array.from(this.searchMetrics.values())
      .sort((a, b) => b.searchCount - a.searchCount);
  }

  /**
   * Identify content gaps
   */
  identifyContentGaps(): ContentGap[] {
    const gaps: ContentGap[] = [];
    const searchQueries = Array.from(this.searchMetrics.values());

    for (const search of searchQueries) {
      if (search.noResultsRate > 0.3 && search.searchCount > 10) {
        gaps.push({
          query: search.query,
          searchVolume: search.searchCount,
          noResultsRate: search.noResultsRate,
          suggestedContentType: this.suggestContentType(search.query),
          priority: this.calculateGapPriority(search)
        });
      }
    }

    return gaps.sort((a, b) => b.priority - a.priority);
  }

  // Private methods

  private recordHelpEvent(event: HelpEvent): void {
    // Add to session
    const session = this.helpSessions.get(event.helpSessionId);
    if (session) {
      session.events.push(event);
    }

    // Record in analytics collector
    this.analyticsCollector.recordEvent({
      ...event,
      type: event.type as any
    });

    // Emit for real-time processing
    this.emit('help_event', event);
  }

  private updateSearchMetrics(query: string, resultsCount: number, hadClickthrough: boolean): void {
    const key = this.config.anonymizeUserData ? this.hashQuery(query) : query.toLowerCase();
    
    if (!this.searchMetrics.has(key)) {
      this.searchMetrics.set(key, {
        query: key,
        searchCount: 0,
        totalResultsCount: 0,
        clickthroughs: 0,
        noResultsSearches: 0
      });
    }

    const metrics = this.searchMetrics.get(key)!;
    metrics.searchCount++;
    metrics.totalResultsCount += resultsCount;
    
    if (hadClickthrough) {
      metrics.clickthroughs++;
    }
    
    if (resultsCount === 0) {
      metrics.noResultsSearches++;
    }

    // Calculate derived metrics
    metrics.avgResultsCount = metrics.totalResultsCount / metrics.searchCount;
    metrics.clickThroughRate = metrics.clickthroughs / metrics.searchCount;
    metrics.noResultsRate = metrics.noResultsSearches / metrics.searchCount;
  }

  private updateContentMetrics(contentId: string, action: 'view' | 'helpful' | 'unhelpful', viewDuration?: number): void {
    if (!this.contentMetrics.has(contentId)) {
      this.contentMetrics.set(contentId, {
        contentId,
        views: 0,
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        totalViewDuration: 0,
        totalExitEarly: 0
      });
    }

    const metrics = this.contentMetrics.get(contentId)!;
    
    switch (action) {
    case 'view':
      metrics.views++;
      if (viewDuration) {
        metrics.totalViewDuration += viewDuration;
        if (viewDuration < 30000) { // Less than 30 seconds considered early exit
          metrics.totalExitEarly++;
        }
      }
      break;
    case 'helpful':
      metrics.helpfulVotes++;
      break;
    case 'unhelpful':
      metrics.unhelpfulVotes++;
      break;
    }

    // Calculate derived metrics
    metrics.helpfulnessRatio = metrics.helpfulVotes / (metrics.helpfulVotes + metrics.unhelpfulVotes) || 0;
    metrics.avgViewDuration = metrics.totalViewDuration / metrics.views || 0;
    metrics.exitRate = metrics.totalExitEarly / metrics.views || 0;
  }

  private calculateOverallMetrics(sessions: HelpSession[], events: HelpEvent[]) {
    const completedSessions = sessions.filter(s => s.outcome === 'completed');
    const supportTickets = events.filter(e => e.type === HelpEventType.SUPPORT_TICKET_CREATED);
    const satisfactionEvents = events.filter(e => e.type === HelpEventType.USER_SATISFACTION_SURVEY) as HelpFeedbackEvent[];

    return {
      totalHelpSessions: sessions.length,
      uniqueUsers: new Set(sessions.map(s => s.userId).filter(Boolean)).size,
      averageSessionDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0,
      selfServiceSuccessRate: completedSessions.length / sessions.length || 0,
      supportTicketRate: supportTickets.length / sessions.length || 0,
      userSatisfactionAvg: satisfactionEvents.reduce((sum, e) => sum + (e.metadata.satisfactionScore || 0), 0) / satisfactionEvents.length || 0
    };
  }

  private calculateContentMetrics(events: HelpEvent[]) {
    const contentViews = events.filter(e => e.type === HelpEventType.HELP_ARTICLE_VIEW) as HelpContentEvent[];
    const contentFeedback = events.filter(e => 
      e.type === HelpEventType.HELP_ARTICLE_HELPFUL || 
      e.type === HelpEventType.HELP_ARTICLE_NOT_HELPFUL
    ) as HelpFeedbackEvent[];

    const contentStats = new Map<string, any>();

    // Process views
    contentViews.forEach(event => {
      const contentId = event.metadata.contentId;
      if (!contentStats.has(contentId)) {
        contentStats.set(contentId, {
          contentId,
          title: event.metadata.contentTitle,
          category: event.metadata.contentCategory,
          views: 0,
          helpfulVotes: 0,
          unhelpfulVotes: 0,
          totalViewDuration: 0
        });
      }
      
      const stats = contentStats.get(contentId);
      stats.views++;
      if (event.metadata.viewDuration) {
        stats.totalViewDuration += event.metadata.viewDuration;
      }
    });

    // Process feedback
    contentFeedback.forEach(event => {
      const contentId = event.metadata.contentId!;
      if (contentStats.has(contentId)) {
        const stats = contentStats.get(contentId);
        if (event.type === HelpEventType.HELP_ARTICLE_HELPFUL) {
          stats.helpfulVotes++;
        } else {
          stats.unhelpfulVotes++;
        }
      }
    });

    const contentMetrics = Array.from(contentStats.values()).map(stats => ({
      ...stats,
      helpfulnessRatio: stats.helpfulVotes / (stats.helpfulVotes + stats.unhelpfulVotes) || 0,
      averageViewDuration: stats.totalViewDuration / stats.views || 0,
      exitRate: 0 // Would need more detailed tracking
    }));

    return {
      mostViewedContent: contentMetrics.sort((a, b) => b.views - a.views).slice(0, 10),
      leastHelpfulContent: contentMetrics.filter(c => c.helpfulnessRatio < 0.5).slice(0, 5),
      mostSearchedTerms: this.getSearchAnalytics().slice(0, 10),
      contentGaps: this.identifyContentGaps().map(gap => gap.query).slice(0, 5)
    };
  }

  private calculateUserJourneyMetrics(sessions: HelpSession[], events: HelpEvent[]) {
    const onboardingEvents = events.filter(e => 
      e.type === HelpEventType.ONBOARDING_STEP_VIEWED ||
      e.type === HelpEventType.ONBOARDING_STEP_COMPLETED
    ) as HelpJourneyEvent[];

    const completedOnboarding = onboardingEvents.filter(e => e.type === HelpEventType.ONBOARDING_STEP_COMPLETED);
    const totalOnboarding = new Set(onboardingEvents.map(e => e.helpSessionId)).size;

    return {
      onboardingCompletionRate: completedOnboarding.length / totalOnboarding || 0,
      averageTimeToValue: this.calculateAverageTimeToValue(sessions),
      dropoffPoints: this.identifyDropoffPoints(sessions, events),
      commonUserPaths: this.identifyCommonPaths(sessions, events)
    };
  }

  private calculateSupportMetrics(events: HelpEvent[]) {
    const supportTickets = events.filter(e => e.type === HelpEventType.SUPPORT_TICKET_CREATED);
    const escalations = events.filter(e => e.type === HelpEventType.SUPPORT_ESCALATION);

    return {
      ticketVolume: supportTickets.length,
      avgResolutionTime: 0, // Would need resolution tracking
      escalationRate: escalations.length / supportTickets.length || 0,
      firstContactResolution: 0 // Would need resolution tracking
    };
  }

  private getHelpEventsInTimeRange(startTime: number, endTime: number): HelpEvent[] {
    return Array.from(this.helpSessions.values())
      .flatMap(session => session.events)
      .filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
  }

  private getHelpSessionsInTimeRange(startTime: number, endTime: number): HelpSession[] {
    return Array.from(this.helpSessions.values())
      .filter(session => session.startTime >= startTime && session.startTime <= endTime);
  }

  private calculateAverageTimeToValue(sessions: HelpSession[]): number {
    const completedSessions = sessions.filter(s => s.outcome === 'completed' && s.duration);
    return completedSessions.reduce((sum, s) => sum + s.duration!, 0) / completedSessions.length || 0;
  }

  private identifyDropoffPoints(sessions: HelpSession[], events: HelpEvent[]): DropoffPoint[] {
    // Simplified implementation - would need more detailed flow tracking
    return [];
  }

  private identifyCommonPaths(sessions: HelpSession[], events: HelpEvent[]): UserPath[] {
    // Simplified implementation - would need sequence analysis
    return [];
  }

  private hashQuery(query: string): string {
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private suggestContentType(query: string): string {
    if (query.includes('how to') || query.includes('tutorial')) {
      return 'tutorial';
    }
    if (query.includes('what is') || query.includes('definition')) {
      return 'reference';
    }
    if (query.includes('error') || query.includes('problem')) {
      return 'troubleshooting';
    }
    return 'article';
  }

  private calculateGapPriority(search: SearchPerformance): number {
    return search.searchCount * search.noResultsRate;
  }

  private startPeriodicAnalysis(): void {
    // Run analysis every hour
    setInterval(() => {
      this.runPeriodicAnalysis();
    }, 3600000);
  }

  private async runPeriodicAnalysis(): void {
    const oneHourAgo = Date.now() - 3600000;
    const now = Date.now();
    
    try {
      const summary = await this.generateAnalyticsSummary(oneHourAgo, now);
      
      // Check for alerts
      if (summary.overallMetrics.userSatisfactionAvg < 3.0) {
        this.emit('satisfaction_alert', {
          level: 'warning',
          score: summary.overallMetrics.userSatisfactionAvg,
          period: 'last_hour'
        });
      }
      
      if (summary.overallMetrics.supportTicketRate > 0.3) {
        this.emit('support_volume_alert', {
          level: 'warning',
          rate: summary.overallMetrics.supportTicketRate,
          period: 'last_hour'
        });
      }
    } catch (error) {
      console.error('Error in periodic help analytics analysis:', error);
    }
  }
}

// Supporting interfaces
}
}
interface HelpSession {
  id: string;
  userId?: string;
  userTier?: 'free' | 'pro' | 'enterprise';
  userExperience?: 'beginner' | 'intermediate' | 'advanced';
  startTime: number;
  endTime?: number;
  duration?: number;
  outcome?: 'completed' | 'abandoned' | 'escalated';
  events: HelpEvent[];
  context: Record<string, any>;
}
}
}

}
}
interface ContentPerformance {
  contentId: string;
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  helpfulnessRatio?: number;
  totalViewDuration: number;
  avgViewDuration?: number;
  totalExitEarly: number;
  exitRate?: number;
}
}
}

}
}
interface SearchPerformance {
  query: string;
  searchCount: number;
  totalResultsCount: number;
  avgResultsCount?: number;
  clickthroughs: number;
  clickThroughRate?: number;
  noResultsSearches: number;
  noResultsRate?: number;
}
}
}

}
}
interface ContentGap {
  query: string;
  searchVolume: number;
  noResultsRate: number;
  suggestedContentType: string;
  priority: number;
}
}
}

export default HelpAnalytics;