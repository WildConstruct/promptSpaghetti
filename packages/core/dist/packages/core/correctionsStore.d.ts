export interface ExportOptions {
    name?: string;
    description?: string;
    includeInactive?: boolean;
    includeStatistics?: boolean;
    ruleIds?: string;
}
export interface ImportOptions {
    overwrite?: boolean;
    merge?: boolean;
    skipDuplicates?: boolean;
}
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
    rules: CorrectionRule;
    isEnabled: boolean;
    addRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateRule: (id: string, updates: Partial<CorrectionRule>) => void;
    deleteRule: (id: string) => void;
    toggleRule: (id: string) => void;
    reorderRules: (fromIndex: number, toIndex: number) => void;
    clearAllRules: () => void;
    applyCorrections: (text: string) => string;
    getActiveRules: () => CorrectionRule;
    getDraftRules: () => CorrectionRule;
    exportRules: () => ;
    format: 'json' | 'yaml' | 'csv';
    options?: ExportOptions;
    Promise(): any;
}
export declare const useCorrectionsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CorrectionsState>>;
export {};
//# sourceMappingURL=correctionsStore.d.ts.map