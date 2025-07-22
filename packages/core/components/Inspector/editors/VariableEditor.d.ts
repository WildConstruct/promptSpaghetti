import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface VariableEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeType: 'SetVariable' | 'GetVariable';
}
export declare const debugMode: any;
//# sourceMappingURL=VariableEditor.d.ts.map