/**
 * Extension List View - Epic 8.4 Story 8.4.5
 * List view component for installed extensions
 */
import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
import { ExtensionStatus } from './ExtensionManagerStore';

}
}
export interface ExtensionListViewProps {
    extensions: ExtensionManifest[];
    selectedExtension: ExtensionManifest | null;
    getExtensionStatus: (extensionId: string) => ExtensionStatus;
    onExtensionSelect: (extension: ExtensionManifest) => void;
    onToggleExtension: (extensionId: string) => void;
    onUninstallExtension: (extensionId: string) => void;
    onUpdateExtension: (extensionId: string) => void;
    onConfigureExtension: (extension: ExtensionManifest) => void;

export declare const ExtensionListView: React.FC<ExtensionListViewProps>;
export default ExtensionListView;
//# sourceMappingURL=ExtensionListView.d.ts.map
}
}