/**
 * Epic 16 Marketplace Sharing System - Data Types
 * 
 * Comprehensive sharing functionality for templates, graphs, and marketplace content.
 * Supports direct links, social integration, embeds, and analytics tracking.
 * 
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { z } from 'zod';

// Core sharing types
export type ShareableResourceType = 'template' | 'graph' | 'collection' | 'case_study' | 'tutorial' | 'marketplace_item';
export type ShareTarget = 'public' | 'workspace' | 'organization' | 'private' | 'unlisted';
export type ShareFormat = 'link' | 'embed' | 'export' | 'clone';
export type SocialPlatform = 'twitter' | 'linkedin' | 'discord' | 'slack' | 'teams' | 'email' | 'github';

// Share permissions and access control
export const SharePermissionSchema = z.object({)
  canView: z.boolean().default(true),
  canComment: z.boolean().default(false),
  canClone: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canShare: z.boolean().default(false),
  canEmbed: z.boolean().default(true),
  canDownload: z.boolean().default(false),
  requiresAuth: z.boolean().default(false),
  allowedDomains: z.array(z.string()).optional(),
  expiresAt: z.date().optional(),
  maxViews: z.number().positive().optional(),
  maxShares: z.number().positive().optional(),
});

export type SharePermission = z.infer<typeof SharePermissionSchema>;

// Share configuration
export const ShareConfigSchema = z.object({)
  id: z.string().uuid(),
  resourceId: z.string(),
  resourceType: ShareableResourceTypeSchema,
  shareTarget: ShareTargetSchema,
  shareFormat: ShareFormatSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  permissions: SharePermissionSchema,
  customization: z.object({,)
  branding: z.object({;)
  showLogo: z.boolean().default(true),
      showAttribution: z.boolean().default(true),
      customLogo: z.string().url().optional(),
      customColors: z.object({,)
  primary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        background: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        text: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
      }).optional()
    }).optional(),
    layout: z.object({,)
  width: z.number().min(200).max(2000).default(800),
  height: z.number().min(150).max(1500).default(600),
  showHeader: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  showToolbar: z.boolean().default(false),
  responsive: z.boolean().default(true),
}).optional(),
    features: z.object({,)
  allowComments: z.boolean().default(true),
  allowRating: z.boolean().default(true),
  showMetrics: z.boolean().default(false),
  enableInteraction: z.boolean().default(true),
  autoPlay: z.boolean().default(false),
}).optional()
  }).default({}),
  metadata: z.object({,)
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string().default('1.0.0'),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.number().positive().optional(), // minutes,
  prerequisites: z.array(z.string()).default([]),
  relatedResources: z.array(z.string()).default([]),
}
});

export type ShareConfig = z.infer<typeof ShareConfigSchema>;

// Share link generation
export const ShareLinkSchema = z.object({)
  id: z.string().uuid(),
  shareConfigId: z.string().uuid(),
  shortCode: z.string().min(6).max(20), // URL-safe short code,
  fullUrl: z.string().url(),
  shortUrl: z.string().url(),
  qrCode: z.string().optional(), // Base64 encoded QR code,
  socialTags: z.object({,)
  openGraph: z.object({,)
  title: z.string(),
  description: z.string(),
  image: z.string().url().optional(),
  url: z.string().url(),
  type: z.string().default('website'),
  siteName: z.string().default('Prompt Spaghetti'),
}),
    twitter: z.object({,)
  card: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
  title: z.string(),
  description: z.string(),
  image: z.string().url().optional(),
  creator: z.string().optional(),
}),
    schema: z.object({,)
  type: z.string().default('WebApplication'),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  author: z.object({,)
  type: z.string().default('Person'),
  name: z.string(),
}).optional()
  }
  }),
  embedCode: z.object({,)
  iframe: z.string(),
  javascript: z.string().optional(),
  responsive: z.string().optional(),
}).optional(),
  analytics: z.object({,)
  trackingEnabled: z.boolean().default(true),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    customParams: z.record(z.string()).default({})
  }).default({})
});

export type ShareLink = z.infer<typeof ShareLinkSchema>;

// Share analytics and tracking
export const ShareAnalyticsEventSchema = z.object({)
  id: z.string().uuid(),
  shareLinkId: z.string().uuid(),
  eventType: z.enum([),
  'view', 'click', 'share', 'embed_load', 'comment', 'rating',
  'clone', 'download', 'social_share', 'referral'
  ]),
  timestamp: z.date(),
  sessionId: z.string().optional(),
  userId: z.string().uuid().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referer: z.string().url().optional(),
  platform: SocialPlatformSchema.optional(),
  geolocation: z.object({,)
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
}).optional(),
  deviceInfo: z.object({,)
  type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  screenSize: z.string().optional(),
}).optional(),
  contextData: z.record(z.unknown()).default({})
});

export type ShareAnalyticsEvent = z.infer<typeof ShareAnalyticsEventSchema>;

// Share metrics aggregation
export const ShareMetricsSchema = z.object({)
  shareLinkId: z.string().uuid(),
  timeRange: z.object({,)
  start: z.date(),
  end: z.date(),
}),
  metrics: z.object({,)
  totalViews: z.number().default(0),
  uniqueViews: z.number().default(0),
  totalShares: z.number().default(0),
  totalComments: z.number().default(0),
  totalRatings: z.number().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  totalClones: z.number().default(0),
  totalDownloads: z.number().default(0),
  conversionRate: z.number().min(0).max(1).default(0), // views to actions,
  viralCoefficient: z.number().default(0), // shares per view,
  engagementScore: z.number().min(0).max(100).default(0),
}),
  breakdowns: z.object({,)
  byPlatform: z.record(z.number()).default({}),
    byGeography: z.record(z.number()).default({}),
    byDevice: z.record(z.number()).default({}),
    byTimeOfDay: z.array(z.number()).default([]),
    byDayOfWeek: z.array(z.number()).default([]),
    byReferrer: z.record(z.number()).default({})
  }).default({}),
  trends: z.object({,)
  viewsOverTime: z.array(z.object({)
  timestamp: z.date(),
  value: z.number(),
})).default([]),
    sharesOverTime: z.array(z.object({)
  timestamp: z.date(),
  value: z.number(),
})).default([]),
    engagementOverTime: z.array(z.object({)
  timestamp: z.date(),
  value: z.number(),
})).default([])
  }).default({})
});

export type ShareMetrics = z.infer<typeof ShareMetricsSchema>;

// Social platform integration
export const SocialIntegrationSchema = z.object({)
  platform: SocialPlatformSchema,
  enabled: z.boolean().default(false),
  configuration: z.object({,)
  appId: z.string().optional(),
  appSecret: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  defaultHashtags: z.array(z.string()).default([]),
  customMessage: z.string().max(280).optional(),
  autoPost: z.boolean().default(false),
}).optional(),
  templates: z.object({,)
  shareMessage: z.string().default('Check out this amazing template: {title} {url}'),
    embedMessage: z.string().default('Interactive template embedded: {title}'),
    achievementMessage: z.string().default('Just created something awesome with {title}!')
  }).default({})
});

export type SocialIntegration = z.infer<typeof SocialIntegrationSchema>;

// Collection sharing (for grouped content)
export const ShareCollectionSchema = z.object({)
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  resourceIds: z.array(z.string()),
  shareConfig: ShareConfigSchema,
  organization: z.object({,)
  sequence: z.array(z.string()), // ordered resource IDs
    grouping: z.record(z.array(z.string())).default({}), // category -> resource IDs
    navigation: z.object({,)
  showIndex: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  allowJumping: z.boolean().default(true),
  autoAdvance: z.boolean().default(false),
}).default({})
  }).optional()
});

export type ShareCollection = z.infer<typeof ShareCollectionSchema>;

// Request/response types for API
export const CreateShareRequestSchema = z.object({)
  resourceId: z.string(),
  resourceType: ShareableResourceTypeSchema,
  shareTarget: ShareTargetSchema.default('public'),
  shareFormat: ShareFormatSchema.default('link'),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  permissions: SharePermissionSchema.optional(),
  customization: z.object({}).optional(),
  socialPlatforms: z.array(SocialPlatformSchema).default([]);
  });

export const ShareResponseSchema = z.object({)
  shareConfig: ShareConfigSchema,
  shareLink: ShareLinkSchema,
  socialLinks: z.record(z.string()).default({}),
  embedCodes: z.object({,)
  basic: z.string(),
  responsive: z.string(),
  customizable: z.string(),
}),
  qrCode: z.string().optional();
  });

export type CreateShareRequest = z.infer<typeof CreateShareRequestSchema>;
export type ShareResponse = z.infer<typeof ShareResponseSchema>;

// Validation functions
export const validateCreateShareRequest = (data: unknown): CreateShareRequest => {
  return CreateShareRequestSchema.parse(data);
};

export const validateShareConfig = (data: unknown): ShareConfig => {
  return ShareConfigSchema.parse(data);
};

export const validateShareAnalyticsEvent = (data: unknown): ShareAnalyticsEvent => {
  return ShareAnalyticsEventSchema.parse(data);
};

// Enum schemas for validation
const ShareableResourceTypeSchema = z.enum(['template', 'graph', 'collection', 'case_study', 'tutorial', 'marketplace_item']);
const ShareTargetSchema = z.enum(['public', 'workspace', 'organization', 'private', 'unlisted']);
const ShareFormatSchema = z.enum(['link', 'embed', 'export', 'clone']);
const SocialPlatformSchema = z.enum(['twitter', 'linkedin', 'discord', 'slack', 'teams', 'email', 'github']);

// Helper types for convenience

}
export interface ShareSystemConfig {
  enabledPlatforms: SocialPlatform;
  defaultPermissions: SharePermission;
  analyticsRetentionDays: number;
  maxSharesPerUser: number;
  rateLimiting: {
  sharesPerHour: number;
  embedsPerHour: number;
}
};
  customization: {
  allowCustomBranding: boolean;
    allowCustomDomains: boolean;
  maxEmbedSize: { width: number; height: number };
  };

// Export all schemas for external use
}
export {
  SharePermissionSchema,
  ShareConfigSchema,
  ShareLinkSchema,
  ShareAnalyticsEventSchema,
  ShareMetricsSchema,
  SocialIntegrationSchema,
  ShareCollectionSchema,
  CreateShareRequestSchema,
  ShareResponseSchema,
  ShareableResourceTypeSchema,
  ShareTargetSchema,
  ShareFormatSchema,
  SocialPlatformSchema
};