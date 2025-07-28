/**
 * Epic 14 Story 14.1 - Experiment Design System
 * Visual Experiment Builder Component
 */
import React from 'react';
import { Experiment, ExperimentVariant } from '../../types/experiment';

export interface ExperimentBuilderProps {
    experiment?: Experiment;
    onSave: (experiment: Partial<Experiment>) => Promise<void>;
    onPreview: (variant: ExperimentVariant) => Promise<{,
        cost: number;
        tokens: number;
        latency: number;
    }>;
    onStart: (experimentId: string) => Promise<void>;
    onPause: (experimentId: string) => Promise<void>;
    className?: string;

export declare const ExperimentBuilder: React.FC<ExperimentBuilderProps>;
export default ExperimentBuilder;
//# sourceMappingURL=ExperimentBuilder.d.ts.map