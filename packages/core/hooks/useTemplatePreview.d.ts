export interface TemplatePreviewVariant {
    id: string;
    seed: number;
    result: string;
    timestamp: number;
    executionTime: number;
    substitutions: Record<string, string>;
    variablesUsed: string[];
    hasErrors: boolean;
    errorMessage?: string;
}
export interface TemplatePreviewPerformance {
    averageExecutionTime: number;
    totalGenerations: number;
    successRate: number;
    lastUpdate: number;
    templatesProcessed: number;
}
export interface TemplatePreviewConfig {
    maxVariants: number;
    debounceMs: number;
    enablePerformanceTracking: boolean;
    autoRefresh: boolean;
    showVariableSubstitution: boolean;
    errorOnUndefinedVariables: boolean;
}
export declare const useTemplatePreview: (template: string, variableValues?: Record<string, string>, customConfig?: Partial<TemplatePreviewConfig>) => {
    variants: TemplatePreviewVariant[];
    isGenerating: boolean;
    error: string | null;
    performance: TemplatePreviewPerformance;
    extractedVariables: string[];
    hasTemplateErrors: boolean;
    templateErrors: import("../utils/templateParser").TemplateError[];
    requestPreview: () => void;
    forcePreview: () => void;
    refreshVariant: (variantId: string) => Promise<void>;
    clearVariants: () => void;
    getPerformanceInsights: () => {
        isPerformanceGood: boolean;
        insights: string[];
    };
};
//# sourceMappingURL=useTemplatePreview.d.ts.map