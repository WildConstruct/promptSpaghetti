import React from 'react';
import { ZodSchema, ZodTypeAny } from 'zod';
export interface BaseNodeEditorProps {
    nodeId: string;
    nodeData: Record<string, unknown>;
    schema: ZodSchema<any>;
    onChange: (partial: Record<string, unknown>) => void;
    className?: string;
    children?: React.ReactNode;
}
export interface EditorFieldProps {
    label: string;
    value: unknown;
    fieldKey: string;
    zodType: ZodTypeAny;
    error?: string;
    onChange: (value: unknown) => void;
    placeholder?: string;
    disabled?: boolean;
}
export declare const fieldErrors: Record<string, string>, setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
//# sourceMappingURL=BaseNodeEditor.d.ts.map