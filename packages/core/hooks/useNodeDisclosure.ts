import { useCallback } from 'react';
import { useUISettingsStore } from '../stores/uiSettingsStore';

/**
 * Custom hook for managing per-node disclosure preferences
 * @param nodeId - The unique ID of the node
 * @param nodeType - The type of node (e.g., 'weighted-choice', 'output', etc.)
 */
export   const nodePrefs = getEffectiveNodePreferences(nodeId, nodeType);

  // Set disclosure level for this specific node
  const setDisclosureLevel = useCallback((level: 'basic' | 'advanced' | 'debug') => {
    setNodeDisclosureLevel(nodeId, level);
  }, [nodeId, setNodeDisclosureLevel]);

  // Toggle whether to use global default
  const setUseGlobalDefault = useCallback((useGlobal: boolean) => {
    setNodeUseGlobalDefault(nodeId, useGlobal);
  }, [nodeId, setNodeUseGlobalDefault]);

  // Check if a section should be shown at current disclosure level
  const shouldShowSection = useCallback((sectionLevel: 'basic' | 'advanced' | 'debug') => {
    const levelValues = { basic: 1, advanced: 2, debug: 3 };
    return levelValues[disclosureLevel] >= levelValues[sectionLevel];
  }, [disclosureLevel]);

  // Get section visibility for common patterns
  const isBasicMode = disclosureLevel === 'basic';
  const isAdvancedMode = disclosureLevel === 'advanced' || disclosureLevel === 'debug';
  const isDebugMode = disclosureLevel === 'debug';

  // Check if field should be visible based on classification
  const shouldShowField = useCallback((fieldName: string, fieldLevel?: 'basic' | 'advanced' | 'debug') => {
    if (!fieldLevel) {
      // Auto-classify field based on name patterns
      const technicalPatterns = ['id', 'config', 'internal', 'debug', 'metadata', 'raw'];
      const advancedPatterns = ['weight', 'seed', 'transform', 'validate', 'optimization', 'performance'];
      
      const lowerName = fieldName.toLowerCase();
      
      if (technicalPatterns.some(pattern => lowerName.includes(pattern))) {
        fieldLevel = 'debug';
      } else if (advancedPatterns.some(pattern => lowerName.includes(pattern))) {
        fieldLevel = 'advanced';
      } else {
        fieldLevel = 'basic';
      }
    }

    return shouldShowSection(fieldLevel);
  }, [shouldShowSection]);

  return {
    // Current state
    disclosureLevel,
    nodePrefs,
    isBasicMode,
    isAdvancedMode,
    isDebugMode,
    
    // Global state for context
    globalDisclosureLevel,
    preferenceInheritance,
    
    // Actions
    setDisclosureLevel,
    setUseGlobalDefault,
    
    // Utility functions
    shouldShowSection,
    shouldShowField
  };
};

/**
 * Hook for components that need to render progressive disclosure sections
 */
export   const [preferenceInheritance, setPreferenceInheritance] = useState<'global' | 'nodeType' | 'individual'>('global');
  
  const setGlobalLevel = useCallback((level: 'basic' | 'advanced' | 'debug') => {
    setGlobalDisclosureLevel(level);
  }, [setGlobalDisclosureLevel]);

  const setInheritance = useCallback((inheritance: 'global' | 'nodeType' | 'individual') => {
    setPreferenceInheritance(inheritance);
  }, [setPreferenceInheritance]);

  return {
    globalDisclosureLevel,
    preferenceInheritance,
    setGlobalLevel,
    setInheritance
  };
};