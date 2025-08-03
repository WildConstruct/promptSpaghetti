;
confidence: number;
label ?  : string;
;
connectionPattern: ConnectionPattern;
nodeConfiguration: {
    ;
    autoConnect: boolean;
    useSmartPositioning: boolean;
    preserveUserNodes: boolean;
}
;
validation: {
    enableStrictValidation: boolean;
    allowDuplicateConnections: boolean;
    maxNodesPerGeneration: number;
}
;
performance: {
    batchSize: number;
    useProgressiveGeneration: boolean;
    enablePerformanceTracking: boolean;
}
;
;
options: GenerationOptions;
validation: {
    ;
    isValid: boolean;
    errors: ValidationError;
    warnings: ValidationWarning;
}
;
statistics: {
    averageNodeConfidence: number;
    layoutEfficiency: number;
    connectionDensity: number;
    complexityScore: number;
}
;
suggestions: string;
recommendation: string;
;
efficiency: number; // 0-100, higher is better
overlaps: number;
;
validation: {
    validConnections: number;
    invalidConnections: number;
    duplicateConnections: number;
}
;
;
rendering: {
    defaultSize: {
        width: number;
        height: number;
    }
    ;
    iconClass: string;
    colorScheme: string;
}
;
;
userPreferences: {
    defaultLayout: LayoutType;
    preferredSpacing: number;
    autoSaveEnabled: boolean;
}
;
performance: {
    memoryUsageMB: number;
    renderTimeMs: number;
    validationTimeMs: number;
}
;
;
metadata: {
    description: string;
    canUndo: boolean;
    canRedo: boolean;
}
;
;
filters: {
    nodeTypes: string;
    excludeSystemNodes: boolean;
    includeHiddenEdges: boolean;
}
;
;
layoutStats: {
    preferredLayouts: Record;
    averageLayoutTimeMs: Record;
    layoutEfficiencyScores: Record;
}
;
userStats: {
    averageNodesPerGeneration: number;
    mostUsedNodeTypes: Record;
    commonValidationErrors: Record;
}
;
;
/**
 * Default values and constants
 */
/**
 * Error codes for validation and generation
 */
export const ERROR_CODES = { INVALID_INPUT: 'INVALID_INPUT',
    GENERATION_FAILED: 'GENERATION_FAILED',
    LAYOUT_ERROR: 'LAYOUT_ERROR',
    CONNECTION_ERROR: 'CONNECTION_ERROR',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    PERFORMANCE_LIMIT: 'PERFORMANCE_LIMIT',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    TIMEOUT: 'TIMEOUT' };
as;
const ;
