/**
 * Template Version History Component
 * Visual interface for managing template versions and history
 */
import React from 'react';
import { TemplateVersion } from '../templates/TemplateVersionManager';
import { ProjectTemplate } from '../templates/ProjectTemplateManager';

interface TemplateVersionHistoryProps {
    template: ProjectTemplate;
    onVersionSelect?: (version: TemplateVersion) => void;
    onVersionCompare?: (fromVersion: string, toVersion: string) => void;
    onVersionRestore?: (version: TemplateVersion) => void;
    onVersionExport?: (version: TemplateVersion) => void;
    className?: string;

export declare const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps>;
export {};
//# sourceMappingURL=TemplateVersionHistory.d.ts.map