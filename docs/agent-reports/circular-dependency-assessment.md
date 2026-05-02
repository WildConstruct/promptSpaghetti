# Circular Dependency Assessment

## Summary

`madge` was not available in this workspace, so I ran a targeted import-graph walk over the active `client`, `server`, and `packages/core` paths and excluded generated/runtime output directories. The scan found three source-level cycles before fixes. Two were service-contract cycles and one was an Epic 1 node-barrel loop.

The highest-confidence fixes were small and mechanical:

- move shared parser contracts out of `PromptParser.ts`
- stop `useMetadataFlip` from importing `EditableNodeData` through the node barrel

After those changes, the targeted graph walk reports zero cycles in the scanned surface.

## Concrete Cycles

1. `packages/core/components/epic1/nodes/index.ts -> packages/core/components/epic1/nodes/TextBlockNode.tsx -> packages/core/components/epic1/hooks/useMetadataFlip.tsx -> packages/core/components/epic1/nodes/index.ts`

   This was a source-level loop caused by a hook importing node data types from the node barrel, while the barrel imports `TextBlockNode`. The fix was to import `EditableNodeData` directly from `BaseEditableNode`.

2. `packages/core/services/PromptParser.ts -> packages/core/services/ParserFallback.ts -> packages/core/services/PromptParser.ts`

   The fallback service only needed parser types, but those types lived in the implementation file. I moved the shared parser contracts into `PromptParserContracts.ts` so the fallback no longer depends on the implementation module.

3. `packages/core/services/PromptParser.ts -> packages/core/services/LLMResponseProcessor.ts -> packages/core/services/PromptParser.ts`

   Same root cause as above: shared response contracts were defined inside the implementation file. Extracting the contracts removed the reverse dependency.

## Near-Cycles And Boundary Smells

- `packages/core/utils/layoutAlgorithms.ts` imports `hasMeasuredDimensions` from `packages/core/components/epic1/nodes/nodePropTypes.ts`.

  This is not a cycle today, but it crosses from shared utils back into the component tree. It is a layering smell because it makes `utils` depend on an Epic 1 component-facing module for a simple dimension helper.

- `packages/core/components/epic1/nodes/droppableNodes.ts` depends on `epic1NodeTypes` from the node barrel.

  This is currently safe, but it is a fragile ownership boundary. If the node barrel ever begins importing droppable variants, the loop will return quickly. Prefer direct node imports for any future extension of this file.

## High-Confidence Fixes Implemented

- Extracted parser shared contracts into `packages/core/services/PromptParserContracts.ts`.
- Updated `PromptParser.ts`, `ParserFallback.ts`, and `LLMResponseProcessor.ts` to depend on the shared contracts instead of each other.
- Changed `packages/core/components/epic1/hooks/useMetadataFlip.tsx` to import `EditableNodeData` from `BaseEditableNode` directly.

## Recommendations

- Keep implementation files thin and move cross-cutting contracts into small sibling modules early.
- Avoid importing shared hook types from the node barrel when the hook is used by a node that the barrel itself exports.
- Keep `packages/core/utils` pointing downward into stable data/helpers, not upward into component-facing node modules.
- If the Epic 1 node registry grows further, consider a dedicated `nodeRegistry.ts` that exports the mapping without re-exporting every concrete node component.

## Validation

- Targeted source-graph walk: zero cycles after the fix set.
- `pnpm --filter @promptscape/core build:types`: passed.
- `pnpm --filter @promptscape/core test -- --runInBand components/epic1/nodes/__tests__/EnhancedBranchingNode.test.tsx`: passed.

## Notes For The Integrator

- I did not touch unrelated dirty worktree changes.
- I did not edit generated artifacts, runtime outputs, or `packages/core/dist`.
- The remaining `layoutAlgorithms.ts` boundary smell is worth a follow-up pass, but it was not a high-confidence cycle fix for this tranche.
