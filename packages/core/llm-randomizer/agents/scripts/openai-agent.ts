// Epic 12 - LLM Agent Randomizer System
// Story 12.2 - LLM Agent Script Development
// OpenAI agent script with JSON mode integration and error correction
import { validateFormat } from '../../serialization/validator';

export interface OpenAIAgentConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  seed?: number;
  useJsonMode: boolean;
  maxRetries: number;
  retryTemperatureReduction: number;
}

export interface GraphGenerationRequest {
  purpose: string;
  complexity: 'simple' | 'moderate' | 'complex';
  nodeCount: number;
  nodeTypes: string[];
  specificRequirements?: string[];
  focusAreas?: string[];
  style?: 'creative' | 'logical' | 'balanced';
  domain?: string;
}

export interface GenerationResult {
  success: boolean;
  graph?: string;
  errors?: string[];
  warnings?: string[];
  attempts: number;
  metadata: {,
    model: string;
    temperature: number;
    tokenCount: number;
    generationTime: number;
  };
}

export class OpenAIGraphAgent {
  private config: OpenAIAgentConfig;
  private baseSystemPrompt: string;
  constructor(config: OpenAIAgentConfig) {
    this.config = config;
    this.baseSystemPrompt = this.buildSystemPrompt();
  }
  /**
   * Generate a graph based on the request parameters
   */
  async generateGraph(request: GraphGenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    let attempts = 0;
    let currentTemperature = this.config.temperature;
    while (attempts < this.config.maxRetries) {
      attempts++;
      try {
        const userPrompt = this.buildUserPrompt(request);
        const response = await this.callOpenAI(userPrompt, currentTemperature);
        if (response.success && response.content) {
          // Extract graph content from response
          const graphContent = this.extractGraphContent(response.content);
          // Validate the generated graph
          const validation = validateFormat(graphContent);
          if (validation.isValid) {
            return {
              success: true,
              graph: graphContent,
              warnings: validation.warnings.map(w => w.message),
              attempts,
              metadata: {,
                model: this.config.model,
                temperature: currentTemperature,
                tokenCount: response.tokenCount || 0,
                generationTime: Date.now() - startTime,
              }
            };
          } else {
            // Validation failed - try again with corrections
            console.log(`Attempt ${attempts} failed validation:`, validation.errors);}
            if (attempts === this.config.maxRetries) {
              return {
                success: false,
                errors: validation.errors.map(e => e.message),
                attempts,
                metadata: {,
                  model: this.config.model,
                  temperature: currentTemperature,
                  tokenCount: response.tokenCount || 0,
                  generationTime: Date.now() - startTime,
                }
              };
            }
            // Reduce temperature for next attempt
            currentTemperature = Math.max(0.1, currentTemperature - this.config.retryTemperatureReduction);
          }
        } else {
          console.log(`Attempt ${attempts} failed:`, response.error);}
        }
      } catch (error) {
        console.error(`Attempt ${attempts} error:`, error);}
      }
      // Reduce temperature for retry
      currentTemperature = Math.max(0.1, currentTemperature - this.config.retryTemperatureReduction);
    }
    return {
      success: false,
      errors: ['Maximum retry attempts exceeded'],
      attempts,
      metadata: {,
        model: this.config.model,
        temperature: currentTemperature,
        tokenCount: 0,
        generationTime: Date.now() - startTime,
      }
    };
  }
  /**
   * Build the system prompt for OpenAI
   */
  private buildSystemPrompt(): string {
    return `You are an expert Prompt Spaghetti graph generator. You create valid, creative graphs in a specific YAML-like format.
## FORMAT SPECIFICATION
Output must follow this exact format:
\`\`\`
version: 1.0.0,
metadata:
  name: "Graph Name",
  description: "Brief description",
  author: "llm-agent",
  created: "${new Date().toISOString()}"}
---NODES---
node_id:
  type: NodeType,
  props:
    key: value,
  inputs: [input1, input2]
---EDGES---
source -> target
---END---
\`\`\`
## AVAILABLE NODE TYPES
### Basic Nodes:
- **WeightedChoice**: Random selection with weights
  \`\`\`yaml
  choice_node:
    type: WeightedChoice,
    props:
      choices:
        - value: "Option A"
          weight: 0.6,
        - value: "Option B"
          weight: 0.4,
  \`\`\`
- **Concat**: Combines multiple inputs
  \`\`\`yaml
  concat_node:
    type: Concat,
    inputs: [input1, input2]
  \`\`\`
- **Output**: Final result node
  \`\`\`yaml
  output_node:
    type: Output,
    inputs: [final_input],
  \`\`\`
- **SetVariable/GetVariable**: Variable management
  \`\`\`yaml
  set_var:
    type: SetVariable,
    props:
      key: "user_name",
      value: "Claude",
  get_var:
    type: GetVariable,
    props:
      key: "user_name",
  \`\`\`
### Advanced Nodes:
- **WeightedAdvanced**: Complex weight distributions
- **Conditional**: Logic branching with expressions
- **Sequential**: Ordered sequences with patterns
- **Markov**: State transition chains
- **PythonTransform**: Code execution
## CRITICAL RULES
1. ✅ ALL node IDs must be unique and descriptive
2. ✅ ALL referenced nodes must exist
3. ✅ NO circular dependencies allowed
4. ✅ Include at least one Output node
5. ✅ Use 2-space indentation consistently
6. ✅ Quote all string values
7. ✅ Include required properties for each node type
8. ✅ Start with version header
9. ✅ End with ---END--- marker
## VALIDATION
Before outputting, mentally check:
- Format follows specification exactly
- All nodes have unique IDs
- All references are valid
- No cycles exist
- Required properties present
- Proper YAML syntax
Generate creative, functional graphs that solve real problems.`;
  }
  /**
   * Build user prompt based on request
   */
  private buildUserPrompt(request: GraphGenerationRequest): string {
    const complexityGuide = {
      simple: '3-8 nodes, straightforward logic, single output path',
      moderate: '8-20 nodes, some branching, multiple features',
      complex: '20-50 nodes, advanced logic, sophisticated workflows'
    };
    const nodeTypeGuide = request.nodeTypes.length > 0 ;
      ? `Focus on these node types: ${request.nodeTypes.join(', ')}`}
      : 'Use appropriate node types for the task';
    const requirements = request.specificRequirements?.length ;
      ? `\nSpecial requirements:\n${request.specificRequirements.map(r => `- ${r}`).join('\n')}`}
      : '';
    const focus = request.focusAreas?.length;
      ? `\nFocus areas: ${request.focusAreas.join(', ')}`}
      : '';
    return `Generate a ${request.complexity} Prompt Spaghetti graph for: ${request.purpose}
Complexity: ${complexityGuide[request.complexity]}
Target nodes: ~${request.nodeCount} nodes}
${nodeTypeGuide}${requirements}${focus}
Style: ${request.style || 'balanced'} approach}
${request.domain ? `Domain: ${request.domain}` : ''}
Create a complete, valid graph that follows the format specification exactly. Be creative but ensure functionality.
OUTPUT THE COMPLETE GRAPH:`;
  }
  /**
   * Call OpenAI API with error handling
   */
  private async callOpenAI(userPrompt: string, temperature: number): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    tokenCount?: number;
  }> {
    try {
      // Mock OpenAI API call for now - replace with actual API call
      // const response = await openai.chat.completions.create({
      //   model: this.config.model,
      //   messages: [
      //     { role: 'system', content: this.baseSystemPrompt },
      //     { role: 'user', content: userPrompt }
      //   ],
      //   temperature,
      //   max_tokens: this.config.maxTokens,
      //   response_format: this.config.useJsonMode ? { type: 'json_object' } : undefined,
      //   seed: this.config.seed
      // });
      // Mock response for development
      const mockResponse = this.generateMockResponse(userPrompt);
      return {
        success: true,
        content: mockResponse,
        tokenCount: mockResponse.length / 4 // Rough token estimate,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  /**
   * Extract graph content from response
   */
  private extractGraphContent(response: string): string {
    // Look for content between code blocks
    const codeBlockMatch = response.match(/```(?:yaml|yml)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // Look for version: line to start of ---END---
    const graphMatch = response.match(/version:\s*[\d.]+[\s\S]*?---END---/);
    if (graphMatch) {
      return graphMatch[0].trim();
    }
    // Return as-is if no code blocks found
    return response.trim();
  }
  /**
   * Generate mock response for development/testing
   */
  private generateMockResponse(userPrompt: string): string {
    return `version: 1.0.0
metadata:
  name: "Sample Generated Graph",
  description: "Mock response for development",
  author: "llm-agent",
  created: "${new Date().toISOString()}"}
---NODES---
greeting_choice:
  type: WeightedChoice,
  props:
    choices:
      - value: "Hello"
        weight: 0.5,
      - value: "Hi there"
        weight: 0.3,
      - value: "Greetings"
        weight: 0.2,
user_name:
  type: GetVariable,
  props:
    key: "user_name",
greeting_text:
  type: Concat,
  inputs: [greeting_choice, user_name]
final_output:
  type: Output,
  inputs: [greeting_text],
---EDGES---
greeting_choice -> greeting_text
user_name -> greeting_text
greeting_text -> final_output
---END---`;
  }
}
/**
 * Default configuration for OpenAI agent
 */
export const defaultOpenAIConfig: OpenAIAgentConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  useJsonMode: false, // Set to true when using supported models
  maxRetries: 3,
  retryTemperatureReduction: 0.2,
};
/**
 * Utility function to create and use OpenAI agent
 */
export async function generateGraphWithOpenAI()
  request: GraphGenerationRequest,
  config: Partial<OpenAIAgentConfig> = {}
): Promise<GenerationResult> {
  const agent = new OpenAIGraphAgent({ ...defaultOpenAIConfig, ...config });
  return agent.generateGraph(request);
}