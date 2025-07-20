export interface CorrectionRule {
    id: string;
    name: string;
    description?: string;
    findPattern: string;
    replaceWith: string;
    isRegex: boolean;
    isActive: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
interface CorrectionsState {
    rules: CorrectionRule[];
    isEnabled: boolean;
    addRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateRule: (id: string, updates: Partial<CorrectionRule>) => void;
    deleteRule: (id: string) => void;
    toggleRule: (id: string) => void;
    reorderRules: (fromIndex: number, toIndex: number) => void;
    clearAllRules: () => void;
    applyCorrections: (text: string) => string;
    getActiveRules: () => CorrectionRule[];
}
export declare const useCorrectionsStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<CorrectionsState>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: CorrectionsState | Partial<CorrectionsState> | ((state: CorrectionsState) => CorrectionsState | Partial<CorrectionsState>), replace?: boolean | undefined, action?: A | undefined): void;
}, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<CorrectionsState, CorrectionsState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CorrectionsState) => void) => () => void;
        onFinishHydration: (fn: (state: CorrectionsState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<CorrectionsState, CorrectionsState>>;
    };
}>;
export declare const useCorrectionsEnabled: () => boolean;
export declare const DEFAULT_CORRECTION_RULES: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>[];
export {};
//# sourceMappingURL=correctionsStore.d.ts.map