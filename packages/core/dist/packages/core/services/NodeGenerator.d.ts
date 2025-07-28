/**
 * Node Generator Service
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Central service for converting prompt analysis results into React Flow nodes and edges
 * with comprehensive security hardening, performance optimization, and validation
 */
import { Position } from 'reactflow';
import { NodeGenerationRequest, GeneratedGraph, LayoutType } from '../types/NodeGenerationTypes';
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
    layoutType: LayoutType;
    startPosition: Position;
    spacing: {
        horizontal: number;
        vertical: number;
    };
    LayoutResult: any;
}
//# sourceMappingURL=NodeGenerator.d.ts.map