import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { WeightedChoice } from '../../../runtime/nodes/WeightedAdvanced';
export interface WeightedAdvancedEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeId: string;
}
/**
 * Epic 8.4 - WeightedAdvanced Editor with Progressive Disclosure
 *
 * Three-tier disclosure system:
 * - Basic: Essential name and choice options (for filmmakers)
 * - Advanced: Distribution algorithms, weight controls, and normalization (power users)
 * - Debug: Technical details, visualization, and raw data (developers)
 */
export declare const choices: WeightedChoice[];
//# sourceMappingURL=WeightedAdvancedEditor.d.ts.map