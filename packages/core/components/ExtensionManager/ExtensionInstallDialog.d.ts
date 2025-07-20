/**
 * Extension Install Dialog - Epic 8.4 Story 8.4.5
 * Dialog for installing extensions from files or URLs
 */
import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest-simple';
export interface ExtensionInstallDialogProps {
    onInstall: (extension: ExtensionManifest) => Promise<void>;
    onCancel: () => void;
}
export declare const ExtensionInstallDialog: React.FC<ExtensionInstallDialogProps>;
export default ExtensionInstallDialog;
//# sourceMappingURL=ExtensionInstallDialog.d.ts.map