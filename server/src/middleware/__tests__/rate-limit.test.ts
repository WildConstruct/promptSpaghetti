/**
 * Rate Limiting Middleware Tests
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import Fastify, { FastifyInstance } from 'fastify';
// Mock the rate limit middleware components since the core modules may not be available
jest.mock('../rate-limit', () => {
  const actual = jest.requireActual('../rate-limit');
  return {
    ...actual,
    // We'll test the functionality by mocking the internals rather than the external deps
  };
});

// Mock Redis Service
class MockRedisService {
  private client = {
    get: jest.fn<unknown[], unknown>(),
    set: jest.fn<unknown[], unknown>(),
    incr: jest.fn<unknown[], unknown>(),
    del: jest.fn<unknown[], unknown>(),
    expire: jest.fn<unknown[], unknown>(),
    ttl: jest.fn<unknown[], unknown>(),
    ping: jest.fn<unknown[], unknown>().mockResolvedValue('PONG' as unknown as unknown),
    quit: jest.fn<unknown[], unknown>(};

  async get(key: string): Promise<string | null> {

    return this.client.get(key);


  async set(key: string, value: string): Promise<void> {

    await this.client.set(key, value);


  async setex(key: string, seconds: number, value: string): Promise<void> {

    await this.client.set(key, value, { EX: seconds });


  async exists(key: string): Promise<boolean> {

    const value = await this.client.get(key);
    return value !== null;


  async del(key: string): Promise<void> {

    await this.client.del(key);


  async incr(key: string): Promise<number> {

    return this.client.incr(key);


  async expire(key: string, seconds: number): Promise<void> {

    await this.client.expire(key, seconds);


  async ttl(key: string): Promise<number> {

    return this.client.ttl(key);


  async healthCheck(): Promise<boolean> {

    const pong = await this.client.ping();
    return pong === 'PONG';


  async close(): Promise<void> {

    await this.client.quit();


  getClient() {
    return this.client as any;



describe('RateLimitMiddleware', () => {
  let fastify: FastifyInstance;
  let mockRedis: MockRedisService;

  beforeEach(async () => {
    fastify = Fastify();
    mockRedis = new MockRedisService();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('Basic Functionality', () => {
    it('should allow requests under the limit', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 5

      });

      await fastify.register(createRateLimitPlugin({ redis: mockRedis as any }));
      
      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 5

      }, async (request, reply) => {
        return { success: true };
      });

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/test',
          headers: {
            'x-forwarded-for': '192.168.1.100'

        });

        expect(response.statusCode).toBe(200);
        expect(response.headers['ratelimit-remaining']).toBe(String(4 - i));

    });

    it('should block requests over the limit', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 3,
          standardHeaders: true

      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 3

      }, async (request, reply) => {
        return { success: true };
      });

      // Make 4 requests (over limit)
      for (let i = 0; i < 4; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/test',
          headers: {
            'x-forwarded-for': '192.168.1.100'

        });

        if (i < 3) {
          expect(response.statusCode).toBe(200);
 else {
          expect(response.statusCode).toBe(429);
          expect(response.json()).toHaveProperty('error', 'Too Many Requests');
          expect(response.headers['retry-after']).toBeDefined();


    });
  });

  describe('IP Extraction', () => {
    it('should extract IP from proxy headers when trustProxy is enabled', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        trustProxy: true,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 2

      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 2

      }, async (request, reply) => {
        return { success: true };
      });

      // Different IPs should have separate limits
      const response1 = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-forwarded-for': '192.168.1.100'

      });

      const response2 = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-forwarded-for': '192.168.1.101'

      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
      expect(response1.headers['ratelimit-remaining']).toBe('1');
      expect(response2.headers['ratelimit-remaining']).toBe('1');
    });

    it('should use request IP when proxy headers are not trusted', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        trustProxy: false,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 2

      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 2

      }, async (request, reply) => {
        return { success: true };
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-forwarded-for': '192.168.1.100'

        remoteAddress: '127.0.0.1'
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('User-based Rate Limiting', () => {
    it('should rate limit by user ID when available', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 5,
          keyGenerator: (context) => `user:${context.userId || 'anonymous'}`

      });

      // Add auth middleware to set userId
      fastify.addHook('preHandler', async (request, reply) => {
        request.userId = request.headers['x-user-id'] as string;
      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 2

      }, async (request, reply) => {
        return { success: true, userId: request.userId };
      });

      // User 1 makes 2 requests
      for (let i = 0; i < 2; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/test',
          headers: {
            'x-user-id': 'user1'

        });
        expect(response.statusCode).toBe(200);


      // User 1's 3rd request should be blocked
      const blockedResponse = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-user-id': 'user1'

      });
      expect(blockedResponse.statusCode).toBe(429);

      // User 2 should still be able to make requests
      const user2Response = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-user-id': 'user2'

      });
      expect(user2Response.statusCode).toBe(200);
    });
  });

  describe('Endpoint-specific Configuration', () => {
    it('should apply different limits to different endpoints', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any
      });

      await fastify.register(createRateLimitPlugin({ redis: mockRedis as any }));

      // Register endpoints with different limits
      middleware.registerEndpoints(fastify, [
        {
          path: '/api/auth/login',
          method: 'POST',
          config: {
            windowMs: 900000, // 15 minutes
            maxRequests: 3


        {
          path: '/api/data',
          method: 'GET',
          config: {
            windowMs: 60000, // 1 minute
            maxRequests: 100


      ]);

      fastify.post('/api/auth/login', async () => ({ success: true }));
      fastify.get('/api/data', async () => ({ data: [] }));

      // Test auth endpoint (strict limit)
      for (let i = 0; i < 4; i++) {
        const response = await fastify.inject({
          method: 'POST',
          url: '/api/auth/login',
          headers: { 'x-forwarded-for': '192.168.1.100' }
        });

        if (i < 3) {
          expect(response.statusCode).toBe(200);
 else {
          expect(response.statusCode).toBe(429);



      // Test data endpoint (lenient limit)
      for (let i = 0; i < 10; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/api/data',
          headers: { 'x-forwarded-for': '192.168.1.100' }
        });
        expect(response.statusCode).toBe(200);

    });
  });

  describe('Dynamic Configuration', () => {
    it('should apply dynamic rules based on conditions', async () => {
      const { RateLimitConfigurationManager } = jest.requireMock('../../../packages/core/security/RateLimitConfigurationManager');
      const configManager = new RateLimitConfigurationManager({
        environment: 'production'
      });

      // Add a dynamic rule for specific user agents
      configManager.addRule({
        id: 'bot-restriction',
        name: 'Bot Restriction',
        description: 'Strict limits for bots',
        enabled: true,
        priority: 1000,
        conditions: [
          {
            type: 'header',
            field: 'user-agent',
            operator: 'contains',
            value: 'bot'

        ],
        windowMs: 60000,
        maxRequests: 10,
        scope: 'IP' as any,
        action: { type: 'block' }
      });

      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        configManager,
        enableDynamicRules: true
      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 100 // Default limit

      }, async () => ({ success: true }));

      // Normal user agent - should have high limit
      const normalResponse = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.100'

      });
      expect(normalResponse.statusCode).toBe(200);
      expect(normalResponse.headers['ratelimit-limit']).toBe('100');

      // Bot user agent - should have low limit
      const botResponse = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'user-agent': 'Googlebot/2.1',
          'x-forwarded-for': '192.168.1.101'

      });
      expect(botResponse.statusCode).toBe(200);
      expect(botResponse.headers['ratelimit-limit']).toBe('10');
    });
  });

  describe('Error Handling', () => {
    it('should fail open when Redis is unavailable', async () => {
      const failingRedis = {
        ...mockRedis,
        incr: async () => { throw new Error('Redis connection failed'); },
        healthCheck: async () => false
      };

      const middleware = new RateLimitMiddleware({
        redis: failingRedis as any,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 1

      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 1

      }, async () => ({ success: true }));

      // Should allow requests even though Redis is down
      const response = await fastify.inject({
        method: 'GET',
        url: '/test'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should use custom error handler when provided', async () => {
      let errorHandlerCalled = false;
      
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        errorHandler: (error, request, reply) => {
          errorHandlerCalled = true;
          reply.code(503).send({ error: 'Service unavailable' });

      });

      // Force an error by providing invalid configuration
      const limiter = middleware.createEndpointMiddleware({
        windowMs: -1, // Invalid
        maxRequests: 0 // Invalid
      });

      fastify.get('/test', {
        preHandler: limiter
      }, async () => ({ success: true }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/test'
      });

      expect(errorHandlerCalled).toBe(true);
    });
  });

  describe('Request Filtering', () => {
    it('should skip rate limiting for failed requests when configured', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any,
        skipFailedRequests: true,
        defaultConfig: {
          windowMs: 60000,
          maxRequests: 2

      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 2

      }, async (request, reply) => {
        if ((request.query as any).fail) {
          reply.code(400).send({ error: 'Bad request' });
 else {
          return { success: true };

      });

      // Failed requests shouldn't count
      for (let i = 0; i < 5; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/test?fail=true',
          headers: { 'x-forwarded-for': '192.168.1.100' }
        });
        expect(response.statusCode).toBe(400);


      // Successful requests should still be limited
      const successResponse = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-forwarded-for': '192.168.1.100' }
      });
      expect(successResponse.statusCode).toBe(200);
      expect(successResponse.headers['ratelimit-remaining']).toBe('1');
    });
  });

  describe('Preset Configurations', () => {
    it('should use authentication preset for login endpoint', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any
      });

      fastify.post('/login', {
        preHandler: middleware.createEndpointMiddleware('authentication')
      }, async () => ({ token: 'abc123' }));

      const { RateLimitPresets } = jest.requireMock('../../../packages/core/security/RateLimiter');
      const preset = RateLimitPresets.authentication();
      
      // Should use authentication preset limits
      for (let i = 0; i < preset.maxRequests + 1; i++) {
        const response = await fastify.inject({
          method: 'POST',
          url: '/login',
          headers: { 'x-forwarded-for': '192.168.1.100' }
        });

        if (i < preset.maxRequests) {
          expect(response.statusCode).toBe(200);
 else {
          expect(response.statusCode).toBe(429);
          expect(response.json().message).toContain('authentication');


    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide rate limit statistics', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any
      });

      // Create some limiters
      middleware.createEndpointMiddleware({ windowMs: 60000, maxRequests: 10 });
      middleware.createEndpointMiddleware({ windowMs: 60000, maxRequests: 20 });

      const stats = await middleware.getStats();
      
      expect(stats).toHaveProperty('limiters', 2);
      expect(stats).toHaveProperty('redis');
      expect(stats.redis).toHaveProperty('available', true);
    });
  });

  describe('Headers', () => {
    it('should set standard rate limit headers', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any
      });

      fastify.get('/test', {
        preHandler: middleware.createEndpointMiddleware({
          windowMs: 60000,
          maxRequests: 100,
          standardHeaders: true,
          legacyHeaders: true

      }, async () => ({ success: true }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/test'
      });

      expect(response.headers).toHaveProperty('ratelimit-limit', '100');
      expect(response.headers).toHaveProperty('ratelimit-remaining', '99');
      expect(response.headers).toHaveProperty('ratelimit-reset');
      expect(response.headers).toHaveProperty('x-ratelimit-limit', '100');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining', '99');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on close', async () => {
      const middleware = new RateLimitMiddleware({
        redis: mockRedis as any
      });

      // Create some limiters
      middleware.createEndpointMiddleware({ windowMs: 60000, maxRequests: 10 });

      await middleware.cleanup();

      const stats = await middleware.getStats();
      expect(stats.limiters).toBe(0);
    });
  });
});

describe('RateLimitPlugin', () => {
  let fastify: FastifyInstance;
  let mockRedis: MockRedisService;

  beforeEach(async () => {
    fastify = Fastify();
    mockRedis = new MockRedisService();
  });

  afterEach(async () => {
    await fastify.close();
  });

  it('should register rate limit plugin successfully', async () => {
    await fastify.register(createRateLimitPlugin({
      redis: mockRedis as any,
      defaultConfig: {
        windowMs: 60000,
        maxRequests: 100

    }));

    expect(fastify.hasDecorator('rateLimit')).toBe(true);
    expect(fastify.hasDecorator('rateLimitEndpoint')).toBe(true);
  });

  it('should apply global rate limiting when default config is provided', async () => {
    await fastify.register(createRateLimitPlugin({
      redis: mockRedis as any,
      defaultConfig: {
        windowMs: 60000,
        maxRequests: 2

    }));

    fastify.get('/test', async () => ({ success: true }));

    // Should apply global limit
    for (let i = 0; i < 3; i++) {
      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
        headers: { 'x-forwarded-for': '192.168.1.100' }
      });

      if (i < 2) {
        expect(response.statusCode).toBe(200);
 else {
        expect(response.statusCode).toBe(429);


  });

  it('should skip health check endpoints', async () => {
    await fastify.register(createRateLimitPlugin({
      redis: mockRedis as any,
      defaultConfig: {
        windowMs: 60000,
        maxRequests: 1

    }));

    fastify.get('/health', async () => ({ status: 'ok' }));

    // Health checks should not be rate limited
    for (let i = 0; i < 10; i++) {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health'
      });
      expect(response.statusCode).toBe(200);

  });
});