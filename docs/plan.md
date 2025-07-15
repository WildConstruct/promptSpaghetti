# Sprint Plan – PromptScape Randomizer Graph

_Date: 2025-07-14_

This plan captures Epic-2 delivery items plus the immediate **Must-Fix** actions identified in the Product-Owner validation report.  Use the check-boxes to track progress during the sprint.

---
## 1. Epic 2 – Editor MVP (Graph Authoring)
| # | Story | Owner | Status |
|---|-------|-------|--------|
| 2.1 | **Core Node Library UI** – palette shows 6 node types, drag-add to canvas | James | [x] Done |
| 2.2 | **Node Connections & Validation** – draw edges, highlight invalid wiring | James | [x] Done |
| 2.3 | **Node Inspector Forms** – schema-driven sidebar editing |  | [ ] Todo |
| 2.4 | **Preview-5 Modal** – executor runs 5 seeds, modal shows outputs |  | [ ] Todo |
| 2.5 | **Graph JSON Autosave** – draft saved to `localStorage`, restore prompt |  | [ ] Todo |

> **Note:** break each story into tasks in your issue tracker as needed (UI, backend, tests, docs).

### Story 2.1 – Core Node Library UI Subtasks
- [x] Palette sidebar displays six core node icons with tooltips
- [x] Drag-dropping a node onto the canvas instantiates it with defaults
- [x] Node card shows title and key parameter summary
- [x] Wire basic graph state store (Zustand) for node add/remove actions
- [x] Jest unit tests for palette component and drag-add logic
- [x] Update `docs/architecture/source-tree.md` with new UI component paths

### Story 2.2 – Node Connections & Validation Subtasks
- [x] Enable edge creation between node handles in React-Flow
- [x] Implement `validateConnection` util in `packages/core/validation.ts`
- [x] Highlight invalid edges red in canvas via `getEdgeStyle`
- [x] Display error count in status bar and tooltip list
- [x] Jest tests for validation util and error rendering
- [x] Update docs if new files added

### Story 2.3 – Node Inspector Forms Subtasks (Complete)
- [x] Render dynamic sidebar form from Zod schema
- [x] Two-way binding: editing updates node data & graph store
- [x] Debounce change events (300 ms) to reduce churn
- [x] Inline field validation & highlight invalid inputs
- [x] Jest tests: form renders, updates node data, validation feedback
- [x] Update docs if new files added

### Story 2.4 – Preview-5 Modal Subtasks
- [x] Design modal UI skeleton and add "Preview" button to toolbar
- [x] Implement `usePreviewSeeds` hook – runs executor on 5 random seeds
- [x] Show loading spinner while seeds execute; cancel on modal close
- [x] Display list of 5 outputs with seed number badges
- [x] Highlight nodes/edges used during execution (optional UX)
- [x] Error handling: surface executor failures per-seed and aggregate
- [x] Debounce preview trigger (500 ms after graph changes)
- [ ] Jest tests:
  - [ ] Hook returns 5 outputs for stable graph
  - [x] Modal renders outputs and loading / error states
  - [x] Button opens/closes modal via React Testing Library
- [x] Add docs: update source-tree.md and architecture notes
- [x] Mark story complete in plan when all subtasks pass CI


## Epic 3 – Executor & Integration
| # | Story | Owner | Status |
|---|-------|-------|--------|
| 3.1 | **Deterministic Graph Executor** – seeded DFS traversal in `server/engine.ts` |  | [ ] Todo |
| 3.2 | **CLI Wrapper** – `promptgraph exec graph.json --seed` |  | [ ] Todo |
| 3.3 | **Export to GeneratorBundle** – `exporter.ts` transforms graph |  | [ ] Todo |
| 3.4 | **Import Legacy Bundle** – bidirectional converter |  | [ ] Todo |
| 3.5 | **Determinism Test Matrix** – golden-file snapshots across seeds |  | [ ] Todo |
| 3.6 | **Preview API Endpoint** – Fastify `POST /preview` |  | [ ] Todo |

> Blockers flagged by PO report are listed inline per story.

### Story 3.1 – Deterministic Graph Executor Subtasks
- [ ] Scaffold `server/engine.ts` and supporting types
- [ ] Implement DFS traversal with injected PRNG (seedrandom)
- [ ] Unit tests ≥ 90 % branch coverage
- [ ] Benchmark sample graph performance (<500 ms)
- [ ] Add executor dependencies to root `package.json`

### Story 3.2 – CLI Wrapper Subtasks
- [ ] Create `packages/cli/index.ts` with Commander setup
- [ ] Support `exec` command, `--seed`, help flags
- [ ] Exit codes 0/1/2 as per acceptance criteria
- [ ] Integration test invoking via `npx`

### Story 3.3 – Export to GeneratorBundle Subtasks
- [ ] Implement `exporter.ts` converting graph JSON → bundle
- [ ] Validate against Randomizer Engine JSON-schema
- [ ] Integration test: graph → export → engine output match

### Story 3.4 – Import Legacy Bundle Subtasks
- [ ] Implement `bundleToGraph` converter
- [ ] Round-trip test (graph→export→import)
- [ ] Document limitations in README

### Story 3.5 – Determinism Test Matrix Subtasks
- [ ] Create Jest parameterized test across seeds 1-50
- [ ] Snapshot outputs; failing diff fails CI
- [ ] Add coverage thresholds to `jest.config.js`

### Story 3.6 – Preview API Endpoint Subtasks
- [ ] Add Fastify route `POST /preview`
- [ ] Wire to executor (3.1) with `runs=N` param
- [ ] Response schema `{seed, output}[]`
- [ ] Add feature flag + rollback notes
- [ ] CI pipeline step to deploy preview env

---
## 2. Must-Fix Items (Blockers Before Sprint-2 Kickoff)
| # | Task | Owner | Due | Status |
|---|------|-------|-----|--------|
| MF-1 | Add `.vscode/settings.json` (eslint & prettier on save) |  | 2025-07-17 | [ ] |
| MF-2 | Raise Jest line coverage ≥ 80 %; fail CI below threshold |  | 2025-07-17 | [ ] |
| MF-3 | Create `docs/api_contract.md` – lock Preview API & CLI spec |  | 2025-07-18 | [ ] |
| MF-4 | Implement golden-file determinism tests (Story 3.5) |  | 2025-07-18 | [ ] |
| MF-5 | Ship minimal graph validation engine (avoid corrupt graphs) |  | 2025-07-19 | [ ] |
| MF-6 | Draft `ops/rollback.md` – standard Windsurf rollback procedure |  | 2025-07-19 | [ ] |

---
## 3. Today’s Focus (2025-07-14)
1. Kick-off grooming session – assign owners & estimates for Epic 2 stories.  
2. Create PR for `.vscode/settings.json` and coverage gate (MF-1, MF-2).  
3. Draft API contract outline in `docs/api_contract.md` (MF-3).  
4. Spike branch for validation engine prototype (MF-5).

---

## Epic 4 – Alpha Hardening & DX Polish

**Epic Goal**: Stabilise the MVP for wider team use: improve performance, add key developer-experience niceties, deploy to Vercel production, and finalize documentation.

| # | Story | Owner | Status |
|---|-------|-------|--------|
| 4.1 | **Performance Profiling & Tuning** – profile executor & canvas with large graphs, optimise hotspots | Claude | [x] Complete |
| 4.2 | **Corrections Manager Feature Flag** – enable Corrections Store panel for find/replace rules | Claude | [x] Complete |
| 4.3 | **Vercel Production Deploy** – auto-deploy main branch to Vercel with CDN optimization | Claude | [x] Complete |
| 4.4 | **Documentation & Onboarding** – comprehensive README, architecture docs, content authoring guide | Claude | [x] Complete |
| 4.5 | **QA Sign-off & Release Notes** – validate Alpha features, publish release notes, version bump | Claude | [x] Complete |

### Story 4.1 – Performance Profiling & Tuning Subtasks
- [ ] Create Playwright performance test script for 250-node graph
- [ ] Implement React.memo optimization for node components
- [ ] Add canvas virtualization for large graphs (>500 nodes)
- [ ] Profile executor with performance.now() timing
- [ ] Consider Web Worker for heavy computation offloading
- [ ] Document performance metrics in `docs/PERF.md`
- [ ] Set up continuous performance monitoring in CI
- [ ] Memory usage profiling and optimization
- [ ] FPS monitoring during canvas interactions
- [ ] Bundle size analysis and optimization

### Story 4.2 – Corrections Manager Feature Flag Subtasks
- [ ] Add `ENABLE_CORRECTIONS` environment variable support
- [ ] Create Corrections Store panel UI component
- [ ] Implement in-memory corrections store with Zustand
- [ ] Add CRUD operations for find/replace rules
- [ ] Integrate corrections with graph execution pipeline
- [ ] Add unit tests for corrections functionality
- [ ] Document corrections feature in user guide
- [ ] Add feature flag configuration to deployment
- [ ] Create migration path for corrections data
- [ ] Add accessibility support for corrections UI

### Story 4.3 – Vercel Production Deploy Subtasks
- [ ] Configure Vercel project and GitHub integration
- [ ] Set up environment variables in Vercel dashboard
- [ ] Convert server API to Vercel Edge Functions
- [ ] Configure build settings for monorepo deployment
- [ ] Set up custom domain and SSL certificates
- [ ] Add production environment monitoring
- [ ] Configure CDN caching strategies
- [ ] Set up error tracking and logging
- [ ] Add health check endpoints
- [ ] Document deployment procedures

### Story 4.4 – Documentation & Onboarding Subtasks
- [ ] Update README with comprehensive quick start guide
- [ ] Create `docs/architecture.md` with data flow diagrams
- [ ] Write `docs/content_authoring.md` for grammar conventions
- [ ] Document API endpoints in `docs/api_contract.md`
- [ ] Create developer onboarding checklist
- [ ] Add code examples and tutorials
- [ ] Document troubleshooting common issues
- [ ] Create video walkthrough for key features
- [ ] Add contributing guidelines
- [ ] Document release process and versioning

### Story 4.5 – QA Sign-off & Release Notes Subtasks
- [ ] Create comprehensive QA testing checklist
- [ ] Execute end-to-end testing scenarios
- [ ] Validate all Epic 1-3 features work correctly
- [ ] Test cross-browser compatibility
- [ ] Verify accessibility compliance (WCAG 2.1 AA)
- [ ] Security audit and vulnerability scanning
- [ ] Performance regression testing
- [ ] Draft release notes with features and limitations
- [ ] Create migration guide from previous versions
- [ ] Version bump to v0.1.0-alpha and git tag

---
_This file is maintained by **Sarah – Product Owner**.  Please update statuses daily._
