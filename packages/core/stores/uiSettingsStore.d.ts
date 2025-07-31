export interface NodePreferences {
    disclosureLevel: 'basic' | 'advanced' | 'debug';
    useGlobalDefault: boolean;
    lastModified: number;

}
export interface NodeTypePreferences {
    disclosureLevel: 'basic' | 'advanced' | 'debug';
    collapsedSections: string[];

}
export interface UISettings {
    debugMode: boolean;
    professionalUI: boolean;
    showTechnicalDetails: boolean;
    complexityLevel: 'basic' | 'advanced' | 'expert';
    globalDisclosureLevel: 'basic' | 'advanced' | 'debug';
    hideAdvancedFeatures: boolean;
    nodePreferences: Record<string, NodePreferences>;
    nodeTypePreferences: Record<string, NodeTypePreferences>;
    preferenceInheritance: 'global' | 'nodeType' | 'individual';
    theme: 'light' | 'dark' | 'cinema4d';
    compactMode: boolean;
    showNodeIcons: boolean;
    demoMode: boolean;
    hideAllTechnicalUI: boolean;
}
interface UISettingsState extends UISettings {
    setDebugMode: (enabled: boolean) => void;
    setProfessionalUI: (enabled: boolean) => void;
    setShowTechnicalDetails: (enabled: boolean) => void;
    setComplexityLevel: (level: 'basic' | 'advanced' | 'expert') => void;
    setGlobalDisclosureLevel: (level: 'basic' | 'advanced' | 'debug') => void;
    setTheme: (theme: 'light' | 'dark' | 'cinema4d') => void;
    setDemoMode: (enabled: boolean) => void;
    setNodeDisclosureLevel: (nodeId: string, level: 'basic' | 'advanced' | 'debug') => void;
    setNodeUseGlobalDefault: (nodeId: string, useGlobal: boolean) => void;
    setNodeTypeDisclosureLevel: (nodeType: string, level: 'basic' | 'advanced' | 'debug') => void;
    setNodeTypeCollapsedSections: (nodeType: string, sections: string[]) => void;
    setPreferenceInheritance: (inheritance: 'global' | 'nodeType' | 'individual') => void;
    clearNodePreferences: (nodeId?: string) => void;
    shouldShowTechnicalFields: () => boolean;
    shouldShowAdvancedFeatures: () => boolean;
    getEffectiveTheme: () => 'light' | 'dark' | 'cinema4d';
    getNodeDisclosureLevel: (nodeId: string, nodeType?: string) => 'basic' | 'advanced' | 'debug';
    getEffectiveNodePreferences: (nodeId: string, nodeType?: string) => NodePreferences;
    applyFilmmakerPreset: () => void;
    applyDeveloperPreset: () => void;
    applyDemoPreset: () => void;

export declare const useUISettingsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UISettingsState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UISettingsState, any>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UISettingsState) => void) => () => void;
        onFinishHydration: (fn: (state: UISettingsState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UISettingsState, any>>;
}
    };
}>;
export declare const shouldShowField: (fieldName: string, fieldType?: string, store?: ReturnType<typeof useUISettingsStore>) => boolean;
export declare const classifyField: (fieldName: string, fieldType?: string) => "basic" | "advanced" | "technical";
export {};
//# sourceMappingURL=uiSettingsStore.d.ts.map