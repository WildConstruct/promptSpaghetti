/**
 * Critical Workflow Monitoring
 * Tracks and monitors critical user workflows for Epic 1
 */
import { apm } from './APMService';
import { monitoring } from './MonitoringService';
/**
 * Workflow monitoring service
 */
export class WorkflowMonitor {
    static instance;
    workflows = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new WorkflowMonitor();
        }
        return this.instance;
    }
    constructor() {
        this.initializeCriticalWorkflows();
    }
    /**
     * Initialize critical workflows for Epic 1
     */
    initializeCriticalWorkflows() {
        // Graph creation workflow
        this.registerWorkflow({
            id: 'graph-creation',
            name: 'Graph Creation',
            expectedDuration: 5000,
            steps: [
                {
                    name: 'Load Editor',
                    handler: async () => {
                        // Simulate loading editor
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Parse Prompt',
                    handler: async () => {
                        // Simulate parsing prompt
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Generate Nodes',
                    handler: async () => {
                        // Simulate node generation
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Layout Graph',
                    handler: async () => {
                        // Simulate graph layout
                        return { success: true };
                    },
                },
            ],
        });
        // Inline editing workflow
        this.registerWorkflow({
            id: 'inline-editing',
            name: 'Inline Editing',
            expectedDuration: 1000,
            steps: [
                {
                    name: 'Enter Edit Mode',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                    timeout: 500,
                },
                {
                    name: 'Update Content',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Update Preview',
                    handler: async () => {
                        return { success: true };
                    },
                    timeout: 2000,
                },
            ],
        });
        // Graph execution workflow
        this.registerWorkflow({
            id: 'graph-execution',
            name: 'Graph Execution',
            expectedDuration: 3000,
            steps: [
                {
                    name: 'Validate Graph',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Execute Nodes',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                    timeout: 5000,
                },
                {
                    name: 'Generate Output',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                },
            ],
        });
        // File save workflow
        this.registerWorkflow({
            id: 'file-save',
            name: 'File Save',
            expectedDuration: 2000,
            steps: [
                {
                    name: 'Validate Data',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Serialize Graph',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                },
                {
                    name: 'Write to Storage',
                    handler: async () => {
                        return { success: true };
                    },
                    critical: true,
                    timeout: 3000,
                },
            ],
        });
    }
    /**
     * Register a workflow
     */
    registerWorkflow(workflow) {
        this.workflows.set(workflow.id, workflow);
    }
    /**
     * Execute a workflow with monitoring
     */
    async executeWorkflow(workflowId, context) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        const startTime = performance.now();
        const transaction = apm.startTransaction(workflow.name, 'task');
        const stepResults = [];
        let workflowSuccess = true;
        try {
            // Execute each step
            for (const step of workflow.steps) {
                const stepStartTime = performance.now();
                const span = apm.addSpan(transaction.id, step.name);
                let stepSuccess = true;
                let stepError;
                try {
                    // Execute with timeout if specified
                    if (step.timeout) {
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Step timeout')), step.timeout));
                        await Promise.race([step.handler(), timeoutPromise]);
                    }
                    else {
                        await step.handler();
                    }
                    apm.endSpan(transaction.id, span.id);
                }
                catch (error) {
                    stepSuccess = false;
                    stepError = error.message;
                    workflowSuccess = false;
                    // Track error
                    apm.trackError(error, {
                        workflow: workflow.name,
                        step: step.name,
                        critical: step.critical,
                    });
                    // If critical step fails, abort workflow
                    if (step.critical) {
                        throw error;
                    }
                }
                const stepDuration = performance.now() - stepStartTime;
                stepResults.push({
                    name: step.name,
                    duration: stepDuration,
                    success: stepSuccess,
                    error: stepError,
                });
                // Record step metric
                monitoring.recordMetric(`workflow.step.${workflow.id}.${step.name}`, stepDuration, {
                    success: stepSuccess.toString(),
                });
            }
            apm.endTransaction(transaction.id, 'success');
        }
        catch (error) {
            workflowSuccess = false;
            apm.endTransaction(transaction.id, 'error', error);
        }
        const totalDuration = performance.now() - startTime;
        // Track workflow metric
        const workflowMetric = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            steps: stepResults,
            totalDuration,
            success: workflowSuccess,
            timestamp: new Date(),
        };
        apm.trackWorkflow(workflowMetric);
        // Check if duration exceeds expected
        if (workflow.expectedDuration && totalDuration > workflow.expectedDuration) {
            monitoring.recordMetric('workflow.slow', 1, {
                workflow: workflow.id,
                expected: workflow.expectedDuration.toString(),
                actual: totalDuration.toFixed(0),
            });
        }
        return {
            success: workflowSuccess,
            duration: totalDuration,
            steps: stepResults,
        };
    }
    /**
     * Monitor a custom workflow
     */
    async monitorCustomWorkflow(name, handler, options) {
        const startTime = performance.now();
        const transaction = apm.startTransaction(name, 'custom');
        try {
            const result = await handler();
            const duration = performance.now() - startTime;
            apm.endTransaction(transaction.id, 'success');
            // Track metric
            monitoring.recordMetric(`workflow.custom.${name}`, duration, {
                ...(options?.metadata || {}),
            });
            // Check duration
            if (options?.expectedDuration && duration > options.expectedDuration) {
                monitoring.recordMetric('workflow.custom.slow', 1, {
                    name,
                    expected: options.expectedDuration.toString(),
                    actual: duration.toFixed(0),
                });
            }
            return result;
        }
        catch (error) {
            apm.endTransaction(transaction.id, 'error', error);
            // Track error
            apm.trackError(error, {
                workflow: name,
                critical: options?.critical,
                ...(options?.metadata || {}),
            });
            throw error;
        }
    }
    /**
     * Create workflow timing helper
     */
    createTimingHelper(workflowName) {
        const steps = [];
        const workflowStartTime = performance.now();
        let currentStep = null;
        return {
            startStep: (stepName) => {
                if (currentStep) {
                    // Auto-end previous step
                    const duration = performance.now() - currentStep.startTime;
                    steps.push({
                        name: currentStep.name,
                        startTime: currentStep.startTime,
                        duration,
                        success: true,
                    });
                }
                currentStep = {
                    name: stepName,
                    startTime: performance.now(),
                };
            },
            endStep: (stepName, success = true) => {
                if (currentStep && currentStep.name === stepName) {
                    const duration = performance.now() - currentStep.startTime;
                    steps.push({
                        name: currentStep.name,
                        startTime: currentStep.startTime,
                        duration,
                        success,
                    });
                    currentStep = null;
                }
            },
            finish: (success = true) => {
                // End current step if any
                if (currentStep) {
                    const duration = performance.now() - currentStep.startTime;
                    steps.push({
                        name: currentStep.name,
                        startTime: currentStep.startTime,
                        duration,
                        success: true,
                    });
                }
                const totalDuration = performance.now() - workflowStartTime;
                const workflowMetric = {
                    workflowId: `custom-${workflowName}`,
                    workflowName,
                    steps: steps.map(s => ({
                        name: s.name,
                        duration: s.duration || 0,
                        success: s.success,
                    })),
                    totalDuration,
                    success,
                    timestamp: new Date(),
                };
                apm.trackWorkflow(workflowMetric);
                return workflowMetric;
            },
        };
    }
}
// Export singleton instance
export const workflowMonitor = WorkflowMonitor.getInstance();
/**
 * Decorator for monitoring methods as workflows
 */
export function monitorWorkflow(workflowName) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const name = workflowName || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = async function (...args) {
            return workflowMonitor.monitorCustomWorkflow(name, () => originalMethod.apply(this, args), {
                metadata: {
                    class: target.constructor.name,
                    method: propertyKey,
                },
            });
        };
        return descriptor;
    };
}
