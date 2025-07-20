/**
 * Epic 9.2.6 - Template Creation Wizard
 * Multi-step wizard for creating new project templates from existing graphs
 */
import React from 'react';
import { ProjectTemplate, ProjectTemplateManager } from '../../templates/ProjectTemplateManager';
interface TemplateCreationWizardProps {
    graphData: any;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (template: ProjectTemplate) => void;
    templateManager: ProjectTemplateManager;
}
export declare const TemplateCreationWizard: React.FC<TemplateCreationWizardProps>;
export {};
//# sourceMappingURL=TemplateCreationWizard.d.ts.map