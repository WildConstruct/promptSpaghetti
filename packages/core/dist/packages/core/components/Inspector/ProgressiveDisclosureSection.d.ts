import React, { ReactNode } from 'react';
import { type FieldPriority } from '../VisualHierarchy/HierarchyDesignSystem';
export interface ProgressiveDisclosureSectionProps {
    title: string;
    level: 'basic' | 'advanced' | 'debug';
    children: ReactNode;
    description?: string;
    defaultExpanded?: boolean;
    icon?: string;
    className?: string;
    priority?: FieldPriority;
    fieldName?: string;
    /**
    * Epic 8.4 - Progressive Disclosure Section Component
    *
    * Automatically shows/hides content based on current complexity level:,
    * - Basic: Essential fields only,
    * - Advanced: Power user options with collapsible sections,
    * - Debug: All technical details visible,
    */
    const: any;
    ProgressiveDisclosureSection: React.FC<ProgressiveDisclosureSectionProps>;
}
export default ProgressiveDisclosureSection;
//# sourceMappingURL=ProgressiveDisclosureSection.d.ts.map