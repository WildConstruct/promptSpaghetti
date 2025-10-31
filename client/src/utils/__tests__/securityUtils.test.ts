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
} from '../securityUtils';

describe('sanitizeText', () => {
  it('removes script tags but preserves text', () => {
    const sanitized = sanitizeText('<script>alert("xss")</script>Hello');
    expect(sanitized).toContain('Hello');
    expect(sanitized).not.toContain('<script>');
  });

  it('returns empty string for non-text values', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(123)).toBe('');
  });
});

describe('validateUrl', () => {
  it('accepts relative and same-origin URLs', () => {
    expect(validateUrl('/dashboard')).toContain('/dashboard');
  });

  it('rejects dangerous schemes and origins', () => {
    expect(validateUrl('javascript:alert(1)')).toBeNull();
    expect(validateUrl('https://evil.example.com')).toBeNull();
  });

  it('allows whitelisted external origins', () => {
    const url = validateUrl('https://trusted.example.com', ['https://trusted.example.com']);
    expect(url).toBe('https://trusted.example.com/');
  });
});

describe('validateInput', () => {
  it('enforces maximum length and patterns', () => {
    const result = validateInput('a'.repeat(10), { maxLength: 5 });
    expect(result.isValid).toBe(false);
    expect(result.sanitized).toHaveLength(5);
  });

  it('rejects blocked patterns', () => {
    const result = validateInput('<script>alert(1)</script>');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('dangerous');
  });

  it('validates against allowed pattern', () => {
    const result = validateInput('abc123', { allowedPattern: /^[a-z0-9]+$/i });
    expect(result.isValid).toBe(true);
  });
});

describe('CSRF token helpers', () => {
  it('generates a random token and validates correctly', () => {
    const token = generateCSRFToken();
    expect(token).toHaveLength(64);
    expect(validateCSRFToken(token, token)).toBe(true);
    expect(validateCSRFToken(token, `${token}00`)).toBe(false);
  });
});

describe('securityHeaders', () => {
  it('returns default headers', () => {
    const headers = securityHeaders.default();
    expect(headers['Content-Security-Policy']).toBeDefined();
    expect(securityHeaders.strictTransportSecurity()).toContain('max-age');
  });
});

describe('safeDom', () => {
  it('sets text content safely', () => {
    const element = document.createElement('div');
    safeDom.setText(element, '<script>alert(1)</script>');
    expect(element.textContent).not.toContain('<script>');
  });

  it('sets attributes safely', () => {
    const element = document.createElement('div');
    safeDom.setAttribute(element, 'data-test', '<img>');
    expect(element.getAttribute('data-test')).toBe('&lt;img&gt;');
    expect(() => safeDom.setAttribute(element, 'onclick', 'alert()')).toThrow();
  });
});

describe('validationPatterns', () => {
  it('contains expected predefined patterns', () => {
    expect(validationPatterns.email.test('user@example.com')).toBe(true);
    expect(validationPatterns.slug.test('valid-slug')).toBe(true);
    expect(validationPatterns.uuid.test('12345678-1234-1234-1234-1234567890ab')).toBe(true);
  });
});

describe('ClientRateLimiter', () => {
  it('guards the number of calls per interval', () => {
    const limiter = new ClientRateLimiter(2, 1000);
    expect(limiter.canMakeRequest('user')).toBe(true);
    expect(limiter.canMakeRequest('user')).toBe(true);
    expect(limiter.canMakeRequest('user')).toBe(false);
  });
});
