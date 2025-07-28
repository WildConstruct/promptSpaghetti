import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface VariableEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeType: 'SetVariable' | 'GetVariable';

export declare const VariableEditor: React.FC<VariableEditorProps>;
export default VariableEditor;
//# sourceMappingURL=VariableEditor.d.ts.map