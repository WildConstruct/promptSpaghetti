import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';
export interface TextAreaEditorProps extends EditorFieldProps {
    rows?: number;
    maxLength?: number;
    minLength?: number;
    autoResize?: boolean;
    showWordCount?: boolean;

export declare const TextAreaEditor: React.FC<TextAreaEditorProps>;
//# sourceMappingURL=TextAreaEditor.d.ts.map