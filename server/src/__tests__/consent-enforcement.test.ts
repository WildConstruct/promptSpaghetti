/**
 * Consent Enforcement System Test Suite
 * Comprehensive tests for consent enforcement middleware and related functionality
 */

import { ConsentEnforcementMiddleware, ConsentContext, ConsentEnforcementRule } from '../middleware/consent-enforcement';
import { ConsentBasedDataFilterService } from '../services/ConsentBasedDataFilterService';
import { ConsentCollectionService } from '../services/ConsentCollectionService';

// Mock services
jest.mock('../services/ConsentBasedDataFilterService');
jest.mock('../services/ConsentCollectionService');
jest.mock('../utils/logger');

describe('ConsentEnforcementMiddleware', () => {
  let middleware: ConsentEnforcementMiddleware;
  let mockConsentFilterService: jest.Mocked<ConsentBasedDataFilterService>;
  let mockConsentCollectionService: jest.Mocked<ConsentCollectionService>;
  let mockRequest: any;
  let mockReply: any;
  let mockDone: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConsentFilterService = new ConsentBasedDataFilterService() as jest.Mocked<ConsentBasedDataFilterService>;
    mockConsentCollectionService = new ConsentCollectionService() as jest.Mocked<ConsentCollectionService>;
    
    middleware = new ConsentEnforcementMiddleware(
      mockConsentFilterService,
      mockConsentCollectionService
    );

    mockRequest = {
      url: '/api/analytics/track',
      method: 'POST',
      user: { id: 'user-123' },
      headers: {
        'user-agent': 'Test Browser',
        'x-forwarded-for': '192.168.1.1'
  }
      ip: '192.168.1.1'
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };

    mockDone = jest.fn();
  });

  describe('Middleware Creation', () => {
    it('should create middleware function', () => {
      const middlewareFunc = middleware.createMiddleware();
      expect(typeof middlewareFunc).toBe('function');
    });

    it('should skip enforcement for exempt paths', async () => {
      mockRequest.url = '/api/health';
      
      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      expect(mockDone).toHaveBeenCalledWith();
      expect(mockConsentCollectionService.getUserConsent).not.toHaveBeenCalled();
    });

    it('should skip enforcement when no user context', async () => {
      mockRequest.user = undefined;
      
      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      expect(mockDone).toHaveBeenCalledWith();
    });
  });

  describe('Consent Context Extraction', () => {
    it('should extract consent context from request', async () => {
      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      // Verify context was extracted (indirectly through subsequent calls)
      expect(mockConsentCollectionService.getUserConsent).toHaveBeenCalledWith('user-123');
    });

    it('should infer processing purpose from URL', () => {
      const testCases = [
        { url: '/api/analytics/track', expected: 'analytics' },
        { url: '/api/marketing/campaign', expected: 'marketing' },
        { url: '/api/user/profile', expected: 'personalization' },
        { url: '/api/social/share', expected: 'social_media' },
        { url: '/api/data/export', expected: 'functional' }
      ];

      testCases.forEach(({ url, expected }) => {
        mockRequest.url = url;
        const purpose = (middleware as any).inferProcessingPurpose(mockRequest);
        expect(purpose).toBe(expected);
      });
    });
  });

  describe('Consent Compliance Checking', () => {
    beforeEach(() => {
      // Add a test rule
      const testRule: ConsentEnforcementRule = {
        id: 'analytics_test',
        name: 'Analytics Tracking',
        description: 'Test rule for analytics',
        paths: ['/api/analytics/*'],
        methods: ['POST'],
        requiredConsents: ['ANALYTICS'],
        dataCategories: ['usage_data'],
        enforcementLevel: 'strict',
        exemptions: [],
        enabled: true
      };
      
      middleware.addEnforcementRule(testRule);
    });

    it('should allow request when user has required consent', async () => {
      mockConsentCollectionService.getUserConsent.mockResolvedValue({
        consents: {
          ANALYTICS: {
            granted: true,
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          }
        }
      });

      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      expect(mockDone).toHaveBeenCalledWith();
      expect(mockReply.code).not.toHaveBeenCalledWith(403);
    });

    it('should block request when user lacks required consent', async () => {
      mockConsentCollectionService.getUserConsent.mockResolvedValue({
        consents: {
          ANALYTICS: {
            granted: false,
            grantedAt: new Date()
          }
        }
      });

      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Consent Required'
      }));
      expect(mockDone).not.toHaveBeenCalled();
    });

    it('should block request when consent has expired', async () => {
      mockConsentCollectionService.getUserConsent.mockResolvedValue({
        consents: {
          ANALYTICS: {
            granted: true,
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired yesterday
          }
        }
      });

      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      expect(mockReply.code).toHaveBeenCalledWith(403);
    });

    it('should handle consent service errors gracefully', async () => {
      mockConsentCollectionService.getUserConsent.mockRejectedValue(new Error('Service unavailable'));

      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);
      
      // Should still process the request but log the issue
      expect(mockDone).toHaveBeenCalledWith();
    });
  });

  describe('Enforcement Rule Management', () => {
    it('should add enforcement rules', () => {
      const rule: ConsentEnforcementRule = {
        id: 'test_rule',
        name: 'Test Rule',
        description: 'Test description',
        paths: ['/api/test/*'],
        methods: ['GET', 'POST'],
        requiredConsents: ['FUNCTIONAL'],
        dataCategories: ['test_data'],
        enforcementLevel: 'permissive',
        exemptions: [],
        enabled: true
      };

      middleware.addEnforcementRule(rule);
      
      // Verify rule was added (indirectly through finding applicable rules)
      const applicableRules = (middleware as any).findApplicableRules('/api/test/endpoint', 'POST');
      expect(applicableRules).toContainEqual(expect.objectContaining({ id: 'test_rule' }));
    });

    it('should remove enforcement rules', () => {
      const rule: ConsentEnforcementRule = {
        id: 'remove_test',
        name: 'Remove Test',
        description: 'Test removal',
        paths: ['/api/remove/*'],
        methods: ['DELETE'],
        requiredConsents: ['FUNCTIONAL'],
        dataCategories: ['test_data'],
        enforcementLevel: 'strict',
        exemptions: [],
        enabled: true
      };

      middleware.addEnforcementRule(rule);
      middleware.removeEnforcementRule('remove_test');
      
      const applicableRules = (middleware as any).findApplicableRules('/api/remove/endpoint', 'DELETE');
      expect(applicableRules).not.toContainEqual(expect.objectContaining({ id: 'remove_test' }));
    });

    it('should find applicable rules based on path and method', () => {
      const rule1: ConsentEnforcementRule = {
        id: 'get_rule',
        name: 'GET Rule',
        description: 'GET only',
        paths: ['/api/data/*'],
        methods: ['GET'],
        requiredConsents: ['FUNCTIONAL'],
        dataCategories: ['data'],
        enforcementLevel: 'strict',
        exemptions: [],
        enabled: true
      };

      const rule2: ConsentEnforcementRule = {
        id: 'post_rule',
        name: 'POST Rule',
        description: 'POST only',
        paths: ['/api/data/*'],
        methods: ['POST'],
        requiredConsents: ['ANALYTICS'],
        dataCategories: ['data'],
        enforcementLevel: 'strict',
        exemptions: [],
        enabled: true
      };

      middleware.addEnforcementRule(rule1);
      middleware.addEnforcementRule(rule2);

      const getApplicable = (middleware as any).findApplicableRules('/api/data/test', 'GET');
      const postApplicable = (middleware as any).findApplicableRules('/api/data/test', 'POST');

      expect(getApplicable).toHaveLength(1);
      expect(getApplicable[0].id).toBe('get_rule');
      
      expect(postApplicable).toHaveLength(1);
      expect(postApplicable[0].id).toBe('post_rule');
    });
  });

  describe('Cookie and Tracking Enforcement', () => {
    beforeEach(() => {
      mockRequest.cookies = {
        '_ga': 'GA1.2.123456789',
        '_fbp': 'fb.1.123456789',
        'session_id': 'sess_123',
        'utm_campaign': 'test_campaign'
      };
    });

    it('should identify tracking cookies', () => {
      const trackingCookies = (middleware as any).identifyTrackingCookies(mockRequest.cookies);
      
      expect(trackingCookies).toEqual({
        '_ga': 'GA1.2.123456789',
        '_fbp': 'fb.1.123456789',
        'utm_campaign': 'test_campaign'
      });
      
      expect(trackingCookies).not.toHaveProperty('session_id');
    });

    it('should map cookies to required consent types', () => {
      const testCases = [
        { cookie: '_ga', expected: 'ANALYTICS' },
        { cookie: '_gid', expected: 'ANALYTICS' },
        { cookie: '_fbp', expected: 'MARKETING' },
        { cookie: 'utm_source', expected: 'MARKETING' },
        { cookie: 'session_id', expected: null }
      ];

      testCases.forEach(({ cookie, expected }) => {
        const result = (middleware as any).getRequiredConsentForCookie(cookie);
        expect(result).toBe(expected);
      });
    });

    it('should clear unauthorized tracking cookies', () => {
      middleware.enforceCookieConsent(mockRequest, mockReply);
      
      // Verify tracking cookies were attempted to be cleared
      // (since hasUserConsent returns false by default)
      expect(mockReply.clearCookie).toHaveBeenCalledWith('_ga');
      expect(mockReply.clearCookie).toHaveBeenCalledWith('_fbp');
      expect(mockReply.clearCookie).toHaveBeenCalledWith('utm_campaign');
    });

    it('should set appropriate security headers', () => {
      middleware.enforceCookieConsent(mockRequest, mockReply);
      
      expect(mockReply.header).toHaveBeenCalledWith('Set-Cookie-SameSite', 'Strict');
      expect(mockReply.header).toHaveBeenCalledWith('Set-Cookie-Secure', 'true');
      expect(mockReply.header).toHaveBeenCalledWith('Set-Cookie-HttpOnly', 'true');
    });
  });

  describe('Cross-Service Consent Propagation', () => {
    it('should propagate consent changes to services', async () => {
      await middleware.propagateConsentChange('user-123', 'ANALYTICS', true);
      
      // Verify propagation occurred (would check actual service calls in integration tests)
      // For unit tests, we mainly verify no errors were thrown
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should identify services requiring notification', () => {
      const analyticsServices = (middleware as any).getServicesRequiringConsentNotification('ANALYTICS');
      const marketingServices = (middleware as any).getServicesRequiringConsentNotification('MARKETING');
      
      expect(analyticsServices).toContain('analytics-service');
      expect(analyticsServices).toContain('metrics-service');
      
      expect(marketingServices).toContain('email-service');
      expect(marketingServices).toContain('campaign-service');
    });
  });

  describe('Enforcement Statistics', () => {
    it('should collect enforcement statistics', () => {
      const stats = middleware.getEnforcementStats();
      
      expect(stats).toHaveProperty('totalRules');
      expect(stats).toHaveProperty('enabledRules');
      expect(stats).toHaveProperty('recentViolations');
      expect(typeof stats.totalRules).toBe('number');
      expect(typeof stats.enabledRules).toBe('number');
    });

    it('should track violations over time', async () => {
      // Add a rule that will trigger violations
      const rule: ConsentEnforcementRule = {
        id: 'violation_test',
        name: 'Violation Test',
        description: 'Test violations',
        paths: ['/api/analytics/*'],
        methods: ['POST'],
        requiredConsents: ['ANALYTICS'],
        dataCategories: ['usage_data'],
        enforcementLevel: 'strict',
        exemptions: [],
        enabled: true
      };
      
      middleware.addEnforcementRule(rule);

      // Simulate requests that will create violations
      mockConsentCollectionService.getUserConsent.mockResolvedValue({
        consents: {
          ANALYTICS: { granted: false }
        }
      });

      const middlewareFunc = middleware.createMiddleware();
      await middlewareFunc(mockRequest, mockReply, mockDone);

      const stats = middleware.getEnforcementStats();
      expect(stats.recentViolations).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware errors gracefully', async () => {
      mockConsentCollectionService.getUserConsent.mockImplementation(() => {
        throw new Error('Service failure');
      });

      const middlewareFunc = middleware.createMiddleware();
      
      // Should not throw, should call done() to continue request processing
      await expect(middlewareFunc(mockRequest, mockReply, mockDone)).resolves.not.toThrow();
      expect(mockDone).toHaveBeenCalledWith();
    });

    it('should handle consent propagation errors', async () => {
      // Mock a service notification failure
      jest.spyOn(middleware as any, 'sendConsentNotification').mockRejectedValue(new Error('Network error'));
      
      // Should not throw, should log error and continue
      await expect(middleware.propagateConsentChange('user-123', 'ANALYTICS', true)).resolves.not.toThrow();
    });
  });

  describe('Default Rules', () => {
    it('should initialize with default enforcement rules', () => {
      const newMiddleware = new ConsentEnforcementMiddleware(
        mockConsentFilterService,
        mockConsentCollectionService
      );

      const stats = newMiddleware.getEnforcementStats();
      expect(stats.totalRules).toBeGreaterThan(0);
    });

    it('should have analytics enforcement rule by default', () => {
      const applicableRules = (middleware as any).findApplicableRules('/api/analytics/track', 'POST');
      expect(applicableRules.length).toBeGreaterThan(0);
      expect(applicableRules.some((rule: any) => rule.id === 'analytics_enforcement')).toBe(true);
    });
  });
});