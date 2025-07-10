# PromptScape Randomizer Graph — Product Requirements Document (PRD)

_Version 0.1 · 2025-07-09_

---

## 1 · Goals and Background Context

### Goals
- Deliver an MVP of PromptScape Randomizer Graph that lets prompt artists create deterministic branching grammars via a React-Flow UI and Node/TS executor.
- Generate five seeded prompt variants in < 1 s, both in-app and via CLI.
- Provide a clear integration path to the existing Randomizer Engine (exporter ⇄ bundle).
- Meet stated non-functional targets (performance, accessibility, security).

### Background Context
Creative-AI teams need repeatable, deterministic prompt generation to scale content while avoiding noisy randomness. A node-based grammar designer gives artists granular control and unlocks automation for QA and pipelines. The MVP focuses on six core node types and deterministic seed handling, forming the foundation for an expanded node library and Python bridge in later phases.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-09 | 0.1 | Initial PRD draft (Goals / Background) | PM-agent |

---

## 2 · Requirements

### 2.1 Functional Requirements (FR)
1. FR1: Graph JSON schema must validate `nodes[]`, `edges[]`, and `globalSeed` using Zod with unit tests.
2. FR2: React-Flow editor loads an empty graph, supports drag-add, connect, move, and delete nodes.
3. FR3: Node Inspector side-panel renders typed forms for selected nodes and live-updates the graph JSON.
4. FR4: Executor traverses the graph depth-first, supports `WeightedChoice`, `Concat`, `Output`, and returns a prompt string.
5. FR5: Deterministic RNG passes a seed top-down; sub-seeds = `hash(nodeId + parentSeed)`; identical graph+seed ⇒ identical output.
6. FR6: “Preview 5” UI button runs the executor five times with sequential seeds and shows results in a modal.
7. FR7: CLI wrapper `npx promptgraph exec <graph.json> --seed 1234` prints the final prompt and exits with code 0.
8. FR8: Exporter converts a saved graph to a valid `GeneratorBundle` JSON envelope that the existing Randomizer Engine consumes.
9. FR9: Importer opens a legacy GeneratorBundle back into the editor (`bundleToGraph`).
10. FR10: CI pipeline runs lint, unit tests, and builds a Docker image on every push to `main`.

### 2.2 Non-Functional Requirements (NFR)
1. NFR1: Performance – generate five prompt variants in < 1 s; peak memory < 500 MB during execution.
2. NFR2: Browser compatibility – Chrome ≥ 113, Firefox ≥ 114, Edge (latest).
3. NFR3: Accessibility – editor UI meets WCAG 2.1 AA.
4. NFR4: Security – all secrets via Windsurf Secret Manager; no keys or tokens in source or Git history.
5. NFR5: Determinism – identical graph + seed yields identical output across Node and (future) Python runtimes.
6. NFR6: Test coverage – unit (Jest) for executor & schema; integration (Playwright) for core UI flow; perf test for 1k headless runs.
7. NFR7: Deployment – dev → staging → prod flow with preview URLs per feature branch; artifacts stored in private registry.
8. NFR8: Documentation – update `docs/architecture.md`, `content_authoring.md`, and README.

---

## 3 · User Interface Design Goals

### 3.1 Overall UX Vision
Provide an intuitive, low-friction canvas where prompt artists can drag, connect, and inspect nodes with minimal clicks. Emphasise immediate feedback (live JSON, seed preview) and deterministic confidence indicators (seed badge, lock icons).

### 3.2 Key Interaction Paradigms
- Drag-and-drop node creation on a zoomable, pannable canvas.
- Single-click selection → right sidebar inspector.
- Context menu on edge or node for quick actions (delete, duplicate).
- Top toolbar: Run (Preview-5), Export bundle, Import bundle.
- Status bar showing active seed, validation errors count.

### 3.3 Core Screens / Views
1. Canvas Editor (default landing screen)
2. Batch Preview Modal (shows 5 outputs, seed under each)
3. Bundle Settings Modal (metadata, version, author)
4. Corrections Manager Panel (Phase-1 feature flag)

### 3.4 Accessibility
Target WCAG 2.1 AA: keyboard nav for canvas & inspector, sufficient colour contrast, ARIA labels.

### 3.5 Branding
Neutral developer-tool style; adopt Windsurf default font + colour tokens. Later theming via CSS vars.

### 3.6 Target Platforms
Cross-platform web (responsive desktop first; basic usability on tablets).

---

## 4 · Technical Assumptions

| Area | Decision | Rationale |
|------|----------|-----------|
| Repository Structure | **Monorepo** (`/client`, `/server`, optional `/python_executor`, shared `tests/`) | Simplifies cross-package imports, single CI pipeline, easier atomic PRs. |
| Service Architecture | **Monolith** (Node front-end + executor in one repo) for Phase-0; optional Python micro-service added Phase-1 via REST. | Keeps MVP deployment simple; isolates bridge complexity to later sprint. |
| Languages & Frameworks | TypeScript (Node 18) with React, Vite, pnpm; Python 3.11 (FastAPI) optional. | Matches Windsurf template and dev skillset; TS for type-safety, FastAPI widely adopted. |
| Testing Strategy | **Unit + Integration** (Jest, Playwright). | Validate logic and core UI flow; full pyramid not required for MVP. |
| Deployment Target | Windsurf containers (preview) & optional **Vercel** production deploy; ports 3000 (UI) & 8000 (executor). | Windsurf for internal previews; Vercel offers CDN edge delivery for public/production. |
| Secrets Management | Windsurf Secret Manager environment injection. | Central, audited, avoids git leaks. |
| Starter Templates / Libs | React Flow, seedrandom, zod, fastapi, uvicorn. | Already listed in Phase-0 plan. |
| CI/CD | GitHub Actions (or Windsurf) pipeline; Docker image artifact + **Codecov** upload step. | Enforces lint/tests, publishes coverage badge, repeatable builds. |
| Additional Assumptions | No database required for Phase-0; graphs persisted as JSON files in git. | Reduces infra overhead, aligns with MVP focus.

---

## 5 · Epic List

| # | Epic Title | Goal Statement |
|---|------------|----------------|
| **1** | Foundation & Core Infrastructure | Establish repo, monorepo tooling, CI pipeline, devcontainer, and a running React-Flow canvas skeleton served via Windsurf preview. |
| **2** | Editor MVP (Graph Authoring) | Enable artists to create, connect, and edit six core node types with Inspector, live JSON, and Preview-5 modal. |
| **3** | Executor & Integration | Implement deterministic executor + CLI, export to `GeneratorBundle`, import legacy bundles, and validate end-to-end against Randomizer Engine. |
| **4** | Alpha Hardening & DX Polish | Add test matrices, performance tuning, docs, and hand-off package for Phase-1 backlog (node expansion, Python bridge). |

---

## 6 · Epic 1 — Foundation & Core Infrastructure

**Epic Goal**  
Set up the development foundation: repo, tooling, CI/CD, devcontainer, and a live React-Flow canvas skeleton accessible via Windsurf Preview. This enables contributors to start feature work with consistent environments and automated checks.

### Story 1.1  Repo & Monorepo Tooling
As a developer, I want an initialized monorepo with pnpm workspaces, so that client, server, and shared code live under a single root with coherent dependency management.

**Acceptance Criteria**
1. A new git repository named `promptscape-graph` exists and is pushed to origin.
2. `package.json` defines pnpm workspaces: `client/`, `server/`, `tests/`.
3. Root `.editorconfig`, `.prettierrc`, and ESLint (Airbnb) are configured.
4. Running `pnpm install` at repo root completes without errors.

### Story 1.2  Dev Container & VS Code Settings
As a developer, I want a Windsurf `devcontainer.json` that pre-installs Node 18, Python 3.11, and pnpm, so that any contributor can spin up a ready-to-code environment in one click.

**Acceptance Criteria**
1. `devcontainer.json` defines Node 18, Python 3.11, pnpm, and ports 3000/8000 exposed.
2. Opening the repo in Windsurf launches the container and passes `pnpm install` automatically.
3. VS Code settings in `.vscode/settings.json` enable eslint and prettier on save.

### Story 1.3  React-Flow Canvas Skeleton
As a developer, I want a basic Vite + React project that renders an empty React-Flow canvas at `/`, so that future graph editing features have a working UI scaffold.

**Acceptance Criteria**
1. `client` folder created via `pnpm create vite` using React-TS template.
2. React-Flow added as a dependency and imported in `App.tsx`.
3. Canvas renders with grid and minimap enabled; no errors in console.
4. Local dev server runs with `pnpm --filter client dev` and shows canvas at `localhost:3000`.

### Story 1.4  CI Pipeline
As a CI engineer, I want GitHub Actions (or Windsurf pipeline) to lint and test on every push, so that code quality gates prevent regressions.

**Acceptance Criteria**
1. `.github/workflows/ci.yml` installs pnpm, runs `pnpm lint`, Jest unit tests with `--coverage`, and uploads coverage to Codecov.
2. Pipeline caches node modules for faster iterations.
3. Coverage threshold ≥ 80% lines on `main`; badge visible in README.
4. Build job passes in < 5 minutes on default branch.

### Story 1.5  Windsurf Preview Deployment
As a product owner, I want each branch to auto-deploy a preview URL, so stakeholders can see progress without local setup.

**Acceptance Criteria**
1. Windsurf preview enabled for port 3000; URL comment posted to PR on push.
2. Preview reflects latest commit within 2 minutes of push.
3. Preview teardown occurs on branch delete.

---

### Epic 1 Progress Checklist

- [x] **Story 1.1 Repo & Monorepo Tooling**
  - [x] Repo initialized and pushed
  - [x] Workspaces configured in `package.json` / `pnpm-workspace.yaml`
  - [x] `.editorconfig`, `.prettierrc`, `.eslintrc.json` present
  - [x] `pnpm install` succeeds with no errors
- [x] **Story 1.2 Dev Container & VS Code Settings**
  - [x] `devcontainer.json` with Node 18, Python 3.11, pnpm
  - [x] Ports 3000/8000 exposed
  - [ ] `.vscode/settings.json` with eslint + prettier (TODO)
- [x] **Story 1.3 React-Flow Canvas Skeleton**
  - [x] Vite React client scaffolded in `client/`
  - [x] React-Flow canvas renders without errors
  - [x] Dev server runs at `localhost:3000`
- [x] **Story 1.4 CI Pipeline**
  - [x] GitHub Actions workflow (`.github/workflows/ci.yml`)
  - [x] Lint script wired into root `package.json`
  - [ ] Jest tests & ≥ 80 % coverage (TODO)
- [x] **Story 1.5 Netlify Preview Deployment**
  - [x] Preview deploy enabled for port 3000 (`https://marvelous-gaufre-eb69ca.netlify.app`)
  - [ ] PR comment with preview URL (future CI enhancement)
  - [ ] Teardown on branch delete

---

## 7 · Epic 2 — Editor MVP (Graph Authoring)

**Epic Goal**  
Allow prompt artists to visually author deterministic grammars using six core node types, validate graphs, and preview outputs—all within the browser.

### Story 2.1  Core Node Library UI
As a prompt artist, I want to drag six core node types (`WeightedChoice`, `Concat`, `Output`, `Include`, `SetVariable`, `GetVariable`) onto the canvas, so that I can model branching grammars.

**Acceptance Criteria**
1. Palette shows the six node icons with tooltips.
2. Drag-drop adds node to canvas with default params.
3. Each node displays title and key param summary.

### Story 2.2  Node Connections & Validation
As a prompt artist, I want to connect nodes via edges and see validation errors if I miswire, so that my grammar executes correctly.

**Acceptance Criteria**
1. Edge drag from output handle to input handle.
2. Graph validation runs on change; invalid edges highlighted red.
3. Status bar shows error count; hover displays message.

### Story 2.3  Node Inspector Forms
As a prompt artist, I want an Inspector sidebar that lets me edit properties of the selected node with typed controls, so that changes immediately update the graph JSON.

**Acceptance Criteria**
1. Selecting a node opens form generated from Zod schema.
2. Changes debounce-save to graph state and validation re-runs.

### Story 2.4  Preview-5 Modal
As a prompt artist, I want a Preview button that runs the executor five times with sequential seeds and shows the outputs, so that I can quickly gauge variety.

**Acceptance Criteria**
1. Toolbar “Preview 5” button triggers `/server/preview` call.
2. Modal lists five strings with seed under each row.
3. Spinner and error state handled gracefully.

### Story 2.5  Graph JSON Autosave
As a user, I want the editor to autosave the current graph to LocalStorage every 5 seconds, so that I don’t lose work on refresh.

**Acceptance Criteria**
1. Debounced autosave writes JSON to `localStorage.graphDraft`.
2. On load, if draft exists, prompt to restore.
3. “Save as JSON” menu item downloads file.

---

### Epic 2 Progress Checklist

- [ ] **Story 2.1 Core Node Library UI**
  - [ ] Palette sidebar displays six core node icons with tooltips
  - [ ] Drag-dropping a node onto the canvas instantiates it with defaults
  - [ ] Node card shows title and key parameter summary

- [ ] **Story 2.2 Node Connections & Validation**
  - [ ] Edges can be drawn between output and input handles
  - [ ] Validation rules run on change; invalid edges highlighted red
  - [ ] Status bar shows validation error count; hover reveals messages

- [ ] **Story 2.3 Node Inspector Forms**
  - [ ] Selecting a node opens schema-driven form in Inspector sidebar
  - [ ] Changes debounce-save to graph state and re-run validation

- [ ] **Story 2.4 Preview-5 Modal**
  - [ ] Toolbar “Preview 5” button calls `/preview` API
  - [ ] Modal lists five outputs with seed labels
  - [ ] Loading and error states handled gracefully

- [ ] **Story 2.5 Graph JSON Autosave**
  - [ ] Autosave writes draft to `localStorage.graphDraft` every 5 s
  - [ ] Prompt to restore draft on load if present
  - [ ] “Save as JSON” menu item downloads graph file

---

### Epic 2 Backlog / Technical Considerations

- Accessibility & shortcuts
  - ARIA labels for palette items and canvas dropzone
  - Keyboard shortcuts for undo (⌘/Ctrl+Z) and save (⌘/Ctrl+S)
  - Colour-blind-safe error styling (edge stroke + icon)
- Undo/Redo history stack (max 100 actions)
- Performance safeguards
  - Virtualise node rendering > 500 nodes
  - Debounce validation 500 ms when > 200 nodes
- Validation coverage
  - Unit tests per rule in `packages/core`
  - Integration test on complex sample graph
- Error messaging UX
  - Node badges for errors in addition to status bar
  - Tooltip overlays pulled from validation messages
- State management strategy (mirror ReactFlow store to Zustand/Redux)
- File format versioning (`meta.version` bump on schema changes)
- Server API contract for `/preview` (encoded graph size limits, rate limits)

---

## 8 · Epic 3 — Executor & Integration

**Epic Goal**  
Provide a deterministic executor service and CLI, export graphs to GeneratorBundles, import legacy bundles, and prove full compatibility with the existing Randomizer Engine.

### Story 3.1  Deterministic Graph Executor
As a backend developer, I want a Node/TS executor that traverses the graph depth-first with seeded RNG, so that the same graph + seed always yields the same output.

**Acceptance Criteria**
1. `server/engine.ts` implements DFS traversal using `seedUtils`.
2. Supports node runtime classes for six core types.
3. Unit tests cover path permutations and seed determinism (≥ 90 % branch coverage).

### Story 3.2  CLI Wrapper
As a CLI user, I want to run `npx promptgraph exec graph.json --seed 1234`, so that I can generate prompts from scripts and CI jobs.

**Acceptance Criteria**
1. CLI parses args, loads graph JSON, calls executor, prints result to stdout.
2. `--seed` optional; defaults to timestamp.
3. Proper exit codes: `0` success, `1` validation error, `>1` unexpected error.

### Story 3.3  Export to GeneratorBundle
As a developer, I want to export the current graph to a valid `GeneratorBundle` JSON, so that it can run in the existing Randomizer Engine.

**Acceptance Criteria**
1. `exporter.ts` converts graph to bundle per contract.
2. Bundle passes JSON schema validation (Zod).
3. Integration test: bundle → Randomizer Engine generates prompt with expected seed.

### Story 3.4  Import Legacy Bundle
As a user, I want to import a legacy bundle and see the graph reconstructed, so that I can edit older generators visually.

**Acceptance Criteria**
1. `bundleToGraph` parses bundle JSON and populates canvas.
2. Round-trip test: graph → export → import → JSON deep-equal original graph.

### Story 3.5  Determinism Test Matrix
As QA, I want an automated matrix that runs the executor against 10 seeds and compares outputs to a golden file, so that regressions are caught.

**Acceptance Criteria**
1. Jest test iterates seeds 1-10 on sample graph fixture.
2. Outputs compared to stored snapshots; mismatch fails CI.

### Story 3.6  Preview API Endpoint
As the frontend, I need a `/preview` HTTP route that executes the graph N times and returns results, so that the Preview-5 modal can fetch outputs.

**Acceptance Criteria**
1. Fastify or Express route `POST /preview` accepts `{graph, runs, seed}`.
2. Returns array of strings with corresponding seeds.
3. Runs complete in < 1 s for demo graph.

---

## 9 · Epic 4 — Alpha Hardening & DX Polish

**Epic Goal**  
Stabilise the MVP for wider team use: improve performance, add key developer-experience niceties, deploy to Vercel production, and finalize documentation.

### Story 4.1  Performance Profiling & Tuning
As a developer, I want to profile the executor and canvas with large graphs and optimise hotspots, so that generation remains < 1 s and the UI feels smooth.

**Acceptance Criteria**
1. Playwright script loads a 250-node graph and records FPS & memory.
2. Optimisations (React memoization, workerised executor) reduce jank; metrics documented in `PERF.md`.

### Story 4.2  Corrections Manager Feature Flag
As a power user, I want to enable a Corrections Store panel to manage find/replace rules, so that edge-case tuning can be tested in alpha.

**Acceptance Criteria**
1. Feature flag `ENABLE_CORRECTIONS=true` shows sidebar.
2. CRUD UI backed by in-memory store; integration test covers add/remove.

### Story 4.3  Vercel Production Deploy
As DevOps, I want the `main` branch to auto-deploy to Vercel, so that stakeholders can access a CDN-optimised build.

**Acceptance Criteria**
1. Vercel project connected via GitHub; env vars injected via Vercel Secrets.
2. Successful build runs executor API behind `/api/*` edge functions.
3. Production URL added to README.

### Story 4.4  Documentation & Onboarding
As a new contributor, I want clear docs (README, architecture, content authoring) so that I can set up the project and understand core concepts quickly.

**Acceptance Criteria**
1. README explains quick start, scripts, and links to docs.
2. `docs/architecture.md` diagrams data flow (graph → exporter → engine).
3. `content_authoring.md` describes grammar conventions & bundle spec.

### Story 4.5  QA Sign-off & Release Notes
As QA, I need a checklist to validate Alpha features and publish release notes, so that the project is ready for Phase-1.

**Acceptance Criteria**
1. QA checklist executed; all critical bugs fixed.
2. Release notes summarise features, limitations, and migration steps.
3. Version bump to `v0.1.0-alpha` tagged in git.

---

## 10 · Phase-1 Backlog (Post-Alpha)
The following candidate features are out of scope for Alpha but prioritised for Phase-1 planning:

| # | Theme | Candidate Story |
|---|-------|-----------------|
| P1-1 | Node Library | Add advanced rule nodes matching engine capabilities: `Weighted`, `Conditional`, `Sequential`, `Markov`. |
| P1-2 | UX – Advanced Modal | Implement “Advanced Settings” modal (seed override, sampling temperature, run count selector). |
| P1-3 | Content Authoring | Publish **Content Authoring Handbook** distilled from `LLM_Content_Development_Guide.md` & `LLM_Generator_Assembly_Guide.md`. |
| P1-4 | Python Bridge | Introduce optional `python_executor` micro-service via REST for heavy NLP transforms. |
| P1-5 | Corrections Manager GA | Graduate Corrections Store feature flag to GA with persistent storage. |
| P1-6 | Collaboration | Add real-time multi-user editing via CRDT & WebSockets. |
| P1-7 | Prompt Targeting System | Begin design of cross-model export (Midjourney, Imagen, etc.) as outlined in `FUTURE_DIRECTIONS.md`. |
| P1-8 | Palette Scalability | Add category tabs to Palette when node types exceed 12. |

These items will be groomed and scheduled after v0.1.0-alpha release.


---

*PRD complete – ready for hand-off to UX Expert and Architect agents.*
