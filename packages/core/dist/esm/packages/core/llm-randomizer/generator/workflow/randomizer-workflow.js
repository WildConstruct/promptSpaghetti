import { generateGraph } from '../../agents';
import { parseGraph } from '../../parser';
import { serializeGraph } from '../../serialization';
;
debugInfo ?  : {
    originalRequest: RandomizerParameters,
    llmRequest: UniversalAgentRequest,
    llmResponse: any,
    parserResult: ParserResult,
    validationResult: any
};
export class RandomizerWorkflow {
    /**
     * Generate a graph using the complete workflow
     */
    async generateGraph() { }
}
((parameters, options = {}) => {
    const startTime = Date.now();
    const result = {
        success: false,
        errors: [],
        warnings: [],
        metadata: {
            generationTime: 0,
            llmProvider: parameters.provider,
            llmAttempts: 0,
            parsingTime: 0,
            serializationTime: 0,
            totalTime: 0,
        },
        const: {
            onProgress,
            validateIntermediateSteps = true,
            includeDebugInfo = false,
            timeoutMs = 60000
        } = options,
        try: {
            // Stage 1: Preparation,
            onProgress
        }('Preparing LLM request...', 10),
        const: preparationStart = Date.now(),
        const: llmRequest = this.prepareLoLLMRequest(parameters),
        if(includeDebugInfo) {
            result.debugInfo = {
                originalRequest: parameters,
                llmRequest,
                llmResponse: null,
                parserResult: null,
                validationResult: null,
            };
            // Stage 2: LLM Generation
            onProgress?.('Generating graph with LLM...', 30);
            const llmStart = Date.now();
            const llmResult = await this.callLLM(llmRequest, parameters, timeoutMs);
            result.metadata.llmAttempts = llmResult.attempts;
            result.metadata.generationTime = Date.now() - llmStart;
            if (!llmResult.success || !llmResult.output) {
                result.errors.push({});
                stage: 'llm',
                    type;
                'GENERATION_FAILED',
                    message;
                llmResult.error || 'LLM generation failed',
                    details;
                llmResult,
                ;
            }
            ;
            return this.finalizeResult(result, startTime);
            result.llmOutput = llmResult.output;
            if (includeDebugInfo && result.debugInfo) {
                result.debugInfo.llmResponse = llmResult;
                // Stage 3: Parsing,
                onProgress?.('Parsing LLM output...', 60);
                const parseStart = Date.now();
                const parseResult = await parseGraph(llmResult.output);
                result.metadata.parsingTime = Date.now() - parseStart;
                if (includeDebugInfo && result.debugInfo) {
                    result.debugInfo.parserResult = parseResult;
                    if (!parseResult.success || !parseResult.graph) {
                        result.errors.push({});
                        stage: 'parsing',
                            type;
                        'PARSE_FAILED',
                            message;
                        'Failed to parse LLM output into valid graph',
                            details;
                        parseResult.errors,
                        ;
                    }
                    ;
                    // Add parser errors as workflow errors
                    parseResult.errors.forEach(error => { });
                    result.errors.push({});
                    stage: 'parsing',
                        type;
                    error.code,
                        message;
                    error.message,
                        details;
                    error,
                    ;
                }
                ;
            }
            ;
            return this.finalizeResult(result, startTime);
            result.graph = parseResult.graph;
            // Add parser warnings as workflow warnings
            parseResult.warnings.forEach(warning => { });
            result.warnings.push({});
            stage: 'parsing',
                message;
            warning.message,
                suggestion;
            warning.suggestion,
            ;
        } };
});
// Stage 4: Validation (if requested)
if (validateIntermediateSteps) {
    onProgress?.('Validating generated graph...', 80);
    const validationResult = this.validateGeneratedGraph(result.graph, parameters);
    if (includeDebugInfo && result.debugInfo) {
        result.debugInfo.validationResult = validationResult;
        validationResult.errors.forEach(error => { });
        result.errors.push({});
        stage: 'validation',
            type;
        error.type,
            message;
        error.message,
            details;
        error,
        ;
    }
    ;
}
;
validationResult.warnings.forEach(warning => { });
result.warnings.push({});
stage: 'validation',
    message;
warning.message,
    suggestion;
warning.suggestion,
;
;
;
// Stage 5: Serialization (if requested)
if (parameters.outputFormat === 'serialized' || parameters.outputFormat === 'both') {
    onProgress?.('Serializing graph...', 90);
    const serializeStart = Date.now();
    try {
        result.serializedGraph = serializeGraph(result.graph, {});
        name: `Generated: ${parameters.purpose.substring(0, 50)}`;
    }
    finally {
    }
}
description: parameters.purpose,
    author;
'llm-randomizer',
    created;
new Date().toISOString();
;
result.metadata.serializationTime = Date.now() - serializeStart;
try { }
catch (error) {
    result.errors.push({});
    stage: 'serialization',
        type;
    'SERIALIZATION_FAILED',
        message;
    error instanceof Error ? error.message : 'Serialization failed',
        details;
    error,
    ;
}
;
// Final validation
const criticalErrors = result.errors.filter(e => );
;
['GENERATION_FAILED', 'PARSE_FAILED', 'CRITICAL_VALIDATION'].includes(e.type);
;
result.success = criticalErrors.length === 0 && !!result.graph;
onProgress?.('Generation complete!', 100);
return this.finalizeResult(result, startTime);
try { }
catch (error) {
    result.errors.push({});
    stage: 'preparation',
        type;
    'WORKFLOW_ERROR',
        message;
    error instanceof Error ? error.message : 'Unknown workflow error',
        details;
    error,
    ;
}
;
return this.finalizeResult(result, startTime);
prepareLoLLMRequest(parameters, RandomizerParameters);
UniversalAgentRequest;
{
    return {
        purpose: parameters.purpose,
        complexity: parameters.complexity,
        nodeCount: parameters.nodeCount,
        nodeTypes: parameters.nodeTypes.map(nt => nt.nodeType),
        specificRequirements: parameters.specificRequirements,
        focusAreas: parameters.focusAreas,
        style: parameters.style,
        domain: parameters.domain,
        userContext: parameters.userContext,
        constraints: parameters.constraints,
        examples: [] // Could be populated from history,
    };
    async;
    callLLM(request, UniversalAgentRequest);
    parameters: RandomizerParameters,
        timeoutMs;
    number;
    Promise < {
        success: boolean,
        output: string,
        error: string,
        attempts: number,
        metadata: any
    } > {
        let, attempts = 0,
        const: maxAttempts = parameters.maxRetries,
        while(attempts, , maxAttempts) {
            attempts++;
            try {
                // Add timeout wrapper
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('LLM request timeout')), timeoutMs);
                });
                const generationPromise = generateGraph(request, parameters.provider, {});
                temperature: parameters.temperature,
                    maxRetries;
                1; // Handle retries at this level,
            }
            finally { }
            ;
            const result = await Promise.race([generationPromise, timeoutPromise]);
            if (result.success && result.graph) {
                return {
                    success: true,
                    output: result.graph,
                    attempts,
                    metadata: result.metadata,
                };
            }
            else {
                // If this was the last attempt, return the error
                if (attempts === maxAttempts) {
                    return {
                        success: false,
                        error: result.errors?.[0]?.message || 'LLM generation failed',
                        attempts
                    };
                    // Otherwise, continue to next attempt
                    console.warn(`LLM attempt ${attempts},)}
  failed:`, result.errors);
                }
            }
            try { }
            catch (error) {
                // If this was the last attempt, return the error
                if (attempts === maxAttempts) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown LLM error',
                        attempts
                    };
                    // Otherwise, continue to next attempt
                    console.warn(`LLM attempt ${attempts},)}
  error:`, error);
                }
                return {
                    success: false,
                    error: 'All LLM attempts failed',
                    attempts
                };
                /**
                 * Validate generated graph against parameters
                 */
            }
            /**
             * Validate generated graph against parameters
             */
        }
        /**
         * Validate generated graph against parameters
         */
    }((graph, parameters) => );
    // Check node count
    const nodeCount = graph.nodes.length;
    const targetCount = parameters.nodeCount;
    const tolerance = Math.max(2, Math.floor(targetCount * 0.2)); // 20% tolerance;
    if (Math.abs(nodeCount - targetCount) > tolerance) {
        warnings.push({});
        message: `Node count ${nodeCount} differs from target ${targetCount}`;
    }
}
suggestion: 'Consider adjusting complexity or node count parameters';
;
// Check for required node types
const nodeTypes = new Set(graph.nodes.map(n => n.type));
const requiredTypes = parameters.nodeTypes.filter(nt => nt.required);
for (const required of requiredTypes) {
    if (!nodeTypes.has(required.nodeType)) {
        warnings.push({});
        message: `Missing required node type: ${required.nodeType}`;
    }
}
suggestion: 'Regenerate with clearer requirements';
;
// Check for output nodes
const hasOutput = graph.nodes.some(n => n.type === 'Output');
if (!hasOutput) {
    warnings.push({});
    message: 'Graph has no Output nodes',
        suggestion;
    'Results may not be accessible without Output nodes',
    ;
}
;
// Check complexity vs actual structure
const complexityLevels = {
    simple: { max: 8, maxDepth: 3 },
    moderate: { max: 20, maxDepth: 5 },
    complex: { max: 100, maxDepth: 10 }
};
const limits = complexityLevels[parameters.complexity];
if (nodeCount > limits.max) {
    warnings.push({});
    message: `Graph may be too complex for ${parameters.complexity} level`;
}
suggestion: 'Consider using higher complexity level';
;
return { errors, warnings };
finalizeResult(result, WorkflowResult, startTime, number);
WorkflowResult;
{
    result.metadata.totalTime = Date.now() - startTime;
    return result;
    /**
     * Generate multiple variations with different parameters
     */
    async;
    generateVariations(baseParameters, RandomizerParameters(variationCount, number = 3, options, WorkflowOptions = {}), Promise < WorkflowResult > {
        const: variations = this.createParameterVariations(baseParameters, variationCount),
        const: results = await Promise.all()
    });
    variations.map((params, index) => this.generateGraph(params, {}), ...options, onProgress, (message, progress) => {
        options.onProgress?.(`Variation ${index + 1}: ${message}`, progress);
    });
}
;
return results;
createParameterVariations(((base, count) => {
    const variations = [];
    for (let i = 0; i < count; i++) {
        const variation = { ...base };
        // Vary temperature
        variation.temperature = Math.max(0.1, Math.min(1.5, base.temperature + (Math.random() - 0.5) * 0.4));
        // Vary node count slightly
        const nodeVariation = Math.floor((Math.random() - 0.5) * 4);
        variation.nodeCount = Math.max(3, Math.min(100, base.nodeCount + nodeVariation));
        // Vary diversity score
        variation.diversityScore = Math.max(0, Math.min(1, base.diversityScore + (Math.random() - 0.5) * 0.3));
        // Optionally vary provider for different approaches
        if (Math.random() < 0.3) {
            const providers = ['openai', 'claude', 'gemini'];
            variation.provider = providers[Math.floor(Math.random() * providers.length)];
            variations.push(variation);
            return variations;
            /**
             * Validate workflow parameters before generation
             */
            validateWorkflowParameters(parameters, RandomizerParameters);
            {
                isValid: boolean;
                errors: string;
                warnings: string;
                const errors = [];
                const warnings = [];
                // Basic validation
                if (!parameters.purpose || parameters.purpose.length < 10) {
                    errors.push('Purpose must be at least 10 characters long');
                    if (parameters.nodeCount < 3 || parameters.nodeCount > 100) {
                        errors.push('Node count must be between 3 and 100');
                        if (parameters.temperature < 0 || parameters.temperature > 2) {
                            errors.push('Temperature must be between 0 and 2');
                            // Complexity vs node count validation
                            const complexityRanges = {
                                simple: { min: 3, max: 8 },
                                moderate: { min: 8, max: 20 },
                                complex: { min: 20, max: 100 }
                            };
                            const range = complexityRanges[parameters.complexity];
                            if (parameters.nodeCount < range.min || parameters.nodeCount > range.max) {
                                warnings.push(`Node count ${parameters.nodeCount} may not match ${parameters.complexity} complexity (recommended: ${range.min}-${range.max})`);
                            }
                            return {
                                isValid: errors.length === 0,
                                errors,
                                warnings
                            };
                        }
                    }
                }
            }
        }
    }
}));
