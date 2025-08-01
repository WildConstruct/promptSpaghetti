/**
 * Epic 14 Story 14.4 - Experiment Management System
 * Comprehensive experiment lifecycle management
 */
import React from 'react';
import { Experiment, ExperimentTemplate, KnowledgeBaseEntry } from '../../types/experiment';

}
}
export interface ExperimentManagerProps {
    experiments: Experiment[];
    templates: ExperimentTemplate[];
    knowledgeBase: KnowledgeBaseEntry[];
    onCreateExperiment: (template?: ExperimentTemplate) => void;
    onEditExperiment: (id: string) => void;
    onViewResults: (id: string) => void;
    onDuplicateExperiment: (id: string) => void;
    onArchiveExperiment: (id: string) => void;
    onStartExperiment: (id: string) => Promise<void>;
    onPauseExperiment: (id: string) => Promise<void>;
    onStopExperiment: (id: string) => Promise<void>;
    onExportExperiments: (format: 'csv' | 'json') => Promise<void>;
    onImportTemplate: (file: File) => Promise<void>;
    onCreateTemplate: (experimentId: string) => Promise<void>;
    className?: string;

export declare const ExperimentManager: React.FC<ExperimentManagerProps>;
export default ExperimentManager;
//# sourceMappingURL=ExperimentManager.d.ts.map
}
}