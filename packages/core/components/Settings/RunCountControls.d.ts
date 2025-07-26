import React from 'react';
import { RunCountSettings } from '../../settings/types';
export interface RunCountControlsProps {
    settings: RunCountSettings;
    onChange: (settings: RunCountSettings) => void;
}
/**
 * Run Count Settings Controls Component
 * Manages number of preview variants to generate
 */
export declare const RunCountControls: React.FC<RunCountControlsProps>;
//# sourceMappingURL=RunCountControls.d.ts.map