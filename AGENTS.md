# AGENTS.md

Guidance for coding agents working in this repository.

> **Source of truth order:** live code (`Epic1ExecutionEngine`, `server/src/index.ts`,
> mounted routes) → [`CLAUDE.md`](./CLAUDE.md) → [`ACTIVE_SURFACE.md`](./ACTIVE_SURFACE.md)
> → this file. If a doc contradicts the engine or mounted server routes, **prefer the code**.
>
> Work-loop tracker for the post-audit hardening/roadmap pass:
> [`docs/audit-work-loop.md`](./docs/audit-work-loop.md).

For multi-agent ticket history (legacy), see [Codex-TICKETS.md](./Codex-TICKETS.md).
Do not assume a live `src/finish-task.js` / grab-tasks system — it does not exist.

---

## What this product is

A node-based, **deterministic** prompt-generation tool. Users build a graph on a React Flow
canvas; the graph executes with a seeded PRNG so the same graph + seed always yields the same
prompt(s).

## Canonical execution path (do not invent alternatives)

| Layer | Location |
| --- | --- |
| Engine | `packages/core/runtime/nodes/epic1/Epic1ExecutionEngine.ts` |
| Context | `packages/core/runtime/nodes/epic1/Epic1ExecutionContext.ts` |
| Node classes | `packages/core/runtime/nodes/epic1/` — `TextBlockNode`, `WeightedChoiceNode`, `ConcatNode`, `VariableNode`, `OutputNode` |
| Editor canvas | `packages/core/components/epic1/Epic1GraphEditor.tsx` |
| Editor shell | `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx` |
| Preview | `packages/core/components/PreviewTray/PreviewTray.tsx` (not a `PreviewModal` product path) |
| Local API | `server/src/index.ts` (Fastify 5) |
| Hosted API (deploy) | `api/**` on Vercel — compatibility surface; not the same as Fastify |

**Executable Epic1 vocabulary:** `TextBlock`, `WeightedChoice`, `Concat`, `Variable`, `Output`.

There is **no** live server graph engine (`server/src/engine.ts` is gone) and **no** mounted
`POST /preview` on the Fastify runtime. Preview runs **client-side** on the same graph the user
edits. Do not reintroduce a second executor for the product path.

### Parked / non-product (do not treat as MVP)

- Advanced node *source* (`Conditional`, `Sequential`, `Markov`, `WeightedAdvanced`,
  `io-system.ts`) was **deleted** (C1 P1). Specs: [`docs/parked-implementations/README.md`](./docs/parked-implementations/README.md).
- `runtime/advanced.ts` is **live** only because `@promptscape/custom-node-sdk` depends on it.
  **Do not delete.**
- `packages/custom-node-sdk/`, `python-executor/` — support / research, not the launch wedge.
- Professional Command Palette / Cinema 4D “professional features” UI — **does not exist**.
- `packages/cli` — removed; do not document or depend on it.

To revive a parked capability, rebuild it as a **native Epic1 node**, not by reactivating the
old advanced runtime for the product path.

---

## File format standards

### Node type naming conventions

Use these exact mappings to avoid “node type not found” errors:

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

### Schema note (known divergence)

`packages/core/graphSchema.ts` still lists `Include`, `SetVariable`, and `GetVariable` and
**omits** some Epic1 product types. The **canonical engine** executes
`TextBlock | WeightedChoice | Concat | Variable | Template | Output`.
**Include is format-only** ([`docs/include-node-decision.md`](./docs/include-node-decision.md)).
Crosswalk: [`docs/schema-epic1-vocabulary-inventory.md`](./docs/schema-epic1-vocabulary-inventory.md).
Do not assume GraphSchema membership means a node runs in preview.

### PSG vs PSGLib

| Format | Role | Notes |
| --- | --- | --- |
| `.psg` | Fragments / reusable groups | Prefer no Output nodes; `{ x, y }` coords; may have regions. Parser: `packages/core/fileFormats/psg.ts` |
| `.psglib` | Complete presets | `{ position: { x, y } }`; metadata; may include Output. Parser: `packages/core/fileFormats/psglib.ts` |

### Asset validation

```typescript
import { validateAsset } from '@/packages/core/validation/assetValidator';
const result = await validateAsset(fileContent);
if (!result.valid) {
  console.error(result.errors);
}
```

---

## Common commands

### Development

- `pnpm install` — all workspaces
- `pnpm dev` — client (:3000) + server (:8000)
- `pnpm --filter client dev` / `pnpm --filter server dev`
- `pnpm build` — client production bundle
- `pnpm run validate:active` — preferred active-surface confidence lane (when available)

### Testing

- `pnpm test` — root Jest
- `pnpm --filter core test` / `npx jest --config packages/core/jest.config.cjs`
- `npx jest --config server/jest.config.cjs`
- Per-area configs under `packages/core/components/epic1/` and `runtime/nodes/epic1/`

Some legacy suites are stale; **`pnpm typecheck`** is the reliable green signal after changes.

### Code quality

- `pnpm lint`
- `npx knip` — unused files/deps/exports (`knip.json`)

### Automation

Real scripts live under `scripts/` (e.g. `automation-orchestrator.js`, `dev-quality-check.js`).
There is no `src/` multi-agent task dashboard.

---

## Git workflow

**NEVER commit or push unless the user explicitly asks** (e.g. “create a PR”, “commit this”,
“push it”). During regular development, make file changes and stop; let the user decide when to
commit. Prefer a feature branch over the default branch when they do ask.

---

## Architecture (monorepo)

| Package / dir | Role |
| --- | --- |
| `client/` | React 18 + Vite app shell, launch screen, editor container |
| `server/` | Fastify 5 local API (files, LLM, PSG, agent, local image/fragments) |
| `packages/core/` | Shared types, Zod, Epic1 engine, editor UI |
| `packages/asset-browser/` | Asset/preset browser used by the side panel |
| `packages/custom-node-sdk/` | SDK on `runtime/advanced.ts` — not MVP path |
| `api/` | Vercel serverless handlers (deploy compatibility) |

### Editor surface (right panel tabs)

Defined in `client/src/Epic1Editor/editorSurfacePolicy.ts`:

- **Library** — fragments / assets
- **Linked** — reusable linked components
- **Explore** — full PSG-document templates
- **Graph** — outline of current document

### Branding

Wild Construct palette: gold `#e6a23c`, neutral charcoal backgrounds (no blue tint), near-white
text `#f1f6f9`. Do not reintroduce old purple/indigo accents.

---

## Adding a product node type (Epic1 path)

1. Node class under `packages/core/runtime/nodes/epic1/`
2. `case` in `Epic1ExecutionEngine.ts`
3. Schema / registry updates as appropriate (`graphSchema.ts`, `nodeRegistry.ts`)
4. React Flow component + inspector / inline edit
5. Deterministic tests (same seed ⇒ same output)

New options must **default to existing behavior** so saved graphs do not shift.

---

## Security posture (agents)

- Authenticated cloud routes use `server/src/utils/routeAccess.ts` (bearer + capability + quota).
- Admin is opt-in (`ENABLE_ADMIN`). Legacy Vercel admin/debug handlers return 410 via `_disabled.js`.
- Local sandbox routes (`/api/local-image/*`, `/api/local-fragments/*`) are **dev/demo**:
  default bind `HOST=127.0.0.1`, loopback-only preHandler, optional `LOCAL_FRAGMENT_ROOTS`.
  See `server/src/utils/localSandboxAccess.ts` and `.env.example`.
- Cloud tenant isolation still depends on **deployed Supabase RLS** — not fully verified in-repo.
  See `docs/security-posture-pre-beta.md`.

---

## Reference docs

| Doc | Topic |
| --- | --- |
| [`CLAUDE.md`](./CLAUDE.md) | Primary accurate project guide |
| [`ACTIVE_SURFACE.md`](./ACTIVE_SURFACE.md) | Supported vs quarantined surface |
| [`docs/audit-work-loop.md`](./docs/audit-work-loop.md) | Section-by-section audit execution |
| [`docs/parked-implementations/README.md`](./docs/parked-implementations/README.md) | Parked advanced nodes / UX |
| [`docs/launch-known-limitations.md`](./docs/launch-known-limitations.md) | Honest launch limits |
| [`docs/examples-catalog.md`](./docs/examples-catalog.md) | Examples + branch-handle model |
| [`docs/card-normalization-plan.md`](./docs/card-normalization-plan.md) | Card normalization |
| [`docs/server-route-access-policy.md`](./docs/server-route-access-policy.md) | Route access policy |
| `packages/core/graphSchema.ts` | Graph schema (check vs Epic1 engine) |
