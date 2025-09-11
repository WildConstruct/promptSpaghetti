# TUTORIAL-PROMPT-PARSING - Story

## User Story
**As a** user going through the tutorial  
**I want** my pasted prompt to be automatically parsed into visual nodes  
**So that** I can see how the app converts text prompts into interactive graphs  

## Acceptance Criteria
- [ ] Pasted prompt is parsed into WeightedChoice and TextBlock nodes
- [ ] Bracketed options `{option1|option2}` create WeightedChoice nodes
- [ ] Static text creates TextBlock nodes
- [ ] Nodes are positioned appropriately on the canvas
- [ ] Edges connect nodes in logical flow
- [ ] Parsing handles complex prompts with multiple choice branches
- [ ] Error handling for malformed prompts

## Technical Details

### Current Problem
- TutorialOverlay.tsx dispatches 'epic1:promptPasted' event (lines 110-112)
- Epic1GraphEditor.tsx has no listener for this event
- No prompt parsing logic exists in the main editor
- Tutorial steps 4+ fail because expected nodes don't exist

### Required Changes

#### 1. Add Event Listener (Epic1GraphEditor.tsx)
```typescript
// Add to Epic1GraphEditor.tsx useEffect hooks
useEffect(() => {
  const handlePromptPasted = (event: CustomEvent) => {
    const { prompt } = event.detail;
    if (prompt) {
      parsePromptAndCreateNodes(prompt);
    }
  };

  window.addEventListener('epic1:promptPasted', handlePromptPasted as EventListener);
  return () => window.removeEventListener('epic1:promptPasted', handlePromptPasted as EventListener);
}, []);
```

#### 2. Implement Prompt Parser
**New File**: `packages/core/components/epic1/utils/promptParser.ts`
```typescript
export interface ParsedPromptSegment {
  type: 'text' | 'choice';
  content: string;
  options?: string[];
}

export function parsePrompt(prompt: string): ParsedPromptSegment[] {
  // Parse {option1|option2} patterns into choice segments
  // Parse static text into text segments
  // Return array of segments for node creation
}
```

#### 3. Node Creation Logic
**New Function**: `parsePromptAndCreateNodes()` in Epic1GraphEditor.tsx
```typescript
const parsePromptAndCreateNodes = useCallback((prompt: string) => {
  const segments = parsePrompt(prompt);

  // Calculate positions for new nodes
  const startX = 200;
  const startY = 200;
  const nodeSpacing = 300;

  // Create nodes from segments
  const newNodes = segments.map((segment, index) => {
    if (segment.type === 'choice') {
      return createWeightedChoiceNode(segment, startX + index * nodeSpacing, startY);
    } else {
      return createTextBlockNode(segment, startX + index * nodeSpacing, startY);
    }
  });

  // Create edges between nodes
  const newEdges = createEdgesBetweenNodes(newNodes);

  // Add to graph
  setNodes(current => [...current, ...newNodes]);
  setEdges(current => [...current, ...newEdges]);
}, [setNodes, setEdges]);
```

### Dependencies
- Depends on TUTORIAL-EVENT-HANDLER being completed first
- Requires prompt parser utility function
- Should handle edge cases (empty prompts, malformed brackets)

### Testing Steps
1. Start tutorial and reach paste step
2. Paste example prompt: "A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon's lair}"
3. Click "Create Nodes"
4. Verify nodes are created:
   - 4 WeightedChoice nodes for bracketed options
   - TextBlock nodes for static text
   - Proper edges connecting nodes
5. Verify tutorial advances to next step

### Edge Cases to Handle
- Empty or whitespace-only prompts
- Unclosed brackets `{option1|option2`
- Nested brackets `{option1|{sub1|sub2}}`
- Very long prompts that need layout optimization
- Special characters in options

### Definition of Done
- Prompt parsing works for the tutorial example
- Visual feedback shows node creation process
- Error handling for malformed input
- Integration with tutorial flow works correctly
- No performance issues with large prompts
