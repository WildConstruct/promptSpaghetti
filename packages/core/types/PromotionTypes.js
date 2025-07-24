/**
 * Promotion Types Index - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Central export file for all promotion-related TypeScript interfaces,
 * types, and enums used throughout the application.
 */
// Export all core promotion interfaces
export * from './PromotionInterfaces.js';
// Export all service interfaces
export * from './PromotionServices.js';
// Export all event interfaces
export * from './PromotionEvents.js';
export { 
// Core enums
PromotionType, PromotionStatus, PromotionTargetType, PromotionApplicationType, DiscountApplicationScope, 
// Event enums
PromotionEventType, EventPriority, EventDeliveryMethod, 
// Validation schemas
CreatePromotionSchema, UpdatePromotionSchema, ApplyPromotionSchema, CheckEligibilitySchema } from './PromotionInterfaces.js';
//# sourceMappingURL=PromotionTypes.js.map