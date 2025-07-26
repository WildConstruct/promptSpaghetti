import React from 'react';
import { TemplateSaveData } from '../../types/TemplateTypes';
interface SaveTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (templateData: TemplateSaveData) => Promise<{
        success: boolean;
        error?: string;
    }>;
    initialData?: Partial<TemplateSaveData>;
}
export declare const SaveTemplateDialog: React.FC<SaveTemplateDialogProps>;
export {};
//# sourceMappingURL=SaveTemplateDialog.d.ts.map