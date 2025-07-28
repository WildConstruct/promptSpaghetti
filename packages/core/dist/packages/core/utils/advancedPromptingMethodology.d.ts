export interface ZadaTemplateComponent {
    category: 'time_setting' | 'actions' | 'locations' | 'characters' | 'cinematography';
    name: string;
    description: string;
    template: string;
    variables: string;
    examples: string;
    priority: number;
    dependencies?: string;
}
export declare const ZADA_SCREENPLAY_TEMPLATES: ZadaTemplateComponent;
export interface MarsTag {
    tag: string;
    category: 'camera' | 'subject' | 'effects' | 'focal' | 'setting' | 'mood' | 'technical';
    description: string;
    syntax: string;
    examples: string;
    priority?: number;
    conflicts?: string;
    requires?: string;
}
export declare const MARS_FRAMEWORK_TAGS: MarsTag;
export declare class AdvancedPromptingMethodology {
    private static instance;
    static getInstance(): AdvancedPromptingMethodology;
    private sortByDependencies;
    private enhanceWithMarsFramework;
}
//# sourceMappingURL=advancedPromptingMethodology.d.ts.map