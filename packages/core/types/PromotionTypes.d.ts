/**
 * Promotion Types Index - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Central export file for all promotion-related TypeScript interfaces,
 * types, and enums used throughout the application.
 */
export * from './PromotionInterfaces';
export * from './PromotionServices';
export * from './PromotionEvents';
export type { BasePromotion,
  DiscountPromotion,
  ContentPromotion,
  BundlePromotion,
  CampaignPromotion,
  DiscountConfiguration,
  PromotionTargetingRule,
  ContentSelectionCriteria,
  BundleConfiguration,
  PromotionPerformanceMetrics,
  ContentPromotionMetrics,
  CampaignMetrics,
  IPromotionService,
  IPromotionEligibilityService,
  IContentPromotionService,
  ICampaignService,
  IPromotionAnalyticsService,
  BasePromotionEvent,
  IPromotionEventBus,
  IPromotionNotificationService,
  PromotionServiceResponse,
  PromotionEligibilityCheck,
  PromotionApplicationResult,
  PromotionSearchResult }
} from './PromotionInterfaces';
export type { CreatePromotionRequest,
  UpdatePromotionRequest,
  EligibilityCheckRequest,
  ApplyPromotionRequest,
  PromotionSearchCriteria,
  PromotionPerformanceReport,
  RevenueAnalyticsReport,
  UserPromotionHistory,
  PromotionRule,
  PromotionTemplate,
  PromotionAuditLog }
} from './PromotionServices';
export type { PromotionEventData,
  PromotionLifecycleEventData,
  PromotionUsageEventData,
  PromotionPerformanceEventData,
  EventHandlerConfig,
  PromotionEventSubscription,
  EventDeliveryConfig,
  NotificationRecipient,
  NotificationTemplate,
  NotificationContent }
} from './PromotionEvents';
export { PromotionType,
  PromotionStatus,
  PromotionTargetType,
  PromotionApplicationType,
  DiscountApplicationScope,
  PromotionEventType,
  EventPriority,
  EventDeliveryMethod,
  CreatePromotionSchema,
  UpdatePromotionSchema,
  ApplyPromotionSchema,
  CheckEligibilitySchema }
} from './PromotionInterfaces';
//# sourceMappingURL=PromotionTypes.d.ts.map
