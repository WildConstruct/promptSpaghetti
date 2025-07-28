import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { SelectOption } from '../SelectEditor';
export interface PythonTransformEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeId: string;
    /**
     * Epic 8.4 - Python Transform Editor with Progressive Disclosure
     *
     * Three-tier disclosure system:
     * - Basic: Essential code editor and validation (for filmmakers)
     * - Advanced: Resource limits, modules, and execution settings (power users)
     * - Debug: Raw configuration, executor settings, and technical details
     */
    const: any;
    MEMORY_LIMIT_OPTIONS: SelectOption;
    const: any;
    TIMEOUT_OPTIONS: SelectOption;
    const: any;
    FALLBACK_BEHAVIOR_OPTIONS: SelectOption;
}
export declare const PythonTransformEditor: React.FC<PythonTransformEditorProps>;
//# sourceMappingURL=PythonTransformEditor.d.ts.map