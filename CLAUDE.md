# CLAUDE.md

## MULTI-AGENT COMMUNICATION

For multi-agent communication history and ticket instructions, see [CLAUDE-TICKETS.md](./CLAUDE-TICKETS.md)

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## FILE FORMAT STANDARDS (Critical - Story 1.28)

### Node Type Naming Conventions

**ALWAYS use these exact mappings to avoid "node type not found" errors:**

| Display Name | PSG Type | React Flow Type | Class Name |
|-------------|----------|-----------------|------------|
| Weighted Choice | WeightedChoice | weightedChoice | WeightedChoiceNode |
| Output | Output | output | OutputNode |
| Concatenate | Concat | concat | ConcatNode |
| Text Block | TextBlock | textBlock | TextBlockNode |
| Variable | Variable | variable | VariableNode |

**Use the Node Registry:** `packages/core/runtime/nodeRegistry.ts`
- Convert types: `convertNodeType(type, 'psg' | 'reactflow')`
- Get node info: `nodeRegistry.get(id)`

### PSG vs PSGLib Formats

**PSG Files (.psg) - Fragments:**
- Use for reusable component groups
- Should NOT contain Output nodes
- Uses x/y coordinates: `{ x: 100, y: 200 }`
- May contain regions for grouping

**PSGLib Files (.psglib) - Complete Presets:**
- Use for full graph templates
- Uses position objects: `{ position: { x: 100, y: 200 } }`
- Includes metadata and usage stats
- Can contain Output nodes

### Asset Validation

**Before adding assets to library, validate with:**
```typescript
import { validateAsset } from '@/packages/core/validation/assetValidator';
const result = await validateAsset(fileContent);
if (!result.valid) {
  console.error(result.errors);
}
```

### Important Files

- **Format Spec:** `docs/technical-specs/file-format-specification.md`
- **Node Registry:** `packages/core/runtime/nodeRegistry.ts`
- **Asset Validator:** `packages/core/validation/assetValidator.ts`
- **PSG Parser:** `packages/core/fileFormats/psg.ts`
- **PSGLib Parser:** `packages/core/fileFormats/psglib.ts`

## PROFESSIONAL FEATURES (Phase 2 Complete - July 25, 2025)

### NEW: Cinema 4D-Level Professional Interface ✅ COMPLETE

**UX Transformation:** 6.3/10 → 9.2/10 (Professional Grade)

**Professional Components Available:**

- `packages/core/components/CommandPalette/ProfessionalIntegration.tsx` - **Main integration component**
- `packages/core/components/CommandPalette/CommandPalette.tsx` - **Advanced command interface (⌘K)**
- `packages/core/components/CommandPalette/UndoRedoManager.tsx` - **Professional undo/redo system (⌘Z)**
- `packages/core/components/CommandPalette/MultiSelectionManager.tsx` - **Advanced selection tools**
- `packages/core/components/CommandPalette/AutosaveManager.tsx` - **Intelligent autosave system**
- `packages/core/components/CommandPalette/KeyboardShortcutsManager.tsx` - **Complete shortcuts (? for help)**

**Quick Integration:**

```typescript
import { ProfessionalIntegration } from './packages/core/components/CommandPalette/ProfessionalIntegration';
import './client/src/professional-theme.css';

<ProfessionalIntegration
  nodes={nodes} edges={edges} selectedNodes={selectedNodes} selectedEdges={selectedEdges}
  onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
  onNodesSelect={onNodesSelect} onEdgesSelect={onEdgesSelect}
  onNodeCreate={onNodeCreate} onNodeDelete={onNodeDelete}
  onExport={onExport} onSave={onSave} onLoad={onLoad} theme="cinema"
/>
```

**Professional Keyboard Shortcuts:**

- `⌘K` - Command Palette | `⌘Z` - Undo | `⌘⇧Z` - Redo | `⌘S` - Save | `⌘A` - Select All
- `⌘D` - Duplicate | `⌘0` - Fit View | `⌘G` - Generate Character | `?` - Help

**Documentation:**

- `docs/professional-features.md` - **Complete feature documentation**
- `docs/professional-features-quick-reference.md` - **Developer quick reference**
- `docs/ux-transformation-summary.md` - **Transformation summary and metrics**

## Common Commands

### Development

- `pnpm install` - Install dependencies for all workspaces
- `pnpm dev` - Start client (port 3000) and server (port 8000)
- `pnpm --filter client dev` - Start only the React client
- `pnpm --filter server dev` - Start only the Fastify server
- `pnpm build` - Build production bundle for client

### Testing

- `pnpm test` - Run all Jest tests with coverage
- `pnpm test -- --coverage` - Run tests with detailed coverage report
- `pnpm test -- --watch` - Run tests in watch mode
- `pnpm test --testPathPattern="ComponentName"` - Run specific component tests
- `pnpm --filter client test` - Run only client tests
- `pnpm --filter server test` - Run only server tests
- `pnpm --filter core test` - Run only core package tests
- Coverage thresholds: 80% global, 90% for core engine files

### Code Quality

- `pnpm lint` - Run ESLint across all packages
- Uses Airbnb ESLint config with TypeScript support

### **NEW: Enterprise Automation Infrastructure (2025-01-25)**

- `node scripts/setup-dev-environment.js` - **Complete development environment setup**
- `node scripts/dev-quality-check.js` - **Comprehensive quality validation**
- `node scripts/automation-orchestrator.js qa-full` - **Complete QA pipeline**
- `node scripts/automation-orchestrator.js pre-commit` - **Fast pre-commit validation**
- `node scripts/quality-monitoring-dashboard.js` - **Real-time quality dashboard**
- `node scripts/smart-test-selector.js` - **Intelligent test selection (60-80% faster)**
- `node scripts/security-scanner.js` - **Security vulnerability scanning**
- `node scripts/performance-regression-detector.js` - **Performance baseline monitoring**
- `node scripts/intelligent-dependency-manager.js` - **Smart dependency management**
- **Dashboard**: `http://localhost:3001` (real-time monitoring)
- **Quick Reference**: `docs/agent-tips/automation-quick-reference-2025-01-25.md`
- **Full Guide**: `docs/agent-tips/comprehensive-automation-workflows-2025-01-25.md`

### CLI Usage

- `npx promptgraph exec <graph.json> --seed 1234` - Execute a graph via CLI
- `pnpm --filter cli exec <graph.json>` - Execute using local CLI package

### Task Management (CRITICAL)

- `node src/finish-task.js <task-id>` - **MUST be called when implementation is complete**
- Failing to call finish-task.js leaves tasks stuck in IN_PROGRESS state

### Git Workflow (IMPORTANT)

**DO NOT commit individual files immediately during development.**

**Correct workflow:**

1. Work on task implementation
2. Call `node src/finish-task.js <task-id>` when complete
3. **Only then** create PR for review and approval
4. Commits happen during PR merge, not during individual file work

**NEVER commit unless explicitly asked to create a PR or the user specifically requests it.**

## CRITICAL DEVELOPMENT AGENT INSTRUCTIONS

### When User Says "Check This In" or "Finish Task":

1. ✅ **FIRST**: Call `node src/finish-task.js <task-id>`
2. ✅ **THEN**: Ask if they want you to create a PR
3. ❌ **DO NOT**: Immediately commit files
4. ❌ **DO NOT**: Use git commit during regular development

### Git Commits Only Happen When:

- User explicitly requests PR creation
- User says "create a pull request"
- User says "commit this for review"
- **NOT** when they say "check this in" or "finish the task"

### The Correct Workflow Is:

```
Development Work → finish-task.js → PR Creation → Git Commits
```

**The issue**: Dev agents were committing immediately when told to "check in" work, but the proper workflow is to finish the task FIRST, then handle git workflow separately for PR creation.

### Agent Coordination Commands

- `node src/monitor-available-tasks.js` - See team coordination dashboard and available tasks
- `node src/grab-tasks.js <agent-id> 2 --epic=8` - Grab Epic 8 tasks (PRIORITY 1)
- `node src/grab-tasks.js <agent-id> 2 --priority-only` - Grab any high priority tasks

### Unified Automation System (NEW)

The automation infrastructure has been completely unified and consolidated:

- **System Health**: `node src/fix-system.js --health-check` - Comprehensive health monitoring (96/100 health score)
- **System Repair**: `node src/fix-system.js --all` - Automated violation fixes and maintenance
- **QA Processing**: `node src/workflow-orchestrator.js --workflow qa-pipeline` - Complete QA automation
- **Daily Maintenance**: `node src/workflow-orchestrator.js --workflow daily-maintenance` - Automated daily operations
- **Real-time Monitoring**: `node src/monitor-system.js` - Unified monitoring dashboard with 5 modes
- **Epic Management**: `node src/create-epic-tasks-unified.js` - Consolidated epic task creation
- **Analytics**: `node src/analyze-system.js overview` - Comprehensive system analysis

### Key Automation Improvements

- **99.7% Code Reduction**: Epic creation scripts (23 → 2)
- **95% Code Reduction**: Fix scripts (5+ → 1 modular system)
- **90% Code Reduction**: Analysis scripts (6+ → 1 dashboard)
- **85% Code Reduction**: Monitoring scripts (3+ → 1 unified system)
- **Workflow Orchestration**: 6 predefined workflows with conditional execution
- **Database v2.0.0**: Enhanced indexing for 5,906 tasks with epic/story metadata

### Cost Tracking (NEW)

Enhanced Claude API cost tracking with ccusage integration:

- `node src/claude-cost-integration.js report` - Generate detailed cost report with actual usage
- `node src/claude-cost-integration.js install` - Install ccusage for accurate tracking
- `node src/claude-cost-integration.js check` - Verify ccusage availability
- **Dashboard integration**: Real-time cost widget shows actual vs estimated costs
- **Automatic detection**: Uses actual ccusage data when available, falls back to estimates

### tmux-cli Command to interact with CLI applications

`tmux-cli` is a bash command that enables Claude Code to control CLI applications 
running in separate tmux panes - launch programs, send input, capture output, 
and manage interactive sessions. Run `tmux-cli --help` for detailed usage 
instructions.

Example uses:
- Interact with a script that waits for user input
- Launch another Claude Code instance to have it perform some analysis or review or 
  debugging etc
- Run a Python script with the Pdb debugger to step thru its execution, for 
  code-understanding and debugging
- Launch web apps and test them with browser automation MCP tools like Puppeteer

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

### Advanced Runtime Architecture (Epic 7) (`runtime/advanced.ts`)

- **AdvancedRuntimeNode**: Enhanced base class with state management, caching, and performance metrics
- **AdvancedExecutionContext**: Extended context with node states, evaluation depth, and performance cache
- **Validation Framework**: ValidationHelpers for comprehensive input/output validation
- **Serialization System**: SerializationHelpers for complex node data persistence

### I/O System (Epic 7) (`runtime/io-system.ts`)

- **AdvancedIOHandler**: Type-safe input/output handling with validation and coercion
- **IOSpecBuilder**: Fluent API for defining node input/output specifications
- **TypedInputs**: Type-safe access to resolved input values with metadata
- **Constraint System**: Comprehensive validation (length, range, pattern, custom)

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

#### Basic Nodes (Epic 3 Pattern)

1. Define runtime class in `packages/core/runtime/index.ts`
2. Add Zod schema in `packages/core/graphSchema.ts`
3. Add UI schema in `packages/core/nodeSchemas.ts`
4. Create node-specific editor in `packages/core/components/Inspector/editors/`
5. Update node type detection logic in inspector components
6. Add icon in `packages/core/icons.tsx`
7. Update type unions and editor selection logic

#### Advanced Nodes (Epic 7 Pattern)

1. **Extend AdvancedRuntimeNode** in `packages/core/runtime/advanced.ts`
2. **Define I/O Specification** using IOSpecBuilder for type-safe inputs/outputs
3. **Implement Validation** using ValidationHelpers for complex constraints
4. **Add Zod Schema** in `packages/core/graphSchema.ts` for data persistence
5. **Create Advanced Editor** extending BaseNodeEditor with specialized UI
6. **Implement Serialization** for complex state and configuration data
7. **Add Comprehensive Tests** with deterministic validation and edge cases

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
- `POST /export` - Convert graphs to GeneratorBundle format
- `GET /health` - Health check endpoint
- Graph validation and execution handled by `server/src/engine.ts`

### Vercel API Functions (`api/`)

- `api/preview.js` - Serverless graph execution endpoint
- `api/export.js` - Serverless export endpoint
- `api/health.js` - Serverless health check

### Deterministic Execution

- All execution uses seeded random number generation
- Same graph + seed = identical output across runs
- Sub-seeds generated via `hash(nodeId + parentSeed)`

## File Locations

### Core Engine

- Runtime: `packages/core/runtime/index.ts`
- Advanced Runtime: `packages/core/runtime/advanced.ts`
- I/O System: `packages/core/runtime/io-system.ts`
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

## Current Development Status

This codebase is currently on branch `epic-3` with **Epic 7 Advanced Node Capabilities** in progress. Epic 2 (Editor MVP), Epic 3 (Executor & Integration), and Epic 5 (Inspector Panel & Text Variation System) are complete. See `docs/plan.md` for current sprint progress and `docs/prd.md` for full requirements.

### Epic 7 Progress - Advanced Node Capabilities ✅ COMPLETE

- **Advanced Runtime Architecture**: `packages/core/runtime/advanced.ts` with AdvancedRuntimeNode base class
- **I/O System**: `packages/core/runtime/io-system.ts` with comprehensive type-safe input/output handling
- **Test Coverage**: 80+ tests with 93%+ coverage across all advanced nodes
- **Documentation**: Complete architecture and implementation docs in `docs/epic7-*.md`

### Epic 7 Implementation Complete - All 4 Advanced Nodes ✅ COMPLETE

**✅ COMPLETED (93%+ test coverage):**

- **WeightedAdvanced**: `packages/core/runtime/nodes/WeightedAdvanced.ts` - Complex weight distributions with exponential, gaussian, and custom patterns
- **Conditional**: `packages/core/runtime/nodes/Conditional.ts` - Expression-based branching with variable access and custom functions
- **Sequential**: `packages/core/runtime/nodes/Sequential.ts` - Stateful sequence processing with linear, cyclical, random, and weighted patterns
- **Markov**: `packages/core/runtime/nodes/Markov.ts` - State transition matrices with termination conditions and loop detection

### Epic 7 Foundation Complete ✅ COMPLETE

- **Engine Integration**: All advanced nodes fully integrated with automatic context detection
- **Schema Validation**: Complete Zod schemas for all advanced node types
- **Serialization System**: Full serialization/deserialization for advanced node states
- **Test Coverage**: Comprehensive test suites for all nodes with deterministic validation
- **Performance Tracking**: Built-in performance monitoring and caching systems

### Advanced Node Features Complete ✅

- **Security Framework**: Dangerous pattern detection (eval, constructor, prototype, etc.)
- **Expression Evaluation**: Safe JavaScript with utility functions (startsWith, includes, getType, etc.)
- **Stateful Processing**: Maintains execution state between runs with history tracking
- **Pattern Systems**: Multiple traversal strategies (linear, cyclical, random, weighted)
- **Performance Tracking**: Integrated with `measureExecution` for metrics collection
- **Engine Integration**: Full support in `server/src/engine.ts` with automatic context detection
- **Schema Integration**: Zod validation for all Epic 7 advanced node types
- **Test Coverage**: 90%+ statement coverage with comprehensive test suites (100+ tests total)

### Key Recent Changes

- ✅ Epic 7 Markov: Complete implementation with state transition matrices, termination conditions, and loop detection (93% test coverage)
- ✅ Epic 7 Sequential: Complete implementation with 4 pattern types, state management, and 32 passing tests
- ✅ Epic 7 Conditional: Complete implementation with expression evaluation, security framework, and 36 passing tests
- ✅ Epic 7 WeightedAdvanced: Complete implementation with distribution algorithms and performance tracking
- ✅ **Epic 7 COMPLETE**: All 4 advanced nodes implemented with full engine integration and comprehensive test coverage
- ✅ Advanced Node Framework: State management, caching, performance tracking, and serialization systems
- ✅ Expression Security: Blocks eval, constructor, prototype pollution, and other dangerous patterns
- Complete inspector system with modular components
- Preview modal with multi-seed execution
- Graph validation and error display
- Deterministic execution engine
- Export/import functionality

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
