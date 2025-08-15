# Asset Generator Shortcut

## Command
`/asset-generator` or `/asset`

## Description
Launch the Asset Generation Specialist agent (Aspen) for bulk creating PSG assets from lists

## Agent File
`.bmad-core/agents/asset-generator.yaml`

## Quick Commands
- `*help` - Show all available commands
- `*generate-batch` - Convert a list into PSG assets
- `*combine` - Create combinations from categories
- `*export` - Export generated assets

## Common Workflows

### Generate from simple list
```
/asset
*plan micro-expressions
*generate-batch
[paste your list]
*migrate character
```

### Create combinations
```
/asset
*generate-batch hair_styles
[paste hair styles]
*generate-batch hair_colors  
[paste hair colors]
*combine hair_styles hair_colors
*migrate character
*export
```

### Quick facial features with migration
```
/asset
*plan facial-features
*generate-batch
Micro-Expressions – fleeting looks (eyebrow flash, lip purse, eye dart)
Smile Variations – closed-lip grin, half-smirk, toothy beam
Eye Descriptors – almond-shaped, hooded, heterochromatic, doe-eyed
*migrate character
```

## Aliases
- `/asset` - Primary short version
- `/assets` - Alternative
- `/generate` - Alternative