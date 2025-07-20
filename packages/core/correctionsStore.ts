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
  
  // Application
  applyCorrections: (text: string) => string;
  getActiveRules: () => CorrectionRule[];
}

export const useCorrectionsStore = create<CorrectionsState>()(
  devtools(
    persist(
      (set, get) => ({
        rules: [],
        isEnabled: process.env.NODE_ENV === 'development' || process.env.ENABLE_CORRECTIONS === 'true',
        
        addRule: (ruleData) => {
          const newRule: CorrectionRule = {
            ...ruleData,
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            rules: [...state.rules, newRule].sort((a, b) => a.priority - b.priority)
          }));
        },
        
        updateRule: (id, updates) => {
          set((state) => ({
            rules: state.rules.map((rule) =>
              rule.id === id
                ? { ...rule, ...updates, updatedAt: new Date() }
                : rule
            )
          }));
        },
        
        deleteRule: (id) => {
          set((state) => ({
            rules: state.rules.filter((rule) => rule.id !== id)
          }));
        },
        
        toggleRule: (id) => {
          set((state) => ({
            rules: state.rules.map((rule) =>
              rule.id === id
                ? { ...rule, isActive: !rule.isActive, updatedAt: new Date() }
                : rule
            )
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
                updatedAt: new Date()
              }))
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
          return rules.filter((rule) => rule.isActive).sort((a, b) => a.priority - b.priority);
        }
      }),
      {
        name: 'corrections-store',
        // Only persist if corrections are enabled
        skipHydration: !process.env.ENABLE_CORRECTIONS
      }
    ),
    {
      name: 'corrections-store'
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
    priority: 1
  },
  {
    name: 'Fix Trailing Whitespace',
    description: 'Remove trailing whitespace',
    findPattern: ' +$',
    replaceWith: '',
    isRegex: true,
    isActive: true,
    priority: 2
  },
  {
    name: 'Fix Leading Whitespace',
    description: 'Remove leading whitespace',
    findPattern: '^ +',
    replaceWith: '',
    isRegex: true,
    isActive: true,
    priority: 3
  },
  {
    name: 'Common Typo: "teh" → "the"',
    description: 'Fix common typo',
    findPattern: 'teh',
    replaceWith: 'the',
    isRegex: false,
    isActive: true,
    priority: 10
  },
  {
    name: 'Common Typo: "recieve" → "receive"',
    description: 'Fix common typo',
    findPattern: 'recieve',
    replaceWith: 'receive',
    isRegex: false,
    isActive: true,
    priority: 11
  }
];