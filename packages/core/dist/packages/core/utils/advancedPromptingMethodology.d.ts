import { VariableSuggestion } from './templateParser';
export interface ZadaTemplateComponent {
    category: 'time_setting' | 'actions' | 'locations' | 'characters' | 'cinematography';
    name: string;
    description: string;
    template: string;
    variables: string[];
    examples: string[];
    priority: number;
    dependencies?: string[];
}
export declare const ZADA_SCREENPLAY_TEMPLATES: ZadaTemplateComponent[];
export interface MarsTag {
    tag: string;
    category: 'camera' | 'subject' | 'effects' | 'focal' | 'setting' | 'mood' | 'technical';
    description: string;
    syntax: string;
    examples: string[];
    priority?: number;
    conflicts?: string[];
    requires?: string[];
}
export declare const MARS_FRAMEWORK_TAGS: MarsTag[];
export declare class AdvancedPromptingMethodology {
    private static instance;
    static getInstance(): AdvancedPromptingMethodology;
    /**
     * Generate Zada-style screenplay template based on selected components
     */
    generateZadaTemplate(components: string[]): string;
    /**
     * Parse MARS tags from template and validate compatibility
     */
    parseMarsFramework(template: string): {
        tags: MarsTag[];
        conflicts: string[];
        suggestions: string[];
    };
    /**
     * Create hybrid natural+structured template
     */
    createHybridTemplate(naturalTemplate: string, marsFramework?: boolean): {
        hybrid: string;
        structure: any;
        variables: string[];
    };
    /**
     * Get auto-completion suggestions for MARS tags
     */
    getMarsAutocompletions(context: string, currentInput: string): VariableSuggestion[];
    /**
     * Create template pattern library with examples
     */
    getTemplatePatternLibrary(): {
        zada: ZadaTemplateComponent[];
        mars: MarsTag[];
        hybridExamples: string[];
    };
    private sortByDependencies;
    private enhanceWithMarsFramework;
}
export declare const advancedPromptingMethodology: AdvancedPromptingMethodology;
export declare const generateZadaTemplate: (components: string[]) => string;
export declare const parseMarsFramework: (template: string) => {
    tags: MarsTag[];
    conflicts: string[];
    suggestions: string[];
};
export declare const createHybridTemplate: (naturalTemplate: string, marsFramework?: boolean) => {
    hybrid: string;
    structure: any;
    variables: string[];
};
export declare const getMarsAutocompletions: (context: string, currentInput: string) => VariableSuggestion[];
export declare const getTemplatePatternLibrary: () => {
    zada: ZadaTemplateComponent[];
    mars: MarsTag[];
    hybridExamples: string[];
};
//# sourceMappingURL=advancedPromptingMethodology.d.ts.map