/**
 * PythonTransform Node Implementation
 * Epic 8 Story 8.1.4: Python executor integration
 */
import { AdvancedRuntimeNode } from '../advanced';
import { IOSpecBuilder, AdvancedIOHandler } from '../io-system';
import { PythonExecutorClient, pythonExecutorClient } from '../../python-executor-client';
export class PythonTransformNode extends AdvancedRuntimeNode {
    pythonClient;
    pythonConfig;
    ioHandler;
    constructor(id: string, config: any) {
        // Create AdvancedNodeConfig for base class
        const advancedConfig = {
            deterministic: true, // Python execution is deterministic with same inputs
            cacheable: config.pythonConfig?.enableCaching ?? false,
            stateful: true, // Track execution statistics
            performanceHints: {
                expectedExecutionTime: 'medium',
                memoryUsage: 'medium'
            }
        };
        super(id, advancedConfig);
        this.pythonConfig = config;
        // Create a custom Python client if executor URL is specified
        if (config.pythonConfig?.executorUrl) {
            this.pythonClient = new PythonExecutorClient({
                baseUrl: config.pythonConfig.executorUrl,
                retryAttempts: config.pythonConfig.retryAttempts || 3,
                defaultStrictMode: config.pythonConfig.strictMode ?? true
            });
        }
        else {
            this.pythonClient = pythonExecutorClient;
        }
        // Initialize IO handler
        this.ioHandler = new AdvancedIOHandler(this.defineIOSpec().build());
    }
    defineIOSpec() {
        return new IOSpecBuilder()
            .addInput({
            id: 'input',
            label: 'Input',
            dataType: 'string',
            required: true,
            description: 'Input data to transform'
        })
            .addOutput({
            id: 'output',
            label: 'Output',
            dataType: 'string',
            required: false,
            description: 'Transformed output from Python code'
        })
            .addOutput({
            id: 'executionTime',
            label: 'Execution Time',
            dataType: 'number',
            required: false,
            description: 'Execution time in seconds'
        })
            .addOutput({
            id: 'memoryUsed',
            label: 'Memory Used',
            dataType: 'string',
            required: false,
            description: 'Memory used during execution'
        })
            .addOutput({
            id: 'securityViolations',
            label: 'Security Violations',
            dataType: 'number',
            required: false,
            description: 'Number of security violations detected'
        });
    }
    /**
     * Main execution method required by AdvancedRuntimeNode
     */
    async run(context: any) {
        // Record this node's execution
        context.executionMeta.nodeExecutionOrder.push(this.id);
        // Execute with performance tracking
        const result = await this.measureExecution(context, 'python-transform', async () => {
            return await this.executeCore(context);
        });
        return result;
    }
    /**
     * Validate node configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
        if (!this.pythonConfig.code || this.pythonConfig.code.trim() === '') {
            errors.push('Python code is required');
        }
        if (this.pythonConfig.timeout && this.pythonConfig.timeout <= 0) {
            errors.push('Timeout must be positive');
        }
        if (this.pythonConfig.memoryLimit) {
            const memMatch = this.pythonConfig.memoryLimit.match(/^(\d+)(MB|GB)$/);
            if (!memMatch) {
                errors.push('Memory limit must be in format: 128MB or 1GB');
            }
        }
        // IO validation is performed at runtime
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Serialize node data for persistence
     */
    serialize() {
        return {
            id: this.id,
            type: 'pythonTransform',
            config: this.config,
            data: {
                code: this.pythonConfig.code,
                timeout: this.pythonConfig.timeout,
                memoryLimit: this.pythonConfig.memoryLimit,
                allowedModules: this.pythonConfig.allowedModules,
                pythonConfig: this.pythonConfig.pythonConfig
            },
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    /**
     * Get typed input helper
     */
    getTypedInput(inputId: string, context: any) {
        // For now, we'll read from inputs directly
        if (context.inputs && typeof context.inputs === 'object' && inputId in context.inputs) {
            return String(context.inputs[inputId]);
        }
        return '';
    }
    /**
     * Set output helper
     */
    setOutput(outputId: string, value: any, context: any) {
        // Store output in context for later retrieval
        if (!context.outputs) {
            context.outputs = {};
        }
        context.outputs[outputId] = value;
    }
    async executeCore(context: any) {
        const inputData = this.getTypedInput('input', context);
        // Validate that we have code to execute
        if (!this.pythonConfig.code || this.pythonConfig.code.trim() === '') {
            throw new Error('Python code is required');
        }
        // Prepare execution request
        const executionRequest = {
            code: this.pythonConfig.code,
            input_data: inputData,
            timeout: this.pythonConfig.timeout || 30,
            memory_limit: this.pythonConfig.memoryLimit || '128MB',
            allowed_modules: this.pythonConfig.allowedModules || [],
            context: this.extractContextForPython(context),
            strict_mode: this.pythonConfig.pythonConfig?.strictMode ?? true
        };
        try {
            // Execute Python code
            const result = await this.pythonClient.execute(executionRequest);
            // Handle execution result
            if (result.success) {
                // Set additional outputs
                this.setOutput('executionTime', result.execution_time, context);
                this.setOutput('memoryUsed', result.memory_used, context);
                this.setOutput('securityViolations', result.sandbox_violations, context);
                // Log security events if any
                if (result.security_events && result.security_events.length > 0) {
                    this.logSecurityEvents(result.security_events, context);
                }
                // Log warnings if any
                if (result.warnings && result.warnings.length > 0) {
                    this.logWarnings(result.warnings, context);
                }
                // Store execution metadata for statistics
                this.storeExecutionMetadata(context, true, result.execution_time, result.sandbox_violations);
                return this.processResult(result.result);
            }
            else {
                // Store execution metadata for failed execution
                this.storeExecutionMetadata(context, false, result.execution_time || 0, result.sandbox_violations || 0);
                // Handle execution failure
                return this.handleExecutionFailure(result);
            }
        }
        catch (error) {
            // Handle client errors (network, service unavailable, etc.)
            return this.handleClientError(error);
        }
    }
    /**
     * Extract relevant context data for Python execution
     */
    extractContextForPython(context: any) {
        return {
            variables: context.variables,
            nodeId: this.id,
            seed: context.seed
            // Don't expose sensitive internal state
        };
    }
    /**
     * Process the Python execution result
     */
    processResult(result: any) {
        // Ensure result is a string
        if (typeof result === 'string') {
            return result;
        }
        else if (result !== null && result !== undefined) {
            return String(result);
        }
        else {
            return '';
        }
    }
    /**
     * Handle Python execution failure
     */
    handleExecutionFailure(result: any) {
        const fallbackBehavior = this.pythonConfig.pythonConfig?.fallbackBehavior || 'error';
        switch (fallbackBehavior) {
            case 'skip':
                // Return empty string and log warning
                console.warn(`Python execution failed for node ${this.id}: ${result.error_message}`);
                return '';
            case 'default':
                // Return default output if specified
                const defaultOutput = this.pythonConfig.pythonConfig?.defaultOutput || '';
                console.warn(`Python execution failed for node ${this.id}, using default output: ${result.error_message}`);
                return defaultOutput;
            case 'error':
            default:
                // Throw error with detailed information
                const errorMessage = `Python execution failed: ${result.error_message}`;
                const error = new Error(errorMessage);
                error.pythonError = {
                    type: result.error_type,
                    code: result.error_code,
                    line: result.error_line,
                    traceback: result.traceback
                };
                throw error;
        }
    }
    /**
     * Handle client errors (network, service unavailable, etc.)
     */
    handleClientError(error: any) {
        const fallbackBehavior = this.pythonConfig.pythonConfig?.fallbackBehavior || 'error';
        switch (fallbackBehavior) {
            case 'skip':
                console.warn(`Python executor service unavailable for node ${this.id}: ${error.message}`);
                return '';
            case 'default':
                const defaultOutput = this.pythonConfig.pythonConfig?.defaultOutput || '';
                console.warn(`Python executor service unavailable for node ${this.id}, using default output: ${error.message}`);
                return defaultOutput;
            case 'error':
            default:
                // Re-throw with additional context
                const enhancedError = new Error(`Python executor service error: ${error.message}`);
                enhancedError.originalError = error;
                throw enhancedError;
        }
    }
    /**
     * Log security events from Python execution
     */
    logSecurityEvents(events: any[], ______context: any) {
        for (const event of events) {
            console.warn(`Python security event in node ${this.id}:`, {
                level: event.level,
                type: event.type,
                message: event.message,
                timestamp: event.timestamp,
                nodeId: this.id
            });
        }
    }
    /**
     * Log warnings from Python execution
     */
    logWarnings(warnings: any[], ______context: any) {
        for (const warning of warnings) {
            console.warn(`Python warning in node ${this.id}:`, {
                warning,
                nodeId: this.id
            });
        }
    }
    /**
     * Get node configuration for inspection
     */
    getPythonConfig() {
        return { ...this.pythonConfig };
    }
    /**
     * Update node configuration
     */
    updateConfig(newConfig: any) {
        this.pythonConfig = { ...this.pythonConfig, ...newConfig };
        // Update Python client if executor URL changed
        if (newConfig.pythonConfig?.executorUrl &&
            newConfig.pythonConfig.executorUrl !== this.pythonConfig.pythonConfig?.executorUrl) {
            this.pythonClient = new PythonExecutorClient({
                baseUrl: newConfig.pythonConfig.executorUrl,
                retryAttempts: newConfig.pythonConfig.retryAttempts || 3,
                defaultStrictMode: newConfig.pythonConfig.strictMode ?? true
            });
        }
    }
    /**
     * Validate Python code before execution
     */
    async validateCode() {
        if (!this.pythonConfig.code || this.pythonConfig.code.trim() === '') {
            return {
                valid: false,
                errors: ['Python code is required'],
                warnings: []
            };
        }
        try {
            const result = await this.pythonClient.validate({
                code: this.pythonConfig.code,
                strict_mode: this.pythonConfig.pythonConfig?.strictMode ?? true
            });
            return {
                valid: result.valid,
                errors: result.errors,
                warnings: result.warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Validation service error: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: []
            };
        }
    }
    /**
     * Check if Python executor service is available
     */
    async isServiceAvailable() {
        try {
            await this.pythonClient.health();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get service health information
     */
    async getServiceHealth() {
        try {
            return await this.pythonClient.health();
        }
        catch {
            return null;
        }
    }
    /**
     * Get execution statistics
     */
    getExecutionStats(context: any) {
        const state = this.getState(context);
        const executions = state?.executions || [];
        if (executions.length === 0) {
            return {
                executionsRun: 0,
                successRate: 0,
                averageExecutionTime: 0,
                securityViolations: 0
            };
        }
        const successful = executions.filter((e) => e.success).length;
        const totalTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0);
        const totalViolations = executions.reduce((sum, e) => sum + (e.securityViolations || 0), 0);
        return {
            executionsRun: executions.length,
            successRate: successful / executions.length,
            averageExecutionTime: totalTime / executions.length,
            securityViolations: totalViolations
        };
    }
    /**
     * Store execution metadata for statistics
     */
    storeExecutionMetadata(context: any, success: boolean, executionTime: number, securityViolations: number) {
        const state = this.getState(context) || {};
        if (!state.executions) {
            state.executions = [];
        }
        state.executions.push({
            timestamp: Date.now(),
            success,
            executionTime,
            securityViolations
        });
        // Keep only last 100 executions
        if (state.executions.length > 100) {
            state.executions = state.executions.slice(-100);
        }
        this.setState(context, state);
    }
}
