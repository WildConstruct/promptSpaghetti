import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  
  // Lifecycle management
  status: 'draft' | 'published' | 'deprecated';
  approvedBy?: string;
  approvedAt?: Date;
  deprecatedAt?: Date;
  deprecationReason?: string;
  
  // Workflow features
  suggestedBy?: string;
  suggestionReason?: string;
  category?: string;
  tags?: string[];
  
  // Usage statistics
  usageCount?: number;
  lastUsedAt?: Date;
  effectivenessScore?: number;
  userRating?: number;
}

interface CorrectionsState {
  rules: CorrectionRule[];
  isEnabled: boolean;
  
  // Actions
  addRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, updates: Partial<CorrectionRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  reorderRules: (fromIndex: number, toIndex: number) => void;
  clearAllRules: () => void;
  
  // Lifecycle management
  approveRule: (id: string, approvedBy: string) => void;
  deprecateRule: (id: string, reason: string) => void;
  suggestRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>, suggestedBy: string, reason: string) => void;
  
  // Application
  applyCorrections: (text: string) => string;
  getActiveRules: () => CorrectionRule[];
  getDraftRules: () => CorrectionRule[];
  getPublishedRules: () => CorrectionRule[];
  
  // Workflow features
  notificationSettings: {
    onRuleUpdates: boolean;
    onEffectivenessAlerts: boolean;
    onSuggestions: boolean;
  };
  notifications: Notification[];
  
  // Notification actions
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

export const useCorrectionsStore = create<CorrectionsState>()(
  devtools(
    persist(
      (set, get) => ({
        rules: [],
        isEnabled: process.env.NODE_ENV === 'development' || process.env.ENABLE_CORRECTIONS === 'true',
        
        // Notification system
        notificationSettings: {
          onRuleUpdates: true,
          onEffectivenessAlerts: true,
          onSuggestions: true,
        },
        notifications: [],
        
        addRule: (ruleData) => {
          const newRule: CorrectionRule = {
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
          
          // Add notification for new rule
          get().addNotification({
            type: 'info',
            title: 'New Rule Created',
            message: `Rule "${newRule.name}" has been created and is in draft status.`,
            ruleId: newRule.id,
            isRead: false,
          });
        },
        
        updateRule: (id, updates) => {
          set((state) => ({
            rules: state.rules.map((rule) =>
              rule.id === id
                ? { ...rule, ...updates, updatedAt: new Date() }
                : rule
            ),
          }));
        },
        
        deleteRule: (id) => {
          set((state) => ({
            rules: state.rules.filter((rule) => rule.id !== id),
          }));
        },
        
        toggleRule: (id) => {
          set((state) => ({
            rules: state.rules.map((rule) =>
              rule.id === id
                ? { ...rule, isActive: !rule.isActive, updatedAt: new Date() }
                : rule
            ),
          }));
        },
        
        reorderRules: (fromIndex, toIndex) => {
          set((state) => {
            const newRules = [...state.rules];
            const [movedRule] = newRules.splice(fromIndex, 1);
            newRules.splice(toIndex, 0, movedRule);
            
            // Update priorities to match new order
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
        
        applyCorrections: (text: string) => {
          const { rules } = get();
          
          // Check if corrections are enabled dynamically
          const isEnabled = process.env.NODE_ENV === 'development' || 
                           process.env.REACT_APP_ENABLE_CORRECTIONS === 'true' ||
                           process.env.ENABLE_CORRECTIONS === 'true';
          
          if (!isEnabled) return text;
          
          return rules
            .filter((rule) => rule.isActive)
            .sort((a, b) => a.priority - b.priority)
            .reduce((currentText, rule) => {
              try {
                if (rule.isRegex) {
                  const regex = new RegExp(rule.findPattern, 'g');
                  return currentText.replace(regex, rule.replaceWith);
                } else {
                  return currentText.replace(new RegExp(escapeRegExp(rule.findPattern), 'g'), rule.replaceWith);
                }
              } catch (error) {
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
        
        // Lifecycle management
        approveRule: (id: string, approvedBy: string) => {
          set((state) => ({
            rules: state.rules.map(rule => 
              rule.id === id 
                ? { 
                    ...rule, 
                    status: 'published' as const,
                    approvedBy,
                    approvedAt: new Date(),
                    updatedAt: new Date(),
                  }
                : rule
            ),
          }));
          
          const rule = get().rules.find(r => r.id === id);
          if (rule) {
            get().addNotification({
              type: 'success',
              title: 'Rule Approved',
              message: `Rule "${rule.name}" has been approved and is now active.`,
              ruleId: id,
              isRead: false,
            });
          }
        },
        
        deprecateRule: (id: string, reason: string) => {
          set((state) => ({
            rules: state.rules.map(rule => 
              rule.id === id 
                ? { 
                    ...rule, 
                    status: 'deprecated' as const,
                    deprecatedAt: new Date(),
                    deprecationReason: reason,
                    isActive: false,
                    updatedAt: new Date(),
                  }
                : rule
            ),
          }));
          
          const rule = get().rules.find(r => r.id === id);
          if (rule) {
            get().addNotification({
              type: 'warning',
              title: 'Rule Deprecated',
              message: `Rule "${rule.name}" has been deprecated: ${reason}`,
              ruleId: id,
              isRead: false,
            });
          }
        },
        
        suggestRule: (ruleData, suggestedBy: string, reason: string) => {
          const newRule: CorrectionRule = {
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
            isRead: false,
          });
        },
        
        // Notification system
        addNotification: (notificationData) => {
          const notification: Notification = {
            ...notificationData,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            isRead: false,
          };
          
          set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50), // Keep only last 50
          }));
        },
        
        dismissNotification: (id: string) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        },
        
        clearNotifications: () => {
          set({ notifications: [] });
        },
      }),
      {
        name: 'corrections-store',
        // Only persist if corrections are enabled
        skipHydration: !process.env.ENABLE_CORRECTIONS,
      }
    ),
    {
      name: 'corrections-store',
    }
  )
);

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Hook to check if corrections feature is enabled
export const useCorrectionsEnabled = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENABLE_CORRECTIONS === 'true' ||
         process.env.ENABLE_CORRECTIONS === 'true';
};

// Default correction rules for common issues
export const DEFAULT_CORRECTION_RULES: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Fix Double Spaces',
    description: 'Remove double spaces',
    findPattern: '  +',
    replaceWith: ' ',
    isRegex: true,
    isActive: true,
    priority: 1,
    status: 'published',
  },
  {
    name: 'Fix Trailing Whitespace',
    description: 'Remove trailing whitespace',
    findPattern: ' +$',
    replaceWith: '',
    isRegex: true,
    isActive: true,
    priority: 2,
    status: 'published',
  },
  {
    name: 'Fix Leading Whitespace',
    description: 'Remove leading whitespace',
    findPattern: '^ +',
    replaceWith: '',
    isRegex: true,
    isActive: true,
    priority: 3,
    status: 'published',
  },
  {
    name: 'Common Typo: "teh" → "the"',
    description: 'Fix common typo',
    findPattern: 'teh',
    replaceWith: 'the',
    isRegex: false,
    isActive: true,
    priority: 10,
    status: 'published',
  },
  {
    name: 'Common Typo: "recieve" → "receive"',
    description: 'Fix common typo',
    findPattern: 'recieve',
    replaceWith: 'receive',
    isRegex: false,
    isActive: true,
    priority: 11,
    status: 'published',
  },
];