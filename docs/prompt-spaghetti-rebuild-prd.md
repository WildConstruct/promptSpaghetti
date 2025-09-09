# Prompt Spaghetti Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

**Analysis Source:** IDE-based fresh analysis with user-provided comprehensive vision document

**Current Project State:**
The existing Prompt Spaghetti is a visual node-based graph editor for AI prompt generation. It allows users to create modular, reusable prompt workflows through a drag-and-drop interface. The system has a React-Flow based frontend, Fastify backend, and uses TypeScript throughout. Currently experiencing significant TypeScript compilation issues and missing critical features.

### Available Documentation Analysis

**Available Documentation:**

- ✓ Tech Stack Documentation (partial - in CLAUDE.md)
- ✓ Source Tree/Architecture (visible in codebase)
- ✓ Coding Standards (partial - in CLAUDE.md)
- ✓ API Documentation (basic routes documented)
- ✓ External API Documentation (N/A - no external APIs yet)
- ✗ UX/UI Guidelines (missing)
- ✓ Technical Debt Documentation (TypeScript issues noted)
- ✓ Other: Comprehensive vision document provided by user

### Enhancement Scope Definition

**Enhancement Type:**

- ✓ Major Feature Modification
- ✓ UI/UX Overhaul
- ✓ Technology Stack Upgrade (cleaner TypeScript implementation)
- ✓ Bug Fix and Stability Improvements

**Enhancement Description:**
Complete rebuild of Prompt Spaghetti maintaining the core visual node-graph concept while implementing a cleaner architecture, fixing TypeScript issues, and adding essential missing features like file persistence, preset browser, and core operator nodes.

**Impact Assessment:**

- ✓ Major Impact (architectural changes required)

### Goals and Background Context

**Goals:**

- Deliver a working MVP with core node types in 8 weeks
- Create a plugin-ready architecture for future extensibility
- Implement deterministic execution with seed control
- Enable file persistence and sharing of prompt graphs
- Provide seamless integration with ComfyUI workflows

**Background Context:**
The current implementation has accumulated significant technical debt, particularly around TypeScript configuration and missing core features. A brownfield rebuild allows us to maintain the validated concept while implementing a cleaner, more maintainable architecture. The target users - filmmakers and VFX artists - need a reliable tool for managing complex prompt variations without losing creative control.

### Change Log

| Change      | Date       | Version | Description                        | Author    |
| ----------- | ---------- | ------- | ---------------------------------- | --------- |
| Initial PRD | 2025-08-01 | 0.1     | Created brownfield PRD for rebuild | John (PM) |

## Requirements

### Functional Requirements

- **FR1**: The system shall analyze pasted prompts and suggest node-based decomposition with visual text range indicators showing which words map to which nodes
- **FR2**: Users shall be able to drag preset variations from an asset library onto any compatible node slot for instant randomization
- **FR3**: The graph executor shall produce deterministic outputs using seeded random generation, ensuring same seed + graph = identical results
- **FR4**: The system shall support a modular node architecture where nodes are defined by type in their file format, enabling future node additions without core changes
- **FR5**: Projects shall save to a human-readable .psg format (YAML/JSON) that preserves graph structure, UI state, and metadata
- **FR6**: The medieval demo workflow shall execute in under 1 second, generating 10-20 variations with visual feedback
- **FR7**: Users shall be able to save, load, and share preset libraries with tag-based categorization
- **FR8**: The system shall provide keyboard shortcuts for power users, including node insertion (⌘+Enter) and graph navigation

### Non-Functional Requirements

- **NFR1**: The rebuilt system shall achieve 90% reduction in TypeScript errors compared to current codebase through clean architecture
- **NFR2**: Initial page load shall complete in under 2 seconds with medieval demo preset ready to run
- **NFR3**: The UI shall feel responsive with <100ms feedback for all user interactions (node dragging, connections, previews)
- **NFR4**: The system shall maintain visual polish worthy of creative professionals while hiding playful details for those who explore
- **NFR5**: Code architecture shall support plugin nodes via npm package naming convention without modifying core
- **NFR6**: The system shall handle graphs with 100+ nodes without performance degradation

### Compatibility Requirements

- **CR1**: Export format shall be consumable by REST endpoints for integration with ComfyUI and similar pipelines
- **CR2**: File format shall support backwards compatibility through version fields and migration strategies
- **CR3**: UI patterns shall feel familiar to After Effects/Nuke users with node-based experience
- **CR4**: The system shall run in modern browsers (Chrome, Firefox, Safari) without requiring special plugins

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: TypeScript (100%)  
**Frameworks**: React 18 (Vite), Node.js (Fastify)  
**Database**: None currently (file-based)  
**Infrastructure**: Vercel deployment, GitHub Actions CI  
**External Dependencies**: React Flow, Zustand, Zod, seedrandom

### Integration Approach

**Database Integration Strategy**: Start with localStorage for MVP, prepare interfaces for future cloud sync  
**API Integration Strategy**: RESTful endpoints that emit ComfyUI-compatible JSON, webhook support for pipeline integration  
**Frontend Integration Strategy**: Keep React Flow for familiarity, abstract behind custom hooks for future flexibility  
**Testing Integration Strategy**: Vitest for unit/integration, Playwright for E2E demo flows

### Code Organization and Standards

**File Structure Approach**: Feature-based modules (prompt-analysis/, asset-library/, graph-engine/) rather than type-based  
**Naming Conventions**: camelCase for files/functions, PascalCase for components/types, kebab-case for CSS  
**Coding Standards**: Strict TypeScript, explicit types over inference, composition over inheritance  
**Documentation Standards**: JSDoc for public APIs, inline comments for "weird" features only

### Deployment and Operations

**Build Process Integration**: pnpm workspaces with shared core package, tree-shaking for minimal bundle  
**Deployment Strategy**: Vercel preview deploys for PRs, production deploy on main, demo at prompt-spaghetti.demo  
**Monitoring and Logging**: Console errors → Sentry for production, performance.mark() for demo timing  
**Configuration Management**: Environment variables for API keys, feature flags for progressive rollout

### Risk Assessment and Mitigation

**Technical Risks**: React Flow performance with complex graphs (mitigate: virtual viewport), Browser DnD inconsistencies (mitigate: proven library)  
**Integration Risks**: ComfyUI API changes (mitigate: version our output format), Pipeline timing expectations (mitigate: async webhooks)  
**Deployment Risks**: Demo fails during pitch (mitigate: local backup, recorded video), Vercel cold starts (mitigate: keep-warm pings)  
**Mitigation Strategies**: Feature flags for risky features, comprehensive E2E tests for demo path, rollback tags for every deploy

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic focused on delivering the demo-ready MVP. This is a focused rebuild with clear scope - one epic keeps the team aligned on the singular goal of "fundable demo in 8 weeks."

## Epic 1: Prompt Spaghetti MVP - Demo-Ready Rebuild

**Epic Goal**: Deliver a polished, demo-ready prompt manipulation tool that showcases instant prompt analysis, visual node editing, and deterministic variation generation - compelling enough to secure funding.

**Integration Requirements**:

- Clean greenfield codebase (no legacy integration needed)
- Must export ComfyUI-compatible JSON from day one
- File format designed for future preset marketplace
- Architecture ready for post-funding feature expansion

### Story 1.1: Core Node Engine & File Format

As a developer,  
I want to implement the foundational node system and file format,  
so that all subsequent features can build on a solid architecture.

**Acceptance Criteria:**

1. Define .psg file format schema (YAML) with node types, connections, metadata
2. Implement base node classes: TextBlock, WeightedChoice, Concat, Variable
3. Create deterministic execution engine with seedable random
4. Validate graph execution with unit tests
5. Ensure medieval demo nodes are fully supported

**Integration Verification:**

- IV1: Generated file format is human-readable and version-control friendly
- IV2: Execution engine produces identical output for same seed (10 test runs)
- IV3: Performance benchmark: 100-node graph executes in <50ms

### Story 1.2: Prompt Analysis & Node Generation

As a VFX artist,  
I want to paste a prompt and see it intelligently broken into nodes,  
so that I can immediately start creating variations.

**Acceptance Criteria:**

1. Implement prompt parser that identifies semantic units
2. Create visual range indicators showing text-to-node mapping
3. Generate appropriate node types based on content (nouns → text, lists → weighted)
4. Support manual adjustment of node boundaries
5. Handle malformed/unusual prompts gracefully

**Integration Verification:**

- IV1: Medieval prompt "A weary merchant in tattered robes" generates correct nodes
- IV2: Character ranges accurately map to source text
- IV3: Parse time <500ms for typical prompts

### Story 1.3: Visual Node Editor with React Flow

As a filmmaker,  
I want to visually connect and arrange nodes,  
so that I can understand and control my prompt structure.

**Acceptance Criteria:**

1. Integrate React Flow with custom node components
2. Implement drag-drop node creation from palette
3. Create connection validation (type compatibility)
4. Add visual feedback for valid/invalid connections
5. Include pan/zoom controls familiar to AE users

**Integration Verification:**

- IV1: Can recreate medieval demo graph through UI only
- IV2: Performance stays smooth with 50+ nodes
- IV3: All interactions feel responsive (<100ms feedback)

### Story 1.4: Asset Library & Preset System

As a creative professional,  
I want to drag presets from a library onto nodes,  
so that I can quickly explore variations.

**Acceptance Criteria:**

1. Build asset library UI with categorized presets
2. Implement drag-drop preset replacement
3. Create tag-based compatibility checking
4. Add real-time preview during hover
5. Include medieval character/setting presets

**Integration Verification:**

- IV1: Dragging "Fantasy Occupations" onto merchant node shows variations
- IV2: Incompatible presets show visual feedback
- IV3: Library loads without affecting app startup time

### Story 1.5: Execution & Preview System

As a user,  
I want to see multiple variations of my prompt instantly,  
so that I can find the perfect option.

**Acceptance Criteria:**

1. Build preview panel showing 10-20 variations
2. Implement seed control for reproducible results
3. Create one-click copy for any variation
4. Add export to JSON for pipeline integration
5. Display execution timing for performance confidence

**Integration Verification:**

- IV1: Medieval demo generates 20 variations in <1 second
- IV2: Same seed always produces identical results
- IV3: Export format works with ComfyUI test endpoint

### Story 1.6: Polish & Demo Optimization

As a founder,  
I want the app to feel professional and delightful,  
so that investors see we can build world-class products.

**Acceptance Criteria:**

1. Implement smooth animations and transitions
2. Add keyboard shortcuts for power users
3. Create loading states and error handling
4. Include subtle "weird" details that reward exploration
5. Optimize medieval demo for live presentation

**Integration Verification:**

- IV1: Demo runs flawlessly 10 times in a row
- IV2: App handles network failures gracefully
- IV3: First-time user can create variations within 30 seconds

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
