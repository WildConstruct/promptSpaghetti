/**
 * Configuration panel UI component
 * Epic 10.2.2 - Configuration System UI Components
 */
import React from 'react';
import { ConfigurationManager, GlobalConfig, ConfigValidationResult } from '../../config/ConfigurationManager';
/**
 * Configuration panel props
 */
export interface ConfigurationPanelProps {
    configManager: ConfigurationManager;
    className?: string;
    onConfigChanged?: (config: GlobalConfig) => void;
    onValidationResult?: (result: ConfigValidationResult) => void;
}
/**
 * Main configuration panel component
 */
export declare const ConfigurationPanel: React.FC<ConfigurationPanelProps>;
//# sourceMappingURL=ConfigurationPanel.d.ts.map