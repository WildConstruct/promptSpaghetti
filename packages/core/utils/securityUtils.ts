/**
 * Security utilities for Epic 1 inline editing
 * Provides input sanitization, validation, and XSS prevention
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * For use when HTML content needs to be preserved
 */
export function sanitizeHTML(dirty: string): string {
  // In production, use DOMPurify library
  // This is a basic implementation for demonstration
  const div = document.createElement('div');
  div.textContent = dirty;
  return div.innerHTML;
}

/**
 * Sanitize plain text input (no HTML allowed)
 * Escapes all HTML entities
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Validate and sanitize variable names to prevent prototype pollution
 */
export function sanitizeVariableName(name: string): string {
  // Remove any non-alphanumeric characters except underscore
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '');

  // Ensure it doesn't start with a number
  const valid = cleaned.replace(/^[0-9]+/, '');

  // Check against dangerous property names
  if (isDangerousPropertyName(valid)) {
    throw new Error(`Invalid variable name: ${name}`);
  }

  return valid;
}

/**
 * Check if a property name could lead to prototype pollution
 */
export function isDangerousPropertyName(name: string): boolean {
  const dangerous = [
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];

  return (
    dangerous.includes(name.toLowerCase()) ||
    name.includes('__proto__') ||
    name.includes('constructor')
  );
}

/**
 * Sanitize file paths to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  // Remove any directory traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\/+/g, '/')
    .replace(/^\//, '');
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Prevent javascript: and data: URLs
    if (url.match(/^(javascript|data|vbscript|file):/i)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Content Security Policy header generator
 */
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Consider removing unsafe-* in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

/**
 * Validate node data before execution
 */
export function validateNodeData<T>(
  data: T,
  schema: {
    type: string;
    required?: string[];
    properties?: Record<string, unknown>;
  }
): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        return false;
      }
    }
  }

  // Additional validation can be added here
  return true;
}

/**
 * Rate limiting helper to prevent abuse
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Input validation rules
 */
export const ValidationRules = {
  /**
   * Validate text length
   */
  maxLength: (max: number) => (value: string) => {
    return value.length <= max || `Maximum length is ${max} characters`;
  },

  /**
   * Validate minimum length
   */
  minLength: (min: number) => (value: string) => {
    return value.length >= min || `Minimum length is ${min} characters`;
  },

  /**
   * Validate against regex pattern
   */
  pattern: (regex: RegExp, message: string) => (value: string) => {
    return regex.test(value) || message;
  },

  /**
   * Validate numeric range
   */
  range: (min: number, max: number) => (value: number) => {
    return (
      (value >= min && value <= max) ||
      `Value must be between ${min} and ${max}`
    );
  },

  /**
   * Validate email format
   */
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email format';
  }
};

/**
 * Secure random number generator
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Generate secure random string
 */
export function generateSecureId(length: number = 16): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Generate secure token for authentication
 */
export function generateSecureToken(length: number = 32): string {
  return generateSecureId(length);
}

/**
 * Hash password using a simple implementation
 * Note: In production, use bcrypt or similar
 */
export function hashPassword(password: string): string {
  // This is a placeholder implementation
  // In production, use bcrypt.hash(password, saltRounds)
  return Buffer.from(password).toString('base64');
}

/**
 * Verify password against hash
 * Note: In production, use bcrypt or similar
 */
export function verifyPassword(password: string, hash: string): boolean {
  // This is a placeholder implementation
  // In production, use bcrypt.compare(password, hash)
  return Buffer.from(password).toString('base64') === hash;
}

/**
 * Sanitize input (alias for sanitizeText)
 */
export function sanitizeInput(input: string): string {
  return sanitizeText(input);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
