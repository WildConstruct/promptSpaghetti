/**
 * Content Scheduling Service - Epic 17
 *
 * Comprehensive content scheduling system for managing content publication,
 * promotion, archival, and lifecycle management with advanced scheduling features.
 *
 * Task: E17-1753114396947-96EB34 - Design content scheduling
 * Epic: 17 - Backstage Admin Controls
 */

export interface ContentItem {
    id: string;
    title: string;
    type: ContentType;
    status: ContentStatus;
    content: ContentData;
    metadata: ContentMetadata;
    scheduling: ContentScheduling;
    performance: ContentPerformance;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy?: string;

export interface ContentData {
    body?: string;
    description?: string;
    excerpt?: string;
    images?: MediaAsset[];
    videos?: MediaAsset[];
    documents?: MediaAsset[];
    fields?: Record<string, any>;
    customData?: Record<string, any>;

export interface MediaAsset {
    id: string;
    filename: string;
    url: string;
    type: 'image' | 'video' | 'document' | 'audio';
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    alt?: string;
    caption?: string;

export interface ContentMetadata {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    categories?: string[];
    tags?: string[];
    collections?: string[];
    language: string;
    localizations?: Record<string, string>;
    relatedContent?: string[];
    parentContent?: string;
    childContent?: string[];
    workflow?: {
        stage: 'draft' | 'review' | 'approved' | 'rejected' | 'final';
        assignee?: string;
        reviewer?: string;
        approver?: string;
        deadline?: Date;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        notes?: WorkflowNote[];
    };

export interface WorkflowNote {
    id: string;
    author: string;
    message: string;
    type: 'comment' | 'review' | 'approval' | 'rejection';
    timestamp: Date;

export interface ContentScheduling {
    publishAt?: Date;
    unpublishAt?: Date;
    timezone: string;
    recurrence?: RecurrencePattern;
    promotions?: PromotionSchedule[];
    archiveAt?: Date;
    deleteAt?: Date;
    conditions?: ScheduleCondition[];
    prerequisites?: string[];
    blocks?: string[];

export interface RecurrencePattern {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    monthsOfYear?: number[];
    endDate?: Date;
    occurrences?: number;
    customPattern?: string;

export interface PromotionSchedule {
    id: string;
    type: 'homepage' | 'category' | 'search' | 'social' | 'email';
    location: string;
    startDate: Date;
    endDate: Date;
    priority: number;
    targeting?: {
        audience?: string[];
        demographics?: Record<string, any>;
        behavioral?: Record<string, any>;
        geographic?: string[];
    };

export interface ScheduleCondition {
    type: 'content_published' | 'date_range' | 'performance_threshold' | 'approval_received' | 'custom';
    parameters: Record<string, any>;
    description: string;

export interface ContentPerformance {
    views: number;
    engagement: number;
    shares: number;
    likes: number;
    comments: number;
    conversionRate?: number;
    revenue?: number;
    metrics?: Array<{
        timestamp: Date;
        views: number;
        engagement: number;
        shares: number;
    }>;
    variants?: Array<{
        id: string;
        name: string;
        traffic: number;
        performance: ContentPerformance;
    }>;

export type ContentType = 'article' | 'blog_post' | 'page' | 'product' | 'event' | 'announcement' | 'promotion' | 'newsletter' | 'social_post' | 'video' | 'podcast' | 'gallery' | 'document';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'unpublished' | 'archived' | 'deleted' | 'error';

export interface ContentFilter {
    types?: ContentType[];
    statuses?: ContentStatus[];
    categories?: string[];
    tags?: string[];
    collections?: string[];
    authors?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    searchQuery?: string;
    hasSchedule?: boolean;
    scheduledBetween?: {
        start: Date;
        end: Date;
    };
    language?: string;
    workflowStage?: string[];

export interface ScheduleBatch {
    id: string;
    name: string;
    description?: string;
    contentIds: string[];
    operation: BatchOperation;
    schedule: BatchSchedule;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: {,
        total: number;
        completed: number;
        failed: number;
        errors: BatchError[];
    };
    createdAt: Date;
    createdBy: string;
    executedAt?: Date;
    completedAt?: Date;

export interface BatchOperation {
    type: 'publish' | 'unpublish' | 'schedule' | 'promote' | 'archive' | 'delete' | 'update_metadata';
    parameters?: Record<string, any>;

export interface BatchSchedule {
    executeAt?: Date;
    timezone: string;
    staggering?: {
        enabled: boolean;
        interval: number;
        randomization?: boolean;
    };

export interface BatchError {
    contentId: string;
    error: string;
    timestamp: Date;

export interface SchedulingStats {
    totalContent: number;
    scheduledContent: number;
    publishedToday: number;
    unpublishedToday: number;
    upcomingSchedules: Array<{,
        date: Date;
        count: number;
        items: Array<{,
            id: string;
            title: string;
            type: ContentType;
            operation: string;
        }>;
    }>;
    performanceMetrics: {,
        averageViewsPerPost: number;
        topPerformingContent: Array<{,
            id: string;
            title: string;
            views: number;
            engagement: number;
        }>;
        contentTypePerformance: Record<ContentType, {
            count: number;
            averageViews: number;
            averageEngagement: number;
        }>;
    };
/**
 * Content Scheduling Service
 */
export declare class ContentSchedulingService {
    private static instance;
    private content;
    private batches;
    private listeners;
    private scheduler;
    private constructor();
    static getInstance(): ContentSchedulingService;
    /**
     * Content Management
     */
    createContent(contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'performance'>, createdBy: string): Promise<ContentItem>;
    updateContent(contentId: string, updates: Partial<ContentItem>, updatedBy: string): Promise<ContentItem | null>;
    deleteContent(contentId: string, deletedBy: string): Promise<boolean>;
    /**
     * Scheduling Operations
     */
    scheduleContent(contentId: string, scheduling: ContentScheduling, scheduledBy: string): Promise<boolean>;
    publishContent(contentId: string, publishedBy: string): Promise<boolean>;
    unpublishContent(contentId: string, unpublishedBy: string): Promise<boolean>;
    /**
     * Batch Operations
     */
    createBatch(name: string, contentIds: string[], operation: BatchOperation, schedule: BatchSchedule, createdBy: string): Promise<ScheduleBatch>;
    executeBatch(batchId: string): Promise<boolean>;
    /**
     * Data Retrieval
     */
    getContent(filter?: ContentFilter): ContentItem[];
    getSchedulingStats(): SchedulingStats;
    getBatches(status?: ScheduleBatch['status']): ScheduleBatch[];
    /**
     * Event Handling
     */
    subscribe(listenerId: string, callback: (event: SchedulingEvent) => void): void;
    unsubscribe(listenerId: string): void;
    private startScheduler;
    private processScheduledItems;
    private checkScheduleConditions;
    private executeBatchOperation;
    private scheduleBatchExecution;
    private notifyListeners;
    private generateContentId;
    private generateBatchId;
    private sleep;

export interface SchedulingEvent {
    type: string;
    data: any;
    timestamp: Date;

export declare const contentSchedulingService: ContentSchedulingService;
export declare const createContent: (contentData: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "performance">, createdBy: string) => Promise<ContentItem>;
export declare const scheduleContent: (contentId: string, scheduling: ContentScheduling, scheduledBy: string) => Promise<boolean>;
export declare const publishContent: (contentId: string, publishedBy: string) => Promise<boolean>;
export declare const getContent: (filter?: ContentFilter) => ContentItem[];
export declare const getSchedulingStats: () => SchedulingStats;
//# sourceMappingURL=ContentSchedulingService.d.ts.map