/**
 * Security Utilities Test Suite
 * 
 * Comprehensive tests for security functions to ensure proper protection
 * against XSS, open redirects, and injection attacks.
 */
import {
  sanitizeText,
  validateUrl,
  validateInput,
  generateCSRFToken,
  validateCSRFToken,
  securityHeaders,
  safeDom,
  validationPatterns,
  ClientRateLimiter
 from '../securityUtils';

// Mock DOM for testing
const mockElement = {
  textContent: '',
  innerHTML: '',
  setAttribute: jest.fn<unknown, unknown>(),
};

// Mock document methods
const mockDocument = {
  createElement: jest.fn(() => mockElement),
};

// Replace global document in tests
Object.defineProperty(global, 'document', {)
  value: mockDocument,
  writable: true,
});
describe('Security Utilities', () => {
  beforeEach(() => {
  jest.clearAllMocks();
  mockElement.textContent = '';
  mockElement.innerHTML = '';
  // Mock window.location for URL validation tests
  Object.defineProperty(window, 'location', {)
  value: {,
  origin: 'https://example.com',
  href: 'https://example.com',
},
  writable: true;
  });
  });
  describe('sanitizeText', () => {
    it('should handle basic text input', () => {
      const result = sanitizeText('Hello World');
      expect(result).toBe('Hello World');
    });
    it('should sanitize HTML entities', () => {
      mockElement.innerHTML = '&lt;script&gt;alert()&lt;/script&gt;';
      const result = sanitizeText('<script>alert()</script>');
      expect(result).toBe('<script>alert()</script>');
    });
    it('should handle non-string input', () => {
      expect(sanitizeText(null as any)).toBe('');
      expect(sanitizeText(undefined as any)).toBe('');
      expect(sanitizeText(123 as any)).toBe('');
      expect(sanitizeText({} as any)).toBe('');
    });
    it('should preserve safe special characters', () => {
  mockElement.innerHTML = 'Price: $19.99 &amp; Free Shipping!';
  const result = sanitizeText('Price: $19.99 & Free Shipping!');
  expect(result).toBe('Price: $19.99 & Free Shipping!');
});
  });
  describe('validateUrl', () => {
  it('should allow same-origin URLs', () => {
  const result = validateUrl('/dashboard');
  expect(result).toBe('https://example.com/dashboard');
});
    it('should allow HTTPS URLs from allowed origins', () => {
  const allowedOrigins = ['https://trusted-site.com'];
  const result = validateUrl('https://trusted-site.com/api', allowedOrigins);
  expect(result).toBe('https://trusted-site.com/api');
});
    it('should block dangerous schemes', () => {
  const dangerousUrls = [
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'ftp://malicious.com'];
  dangerousUrls.forEach(url => {)
  expect(validateUrl(url)).toBeNull();
});
    });
    it('should block external URLs not in allowed origins', () => {
  const result = validateUrl('https://malicious-site.com/steal-data');
  expect(result).toBeNull();
});
    it('should handle invalid URLs', () => {
  const invalidUrls = [
  'not-a-url',
  'http://',
  'https://',
  '',
  null,
  undefined
  ];
  invalidUrls.forEach(url => {)
  expect(validateUrl(url as any)).toBeNull();
});
    });
    it('should handle relative URLs correctly', () => {
  const result = validateUrl('../admin/dashboard');
  expect(result).toBe('https://example.com/../admin/dashboard');
});
  });
  describe('validateInput', () => {
    it('should validate basic string input', () => {
      const result = validateInput('Hello World');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello World');
      expect(result.errors).toHaveLength(0);
    });
    it('should enforce maximum length', () => {
      const longText = 'a'.repeat(100);
      const result = validateInput(longText, { maxLength: 50 });
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toHaveLength(50);
      expect(result.errors[0]).toContain('exceeds maximum length');
    });
    it('should validate against allowed patterns', () => {
      const alphanumericPattern = /^[a-zA-Z0-9]+$/;
      const validResult = validateInput('abc123', { allowedPattern: alphanumericPattern });
      expect(validResult.isValid).toBe(true);
      const invalidResult = validateInput('abc-123!', { allowedPattern: alphanumericPattern });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors[0]).toContain('invalid characters');
    });
    it('should block dangerous patterns', () => {
  const dangerousInputs = [
  '<script>alert(1)</script>',
  'javascript:alert(1)',
  'vbscript:msgbox(1)',
  'onload=alert(1)',
  'onerror=alert(1)',
  'eval(maliciousCode)',
  'setTimeout(attack, 1000)'
  ];
  dangerousInputs.forEach(input => {)
  const result = validateInput(input);
  expect(result.isValid).toBe(false);
  expect(result.errors[0]).toContain('dangerous content');
});
    });
    it('should handle custom blocked patterns', () => {
  const customBlockedPattern = /admin|root|sudo/gi;
  const result = validateInput('admin user login', {)
  blockedPatterns: [customBlockedPattern],
});
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBe(' user login');
    });
    it('should handle non-string input', () => {
      const result = validateInput(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBe('');
      expect(result.errors[0]).toContain('must be a string');
    });
    it('should trim whitespace', () => {
      const result = validateInput('  hello world  ');
      expect(result.sanitized).toBe('hello world');
    });
  });
  describe('CSRF Token Management', () => {
    it('should generate valid CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).toHaveLength(64); // 32 bytes * 2 hex chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2); // Should be unique
      expect(/^[a-f0-9]+$/.test(token1)).toBe(true); // Should be hex
    });
    it('should validate CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
      expect(validateCSRFToken('', token)).toBe(false);
      expect(validateCSRFToken(token, '')).toBe(false);
    });
    it('should handle invalid CSRF token inputs', () => {
      expect(validateCSRFToken(null as any, 'token')).toBe(false);
      expect(validateCSRFToken('token', null as any)).toBe(false);
      expect(validateCSRFToken(undefined as any, 'token')).toBe(false);
    });
    it('should use constant-time comparison', () => {
      const token = 'a'.repeat(64);
      const shortToken = 'a'.repeat(32);
      // Different lengths should return false immediately
      expect(validateCSRFToken(token, shortToken)).toBe(false);
      // Same length but different content should still return false
      const differentToken = 'b'.repeat(64);
      expect(validateCSRFToken(token, differentToken)).toBe(false);
    });
  });
  describe('Security Headers', () => {
  // Mock crypto.getRandomValues for testing
  const mockCrypto = {
  getRandomValues: jest.fn((array) => {,
  for (let i = 0; i < array.length; i++) {
  array[i] = Math.floor(Math.random() * 256);
  return array;

    };
    beforeEach(() => {
  Object.defineProperty(global, 'crypto', {)
  value: mockCrypto,
  writable: true,
});
    });
    it('should generate valid nonces', () => {
      const nonce = securityHeaders.generateNonce();
      expect(nonce.length).toBeGreaterThanOrEqual(16);
      expect(securityHeaders.validateNonce(nonce)).toBe(true);
    });
    it('should validate nonce format', () => {
      expect(securityHeaders.validateNonce('YWJjZGVmZ2hpams=')).toBe(true);
      expect(securityHeaders.validateNonce('invalid-nonce!')).toBe(false);
      expect(securityHeaders.validateNonce('abc')).toBe(false); // Too short
      expect(securityHeaders.validateNonce('')).toBe(false);
    });
  });
  describe('Safe DOM Manipulation', () => {
  let mockElement: unknown;
  beforeEach(() => {
  mockElement = {
  textContent: '',
  setAttribute: jest.fn<unknown, unknown>(),
};
    });
    it('should safely set text content', () => {
      safeDom.setText(mockElement, 'Safe text content');
      expect(mockElement.textContent).toBe('Safe text content');
    });
    it('should block dangerous attributes', () => {
      const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
      dangerousAttrs.forEach(attr => {)
  safeDom.setAttribute(mockElement, attr, 'alert(1)');
        expect(mockElement.setAttribute).not.toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });
    it('should validate href attributes', () => {
  safeDom.setAttribute(mockElement, 'href', '/safe-url');
  expect(mockElement.setAttribute).toHaveBeenCalledWith('href', 'https://example.com/safe-url');
});
    it('should block dangerous href values', () => {
  safeDom.setAttribute(mockElement, 'href', 'javascript:alert(1)');
  expect(mockElement.setAttribute).not.toHaveBeenCalled();
});
    it('should sanitize safe attributes', () => {
      safeDom.setAttribute(mockElement, 'title', 'Safe title text');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('title', 'Safe title text');
    });
  });
  describe('Validation Patterns', () => {
    it('should validate email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@sub.domain.org'
      ];
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user..double.dot@domain.com'
      ];
      validEmails.forEach(email => {)
  expect(validationPatterns.email.test(email)).toBe(true);
      });
      invalidEmails.forEach(email => {)
  expect(validationPatterns.email.test(email)).toBe(false);
      });
    });
    it('should validate usernames', () => {
      const validUsernames = ['user123', 'test_user', 'admin-panel'];
      const invalidUsernames = ['ab', 'user@domain', 'very-long-username-that-exceeds-limit'];
      validUsernames.forEach(username => {)
  expect(validationPatterns.username.test(username)).toBe(true);
      });
      invalidUsernames.forEach(username => {)
  expect(validationPatterns.username.test(username)).toBe(false);
      });
    });
    it('should validate API keys', () => {
      const validApiKey = 'a'.repeat(32);
      const invalidApiKey = 'short';
      expect(validationPatterns.apiKey.test(validApiKey)).toBe(true);
      expect(validationPatterns.apiKey.test(invalidApiKey)).toBe(false);
    });
  });
  describe('ClientRateLimiter', () => {
  let rateLimiter: ClientRateLimiter;
  beforeEach(() => {
  rateLimiter = new ClientRateLimiter(3, 1000); // 3 requests per second
  jest.useFakeTimers();
});
    afterEach(() => {
      jest.useRealTimers();
    });
    it('should allow requests within limit', () => {
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
    });
    it('should block requests over limit', () => {
      // Use up the limit
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      // This should be blocked
      expect(rateLimiter.canMakeRequest('user1')).toBe(false);
    });
    it('should reset after time window', () => {
      // Use up the limit
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      expect(rateLimiter.canMakeRequest('user1')).toBe(false);
      // Advance time beyond window
      jest.advanceTimersByTime(1001);
      // Should allow requests again
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
    });
    it('should handle different users separately', () => {
      // Use up limit for user1
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user1');
      expect(rateLimiter.canMakeRequest('user1')).toBe(false);
      // user2 should still be allowed
      expect(rateLimiter.canMakeRequest('user2')).toBe(true);
    });
    it('should reset individual user limits', () => {
      rateLimiter.canMakeRequest('user1');
      rateLimiter.reset('user1');
      // Should have full limit again
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
    });
    it('should reset all limits', () => {
      rateLimiter.canMakeRequest('user1');
      rateLimiter.canMakeRequest('user2');
      rateLimiter.reset();
      // Both users should have full limits
      expect(rateLimiter.canMakeRequest('user1')).toBe(true);
      expect(rateLimiter.canMakeRequest('user2')).toBe(true);
    });
  });
});