/**
 * Cross-platform Claude integration client
 */
import { ClaudeConfig, ClaudeResponse, GraphContext, PromptSuggestion } from './types';
export declare class ClaudeClient {
    private config;
    constructor(config: ClaudeConfig);
    generatePromptSuggestions(context: GraphContext): Promise<PromptSuggestion[]>;
    enhancePrompt(prompt: string, context?: GraphContext): Promise<ClaudeResponse>;
    analyzeGraph(context: GraphContext): Promise<ClaudeResponse>;
}
//# sourceMappingURL=client.d.ts.map