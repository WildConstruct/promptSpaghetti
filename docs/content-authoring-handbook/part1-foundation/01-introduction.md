# Chapter 1: Introduction & Overview

Welcome to the **Content Authoring Handbook** for Prompt Spaghetti! This comprehensive guide will teach you how to create, manage, and optimize content generators using our powerful node-based system.

## What is Prompt Spaghetti?

Prompt Spaghetti is a sophisticated content generation system that combines:

- **Visual Node-Based Editing**: Create generators using an intuitive graph interface
- **Deterministic Randomization**: Generate varied but reproducible content using seeds
- **Modular Architecture**: Build complex generators from reusable components
- **Rich Rule System**: Express complex content patterns with weighted choices, conditionals, and variables
- **Professional Tooling**: Debug overlays, testing frameworks, and performance optimization

At its core, Prompt Spaghetti transforms structured rule definitions into dynamic, varied output while maintaining complete control over the generation process.

## Key Concepts and Terminology

Before diving in, let's establish the fundamental concepts:

### Generators

A **generator** is a collection of rules that produce randomized content. Generators are defined in JSON format and contain:

- Metadata (name, author, version)
- Grammar rules (the content patterns)
- Variables (dynamic values)
- Entry points (where generation begins)

### Nodes

In the visual editor, content is created using **nodes** - visual components that represent different operations:

- **WeightedChoice**: Selects from weighted options
- **Concat**: Combines multiple inputs
- **Output**: Produces final text
- **SetVariable/GetVariable**: Manages dynamic values
- **Conditional**: Branches based on conditions
- **Sequential**: Processes items in order
- **Markov**: State-based transitions

### Rules

**Rules** define how content varies. They can be:

- Simple strings: `"Hello, world!"`
- Arrays of options: `["red", "blue", "green"]`
- Weighted choices: `[{"w": 2, "v": "common"}, {"w": 1, "v": "rare"}]`
- Nested structures with modifiers and conditions

### Deterministic Execution

Unlike pure random generation, Prompt Spaghetti uses **deterministic randomization**:

- Same seed + same generator = identical output
- Enables reproducible results
- Allows "favorite" generations to be saved
- Facilitates testing and debugging

### Variable Context

The **variable context** flows through the generation process:

- Variables can be set and retrieved at any point
- Context propagates through connected nodes
- Enables dynamic, context-aware generation

## How This Handbook is Organized

This handbook is structured to support different learning paths:

### Progressive Learning Path

1. **Foundation** (Part 1): Understand the system architecture
2. **Content Development** (Part 2): Learn to create generators
3. **Practical Guides** (Part 4): Follow step-by-step tutorials
4. **Engine Reference** (Part 3): Deep dive into technical details
5. **Advanced Topics** (Part 5): Master complex techniques

### Reference Path

- **Quick Start**: Jump to Chapter 14 for immediate hands-on experience
- **API Reference**: Part 3 for technical documentation
- **Troubleshooting**: Chapter 17 for problem-solving
- **Quick References**: Part 6 for cheat sheets and tables

### Use Case Paths

#### For Content Creators

- Start with Chapter 4: Basic Generator Creation
- Focus on Part 2: Content Development
- Reference Chapter 22: Quick Reference Tables

#### For Developers

- Begin with Chapter 2: Architecture
- Study Part 3: Engine Reference
- Explore Part 5: Advanced Topics

#### For LLM Integration

- Review Chapter 8: Slot Taxonomy
- Study Chapter 15: Expansion Recipes
- Understand Chapter 20: Integration Patterns

## Prerequisites and Assumptions

To get the most from this handbook, you should have:

### Technical Prerequisites

- Basic understanding of JSON syntax
- Familiarity with text editors or IDEs
- Elementary programming concepts (variables, conditionals)

### Helpful but Not Required

- JavaScript/TypeScript knowledge (for advanced features)
- Regular expressions (for complex patterns)
- Node.js experience (for CLI usage)

### What You'll Need

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code recommended)
- The Prompt Spaghetti application (web or local)

## Getting Started

Ready to begin? Here are your next steps:

1. **New Users**: Continue to Chapter 2 to understand the architecture
2. **Hands-On Learners**: Jump to Chapter 14 for a complete tutorial
3. **Experienced Users**: Check Part 5 for advanced techniques
4. **Migrating Users**: See Appendix B for migration guides

## Conventions Used in This Handbook

Throughout this handbook, we use consistent formatting:

- `Code snippets` appear in monospace font
- **Important terms** are bolded on first use
- 📝 Notes provide additional context
- ⚠️ Warnings highlight potential issues
- 💡 Tips offer best practices
- 🚀 Examples show real-world usage

### Code Examples

Examples show both JSON generator format:

```json
{
  "name": "Simple Generator",
  "grammar": {
    "start": ["Hello, [name]!"],
    "name": ["Alice", "Bob", "Charlie"]
  }
}
```

And node-based representations when applicable.

## Community and Support

Prompt Spaghetti has an active community:

- **GitHub Repository**: Report issues and contribute
- **Discord Server**: Get help and share generators
- **Example Gallery**: Learn from community creations
- **Video Tutorials**: Visual learning resources

## Ready to Create?

You now have the foundation to begin your journey with Prompt Spaghetti. Whether you're creating character generators, story prompts, technical documentation, or entirely new types of content, this handbook will guide you every step of the way.

Let's start building amazing generators together!

---

**Next Chapter**: [Architecture & Core Concepts](02-architecture.md) →
