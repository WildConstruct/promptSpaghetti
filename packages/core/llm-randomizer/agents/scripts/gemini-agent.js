// Epic 12 - LLM Agent Randomizer System
// Story 12.2 - LLM Agent Script Development
// Google Gemini agent script with structured output and safety considerations
import { validateFormat } from '../../serialization/validator';
export class GeminiGraphAgent {
    config;
    basePrompt;
    constructor(config) {
        this.config = config;
        this.basePrompt = this.buildGeminiPrompt();
    }
    /**
     * Generate a graph using Gemini with structured output
     */
    async generateGraph(request) {
        const startTime = Date.now();
        let attempts = 0;
        let currentTemperature = this.config.temperature;
        while (attempts < this.config.maxRetries) {
            attempts++;
            try {
                const prompt = this.buildRequestPrompt(request);
                const response = await this.callGemini(prompt, currentTemperature);
                if (response.success && response.content) {
                    // Extract graph content from response
                    const graphContent = this.extractGraphFromResponse(response.content);
                    if (graphContent) {
                        // Validate the generated graph
                        const validation = validateFormat(graphContent);
                        if (validation.isValid) {
                            return {
                                success: true,
                                graph: graphContent,
                                warnings: validation.warnings.map(w => w.message),
                                attempts,
                                safetyRatings: response.safetyRatings,
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
                                    attempts,
                                    safetyRatings: response.safetyRatings,
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
                        console.log(`Attempt ${attempts} - no valid graph extracted`);
                    }
                }
                else {
                    console.log(`Attempt ${attempts} failed:`, response.error);
                    // Check if failure was due to safety filters
                    if (response.safetyRatings?.some(rating => ['MEDIUM', 'HIGH'].includes(rating.probability))) {
                        return {
                            success: false,
                            errors: ['Content blocked by safety filters'],
                            attempts,
                            safetyRatings: response.safetyRatings,
                            metadata: {
                                model: this.config.model,
                                temperature: currentTemperature,
                                tokenCount: 0,
                                generationTime: Date.now() - startTime
                            }
                        };
                    }
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
     * Build Gemini-optimized base prompt
     */
    buildGeminiPrompt() {
        return `You are a specialized graph generator for the Prompt Spaghetti system. Your role is to create valid, functional graphs that follow a specific YAML-like serialization format.

## YOUR TASK
Generate creative and practical graphs that solve real problems while strictly adhering to the format specification.

## OUTPUT FORMAT SPECIFICATION

**CRITICAL**: Your output must follow this exact structure:

\`\`\`yaml
version: 1.0.0
metadata:
  name: "Descriptive Name"
  description: "Clear purpose statement"
  author: "llm-agent"
  created: "${new Date().toISOString()}"

---NODES---
node_identifier:
  type: NodeType
  props:
    property_name: property_value
  inputs: [source_node_ids]

---EDGES---
source_node -> target_node

---END---
\`\`\`

## AVAILABLE NODE TYPES

### Essential Node Types:
1. **WeightedChoice** - Probabilistic selection from options
   - props.choices: [{value: "text", weight: number}]
   - Example use: Random text variants, option selection

2. **Concat** - Combines multiple text inputs sequentially
   - inputs: [node_id_1, node_id_2, ...]
   - Example use: Building sentences, joining content

3. **Output** - Defines graph result endpoints
   - inputs: [source_node_id]
   - Example use: Final outputs, results collection

4. **SetVariable** - Stores values for later use
   - props.key: "variable_name", props.value: stored_value
   - Example use: Saving user input, caching results

5. **GetVariable** - Retrieves stored values
   - props.key: "variable_name"
   - Example use: Accessing saved data, reusing values

6. **Include** - References external templates/subgraphs
   - props.name: "template_identifier"
   - Example use: Modular components, shared templates

### Advanced Node Types:
7. **WeightedAdvanced** - Sophisticated probability distributions
8. **Conditional** - Logic-based branching and decision making
9. **Sequential** - Ordered processing of item sequences
10. **Markov** - State-based transition chains
11. **PythonTransform** - Custom code execution for data processing

## STRUCTURE REQUIREMENTS

**MANDATORY RULES** (Failure to follow results in invalid output):
✓ Start with version: 1.0.0
✓ Include metadata section with name, description, author
✓ Use ---NODES--- section delimiter
✓ Use ---EDGES--- section delimiter  
✓ End with ---END--- marker
✓ All node IDs must be unique and descriptive
✓ All input references must point to existing nodes
✓ No circular dependencies (graph must be acyclic)
✓ Include at least one Output node
✓ Use consistent 2-space indentation
✓ Quote string values in properties
✓ Include required properties for each node type

## QUALITY GUIDELINES

**Design Principles:**
- Create graphs that solve real problems
- Use descriptive, meaningful node IDs
- Choose appropriate node types for each task
- Design clear information flow
- Balance creativity with functionality
- Ensure graphs are genuinely useful

**Common Patterns:**
- Input → Processing → Output
- Branching logic for different scenarios  
- Variable storage for reusable data
- Weighted randomization for variety
- Template inclusion for modularity

## VALIDATION CHECKLIST

Before outputting, verify:
□ Format follows specification exactly
□ All node IDs are unique and descriptive
□ All references point to existing nodes
□ No circular dependencies exist
□ At least one Output node present
□ Required properties included for each node
□ Proper YAML syntax used
□ Graph serves stated purpose effectively

Generate structured, creative, and functional graphs.`;
    }
    /**
     * Build request-specific prompt
     */
    buildRequestPrompt(request) {
        const complexityDescriptions = {
            simple: '3-8 nodes with straightforward logic flow',
            moderate: '8-20 nodes with some branching and multiple features',
            complex: '20-50 nodes with advanced logic and sophisticated workflows'
        };
        let prompt = `## GENERATION REQUEST

**Purpose**: ${request.purpose}
**Complexity**: ${request.complexity} (${complexityDescriptions[request.complexity]})
**Target Node Count**: ~${request.nodeCount} nodes
**Style**: ${request.style || 'balanced'}`;
        if (request.domain) {
            prompt += `\n**Domain**: ${request.domain}`;
        }
        if (request.nodeTypes.length > 0) {
            prompt += `\n**Preferred Node Types**: ${request.nodeTypes.join(', ')}`;
        }
        if (request.specificRequirements?.length) {
            prompt += `\n\n**Specific Requirements**:`;
            request.specificRequirements.forEach(req => {
                prompt += `\n- ${req}`;
            });
        }
        if (request.focusAreas?.length) {
            prompt += `\n\n**Focus Areas**: ${request.focusAreas.join(', ')}`;
        }
        if (request.constraints?.length) {
            prompt += `\n\n**Constraints**:`;
            request.constraints.forEach(constraint => {
                prompt += `\n- ${constraint}`;
            });
        }
        if (request.examples?.length) {
            prompt += `\n\n**Example Context**:`;
            request.examples.forEach(example => {
                prompt += `\n- ${example}`;
            });
        }
        prompt += `\n\n## YOUR TASK

Create a complete, valid graph that:
1. Fulfills the specified purpose effectively
2. Uses appropriate node types for the requirements
3. Follows the format specification exactly
4. Demonstrates creative problem-solving
5. Maintains clear, logical structure

**Generate the complete graph now:**`;
        return prompt;
    }
    /**
     * Extract graph content from Gemini response
     */
    extractGraphFromResponse(response) {
        // Look for YAML code blocks first
        const yamlBlockMatch = response.match(/```(?:yaml|yml)\n([\s\S]*?)\n```/);
        if (yamlBlockMatch) {
            return yamlBlockMatch[1].trim();
        }
        // Look for any code blocks
        const codeBlockMatch = response.match(/```\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
            const content = codeBlockMatch[1].trim();
            if (content.includes('version:') && content.includes('---END---')) {
                return content;
            }
        }
        // Look for version: to ---END--- pattern
        const versionMatch = response.match(/version:\s*[\d.]+[\s\S]*?---END---/);
        if (versionMatch) {
            return versionMatch[0].trim();
        }
        // Check if response contains expected structure elements
        if (response.includes('version:') && response.includes('---NODES---')) {
            // Try to extract everything from version to end
            const startMatch = response.match(/version:\s*[\d.]+/);
            if (startMatch) {
                const startIndex = response.indexOf(startMatch[0]);
                let content = response.substring(startIndex);
                // Try to find a natural end point
                const endIndex = content.indexOf('---END---');
                if (endIndex !== -1) {
                    content = content.substring(0, endIndex + 9); // Include ---END---
                }
                return content.trim();
            }
        }
        return null;
    }
    /**
     * Call Gemini API with error handling
     */
    async callGemini(prompt, temperature) {
        try {
            // Mock Gemini API call for now - replace with actual API call
            // const genAI = new GoogleGenerativeAI(this.config.apiKey);
            // const model = genAI.getGenerativeModel({ 
            //   model: this.config.model,
            //   generationConfig: {
            //     temperature,
            //     maxOutputTokens: this.config.maxOutputTokens,
            //     stopSequences: this.config.stopSequences
            //   },
            //   safetySettings: this.config.safetySettings
            // });
            // const result = await model.generateContent(this.basePrompt + '\n\n' + prompt);
            // Mock response for development
            const mockResponse = this.generateGeminiMockResponse(prompt);
            return {
                success: true,
                content: mockResponse,
                tokenCount: mockResponse.length / 4, // Rough estimate
                safetyRatings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' }
                ]
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
     * Generate mock Gemini response
     */
    generateGeminiMockResponse(prompt) {
        return `I'll create a structured graph that addresses your requirements effectively.

\`\`\`yaml
version: 1.0.0
metadata:
  name: "Gemini Generated Graph"
  description: "Structured content generation system"
  author: "llm-agent"
  created: "${new Date().toISOString()}"

---NODES---
content_type:
  type: WeightedChoice
  props:
    choices:
      - value: "informative"
        weight: 0.4
      - value: "creative"
        weight: 0.3
      - value: "analytical"
        weight: 0.3

topic_focus:
  type: GetVariable
  props:
    key: "main_topic"

complexity_level:
  type: WeightedChoice
  props:
    choices:
      - value: "beginner-friendly"
        weight: 0.4
      - value: "intermediate"
        weight: 0.4
      - value: "advanced"
        weight: 0.2

content_structure:
  type: Sequential
  props:
    sequence: ["introduction", "main_content", "conclusion"]
    pattern:
      type: linear
      config:
        allow_repeats: false

personalized_content:
  type: Conditional
  props:
    branches:
      - condition: "content_type == 'creative'"
        output: "Let your imagination guide this exploration"
        label: "creative_intro"
      - condition: "content_type == 'analytical'"
        output: "Let's examine this systematically"
        label: "analytical_intro"
    default: "Here's what you need to know"

final_assembly:
  type: Concat
  inputs: [personalized_content, topic_focus, complexity_level]

output_result:
  type: Output
  inputs: [final_assembly]

---EDGES---
content_type -> personalized_content
topic_focus -> final_assembly
complexity_level -> final_assembly
personalized_content -> final_assembly
final_assembly -> output_result

---END---
\`\`\`

This graph creates a flexible content generation system that adapts based on content type, topic focus, and complexity level, with conditional personalization and sequential structure.`;
    }
}
/**
 * Default configuration for Gemini agent
 */
export const defaultGeminiConfig = {
    apiKey: process.env.GOOGLE_API_KEY || '',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxOutputTokens: 2048,
    maxRetries: 3,
    retryTemperatureReduction: 0.2,
    useStructuredOutput: true,
    safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ],
    stopSequences: ['---END---', 'Human:', 'Assistant:']
};
/**
 * Utility function to create and use Gemini agent
 */
export async function generateGraphWithGemini(request, config = {}) {
    const agent = new GeminiGraphAgent({ ...defaultGeminiConfig, ...config });
    return agent.generateGraph(request);
}
