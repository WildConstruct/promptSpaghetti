# Chapter 4: Basic Generator Creation

Welcome to hands-on generator creation! This chapter walks you through building your first generators, from simple random selections to more sophisticated content generation patterns.

## Your First Generator

Let's start with the simplest possible generator - a greeting generator.

### Step 1: Basic Structure

Create a new file called `greeting-generator.json`:

```json
{
  "meta": {
    "name": "My First Generator",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "Hello, world!"
  }
}
```

This generator always outputs "Hello, world!" - not very exciting, but it's valid!

### Step 2: Adding Randomness

Let's make it more interesting by adding random selection:

```json
{
  "meta": {
    "name": "Random Greeting Generator",
    "version": "1.0.0"
  },
  "grammar": {
    "start": ["Hello, world!", "Hi there!", "Greetings!", "Welcome!"]
  }
}
```

Now the generator randomly picks one of the four greetings.

### Step 3: Combining Elements

Real generators combine multiple random elements:

```json
{
  "meta": {
    "name": "Dynamic Greeting Generator",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "[greeting], [subject]!",
    "greeting": ["Hello", "Hi", "Hey", "Greetings"],
    "subject": ["friend", "there", "everyone", "stranger"]
  }
}
```

This creates combinations like "Hello, friend!" or "Hey, everyone!"

## Understanding Rules and Variations

Rules are the building blocks of generators. Let's explore different rule types:

### String Rules

The simplest rule type - just plain text:

```json
{
  "grammar": {
    "companyName": "Acme Corporation"
  }
}
```

### Array Rules

Arrays create variation through random selection:

```json
{
  "grammar": {
    "color": ["red", "blue", "green", "yellow", "purple"]
  }
}
```

### Reference Rules

References let you combine other rules using `[ruleName]` syntax:

```json
{
  "grammar": {
    "start": "The [size] [color] [animal]",
    "size": ["tiny", "small", "large", "huge"],
    "color": ["red", "blue", "green", "spotted"],
    "animal": ["cat", "dog", "bird", "fish"]
  }
}
```

This might generate: "The tiny blue cat" or "The huge spotted fish"

### Nested References

Rules can reference other rules that contain references:

```json
{
  "grammar": {
    "start": "[character] [action]",
    "character": "[adjective] [profession]",
    "adjective": ["brave", "cunning", "wise"],
    "profession": ["knight", "wizard", "thief"],
    "action": ["seeks [treasure]", "battles [enemy]"],
    "treasure": ["ancient gold", "magic sword", "lost crown"],
    "enemy": ["dark sorcerer", "fierce dragon", "evil king"]
  }
}
```

## Basic Randomization Patterns

Let's explore common patterns for creating varied content:

### Pattern 1: Simple Alternatives

When you need straightforward variation:

```json
{
  "grammar": {
    "weather": ["sunny", "cloudy", "rainy", "stormy", "foggy"],
    "mood": ["happy", "sad", "excited", "anxious", "calm"],
    "time": ["morning", "afternoon", "evening", "night", "dawn"]
  }
}
```

### Pattern 2: Structured Combinations

Building complex outputs from simple parts:

```json
{
  "grammar": {
    "start": "[setup]. [conflict]. [resolution].",

    "setup": [
      "Once upon a time in [location]",
      "Long ago in [location]",
      "In the distant land of [location]"
    ],

    "location": ["a magical forest", "an ancient kingdom", "a hidden valley"],

    "conflict": [
      "A terrible curse befell the land",
      "An evil wizard threatened the peace",
      "A mysterious plague spread rapidly"
    ],

    "resolution": [
      "But a hero arose to save the day",
      "Until a brave soul discovered the cure",
      "When an unlikely alliance formed"
    ]
  }
}
```

### Pattern 3: Variable Depth

Some outputs need more detail than others:

```json
{
  "grammar": {
    "character": [
      "[name]",
      "[name] the [adjective]",
      "[name] the [adjective] [profession]"
    ],

    "name": ["Alex", "Morgan", "Jordan", "Casey"],
    "adjective": ["brave", "clever", "mysterious"],
    "profession": ["warrior", "scholar", "merchant"]
  }
}
```

This creates names with varying levels of detail.

## Testing Your Generator

Testing is crucial for ensuring your generator works as expected.

### Manual Testing

1. **Load in Editor**: Open your generator in the Prompt Spaghetti editor
2. **Preview Multiple Seeds**: Use the preview panel with different seeds
3. **Check All Paths**: Ensure every rule can be reached
4. **Verify Output**: Confirm formatting and grammar are correct

### Common Test Cases

Test these scenarios for every generator:

```json
{
  "test_cases": {
    "minimum": "Check shortest possible output",
    "maximum": "Check longest possible output",
    "variety": "Run 10+ times to see variation",
    "formatting": "Verify punctuation and spacing",
    "references": "Ensure all [references] resolve"
  }
}
```

### Using Debug Mode

Enable debug mode to see how rules are evaluated:

1. Add `?dev=1` to your URL
2. Press `Ctrl+\` (or `Cmd+\` on Mac) to toggle debug overlay
3. Generate content to see the expansion tree

## Common Mistakes to Avoid

Learn from these frequent beginner errors:

### Mistake 1: Circular References

❌ **Wrong:**

```json
{
  "grammar": {
    "a": "[b]",
    "b": "[a]"
  }
}
```

✅ **Right:**

```json
{
  "grammar": {
    "a": "[b]",
    "b": "final value"
  }
}
```

### Mistake 2: Missing References

❌ **Wrong:**

```json
{
  "grammar": {
    "start": "The [color] [object]",
    "color": ["red", "blue"]
    // Missing "object" rule!
  }
}
```

✅ **Right:**

```json
{
  "grammar": {
    "start": "The [color] [object]",
    "color": ["red", "blue"],
    "object": ["ball", "box", "book"]
  }
}
```

### Mistake 3: Inconsistent Formatting

❌ **Wrong:**

```json
{
  "grammar": {
    "start": "[greeting][punctuation]",
    "greeting": ["Hello ", "Hi", "Hey "],
    "punctuation": ["!", ".", "?"]
  }
}
```

This creates inconsistent spacing.

✅ **Right:**

```json
{
  "grammar": {
    "start": "[greeting][punctuation]",
    "greeting": ["Hello", "Hi", "Hey"],
    "punctuation": ["!", ".", "?"]
  }
}
```

### Mistake 4: Unescaped Special Characters

❌ **Wrong:**

```json
{
  "grammar": {
    "price": "$[amount]",
    "amount": ["10", "20", "30"]
  }
}
```

✅ **Right:**

```json
{
  "grammar": {
    "price": "\\$[amount]",
    "amount": ["10", "20", "30"]
  }
}
```

## Building a Complete Example

Let's create a more sophisticated generator step by step:

### Fantasy Shop Generator

**Goal**: Generate descriptions of items in a fantasy shop.

**Step 1**: Plan the structure

```
[quality] [item] of [property] - [price] gold
```

**Step 2**: Create the base generator

```json
{
  "meta": {
    "name": "Fantasy Shop Items",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "Generates random fantasy shop inventory"
  },
  "grammar": {
    "start": "[quality] [item] of [property] - [price] gold",

    "quality": ["Common", "Uncommon", "Rare", "Legendary"],

    "item": [
      "sword",
      "shield",
      "potion",
      "scroll",
      "ring",
      "amulet",
      "cloak",
      "boots"
    ],

    "property": [
      "fire",
      "ice",
      "lightning",
      "healing",
      "strength",
      "wisdom",
      "speed",
      "protection"
    ],

    "price": ["10", "25", "50", "100", "250", "500", "1000", "5000"]
  }
}
```

**Step 3**: Add variation and polish

```json
{
  "meta": {
    "name": "Fantasy Shop Items",
    "version": "1.1.0",
    "author": "Your Name",
    "description": "Generates random fantasy shop inventory"
  },
  "grammar": {
    "start": "[item_description]\n[price_line]",

    "item_description": [
      "[quality] [item] of [property]",
      "[quality] [material] [item]",
      "[quality] [item] with [enhancement]"
    ],

    "price_line": [
      "Price: [price] gold",
      "Cost: [price] gold pieces",
      "Yours for only [price] gold!"
    ],

    "quality": ["Common", "Uncommon", "Rare", "Epic", "Legendary"],

    "item": [
      "sword",
      "shield",
      "potion",
      "scroll",
      "ring",
      "amulet",
      "cloak",
      "boots",
      "helm",
      "gauntlets",
      "staff",
      "bow"
    ],

    "material": [
      "iron",
      "steel",
      "silver",
      "gold",
      "mithril",
      "adamantine",
      "crystal",
      "dragon scale"
    ],

    "property": [
      "fire",
      "ice",
      "lightning",
      "healing",
      "strength",
      "wisdom",
      "speed",
      "protection",
      "invisibility",
      "telepathy",
      "regeneration",
      "luck"
    ],

    "enhancement": [
      "+1 attack",
      "+2 defense",
      "glowing runes",
      "ancient enchantment",
      "blessed by priests",
      "forged in dragon fire",
      "moon-touched",
      "star-blessed",
      "demon-ward",
      "fey-crafted"
    ],

    "price": [
      "10",
      "25",
      "50",
      "100",
      "250",
      "500",
      "1000",
      "2500",
      "5000",
      "10000"
    ]
  }
}
```

**Sample Outputs**:

- "Rare mithril sword\nPrice: 1000 gold"
- "Epic ring of telepathy\nYours for only 2500 gold!"
- "Legendary cloak with star-blessed\nCost: 10000 gold pieces"

## Next Steps

Now that you understand the basics:

1. **Experiment**: Modify the examples to create your own variations
2. **Combine Patterns**: Mix different techniques in one generator
3. **Add Complexity**: Try nested rules and multiple entry points
4. **Test Thoroughly**: Ensure all combinations work well

### Practice Exercises

1. **Weather Report Generator**: Create a generator that produces varied weather reports
2. **Menu Generator**: Build a restaurant menu with appetizers, mains, and desserts
3. **Character Name Generator**: Design a generator for fantasy character names with titles

### Moving Forward

You've learned the fundamentals of generator creation. In the next chapters, we'll explore:

- Advanced rule syntax and weighted choices
- Variables and conditional logic
- Modularization for large projects
- Performance optimization

Remember: Start simple, test often, and gradually add complexity. Happy generating!

---

**Next Chapter**: [Advanced Rule Syntax](05-advanced-rules.md) →
