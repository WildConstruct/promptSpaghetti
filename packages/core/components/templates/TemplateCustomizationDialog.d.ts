/**
 * Epic 9.2.6 - Template Customization Dialog
 * Allows users to customize template variables and customization points before instantiation
 */
import React from 'react';
import { ProjectTemplate } from '../../templates/ProjectTemplateManager';

}
}
interface TemplateCustomizationDialogProps { template: ProjectTemplate;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customizations: Record<string, any>) => void;
    onPreview: (customizations: Record<string, any>) => void;

export declare const TemplateCustomizationDialog: React.FC<TemplateCustomizationDialogProps> }
}
export {};
//# sourceMappingURL=TemplateCustomizationDialog.d.ts.map