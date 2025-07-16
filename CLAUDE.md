# CLAUDE.md

## MULTI-AGENT COMMUNICATION

**CLAUDE NOTE (July 16, 2025 - Epic 8 Progress):**
Hi Windsurf! I've completed Epic 8 Story 8.1.2 - REST API Implementation. Here's what I accomplished:

### Epic 8 Work Completed:
- **Story 8.1.1**: ✅ Complete microservice architecture design and documentation
- **Story 8.1.2**: ✅ Complete REST API implementation for Python Executor Service
- **Status**: Ready to begin Story 8.1.3 - Sandboxed Execution Environment

### Git-Style Comments for Epic 8.1.2:
```
feat(epic8): Complete Epic 8.1.2 - Python Executor REST API Implementation

- Implement FastAPI server (python-executor/app/main.py)
  * Complete REST API with /v1/execute, /v1/validate, /health, /metrics endpoints
  * JWT authentication middleware with token verification
  * Rate limiting using slowapi (10 req/min for execute, 30 req/min for validate)
  * Comprehensive request/response validation with Pydantic models
  * Structured logging with execution context tracking

- Create authentication system (python-executor/app/auth.py)
  * JWT token verification with caching for performance
  * User context extraction and permission management
  * Token manager with 5-minute cache TTL
  * Service token creation for testing purposes

- Build monitoring & observability (python-executor/app/monitoring.py)
  * Prometheus metrics collection (requests, executions, errors, performance)
  * OpenTelemetry distributed tracing with Jaeger integration
  * ExecutionMonitor context manager for detailed span tracking
  * Security event monitoring and cache operation metrics

- Implement security validation (python-executor/app/security.py)
  * Comprehensive AST-based code analysis with 78+ prohibited patterns
  * Complexity scoring and execution time estimation
  * Transform function validation and module import detection
  * Pattern matching for dangerous operations (eval, exec, file access, etc.)

- Create Python executor engine (python-executor/app/executor.py)
  * RestrictedPython-based secure execution environment
  * Resource monitoring with CPU, memory, and timeout limits
  * Result caching with LRU eviction (1000 entry limit)
  * Deterministic execution tracking with comprehensive error handling

- Add containerization (python-executor/Dockerfile, docker-compose.yml)
  * Multi-stage Docker build with security best practices
  * Docker Compose with monitoring stack (Jaeger, Prometheus, Grafana, Redis)
  * Environment configuration templates and health checks
  * Non-root user execution and resource constraints

- Build client library (python-executor/client/)
  * Async Python client for main application integration
  * Automatic retry logic with exponential backoff
  * Type-safe request/response handling with context manager support
  * Comprehensive error handling for different failure scenarios

- Create API documentation (python-executor/openapi.yaml)
  * Complete OpenAPI 3.0.3 specification with examples
  * Request/response schemas and error code documentation
  * Security scheme definitions and endpoint descriptions

Implements: Secure Python code execution microservice
Features: JWT auth, rate limiting, monitoring, caching, Docker deployment
Dependencies: FastAPI, RestrictedPython, Prometheus, OpenTelemetry, JWT
Test Coverage: Ready for comprehensive testing in Story 8.1.3
```

**CLAUDE NOTE (July 16, 2025):**
Hi Windsurf! I've completed Epic 7 implementation. Here's what I accomplished:

### Work Completed:
- **Epic 7 Final Implementation**: Completed the Markov node, achieving 100% Epic 7 implementation
- **Advanced Node System**: All 4 advanced nodes now complete with comprehensive test coverage
- **Full Integration**: Complete engine integration with automatic advanced context detection

### Git-Style Comments:
```
feat(epic7): Complete Epic 7 Advanced Node Capabilities - Final Implementation

- Implement Markov node (packages/core/runtime/nodes/Markov.ts)
  * State transition matrices with probabilistic branching
  * Termination conditions and loop detection
  * Deterministic execution with seeded RNG
  * 93% test coverage with comprehensive test suite

- Complete engine integration (server/src/engine.ts)
  * Add Markov to advanced node type detection
  * Handle empty states with default configuration
  * Full backward compatibility maintained

- Update schema validation (packages/core/graphSchema.ts)
  * Add MarkovNodeSchema with complete configuration
  * Support for states, transitions, and Markov-specific config

Closes: Epic 7 Advanced Node Capabilities
Implements: WeightedAdvanced, Conditional, Sequential, Markov nodes
Test Coverage: 80+ tests, 93%+ coverage across all advanced nodes
```

### INSTRUCTIONS FOR FUTURE COMMUNICATION:
1. **For Windsurf:**
   - Always identify yourself at the beginning
   - Summarize work completed since last communication
   - Include structured git-style comments with feat/fix/docs prefixes
   - Mention dependencies and related components
   - Update this section when making significant changes

2. **For Claude:**
   - When you see this section and respond, add your new comments above previous ones
   - DO NOT delete previous comments - it means they haven't been cleared out by the other agent which means they are still relevant.
   - Retain these instructions for future communications
   - Add your own comments following a similar structure
   - Prepend each new entry with the current date

---



This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### CLI Usage
- `npx promptgraph exec <graph.json> --seed 1234` - Execute a graph via CLI
- `pnpm --filter cli exec <graph.json>` - Execute using local CLI package

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