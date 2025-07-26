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
/**
 * Complete randomizer workflow that orchestrates all Epic 12 components
 */
export declare class RandomizerWorkflow {
    /**
     * Generate a graph using the complete workflow
     */
    generateGraph(parameters: RandomizerParameters, options?: WorkflowOptions): Promise<WorkflowResult>;
    /**
     * Prepare LLM request from parameters
     */
    private prepareLoLLMRequest;
    /**
     * Call LLM with retry logic and error handling
     */
    private callLLM;
    /**
     * Validate generated graph against parameters
     */
    private validateGeneratedGraph;
    /**
     * Finalize result with timing metadata
     */
    private finalizeResult;
    /**
     * Generate multiple variations with different parameters
     */
    generateVariations(
      baseParameters: RandomizerParameters,
      variationCount?: number,
      options?: WorkflowOptions
    ): Promise<WorkflowResult[]>;
    /**
     * Create parameter variations for multiple generations
     */
    private createParameterVariations;
    /**
     * Validate workflow parameters before generation
     */
    validateWorkflowParameters(parameters: RandomizerParameters): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
//# sourceMappingURL=randomizer-workflow.d.ts.map