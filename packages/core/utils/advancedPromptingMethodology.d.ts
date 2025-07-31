import { VariableSuggestion } from './templateParser';

}
export interface ZadaTemplateComponent {
    category: 'time_setting' | 'actions' | 'locations' | 'characters' | 'cinematography';
    name: string;
    description: string;
    template: string;
    variables: string[];
    examples: string[];
    priority: number;
    dependencies?: string[];

export declare export declare const parseMarsFramework: (template: string) => {
    tags: MarsTag[];
    conflicts: string[];
    suggestions: string[];
}
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