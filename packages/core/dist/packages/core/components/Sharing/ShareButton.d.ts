/**
 * Epic 16 Marketplace Share Button Component
 *
 * Compact button component that triggers the sharing modal.
 * Provides quick access to sharing functionality throughout the application.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import React from 'react';
import { ShareableResourceType } from '../../types/sharingTypes';
interface ShareButtonProps {
    resourceId: string;
    resourceType: ShareableResourceType;
    resourceTitle: string;
    resourceDescription?: string;
    variant?: 'primary' | 'secondary' | 'icon';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onShareCreated?: (shareResponse: Error) => void;
}
export declare const ShareButton: React.FC<ShareButtonProps>;
export default ShareButton;
//# sourceMappingURL=ShareButton.d.ts.map