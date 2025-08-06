/**
 * Sharing Schemas - Modular Structure
 * Splits the massive 12,800-line sharing-schemas.d.ts into organized modules
 */
// Re-export all schemas from their domain modules
export * from './core-schemas';
export * from './user-schemas';
export * from './security-schemas';
export * from './content-schemas';
export * from './analytics-schemas';
export * from './collaboration-schemas';
export * from './api-schemas';
export * from './event-schemas';
export * from './config-schemas';
// For backward compatibility, export commonly used schemas at top level
export { ShareAccessLevelSchema, SharePermissionSchema, ShareStatusSchema, ContentTypeSchema } from './core-schemas';
export { SharedContentSchema, CreateShareRequestSchema, CreateShareResponseSchema } from './api-schemas';
