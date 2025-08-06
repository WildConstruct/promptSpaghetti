/**
 * Core Sharing Schemas
 * Basic enums and fundamental types used across sharing functionality
 */
import { z } from 'zod';
// Access Level Enum
export const ShareAccessLevelSchema = z.enum(['public', 'restricted', 'private']);
// Permission Enum
export const SharePermissionSchema = z.enum(['view', 'comment', 'edit', 'admin']);
// Status Enum
export const ShareStatusSchema = z.enum(['active', 'expired', 'revoked', 'pending']);
// Content Type Enum
export const ContentTypeSchema = z.enum(['graph', 'template', 'bundle', 'dataset']);
// Base Share Info
export const BaseShareInfoSchema = z.object({
    id: z.string().uuid(),
    shareToken: z.string().min(16),
    createdAt: z.date(),
    updatedAt: z.date(),
    status: ShareStatusSchema
});
// Share Metadata
export const ShareMetadataSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional()
});
