/**
 * Core Utilities Index
 * 
 * Central exports for all utility modules in the core package.
 * This includes compression services, performance monitoring,
 * and other shared utilities.
 */

// Export compression utilities
export * from './CompressionService';
export { compressionService as defaultCompressionService } from './CompressionService';

// Re-export for convenience
export { CompressionService, compressionService } from './CompressionService';

// Export performance monitoring if available
export * from './PerformanceMonitor';

// Export any other utilities that may exist
// This will be the central point for all core utilities