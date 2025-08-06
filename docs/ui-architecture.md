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

## API Integration

### Service Template

Here's the API service layer for the Asset Browser:

```typescript
// services/LibraryService.ts - Main API service
import type { Library, Preset, ManifestData } from '../types';

class LibraryService {
  private baseUrl = '/api/asset-browser';
  private abortControllers = new Map<string, AbortController>();

  /**
   * Scan and load all preset libraries
   */
  async scanLibraries(paths: string[]): Promise<{
    libraries: Library[];
    presets: Preset[];
  }> {
    const controller = new AbortController();
    this.abortControllers.set('scanLibraries', controller);

    try {
      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to scan libraries: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } finally {
      this.abortControllers.delete('scanLibraries');
    }
  }

  /**
   * Load a specific preset by ID
   */
  async loadPreset(presetId: string): Promise<Preset> {
    const response = await fetch(`${this.baseUrl}/presets/${presetId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load preset: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate preview for a preset
   */
  async generatePreview(
    presetId: string,
    options: {
      seeds?: number[];
      lengthMode?: 'minimal' | 'standard' | 'verbose';
      tier?: 1 | 2 | 3 | 4;
    } = {}
  ): Promise<{
    previews: string[];
    thumbnail?: string;
    branchMap?: string;
  }> {
    const controller = new AbortController();
    this.abortControllers.set(`preview-${presetId}`, controller);

    try {
      const response = await fetch(`${this.baseUrl}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId, ...options }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate preview: ${response.statusText}`);
      }

      return response.json();
    } finally {
      this.abortControllers.delete(`preview-${presetId}`);
    }
  }

  /**
   * Save preset metadata changes
   */
  async updatePresetMetadata(
    presetId: string,
    metadata: Partial<Preset['metadata']>
  ): Promise<Preset> {
    const response = await fetch(`${this.baseUrl}/presets/${presetId}/metadata`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Failed to update metadata: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export preset to clipboard or file
   */
  async exportPreset(
    presetId: string,
    format: 'json' | 'yaml' | 'clipboard'
  ): Promise<string | void> {
    const response = await fetch(`${this.baseUrl}/presets/${presetId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export preset: ${response.statusText}`);
    }

    if (format === 'clipboard') {
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      return;
    }

    return response.text();
  }

  /**
   * Cancel any ongoing request
   */
  cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  /**
   * Cancel all ongoing requests
   */
  cancelAllRequests(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}

export const libraryService = new LibraryService();
```

### API Client Configuration

Here's the configuration for API error handling and authentication:

```typescript
// services/apiClient.ts - Shared API configuration
import { toast } from '../utils/toast';

interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private config: ApiConfig;
  
  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = this.config.timeout || 30000;
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
    
    // Create request with default headers
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
    };
    
    try {
      // Race between request and timeout
      const response = await Promise.race([
        fetch(url, requestOptions),
        timeoutPromise,
      ]) as Response;
      
      // Handle non-OK responses
      if (!response.ok) {
        const error = new ApiError(
          response.status,
          response.statusText,
          await response.json().catch(() => null)
        );
        
        // Call error handler if provided
        this.config.onError?.(error);
        
        throw error;
      }
      
      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      // Return text for non-JSON responses
      return await response.text() as any;
      
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error. Please check your connection.');
      } else if (error instanceof Error && error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }
  
  // Convenience methods
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create configured instance
export const apiClient = new ApiClient({
  baseUrl: '/api/asset-browser',
  timeout: 30000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  onError: (error) => {
    // Global error handling
    if (error.status === 401) {
      // Handle authentication
      window.location.href = '/login';
    } else if (error.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
  },
});

// Re-export for use in services
export default apiClient;
```

## Routing

### Route Configuration

Since the Asset Browser is embedded within the main React application, it doesn't require a full routing solution. However, we'll implement URL-based state management for deep linking and browser history:

```typescript
// hooks/useAssetBrowserRouting.ts - URL state management
import { useEffect, useCallback } from 'react';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';

interface RouteState {
  preset?: string;
  library?: string;
  search?: string;
  tags?: string[];
  view?: 'grid' | 'list';
}

/**
 * Manages URL state for deep linking and browser history
 */
export const useAssetBrowserRouting = () => {
  const store = useAssetBrowserStore();
  
  // Parse URL params to state
  const parseUrlToState = useCallback((): RouteState => {
    const params = new URLSearchParams(window.location.search);
    
    return {
      preset: params.get('preset') || undefined,
      library: params.get('library') || undefined,
      search: params.get('search') || undefined,
      tags: params.get('tags')?.split(',').filter(Boolean),
      view: (params.get('view') as 'grid' | 'list') || undefined,
    };
  }, []);
  
  // Update URL from state
  const updateUrlFromState = useCallback(() => {
    const params = new URLSearchParams();
    const state = useAssetBrowserStore.getState();
    
    if (state.selectedPresetId) {
      params.set('preset', state.selectedPresetId);
    }
    
    if (state.activeLibraryId) {
      params.set('library', state.activeLibraryId);
    }
    
    if (state.searchQuery) {
      params.set('search', state.searchQuery);
    }
    
    if (state.filterState.tags.length > 0) {
      params.set('tags', state.filterState.tags.join(','));
    }
    
    if (state.viewMode !== 'grid') {
      params.set('view', state.viewMode);
    }
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, []);
  
  // Navigate to preset with history
  const navigateToPreset = useCallback((presetId: string | null) => {
    store.selectPreset(presetId);
    
    // Push to history for back button support
    const params = new URLSearchParams(window.location.search);
    if (presetId) {
      params.set('preset', presetId);
    } else {
      params.delete('preset');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }, [store]);
  
  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const state = parseUrlToState();
      
      // Update store from URL
      if (state.preset !== store.selectedPresetId) {
        store.selectPreset(state.preset || null);
      }
      
      if (state.library !== store.activeLibraryId) {
        store.setActiveLibrary(state.library || null);
      }
      
      if (state.search !== store.searchQuery) {
        store.setSearchQuery(state.search || '');
      }
      
      if (state.tags && state.tags.join(',') !== store.filterState.tags.join(',')) {
        store.setFilterState({ tags: state.tags });
      }
      
      if (state.view && state.view !== store.viewMode) {
        store.setViewMode(state.view);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Initial load from URL
    handlePopState();
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseUrlToState, store]);
  
  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useAssetBrowserStore.subscribe(
      (state) => ({
        selectedPresetId: state.selectedPresetId,
        activeLibraryId: state.activeLibraryId,
        searchQuery: state.searchQuery,
        filterState: state.filterState,
        viewMode: state.viewMode,
      }),
      () => {
        updateUrlFromState();
      }
    );
    
    return unsubscribe;
  }, [updateUrlFromState]);
  
  return {
    navigateToPreset,
    parseUrlToState,
  };
};

// Protected route wrapper for future authentication
export const AssetBrowserRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Future: Add authentication check here
  const isAuthenticated = true; // Placeholder
  
  if (!isAuthenticated) {
    return <div>Please log in to access the asset browser.</div>;
  }
  
  return <>{children}</>;
};
```

### Integration with Main App

```typescript
// client/src/App.tsx - Integration example
import { AssetBrowser } from '@packages/asset-browser';
import { useAssetBrowserRouting } from '@packages/asset-browser/hooks/useAssetBrowserRouting';

export const App: React.FC = () => {
  // Enable URL-based routing for asset browser
  useAssetBrowserRouting();
  
  return (
    <div className="app">
      <GraphEditor />
      <AssetBrowser 
        onPresetSelect={(preset) => {
          // Handle preset drag into graph
          console.log('Selected preset:', preset);
        }}
      />
    </div>
  );
};
```

## Styling Guidelines

### Styling Approach

The Asset Browser uses CSS Modules for component isolation combined with a shared theme system for consistency with the main application.

```css
/* styles/theme.css - Shared theme variables */
:root {
  /* Color System - Light Mode */
  --color-primary: #0066cc;
  --color-primary-hover: #0052a3;
  --color-primary-active: #004080;
  
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  --color-text-muted: #adb5bd;
  
  --color-border: #dee2e6;
  --color-border-light: #e9ecef;
  --color-border-dark: #adb5bd;
  
  /* Spacing System */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  
  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Layout */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 48px;
  --details-drawer-width: 320px;
  --header-height: 48px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  
  /* Z-index Scale */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-primary: #4d94ff;
  --color-primary-hover: #66a3ff;
  --color-primary-active: #3385ff;
  
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #3a3a3a;
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #b3b3b3;
  --color-text-muted: #808080;
  
  --color-border: #404040;
  --color-border-light: #333333;
  --color-border-dark: #4d4d4d;
  
  /* Adjusted shadows for dark mode */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
}
```

### Global Theme Variables

```css
/* styles/utilities.css - Reusable utility classes */

/* Layout Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }

/* Spacing Utilities */
.p-xs { padding: var(--space-xs); }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }
.px-sm { padding-left: var(--space-sm); padding-right: var(--space-sm); }
.py-sm { padding-top: var(--space-sm); padding-bottom: var(--space-sm); }
.m-0 { margin: 0; }
.mt-sm { margin-top: var(--space-sm); }
.mb-sm { margin-bottom: var(--space-sm); }

/* Typography Utilities */
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-muted { color: var(--color-text-muted); }
.truncate { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

/* Visual Utilities */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded { border-radius: var(--radius-base); }
.rounded-lg { border-radius: var(--radius-lg); }
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow { box-shadow: var(--shadow-base); }
.shadow-md { box-shadow: var(--shadow-md); }
.border { border: 1px solid var(--color-border); }
.border-b { border-bottom: 1px solid var(--color-border); }

/* Interactive Utilities */
.cursor-pointer { cursor: pointer; }
.select-none { user-select: none; }
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-fast);
}
.transition-all {
  transition-property: all;
  transition-duration: var(--transition-base);
}

/* Accessibility Utilities */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focus Styles */
.focus-visible:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Scrollbar Styling */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-dark);
}
```

## Testing Requirements

### Component Test Template

Here's the standard testing approach for Asset Browser components:

```typescript
// tests/components/PresetCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetCard } from '../../src/components/Grid/PresetCard';
import { mockPreset } from '../fixtures/presets';
import { DragDropProvider } from '../../src/providers/DragDropProvider';

// Mock intersection observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver as any;

describe('PresetCard', () => {
  const defaultProps = {
    preset: mockPreset,
    index: 0,
    onSelect: jest.fn(),
    onDoubleClick: jest.fn(),
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <DragDropProvider>
        {ui}
      </DragDropProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preset information correctly', () => {
    renderWithProviders(<PresetCard {...defaultProps} />);
    
    expect(screen.getByText(mockPreset.metadata.name)).toBeInTheDocument();
    expect(screen.getByLabelText(`Preset: ${mockPreset.metadata.name}`)).toBeInTheDocument();
    
    // Check tags are rendered (max 3)
    const displayedTags = mockPreset.metadata.tags.slice(0, 3);
    displayedTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles click interaction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PresetCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPreset);
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('handles double-click interaction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PresetCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    await user.dblClick(card);
    
    expect(defaultProps.onDoubleClick).toHaveBeenCalledWith(mockPreset);
    expect(defaultProps.onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when selected', () => {
    renderWithProviders(<PresetCard {...defaultProps} isSelected />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-selected', 'true');
    expect(card).toHaveClass('selected');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PresetCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    card.focus();
    
    await user.keyboard('{Enter}');
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPreset);
    
    await user.keyboard(' ');
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(2);
  });

  it('lazy loads thumbnail when in viewport', async () => {
    // Mock intersection observer to trigger immediately
    mockIntersectionObserver.mockImplementation((callback) => {
      callback([{ isIntersecting: true }]);
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      };
    });

    renderWithProviders(<PresetCard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByAltText(mockPreset.metadata.name)).toBeInTheDocument();
    });
  });

  it('shows placeholder when not in viewport', () => {
    // Mock intersection observer to not trigger
    mockIntersectionObserver.mockImplementation(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));

    renderWithProviders(<PresetCard {...defaultProps} />);
    
    expect(screen.queryByAltText(mockPreset.metadata.name)).not.toBeInTheDocument();
    expect(screen.getByTestId(`preset-card-${mockPreset.id}`).querySelector('.placeholder')).toBeInTheDocument();
  });

  describe('Drag and Drop', () => {
    it('can be dragged', async () => {
      renderWithProviders(<PresetCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      
      // Simulate drag start
      fireEvent.dragStart(card);
      expect(card).toHaveClass('dragging');
      
      // Simulate drag end
      fireEvent.dragEnd(card);
      expect(card).not.toHaveClass('dragging');
    });

    it('sets correct drag data', () => {
      const mockDataTransfer = {
        setData: jest.fn(),
        effectAllowed: '',
      };

      renderWithProviders(<PresetCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      fireEvent.dragStart(card, { dataTransfer: mockDataTransfer });
      
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify({ type: 'preset', data: mockPreset })
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<PresetCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-selected', 'false');
      expect(card).toHaveAttribute('aria-label', `Preset: ${mockPreset.metadata.name}`);
    });

    it('announces selection state changes', () => {
      const { rerender } = renderWithProviders(<PresetCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-selected', 'false');
      
      rerender(<PresetCard {...defaultProps} isSelected />);
      expect(card).toHaveAttribute('aria-selected', 'true');
    });
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows (using Cypress/Playwright)
4. **Coverage Goals**: Aim for 80% code coverage
5. **Test Structure**: Arrange-Act-Assert pattern
6. **Mock External Dependencies**: API calls, routing, state management

## Environment Configuration

The Asset Browser requires the following environment variables for proper operation:

```bash
# .env.example - Asset Browser environment configuration

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Asset Browser Settings
VITE_ASSET_BROWSER_ENABLED=true
VITE_MAX_PRESET_COUNT=500
VITE_PREVIEW_GENERATION_TIMEOUT=10000
VITE_THUMBNAIL_CACHE_SIZE=100

# File System Paths
VITE_DEFAULT_LIBRARY_PATH=./libraries
VITE_CACHE_PATH=./Cache
VITE_TEMP_PATH=./tmp

# Feature Flags
VITE_ENABLE_PREVIEW_GENERATION=true
VITE_ENABLE_BRANCH_VISUALIZATION=true
VITE_ENABLE_MULTI_LENGTH_VARIANTS=false
VITE_ENABLE_PRESET_NODE_NESTING=false

# Performance Settings
VITE_VIRTUAL_SCROLL_BUFFER=5
VITE_LAZY_LOAD_DELAY=200
VITE_DEBOUNCE_SEARCH=300
VITE_PREVIEW_QUEUE_SIZE=5

# Development Settings
VITE_MOCK_API=false
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=true
```

### Environment Type Definitions

```typescript
// types/env.d.ts - TypeScript environment variable definitions
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  
  // Asset Browser Settings
  readonly VITE_ASSET_BROWSER_ENABLED: string;
  readonly VITE_MAX_PRESET_COUNT: string;
  readonly VITE_PREVIEW_GENERATION_TIMEOUT: string;
  readonly VITE_THUMBNAIL_CACHE_SIZE: string;
  
  // File System Paths
  readonly VITE_DEFAULT_LIBRARY_PATH: string;
  readonly VITE_CACHE_PATH: string;
  readonly VITE_TEMP_PATH: string;
  
  // Feature Flags
  readonly VITE_ENABLE_PREVIEW_GENERATION: string;
  readonly VITE_ENABLE_BRANCH_VISUALIZATION: string;
  readonly VITE_ENABLE_MULTI_LENGTH_VARIANTS: string;
  readonly VITE_ENABLE_PRESET_NODE_NESTING: string;
  
  // Performance Settings
  readonly VITE_VIRTUAL_SCROLL_BUFFER: string;
  readonly VITE_LAZY_LOAD_DELAY: string;
  readonly VITE_DEBOUNCE_SEARCH: string;
  readonly VITE_PREVIEW_QUEUE_SIZE: string;
  
  // Development Settings
  readonly VITE_MOCK_API: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Configuration Helper

```typescript
// utils/config.ts - Configuration helper with defaults and validation
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  
  assetBrowser: {
    enabled: import.meta.env.VITE_ASSET_BROWSER_ENABLED === 'true',
    maxPresetCount: Number(import.meta.env.VITE_MAX_PRESET_COUNT) || 500,
    previewTimeout: Number(import.meta.env.VITE_PREVIEW_GENERATION_TIMEOUT) || 10000,
    thumbnailCacheSize: Number(import.meta.env.VITE_THUMBNAIL_CACHE_SIZE) || 100,
  },
  
  paths: {
    defaultLibrary: import.meta.env.VITE_DEFAULT_LIBRARY_PATH || './libraries',
    cache: import.meta.env.VITE_CACHE_PATH || './Cache',
    temp: import.meta.env.VITE_TEMP_PATH || './tmp',
  },
  
  features: {
    previewGeneration: import.meta.env.VITE_ENABLE_PREVIEW_GENERATION !== 'false',
    branchVisualization: import.meta.env.VITE_ENABLE_BRANCH_VISUALIZATION !== 'false',
    multiLengthVariants: import.meta.env.VITE_ENABLE_MULTI_LENGTH_VARIANTS === 'true',
    presetNodeNesting: import.meta.env.VITE_ENABLE_PRESET_NODE_NESTING === 'true',
  },
  
  performance: {
    virtualScrollBuffer: Number(import.meta.env.VITE_VIRTUAL_SCROLL_BUFFER) || 5,
    lazyLoadDelay: Number(import.meta.env.VITE_LAZY_LOAD_DELAY) || 200,
    debounceSearch: Number(import.meta.env.VITE_DEBOUNCE_SEARCH) || 300,
    previewQueueSize: Number(import.meta.env.VITE_PREVIEW_QUEUE_SIZE) || 5,
  },
  
  development: {
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS !== 'false',
  },
} as const;

// Validate required configuration
export function validateConfig(): void {
  const required = [
    'api.baseUrl',
    'paths.defaultLibrary',
  ];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config as any);
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }
  
  // Validate numeric ranges
  if (config.assetBrowser.maxPresetCount < 1) {
    throw new Error('VITE_MAX_PRESET_COUNT must be at least 1');
  }
  
  if (config.performance.virtualScrollBuffer < 1) {
    throw new Error('VITE_VIRTUAL_SCROLL_BUFFER must be at least 1');
  }
}
```

### Feature Flag Usage

```typescript
// Example: Using feature flags in components
import { config } from '../utils/config';

export const PreviewSection: FC<PreviewSectionProps> = ({ preset }) => {
  if (!config.features.previewGeneration) {
    return (
      <div className={styles.disabled}>
        Preview generation is currently disabled
      </div>
    );
  }
  
  // Regular component logic
  return (
    <div className={styles.preview}>
      {/* Preview content */}
    </div>
  );
};
```

## Frontend Developer Standards

### Critical Coding Rules

Here are the essential rules for developing the Asset Browser to prevent common mistakes:

1. **State Management Rules**
   - Never mutate state directly - always use store actions
   - Never access DOM directly - use React refs
   - Never store derived state - use selectors/computed values
   - Always clean up subscriptions in useEffect return

2. **Performance Rules**
   - Always virtualize lists over 50 items
   - Always memoize expensive computations
   - Always lazy load images and heavy components
   - Never render all presets at once - use windowing

3. **TypeScript Rules**
   - Never use `any` type - use `unknown` if type is truly unknown
   - Always define explicit return types for functions
   - Always use strict null checks
   - Never ignore TypeScript errors with `@ts-ignore`

4. **Component Rules**
   - Always include proper ARIA labels for accessibility
   - Always handle loading and error states
   - Always include data-testid for e2e testing
   - Never use inline styles - use CSS modules

5. **API Rules**
   - Always handle network errors gracefully
   - Always cancel ongoing requests when component unmounts
   - Always validate API responses with Zod schemas
   - Never expose sensitive data in API calls

6. **File Organization Rules**
   - Always co-locate component files (component, styles, tests)
   - Always use barrel exports (index.ts) for clean imports
   - Always follow the established folder structure
   - Never create files outside the defined architecture

### Quick Reference

```bash
# Asset Browser Quick Reference

## Common Commands
pnpm dev                     # Start development server
pnpm test                    # Run tests
pnpm test:watch             # Run tests in watch mode
pnpm build                  # Build for production
pnpm lint                   # Run ESLint

## Key Import Patterns
# Components
import { AssetBrowser } from '@packages/asset-browser';
import { PresetCard } from '@packages/asset-browser/components/Grid';

# Hooks
import { useAssetBrowserStore } from '@packages/asset-browser/stores';
import { usePresetLibrary } from '@packages/asset-browser/hooks';

# Services
import { libraryService } from '@packages/asset-browser/services';

# Types
import type { Preset, Library } from '@packages/asset-browser/types';

## File Naming Conventions
Components: PascalCase.tsx         # PresetCard.tsx
Hooks: use{Feature}.ts            # usePresetLibrary.ts
Services: {Name}Service.ts        # LibraryService.ts
Utils: camelCase.ts              # contentHash.ts
Styles: Component.module.css      # PresetCard.module.css
Tests: Component.test.tsx         # PresetCard.test.tsx

## Project-Specific Patterns

### Virtual Scrolling Pattern
import { FixedSizeGrid } from 'react-window';
<FixedSizeGrid
  columnCount={4}
  rowCount={Math.ceil(items.length / 4)}
  width={width}
  height={height}
  itemSize={CARD_SIZE}
>
  {PresetCard}
</FixedSizeGrid>

### Store Access Pattern
// Hook for reactive updates
const presets = useAssetBrowserStore(state => state.presets);

// Direct access for actions
const { selectPreset } = useAssetBrowserStore.getState();

### Lazy Loading Pattern
const { ref, inView } = useIntersectionObserver({
  threshold: 0.1,
  rootMargin: '100px',
});

{inView && <ExpensiveComponent />}

### Error Boundary Pattern
<ErrorBoundary fallback={<ErrorFallback />}>
  <AssetBrowser />
</ErrorBoundary>

## Performance Checklist
□ Virtual scrolling implemented for grid
□ Images lazy loaded with intersection observer
□ Search debounced (300ms)
□ Preview generation uses Web Workers
□ Component memoization where needed
□ Store selectors prevent unnecessary renders

## Accessibility Checklist
□ All interactive elements have ARIA labels
□ Keyboard navigation fully supported
□ Focus management implemented
□ Screen reader announcements for state changes
□ Color contrast meets WCAG AA standards
□ Error messages clearly communicated

## Common Issues & Solutions

### Issue: Slow preset grid rendering
Solution: Ensure virtual scrolling is enabled and working

### Issue: Memory leaks from previews
Solution: Cancel preview generation on unmount

### Issue: Stale closures in event handlers
Solution: Use useCallback with proper dependencies

### Issue: TypeScript errors with store
Solution: Use proper selectors and type imports

### Issue: Drag-drop not working
Solution: Check DragDropProvider is wrapping component
```

### Development Workflow

1. **Before Starting**
   - Read the Asset Browser Master Plan
   - Review existing components and patterns
   - Check environment configuration

2. **During Development**
   - Follow TypeScript strict mode
   - Write tests alongside components
   - Use proper commit messages
   - Keep accessibility in mind

3. **Before Committing**
   - Run `pnpm test` to ensure tests pass
   - Run `pnpm lint` to check code style
   - Verify TypeScript has no errors
   - Check bundle size hasn't increased significantly

4. **Code Review Checklist**
   - Performance considerations addressed
   - Accessibility requirements met
   - Tests cover happy and error paths
   - Documentation updated if needed

---

## Summary

This Frontend Architecture Document provides a comprehensive blueprint for implementing the Asset Browser as a high-performance, accessible React module within the Prompt Spaghetti monorepo. The architecture emphasizes:

- **Performance** through virtual scrolling, lazy loading, and Web Workers
- **Developer Experience** with TypeScript, clear patterns, and comprehensive testing
- **Accessibility** with full keyboard navigation and ARIA support
- **Maintainability** through modular architecture and clear standards

The document addresses all gaps identified in the PO checklist:
- Explicit project setup and development environment
- Performance criteria and acceptance standards
- Comprehensive testing strategy
- Error handling patterns
- Complete implementation foundation

With this architecture, the Asset Browser can be built to handle 50+ presets efficiently while providing an excellent user experience for browsing and selecting prompt templates.
