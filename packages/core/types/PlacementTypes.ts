/**
 * Placement Management Types - Epic 17.5.2
 * 
 * Type definitions for marketplace content placement and featured content management.
 * Enables admin control over content positioning, scheduling, and performance tracking.
 * 
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */

export interface PlacementSlot {
  slotId: string;,
  name: string;
  displayName: string;,
  description: string;
  // Placement Configuration
  placementArea: PlacementArea;,
  position: PlacementPosition;
  maxItems: number;,
  minItems: number;
  // Visual Configuration
  dimensions: PlacementDimensions;,
  styling: PlacementStyling;
  layout: PlacementLayout;
  // Targeting and Rules
  targetingRules: PlacementTargetingRules;,
  displayRules: PlacementDisplayRules;
  // Status and Management
  isActive: boolean;,
  priority: number;
  tags: string;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  // Performance Data
  performanceMetrics?: PlacementSlotMetrics;
}
export enum PlacementArea {
  HOMEPAGE = 'homepage',
  CATEGORY_PAGE = 'category_page',
  SEARCH_RESULTS = 'search_results',
  TEMPLATE_DETAIL = 'template_detail',
  USER_DASHBOARD = 'user_dashboard',
  CHECKOUT = 'checkout',
  SIDEBAR = 'sidebar',
  HEADER = 'header',
  FOOTER = 'footer',
  MODAL = 'modal'
  export enum PlacementPosition {
  HERO_BANNER = 'hero_banner',
  TOP_CAROUSEL = 'top_carousel',
  SIDEBAR_TOP = 'sidebar_top',
  SIDEBAR_MIDDLE = 'sidebar_middle',
  SIDEBAR_BOTTOM = 'sidebar_bottom',
  CONTENT_TOP = 'content_top',
  CONTENT_MIDDLE = 'content_middle',
  CONTENT_BOTTOM = 'content_bottom',
  FLOATING = 'floating',
  INLINE = 'inline',
  OVERLAY = 'overlay'
  export interface PlacementDimensions {
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g., "16:9", "4:3", "1:1",
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  responsive: boolean;
  breakpoints?: {,
  mobile: Partial<PlacementDimensions>;,
  tablet: Partial<PlacementDimensions>;
  desktop: Partial<PlacementDimensions>;
};
}
export interface PlacementStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  shadow?: boolean;
  border?: {,
  width: number;,
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
};
  animation?: PlacementAnimation;
  customCss?: string;
}
export interface PlacementAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';,
  duration: number;
  delay?: number;
  easing?: string;
}
export interface PlacementLayout {
  type: 'grid' | 'carousel' | 'stack' | 'masonry' | 'list';
  columns?: number;
  rows?: number;
  gap?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  itemsPerPage?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  autoRotate?: {,
  enabled: boolean;,
  interval: number; // seconds,
  pauseOnHover: boolean;
};
}
export interface PlacementTargetingRules {
  userSegments?: string;
  geographicTargeting?: {,
  countries?: string;
  regions?: string;
  cities?: string;
  excludeCountries?: string;
};
  deviceTargeting?: {
  deviceTypes?: ('desktop' | 'mobile' | 'tablet')[];
  browsers?: string;
  operatingSystems?: string;
};
  behaviorTargeting?: {
  previousPurchases?: boolean;
  activityLevel?: 'low' | 'medium' | 'high';
  interests?: string;
  searchHistory?: string;
};
  timeTargeting?: {
  timeZones?: string;
  hoursOfDay?: number;
  daysOfWeek?: number;
  dateRange?: {,
  start: Date;,
  end: Date;
};
  };
}
export interface PlacementDisplayRules {
  frequencyCapping?: {,
  maxImpressions: number;,
  timeWindow: number; // hours,
  perUser: boolean;
};
  exclusionRules?: {
  excludeIfPurchased?: boolean;
  excludeIfViewed?: boolean;
  excludeCompetitors?: boolean;
  mutuallyExclusive?: string; // other placement slot IDs,
};
  loadingBehavior?: {
  lazy: boolean;,
  priority: 'high' | 'medium' | 'low';
  fallback?: string; // fallback content,
};
}
export interface ContentPlacement {
  placementId: string;,
  slotId: string;
  contentId: string;,
  contentType: ContentType;
  // Placement Configuration
  priority: number;
  weight?: number;
  // Scheduling
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  // Targeting Overrides
  targetingOverrides?: Partial<PlacementTargetingRules>;
  // Placement-Specific Styling
  customStyling?: Partial<PlacementStyling>;
  customData?: Record<string, any>;
  // Status and Management
  status: PlacementStatus;
  approvalStatus?: PlacementApprovalStatus;
  // A/B Testing
  experimentId?: string;
  variantId?: string;
  // Performance Tracking
  performanceMetrics?: ContentPlacementMetrics;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  notes?: string;
  tags?: string;
}
export enum ContentType {
  TEMPLATE = 'template',
  COLLECTION = 'collection',
  CATEGORY = 'category',
  PROMOTION = 'promotion',
  BANNER = 'banner',
  ANNOUNCEMENT = 'announcement',
  CUSTOM = 'custom'
  export enum PlacementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
  export enum PlacementApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
  export interface PlacementSchedule {
  scheduleId: string;,
  placementId: string;
  // Schedule Configuration
  type: ScheduleType;,
  pattern: SchedulePattern;
  // Timing
  startDate: Date;
  endDate?: Date;
  timezone: string;
  // Recurrence
  recurrenceRules?: RecurrenceRules;
  // Status
  isActive: boolean;
  nextExecution?: Date;
  lastExecution?: Date;
  executionCount: number;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  createdBy: string;
}
export enum ScheduleType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  CONDITIONAL = 'conditional',
  EVENT_BASED = 'event_based'
  export interface SchedulePattern {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  specificTimes?: string; // ["09:00", "12:00", "18:00"],
  specificDays?: number; // [1, 3, 5] for Mon, Wed, Fri,
  specificDates?: Date;
}
export interface RecurrenceRules {
  count?: number; // number of occurrences,
  until?: Date; // end date,
  byWeekDay?: number;
  byMonthDay?: number;
  byMonth?: number;
  exceptions?: Date; // exclude these dates,
}
export interface PlacementCampaign {
  campaignId: string;,
  name: string;
  description: string;
  // Campaign Configuration
  objective: CampaignObjective;
  budget?: CampaignBudget;
  // Associated Placements
  placements: string; // placement IDs,
  // Targeting
  globalTargeting?: PlacementTargetingRules;
  // Performance Goals
  kpis: CampaignKPI;
  // Status and Timeline
  status: CampaignStatus;,
  startDate: Date;
  endDate?: Date;
  // Results
  performanceMetrics?: CampaignMetrics;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  createdBy: string;
  tags?: string;
}
export enum CampaignObjective {
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
  CONVERSIONS = 'conversions',
  REVENUE = 'revenue',
  RETENTION = 'retention'
  export interface CampaignBudget {
  totalBudget?: number;
  dailyBudget?: number;
  currency: string;,
  spendingPace: 'even' | 'accelerated';
}
export interface CampaignKPI {
  metric: string;,
  target: number;
  unit: string;,
  priority: 'high' | 'medium' | 'low';
}
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
  export interface PlacementSlotMetrics {
  slotId: string;,
  period: MetricsPeriod;
  // Visibility Metrics
  impressions: number;,
  uniqueViews: number;
  viewDuration: number; // seconds,
  viewabilityRate: number; // percentage,
  // Engagement Metrics
  clicks: number;,
  clickThroughRate: number;
  interactionRate: number;,
  bounceRate: number;
  // Performance Metrics
  conversions: number;,
  conversionRate: number;
  revenue: number;,
  revenuePerView: number;
  // Quality Metrics
  loadTime: number; // milliseconds,
  errorRate: number;
  // Comparative Metrics
  performanceIndex: number; // vs baseline,
  competitiveIndex?: number; // vs other slots,
}
export interface ContentPlacementMetrics {
  placementId: string;,
  period: MetricsPeriod;
  // Content Performance
  impressions: number;,
  clicks: number;
  clickThroughRate: number;,
  engagementScore: number;
  // Business Impact
  conversions: number;,
  conversionValue: number;
  attributedRevenue: number;
  costPerConversion?: number;
  // User Behavior
  averageTimeSpent: number;,
  interactionDepth: number;
  returnVisitorRate: number;
  // A/B Testing Results
  liftOverControl?: number;
  confidenceLevel?: number;
  statisticalSignificance?: boolean;
}
export interface CampaignMetrics {
  campaignId: string;,
  period: MetricsPeriod;
  // Overall Performance
  totalImpressions: number;,
  totalClicks: number;
  totalConversions: number;,
  totalRevenue: number;
  // Efficiency Metrics
  costPerClick?: number;
  costPerConversion?: number;
  returnOnAdSpend?: number;
  // Goal Achievement
  kpiProgress: Array<{,
  kpi: string;,
  current: number;
  target: number;,
  progress: number; // percentage,
}>;
  // Budget Utilization
  budgetSpent?: number;
  budgetRemaining?: number;
  paceToGoal?: number;
}
export interface MetricsPeriod {
  startDate: Date;,
  endDate: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}
export interface PlacementAnalytics {
  period: MetricsPeriod;,
  generatedAt: Date;
  // Overview Metrics
  totalSlots: number;,
  activeSlots: number;
  totalPlacements: number;,
  activePlacements: number;
  // Performance Summary
  overallPerformance: {,
  totalImpressions: number;,
  totalClicks: number;
  averageCTR: number;,
  totalConversions: number;
  totalRevenue: number;
};
  // Top Performers
  topSlots: PlacementSlotMetrics;,
  topPlacements: ContentPlacementMetrics;
  topCampaigns: CampaignMetrics;
  // Insights and Recommendations
  insights: PlacementInsight;,
  recommendations: PlacementRecommendation;
}
export interface PlacementInsight {
  insightId: string;,
  type: 'performance' | 'optimization' | 'trend' | 'anomaly';
  title: string;,
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';,
  confidence: number; // 0-100,
  data: Record<string, any>;
  generatedAt: Date;
}
export interface PlacementRecommendation {
  recommendationId: string;,
  category: 'content' | 'targeting' | 'scheduling' | 'creative' | 'budget';
  priority: 'low' | 'medium' | 'high' | 'critical';,
  title: string;
  description: string;,
  expectedImpact: string;
  actionItems: string;
  estimatedLift?: number; // percentage,
  implementationEffort: 'low' | 'medium' | 'high';,
  generatedAt: Date;
}
export interface PlacementPreview {
  previewId: string;,
  slotId: string;
  placements: ContentPlacement;
  // Preview Configuration
  previewMode: 'live' | 'staged' | 'test';,
  viewerContext: {,
  userSegment?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location?: string;
  timestamp: Date;
};
  // Rendered Output
  renderedContent: RenderedPlacement;
  // Performance Simulation
  estimatedMetrics?: {
  expectedCTR: number;,
  expectedConversions: number;
  expectedRevenue: number;,
  confidence: number;
};
  createdAt: Date;,
  expiresAt: Date;
}
export interface RenderedPlacement {
  placementId: string;,
  slotPosition: number;
  content: {,
  id: string;,
  type: ContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  targetUrl: string;
};
  styling: PlacementStyling;,
  metadata: Record<string, any>;
}
export interface PlacementFilter {
  slotIds?: string;
  contentTypes?: ContentType;
  placementAreas?: PlacementArea;
  status?: PlacementStatus;
  approvalStatus?: PlacementApprovalStatus;
  tags?: string;
  dateRange?: {,
  start: Date;,
  end: Date;
};
  performanceThreshold?: {
  metric: string;,
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
};
  createdBy?: string;
}
export interface PlacementSearchCriteria extends PlacementFilter {
  query?: string;
  sortBy?: 'createdAt' | 'priority' | 'performance' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  export interface BulkPlacementOperation {
  operationId: string;,
  operationType: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'schedule';
  targetPlacements: string;
  operationData?: Record<string, any>;
  // Execution Status
  status: 'pending' | 'running' | 'completed' | 'failed';,
  progress: number; // 0-100,
  // Results
  successCount: number;,
  failureCount: number;
  errors: Array<{,
  placementId: string;,
  error: string;
}>;
  // Metadata
  createdAt: Date;
  completedAt?: Date;
  initiatedBy: string;
}
export interface PlacementTemplate {
  templateId: string;,
  name: string;
  description: string;
  // Template Configuration
  slotConfiguration: Partial<PlacementSlot>;,
  defaultPlacements: Array<Partial<ContentPlacement>>;
  // Usage and Application
  category: string;,
  useCase: string;
  isPublic: boolean;
  // Performance Data
  usageCount: number;
  averagePerformance?: PlacementSlotMetrics;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  createdBy: string;,
  version: string;
  tags: string;
}
export interface PlacementAuditLog {
  logId: string;,
  entityType: 'slot' | 'placement' | 'campaign' | 'schedule';
  entityId: string;,
  action: string;
  // Change Details
  changes?: Array<{,
  field: string;,
  oldValue: any;
  newValue: any;
}>;
  // Context
  userId: string;,
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  // Metadata
  timestamp: Date;
  reason?: string;
  additionalData?: Record<string, any>;
}