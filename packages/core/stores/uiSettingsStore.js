import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const DEFAULT_SETTINGS = {
    debugMode: false,
    professionalUI: true,
    showTechnicalDetails: false,
    complexityLevel: 'basic',
    globalDisclosureLevel: 'basic',
    hideAdvancedFeatures: false,
    nodePreferences: {},
    nodeTypePreferences: {},
    preferenceInheritance: 'global',
    theme: 'dark',
    compactMode: false,
    showNodeIcons: true,
    demoMode: false,
    hideAllTechnicalUI: false,
};
export const useUISettingsStore = create()(persist((set, get) => ({
    ...DEFAULT_SETTINGS,
    // Actions
    setDebugMode: (enabled: boolean) => set({ debugMode: enabled }),
    setProfessionalUI: (enabled: boolean) => set({ professionalUI: enabled }),
    setShowTechnicalDetails: (enabled: boolean) => set({ showTechnicalDetails: enabled }),
    setComplexityLevel: (level: string) => set({ complexityLevel: level }),
    setGlobalDisclosureLevel: (level: string) => set({ globalDisclosureLevel: level }),
    setTheme: (theme: string) => set({ theme }),
    setDemoMode: (enabled: boolean) => set({ demoMode: enabled }),
    // Per-Node Preference Actions
    setNodeDisclosureLevel: (nodeId: string, level: string) => {
        set((state) => ({
            nodePreferences: {
                ...state.nodePreferences,
                [nodeId]: {
                    disclosureLevel: level,
                    useGlobalDefault: false,
                    lastModified: Date.now()
                }
            }
        }));
    },
    setNodeUseGlobalDefault: (nodeId: string, useGlobal: boolean) => {
        set((state) => ({
            nodePreferences: {
                ...state.nodePreferences,
                [nodeId]: {
                    ...state.nodePreferences[nodeId],
                    disclosureLevel: state.nodePreferences[nodeId]?.disclosureLevel || state.globalDisclosureLevel,
                    useGlobalDefault: useGlobal,
                    lastModified: Date.now()
                }
            }
        }));
    },
    setNodeTypeDisclosureLevel: (nodeType: string, level: string) => {
        set((state) => ({
            nodeTypePreferences: {
                ...state.nodeTypePreferences,
                [nodeType]: {
                    ...state.nodeTypePreferences[nodeType],
                    disclosureLevel: level,
                    collapsedSections: state.nodeTypePreferences[nodeType]?.collapsedSections || []
                }
            }
        }));
    },
    setNodeTypeCollapsedSections: (nodeType: string, sections: string[]) => {
        set((state) => ({
            nodeTypePreferences: {
                ...state.nodeTypePreferences,
                [nodeType]: {
                    ...state.nodeTypePreferences[nodeType],
                    disclosureLevel: state.nodeTypePreferences[nodeType]?.disclosureLevel || state.globalDisclosureLevel,
                    collapsedSections: sections
                }
            }
        }));
    },
    setPreferenceInheritance: (inheritance: string) => {
        set({ preferenceInheritance: inheritance });
    },
    clearNodePreferences: (nodeId?: string) => {
        if (nodeId) {
            set((state) => {
                const { [nodeId]: removed, ...remaining } = state.nodePreferences;
                return { nodePreferences: remaining };
            });
        }
        else {
            set({ nodePreferences: {} });
        }
    },
    // Computed getters
    shouldShowTechnicalFields: () => {
        const state = get();
        if (state.hideAllTechnicalUI || state.demoMode)
            return false;
        return state.debugMode || state.showTechnicalDetails;
    },
    shouldShowAdvancedFeatures: () => {
        const state = get();
        if (state.hideAllTechnicalUI || state.demoMode)
            return false;
        if (state.hideAdvancedFeatures)
            return false;
        return state.complexityLevel !== 'basic';
    },
    getEffectiveTheme: () => {
        const state = get();
        if (state.professionalUI && state.theme === 'dark') {
            return 'cinema4d'; // Use professional dark theme
        }
        return state.theme;
    },
    // Get effective disclosure level for a specific node
    getNodeDisclosureLevel: (nodeId: string, nodeType?: string) => {
        const state = get();
        // Individual node preference takes highest priority
        if (state.preferenceInheritance === 'individual' || state.preferenceInheritance === 'global') {
            const nodePrefs = state.nodePreferences[nodeId];
            if (nodePrefs && !nodePrefs.useGlobalDefault) {
                return nodePrefs.disclosureLevel;
            }
        }
        // Node type preference is second priority
        if (state.preferenceInheritance === 'nodeType' && nodeType) {
            const typePrefs = state.nodeTypePreferences[nodeType];
            if (typePrefs) {
                return typePrefs.disclosureLevel;
            }
        }
        // Fall back to global default
        return state.globalDisclosureLevel;
    },
    // Get effective node preferences with inheritance resolution
    getEffectiveNodePreferences: (nodeId: string, nodeType?: string) => {
        const state = get();
        const disclosureLevel = get().getNodeDisclosureLevel(nodeId, nodeType);
        return {
            disclosureLevel,
            useGlobalDefault: state.nodePreferences[nodeId]?.useGlobalDefault ?? true,
            lastModified: state.nodePreferences[nodeId]?.lastModified ?? Date.now()
        };
    },
    // Presets
    applyFilmmakerPreset: () => set({
        professionalUI: true,
        debugMode: false,
        showTechnicalDetails: false,
        complexityLevel: 'basic',
        globalDisclosureLevel: 'basic',
        hideAdvancedFeatures: true,
        nodePreferences: {},
        nodeTypePreferences: {},
        preferenceInheritance: 'global',
        theme: 'cinema4d',
        compactMode: false,
        showNodeIcons: true,
        demoMode: false,
        hideAllTechnicalUI: true,
    }),
    applyDeveloperPreset: () => set({
        professionalUI: false,
        debugMode: true,
        showTechnicalDetails: true,
        complexityLevel: 'expert',
        globalDisclosureLevel: 'debug',
        hideAdvancedFeatures: false,
        nodePreferences: {},
        nodeTypePreferences: {},
        preferenceInheritance: 'individual',
        theme: 'dark',
        compactMode: true,
        showNodeIcons: true,
        demoMode: false,
        hideAllTechnicalUI: false,
    }),
    applyDemoPreset: () => set({
        professionalUI: true,
        debugMode: false,
        showTechnicalDetails: false,
        complexityLevel: 'basic',
        globalDisclosureLevel: 'basic',
        hideAdvancedFeatures: true,
        nodePreferences: {},
        nodeTypePreferences: {},
        preferenceInheritance: 'global',
        theme: 'cinema4d',
        compactMode: false,
        showNodeIcons: true,
        demoMode: true,
        hideAllTechnicalUI: true,
    }),
}), {
    name: 'ui-settings-storage',
    version: 2,
    migrate: (persistedState, version) => {
        if (version === 1) {
            // Migrate from version 1 to 2: add new per-node preference fields
            return {
                ...persistedState,
                globalDisclosureLevel: persistedState.complexityLevel === 'expert' ? 'debug' :
                    persistedState.complexityLevel === 'advanced' ? 'advanced' : 'basic',
                nodePreferences: {},
                nodeTypePreferences: {},
                preferenceInheritance: 'global'
            };
        }
        return persistedState;
    }
}));
// Helper function to check if field should be shown based on current settings
export const shouldShowField = (fieldName: string, fieldType: string, store: any) => {
    // Always hide technical fields like 'id', 'nodeId', 'internalConfig', etc.
    const technicalFields = ['id', 'nodeId', 'internalId', 'config', '_internal', 'metadata'];
    if (technicalFields.some(tech => fieldName.toLowerCase().includes(tech.toLowerCase()))) {
        return store?.shouldShowTechnicalFields() ?? false;
    }
    // Hide advanced fields based on complexity level
    if (fieldType === 'advanced') {
        return store?.shouldShowAdvancedFeatures() ?? true;
    }
    // Always show basic fields
    return true;
};
// Field classification helper
export const classifyField = (fieldName: string, fieldType: string) => {
    const technicalPatterns = ['debug', 'trace', 'performance', 'meta', 'internal'];
    const advancedPatterns = ['weight', 'seed', 'transform', 'validate', 'optimization'];
    const lowerName = fieldName.toLowerCase();
    if (technicalPatterns.some(pattern => lowerName.includes(pattern))) {
        return 'technical';
    }
    if (advancedPatterns.some(pattern => lowerName.includes(pattern))) {
        return 'advanced';
    }
    return 'basic';
};
