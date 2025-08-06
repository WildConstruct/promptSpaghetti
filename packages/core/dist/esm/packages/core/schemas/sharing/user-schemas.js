/**
 * User-related Sharing Schemas
 * Schemas for users, collaborators, and viewer information
 */
import { z } from 'zod';
import { SharePermissionSchema } from './core-schemas';
// Basic User Info
export const UserInfoSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().url().optional()
});
// Collaborator Schema
export const CollaboratorSchema = UserInfoSchema.extend({
    role: SharePermissionSchema,
    addedAt: z.date(),
    permissions: z.array(z.string()),
    invitedBy: z.string(),
    acceptedAt: z.date().optional()
});
// Viewer Info for Analytics
export const ViewerInfoSchema = z.object({
    id: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    device: z.enum(['desktop', 'tablet', 'mobile']).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    location: z.object({
        country: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional()
    }).optional()
});
// User Preferences
export const UserSharingPreferencesSchema = z.object({
    defaultAccessLevel: SharePermissionSchema.default('view'),
    notificationSettings: z.object({
        onShare: z.boolean().default(true),
        onComment: z.boolean().default(true),
        onEdit: z.boolean().default(true),
        onDownload: z.boolean().default(false)
    }),
    privacySettings: z.object({
        hideEmail: z.boolean().default(false),
        anonymousViewing: z.boolean().default(false)
    })
});
