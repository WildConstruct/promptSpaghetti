/**
 * Promotion Service Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Service contracts and API interfaces for promotion management operations
 * including CRUD, eligibility checking, application, and analytics.
 */
import { PromotionType } from './PromotionInterfaces';
updatePromotions(updates, (Array));
Promise;
deletePromotions(promotionIds, string, deletedBy, string);
Promise;
// Search and Discovery
searchPromotions(criteria, PromotionSearchCriteria);
Promise;
getActivePromotions(filters ?  : ActivePromotionFilters);
Promise;
getPromotionsByType(type, PromotionType);
Promise;
// Status Management
activatePromotion(promotionId, string, activatedBy, string);
Promise;
pausePromotion(promotionId, string, pausedBy, string, reason ?  : string);
Promise;
cancelPromotion(promotionId, string, cancelledBy, string, reason, string);
Promise;
// Validation
validatePromotion(promotionData, (Partial));
Promise;
checkPromotionConflicts(promotionId, string);
Promise;
;
session_data ?  : Record;
custom_attributes ?  : Record;
 > ;
recommendations: string;
 > ;
;
error_code ?  : string;
error_message ?  : string;
expires_at ?  : Date;
 > ;
// Segmentation analysis
user_segments: Array;
// Performance insights
insights: PerformanceInsight;
recommendations: OptimizationRecommendation;
 > ;
// Trends
daily_revenue: Array;
