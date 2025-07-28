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
    suggestedArticles: KnowledgeBaseArticle;
    autoResolvedBy?: string;
    responses: HelpResponse;
    satisfactionRating?: number;
    feedback?: string;
    tags: string;
    attachments: HelpAttachment;
    relatedRequests: string;
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
    ONBOARDING_HELP = "onboarding_help",
    export,
    enum,
    HelpCategory
}
//# sourceMappingURL=Epic16HelpRequestService.d.ts.map