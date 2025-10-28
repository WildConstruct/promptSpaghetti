/**
 * @fileoverview SecurityManager - Enforces security policies for custom node execution
 * Provides sandboxing and resource limitations for third-party code
 */

import { AdvancedExecutionContext } from '@promptscape/core';
import { ValidationResult } from '../types';
import { CustomNodeConfig } from '../types';

/**
 * Security manager for custom node execution
 * Enforces resource limits and access controls
 */
export class SecurityManager {
  private securityConfig: CustomNodeConfig['security'];
  private executionStartTime?: number;
  private memoryUsageStart?: number;

  constructor(securityConfig?: CustomNodeConfig['security']) {
    this.securityConfig = {
      allowFileAccess: false,
      allowNetworkAccess: false,
      maxExecutionTime: 30000, // 30 seconds default
      memoryLimit: 100 * 1024 * 1024, // 100MB default
      ...securityConfig
    };
  }

  /**
   * Validate the security configuration
   */
  validateConfiguration(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
      this.securityConfig?.maxExecutionTime &&
      this.securityConfig.maxExecutionTime < 1000
    ) {
      warnings.push(
        'Maximum execution time is very low (< 1 second), this may cause timeouts'
      );
    }

    if (
      this.securityConfig?.maxExecutionTime &&
      this.securityConfig.maxExecutionTime > 300000
    ) {
      warnings.push(
        'Maximum execution time is very high (> 5 minutes), consider lowering for better UX'
      );
    }

    if (
      this.securityConfig?.memoryLimit &&
      this.securityConfig.memoryLimit > 1024 * 1024 * 1024
    ) {
      warnings.push(
        'Memory limit is very high (> 1GB), consider lowering to prevent system issues'
      );
    }

    if (this.securityConfig?.allowFileAccess) {
      warnings.push(
        'File system access is enabled - ensure this is necessary for security'
      );
    }

    if (this.securityConfig?.allowNetworkAccess) {
      warnings.push(
        'Network access is enabled - ensure this is necessary for security'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if execution is allowed and set up monitoring
   */
  async checkExecution(ctx: AdvancedExecutionContext): Promise<void> {
    // Start execution monitoring
    this.executionStartTime = Date.now();
    this.memoryUsageStart = this.getCurrentMemoryUsage();

    // Check execution depth to prevent infinite recursion
    if (ctx.evaluationDepth > 50) {
      throw new SecurityError(
        'Maximum evaluation depth exceeded - possible infinite recursion'
      );
    }

    // Set up timeout if configured
    if (this.securityConfig?.maxExecutionTime) {
      setTimeout(() => {
        if (this.executionStartTime) {
          throw new SecurityError(
            `Execution timeout exceeded: ${this.securityConfig!.maxExecutionTime}ms`
          );
        }
      }, this.securityConfig.maxExecutionTime);
    }
  }

  /**
   * Check if the current execution is within resource limits
   */
  checkResourceLimits(): void {
    if (!this.executionStartTime) {
      return;
    }

    const executionTime = Date.now() - this.executionStartTime;
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryUsed = this.memoryUsageStart
      ? currentMemory - this.memoryUsageStart
      : currentMemory;

    // Check execution time
    if (
      this.securityConfig?.maxExecutionTime &&
      executionTime > this.securityConfig.maxExecutionTime
    ) {
      throw new SecurityError(
        `Execution time limit exceeded: ${executionTime}ms > ${this.securityConfig.maxExecutionTime}ms`
      );
    }

    // Check memory usage
    if (
      this.securityConfig?.memoryLimit &&
      memoryUsed > this.securityConfig.memoryLimit
    ) {
      throw new SecurityError(
        `Memory limit exceeded: ${memoryUsed} bytes > ${this.securityConfig.memoryLimit} bytes`
      );
    }
  }

  /**
   * Create a sandboxed environment for custom node execution
   */
  createSandbox(): SandboxEnvironment {
    const allowedGlobals = [
      'console',
      'JSON',
      'Math',
      'Date',
      'RegExp',
      'String',
      'Number',
      'Boolean',
      'Array',
      'Object',
      'Map',
      'Set',
      'Promise'
    ];

    const sandbox: SandboxEnvironment = {
      // Provide safe globals
      ...Object.fromEntries(
        allowedGlobals
          .filter(name => typeof (globalThis as any)[name] !== 'undefined')
          .map(name => [name, (globalThis as any)[name]])
      ),

      // Provide controlled access to restricted APIs
      fetch: this.securityConfig?.allowNetworkAccess ? fetch : undefined,
      require: this.securityConfig?.allowFileAccess ? require : undefined,

      // Security monitoring
      __securityManager: this
    };

    return sandbox;
  }

  /**
   * Validate that code doesn't contain dangerous patterns
   */
  validateCode(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      {
        pattern: /eval\s*\(/g,
        message: 'eval() is not allowed for security reasons'
      },
      {
        pattern: /Function\s*\(/g,
        message: 'Function constructor is not allowed for security reasons'
      },
      {
        pattern: /process\s*\./g,
        message: 'Process access is not allowed for security reasons'
      },
      {
        pattern: /global\s*\./g,
        message: 'Global object access is not allowed for security reasons'
      },
      {
        pattern: /__dirname|__filename/g,
        message: 'File system path access is restricted'
      },
      {
        pattern: /require\s*\(/g,
        message: 'Require is only allowed if file access is enabled'
      },
      {
        pattern: /import\s+.*\s+from/g,
        message: 'Dynamic imports may be restricted'
      }
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        if (
          pattern.source.includes('require') &&
          this.securityConfig?.allowFileAccess
        ) {
          continue; // Allow require if file access is enabled
        }
        errors.push(message);
      }
    }

    // Check for potentially dangerous but not necessarily forbidden patterns
    const warningPatterns = [
      {
        pattern: /setTimeout|setInterval/g,
        message: 'Timers should be used carefully to avoid blocking execution'
      },
      {
        pattern: /while\s*\(.*true.*\)/g,
        message: 'Infinite loops detected - ensure they have break conditions'
      },
      {
        pattern: /for\s*\(.*;;.*\)/g,
        message: 'Infinite loops detected - ensure they have break conditions'
      }
    ];

    for (const { pattern, message } of warningPatterns) {
      if (pattern.test(code)) {
        warnings.push(message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Finalize execution monitoring
   */
  finalizeExecution(): ExecutionStats {
    const executionTime = this.executionStartTime
      ? Date.now() - this.executionStartTime
      : 0;
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryUsed = this.memoryUsageStart
      ? currentMemory - this.memoryUsageStart
      : 0;

    // Clear monitoring
    this.executionStartTime = undefined;
    this.memoryUsageStart = undefined;

    return {
      executionTime,
      memoryUsed,
      withinLimits: {
        time:
          !this.securityConfig?.maxExecutionTime ||
          executionTime <= this.securityConfig.maxExecutionTime,
        memory:
          !this.securityConfig?.memoryLimit ||
          memoryUsed <= this.securityConfig.memoryLimit
      }
    };
  }

  /**
   * Get current memory usage (approximate)
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    // Fallback for non-Node environments
    return 0;
  }
}

/**
 * Security error class for custom node violations
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
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
