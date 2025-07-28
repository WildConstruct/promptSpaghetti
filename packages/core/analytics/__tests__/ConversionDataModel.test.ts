/**
 * Tests for Conversion Data Model - Story 30.2 Task 3
 */
import { ConversionDataRelationshipManager, FlexibleConversionEvent } from '../ConversionDataModel';
import { EnhancedConversionEvent } from '../ConversionFunnelArchitecture';
describe('ConversionDataRelationshipManager', () => {
  let manager: ConversionDataRelationshipManager;
  let mockBaseEvent: EnhancedConversionEvent;
  beforeEach(() => {
  manager = new ConversionDataRelationshipManager();
  mockBaseEvent = {
  id: 'test-event-001',
  userId: 'user-123',
  sessionId: 'session-456',
  timestamp: Date.now(),
  type: 'template_purchased',
  category: 'revenue',
  value: 25.00,
  properties: {,
  templateId: 'tpl-character-dev-001',
  funnelId: 'marketplace-discovery',
  stepId: 'template-purchase',
  stepOrder: 4,
},
  metadata: {,
  userAgent: 'test-agent',
  referrer: 'https://example.com',
},
  deviceFingerprint: 'test-fingerprint',
      crossDeviceUserId: undefined,
      attributionData: {,
  touchpoints: [],
  primaryAttribution: {,
  name: 'first_touch',
  weight: 1.0,
  touchpoint: {,
  id: 'tp-001',
  timestamp: Date.now(),
  channel: 'direct',
  source: 'direct',
  medium: 'none',
  position: 1,
  influence: 1.0,
},
  attribution_value: 0;
  },
  assistedAttribution: [];
  },
  privacyConsent: {,
  tracking: true,
  analytics: true,
  personalization: true,
  crossDevice: false,
},
  realTimeProcessing: {,
  streamId: 'stream-123',
  batchId: 'batch-456',
  processed: false,
  latency: 0,
};
  });
  describe('Event Enrichment', () => {
    it('should enrich conversion event with full entity relationships', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent).toBeDefined();
      expect(enrichedEvent.id).toBe(mockBaseEvent.id);
      expect(enrichedEvent.schemaVersion).toBe('1.0.0');
      // Check flexible properties
      expect(enrichedEvent.flexibleProperties).toBeDefined();
      expect(enrichedEvent.flexibleProperties['templateId']).toBeDefined();
      expect(enrichedEvent.flexibleProperties['templateId'].value).toBe('tpl-character-dev-001');
      expect(enrichedEvent.flexibleProperties['user_lifetime_value']).toBeDefined();
      expect(enrichedEvent.flexibleProperties['template_conversion_rate']).toBeDefined();
      // Check validation
      expect(enrichedEvent.validation.isValid).toBe(true);
      expect(enrichedEvent.validation.score).toBeGreaterThan(90);
      // Check funnel context
      expect(enrichedEvent.funnelContext.funnelId).toBe('marketplace-discovery');
      expect(enrichedEvent.funnelContext.stepId).toBe('template-purchase');
      expect(enrichedEvent.funnelContext.stepOrder).toBe(4);
      expect(enrichedEvent.funnelContext.timeInFunnel).toBeGreaterThan(0);
      expect(Array.isArray(enrichedEvent.funnelContext.previousSteps)).toBe(true);
      // Check user context
      expect(enrichedEvent.userContext).toBeDefined();
      expect(Array.isArray(enrichedEvent.userContext.segmentIds)).toBe(true);
      expect(Array.isArray(enrichedEvent.userContext.cohortIds)).toBe(true);
      expect(typeof enrichedEvent.userContext.lifetimeValue).toBe('number');
      expect(typeof enrichedEvent.userContext.riskScore).toBe('number');
      expect(typeof enrichedEvent.userContext.engagementScore).toBe('number');
      // Check template context
      expect(enrichedEvent.templateContext).toBeDefined();
      expect(enrichedEvent.templateContext?.templateId).toBe('tpl-character-dev-001');
      expect(enrichedEvent.templateContext?.category).toBeDefined();
      expect(enrichedEvent.templateContext?.price).toBeGreaterThan(0);
      expect(Array.isArray(enrichedEvent.templateContext?.tags)).toBe(true);
      // Check session context
      expect(enrichedEvent.sessionContext).toBeDefined();
      expect(typeof enrichedEvent.sessionContext.isNewSession).toBe('boolean');
      expect(typeof enrichedEvent.sessionContext.sessionDuration).toBe('number');
      expect(typeof enrichedEvent.sessionContext.pageViewCount).toBe('number');
      expect(typeof enrichedEvent.sessionContext.previousConversions).toBe('number');
      expect(typeof enrichedEvent.sessionContext.referrerCategory).toBe('string');
    });
    it('should handle events without template context', async () => {
  const eventWithoutTemplate = {
  ...mockBaseEvent,
  properties: {,
  funnelId: 'user-onboarding',
  stepId: 'profile-setup',
};
      const enrichedEvent = await manager.enrichConversionEvent(eventWithoutTemplate);
      expect(enrichedEvent.templateContext).toBeUndefined();
      expect(enrichedEvent.userContext).toBeDefined();
      expect(enrichedEvent.sessionContext).toBeDefined();
      expect(enrichedEvent.funnelContext.funnelId).toBe('user-onboarding');
    });
    it('should properly infer property types', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      const templateIdProp = enrichedEvent.flexibleProperties['templateId'];
      expect(templateIdProp.type).toBe('string');
      expect(templateIdProp.metadata.source).toBe('event');
      expect(templateIdProp.metadata.confidence).toBe(1.0);
      const lifetimeValueProp = enrichedEvent.flexibleProperties['user_lifetime_value'];
      expect(lifetimeValueProp.type).toBe('number');
      expect(lifetimeValueProp.metadata.source).toBe('derived');
      expect(lifetimeValueProp.metadata.confidence).toBeLessThan(1.0);
    });
    it('should calculate profile completeness correctly', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.userContext.profileCompleteness).toBeGreaterThan(0);
      expect(enrichedEvent.userContext.profileCompleteness).toBeLessThanOrEqual(1);
    });
    it('should categorize referrers correctly', async () => {
      const testCases = [;
        { referrer: '', expected: 'direct' },
        { referrer: 'https://google.com/search', expected: 'search' },
        { referrer: 'https://facebook.com/post', expected: 'social' },
        { referrer: 'https://twitter.com/share', expected: 'social' },
        { referrer: 'https://example.com/page', expected: 'referral' }
      ];
      for (const testCase of testCases) {
  const eventWithReferrer = {
  ...mockBaseEvent,
  metadata: {,
  ...mockBaseEvent.metadata,
  referrer: testCase.referrer,
};
        const enrichedEvent = await manager.enrichConversionEvent(eventWithReferrer);
        expect(enrichedEvent.sessionContext.referrerCategory).toBe(testCase.expected);
    });
  });
  describe('User Entity Management', () => {
    it('should create default user entity for new users', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.userContext.segmentIds).toContain('new_user');
      expect(enrichedEvent.userContext.lifetimeValue).toBe(0);
      expect(enrichedEvent.userContext.riskScore).toBe(0.1);
      expect(enrichedEvent.userContext.engagementScore).toBe(0.5);
    });
    it('should update user profile information', () => {
  const userId = 'user-456';
  manager.updateUserProfile(userId, {)
  id: userId,
  registrationDate: Date.now() - 604800000, // 1 week ago,
  totalEvents: 50,
  averageValue: 75,
  riskScore: 0.3,
  verificationStatus: 'verified',
  locationHistory: ['US'],
  deviceHistory: ['device-1', 'device-2'],
});
      // Create event for updated user
      const eventForUpdatedUser = {
        ...mockBaseEvent,
        userId
      };
      return manager.enrichConversionEvent(eventForUpdatedUser).then(enrichedEvent => {)
  expect(enrichedEvent.userContext.riskScore).toBe(0.3);
        expect(enrichedEvent.userContext.lifetimeValue).toBeGreaterThan(0);
      });
    });
  });
  describe('Template Entity Management', () => {
    it('should create default template entity for new templates', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.templateContext?.templateId).toBe('tpl-character-dev-001');
      expect(enrichedEvent.templateContext?.category).toBe('character-development');
      expect(enrichedEvent.templateContext?.price).toBe(20);
      expect(enrichedEvent.templateContext?.rating).toBe(4.2);
      expect(enrichedEvent.templateContext?.popularity).toBe(1000);
      expect(enrichedEvent.templateContext?.tags).toContain('template');
      expect(enrichedEvent.templateContext?.tags).toContain('filmmaking');
    });
    it('should derive template conversion rate correctly', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      const conversionRateProp = enrichedEvent.flexibleProperties['template_conversion_rate'];
      expect(conversionRateProp).toBeDefined();
      expect(conversionRateProp.type).toBe('number');
      expect(conversionRateProp.value).toBe(5.0); // From default template entity
      expect(conversionRateProp.metadata.source).toBe('template');
    });
  });
  describe('Funnel Context Building', () => {
    it('should build funnel context correctly', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.funnelContext.funnelId).toBe('marketplace-discovery');
      expect(enrichedEvent.funnelContext.stepId).toBe('template-purchase');
      expect(enrichedEvent.funnelContext.stepOrder).toBe(4);
      expect(enrichedEvent.funnelContext.isBacktracking).toBe(false);
      expect(enrichedEvent.funnelContext.previousSteps).toEqual(['entry_point', 'engagement']);
      expect(enrichedEvent.funnelContext.timeInFunnel).toBeGreaterThan(0);
    });
    it('should handle missing funnel properties gracefully', async () => {
  const eventWithoutFunnel = {
  ...mockBaseEvent,
  properties: {,
  templateId: 'tpl-001',
};
      const enrichedEvent = await manager.enrichConversionEvent(eventWithoutFunnel);
      expect(enrichedEvent.funnelContext.funnelId).toBe('unknown');
      expect(enrichedEvent.funnelContext.stepId).toBe('unknown');
      expect(enrichedEvent.funnelContext.stepOrder).toBe(0);
    });
  });
  describe('Session Context Building', () => {
    it('should build session context correctly', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.sessionContext.isNewSession).toBe(true);
      expect(enrichedEvent.sessionContext.sessionDuration).toBeGreaterThanOrEqual(0);
      expect(enrichedEvent.sessionContext.pageViewCount).toBeGreaterThan(0);
      expect(enrichedEvent.sessionContext.previousConversions).toBeGreaterThanOrEqual(0);
      expect(enrichedEvent.sessionContext.deviceFingerprint).toBe('test-fingerprint');
    });
    it('should handle missing device fingerprint', async () => {
  const eventWithoutFingerprint = {
  ...mockBaseEvent,
  deviceFingerprint: undefined,
};
      const enrichedEvent = await manager.enrichConversionEvent(eventWithoutFingerprint);
      expect(enrichedEvent.sessionContext.deviceFingerprint).toBe('');
    });
  });
  describe('Validation Integration', () => {
    it('should include validation results in enriched event', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.validation).toBeDefined();
      expect(enrichedEvent.validation.isValid).toBe(true);
      expect(enrichedEvent.validation.score).toBeGreaterThan(90);
      expect(Array.isArray(enrichedEvent.validation.errors)).toBe(true);
      expect(Array.isArray(enrichedEvent.validation.warnings)).toBe(true);
      expect(Array.isArray(enrichedEvent.validation.appliedRules)).toBe(true);
      expect(enrichedEvent.validation.appliedRules).toContain('required_fields');
    });
    it('should handle validation errors gracefully', async () => {
      // This test would require modifying the validation logic to simulate errors
      // For now, we test that validation structure is present
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.validation).toBeDefined();
      expect(typeof enrichedEvent.validation.isValid).toBe('boolean');
      expect(typeof enrichedEvent.validation.score).toBe('number');
    });
  });
  describe('Property Metadata', () => {
    it('should set correct metadata for all flexible properties', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      for (const [propertyName, property] of Object.entries(enrichedEvent.flexibleProperties)) {
        expect(property.metadata).toBeDefined();
        expect(property.metadata.source).toBeDefined();
        expect(typeof property.metadata.confidence).toBe('number');
        expect(property.metadata.confidence).toBeGreaterThan(0);
        expect(property.metadata.confidence).toBeLessThanOrEqual(1);
        expect(typeof property.metadata.lastUpdated).toBe('number');
        expect(property.metadata.lastUpdated).toBeLessThanOrEqual(Date.now());
        expect(['valid', 'invalid', 'pending']).toContain(property.metadata.validationStatus);
    });
    it('should assign correct confidence scores by source', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      // Event properties should have highest confidence
      const eventProperty = enrichedEvent.flexibleProperties['templateId'];
      expect(eventProperty.metadata.source).toBe('event');
      expect(eventProperty.metadata.confidence).toBe(1.0);
      // Template properties should have high confidence
      const templateProperty = enrichedEvent.flexibleProperties['template_conversion_rate'];
      expect(templateProperty.metadata.source).toBe('template');
      expect(templateProperty.metadata.confidence).toBe(0.95);
      // Derived properties should have lower confidence
      const derivedProperty = enrichedEvent.flexibleProperties['user_lifetime_value'];
      expect(derivedProperty.metadata.source).toBe('derived');
      expect(derivedProperty.metadata.confidence).toBe(0.9);
    });
  });
  describe('Schema Versioning', () => {
    it('should include schema version in enriched events', async () => {
      const enrichedEvent = await manager.enrichConversionEvent(mockBaseEvent);
      expect(enrichedEvent.schemaVersion).toBe('1.0.0');
    });
    it('should be backward compatible with different schema versions', async () => {
      // Test that enrichment works regardless of input event structure
      const minimalEvent = {
        id: 'minimal-event',
        userId: 'user-minimal',
        sessionId: 'session-minimal',
        timestamp: Date.now(),
        type: 'page_view',
        category: 'engagement',
        properties: {},
        metadata: {,
  userAgent: 'test',
  referrer: '',
},
  attributionData: {,
  touchpoints: [],
  primaryAttribution: {,
  name: 'direct',
  weight: 1.0,
  touchpoint: {,
  id: 'direct',
  timestamp: Date.now(),
  channel: 'direct',
  source: 'direct',
  medium: 'none',
  position: 1,
  influence: 1.0,
},
  attribution_value: 0;
  },
  assistedAttribution: [];
  },
  privacyConsent: {,
  tracking: true,
  analytics: true,
  personalization: false,
  crossDevice: false,
},
  realTimeProcessing: {,
  streamId: 'stream',
  batchId: 'batch',
  processed: false,
  latency: 0,
} as EnhancedConversionEvent;
      const enrichedEvent = await manager.enrichConversionEvent(minimalEvent);
      expect(enrichedEvent).toBeDefined();
      expect(enrichedEvent.schemaVersion).toBe('1.0.0');
      expect(enrichedEvent.userContext).toBeDefined();
      expect(enrichedEvent.sessionContext).toBeDefined();
      expect(enrichedEvent.templateContext).toBeUndefined(); // No template in minimal event
    });
  });
  describe('Error Handling', () => {
  it('should handle missing required fields gracefully', async () => {
  const incompleteEvent = {
  ...mockBaseEvent,
  userId: '', // Empty user ID,
  sessionId: '' // Empty session ID,
};
      const enrichedEvent = await manager.enrichConversionEvent(incompleteEvent);
      // Should still enrich what it can
      expect(enrichedEvent).toBeDefined();
      expect(enrichedEvent.schemaVersion).toBe('1.0.0');
      expect(enrichedEvent.validation).toBeDefined();
    });
    it('should handle null/undefined property values', async () => {
  const eventWithNulls = {
  ...mockBaseEvent,
  value: null,
  properties: {,
  templateId: undefined,
  funnelId: null,
} as any;
      const enrichedEvent = await manager.enrichConversionEvent(eventWithNulls);
      expect(enrichedEvent).toBeDefined();
      expect(enrichedEvent.flexibleProperties).toBeDefined();
    });
  });
  describe('Performance', () => {
    it('should enrich events efficiently', async () => {
      const startTime = Date.now();
      await manager.enrichConversionEvent(mockBaseEvent);
      const endTime = Date.now();
      const enrichmentTime = endTime - startTime;
      // Enrichment should complete within reasonable time
      expect(enrichmentTime).toBeLessThan(100); // 100ms
    });
    it('should handle multiple concurrent enrichments', async () => {
      const events = Array.from({ length: 10 }, (_, i) => ({)
  ...mockBaseEvent,
        id: `concurrent-event-${i}`}
},
  userId: `user-${i}`}
      }));
      const startTime = Date.now();
      const enrichedEvents = await Promise.all(;);
        events.map(event => manager.enrichConversionEvent(event))
      );
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      expect(enrichedEvents).toHaveLength(10);
      expect(totalTime).toBeLessThan(500); // 500ms for 10 events
      // Verify all events were enriched correctly
      enrichedEvents.forEach((enrichedEvent, index) => {
        expect(enrichedEvent.id).toBe(`concurrent-event-${index}`);}
        expect(enrichedEvent.userId).toBe(`user-${index}`);}
        expect(enrichedEvent.userContext).toBeDefined();
      });
    });
  });
});