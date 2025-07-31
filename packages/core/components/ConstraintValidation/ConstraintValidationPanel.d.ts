/**
 * Constraint Validation Panel Component
 * Epic 8.8: Task 3 - Visual feedback for constraint violations
 *
 * Provides real-time constraint validation feedback in the graph editor
 */
import React from 'react';
import { UTDGNode, Era } from '../../types/UTDG';
import { Node } from '../../graphSchema';
import './ConstraintValidationPanel.css';

}
interface ConstraintValidationPanelProps {
    nodes: Node[];
    utdgNodes?: UTDGNode[];
    targetEra?: Era;
    visible?: boolean;
    onToggleVisibility?: () => void;
    onNodeHighlight?: (nodeIds: string[]) => void;
    onConstraintOverride?: (constraintId: string) => void;

export declare const ConstraintValidationPanel: React.FC<ConstraintValidationPanelProps>;
export default ConstraintValidationPanel;
//# sourceMappingURL=ConstraintValidationPanel.d.ts.map
}