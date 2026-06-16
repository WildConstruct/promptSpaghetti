# Parked Node Implementations — Reference & Revival Guide

> **Status:** these node types are **not on the product surface.** They are not in
> `AnyNodeSchema`, not in the node registry, and not executed by the canonical
> engine. This document preserves their **design intent and algorithms** so they
> can be revived deliberately later, because the source files themselves have
> **bit-rotted** (missing braces, `string` where `string[]` belongs, JSDoc spliced
> mid-declaration — almost certainly damage from the now-deleted `scripts/maintenance/`
> auto-fixers). Treat the code as a lossy artifact; treat **this doc as the spec.**
>
> See also: [`docs/engine-unification-design.md`](../engine-unification-design.md)
> (why the advanced tier was retired) and the note in `packages/core/graphSchema.ts`.

## Why these are parked

The project went through several runtime architectures over ~a year. The current
**canonical engine is the client-side `Epic1ExecutionEngine`** (`packages/core/runtime/nodes/epic1/`),
which executes a small, deliberately simple node vocabulary: `TextBlock`,
`WeightedChoice`, `Concat`, `Variable`, `Output`.

The nodes below were built on an **older, parallel runtime** —
`AdvancedRuntimeNode` + `AdvancedExecutionContext` (`runtime/advanced.ts`) plus the
typed-IO framework (`runtime/io-system.ts`). That runtime is **not interoperable**
with the Epic1 engine: the engine cannot execute an `AdvancedRuntimeNode`. So these
nodes are stranded — present in the tree, reachable by nothing.

**Important — do not delete `runtime/advanced.ts`.** Unlike the nodes, `advanced.ts`
is **live**: the `@promptscape/custom-node-sdk` package depends on it
(`CustomNodeAdapter extends AdvancedRuntimeNode`; `SecurityManager`, `MockContext`,
`TestHarness` all consume `AdvancedExecutionContext`). It is exported from the core
barrel and is part of the active surface. Only the **concrete advanced nodes** and
**`io-system.ts`** (which only those nodes use) are dead weight.

## Revival principle

**Do not resurrect the old runtime.** If you want one of these capabilities, rebuild
it as a **native Epic1 node** (mirror `WeightedChoiceNode` / `ConcatNode`: extend the
Epic1 base, add a `case` in `Epic1ExecutionEngine`, add it to `AnyNodeSchema`, the
registry, and an inspector editor). Use the algorithms captured below as the design;
do not port the `AdvancedRuntimeNode` plumbing.

> The **weighted-choice distributions** below are the first capability being mined
> this way — ported as native options on the live `WeightedChoiceNode` rather than by
> reviving `WeightedAdvancedNode`. The other three remain captured here only.

---

## 1. WeightedAdvanced — distribution-aware weighted choice

**Capability:** weighted selection where the raw weights are first reshaped by a
distribution function before the standard cumulative pick. Lets a single node go from
flat proportional choice to "sharpen toward the favorites" or "bias by position."

**Algorithms (verbatim intent, de-rotted):**

| Distribution | Transform applied to each option weight | Params (defaults) | Effect |
|---|---|---|---|
| `linear` | `w` (identity) | — | Same as today's WeightedChoice. |
| `exponential` | `w ** factor` | `factor` (1.5–2) | `factor > 1` sharpens toward heavy options; `< 1` flattens toward uniform. A "temperature" knob. |
| `gaussian` | `w * exp(-0.5 * ((x - mean)/std)^2)` where `x = index / (n-1)` | `mean` (0.5), `std` (0.2) | **Biases by option _position_ in the list, not by weight magnitude** — favors options near `mean`. Unusual for a weighted choice; revisit semantics before exposing. |
| `custom` | (placeholder — never implemented) | — | Reserved. |

After transform, optional `minWeight` floor and `normalize` (divide by total — note:
normalization does **not** change selection probabilities, since the cumulative pick
already divides by the running total). Selection itself: seeded PRNG, cumulative walk.

**Revival:** ✅ in progress — see `runtime/nodes/epic1/weightDistribution.ts` and the
`distribution` field on `WeightedChoiceNode`. `exponential` is the clearly-useful one;
`gaussian`'s position-bias semantics are flagged for a product decision.

## 2. Conditional — expression-based branching

**Capability:** route output based on evaluated boolean expressions over variables
(`{var} > 5`, `startsWith(name, "A")`, etc.), with the first matching branch winning
and a default fallback.

**Notable surface:** shipped with a **sandboxed expression evaluator**
(`runtime/expression-evaluator.ts` → `SafeExpressionEvaluator`) and a security-audit
layer (`runtime/security-audit-logger.ts`) that blocked `eval`, `constructor`,
prototype-pollution, etc. That safety machinery is the expensive, valuable part if
this is revived.

**Revival:** rebuild as an Epic1 node; reuse the expression-evaluator + audit logger
(verify those two files' own status first — they may also be parked). The branch model
maps onto the engine's existing `branch-N` source-handle routing.

## 3. Sequential — stateful sequence processing

**Capability:** emit items from a list in order across executions, with patterns:
`linear` (advance once each run), `cyclical` (wrap around), `random` (optionally
no-repeat), `weighted` (per-item weights). Maintains a cursor/state between runs.

**Catch:** this needs **persistent per-node state across executions**, which the
current stateless preview model doesn't carry. Reviving it means deciding where
sequence state lives (node data? a run context that survives re-preview?). That's the
real design question, not the selection logic.

## 4. Markov — state-transition generation

**Capability:** generate a sequence by walking a state-transition matrix (state →
weighted next-states), with termination conditions (max length, terminal states) and
loop detection.

**Revival:** the matrix walk is straightforward and seedable; like Sequential it needs
a home for chain state. Good fit only if there's a product use for stochastic chained
generation.

---

## Multimodal remnants (separate, Epic 8)

`runtime/nodes/ImageGenerationNode.ts` (~375 ln) is orphaned, and its siblings
(`AudioProcessingNode`, `VideoProcessingNode`, `CrossModalNode`) were already
source-deleted — only stale `.d.ts`/maps lingered (cleaned up in the forensic pass).
These are a different feature line (genAI multimodal) with no live consumers. No
revival design captured here; start fresh against current model APIs if pursued.

---

## Inventory & disposition

| Path | Lines | Live? | Disposition |
|---|---|---|---|
| `runtime/advanced.ts` | 330 | **Yes (custom-node-sdk)** | **Keep.** Do not delete. |
| `runtime/io-system.ts` | 518 | No (only parked nodes) | Delete with the nodes, or keep if a future advanced node will use typed IO. |
| `runtime/nodes/WeightedAdvanced.ts` | 267 | No | Mined → see live `weightDistribution.ts`. Safe to delete after. |
| `runtime/nodes/Conditional.ts` | 336 | No | Captured. Delete or keep-as-reference. |
| `runtime/nodes/Sequential.ts` | 307 | No | Captured. Delete or keep-as-reference. |
| `runtime/nodes/Markov.ts` | 398 | No | Captured. Delete or keep-as-reference. |
| `runtime/nodes/ImageGenerationNode.ts` | 375 | No | Orphaned Epic 8 remnant. |
| `nodeSchemas.ts` advanced schemas | ~60 | No | Delete with the nodes. |

> Everything above is recoverable from git history regardless — this doc exists so the
> *intent* survives even when the files don't.

---

## Parked UX subsystem — "delightful" features

Separate from the runtime nodes above: `packages/core/components/epic1/delightful/`
is a self-contained **"delight" UX layer** (Konami-code easter eggs, playful loading
states, unexpected micro-animations). It is **fully parked — 0 live importers.** None
of `DelightfulIntegration`, `EasterEggManager`, `PlayfulLoadingStates`, or
`UnexpectedAnimations` is mounted anywhere in the app.

| Path | Live? | Notes |
|---|---|---|
| `delightful/DelightfulIntegration.tsx` | No (0 importers) | Top-level wrapper that wires the others together. The single re-entry point if revived. |
| `delightful/EasterEggManager.tsx` | No | Konami-sequence detector + reward animations. |
| `delightful/PlayfulLoadingStates.tsx` | No | `PlayfulLoadingStates`, `PlayfulProgressBar`. |
| `delightful/UnexpectedAnimations.tsx` | No | Random celebratory flourishes; exports `celebrateNodeClick`. |
| `delightful/__tests__/DelightfulFeatures.test.tsx` | Runs, passes | Kept. It's the **executable spec** for the parked layer — read it to see intended behavior before reviving. |

**Why this is kept, not deleted:** the code is coherent and the test passes; it was
flagged for *revisit*, not removal. To revive, mount `<DelightfulIntegration>` near the
canvas root and verify against the existing test. To retire instead, delete the
`delightful/` folder and its test together (nothing else imports it).

> **Not parked — leave alone:** the neighboring `animations/MicroInteractions.tsx`
> (haptics, `triggerHaptic`, `useMicroInteractions`) and `interactions/`
> (`MagneticSnapHandler`, `NodeInteractionEnhancer`) **are wired live** (2 and 1
> importers respectively). Their shared test
> `interactions/__tests__/MicroInteractions.test.tsx` is real coverage of shipped
> behavior — do not confuse it with the parked delight layer.
