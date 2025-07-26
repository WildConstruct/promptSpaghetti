/**
 * Epic 16 Help Request Service
 *
 * Comprehensive help request system for Epic 16 Marketplace & Community Features.
 * Provides intelligent help routing, knowledge base integration, escalation to human support,
 * and self-service capabilities for users.
 */
import { EventEmitter } from 'events';
export interface HelpRequest {
    id: string;
    type: HelpRequestType;
    category: HelpCategory;
    subcategory: string;
    priority: HelpPriority;
    status: HelpRequestStatus;
    title: string;
    description: string;
    context: RequestContext;
    userId: string;
    userType: 'guest' | 'user' | 'seller' | 'buyer' | 'admin';
    userTier: 'free' | 'premium' | 'enterprise';
    routingDecision: RoutingDecision;
    assignedTo?: string;
    escalationLevel: number;
    suggestedArticles: KnowledgeBaseArticle[];
    autoResolvedBy?: string;
    responses: HelpResponse[];
    satisfactionRating?: number;
    feedback?: string;
    tags: string[];
    attachments: HelpAttachment[];
    relatedRequests: string[];
    createdAt: Date;
    updatedAt: Date;
    firstResponseAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    sla: HelpSLA;
    analytics: HelpAnalytics;
}
export declare enum HelpRequestType {
    QUESTION = "question",
    TECHNICAL_ISSUE = "technical_issue",
    ACCOUNT_ISSUE = "account_issue",
    BILLING_INQUIRY = "billing_inquiry",
    FEATURE_REQUEST = "feature_request",
    BUG_REPORT = "bug_report",
    TEMPLATE_HELP = "template_help",
    MARKETPLACE_INQUIRY = "marketplace_inquiry",
    COMMUNITY_SUPPORT = "community_support",
    PARTNERSHIP_INQUIRY = "partnership_inquiry",
    COMPLIANCE_ISSUE = "compliance_issue",
    ONBOARDING_HELP = "onboarding_help"
}
export declare enum HelpCategory {
    GETTING_STARTED = "getting_started",
    TEMPLATES = "templates",
    MARKETPLACE = "marketplace",
    BILLING = "billing",
    ACCOUNT = "account",
    TECHNICAL = "technical",
    COMMUNITY = "community",
    PARTNERSHIPS = "partnerships",
    COMPLIANCE = "compliance",
    GENERAL = "general"
}
export declare enum HelpPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum HelpRequestStatus {
    SUBMITTED = "submitted",
    TRIAGED = "triaged",
    AUTO_SUGGESTED = "auto_suggested",
    IN_PROGRESS = "in_progress",
    PENDING_USER = "pending_user",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed",
    REOPENED = "reopened"
}
export interface RequestContext {
    userAgent: string;
    ipAddress: string;
    location: {
        country: string;
        region: string;
        timezone: string;
    };
    sessionId: string;
    pageUrl: string;
    referrer: string;
    userJourney: string[];
    feature: string;
    section: string;
    templateId?: string;
    marketplaceListingId?: string;
    browserInfo: {
        name: string;
        version: string;
        platform: string;
    };
    screenResolution: string;
    errorLogs?: string[];
    subscriptionPlan: string;
    accountAge: number;
    previousTickets: number;
    successfulTransactions: number;
}
export interface RoutingDecision {
    strategy: 'auto_resolve' | 'knowledge_base' | 'community' | 'support_agent' | 'specialist';
    confidence: number;
    reasoning: string;
    estimatedResolutionTime: number;
    recommendedAgent?: string;
    fallbackStrategy?: string;
}
export interface HelpResponse {
    id: string;
    type: 'auto' | 'agent' | 'system' | 'knowledge_base';
    content: string;
    author: string;
    visibility: 'public' | 'internal';
    helpful: boolean | null;
    attachments: string[];
    timestamp: Date;
}
export interface HelpAttachment {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    processed: boolean;
    metadata: {
        isScreenshot: boolean;
        containsPersonalInfo: boolean;
        category: string;
    };
}
export interface HelpSLA {
    responseTime: {
        target: number;
        actual?: number;
        deadline: Date;
        breached: boolean;
    };
    resolutionTime: {
        target: number;
        actual?: number;
        deadline: Date;
        breached: boolean;
    };
    escalationThreshold: number;
}
export interface HelpAnalytics {
    viewCount: number;
    interactionCount: number;
    timeToFirstResponse?: number;
    totalResolutionTime?: number;
    userSatisfactionScore?: number;
    agentEfficiencyScore?: number;
    deflectionScore?: number;
    resolutionSource: 'self_service' | 'knowledge_base' | 'community' | 'agent' | 'escalation';
}
export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: HelpCategory;
    tags: string[];
    relevanceScore: number;
    helpfulnessRating: number;
    viewCount: number;
    lastUpdated: Date;
    url: string;
}
export interface KnowledgeBaseSearch {
    query: string;
    categories?: HelpCategory[];
    filters?: {
        minRating?: number;
        language?: string;
        userType?: string;
    };
    limit?: number;
}
export interface RoutingRule {
    id: string;
    name: string;
    description: string;
    conditions: RoutingCondition[];
    action: RoutingAction;
    priority: number;
    active: boolean;
}
export interface RoutingCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    weight: number;
}
export interface RoutingAction {
    type: 'assign_to_queue' | 'assign_to_agent' | 'escalate' | 'auto_resolve' | 'suggest_articles';
    target: string;
    parameters: Record<string, any>;
}
export interface HelpRequestConfig {
    autoResolution: {
        enabled: boolean;
        confidenceThreshold: number;
        maxAttempts: number;
    };
    knowledgeBase: {
        enabled: boolean;
        searchEndpoint: string;
        minRelevanceScore: number;
        maxSuggestions: number;
    };
    routing: {
        enableSmartRouting: boolean;
        defaultQueue: string;
        escalationRules: EscalationRule[];
    };
    sla: {
        responseTargets: Record<HelpPriority, number>;
        resolutionTargets: Record<HelpPriority, number>;
        businessHoursOnly: boolean;
    };
    analytics: {
        trackUserJourney: boolean;
        enableSentimentAnalysis: boolean;
        collectFeedback: boolean;
    };
    integrations: {
        ticketSystem: boolean;
        communityForum: boolean;
        chatbot: boolean;
        emailSupport: boolean;
    };
}
export interface EscalationRule {
    trigger: 'time_based' | 'priority_based' | 'satisfaction_based' | 'complexity_based';
    condition: string;
    escalateTo: string;
    delayMinutes: number;
}
/**
 * Epic 16 Help Request Service
 *
 * Intelligent help request management system with AI-powered routing,
 * knowledge base integration, and comprehensive analytics.
 */
export declare class Epic16HelpRequestService extends EventEmitter {
    private requests;
    private knowledgeBase;
    private routingRules;
    private config;
    private analytics;
    constructor(config?: Partial<HelpRequestConfig>);
    /**
     * Submit a new help request
     */
    submitHelpRequest(
      requestData: Omit<HelpRequest,
      'id' | 'createdAt' | 'updatedAt' | 'sla' | 'analytics' | 'responses' | 'suggestedArticles' | 'routingDecision'>
    ): Promise<HelpRequest>;
    /**
     * Process help request through intelligent pipeline
     */
    private processHelpRequest;
    /**
     * Search knowledge base and suggest relevant articles
     */
    private suggestKnowledgeBaseArticles;
    /**
     * Make intelligent routing decision
     */
    private makeRoutingDecision;
    /**
     * Attempt auto-resolution using knowledge base
     */
    private attemptAutoResolution;
    /**
     * Route request based on routing decision
     */
    private routeRequest;
    /**
     * Search knowledge base
     */
    searchKnowledgeBase(search: KnowledgeBaseSearch): Promise<KnowledgeBaseArticle[]>;
    /**
     * Add response to help request
     */
    addResponse(requestId: string, responseData: Omit<HelpResponse, 'id' | 'timestamp'>): Promise<HelpResponse | null>;
    /**
     * Update help request status
     */
    updateStatus(requestId: string, newStatus: HelpRequestStatus, updatedBy: string): Promise<HelpRequest | null>;
    /**
     * Escalate help request
     */
    escalateRequest(requestId: string, reason: string, escalatedBy: string): Promise<HelpRequest | null>;
    /**
     * Get help requests with filtering
     */
    getHelpRequests(filters?: {
        status?: HelpRequestStatus[];
        category?: HelpCategory[];
        priority?: HelpPriority[];
        assignedTo?: string;
        userId?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        requests: HelpRequest[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get help request analytics
     */
    getAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalRequests: number;
        requestsByStatus: Record<HelpRequestStatus, number>;
        requestsByCategory: Record<HelpCategory, number>;
        averageResponseTime: number;
        averageResolutionTime: number;
        slaBreachRate: number;
        autoResolutionRate: number;
        customerSatisfaction: number;
        deflectionRate: number;
    }>;
    private generateRequestId;
    private generateResponseId;
    private calculateSLA;
    private initializeKnowledgeBase;
    private initializeRoutingRules;
    private evaluateRoutingRule;
    private evaluateCondition;
    private getFieldValue;
    private enhanceRoutingDecision;
    private generateAutoSuggestionMessage;
    private assignToAvailableAgent;
    private assignToSpecialist;
    private routeToCommunity;
    private increasePriority;
}
export default Epic16HelpRequestService;
//# sourceMappingURL=Epic16HelpRequestService.d.ts.map