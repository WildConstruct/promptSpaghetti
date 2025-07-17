"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomizerWorkflow = void 0;
const agents_1 = require("../../agents");
const parser_1 = require("../../parser");
const serialization_1 = require("../../serialization");
class RandomizerWorkflow {
    async generateGraph(parameters, options = {}) {
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
                totalTime: 0
            }
        };
        const { onProgress, validateIntermediateSteps = true, includeDebugInfo = false, timeoutMs = 60000 } = options;
        try {
            onProgress?.('Preparing LLM request...', 10);
            const preparationStart = Date.now();
            const llmRequest = this.prepareLoLLMRequest(parameters);
            if (includeDebugInfo) {
                result.debugInfo = {
                    originalRequest: parameters,
                    llmRequest,
                    llmResponse: null,
                    parserResult: null,
                    validationResult: null
                };
            }
            onProgress?.('Generating graph with LLM...', 30);
            const llmStart = Date.now();
            const llmResult = await this.callLLM(llmRequest, parameters, timeoutMs);
            result.metadata.llmAttempts = llmResult.attempts;
            result.metadata.generationTime = Date.now() - llmStart;
            if (!llmResult.success || !llmResult.output) {
                result.errors.push({
                    stage: 'llm',
                    type: 'GENERATION_FAILED',
                    message: llmResult.error || 'LLM generation failed',
                    details: llmResult
                });
                return this.finalizeResult(result, startTime);
            }
            result.llmOutput = llmResult.output;
            if (includeDebugInfo && result.debugInfo) {
                result.debugInfo.llmResponse = llmResult;
            }
            onProgress?.('Parsing LLM output...', 60);
            const parseStart = Date.now();
            const parseResult = await (0, parser_1.parseGraph)(llmResult.output);
            result.metadata.parsingTime = Date.now() - parseStart;
            if (includeDebugInfo && result.debugInfo) {
                result.debugInfo.parserResult = parseResult;
            }
            if (!parseResult.success || !parseResult.graph) {
                result.errors.push({
                    stage: 'parsing',
                    type: 'PARSE_FAILED',
                    message: 'Failed to parse LLM output into valid graph',
                    details: parseResult.errors
                });
                parseResult.errors.forEach(error => {
                    result.errors.push({
                        stage: 'parsing',
                        type: error.code,
                        message: error.message,
                        details: error
                    });
                });
                return this.finalizeResult(result, startTime);
            }
            result.graph = parseResult.graph;
            parseResult.warnings.forEach(warning => {
                result.warnings.push({
                    stage: 'parsing',
                    message: warning.message,
                    suggestion: warning.suggestion
                });
            });
            if (validateIntermediateSteps) {
                onProgress?.('Validating generated graph...', 80);
                const validationResult = this.validateGeneratedGraph(result.graph, parameters);
                if (includeDebugInfo && result.debugInfo) {
                    result.debugInfo.validationResult = validationResult;
                }
                validationResult.errors.forEach(error => {
                    result.errors.push({
                        stage: 'validation',
                        type: error.type,
                        message: error.message,
                        details: error
                    });
                });
                validationResult.warnings.forEach(warning => {
                    result.warnings.push({
                        stage: 'validation',
                        message: warning.message,
                        suggestion: warning.suggestion
                    });
                });
            }
            if (parameters.outputFormat === 'serialized' || parameters.outputFormat === 'both') {
                onProgress?.('Serializing graph...', 90);
                const serializeStart = Date.now();
                try {
                    result.serializedGraph = (0, serialization_1.serializeGraph)(result.graph, {
                        name: `Generated: ${parameters.purpose.substring(0, 50)}`,
                        description: parameters.purpose,
                        author: 'llm-randomizer',
                        created: new Date().toISOString()
                    });
                    result.metadata.serializationTime = Date.now() - serializeStart;
                }
                catch (error) {
                    result.errors.push({
                        stage: 'serialization',
                        type: 'SERIALIZATION_FAILED',
                        message: error instanceof Error ? error.message : 'Serialization failed',
                        details: error
                    });
                }
            }
            const criticalErrors = result.errors.filter(e => ['GENERATION_FAILED', 'PARSE_FAILED', 'CRITICAL_VALIDATION'].includes(e.type));
            result.success = criticalErrors.length === 0 && !!result.graph;
            onProgress?.('Generation complete!', 100);
            return this.finalizeResult(result, startTime);
        }
        catch (error) {
            result.errors.push({
                stage: 'preparation',
                type: 'WORKFLOW_ERROR',
                message: error instanceof Error ? error.message : 'Unknown workflow error',
                details: error
            });
            return this.finalizeResult(result, startTime);
        }
    }
    prepareLoLLMRequest(parameters) {
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
            examples: []
        };
    }
    async callLLM(request, parameters, timeoutMs) {
        let attempts = 0;
        const maxAttempts = parameters.maxRetries;
        while (attempts < maxAttempts) {
            attempts++;
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('LLM request timeout')), timeoutMs);
                });
                const generationPromise = (0, agents_1.generateGraph)(request, parameters.provider, {
                    temperature: parameters.temperature,
                    maxRetries: 1
                });
                const result = await Promise.race([generationPromise, timeoutPromise]);
                if (result.success && result.graph) {
                    return {
                        success: true,
                        output: result.graph,
                        attempts,
                        metadata: result.metadata
                    };
                }
                else {
                    if (attempts === maxAttempts) {
                        return {
                            success: false,
                            error: result.errors?.[0]?.message || 'LLM generation failed',
                            attempts
                        };
                    }
                    console.warn(`LLM attempt ${attempts} failed:`, result.errors);
                }
            }
            catch (error) {
                if (attempts === maxAttempts) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown LLM error',
                        attempts
                    };
                }
                console.warn(`LLM attempt ${attempts} error:`, error);
            }
        }
        return {
            success: false,
            error: 'All LLM attempts failed',
            attempts
        };
    }
    validateGeneratedGraph(graph, parameters) {
        const errors = [];
        const warnings = [];
        const nodeCount = graph.nodes.length;
        const targetCount = parameters.nodeCount;
        const tolerance = Math.max(2, Math.floor(targetCount * 0.2));
        if (Math.abs(nodeCount - targetCount) > tolerance) {
            warnings.push({
                message: `Node count ${nodeCount} differs from target ${targetCount}`,
                suggestion: 'Consider adjusting complexity or node count parameters'
            });
        }
        const nodeTypes = new Set(graph.nodes.map(n => n.type));
        const requiredTypes = parameters.nodeTypes.filter(nt => nt.required);
        for (const required of requiredTypes) {
            if (!nodeTypes.has(required.nodeType)) {
                warnings.push({
                    message: `Missing required node type: ${required.nodeType}`,
                    suggestion: 'Regenerate with clearer requirements'
                });
            }
        }
        const hasOutput = graph.nodes.some(n => n.type === 'Output');
        if (!hasOutput) {
            warnings.push({
                message: 'Graph has no Output nodes',
                suggestion: 'Results may not be accessible without Output nodes'
            });
        }
        const complexityLevels = {
            simple: { max: 8, maxDepth: 3 },
            moderate: { max: 20, maxDepth: 5 },
            complex: { max: 100, maxDepth: 10 }
        };
        const limits = complexityLevels[parameters.complexity];
        if (nodeCount > limits.max) {
            warnings.push({
                message: `Graph may be too complex for ${parameters.complexity} level`,
                suggestion: 'Consider using higher complexity level'
            });
        }
        return { errors, warnings };
    }
    finalizeResult(result, startTime) {
        result.metadata.totalTime = Date.now() - startTime;
        return result;
    }
    async generateVariations(baseParameters, variationCount = 3, options = {}) {
        const variations = this.createParameterVariations(baseParameters, variationCount);
        const results = await Promise.all(variations.map((params, index) => this.generateGraph(params, {
            ...options,
            onProgress: (message, progress) => {
                options.onProgress?.(`Variation ${index + 1}: ${message}`, progress);
            }
        })));
        return results;
    }
    createParameterVariations(base, count) {
        const variations = [];
        for (let i = 0; i < count; i++) {
            const variation = { ...base };
            variation.temperature = Math.max(0.1, Math.min(1.5, base.temperature + (Math.random() - 0.5) * 0.4));
            const nodeVariation = Math.floor((Math.random() - 0.5) * 4);
            variation.nodeCount = Math.max(3, Math.min(100, base.nodeCount + nodeVariation));
            variation.diversityScore = Math.max(0, Math.min(1, base.diversityScore + (Math.random() - 0.5) * 0.3));
            if (Math.random() < 0.3) {
                const providers = ['openai', 'claude', 'gemini'];
                variation.provider = providers[Math.floor(Math.random() * providers.length)];
            }
            variations.push(variation);
        }
        return variations;
    }
    validateWorkflowParameters(parameters) {
        const errors = [];
        const warnings = [];
        if (!parameters.purpose || parameters.purpose.length < 10) {
            errors.push('Purpose must be at least 10 characters long');
        }
        if (parameters.nodeCount < 3 || parameters.nodeCount > 100) {
            errors.push('Node count must be between 3 and 100');
        }
        if (parameters.temperature < 0 || parameters.temperature > 2) {
            errors.push('Temperature must be between 0 and 2');
        }
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
exports.RandomizerWorkflow = RandomizerWorkflow;
//# sourceMappingURL=randomizer-workflow.js.map