/**
 * Epic 16 Marketplace Sharing System - Data Types
 *
 * Comprehensive sharing functionality for templates, graphs, and marketplace content.
 * Supports direct links, social integration, embeds, and analytics tracking.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { z } from 'zod';
export type ShareableResourceType = 'template' | 'graph' | 'collection' | 'case_study' | 'tutorial' | 'marketplace_item';
export type ShareTarget = 'public' | 'workspace' | 'organization' | 'private' | 'unlisted';
export type ShareFormat = 'link' | 'embed' | 'export' | 'clone';
export type SocialPlatform = 'twitter' | 'linkedin' | 'discord' | 'slack' | 'teams' | 'email' | 'github';
export declare const SharePermissionSchema: z.ZodObject<{
    canView: z.ZodDefault<z.ZodBoolean>;
    canComment: z.ZodDefault<z.ZodBoolean>;
    canClone: z.ZodDefault<z.ZodBoolean>;
    canEdit: z.ZodDefault<z.ZodBoolean>;
    canShare: z.ZodDefault<z.ZodBoolean>;
    canEmbed: z.ZodDefault<z.ZodBoolean>;
    canDownload: z.ZodDefault<z.ZodBoolean>;
    requiresAuth: z.ZodDefault<z.ZodBoolean>;
    allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    maxViews: z.ZodOptional<z.ZodNumber>;
    maxShares: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    allowedDomains?: string[];
    canEdit?: boolean;
    expiresAt?: Date;
    canView?: boolean;
    canComment?: boolean;
    canClone?: boolean;
    canShare?: boolean;
    canEmbed?: boolean;
    canDownload?: boolean;
    requiresAuth?: boolean;
    maxViews?: number;
    maxShares?: number;
}, {
    allowedDomains?: string[];
    canEdit?: boolean;
    expiresAt?: Date;
    canView?: boolean;
    canComment?: boolean;
    canClone?: boolean;
    canShare?: boolean;
    canEmbed?: boolean;
    canDownload?: boolean;
    requiresAuth?: boolean;
    maxViews?: number;
    maxShares?: number;
}>;
export type SharePermission = z.infer<typeof SharePermissionSchema>;
export declare const ShareConfigSchema: z.ZodObject<{
    id: z.ZodString;
    resourceId: z.ZodString;
    resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
    shareTarget: z.ZodEnum<["public", "workspace", "organization", "private", "unlisted"]>;
    shareFormat: z.ZodEnum<["link", "embed", "export", "clone"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodObject<{
        canView: z.ZodDefault<z.ZodBoolean>;
        canComment: z.ZodDefault<z.ZodBoolean>;
        canClone: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canShare: z.ZodDefault<z.ZodBoolean>;
        canEmbed: z.ZodDefault<z.ZodBoolean>;
        canDownload: z.ZodDefault<z.ZodBoolean>;
        requiresAuth: z.ZodDefault<z.ZodBoolean>;
        allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        expiresAt: z.ZodOptional<z.ZodDate>;
        maxViews: z.ZodOptional<z.ZodNumber>;
        maxShares: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    }, {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    }>;
    customization: z.ZodDefault<z.ZodObject<{
        branding: z.ZodOptional<z.ZodObject<{
            showLogo: z.ZodDefault<z.ZodBoolean>;
            showAttribution: z.ZodDefault<z.ZodBoolean>;
            customLogo: z.ZodOptional<z.ZodString>;
            customColors: z.ZodOptional<z.ZodObject<{
                primary: z.ZodOptional<z.ZodString>;
                background: z.ZodOptional<z.ZodString>;
                text: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                text?: string;
                primary?: string;
                background?: string;
            }, {
                text?: string;
                primary?: string;
                background?: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        }, {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        }>>;
        layout: z.ZodOptional<z.ZodObject<{
            width: z.ZodDefault<z.ZodNumber>;
            height: z.ZodDefault<z.ZodNumber>;
            showHeader: z.ZodDefault<z.ZodBoolean>;
            showFooter: z.ZodDefault<z.ZodBoolean>;
            showToolbar: z.ZodDefault<z.ZodBoolean>;
            responsive: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        }, {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        }>>;
        features: z.ZodOptional<z.ZodObject<{
            allowComments: z.ZodDefault<z.ZodBoolean>;
            allowRating: z.ZodDefault<z.ZodBoolean>;
            showMetrics: z.ZodDefault<z.ZodBoolean>;
            enableInteraction: z.ZodDefault<z.ZodBoolean>;
            autoPlay: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        }, {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        layout?: {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        };
        branding?: {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        };
        features?: {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        };
    }, {
        layout?: {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        };
        branding?: {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        };
        features?: {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        };
    }>>;
    metadata: z.ZodObject<{
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodDefault<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
        estimatedTime: z.ZodOptional<z.ZodNumber>;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        relatedResources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        createdAt?: Date;
        updatedAt?: Date;
        category?: string;
        version?: string;
        estimatedTime?: number;
        createdBy?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        relatedResources?: string[];
    }, {
        createdAt?: Date;
        updatedAt?: Date;
        category?: string;
        version?: string;
        estimatedTime?: number;
        createdBy?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        relatedResources?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    description?: string;
    tags?: string[];
    metadata?: {
        createdAt?: Date;
        updatedAt?: Date;
        category?: string;
        version?: string;
        estimatedTime?: number;
        createdBy?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        relatedResources?: string[];
    };
    title?: string;
    permissions?: {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    thumbnailUrl?: string;
    shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
    shareFormat?: "link" | "embed" | "clone" | "export";
    customization?: {
        layout?: {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        };
        branding?: {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        };
        features?: {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        };
    };
}, {
    id?: string;
    description?: string;
    tags?: string[];
    metadata?: {
        createdAt?: Date;
        updatedAt?: Date;
        category?: string;
        version?: string;
        estimatedTime?: number;
        createdBy?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        relatedResources?: string[];
    };
    title?: string;
    permissions?: {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    thumbnailUrl?: string;
    shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
    shareFormat?: "link" | "embed" | "clone" | "export";
    customization?: {
        layout?: {
            width?: number;
            height?: number;
            showHeader?: boolean;
            showFooter?: boolean;
            showToolbar?: boolean;
            responsive?: boolean;
        };
        branding?: {
            showLogo?: boolean;
            showAttribution?: boolean;
            customLogo?: string;
            customColors?: {
                text?: string;
                primary?: string;
                background?: string;
            };
        };
        features?: {
            autoPlay?: boolean;
            allowComments?: boolean;
            showMetrics?: boolean;
            allowRating?: boolean;
            enableInteraction?: boolean;
        };
    };
}>;
export type ShareConfig = z.infer<typeof ShareConfigSchema>;
export declare const ShareLinkSchema: z.ZodObject<{
    id: z.ZodString;
    shareConfigId: z.ZodString;
    shortCode: z.ZodString;
    fullUrl: z.ZodString;
    shortUrl: z.ZodString;
    qrCode: z.ZodOptional<z.ZodString>;
    socialTags: z.ZodObject<{
        openGraph: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            image: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
            type: z.ZodDefault<z.ZodString>;
            siteName: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        }, {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        }>;
        twitter: z.ZodObject<{
            card: z.ZodDefault<z.ZodEnum<["summary", "summary_large_image"]>>;
            title: z.ZodString;
            description: z.ZodString;
            image: z.ZodOptional<z.ZodString>;
            creator: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        }, {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        }>;
        schema: z.ZodObject<{
            type: z.ZodDefault<z.ZodString>;
            name: z.ZodString;
            description: z.ZodString;
            url: z.ZodString;
            author: z.ZodOptional<z.ZodObject<{
                type: z.ZodDefault<z.ZodString>;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                type?: string;
            }, {
                name?: string;
                type?: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        }, {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        schema?: {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        };
        twitter?: {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        };
        openGraph?: {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        };
    }, {
        schema?: {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        };
        twitter?: {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        };
        openGraph?: {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        };
    }>;
    embedCode: z.ZodOptional<z.ZodObject<{
        iframe: z.ZodString;
        javascript: z.ZodOptional<z.ZodString>;
        responsive: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        iframe?: string;
        javascript?: string;
        responsive?: string;
    }, {
        iframe?: string;
        javascript?: string;
        responsive?: string;
    }>>;
    analytics: z.ZodDefault<z.ZodObject<{
        trackingEnabled: z.ZodDefault<z.ZodBoolean>;
        utmSource: z.ZodOptional<z.ZodString>;
        utmMedium: z.ZodOptional<z.ZodString>;
        utmCampaign: z.ZodOptional<z.ZodString>;
        customParams: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        trackingEnabled?: boolean;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        customParams?: Record<string, string>;
    }, {
        trackingEnabled?: boolean;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        customParams?: Record<string, string>;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    analytics?: {
        trackingEnabled?: boolean;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        customParams?: Record<string, string>;
    };
    shareConfigId?: string;
    shortCode?: string;
    fullUrl?: string;
    shortUrl?: string;
    qrCode?: string;
    socialTags?: {
        schema?: {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        };
        twitter?: {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        };
        openGraph?: {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        };
    };
    embedCode?: {
        iframe?: string;
        javascript?: string;
        responsive?: string;
    };
}, {
    id?: string;
    analytics?: {
        trackingEnabled?: boolean;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        customParams?: Record<string, string>;
    };
    shareConfigId?: string;
    shortCode?: string;
    fullUrl?: string;
    shortUrl?: string;
    qrCode?: string;
    socialTags?: {
        schema?: {
            name?: string;
            description?: string;
            type?: string;
            author?: {
                name?: string;
                type?: string;
            };
            url?: string;
        };
        twitter?: {
            description?: string;
            title?: string;
            image?: string;
            creator?: string;
            card?: "summary" | "summary_large_image";
        };
        openGraph?: {
            description?: string;
            type?: string;
            title?: string;
            image?: string;
            url?: string;
            siteName?: string;
        };
    };
    embedCode?: {
        iframe?: string;
        javascript?: string;
        responsive?: string;
    };
}>;
export type ShareLink = z.infer<typeof ShareLinkSchema>;
export declare const ShareAnalyticsEventSchema: z.ZodObject<{
    id: z.ZodString;
    shareLinkId: z.ZodString;
    eventType: z.ZodEnum<["view", "click", "share", "embed_load", "comment", "rating", "clone", "download", "social_share", "referral"]>;
    timestamp: z.ZodDate;
    sessionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    referer: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodEnum<["twitter", "linkedin", "discord", "slack", "teams", "email", "github"]>>;
    geolocation: z.ZodOptional<z.ZodObject<{
        country: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        region?: string;
        country?: string;
        city?: string;
        timezone?: string;
    }, {
        region?: string;
        country?: string;
        city?: string;
        timezone?: string;
    }>>;
    deviceInfo: z.ZodOptional<z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<["desktop", "mobile", "tablet"]>>;
        os: z.ZodOptional<z.ZodString>;
        browser: z.ZodOptional<z.ZodString>;
        screenSize: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "mobile" | "desktop" | "tablet";
        browser?: string;
        os?: string;
        screenSize?: string;
    }, {
        type?: "mobile" | "desktop" | "tablet";
        browser?: string;
        os?: string;
        screenSize?: string;
    }>>;
    contextData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    timestamp?: Date;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    eventType?: "view" | "rating" | "comment" | "download" | "click" | "clone" | "share" | "referral" | "embed_load" | "social_share";
    platform?: "email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord";
    geolocation?: {
        region?: string;
        country?: string;
        city?: string;
        timezone?: string;
    };
    shareLinkId?: string;
    referer?: string;
    deviceInfo?: {
        type?: "mobile" | "desktop" | "tablet";
        browser?: string;
        os?: string;
        screenSize?: string;
    };
    contextData?: Record<string, unknown>;
}, {
    id?: string;
    timestamp?: Date;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    eventType?: "view" | "rating" | "comment" | "download" | "click" | "clone" | "share" | "referral" | "embed_load" | "social_share";
    platform?: "email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord";
    geolocation?: {
        region?: string;
        country?: string;
        city?: string;
        timezone?: string;
    };
    shareLinkId?: string;
    referer?: string;
    deviceInfo?: {
        type?: "mobile" | "desktop" | "tablet";
        browser?: string;
        os?: string;
        screenSize?: string;
    };
    contextData?: Record<string, unknown>;
}>;
export type ShareAnalyticsEvent = z.infer<typeof ShareAnalyticsEventSchema>;
export declare const ShareMetricsSchema: z.ZodObject<{
    shareLinkId: z.ZodString;
    timeRange: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start?: Date;
        end?: Date;
    }, {
        start?: Date;
        end?: Date;
    }>;
    metrics: z.ZodObject<{
        totalViews: z.ZodDefault<z.ZodNumber>;
        uniqueViews: z.ZodDefault<z.ZodNumber>;
        totalShares: z.ZodDefault<z.ZodNumber>;
        totalComments: z.ZodDefault<z.ZodNumber>;
        totalRatings: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodDefault<z.ZodNumber>;
        totalClones: z.ZodDefault<z.ZodNumber>;
        totalDownloads: z.ZodDefault<z.ZodNumber>;
        conversionRate: z.ZodDefault<z.ZodNumber>;
        viralCoefficient: z.ZodDefault<z.ZodNumber>;
        engagementScore: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        conversionRate?: number;
        totalViews?: number;
        uniqueViews?: number;
        totalShares?: number;
        totalComments?: number;
        totalRatings?: number;
        averageRating?: number;
        totalClones?: number;
        totalDownloads?: number;
        viralCoefficient?: number;
        engagementScore?: number;
    }, {
        conversionRate?: number;
        totalViews?: number;
        uniqueViews?: number;
        totalShares?: number;
        totalComments?: number;
        totalRatings?: number;
        averageRating?: number;
        totalClones?: number;
        totalDownloads?: number;
        viralCoefficient?: number;
        engagementScore?: number;
    }>;
    breakdowns: z.ZodDefault<z.ZodObject<{
        byPlatform: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        byGeography: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        byDevice: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        byTimeOfDay: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        byDayOfWeek: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        byReferrer: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        byPlatform?: Record<string, number>;
        byGeography?: Record<string, number>;
        byDevice?: Record<string, number>;
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byReferrer?: Record<string, number>;
    }, {
        byPlatform?: Record<string, number>;
        byGeography?: Record<string, number>;
        byDevice?: Record<string, number>;
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byReferrer?: Record<string, number>;
    }>>;
    trends: z.ZodDefault<z.ZodObject<{
        viewsOverTime: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value?: number;
            timestamp?: Date;
        }, {
            value?: number;
            timestamp?: Date;
        }>, "many">>;
        sharesOverTime: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value?: number;
            timestamp?: Date;
        }, {
            value?: number;
            timestamp?: Date;
        }>, "many">>;
        engagementOverTime: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value?: number;
            timestamp?: Date;
        }, {
            value?: number;
            timestamp?: Date;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        viewsOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        sharesOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        engagementOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
    }, {
        viewsOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        sharesOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        engagementOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    metrics?: {
        conversionRate?: number;
        totalViews?: number;
        uniqueViews?: number;
        totalShares?: number;
        totalComments?: number;
        totalRatings?: number;
        averageRating?: number;
        totalClones?: number;
        totalDownloads?: number;
        viralCoefficient?: number;
        engagementScore?: number;
    };
    trends?: {
        viewsOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        sharesOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        engagementOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
    };
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    breakdowns?: {
        byPlatform?: Record<string, number>;
        byGeography?: Record<string, number>;
        byDevice?: Record<string, number>;
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byReferrer?: Record<string, number>;
    };
    shareLinkId?: string;
}, {
    metrics?: {
        conversionRate?: number;
        totalViews?: number;
        uniqueViews?: number;
        totalShares?: number;
        totalComments?: number;
        totalRatings?: number;
        averageRating?: number;
        totalClones?: number;
        totalDownloads?: number;
        viralCoefficient?: number;
        engagementScore?: number;
    };
    trends?: {
        viewsOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        sharesOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
        engagementOverTime?: {
            value?: number;
            timestamp?: Date;
        }[];
    };
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    breakdowns?: {
        byPlatform?: Record<string, number>;
        byGeography?: Record<string, number>;
        byDevice?: Record<string, number>;
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byReferrer?: Record<string, number>;
    };
    shareLinkId?: string;
}>;
export type ShareMetrics = z.infer<typeof ShareMetricsSchema>;
export declare const SocialIntegrationSchema: z.ZodObject<{
    platform: z.ZodEnum<["twitter", "linkedin", "discord", "slack", "teams", "email", "github"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    configuration: z.ZodOptional<z.ZodObject<{
        appId: z.ZodOptional<z.ZodString>;
        appSecret: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        defaultHashtags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        customMessage: z.ZodOptional<z.ZodString>;
        autoPost: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        webhookUrl?: string;
        appId?: string;
        appSecret?: string;
        defaultHashtags?: string[];
        customMessage?: string;
        autoPost?: boolean;
    }, {
        webhookUrl?: string;
        appId?: string;
        appSecret?: string;
        defaultHashtags?: string[];
        customMessage?: string;
        autoPost?: boolean;
    }>>;
    templates: z.ZodDefault<z.ZodObject<{
        shareMessage: z.ZodDefault<z.ZodString>;
        embedMessage: z.ZodDefault<z.ZodString>;
        achievementMessage: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        shareMessage?: string;
        embedMessage?: string;
        achievementMessage?: string;
    }, {
        shareMessage?: string;
        embedMessage?: string;
        achievementMessage?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    configuration?: {
        webhookUrl?: string;
        appId?: string;
        appSecret?: string;
        defaultHashtags?: string[];
        customMessage?: string;
        autoPost?: boolean;
    };
    enabled?: boolean;
    templates?: {
        shareMessage?: string;
        embedMessage?: string;
        achievementMessage?: string;
    };
    platform?: "email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord";
}, {
    configuration?: {
        webhookUrl?: string;
        appId?: string;
        appSecret?: string;
        defaultHashtags?: string[];
        customMessage?: string;
        autoPost?: boolean;
    };
    enabled?: boolean;
    templates?: {
        shareMessage?: string;
        embedMessage?: string;
        achievementMessage?: string;
    };
    platform?: "email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord";
}>;
export type SocialIntegration = z.infer<typeof SocialIntegrationSchema>;
export declare const ShareCollectionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    resourceIds: z.ZodArray<z.ZodString, "many">;
    shareConfig: z.ZodObject<{
        id: z.ZodString;
        resourceId: z.ZodString;
        resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
        shareTarget: z.ZodEnum<["public", "workspace", "organization", "private", "unlisted"]>;
        shareFormat: z.ZodEnum<["link", "embed", "export", "clone"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        permissions: z.ZodObject<{
            canView: z.ZodDefault<z.ZodBoolean>;
            canComment: z.ZodDefault<z.ZodBoolean>;
            canClone: z.ZodDefault<z.ZodBoolean>;
            canEdit: z.ZodDefault<z.ZodBoolean>;
            canShare: z.ZodDefault<z.ZodBoolean>;
            canEmbed: z.ZodDefault<z.ZodBoolean>;
            canDownload: z.ZodDefault<z.ZodBoolean>;
            requiresAuth: z.ZodDefault<z.ZodBoolean>;
            allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            expiresAt: z.ZodOptional<z.ZodDate>;
            maxViews: z.ZodOptional<z.ZodNumber>;
            maxShares: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        }, {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        }>;
        customization: z.ZodDefault<z.ZodObject<{
            branding: z.ZodOptional<z.ZodObject<{
                showLogo: z.ZodDefault<z.ZodBoolean>;
                showAttribution: z.ZodDefault<z.ZodBoolean>;
                customLogo: z.ZodOptional<z.ZodString>;
                customColors: z.ZodOptional<z.ZodObject<{
                    primary: z.ZodOptional<z.ZodString>;
                    background: z.ZodOptional<z.ZodString>;
                    text: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    text?: string;
                    primary?: string;
                    background?: string;
                }, {
                    text?: string;
                    primary?: string;
                    background?: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            }, {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            }>>;
            layout: z.ZodOptional<z.ZodObject<{
                width: z.ZodDefault<z.ZodNumber>;
                height: z.ZodDefault<z.ZodNumber>;
                showHeader: z.ZodDefault<z.ZodBoolean>;
                showFooter: z.ZodDefault<z.ZodBoolean>;
                showToolbar: z.ZodDefault<z.ZodBoolean>;
                responsive: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            }, {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            }>>;
            features: z.ZodOptional<z.ZodObject<{
                allowComments: z.ZodDefault<z.ZodBoolean>;
                allowRating: z.ZodDefault<z.ZodBoolean>;
                showMetrics: z.ZodDefault<z.ZodBoolean>;
                enableInteraction: z.ZodDefault<z.ZodBoolean>;
                autoPlay: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            }, {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            }>>;
        }, "strip", z.ZodTypeAny, {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        }, {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        }>>;
        metadata: z.ZodObject<{
            createdBy: z.ZodString;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            version: z.ZodDefault<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
            estimatedTime: z.ZodOptional<z.ZodNumber>;
            prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            relatedResources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        }, {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    }, {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    }>;
    organization: z.ZodOptional<z.ZodObject<{
        sequence: z.ZodArray<z.ZodString, "many">;
        grouping: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
        navigation: z.ZodDefault<z.ZodObject<{
            showIndex: z.ZodDefault<z.ZodBoolean>;
            showProgress: z.ZodDefault<z.ZodBoolean>;
            allowJumping: z.ZodDefault<z.ZodBoolean>;
            autoAdvance: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        }, {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        sequence?: string[];
        navigation?: {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        };
        grouping?: Record<string, string[]>;
    }, {
        sequence?: string[];
        navigation?: {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        };
        grouping?: Record<string, string[]>;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    organization?: {
        sequence?: string[];
        navigation?: {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        };
        grouping?: Record<string, string[]>;
    };
    resourceIds?: string[];
    shareConfig?: {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    };
}, {
    id?: string;
    name?: string;
    description?: string;
    organization?: {
        sequence?: string[];
        navigation?: {
            showProgress?: boolean;
            showIndex?: boolean;
            allowJumping?: boolean;
            autoAdvance?: boolean;
        };
        grouping?: Record<string, string[]>;
    };
    resourceIds?: string[];
    shareConfig?: {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    };
}>;
export type ShareCollection = z.infer<typeof ShareCollectionSchema>;
export declare const CreateShareRequestSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
    shareTarget: z.ZodDefault<z.ZodEnum<["public", "workspace", "organization", "private", "unlisted"]>>;
    shareFormat: z.ZodDefault<z.ZodEnum<["link", "embed", "export", "clone"]>>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodObject<{
        canView: z.ZodDefault<z.ZodBoolean>;
        canComment: z.ZodDefault<z.ZodBoolean>;
        canClone: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canShare: z.ZodDefault<z.ZodBoolean>;
        canEmbed: z.ZodDefault<z.ZodBoolean>;
        canDownload: z.ZodDefault<z.ZodBoolean>;
        requiresAuth: z.ZodDefault<z.ZodBoolean>;
        allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        expiresAt: z.ZodOptional<z.ZodDate>;
        maxViews: z.ZodOptional<z.ZodNumber>;
        maxShares: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    }, {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    }>>;
    customization: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    socialPlatforms: z.ZodDefault<z.ZodArray<z.ZodEnum<["twitter", "linkedin", "discord", "slack", "teams", "email", "github"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
    permissions?: {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
    shareFormat?: "link" | "embed" | "clone" | "export";
    customization?: {};
    socialPlatforms?: ("email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord")[];
}, {
    description?: string;
    title?: string;
    permissions?: {
        allowedDomains?: string[];
        canEdit?: boolean;
        expiresAt?: Date;
        canView?: boolean;
        canComment?: boolean;
        canClone?: boolean;
        canShare?: boolean;
        canEmbed?: boolean;
        canDownload?: boolean;
        requiresAuth?: boolean;
        maxViews?: number;
        maxShares?: number;
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
    shareFormat?: "link" | "embed" | "clone" | "export";
    customization?: {};
    socialPlatforms?: ("email" | "slack" | "twitter" | "linkedin" | "github" | "teams" | "discord")[];
}>;
export declare const ShareResponseSchema: z.ZodObject<{
    shareConfig: z.ZodObject<{
        id: z.ZodString;
        resourceId: z.ZodString;
        resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
        shareTarget: z.ZodEnum<["public", "workspace", "organization", "private", "unlisted"]>;
        shareFormat: z.ZodEnum<["link", "embed", "export", "clone"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        permissions: z.ZodObject<{
            canView: z.ZodDefault<z.ZodBoolean>;
            canComment: z.ZodDefault<z.ZodBoolean>;
            canClone: z.ZodDefault<z.ZodBoolean>;
            canEdit: z.ZodDefault<z.ZodBoolean>;
            canShare: z.ZodDefault<z.ZodBoolean>;
            canEmbed: z.ZodDefault<z.ZodBoolean>;
            canDownload: z.ZodDefault<z.ZodBoolean>;
            requiresAuth: z.ZodDefault<z.ZodBoolean>;
            allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            expiresAt: z.ZodOptional<z.ZodDate>;
            maxViews: z.ZodOptional<z.ZodNumber>;
            maxShares: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        }, {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        }>;
        customization: z.ZodDefault<z.ZodObject<{
            branding: z.ZodOptional<z.ZodObject<{
                showLogo: z.ZodDefault<z.ZodBoolean>;
                showAttribution: z.ZodDefault<z.ZodBoolean>;
                customLogo: z.ZodOptional<z.ZodString>;
                customColors: z.ZodOptional<z.ZodObject<{
                    primary: z.ZodOptional<z.ZodString>;
                    background: z.ZodOptional<z.ZodString>;
                    text: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    text?: string;
                    primary?: string;
                    background?: string;
                }, {
                    text?: string;
                    primary?: string;
                    background?: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            }, {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            }>>;
            layout: z.ZodOptional<z.ZodObject<{
                width: z.ZodDefault<z.ZodNumber>;
                height: z.ZodDefault<z.ZodNumber>;
                showHeader: z.ZodDefault<z.ZodBoolean>;
                showFooter: z.ZodDefault<z.ZodBoolean>;
                showToolbar: z.ZodDefault<z.ZodBoolean>;
                responsive: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            }, {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            }>>;
            features: z.ZodOptional<z.ZodObject<{
                allowComments: z.ZodDefault<z.ZodBoolean>;
                allowRating: z.ZodDefault<z.ZodBoolean>;
                showMetrics: z.ZodDefault<z.ZodBoolean>;
                enableInteraction: z.ZodDefault<z.ZodBoolean>;
                autoPlay: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            }, {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            }>>;
        }, "strip", z.ZodTypeAny, {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        }, {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        }>>;
        metadata: z.ZodObject<{
            createdBy: z.ZodString;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            version: z.ZodDefault<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
            estimatedTime: z.ZodOptional<z.ZodNumber>;
            prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            relatedResources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        }, {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    }, {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    }>;
    shareLink: z.ZodObject<{
        id: z.ZodString;
        shareConfigId: z.ZodString;
        shortCode: z.ZodString;
        fullUrl: z.ZodString;
        shortUrl: z.ZodString;
        qrCode: z.ZodOptional<z.ZodString>;
        socialTags: z.ZodObject<{
            openGraph: z.ZodObject<{
                title: z.ZodString;
                description: z.ZodString;
                image: z.ZodOptional<z.ZodString>;
                url: z.ZodString;
                type: z.ZodDefault<z.ZodString>;
                siteName: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            }, {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            }>;
            twitter: z.ZodObject<{
                card: z.ZodDefault<z.ZodEnum<["summary", "summary_large_image"]>>;
                title: z.ZodString;
                description: z.ZodString;
                image: z.ZodOptional<z.ZodString>;
                creator: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            }, {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            }>;
            schema: z.ZodObject<{
                type: z.ZodDefault<z.ZodString>;
                name: z.ZodString;
                description: z.ZodString;
                url: z.ZodString;
                author: z.ZodOptional<z.ZodObject<{
                    type: z.ZodDefault<z.ZodString>;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name?: string;
                    type?: string;
                }, {
                    name?: string;
                    type?: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            }, {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        }, {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        }>;
        embedCode: z.ZodOptional<z.ZodObject<{
            iframe: z.ZodString;
            javascript: z.ZodOptional<z.ZodString>;
            responsive: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        }, {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        }>>;
        analytics: z.ZodDefault<z.ZodObject<{
            trackingEnabled: z.ZodDefault<z.ZodBoolean>;
            utmSource: z.ZodOptional<z.ZodString>;
            utmMedium: z.ZodOptional<z.ZodString>;
            utmCampaign: z.ZodOptional<z.ZodString>;
            customParams: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        }, {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        analytics?: {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        };
        shareConfigId?: string;
        shortCode?: string;
        fullUrl?: string;
        shortUrl?: string;
        qrCode?: string;
        socialTags?: {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        };
        embedCode?: {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        };
    }, {
        id?: string;
        analytics?: {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        };
        shareConfigId?: string;
        shortCode?: string;
        fullUrl?: string;
        shortUrl?: string;
        qrCode?: string;
        socialTags?: {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        };
        embedCode?: {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        };
    }>;
    socialLinks: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    embedCodes: z.ZodObject<{
        basic: z.ZodString;
        responsive: z.ZodString;
        customizable: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        basic?: string;
        customizable?: string;
        responsive?: string;
    }, {
        basic?: string;
        customizable?: string;
        responsive?: string;
    }>;
    qrCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    qrCode?: string;
    shareConfig?: {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    };
    shareLink?: {
        id?: string;
        analytics?: {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        };
        shareConfigId?: string;
        shortCode?: string;
        fullUrl?: string;
        shortUrl?: string;
        qrCode?: string;
        socialTags?: {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        };
        embedCode?: {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        };
    };
    socialLinks?: Record<string, string>;
    embedCodes?: {
        basic?: string;
        customizable?: string;
        responsive?: string;
    };
}, {
    qrCode?: string;
    shareConfig?: {
        id?: string;
        description?: string;
        tags?: string[];
        metadata?: {
            createdAt?: Date;
            updatedAt?: Date;
            category?: string;
            version?: string;
            estimatedTime?: number;
            createdBy?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "intermediate" | "beginner";
            relatedResources?: string[];
        };
        title?: string;
        permissions?: {
            allowedDomains?: string[];
            canEdit?: boolean;
            expiresAt?: Date;
            canView?: boolean;
            canComment?: boolean;
            canClone?: boolean;
            canShare?: boolean;
            canEmbed?: boolean;
            canDownload?: boolean;
            requiresAuth?: boolean;
            maxViews?: number;
            maxShares?: number;
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        thumbnailUrl?: string;
        shareTarget?: "private" | "public" | "organization" | "workspace" | "unlisted";
        shareFormat?: "link" | "embed" | "clone" | "export";
        customization?: {
            layout?: {
                width?: number;
                height?: number;
                showHeader?: boolean;
                showFooter?: boolean;
                showToolbar?: boolean;
                responsive?: boolean;
            };
            branding?: {
                showLogo?: boolean;
                showAttribution?: boolean;
                customLogo?: string;
                customColors?: {
                    text?: string;
                    primary?: string;
                    background?: string;
                };
            };
            features?: {
                autoPlay?: boolean;
                allowComments?: boolean;
                showMetrics?: boolean;
                allowRating?: boolean;
                enableInteraction?: boolean;
            };
        };
    };
    shareLink?: {
        id?: string;
        analytics?: {
            trackingEnabled?: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            customParams?: Record<string, string>;
        };
        shareConfigId?: string;
        shortCode?: string;
        fullUrl?: string;
        shortUrl?: string;
        qrCode?: string;
        socialTags?: {
            schema?: {
                name?: string;
                description?: string;
                type?: string;
                author?: {
                    name?: string;
                    type?: string;
                };
                url?: string;
            };
            twitter?: {
                description?: string;
                title?: string;
                image?: string;
                creator?: string;
                card?: "summary" | "summary_large_image";
            };
            openGraph?: {
                description?: string;
                type?: string;
                title?: string;
                image?: string;
                url?: string;
                siteName?: string;
            };
        };
        embedCode?: {
            iframe?: string;
            javascript?: string;
            responsive?: string;
        };
    };
    socialLinks?: Record<string, string>;
    embedCodes?: {
        basic?: string;
        customizable?: string;
        responsive?: string;
    };
}>;
export type CreateShareRequest = z.infer<typeof CreateShareRequestSchema>;
export type ShareResponse = z.infer<typeof ShareResponseSchema>;
export declare export declare export declare declare const ShareableResourceTypeSchema: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
declare const ShareTargetSchema: z.ZodEnum<["public", "workspace", "organization", "private", "unlisted"]>;
declare const ShareFormatSchema: z.ZodEnum<["link", "embed", "export", "clone"]>;
declare const SocialPlatformSchema: z.ZodEnum<["twitter", "linkedin", "discord", "slack", "teams", "email", "github"]>;
export interface ShareSystemConfig {
    enabledPlatforms: SocialPlatform[];
    defaultPermissions: SharePermission;
    analyticsRetentionDays: number;
    maxSharesPerUser: number;
    rateLimiting: {
        sharesPerHour: number;
        embedsPerHour: number;
    };
    customization: {
        allowCustomBranding: boolean;
        allowCustomDomains: boolean;
        maxEmbedSize: {
            width: number;
            height: number;
        };
    };
}
export { SharePermissionSchema, ShareConfigSchema, ShareLinkSchema, ShareAnalyticsEventSchema, ShareMetricsSchema, SocialIntegrationSchema, ShareCollectionSchema, CreateShareRequestSchema, ShareResponseSchema, ShareableResourceTypeSchema, ShareTargetSchema, ShareFormatSchema, SocialPlatformSchema };
//# sourceMappingURL=sharingTypes.d.ts.map