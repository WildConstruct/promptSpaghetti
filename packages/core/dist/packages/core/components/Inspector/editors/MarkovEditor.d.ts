import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface MarkovEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
}
/**
 * Epic 8.4 - Markov Chain Editor with Progressive Disclosure
 *
 * Three-tier disclosure system:
 * - Basic: Node name, initial state, and simple states list (for filmmakers)
 * - Advanced: Transition matrix and probability controls (power users)
 * - Debug: Technical settings, loop detection, termination states
 */
export declare const MarkovEditor: React.FC<MarkovEditorProps>;
//# sourceMappingURL=MarkovEditor.d.ts.map