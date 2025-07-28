/**
 * Rate Limiter Tests
 * Task: T-1752989143997-184 - Create rate limiter implementation
 * Comprehensive test suite for RateLimiter and related components
 */
import { 
  RateLimiter, 
  MemoryRateLimitStore, 
  RateLimitKeyGenerator,
  RateLimitPresets,
  RateLimitUtils,
  RateLimitContext,
  RateLimitConfig
} from '../security/RateLimiter';
import { MockRedisClient, RedisRateLimitStore } from '../security/RedisRateLimitStore';
import { 
  RateLimitConfigurationManager,
  ConditionEvaluator,
  RateLimitConfigurationPresets,
  DynamicRateLimitRule,
  ConfigurationContext
} from '../security/RateLimitConfigurationManager';
describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockStore: MemoryRateLimitStore;
  beforeEach(() => {
    mockStore = new MemoryRateLimitStore();
    rateLimiter = new RateLimiter({)
      windowMs: 60000, // 1 minute
      maxRequests: 10,
      store: mockStore,
    });
  });
  afterEach(() => {
    mockStore.destroy();
  });
  describe('Basic Rate Limiting', () => {
    test('should allow requests within limit', async () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkLimit(context);
        expect(result.allowed).toBe(true);
        expect(result.info.remainingRequests).toBe(10 - i - 1);
      }
    });
    test('should block requests exceeding limit', async () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      // Make 10 allowed requests
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(context);
      }
      // 11th request should be blocked
      const result = await rateLimiter.checkLimit(context);
      expect(result.allowed).toBe(false);
      expect(result.info.exceeded).toBe(true);
      expect(result.info.remainingRequests).toBe(0);
      expect(result.error).toContain('Too many requests');
    });
    test('should reset after window expires', async () => {
      // Use shorter window for testing
      const shortLimiter = new RateLimiter({)
        windowMs: 100, // 100ms
        maxRequests: 2,
        store: mockStore,
      });
      const context: RateLimitContext = { ip: '192.168.1.1' };
      // Exhaust limit
      await shortLimiter.checkLimit(context);
      await shortLimiter.checkLimit(context);
      let result = await shortLimiter.checkLimit(context);
      expect(result.allowed).toBe(false);
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));
      // Should be allowed again
      result = await shortLimiter.checkLimit(context);
      expect(result.allowed).toBe(true);
    });
    test('should handle different IPs independently', async () => {
      const context1: RateLimitContext = { ip: '192.168.1.1' };
      const context2: RateLimitContext = { ip: '192.168.1.2' };
      // Exhaust limit for first IP
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(context1);
      }
      const result1 = await rateLimiter.checkLimit(context1);
      expect(result1.allowed).toBe(false);
      // Second IP should still be allowed
      const result2 = await rateLimiter.checkLimit(context2);
      expect(result2.allowed).toBe(true);
    });
  });
  describe('Key Generators', () => {
    test('should generate IP-based keys', () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      const key = RateLimitKeyGenerator.byIP(context);
      expect(key).toBe('ip:192.168.1.1');
    });
    test('should generate user-based keys', () => {
      const context: RateLimitContext = { userId: 'user123' };
      const key = RateLimitKeyGenerator.byUser(context);
      expect(key).toBe('user:user123');
    });
    test('should generate endpoint-based keys', () => {
      const context: RateLimitContext = { method: 'POST', path: '/api/login' };
      const key = RateLimitKeyGenerator.byEndpoint(context);
      expect(key).toBe('endpoint:POST:/api/login');
    });
    test('should generate composite keys', () => {
      const context: RateLimitContext = { 
        ip: '192.168.1.1', 
        userId: 'user123',
        method: 'POST',
        path: '/api/data',
      };
      const generator = RateLimitKeyGenerator.composite(['ip', 'user', 'endpoint']);
      const key = generator(context);
      expect(key).toBe('192.168.1.1:user123:POST:/api/data');
    });
    test('should handle missing context values', () => {
      const context: RateLimitContext = {};
      expect(RateLimitKeyGenerator.byIP(context)).toBe('ip:unknown');
      expect(RateLimitKeyGenerator.byUser(context)).toBe('user:anonymous');
    });
  });
  describe('Configuration', () => {
    test('should validate configuration', () => {
      expect(() => {
        new RateLimiter({)
          windowMs: 500, // Too short
          maxRequests: 10,
        });
      }).toThrow('Invalid rate limit configuration');
      expect(() => {
        new RateLimiter({)
          windowMs: 60000,
          maxRequests: 0 // Invalid,
        });
      }).toThrow('Invalid rate limit configuration');
    });
    test('should use default configuration', () => {
      const defaultLimiter = new RateLimiter();
      const config = defaultLimiter.getConfig();
      expect(config.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.maxRequests).toBe(100);
      expect(config.standardHeaders).toBe(true);
    });
    test('should update configuration', () => {
      rateLimiter.updateConfig({ maxRequests: 20 });
      const config = rateLimiter.getConfig();
      expect(config.maxRequests).toBe(20);
    });
  });
  describe('Headers', () => {
    test('should include standard rate limit headers', async () => {
      const limiter = new RateLimiter({)
        windowMs: 60000,
        maxRequests: 10,
        standardHeaders: true,
        store: mockStore,
      });
      const context: RateLimitContext = { ip: '192.168.1.1' };
      const result = await limiter.checkLimit(context);
      expect(result.headers['RateLimit-Limit']).toBe('10');
      expect(result.headers['RateLimit-Remaining']).toBe('9');
      expect(result.headers['RateLimit-Reset']).toBeDefined();
    });
    test('should include legacy headers when enabled', async () => {
      const limiter = new RateLimiter({)
        windowMs: 60000,
        maxRequests: 10,
        legacyHeaders: true,
        store: mockStore,
      });
      const context: RateLimitContext = { ip: '192.168.1.1' };
      const result = await limiter.checkLimit(context);
      expect(result.headers['X-RateLimit-Limit']).toBe('10');
      expect(result.headers['X-RateLimit-Remaining']).toBe('9');
      expect(result.headers['X-RateLimit-Reset']).toBeDefined();
    });
    test('should include Retry-After header when limit exceeded', async () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      // Exhaust limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(context);
      }
      const result = await rateLimiter.checkLimit(context);
      expect(result.headers['Retry-After']).toBeDefined();
      expect(parseInt(result.headers['Retry-After'])).toBeGreaterThan(0);
    });
  });
  describe('Reset Functionality', () => {
    test('should reset limits for specific context', async () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      // Exhaust limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(context);
      }
      let result = await rateLimiter.checkLimit(context);
      expect(result.allowed).toBe(false);
      // Reset limit
      await rateLimiter.resetLimit(context);
      // Should be allowed again
      result = await rateLimiter.checkLimit(context);
      expect(result.allowed).toBe(true);
    });
    test('should get current info without incrementing', async () => {
      const context: RateLimitContext = { ip: '192.168.1.1' };
      // Make some requests
      await rateLimiter.checkLimit(context);
      await rateLimiter.checkLimit(context);
      const info = await rateLimiter.getCurrentInfo(context);
      expect(info?.totalHits).toBe(2);
      expect(info?.remainingRequests).toBe(8);
      // Info request shouldn't increment counter
      const nextResult = await rateLimiter.checkLimit(context);
      expect(nextResult.info.totalHits).toBe(3);
    });
  });
  describe('Presets', () => {
    test('should create authentication preset', () => {
      const config = RateLimitPresets.authentication();
      expect(config.windowMs).toBe(15 * 60 * 1000);
      expect(config.maxRequests).toBe(5);
      expect(config.message).toContain('authentication attempts');
    });
    test('should create API preset', () => {
      const config = RateLimitPresets.api();
      expect(config.windowMs).toBe(15 * 60 * 1000);
      expect(config.maxRequests).toBe(1000);
    });
    test('should create from preset', () => {
      const limiter = RateLimitUtils.fromPreset('passwordReset', {)
        store: mockStore,
      });
      const config = limiter.getConfig();
      expect(config.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(config.maxRequests).toBe(3);
    });
  });
  describe('Error Handling', () => {
    test('should handle store errors gracefully', async () => {
      const failingStore = {
        async get() { throw new Error('Store error'); },
        async set() { throw new Error('Store error'); },
        async increment() { throw new Error('Store error'); },
        async reset() { throw new Error('Store error'); },
        async cleanup() { throw new Error('Store error'); }
      };
      const limiter = new RateLimiter({)
        windowMs: 60000,
        maxRequests: 10,
        store: failingStore as any,
      });
      const context: RateLimitContext = { ip: '192.168.1.1' };
      const result = await limiter.checkLimit(context);
      // Should fail open (allow request)
      expect(result.allowed).toBe(true);
      expect(result.error).toContain('store unavailable');
    });
  });
});
describe('MemoryRateLimitStore', () => {
  let store: MemoryRateLimitStore;
  beforeEach(() => {
    store = new MemoryRateLimitStore(100); // 100ms cleanup interval
  });
  afterEach(() => {
    store.destroy();
  });
  describe('Basic Operations', () => {
    test('should store and retrieve data', async () => {
      const data = { hits: 5, resetTime: Date.now() + 60000, windowStart: Date.now() };
      await store.set('test-key', data, 60000);
      const retrieved = await store.get('test-key');
      expect(retrieved).toEqual(data);
    });
    test('should return null for non-existent keys', async () => {
      const result = await store.get('non-existent');
      expect(result).toBeNull();
    });
    test('should increment counters', async () => {
      const result1 = await store.increment('counter', 60000);
      expect(result1.hits).toBe(1);
      const result2 = await store.increment('counter', 60000);
      expect(result2.hits).toBe(2);
    });
    test('should reset counters', async () => {
      await store.increment('counter', 60000);
      await store.reset('counter');
      const result = await store.get('counter');
      expect(result).toBeNull();
    });
    test('should handle expiration', async () => {
      const data = { hits: 5, resetTime: Date.now() + 50, windowStart: Date.now() };
      await store.set('expiring-key', data, 50);
      // Should exist initially
      let result = await store.get('expiring-key');
      expect(result).not.toBeNull();
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      // Should be expired
      result = await store.get('expiring-key');
      expect(result).toBeNull();
    });
    test('should cleanup expired entries', async () => {
      const data = { hits: 5, resetTime: Date.now() + 50, windowStart: Date.now() };
      await store.set('expiring-key', data, 50);
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      await store.cleanup();
      const stats = store.getStats();
      expect(stats.totalKeys).toBe(0);
    });
    test('should provide statistics', async () => {
      await store.increment('key1', 60000);
      await store.increment('key2', 60000);
      await store.increment('key1', 60000);
      const stats = store.getStats();
      expect(stats.totalKeys).toBe(2);
      expect(stats.totalHits).toBe(3);
    });
  });
});
describe('RedisRateLimitStore', () => {
  let mockRedis: MockRedisClient;
  let store: RedisRateLimitStore;
  beforeEach(() => {
    mockRedis = new MockRedisClient();
    store = new RedisRateLimitStore({)
      client: mockRedis,
      keyPrefix: 'test:',
      fallbackToMemory: true,
    });
  });
  afterEach(async () => {
    await store.close();
  });
  describe('Basic Operations', () => {
    test('should store and retrieve data with Redis', async () => {
      const data = { hits: 5, resetTime: Date.now() + 60000, windowStart: Date.now() };
      await store.set('test-key', data, 60000);
      const retrieved = await store.get('test-key');
      expect(retrieved).toEqual(expect.objectContaining({)
        hits: data.hits,
      }));
    });
    test('should increment with Redis', async () => {
      const result1 = await store.increment('counter', 60000);
      expect(result1.hits).toBe(1);
      const result2 = await store.increment('counter', 60000);
      expect(result2.hits).toBe(2);
    });
    test('should reset with Redis', async () => {
      await store.increment('counter', 60000);
      await store.reset('counter');
      const result = await store.get('counter');
      expect(result).toBeNull();
    });
    test('should get statistics', async () => {
      await store.increment('key1', 60000);
      await store.increment('key2', 60000);
      const stats = await store.getStats();
      expect(stats.redisAvailable).toBe(true);
      expect(stats.totalKeys).toBeGreaterThanOrEqual(0);
    });
  });
  describe('Fallback Behavior', () => {
    test('should fallback to memory when Redis fails', async () => {
      // Mock Redis failure
      const originalIncr = mockRedis.incr;
      mockRedis.incr = jest.fn().mockRejectedValue(new Error('Redis error'));
      const result = await store.increment('test-key', 60000);
      expect(result.hits).toBe(1);
      // Restore original method
      mockRedis.incr = originalIncr;
    });
  });
});
describe('RateLimitConfigurationManager', () => {
  let configManager: RateLimitConfigurationManager;
  let context: ConfigurationContext;
  beforeEach(() => {
    context = {
      environment: 'development',
      region: 'us-east-1',
    };
    configManager = new RateLimitConfigurationManager(context);
  });
  describe('Profile Management', () => {
    test('should load default profiles', () => {
      const profiles = configManager.getAllProfiles();
      expect(profiles.length).toBeGreaterThan(0);
      const devProfile = configManager.getProfile('development');
      expect(devProfile).toBeDefined();
      expect(devProfile?.name).toBe('Development Profile');
    });
    test('should set active profile', () => {
      const success = configManager.setActiveProfile('development');
      expect(success).toBe(true);
      const activeProfile = configManager.getActiveProfile();
      expect(activeProfile?.id).toBe('development');
    });
    test('should add custom profile', () => {
      const customProfile = RateLimitConfigurationPresets.createWebAppProfile();
      configManager.addProfile(customProfile);
      const retrieved = configManager.getProfile('web-app');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Web Application');
    });
  });
  describe('Rule Matching', () => {
    test('should find matching rules', () => {
      configManager.setActiveProfile('production');
      const requestContext = {
        ip: '192.168.1.1',
        method: 'POST',
        path: '/api/auth/login',
        headers: {}
      };
      const matchingRules = configManager.findMatchingRules(requestContext);
      expect(matchingRules.length).toBeGreaterThan(0);
      // Should match auth endpoint rule first (higher priority)
      expect(matchingRules[0].id).toBe('auth-strict');
    });
    test('should respect rule priority', () => {
      configManager.setActiveProfile('production');
      const requestContext = {
        ip: '192.168.1.1',
        method: 'GET',
        path: '/api/users',
        headers: {}
      };
      const matchingRules = configManager.findMatchingRules(requestContext);
      expect(matchingRules.length).toBeGreaterThan(0);
      // Rules should be sorted by priority (highest first)
      for (let i = 1; i < matchingRules.length; i++) {
        expect(matchingRules[i-1].priority).toBeGreaterThanOrEqual(matchingRules[i].priority);
      }
    });
    test('should create rate limit config from rule', () => {
      const rule: DynamicRateLimitRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test rule',
        enabled: true,
        priority: 100,
        conditions: [],
        windowMs: 60000,
        maxRequests: 10,
        scope: 'ip' as any,
        action: { type: 'block' }
      };
      const config = configManager.createRateLimitConfig(rule);
      expect(config.windowMs).toBe(60000);
      expect(config.maxRequests).toBe(10);
      expect(config.keyGenerator).toBeDefined();
    });
  });
  describe('Rule Management', () => {
    beforeEach(() => {
      configManager.setActiveProfile('development');
    });
    test('should add rule to active profile', () => {
      const newRule: DynamicRateLimitRule = {
        id: 'new-rule',
        name: 'New Rule',
        description: 'New test rule',
        enabled: true,
        priority: 200,
        conditions: [,
          { type: 'endpoint', operator: 'equals', value: '/test' }
        ],
        windowMs: 30000,
        maxRequests: 5,
        scope: 'ip' as any,
        action: { type: 'block' }
      };
      const success = configManager.addRule(newRule);
      expect(success).toBe(true);
      const activeProfile = configManager.getActiveProfile();
      const addedRule = activeProfile?.rules.find(r => r.id === 'new-rule');
      expect(addedRule).toBeDefined();
    });
    test('should update existing rule', () => {
      const activeProfile = configManager.getActiveProfile();
      const originalRule = activeProfile?.rules[0];
      if (originalRule) {
        const success = configManager.updateRule(originalRule.id, {)
          maxRequests: 20,
        });
        expect(success).toBe(true);
        const updatedProfile = configManager.getActiveProfile();
        const updatedRule = updatedProfile?.rules.find(r => r.id === originalRule.id);
        expect(updatedRule?.maxRequests).toBe(20);
      }
    });
    test('should remove rule', () => {
      const activeProfile = configManager.getActiveProfile();
      const ruleToRemove = activeProfile?.rules[0];
      if (ruleToRemove) {
        const success = configManager.removeRule(ruleToRemove.id);
        expect(success).toBe(true);
        const updatedProfile = configManager.getActiveProfile();
        const removedRule = updatedProfile?.rules.find(r => r.id === ruleToRemove.id);
        expect(removedRule).toBeUndefined();
      }
    });
  });
  describe('Import/Export', () => {
    test('should export configuration', () => {
      const exported = configManager.exportConfiguration();
      expect(exported).toBeDefined();
      const parsed = JSON.parse(exported);
      expect(parsed.context).toEqual(context);
      expect(parsed.profiles).toBeDefined();
    });
    test('should import configuration', () => {
      const customProfile = RateLimitConfigurationPresets.createAPIProfile();
      const config = {
        context,
        activeProfile: 'api-service',
        profiles: [customProfile],
      };
      configManager.importConfiguration(JSON.stringify(config));
      const imported = configManager.getProfile('api-service');
      expect(imported).toBeDefined();
      expect(imported?.name).toBe('API Service');
    });
  });
});
describe('ConditionEvaluator', () => {
  describe('IP Conditions', () => {
    test('should evaluate IP equality', () => {
      const condition = {
        type: 'ip' as const,
        operator: 'equals' as const,
        value: '192.168.1.1',
      };
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.1' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.2' })).toBe(false);
    });
    test('should evaluate IP contains', () => {
      const condition = {
        type: 'ip' as const,
        operator: 'contains' as const,
        value: '192.168',
      };
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.1' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { ip: '10.0.0.1' })).toBe(false);
    });
    test('should evaluate IP in list', () => {
      const condition = {
        type: 'ip' as const,
        operator: 'in' as const,
        values: ['192.168.1.1', '192.168.1.2', '10.0.0.1']
      };
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.1' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { ip: '172.16.0.1' })).toBe(false);
    });
  });
  describe('Endpoint Conditions', () => {
    test('should evaluate endpoint patterns', () => {
      const condition = {
        type: 'endpoint' as const,
        operator: 'startsWith' as const,
        value: '/api',
      };
      expect(ConditionEvaluator.evaluate(condition, { path: '/api/users' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { path: '/public/home' })).toBe(false);
    });
    test('should evaluate endpoint regex', () => {
      const condition = {
        type: 'endpoint' as const,
        operator: 'regex' as const,
        value: '/(login|register)',
      };
      expect(ConditionEvaluator.evaluate(condition, { path: '/auth/login' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { path: '/auth/register' })).toBe(true);
      expect(ConditionEvaluator.evaluate(condition, { path: '/auth/logout' })).toBe(false);
    });
  });
  describe('Header Conditions', () => {
    test('should evaluate header values', () => {
      const condition = {
        type: 'header' as const,
        operator: 'equals' as const,
        field: 'authorization',
        value: 'Bearer token123',
      };
      const context = {
        headers: { authorization: 'Bearer token123' }
      };
      expect(ConditionEvaluator.evaluate(condition, context)).toBe(true);
    });
    test('should handle missing headers', () => {
      const condition = {
        type: 'header' as const,
        operator: 'exists' as const,
        field: 'x-api-key',
      };
      expect(ConditionEvaluator.evaluate(condition, { headers: {} })).toBe(false);
      expect(ConditionEvaluator.evaluate(condition, { headers: { 'x-api-key': 'test' } })).toBe(true);
    });
  });
  describe('Negation', () => {
    test('should handle negated conditions', () => {
      const condition = {
        type: 'ip' as const,
        operator: 'equals' as const,
        value: '192.168.1.1',
        negate: true,
      };
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.1' })).toBe(false);
      expect(ConditionEvaluator.evaluate(condition, { ip: '192.168.1.2' })).toBe(true);
    });
  });
});
describe('Integration Tests', () => {
  test('should work with configuration manager and rate limiter', async () => {
    const context: ConfigurationContext = {
      environment: 'production',
    };
    const configManager = new RateLimitConfigurationManager(context);
    configManager.setActiveProfile('production');
    const requestContext = {
      ip: '192.168.1.1',
      method: 'POST',
      path: '/api/auth/login',
    };
    const matchingRules = configManager.findMatchingRules(requestContext);
    expect(matchingRules.length).toBeGreaterThan(0);
    const rule = matchingRules[0];
    const rateLimitConfig = configManager.createRateLimitConfig(rule);
    const store = new MemoryRateLimitStore();
    const rateLimiter = new RateLimiter({)
      ...rateLimitConfig,
      store
    });
    // Test rate limiting with the configured rule
    const result = await rateLimiter.checkLimit(requestContext);
    expect(result.allowed).toBe(true);
    expect(result.info.maxRequests).toBeLessThanOrEqual(rule.maxRequests);
    store.destroy();
  });
});
describe('Utility Functions', () => {
  test('should extract IP from headers', () => {
    const headers = {
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      'x-real-ip': '172.16.0.1'
    };
    const ip = RateLimitUtils.extractIP(headers);
    expect(ip).toBe('192.168.1.1'); // First IP from x-forwarded-for
  });
  test('should format rate limit info for logging', () => {
    const info = {
      totalHits: 5,
      totalHitsInWindow: 5,
      remainingRequests: 5,
      resetTime: new Date(),
      windowStart: new Date(),
      windowEnd: new Date(),
      exceeded: false,
    };
    const logString = RateLimitUtils.formatInfoForLogging(info, 'ip:192.168.1.1');
    expect(logString).toContain('Rate limit OK');
    expect(logString).toContain('hits=5');
    expect(logString).toContain('remaining=5');
  });
  test('should calculate optimal window size', () => {
    const highTrafficWindow = RateLimitUtils.calculateOptimalWindow(10000, 1000);
    const lowTrafficWindow = RateLimitUtils.calculateOptimalWindow(100, 10);
    expect(highTrafficWindow).toBeLessThan(lowTrafficWindow);
    expect(lowTrafficWindow).toBe(30 * 60 * 1000); // 30 minutes for low traffic
  });
});