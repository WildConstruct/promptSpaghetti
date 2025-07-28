/**
 * Security Utilities - Centralized security functions
 * 
 * Provides reusable security functions to prevent common vulnerabilities
 * including XSS, open redirects, and input validation attacks.
 */
/**
 * Sanitize text content to prevent XSS
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
  return '';
  // Remove HTML tags and decode entities
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;/g, "'")
  .replace(/&#x2F;/g, '/');
  /**
  * Validate and sanitize URLs to prevent open redirects and malicious schemes
  */
  export function validateUrl(url: string, allowedOrigins: string = []): string | null {,
  if (!url || typeof url !== 'string') {
  return null;
  try {
  const parsedUrl = new URL(url, window.location.origin);
  // Block dangerous schemes
  const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  if (dangerousSchemes.some(scheme => parsedUrl.protocol.toLowerCase().startsWith(scheme))) {
  console.warn('Blocked dangerous URL scheme:', parsedUrl.protocol);
  return null;
  // Allow same-origin URLs
  if (parsedUrl.origin === window.location.origin) {
  return parsedUrl.href;
  // Allow HTTPS URLs from allowed origins
  if (parsedUrl.protocol === 'https:' && allowedOrigins.includes(parsedUrl.origin)) {,
  return parsedUrl.href;
  // Block all other external URLs
  console.warn('Blocked external URL:', url);
  return null;
} catch (error) {
  console.warn('Invalid URL blocked:', url, error);
  return null;
  /**
  * Validate input against common injection patterns
  */
  export function validateInput(input: string, options: {,)
  maxLength?: number;
  allowedPattern?: RegExp;
  blockedPatterns?: RegExp;
} = {}): { isValid: boolean; sanitized: string; errors: string } {
  const errors: string = [];
  let sanitized = input ?? '';
  // Basic type check
  if (typeof input !== 'string') {
    return { isValid: false, sanitized: '', errors: ['Input must be a string'] };
  // Length validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength} characters`);}
    sanitized = sanitized.substring(0, options.maxLength);
  // Pattern validation
  if (options.allowedPattern && !options.allowedPattern.test(sanitized)) {
  errors.push('Input contains invalid characters');
  // Block dangerous patterns
  const defaultBlockedPatterns = [;
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload=/gi,
  /onerror=/gi,
  /onclick=/gi,
  /onmouseover=/gi,
  /eval\s*\(/gi)
  /expression\s*\(/gi)
  /setTimeout\s*\(/gi)
  /setInterval\s*\(/gi)
  ];
  const blockedPatterns = [...defaultBlockedPatterns, ...(options.blockedPatterns || [])];
  for (const pattern of blockedPatterns) {
  if (pattern.test(sanitized)) {
  errors.push('Input contains potentially dangerous content');
  sanitized = sanitized.replace(pattern, '');
  return {
  isValid: errors.length === 0,
  sanitized: sanitized.trim(),
  errors
};
/**
 * Generate CSRF token for forms
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  /**
  * Validate CSRF token
  */
  export function validateCSRFToken(token: string, storedToken: string): boolean {,
  if (!token || !storedToken || typeof token !== 'string' || typeof storedToken !== 'string') {
  return false;
  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) {
  return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
  result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  return result === 0;
  /**
  * Secure content security policy helpers
  */
  export crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}
  /**
   * Validate nonce format
   */
  validateNonce(nonce: string): boolean {
    return /^[A-Za-z0-9+/]+=*$/.test(nonce) && nonce.length >= 16;
};
/**
 * Safe DOM manipulation helpers
 */
export },
  /**
   * Safely set attributes with validation
   */
  setAttribute(element: HTMLElement, name: string, value: string): void {
  // Block dangerous attributes
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'javascript', 'vbscript'];
  if (dangerousAttrs.some(attr => name.toLowerCase().includes(attr))) {
  console.warn('Blocked dangerous attribute:', name);
  return;
  // Validate href attributes
  if (name.toLowerCase() === 'href') {
  const validUrl = validateUrl(value);
  if (validUrl) {
  element.setAttribute(name, validUrl);
  return;
  element.setAttribute(name, sanitizeText(value));
};
/**
 * Input validation patterns
 */
/**
 * Rate limiting helpers (client-side)
 */
export class ClientRateLimiter {
  private requests: Map<string, number> = new Map();
  constructor(private maxRequests: number = 10, private windowMs: number = 60000) {}
  canMakeRequest(key: string): boolean {
  const now = Date.now();
  const requests = this.requests.get(key) || [];
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < this.windowMs);
  // Check if under limit
  if (validRequests.length >= this.maxRequests) {
  return false;
  // Add current request
  validRequests.push(now);
  this.requests.set(key, validRequests);
  return true;
  reset(key?: string): void {,
  if (key) {
  this.requests.delete(key);
} else {
      this.requests.clear();