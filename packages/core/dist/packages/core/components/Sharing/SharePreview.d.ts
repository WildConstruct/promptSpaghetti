/**
 * Epic 16 Marketplace Share Preview Component
 *
 * Shows how shared content will appear on different platforms.
 * Provides real-time preview of OpenGraph, Twitter cards, and embed codes.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import React from 'react';
import { ShareConfig, ShareLink, SocialPlatform } from '../../types/sharingTypes';
interface SharePreviewProps {
    shareConfig: ShareConfig;
    shareLink: ShareLink;
    selectedPlatform?: SocialPlatform | 'embed' | 'opengraph';
}
export declare const SharePreview: React.FC<SharePreviewProps>;
export default SharePreview;
//# sourceMappingURL=SharePreview.d.ts.map