/**
 * Extension Marketplace - Epic 8.4 Story 8.4.5
 * Marketplace view for discovering and installing extensions
 */
import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
export interface ExtensionMarketplaceProps {
    extensions: ExtensionManifest[];
    selectedExtension: ExtensionManifest | null;
    onExtensionSelect: (extension: ExtensionManifest) => void;
    onInstallExtension: (extension: ExtensionManifest) => void;
}
export declare const ExtensionMarketplace: React.FC<ExtensionMarketplaceProps>;
export default ExtensionMarketplace;
//# sourceMappingURL=ExtensionMarketplace.d.ts.map