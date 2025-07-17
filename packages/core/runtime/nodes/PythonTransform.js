"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonTransformNode = void 0;
const advanced_1 = require("../advanced");
const io_system_1 = require("../io-system");
const python_executor_client_1 = require("../../python-executor-client");
const performance_1 = require("../../utils/performance");
class PythonTransformNode extends advanced_1.AdvancedRuntimeNode {
    constructor(id, config) {
        super(id);
        this.config = config;
        if (config.pythonConfig?.executorUrl) {
            this.pythonClient = new python_executor_client_1.PythonExecutorClient({
                baseUrl: config.pythonConfig.executorUrl,
                retryAttempts: config.pythonConfig.retryAttempts || 3,
                defaultStrictMode: config.pythonConfig.strictMode ?? true,
            });
        }
        else {
            this.pythonClient = python_executor_client_1.pythonExecutorClient;
        }
    }
    defineIOSpec() {
        return new io_system_1.IOSpecBuilder()
            .addInput('input', 'string', 'Input data to transform')
            .addOutput('output', 'string', 'Transformed output from Python code')
            .addOutput('executionTime', 'number', 'Execution time in seconds')
            .addOutput('memoryUsed', 'string', 'Memory used during execution')
            .addOutput('securityViolations', 'number', 'Number of security violations detected');
    }
    async executeCore(context) {
        const inputData = this.getTypedInput('input', context);
        if (!this.config.code || this.config.code.trim() === '') {
            throw new Error('Python code is required');
        }
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
            const result = await (0, performance_1.measureExecution)(() => this.pythonClient.execute(executionRequest), 'python_transform_execution');
            if (result.success) {
                this.setOutput('executionTime', result.execution_time, context);
                this.setOutput('memoryUsed', result.memory_used, context);
                this.setOutput('securityViolations', result.sandbox_violations, context);
                if (result.security_events && result.security_events.length > 0) {
                    this.logSecurityEvents(result.security_events, context);
                }
                if (result.warnings && result.warnings.length > 0) {
                    this.logWarnings(result.warnings, context);
                }
                return this.processResult(result.result);
            }
            else {
                return this.handleExecutionFailure(result);
            }
        }
        catch (error) {
            return this.handleClientError(error);
        }
    }
    extractContextForPython(context) {
        return {
            variables: context.variables,
            nodeId: this.id,
            seed: context.seed,
        };
    }
    processResult(result) {
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
    handleExecutionFailure(result) {
        const fallbackBehavior = this.config.pythonConfig?.fallbackBehavior || 'error';
        switch (fallbackBehavior) {
            case 'skip':
                console.warn(`Python execution failed for node ${this.id}: ${result.error_message}`);
                return '';
            case 'default':
                const defaultOutput = this.config.pythonConfig?.defaultOutput || '';
                console.warn(`Python execution failed for node ${this.id}, using default output: ${result.error_message}`);
                return defaultOutput;
            case 'error':
            default:
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
                const enhancedError = new Error(`Python executor service error: ${error.message}`);
                enhancedError.originalError = error;
                throw enhancedError;
        }
    }
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
    logWarnings(warnings, context) {
        for (const warning of warnings) {
            console.warn(`Python warning in node ${this.id}:`, {
                warning,
                executionId: context.executionId,
            });
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.pythonConfig?.executorUrl &&
            newConfig.pythonConfig.executorUrl !== this.config.pythonConfig?.executorUrl) {
            this.pythonClient = new python_executor_client_1.PythonExecutorClient({
                baseUrl: newConfig.pythonConfig.executorUrl,
                retryAttempts: newConfig.pythonConfig.retryAttempts || 3,
                defaultStrictMode: newConfig.pythonConfig.strictMode ?? true,
            });
        }
    }
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
    async isServiceAvailable() {
        try {
            await this.pythonClient.health();
            return true;
        }
        catch {
            return false;
        }
    }
    async getServiceHealth() {
        try {
            return await this.pythonClient.health();
        }
        catch {
            return null;
        }
    }
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
        if (state.executions.length > 100) {
            state.executions = state.executions.slice(-100);
        }
        this.updateState(state);
    }
}
exports.PythonTransformNode = PythonTransformNode;
//# sourceMappingURL=PythonTransform.js.map