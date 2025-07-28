import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface SequentialEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    /**
     * Epic 8.4 - Sequential Editor with Progressive Disclosure
     *
     * Three-tier disclosure system:
     * - Basic: Node name and sequence items (essential for filmmakers)
     * - Advanced: Pattern configuration and weight controls (power users)
     * - Debug: Technical details and pattern behavior explanations
     */
    export const: any;
    SequentialEditor: React.FC<SequentialEditorProps>;
}
export default SequentialEditor;
//# sourceMappingURL=SequentialEditor.d.ts.map