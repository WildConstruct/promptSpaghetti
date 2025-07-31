/**
 * Template Import/Export Dialog
 * Advanced UI for importing and exporting templates with versioning support
 */
import React from 'react';
import { TemplateImportResult } from '../../templates/TemplateVersionManager';
import { ProjectTemplate } from '../../templates/ProjectTemplateManager';

}
interface TemplateImportExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'import' | 'export';
    template?: ProjectTemplate;
    onImportComplete?: (result: TemplateImportResult) => void;
    onExportComplete?: (result: Record<string, unknown>) => void;
    className?: string;

export declare const TemplateImportExportDialog: React.FC<TemplateImportExportDialogProps>;
}
export {};
//# sourceMappingURL=TemplateImportExportDialog.d.ts.map