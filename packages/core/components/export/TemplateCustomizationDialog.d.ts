/**
 * Template Customization Dialog Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 *
 * Advanced dialog for customizing export templates with real-time parameter
 * adjustment, preview functionality, and parameter validation.
 */
import React from 'react';
import { ExportTemplate } from '../../types/export';

}
interface TemplateCustomizationDialogProps {
    template: ExportTemplate;
    visible?: boolean;
    onClose?: () => void;
    onSave?: (customizedTemplate: ExportTemplate) => void;
    onPreview?: (previewData: unknown) => void;
    projectId?: string;
    className?: string;

export declare const TemplateCustomizationDialog: React.FC<TemplateCustomizationDialogProps>;
export default TemplateCustomizationDialog;
//# sourceMappingURL=TemplateCustomizationDialog.d.ts.map
}