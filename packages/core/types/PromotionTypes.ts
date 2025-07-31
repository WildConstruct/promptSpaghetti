/**
 * Promotion Types Index - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Central export file for all promotion-related TypeScript interfaces,
 * types, and enums used throughout the application.
 */

// Export all core promotion interfaces
export * from './PromotionInterfaces';

// Export all service interfaces
export * from './PromotionServices';

// Export all event interfaces
export * from './PromotionEvents';

// Re-export commonly used types for convenience
export type {
  // Core promotion types
  BasePromotion,
  DiscountPromotion,
  ContentPromotion,
  BundlePromotion,
  CampaignPromotion,

  // Configuration types
  DiscountConfiguration,
  PromotionTargetingRule,
  ContentSelectionCriteria,
  BundleConfiguration,

  // Metrics and analytics
  PromotionPerformanceMetrics,
  ContentPromotionMetrics,
  CampaignMetrics,

  // Service interfaces
  IPromotionService,
  IPromotionEligibilityService,
  IContentPromotionService,
  ICampaignService,
  IPromotionAnalyticsService,

  // Event interfaces
  BasePromotionEvent,
  IPromotionEventBus,
  IPromotionNotificationService,

  // API types
  PromotionServiceResponse,
  PromotionEligibilityCheck,
  PromotionApplicationResult,
  PromotionSearchResult,
} from './PromotionInterfaces';

export type {
  // Service request/response types
  CreatePromotionRequest,
  UpdatePromotionRequest,
  EligibilityCheckRequest,
  ApplyPromotionRequest,
  PromotionSearchCriteria,

  // Analytics types
  PromotionPerformanceReport,
  RevenueAnalyticsReport,
  UserPromotionHistory,

  // Management types
  PromotionRule,
  PromotionTemplate,
  PromotionAuditLog,
} from './PromotionServices';

export type {
  // Event data types
  PromotionEventData,
  PromotionLifecycleEventData,
  PromotionUsageEventData,
  PromotionPerformanceEventData,

  // Event handling types
  EventHandlerConfig,
  PromotionEventSubscription,
  EventDeliveryConfig,

  // Notification types
  NotificationRecipient,
  NotificationTemplate,
  NotificationContent,
} from './PromotionEvents';

export {
  // Core enums
  PromotionType,
  PromotionStatus,
  PromotionTargetType,
  PromotionApplicationType,
  DiscountApplicationScope,

  // Event enums
  PromotionEventType,
  EventPriority,
  EventDeliveryMethod,

  // Validation schemas
  CreatePromotionSchema,
  UpdatePromotionSchema,
  ApplyPromotionSchema,
  CheckEligibilitySchema,
} from './PromotionInterfaces';
