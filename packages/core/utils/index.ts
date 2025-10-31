/**
 * Core Utilities Index
 *
 * Central exports for all utility modules in the core package.
 * This includes compression services, performance monitoring,
 * and other shared utilities.
 */

// Note: CompressionService and PerformanceMonitor are intentionally not re-exported
// here due to incomplete implementations that can break consumers during type-checking.
// If/when stabilized, they can be re-added.

// Only export stable utils that don't have import issues - using explicit exports to avoid conflicts
export * from './debug';
export {
  RateLimiter as RequestRateLimiter,
  authRateLimiter
} from './rateLimiter';
export {
  RateLimiter as SecurityRateLimiter,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  sanitizeInput,
  validateEmail
} from './securityUtils';
export * from './performanceUtils';
// Temporarily exclude stateRestoration due to duplicate export conflict
// export * from './stateRestoration.js';
