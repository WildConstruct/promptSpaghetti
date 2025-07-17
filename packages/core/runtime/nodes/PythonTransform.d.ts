import { AdvancedRuntimeNode, AdvancedExecutionContext } from '../advanced';
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
    private config;
    constructor(id: string, config: PythonTransformConfig);
    protected defineIOSpec(): IOSpecBuilder;
    protected executeCore(context: AdvancedExecutionContext): Promise<string>;
    private extractContextForPython;
    private processResult;
    private handleExecutionFailure;
    private handleClientError;
    private logSecurityEvents;
    private logWarnings;
    getConfig(): PythonTransformConfig;
    updateConfig(newConfig: Partial<PythonTransformConfig>): void;
    validateCode(): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    isServiceAvailable(): Promise<boolean>;
    getServiceHealth(): Promise<{
        status: string;
        version: string;
        uptime: number;
    } | null>;
    getExecutionStats(): {
        executionsRun: number;
        successRate: number;
        averageExecutionTime: number;
        securityViolations: number;
    };
    protected storeExecutionMetadata(success: boolean, executionTime: number, securityViolations: number): void;
}
//# sourceMappingURL=PythonTransform.d.ts.map