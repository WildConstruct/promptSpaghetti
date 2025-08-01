/**
 * Core Types Index - Epic 17 Implementation
 *
 * Central export file for all policy-related TypeScript interfaces
 * and types used throughout the application.
 */

// Temporarily commenting out problematic exports to identify issues
// TODO: Fix duplicate export conflicts and re-enable these exports
// export * from './PolicyInterfaces';
// export * from './PolicyServices';
// export * from './PolicyEvents';

// Export promotion interfaces
export * from './PromotionTypes';

// Export existing types for compatibility
export * from './TrustTypes';
export * from './EnforcementTypes';

// Re-export commonly used types for convenience
export type { // Core policy types
  BasePolicy,
  PolicyType,
  PolicyStatus,
  PolicyScope,
  PolicyCondition,

  // Specific policy types
  SecurityPolicy,
  PrivacyPolicy,
  ContentPolicy,

  // Policy management
  PolicyAssignment,
  PolicyEvaluation,
  PolicyTemplate,
  PolicyAnalytics,

  // Service interfaces
  IPolicyService,
  IPolicyEvaluationService,
  IPolicyAssignmentService,
  IPolicyAnalyticsService,

  // Event types
  BasePolicyEvent,
  PolicyEventType,
  IPolicyEventHandler,
  IPolicyNotificationService,

  // Common response types
  PolicyServiceResponse,
  PolicyValidationResult,
  EvaluationContext }
 from './PolicyInterfaces';

export type { // Core promotion types
  BasePromotion,
  DiscountPromotion,
  ContentPromotion,
  BundlePromotion,
  CampaignPromotion,

  // Promotion service interfaces
  IPromotionService,
  IPromotionEligibilityService,
  IContentPromotionService,
  ICampaignService,
  IPromotionAnalyticsService,

  // Promotion event types
  BasePromotionEvent,
  IPromotionEventBus,
  IPromotionNotificationService,

  // Promotion response types
  PromotionServiceResponse,
  PromotionEligibilityCheck,
  PromotionApplicationResult,
  PromotionSearchResult }
 from './PromotionInterfaces';

export type { PolicyServiceResponse,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyTestCase,
  PolicyTestResult }
 from './PolicyServices';

export type { BasePolicyEvent,
  PolicyEventType,
  PolicyLifecycleEvent,
  PolicyAssignmentEvent,
  ComplianceEvent,
  SecurityEvent,
  PolicyNotification }
 from './PolicyEvents';
