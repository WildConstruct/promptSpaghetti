/**
 * Epic 16 Marketplace Sharing Components - Index
 *
 * Central export file for all sharing-related components.
 * Provides a clean API for importing sharing functionality throughout the application.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */

export { ShareModal } from './ShareModal';
export { ShareButton } from './ShareButton';
export { ShareAnalyticsDashboard } from './ShareAnalyticsDashboard';
export { SharePreview } from './SharePreview';

// Re-export types for convenience
export type {
  ShareableResourceType,
  ShareTarget,
  ShareFormat,
  SocialPlatform,
  SharePermission,
  ShareConfig,
  ShareLink,
  ShareAnalyticsEvent,
  ShareMetrics,
  CreateShareRequest,
  ShareResponse,
  ShareCollection,
  SocialIntegration,
} from '../../types/sharingTypes';

// Re-export service for convenience
export { SharingService } from '../../services/SharingService';
