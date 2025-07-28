export interface TemplatePreviewVariant {
    id: string;
    seed: number;
    result: string;
    timestamp: number;
    executionTime: number;
    substitutions: Record<string, string>;
    variablesUsed: string;
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
    const: any;
    DEFAULT_CONFIG: TemplatePreviewConfig;
}
export declare const useTemplatePreview: any;
//# sourceMappingURL=useTemplatePreview.d.ts.map