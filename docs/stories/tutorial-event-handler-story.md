# TUTORIAL-EVENT-HANDLER - Story

## User Story

**As a** tutorial system  
**I want** proper event communication between tutorial and main editor  
**So that** tutorial actions can trigger main application functionality

## Acceptance Criteria

- [ ] 'epic1:promptPasted' event listener exists in Epic1GraphEditor.tsx
- [ ] Event handler properly receives prompt data from tutorial
- [ ] Event listener is properly cleaned up on component unmount
- [ ] No memory leaks from event listeners
- [ ] Event handling works in both directions (tutorial ↔ editor)

## Technical Details

### Current Problem

- TutorialOverlay.tsx dispatches 'epic1:promptPasted' event (line 110-112)
- Epic1GraphEditor.tsx has NO listener for this event
- Communication gap prevents tutorial from triggering main app functionality
- This is a blocker for TUTORIAL-PROMPT-PARSING

### Required Changes

**File**: `packages/core/components/epic1/Epic1GraphEditor.tsx`

**Location**: Add to existing useEffect hooks section

```typescript
// Add event listener for tutorial integration
useEffect(() => {
  const handlePromptPasted = (event: CustomEvent) => {
    const { prompt } = event.detail;
    console.log('[Epic1GraphEditor] Tutorial prompt received:', prompt);

    if (prompt && typeof prompt === 'string') {
      // Store prompt for processing
      setTutorialPrompt(prompt);

      // Trigger prompt processing (will be implemented in next story)
      // parsePromptAndCreateNodes(prompt);
    }
  };

  // Add event listener
  window.addEventListener(
    'epic1:promptPasted',
    handlePromptPasted as EventListener
  );

  // Cleanup function
  return () => {
    window.removeEventListener(
      'epic1:promptPasted',
      handlePromptPasted as EventListener
    );
  };
}, []);

// Add state for tutorial prompt
const [tutorialPrompt, setTutorialPrompt] = useState<string | null>(null);
```

### Additional Changes Needed

**File**: `packages/core/components/epic1/Epic1GraphEditor.tsx`

- Add import for useState if not already present
- Add TypeScript interface for CustomEvent detail
- Add error handling for malformed events
- Add logging for debugging tutorial integration

### Testing Steps

1. Open browser developer tools console
2. Start tutorial and reach paste step
3. Paste text and click "Create Nodes"
4. Check console for log: "[Epic1GraphEditor] Tutorial prompt received: ..."
5. Verify no JavaScript errors in console
6. Verify event listener is cleaned up (no memory leaks)

### Dependencies

- Must be completed before TUTORIAL-PROMPT-PARSING
- Requires TUTORIAL-PASTE-DIALOG-FIX to be working
- Foundation for tutorial ↔ editor communication

### Definition of Done

- Event listener exists and is functional
- Proper event data handling and validation
- Clean event listener cleanup on unmount
- No console errors during tutorial flow
- Foundation laid for prompt processing integration

### Notes

- This story focuses ONLY on event handling infrastructure
- Actual prompt processing will be implemented in TUTORIAL-PROMPT-PARSING
- Event handling should be robust and handle edge cases
- Consider adding event debouncing if needed for performance
