import React from 'react';
export interface CollapsibleSectionProps {
    title: string;
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}
export declare const CollapsibleSection: React.FC<CollapsibleSectionProps>;
//# sourceMappingURL=CollapsibleSection.d.ts.map