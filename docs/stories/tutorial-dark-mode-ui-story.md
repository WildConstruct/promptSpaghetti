# TUTORIAL-DARK-MODE-UI - Story

## User Story

**As a** user in dark mode  
**I want** the tutorial to match the application's dark theme  
**So that** the tutorial feels integrated and visually consistent

## Acceptance Criteria

- [ ] Tutorial tooltip background matches app's dark theme (#1a1a1a)
- [ ] Text is clearly readable with proper contrast ratios
- [ ] Tutorial buttons match app's purple accent theme
- [ ] Progress bar uses appropriate dark mode colors
- [ ] Spotlight overlay works well with dark backgrounds
- [ ] All tutorial text meets WCAG AA contrast requirements
- [ ] Visual consistency with Epic1GraphEditor dark theme

## Technical Details

### Current Problem

- TutorialOverlay.tsx uses light mode colors (white background, line 259)
- Text colors optimized for light backgrounds
- Progress bar uses light theme colors (line 275)
- No consistency with app's dark purple theme
- Poor contrast in dark mode environment

### Required Changes

#### 1. Update TutorialOverlay.tsx Styling

**File**: `packages/core/components/epic1/onboarding/TutorialOverlay.tsx`

**Replace light theme colors with dark theme:**

```typescript
// CURRENT (problematic):
backgroundColor: 'white', // line 259
color: '#1a1a1a', // line 306
color: '#4a4a4a', // line 317

// FIXED (dark theme):
backgroundColor: '#1a1a1a',
border: '1px solid #333',
color: '#e0e0e0', // primary text
color: '#999', // secondary text
```

#### 2. Update Progress Bar Colors

**File**: `packages/core/components/epic1/onboarding/TutorialOverlay.tsx`

**Lines 274-275:**

```typescript
// CURRENT:
backgroundColor: '#f0f0f0', // light background

// FIXED:
backgroundColor: '#333', // dark background
```

#### 3. Update Button Styling

**File**: `packages/core/components/epic1/onboarding/TutorialOverlay.tsx`

**Lines 374-381:**

```typescript
// CURRENT: Light mode button styling

// FIXED: Dark mode button styling
backgroundColor: '#f3f4f6',
border: 'none',
borderRadius: '6px',
padding: '8px 16px',
fontSize: '14px',
cursor: 'pointer',
color: '#e0e0e0',
backgroundColor: '#2a2a2a',
border: '1px solid #444',
```

#### 4. Create CSS Variables for Dark Theme

**New File**: `packages/core/components/epic1/onboarding/TutorialDarkTheme.css`

```css
:root {
  /* Tutorial Dark Mode Variables */
  --tutorial-bg-primary: #1a1a1a;
  --tutorial-bg-secondary: #252525;
  --tutorial-bg-hover: #2a2a2a;
  --tutorial-bg-accent: rgba(103, 126, 234, 0.2);

  --tutorial-text-primary: #e0e0e0;
  --tutorial-text-secondary: #999;
  --tutorial-text-muted: #666;

  --tutorial-border: #333;
  --tutorial-border-light: #444;

  --tutorial-accent: rgba(103, 126, 234, 1);
  --tutorial-accent-hover: rgba(103, 126, 234, 0.8);

  --tutorial-overlay: rgba(0, 0, 0, 0.8);
  --tutorial-spotlight: rgba(0, 0, 0, 0.7);
}

/* Apply dark theme to tutorial elements */
.tutorial-tooltip {
  background-color: var(--tutorial-bg-primary) !important;
  border: 1px solid var(--tutorial-border) !important;
  color: var(--tutorial-text-primary) !important;
}

.tutorial-tooltip h3 {
  color: var(--tutorial-text-primary) !important;
}

.tutorial-tooltip p {
  color: var(--tutorial-text-secondary) !important;
}
```

#### 5. Update Hint Box Styling

**File**: `packages/core/components/epic1/onboarding/TutorialOverlay.tsx`

**Lines 328-344:**

```typescript
// CURRENT: Light mode hint styling

// FIXED: Dark mode hint styling
backgroundColor: '#2a2a2a',
borderLeft: '3px solid var(--tutorial-accent)',
padding: '12px',
borderRadius: '4px',
marginBottom: '24px',
```

### Additional Changes Needed

- Update PromptPasteDialog.tsx with dark theme colors
- Ensure example prompt text is readable
- Test contrast ratios meet WCAG AA standards (4.5:1 minimum)
- Verify spotlight effect works with dark backgrounds
- Update any light-themed borders or shadows

### Testing Steps

1. Enable dark mode in the application
2. Start tutorial and verify all elements use dark theme:
   - Tooltip background is dark (#1a1a1a)
   - Text is light and readable (#e0e0e0)
   - Progress bar uses dark colors
   - Buttons match dark theme
   - Hint boxes use appropriate dark styling
3. Test contrast ratios with color contrast checker
4. Verify tutorial works in both light and dark modes
5. Test spotlight effect visibility on dark backgrounds

### Dependencies

- Independent story, can be implemented in parallel
- Should be tested in both light and dark modes
- Requires coordination with app's theme system

### Definition of Done

- Tutorial visually matches application's dark theme
- All text meets WCAG AA contrast requirements
- Consistent with Epic1GraphEditor dark mode styling
- Works correctly in both light and dark modes
- No visual inconsistencies or jarring color combinations
