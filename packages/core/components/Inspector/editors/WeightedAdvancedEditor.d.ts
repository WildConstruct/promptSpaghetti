import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface WeightedAdvancedEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeId: string;

/**
 * Epic 8.4 - WeightedAdvanced Editor with Progressive Disclosure
 *
 * Three-tier disclosure system:
 * - Basic: Essential name and choice options (for filmmakers)
 * - Advanced: Distribution algorithms, weight controls, and normalization (power users)
 * - Debug: Technical details, visualization, and raw data (developers)
 */
export declare const WeightedAdvancedEditor: React.FC<WeightedAdvancedEditorProps>;
export default WeightedAdvancedEditor;
//# sourceMappingURL=WeightedAdvancedEditor.d.ts.map