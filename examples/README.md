# 📚 Prompt Spaghetti Examples

This directory contains example graphs and templates to help you get started with Prompt Spaghetti.

## 🎯 Quick Start Examples

### 1. Character Generator (`character-generator.psg`)
A complete character generation system for film and game production.

**Features:**
- Name generation with cultural variations
- Personality traits with weighted probabilities
- Physical descriptions
- Backstory elements

**Use Case:** Pre-production character development, NPC generation, casting descriptions

### 2. Scene Description (`scene-description.psg`)
Dynamic scene and location descriptions for scripts and storyboards.

**Features:**
- Location atmospherics
- Time of day variations
- Weather conditions
- Mood and tone settings

**Use Case:** Script writing, storyboard annotations, VFX planning

### 3. Dialogue Variations (`dialogue-variations.psg`)
Generate multiple takes on the same dialogue.

**Features:**
- Emotion-based variations
- Character voice modulation
- Formality levels
- Cultural adaptations

**Use Case:** Script doctoring, ADR alternatives, localization

### 4. Marketing Copy (`marketing-copy.psg`)
Film marketing and promotional content generator.

**Features:**
- Tagline generation
- Synopsis variations
- Social media posts
- Press release templates

**Use Case:** Marketing campaigns, pitch decks, festival submissions

## 🎬 Film Industry Templates

### VFX Shot Descriptions
- `vfx-shot-simple.psg` - Basic VFX shot notation
- `vfx-shot-complex.psg` - Detailed technical breakdowns
- `vfx-shot-review.psg` - Director's notes generator

### Production Documents
- `call-sheet-notes.psg` - Daily call sheet annotations
- `location-scout.psg` - Location scouting reports
- `continuity-notes.psg` - Script supervisor notes

### Creative Development
- `pitch-generator.psg` - Elevator pitch variations
- `logline-builder.psg` - One-sentence story summaries
- `treatment-outline.psg` - Treatment structure templates

## 🚀 How to Use

### Loading Examples

1. **In the Editor:**
   - Click "Open" in the toolbar
   - Navigate to the examples folder
   - Select a `.psg` file to load

2. **Via Command Line:**
   ```bash
   npx promptgraph exec examples/character-generator.psg --seed 42
   ```

3. **As Templates:**
   - Load an example
   - Modify to your needs
   - Save as your own preset

### Understanding the Structure

Each example includes:
- **Input nodes**: Starting points for generation
- **Processing nodes**: Logic and randomization
- **Output nodes**: Final generated text
- **Comments**: Explanatory notes (when applicable)

## 📝 Creating Your Own

To create your own examples:

1. Start with a simple example as a base
2. Modify the node configurations
3. Test with multiple seeds
4. Save to this directory with a descriptive name
5. Update this README with your contribution

## 🎯 Best Practices

- **Seed Testing**: Always test with multiple seeds (1-100)
- **Weight Balance**: Start with equal weights, then adjust
- **Modularity**: Create reusable fragments
- **Documentation**: Add comments to complex graphs
- **Performance**: Keep graphs under 200 nodes for best performance

## 📦 Example Data Files

Some examples use external data files located in `examples/data/`:
- `names.json` - Character name databases
- `locations.json` - Location descriptions
- `traits.json` - Character traits and attributes
- `dialogue.json` - Dialogue templates

## 🤝 Contributing Examples

We welcome example contributions! Please:
1. Ensure your example works with seeds 1-10
2. Include clear node labels
3. Add a description to this README
4. Test in both editor and CLI
5. Follow the naming convention: `category-description.psg`

## 📧 Questions?

For questions about these examples or to submit your own:
- **Contact**: Brian Behm, CEO
- **Email**: wildconstruct@wildconstruct.com
- **GitHub**: Submit a PR with your examples

---

*These examples are part of Prompt Spaghetti's professional film industry toolset.*
*© 2024-2025 Wild Construct. All rights reserved.*