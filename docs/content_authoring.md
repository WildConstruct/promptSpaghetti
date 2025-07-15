# Content Authoring Guide

This guide helps content creators build effective prompt generation graphs using the PromptScape Randomizer Graph editor.

## Getting Started

### Basic Concepts

**Graphs** are visual representations of your prompt logic, consisting of:
- **Nodes**: Individual components that perform specific functions
- **Edges**: Connections that define the flow of data between nodes
- **Seeds**: Numbers that ensure reproducible random generation

### Your First Graph

1. **Open the Editor**: Navigate to the application
2. **Drag a Node**: Pull a WeightedChoice node from the palette
3. **Configure**: Click the node and set your choices and weights
4. **Add Output**: Drag an Output node and connect it
5. **Test**: Click Preview to see 5 sample results

## Node Types Reference

### WeightedChoice
**Purpose**: Randomly selects from multiple options based on weights

**Configuration**:
- `choices`: Array of text options
- `weights`: Array of numbers (must sum to 1.0)

**Example Use Cases**:
- Character selection: `["warrior", "mage", "rogue"]` with weights `[0.4, 0.3, 0.3]`
- Style variation: `["realistic", "stylized", "abstract"]` with weights `[0.5, 0.3, 0.2]`
- Mood selection: `["happy", "serious", "mysterious"]` with weights `[0.33, 0.33, 0.34]`

**Best Practices**:
- Keep choices thematically related
- Use weights to bias toward preferred options
- Avoid too many choices (max 5-7 for readability)

### Concat
**Purpose**: Combines multiple inputs into a single output

**Configuration**:
- `separator`: String to place between combined inputs (default: space)

**Example Use Cases**:
- Sentence building: subject + verb + object
- Style combination: color + texture + pattern
- Attribute stacking: size + shape + material

**Best Practices**:
- Use appropriate separators (space, comma, "and", etc.)
- Consider the natural flow of language
- Test with different input combinations

### Output
**Purpose**: Marks the final result of your graph

**Configuration**:
- `template`: Optional template string with {{value}} placeholder

**Example Use Cases**:
- Simple output: Just pass through the final result
- Formatted output: "Create a {{value}} character"
- Structured output: "Style: {{value}}, Mood: confident"

**Best Practices**:
- Use templates for consistent formatting
- Keep templates simple and readable
- Test with various input types

### SetVariable
**Purpose**: Stores a value for use elsewhere in the graph

**Configuration**:
- `variableName`: Name of the variable to store
- `value`: Value to store (can be input from previous nodes)

**Example Use Cases**:
- Remember character type for later use
- Store art style for consistent application
- Keep track of chosen mood across the graph

**Best Practices**:
- Use descriptive variable names
- Avoid overwriting important variables
- Document variable usage in complex graphs

### GetVariable
**Purpose**: Retrieves a previously stored variable value

**Configuration**:
- `variableName`: Name of the variable to retrieve

**Example Use Cases**:
- Reuse previously chosen character type
- Apply consistent style across elements
- Reference earlier choices in final output

**Best Practices**:
- Ensure variable is set before getting it
- Use consistent naming conventions
- Handle missing variables gracefully

### Include
**Purpose**: References another graph or bundle

**Configuration**:
- `bundleName`: Name of the bundle/graph to include

**Example Use Cases**:
- Modular prompt components
- Reusable style libraries
- Shared character generators

**Best Practices**:
- Keep included graphs focused and reusable
- Document dependencies clearly
- Test included graphs independently

## Design Patterns

### Basic Prompt Structure

```
[Subject] → [WeightedChoice] → [Concat] ← [Style] → [WeightedChoice]
                                  ↓
                              [Output]
```

This pattern creates prompts like: "A warrior in realistic style" or "A mage in stylized form"

### Conditional Logic

```
[Condition] → [WeightedChoice] → [Branch A] → [SetVariable]
                     ↓                           ↓
                 [Branch B] → [SetVariable] → [GetVariable] → [Output]
```

Use variables to create conditional behavior based on earlier choices.

### Hierarchical Generation

```
[Category] → [WeightedChoice] → [Subcategory] → [WeightedChoice] → [Details]
                                                                       ↓
                                                                   [Output]
```

Start broad and narrow down to specific details.

## Advanced Techniques

### Weight Balancing

When using WeightedChoice nodes, consider:
- **Equal weights**: `[0.33, 0.33, 0.34]` for balanced selection
- **Biased weights**: `[0.6, 0.3, 0.1]` to favor certain options
- **Extreme weights**: `[0.9, 0.05, 0.05]` for mostly one option with rare alternatives

### Variable Chaining

Create complex dependencies:
```
[Style] → [SetVariable: "style"]
[Character] → [SetVariable: "character"]
[Mood] → [SetVariable: "mood"]
    ↓
[Template] → [GetVariable: "style"] → [Concat] → [Output]
```

### Modular Design

Break complex graphs into reusable components:
- **Character Generator**: Separate graph for character creation
- **Style Library**: Dedicated graph for art styles
- **Mood System**: Specialized graph for emotional tone

## Quality Guidelines

### Prompt Quality

1. **Clarity**: Ensure generated prompts are clear and actionable
2. **Consistency**: Maintain consistent style and terminology
3. **Variety**: Provide sufficient variation without chaos
4. **Relevance**: Keep all options relevant to your use case

### Graph Organization

1. **Logical Flow**: Arrange nodes in intuitive left-to-right flow
2. **Clear Naming**: Use descriptive names for nodes and variables
3. **Minimal Complexity**: Keep graphs as simple as possible
4. **Visual Clarity**: Avoid crossing edges and cluttered layouts

### Testing Strategy

1. **Seed Testing**: Test with multiple seeds to ensure variety
2. **Edge Cases**: Test with extreme weight values
3. **Variable Dependencies**: Verify all variables are properly set
4. **Output Validation**: Check that all outputs are valid and useful

## Performance Considerations

### Graph Size

- **Small graphs** (< 20 nodes): No performance concerns
- **Medium graphs** (20-100 nodes): Consider modular design
- **Large graphs** (> 100 nodes): Use includes and optimize carefully

### Execution Efficiency

- **Minimize deep nesting**: Avoid excessive node chains
- **Optimize weights**: Use simple fractions when possible
- **Cache results**: Consider variable storage for expensive operations

## Troubleshooting

### Common Issues

1. **Weights don't sum to 1.0**: Check your weight values
2. **Variable not found**: Ensure SetVariable comes before GetVariable
3. **Empty outputs**: Check all paths lead to Output nodes
4. **Inconsistent results**: Verify seed handling and weights

### Debugging Tips

1. **Use Preview**: Test with multiple seeds regularly
2. **Check Variables**: Use meaningful variable names
3. **Validate Connections**: Ensure all edges are properly connected
4. **Test Incrementally**: Build and test small sections first

## Best Practices Summary

### Content Creation
- Start with simple structures and expand gradually
- Use real-world examples to test effectiveness
- Maintain consistent terminology and style
- Document complex graphs for future reference

### Graph Design
- Follow left-to-right flow conventions
- Group related functionality together
- Use clear, descriptive node names
- Avoid unnecessary complexity

### Quality Assurance
- Test with multiple seeds regularly
- Validate all possible output paths
- Check for edge cases and error conditions
- Get feedback from actual users

## Examples

### Simple Character Generator

```
[Character Type] → WeightedChoice["warrior", "mage", "archer"]
                        ↓
                   [Style] → WeightedChoice["realistic", "cartoon", "abstract"]
                        ↓
                   [Concat] → separator: " in "
                        ↓
                   [Output] → "A {{value}} character"
```

### Complex Story Prompt

```
[Setting] → WeightedChoice → SetVariable["setting"]
[Character] → WeightedChoice → SetVariable["character"]  
[Conflict] → WeightedChoice → SetVariable["conflict"]
                    ↓
[Template] → "A {{character}} in {{setting}} facing {{conflict}}"
                    ↓
                [Output]
```

### Modular System

```
[Main Graph]
    ↓
[Character Include] → Include["character_generator"]
    ↓
[Style Include] → Include["style_library"]
    ↓
[Combine] → Concat → Output
```

---

*Happy creating! Remember that great prompts come from thoughtful design and thorough testing.*