/**
 * Epic 16 Marketplace Sharing Service
 *
 * Core service for managing content sharing, analytics, and social integration.
 * Provides comprehensive sharing functionality for templates, graphs, and marketplace content.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { SocialIntegration } from '../types/sharingTypes';
export declare class SharingService {
    private baseUrl;
    private analyticsEnabled;
    private socialIntegrations;
    constructor(config: {});
    baseUrl: string;
    analyticsEnabled?: boolean;
    socialIntegrations?: SocialIntegration;
}
//# sourceMappingURL=SharingService.d.ts.map