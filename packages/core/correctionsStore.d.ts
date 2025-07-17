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
    status: 'draft' | 'published' | 'deprecated';
    approvedBy?: string;
    approvedAt?: Date;
    deprecatedAt?: Date;
    deprecationReason?: string;
    suggestedBy?: string;
    suggestionReason?: string;
    category?: string;
    tags?: string[];
    usageCount?: number;
    lastUsedAt?: Date;
    effectivenessScore?: number;
    userRating?: number;
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
    approveRule: (id: string, approvedBy: string) => void;
    deprecateRule: (id: string, reason: string) => void;
    suggestRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>, suggestedBy: string, reason: string) => void;
    applyCorrections: (text: string) => string;
    getActiveRules: () => CorrectionRule[];
    getDraftRules: () => CorrectionRule[];
    getPublishedRules: () => CorrectionRule[];
    notificationSettings: {
        onRuleUpdates: boolean;
        onEffectivenessAlerts: boolean;
        onSuggestions: boolean;
    };
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    dismissNotification: (id: string) => void;
    clearNotifications: () => void;
}
export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionUrl?: string;
    ruleId?: string;
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