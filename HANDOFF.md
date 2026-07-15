# HANDOFF — Prompt Spaghetti (current tip)

_Last updated: 2026-07-15_

You are picking up product work on **`fix/stabilize-functional-baseline`**.
Read this first, then the links under **Sources of truth**. Do **not** resume
stale Claude branch names (e.g. `claude/codebase-review-refactor-b9xznd` / PR #17)
or epic-task scripts under a phantom `src/` tree — those are gone.

## Branch & merge state

| Item | Value |
| --- | --- |
| **Active tip branch** | `fix/stabilize-functional-baseline` |
| **Recent integration** | PR **#27** (`feat/explore-browser-and-node-actions` stack) merged here (`caab78a81`) |
| **Work loop** | [`docs/audit-work-loop.md`](./docs/audit-work-loop.md) — **Track G complete** (G1–G6) |
| **Known limitations** | [`docs/launch-known-limitations.md`](./docs/launch-known-limitations.md) |

Local tip may be **ahead of origin** with unpushed Track G commits (docs + wizard
reliability + Nested PSG export + teaching pointers). Push/PR only when the human asks.

## Mission (unchanged)

**Prompt Spaghetti** is a Lab-grade, deterministic node tool: graphs produce
**natural-language prompts** (not tag lists). Engine of record is the client-side
**`Epic1ExecutionEngine`**. There is no Fastify `POST /preview` and no
`packages/cli` package in this repo.

### Guiding decisions (don’t relitigate)

- Match EraCrowd’s *finish*, stay radically simpler.
- “Branching” = constrained variation in a production envelope, not control flow.
- Fragments are first-class at **authoring** time (library / Explore / Wizard).
- Primary NL path = **Template** `{slots}` + variation; Merge prose join is secondary.
- Nested PSG / SubPSG = precomp (child composition), **not** `branch-N` handles.

## What’s already on stabilize (post-audit tracks)

| Track | Outcome |
| --- | --- |
| **A** | Trust docs, surface honesty, local sandbox loopback, vocabulary inventory |
| **B** | Template node, output templates, Include = format-only, Merge defaults to `sentence` for new nodes |
| **C** | Parked-tier disposition + P1 deletes; Epic1GraphEditor split plan + extractions |
| **D** | Nested PSG: `documents[]`, SubPSG, tabs, per-doc undo/viewport, Create composition, project export |
| **F** | Fragment Wizard: 161-fragment index, slots[], match top-3, review UI, PSG expand, Add/Replace |
| **G** | Post-#27 productization: limitations + vocabulary truth, wizard load toasts, main-root export, teaching tips, this HANDOFF |

### Product surfaces to know

- **Editor:** `Epic1GraphEditor` / client `Epic1EditorContainer-refactored`
- **Explore:** Nested PSG Intro (`nested_psg_intro`); splash + Explore featured
- **Wizard:** paste → analyze → **Fragment review** → Create (expand `.psg` when available)
- **Save/export:** `exportActiveProjectToPSG` — **main as root** + nested `documents[]`
  (not “active tab as root”). Autosave/recovery may still be single-graph — see limitations.

## Where to look next

There is **no Track H** in the work loop yet. Sensible follow-ups (product pick):

1. **Ship Track G** — structured commit(s) of uncommitted G5/G6 (and push G1–G4 if still local-only); PR if desired.
2. **Smoke** Nested PSG tabs + Wizard review→swap→Create on a clean `pnpm dev`.
3. **Product depth** only if requested: richer Nested PSG authoring, match quality, autosave project export, Supabase RLS external verify (`docs/supabase-rls-verification-runbook.md`).
4. **Do not** rebuild parked advanced nodes on `AdvancedRuntimeNode` — revive as native Epic1 if ever needed.

Operational loop for sectioned work: say `continue work loop` after a new track is added to
`docs/audit-work-loop.md`, or name a slice explicitly.

## Sources of truth

| Doc | Use |
| --- | --- |
| [`CLAUDE.md`](./CLAUDE.md) | Canonical agent architecture (prefer over stale AGENTS legends) |
| [`AGENTS.md`](./AGENTS.md) | Short agent rules + work-loop pointer |
| [`docs/audit-work-loop.md`](./docs/audit-work-loop.md) | Section board + session log |
| [`docs/launch-known-limitations.md`](./docs/launch-known-limitations.md) | Honest launch framing |
| [`docs/schema-epic1-vocabulary-inventory.md`](./docs/schema-epic1-vocabulary-inventory.md) | Executable node set |
| [`docs/nested-psg-precomp-plan.md`](./docs/nested-psg-precomp-plan.md) | Nested PSG design |
| [`docs/fragment-dissection-swap-flow.md`](./docs/fragment-dissection-swap-flow.md) | Wizard fragment flow |
| [`docs/examples-catalog.md`](./docs/examples-catalog.md) | Teaching graphs + Wizard path |
| [`ACTIVE_SURFACE.md`](./ACTIVE_SURFACE.md) | Mounted product surface |
| `packages/core/graphSchema.ts` | Schema truth for vocabulary |

## Conventions & gotchas

- **Git:** never commit/push unless the human asks. Prefer feature branches off stabilize when opening PRs.
- **Typecheck:** keep `pnpm typecheck` green after engine/UI changes.
- **Defaults:** new node options must not silently rewrite old graphs (see Merge `joinStyle` legacy).
- **Tests:** some legacy suites are red against drifted APIs; prefer targeted Jest + typecheck over “fix the world.”
- **`dependency-checks` / audit debt:** pre-existing; don’t weaken gates to greenwash.
- **Deploy:** Netlify client + Vercel `api/**`; Fastify `server/src` is local-dev only.

## Quick start

```bash
git checkout fix/stabilize-functional-baseline
pnpm install
pnpm typecheck
pnpm dev            # client :3000, server :8000
```

Targeted smokes (examples):

```bash
# Nested export + wizard / slot utils (paths vary; use package jest configs)
npx jest --config packages/core/jest.config.cjs --testPathPattern="psgProjectExport|slotFragmentMatch|applySlotSelections" --coverage=false
```
