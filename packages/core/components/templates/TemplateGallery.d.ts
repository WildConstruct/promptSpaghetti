/**
 * Epic 9.2.6 - Template Gallery UI Component
 * Displays and manages project templates with search, filtering, and preview
 */
import React from 'react';
import { ProjectTemplate, ProjectTemplateManager } from '../../templates/ProjectTemplateManager';

interface TemplateGalleryProps {
    templateManager: ProjectTemplateManager;
    onTemplateSelect: (template: ProjectTemplate, customizations: Record<string, any>) => void;
    onTemplatePreview: (template: ProjectTemplate) => void;
    className?: string;

export declare const TemplateGallery: React.FC<TemplateGalleryProps>;
export {};
//# sourceMappingURL=TemplateGallery.d.ts.map