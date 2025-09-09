# TECH-001: Technical Spike Report - Prompt Dissector Components

## Executive Summary

This technical spike investigated the location and structure of prompt dissector components for integration into the proposed launch screen feature (LAUNCH-001).

## Findings

### 1. Core Prompt Dissector Components Located

#### Primary Components:

- **PromptParser** (`/packages/core/runtime/nodes/epic1/PromptParser.ts`)
  - Main class for analyzing and parsing prompts
  - Segments prompts into semantic units
  - Generates nodes based on semantic understanding
  - Contains `PromptAnalysis` interface with segments and mappings

- **VisualRangeIndicator** (`/packages/core/components/epic1/VisualRangeIndicator.tsx`)
  - Visual component that highlights prompt segments
  - Shows connections between text and generated nodes
  - Supports hover interactions and color-coded mappings
  - Uses `PromptAnalysis` data from PromptParser

#### Supporting Components:

- **SmartNodePositioning** (`/packages/core/runtime/nodes/epic1/SmartNodePositioning.ts`)
  - Handles intelligent positioning of generated nodes
  - Works with PromptParser to arrange nodes visually

- **Epic1GraphEditor** (`/packages/core/components/epic1/Epic1GraphEditor.tsx`)
  - Main editor that integrates prompt parsing functionality
  - Contains drag-drop handlers and node generation logic

### 2. Component Architecture

```
PromptParser (Logic Layer)
    ↓
PromptAnalysis (Data Structure)
    ↓
VisualRangeIndicator (UI Layer)
    ↓
Epic1GraphEditor (Integration Layer)
```

### 3. Key Interfaces and Types

```typescript
// From PromptParser.ts
interface PromptAnalysis {
  originalText: string;
  segments: PromptSegment[];
  nodes: GeneratedNode[];
  mappings: NodeMapping[];
}

interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  suggestedNodeType: Epic1NodeType;
  confidence: number;
  metadata?: {
    reason?: string;
    alternatives?: string[];
  };
}
```

### 4. Dependencies

- **React Flow**: For node-based graph visualization
- **React**: Core UI framework
- **TypeScript**: Type safety
- **Epic1 Node System**: Custom node types for prompt segments

### 5. Current Integration Points

- **App.tsx**: Main entry point, currently loads Epic1EditorContainer directly
- **Epic1EditorContainer**: Wrapper that includes editor and asset browser
- **OnboardingIntegration**: Existing onboarding system that could serve as template

## Integration Plan for Launch Screen

### Phase 1: Component Extraction

1. Extract PromptParser logic into standalone service
2. Create simplified VisualRangeIndicator variant for launch screen
3. Build prompt input component with real-time parsing

### Phase 2: Launch Screen Development

1. Create new `LaunchScreen` component in `/client/src/components/`
2. Implement three-column layout:
   - Left: Prompt input with VisualRangeIndicator
   - Center: Node graph preview
   - Right: Quick actions/templates

### Phase 3: Integration

1. Modify App.tsx to show LaunchScreen initially
2. Add transition animation to Epic1EditorContainer
3. Pass parsed prompt data to main editor

### Code Structure:

```
/client/src/
  components/
    LaunchScreen/
      LaunchScreen.tsx          # Main component
      PromptDissector.tsx       # Prompt input with parsing
      NodePreview.tsx           # Simplified graph preview
      LaunchScreen.css          # Styles
      hooks/
        usePromptParsing.ts     # Hook for parser integration
```

## Recommendations

1. **Reuse Existing Components**: The PromptParser and VisualRangeIndicator are well-structured and can be reused with minimal modifications.

2. **Create Simplified Variants**: For the launch screen, create lighter-weight versions of the components that focus on the dissection visualization.

3. **Progressive Enhancement**: Start with basic prompt parsing display, then add interactive features like hover effects and node selection.

4. **Performance Considerations**:
   - Lazy load the full editor components
   - Keep launch screen bundle small
   - Use React.lazy() for code splitting

## Next Steps

1. Create `LaunchScreen` component structure
2. Extract and simplify PromptParser for launch screen use
3. Implement basic prompt input with real-time parsing
4. Add visual feedback using simplified VisualRangeIndicator
5. Connect to main editor with smooth transition

## Technical Risks

- **Low Risk**: Components are modular and well-separated
- **Medium Risk**: Performance impact of real-time parsing on launch screen
- **Mitigation**: Debounce parsing, use web workers if needed

## Estimated Implementation Time

- Component extraction: 2-3 hours
- Launch screen UI: 4-6 hours
- Integration & transitions: 2-3 hours
- Testing & refinement: 2-3 hours

**Total: 10-15 hours**

## Conclusion

The prompt dissector components are well-structured and ready for integration into a launch screen. The modular architecture allows for easy extraction and reuse. The main challenge will be creating an engaging, performant UI that showcases the parsing capabilities while maintaining fast load times.
