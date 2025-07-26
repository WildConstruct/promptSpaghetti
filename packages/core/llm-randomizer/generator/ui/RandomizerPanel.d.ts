import React from 'react';
import { RandomizerParameters } from '../parameters/parameter-schema';
interface RandomizerPanelProps {
    onGraphGenerated?: (graph: any) => void;
    onError?: (error: Error) => void;
    className?: string;
    initialParameters?: Partial<RandomizerParameters>;
}
/**
 * Main randomizer panel component
 */
export declare const RandomizerPanel: React.FC<RandomizerPanelProps>;
export {};
//# sourceMappingURL=RandomizerPanel.d.ts.map