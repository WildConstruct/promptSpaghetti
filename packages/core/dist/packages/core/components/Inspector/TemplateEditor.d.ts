import React from 'react';
import { ExtractedVariable } from '../../utils/templateParser';
export interface TemplateEditorProps {
    value: string;
    onChange: (value: string) => void;
    onVariablesChange?: (variables: string[], extractedVariables?: ExtractedVariable[]) => void;
    variableValues?: Record<string, string>;
    nodeType?: string;
    existingVariables?: string[];
    placeholder?: string;
    disabled?: boolean;
    showPreview?: boolean;
    showRealTimePreview?: boolean;
    autoComplete?: boolean;
    showCategoryFilters?: boolean;
    maxSuggestions?: number;
    className?: string;
}
export declare const suggestionIndex: number, setSuggestionIndex: React.Dispatch<React.SetStateAction<number>>;
//# sourceMappingURL=TemplateEditor.d.ts.map