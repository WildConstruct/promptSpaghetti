# Chapter 15: Expansion Recipes for LLMs

This chapter provides comprehensive patterns and recipes for Large Language Models (LLMs) to effectively expand and enhance generator content. These patterns are derived from real-world usage and optimized for AI-assisted content development.

## Understanding LLM Content Expansion

When working with LLMs to expand generators, the key is providing clear, structured instructions that leverage the AI's strengths while maintaining consistency with existing content.

### Core Principles

1. **Context Preservation**: Always provide sufficient context about the generator's theme and style
2. **Pattern Recognition**: LLMs excel at recognizing and replicating patterns from examples
3. **Structured Output**: Request specific formats to ensure compatibility
4. **Iterative Refinement**: Build content incrementally for best results

## Basic Expansion Patterns

### Adding Entries to Existing Categories

#### Recipe: Simple Array Expansion

```markdown
Task: Add 10 new entries to the "occupations" array in fantasy-generator.json

Current entries for reference:
["Knight", "Wizard", "Merchant", "Blacksmith", "Innkeeper"]

Requirements:

- Match the fantasy medieval theme
- Keep entries 1-2 words
- Avoid modern occupations
- Ensure variety in social classes
```

**Expected Output:**

```json
[
  "Alchemist",
  "Scribe",
  "Fletcher",
  "Herbalist",
  "Minstrel",
  "Falconer",
  "Cartographer",
  "Armorer",
  "Apothecary",
  "Bailiff"
]
```

#### Recipe: Weighted Entry Expansion

```markdown
Task: Add 5 new weighted entries to the "treasure" category

Current format:
[
{"w": 60, "v": "copper coins"},
{"w": 30, "v": "silver coins"},
{"w": 10, "v": "gold coins"}
]

Requirements:

- Maintain rarity distribution (common: 50-70, uncommon: 20-40, rare: 5-15)
- Include both currency and items
- Keep value descriptions concise
```

**Expected Output:**

```json
[
  { "w": 65, "v": "worn leather pouch" },
  { "w": 55, "v": "iron trinkets" },
  { "w": 35, "v": "small gemstone" },
  { "w": 25, "v": "ancient map" },
  { "w": 8, "v": "enchanted ring" }
]
```

### Creating New Categories

#### Recipe: Structured Category Creation

```markdown
Task: Create a new "personality_traits" category for the character generator

Requirements:

- Create 20 diverse personality traits
- Mix positive, negative, and neutral traits
- Keep traits to 1-3 words
- Ensure traits work for any character type
- Format as a simple array

Context: This will be used in templates like "[name] is a [trait] [class]"
```

**Expected Output:**

```json
{
  "personality_traits": [
    "ambitious",
    "cautious",
    "cheerful",
    "cynical",
    "determined",
    "eccentric",
    "gentle",
    "grumpy",
    "honest",
    "impulsive",
    "loyal",
    "mysterious",
    "naive",
    "patient",
    "proud",
    "rebellious",
    "stoic",
    "thoughtful",
    "witty",
    "zealous"
  ]
}
```

## Advanced Expansion Patterns

### Complex Object Arrays

#### Recipe: Detailed Item Generation

```markdown
Task: Create 5 new entries for "magical_items" with structured data

Required format:
{
"name": "Item Name",
"description": "Brief description",
"rarity": "common|uncommon|rare|legendary",
"effects": ["effect1", "effect2"],
"cost": number
}

Theme: Low-magic fantasy setting
Power level: Modest, practical effects
```

**Expected Output:**

```json
[
  {
    "name": "Everburning Torch",
    "description": "A torch that never extinguishes",
    "rarity": "uncommon",
    "effects": ["provides light", "never needs fuel"],
    "cost": 50
  },
  {
    "name": "Merchant's Coin Purse",
    "description": "Always contains one copper piece at dawn",
    "rarity": "uncommon",
    "effects": ["generates 1 copper daily", "cannot be stolen"],
    "cost": 100
  }
  // ... more items
]
```

### Conditional Content

#### Recipe: Context-Aware Expansions

```markdown
Task: Add 10 weather descriptions that change based on season variable

Format:
{
"condition": "{season} == 'value'",
"options": ["weather1", "weather2", "weather3"]
}

Create entries for all four seasons
```

**Expected Output:**

```json
{
  "seasonal_weather": [
    {
      "condition": "{season} == 'spring'",
      "options": [
        "gentle rain falls on blooming flowers",
        "warm breeze carries pollen through the air",
        "morning mist clings to new growth"
      ]
    },
    {
      "condition": "{season} == 'summer'",
      "options": [
        "scorching sun beats down mercilessly",
        "thunderstorms roll across the horizon",
        "humid air hangs heavy and still"
      ]
    }
    // ... more seasons
  ]
}
```

## Modularization Patterns

### Creating Subfiles

#### Recipe: Extracting Large Categories

```markdown
Task: Modularize the "locations" category into its own file

Current structure has 200+ entries. Create:

1. A new locations.json file with all entries
2. Update the main file to reference it
3. Add metadata for UI integration

Organize locations by type in the new file
```

**Expected Output:**

`locations.json`:

```json
{
  "_meta": {
    "version": "1.0.0",
    "description": "Location data for the world generator",
    "categories": ["urban", "rural", "wilderness", "mystical"]
  },
  "urban": ["bustling marketplace", "quiet library", "royal palace"],
  "rural": ["farming village", "mill by the river", "crossroads inn"]
  // ... more categories
}
```

Main file reference:

```json
{
  "locations": [
    { "_meta": { "uiLabel": "Locations" } },
    { "$include": "./data/locations.json" }
  ]
}
```

## Slot-Based Content Assembly

### Understanding Slot Taxonomy

The slot system determines how content pieces are assembled into natural language:

```
subject → style → condition → size → age → purpose → materials →
colour → texture → controls → displays → lighting → sound →
motion → background → markings → density → provenance → setting → view
```

#### Recipe: Slot-Aware Content Creation

```markdown
Task: Create descriptors for a "futuristic device" generator using proper slots

Required slots:

- subject: The device type
- style: Aesthetic descriptor
- materials: Construction materials
- displays: Visual indicators
- controls: Input mechanisms

5 entries per slot, maintaining thematic consistency
```

**Expected Output:**

```json
{
  "device_subject": {
    "_meta": { "slot": "subject" },
    "values": ["scanner", "transmitter", "analyzer", "projector", "synthesizer"]
  },
  "device_style": {
    "_meta": { "slot": "style", "connector": "with a" },
    "values": ["sleek", "industrial", "military-grade", "prototype", "consumer"]
  },
  "device_materials": {
    "_meta": { "slot": "materials", "connector": "made of" },
    "values": [
      "carbon fiber",
      "transparent aluminum",
      "bio-plastic",
      "quantum glass",
      "neo-steel"
    ]
  },
  "device_displays": {
    "_meta": { "slot": "displays", "connector": "featuring" },
    "values": [
      "holographic readouts",
      "neural interfaces",
      "quantum displays",
      "bio-feedback monitors",
      "AR overlays"
    ]
  },
  "device_controls": {
    "_meta": { "slot": "controls", "connector": "controlled by" },
    "values": [
      "gesture recognition",
      "voice commands",
      "neural link",
      "haptic panels",
      "eye tracking"
    ]
  }
}
```

## Style and Tone Matching

### Analyzing Existing Style

#### Recipe: Style Replication

```markdown
Task: Analyze these examples and create 10 more in the same style

Examples from "villain_epithets":

- "the Dread Pirate Roberts"
- "Baroness von Bloodbath"
- "Professor Catastrophe"
- "The Crimson Crescendo"

Identify the pattern and create similar entries
```

**Pattern Analysis:**

- Mix of titles and descriptive names
- Alliteration used frequently
- Combination of formal titles with dramatic descriptors
- Color and sound motifs

**Expected Output:**

```json
[
  "Doctor Doomsday",
  "The Violet Vendetta",
  "Countess Calamity",
  "The Shadow Symphony",
  "Admiral Apocalypse",
  "The Scarlet Scourge",
  "Maestro Mayhem",
  "The Obsidian Oracle",
  "Captain Chaos",
  "The Emerald Eclipse"
]
```

## Common LLM Expansion Tasks

### Batch Processing Instructions

#### Recipe: Multi-Category Expansion

```markdown
Task: Expand multiple related categories for a "space station" generator

Categories to expand (add 15 items each):

1. station_modules: Different sections of the station
2. station_problems: Technical issues that arise
3. station_personnel: Job titles and roles
4. station_events: Random occurrences

Maintain sci-fi theme consistency across all categories
Ensure items can interconnect logically
```

### Variation Generation

#### Recipe: Creating Variations

```markdown
Task: Generate 5 variations of this announcement template

Base: "Attention citizens of [location], the [authority] declares [event]"

Create variations that:

- Maintain the same information structure
- Vary tone (urgent, routine, celebratory)
- Use different vocabulary
- Keep placeholder references intact
```

**Expected Output:**

```json
[
  "Citizens of [location], this is an urgent broadcast from the [authority] regarding [event]",
  "Hear ye, people of [location]! The [authority] hereby proclaims [event]",
  "Public notice: The [authority] of [location] announces [event]",
  "[location] residents, please be advised that the [authority] has declared [event]",
  "Breaking: [authority] officials in [location] confirm [event]"
]
```

## Quality Assurance Patterns

### Validation Checks

#### Recipe: Content Validation

```markdown
Task: Review and validate this generated content

Check for:

1. Duplicate entries
2. Inconsistent formatting
3. Theme violations
4. Grammar/spelling errors
5. Appropriate content

Flag issues and provide corrections
```

### Testing Integration

#### Recipe: Test Case Generation

```markdown
Task: Create test cases for the "character backstory" generator

Generate 5 test scenarios that verify:

- All paths produce valid output
- Variables are properly substituted
- Conditional logic works correctly
- No infinite loops occur
- Output length is reasonable
```

## Optimization Strategies

### Performance-Aware Content

#### Recipe: Efficient Rule Design

```markdown
Task: Optimize this rule structure for better performance

Current:
{
"description": "[color] [material] [item] with [detail1] and [detail2] and [detail3]"
}

Requirements:

- Reduce redundant lookups
- Minimize deep nesting
- Use variables for repeated values
```

**Expected Output:**

```json
{
  "description": "[setBasic][getBasic] with [details]",
  "setBasic": {
    "type": "setVariable",
    "key": "basic_desc",
    "value": "[color] [material] [item]"
  },
  "getBasic": {
    "type": "getVariable",
    "key": "basic_desc"
  },
  "details": [
    "[detail1]",
    "[detail1] and [detail2]",
    "[detail1], [detail2], and [detail3]"
  ]
}
```

## Best Practices for LLM Expansion

### Do's

1. **Provide Clear Context**: Always include theme, style, and purpose
2. **Show Examples**: Include 3-5 existing entries for pattern matching
3. **Specify Format**: Be explicit about JSON structure required
4. **Request Validation**: Ask LLM to check its own output
5. **Iterate**: Build complex content in stages

### Don'ts

1. **Don't Assume Knowledge**: Always explain generator-specific concepts
2. **Don't Request Too Much**: Limit to 20-30 items per request
3. **Don't Skip Validation**: Always review generated content
4. **Don't Ignore Context**: Ensure all content fits the generator theme
5. **Don't Rush**: Take time to refine prompts for better results

## Integration Workflows

### Continuous Expansion

```markdown
Workflow for ongoing content development:

1. Initial Analysis
   - Review current generator structure
   - Identify expansion opportunities
   - Prioritize based on impact

2. Staged Expansion
   - Week 1: Core content (main categories)
   - Week 2: Variations and edge cases
   - Week 3: Polish and interconnections
   - Week 4: Testing and refinement

3. Documentation
   - Update change logs
   - Document new patterns
   - Create usage examples

4. Validation
   - Test all new content paths
   - Verify theme consistency
   - Check performance impact
```

## Conclusion

Effective LLM expansion requires clear communication, structured thinking, and iterative refinement. By following these recipes and patterns, you can efficiently scale your generators while maintaining quality and consistency.

Remember: LLMs are tools to augment creativity, not replace it. Always review and refine generated content to ensure it meets your standards and enhances the user experience.

---

**Next Chapter**: [Testing & Quality Assurance](16-testing-qa.md) →
