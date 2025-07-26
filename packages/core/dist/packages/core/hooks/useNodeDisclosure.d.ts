/**
 * Custom hook for managing per-node disclosure preferences
 * @param nodeId - The unique ID of the node
 * @param nodeType - The type of node (e.g., 'weighted-choice', 'output', etc.)
 */
export declare     nodePrefs: any;
    isBasicMode: boolean;
    isAdvancedMode: boolean;
    isDebugMode: boolean;
    globalDisclosureLevel: any;
    preferenceInheritance: any;
    setDisclosureLevel: (level: "basic" | "advanced" | "debug") => void;
    setUseGlobalDefault: (useGlobal: boolean) => void;
    shouldShowSection: (sectionLevel: "basic" | "advanced" | "debug") => boolean;
    shouldShowField: (fieldName: string, fieldLevel?: "basic" | "advanced" | "debug") => boolean;
};
/**
 * Hook for components that need to render progressive disclosure sections
 */
export declare     preferenceInheritance: "global" | "nodeType" | "individual";
    setGlobalLevel: (level: "basic" | "advanced" | "debug") => void;
    setInheritance: (inheritance: "global" | "nodeType" | "individual") => void;
};
//# sourceMappingURL=useNodeDisclosure.d.ts.map