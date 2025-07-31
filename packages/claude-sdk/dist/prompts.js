/**
 * Predefined prompts and templates for Claude integration
 */
export const SystemPrompts = {
    GRAPH_ANALYSIS: `You are an expert at analyzing prompt engineering graphs. 
    Analyze the provided graph structure and suggest improvements or identify patterns.`,
    PROMPT_ENHANCEMENT: `You are a prompt engineering expert. 
    Enhance the given prompt to be more effective and specific.`,
    NODE_SUGGESTION: `Based on the current graph context, suggest the next logical node 
    to add to this prompt engineering workflow.`,
};
export function buildGraphAnalysisPrompt(context) {
    const nodeCount = context.graph.nodes.size;
    const edgeCount = context.graph.edges.size;
    return `${SystemPrompts.GRAPH_ANALYSIS}

Graph Statistics:
- Nodes: ${nodeCount}
- Edges: ${edgeCount}
- Selected Node: ${context.selectedNodeId || 'None'}

User Intent: ${context.userIntent || 'Not specified'}

Please analyze this graph structure and provide insights.`;
}
export function buildPromptEnhancementPrompt(prompt, context) {
    let basePrompt = `${SystemPrompts.PROMPT_ENHANCEMENT}

Original Prompt: "${prompt}"

Please enhance this prompt to be more effective.`;
    if (context) {
        basePrompt += `\n\nContext: This prompt is part of a larger graph with ${context.graph.nodes.size} nodes.`;
    }
    return basePrompt;
}
//# sourceMappingURL=prompts.js.map