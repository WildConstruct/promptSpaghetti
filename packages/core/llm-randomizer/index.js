// Epic 12 - LLM Agent Randomizer System
// Main exports for the complete LLM randomizer system
// Story 12.1 - Serialization Format Design
export { GraphSerializer, serializeGraph, createDefaultMetadata } from './serialization/serializer';
// Story 12.2 - LLM Agent Script Development  
export * from './agents';
// Story 12.3 - Parser Implementation
export * from './parser';
// Story 12.4 - Randomizer Generator Implementation
export * from './generator';
/**
 * Complete LLM Randomizer System implementation
 */
export class LLMRandomizerSystem {
    workflow;
    async generateWithLLM(request, provider = 'openai') {
        const { generateGraph } = await import('./agents');
        return generateGraph(request, provider);
    }
    async parseFromLLM(llmOutput) {
        const { parseGraph } = await import('./parser');
        return parseGraph(llmOutput);
    }
    async validateAndSerialize(graph) {
        const { serializeGraph } = await import('./serialization');
        return serializeGraph(graph);
    }
    async fullWorkflow(request, provider = 'openai') {
        // Initialize workflow if needed
        if (!this.workflow) {
            const { RandomizerWorkflow } = await import('./generator');
            this.workflow = new RandomizerWorkflow();
        }
        // Convert request to RandomizerParameters if needed
        const parameters = this.normalizeParameters(request, provider);
        return this.workflow.generateGraph(parameters);
    }
    normalizeParameters(request, provider) {
        // Convert various request formats to RandomizerParameters
        if (typeof request === 'string') {
            return {
                purpose: request,
                complexity: 'moderate',
                nodeCount: 12,
                style: 'balanced',
                provider,
                temperature: 0.7,
                maxRetries: 3,
                nodeTypes: [],
                specificRequirements: [],
                constraints: [],
                focusAreas: [],
                includeMetadata: true,
                validateOutput: true,
                enablePreview: true,
                preferredPatterns: [],
                avoidPatterns: [],
                qualityLevel: 'standard',
                diversityScore: 0.5,
                outputFormat: 'both',
                includeExplanation: false,
                domain: undefined,
                userContext: undefined
            };
        }
        return {
            provider,
            temperature: 0.7,
            maxRetries: 3,
            nodeTypes: [],
            specificRequirements: [],
            constraints: [],
            focusAreas: [],
            includeMetadata: true,
            validateOutput: true,
            enablePreview: true,
            preferredPatterns: [],
            avoidPatterns: [],
            qualityLevel: 'standard',
            diversityScore: 0.5,
            outputFormat: 'both',
            includeExplanation: false,
            domain: undefined,
            userContext: undefined,
            ...request
        };
    }
}
