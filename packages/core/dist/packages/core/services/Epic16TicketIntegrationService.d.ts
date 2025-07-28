export interface MarketplaceTicket {
    id: string;
    type: MarketplaceTicketType;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    templateId?: string;
    sellerId?: string;
    buyerId?: string;
    transactionId?: string;
    communityUserId?: string;
    threadId?: string;
    topicCategory?: string;
    assignedTo?: string;
    assignedTeam?: string;
    labels: string;
    tags: string;
    metadata: TicketMetadata;
    attachments: TicketAttachment;
    comments: TicketComment;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    sla: SLATracking;
    externalIntegrations: ExternalIntegration;
}
export declare enum MarketplaceTicketType {
    TEMPLATE_SUBMISSION = "template_submission",
    TEMPLATE_ISSUE = "template_issue",
    BILLING_DISPUTE = "billing_dispute",
    REFUND_REQUEST = "refund_request",
    CONTENT_MODERATION = "content_moderation",
    COMMUNITY_SUPPORT = "community_support",
    FEATURE_REQUEST = "feature_request",
    BUG_REPORT = "bug_report",
    ACCOUNT_ISSUE = "account_issue",
    POLICY_VIOLATION = "policy_violation",
    PARTNERSHIP_INQUIRY = "partnership_inquiry",
    TECHNICAL_SUPPORT = "technical_support",
    export,
    enum,
    TicketStatus
}
//# sourceMappingURL=Epic16TicketIntegrationService.d.ts.map