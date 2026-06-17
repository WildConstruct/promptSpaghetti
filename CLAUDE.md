# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

> **Accuracy note (2026-06):** earlier revisions of this file described a
> "Professional Features / Command Palette" UI, a `src/`-based multi-agent task
> system (`finish-task.js`, `grab-tasks.js`, …), API cost tracking, and an
> "Epic 7 advanced node tier ✅ COMPLETE." **None of those exist in the repo.**
> They were removed in the forensic cleanup. The advanced node tier is
> **parked, not complete** — see [`docs/parked-implementations/README.md`](docs/parked-implementations/README.md)
> and [`docs/forensic-cleanup-ledger.md`](docs/forensic-cleanup-ledger.md). Treat
> the schema (`packages/core/graphSchema.ts`) as the source of truth over any doc.

## What this project is

A node-based, deterministic prompt-generation tool. Users build a graph of nodes
(text, weighted choices, concatenation, variables, output) on a React Flow canvas;
the graph executes with a seeded PRNG so the same graph + seed always yields the
same prompt(s).

## Canonical execution engine

The product's canonical executor is the **client-side `Epic1ExecutionEngine`**:

- `packages/core/runtime/nodes/epic1/Epic1ExecutionEngine.ts` — the engine
- `packages/core/runtime/nodes/epic1/Epic1ExecutionContext.ts` — seeded context
- Node classes in `packages/core/runtime/nodes/epic1/`: `TextBlockNode`,
  `WeightedChoiceNode`, `ConcatNode`, `VariableNode`, `OutputNode`.

This is a deliberately small, executable node vocabulary. `WeightedChoiceNode`
supports weight distributions (linear / exponential / gaussian) via
`packages/core/runtime/nodes/epic1/weightDistribution.ts`.

### Older / parked runtime (do not assume it's the product path)

- `packages/core/runtime/index.ts` — older general `ExecutionContext` / `RuntimeNode`.
- `packages/core/runtime/advanced.ts` — **live**, but only because
  `packages/custom-node-sdk` consumes it (`AdvancedRuntimeNode`,
  `AdvancedExecutionContext`). **Do not delete.**
- `packages/core/runtime/io-system.ts` and the advanced node classes
  (`WeightedAdvanced`, `Conditional`, `Sequential`, `Markov`) are **parked** —
  not registered, not on the product schema surface. See the parked-implementations doc.

## File format standards

### Node type naming conventions

**Use these exact mappings to avoid "node type not found" errors:**

| Display Name    | PSG Type       | React Flow Type | Class Name         |
| --------------- | -------------- | --------------- | ------------------ |
| Weighted Choice | WeightedChoice | weightedChoice  | WeightedChoiceNode |
| Output          | Output         | output          | OutputNode         |
| Concatenate     | Concat         | concat          | ConcatNode         |
| Text Block      | TextBlock      | textBlock       | TextBlockNode      |
| Variable        | Variable       | variable        | VariableNode       |

**Node Registry:** `packages/core/runtime/nodeRegistry.ts`
- Convert types: `convertNodeType(type, 'psg' | 'reactflow')`
- Get node info: `nodeRegistry.get(id)`

### PSG vs PSGLib

- **`.psg` (fragments):** reusable component groups; should NOT contain Output
  nodes; uses `{ x, y }` coordinates; may contain regions. Parser:
  `packages/core/fileFormats/psg.ts`.
- **`.psglib` (complete presets):** full graph templates; uses
  `{ position: { x, y } }`; includes metadata; may contain Output nodes. Parser:
  `packages/core/fileFormats/psglib.ts`.

### Asset validation

```typescript
import { validateAsset } from '@/packages/core/validation/assetValidator';
const result = await validateAsset(fileContent);
if (!result.valid) console.error(result.errors);
```

## Common commands

### Development
- `pnpm install` — install all workspaces
- `pnpm dev` — start client (port 3000) and server (port 8000)
- `pnpm --filter client dev` — client only
- `pnpm --filter server dev` — Fastify server only
- `pnpm build` — production client bundle

### Testing
- `pnpm test` — root Jest run (`jest.config.js`)
- `pnpm --filter core test` — core package tests
- `npx jest --config packages/core/jest.config.cjs` — core suite directly
- `npx jest --config server/jest.config.cjs` — server suite
- Per-area configs also exist (`packages/core/components/epic1/jest.config.cjs`,
  `packages/core/runtime/nodes/epic1/jest.config.cjs`).

### Code quality
- `pnpm lint` — ESLint across packages
- `npx knip` — unused files / deps / exports report (config: `knip.json`)

### Automation scripts
Real automation lives under `scripts/` (e.g.
`scripts/automation-orchestrator.js`, `scripts/setup-dev-environment.js`,
`scripts/dev-quality-check.js`). Browse `scripts/` for the current set; there is
no `src/`-based task system.

## Git workflow

**NEVER commit or push unless the user explicitly asks** (e.g. "create a PR",
"commit this", "push it"). During regular development, make file changes and stop;
let the user decide when to commit. When the user does ask, prefer a feature
branch over the default branch.

## Architecture

### Monorepo (pnpm workspaces)
- `client/` — React 18 + Vite frontend (React Flow canvas)
- `server/` — Fastify API (admin, files, LLM, PSG, image, agent routes); Node ≥ 20
- `packages/core/` — shared TS library: types, Zod schemas, the Epic1 engine, UI
- `packages/asset-browser/` — asset/preset browser package
- `packages/custom-node-sdk/` — SDK consuming `runtime/advanced.ts`

### Key technologies
- **Frontend:** React 18, Vite, React Flow, Zustand
- **Backend:** Fastify 5 (Node ≥ 20), TypeScript
- **Validation:** Zod
- **Testing:** Jest + ts-jest, React Testing Library
- **Determinism:** seeded PRNG (same graph + seed ⇒ identical output)

### packages/core schema layer
- `graphSchema.ts` — Zod schema for graph structure (the product node vocabulary;
  source of truth for what is executable)
- `nodeSchemas.ts` — UI-focused schemas for form generation
- `validation.ts` — connection validation (cycles, invalid edges)

### UI components & editor surfaces
- **Main editor:** `packages/core/components/epic1/Epic1GraphEditor.tsx` (the
  real entry point — modular React Flow editor; autosave + validation). The
  client wraps it in `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`.
- **Nodes:** `packages/core/components/epic1/nodes/` — `TextBlockNode`,
  `EnhancedBranchingNode` (the `weightedChoice` React Flow type), `ConcatNode`,
  `VariableNode`, `OutputNode`, `PostItNote`, `EnhancedBoundingBox`. Registry:
  `nodes/index.ts` (`epic1NodeTypes`). Inline editors via `BaseEditableNode`.
- **Right side panel:** `packages/core/components/epic1/TabbedSidePanel.tsx` with
  four tabs (definitions in `client/src/Epic1Editor/editorSurfacePolicy.ts`):
  - **Library** (`assets`) — fragment suggestions + asset/preset browser.
  - **Linked** (`components`) — `ComponentLibraryPanel`; save a selection as a
    reusable linked component.
  - **Explore** (`search`) — `DocumentLibraryPanel`; browses full PSG-document
    templates (same set as the splash) and opens them with a confirm-if-dirty load.
  - **Graph** (`relationships`) — `GraphOutlinePanel`; outline of the current
    document by node type, click-to-focus.
- **Preview:** `packages/core/components/PreviewTray/PreviewTray.tsx` — bottom
  tray, multi-seed deterministic results (NOT a `PreviewModal`).
- **Prompt Wizard:** `packages/core/components/epic1/components/PromptWizard.tsx`
  wraps `client/src/components/LaunchScreen/PromptDissector.tsx` (the parse-to-graph
  toolbar). Opened from the left-rail "Wizard" button.
- **Onboarding/tutorial:** `packages/core/components/epic1/onboarding/` —
  `TutorialOverlay` + `TutorialContext` + `tutorialModel` (active system);
  `PromptPasteDialog` is the tutorial's paste step. Triggered by the
  `epic1:startTutorial` window event. `InteractiveTutorial.tsx` is orphaned.
- **Launch screen & examples:** `client/src/components/LaunchScreen/` +
  `client/src/templates/quickStartTemplates.ts` (executable example graphs) with
  display metadata in `templateCatalog.ts`. See `docs/examples-catalog.md`.
- **Card Normalization** (standalone route `/#/card-normalization`, mounted in
  `client/src/App.tsx`): `client/src/CardNormalization/` (UI) on the
  `packages/core/services/cardNormalization` model. Calibrates crowd-card scale
  via the head as a known-size ruler; feeds scene composition. See
  `docs/card-normalization-plan.md`.
- **State:** `stores/graphStore.ts` (Zustand).

### Branding
Wild Construct / Signal Lab palette: gold `#e6a23c` (light `#f0bd6e`, text-on-gold
`#1a1206`), neutral charcoal backgrounds (no blue tint), near-white text `#f1f6f9`,
uppercase 3px-tracked kicker. Splash carries a "Wild Construct" kicker. Don't
reintroduce the old purple/indigo accents or blue-tinted darks.

## API surface

### Local Fastify server (`server/src/index.ts`) — dev only
- `GET /health`, `GET /api/healthz` — health checks
- `GET /api/admin/metrics` and admin/theme routes (admin surface, gated)
- Route families registered: files, LLM, PSG, local image, agent

> There is **no `/preview` route and no `server/src/engine.ts`** — the legacy
> server-side graph engine was removed (the client `Epic1ExecutionEngine` is
> canonical). Don't reintroduce references to them.

### Serverless functions (`api/**`) — Vercel backend
Many functions under `api/` (e.g. `api/export.js`, `api/health.js`, `api/admin/*`,
`api/llm/*`, `api/ai/*`). These are the deployed backend.

### Deploy split
- **Vercel:** `api/**` serverless backend
- **Netlify:** the client
- **`server/src`:** local development only

## Development patterns

### Adding a product node type (Epic1 path)
1. Add a node class in `packages/core/runtime/nodes/epic1/` (mirror
   `WeightedChoiceNode` / `ConcatNode`).
2. Add a `case` in `Epic1ExecutionEngine.ts`.
3. Add it to the graph schema (`graphSchema.ts`) and the node registry
   (`nodeRegistry.ts`).
4. Add a React Flow node component and an inspector editor.
5. Add deterministic tests.

Do **not** build new product nodes on `AdvancedRuntimeNode` — that tier is parked.
To revive a parked capability, rebuild it as a native Epic1 node (see the
parked-implementations doc for the captured algorithms).

### Testing strategy
- Unit tests for schemas, validation, and the engine
- Component tests via React Testing Library
- Determinism: same seed ⇒ identical output

## Reference docs
- [`docs/parked-implementations/README.md`](docs/parked-implementations/README.md) — parked advanced node tier + parked "delightful" UX layer
- [`docs/forensic-cleanup-ledger.md`](docs/forensic-cleanup-ledger.md) — cleanup history and tiered actions
- [`docs/examples-catalog.md`](docs/examples-catalog.md) — example library + branching / branching-on-branching wiring (the `branch-N` handle model, locked options)
- [`docs/card-normalization-plan.md`](docs/card-normalization-plan.md) — the Card Normalization feature (data model, milestones, scene-composition payoff)
- [`docs/node-ux-audit.md`](docs/node-ux-audit.md) — per-node usability audit + cross-cutting fixes
- [`docs/sidebar-tabs-investigation.md`](docs/sidebar-tabs-investigation.md) — what the Library / Linked / Explore / Graph tabs do
- `packages/core/graphSchema.ts` — authoritative executable node vocabulary
- Memory: Wild Construct brand tokens + Card Normalization purpose are saved in `memory/`.
