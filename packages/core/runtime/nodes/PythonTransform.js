/**
 * PythonTransform Node Implementation
 * Epic 8 Story 8.1.4: Python executor integration
 */
import { AdvancedRuntimeNode } from '../advanced';
import { IOSpecBuilder } from '../io-system';
import { PythonExecutorClient, pythonExecutorClient } from '../../python-executor-client';
import { measureExecution } from '../../utils/performance';
export class PythonTransformNode extends AdvancedRuntimeNode {
    pythonClient;
    config;
    constructor(id, config) {
        super(id);
        this.config = config;
        // Create a custom Python client if executor URL is specified
        if (config.pythonConfig?.executorUrl) {
            this.pythonClient = new PythonExecutorClient({
                baseUrl: config.pythonConfig.executorUrl,
                retryAttempts: config.pythonConfig.retryAttempts || 3,
                defaultStrictMode: config.pythonConfig.strictMode ?? true,
            });
        }
        else {
            this.pythonClient = pythonExecutorClient;
        }
    }
    defineIOSpec() {
        return new IOSpecBuilder()
            .addInput('input', 'string', 'Input data to transform')
            .addOutput('output', 'string', 'Transformed output from Python code')
            .addOutput('executionTime', 'number', 'Execution time in seconds')
            .addOutput('memoryUsed', 'string', 'Memory used during execution')
            .addOutput('securityViolations', 'number', 'Number of security violations detected');
    }
    async executeCore(context) {
        const inputData = this.getTypedInput('input', context);
        // Validate that we have code to execute
        if (!this.config.code || this.config.code.trim() === '') {
            throw new Error('Python code is required');
        }
        // Prepare execution request
        const executionRequest = {
            code: this.config.code,
            input_data: inputData,
            timeout: this.config.timeout || 30,
            memory_limit: this.config.memoryLimit || '128MB',
            allowed_modules: this.config.allowedModules || [],
            context: this.extractContextForPython(context),
            strict_mode: this.config.pythonConfig?.strictMode ?? true,
        };
        try {
            // Execute Python code with performance measurement
            const result = await measureExecution(() => this.pythonClient.execute(executionRequest), 'python_transform_execution');
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
                return this.processResult(result.result);
            }
            else {
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
    extractContextForPython(context) {
        return {
            variables: context.variables,
            nodeId: this.id,
            seed: context.seed,
            // Don't expose sensitive internal state
        };
    }
    /**
     * Process the Python execution result
     */
    processResult(result) {
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
    handleExecutionFailure(result) {
        const fallbackBehavior = this.config.pythonConfig?.fallbackBehavior || 'error';
        switch (fallbackBehavior) {
            case 'skip':
                // Return empty string and log warning
                console.warn(`Python execution failed for node ${this.id}: ${result.error_message}`);
                return '';
            case 'default':
                // Return default output if specified
                const defaultOutput = this.config.pythonConfig?.defaultOutput || '';
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
                    traceback: result.traceback,
                };
                throw error;
        }
    }
    /**
     * Handle client errors (network, service unavailable, etc.)
     */
    handleClientError(error) {
        const fallbackBehavior = this.config.pythonConfig?.fallbackBehavior || 'error';
        switch (fallbackBehavior) {
            case 'skip':
                console.warn(`Python executor service unavailable for node ${this.id}: ${error.message}`);
                return '';
            case 'default':
                const defaultOutput = this.config.pythonConfig?.defaultOutput || '';
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
    logSecurityEvents(events, context) {
        for (const event of events) {
            console.warn(`Python security event in node ${this.id}:`, {
                level: event.level,
                type: event.type,
                message: event.message,
                timestamp: event.timestamp,
                executionId: context.executionId,
            });
        }
    }
    /**
     * Log warnings from Python execution
     */
    logWarnings(warnings, context) {
        for (const warning of warnings) {
            console.warn(`Python warning in node ${this.id}:`, {
                warning,
                executionId: context.executionId,
            });
        }
    }
    /**
     * Get node configuration for inspection
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update node configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Update Python client if executor URL changed
        if (newConfig.pythonConfig?.executorUrl &&
            newConfig.pythonConfig.executorUrl !== this.config.pythonConfig?.executorUrl) {
            this.pythonClient = new PythonExecutorClient({
                baseUrl: newConfig.pythonConfig.executorUrl,
                retryAttempts: newConfig.pythonConfig.retryAttempts || 3,
                defaultStrictMode: newConfig.pythonConfig.strictMode ?? true,
            });
        }
    }
    /**
     * Validate Python code before execution
     */
    async validateCode() {
        if (!this.config.code || this.config.code.trim() === '') {
            return {
                valid: false,
                errors: ['Python code is required'],
                warnings: [],
            };
        }
        try {
            const result = await this.pythonClient.validate({
                code: this.config.code,
                strict_mode: this.config.pythonConfig?.strictMode ?? true,
            });
            return {
                valid: result.valid,
                errors: result.errors,
                warnings: result.warnings,
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Validation service error: ${error.message}`],
                warnings: [],
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
    getExecutionStats() {
        const state = this.getState();
        const executions = state.executions || [];
        if (executions.length === 0) {
            return {
                executionsRun: 0,
                successRate: 0,
                averageExecutionTime: 0,
                securityViolations: 0,
            };
        }
        const successful = executions.filter(e => e.success).length;
        const totalTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0);
        const totalViolations = executions.reduce((sum, e) => sum + (e.securityViolations || 0), 0);
        return {
            executionsRun: executions.length,
            successRate: successful / executions.length,
            averageExecutionTime: totalTime / executions.length,
            securityViolations: totalViolations,
        };
    }
    /**
     * Store execution metadata for statistics
     */
    storeExecutionMetadata(success, executionTime, securityViolations) {
        const state = this.getState();
        if (!state.executions) {
            state.executions = [];
        }
        state.executions.push({
            timestamp: Date.now(),
            success,
            executionTime,
            securityViolations,
        });
        // Keep only last 100 executions
        if (state.executions.length > 100) {
            state.executions = state.executions.slice(-100);
        }
        this.updateState(state);
    }
}
