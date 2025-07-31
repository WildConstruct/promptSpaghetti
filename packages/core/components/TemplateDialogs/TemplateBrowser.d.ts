import React from 'react';
import { TemplateInstantiationOptions } from '../../types/TemplateTypes';

}
interface TemplateBrowserProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyTemplate: (templateId: string, options: TemplateInstantiationOptions) => Promise<void>;
    currentAuthor?: string;

export declare const TemplateBrowser: React.FC<TemplateBrowserProps>;
}
export {};
//# sourceMappingURL=TemplateBrowser.d.ts.map