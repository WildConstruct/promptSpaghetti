import { RandomizerParameters } from '../parameters/parameter-schema';
import { UniversalAgentRequest } from '../../agents';
import { ParserResult } from '../../parser';
import { Graph } from '../../../graphSchema';
export interface WorkflowOptions {
    onProgress?: (message: string, progress?: number) => void;
    validateIntermediateSteps?: boolean;
    includeDebugInfo?: boolean;
    timeoutMs?: number;
}
export interface WorkflowResult {
    success: boolean;
    graph?: Graph;
    serializedGraph?: string;
    llmOutput?: string;
    errors: WorkflowError[];
    warnings: WorkflowWarning[];
    metadata: {
        generationTime: number;
        llmProvider: string;
        llmAttempts: number;
        parsingTime: number;
        serializationTime: number;
        totalTime: number;
    };
    debugInfo?: {
        originalRequest: RandomizerParameters;
        llmRequest: UniversalAgentRequest;
        llmResponse: any;
        parserResult: ParserResult;
        validationResult: any;
    };
}
export interface WorkflowError {
    stage: 'preparation' | 'llm' | 'parsing' | 'validation' | 'serialization';
    type: string;
    message: string;
    details?: any;
}
export interface WorkflowWarning {
    stage: string;
    message: string;
    suggestion?: string;
}
export declare class RandomizerWorkflow {
    generateGraph(parameters: RandomizerParameters, options?: WorkflowOptions): Promise<WorkflowResult>;
    private prepareLoLLMRequest;
    private callLLM;
    private validateGeneratedGraph;
    private finalizeResult;
    generateVariations(baseParameters: RandomizerParameters, variationCount?: number, options?: WorkflowOptions): Promise<WorkflowResult[]>;
    private createParameterVariations;
    validateWorkflowParameters(parameters: RandomizerParameters): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
//# sourceMappingURL=randomizer-workflow.d.ts.map