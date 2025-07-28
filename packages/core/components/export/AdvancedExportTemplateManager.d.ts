/**
 * Advanced Export Template Manager Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 *
 * Professional template management system for advanced export workflows with
 * template creation, customization, sharing, and collaboration features.
 */
import React from 'react';
import { ExportTemplate } from '../../types/export';

interface AdvancedExportTemplateManagerProps {
    visible?: boolean;
    onClose?: () => void;
    projectId?: string;
    onTemplateSelect?: (template: ExportTemplate) => void;
    enableSharing?: boolean;
    enableCollaboration?: boolean;
    className?: string;

export declare const AdvancedExportTemplateManager: React.FC<AdvancedExportTemplateManagerProps>;
export default AdvancedExportTemplateManager;
//# sourceMappingURL=AdvancedExportTemplateManager.d.ts.map