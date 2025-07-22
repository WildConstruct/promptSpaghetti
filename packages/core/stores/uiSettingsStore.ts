import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UISettings {
  // Professional Interface Settings
  debugMode: boolean;           // Shows technical fields when true
  professionalUI: boolean;      // Uses professional color scheme and typography
  showTechnicalDetails: boolean; // Shows IDs, internal configs, etc.
  
  // Progressive Disclosure Settings
  complexityLevel: 'basic' | 'advanced' | 'expert';
  hideAdvancedFeatures: boolean;
  
  // Visual Settings
  theme: 'light' | 'dark' | 'cinema4d';
  compactMode: boolean;
  showNodeIcons: boolean;
  
  // Demo Settings
  demoMode: boolean;           // Optimizes for presentation/demo
  hideAllTechnicalUI: boolean; // Forces all technical UI hidden
}

interface UISettingsState extends UISettings {
  // Actions
  setDebugMode: (enabled: boolean) => void;
  setProfessionalUI: (enabled: boolean) => void;
  setShowTechnicalDetails: (enabled: boolean) => void;
  setComplexityLevel: (level: 'basic' | 'advanced' | 'expert') => void;
  setTheme: (theme: 'light' | 'dark' | 'cinema4d') => void;
  setDemoMode: (enabled: boolean) => void;
  
  // Computed getters
  shouldShowTechnicalFields: () => boolean;
  shouldShowAdvancedFeatures: () => boolean;
  getEffectiveTheme: () => 'light' | 'dark' | 'cinema4d';
  
  // Presets
  applyFilmmakerPreset: () => void;
  applyDeveloperPreset: () => void;
  applyDemoPreset: () => void;
}

const DEFAULT_SETTINGS: UISettings = {
  debugMode: false,
  professionalUI: true,
  showTechnicalDetails: false,
  complexityLevel: 'basic',
  hideAdvancedFeatures: false,
  theme: 'dark',
  compactMode: false,
  showNodeIcons: true,
  demoMode: false,
  hideAllTechnicalUI: false,
};

export         if (state.hideAllTechnicalUI || state.demoMode) return false;
        return state.debugMode || state.showTechnicalDetails;
      },

      shouldShowAdvancedFeatures: () => {
        const state = get();
        if (state.hideAllTechnicalUI || state.demoMode) return false;
        if (state.hideAdvancedFeatures) return false;
        return state.complexityLevel !== 'basic';
      },

      getEffectiveTheme: () => {
        const state = get();
        if (state.professionalUI && state.theme === 'dark') {
          return 'cinema4d'; // Use professional dark theme
        }
        return state.theme;
      },

      // Presets
      applyFilmmakerPreset: () => set({
        professionalUI: true,
        debugMode: false,
        showTechnicalDetails: false,
        complexityLevel: 'basic',
        hideAdvancedFeatures: true,
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
        hideAdvancedFeatures: false,
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
        hideAdvancedFeatures: true,
        theme: 'cinema4d',
        compactMode: false,
        showNodeIcons: true,
        demoMode: true,
        hideAllTechnicalUI: true,
      }),
    }),
    {
      name: 'ui-settings-storage',
      version: 1,
    }
  )
);

// Helper function to check if field should be shown based on current settings
export   
  // Always hide technical fields like 'id', 'nodeId', 'internalConfig', etc.
  const technicalFields = ['id', 'nodeId', 'internalId', 'config', '_internal', 'metadata'];
  if (technicalFields.some(tech => fieldName.toLowerCase().includes(tech.toLowerCase()))) {
    return store.shouldShowTechnicalFields();
  }
  
  // Hide advanced fields based on complexity level
  if (fieldType === 'advanced') {
    return store.shouldShowAdvancedFeatures();
  }
  
  // Always show basic fields
  return true;
};

// Field classification helper
export   const advancedPatterns = ['weight', 'seed', 'transform', 'validate', 'optimization'];
  
  const lowerName = fieldName.toLowerCase();
  
  if (technicalPatterns.some(pattern => lowerName.includes(pattern))) {
    return 'technical';
  }
  
  if (advancedPatterns.some(pattern => lowerName.includes(pattern))) {
    return 'advanced';
  }
  
  return 'basic';
};