# PSGLib Preset Authoring Guide

## Overview

PSGLib (PromptScape Graph Library) presets are reusable graph components that can be shared and imported into any PromptScape project. This guide covers best practices for creating effective, high-quality presets.

## Table of Contents

1. [Preset Structure](#preset-structure)
2. [Design Principles](#design-principles)
3. [Node Selection Guidelines](#node-selection-guidelines)
4. [Best Practices](#best-practices)
5. [Testing Your Preset](#testing-your-preset)
6. [Publishing and Sharing](#publishing-and-sharing)

## Preset Structure

Every PSGLib file follows this structure:

```json
{
  "fileType": "psglib",
  "formatVersion": "1.0.0",
  "metadata": {
    "id": "unique-preset-id",
    "name": "Human Readable Name",
    "description": "What this preset does",
    "author": "Your Name",
    "version": "1.0.0",
    "tags": ["category", "use-case"],
    "nodeTypes": ["WeightedChoice", "Concat"],
    "lastModified": "2025-01-10T20:00:00.000Z",
    "license": "MIT"
  },
  "graph": {
    "nodes": [...],
    "edges": [...],
    "settings": {}
  }
}
```

## Design Principles

### 1. Single Responsibility

Each preset should do ONE thing well. Don't try to create a "do everything" preset.

✅ **Good**: "Character Name Generator" - generates first + last names
❌ **Bad**: "Complete Character Creator" - tries to generate name, appearance, personality, backstory

### 2. Meaningful Variety

Ensure your preset generates at least 20-50 unique outputs. Users should get value from multiple runs.

```javascript
// Good: 15 first names × 15 last names = 225 combinations
// Bad: 3 first names × 3 last names = 9 combinations (too limited)
```

### 3. Clear Inputs and Outputs

- Use descriptive labels for all nodes
- Output nodes should have clear template variables
- Consider what the user will connect to your preset

### 4. Balanced Weights

Use weights thoughtfully to create natural distributions:

```json
{
  "choices": [
    { "text": "common option", "weight": 3 },
    { "text": "uncommon option", "weight": 2 },
    { "text": "rare option", "weight": 1 }
  ]
}
```

## Node Selection Guidelines

### Essential Nodes for Most Presets

1. **WeightedChoice**: Core randomization
2. **Concat**: Combining multiple elements
3. **Output**: Clear result formatting

### Advanced Patterns

#### Pattern 1: Layered Generation

```
[Base] → [Modifier] → [Detail] → [Output]
```

Example: Character trait generator with positive trait + flaw + quirk

#### Pattern 2: Template with Variables

```
[Variable1] → [Variable2] → [Template] → [Output]
```

Example: Story hooks with placeholders for subject, place, event

#### Pattern 3: Hierarchical Selection

```
[Category] → [Subcategory] → [Specific] → [Output]
```

Example: Item generator with type → material → enchantment

## Best Practices

### Naming Conventions

- **Preset ID**: `preset-{type}-{timestamp}` (e.g., `preset-character-name-1736536800000`)
- **Node IDs**: `{function}-{timestamp}` (e.g., `first-name-1736536800000`)
- **Edge IDs**: `edge-{source}-{target}-{number}` or `edge-{timestamp}-{number}`

### Content Guidelines

1. **Diversity**: Include options from different cultures, styles, and genres
2. **Quality**: Each option should be interesting and usable
3. **Consistency**: Maintain consistent tone and style within a preset
4. **Avoid Bias**: Ensure balanced representation in character-related presets

### Technical Considerations

1. **Position Nodes Logically**: Flow left-to-right or top-to-bottom
2. **Use Reasonable Spacing**: 200-250px between major nodes
3. **Label Everything**: Every node should have a descriptive label
4. **Test Edge Cases**: Ensure all combinations produce valid output

## Testing Your Preset

### Before Publishing Checklist

- [ ] Generate at least 20 outputs - are they all unique and interesting?
- [ ] Check for typos and grammar errors
- [ ] Verify all edges connect properly
- [ ] Test with different random seeds
- [ ] Ensure descriptions are clear and accurate
- [ ] Validate the JSON structure
- [ ] Check that weights produce desired distribution

### Quality Metrics

**Minimum Requirements**:

- At least 10 unique outputs
- No duplicate combinations
- All outputs grammatically correct
- Clear value proposition

**Excellence Standards**:

- 50+ unique outputs
- Natural language flow
- Surprising but logical combinations
- Extensible design (easy to modify)

## Publishing and Sharing

### Metadata Best Practices

**Name**: Clear, descriptive, action-oriented

- ✅ "Character Name Generator"
- ❌ "Names"

**Description**: Explain what it does and why it's useful

- ✅ "Generates diverse character names with culturally varied first and last name combinations"
- ❌ "Makes names"

**Tags**: Include relevant categories

- Primary category: `character`, `story`, `worldbuilding`, `dialogue`
- Type: `generator`, `selector`, `template`
- Complexity: `basic`, `advanced`
- Genre: `fantasy`, `scifi`, `modern`

**License**: Choose appropriate license

- `MIT`: Free for any use
- `CC-BY`: Free with attribution
- `CC-BY-SA`: Share-alike required
- `proprietary`: Custom restrictions

### File Organization

Place presets in organized directories:

```
presets/
  character/
    character-name-basic.psglib
    character-trait.psglib
  narrative/
    story-hook.psglib
    plot-twist.psglib
  worldbuilding/
    setting-description.psglib
    weather-condition.psglib
```

### Version Management

Follow semantic versioning:

- `1.0.0`: Initial release
- `1.0.1`: Bug fixes
- `1.1.0`: New features/options
- `2.0.0`: Breaking changes

## Examples of Excellence

### Character Name Generator

- **Strength**: 225+ combinations with varied cultural backgrounds
- **Pattern**: First name + Last name with proper weighting

### Story Hook Generator

- **Strength**: Template system with variable substitution
- **Pattern**: Multiple hook templates with contextual variables

### Item Generator

- **Strength**: Layered generation (material + type + property + power)
- **Pattern**: Hierarchical combination for complex outputs

## Common Pitfalls to Avoid

1. **Too Few Options**: Less than 10 unique outputs
2. **Inconsistent Tone**: Mixing modern and archaic language
3. **Broken References**: Edges pointing to non-existent nodes
4. **Poor Weighting**: Everything weighted equally when variety needed
5. **No Documentation**: Missing or unclear descriptions
6. **Overly Complex**: Too many nodes for simple tasks
7. **Grammar Issues**: Outputs that don't form proper sentences

## Advanced Techniques

### Dynamic Templates

Use Output nodes with complex templates:

```json
{
  "template": "The {character} was {emotion}, but {modifier}. {action}."
}
```

### Conditional Paths

Create branches for different scenarios using multiple Output nodes connected to the same sources.

### Reusable Components

Design node groups that can be copied into other presets as modular components.

## Community Guidelines

When sharing presets:

1. Test thoroughly before publishing
2. Include attribution for inspired work
3. Respond to user feedback
4. Update for compatibility with new versions
5. Document any special requirements

## Conclusion

Great presets are:

- **Focused**: Do one thing excellently
- **Valuable**: Generate meaningful variety
- **Reliable**: Work every time
- **Clear**: Easy to understand and modify
- **Inspiring**: Spark creativity in users

Remember: A simple preset that works perfectly is better than a complex one that sometimes fails.

---

_Last Updated: January 10, 2025_
_Format Version: PSGLib 1.0.0_
