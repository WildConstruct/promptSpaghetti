# Technical Design: Preview Output Bottom Tray

## Overview
This document outlines the technical design for implementing a bottom tray component to display preview outputs in the Prompt Spaghetti Graph application.

## Architecture

### Component Hierarchy
```
App
├── GraphEditor
├── PreviewTray (new)              <-- Sibling to GraphEditor
│   ├── TrayHeader
│   │   ├── DragHandle
│   │   ├── TrayControls
│   │   └── TrayTitle
│   ├── TrayContent
│   │   ├── SeedTabs
│   │   ├── PreviewResults
│   │   └── VirtualScrollContainer
│   └── TrayFooter
│       ├── StatusBar
│       └── ActionButtons
└── PreviewModal (existing)
```

## Component Mockups

### Collapsed State (Minimized)
```
┌─────────────────────────────────────────────────────────────┐
│                     Graph Editor Canvas                      │
│                                                              │
│                    [Node] ─── [Node] ─── [Node]            │
│                       │         │         │                 │
│                    [Node] ─── [Node] ─── [Output]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ▲ Preview Output (5 results)                    [−][↑][×]  │
└─────────────────────────────────────────────────────────────┘
```

### Expanded State (Default - 250px)
```
┌─────────────────────────────────────────────────────────────┐
│                     Graph Editor Canvas                      │
│                    [Node] ─── [Node] ─── [Node]            │
│                       │         │         │                 │
│                    [Node] ─── [Node] ─── [Output]          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ═══ Preview Output ═══════════════════════════  [−][↑][×]  │
├─────────────────────────────────────────────────────────────┤
│ Seed 1 │ Seed 2 │ Seed 3 │ Seed 4 │ Seed 5 │              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Result 1: "A fleeting eyebrow flash, revealing discomfort"  │
│ Result 2: "A subtle lip purse, betraying anxiety"           │
│ Result 3: "A momentary jaw clench, suggesting contempt"     │
│                                                              │
│ [Copy All]  [Copy Selected]  [Export JSON]                  │
└─────────────────────────────────────────────────────────────┘
```

### Maximized State (60% viewport)
```
┌─────────────────────────────────────────────────────────────┐
│         Graph Editor Canvas (40% viewport)                   │
│         [Compressed view with zoom controls]                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ═══ Preview Output (Maximized) ═════════════════ [−][↓][×] │
├─────────────────────────────────────────────────────────────┤
│ Seed 1 │ Seed 2 │ Seed 3 │ Seed 4 │ Seed 5 │ + 10 more    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ Seed 1 (12345) ─────────────────────────────────────┐   │
│ │ Result 1: "A fleeting eyebrow flash..."              │   │
│ │ Result 2: "A subtle lip purse..."                    │   │
│ │ Result 3: "A momentary jaw clench..."                │   │
│ │ ...                                                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ Seed 2 (23456) ─────────────────────────────────────┐   │
│ │ Result 1: "A barely perceptible eye dart..."         │   │
│ │ Result 2: "A suppressed smile..."                    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ [Copy All] [Copy Seed] [Compare] [Export] [Settings]        │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Zustand Store Schema
```typescript
interface PreviewTrayState {
  // Tray state
  isOpen: boolean;
  height: number;
  mode: 'minimized' | 'normal' | 'maximized';
  isPinned: boolean;
  
  // View preferences
  viewMode: 'tray' | 'modal';
  defaultView: 'tray' | 'modal';
  
  // Content state
  activeTab: number;
  scrollPosition: number;
  selectedResults: Set<string>;
  
  // Actions
  toggleTray: () => void;
  setHeight: (height: number) => void;
  setMode: (mode: TrayMode) => void;
  togglePin: () => void;
  switchView: (mode: ViewMode) => void;
}
```

### LocalStorage Schema
```json
{
  "previewTrayPreferences": {
    "defaultView": "tray",
    "lastHeight": 250,
    "isPinned": false,
    "autoOpen": true,
    "theme": "dark"
  }
}
```

## API Design

### PreviewTray Component Props
```typescript
interface PreviewTrayProps {
  // Data
  seeds: number[];
  results: PreviewResult[];
  isExecuting: boolean;
  error?: Error;
  
  // Callbacks
  onExecute: () => void;
  onCancel: () => void;
  onCopy: (text: string) => void;
  onExport: (format: 'json' | 'csv') => void;
  
  // Configuration
  minHeight?: number;        // default: 100
  maxHeight?: number;        // default: 60vh
  defaultHeight?: number;    // default: 250
  virtualizeThreshold?: number; // default: 100
}
```

### Shared Hook for Preview Logic
```typescript
// Extract from PreviewModal to share with PreviewTray
interface UsePreviewContentOptions {
  seeds: number[];
  graph: Graph;
  onComplete?: (results: PreviewResult[]) => void;
}

function usePreviewContent(options: UsePreviewContentOptions) {
  const [results, setResults] = useState<PreviewResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Existing preview logic from PreviewModal
  // ...
  
  return {
    results,
    isExecuting,
    error,
    execute,
    cancel,
    clear
  };
}
```

## Implementation Phases

### Phase 1: Core Structure (2 hours)
1. Create PreviewTray component structure
2. Implement basic open/close functionality
3. Add to App layout as sibling to GraphEditor
4. Wire up basic state management

### Phase 2: Resize & Controls (1.5 hours)
1. Implement drag-to-resize with constraints
2. Add control buttons (minimize, maximize, close)
3. Add smooth animations and transitions
4. Test across different viewports

### Phase 3: Content Integration (1.5 hours)
1. Extract shared logic from PreviewModal
2. Implement tabbed interface for seeds
3. Add virtual scrolling for large results
4. Ensure data format consistency

### Phase 4: Polish & Testing (1 hour)
1. Add keyboard shortcuts
2. Implement localStorage persistence
3. Add accessibility features
4. Write tests and documentation

## CSS Design

### Layout Strategy - Flexbox
```css
.preview-tray {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--tray-height, 250px);
  z-index: var(--z-index-tray);
}

.preview-tray-header {
  flex: 0 0 auto; /* Don't grow or shrink */
  height: var(--tray-header-height);
}

.preview-tray-content {
  flex: 1 1 auto; /* Grow to fill available space */
  overflow: auto;
  min-height: 0; /* Important for Firefox */
}

.preview-tray-footer {
  flex: 0 0 auto; /* Don't grow or shrink */
  height: var(--tray-footer-height);
}
```

### Professional Theme Variables
```css
.preview-tray {
  --tray-bg: var(--color-surface-elevated);
  --tray-border: var(--color-border-subtle);
  --tray-shadow: var(--shadow-elevated);
  --tray-handle-color: var(--color-text-tertiary);
  --tray-transition: all 200ms var(--ease-out);
  
  /* Heights */
  --tray-min-height: 100px;
  --tray-default-height: 250px;
  --tray-max-height: 60vh;
  --tray-header-height: 40px;
  --tray-footer-height: 48px;
}
```

### Animation Classes
```css
.preview-tray-enter {
  transform: translateY(100%);
}

.preview-tray-enter-active {
  transform: translateY(0);
  transition: var(--tray-transition);
}

.preview-tray-exit {
  transform: translateY(0);
}

.preview-tray-exit-active {
  transform: translateY(100%);
  transition: var(--tray-transition);
}
```

## Performance Considerations

### Virtual Scrolling Strategy
```typescript
// Use react-window for results > 100
import { FixedSizeList } from 'react-window';

function VirtualizedResults({ results, height }) {
  if (results.length <= 100) {
    return <RegularResultsList results={results} />;
  }
  
  return (
    <FixedSizeList
      height={height}
      itemCount={results.length}
      itemSize={60}
      width="100%"
    >
      {ResultRow}
    </FixedSizeList>
  );
}
```

### Memory Management
```typescript
// Auto-clear old results when memory limit reached
const MAX_RESULTS_MEMORY = 50 * 1024 * 1024; // 50MB

function checkMemoryUsage(results: PreviewResult[]) {
  const size = new Blob([JSON.stringify(results)]).size;
  if (size > MAX_RESULTS_MEMORY) {
    // Keep only recent results
    return results.slice(-1000);
  }
  return results;
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('PreviewTray', () => {
  it('should render in minimized state by default');
  it('should expand to default height on click');
  it('should respect min/max height constraints');
  it('should persist state to localStorage');
  it('should handle keyboard shortcuts');
});
```

### Integration Tests
```typescript
describe('PreviewTray Integration', () => {
  it('should display results from graph execution');
  it('should switch between tray and modal views');
  it('should maintain state during view switches');
  it('should handle large result sets efficiently');
});
```

## Migration Path

### Feature Flag Implementation
```typescript
// Enable gradual rollout
const FEATURE_FLAGS = {
  previewTray: {
    enabled: true,
    defaultView: 'tray', // or 'modal'
    allowUserToggle: true
  }
};
```

### Backwards Compatibility
```typescript
// Ensure old saved graphs still work
function handlePreviewTrigger(preferTray: boolean) {
  if (FEATURE_FLAGS.previewTray.enabled && preferTray) {
    openPreviewTray();
  } else {
    openPreviewModal(); // Fallback
  }
}
```

## Accessibility Checklist

- [ ] All controls keyboard accessible
- [ ] ARIA labels on interactive elements
- [ ] Screen reader announcements for state changes
- [ ] Focus management on open/close
- [ ] High contrast mode support
- [ ] Reduced motion support

## Security Considerations

- Sanitize preview output to prevent XSS
- Limit clipboard access to user-initiated actions
- Validate export data before download
- Rate limit preview executions

---

*This technical design provides a comprehensive blueprint for implementing the preview output bottom tray feature.*