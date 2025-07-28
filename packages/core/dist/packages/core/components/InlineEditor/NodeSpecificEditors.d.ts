import React from 'react';
import { NodeData } from '../../types/NodeTypes';
import { NodeSpecificRichEditor } from './RichTextEditor';
interface NodeEditorProps {
    data: NodeData;
    onChange: (field: string, value: any) => void;
    errors: Record<string, string>;
    theme?: 'light' | 'dark' | 'cinema';
    export const: any;
    WeightedChoiceEditor: React.FC<NodeEditorProps>;
}
export declare const ConcatEditor: React.FC<NodeEditorProps>;
export declare const VariableEditor: React.FC<NodeEditorProps>;
export declare const ConditionalEditor: React.FC<NodeEditorProps>;
export declare const OutputEditor: React.FC<NodeEditorProps>;
export { NodeSpecificRichEditor };
//# sourceMappingURL=NodeSpecificEditors.d.ts.map