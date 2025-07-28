/**
 * Node Generation Types
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Comprehensive type definitions for the automated node generation system
 */
import { Node, Edge, Position } from 'reactflow';
/**
 * Request parameters for node generation
 */
export interface NodeGenerationRequest {
    analysisResult: PromptAnalysisResult;
    selectedSuggestions: NodeSuggestion;
    canvasPosition: Position;
    options: GenerationOptions;
}
export interface PromptAnalysisResult {
    prompt: string;
    suggestions: NodeSuggestion;
    confidence: number;
    analysisMetadata: {
        processingTimeMs: number;
        complexity: 'simple' | 'moderate' | 'complex';
        suggestedLayout: LayoutType;
        estimatedNodes: number;
    };
}
export interface NodeSuggestion {
    id: string;
    nodeType: string;
    title: string;
    description: string;
    confidence: number;
    suggestedPosition: Position;
    nodeData: Record<string, unknown>;
    connections: SuggestedConnection;
    metadata: {
        category: 'content' | 'logic' | 'output' | 'variable';
        priority: 'high' | 'medium' | 'low';
        estimatedComplexity: number;
    };
}
export interface SuggestedConnection {
    fromNodeId: string;
    toNodeId: string;
    connectionType: 'direct' | 'conditional' | 'weighted';
    confidence: number;
    label?: string;
}
export interface GenerationOptions {
    layout: LayoutType;
    spacing: {
        horizontal: number;
        vertical: number;
    };
    connectionPattern: ConnectionPattern;
    nodeConfiguration: {
        autoConnect: boolean;
        useSmartPositioning: boolean;
        preserveUserNodes: boolean;
    };
    validation: {
        enableStrictValidation: boolean;
        allowDuplicateConnections: boolean;
        maxNodesPerGeneration: number;
    };
    performance: {
        batchSize: number;
        useProgressiveGeneration: boolean;
        enablePerformanceTracking: boolean;
    };
}
export type LayoutType = 'linear' | 'hierarchical' | 'radial' | 'force-directed' | 'grid';
/**
 * Connection patterns for linking generated nodes
 */
export type ConnectionPattern = 'sequential' | 'branching' | 'hub-and-spoke' | 'mesh' | 'workflow' | 'custom';
/**
 * Complete generated graph result
 */
export interface GeneratedGraph {
    nodes: Node;
    edges: Edge;
    metadata: GenerationMetadata;
}
export interface GenerationMetadata {
    generationId: string;
    timestamp: Date;
    performance: {
        totalTimeMs: number;
        nodesGenerated: number;
        edgesGenerated: number;
        layoutTimeMs: number;
        validationTimeMs: number;
    };
    options: GenerationOptions;
    validation: {
        isValid: boolean;
        errors: ValidationError;
        warnings: ValidationWarning;
    };
    statistics: {
        averageNodeConfidence: number;
        layoutEfficiency: number;
        connectionDensity: number;
        complexityScore: number;
    };
}
export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
    edgeId?: string;
    severity: 'error' | 'warning';
    suggestions: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    nodeId?: string;
    edgeId?: string;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
}
export interface LayoutResult {
    positions: Map<string, Position>;
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    efficiency: number;
    overlaps: number;
}
export interface ConnectionResult {
    edges: Edge;
    patterns: {
        sequential: number;
        branching: number;
        cyclical: number;
    };
    validation: {
        validConnections: number;
        invalidConnections: number;
        duplicateConnections: number;
    };
}
export interface NodeFactoryConfig {
    nodeType: string;
    defaultData: Record<string, unknown>;
    validation: {
        requiredFields: string;
        optionalFields: string;
        constraints: Record<string, unknown>;
    };
    rendering: {
        defaultSize: {
            width: number;
            height: number;
        };
        iconClass: string;
        colorScheme: string;
    };
}
export interface GenerationProgress {
    stage: 'analyzing' | 'layouting' | 'connecting' | 'validating' | 'finalizing';
    progress: number;
    currentStep: string;
    estimatedTimeRemainingMs: number;
    nodesProcessed: number;
    totalNodes: number;
}
export interface GenerationContext {
    requestId: string;
    startTime: Date;
    canvas: {
        existingNodes: Node;
        existingEdges: Edge;
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    };
    userPreferences: {
        defaultLayout: LayoutType;
        preferredSpacing: number;
        autoSaveEnabled: boolean;
    };
    performance: {
        memoryUsageMB: number;
        renderTimeMs: number;
        validationTimeMs: number;
    };
}
export interface GenerationOperation {
    type: 'generate' | 'delete' | 'modify';
    operationId: string;
    timestamp: Date;
    data: {
        nodesAffected: string;
        edgesAffected: string;
        beforeState: Record<string, unknown>;
        afterState: Record<string, unknown>;
    };
    metadata: {
        description: string;
        canUndo: boolean;
        canRedo: boolean;
    };
}
export interface ExportConfiguration {
    format: 'json' | 'yaml' | 'graphml' | 'dot' | 'svg';
    options: {
        includeMetadata: boolean;
        includePerformanceData: boolean;
        compressOutput: boolean;
        validateBeforeExport: boolean;
    };
    filters: {
        nodeTypes: string;
        excludeSystemNodes: boolean;
        includeHiddenEdges: boolean;
    };
}
export interface PerformanceMetrics {
    generationStats: {
        totalGenerations: number;
        averageGenerationTimeMs: number;
        peakMemoryUsageMB: number;
        errorRate: number;
    };
    layoutStats: {
        preferredLayouts: Record<LayoutType, number>;
        averageLayoutTimeMs: Record<LayoutType, number>;
        layoutEfficiencyScores: Record<LayoutType, number>;
    };
    userStats: {
        averageNodesPerGeneration: number;
        mostUsedNodeTypes: Record<string, number>;
        commonValidationErrors: Record<string, number>;
    };
}
export interface SecurityConstraints {
    maxNodesPerRequest: number;
    maxPromptLength: number;
    maxGenerationTimeMs: number;
    allowedNodeTypes: string;
    restrictedOperations: string;
    validationRules: {
        requireInputValidation: boolean;
        sanitizeUserContent: boolean;
        enforceRateLimiting: boolean;
    };
}
export declare const ERROR_CODES: {
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly GENERATION_FAILED: "GENERATION_FAILED";
    readonly LAYOUT_ERROR: "LAYOUT_ERROR";
    readonly CONNECTION_ERROR: "CONNECTION_ERROR";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly PERFORMANCE_LIMIT: "PERFORMANCE_LIMIT";
    readonly SECURITY_VIOLATION: "SECURITY_VIOLATION";
    readonly TIMEOUT: "TIMEOUT";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
//# sourceMappingURL=NodeGenerationTypes.d.ts.map