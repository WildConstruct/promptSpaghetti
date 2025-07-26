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
export declare export declare     conflicts: string[];
    suggestions: string[];
};
export declare     structure: any;
    variables: string[];
};
export declare export declare     mars: MarsTag[];
    hybridExamples: string[];
};
//# sourceMappingURL=advancedPromptingMethodology.d.ts.map