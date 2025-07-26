import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';
interface EnhancedTextAreaEditorProps extends EditorFieldProps {
    rows?: number;
    maxLength?: number;
    minLength?: number;
    autoResize?: boolean;
    showWordCount?: boolean;
    enableInlineCorrections?: boolean;
    autoApplyCorrections?: boolean;
    showCorrectionHighlights?: boolean;
}
export declare const EnhancedTextAreaEditor: React.FC<EnhancedTextAreaEditorProps>;
export {};
//# sourceMappingURL=EnhancedTextAreaEditor.d.ts.map