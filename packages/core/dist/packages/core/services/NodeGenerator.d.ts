/**
 * Node Generator Service
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Central service for converting prompt analysis results into React Flow nodes and edges
 * with comprehensive security hardening, performance optimization, and validation
 */
import { NodeGenerationRequest, GeneratedGraph, PerformanceMetrics, SecurityConstraints } from '../types/NodeGenerationTypes';
/**
 * Main service class for node generation with security hardening
 */
export declare class NodeGenerator {
    private performanceMetrics;
    private securityConstraints;
    constructor();
    /**
     * Generate nodes and edges from analysis results with comprehensive validation
     */
    generateFromAnalysis(request: NodeGenerationRequest): GeneratedGraph;
    /**
     * Validate generation request for security and data integrity
     */
    private validateGenerationRequest;
    /**
     * Calculate optimal layout for nodes using specified algorithm
     */
    private calculateLayout;
    /**
     * Create React Flow nodes from suggestions and positions
     */
    private createNodes;
    /**
     * Generate intelligent connections between nodes
     */
    private generateConnections;
    /**
     * Create workflow-based connections based on node types and logic
     */
    private createWorkflowConnections;
    /**
     * Create a React Flow edge with proper configuration
     */
    private createEdge;
    /**
     * Validate the generated graph for consistency and correctness
     */
    private validateGeneratedGraph;
    private groupSuggestionsByCategory;
    private calculateBounds;
    private calculateLayoutEfficiency;
    private calculateAverageConfidence;
    private calculateConnectionDensity;
    private calculateComplexityScore;
    private generateId;
    private updateMetrics;
    private initializeMetrics;
    private initializeSecurityConstraints;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Get security constraints
     */
    getSecurityConstraints(): SecurityConstraints;
}
//# sourceMappingURL=NodeGenerator.d.ts.map