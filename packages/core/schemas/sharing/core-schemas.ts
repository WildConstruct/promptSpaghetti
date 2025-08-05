/**
 * Core Sharing Schemas
 * Basic enums and fundamental types used across sharing functionality
 */
import { z } from 'zod';

// Access Level Enum
export const ShareAccessLevelSchema = z.enum(['public', 'restricted', 'private']);
export type ShareAccessLevel = z.infer<typeof ShareAccessLevelSchema>;

// Permission Enum
export const SharePermissionSchema = z.enum(['view', 'comment', 'edit', 'admin']);
export type SharePermission = z.infer<typeof SharePermissionSchema>;

// Status Enum
export const ShareStatusSchema = z.enum(['active', 'expired', 'revoked', 'pending']);
export type ShareStatus = z.infer<typeof ShareStatusSchema>;

// Content Type Enum
export const ContentTypeSchema = z.enum(['graph', 'template', 'bundle', 'dataset']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

// Base Share Info
export const BaseShareInfoSchema = z.object({
  id: z.string().uuid(),
  shareToken: z.string().min(16),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: ShareStatusSchema
});

export type BaseShareInfo = z.infer<typeof BaseShareInfoSchema>;

// Share Metadata
export const ShareMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional()
});

export type ShareMetadata = z.infer<typeof ShareMetadataSchema>;