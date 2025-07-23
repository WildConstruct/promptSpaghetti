/**
 * @fileoverview SecurityManager - Enforces security policies for custom node execution
 * Provides sandboxing and resource limitations for third-party code
 */
import { AdvancedExecutionContext, ValidationResult } from '@prompt-spaghetti/graph-core';
import { CustomNodeConfig } from '../types';
/**
 * Security manager for custom node execution
 * Enforces resource limits and access controls
 */
export declare class SecurityManager {
    private securityConfig;
    private executionStartTime?;
    private memoryUsageStart?;
    constructor(securityConfig?: CustomNodeConfig['security']);
    /**
     * Validate the security configuration
     */
    validateConfiguration(): ValidationResult;
    /**
     * Check if execution is allowed and set up monitoring
     */
    checkExecution(ctx: AdvancedExecutionContext): Promise<void>;
    /**
     * Check if the current execution is within resource limits
     */
    checkResourceLimits(): void;
    /**
     * Create a sandboxed environment for custom node execution
     */
    createSandbox(): SandboxEnvironment;
    /**
     * Validate that code doesn't contain dangerous patterns
     */
    validateCode(code: string): ValidationResult;
    /**
     * Finalize execution monitoring
     */
    finalizeExecution(): ExecutionStats;
    /**
     * Get current memory usage (approximate)
     */
    private getCurrentMemoryUsage;
}
/**
 * Security error class for custom node violations
 */
export declare class SecurityError extends Error {
    constructor(message: string);
}
/**
 * Sandbox environment interface
 */
export interface SandboxEnvironment {
    [key: string]: any;
    __securityManager: SecurityManager;
}
/**
 * Execution statistics interface
 */
export interface ExecutionStats {
    executionTime: number;
    memoryUsed: number;
    withinLimits: {
        time: boolean;
        memory: boolean;
    };
}
//# sourceMappingURL=SecurityManager.d.ts.map