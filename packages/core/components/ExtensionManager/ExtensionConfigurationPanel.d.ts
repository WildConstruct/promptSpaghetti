/**
 * Extension Configuration Panel - Epic 8.4 Story 8.4.5
 * Configuration interface for individual extensions
 */
import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
export interface ExtensionConfigurationPanelProps {
    extension: ExtensionManifest;
    onSave: (config: Record<string, any>) => void;
    onCancel: () => void;
}
export declare const ExtensionConfigurationPanel: React.FC<ExtensionConfigurationPanelProps>;
export default ExtensionConfigurationPanel;
//# sourceMappingURL=ExtensionConfigurationPanel.d.ts.map