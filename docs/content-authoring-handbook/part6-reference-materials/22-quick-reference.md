# Chapter 22: Quick Reference Tables

This chapter provides quick-lookup tables for common generator development tasks. Keep this handy while building generators!

## Modifier Reference Table

Modifiers transform text after rule expansion. Apply them using dot notation: `[rule.modifier]`

| Modifier | Purpose | Example Input | Example Output |
|----------|---------|---------------|----------------|
| `capitalize` | Capitalizes first character | `hello world` | `Hello world` |
| `upper` | Converts to UPPERCASE | `hello world` | `HELLO WORLD` |
| `lower` | Converts to lowercase | `Hello World` | `hello world` |
| `a_an` | Prepends correct article | `apple` | `an apple` |
| `plural` | Basic English pluralization | `cat` | `cats` |
| `past` | Simple past tense | `walk` | `walked` |
| `possessive` | Adds possessive form | `dog` | `dog's` |
| `trim` | Removes whitespace | `  text  ` | `text` |
| `snake` | Converts to snake_case | `Hello World` | `hello_world` |
| `kebab` | Converts to kebab-case | `Hello World` | `hello-world` |

### Usage Examples
```json
{
  "grammar": {
    "item": "[object.a_an.capitalize]",
    "object": ["apple", "sword", "umbrella"],
    
    "title": "[name.upper] the [epithet.capitalize]",
    "name": ["aragorn", "gandalf"],
    "epithet": ["brave", "wise"],
    
    "filename": "[project.snake]_[version]",
    "project": ["My Cool Project", "Test File"],
    "version": ["v1", "v2"]
  }
}
```

## Node Type Reference

### Basic Nodes

| Node Type | Purpose | Key Properties |
|-----------|---------|----------------|
| `WeightedChoice` | Random selection with weights | `choices: [{value, weight}]` |
| `Concat` | Combine multiple inputs | `inputs: [node_ids]` |
| `Output` | Produce final result | `template: string` |
| `Include` | Reference external rule | `name: string` |
| `SetVariable` | Store a value | `key: string, value: any` |
| `GetVariable` | Retrieve a value | `key: string` |

### Advanced Nodes (Epic 7)

| Node Type | Purpose | Key Properties |
|-----------|---------|----------------|
| `WeightedAdvanced` | Complex distributions | `distributionConfig: {type, parameters}` |
| `Conditional` | If-then-else logic | `branches: [{condition, output}]` |
| `Sequential` | Ordered processing | `sequence: [items], pattern: {type}` |
| `Markov` | State transitions | `states: {state: {next: probability}}` |

### Python Integration (Epic 8)

| Node Type | Purpose | Key Properties |
|-----------|---------|----------------|
| `PythonTransform` | Execute Python code | `code: string, timeout: number` |

## Variable Functions Reference

Built-in functions available in conditional expressions:

| Function | Purpose | Example |
|----------|---------|---------|
| `startsWith(str, prefix)` | Check string prefix | `startsWith({name}, 'A')` |
| `endsWith(str, suffix)` | Check string suffix | `endsWith({file}, '.txt')` |
| `includes(str, sub)` | Check substring | `includes({text}, 'magic')` |
| `getType(value)` | Get value type | `getType({data}) == 'array'` |
| `toNumber(value)` | Convert to number | `toNumber({score}) > 50` |
| `toString(value)` | Convert to string | `toString({id}) == '123'` |

### Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `==` | Equality | `{level} == 5` |
| `!=` | Inequality | `{class} != 'warrior'` |
| `>`, `<` | Greater/Less than | `{health} > 0` |
| `>=`, `<=` | Greater/Less or equal | `{age} >= 18` |
| `&&` | Logical AND | `{level} > 5 && {class} == 'mage'` |
| `\|\|` | Logical OR | `{race} == 'elf' \|\| {race} == 'human'` |
| `!` | Logical NOT | `!{isDead}` |

## Grammar Pattern Quick Reference

### Basic Patterns

```json
// Simple random choice
"color": ["red", "blue", "green"]

// Weighted choice
"rarity": [
  {"w": 60, "v": "common"},
  {"w": 30, "v": "uncommon"},
  {"w": 10, "v": "rare"}
]

// Reference expansion
"phrase": "[greeting], [name]!"

// Variable interpolation
"message": "Welcome, {username}!"

// Modifier application
"title": "[name.capitalize] the [class.upper]"
```

### Advanced Patterns

```json
// Conditional generation
{
  "type": "conditional",
  "condition": "{level} > 10",
  "true": "veteran",
  "false": "novice"
}

// Setting variables
{
  "type": "setVariable",
  "key": "chosen_class",
  "value": "[classes]"
}

// Sequential processing
{
  "type": "Sequential",
  "sequence": ["first", "second", "third"],
  "pattern": {"type": "linear"}
}
```

## Common Rule Structures

### Character Generator Pattern
```json
{
  "character": "[name] the [adjective] [class]",
  "name": ["Aria", "Bjorn", "Cara"],
  "adjective": ["brave", "wise", "swift"],
  "class": ["warrior", "mage", "rogue"]
}
```

### Item Generator Pattern
```json
{
  "item": "[quality] [material] [type] of [property]",
  "quality": ["crude", "fine", "masterwork"],
  "material": ["iron", "steel", "mithril"],
  "type": ["sword", "shield", "armor"],
  "property": ["strength", "speed", "protection"]
}
```

### Story Prompt Pattern
```json
{
  "prompt": "[genre]: [protagonist] must [goal] before [deadline]",
  "genre": ["Fantasy", "Sci-Fi", "Mystery"],
  "protagonist": ["a young hero", "an old wizard", "a clever thief"],
  "goal": ["save the kingdom", "find the artifact", "solve the mystery"],
  "deadline": ["sunset", "the army arrives", "time runs out"]
}
```

## File Organization Reference

### Recommended Structure
```
my-generator/
├── generator.json          # Main generator file
├── data/                   # Modular data files
│   ├── names.json
│   ├── locations.json
│   └── items.json
├── assets/                 # Images and resources
│   ├── preview.png
│   └── icons/
├── docs/                   # Documentation
│   └── README.md
└── tests/                  # Test files
    └── test-cases.json
```

### Include Syntax
```json
// Basic include
"names": {"$include": "./data/names.json"}

// Include with metadata
"locations": [
  {"_meta": {"uiLabel": "Locations"}},
  {"$include": "./data/locations.json"}
]
```

## Performance Guidelines

| Optimization | Impact | When to Use |
|--------------|--------|-------------|
| Variable caching | High | Repeated values |
| Shallow nesting | Medium | Complex generators |
| Array limits | Low | Large choice lists |
| Include splitting | High | 1000+ line files |

### Performance Patterns

```json
// Good: Cache repeated lookups
{
  "start": "[setName][useName][useName]",
  "setName": {"type": "setVariable", "key": "name", "value": "[names]"},
  "useName": "Hello, {name}!"
}

// Avoid: Deep nesting
{
  "a": "[b]",
  "b": "[c]",
  "c": "[d]",
  "d": "[e]",
  "e": "final"  // 5 levels deep!
}
```

## Debugging Checklist

- [ ] All `[references]` have corresponding rules
- [ ] No circular references (A→B→A)
- [ ] Variables initialized before use
- [ ] Proper JSON syntax (quotes, commas)
- [ ] Weights are positive numbers
- [ ] File paths in includes are correct
- [ ] Special characters are escaped
- [ ] Output formatting is consistent

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+\` | Toggle debug overlay |
| `Ctrl+S` | Save generator |
| `Ctrl+P` | Preview generation |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

## Error Messages Quick Fix

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| "Unknown rule: [x]" | Missing rule definition | Add rule "x" to grammar |
| "Circular reference" | Rules reference each other | Break the cycle |
| "Invalid JSON" | Syntax error | Check quotes and commas |
| "Variable not found" | Uninitialized variable | Set variable before use |
| "Maximum depth exceeded" | Too much nesting | Simplify rule structure |

---

**Next Chapter**: [Templates & Boilerplates](23-templates.md) →