/**
 * Predefined prompts and templates for Claude integration
 */
import { GraphContext } from './types';
export declare const SystemPrompts: {
    readonly GRAPH_ANALYSIS: "You are an expert at analyzing prompt engineering graphs. \n    Analyze the provided graph structure and suggest improvements or identify patterns.";
    readonly PROMPT_ENHANCEMENT: "You are a prompt engineering expert. \n    Enhance the given prompt to be more effective and specific.";
    readonly NODE_SUGGESTION: "Based on the current graph context, suggest the next logical node \n    to add to this prompt engineering workflow.";
};
export declare function buildGraphAnalysisPrompt(context: GraphContext): string;
export declare function buildPromptEnhancementPrompt(prompt: string, context?: GraphContext): string;
//# sourceMappingURL=prompts.d.ts.map