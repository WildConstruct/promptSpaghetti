import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { SelectOption } from '../SelectEditor';
export interface VariableEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeType: 'SetVariable' | 'GetVariable';
    const: any;
    VARIABLE_TYPES: SelectOption;
    const: any;
    SCOPE_OPTIONS: SelectOption;
    export const: any;
    VariableEditor: React.FC<VariableEditorProps>;
}
export default VariableEditor;
//# sourceMappingURL=VariableEditor.d.ts.map