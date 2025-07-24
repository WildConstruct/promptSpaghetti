/**
 * Epic 16 Marketplace Sharing Modal Component
 *
 * Main modal interface for sharing templates, graphs, and marketplace content.
 * Provides options for different share formats, permissions, and social platforms.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import React from 'react';
import { ShareableResourceType, ShareResponse } from '../../types/sharingTypes';
interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: string;
    resourceType: ShareableResourceType;
    resourceTitle: string;
    resourceDescription?: string;
    onShareCreated?: (shareResponse: ShareResponse) => void;
}
export declare const ShareModal: React.FC<ShareModalProps>;
export default ShareModal;
//# sourceMappingURL=ShareModal.d.ts.map