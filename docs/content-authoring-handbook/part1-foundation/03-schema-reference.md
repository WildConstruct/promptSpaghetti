# Chapter 3: Generator JSON Schema Reference

This chapter provides a complete reference for the Generator JSON format, which serves as both the storage format and the interchange format for Prompt Spaghetti generators.

## Schema Overview

A generator file consists of several key sections:

```json
{
  "meta": {
    "name": "Generator Name",
    "author": "Author Name",
    "version": "1.0.0",
    "description": "What this generator creates"
  },
  "variables": {
    "variableName": "defaultValue"
  },
  "grammar": {
    "start": ["Entry point rule"],
    "ruleName": ["array", "of", "options"]
  },
  "includes": {
    "external": "./path/to/file.json"
  },
  "config": {
    "maxDepth": 10,
    "enableDebug": false
  }
}
```

## Metadata Structure

The `meta` section contains information about the generator:

### Required Fields

```json
{
  "meta": {
    "name": "Character Generator",
    "version": "1.0.0"
  }
}
```

- **name** (string, required): Display name for the generator
- **version** (string, required): Semantic version number

### Optional Fields

```json
{
  "meta": {
    "author": "Jane Doe",
    "description": "Generates fantasy RPG characters",
    "tags": ["fantasy", "rpg", "character"],
    "license": "MIT",
    "homepage": "https://example.com/generators",
    "category": "gaming",
    "minEngineVersion": "2.0.0"
  }
}
```

- **author** (string): Creator's name or handle
- **description** (string): Detailed explanation of generator purpose
- **tags** (array): Searchable keywords
- **license** (string): Distribution license
- **homepage** (string): Project or documentation URL
- **category** (string): Classification for organization
- **minEngineVersion** (string): Minimum compatible engine version

## Grammar Rules Definition

The `grammar` section contains the generation rules:

### Basic Rule Types

#### String Rules

Simple text output:

```json
{
  "grammar": {
    "greeting": "Hello, world!"
  }
}
```

#### Array Rules

Random selection from options:

```json
{
  "grammar": {
    "color": ["red", "blue", "green", "yellow"]
  }
}
```

#### Weighted Rules

Probability-based selection:

```json
{
  "grammar": {
    "rarity": [
      { "w": 60, "v": "common" },
      { "w": 30, "v": "uncommon" },
      { "w": 9, "v": "rare" },
      { "w": 1, "v": "legendary" }
    ]
  }
}
```

### Advanced Rule Patterns

#### Reference Expansion

Reference other rules using square brackets:

```json
{
  "grammar": {
    "character": "[name] the [class]",
    "name": ["Alice", "Bob", "Charlie"],
    "class": ["Warrior", "Mage", "Rogue"]
  }
}
```

#### Nested References

Build complex structures:

```json
{
  "grammar": {
    "npc": "[greeting], I am [character]",
    "greeting": ["Hello", "Greetings", "Welcome"],
    "character": "[name] the [adjective] [class]",
    "name": ["Aldric", "Elara", "Thorin"],
    "adjective": ["brave", "wise", "stealthy"],
    "class": ["knight", "wizard", "thief"]
  }
}
```

#### Modifier Application

Apply text transformations:

```json
{
  "grammar": {
    "title": "[name.capitalize] the [epithet.allcaps]",
    "name": ["alice", "bob"],
    "epithet": ["great", "terrible"]
  }
}
```

## Variables and Their Types

Variables provide dynamic state during generation:

### Variable Declaration

```json
{
  "variables": {
    "playerName": "Hero",
    "playerLevel": 1,
    "hasCompanion": false,
    "inventory": []
  }
}
```

### Variable Types

- **String**: Text values
- **Number**: Integers or decimals
- **Boolean**: true/false
- **Array**: Lists of values
- **Object**: Nested structures

### Variable Usage

Reference variables with curly braces:

```json
{
  "grammar": {
    "greeting": "Welcome, {playerName}!",
    "levelUp": "You are now level {playerLevel}!"
  }
}
```

### Dynamic Variables

Set variables during generation:

```json
{
  "grammar": {
    "start": "[setName][greet]",
    "setName": {
      "type": "setVariable",
      "key": "userName",
      "value": "[names]"
    },
    "names": ["Alice", "Bob", "Charlie"],
    "greet": "Hello, {userName}!"
  }
}
```

## Entry Points and Execution

Entry points determine where generation begins:

### Default Entry Point

The `start` rule is the default:

```json
{
  "grammar": {
    "start": "This is where generation begins"
  }
}
```

### Multiple Entry Points

Define multiple starting options:

```json
{
  "entryPoints": ["character", "location", "item"],
  "grammar": {
    "character": "[name] the [class]",
    "location": "The [adjective] [place]",
    "item": "[quality] [itemType]"
  }
}
```

### Execution Configuration

Control execution behavior:

```json
{
  "config": {
    "defaultEntryPoint": "start",
    "maxRecursionDepth": 10,
    "timeoutMs": 5000,
    "enableCaching": true,
    "strictMode": false
  }
}
```

## Include Patterns and Modularization

Break large generators into manageable pieces:

### Basic Include

```json
{
  "includes": {
    "names": "./data/names.json",
    "locations": "./data/locations.json"
  },
  "grammar": {
    "character": "[names:first] from [locations:city]"
  }
}
```

### Include File Format

`names.json`:

```json
{
  "first": ["Alice", "Bob", "Charlie"],
  "last": ["Smith", "Jones", "Brown"]
}
```

### Meta Merge Arrays

Special `_meta` array for extending includes:

```json
{
  "includes": {
    "base": "./base-generator.json"
  },
  "grammar": {
    "_meta": {
      "merge": ["base"],
      "exclude": ["oldRule"],
      "override": {
        "specificRule": ["new", "values"]
      }
    }
  }
}
```

## Node Type Definitions

When using the visual editor, nodes map to JSON structures:

### WeightedChoice Node

```json
{
  "type": "WeightedChoice",
  "choices": [
    { "value": "common", "weight": 70 },
    { "value": "rare", "weight": 30 }
  ]
}
```

### Concat Node

```json
{
  "type": "Concat",
  "inputs": ["Hello, ", "[name]", "!"]
}
```

### Output Node

```json
{
  "type": "Output",
  "template": "Generated: {result}"
}
```

### SetVariable Node

```json
{
  "type": "SetVariable",
  "key": "characterName",
  "value": "[generateName]"
}
```

### GetVariable Node

```json
{
  "type": "GetVariable",
  "key": "characterName",
  "default": "Unknown"
}
```

## Advanced Schema Features

### Conditional Rules

```json
{
  "type": "conditional",
  "condition": "{playerLevel} > 5",
  "true": "You are experienced!",
  "false": "You are a novice."
}
```

### Sequential Patterns

```json
{
  "type": "Sequential",
  "sequence": ["First", "Second", "Third"],
  "pattern": {
    "type": "linear",
    "config": {
      "allowRepeats": false
    }
  }
}
```

### Markov Chains

```json
{
  "type": "Markov",
  "states": {
    "happy": {
      "sad": 0.3,
      "excited": 0.7
    },
    "sad": {
      "happy": 0.5,
      "angry": 0.5
    }
  },
  "initial": "happy"
}
```

## Validation Rules

The schema enforces several validation rules:

### Structure Validation

- Valid JSON syntax required
- All references must resolve
- No circular dependencies
- Proper type matching

### Weight Validation

- Weights must be positive numbers
- At least one non-zero weight required
- Weights automatically normalized

### Variable Validation

- Variable names must be valid identifiers
- No reserved keywords
- Type consistency maintained

### Performance Limits

- Maximum recursion depth
- String length limits
- Array size limits
- Execution timeout

## Migration and Compatibility

### Version Detection

```json
{
  "meta": {
    "version": "2.0.0",
    "compatibleWith": ["1.x", "2.x"]
  }
}
```

### Legacy Format Support

Older formats automatically upgraded:

```json
{
  "grammar": {
    "start": {
      "_legacy": true,
      "options": ["old", "format"]
    }
  }
}
```

### Future-Proofing

Use extension fields:

```json
{
  "meta": {
    "x-custom-field": "value",
    "x-plugin-config": {}
  }
}
```

## Best Practices

When creating generator JSON:

1. **Use Semantic Versioning**
   - Major.Minor.Patch format
   - Increment appropriately
   - Document changes

2. **Organize Rules Logically**
   - Group related rules
   - Use clear naming
   - Add comments via `_comment`

3. **Optimize for Performance**
   - Minimize deep nesting
   - Reuse common patterns
   - Use variables for repeated values

4. **Plan for Modularity**
   - Split large generators
   - Use includes effectively
   - Create reusable components

## Complete Example

Here's a full generator demonstrating all major features:

```json
{
  "meta": {
    "name": "Fantasy Character Generator",
    "version": "1.2.0",
    "author": "Jane Doe",
    "description": "Creates detailed fantasy RPG characters"
  },
  "variables": {
    "characterClass": "",
    "level": 1
  },
  "includes": {
    "names": "./data/fantasy-names.json",
    "items": "./data/equipment.json"
  },
  "grammar": {
    "start": "[setClass][character]",
    "setClass": {
      "type": "setVariable",
      "key": "characterClass",
      "value": "[class]"
    },
    "character": "[name] the [adjective] {characterClass}",
    "name": "[names:first] [names:last]",
    "adjective": [
      { "w": 60, "v": "[common_adjective]" },
      { "w": 30, "v": "[uncommon_adjective]" },
      { "w": 10, "v": "[rare_adjective]" }
    ],
    "common_adjective": ["brave", "strong", "swift"],
    "uncommon_adjective": ["cunning", "wise", "fierce"],
    "rare_adjective": ["legendary", "immortal", "divine"],
    "class": ["Warrior", "Mage", "Rogue", "Cleric"]
  },
  "config": {
    "maxRecursionDepth": 15,
    "enableDebug": true
  }
}
```

This schema reference provides the foundation for understanding how Prompt Spaghetti generators work at the data level. Whether you're hand-crafting JSON or using the visual editor, these principles remain consistent.

---

**Next Chapter**: [Basic Generator Creation](../part2-content-development/04-basic-generator.md) →
