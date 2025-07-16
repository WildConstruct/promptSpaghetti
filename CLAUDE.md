# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `pnpm install` - Install dependencies for all workspaces
- `pnpm dev` - Start client (port 3000) and server (port 8000)
- `pnpm --filter client dev` - Start only the React client
- `pnpm --filter server dev` - Start only the Fastify server

### Testing
- `pnpm test` - Run all Jest tests with coverage
- `pnpm test -- --coverage` - Run tests with detailed coverage report
- `pnpm test -- --watch` - Run tests in watch mode
- `pnpm test --testPathPattern="ComponentName"` - Run specific component tests
- Coverage thresholds: 80% global, 90% for core engine files

### Code Quality
- `pnpm lint` - Run ESLint across all packages
- Uses Airbnb ESLint config with TypeScript support

### CLI Usage
- `npx promptgraph exec <graph.json> --seed 1234` - Execute a graph via CLI

## Architecture Overview

### Monorepo Structure
This is a pnpm workspace monorepo with:
- `client/` - React + Vite frontend (React-Flow canvas)
- `server/` - Node.js Fastify API (executor, preview routes)
- `packages/core/` - Shared TypeScript library (types, schemas, engine)
- `packages/cli/` - CLI wrapper for batch execution

### Key Technologies
- **Frontend**: React 18, Vite, React Flow (for node-based UI)
- **Backend**: Node.js 18, Fastify, TypeScript
- **Validation**: Zod schemas for runtime and compile-time safety
- **State Management**: Zustand for React state
- **Testing**: Jest with ts-jest, React Testing Library
- **Deterministic Execution**: seedrandom for reproducible outputs

## Core Package Architecture

The `packages/core` module is the heart of the system:

### Runtime Engine (`runtime/index.ts`)
- **ExecutionContext**: Manages variables, seeds, and deterministic PRNG
- **RuntimeNode**: Abstract base class for all executable nodes
- **Node Types**: WeightedChoice, Concat, Output, Include, SetVariable, GetVariable
- Uses seeded random number generation for deterministic execution

### Schema Layer
- **`graphSchema.ts`**: Zod schemas for graph structure validation
- **`nodeSchemas.ts`**: UI-focused schemas for form generation
- **`validation.ts`**: Graph connection validation (detects cycles, invalid edges)

### UI Components
- **`GraphEditor.tsx`**: Main React-Flow editor with autosave and validation (refactored to use modular components)
- **`InspectorPanel.tsx`**: Modern inspector system with resize/collapse functionality
- **`PreviewModal.tsx`**: Shows execution results with multiple seeds
- **`Palette.tsx`**: Draggable node type palette

### Inspector System Architecture
- **Modular Editor Components**: `BaseNodeEditor`, `TextFieldEditor`, `TextAreaEditor`, `SelectEditor`
- **Node-Type Specific Editors**: `WeightedChoiceEditor`, `OutputEditor`, `ConcatEditor`, `VariableEditor`, `SubjectEditor`, `ActionEditor`
- **Context Management**: `InspectorContext` for state management across inspector components
- **Reusable UI Components**: `CollapsibleSection`, `VariationList` for consistent UX

### State Management
- **`graphStore.ts`**: Zustand store for centralized graph state
- **`usePreviewSeeds.ts`**: Hook for async graph execution with cancellation

## Development Patterns

### Adding New Node Types
1. Define runtime class in `packages/core/runtime/index.ts`
2. Add Zod schema in `packages/core/graphSchema.ts`
3. Add UI schema in `packages/core/nodeSchemas.ts`
4. Create node-specific editor in `packages/core/components/Inspector/editors/`
5. Update node type detection logic in inspector components
6. Add icon in `packages/core/icons.tsx`
7. Update type unions and editor selection logic

### Testing Strategy
- **Unit tests**: For schemas, validation, and runtime engine
- **Integration tests**: For React components and API endpoints
- **Determinism tests**: Golden-file snapshots across multiple seeds
- **Coverage requirements**: 80% global, 90% for critical engine files

### Graph Execution Flow
1. Graph validation using Zod schemas
2. Deterministic execution with seeded PRNG
3. Depth-first traversal of connected nodes
4. Variable context passed between nodes
5. Output generation with reproducible results

## API Endpoints

### Server Routes (`server/src/index.ts`)
- `POST /preview` - Execute graph with multiple seeds for preview
- Graph validation and execution handled by `server/src/engine.ts`

### Deterministic Execution
- All execution uses seeded random number generation
- Same graph + seed = identical output across runs
- Sub-seeds generated via `hash(nodeId + parentSeed)`

## File Locations

### Core Engine
- Runtime: `packages/core/runtime/index.ts`
- Validation: `packages/core/validation.ts`
- Schema: `packages/core/graphSchema.ts`

### UI Components
- Main Editor: `packages/core/GraphEditor.tsx`
- Inspector System: `packages/core/components/Inspector/` (modular architecture)
- Node Editors: `packages/core/components/Inspector/editors/`
- Preview: `packages/core/PreviewModal.tsx`

### Server
- Engine: `server/src/engine.ts`
- API: `server/src/index.ts`
- Exporter: `server/src/exporter.ts`

## Development Notes

### Inspector System Refactoring
- GraphEditor.tsx has been refactored from 686 to 383 lines using modular components
- Inspector components use React Context (`InspectorContext`) for state management
- Node editors follow a consistent pattern with `BaseNodeEditor` as foundation
- Custom hooks (`useValidation`, `useAutosave`, `useNodeUtils`) extract common logic

### Graph Export/Import
- Graphs export to GeneratorBundle format for compatibility
- Round-trip conversion: graph → bundle → graph
- Exporter located in `server/src/exporter.ts`

### Validation Rules
- No self-loops or duplicate edges
- Type-safe node connections
- Real-time validation feedback in UI
- Validation errors displayed in status bar

### Performance Considerations
- Debounced autosave (5 seconds)
- Debounced validation (300ms)
- Debounced preview triggers (500ms)
- Target: Generate 5 prompt variants in <1 second

### Component Architecture Guidelines
- Use `BaseNodeEditor` for new node-type editors
- Follow `CollapsibleSection` pattern for organized UI
- Implement proper TypeScript interfaces for all components
- Use `VariationList` component for managing text variations