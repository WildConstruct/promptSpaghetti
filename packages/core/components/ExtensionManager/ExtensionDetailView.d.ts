/**
 * Extension Detail View - Epic 8.4 Story 8.4.5
 * Detailed view component for individual extensions
 */
import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
import { ExtensionStatus } from './ExtensionManagerStore';

}
export interface ExtensionDetailViewProps {
    extension: ExtensionManifest;
    status: ExtensionStatus;
    viewMode: 'installed' | 'marketplace';
    onToggle?: () => void;
    onUninstall?: () => void;
    onUpdate?: () => void;
    onConfigure?: () => void;
    onInstall?: () => void;
    onClose: () => void;

export declare const ExtensionDetailView: React.FC<ExtensionDetailViewProps>;
export default ExtensionDetailView;
//# sourceMappingURL=ExtensionDetailView.d.ts.map
}