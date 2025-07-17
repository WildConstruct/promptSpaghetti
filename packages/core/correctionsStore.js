"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CORRECTION_RULES = exports.useCorrectionsEnabled = exports.useCorrectionsStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useCorrectionsStore = (0, zustand_1.create)()((0, middleware_1.devtools)((0, middleware_1.persist)((set, get) => ({
    rules: [],
    isEnabled: process.env.NODE_ENV === 'development' || process.env.ENABLE_CORRECTIONS === 'true',
    notificationSettings: {
        onRuleUpdates: true,
        onEffectivenessAlerts: true,
        onSuggestions: true,
    },
    notifications: [],
    addRule: (ruleData) => {
        const newRule = {
            ...ruleData,
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft',
            usageCount: 0,
            tags: ruleData.tags || [],
        };
        set((state) => ({
            rules: [...state.rules, newRule].sort((a, b) => a.priority - b.priority),
        }));
        get().addNotification({
            type: 'info',
            title: 'New Rule Created',
            message: `Rule "${newRule.name}" has been created and is in draft status.`,
            ruleId: newRule.id,
        });
    },
    updateRule: (id, updates) => {
        set((state) => ({
            rules: state.rules.map((rule) => rule.id === id
                ? { ...rule, ...updates, updatedAt: new Date() }
                : rule),
        }));
    },
    deleteRule: (id) => {
        set((state) => ({
            rules: state.rules.filter((rule) => rule.id !== id),
        }));
    },
    toggleRule: (id) => {
        set((state) => ({
            rules: state.rules.map((rule) => rule.id === id
                ? { ...rule, isActive: !rule.isActive, updatedAt: new Date() }
                : rule),
        }));
    },
    reorderRules: (fromIndex, toIndex) => {
        set((state) => {
            const newRules = [...state.rules];
            const [movedRule] = newRules.splice(fromIndex, 1);
            newRules.splice(toIndex, 0, movedRule);
            return {
                rules: newRules.map((rule, index) => ({
                    ...rule,
                    priority: index,
                    updatedAt: new Date(),
                })),
            };
        });
    },
    clearAllRules: () => {
        set({ rules: [] });
    },
    applyCorrections: (text) => {
        const { rules } = get();
        const isEnabled = process.env.NODE_ENV === 'development' ||
            process.env.REACT_APP_ENABLE_CORRECTIONS === 'true' ||
            process.env.ENABLE_CORRECTIONS === 'true';
        if (!isEnabled)
            return text;
        return rules
            .filter((rule) => rule.isActive)
            .sort((a, b) => a.priority - b.priority)
            .reduce((currentText, rule) => {
            try {
                if (rule.isRegex) {
                    const regex = new RegExp(rule.findPattern, 'g');
                    return currentText.replace(regex, rule.replaceWith);
                }
                else {
                    return currentText.replace(new RegExp(escapeRegExp(rule.findPattern), 'g'), rule.replaceWith);
                }
            }
            catch (error) {
                console.warn(`Error applying correction rule "${rule.name}":`, error);
                return currentText;
            }
        }, text);
    },
    getActiveRules: () => {
        const { rules } = get();
        return rules.filter((rule) => rule.isActive && rule.status === 'published').sort((a, b) => a.priority - b.priority);
    },
    getDraftRules: () => {
        const { rules } = get();
        return rules.filter((rule) => rule.status === 'draft');
    },
    getPublishedRules: () => {
        const { rules } = get();
        return rules.filter((rule) => rule.status === 'published');
    },
    approveRule: (id, approvedBy) => {
        set((state) => ({
            rules: state.rules.map(rule => rule.id === id
                ? {
                    ...rule,
                    status: 'published',
                    approvedBy,
                    approvedAt: new Date(),
                    updatedAt: new Date(),
                }
                : rule),
        }));
        const rule = get().rules.find(r => r.id === id);
        if (rule) {
            get().addNotification({
                type: 'success',
                title: 'Rule Approved',
                message: `Rule "${rule.name}" has been approved and is now active.`,
                ruleId: id,
            });
        }
    },
    deprecateRule: (id, reason) => {
        set((state) => ({
            rules: state.rules.map(rule => rule.id === id
                ? {
                    ...rule,
                    status: 'deprecated',
                    deprecatedAt: new Date(),
                    deprecationReason: reason,
                    isActive: false,
                    updatedAt: new Date(),
                }
                : rule),
        }));
        const rule = get().rules.find(r => r.id === id);
        if (rule) {
            get().addNotification({
                type: 'warning',
                title: 'Rule Deprecated',
                message: `Rule "${rule.name}" has been deprecated: ${reason}`,
                ruleId: id,
            });
        }
    },
    suggestRule: (ruleData, suggestedBy, reason) => {
        const newRule = {
            ...ruleData,
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft',
            suggestedBy,
            suggestionReason: reason,
            usageCount: 0,
            tags: ruleData.tags || [],
        };
        set((state) => ({
            rules: [...state.rules, newRule].sort((a, b) => a.priority - b.priority),
        }));
        get().addNotification({
            type: 'info',
            title: 'New Rule Suggested',
            message: `Rule "${newRule.name}" has been suggested: ${reason}`,
            ruleId: newRule.id,
        });
    },
    addNotification: (notificationData) => {
        const notification = {
            ...notificationData,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            isRead: false,
        };
        set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50),
        }));
    },
    dismissNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
        }));
    },
    clearNotifications: () => {
        set({ notifications: [] });
    },
}), {
    name: 'corrections-store',
    skipHydration: !process.env.ENABLE_CORRECTIONS,
}), {
    name: 'corrections-store',
}));
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const useCorrectionsEnabled = () => {
    return process.env.NODE_ENV === 'development' ||
        process.env.REACT_APP_ENABLE_CORRECTIONS === 'true' ||
        process.env.ENABLE_CORRECTIONS === 'true';
};
exports.useCorrectionsEnabled = useCorrectionsEnabled;
exports.DEFAULT_CORRECTION_RULES = [
    {
        name: 'Fix Double Spaces',
        description: 'Remove double spaces',
        findPattern: '  +',
        replaceWith: ' ',
        isRegex: true,
        isActive: true,
        priority: 1,
    },
    {
        name: 'Fix Trailing Whitespace',
        description: 'Remove trailing whitespace',
        findPattern: ' +$',
        replaceWith: '',
        isRegex: true,
        isActive: true,
        priority: 2,
    },
    {
        name: 'Fix Leading Whitespace',
        description: 'Remove leading whitespace',
        findPattern: '^ +',
        replaceWith: '',
        isRegex: true,
        isActive: true,
        priority: 3,
    },
    {
        name: 'Common Typo: "teh" → "the"',
        description: 'Fix common typo',
        findPattern: 'teh',
        replaceWith: 'the',
        isRegex: false,
        isActive: true,
        priority: 10,
    },
    {
        name: 'Common Typo: "recieve" → "receive"',
        description: 'Fix common typo',
        findPattern: 'recieve',
        replaceWith: 'receive',
        isRegex: false,
        isActive: true,
        priority: 11,
    },
];
//# sourceMappingURL=correctionsStore.js.map