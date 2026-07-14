# Parked Advanced-Tier Disposition Plan

_Work-loop **C1** · 2026-07-14_  
_Companion to [`parked-implementations/README.md`](./parked-implementations/README.md)._

This is the **actionable keep / move / delete** call for brownfield cleanup.
Algorithms stay captured in the parked README; code disposition is here.

## Rules

1. **Do not delete `packages/core/runtime/advanced.ts`.** Live dependency of
   `@promptscape/custom-node-sdk` (`AdvancedRuntimeNode`, `AdvancedExecutionContext`).
2. **Do not revive parked nodes on AdvancedRuntime for the product path.** Rebuild
   as native Epic1 if needed (see parked README + schema inventory).
3. Deletion is safe only after intent is in docs (already true for the four advanced nodes).
4. Prefer one cleanup PR for dead nodes + `io-system` + stale `nodeSchemas` exports.

---

## Disposition table

| Path | Live consumers? | Disposition | Priority | Notes |
| --- | --- | --- | --- | --- |
| `runtime/advanced.ts` | **Yes** — custom-node-sdk | **KEEP** | — | Never delete without SDK redesign |
| `runtime/expression-evaluator.ts` | Conditional (parked) + own stack | **KEEP for now** | Low | Valuable if Conditional revived as Epic1; verify no other importers before delete |
| `runtime/security-audit-logger.ts` | expression-evaluator, safe-math, Conditional | **KEEP for now** | Low | Security infra; cheap to retain |
| `runtime/safe-math-context.ts` | expression-evaluator | **KEEP for now** | Low | Tied to evaluator |
| `runtime/ast-node-whitelist.ts` | expression security path | **KEEP for now** | Low | Tied to evaluator |
| `runtime/io-system.ts` | Only parked advanced nodes | **DELETE** with nodes | P1 | ~518 lines; not used by Epic1 |
| `runtime/nodes/WeightedAdvanced.ts` | None | **DELETE** | P1 | Mined → `epic1/weightDistribution.ts` |
| `runtime/nodes/Conditional.ts` | None | **DELETE** | P1 | Spec in parked README §2 |
| `runtime/nodes/Sequential.ts` | None | **DELETE** | P1 | Spec in parked README §3 |
| `runtime/nodes/Markov.ts` | None | **DELETE** | P1 | Spec in parked README §4 |
| `runtime/nodes/ImageGenerationNode.ts` | None | **DELETE** | P1 | Orphan Epic 8; no revival spec |
| `runtime/nodes/*Processing*.d.ts` / maps | Orphans | **DELETE** | P1 | Stale artifacts if still present |
| `nodeSchemas.ts` advanced + Subject/Action | UI schemas only | **STRIP** advanced + Subject/Action | P1 | Keep product schemas; see vocabulary inventory |
| `components/epic1/delightful/*` | **0 importers** | **DELETE or quarantine** | P2 | Konami/easter-egg layer; product-optional |
| Parked tests (if any remain ignored) | N/A | **DELETE** | P1 | Already largely removed in forensic cleanup |

### Recommended batch PR (“parked-tier delete”)

Single PR after human approval:

1. Delete the five node files + `io-system.ts` (+ orphan `.d.ts`/maps).
2. Remove advanced / Subject / Action entries from `nodeSchemas.ts`.
3. Grep for broken imports; fix barrels.
4. Run `pnpm --filter core test` + typecheck; knip optional.
5. Leave `advanced.ts` + expression/security stack unless a follow-up proves zero importers.

**Not in that PR:** registry Include `isExecutable` fix (vocabulary honesty PR from A5).

---

## Why not “move to docs/parked-implementations/src”?

Moving bit-rotted TS into docs still costs maintenance and confuses import paths.
Git history + the parked README algorithm tables are enough. **Delete, don’t relocate.**

---

## Expression / security stack decision (deferred)

| Keep if… | Delete if… |
| --- | --- |
| Planning Epic1 Conditional soon | Confirmed zero product importers after node delete + 1 greps greppass |
| custom-node-sdk or tools import them | Only Conditional imported them |

**Default after node delete:** keep for one more sprint; then knip/grep and cull.

---

## WeightedAdvanced special case

Distributions already live on product `WeightedChoiceNode` via
`runtime/nodes/epic1/weightDistribution.ts`. Source file `WeightedAdvanced.ts` adds
no product value → **delete with P1 batch**.

---

## Approval gate

| Role | Asks |
| --- | --- |
| Product | Confirm no near-term need to run Conditional/Sequential/Markov on old runtime |
| Eng | Confirm custom-node-sdk still only needs `advanced.ts` |
| Ops | No deploy impact (client-only dead code) |

Status after C1: plan written.  
**C1 P1 executed 2026-07-14:** parked node sources + `io-system` + orphans deleted;
`nodeSchemas` advanced/Subject/Action stripped; registry Subject/Action removed;
Include `isExecutable: false`. `advanced.ts` + expression/security stack retained.
