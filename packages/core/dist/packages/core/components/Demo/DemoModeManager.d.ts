/**
 * Demo Mode Manager
 * Epic 8.1: Task 5 - Demo-Ready Polish for presentation environments
 *
 * Manages presentation modes, screenshot mode, and demo optimizations
 */
import React from 'react';
export interface DemoModeConfig {
    screenshotMode: boolean;
    presentationFocus: boolean;
    performanceMode: boolean;
    accessibilityMode: boolean;
    brandingVisible: boolean;
    debugElementsHidden: boolean;
}
export interface DemoModeManagerProps {
    children: React.ReactNode;
    onModeChange?: (config: DemoModeConfig) => void;
    initialConfig?: Partial<DemoModeConfig>;
    const: any;
    DEFAULT_CONFIG: DemoModeConfig;
}
export declare const DemoModeManager: React.FC<DemoModeManagerProps>;
export default DemoModeManager;
//# sourceMappingURL=DemoModeManager.d.ts.map