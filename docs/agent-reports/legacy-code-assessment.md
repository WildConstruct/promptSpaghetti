# Legacy Code Assessment

## Critical Assessment

The active Epic 1 surface is mostly cleanly centralized, but the repository still carries several parallel implementation files that are now pure maintenance noise. The main pattern is not broad architectural duplication; it is orphaned legacy variants that were left behind while the canonical editor and node paths converged on `Epic1GraphEditor`, `EnhancedBranchingNode`, and the Epic 1 barrel exports.

The good news is that the high-confidence cleanup set is narrow. The risky areas are the same ones that should be left alone for now: parser fallback handling, compatibility wrappers around external inputs, and quarantined historical snapshots. Those paths still serve a purpose as boundary handlers or documentation of older formats, so they should be narrowed only when there is a replacement path with the same coverage.

`knip` and `madge` were not available in this workspace, so the assessment relies on import tracing, barrel exports, and the Epic 1 source-of-truth docs. That was enough to isolate the dead wrappers and distinguish them from legitimate compatibility code.

## Legacy / Fallback Hotspots

1. Legacy weighted-choice implementations are still present as standalone files, but they are not imported by the active Epic 1 barrel or the current node registry:
   - `packages/core/components/epic1/nodes/EnhancedWeightedChoice.tsx`
   - `packages/core/components/epic1/nodes/ImprovedWeightedChoiceNode.tsx`
   - `packages/core/components/epic1/nodes/WeightedChoiceNodeFixed.tsx`
   - `packages/core/components/epic1/nodes/EnhancedBranchingNode2.tsx`

2. Redundant Epic 1 barrel variants are still checked in even though the active barrel already owns the node exports:
   - `packages/core/components/epic1/nodes/index-original.ts`
   - `packages/core/components/epic1/nodes/index-no-css.ts`

3. The keyboard-navigation refactor file appears to be documentation-only and is not imported by the active Epic 1 shell:
   - `packages/core/components/epic1/hooks/useKeyboardNavigation.refactored.ts`

4. Compatibility and fallback handling that should remain for now because it still serves an active boundary role:
   - `packages/core/services/ParserFallback.ts`
   - `packages/core/services/PromptParser.ts`
   - PSG legacy import normalization and repair paths
   - local-sandbox and deploy compatibility notes in docs

## Recommendations

1. Remove the orphaned legacy Epic 1 node variants and redundant barrel copies entirely so there is a single supported implementation path for the active node set.
2. Remove the unused keyboard-navigation refactor file now that `useKeyboardNavigation.ts` and `keyboardNavigationTypes.ts` own the active contract.
3. Keep parser fallback and legacy import-repair code in place for now, because those paths still handle real malformed or older inputs and are not pure dead code.
4. Leave quarantined editor snapshots and compatibility docs alone in this pass; they are intentionally fenced off and are not part of the supported runtime surface.
5. Use the Epic 1 source-of-truth docs as the gate for future cleanup so that any replacement path is validated before the old one is deleted.

## High-Confidence Removals

- `packages/core/components/epic1/nodes/EnhancedWeightedChoice.tsx`
- `packages/core/components/epic1/nodes/ImprovedWeightedChoiceNode.tsx`
- `packages/core/components/epic1/nodes/WeightedChoiceNodeFixed.tsx`
- `packages/core/components/epic1/nodes/EnhancedBranchingNode2.tsx`
- `packages/core/components/epic1/nodes/index-original.ts`
- `packages/core/components/epic1/nodes/index-no-css.ts`
- `packages/core/components/epic1/hooks/useKeyboardNavigation.refactored.ts`

## Deferred / Lower-Confidence Items

- `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx`
- `packages/core/components/epic1/Epic1GraphEditorFinal.tsx` and `_quarantined/`
- parser fallback and prompt-repair paths
- any docs-only mentions of deprecated surfaces
