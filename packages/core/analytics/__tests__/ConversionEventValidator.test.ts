/**
 * Tests for Conversion Event Validator - Story 30.2 Task 2
 */
import { ConversionEventValidator, ValidationRule, DeduplicationConfig } from '../ConversionEventValidator';
import { EnhancedConversionEvent } from '../ConversionFunnelArchitecture';
describe('ConversionEventValidator', () => {
  let validator: ConversionEventValidator;
  let mockEvent: EnhancedConversionEvent;
  beforeEach(() => {
    validator = new ConversionEventValidator();
    mockEvent = {
      id: 'test-event-001',
      userId: 'user-123',
      sessionId: 'session-456',
      timestamp: Date.now(),
      type: 'template_purchased',
      category: 'revenue',
      value: 25.00,
      properties: { templateId: 'tpl-001' },
      metadata: {,
        userAgent: 'test-agent',
        referrer: 'https://example.com',
      },
      deviceFingerprint: 'test-fingerprint',
      crossDeviceUserId: 'cross-user-123',
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
          attribution_value: 0,
        },
        assistedAttribution: [],
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
      }
    };
  });
  describe('Basic Validation', () => {
    it('should validate a well-formed event', async () => {
      const result = await validator.validateEvent(mockEvent);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.errors).toHaveLength(0);
    });
    it('should detect missing required fields', async () => {
      const invalidEvent = { ...mockEvent };
      delete (invalidEvent as any).id;
      delete (invalidEvent as any).userId;
      const result = await validator.validateEvent(invalidEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[1].field).toBe('userId');
    });
    it('should validate timestamp within acceptable range', async () => {
      // Test future timestamp (should fail)
      const futureEvent = {
        ...mockEvent,
        timestamp: Date.now() + 3600000 // 1 hour in future
      };
      const futureResult = await validator.validateEvent(futureEvent);
      expect(futureResult.isValid).toBe(false);
      expect(futureResult.errors.some(e => e.message.includes('future'))).toBe(true);
      // Test very old timestamp (should fail)
      const oldEvent = {
        ...mockEvent,
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days ago
      };
      const oldResult = await validator.validateEvent(oldEvent);
      expect(oldResult.isValid).toBe(false);
      expect(oldResult.errors.some(e => e.message.includes('too old'))).toBe(true);
    });
    it('should validate negative values', async () => {
      const negativeValueEvent = {
        ...mockEvent,
        value: -10,
      };
      const result = await validator.validateEvent(negativeValueEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('negative'))).toBe(true);
    });
  });
  describe('Privacy Compliance Validation', () => {
    it('should require privacy consent information', async () => {
      const eventWithoutConsent = { ...mockEvent };
      delete (eventWithoutConsent as any).privacyConsent;
      const result = await validator.validateEvent(eventWithoutConsent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_PRIVACY_CONSENT')).toBe(true);
    });
    it('should require analytics consent for processing', async () => {
      const eventWithoutAnalyticsConsent = {
        ...mockEvent,
        privacyConsent: {,
          ...mockEvent.privacyConsent,
          analytics: false,
        }
      };
      const result = await validator.validateEvent(eventWithoutAnalyticsConsent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'ANALYTICS_CONSENT_REQUIRED')).toBe(true);
    });
    it('should warn about cross-device tracking without consent', async () => {
      const eventWithCrossDeviceNoConsent = {
        ...mockEvent,
        crossDeviceUserId: 'cross-user-123',
        privacyConsent: {,
          ...mockEvent.privacyConsent,
          crossDevice: false,
        }
      };
      const result = await validator.validateEvent(eventWithCrossDeviceNoConsent);
      expect(result.warnings.some(w => w.code === 'CROSS_DEVICE_CONSENT_WARNING')).toBe(true);
    });
  });
  describe('Anomaly Detection', () => {
    it('should detect high-value events as anomalies', async () => {
      const highValueEvent = {
        ...mockEvent,
        value: 1500 // High value
      };
      const result = await validator.validateEvent(highValueEvent);
      expect(result.warnings.some(w => w.code === 'HIGH_VALUE_ANOMALY')).toBe(true);
      expect(result.score).toBeLessThan(100);
    });
    it('should detect rapid event succession', async () => {
      const now = Date.now();
      const recentEvents = Array.from({ length: 6 }, (_, i) => ({)
        ...mockEvent,
        id: `rapid-event-${i}`,}
        timestamp: now - (500 - i * 100) // Events within last 500ms
      }));
      const context = {
        userId: mockEvent.userId,
        sessionId: mockEvent.sessionId,
        recentEvents
      };
      const result = await validator.validateEvent(mockEvent, context);
      expect(result.warnings.some(w => w.code === 'RAPID_EVENTS_ANOMALY')).toBe(true);
    });
    it('should detect shared device patterns', async () => {
      const context = {
        userId: mockEvent.userId,
        sessionId: mockEvent.sessionId,
        recentEvents: [],
        deviceProfile: {,
          fingerprint: 'shared-device',
          firstSeen: Date.now() - 86400000,
          lastSeen: Date.now(),
          eventCount: 1000,
          userCount: 15, // Many users on same device
          riskIndicators: [],
          characteristics: {}
        }
      };
      const result = await validator.validateEvent(mockEvent, context);
      expect(result.warnings.some(w => w.code === 'SHARED_DEVICE_ANOMALY')).toBe(true);
    });
  });
  describe('Custom Validation Rules', () => {
    it('should allow registration of custom rules', async () => {
      const customRule: ValidationRule = {
        id: 'custom_template_validation',
        name: 'Template ID Validation',
        description: 'Validates template ID format',
        severity: 'error',
        category: 'business',
        weight: 0.8,
        enabled: true,
        validator: (event) => {
          const templateId = event.properties?.templateId;
          const isValid = templateId && typeof templateId === 'string' && templateId.startsWith('tpl-');
          return {
            isValid,
            score: isValid ? 100 : 0,
            errors: isValid ? [] : [{
              rule: 'custom_template_validation',
              field: 'properties.templateId',
              message: 'Template ID must start with "tpl-"',
              severity: 'major',
              code: 'INVALID_TEMPLATE_ID',
            }],
            warnings: [],
            metadata: { templateId }
          };
        }
      };
      validator.registerRule(customRule);
      // Test valid template ID
      const validResult = await validator.validateEvent(mockEvent);
      expect(validResult.isValid).toBe(true);
      // Test invalid template ID
      const invalidTemplateEvent = {
        ...mockEvent,
        properties: { templateId: 'invalid-id' }
      };
      const invalidResult = await validator.validateEvent(invalidTemplateEvent);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.some(e => e.code === 'INVALID_TEMPLATE_ID')).toBe(true);
    });
    it('should handle rule execution errors gracefully', async () => {
      const faultyRule: ValidationRule = {
        id: 'faulty_rule',
        name: 'Faulty Rule',
        description: 'Rule that throws errors',
        severity: 'error',
        category: 'business',
        weight: 1.0,
        enabled: true,
        validator: () => {
          throw new Error('Rule execution failed');
        }
      };
      validator.registerRule(faultyRule);
      const result = await validator.validateEvent(mockEvent);
      expect(result.errors.some(e => e.code === 'RULE_EXECUTION_ERROR')).toBe(true);
    });
    it('should allow enabling/disabling rules', async () => {
      const rules = validator.getRules();
      const initialRuleCount = rules.length;
      // Disable a rule
      const ruleToDisable = rules[0];
      ruleToDisable.enabled = false;
      const result = await validator.validateEvent(mockEvent);
      // Should have fewer validation results since one rule is disabled
      expect(result.metadata.ruleCount).toBeLessThan(initialRuleCount);
    });
  });
  describe('Deduplication', () => {
    beforeEach(() => {
      const deduplicationConfig: DeduplicationConfig = {
        enabled: true,
        timeWindow: 60000,
        fuzzyMatching: true,
        similarityThreshold: 0.85,
        fields: [],
        exactMatchFields: ['userId', 'type', 'sessionId'],
        fuzzyMatchFields: ['value', 'properties']
      };
      validator = new ConversionEventValidator(deduplicationConfig);
    });
    it('should detect exact duplicate events', async () => {
      // Store first event
      validator.storeEventForDeduplication(mockEvent);
      // Check for duplicate
      const duplicateResult = await validator.checkDuplication(mockEvent);
      expect(duplicateResult.isDuplicate).toBe(true);
      expect(duplicateResult.matchType).toBe('exact');
      expect(duplicateResult.confidence).toBeGreaterThan(0.9);
    });
    it('should detect fuzzy duplicates with similar values', async () => {
      // Store original event
      validator.storeEventForDeduplication(mockEvent);
      // Create similar event with slightly different value
      const similarEvent = {
        ...mockEvent,
        id: 'different-id',
        value: 26.00, // Slightly different value
        timestamp: mockEvent.timestamp + 1000 // 1 second later
      };
      const duplicateResult = await validator.checkDuplication(similarEvent);
      expect(duplicateResult.isDuplicate).toBe(true);
      expect(duplicateResult.matchType).toBe('fuzzy');
      expect(duplicateResult.confidence).toBeGreaterThan(0.8);
    });
    it('should not flag different events as duplicates', async () => {
      validator.storeEventForDeduplication(mockEvent);
      const differentEvent = {
        ...mockEvent,
        id: 'different-event',
        userId: 'different-user',
        type: 'different_type',
        value: 100,
      };
      const duplicateResult = await validator.checkDuplication(differentEvent);
      expect(duplicateResult.isDuplicate).toBe(false);
    });
    it('should respect time window for deduplication', async () => {
      // Create validator with short time window
      const shortWindowValidator = new ConversionEventValidator({)
        enabled: true,
        timeWindow: 1000, // 1 second
        fuzzyMatching: false,
        similarityThreshold: 0.85,
        fields: [],
        exactMatchFields: ['userId', 'type'],
        fuzzyMatchFields: [],
      });
      shortWindowValidator.storeEventForDeduplication(mockEvent);
      // Wait longer than time window
      await new Promise(resolve => setTimeout(resolve, 1100));
      const laterEvent = {
        ...mockEvent,
        timestamp: Date.now(),
      };
      const duplicateResult = await shortWindowValidator.checkDuplication(laterEvent);
      expect(duplicateResult.isDuplicate).toBe(false);
    });
    it('should calculate field similarity correctly', async () => {
      // Test value similarity
      const validator = new ConversionEventValidator();
      const similarity = (validator as any).calculateFieldSimilarity(25.0, 26.0, 'value');
      expect(similarity).toBeGreaterThan(0.9);
      // Test object similarity
      const obj1 = { templateId: 'tpl-001', category: 'character' };
      const obj2 = { templateId: 'tpl-001', category: 'character', extra: 'field' };
      const objectSimilarity = (validator as any).calculateObjectSimilarity(obj1, obj2);
      expect(objectSimilarity).toBeGreaterThan(0.5);
      // Test string similarity
      const stringSimilarity = (validator as any).calculateStringSimilarity('hello', 'helo');
      expect(stringSimilarity).toBeGreaterThan(0.7);
    });
  });
  describe('Metrics and Reporting', () => {
    it('should track validation metrics', async () => {
      // Validate some events
      await validator.validateEvent(mockEvent);
      await validator.validateEvent({ ...mockEvent, id: 'event-2' });
      // Create invalid event
      const invalidEvent = { ...mockEvent };
      delete (invalidEvent as any).id;
      await validator.validateEvent(invalidEvent);
      const metrics = validator.getMetrics();
      expect(metrics.totalValidated).toBe(3);
      expect(metrics.passRate).toBeGreaterThan(0);
      expect(metrics.averageScore).toBeGreaterThan(0);
      expect(metrics.errorsByCategory.schema).toBeGreaterThan(0);
      expect(metrics.errorsByRule.required_fields).toBeGreaterThan(0);
    });
    it('should track processing time', async () => {
      await validator.validateEvent(mockEvent);
      const metrics = validator.getMetrics();
      expect(metrics.processingTime).toBeGreaterThan(0);
    });
    it('should count duplicates found', async () => {
      validator.storeEventForDeduplication(mockEvent);
      await validator.checkDuplication(mockEvent); // Duplicate
      const metrics = validator.getMetrics();
      expect(metrics.duplicatesFound).toBe(1);
    });
    it('should count anomalies detected', async () => {
      const highValueEvent = {
        ...mockEvent,
        value: 1500,
      };
      await validator.validateEvent(highValueEvent);
      const metrics = validator.getMetrics();
      expect(metrics.anomaliesDetected).toBe(1);
    });
    it('should reset metrics correctly', async () => {
      await validator.validateEvent(mockEvent);
      let metrics = validator.getMetrics();
      expect(metrics.totalValidated).toBe(1);
      validator.resetMetrics();
      metrics = validator.getMetrics();
      expect(metrics.totalValidated).toBe(0);
      expect(metrics.passRate).toBe(0);
      expect(metrics.averageScore).toBe(0);
    });
  });
  describe('User Profile Integration', () => {
    it('should use user profile in validation context', async () => {
      validator.updateUserProfile(mockEvent.userId, {)
        id: mockEvent.userId,
        registrationDate: Date.now() - 86400000, // 1 day ago
        totalEvents: 100,
        averageValue: 25,
        riskScore: 0.2,
        verificationStatus: 'verified',
        locationHistory: ['US', 'CA'],
        deviceHistory: ['device-1', 'device-2']
      });
      // Create custom rule that uses user profile
      const profileRule: ValidationRule = {
        id: 'profile_validation',
        name: 'Profile Validation',
        description: 'Validates against user profile',
        severity: 'warning',
        category: 'security',
        weight: 0.6,
        enabled: true,
        validator: (event, context) => {
          const warnings = [];
          if (context?.userProfile?.riskScore && context.userProfile.riskScore > 0.8) {
            warnings.push({)
              rule: 'profile_validation',
              message: 'High-risk user detected',
              code: 'HIGH_RISK_USER',
              impact: 'May require additional verification'
            });
          }
          return {
            isValid: true,
            score: warnings.length > 0 ? 70 : 100,
            errors: [],
            warnings,
            metadata: { riskScore: context?.userProfile?.riskScore }
          };
        }
      };
      validator.registerRule(profileRule);
      const result = await validator.validateEvent(mockEvent);
      expect(result.metadata.riskScore).toBe(0.2);
      expect(result.warnings.length).toBe(0); // Low risk, no warnings
    });
  });
  describe('Configuration Management', () => {
    it('should update deduplication configuration', () => {
      const newConfig = {
        timeWindow: 120000,
        similarityThreshold: 0.9,
        exactMatchFields: ['userId', 'type', 'sessionId', 'value']
      };
      validator.updateDeduplicationConfig(newConfig);
      // Verify configuration was updated by checking internal state
      const internalConfig = (validator as any).deduplicationConfig;
      expect(internalConfig.timeWindow).toBe(120000);
      expect(internalConfig.similarityThreshold).toBe(0.9);
      expect(internalConfig.exactMatchFields).toContain('value');
    });
    it('should list all validation rules', () => {
      const rules = validator.getRules();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(rule => rule.id && rule.name && rule.validator)).toBe(true);
    });
    it('should remove validation rules', () => {
      const rules = validator.getRules();
      const initialCount = rules.length;
      const ruleToRemove = rules[0];
      const removed = validator.removeRule(ruleToRemove.id);
      expect(removed).toBe(true);
      const updatedRules = validator.getRules();
      expect(updatedRules.length).toBe(initialCount - 1);
      expect(updatedRules.find(r => r.id === ruleToRemove.id)).toBeUndefined();
    });
  });
});