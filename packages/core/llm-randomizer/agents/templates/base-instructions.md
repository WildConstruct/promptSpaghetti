# LLM Agent Base Instructions for Graph Generation

## Research Summary: Effective LLM Prompting for Structured Output

### Key Findings from LLM Research:

1. **Few-Shot Learning**: Providing 2-3 examples dramatically improves consistency
2. **Clear Format Constraints**: Explicit delimiters reduce hallucination
3. **Incremental Validation**: Generate→validate→correct loops improve quality
4. **Temperature Control**: Lower temperatures (0.3-0.7) for structured outputs
5. **Model-Specific Optimizations**: JSON mode (OpenAI), XML tags (Anthropic), structured output (Gemini)

### Proven Patterns for Graph Generation:

- **Start Simple**: Begin with basic graphs, then increase complexity
- **Constraint-First**: Specify rules before asking for generation
- **Validation Hooks**: Include format checking in generation loop
- **Semantic Guidance**: Explain the purpose of each node type
- **Error Recovery**: Provide fallback strategies for invalid outputs

---

## Base Instruction Template

### System Prompt Template

```
You are an expert graph generator that creates valid Prompt Spaghetti graphs in a specific format. Your goal is to generate creative, functional graphs that follow the exact serialization format.

## FORMAT REQUIREMENTS

You must output graphs in this exact format:

```

version: 1.0.0
metadata:
name: "Graph Name"
description: "Brief description"
author: "llm-agent"

---NODES---
node_id:
type: NodeType
props:
key: value
inputs: [input1, input2]

---EDGES---
source -> target

---END---

```

## NODE TYPES AVAILABLE

### Basic Nodes:
- **WeightedChoice**: Random selection with weights
  - props.choices: [{value: "text", weight: number}]
- **Concat**: Combines inputs
  - inputs: [node_ids]
- **Output**: Final result node
  - inputs: [node_id]
- **SetVariable/GetVariable**: Variable management
  - props.key: "variable_name"
- **Include**: Template inclusion
  - props.name: "template_name"

### Advanced Nodes:
- **WeightedAdvanced**: Complex distributions
  - props.choices, props.distribution
- **Conditional**: Logic branching
  - props.branches: [{condition, output, label}]
- **Sequential**: Ordered sequences
  - props.sequence: [items], props.pattern
- **Markov**: State transitions
  - props.states, props.initial
- **PythonTransform**: Code execution
  - props.code, props.timeout

## VALIDATION RULES

1. All node IDs must be unique
2. All referenced nodes must exist
3. No circular dependencies
4. At least one Output node required
5. Use descriptive node IDs (not random)
6. Quote string values properly
7. Use consistent 2-space indentation

## GENERATION STRATEGY

1. Start with a clear purpose
2. Design the flow logically
3. Use appropriate node types
4. Connect nodes properly
5. Include at least one Output
6. Validate the structure
```

### User Prompt Template

```
Generate a {complexity} Prompt Spaghetti graph for: {purpose}

Requirements:
- {node_count} nodes approximately
- Use {node_types} node types
- {specific_requirements}

Focus on: {focus_areas}

Generate a complete, valid graph following the format specification.
```

### Parameter Templates

#### Complexity Levels:

- **Simple**: 3-5 nodes, basic connections, single output
- **Moderate**: 6-15 nodes, some advanced features, multiple paths
- **Complex**: 16-50 nodes, advanced nodes, sophisticated logic

#### Purpose Categories:

- **Content Generation**: Text creation, story generation, prompt templates
- **Decision Making**: Conditional logic, branching narratives
- **Data Processing**: Transformation, filtering, analysis
- **Creative Writing**: Character development, plot generation
- **Educational**: Tutorial content, quiz generation

#### Node Type Distributions:

- **Basic**: WeightedChoice, Concat, Output (70%), Variables (30%)
- **Mixed**: Basic (50%), Advanced (30%), Utility (20%)
- **Advanced**: Advanced nodes (60%), Basic (30%), Utility (10%)

---

## Instruction Variations by Model

### OpenAI Optimized (JSON Mode)

```json
{
  "system": "You are a graph generator. Use JSON mode for structured output.",
  "instructions": "Generate in the specified YAML-like format within a code block.",
  "validation": "Check format before responding.",
  "temperature": 0.5
}
```

### Anthropic Optimized (Claude)

```xml
<instructions>
Generate a Prompt Spaghetti graph following the exact format specification.

<format>
[Include format spec here]
</format>

<example>
[Include working example]
</example>
</instructions>
```

### Gemini Optimized (Structured Output)

```
Generate structured output following the Prompt Spaghetti format.

Use clear delimiters and consistent formatting.
Validate structure before output.
```

---

## Error Prevention Strategies

### Common LLM Errors and Mitigations:

1. **Inconsistent Delimiters**
   - Mitigation: Provide exact delimiter examples
   - Validation: Regex checks for proper sections

2. **Invalid Node References**
   - Mitigation: Generate nodes before edges
   - Validation: Reference checking in generation loop

3. **Malformed YAML**
   - Mitigation: Show proper indentation examples
   - Validation: YAML parser validation

4. **Circular Dependencies**
   - Mitigation: Explain graph theory constraints
   - Validation: Cycle detection algorithms

5. **Missing Required Properties**
   - Mitigation: List required props for each node type
   - Validation: Schema validation

### Fallback Strategies:

1. **Regeneration with Lower Temperature**
2. **Simplified Requirements**
3. **Component-wise Generation** (nodes first, then edges)
4. **Template-based Fallback**
5. **Human-in-the-loop Correction**

---

## Validation Integration

### Generation Loop:

```
1. Generate initial graph
2. Validate format
3. If invalid:
   a. Identify specific errors
   b. Regenerate with corrections
   c. Repeat up to 3 times
4. If still invalid, use fallback template
5. Return valid graph
```

### Quality Metrics:

- Format compliance (binary)
- Semantic correctness (weighted)
- Creativity score (0-1)
- Functionality rating (0-1)
- Token efficiency (tokens/node)

This template provides the foundation for creating model-specific agent scripts that can reliably generate valid Prompt Spaghetti graphs.
