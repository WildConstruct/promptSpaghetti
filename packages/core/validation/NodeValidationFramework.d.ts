/**
 * Node Validation Framework
 * Epic 18 - Add Node Validation (E18-1753114562073-6B8498)
 *
 * Comprehensive validation framework for runtime nodes with security, type safety, and performance validation
 */
import { ValidationResult, AdvancedNodeData } from '../runtime/advanced';

}
}
export interface NodeValidationConfig { /** Enable strict type checking */
    strictTypeValidation: boolean;
    /** Enable security validation (injection attacks, dangerous operations) */
    securityValidation: boolean;
    /** Enable performance validation (memory, execution time) */
    performanceValidation: boolean;
    /** Enable schema validation against node configuration */
    schemaValidation: boolean;
    /** Maximum execution depth to prevent infinite recursion */
    maxExecutionDepth: number;
    /** Maximum memory usage per node (bytes) */
    maxMemoryUsage: number;
    /** Maximum execution time per node (milliseconds) */
    maxExecutionTime: number }
}
}
export interface NodeValidationResult extends ValidationResult {
    /** Security-specific validation results */
    security: {
        passed: boolean;
        threats: SecurityThreat[];
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
}
  };
    /** Performance-specific validation results */
    performance: { passed: boolean;
        issues: PerformanceIssue[];
        estimatedMemoryUsage: number;
        estimatedExecutionTime: number };
    /** Type safety validation results */
    typeSafety: {
        passed: boolean;
        typeErrors: TypeError[];
        compatibility: 'full' | 'partial' | 'incompatible'
  };
    /** Schema validation results */
    schema: { passed: boolean;
        schemaErrors: string[] };

}
}
export interface SecurityThreat { type: 'injection' | 'eval' | 'prototype_pollution' | 'xss' | 'unsafe_function' | 'dangerous_import';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    recommendation: string }
}
}
export interface PerformanceIssue { type: 'memory' | 'execution_time' | 'infinite_loop' | 'inefficient_algorithm';
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    suggestion: string }
}
}
export interface TypeError { expected: string;
    actual: string;
    field: string;
    description: string;
/**
 * Core Node Validation Framework
 * Provides comprehensive validation for runtime nodes
 */
export declare class NodeValidationFramework {
    private config;
    private securityPatterns;
    constructor(config?: Partial<NodeValidationConfig>);
    /**
     * Initialize security threat detection patterns
     */
    private initializeSecurityPatterns;
    /**
     * Comprehensive node validation
     */
    validateNode(nodeData: AdvancedNodeData): NodeValidationResult;
    /**
     * Security validation - detect injection attacks and dangerous operations
     */
    private validateSecurity;
    /**
     * Recursively scan object for security threats
     */
    private scanForThreats;
    /**
     * Scan individual string for security patterns
     */
    private scanStringForThreats;
    /**
     * Node type-specific security validation
     */
    private validateNodeTypeSpecificSecurity;
    /**
     * Validate Conditional node security (expression evaluation)
     */
    private validateConditionalSecurity;
    /**
     * Validate Python transform node security
     */
    private validatePythonTransformSecurity;
    /**
     * Performance validation - memory usage, execution time, infinite loops
     */
    private validatePerformance;
    /**
     * Detect potential infinite loops
     */
    private validateInfiniteLoops;
    /**
     * Type safety validation
     */
    private validateTypeSafety;
    /**
     * Schema validation against node configuration
     */
    private validateSchema;
    private validateNodeDataTypes;
    private validateIOPortTypes;
    private estimateMemoryUsage;
    private estimateExecutionTime;
    private getNodeTypeMemoryMultiplier;
    private getNodeTypeTimeMultiplier;
    private calculateDataComplexity;
    private getObjectDepth;
    private calculateRiskLevel;
    private getSecurityThreatType;
    private getSecurityThreatSeverity;
    private getSecurityRecommendation;
/**
 * Validation utilities for common validation scenarios
 */
export declare class NodeValidationUtils {
    /**
     * Quick security check for user input
     */
    static validateUserInput(input: string): SecurityThreat[];
    /**
     * Quick performance estimate
     */
    static estimateNodePerformance(nodeData: AdvancedNodeData): {
        memory: number;
        time: number }
}
    };
    /**
     * Batch validate multiple nodes
     */
    static validateNodeBatch(nodes: AdvancedNodeData[]): NodeValidationResult[];

export default NodeValidationFramework;
//# sourceMappingURL=NodeValidationFramework.d.ts.map