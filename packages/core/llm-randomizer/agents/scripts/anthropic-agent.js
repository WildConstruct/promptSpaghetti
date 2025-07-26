// Epic 12 - LLM Agent Randomizer System
// Story 12.2 - LLM Agent Script Development
// Anthropic Claude agent script with XML formatting and error correction
import { validateFormat } from '../../serialization/validator';
export class AnthropicGraphAgent {
    config;
    baseSystemPrompt;
    constructor(config) {
        this.config = config;
        this.baseSystemPrompt = this.buildClaudeSystemPrompt();
    }
    /**
     * Generate a graph using Claude with XML formatting
     */
    async generateGraph(request) {
        const startTime = Date.now();
        let attempts = 0;
        let currentTemperature = this.config.temperature;
        while (attempts < this.config.maxRetries) {
            attempts++;
            try {
                const userPrompt = this.buildClaudeUserPrompt(request);
                const response = await this.callAnthropic(userPrompt, currentTemperature);
                if (response.success && response.content) {
                    // Extract graph and reasoning from Claude's response
                    const { graph, reasoning } = this.parseClaudeResponse(response.content);
                    if (graph) {
                        // Validate the generated graph
                        const validation = validateFormat(graph);
                        if (validation.isValid) {
                            return {
                                success: true,
                                graph,
                                reasoning,
                                warnings: validation.warnings.map(w => w.message),
                                attempts,
                                metadata: {
                                    model: this.config.model,
                                    temperature: currentTemperature,
                                    tokenCount: response.tokenCount || 0,
                                    generationTime: Date.now() - startTime
                                }
                            };
                        }
                        else {
                            // Validation failed - try again with corrections
                            console.log(`Attempt ${attempts} failed validation:`, validation.errors);
                            if (attempts === this.config.maxRetries) {
                                return {
                                    success: false,
                                    errors: validation.errors.map(e => e.message),
                                    reasoning,
                                    attempts,
                                    metadata: {
                                        model: this.config.model,
                                        temperature: currentTemperature,
                                        tokenCount: response.tokenCount || 0,
                                        generationTime: Date.now() - startTime
                                    }
                                };
                            }
                        }
                    }
                    else {
                        console.log(`Attempt ${attempts} - no graph extracted from response`);
                    }
                }
                else {
                    console.log(`Attempt ${attempts} failed:`, response.error);
                }
            }
            catch (error) {
                console.error(`Attempt ${attempts} error:`, error);
            }
            // Reduce temperature for retry
            currentTemperature = Math.max(0.1, currentTemperature - this.config.retryTemperatureReduction);
        }
        return {
            success: false,
            errors: ['Maximum retry attempts exceeded'],
            attempts,
            metadata: {
                model: this.config.model,
                temperature: currentTemperature,
                tokenCount: 0,
                generationTime: Date.now() - startTime
            }
        };
    }
    /**
     * Build Claude-optimized system prompt with XML formatting
     */
    buildClaudeSystemPrompt() {
        return `You are an expert Prompt Spaghetti graph generator. You create valid, creative graphs that follow a specific YAML-like serialization format.

Your task is to generate functional graph structures that solve real problems while adhering strictly to the format specification.

<format_specification>
The output must follow this exact structure:

version: 1.0.0
metadata:
  name: "Descriptive Graph Name"
  description: "Clear purpose description"
  author: "llm-agent"
  created: "${new Date().toISOString()}"

---NODES---
descriptive_node_id:
  type: NodeType
  props:
    property: value
  inputs: [input_node_ids]

---EDGES---
source_node -> target_node

---END---
</format_specification>

<node_types>
### Basic Node Types:
1. **WeightedChoice** - Random selection with probability weights
   - Required: props.choices (array of {value, weight})
   - Use for: Random text generation, option selection

2. **Concat** - Combines multiple text inputs in order
   - Required: inputs (array of node IDs)
   - Use for: Joining text pieces, building sentences

3. **Output** - Marks final graph outputs
   - Required: inputs (array of node IDs) 
   - Use for: Graph result endpoints

4. **SetVariable/GetVariable** - Variable storage and retrieval
   - Required: props.key (variable name)
   - SetVariable also needs: props.value
   - Use for: Data persistence, reusing values

5. **Include** - Template/subgraph inclusion
   - Required: props.name (template identifier)
   - Use for: Modular graph components

### Advanced Node Types:
6. **WeightedAdvanced** - Complex probability distributions
   - Required: props.choices, optional: props.distribution
   - Use for: Sophisticated randomization patterns

7. **Conditional** - Logic-based branching
   - Required: props.branches (condition/output pairs)
   - Use for: Decision trees, conditional text

8. **Sequential** - Ordered sequence processing  
   - Required: props.sequence (ordered items)
   - Use for: Step-by-step processes, ordered lists

9. **Markov** - State transition chains
   - Required: props.states (transition matrix)
   - Use for: Dynamic text generation, state machines

10. **PythonTransform** - Code execution for data processing
    - Required: props.code (Python code string)
    - Use for: Complex transformations, calculations
</node_types>

<validation_rules>
CRITICAL REQUIREMENTS:
✓ All node IDs must be unique and descriptive (use underscores, no spaces)
✓ All input references must point to existing nodes
✓ No circular dependencies (graph must be acyclic)
✓ Include at least one Output node
✓ Use consistent 2-space indentation
✓ Quote all string values in props
✓ Required properties must be present for each node type
✓ Format must start with version and end with ---END---
</validation_rules>

<examples>
Simple example:
version: 1.0.0
metadata:
  name: "Basic Greeting"
  description: "Simple personalized greeting"
  author: "llm-agent"

---NODES---
greeting_word:
  type: WeightedChoice
  props:
    choices:
      - value: "Hello"
        weight: 0.6
      - value: "Hi"
        weight: 0.4

user_name:
  type: GetVariable
  props:
    key: "name"

full_greeting:
  type: Concat
  inputs: [greeting_word, user_name]

output:
  type: Output
  inputs: [full_greeting]

---EDGES---
greeting_word -> full_greeting
user_name -> full_greeting
full_greeting -> output

---END---
</examples>

When generating graphs:
1. Think through the problem logically
2. Choose appropriate node types for each step
3. Design clear information flow
4. Use descriptive node IDs
5. Validate the structure mentally before output
6. Be creative while maintaining functionality`;
    }
    /**
     * Build Claude-specific user prompt with XML structure
     */
    buildClaudeUserPrompt(request) {
        const complexitySpecs = {
            simple: 'Simple graph (3-8 nodes) with straightforward logic and single output',
            moderate: 'Moderate complexity (8-20 nodes) with branching logic and multiple features',
            complex: 'Complex graph (20-50 nodes) with advanced nodes and sophisticated workflows'
        };
        return `<task>
Generate a Prompt Spaghetti graph for the following requirements:

<purpose>${request.purpose}</purpose>
<complexity>${request.complexity}</complexity>
<specification>${complexitySpecs[request.complexity]}</specification>
<target_nodes>Approximately ${request.nodeCount} nodes</target_nodes>
${request.nodeTypes.length > 0 ? `<preferred_node_types>${request.nodeTypes.join(', ')}</preferred_node_types>` : ''}
${request.domain ? `<domain>${request.domain}</domain>` : ''}
${request.style ? `<style>${request.style}</style>` : ''}
${request.userContext ? `<context>${request.userContext}</context>` : ''}

${request.specificRequirements?.length ? `<requirements>
${request.specificRequirements.map(req => `- ${req}`).join('\n')}
</requirements>` : ''}

${request.focusAreas?.length ? `<focus_areas>${request.focusAreas.join(', ')}</focus_areas>` : ''}
</task>

Please generate a complete, valid graph that:
1. Solves the specified purpose effectively
2. Uses appropriate node types for the task
3. Follows the format specification exactly
4. Includes creative but functional design
5. Has clear, logical information flow

<thinking>
First, let me think through this step by step:
1. What is the core purpose and how can I break it down?
2. What node types are most appropriate for each step?
3. How should information flow through the graph?
4. What would make this graph both functional and creative?
</thinking>

Please provide your reasoning in a <reasoning> section, then output the complete graph in a <graph> section.`;
    }
    /**
     * Parse Claude's XML-formatted response
     */
    parseClaudeResponse(response) {
        let graph;
        let reasoning;
        // Extract reasoning section
        const reasoningMatch = response.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
        if (reasoningMatch) {
            reasoning = reasoningMatch[1].trim();
        }
        // Extract graph section
        const graphMatch = response.match(/<graph>([\s\S]*?)<\/graph>/);
        if (graphMatch) {
            graph = graphMatch[1].trim();
        }
        else {
            // Fallback: look for code blocks
            const codeBlockMatch = response.match(/```(?:yaml|yml)?\n?([\s\S]*?)\n?```/);
            if (codeBlockMatch) {
                graph = codeBlockMatch[1].trim();
            }
            else {
                // Fallback: look for version to ---END---
                const versionMatch = response.match(/version:\s*[\d.]+[\s\S]*?---END---/);
                if (versionMatch) {
                    graph = versionMatch[0].trim();
                }
            }
        }
        return { graph, reasoning };
    }
    /**
     * Call Anthropic API with error handling
     */
    async callAnthropic(userPrompt, temperature) {
        try {
            // Mock Anthropic API call for now - replace with actual API call
            // const response = await anthropic.messages.create({
            //   model: this.config.model,
            //   max_tokens: this.config.maxTokens,
            //   temperature,
            //   messages: [
            //     {
            //       role: 'user', 
            //       content: userPrompt
            //     }
            //   ],
            //   system: this.baseSystemPrompt,
            //   stop_sequences: this.config.stopSequences
            // });
            // Mock response for development
            const mockResponse = this.generateClaudeMockResponse(userPrompt);
            return {
                success: true,
                content: mockResponse,
                tokenCount: mockResponse.length / 4 // Rough token estimate
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Generate mock Claude response with reasoning
     */
    generateClaudeMockResponse(userPrompt) {
        return `<reasoning>
For this graph generation task, I need to create a functional prompt graph that serves the specified purpose. Let me break this down:

1. I'll start with the core functionality needed
2. Choose appropriate node types for each step
3. Design clear information flow from inputs to outputs
4. Ensure the graph is both creative and practical

The graph should demonstrate good structure while being genuinely useful for the stated purpose.
</reasoning>

<graph>
version: 1.0.0
metadata:
  name: "Claude Generated Sample"
  description: "Demonstration graph created by Claude"
  author: "llm-agent"
  created: "${new Date().toISOString()}"

---NODES---
topic_selector:
  type: WeightedChoice
  props:
    choices:
      - value: "technology"
        weight: 0.3
      - value: "nature"
        weight: 0.3
      - value: "science"
        weight: 0.2
      - value: "art"
        weight: 0.2

style_modifier:
  type: WeightedChoice
  props:
    choices:
      - value: "detailed"
        weight: 0.4
      - value: "creative"
        weight: 0.3
      - value: "analytical"
        weight: 0.3

content_builder:
  type: Conditional
  props:
    branches:
      - condition: "input.includes('technology')"
        output: "Exploring innovative technological solutions"
        label: "tech_branch"
      - condition: "input.includes('nature')"
        output: "Discovering natural wonders and ecosystems"
        label: "nature_branch"
    default: "Investigating fascinating topics"

enhanced_content:
  type: Concat
  inputs: [style_modifier, content_builder]

final_result:
  type: Output
  inputs: [enhanced_content]

---EDGES---
topic_selector -> content_builder
style_modifier -> enhanced_content
content_builder -> enhanced_content
enhanced_content -> final_result

---END---
</graph>`;
    }
}
/**
 * Default configuration for Anthropic agent
 */
export const defaultAnthropicConfig = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 3000,
    maxRetries: 3,
    retryTemperatureReduction: 0.15,
    useXmlFormatting: true,
    stopSequences: ['</graph>']
};
/**
 * Utility function to create and use Anthropic agent
 */
export async function generateGraphWithClaude(request, config = {}) {
    const agent = new AnthropicGraphAgent({ ...defaultAnthropicConfig, ...config });
    return agent.generateGraph(request);
}
