/**
 * Graph validation utilities
 * Enhanced validation with cycle detection and comprehensive error reporting
 */
import { GraphDocument } from './types';
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    type: 'MISSING_NODE' | 'CYCLE_DETECTED' | 'INVALID_EDGE' | 'INVALID_DATA' | 'INVALID_NODE_TYPE' | 'MALFORMED_GRAPH';
    message: string;
    nodeId?: string;
    edgeId?: string;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    type: 'DISCONNECTED_NODE' | 'UNUSED_VARIABLE' | 'PERFORMANCE_CONCERN';
    message: string;
    nodeId?: string;
    suggestion?: string;
}
export declare class GraphValidator {
    /**
     * Validate a complete graph document
     */
    validate(graph: GraphDocument): ValidationResult;
    /**
     * Validate graph structure
     */
    private validateStructure;
    /**
     * Validate individual nodes
     */
    private validateNodes;
    /**
     * Validate node-specific data
     */
    private validateNodeData;
    /**
     * Validate edges
     */
    private validateEdges;
    /**
     * Detect cycles in the graph using DFS
     */
    private detectCycles;
    /**
     * Analyze performance concerns
     */
    private analyzePerformance;
    /**
     * Analyze graph connectivity
     */
    private analyzeConnectivity;
    /**
     * Build adjacency list from graph
     */
    private buildAdjacencyList;
    /**
     * Find longest execution chains for performance analysis
     */
    private findLongestChains;
}
//# sourceMappingURL=validation.d.ts.map