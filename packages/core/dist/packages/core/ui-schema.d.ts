import { z } from 'zod';
export declare export type UIGraph = z.infer<typeof UIGraph>;
export interface ExtractedVariable {
    name: string;
    placeholder: string;
    position: number;
}
export interface NodeUIState {
    basic: UINode;
    advanced?: {
        performance?: boolean;
        debugging?: boolean;
    };
    connections?: {
        inputs: string[];
        outputs: string[];
    };
}
export interface TemplateParser {
    extractVariables(template: string): ExtractedVariable[];
    validateTemplate(template: string): {
        valid: boolean;
        errors: string[];
    };
    previewTemplate(template: string, variables: Record<string, string>): string;
}
//# sourceMappingURL=ui-schema.d.ts.map