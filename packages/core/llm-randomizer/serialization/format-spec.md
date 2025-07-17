# LLM-Friendly Graph Serialization Format Specification

## Version 1.0.0

### Overview
This format is designed for LLM generation of Prompt Spaghetti graphs. It prioritizes:
- Human readability for LLM understanding
- Token efficiency to reduce costs
- Clear delimiters to prevent parsing errors
- Deterministic round-trip conversion

### Format Structure

```yaml
version: 1.0.0
checksum: sha256-hash-here
metadata:
  name: "Graph Name"
  description: "Graph description"
  author: "llm-agent"
  created: 2025-07-17T00:00:00Z

---NODES---
node_id:
  type: NodeType
  props:
    key: value
  inputs: [input1, input2]

another_node:
  type: AnotherType
  props:
    param: value

---EDGES---
source -> target
source -> target2
node2 -> final

---END---
```

### Section Definitions

#### Header Section
- `version`: Format version for migration compatibility
- `checksum`: SHA-256 integrity check (computed after generation)
- `metadata`: Optional graph metadata

#### Nodes Section (`---NODES---`)
Each node definition includes:
- **Key**: Unique node identifier (alphanumeric, underscore, hyphen)
- **type**: One of the 21 supported node types
- **props**: Node-specific properties (optional)
- **inputs**: Array of upstream node IDs (optional)

#### Edges Section (`---EDGES---`)
Simple arrow notation for connections:
- Format: `source_id -> target_id`
- One connection per line
- Implicit from node.inputs if omitted

#### End Marker (`---END---`)
Clear termination marker for parsing

### Node Type Specifications

#### WeightedChoice
```yaml
weighted_choice:
  type: WeightedChoice
  props:
    choices:
      - value: "Option A"
        weight: 0.7
      - value: "Option B"
        weight: 0.3
```

#### WeightedAdvanced
```yaml
advanced_weighted:
  type: WeightedAdvanced
  props:
    choices:
      - value: "Advanced A"
        weight: 2.5
    distribution:
      type: exponential
      parameters:
        decay: 0.5
      normalize: true
```

#### Conditional
```yaml
conditional_node:
  type: Conditional
  props:
    branches:
      - condition: "variable == 'value'"
        output: "Match found"
        label: "equality_check"
    default: "No match"
    config:
      strict_mode: true
```

#### Sequential
```yaml
sequence_node:
  type: Sequential
  props:
    sequence: ["First", "Second", "Third"]
    pattern:
      type: cyclical
      config:
        allow_repeats: false
```

#### Markov
```yaml
markov_chain:
  type: Markov
  props:
    states:
      start: 
        transitions:
          middle: 0.7
          end: 0.3
      middle:
        transitions:
          end: 1.0
      end: {}
    initial: start
```

#### Basic Nodes
```yaml
concat_node:
  type: Concat
  inputs: [input1, input2]

output_node:
  type: Output
  inputs: [final_input]

variable_set:
  type: SetVariable
  props:
    key: "user_name"
    value: "Claude"

variable_get:
  type: GetVariable
  props:
    key: "user_name"

include_node:
  type: Include
  props:
    name: "shared_template"

python_transform:
  type: PythonTransform
  props:
    code: |
      def transform(input_data):
          return input_data.upper()
    timeout: 30
    memory_limit: 512
```

### Validation Rules

#### Syntax Validation
1. Valid YAML structure within sections
2. Required section delimiters present
3. All node IDs are unique
4. All referenced node IDs exist
5. No circular dependencies

#### Semantic Validation
1. Node types match supported types
2. Required properties present for each node type
3. Property types match schema expectations
4. Edge references point to valid nodes
5. Graph forms a valid DAG (Directed Acyclic Graph)

### LLM Generation Guidelines

#### For LLM Agents
1. Always include version header
2. Use descriptive node IDs (not random)
3. Keep property values simple and readable
4. Prefer explicit edges over implicit inputs
5. Include helpful comments in metadata
6. Validate against schema before output

#### Token Optimization
- Short property names where possible
- Use abbreviations consistently
- Omit optional empty properties
- Use compact YAML syntax
- Prefer arrays over verbose objects

#### Error Prevention
- Use consistent indentation (2 spaces)
- Quote string values that could be ambiguous
- Avoid special YAML characters in IDs
- Include validation markers in complex structures
- Use clear section boundaries

### Migration Strategy

#### Version Compatibility
- Format version in header enables safe migration
- Backward compatibility maintained for minor versions
- Breaking changes require major version increment
- Auto-migration tools provided for version upgrades

#### Future Extensions
- Additional node types can be added
- New property types can be introduced
- Section ordering is flexible
- Custom metadata fields supported

### Example Complete Graph

```yaml
version: 1.0.0
checksum: e3b0c44298fc1c149afbf4c8996fb924
metadata:
  name: "Simple Greeting Generator"
  description: "Generates personalized greetings"
  author: "claude-agent"
  created: 2025-07-17T12:00:00Z

---NODES---
greeting_choice:
  type: WeightedChoice
  props:
    choices:
      - value: "Hello"
        weight: 0.4
      - value: "Hi"
        weight: 0.3
      - value: "Greetings"
        weight: 0.3

name_var:
  type: GetVariable
  props:
    key: "user_name"

greeting_concat:
  type: Concat
  inputs: [greeting_choice, name_var]

final_output:
  type: Output
  inputs: [greeting_concat]

---EDGES---
greeting_choice -> greeting_concat
name_var -> greeting_concat
greeting_concat -> final_output

---END---
```

This format balances human readability, LLM generation ease, and technical requirements for robust graph serialization.