# Type Consolidation Assessment

## Assessment Summary

The codebase had a few real type-drift hotspots, but most of the apparent duplication was either generated, intentionally legacy, or semantically different enough that merging it would have added risk instead of reducing it. The strongest consolidation opportunities were the Epic 1 weighted-choice option shape, the Epic 1 keyboard-navigation options, and the asset-browser preset mock used in tests.

The highest-risk pattern was the same data shape being re-declared across live runtime and editor UI files, which makes it easy for one path to drift without the others. That was especially true for `WeightedOption`, which existed separately in runtime nodes and multiple Epic 1 component variants. Keyboard-navigation options had the same issue in the original and refactored hook pair.

## Duplicate Or Fragmented Type Definitions

### High-confidence duplicates

- `WeightedOption` was defined separately in runtime and multiple Epic 1 node components. The shared source of truth is now [packages/core/types/epic1.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/types/epic1.ts>).
- `KeyboardNavigationOptions` was duplicated between [useKeyboardNavigation.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/components/epic1/hooks/useKeyboardNavigation.ts>) and a refactored copy that is already deleted in this worktree. The shared definition now lives in [keyboardNavigationTypes.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/components/epic1/hooks/keyboardNavigationTypes.ts>).
- The test mock in [client/__mocks__/promptAssetBrowser.tsx](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/client/__mocks__/promptAssetBrowser.tsx>) had its own local `Preset` interface that drifted from the asset-browser package contract. It now imports the real preset type from [packages/asset-browser/src/types.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/asset-browser/src/types.ts>).

### Lower-confidence or intentionally separate shapes

- The asset-library preset type in [packages/core/components/epic1/asset-library/types.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/components/epic1/asset-library/types.ts>) is related to, but not the same as, the asset-browser preset type. It models a richer library/preset domain and should only be merged after a deliberate contract review.
- The workspace and `.d.ts` type pairs under [packages/core/types](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/types>) appear to include a mix of source and declaration artifacts. They are not an obvious safe consolidation target from a type-drift standpoint alone.
- Several legacy Epic 1 parallel implementation files are already deleted in this working tree, so I did not treat them as active consolidation targets. That includes the refactored keyboard-navigation hook and the older weighted-choice variants.

## Recommendations

1. Keep shared data-shape contracts in one package-level type module whenever the same fields are consumed by both runtime and UI code.
2. Prefer a shared type module over barrel-local redefinitions for option-like structures that are passed through multiple layers.
3. Treat mock/test-only redefinitions as cleanup opportunities when they mirror a real package contract.
4. Do not merge semantically different preset or workspace types just because their names are similar.
5. Treat legacy parallel implementations as cleanup candidates, but separate that from type consolidation so the risk remains easy to review.

## High-Confidence Changes Implemented

- Added [packages/core/types/epic1.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/types/epic1.ts>) as the shared Epic 1 weighted-option contract.
- Added [packages/core/components/epic1/hooks/keyboardNavigationTypes.ts](</C:/Users/behmb/Documents/Cascade%20Projects/prompt_spaghetti/packages/core/components/epic1/hooks/keyboardNavigationTypes.ts>) for the shared keyboard-navigation options contract.
- Repointed the active Epic 1 weighted-choice implementations to the shared weighted-option type.
- Repointed the active Epic 1 keyboard-navigation hook to the shared keyboard-navigation type. The deleted refactored copy is not part of the current worktree.
- Repointed the asset-browser test mock to the real preset type from the asset-browser package.

## Residual Risks For The Main Integrator

- `packages/core/components/epic1/asset-library/types.ts` remains intentionally separate. If product ownership later decides the asset-browser preset and asset-library preset should be one contract, that should happen as a dedicated refactor with consumer review.
- The `packages/core/types` directory still contains declaration-style files that may not be worth touching in a type-consolidation pass unless their provenance is clarified first.
