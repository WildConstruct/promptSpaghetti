# HANDOFF — Prompt Spaghetti launch-readiness work

_You are picking up an in-progress effort on branch `claude/codebase-review-refactor-b9xznd`
(PR #17). Read this first, then `docs/compact-readiness-review.md`. Everything below is committed and
pushed; `pnpm typecheck` is green._

## Mission

Get **Prompt Spaghetti** ready for a Wild Construct "Lab" launch: a small, fun, deterministic tool
that turns a node graph into **natural-language prompts** (not tag lists). Reviewed against three
docs — the **Artist's Compact (v003)**, the **"First Two Signals" launch strategy**, and the
**Riggable Production Systems** memo.

### Guiding decisions (don't relitigate)
- Match EraCrowd's *finish*, stay radically simpler. Avoid the Compact's "circuit diagram" warning.
- "Branching" = **constrained variation within a production envelope**, not control flow.
- Fragments are **first-class and meant to grow**; the PSG format carries depth, not the UI.
- Prompts must read as natural language → primary mechanism is a **Template/slot node**
  (sentence skeleton with `{slots}` filled by variation), with smart join rules as a secondary layer.
- The canonical engine is **`Epic1ExecutionEngine`** (client-side). The server `engine-basic` +
  `POST /preview` and the `@promptscape/cli` package are **unused legacy** — do not build on them.

## What's been accomplished (all verified, ~18 commits)

- **Phase 1 — strip-out:** removed ~40 files — junk/temp, the multi-agent ticketing scaffolding,
  dated QA reports, dead code (`client/src/core.tsx`'s missing `ProfessionalIntegration`, the dead
  `usePreviewSeeds` hook, orphaned `node-adapter.ts`), quarantined editor variants, `.bak` files,
  the broken `build-handbook` CI workflow, and duplicate vercel/eslint configs.
- **Phase 2 — engine + schema:**
  - Retired the never-executed **advanced tier** (WeightedAdvanced/Conditional/Sequential/Markov)
    and **PythonTransform** from `packages/core/graphSchema.ts`. Impl files remain parked under
    `runtime/` (still imported by `custom-node-sdk`); only the *schema surface* was cut.
  - Added a **schema-lock guard test** (`runtime/__tests__/graphSchema.lock.test.ts`) pinning the
    node vocabulary to the six executable types.
  - Resolved **"preview == export"** for launch: the UI runs `Epic1ExecutionEngine` client-side on
    the same ReactFlow graph it exports, so parity already holds. The full two-engine merge is
    deferred post-launch — see `docs/engine-unification-design.md`.
- **Phase 3b — natural-language assembly (engine layer, DONE + tested):**
  - `packages/core/runtime/assembly.ts` — pure helpers: `assemble()` (space/comma/Oxford/sentence
    joins, a/an articles, punctuation+whitespace normalization, empty-slot cleanup, dedupe) and
    `fillTemplate()` (the slot-fill primary mechanism). Exported from `packages/core/public.ts`.
  - Wired opt-in `joinStyle`/`dedupe` into `runtime/nodes/epic1/ConcatNode.ts` — **legacy
    space-join stays the default**; prose styles activate only when set.
  - `nodeFactory` carries `joinStyle`/`dedupe` from node data into the runtime.
  - **Proven end-to-end** in `runtime/nodes/epic1/__tests__/naturalLanguage.integration.test.ts`:
    fragments → Concat(`sentence`) → Output yields `"Fierce knight."`, deterministic per seed,
    varying across seeds.
- **Tests:** parked 8 suites that exercise retired/dead tiers. Baseline ≈ **1000/1102** unit tests
  pass. `pnpm typecheck` is the reliable green signal.
- **Docs:** `compact-readiness-review.md` (phased plan), `engine-unification-design.md`,
  `launch-known-limitations.md`.

## Where the roadmap goes next

These were NOT done because they need either a product decision or verification against the running
app (the previous session was headless and couldn't click the UI).

### Decisions needed from Brian (blockers)
1. **Canonical file format:** exported ReactFlow-graph JSON vs. the documented PSG `inputs[]` format
   — they diverge on edges/handles and the variable model (`SetVariable`/`GetVariable` vs unified
   `Variable`). Needed before the full engine merge and before `Include`.
2. **Fragment source for `Include`:** where do included fragments resolve at runtime (library store?
   inline?). The canonical engine does not execute `Include` today.
3. **Default vs opt-in prose join:** should a Merge node default to a natural-language `joinStyle`,
   or stay opt-in (current)? Changing the default affects existing graphs.

### Next implementation slices (verify each against `pnpm dev` preview)
- **Concat join-style inspector control** — smallest UI step; surfaces the existing tested
  `joinStyle`/`dedupe` on the Merge node. (UI lives in `components/epic1/nodes/ConcatNode.tsx`; the
  node uses a single inline edit buffer today, so this needs a small structured-config UI.)
- **Template/slot node** — the chosen primary NL mechanism; runtime helper `fillTemplate` already
  exists and is tested. Needs: `Epic1NodeType` entry, node class, `nodeFactory` case, palette +
  inspector. Follow the "Adding New Node Types" steps in `CLAUDE.md`.
- **Variation node** — vary a fragment across seeds within an envelope.
- **Real `Include`** — once decision #2 is made.
- **Phase 5/6** — cohesive dark theme + inspector polish; showcase template `.psglib` files, a short
  tutorial, and keep `docs/launch-known-limitations.md` current.

## Conventions & gotchas
- **Always keep `pnpm typecheck` green**; run it after each change. It covers core/asset-browser/
  custom-node-sdk (note: `custom-node-sdk` typecheck is effectively a no-op).
- **Backward compatibility:** new node options must default to existing behavior (see how `joinStyle`
  was added) so saved graphs and golden tests don't shift.
- **Stale tests:** several legacy component/node suites (e.g. `ConcatNode.test.ts` calls a
  non-existent `node.validate()`, TextBlock/Output/Variable assert drifted internal APIs). These are
  pre-existing failures — don't assume your change broke them; verify against HEAD first. Don't
  rewrite them just to go green (it can mask real issues) without a reason.
- **`dependency-checks` CI is red** on pre-existing `pnpm audit` debt (129 vulns). Left intentionally
  red — it belongs with the dependabot PRs, not a gate-weakening hack. Don't "fix" it by loosening
  the audit.
- **Vercel** deploys the client only; its PR comments are deploy-status noise.
- **Git:** develop on `claude/codebase-review-refactor-b9xznd`; commit + push; PR #17 already exists
  (draft).

## Quick start
```bash
git checkout claude/codebase-review-refactor-b9xznd && pnpm install
pnpm typecheck      # should be green
pnpm dev            # client :3000, server :8000 — needed to verify UI work
```
