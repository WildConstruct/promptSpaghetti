/**
 * Web-specific Input implementation
 */
import React from 'react';
import { InputProps, TextAreaProps } from '../../components/Input';
export interface WebInputProps extends InputProps {
    autoComplete?: string;
    spellCheck?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}
export declare const WebInput: React.FC<WebInputProps>;
export interface WebTextAreaProps extends TextAreaProps {
    autoComplete?: string;
    spellCheck?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    minLength?: number;
    maxLength?: number;
    wrap?: 'hard' | 'soft' | 'off';
}
export declare const WebTextArea: React.FC<WebTextAreaProps>;
//# sourceMappingURL=WebInput.d.ts.map