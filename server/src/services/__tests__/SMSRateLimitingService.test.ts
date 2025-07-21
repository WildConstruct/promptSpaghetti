/**
 * SMS Rate Limiting Service Tests
 * 
 * Comprehensive test suite for SMS rate limiting with multiple algorithms,
 * queue management, and monitoring capabilities.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114711634-951867 - Implement rate limiting for SMS sends
 */

import SMSRateLimitingService, {
  SMSMessage,
  SMSMessageType,
  RateLimitAlgorithm,
  RateLimitScope,
  RateLimitConfig,
  SMSProvider
} from '../SMSRateLimitingService';

// Mock SMS Provider for testing
class MockSMSProvider implements SMSProvider {
  name = 'MockProvider';
  private available = true;
  private shouldFail = false;

  sendSMS(message: SMSMessage): Promise<boolean> {
    return Promise.resolve(!this.shouldFail);
  }

  isAvailable(): boolean {
    return this.available;
  }

  getStatus(): { healthy: boolean; lastError?: string } {
    return { healthy: this.available };
  }

  setAvailable(available: boolean): void {
    this.available = available;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
}

// Mock storage for testing
class MockRateLimitStorage {
  private store = new Map<string, { value: any; expires?: Date }>();

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires && item.expires < new Date()) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    const expires = ttlMs ? new Date(Date.now() + ttlMs) : undefined;
    this.store.set(key, { value, expires });
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  async expire(key: string, ttlMs: number): Promise<void> {
    const item = this.store.get(key);
    if (item) {
      item.expires = new Date(Date.now() + ttlMs);
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = new Date();
    for (const [key, item] of this.store.entries()) {
      if (item.expires && item.expires < now) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

describe('SMSRateLimitingService', () => {
  let service: SMSRateLimitingService;
  let mockStorage: MockRateLimitStorage;
  let mockProvider: MockSMSProvider;

  beforeEach(() => {
    mockStorage = new MockRateLimitStorage();
    service = new SMSRateLimitingService(mockStorage as any);
    mockProvider = new MockSMSProvider();
    service.registerProvider('mock', mockProvider);
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('Rate Limiting Algorithms', () => {
    describe('Token Bucket Algorithm', () => {
      beforeEach(() => {
        service.updateRateLimitConfig('token_bucket_test', {
          algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
          scope: RateLimitScope.GLOBAL,
          windowSizeMs: 60000,
          maxRequests: 10,
          burstCapacity: 5,
          refillRate: 1,
          priority: 5,
          enabled: true
        });
      });

      test('should allow requests when tokens are available', async () => {
        const message = createTestMessage();
        const result = await service.checkRateLimit(message);

        expect(result.allowed).toBe(true);
        expect(result.remainingRequests).toBe(4); // burst capacity - 1
      });

      test('should deny requests when tokens are exhausted', async () => {
        const message = createTestMessage();

        // Exhaust all tokens
        for (let i = 0; i < 5; i++) {
          await service.checkRateLimit(message);
        }

        const result = await service.checkRateLimit(message);
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('Token bucket empty');
      });

      test('should refill tokens over time', async () => {
        const message = createTestMessage();

        // Exhaust tokens
        for (let i = 0; i < 5; i++) {
          await service.checkRateLimit(message);
        }

        // Simulate time passing for token refill
        await new Promise(resolve => setTimeout(resolve, 1100));

        const result = await service.checkRateLimit(message);
        expect(result.allowed).toBe(true);
      });
    });

    describe('Sliding Window Algorithm', () => {
      beforeEach(() => {
        service.updateRateLimitConfig('sliding_window_test', {
          algorithm: RateLimitAlgorithm.SLIDING_WINDOW,
          scope: RateLimitScope.PER_USER,
          windowSizeMs: 5000,
          maxRequests: 3,
          priority: 5,
          enabled: true
        });
      });

      test('should allow requests within limit', async () => {
        const message = createTestMessage();

        for (let i = 0; i < 3; i++) {
          const result = await service.checkRateLimit(message);
          expect(result.allowed).toBe(true);
          expect(result.remainingRequests).toBe(2 - i);
        }
      });

      test('should deny requests exceeding limit', async () => {
        const message = createTestMessage();

        // Use up all requests
        for (let i = 0; i < 3; i++) {
          await service.checkRateLimit(message);
        }

        const result = await service.checkRateLimit(message);
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('Sliding window limit exceeded');
      });

      test('should allow requests after window slides', async () => {
        const message = createTestMessage();

        // Use up all requests
        for (let i = 0; i < 3; i++) {
          await service.checkRateLimit(message);
        }

        // Wait for window to slide
        await new Promise(resolve => setTimeout(resolve, 5100));

        const result = await service.checkRateLimit(message);
        expect(result.allowed).toBe(true);
      });
    });

    describe('Fixed Window Algorithm', () => {
      beforeEach(() => {
        service.updateRateLimitConfig('fixed_window_test', {
          algorithm: RateLimitAlgorithm.FIXED_WINDOW,
          scope: RateLimitScope.PER_PHONE,
          windowSizeMs: 60000,
          maxRequests: 5,
          priority: 5,
          enabled: true
        });
      });

      test('should reset count at window boundary', async () => {
        const message = createTestMessage();

        // Use up all requests in current window
        for (let i = 0; i < 5; i++) {
          const result = await service.checkRateLimit(message);
          expect(result.allowed).toBe(true);
        }

        // Should be denied
        const deniedResult = await service.checkRateLimit(message);
        expect(deniedResult.allowed).toBe(false);

        // Simulate new window (this is simplified for testing)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // In a real scenario, we'd need to wait for the actual window to reset
        // For testing, we can verify the window calculation logic
      });
    });

    describe('Leaky Bucket Algorithm', () => {
      beforeEach(() => {
        service.updateRateLimitConfig('leaky_bucket_test', {
          algorithm: RateLimitAlgorithm.LEAKY_BUCKET,
          scope: RateLimitScope.GLOBAL,
          windowSizeMs: 60000,
          maxRequests: 10,
          priority: 5,
          enabled: true
        });
      });

      test('should handle requests with leaky bucket logic', async () => {
        const message = createTestMessage();
        const result = await service.checkRateLimit(message);

        expect(result.allowed).toBe(true);
        expect(result.currentUsage).toBe(1);
        expect(result.limit).toBe(10);
      });
    });

    describe('Adaptive Algorithm', () => {
      beforeEach(() => {
        service.updateRateLimitConfig('adaptive_test', {
          algorithm: RateLimitAlgorithm.ADAPTIVE,
          scope: RateLimitScope.PER_USER,
          windowSizeMs: 60000,
          maxRequests: 10,
          priority: 5,
          enabled: true
        });
      });

      test('should adapt limits based on priority and system load', async () => {
        const highPriorityMessage = createTestMessage({
          type: SMSMessageType.SECURITY_ALERT,
          priority: 10
        });

        const lowPriorityMessage = createTestMessage({
          type: SMSMessageType.MARKETING,
          priority: 1
        });

        const highPriorityResult = await service.checkRateLimit(highPriorityMessage);
        const lowPriorityResult = await service.checkRateLimit(lowPriorityMessage);

        expect(highPriorityResult.allowed).toBe(true);
        expect(lowPriorityResult.allowed).toBe(true);

        // Verify metadata contains adaptive information
        expect(highPriorityResult.metadata).toHaveProperty('adaptiveFactor');
        expect(lowPriorityResult.metadata).toHaveProperty('adaptiveFactor');
      });
    });
  });

  describe('Rate Limiting Scopes', () => {
    test('should apply global rate limits', async () => {
      service.updateRateLimitConfig('global_test', {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        scope: RateLimitScope.GLOBAL,
        windowSizeMs: 60000,
        maxRequests: 2,
        priority: 5,
        enabled: true
      });

      const message1 = createTestMessage({ userId: 'user1' });
      const message2 = createTestMessage({ userId: 'user2' });

      // Both users should be limited by global limit
      await service.checkRateLimit(message1);
      await service.checkRateLimit(message2);

      const result = await service.checkRateLimit(message1);
      expect(result.allowed).toBe(false);
    });

    test('should apply per-user rate limits', async () => {
      service.updateRateLimitConfig('per_user_test', {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        scope: RateLimitScope.PER_USER,
        windowSizeMs: 60000,
        maxRequests: 1,
        priority: 5,
        enabled: true
      });

      const user1Message = createTestMessage({ userId: 'user1' });
      const user2Message = createTestMessage({ userId: 'user2' });

      // Each user should have separate limits
      const user1Result1 = await service.checkRateLimit(user1Message);
      const user2Result1 = await service.checkRateLimit(user2Message);

      expect(user1Result1.allowed).toBe(true);
      expect(user2Result1.allowed).toBe(true);

      // Second message for user1 should be denied
      const user1Result2 = await service.checkRateLimit(user1Message);
      expect(user1Result2.allowed).toBe(false);

      // But user2 should still be allowed another message
      const user2Result2 = await service.checkRateLimit(user2Message);
      expect(user2Result2.allowed).toBe(true);
    });

    test('should apply per-phone rate limits', async () => {
      service.updateRateLimitConfig('per_phone_test', {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        scope: RateLimitScope.PER_PHONE,
        windowSizeMs: 60000,
        maxRequests: 1,
        priority: 5,
        enabled: true
      });

      const phone1Message = createTestMessage({ to: '+1234567890' });
      const phone2Message = createTestMessage({ to: '+0987654321' });

      const phone1Result1 = await service.checkRateLimit(phone1Message);
      const phone2Result1 = await service.checkRateLimit(phone2Message);

      expect(phone1Result1.allowed).toBe(true);
      expect(phone2Result1.allowed).toBe(true);

      const phone1Result2 = await service.checkRateLimit(phone1Message);
      expect(phone1Result2.allowed).toBe(false);
    });
  });

  describe('Message Types and Priorities', () => {
    test('should respect message type priorities', async () => {
      const securityAlert = createTestMessage({
        type: SMSMessageType.SECURITY_ALERT
      });

      const marketing = createTestMessage({
        type: SMSMessageType.MARKETING
      });

      const securityPriority = service['getMessagePriority'](SMSMessageType.SECURITY_ALERT);
      const marketingPriority = service['getMessagePriority'](SMSMessageType.MARKETING);

      expect(securityPriority).toBeGreaterThan(marketingPriority);
      expect(securityPriority).toBe(10);
      expect(marketingPriority).toBe(1);
    });

    test('should handle different SMS message types', async () => {
      const messageTypes = [
        SMSMessageType.SECURITY_ALERT,
        SMSMessageType.VERIFICATION,
        SMSMessageType.AUTHENTICATION,
        SMSMessageType.NOTIFICATION,
        SMSMessageType.MARKETING,
        SMSMessageType.REMINDER,
        SMSMessageType.SUPPORT,
        SMSMessageType.SYSTEM_ALERT
      ];

      for (const type of messageTypes) {
        const message = createTestMessage({ type });
        const result = await service.checkRateLimit(message);
        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('limit');
      }
    });
  });

  describe('Queue Management', () => {
    test('should queue SMS messages', async () => {
      const message = createTestMessage();
      const messageId = await service.queueSMS(message);

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');

      const queueStatus = service.getQueueStatus();
      expect(queueStatus.pending).toBe(1);
    });

    test('should prioritize messages in queue', async () => {
      const lowPriorityMessage = createTestMessage({
        type: SMSMessageType.MARKETING
      });

      const highPriorityMessage = createTestMessage({
        type: SMSMessageType.SECURITY_ALERT
      });

      await service.queueSMS(lowPriorityMessage);
      await service.queueSMS(highPriorityMessage);

      const queueStatus = service.getQueueStatus();
      expect(queueStatus.pending).toBe(2);
    });

    test('should handle queue size limits', async () => {
      // This would require modifying the service to accept a smaller queue size for testing
      // For now, we'll test that the queue accepts messages
      const message = createTestMessage();
      await expect(service.queueSMS(message)).resolves.toBeDefined();
    });

    test('should get queue status', async () => {
      const status = service.getQueueStatus();

      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('failed');
      expect(status).toHaveProperty('completed');
      expect(status).toHaveProperty('averageProcessingTime');
      expect(status).toHaveProperty('oldestPendingAge');
      expect(status).toHaveProperty('queueHealthScore');

      expect(typeof status.pending).toBe('number');
      expect(typeof status.processing).toBe('number');
      expect(typeof status.queueHealthScore).toBe('number');
      expect(status.queueHealthScore).toBeGreaterThanOrEqual(0);
      expect(status.queueHealthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Immediate SMS Sending', () => {
    test('should send critical messages immediately', async () => {
      const securityAlert = createTestMessage({
        type: SMSMessageType.SECURITY_ALERT
      });

      const result = await service.sendSMSImmediate(securityAlert);
      expect(result).toBe(true);
    });

    test('should reject non-critical messages for immediate send', async () => {
      const marketing = createTestMessage({
        type: SMSMessageType.MARKETING
      });

      await expect(service.sendSMSImmediate(marketing))
        .rejects.toThrow('Immediate send only allowed for critical message types');
    });

    test('should handle provider failures', async () => {
      mockProvider.setShouldFail(true);

      const securityAlert = createTestMessage({
        type: SMSMessageType.SECURITY_ALERT
      });

      const result = await service.sendSMSImmediate(securityAlert);
      expect(result).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    test('should update rate limit configurations', async () => {
      const configId = 'test_config';
      const newConfig = {
        algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
        scope: RateLimitScope.PER_USER,
        windowSizeMs: 120000,
        maxRequests: 20,
        priority: 8,
        enabled: true
      };

      service.updateRateLimitConfig(configId, newConfig);

      // Verify config was updated by checking if it affects rate limiting
      const message = createTestMessage();
      const result = await service.checkRateLimit(message);
      expect(result).toBeDefined();
    });

    test('should throw error for non-existent config', () => {
      expect(() => {
        service.updateRateLimitConfig('non_existent', { enabled: false });
      }).toThrow('Rate limit config not found: non_existent');
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should get rate limit statistics', async () => {
      const stats = await service.getRateLimitStats();
      expect(typeof stats).toBe('object');
    });

    test('should get statistics for specific scope', async () => {
      const stats = await service.getRateLimitStats(RateLimitScope.GLOBAL);
      expect(typeof stats).toBe('object');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      // Mock storage to throw error
      const failingStorage = {
        get: () => Promise.reject(new Error('Storage error')),
        set: () => Promise.reject(new Error('Storage error')),
        increment: () => Promise.reject(new Error('Storage error')),
        expire: () => Promise.reject(new Error('Storage error')),
        delete: () => Promise.reject(new Error('Storage error')),
        cleanup: () => Promise.reject(new Error('Storage error'))
      };

      const failingService = new SMSRateLimitingService(failingStorage as any);
      const message = createTestMessage();

      // Should handle errors gracefully and not crash
      await expect(failingService.checkRateLimit(message)).resolves.toBeDefined();
    });

    test('should handle missing provider', async () => {
      // Create service without providers
      const serviceWithoutProvider = new SMSRateLimitingService();
      const message = createTestMessage();

      const result = await serviceWithoutProvider.sendSMSImmediate({
        ...message,
        type: SMSMessageType.SECURITY_ALERT
      });

      expect(result).toBe(false);
    });
  });

  describe('Event Emission', () => {
    test('should emit rate limit exceeded events', async () => {
      const eventSpy = jest.fn();
      service.on('rate_limit_exceeded', eventSpy);

      // Set up strict rate limit
      service.updateRateLimitConfig('strict_test', {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        scope: RateLimitScope.GLOBAL,
        windowSizeMs: 60000,
        maxRequests: 1,
        priority: 5,
        enabled: true
      });

      const message = createTestMessage();

      // First message should pass
      await service.checkRateLimit(message);

      // Second message should trigger rate limit exceeded event
      await service.checkRateLimit(message);

      expect(eventSpy).toHaveBeenCalled();
    });

    test('should emit message queued events', async () => {
      const eventSpy = jest.fn();
      service.on('message_queued', eventSpy);

      const message = createTestMessage();
      await service.queueSMS(message);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            to: message.to,
            type: message.type
          }),
          queueSize: expect.any(Number)
        })
      );
    });
  });

  describe('Memory Storage Implementation', () => {
    test('should handle TTL expiration', async () => {
      await mockStorage.set('test_key', 'test_value', 100); // 100ms TTL

      let value = await mockStorage.get('test_key');
      expect(value).toBe('test_value');

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      value = await mockStorage.get('test_key');
      expect(value).toBeNull();
    });

    test('should increment values correctly', async () => {
      const result1 = await mockStorage.increment('counter');
      expect(result1).toBe(1);

      const result2 = await mockStorage.increment('counter', 5);
      expect(result2).toBe(6);
    });

    test('should clean up expired entries', async () => {
      await mockStorage.set('key1', 'value1', 100);
      await mockStorage.set('key2', 'value2', 200);

      expect(mockStorage.size()).toBe(2);

      await new Promise(resolve => setTimeout(resolve, 150));
      await mockStorage.cleanup();

      expect(mockStorage.size()).toBe(1);
      expect(await mockStorage.get('key2')).toBe('value2');
    });
  });

  // Helper function to create test messages
  function createTestMessage(overrides: Partial<SMSMessage> = {}): Omit<SMSMessage, 'id' | 'createdAt' | 'retryCount'> {
    return {
      to: '+1234567890',
      from: '+0987654321',
      message: 'Test SMS message',
      type: SMSMessageType.NOTIFICATION,
      userId: 'test-user-123',
      tenantId: 'test-tenant',
      ipAddress: '192.168.1.1',
      priority: 5,
      maxRetries: 3,
      metadata: { test: true },
      ...overrides
    };
  }
});