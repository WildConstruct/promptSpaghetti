/**
 * ConsentFeatureToggleService Test Suite
 * 
 * Comprehensive tests for consent-aware feature toggle functionality
 * Part of Epic 19 - Data Protection & Privacy Controls (substory 19.2.5)
 */

import ConsentFeatureToggleService, { 
  ConsentType, 
  ConsentStatus, 
  ConsentAwareContext,
  FeatureConsentMapping 
} from '../ConsentFeatureToggleService';
import { FeatureToggleDAO } from '../../database/feature-toggle-dao';
import { 
  FeatureToggle, 
  ToggleType, 
  BooleanToggleValue 
} from '../../database/feature-toggle-models';

// Mock the FeatureToggleDAO
jest.mock('../../database/feature-toggle-dao');

describe('ConsentFeatureToggleService', () => {
  let service: ConsentFeatureToggleService;
  let mockDAO: jest.Mocked<FeatureToggleDAO>;
  
  const mockToggle: FeatureToggle = {
    id: 'toggle1',
    key: 'analytics_feature',
    type: ToggleType.BOOLEAN,
    value: { enabled: true } as BooleanToggleValue,
    enabled: true,
    archived: false,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    claudeImpact: 'low'
  };

  beforeEach(() => {
    mockDAO = new FeatureToggleDAO() as jest.Mocked<FeatureToggleDAO>;
    service = new ConsentFeatureToggleService(mockDAO, {
      enableConsentChecking: true,
      strictMode: false,
      defaultConsentStatus: ConsentStatus.DENIED
    });

    // Mock DAO methods
    mockDAO.getToggleByKey.mockResolvedValue(mockToggle);
    mockDAO.getToggleScopes.mockResolvedValue([]);
    mockDAO.getCachedEvaluation.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Feature Toggle Evaluation', () => {
    test('should evaluate toggle without consent requirements', async () => {
      const result = await service.evaluateToggle('basic_feature');

      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentChecked).toBe(false);
      expect(result.metadata?.consentRequired).toBe(false);
    });

    test('should return original result when consent checking is disabled', async () => {
      const serviceWithoutConsent = new ConsentFeatureToggleService(mockDAO, {
        enableConsentChecking: false
      });

      const result = await serviceWithoutConsent.evaluateToggle('analytics_feature');

      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentChecked).toBeUndefined();
    });
  });

  describe('Consent Requirements', () => {
    beforeEach(() => {
      // Register a consent mapping for analytics
      const mapping: FeatureConsentMapping = {
        featureKey: 'analytics_feature',
        requiredConsents: [ConsentType.ANALYTICS],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable'
      };
      service.registerConsentMapping(mapping);
    });

    test('should grant access when consent is provided', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.GRANTED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('analytics_feature', context);

      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentChecked).toBe(true);
      expect(result.metadata?.consentRequired).toBe(true);
      expect(result.metadata?.consentGranted).toBe(true);
      expect(result.metadata?.requiredConsents).toEqual([ConsentType.ANALYTICS]);
    });

    test('should deny access when consent is not granted', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.DENIED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('analytics_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.value).toBe(false);
      expect(result.reason).toContain('insufficient consent');
      expect(result.metadata?.consentChecked).toBe(true);
      expect(result.metadata?.consentRequired).toBe(true);
      expect(result.metadata?.consentGranted).toBe(false);
    });

    test('should handle withdrawn consent', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.WITHDRAWN,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('analytics_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('insufficient consent');
    });

    test('should handle expired consent', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.EXPIRED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('analytics_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('insufficient consent');
    });
  });

  describe('Multiple Consent Requirements', () => {
    beforeEach(() => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'personalized_feature',
        requiredConsents: [ConsentType.ANALYTICS, ConsentType.PERSONALIZATION],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable'
      };
      service.registerConsentMapping(mapping);
    });

    test('should require ALL consents with AND logic', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.GRANTED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED, // Missing this one
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('personalized_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('insufficient consent');
    });

    test('should succeed when all consents are granted', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.GRANTED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.GRANTED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('personalized_feature', context);

      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentGranted).toBe(true);
    });
  });

  describe('OR Logic for Consent Requirements', () => {
    beforeEach(() => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'flexible_feature',
        requiredConsents: [ConsentType.ANALYTICS, ConsentType.PERFORMANCE],
        requiredConsentLogic: 'OR',
        fallbackBehavior: 'disable'
      };
      service.registerConsentMapping(mapping);
    });

    test('should succeed with ANY consent in OR logic', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.GRANTED, // Only this one granted
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('flexible_feature', context);

      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentGranted).toBe(true);
    });

    test('should fail when no consents are granted in OR logic', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED
        }
      };

      const result = await service.evaluateToggle('flexible_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('insufficient consent');
    });
  });

  describe('Fallback Behaviors', () => {
    test('should disable feature with disable fallback', async () => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'disable_feature',
        requiredConsents: [ConsentType.MARKETING],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable'
      };
      service.registerConsentMapping(mapping);

      const context: ConsentAwareContext = {
        consents: { [ConsentType.MARKETING]: ConsentStatus.DENIED } as any
      };

      const result = await service.evaluateToggle('disable_feature', context);

      expect(result.enabled).toBe(false);
      expect(result.value).toBe(false);
      expect(result.metadata?.fallbackBehavior).toBe('disable');
    });

    test('should provide minimal functionality with minimal fallback', async () => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'minimal_feature',
        requiredConsents: [ConsentType.PERSONALIZATION],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'minimal'
      };
      service.registerConsentMapping(mapping);

      const context: ConsentAwareContext = {
        consents: { [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED } as any
      };

      const result = await service.evaluateToggle('minimal_feature', context);

      expect(result.enabled).toBe(true);
      expect(result.value).toBe('minimal');
      expect(result.reason).toContain('minimal mode');
      expect(result.metadata?.fallbackBehavior).toBe('minimal');
    });

    test('should use default behavior with default fallback', async () => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'default_feature',
        requiredConsents: [ConsentType.FUNCTIONAL],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'default'
      };
      service.registerConsentMapping(mapping);

      const context: ConsentAwareContext = {
        consents: { [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED } as any
      };

      const result = await service.evaluateToggle('default_feature', context);

      expect(result.enabled).toBe(true); // Original toggle was enabled
      expect(result.reason).toContain('default behavior');
      expect(result.metadata?.fallbackBehavior).toBe('default');
    });
  });

  describe('Batch Evaluation', () => {
    beforeEach(() => {
      // Register multiple mappings
      const mappings: FeatureConsentMapping[] = [
        {
          featureKey: 'analytics_feature',
          requiredConsents: [ConsentType.ANALYTICS],
          requiredConsentLogic: 'AND',
          fallbackBehavior: 'disable'
        },
        {
          featureKey: 'marketing_feature',
          requiredConsents: [ConsentType.MARKETING],
          requiredConsentLogic: 'AND',
          fallbackBehavior: 'disable'
        }
      ];
      service.registerConsentMappings(mappings);
    });

    test('should evaluate multiple toggles with different consent statuses', async () => {
      const context: ConsentAwareContext = {
        userId: 'user123',
        consents: {
          [ConsentType.ANALYTICS]: ConsentStatus.GRANTED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED,
          [ConsentType.PERSONALIZATION]: ConsentStatus.DENIED,
          [ConsentType.NECESSARY]: ConsentStatus.GRANTED,
          [ConsentType.ADVERTISING]: ConsentStatus.DENIED,
          [ConsentType.SOCIAL_MEDIA]: ConsentStatus.DENIED,
          [ConsentType.FUNCTIONAL]: ConsentStatus.DENIED,
          [ConsentType.PERFORMANCE]: ConsentStatus.DENIED
        }
      };

      const results = await service.evaluateToggles(
        ['analytics_feature', 'marketing_feature'], 
        context
      );

      expect(results['analytics_feature'].enabled).toBe(true);
      expect(results['marketing_feature'].enabled).toBe(false);
      expect(results['analytics_feature'].metadata?.consentGranted).toBe(true);
      expect(results['marketing_feature'].metadata?.consentGranted).toBe(false);
    });
  });

  describe('Consent Mapping Management', () => {
    test('should register and retrieve consent mappings', () => {
      const mapping: FeatureConsentMapping = {
        featureKey: 'test_feature',
        requiredConsents: [ConsentType.SOCIAL_MEDIA],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable',
        consentExplanation: 'Social media features require social media consent'
      };

      service.registerConsentMapping(mapping);
      
      const mappings = service.getConsentMappings();
      expect(mappings['test_feature']).toEqual(mapping);
      expect(service.isConsentRequired('test_feature')).toBe(true);
      expect(service.getConsentRequirements('test_feature')).toEqual([ConsentType.SOCIAL_MEDIA]);
    });

    test('should handle features without consent requirements', () => {
      expect(service.isConsentRequired('unknown_feature')).toBe(false);
      expect(service.getConsentRequirements('unknown_feature')).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('should handle consent evaluation errors in non-strict mode', async () => {
      const serviceMock = jest.spyOn(service as any, 'getConsentStatus');
      serviceMock.mockRejectedValue(new Error('Consent service error'));

      const result = await service.evaluateToggle('analytics_feature');

      expect(result.enabled).toBe(true); // Falls back to base evaluation
      expect(serviceMock).toHaveBeenCalled();
    });

    test('should propagate errors in strict mode', async () => {
      const strictService = new ConsentFeatureToggleService(mockDAO, {
        strictMode: true
      });

      const serviceMock = jest.spyOn(strictService as any, 'getConsentStatus');
      serviceMock.mockRejectedValue(new Error('Consent service error'));

      const result = await strictService.evaluateToggle('analytics_feature');

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('strict mode');
      expect(result.metadata?.consentError).toBe(true);
    });

    test('should handle base toggle evaluation errors', async () => {
      mockDAO.getToggleByKey.mockRejectedValue(new Error('Database error'));

      const result = await service.evaluateToggle('analytics_feature');

      expect(result.enabled).toBe(false);
      expect(result.reason).toContain('Evaluation error');
    });
  });

  describe('Integration with ConsentService', () => {
    test('should integrate with external consent service', async () => {
      const mockConsentService = {
        getConsents: jest.fn().mockResolvedValue({
          [ConsentType.ANALYTICS]: ConsentStatus.GRANTED,
          [ConsentType.MARKETING]: ConsentStatus.DENIED
        })
      };

      service.setConsentService(mockConsentService);

      const mapping: FeatureConsentMapping = {
        featureKey: 'external_feature',
        requiredConsents: [ConsentType.ANALYTICS],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable'
      };
      service.registerConsentMapping(mapping);

      const result = await service.evaluateToggle('external_feature', { userId: 'user123' });

      expect(mockConsentService.getConsents).toHaveBeenCalledWith('user123', undefined);
      expect(result.enabled).toBe(true);
      expect(result.metadata?.consentGranted).toBe(true);
    });
  });
});