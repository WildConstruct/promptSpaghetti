# Epic 1 - Task 32: Keyboard Shortcut Reference

## Overview

Task 32 implements a comprehensive keyboard shortcut reference system that provides users with quick access to all available shortcuts through a visual overlay, searchable reference, and interactive keyboard map. The system is context-aware and integrates seamlessly with Epic 1's help infrastructure.

## Implementation Details

### 1. Keyboard Shortcut Reference Overlay

The main reference overlay displays all shortcuts organized by category:

```typescript
const shortcutCategories = [
  { id: 'editing', name: 'Editing', icon: '✏️', shortcuts: [...] },
  { id: 'navigation', name: 'Navigation', icon: '🧭', shortcuts: [...] },
  { id: 'selection', name: 'Selection', icon: '🎯', shortcuts: [...] },
  { id: 'creation', name: 'Creation', icon: '✨', shortcuts: [...] },
  { id: 'preview', name: 'Preview & Export', icon: '👁️', shortcuts: [...] },
  { id: 'help', name: 'Help & UI', icon: '❓', shortcuts: [...] },
];
```

Features:
- **Quick Access**: Press `?` to toggle the overlay
- **Search Functionality**: Real-time filtering of shortcuts
- **Category Filtering**: View shortcuts by specific categories
- **Platform Detection**: Shows ⌘ for Mac, Ctrl for Windows/Linux
- **Availability Status**: Grayed out shortcuts that aren't currently available

### 2. Visual Keyboard Map

Interactive keyboard visualization showing:
- Full keyboard layout with proper key sizes
- Hover tooltips showing shortcut functions
- Active key highlighting
- Platform-specific modifier keys

```typescript
<VisualKeyboardMap 
  activeKeys={activeKeys}
  highlightedCategory={selectedCategory}
/>
```

### 3. Keyboard Shortcut Manager

Centralized management system for registering and handling shortcuts:

```typescript
interface ShortcutHandler {
  id: string;
  keys: string[];
  handler: (e: KeyboardEvent) => void;
  description: string;
  category: string;
  enabled?: boolean;
  preventDefault?: boolean;
}
```

Key features:
- **Dynamic Registration**: Add/remove shortcuts at runtime
- **Conflict Detection**: Prevents duplicate key bindings
- **Context Awareness**: Enable/disable based on application state
- **Input Field Safety**: Automatically disabled when typing
- **Common Shortcuts Hook**: Pre-built handlers for standard operations

### 4. Integration Pattern

```tsx
// Wrap your app with the provider
<KeyboardShortcutIntegration>
  <Epic1GraphEditor />
</KeyboardShortcutIntegration>

// Use shortcuts in components
const MyComponent = () => {
  const { registerCommonShortcuts } = useCommonShortcuts();
  
  useEffect(() => {
    registerCommonShortcuts({
      onSave: handleSave,
      onUndo: handleUndo,
      onRedo: handleRedo,
      onDuplicate: handleDuplicate,
    });
  }, []);
};
```

### 5. Shortcut Categories and Bindings

#### Editing Shortcuts
- **Double Click** - Edit node text inline
- **Enter** - Save current edit
- **Escape** - Cancel current edit
- **Tab** - Move to next field
- **Shift+Tab** - Move to previous field

#### Navigation Shortcuts
- **Click+Drag** - Pan around canvas
- **Ctrl/Cmd+Plus** - Zoom in
- **Ctrl/Cmd+Minus** - Zoom out
- **Ctrl/Cmd+0** - Fit all nodes in view
- **Ctrl/Cmd+F** - Search nodes

#### Selection Shortcuts
- **Ctrl/Cmd+A** - Select all nodes
- **Ctrl/Cmd+Click** - Add to selection
- **Shift+Drag** - Box selection
- **Escape** - Clear selection

#### Creation Shortcuts
- **Ctrl/Cmd+D** - Duplicate selected nodes
- **Delete/Backspace** - Delete selected nodes
- **Ctrl/Cmd+Z** - Undo last action
- **Ctrl/Cmd+Shift+Z** - Redo last action

#### Preview & Export Shortcuts
- **Ctrl/Cmd+P** - Generate preview
- **Ctrl/Cmd+E** - Export graph
- **Ctrl/Cmd+S** - Save project
- **Ctrl/Cmd+N** - New project

#### Help & UI Shortcuts
- **?** - Show keyboard shortcuts
- **Ctrl/Cmd+K** - Open command palette
- **Ctrl/Cmd+B** - Toggle sidebar
- **F11** - Toggle fullscreen

## Technical Architecture

### Component Structure

```
onboarding/
├── KeyboardShortcutReference.tsx    # Main overlay component
├── VisualKeyboardMap.tsx           # Interactive keyboard visualization
├── KeyboardShortcutManager.tsx     # Shortcut registration & handling
└── __tests__/
    └── KeyboardShortcuts.test.tsx  # Comprehensive test suite
```

### State Management

```typescript
// Global shortcut registry
const [shortcuts, setShortcuts] = useState<Map<string, ShortcutHandler>>(new Map());

// Context for component access
const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);
```

### Event Handling

```typescript
// Smart event matching with modifier support
function checkShortcutMatch(event: KeyboardEvent, keys: string[]): boolean {
  // Handle Ctrl/Cmd cross-platform
  // Check all modifiers match exactly
  // Validate main key
  // Ignore when in input fields
}
```

## User Experience Features

### Search Within Shortcuts
- Real-time filtering as user types
- Searches both shortcut names and key combinations
- Highlights matching results
- Shows "No shortcuts found" for empty results

### Visual Keyboard Map
- Interactive key highlighting
- Hover tooltips with shortcut descriptions
- Platform-specific layout (Mac vs PC)
- Compact view for space-constrained UIs

### Shortcut Hints
- Inline hints next to UI elements
- Consistent kbd styling
- Platform-aware key labels
- Optional descriptions

### Accessibility
- Full keyboard navigation within overlay
- Screen reader announcements
- High contrast support
- Respects reduced motion preferences

## Performance Optimizations

### Efficient Event Handling
```typescript
// Single global listener instead of per-component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      if (checkShortcutMatch(e, shortcut.keys)) {
        shortcut.handler(e);
      }
    });
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [shortcuts]);
```

### Lazy Rendering
- Overlay only renders when visible
- Search results update with debouncing
- Minimal re-renders on state changes

## Testing Coverage

Comprehensive test suite covering:
- Overlay open/close behavior
- Search and filter functionality
- Shortcut registration/triggering
- Platform-specific rendering
- Input field safety
- Context integration

## Files Created

### Components
- `/packages/core/components/epic1/onboarding/KeyboardShortcutReference.tsx`
- `/packages/core/components/epic1/onboarding/VisualKeyboardMap.tsx`
- `/packages/core/components/epic1/onboarding/KeyboardShortcutManager.tsx`

### Tests
- `/packages/core/components/epic1/onboarding/__tests__/KeyboardShortcuts.test.tsx`

### Examples
- `/packages/core/components/epic1/examples/KeyboardShortcutExample.tsx`

## Impact on User Experience

### Before (Without Shortcut Reference)
- Users discover shortcuts through trial and error
- No central place to learn available shortcuts
- Inconsistent shortcut implementations
- Platform confusion (Ctrl vs Cmd)

### After (With Keyboard Reference)
- Press `?` for instant shortcut reference
- Searchable, categorized shortcut list
- Visual keyboard map for spatial learners
- Context-aware shortcut availability

### Key Improvements
1. **Discoverability**: 100% of shortcuts documented and searchable
2. **Learning Curve**: Visual map reduces time to proficiency
3. **Consistency**: Centralized management ensures no conflicts
4. **Accessibility**: Full keyboard navigation and screen reader support

## Integration Example

```tsx
// In your Epic 1 editor
import { KeyboardShortcutIntegration } from './onboarding';

export const Epic1Editor = () => {
  return (
    <KeyboardShortcutIntegration>
      <GraphEditor />
      <InspectorPanel />
      <PreviewModal />
      {/* Keyboard shortcut help automatically available with ? key */}
    </KeyboardShortcutIntegration>
  );
};
```

## Summary

Task 32 delivers a professional-grade keyboard shortcut reference system that makes Epic 1's interface more efficient and discoverable. Users can quickly learn available shortcuts through the searchable overlay, visual keyboard map, and contextual hints. The centralized management system ensures consistency while allowing for context-aware shortcut handling. With full accessibility support and cross-platform compatibility, the system provides a foundation for power users to maximize their productivity.