# Epic 8: UX Abstraction Layer Architecture

## Overview

This document defines the architecture for Epic 8, which creates a designer-friendly abstraction layer that hides technical implementation details from users while maintaining full system functionality.

## Problem Statement

The current node schema exposes technical fields (`id`, `inputs`, complex config objects) directly to users, making the tool feel like programming rather than visual design. This violates UX principles and intimidates non-technical users (designers, directors, art teams).

## Architecture Goals

1. **Hide Technical Complexity**: Users should never see UUIDs, internal field names, or implementation details
2. **Template-Based Variables**: Replace manual variable entry with natural `{variable}` syntax  
3. **Progressive Disclosure**: Show basic options by default, advanced options only when needed
4. **Designer Mental Model**: Interface should match how creative users think about prompts

## Core Architecture Components

### 1. Dual Schema System

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Schema     │◄──►│  Node Adapter   │◄──►│ Internal Schema │
│                 │    │                 │    │                 │
│ User-friendly   │    │ Translation     │    │ Technical       │
│ Simple fields   │    │ Layer           │    │ Implementation  │
│ Template syntax │    │                 │    │ Auto-generated  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**UI Schema** (`packages/core/ui-schema.ts`):
- Only fields users need to see
- Natural language concepts
- Template-based variable system
- No technical IDs or configuration objects

**Internal Schema** (`packages/core/graphSchema.ts`):
- Existing technical schema unchanged
- All implementation details preserved
- Auto-generated fields (IDs, connections)
- Full compatibility with execution engine

**Node Adapter** (`packages/core/node-adapter.ts`):
- Bidirectional conversion between schemas
- Template parsing and variable extraction
- ID generation and management
- Default value inference

### 2. Template-Based Variable System

#### Current (Complex):
```typescript
// User must manually define:
{
  variableName: "creature",
  variableType: "string", 
  scope: "global",
  persistent: false,
  allowOverwrite: true,
  // ... many more fields
}
```

#### New (Simple):
```typescript
// User just writes natural template:
template: "A {creature} running through {terrain}"

// System automatically extracts:
variables: ["creature", "terrain"]
// And shows them as connection ports
```

### 3. Progressive Disclosure Architecture

```typescript
interface NodeUIState {
  basic: UINode;           // Always visible
  advanced?: {             // Collapsed by default
    performance: boolean;
    debugging: boolean;
  };
  connections?: {          // Visual only
    inputs: string[];
    outputs: string[];
  };
}
```

**Basic View**: Essential fields only
- Node name (optional)
- Template/choices content
- Primary configuration

**Advanced View**: Power-user options
- Performance settings
- Custom configurations
- Debug information

**Debug View**: Developer mode
- Raw internal data
- Technical field inspection

### 4. Node Type Simplification

#### Prompt Nodes
```typescript
// UI Schema
{
  type: 'Prompt',
  template: "A {style} image of {subject} in {setting}",
  name?: "Character Prompt"
}

// Variables auto-extracted: ["style", "subject", "setting"]
// Shown as visual input ports, not form fields
```

#### Choice Nodes  
```typescript
// UI Schema
{
  type: 'WeightedChoice',
  choices: ["dragon", "phoenix", "unicorn"],
  name?: "Mythical Creatures"
}

// Weights managed through visual controls
// No manual weight entry required
```

#### Variable Nodes
```typescript
// Set Variable - Simplified
{
  type: 'SetVariable', 
  variableName: "userChoice",
  value: "dragon"
}

// Get Variable - Simplified
{
  type: 'GetVariable',
  variableName: "userChoice", 
  defaultValue?: "phoenix"
}

// All scope/persistence handled automatically
```

## Implementation Strategy

### Phase 1: Core Infrastructure
1. ✅ Create UI schema definitions
2. ✅ Implement NodeAdapter conversion layer
3. Create template parsing utilities
4. Add validation for UI schemas

### Phase 2: UI Component Refactoring
1. Refactor inspector components to use UI schema
2. Implement template input with variable highlighting
3. Create visual weight controls for choice nodes
4. Add progressive disclosure to all editors

### Phase 3: Integration & Testing
1. Update graph store to use dual schema system
2. Modify preview/execution to handle conversion
3. Update export/import to maintain compatibility
4. Comprehensive testing with both schemas

### Phase 4: Advanced Features
1. Template auto-completion
2. Variable type inference
3. Smart defaults based on context
4. Visual connection management

## Data Flow Architecture

```
User Input (Template) → Template Parser → Variable Extraction → UI Schema
                                                                      ↓
UI Schema → NodeAdapter → Internal Schema → Execution Engine → Results
                                                                      ↓  
Results → Preview → User Feedback → Template Refinement → Iteration
```

## Benefits for Different User Types

### For Designers:
- No technical jargon or UUIDs
- Natural template syntax: `"A {style} portrait"`
- Visual weight controls instead of number entry
- Immediate preview of template results

### For Directors:
- Focus on creative content, not configuration
- Quick iteration on prompt variations
- Clear understanding of what each node does
- No need to understand technical implementation

### For Developers:
- Clean separation of concerns
- Full access to technical details when needed
- Backward compatibility maintained
- Debug mode for troubleshooting

## Migration Strategy

### Backward Compatibility
- Existing graphs automatically convert to new system
- Internal schema unchanged - no breaking changes
- Export format remains compatible
- Progressive rollout possible

### User Migration
- Current users see improved interface immediately
- No re-learning required for basic usage
- Advanced users can access debug mode if needed
- Training materials focus on simplified workflow

## Technical Considerations

### Performance
- Template parsing cached for repeated use
- Conversion only happens at UI boundaries
- Execution engine unchanged - no performance impact
- Variable extraction optimized for real-time use

### Validation
- UI schema validation prevents invalid states
- Template syntax validation with helpful errors
- Runtime validation ensures internal consistency
- Graceful error handling for edge cases

### Extensibility
- New node types follow same pattern
- UI abstractions can be added incrementally
- Advanced configurations remain accessible
- System grows naturally with user needs

## Success Metrics

### User Experience
- Reduced time to create first working prompt
- Decreased support requests about "technical fields"
- Increased adoption by non-technical users
- Positive feedback on interface simplicity

### Technical
- Zero breaking changes to existing functionality
- Maintained execution performance
- Clean code separation between UI and logic
- Comprehensive test coverage

## Future Enhancements

### Smart Templates
- AI-assisted template suggestions
- Context-aware variable recommendations
- Automatic prompt optimization

### Visual Enhancements  
- Node preview thumbnails
- Real-time template rendering
- Interactive variable connections
- Drag-and-drop variable assignment

### Collaboration Features
- Template sharing between users
- Version control for prompt evolution
- Team libraries of common patterns
- Usage analytics and optimization

---

This architecture provides a foundation for making Prompt-Spaghetti truly designer-friendly while maintaining all technical capabilities needed for advanced prompt engineering.