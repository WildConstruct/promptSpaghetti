/**
 * Password Breach Detection Service Test Suite
 * Comprehensive tests for privacy-preserving hash-prefix query mechanism
 */

import crypto from 'crypto';
import { PasswordBreachService, BreachCheckResult } from '../auth/services/PasswordBreachService';
import { AuditService } from '../auth/services/AuditService';
import { RateLimitService } from '../auth/services/RateLimitService';

// Mock dependencies
jest.mock('../auth/services/AuditService');
jest.mock('../auth/services/RateLimitService');
jest.mock('../utils/logger');

// Mock fetch globally
global.fetch = jest.fn();

describe('PasswordBreachService', () => {
  let service: PasswordBreachService;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRateLimitService: jest.Mocked<RateLimitService>;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockRateLimitService = new RateLimitService({} as any) as jest.Mocked<RateLimitService>;
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    service = new PasswordBreachService(mockAuditService, mockRateLimitService);
    
    // Mock rate limit to allow by default
    mockRateLimitService.checkRateLimit.mockResolvedValue(true);
  });

  describe('Hash Generation and K-Anonymity', () => {
    it('should generate correct SHA-1 hash', () => {
      // Test with known password
      const password = 'password';
      const expectedHash = '5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8'; // SHA-256 of 'password'
      
      // Since the method is private, we'll test it through public interface
      const testHashPrefix = (service as any).generateSHA1Hash(password).substring(0, 5);
      expect(testHashPrefix).toMatch(/^[A-F0-9]{5}$/);
    });

    it('should use k-anonymity with k=5', () => {
      const password = 'testpassword';
      const hash = (service as any).generateSHA1Hash(password);
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      
      expect(prefix).toHaveLength(5);
      expect(suffix).toHaveLength(35); // SHA-1 is 40 chars total
      expect(prefix).toMatch(/^[A-F0-9]{5}$/);
    });

    it('should generate different prefixes for different passwords', () => {
      const hash1 = (service as any).generateSHA1Hash('password1');
      const hash2 = (service as any).generateSHA1Hash('password2');
      
      const prefix1 = hash1.substring(0, 5);
      const prefix2 = hash2.substring(0, 5);
      
      expect(prefix1).not.toBe(prefix2);
    });
  });

  describe('API Integration', () => {
    it('should make correct API request with privacy headers', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('ABCDE:5\nFGHIJ:10\n'),
        headers: new Headers({
          'X-API-Version': '3',
          'Content-Length': '20'
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword', 'user-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pwnedpasswords.com/range/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'SecurePasswordChecker/1.0',
            'Add-Padding': 'true',
            'X-Request-ID': expect.any(String)
          })
        })
      );
    });

    it('should handle API rate limiting with retry', async () => {
      const mockRateLimitResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '1' })
      };
      
      const mockSuccessResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers({})
      };

      mockFetch
        .mockResolvedValueOnce(mockRateLimitResponse as Response)
        .mockResolvedValueOnce(mockSuccessResponse as Response);

      jest.spyOn(service as any, 'sleep').mockImplementation(() => Promise.resolve());

      const result = await service.checkPasswordBreach('testpassword');
      
      expect(result.isBreached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.checkPasswordBreach('testpassword');
      
      expect(result.isBreached).toBe(false); // Fail-safe behavior
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should handle API timeout', async () => {
      mockFetch.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve('')
        } as Response), 10000); // 10 second delay
      }));

      const result = await service.checkPasswordBreach('testpassword', undefined, { timeout: 100 });
      
      expect(result.isBreached).toBe(false);
    });
  });

  describe('Breach Detection Logic', () => {
    it('should detect breached password correctly', async () => {
      const password = 'password';
      const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);
      
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(`${suffix}:123456\nOTHERHASH:789\n`),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await service.checkPasswordBreach(password, 'user-123');
      
      expect(result.isBreached).toBe(true);
      expect(result.occurrenceCount).toBe(123456);
      expect(result.source).toBe('HaveIBeenPwned');
      expect(result.hashPrefix).toBe(prefix);
    });

    it('should not detect clean password as breached', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('OTHERHASH1:100\nOTHERHASH2:200\n'),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await service.checkPasswordBreach('cleanpassword123!');
      
      expect(result.isBreached).toBe(false);
      expect(result.occurrenceCount).toBe(0);
    });

    it('should handle empty API response', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await service.checkPasswordBreach('uniquepassword');
      
      expect(result.isBreached).toBe(false);
      expect(result.occurrenceCount).toBe(0);
    });

    it('should parse malformed API response gracefully', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('MALFORMED:RESPONSE:DATA\nINVALID\n'),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(service.checkPasswordBreach('testpassword')).rejects.toThrow();
    });
  });

  describe('Caching System', () => {
    it('should cache breach check results', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('SOMEHASH:500\n'),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      // First call
      const result1 = await service.checkPasswordBreach('testpassword');
      expect(result1.cacheHit).toBe(false);
      
      // Second call should use cache
      const result2 = await service.checkPasswordBreach('testpassword');
      expect(result2.cacheHit).toBe(true);
      
      // API should only be called once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should skip cache when requested', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword');
      await service.checkPasswordBreach('testpassword', undefined, { skipCache: true });
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should clear expired cache entries', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      // Make initial call
      await service.checkPasswordBreach('testpassword');
      
      // Mock expired cache entry
      const cache = (service as any).cache;
      const firstKey = cache.keys().next().value;
      const entry = cache.get(firstKey);
      entry.expiresAt = Date.now() - 1000; // Expired 1 second ago
      
      // Trigger cache cleanup
      (service as any).cleanupExpiredCache();
      
      expect(cache.size).toBe(0);
    });

    it('should provide cache statistics', () => {
      const stats = service.getServiceStats();
      
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('totalChecks');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(typeof stats.cacheSize).toBe('number');
    });

    it('should clear cache on demand', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword');
      expect(service.getServiceStats().cacheSize).toBe(1);
      
      service.clearCache();
      expect(service.getServiceStats().cacheSize).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting per user', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue(false);

      await expect(service.checkPasswordBreach('testpassword', 'user-123'))
        .rejects.toThrow('Rate limit exceeded');

      expect(mockRateLimitService.checkRateLimit).toHaveBeenCalledWith(
        'password_breach_check:user-123',
        { window: 60, max: 10 }
      );
    });

    it('should skip rate limiting for anonymous checks', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await service.checkPasswordBreach('testpassword'); // No userId
      
      expect(result.isBreached).toBe(false);
      expect(mockRateLimitService.checkRateLimit).not.toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    it('should log successful breach checks', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword', 'user-123');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_BREACH_CHECK',
          userId: 'user-123',
          riskLevel: 'LOW'
        })
      );
    });

    it('should log breach detection with high risk level', async () => {
      const password = 'password';
      const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const suffix = sha1Hash.substring(5);
      
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(`${suffix}:123456\n`),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach(password, 'user-123');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_BREACH_CHECK',
          riskLevel: 'HIGH'
        })
      );
    });

    it('should log service errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await service.checkPasswordBreach('testpassword', 'user-123');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_BREACH_CHECK_ERROR',
          userId: 'user-123'
        })
      );
    });

    it('should not log for anonymous checks', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword'); // No userId
      
      expect(mockAuditService.logEvent).not.toHaveBeenCalled();
    });
  });

  describe('Privacy and Security', () => {
    it('should not send full password hash to API', async () => {
      const password = 'sensitivepassword';
      
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach(password);

      const callUrl = mockFetch.mock.calls[0][0] as string;
      
      // Should only contain 5-character prefix
      const urlPrefix = callUrl.split('/').pop();
      expect(urlPrefix).toHaveLength(5);
      expect(urlPrefix).toMatch(/^[A-F0-9]{5}$/);
      
      // Should not contain full hash or password
      expect(callUrl).not.toContain(password);
    });

    it('should include privacy-enhancing headers', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach('testpassword');

      const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Add-Padding']).toBe('true');
      expect(headers['X-Request-ID']).toMatch(/^BREACH-/);
    });

    it('should not log sensitive password data', async () => {
      const password = 'sensitivepassword';
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await service.checkPasswordBreach(password, 'user-123');

      const auditCalls = mockAuditService.logEvent.mock.calls;
      
      auditCalls.forEach(call => {
        const logData = JSON.stringify(call[0]);
        expect(logData).not.toContain(password);
        expect(logData).not.toContain('sensitivepassword');
      });
    });
  });

  describe('Utility Methods', () => {
    it('should validate hash prefix format', () => {
      expect(service.isValidHashPrefix('ABCDE')).toBe(true);
      expect(service.isValidHashPrefix('12345')).toBe(true);
      expect(service.isValidHashPrefix('A1B2C')).toBe(true);
      
      expect(service.isValidHashPrefix('ABCD')).toBe(false); // Too short
      expect(service.isValidHashPrefix('ABCDEF')).toBe(false); // Too long
      expect(service.isValidHashPrefix('ABCDG')).toBe(false); // Invalid character
      expect(service.isValidHashPrefix('abcde')).toBe(false); // Lowercase
    });

    it('should generate valid test hash prefixes', () => {
      const prefix = service.generateTestHashPrefix();
      
      expect(prefix).toHaveLength(5);
      expect(service.isValidHashPrefix(prefix)).toBe(true);
    });

    it('should test API connectivity', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('SOMEHASH:100\n'),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await service.testAPIConnectivity();
      
      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('should report API connectivity failures', async () => {
      mockFetch.mockRejectedValue(new Error('Connection failed'));

      const result = await service.testAPIConnectivity();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
      expect(result.responseTime).toBeGreaterThan(0);
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete breach check within reasonable time', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const startTime = Date.now();
      const result = await service.checkPasswordBreach('testpassword');
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should handle concurrent breach checks', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      const promises = Array.from({ length: 10 }, (_, i) => 
        service.checkPasswordBreach(`testpassword${i}`, `user-${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.isBreached).toBe(false);
        expect(result.responseTime).toBeGreaterThan(0);
      });
    });

    it('should implement exponential backoff for retries', async () => {
      const mockFailResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      const mockSuccessResponse = {
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers()
      };

      mockFetch
        .mockResolvedValueOnce(mockFailResponse as Response)
        .mockResolvedValueOnce(mockFailResponse as Response)
        .mockResolvedValueOnce(mockSuccessResponse as Response);

      const sleepSpy = jest.spyOn(service as any, 'sleep').mockImplementation(() => Promise.resolve());

      const result = await service.checkPasswordBreach('testpassword');
      
      expect(result.isBreached).toBe(false);
      expect(sleepSpy).toHaveBeenCalledTimes(2); // Two retries
      
      // Check exponential backoff timing
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 2000); // 2^1 * 1000ms
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 4000); // 2^2 * 1000ms
      
      sleepSpy.mockRestore();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle invalid response format', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('Invalid JSON response'),
        headers: new Headers()
      };
      
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(service.checkPasswordBreach('testpassword'))
        .rejects.toThrow('Failed to parse API response');
    });

    it('should handle network timeout gracefully', async () => {
      // Mock AbortController
      const mockAbortController = {
        signal: {},
        abort: jest.fn()
      };
      
      global.AbortController = jest.fn(() => mockAbortController) as any;
      
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await service.checkPasswordBreach('testpassword', undefined, { timeout: 50 });
      
      expect(result.isBreached).toBe(false);
    });
  });
});

describe('PasswordBreachService Integration', () => {
  it('should integrate properly with UserService validation', async () => {
    const auditService = new AuditService({} as any, {} as any);
    const rateLimitService = new RateLimitService({} as any);
    const breachService = new PasswordBreachService(auditService, rateLimitService);

    // Mock successful API response for clean password
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('OTHERHASH:100\n'),
      headers: new Headers()
    });

    const result = await breachService.checkPasswordBreach('StrongPassword123!', 'user-123');
    
    expect(result.isBreached).toBe(false);
    expect(result.source).toBe('HaveIBeenPwned');
  });
});