# TUTORIAL-PASTE-DIALOG-FIX - Story

## User Story
**As a** user going through the tutorial  
**I want** to review my pasted prompt before the tutorial advances  
**So that** I can see the node creation process and understand what happens  

## Acceptance Criteria
- [ ] Paste dialog does NOT auto-advance when text is pasted
- [ ] User can review pasted text before proceeding
- [ ] "Create Nodes" button is clearly visible and functional
- [ ] Tutorial only advances after user clicks "Create Nodes"
- [ ] No regression in paste functionality

## Technical Details

### Current Problem
- PromptPasteDialog.tsx lines 36-41 auto-advance immediately on paste
- `handlePaste` function calls `setTimeout(() => onPaste(pastedText), 500)`
- This prevents users from seeing the node creation step

### Required Changes
**File**: `packages/core/components/epic1/onboarding/PromptPasteDialog.tsx`

**Change Location**: Lines 32-42
```typescript
// CURRENT (problematic):
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  setPrompt(pastedText);
  // Auto-submit after paste
  setTimeout(() => {
    if (pastedText) {
      onPaste(pastedText);
    }
  }, 500);
};

// FIXED:
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  setPrompt(pastedText);
  // Do NOT auto-advance - let user click "Create Nodes" button
};

const handleCreateNodes = () => {
  if (prompt.trim()) {
    onPaste(prompt);
  }
};
```

### Additional Changes Needed
- Add "Create Nodes" button to the dialog UI
- Remove auto-advance timeout logic
- Ensure button is disabled when prompt is empty
- Update button text to be more descriptive

### Testing Steps
1. Start tutorial and reach paste step
2. Paste text into the dialog
3. Verify tutorial does NOT advance automatically
4. Verify "Create Nodes" button appears and is enabled
5. Click "Create Nodes" button
6. Verify tutorial advances to next step

### Definition of Done
- Paste dialog respects user control over tutorial progression
- Node creation process is visible to users
- UI provides clear next steps for users
- No breaking changes to existing paste functionality
