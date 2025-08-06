/**
 * Security-related Sharing Schemas
 * Schemas for security configuration, access controls, and encryption
 */
import { z } from 'zod';
// Data Classification
export const DataClassificationSchema = z.enum(['public', 'internal', 'confidential', 'restricted']);
// Retention Policy
export const RetentionPolicySchema = z.object({
    maxShareDuration: z.number().int().positive(),
    autoExpire: z.boolean(),
    dataRetentionDays: z.number().int().positive()
});
// Access Controls
export const AccessControlsSchema = z.object({
    ipWhitelist: z.array(z.string().ip()).default([]),
    geoRestrictions: z.array(z.string()).default([]),
    requireAuthentication: z.boolean(),
    maxConcurrentUsers: z.number().int().positive().optional(),
    sessionTimeout: z.number().int().positive().optional(),
    requireMFA: z.boolean().default(false),
    allowedDomains: z.array(z.string()).default([])
});
// Security Configuration
export const ShareSecurityConfigSchema = z.object({
    dataClassification: DataClassificationSchema,
    encryptionRequired: z.boolean(),
    auditingEnabled: z.boolean(),
    retentionPolicy: RetentionPolicySchema,
    accessControls: AccessControlsSchema,
    watermarkEnabled: z.boolean().default(false),
    preventDownload: z.boolean().default(false),
    preventCopy: z.boolean().default(false)
});
// Encryption Settings
export const EncryptionSettingsSchema = z.object({
    algorithm: z.enum(['AES-256', 'RSA-2048']).default('AES-256'),
    keyRotationDays: z.number().int().positive().default(90),
    encryptAtRest: z.boolean().default(true),
    encryptInTransit: z.boolean().default(true)
});
// Audit Entry
export const AuditEntrySchema = z.object({
    id: z.string().uuid(),
    timestamp: z.date(),
    userId: z.string(),
    action: z.string(),
    resourceId: z.string(),
    resourceType: z.string(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    details: z.record(z.any()).optional()
});
