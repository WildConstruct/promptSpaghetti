import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';
export interface TextFieldEditorProps extends EditorFieldProps {
    type?: 'text' | 'number' | 'email' | 'url';
    multiline?: boolean;
    rows?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
}
export declare const TextFieldEditor: React.FC<TextFieldEditorProps>;
//# sourceMappingURL=TextFieldEditor.d.ts.map