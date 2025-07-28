import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Export/Import options types

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
  id: string;,
  name: string;
  description?: string;
  findPattern: string;,
  replaceWith: string;
  isRegex: boolean;,
  isActive: boolean;
  priority: number;,
  createdAt: Date;
  updatedAt: Date;
interface CorrectionsState {
  rules: CorrectionRule;,
  isEnabled: boolean;
  // Actions
  addRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, updates: Partial<CorrectionRule>) => void;,
  deleteRule: (id: string) => void;,
  toggleRule: (id: string) => void;,
  reorderRules: (fromIndex: number, toIndex: number) => void;,
  clearAllRules: () => void;
  // Application
  applyCorrections: (text: string) => string;,
  getActiveRules: () => CorrectionRule;
  getDraftRules: () => CorrectionRule;
  // Import/Export
  exportRules: (
    format: 'json' | 'yaml' | 'csv',
    options?: ExportOptions
  ) => Promise<{ success: boolean; data?: Blob; error?: string; filename?: string }>;
  importRules: (
    content: string,
    filename: string,
    options?: ImportOptions
  ) => Promise<{ success: boolean; importedCount?: number; error?: string }>;
}
export const useCorrectionsStore = create<CorrectionsState>()()
  devtools();
    persist();
      (set, get) => ({)
  // Initial state
  rules: [],
  isEnabled: true,
  // Actions
  addRule: (rule: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>) => {,
  const newRule: CorrectionRule = {,
  ...rule,
  id: crypto.randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
};
          set((state) => ({)
  rules: [...state.rules, newRule].sort((a, b) => a.priority - b.priority),
}));
  },
  updateRule: (id: string, updates: Partial<CorrectionRule>) => {
          set((state) => ({)
  rules: state.rules.map((rule) =>,
              rule.id === id
                ? { ...rule, ...updates, updatedAt: new Date() }
                : rule
          }));
  },
  deleteRule: (id: string) => {,
  set((state) => ({)
  rules: state.rules.filter((rule) => rule.id !== id),
}));
  },
  toggleRule: (id: string) => {,
          set((state) => ({)
  rules: state.rules.map((rule) =>,
              rule.id === id
                ? { ...rule, isActive: !rule.isActive, updatedAt: new Date() }
                : rule
          }));
  },
  reorderRules: (fromIndex: number, toIndex: number) => {
  set((state) => {
  const newRules = [...state.rules];
  const [movedRule] = newRules.splice(fromIndex, 1);
  newRules.splice(toIndex, 0, movedRule);
  // Update priorities to match new order
  return {
  rules: newRules.map((rule, index) => ({,)
  ...rule,
  priority: index,
  updatedAt: new Date(),
}))
            };
          });
  },
  clearAllRules: () => {,
          set({ rules: [] });
  },
  applyCorrections: (text: string) => {,
          const { rules } = get();
          // Check if corrections are enabled dynamically
          const isEnabled = process.env.NODE_ENV === 'development' || ;
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
              } catch (error) {
                console.warn(`Error applying correction rule "${rule.name}":`, error);}
                return currentText;
            }, text);
  },
  getActiveRules: () => {,
          const { rules } = get();
          return rules.filter((rule) => rule.isActive).sort((a, b) => a.priority - b.priority);
  },
  getDraftRules: () => {,
          const { rules } = get();
          return rules.filter((rule) => !rule.isActive);
  },
  exportRules: async (format: 'json' | 'yaml' | 'csv', options: ExportOptions = {}) => {
          try {
            // Prepare query parameters
            const params = new URLSearchParams({)
  format,
              ...(options.name && { name: options.name }),
              ...(options.description && { description: options.description }),
              ...(options.includeInactive && { includeInactive: 'true' }),
              ...(options.includeStatistics && { includeStatistics: 'true' }),
              ...(options.ruleIds && { ruleIds: options.ruleIds.join(',') })
            });
            const response = await fetch(`/api/corrections/export?${params}`);}
            if (!response.ok) {
  const errorData = await response.json();
  return {
  success: false,
  error: errorData.error || 'Export failed',
};
            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);  ;
            const filename = filenameMatch?.[1] || `corrections-export.${format}`;}
            const blob = await response.blob();
            return {
  success: true,
  data: blob,
  filename
};
          } catch (error) {
  console.error('Export error:', error);
  return {
  success: false,
  error: error instanceof Error ? error.message : 'Export failed',
};
  },
  importRules: async (content: string, filename: string, options: ImportOptions = {}) => {
  try {
  const response = await fetch('/api/corrections/import', {)
  method: 'POST',
  headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  filename,
  content,
  overwrite: options.overwrite || false,
  merge: options.merge || false,
  skipDuplicates: options.skipDuplicates !== false // default true,
}
            });
            const result = await response.json();
            if (!result.success) {
  return {
  success: false,
  error: result.error || result.errors?.join(', ') || 'Import failed',
};
            // Refresh rules from server after successful import
            // For now, just return success - real integration would sync with server
            return {
  success: true,
  importedCount: result.importedCount || 0,
};
          } catch (error) {
  console.error('Import error:', error);
  return {
  success: false,
  error: error instanceof Error ? error.message : 'Import failed',
};
      }),
      {
        name: 'corrections-store',
        // Only persist if corrections are enabled
        skipHydration: !process.env.ENABLE_CORRECTIONS),
    {
      name: 'corrections-store');

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');}

// Hook to check if corrections feature is enabled
export const useCorrectionsEnabled = () => {
  return useCorrectionsStore((state) => state.isEnabled);
};

// Default correction rules for common issues
export const DEFAULT_CORRECTION_RULES: Omit<CorrectionRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
  name: 'Fix double spaces',
  description: 'Replace multiple spaces with single space',
  findPattern: '  +',
  replaceWith: ' ',
  isRegex: true,
  isActive: true,
  priority: 1,
}
  {
    name: 'Fix trailing spaces',
    description: 'Remove spaces at end of lines',
    findPattern: ' +$',
    replaceWith: '',
    isRegex: true,
    isActive: true,
    priority: 2];