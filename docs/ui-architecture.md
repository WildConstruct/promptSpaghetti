# Asset Browser Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-05 | 1.0 | Initial architecture document | Sarah (PO) |

## Template and Framework Selection

### Decision: React Module with Progressive Enhancement

After thorough analysis, the Asset Browser will be built as a **semi-independent React module** within the existing Prompt Spaghetti monorepo structure. This approach balances integration needs with performance requirements.

### Architecture Pattern: Embedded with Standalone Capability

```
prompt-spaghetti/
├── packages/
│   ├── asset-browser/          # New semi-independent module
│   │   ├── src/
│   │   │   ├── components/     # Browser-specific components
│   │   │   ├── hooks/          # Browser-specific hooks
│   │   │   ├── services/       # File handling, preview generation
│   │   │   └── index.tsx       # Main export with standalone mode
│   │   └── package.json        # Own dependencies
│   └── core/                   # Shared with main app
└── client/                     # Main app integrates browser
```

### Key Design Decisions

1. **Semi-Independent Module**
   - Can run standalone for testing/development
   - Integrates seamlessly into main React app
   - Own package.json for browser-specific deps

2. **Performance-First Design**
   - Virtual scrolling from day one (react-window)
   - Web Worker preview generation
   - Progressive thumbnail loading
   - Content-hash based caching

3. **Integration Strategy**
   - Shared React/TypeScript stack
   - Common build pipeline (Vite)
   - Unified theme system
   - React Flow drag-drop integration

### Constraints & Requirements

- Must handle 50+ presets with <500ms render time
- Keyboard navigation required (↑↓, hjkl vim-style)
- Drag-drop into React Flow canvas
- File operations via server API (no direct FS access)
- Progressive enhancement for preview tiers

### Framework Rationale

**Why React:**
- Seamless integration with existing React Flow editor
- Shared component libraries and utilities
- Consistent developer experience
- Mature ecosystem for virtual scrolling

**Why Semi-Independent:**
- Allows standalone testing and development
- Enables future extraction if needed
- Isolates browser-specific dependencies
- Supports "side-car first" principle from plan

**Why Not Alternatives:**
- Web Components: Complex React Flow integration
- Separate framework: Maintenance overhead
- Electron: Deployment complexity
- PWA: Unnecessary for embedded use case

## Frontend Tech Stack

Based on the framework decision and requirements from the Asset Browser plan, here's the technology stack:

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|----------|-----------|
| Framework | React | 18.x | UI framework | Consistency with main app, excellent ecosystem |
| UI Library | React Flow | 11.x | Graph integration | Already in use, drag-drop target |
| State Management | Zustand | 4.x | Browser state | Lightweight, TypeScript-first, already in codebase |
| Routing | None | - | Single-view component | Browser is embedded, no routing needed |
| Build Tool | Vite | 5.x | Fast bundling | Already in monorepo, excellent DX |
| Styling | CSS Modules + Theme | - | Scoped styles | Isolation from main app, theme sharing |
| Testing | Jest + RTL | 29.x | Unit/integration tests | Established in monorepo |
| Component Library | Custom + Radix UI | 1.x | Accessible primitives | Lightweight, unstyled, accessible |
| Form Handling | Native + Zod | 3.x | Search/filter forms | Minimal forms, Zod already used |
| Animation | CSS + Framer Motion | 11.x | Smooth interactions | Drag animations, drawer transitions |
| Dev Tools | React DevTools + Vite | Latest | Development efficiency | Standard React tooling |

### Additional Browser-Specific Dependencies

- **react-window** (1.8.x) - Virtual scrolling for preset grid
- **comlink** (4.x) - Web Worker communication for previews  
- **fuse.js** (7.x) - Fuzzy search for presets
- **react-intersection-observer** (9.x) - Lazy loading thumbnails
- **@dnd-kit/sortable** (8.x) - Accessible drag-drop

## Project Structure

Here's the detailed directory structure for the Asset Browser module, following React best practices and the monorepo architecture:

```plaintext
packages/asset-browser/
├── src/
│   ├── components/
│   │   ├── AssetBrowser/
│   │   │   ├── AssetBrowser.tsx         # Main container component
│   │   │   ├── AssetBrowser.module.css  # Container styles
│   │   │   └── index.ts                 # Public exports
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx              # Library navigation
│   │   │   ├── LibraryTree.tsx          # Folder tree component
│   │   │   ├── TagFilter.tsx            # Tag filtering UI
│   │   │   └── Sidebar.module.css
│   │   ├── Grid/
│   │   │   ├── PresetGrid.tsx           # Virtual scrolling grid
│   │   │   ├── PresetCard.tsx           # Individual preset card
│   │   │   ├── GridPlaceholder.tsx      # Loading states
│   │   │   └── Grid.module.css
│   │   ├── DetailsDrawer/
│   │   │   ├── DetailsDrawer.tsx        # Preset details panel
│   │   │   ├── PreviewSection.tsx       # Preview samples
│   │   │   ├── MetadataEditor.tsx       # Edit preset metadata
│   │   │   ├── BranchVisualization.tsx  # Tier-4 branch map
│   │   │   └── DetailsDrawer.module.css
│   │   └── common/
│   │       ├── DragPreview.tsx          # Drag ghost image
│   │       ├── KeyboardNavigator.tsx    # Keyboard nav provider
│   │       ├── ThumbnailLoader.tsx      # Lazy image loader
│   │       └── SearchInput.tsx          # Reusable search field
│   ├── hooks/
│   │   ├── usePresetLibrary.ts          # Main data hook
│   │   ├── useVirtualGrid.ts            # Virtual scroll logic
│   │   ├── useDragDrop.ts               # D&D integration
│   │   ├── useKeyboardNav.ts            # Keyboard shortcuts
│   │   ├── usePreviewGenerator.ts       # Worker communication
│   │   └── useThumbnailCache.ts         # Cache management
│   ├── services/
│   │   ├── LibraryService.ts            # File operations
│   │   ├── PreviewService.ts            # Preview generation
│   │   ├── ManifestParser.ts            # .psgmanifest parsing
│   │   ├── PresetValidator.ts           # .psglib validation
│   │   └── workers/
│   │       ├── preview.worker.ts        # Preview generation
│   │       └── thumbnail.worker.ts      # Thumbnail generation
│   ├── stores/
│   │   ├── assetBrowserStore.ts         # Zustand store
│   │   └── preferencesStore.ts          # User preferences
│   ├── types/
│   │   ├── preset.types.ts              # Preset interfaces
│   │   ├── library.types.ts             # Library types
│   │   └── index.ts                     # Type exports
│   ├── utils/
│   │   ├── contentHash.ts               # Hash generation
│   │   ├── presetSearch.ts              # Fuse.js setup
│   │   ├── filePathUtils.ts             # Path helpers
│   │   └── dragDropHelpers.ts           # D&D utilities
│   ├── styles/
│   │   ├── theme.css                    # Theme variables
│   │   ├── animations.css               # Reusable animations
│   │   └── utilities.css                # Utility classes
│   └── index.tsx                        # Main export
├── tests/
│   ├── components/                      # Component tests
│   ├── hooks/                           # Hook tests
│   ├── services/                        # Service tests
│   └── integration/                     # E2E tests
├── public/
│   └── icons/                           # Node type icons
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Key Architectural Decisions:

1. **Module Structure**: Self-contained package in monorepo
2. **Component Organization**: Feature-based folders with co-located styles
3. **Service Layer**: Separates business logic from UI components
4. **Worker Isolation**: CPU-intensive tasks in Web Workers
5. **Type Safety**: Dedicated types directory for shared interfaces
6. **Test Organization**: Mirrors src structure for easy navigation

## Component Standards

### Component Template

Here's the standard component template for the Asset Browser, following React 18 best practices with TypeScript:

```typescript
// PresetCard.tsx - Example component following standards
import { memo, useCallback, useRef, type FC } from 'react';
import { useIntersectionObserver } from 'react-intersection-observer';
import type { Preset } from '../../types';
import { ThumbnailLoader } from '../common/ThumbnailLoader';
import { useDragDrop } from '../../hooks/useDragDrop';
import styles from './PresetCard.module.css';

interface PresetCardProps {
  preset: Preset;
  isSelected?: boolean;
  onSelect?: (preset: Preset) => void;
  onDoubleClick?: (preset: Preset) => void;
  index: number; // For virtual scrolling
}

export const PresetCard: FC<PresetCardProps> = memo(({
  preset,
  isSelected = false,
  onSelect,
  onDoubleClick,
  index
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  const { isDragging, dragProps } = useDragDrop({
    type: 'preset',
    data: preset,
    preview: preset.metadata.thumbnail
  });

  const handleClick = useCallback(() => {
    onSelect?.(preset);
  }, [preset, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(preset);
  }, [preset, onDoubleClick]);

  // Merge refs for intersection observer and drag
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    inViewRef(node);
  }, [inViewRef]);

  return (
    <div
      ref={setRefs}
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Preset: ${preset.metadata.name}`}
      data-testid={`preset-card-${preset.id}`}
      {...dragProps}
    >
      {inView ? (
        <>
          <ThumbnailLoader
            src={preset.metadata.thumbnail}
            alt={preset.metadata.name}
            fallback="word-cloud"
          />
          <div className={styles.info}>
            <h3 className={styles.name}>{preset.metadata.name}</h3>
            <div className={styles.tags}>
              {preset.metadata.tags.slice(0, 3).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.placeholder} />
      )}
    </div>
  );
});

PresetCard.displayName = 'PresetCard';
```

### Naming Conventions

**Files & Folders:**
- Components: `PascalCase.tsx` (e.g., `PresetCard.tsx`)
- Hooks: `camelCase.ts` starting with `use` (e.g., `usePresetLibrary.ts`)
- Services: `PascalCase.ts` with `Service` suffix (e.g., `LibraryService.ts`)
- Utils: `camelCase.ts` (e.g., `contentHash.ts`)
- Styles: `PascalCase.module.css` for components
- Types: `camelCase.types.ts` for domain types

**Code Conventions:**
- Interfaces: `PascalCase` with descriptive names (e.g., `PresetCardProps`)
- Types: `PascalCase` for unions/aliases (e.g., `PresetType`)
- Enums: `PascalCase` with `UPPER_SNAKE` values
- Constants: `UPPER_SNAKE_CASE` for exports
- Functions: `camelCase` with verb prefixes (`handleClick`, `fetchPresets`)

**Component Patterns:**
- Always use `FC<Props>` for type annotations
- Always export named exports (no default exports)
- Always include `displayName` for debugging
- Always wrap in `memo` when appropriate
- Always include data-testid for testing
- Always include proper ARIA attributes

## State Management

### Store Structure

The Asset Browser uses Zustand for state management, organized into domain-specific stores:

```plaintext
stores/
├── assetBrowserStore.ts    # Main browser state
├── preferencesStore.ts     # User preferences
└── types/
    └── store.types.ts      # Store interfaces
```

### State Management Template

Here's the main asset browser store implementation:

```typescript
// assetBrowserStore.ts - Main state management
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Preset, Library, FilterState } from '../types';

interface AssetBrowserState {
  // Data
  libraries: Library[];
  presets: Preset[];
  selectedPresetId: string | null;
  loadingState: 'idle' | 'loading' | 'error';
  error: string | null;
  
  // UI State
  sidebarCollapsed: boolean;
  detailsDrawerOpen: boolean;
  viewMode: 'grid' | 'list';
  
  // Filtering & Search
  filterState: FilterState;
  searchQuery: string;
  activeLibraryId: string | null;
  
  // Caching
  thumbnailCache: Map<string, string>;
  previewCache: Map<string, string[]>;
  
  // Actions
  loadLibraries: () => Promise<void>;
  selectPreset: (presetId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filters: Partial<FilterState>) => void;
  toggleSidebar: () => void;
  toggleDetailsDrawer: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Cache Management
  cacheThumbnail: (presetId: string, dataUrl: string) => void;
  cachePreview: (presetId: string, previews: string[]) => void;
  
  // Keyboard Navigation
  navigatePresets: (direction: 'up' | 'down' | 'left' | 'right') => void;
  
  // Computed Values (via selectors)
  getFilteredPresets: () => Preset[];
  getSelectedPreset: () => Preset | null;
}

export const useAssetBrowserStore = create<AssetBrowserState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial State
      libraries: [],
      presets: [],
      selectedPresetId: null,
      loadingState: 'idle',
      error: null,
      sidebarCollapsed: false,
      detailsDrawerOpen: false,
      viewMode: 'grid',
      filterState: {
        tags: [],
        nodeTypes: [],
        authors: [],
        dateRange: null,
      },
      searchQuery: '',
      activeLibraryId: null,
      thumbnailCache: new Map(),
      previewCache: new Map(),
      
      // Actions
      loadLibraries: async () => {
        set((state) => {
          state.loadingState = 'loading';
          state.error = null;
        });
        
        try {
          const response = await fetch('/api/asset-browser/libraries');
          const data = await response.json();
          
          set((state) => {
            state.libraries = data.libraries;
            state.presets = data.presets;
            state.loadingState = 'idle';
          });
        } catch (error) {
          set((state) => {
            state.loadingState = 'error';
            state.error = error instanceof Error ? error.message : 'Failed to load libraries';
          });
        }
      },
      
      selectPreset: (presetId) => {
        set((state) => {
          state.selectedPresetId = presetId;
          state.detailsDrawerOpen = presetId !== null;
        });
      },
      
      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query;
        });
      },
      
      setFilterState: (filters) => {
        set((state) => {
          state.filterState = { ...state.filterState, ...filters };
        });
      },
      
      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        });
      },
      
      toggleDetailsDrawer: () => {
        set((state) => {
          state.detailsDrawerOpen = !state.detailsDrawerOpen;
        });
      },
      
      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
        });
      },
      
      cacheThumbnail: (presetId, dataUrl) => {
        set((state) => {
          state.thumbnailCache.set(presetId, dataUrl);
        });
      },
      
      cachePreview: (presetId, previews) => {
        set((state) => {
          state.previewCache.set(presetId, previews);
        });
      },
      
      navigatePresets: (direction) => {
        const state = get();
        const filteredPresets = state.getFilteredPresets();
        const currentIndex = filteredPresets.findIndex(p => p.id === state.selectedPresetId);
        
        if (currentIndex === -1 && filteredPresets.length > 0) {
          state.selectPreset(filteredPresets[0].id);
          return;
        }
        
        const gridCols = state.viewMode === 'grid' ? 4 : 1; // Assuming 4 columns
        let newIndex = currentIndex;
        
        switch (direction) {
          case 'up':
            newIndex = Math.max(0, currentIndex - gridCols);
            break;
          case 'down':
            newIndex = Math.min(filteredPresets.length - 1, currentIndex + gridCols);
            break;
          case 'left':
            newIndex = Math.max(0, currentIndex - 1);
            break;
          case 'right':
            newIndex = Math.min(filteredPresets.length - 1, currentIndex + 1);
            break;
        }
        
        if (newIndex !== currentIndex && filteredPresets[newIndex]) {
          state.selectPreset(filteredPresets[newIndex].id);
        }
      },
      
      // Computed Values
      getFilteredPresets: () => {
        const state = get();
        return state.presets.filter(preset => {
          // Search query
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            const matchesSearch = 
              preset.metadata.name.toLowerCase().includes(query) ||
              preset.metadata.tags.some(tag => tag.toLowerCase().includes(query));
            if (!matchesSearch) return false;
          }
          
          // Tag filters
          if (state.filterState.tags.length > 0) {
            const hasTag = state.filterState.tags.some(tag => 
              preset.metadata.tags.includes(tag)
            );
            if (!hasTag) return false;
          }
          
          // Library filter
          if (state.activeLibraryId && preset.libraryId !== state.activeLibraryId) {
            return false;
          }
          
          return true;
        });
      },
      
      getSelectedPreset: () => {
        const state = get();
        return state.presets.find(p => p.id === state.selectedPresetId) || null;
      },
    }))
  )
);

// Selectors for performance
export const useFilteredPresets = () => 
  useAssetBrowserStore(state => state.getFilteredPresets());

export const useSelectedPreset = () => 
  useAssetBrowserStore(state => state.getSelectedPreset());

// Subscribe to specific state slices
export const useSearchQuery = () => 
  useAssetBrowserStore(state => state.searchQuery);
```
