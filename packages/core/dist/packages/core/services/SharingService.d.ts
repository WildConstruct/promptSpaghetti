/**
 * Epic 16 Marketplace Sharing Service
 *
 * Core service for managing content sharing, analytics, and social integration.
 * Provides comprehensive sharing functionality for templates, graphs, and marketplace content.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { 
  ShareConfig,
  ShareAnalyticsEvent,
  ShareMetrics,
  CreateShareRequest,
  ShareResponse,
  ShareCollection,
  SocialIntegration,
  SharePermission
} from '../types/sharingTypes';
export declare class SharingService {
    private baseUrl;
    private analyticsEnabled;
    private socialIntegrations;
    constructor(config: {
        baseUrl: string;
        analyticsEnabled?: boolean;
        socialIntegrations?: SocialIntegration[];
    });
    /**
     * Create a new share configuration and link
     */
    createShare(request: CreateShareRequest): Promise<ShareResponse>;
    /**
     * Generate a shareable link with short code
     */
    private generateShareLink;
    /**
     * Generate social platform specific sharing links
     */
    private generateSocialLinks;
    /**
     * Generate embed codes for different formats
     */
    private generateEmbedCodes;
    /**
     * Track sharing analytics event
     */
    trackAnalyticsEvent(
      shareLinkId: string,
      eventType: ShareAnalyticsEvent['eventType'],
      contextData?: Partial<ShareAnalyticsEvent>
    ): Promise<void>;
    /**
     * Get sharing metrics for a resource
     */
    getShareMetrics(shareLinkId: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<ShareMetrics>;
    /**
     * Create a collection of shareable resources
     */
    createShareCollection(
      name: string,
      description: string,
      resourceIds: string[],
      shareConfig: Partial<CreateShareRequest>
    ): Promise<ShareCollection>;
    /**
     * Update share permissions
     */
    updateSharePermissions(shareConfigId: string, permissions: Partial<SharePermission>): Promise<ShareConfig>;
    /**
     * Revoke or disable a share
     */
    revokeShare(shareConfigId: string): Promise<void>;
    /**
     * Get share analytics dashboard data
     */
    getShareDashboard(userId: string): Promise<{
        totalShares: number;
        totalViews: number;
        topPerformers: Array<{
            resourceId: string;
            title: string;
            views: number;
            shares: number;
        }>;
        recentActivity: ShareAnalyticsEvent[];
    }>;
    private generateShortCode;
    private generateQRCode;
    private getDefaultPermissions;
    private buildTwitterShareUrl;
    private buildLinkedInShareUrl;
    private buildSlackShareUrl;
    private buildEmailShareUrl;
}
//# sourceMappingURL=SharingService.d.ts.map