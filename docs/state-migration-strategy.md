# State Management Migration Strategy

## Overview

REFACTOR-006 introduced a new advanced state management system, but the existing Zustand-based `graphStore` is still in use by many components. This document outlines the migration strategy.

## Current State

- **Old System**: `packages/core/graphStore.ts` (Zustand-based)
- **New System**: `packages/core/domains/graph-editor/state/GraphStateContainer.ts` (Advanced state management)
- **Components Using Old System**: 39 files identified

## Migration Bridge

Created `packages/core/state/migration/GraphStoreBridge.ts` to:

- Provide bidirectional sync between old and new state systems
- Allow gradual migration without breaking existing functionality
- Enable new components to opt into the new state system

## Migration Phases

### Phase 1: Bridge Implementation ✅ COMPLETE

- [x] Create GraphStoreBridge for compatibility
- [x] Setup bidirectional synchronization
- [x] Add migration hook for gradual adoption

### Phase 2: New Component Integration (Future)

- [ ] Update DevTools to use new state system
- [ ] Create new components using GraphStateContainer
- [ ] Test bridge functionality

### Phase 3: Gradual Migration (Future)

- [ ] Migrate high-priority components to new state system
- [ ] Update component by component to avoid breaking changes
- [ ] Maintain backward compatibility during transition

### Phase 4: Full Migration (Future)

- [ ] Complete migration of all components
- [ ] Remove old graphStore
- [ ] Remove migration bridge
- [ ] Update all tests

## Benefits of New State System

- Real-time collaboration support
- Advanced debugging and DevTools
- Performance optimizations
- Better conflict resolution
- Comprehensive state persistence

## Usage

### For Existing Components

```typescript
// Continue using existing graphStore - no changes needed
import { useGraphStore } from '@/graphStore';
```

### For New Components

```typescript
// Opt into new state system
import { useGraphStateMigration } from '@/state/migration/GraphStoreBridge';

function MyNewComponent() {
  const { stateContainer, isNewState } = useGraphStateMigration('MyNewComponent');
  // Use new state container
}
```

### For Gradual Migration

```typescript
// Migrate existing component gradually
import { useGraphStateMigration } from '@/state/migration/GraphStoreBridge';

function ExistingComponent() {
  const migration = useGraphStateMigration('ExistingComponent');

  if (migration.isNewState) {
    // Use new state container
    const { stateContainer } = migration;
  } else {
    // Use old store
    const { store } = migration;
  }
}
```

## Next Steps

1. Test the bridge implementation
2. Begin migrating DevTools components to new state system
3. Plan gradual migration of existing components
4. Monitor performance and stability during transition
