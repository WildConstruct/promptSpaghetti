import { useCallback, useState } from 'react';
/**
 * Custom hook for managing per-node disclosure preferences
 * @param nodeId - The unique ID of the node
 * @param nodeType - The type of node (e.g., 'weighted-choice', 'output', etc.)
 */
export const useNodeDisclosureControl = (nodeId, nodeType) => {
  const nodePrefs = getEffectiveNodePreferences(nodeId, nodeType);
  // Set disclosure level for this specific node
  const setDisclosureLevel = useCallback(
    level => {
      setNodeDisclosureLevel(nodeId, level);
    },
    [nodeId, setNodeDisclosureLevel]
  );
  // Toggle whether to use global default
  const setUseGlobalDefault = useCallback(
    useGlobal => {
      setNodeUseGlobalDefault(nodeId, useGlobal);
    },
    [nodeId, setNodeUseGlobalDefault]
  );
  // Check if a section should be shown at current disclosure level
  const shouldShowSection = useCallback(
    sectionLevel => {
      const levelValues = { basic: 1, advanced: 2, debug: 3 };
      return levelValues[disclosureLevel] >= levelValues[sectionLevel];
    },
    [disclosureLevel]
  );
  // Get section visibility for common patterns
  const isBasicMode = disclosureLevel === 'basic';
  const isAdvancedMode = disclosureLevel === 'advanced' || disclosureLevel === 'debug';
  const isDebugMode = disclosureLevel === 'debug';
  // Check if field should be visible based on classification
  const shouldShowField = useCallback((fieldName, fieldLevel) => {
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
        return shouldShowSection(fieldLevel);
      }
      [shouldShowSection];
    }
  });
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
    shouldShowField,
  };
};
/**
 * Hook for components that need to render progressive disclosure sections
 */
export const useDisclosurePreferences = () => {
  const [preferenceInheritance, setPreferenceInheritance] = useState('global');
  const setGlobalLevel = useCallback(
    level => {
      setGlobalDisclosureLevel(level);
    },
    [setGlobalDisclosureLevel]
  );
  const setInheritance = useCallback(
    inheritance => {
      setPreferenceInheritance(inheritance);
    },
    [setPreferenceInheritance]
  );
  return {
    globalDisclosureLevel,
    preferenceInheritance,
    setGlobalLevel,
    setInheritance,
  };
};
