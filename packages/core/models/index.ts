/**
 * Models Export Index (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Central export point for all data models
 */

// User Segment Models
export * from './UserSegmentModel';
export * from './SegmentServiceModel';

// Re-export for convenience
export { default as UserSegmentModel } from './UserSegmentModel';
