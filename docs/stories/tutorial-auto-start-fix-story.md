# TUTORIAL-AUTO-START-FIX - Story

## User Story
**As a** new user  
**I want** the tutorial to only start when I explicitly click the Tutorial button  
**So that** I'm not surprised by unexpected tutorial popups  

## Acceptance Criteria
- [ ] Tutorial does NOT auto-start for first-time users
- [ ] Tutorial only starts when user clicks Tutorial button
- [ ] Existing users are not affected by tutorial auto-start
- [ ] No console errors related to tutorial initialization

## Technical Details

### Current Problem
- TutorialContext.tsx lines 151-153 auto-start tutorial for first-time users
- Code automatically sets `isActive: true` when no saved state exists
- This creates intrusive user experience

### Required Changes
**File**: `packages/core/components/epic1/onboarding/TutorialContext.tsx`

**Change Location**: Lines 151-153
```typescript
// CURRENT (problematic):
} else {
  // First time user - auto start tutorial
  setIsActive(true);
}

// FIXED:
} else {
  // First time user - tutorial ready but not active
  setIsActive(false);
}
```

### Testing Steps
1. Clear localStorage (`localStorage.clear()`)
2. Refresh the page
3. Verify tutorial does NOT start automatically
4. Click Tutorial button
5. Verify tutorial starts correctly

### Definition of Done
- Tutorial respects user intent and doesn't auto-start
- Manual tutorial trigger works correctly
- No regression in existing tutorial functionality
- Code follows existing patterns and conventions
