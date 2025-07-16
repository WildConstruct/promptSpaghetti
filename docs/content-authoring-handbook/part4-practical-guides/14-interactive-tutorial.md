# Chapter 14: Interactive Tutorial - Your First Generator

Welcome to the interactive tutorial! This chapter combines theory with hands-on practice using live examples you can edit and test directly in your browser.

## Getting Started

Before we begin, make sure you have the interactive examples loaded. If you don't see live editors below, refresh the page or check that JavaScript is enabled.

### Example 1: Hello World

Let's start with the simplest possible generator. Try editing the code below and see the results change in real-time:

<div id="example-hello" data-interactive-example 
     data-title="Hello World Generator" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Hello World",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "Hello, world!"
  }
}'></div>

**Try this**: Change "world" to "universe" and click Run to see the output update.

### Example 2: Random Selection

Now let's add some randomness. This generator will randomly pick from several options:

<div id="example-random" data-interactive-example 
     data-title="Random Greeting Generator" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Random Greeting",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "[greeting], [subject]!",
    "greeting": ["Hello", "Hi", "Hey", "Greetings"],
    "subject": ["friend", "world", "there", "everyone"]
  }
}'></div>

**Try this**: 
1. Add new greetings to the array: `"Welcome"`, `"Salutations"`
2. Try different seeds to see different outputs
3. Add more subjects like `"stranger"`, `"adventurer"`

### Example 3: Weighted Choices

Sometimes you want some options to appear more often than others. Let's use weighted choices:

<div id="example-weighted" data-interactive-example 
     data-title="Weighted Character Generator" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Weighted Character Generator",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "[name] the [class]",
    "name": ["Aria", "Bjorn", "Cara", "Daven", "Elara"],
    "class": [
      {"w": 40, "v": "Warrior"},
      {"w": 25, "v": "Mage"},
      {"w": 20, "v": "Rogue"},
      {"w": 10, "v": "Cleric"},
      {"w": 5, "v": "Paladin"}
    ]
  }
}'></div>

**Try this**:
1. Notice how "Warrior" appears more often than "Paladin"
2. Change the weights - make "Mage" have weight 50
3. Add a new class with weight 15

### Example 4: Variables and Context

Variables let you store and reuse values throughout generation:

<div id="example-variables" data-interactive-example 
     data-title="Variable Usage Example" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Character with Variables",
    "version": "1.0.0"
  },
  "variables": {
    "heroName": "",
    "heroClass": ""
  },
  "grammar": {
    "start": "[setHero][introduction][quest]",
    "setHero": "[setName][setClass]",
    "setName": {
      "type": "setVariable",
      "key": "heroName",
      "value": "[names]"
    },
    "setClass": {
      "type": "setVariable",
      "key": "heroClass",
      "value": "[classes]"
    },
    "names": ["Aldric", "Brenna", "Cormac", "Deirdre"],
    "classes": ["knight", "wizard", "rogue", "cleric"],
    "introduction": "Meet {heroName}, a brave {heroClass}. ",
    "quest": "{heroName} must [mission] to save the kingdom!",
    "mission": [
      "find the lost artifact",
      "defeat the dark lord", 
      "unite the warring clans",
      "solve the ancient riddle"
    ]
  }
}'></div>

**Try this**:
1. Notice how the name is consistent throughout
2. Add a new variable for the hero's weapon
3. Use the weapon variable in both introduction and quest

### Example 5: Modularization with Includes

For larger generators, you can split content into separate files:

<div id="example-includes" data-interactive-example 
     data-title="Generator with Includes" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Fantasy Adventure",
    "version": "1.0.0"
  },
  "includes": {
    "characters": {
      "warriors": ["Thorin", "Gimli", "Aragorn"],
      "mages": ["Gandalf", "Elrond", "Saruman"],
      "rogues": ["Legolas", "Pippin", "Merry"]
    }
  },
  "grammar": {
    "start": "[character] ventures to [location]",
    "character": "[characters:warriors]",
    "location": [
      "the Misty Mountains",
      "the Dark Forest", 
      "the Ancient Ruins",
      "the Crystal Cave"
    ]
  }
}'></div>

**Try this**:
1. Change from "warriors" to "mages" or "rogues"
2. Add your own character categories
3. Try mixing different character types

## Interactive Exercises

Now it's your turn! Use the examples below to practice creating generators:

### Exercise 1: Build a Restaurant Menu

Create a generator that produces items for a restaurant menu:

<div id="exercise-menu" data-interactive-example 
     data-title="Restaurant Menu Exercise" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Restaurant Menu",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "Today\\'s Special: [dish]",
    "dish": "Replace this with your menu items!"
  }
}'></div>

**Your task**: Create a menu generator with:
- Appetizers, main courses, and desserts
- Weighted choices (some items more common)
- Price ranges
- Cooking styles (grilled, fried, baked)

### Exercise 2: Weather Report Generator

Build a generator that creates weather reports:

<div id="exercise-weather" data-interactive-example 
     data-title="Weather Report Exercise" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Weather Report",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "Today will be [weather]",
    "weather": ["sunny", "cloudy", "rainy"]
  }
}'></div>

**Your task**: Expand this to include:
- Temperature ranges
- Wind conditions
- Humidity levels
- Time-of-day variations
- Seasonal differences

### Exercise 3: Story Prompt Generator

Create a generator for creative writing prompts:

<div id="exercise-story" data-interactive-example 
     data-title="Story Prompt Exercise" 
     data-variations="true"
     data-code='{
  "meta": {
    "name": "Story Prompt",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "Write a story about [premise]",
    "premise": "a mysterious stranger"
  }
}'></div>

**Your task**: Build a comprehensive story prompt generator with:
- Different genres (fantasy, sci-fi, mystery)
- Character types and motivations
- Settings and time periods
- Conflicts and challenges
- Plot twists

## Advanced Interactive Features

### Real-time Validation

Notice how the editors show validation status:
- ✓ Valid JSON - Your code is syntactically correct
- ✗ Invalid JSON - There's a syntax error to fix

### Seed Control

Use the seed input to get reproducible results:
- Same seed = same output
- Different seeds = different variations
- Click 🎲 for random seeds

### Multiple Outputs

Enable "Show Variations" to see how different seeds produce different outputs from the same generator.

## Troubleshooting Interactive Examples

If the interactive examples aren't working:

1. **Check JavaScript**: Make sure JavaScript is enabled
2. **Refresh Page**: Sometimes a refresh helps
3. **Browser Compatibility**: Use a modern browser (Chrome, Firefox, Safari, Edge)
4. **Console Errors**: Check browser developer console for error messages

## Tips for Success

1. **Start Simple**: Begin with basic generators and add complexity gradually
2. **Test Frequently**: Use the Run button often to see your changes
3. **Use Different Seeds**: Test with various seeds to ensure good variation
4. **Validate JSON**: Fix syntax errors before testing logic
5. **Save Your Work**: Use the Copy or Download buttons to save good examples

## Next Steps

Now that you've experienced interactive generator creation:

1. **Practice More**: Try the exercises above
2. **Explore Advanced Features**: Learn about conditional logic and advanced nodes
3. **Build Real Generators**: Create generators for your own projects
4. **Share and Learn**: Join the community to share your creations

The interactive examples continue throughout this handbook - look for the live editors in other chapters to practice specific concepts!

---

**Next Chapter**: [Expansion Recipes for LLMs](15-expansion-recipes.md) →

<style>
/* Ensure interactive examples are properly styled */
@import url('../assets/css/interactive-examples.css');
</style>

<script>
/* Load interactive examples framework */
document.addEventListener('DOMContentLoaded', function() {
  const script = document.createElement('script');
  script.src = '../assets/js/interactive-examples.js';
  document.head.appendChild(script);
});
</script>