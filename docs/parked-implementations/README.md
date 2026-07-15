# Parked Node Implementations — Reference & Revival Guide

> **Status:** these node types are **not on the product surface.** Source
> implementations were **deleted in C1 P1** (2026-07). This document is now the
> **only in-repo home** for design intent and algorithms so they can be revived
> deliberately as **native Epic1 nodes** later. Do not reintroduce files on the
> old AdvancedRuntime product path.
>
> See also: [`docs/parked-tier-disposition.md`](../parked-tier-disposition.md),
> [`docs/engine-unification-design.md`](../engine-unification-design.md), and
> `packages/core/graphSchema.ts`.

## Why these are parked

The project went through several runtime architectures over ~a year. The current
**canonical engine is the client-side `Epic1ExecutionEngine`** (`packages/core/runtime/nodes/epic1/`),
which executes a small, deliberately simple node vocabulary: `TextBlock`,
`WeightedChoice`, `Concat`, `Variable`, `Output`.

The nodes below were built on an **older, parallel runtime** —
`AdvancedRuntimeNode` + `AdvancedExecutionContext` (`runtime/advanced.ts`) plus a
typed-IO framework (`io-system.ts`, now deleted). That runtime is **not
interoperable** with the Epic1 engine.

**Important — do not delete `runtime/advanced.ts`.** It remains **live**: the
`@promptscape/custom-node-sdk` package depends on it. Concrete advanced nodes and
`io-system.ts` were removed in C1 P1.

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

`ImageGenerationNode` and sibling multimodal stubs were deleted (forensic pass +
C1 P1). No revival design captured here; start fresh against current model APIs
if pursued. Optional local image sandbox is a separate Fastify/Comfy lane.

---

## Inventory & disposition (post C1 P1)

| Path | Status |
|---|---|
| `runtime/advanced.ts` | **Kept** — custom-node-sdk |
| `runtime/io-system.ts` | **Deleted** C1 P1 |
| `runtime/nodes/WeightedAdvanced.ts` | **Deleted** C1 P1 (mined → `epic1/weightDistribution.ts`) |
| `runtime/nodes/Conditional.ts` | **Deleted** C1 P1 — algorithms above |
| `runtime/nodes/Sequential.ts` | **Deleted** C1 P1 — algorithms above |
| `runtime/nodes/Markov.ts` | **Deleted** C1 P1 — algorithms above |
| `runtime/nodes/ImageGenerationNode.ts` | **Deleted** C1 P1 |
| Multimodal orphan `.d.ts` stubs | **Deleted** C1 P1 |
| `nodeSchemas.ts` advanced + Subject/Action | **Stripped** C1 P1 |

Recoverable from **git history**. This doc remains the revival design source.

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
