import React from 'react';
import { ProjectTemplate } from '../../types/TemplateTypes';
interface TemplateGalleryProps {
    workspaceId?: string;
    onSelectTemplate?: (template: ProjectTemplate) => void;
    onCreateFromTemplate?: (template: ProjectTemplate, customization: Record<string, any>) => void;
    className?: string;
    showCreateButton?: boolean;
    allowCreation?: boolean;
    viewMode?: 'grid' | 'list';
}
export declare const TemplateGallery: React.FC<TemplateGalleryProps>;
export {};
//# sourceMappingURL=TemplateGallery.d.ts.map