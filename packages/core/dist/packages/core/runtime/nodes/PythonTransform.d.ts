/**
 * PythonTransform Node Implementation
 * Epic 8 Story 8.1.4: Python executor integration
 */
import { AdvancedRuntimeNode } from '../advanced';
export interface PythonTransformConfig {
    code: string;
    timeout?: number;
    memoryLimit?: string;
    allowedModules?: string;
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
}
//# sourceMappingURL=PythonTransform.d.ts.map