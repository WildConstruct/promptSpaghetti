/**
 * Epic 16 Social Platform Integration - E16-1753114247029-1A29A4
 * 
 * Comprehensive social platform integration for template sharing and cross-platform
 * promotion. Integrates with major social platforms and provides unified sharing
 * interface with analytics tracking.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShareIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  HashtagIcon,
  PhotoIcon,
  PlayIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BoltIcon,
  FireIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Template } from './TemplatePreviewModal';
// ShareTrackingManager import removed

// Social Platform Interfaces
export interface SocialPlatformIntegrationProps {
  template: Template;
  platforms?: SocialPlatform[];
  trackingEnabled?: boolean;
  onShareComplete?: (share: ShareRecord) => void;
  onAnalyticsUpdate?: (analytics: ShareAnalytics) => void;
  className?: string;
  showAnalytics?: boolean;
  customizations?: SocialCustomizations;
}

export interface SocialPlatform {
  id: string;
  name: string;
  displayName: string;
  icon: React.ComponentType<unknown>;
  color: string;
  description: string;
  enabled: boolean;
  requiresAuth: boolean;
  config: PlatformConfig;
  features: PlatformFeatures;
  limits: PlatformLimits;
  analytics: PlatformAnalytics;
}

export interface PlatformConfig {
  apiEndpoint?: string;
  clientId?: string;
  redirectUri?: string;
  scopes: string[];
  customFields: Record<string, any>;
  webhookUrl?: string;
  rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  retryAfter: number;
}

export interface PlatformFeatures {
  directPosting: boolean;
  scheduledPosting: boolean;
  mediaUpload: boolean;
  hashtags: boolean;
  mentions: boolean;
  geotagging: boolean;
  crossPosting: boolean;
  analytics: boolean;
  engagement: boolean;
}

export interface PlatformLimits {
  maxTextLength: number;
  maxImages: number;
  maxVideos: number;
  maxHashtags: number;
  maxMentions: number;
  fileSize: number;
  videoLength: number;
}

export interface PlatformAnalytics {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  reach: number;
  lastUpdated: Date;
}

export interface ShareRecord {
  id: string;
  templateId: string;
  platform: string;
  shareType: ShareType;
  content: ShareContent;
  timestamp: Date;
  userId: string;
  success: boolean;
  analytics: ShareAnalytics;
  metadata: ShareMetadata;
}

export type ShareType = 'direct' | 'link' | 'embed' | 'download' | 'preview';

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  hashtags: string[];
  mentions: string[];
  customText?: string;
}

export interface ShareAnalytics {
  views: number;
  clicks: number;
  engagements: number;
  conversions: number;
  revenue: number;
  demographics: DemographicData;
  performance: PerformanceMetrics;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  geoLocations: Record<string, number>;
  interests: Record<string, number>;
  devices: Record<string, number>;
}

export interface PerformanceMetrics {
  clickThroughRate: number;
  conversionRate: number;
  engagementRate: number;
  viralCoefficient: number;
  timeToConversion: number;
}

export interface ShareMetadata {
  userAgent?: string;
  referrer?: string;
  location?: string;
  deviceType?: string;
  campaignId?: string;
  source?: string;
  medium?: string;
}

export interface SocialCustomizations {
  autoHashtags: boolean;
  customBranding: boolean;
  trackingParameters: boolean;
  crossPlatformSync: boolean;
  schedulingEnabled: boolean;
  analyticsIntegration: boolean;
}

// Predefined social platforms
const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'twitter',
    displayName: 'Twitter',
    icon: ({ className }) => ()
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
    color: '#1DA1F2',
    description: 'Share on Twitter with trending hashtags',
    enabled: true,
    requiresAuth: true,
    config: {,
      scopes: ['tweet.read', 'tweet.write', 'users.read'],
      customFields: { includeThread: false },
      rateLimit: { requestsPerMinute: 300, requestsPerHour: 1500, burstLimit: 100, retryAfter: 900 }
    },
    features: {,
      directPosting: true,
      scheduledPosting: true,
      mediaUpload: true,
      hashtags: true,
      mentions: true,
      geotagging: true,
      crossPosting: false,
      analytics: true,
      engagement: true,
    },
    limits: {,
      maxTextLength: 280,
      maxImages: 4,
      maxVideos: 1,
      maxHashtags: 10,
      maxMentions: 10,
      fileSize: 5242880, // 5MB
      videoLength: 140,
    },
    analytics: {,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      shares: 0,
      reach: 0,
      lastUpdated: new Date()
    }
  },
  {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: ({ className }) => ()
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: '#0A66C2',
    description: 'Share professionally on LinkedIn',
    enabled: true,
    requiresAuth: true,
    config: {,
      scopes: ['r_liteprofile', 'w_member_social'],
      customFields: { targetAudience: 'professional' },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 500, burstLimit: 50, retryAfter: 3600 }
    },
    features: {,
      directPosting: true,
      scheduledPosting: true,
      mediaUpload: true,
      hashtags: true,
      mentions: true,
      geotagging: false,
      crossPosting: true,
      analytics: true,
      engagement: true,
    },
    limits: {,
      maxTextLength: 3000,
      maxImages: 9,
      maxVideos: 1,
      maxHashtags: 5,
      maxMentions: 5,
      fileSize: 104857600, // 100MB
      videoLength: 600,
    },
    analytics: {,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      shares: 0,
      reach: 0,
      lastUpdated: new Date()
    }
  },
  {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    icon: ({ className }) => ()
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: '#1877F2',
    description: 'Share with Facebook communities',
    enabled: true,
    requiresAuth: true,
    config: {,
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
      customFields: { pageId: '', autoSchedule: false },
      rateLimit: { requestsPerMinute: 200, requestsPerHour: 4800, burstLimit: 600, retryAfter: 300 }
    },
    features: {,
      directPosting: true,
      scheduledPosting: true,
      mediaUpload: true,
      hashtags: false,
      mentions: true,
      geotagging: true,
      crossPosting: true,
      analytics: true,
      engagement: true,
    },
    limits: {,
      maxTextLength: 63206,
      maxImages: 10,
      maxVideos: 1,
      maxHashtags: 0,
      maxMentions: 50,
      fileSize: 104857600, // 100MB
      videoLength: 240,
    },
    analytics: {,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      shares: 0,
      reach: 0,
      lastUpdated: new Date()
    }
  },
  {
    id: 'reddit',
    name: 'reddit',
    displayName: 'Reddit',
    icon: ({ className }) => ()
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
    color: '#FF4500',
    description: 'Share in relevant Reddit communities',
    enabled: true,
    requiresAuth: true,
    config: {,
      scopes: ['identity', 'submit', 'read'],
      customFields: { subreddit: 'promptengineering', flairId: '' },
      rateLimit: { requestsPerMinute: 60, requestsPerHour: 600, burstLimit: 10, retryAfter: 600 }
    },
    features: {,
      directPosting: true,
      scheduledPosting: false,
      mediaUpload: true,
      hashtags: false,
      mentions: false,
      geotagging: false,
      crossPosting: false,
      analytics: true,
      engagement: true,
    },
    limits: {,
      maxTextLength: 40000,
      maxImages: 1,
      maxVideos: 1,
      maxHashtags: 0,
      maxMentions: 0,
      fileSize: 20971520, // 20MB
      videoLength: 900,
    },
    analytics: {,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      shares: 0,
      reach: 0,
      lastUpdated: new Date()
    }
  },
  {
    id: 'discord',
    name: 'discord',
    displayName: 'Discord',
    icon: ({ className }) => ()
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
      </svg>
    ),
    color: '#5865F2',
    description: 'Share in Discord servers and communities',
    enabled: true,
    requiresAuth: true,
    config: {,
      scopes: ['bot', 'messages.read'],
      customFields: { webhookUrl: '', channelId: '', guildId: '' },
      rateLimit: { requestsPerMinute: 50, requestsPerHour: 1000, burstLimit: 5, retryAfter: 1000 }
    },
    features: {,
      directPosting: true,
      scheduledPosting: false,
      mediaUpload: true,
      hashtags: false,
      mentions: true,
      geotagging: false,
      crossPosting: false,
      analytics: false,
      engagement: true,
    },
    limits: {,
      maxTextLength: 2000,
      maxImages: 10,
      maxVideos: 1,
      maxHashtags: 0,
      maxMentions: 100,
      fileSize: 8388608, // 8MB
      videoLength: 600,
    },
    analytics: {,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      shares: 0,
      reach: 0,
      lastUpdated: new Date()
    }
  }
];

// Share content generator
export const ShareContentGenerator = {
  generateTitle: (template: Template, platform: string): string => {
    const baseTitle = template.title;
    const platformSpecific = {
      twitter: `🚀 ${baseTitle}`,}
      linkedin: `Professional Template: ${baseTitle}`,}
      facebook: `Check out this amazing template: ${baseTitle}`,}
      reddit: `[Template] ${baseTitle}`,}
      discord: `**${baseTitle}** - New Template Alert!`}
    };
    return platformSpecific[platform as keyof typeof platformSpecific] || baseTitle;
  },
  generateDescription: (template: Template, platform: string): string => {
    const baseDesc = template.description;
    const platformSpecific = {
      twitter: `${baseDesc.slice(0, 200)}... #PromptEngineering #AI`,}
      linkedin: `${baseDesc}\n\n💡 Perfect for professionals looking to enhance their AI workflow.\n\n#AI #Productivity #Templates`,}
      facebook: `${baseDesc}\n\nWant to streamline your AI interactions? This template is exactly what you need! 🎯`,}
      reddit: `${baseDesc}\n\nThought this community might find this useful. What do you think?`,}
      discord: `${baseDesc}\n\nAnyone tried something like this before? Would love to hear your thoughts! 💭`}
    };
    return platformSpecific[platform as keyof typeof platformSpecific] || baseDesc;
  },
  generateHashtags: (template: Template, platform: string): string[] => {
    const baseTags = template.tags || [];
    const platformSpecific = {
      twitter: [...baseTags, 'AI', 'Productivity', 'Templates', 'PromptEngineering'].slice(0, 10),
      linkedin: [...baseTags, 'ArtificialIntelligence', 'Productivity', 'Innovation'].slice(0, 5),
      facebook: [], // Facebook doesn't use hashtags effectively
      reddit: [], // Reddit uses subreddits instead
      discord: [] // Discord doesn't use hashtags
    };
    return platformSpecific[platform as keyof typeof platformSpecific] || [];
  }
};

// Main component
export const SocialPlatformIntegration: React.FC<SocialPlatformIntegrationProps> = ({)
  template,
  platforms = SOCIAL_PLATFORMS,
  trackingEnabled = true,
  onShareComplete,
  onAnalyticsUpdate,
  className = '',
  showAnalytics = true,
  customizations = {
    autoHashtags: true,
    customBranding: true,
    trackingParameters: true,
    crossPlatformSync: false,
    schedulingEnabled: true,
    analyticsIntegration: true,
  }
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [shareContent, setShareContent] = useState<Record<string, ShareContent>>({});
  const [isSharing, setIsSharing] = useState<Record<string, boolean>>({});
  const [shareResults, setShareResults] = useState<Record<string, ShareRecord>>({});
  const [showCustomization, setShowCustomization] = useState(false);
  const [analytics, setAnalytics] = useState<ShareAnalytics>({)
    views: 0,
    clicks: 0,
    engagements: 0,
    conversions: 0,
    revenue: 0,
    demographics: {,
      ageGroups: {},
      geoLocations: {},
      interests: {},
      devices: {}
    },
    performance: {,
      clickThroughRate: 0,
      conversionRate: 0,
      engagementRate: 0,
      viralCoefficient: 0,
      timeToConversion: 0,
    }
  });
  // Initialize share content for all platforms
  useEffect(() => {
    const initialContent: Record<string, ShareContent> = {};
    platforms.forEach(platform => {)
      initialContent[platform.id] = {
        title: ShareContentGenerator.generateTitle(template, platform.id),
        description: ShareContentGenerator.generateDescription(template, platform.id),
        url: `${window.location.origin}/templates/${template.id}`,}
        imageUrl: template.thumbnailUrl,
        hashtags: ShareContentGenerator.generateHashtags(template, platform.id),
        mentions: [],
        customText: '',
      };
    });
    setShareContent(initialContent);
  }, [template, platforms]);
  const handlePlatformToggle = useCallback((platformId: string) => {
    setSelectedPlatforms(prev => )
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  }, []);
  const handleContentChange = useCallback((platformId: string, updates: Partial<ShareContent>) => {
    setShareContent(prev => ({)
      ...prev,
      [platformId]: { ...prev[platformId], ...updates }
    }));
  }, []);
  const performShare = useCallback(async (platformId: string): Promise<ShareRecord> => {
    const platform = platforms.find(p => p.id === platformId);
    const content = shareContent[platformId];
    if (!platform || !content) {
      throw new Error(`Platform ${platformId} not configured`);}
    }
    // Simulate API call to social platform
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    // Generate tracking parameters
    const trackingParams = trackingEnabled ? {
      utm_source: platformId,
      utm_medium: 'social',
      utm_campaign: `template_${template.id}`,}
      utm_content: 'share_button',
    } : {};
    const shareRecord: ShareRecord = {
      id: `share_${Date.now()}_${platformId}`,}
      templateId: template.id,
      platform: platformId,
      shareType: 'direct',
      content: {,
        ...content,
        url: content.url + (trackingEnabled ? '?' + new URLSearchParams(trackingParams).toString() : '')
      },
      timestamp: new Date(),
      userId: 'current_user', // Would come from auth context
      success: Math.random() > 0.1, // 90% success rate simulation
      analytics: {,
        views: Math.floor(Math.random() * 1000),
        clicks: Math.floor(Math.random() * 100),
        engagements: Math.floor(Math.random() * 50),
        conversions: Math.floor(Math.random() * 10),
        revenue: Math.floor(Math.random() * 1000) / 100,
        demographics: {,
          ageGroups: { '18-24': 30, '25-34': 45, '35-44': 25 },
          geoLocations: { 'US': 60, 'EU': 25, 'Other': 15 },
          interests: { 'AI': 80, 'Tech': 70, 'Productivity': 60 },
          devices: { 'Desktop': 60, 'Mobile': 35, 'Tablet': 5 }
        },
        performance: {,
          clickThroughRate: Math.random() * 10,
          conversionRate: Math.random() * 5,
          engagementRate: Math.random() * 15,
          viralCoefficient: Math.random() * 2,
          timeToConversion: Math.random() * 3600
        }
      },
      metadata: {,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        deviceType: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        source: 'template_page',
        medium: 'social_share',
      }
    };
    return shareRecord;
  }, [platforms, shareContent, template.id, trackingEnabled]);
  const handleSingleShare = useCallback(async (platformId: string) => {
    setIsSharing(prev => ({ ...prev, [platformId]: true }));
    try {
      const shareRecord = await performShare(platformId);
      setShareResults(prev => ({ ...prev, [platformId]: shareRecord }));
      onShareComplete?.(shareRecord);
      // Update analytics
      if (customizations.analyticsIntegration) {
        const updatedAnalytics = {
          ...analytics,
          views: analytics.views + shareRecord.analytics.views,
          clicks: analytics.clicks + shareRecord.analytics.clicks,
          engagements: analytics.engagements + shareRecord.analytics.engagements,
          conversions: analytics.conversions + shareRecord.analytics.conversions,
          revenue: analytics.revenue + shareRecord.analytics.revenue
        };
        setAnalytics(updatedAnalytics);
        onAnalyticsUpdate?.(updatedAnalytics);
      }
    } catch (error) {
      console.error(`Failed to share on ${platformId}:`, error);}
    } finally {
      setIsSharing(prev => ({ ...prev, [platformId]: false }));
    }
  }, [performShare, onShareComplete, analytics, onAnalyticsUpdate, customizations.analyticsIntegration]);
  const handleBulkShare = useCallback(async () => {
    const sharePromises = selectedPlatforms.map(platformId => ;)
      handleSingleShare(platformId).catch(err => ({ platformId, error: err }))
    );
    await Promise.all(sharePromises);
  }, [selectedPlatforms, handleSingleShare]);
  const copyShareLink = useCallback(async () => {
    const shareUrl = `${window.location.origin}/templates/${template.id}${}
      trackingEnabled ? '?utm_source=direct&utm_medium=link&utm_campaign=template_share' : ''
    }`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [template.id, trackingEnabled]);
  const enabledPlatforms = useMemo(() => ;
    platforms.filter(platform => platform.enabled), 
  [platforms]
  );
  const totalAnalytics = useMemo(() => ({)
    totalShares: Object.keys(shareResults).length,
    successfulShares: Object.values(shareResults).filter(r => r.success).length,
    totalReach: Object.values(shareResults).reduce((sum, r) => sum + r.analytics.views, 0),
    totalEngagements: Object.values(shareResults).reduce((sum, r) => sum + r.analytics.engagements, 0),
    averageCTR: Object.values(shareResults).reduce((sum, r) => sum + r.analytics.performance.clickThroughRate, 0) / Math.max(Object.keys(shareResults).length, 1)
  }), [shareResults]);
  return ()
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShareIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Social Platform Integration</h3>
              <p className="text-sm text-gray-600">Share "{template.title}" across multiple platforms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm"
            >
              <LinkIcon className="h-4 w-4" />
              Copy Link
            </button>
            <button
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Customize
            </button>
          </div>
        </div>
      </div>
      {/* Analytics Summary */}
      {showAnalytics && Object.keys(shareResults).length > 0 && ()
        <div className="border-b border-gray-200 p-4 bg-blue-50">
          <h4 className="font-medium text-gray-900 mb-3">Share Performance</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAnalytics.totalShares}</div>
              <div className="text-xs text-gray-600">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalAnalytics.successfulShares}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalAnalytics.totalReach.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalAnalytics.totalEngagements}</div>
              <div className="text-xs text-gray-600">Engagements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{totalAnalytics.averageCTR.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">Avg CTR</div>
            </div>
          </div>
        </div>
      )}
      {/* Platform Selection */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Select Platforms</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{selectedPlatforms.length} of {enabledPlatforms.length} selected</span>
            {selectedPlatforms.length > 0 && ()
              <button
                onClick={handleBulkShare}
                disabled={Object.values(isSharing).some(Boolean)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
              >
                <RocketLaunchIcon className="h-4 w-4" />
                Share All
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enabledPlatforms.map(platform => {)
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            const isSharing = isSharing[platform.id];
            const shareResult = shareResults[platform.id];
            return ()
              <div
                key={platform.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${platform.color}10`, color: platform.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{platform.displayName}</div>
                      <div className="text-xs text-gray-600">{platform.description}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {shareResult && ()
                  <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
                    <div className="flex items-center gap-2">
                      {shareResult.success ? ()
                        <CheckIcon className="h-3 w-3 text-green-600" />
                      ) : ()
                        <XMarkIcon className="h-3 w-3 text-red-600" />
                      )}
                      <span className={shareResult.success ? 'text-green-600' : 'text-red-600'}>
                        {shareResult.success ? 'Shared successfully' : 'Share failed'}
                      </span>
                    </div>
                    {shareResult.success && ()
                      <div className="mt-1 grid grid-cols-3 gap-1 text-gray-600">
                        <div>{shareResult.analytics.views} views</div>
                        <div>{shareResult.analytics.clicks} clicks</div>
                        <div>{shareResult.analytics.engagements} eng.</div>
                      </div>
                    )}
                  </div>
                )}
                {isSelected && ()
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleShare(platform.id);
                      }}
                      disabled={isSharing}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm disabled:opacity-50"
                    >
                      {isSharing ? ()
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent" />
                          Sharing...
                        </>
                      ) : ()
                        <>
                          <ShareIcon className="h-3 w-3" />
                          Share Now
                        </>
                      )}
                    </button>
                  </div>
                )}
                {/* Platform capabilities */}
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  {platform.features.hashtags && <HashtagIcon className="h-3 w-3" />}
                  {platform.features.mediaUpload && <PhotoIcon className="h-3 w-3" />}
                  {platform.features.scheduledPosting && <CalendarIcon className="h-3 w-3" />}
                  {platform.features.analytics && <ChartBarIcon className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Customization Panel */}
      {showCustomization && selectedPlatforms.length > 0 && ()
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Customize Share Content</h4>
          {selectedPlatforms.map(platformId => {)
            const platform = platforms.find(p => p.id === platformId);
            const content = shareContent[platformId];
            if (!platform || !content) return null;
            return ()
              <div key={platformId} className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                  <span className="font-medium text-gray-900">{platform.displayName}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={content.title}
                      onChange={(e) => handleContentChange(platformId, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      maxLength={platform.limits.maxTextLength}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={content.description}
                      onChange={(e) => handleContentChange(platformId, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      maxLength={platform.limits.maxTextLength}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {content.description.length} / {platform.limits.maxTextLength}
                    </div>
                  </div>
                </div>
                {platform.features.hashtags && ()
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                    <input
                      type="text"
                      value={content.hashtags.join(' ')}
                      onChange={(e) => handleContentChange(platformId, { )
                        hashtags: e.target.value.split(' ').filter(tag => tag.startsWith('#')).slice(0, platform.limits.maxHashtags)
                      })}
                      placeholder="#AI #productivity #templates"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {content.hashtags.length} / {platform.limits.maxHashtags} hashtags
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialPlatformIntegration;