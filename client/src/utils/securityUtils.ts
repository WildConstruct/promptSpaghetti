const webCrypto: Crypto | undefined =
  typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  if (typeof document === 'undefined') {
    return input.replace(/</g, '').replace(/>/g, '');
  }

  const element = document.createElement('div');
  element.textContent = input;
  return element.textContent ?? '';
}

export function validateUrl(
  value: unknown,
  allowedOrigins: string[] = []
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();
  const allowedSchemes = ['https:', 'http:'];
  const base = typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'https://localhost';

  try {
    const url = new URL(trimmed, base);

    if (!allowedSchemes.includes(url.protocol)) {
      return null;
    }

    const originAllowed =
      url.origin === base || allowedOrigins.some(origin => origin === url.origin);

    if (!originAllowed && url.origin !== base) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export interface InputValidationOptions {
  maxLength?: number;
  allowedPattern?: RegExp;
  blockedPatterns?: RegExp[];
}

export interface InputValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

export function validateInput(
  value: unknown,
  options: InputValidationOptions = {}
): InputValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'string') {
    return { isValid: false, sanitized: '', errors: ['Value must be a string'] };
  }

  const sanitized = sanitizeText(value).trim();

  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Value exceeds maximum length of ${options.maxLength}`);
  }

  const blocked = options.blockedPatterns ?? defaultBlockedPatterns;
  if (blocked.some(pattern => pattern.test(sanitized))) {
    errors.push('Value contains dangerous content');
  }

  if (options.allowedPattern && !options.allowedPattern.test(sanitized)) {
    errors.push('Value contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    sanitized: options.maxLength ? sanitized.slice(0, options.maxLength) : sanitized,
    errors
  };
}

export function generateCSRFToken(): string {
  const bytes = new Uint8Array(32);

  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function validateCSRFToken(expected: unknown, received: unknown): boolean {
  if (typeof expected !== 'string' || typeof received !== 'string') {
    return false;
  }

  if (expected.length !== received.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < expected.length; index++) {
    mismatch |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }

  return mismatch === 0;
}

export const securityHeaders = {
  default(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    };
  },
  strictTransportSecurity(maxAgeSeconds = 15552000): string {
    return `max-age=${maxAgeSeconds}; includeSubDomains`;
  }
};

export const safeDom = {
  setText(element: HTMLElement, value: string): void {
    element.textContent = sanitizeText(value);
  },
  setAttribute(element: HTMLElement, name: string, value: string): void {
    if (/^on/i.test(name)) {
      throw new Error(`Unsafe attribute: ${name}`);
    }
    element.setAttribute(name, encodeHtml(sanitizeText(value)));
  }
};

const defaultBlockedPatterns: RegExp[] = [
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on\w+=/i,
  /<script/i,
  /eval\s*\(/i
];

export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slug: /^[a-z0-9-]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

export class ClientRateLimiter {
  private readonly allowance: number;
  private readonly interval: number;
  private readonly buckets = new Map<string, { timestamps: number[] }>();

  constructor(allowance: number, intervalMs: number) {
    this.allowance = allowance;
    this.interval = intervalMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? { timestamps: [] };
    const validTimestamps = bucket.timestamps.filter(timestamp => now - timestamp < this.interval);

    if (validTimestamps.length >= this.allowance) {
      this.buckets.set(key, { timestamps: validTimestamps });
      return false;
    }

    validTimestamps.push(now);
    this.buckets.set(key, { timestamps: validTimestamps });
    return true;
  }
}
const encodeHtml = (value: string): string => {
  if (typeof document === 'undefined') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
};
