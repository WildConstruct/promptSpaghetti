# Epic1GraphEditor Refactoring Plan

## Current State Analysis
- **File Size**: 2,596 lines (way too large!)
- **Hook Count**: 82 hooks (indicates too many responsibilities)
- **Complexity**: Single component handling 15+ different concerns

## Major Responsibilities (Need Extraction)

### 1. **State Management** (~400 lines)
- Node and edge state
- Selection state
- Drag state
- Preview state
- Could extract to: `useGraphState.ts` custom hook

### 2. **History Management** (~150 lines)
- Undo/redo functionality
- History ring buffer
- Viewport capture/restore
- Could extract to: `useGraphHistory.ts` custom hook

### 3. **Local Storage Persistence** (~100 lines)
- Auto-save functionality
- State compression
- Storage availability checks
- Could extract to: `useGraphPersistence.ts` custom hook

### 4. **Preview Engine Integration** (~200 lines)
- Preview execution
- Result management
- Seed management
- Could extract to: `usePreviewEngine.ts` custom hook

### 5. **Konami Code Easter Egg** (~60 lines)
- Key sequence detection
- Tetris mode activation
- Could extract to: `useKonamiCode.ts` custom hook

### 6. **Node Operations** (~300 lines)
- Node creation
- Node editing
- Node deletion
- Connection validation
- Could extract to: `useNodeOperations.ts` custom hook

### 7. **Drag and Drop Handling** (~150 lines)
- Asset library drops
- Palette drops
- Position calculation
- Could extract to: `useGraphDragDrop.ts` custom hook

### 8. **Context Menus** (~100 lines)
- Node context menu
- Canvas context menu
- Menu positioning
- Could extract to: `GraphContextMenus.tsx` component

### 9. **Modals and Dialogs** (~200 lines)
- Prompt wizard modal
- Auth modal
- Save preset dialog
- Pending wizard nodes
- Could extract to: `GraphModals.tsx` component

### 10. **Import/Export** (~100 lines)
- File loading
- File saving
- Format conversion
- Could extract to: `useGraphIO.ts` custom hook

## Proposed New Structure

```
epic1/
├── Epic1GraphEditor.tsx (Main container ~300 lines)
├── components/
│   ├── GraphCanvas.tsx (ReactFlow wrapper)
│   ├── GraphModals.tsx (All modals/dialogs)
│   ├── GraphContextMenus.tsx (Context menus)
│   └── GraphOverlays.tsx (Tetris, pending nodes, etc.)
├── hooks/
│   ├── useGraphState.ts
│   ├── useGraphHistory.ts
│   ├── useGraphPersistence.ts
│   ├── usePreviewEngine.ts
│   ├── useNodeOperations.ts
│   ├── useGraphDragDrop.ts
│   ├── useGraphIO.ts
│   ├── useKonamiCode.ts
│   └── useGraphKeyboardShortcuts.ts
└── utils/
    ├── graphValidation.ts
    ├── nodeFactory.ts
    └── edgeUtils.ts
```

## Refactoring Steps (Priority Order)

### Phase 1: Extract Custom Hooks (Low Risk)
1. **useGraphHistory** - Extract undo/redo logic
2. **useGraphPersistence** - Extract auto-save logic
3. **useKonamiCode** - Extract easter egg logic
4. **usePreviewEngine** - Extract preview logic

### Phase 2: Extract Components (Medium Risk)
5. **GraphModals** - Extract all modal components
6. **GraphContextMenus** - Extract context menu logic
7. **GraphOverlays** - Extract overlay components

### Phase 3: Core Logic Extraction (Higher Risk)
8. **useGraphState** - Centralize state management
9. **useNodeOperations** - Extract node CRUD operations
10. **useGraphDragDrop** - Extract D&D logic

### Phase 4: Final Cleanup
11. **GraphCanvas** - Create clean ReactFlow wrapper
12. **Epic1GraphEditor** - Slim down to orchestration only

## Benefits After Refactoring

1. **Maintainability**: Each file has single responsibility
2. **Testability**: Can unit test hooks independently
3. **Reusability**: Hooks can be used in other components
4. **Performance**: Smaller components re-render less
5. **Readability**: 300-line files vs 2600-line file
6. **Team Collaboration**: Multiple devs can work on different parts

## Immediate Quick Wins

### Extract These First (Easy & High Impact):
1. **useKonamiCode** (~60 lines, self-contained)
2. **useGraphHistory** (~150 lines, clear boundaries)
3. **GraphModals** (~200 lines, UI components)

### Example: useKonamiCode.ts
```typescript
import { useState, useEffect } from 'react';

export function useKonamiCode(
  onActivate: () => void,
  code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if in input field or already active
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          isActive) {
        return;
      }
      
      const newSequence = [...sequence, event.code];
      
      // Check if sequence matches
      if (newSequence.length >= code.length) {
        const lastSequence = newSequence.slice(-code.length);
        if (JSON.stringify(lastSequence) === JSON.stringify(code)) {
          setIsActive(true);
          onActivate();
          setSequence([]);
          return;
        }
      }
      
      setSequence(newSequence);
      
      // Reset if too long
      if (newSequence.length > code.length * 2) {
        setSequence([]);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sequence, isActive, code, onActivate]);

  return { isActive, setIsActive };
}
```

## Metrics to Track

- **Before**: 2,596 lines, 82 hooks, 15+ responsibilities
- **Target**: <400 lines main file, 5-8 hooks per file, 1 responsibility per file
- **Test Coverage**: Aim for 80%+ on extracted hooks

## Risk Mitigation

1. **Test First**: Write tests for current behavior before extracting
2. **Incremental**: Extract one piece at a time
3. **Feature Flag**: Keep old code available via feature flag
4. **Review**: Each extraction should be a separate PR

## Timeline Estimate

- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 3-4 days
- Phase 4: 2-3 days
- **Total: ~2 weeks for complete refactor**

## Next Steps

1. Start with `useKonamiCode` extraction (1 hour)
2. Extract `useGraphHistory` (2-3 hours)
3. Extract `GraphModals` (2-3 hours)
4. Continue with priority list...