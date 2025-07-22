import React from 'react';
import { AnnotatedEdge } from './ConnectionAnnotations';
interface ConnectionAnnotationPanelProps {
    edges: AnnotatedEdge[];
    selectedEdgeId: string | null;
    labelEditMode: boolean;
    smartPositioning: boolean;
    showAllLabels: boolean;
    onAddLabel: (edgeId: string, label: string, options?: Partial<AnnotatedEdge>) => void;
    onUpdateLabel: (edgeId: string, updates: Partial<AnnotatedEdge>) => void;
    onRemoveLabel: (edgeId: string) => void;
    onToggleLabel: (edgeId: string) => void;
    onSelectEdge: (edgeId: string | null) => void;
    onShowAllLabelsToggle: () => void;
    onHideAllLabels: () => void;
    onClearAllLabels: () => void;
    onOptimizePositions: () => void;
    onSetLabelEditMode: (enabled: boolean) => void;
    onSetSmartPositioning: (enabled: boolean) => void;
    getVisibleLabelsCount: () => number;
}
export declare const ConnectionAnnotationPanel: React.FC<ConnectionAnnotationPanelProps>;
export declare const ConnectionAnnotationToolbar: React.FC<{
    visible: boolean;
    onToggle: () => void;
    labelEditMode: boolean;
    onSetLabelEditMode: (enabled: boolean) => void;
    visibleLabelsCount: number;
    totalLabelsCount: number;
}>;
export {};
//# sourceMappingURL=ConnectionAnnotationPanel.d.ts.map