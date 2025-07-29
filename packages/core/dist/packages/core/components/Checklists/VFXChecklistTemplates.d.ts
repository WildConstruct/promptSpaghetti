/**
import { CheckSquare } from 'lucide-react';
 * VFX Checklist Templates - E17-1753114397304-B22E55
 *
 * Pre-built checklist templates for common VFX workflows and production phases.
 * Supports template creation, sharing, and customization for different project types.
 */
import React from 'react';
import type { VFXChecklistTemplate, VFXTeamMember } from './VFXChecklistSystem';
export interface VFXChecklistTemplatesProps {
    templates?: VFXChecklistTemplate;
    currentUser: VFXTeamMember;
    onTemplateSelect: (template: VFXChecklistTemplate) => void;
    onTemplateCreate?: (template: Omit<VFXChecklistTemplate, 'id' | 'usageCount'>) => void;
    onTemplateUpdate?: (templateId: string, updates: Partial<VFXChecklistTemplate>) => void;
    onTemplateDelete?: (templateId: string) => void;
    onTemplateClone?: (templateId: string, newName: string) => void;
    readonly?: boolean;
    className?: string;
}
export declare const VFXChecklistTemplates: React.FC<VFXChecklistTemplatesProps>;
export default VFXChecklistTemplates;
//# sourceMappingURL=VFXChecklistTemplates.d.ts.map