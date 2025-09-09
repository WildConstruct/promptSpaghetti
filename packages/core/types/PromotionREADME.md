# Promotion Interfaces Documentation

**Epic 17 Implementation - Task E17-1753114397317-A8CDBE**

This directory contains comprehensive TypeScript interfaces for the unified promotion management system. The interfaces are designed to provide type safety, consistency, and extensibility across all promotion-related functionality.

## Architecture Overview

The promotion interface system is organized into four main modules:

### 1. PromotionInterfaces.ts

Core promotion data structures and domain models.

**Key Components:**

- `BasePromotion` - Foundation interface for all promotion types
- Specific promotion implementations (DiscountPromotion, ContentPromotion, BundlePromotion, CampaignPromotion)
- Configuration structures (DiscountConfiguration, TargetingRules, ContentSelection)
- Analytics and performance tracking interfaces

### 2. PromotionServices.ts

Service contracts and API interfaces for promotion operations.

**Key Components:**

- `IPromotionService` - Main promotion CRUD operations
- `IPromotionEligibilityService` - Promotion application and eligibility checking
- `IContentPromotionService` - Content promotion management
- `ICampaignService` - Multi-channel campaign management
- `IPromotionAnalyticsService` - Analytics and reporting services
- Request/response types and error handling

### 3. PromotionEvents.ts

Event-driven system interfaces for notifications and workflow automation.

**Key Components:**

- `BasePromotionEvent` - Core event structure
- Specific event types (LifecycleEvents, UsageEvents, PerformanceEvents)
- Event handling and subscription interfaces
- Notification system interfaces

### 4. PromotionTypes.ts

Consolidated export file for all promotion interfaces.

## Promotion Types Hierarchy

```typescript
BasePromotion (abstract)
├── DiscountPromotion
│   ├── PERCENTAGE_DISCOUNT
│   ├── FIXED_AMOUNT_DISCOUNT
│   ├── BUY_ONE_GET_ONE
│   └── BULK_DISCOUNT
├── ContentPromotion
│   ├── FEATURED_CONTENT
│   ├── CATEGORY_SPOTLIGHT
│   ├── TRENDING_CAROUSEL
│   ├── EDITOR_CHOICE
│   └── NEW_ARRIVALS
├── BundlePromotion
│   ├── CROSS_SELL
│   ├── UPSELL
│   └── BUNDLE_DEAL
└── CampaignPromotion
    ├── SEASONAL_SALE
    ├── FLASH_SALE
    └── LOYALTY_REWARD
```

## Key Design Principles

### 1. Type Safety

All interfaces use strict TypeScript typing with union types, enums, and generic constraints to prevent runtime errors.

### 2. Extensibility

- Base interfaces provide common properties
- Specific implementations extend base types
- Metadata and custom fields support future requirements

### 3. Integration Compatibility

Built-in compatibility with existing systems:

- **Shopping Cart Integration** - Extends existing `discount_codes` field
- **Transaction System** - Full integration with payment processing
- **Content Management** - Works with existing content promotion systems
- **Film Industry Pricing** - Integrates with specialized pricing services

### 4. Event-Driven Architecture

- Real-time promotion change notifications
- Workflow automation triggers
- Performance monitoring and alerting
- User interaction tracking

### 5. Analytics and Performance

- Comprehensive performance tracking
- ROI calculation and analysis
- A/B testing support
- Predictive analytics interfaces

## Usage Examples

### Creating a Discount Promotion

```typescript
import { IPromotionService, DiscountPromotion, PromotionType } from '@/types';

const promotionService: IPromotionService = new PromotionService();

const discountPromotion: CreatePromotionRequest = {
  type: PromotionType.PERCENTAGE_DISCOUNT,
  name: 'Summer Sale 2024',
  description: '25% off all film industry templates',
  start_date: new Date('2024-06-01'),
  end_date: new Date('2024-08-31'),
  timezone: 'America/New_York',

  discount_config: {
    type: 'percentage',
    percentage: 25,
    currency: 'USD',
    compound_with_other_discounts: false,
    apply_to_sale_items: true
  },

  application_type: PromotionApplicationType.CODE_REQUIRED,
  promo_code: 'SUMMER2024',
  usage_limit: 1000,

  targeting_rules: [
    {
      type: PromotionTargetType.USER_SEGMENT,
      conditions: [
        {
          field: 'user.industry',
          operator: 'equals',
          value: 'film_production'
        }
      ],
      operator: 'AND'
    }
  ],

  created_by: 'admin-user-123'
};

const result = await promotionService.createPromotion(discountPromotion);
```

### Checking Promotion Eligibility

```typescript
import { IPromotionEligibilityService, EligibilityCheckRequest } from '@/types';

const eligibilityService: IPromotionEligibilityService =
  new PromotionEligibilityService();

const eligibilityCheck: EligibilityCheckRequest = {
  promotion_id: 'promo-summer-2024',
  user_id: 'user-456',
  cart_id: 'cart-789',
  promo_code: 'SUMMER2024',
  context: {
    user_agent: 'Mozilla/5.0...',
    device_type: 'desktop',
    location: {
      country: 'US',
      region: 'CA'
    }
  }
};

const eligibility = await eligibilityService.checkEligibility(eligibilityCheck);

if (eligibility.data?.eligible) {
  console.log(`Discount: $${eligibility.data.discount_amount_cents / 100}`);
} else {
  console.log('Not eligible:', eligibility.data?.reasons);
}
```

### Content Promotion Management

```typescript
import { IContentPromotionService, ContentPromotion } from '@/types';

const contentService: IContentPromotionService = new ContentPromotionService();

const contentPromotion: CreateContentPromotionRequest = {
  type: PromotionType.FEATURED_CONTENT,
  name: 'Holiday Featured Templates',
  description: 'Showcase best holiday-themed templates',

  content_selection_strategy: {
    method: 'automatic',
    automatic_refresh: true,
    refresh_interval_hours: 6,
    performance_based_rotation: true
  },

  content_criteria: {
    categories: ['holiday', 'seasonal'],
    min_rating: 4.5,
    min_download_count: 100,
    max_content_count: 12,
    diversification_rules: [
      {
        attribute: 'creator',
        max_percentage: 30,
        enforce_minimum_variety: true
      }
    ]
  },

  display_config: {
    display_location: 'homepage_hero',
    layout_type: 'carousel',
    max_visible_items: 4,
    show_badges: true,
    show_pricing: true,
    cta_text: 'Shop Holiday Collection'
  },

  rotation_config: {
    rotation_type: 'performance_based',
    performance_thresholds: {
      min_ctr: 0.05,
      min_conversions: 2,
      max_time_minutes: 240
    }
  }
};
```

### Event Subscription

```typescript
import { IPromotionEventBus, PromotionEventType } from '@/types';

const eventBus: IPromotionEventBus = new PromotionEventBus();

const subscription: PromotionEventSubscription = {
  subscription_id: 'analytics-dashboard',
  subscriber_id: 'dashboard-service',
  subscriber_name: 'Analytics Dashboard',

  event_types: [
    PromotionEventType.PROMOTION_APPLIED,
    PromotionEventType.PROMOTION_PERFORMANCE_MILESTONE,
    PromotionEventType.CAMPAIGN_BUDGET_EXHAUSTED
  ],

  filters: [
    {
      field: 'data.promotion_type',
      operator: 'in',
      value: ['percentage_discount', 'bundle_deal']
    }
  ],

  delivery_method: EventDeliveryMethod.WEBHOOK,
  delivery_config: {
    webhook_url: 'https://analytics.company.com/promotion-events',
    webhook_headers: {
      Authorization: 'Bearer token123',
      'Content-Type': 'application/json'
    }
  },

  delivery_guarantee: 'at_least_once',
  batch_delivery: true,
  batch_size: 50,
  batch_timeout_ms: 30000
};

await eventBus.subscribe(subscription);
```

### Analytics and Reporting

```typescript
import { IPromotionAnalyticsService, DateRange } from '@/types';

const analyticsService: IPromotionAnalyticsService =
  new PromotionAnalyticsService();

const dateRange: DateRange = {
  start_date: new Date('2024-06-01'),
  end_date: new Date('2024-08-31')
};

// Get promotion performance report
const performance = await analyticsService.getPromotionPerformance(
  'promo-summer-2024',
  dateRange
);

console.log('ROI:', performance.data?.metrics.roi);
console.log(
  'Total Revenue:',
  performance.data?.metrics.total_revenue_generated_cents / 100
);

// Compare multiple promotions
const comparison = await analyticsService.comparePromotions(
  ['promo-summer-2024', 'promo-spring-2024'],
  ['conversion_rate', 'revenue', 'usage_count'],
  dateRange
);

// Get optimization recommendations
const recommendations =
  await analyticsService.getOptimizationRecommendations('promo-summer-2024');
```

## Integration Points

### Existing Systems Integration

The promotion interfaces are designed to work with existing systems:

1. **Shopping Cart Integration**
   - Extends existing `ShoppingCart.discount_codes` field
   - Seamless integration with cart totals calculation
   - Compatible with existing checkout flow

2. **Transaction System Integration**
   - Full integration with `TransactionService`
   - Support for promotion tracking in orders
   - Revenue attribution and analytics

3. **Content Management Integration**
   - Works with existing `PromotionSchedulingService`
   - Template and content promotion support
   - A/B testing and performance optimization

4. **Film Industry Pricing Integration**
   - Compatible with `FilmIndustryPricingService`
   - Studio-specific promotion rules
   - Industry pricing optimization

### Database Schema Mapping

The interfaces support flexible database implementations:

```typescript
// Promotion storage can be normalized or document-based
interface PromotionRecord {
  id: string;
  type: PromotionType;
  base_data: BasePromotion; // JSON storage
  type_specific_data: any; // Discount/Content/Bundle/Campaign config
  targeting_rules: PromotionTargetingRule[];
  performance_metrics: PromotionPerformanceMetrics;
  metadata: Record<string, any>;
}
```

## Error Handling

All service interfaces use consistent error handling:

```typescript
interface PromotionServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    request_id: string;
    timestamp: Date;
    execution_time_ms: number;
  };
}
```

## Performance Considerations

### Caching Strategy

- Promotion eligibility results are cacheable
- Cache invalidation on promotion updates
- Performance metrics tracking for optimization

### Bulk Operations

- Support for batch promotion operations
- Optimized eligibility checking for multiple promotions
- Background processing for large campaigns

### Analytics Optimization

- Pre-aggregated performance metrics
- Configurable reporting periods
- Streaming analytics for real-time insights

### Real-time Updates

- Event-driven architecture for immediate notifications
- WebSocket support for dashboard updates
- Efficient batch processing for high-volume events

## Testing Strategy

The interfaces support comprehensive testing:

1. **Unit Testing**
   - Type validation testing
   - Business logic verification
   - Error condition handling

2. **Integration Testing**
   - Service interaction validation
   - Event flow verification
   - Performance benchmarking

3. **Promotion Testing Framework**
   - A/B test management
   - Campaign effectiveness testing
   - Revenue impact validation

## Security Considerations

### Data Protection

- PII handling in targeting rules
- Secure storage of promotion configurations
- Audit trail for all promotion operations

### Access Control

- Role-based access to promotion management
- API key authentication for external integrations
- Rate limiting for promotion application endpoints

### Fraud Prevention

- Usage pattern monitoring
- Suspicious activity detection
- Automated promotion abuse prevention

## Future Extensions

The interface design supports future enhancements:

1. **Machine Learning Integration**
   - Personalized promotion recommendations
   - Predictive performance modeling
   - Automated optimization algorithms

2. **Advanced Targeting**
   - Real-time behavioral targeting
   - Cross-platform user tracking
   - Dynamic segmentation

3. **Multi-tenant Support**
   - Organization-specific promotion management
   - White-label promotion systems
   - Marketplace-specific rules

4. **External Platform Integration**
   - Social media promotion sync
   - Email marketing integration
   - CRM system connectivity

## Migration Guide

### From Existing Systems

When migrating from existing promotion systems:

1. **Data Migration**
   - Map existing discount codes to new promotion format
   - Preserve historical performance data
   - Maintain user-specific usage tracking

2. **API Compatibility**
   - Provide backwards-compatible endpoints
   - Gradual migration path for client applications
   - Deprecation timeline for legacy APIs

3. **Feature Parity**
   - Ensure all existing functionality is supported
   - Enhanced capabilities through new interfaces
   - Improved analytics and reporting

## Contributing

When extending these interfaces:

1. **Maintain Backward Compatibility**
   - Use optional properties for new fields
   - Extend existing interfaces rather than modifying
   - Document breaking changes clearly

2. **Follow Naming Conventions**
   - Use descriptive, consistent naming
   - Prefer explicit over implicit types
   - Follow established patterns

3. **Add Comprehensive Documentation**
   - Document interface purpose and usage
   - Explain complex relationships
   - Provide code examples

4. **Update Tests**
   - Add type validation tests
   - Update integration tests
   - Verify error handling scenarios

## Related Documentation

- [Promotion System Architecture](../../../docs/architecture/promotion-system.md)
- [Analytics Framework Guide](../../../docs/analytics/promotion-analytics.md)
- [Event-Driven Architecture](../../../docs/architecture/event-system.md)
- [API Reference](../../../docs/api/promotion-services.md)
- [Migration Guide](../../../docs/migration/promotion-migration.md)
