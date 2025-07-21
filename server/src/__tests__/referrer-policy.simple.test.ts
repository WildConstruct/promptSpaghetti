/**
 * Referrer Policy Service Tests - Epic 19 Implementation
 * Simplified test suite for referrer policy middleware and service
 */

import { 
  ReferrerPolicyService, 
  ReferrerPolicyValue 
} from '../middleware/referrer-policy';

describe('ReferrerPolicyService Basic Tests', () => {
  let service: ReferrerPolicyService;
  
  // Mock dependencies
  const mockDb = {
    query: jest.fn(),
    close: jest.fn()
  } as any;
  
  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    close: jest.fn()
  } as any;

  beforeEach(() => {
    service = new ReferrerPolicyService(mockDb, mockRedis, {
      defaultPolicy: 'strict-origin-when-cross-origin',
      maxViolationHistory: 1000,
      enableReporting: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.destroy();
  });

  describe('Service Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined();
    });

    it('should create service with custom configuration', () => {
      const customService = new ReferrerPolicyService(mockDb, mockRedis, {
        defaultPolicy: 'no-referrer',
        strictModeDefault: true,
        enableReporting: false
      });
      
      expect(customService).toBeDefined();
      customService.destroy();
    });
  });

  describe('Policy Configuration Management', () => {
    it('should create new policy configuration successfully', async () => {
      const configData = {
        name: 'Test Policy',
        description: 'Test policy configuration',
        enabled: true,
        priority: 10,
        policy: {
          default: 'no-referrer' as ReferrerPolicyValue
        },
        scope: {
          global: true
        },
        security: {
          strictMode: true,
          preventDowngrade: true,
          logViolations: true,
          blockUnsafeReferrers: true
        },
        reporting: {
          enabled: true,
          reportOnlyMode: false,
          sampleRate: 10,
          includeUserAgent: true
        },
        createdBy: 'test-user'
      };

      const result = await service.createPolicyConfig(configData);

      expect(result.success).toBe(true);
      expect(result.configId).toBeDefined();
      expect(result.message).toBe('Referrer policy configuration created successfully');
    });

    it('should reject invalid policy configuration', async () => {
      const invalidConfig = {
        name: '',
        policy: {
          default: 'invalid-policy' as ReferrerPolicyValue
        },
        createdBy: 'test-user'
      };

      const result = await service.createPolicyConfig(invalidConfig as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid policy configuration');
    });

    it('should update existing policy configuration', async () => {
      // First create a configuration
      const createResult = await service.createPolicyConfig({
        name: 'Test Policy',
        description: 'Test policy',
        enabled: true,
        priority: 5,
        policy: {
          default: 'origin' as ReferrerPolicyValue
        },
        scope: { global: true },
        security: {
          strictMode: false,
          preventDowngrade: false,
          logViolations: false,
          blockUnsafeReferrers: false
        },
        reporting: {
          enabled: false,
          reportOnlyMode: true,
          sampleRate: 0,
          includeUserAgent: false
        },
        createdBy: 'test-user'
      });

      expect(createResult.success).toBe(true);
      const configId = createResult.configId!;

      // Update the configuration
      const updateResult = await service.updatePolicyConfig(configId, {
        name: 'Updated Policy',
        policy: {
          default: 'strict-origin' as ReferrerPolicyValue
        },
        lastModifiedBy: 'admin-user'
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.message).toBe('Policy configuration updated successfully');
    });

    it('should fail to update non-existent policy configuration', async () => {
      const result = await service.updatePolicyConfig('non-existent-id', {
        name: 'Updated Policy',
        lastModifiedBy: 'admin-user'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Policy configuration not found');
    });
  });

  describe('Policy Validation', () => {
    const validPolicies: ReferrerPolicyValue[] = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ];

    validPolicies.forEach(policy => {
      it(`should accept valid policy value: ${policy}`, async () => {
        const result = await service.createPolicyConfig({
          name: `Test ${policy}`,
          description: 'Test configuration',
          enabled: true,
          priority: 1,
          policy: {
            default: policy
          },
          scope: { global: true },
          security: {
            strictMode: false,
            preventDowngrade: false,
            logViolations: false,
            blockUnsafeReferrers: false
          },
          reporting: {
            enabled: false,
            reportOnlyMode: true,
            sampleRate: 0,
            includeUserAgent: false
          },
          createdBy: 'test-user'
        });

        expect(result.success).toBe(true);
      });
    });

    it('should validate path-specific policies', async () => {
      const result = await service.createPolicyConfig({
        name: 'Path Specific Policy',
        description: 'Policy with path-specific rules',
        enabled: true,
        priority: 5,
        policy: {
          default: 'origin' as ReferrerPolicyValue,
          pathSpecific: [
            {
              path: '/admin',
              policy: 'no-referrer' as ReferrerPolicyValue,
              exactMatch: false
            },
            {
              path: '/api/sensitive',
              policy: 'strict-origin' as ReferrerPolicyValue,
              exactMatch: true
            }
          ]
        },
        scope: { global: true },
        security: {
          strictMode: true,
          preventDowngrade: true,
          logViolations: true,
          blockUnsafeReferrers: true
        },
        reporting: {
          enabled: true,
          reportOnlyMode: false,
          sampleRate: 100,
          includeUserAgent: true
        },
        createdBy: 'test-user'
      });

      expect(result.success).toBe(true);
    });

    it('should reject configuration with invalid path-specific policy', async () => {
      const result = await service.createPolicyConfig({
        name: 'Invalid Path Policy',
        description: 'Policy with invalid path-specific rules',
        enabled: true,
        priority: 5,
        policy: {
          default: 'origin' as ReferrerPolicyValue,
          pathSpecific: [
            {
              path: '',
              policy: 'invalid-policy' as ReferrerPolicyValue,
              exactMatch: false
            }
          ]
        },
        scope: { global: true },
        security: {
          strictMode: false,
          preventDowngrade: false,
          logViolations: false,
          blockUnsafeReferrers: false
        },
        reporting: {
          enabled: false,
          reportOnlyMode: true,
          sampleRate: 0,
          includeUserAgent: false
        },
        createdBy: 'test-user'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid policy configuration');
    });
  });

  describe('Statistics and Recommendations', () => {
    beforeEach(async () => {
      // Create some test violations for statistics
      const testViolations = [
        {
          id: 'v1',
          timestamp: new Date(),
          request: {
            url: 'https://example.com/admin',
            method: 'GET',
            userAgent: 'test-agent',
            ip: '192.168.1.1'
          },
          referrer: {
            header: 'https://malicious.com',
            expectedPolicy: 'no-referrer' as ReferrerPolicyValue,
            origin: 'https://malicious.com',
            isSecure: true
          },
          violation: {
            type: 'unsafe_referrer' as const,
            severity: 'high' as const,
            description: 'Unsafe referrer detected',
            blocked: true,
            action: 'block' as const
          },
          response: {
            status: 403,
            headers: {},
            redirected: false
          },
          metadata: {
            configId: 'default',
            environment: 'test',
            tags: ['security']
          }
        }
      ];

      // Inject test violations (accessing private property for testing)
      (service as any).violations = testViolations;
    });

    it('should generate policy statistics', async () => {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const statistics = await service.getStatistics(timeRange);

      expect(statistics).toBeDefined();
      expect(statistics.timeRange).toEqual(timeRange);
      expect(statistics.overview).toBeDefined();
      expect(statistics.policies).toBeDefined();
      expect(statistics.violations).toBeDefined();
      expect(statistics.compliance).toBeDefined();
    });

    it('should generate policy recommendations based on violations', async () => {
      const timeRange = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const recommendations = await service.getPolicyRecommendations(timeRange);

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('path');
        expect(rec).toHaveProperty('currentPolicy');
        expect(rec).toHaveProperty('recommendedPolicy');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('impact');
      });
    });

    it('should filter statistics by provided filters', async () => {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const filters = {
        severities: ['high'],
        configIds: ['default']
      };

      const statistics = await service.getStatistics(timeRange, filters);

      expect(statistics).toBeDefined();
      expect(statistics.violations.bySeverity).toHaveProperty('high');
    });
  });

  describe('Policy Matching Utilities', () => {
    it('should match paths correctly for exact match', () => {
      // Access private method for testing
      const matchesPath = (service as any).matchesPath.bind(service);
      
      expect(matchesPath('/admin/dashboard', '/admin/dashboard', true)).toBe(true);
      expect(matchesPath('/admin/users', '/admin/dashboard', true)).toBe(false);
    });

    it('should match paths correctly for partial match', () => {
      const matchesPath = (service as any).matchesPath.bind(service);
      
      expect(matchesPath('/admin/dashboard', '/admin', false)).toBe(true);
      expect(matchesPath('/api/admin/users', '/admin', false)).toBe(true);
      expect(matchesPath('/user/profile', '/admin', false)).toBe(false);
    });

    it('should match HTTP methods correctly', () => {
      const matchesMethod = (service as any).matchesMethod.bind(service);
      
      expect(matchesMethod('GET', 'GET')).toBe(true);
      expect(matchesMethod('POST', ['GET', 'POST'])).toBe(true);
      expect(matchesMethod('PUT', ['GET', 'POST'])).toBe(false);
    });

    it('should match domains with subdomain support', () => {
      const matchesDomain = (service as any).matchesDomain.bind(service);
      
      expect(matchesDomain('example.com', 'example.com', false)).toBe(true);
      expect(matchesDomain('api.example.com', 'example.com', true)).toBe(true);
      expect(matchesDomain('api.example.com', 'example.com', false)).toBe(false);
      expect(matchesDomain('different.com', 'example.com', true)).toBe(false);
    });
  });

  describe('Service Lifecycle', () => {
    it('should initialize with default configuration', () => {
      const newService = new ReferrerPolicyService(mockDb, mockRedis);
      
      expect(newService).toBeDefined();
      
      newService.destroy();
    });

    it('should clean up resources on destroy', () => {
      service.destroy();
      
      // Verify cleanup (accessing private properties for testing)
      expect((service as any).configs.size).toBe(0);
      expect((service as any).violations.length).toBe(0);
      expect((service as any).statistics.size).toBe(0);
    });
  });
});

describe('ReferrerPolicyService Integration', () => {
  let service: ReferrerPolicyService;
  
  const mockDb = {
    query: jest.fn(),
    close: jest.fn()
  } as any;
  
  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    close: jest.fn()
  } as any;

  beforeEach(() => {
    service = new ReferrerPolicyService(mockDb, mockRedis);
  });

  afterEach(() => {
    service.destroy();
    jest.clearAllMocks();
  });

  it('should handle complete policy lifecycle', async () => {
    // Create policy
    const createResult = await service.createPolicyConfig({
      name: 'Integration Test Policy',
      description: 'End-to-end test policy',
      enabled: true,
      priority: 10,
      policy: {
        default: 'strict-origin' as ReferrerPolicyValue,
        pathSpecific: [
          {
            path: '/secure',
            policy: 'no-referrer' as ReferrerPolicyValue,
            exactMatch: false
          }
        ]
      },
      scope: {
        global: true,
        sensitiveRoutes: ['/secure', '/admin']
      },
      security: {
        strictMode: true,
        preventDowngrade: true,
        logViolations: true,
        blockUnsafeReferrers: true,
        allowedOrigins: ['https://trusted.com'],
        blockedOrigins: ['https://malicious.com']
      },
      reporting: {
        enabled: true,
        reportOnlyMode: false,
        sampleRate: 50,
        includeUserAgent: true
      },
      createdBy: 'integration-test'
    });

    expect(createResult.success).toBe(true);
    const configId = createResult.configId!;

    // Update policy
    const updateResult = await service.updatePolicyConfig(configId, {
      description: 'Updated integration test policy',
      priority: 15,
      lastModifiedBy: 'integration-test-admin'
    });

    expect(updateResult.success).toBe(true);

    // Generate statistics
    const timeRange = {
      start: new Date(Date.now() - 60 * 60 * 1000),
      end: new Date()
    };

    const statistics = await service.getStatistics(timeRange);
    expect(statistics).toBeDefined();

    // Get recommendations
    const recommendations = await service.getPolicyRecommendations(timeRange);
    expect(Array.isArray(recommendations)).toBe(true);
  });
});