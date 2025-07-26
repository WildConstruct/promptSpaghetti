/**
 * PythonTransform Node Implementation
 * Epic 8 Story 8.1.4: Python executor integration
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
import { IOSpecBuilder } from '../io-system';
export interface PythonTransformConfig {
    code: string;
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string[];
    pythonConfig?: {
        strictMode?: boolean;
        enableCaching?: boolean;
        executorUrl?: string;
        retryAttempts?: number;
        fallbackBehavior?: 'error' | 'skip' | 'default';
        defaultOutput?: string;
    };
}
export declare class PythonTransformNode extends AdvancedRuntimeNode<string> {
    private pythonClient;
    private pythonConfig;
    private ioHandler;
    constructor(id: string, config: PythonTransformConfig);
    protected defineIOSpec(): IOSpecBuilder;
    /**
     * Main execution method required by AdvancedRuntimeNode
     */
    run(context: AdvancedExecutionContext): Promise<string>;
    /**
     * Validate node configuration
     */
    validate(): ValidationResult;
    /**
     * Serialize node data for persistence
     */
    serialize(): AdvancedNodeData;
    /**
     * Get typed input helper
     */
    private getTypedInput;
    /**
     * Set output helper
     */
    private setOutput;
    protected executeCore(context: AdvancedExecutionContext): Promise<string>;
    /**
     * Extract relevant context data for Python execution
     */
    private extractContextForPython;
    /**
     * Process the Python execution result
     */
    private processResult;
    /**
     * Handle Python execution failure
     */
    private handleExecutionFailure;
    /**
     * Handle client errors (network, service unavailable, etc.)
     */
    private handleClientError;
    /**
     * Log security events from Python execution
     */
    private logSecurityEvents;
    /**
     * Log warnings from Python execution
     */
    private logWarnings;
    /**
     * Get node configuration for inspection
     */
    getPythonConfig(): PythonTransformConfig;
    /**
     * Update node configuration
     */
    updateConfig(newConfig: Partial<PythonTransformConfig>): void;
    /**
     * Validate Python code before execution
     */
    validateCode(): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    /**
     * Check if Python executor service is available
     */
    isServiceAvailable(): Promise<boolean>;
    /**
     * Get service health information
     */
    getServiceHealth(): Promise<{
        status: string;
        version: string;
        uptime: number;
    } | null>;
    /**
     * Get execution statistics
     */
    getExecutionStats(context: AdvancedExecutionContext): {
        executionsRun: number;
        successRate: number;
        averageExecutionTime: number;
        securityViolations: number;
    };
    /**
     * Store execution metadata for statistics
     */
    protected storeExecutionMetadata(
      context: AdvancedExecutionContext,
      success: boolean,
      executionTime: number,
      securityViolations: number
    ): void;
}
//# sourceMappingURL=PythonTransform.d.ts.map