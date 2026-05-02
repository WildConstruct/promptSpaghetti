# Strong Typing Assessment

## Assessment Summary

The codebase has a clear split between high-confidence strong typing opportunities and broad legacy noise. The safe wins are concentrated in the active editor, local sandbox, and a few focused tests. The risky area is the older utility/test surface, generated declaration files, and disabled/back-compat scripts, where many `any`/`unknown` usages are tied to historical compatibility layers rather than a single strong source type.

For this pass, I only implemented the replacements where the runtime shape was already clear and the existing code paths could be strengthened without behavior changes.

## Hotspots

### High-confidence runtime/editor hotspots

- `packages/core/types/epic1.ts`
- `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
- `server/src/services/LocalImageSandboxService.ts`
- `server/__tests__/local-image-sandbox-service.test.ts`
- `packages/core/components/epic1/nodes/__tests__/EnhancedBranchingNode.test.tsx`

These files were good candidates because the types are already concrete in the shared contracts or can be inferred directly from existing runtime helpers.

### Lower-confidence / broader cleanup hotspots

- `packages/core/utils/*.d.ts` and other generated declaration surfaces
- `packages/core/components/epic1/**/__tests__/**`
- `tests/utils/**` and `tests/performance/**`
- `.disabled` and `.bak` legacy files
- older helper layers that still use `unknown` at the external JSON boundary

These areas likely need a separate dedicated pass because they mix compatibility scaffolding, test fixtures, and historical patterns. A broad rewrite there would be too risky for a single worker pass.

## High-Confidence Replacements Implemented

### 1. Stronger shared weighted-option contract

- Removed the open-ended index signature from `packages/core/types/epic1.ts`.
- Kept the real runtime fields explicit: `id`, `text`, `weight`, `color?`, and `hasBranch?`.
- This makes the shared option type precise instead of allowing arbitrary shape drift.

### 2. Branching editor now fills ids explicitly

- Updated `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx` so every branch option has a concrete `id`.
- Added ids when:
  - parsing existing JSON options
  - inserting generated choices
  - appending new blank options
- This keeps the stronger shared type intact without weakening the runtime contract.

### 3. Local sandbox service accepts a real typed request

- Changed `server/src/services/LocalImageSandboxService.ts` so `generateBatch` accepts `LocalImageBatchRequest` instead of `unknown`.
- The route layer already validates the payload before calling the service, so this is a safe narrowing.

### 4. File export helper no longer casts through `unknown`

- Removed the `as unknown as` cast in `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`.
- The helper now passes graph data directly into `exportGraphToPSG`, which matches the existing PSG export contract.

### 5. Tests now use precise signatures instead of loose `any`

- Tightened the branch-node test mock in `packages/core/components/epic1/nodes/__tests__/EnhancedBranchingNode.test.tsx`.
- Tightened the local-image sandbox service tests in `server/__tests__/local-image-sandbox-service.test.ts` to use the fetch signature directly.

## Recommendations

1. Keep the next strong-typing pass focused on shared contracts first, then update the callers to match.
2. Prioritize removing weak types from active runtime helpers before touching broad test utilities.
3. Treat generated `.d.ts` files, `.disabled` files, and `.bak` files as separate cleanup buckets; they should not be mixed into the main type-hardening pass.
4. If you need to reduce remaining `unknown` usage, start by replacing boundary casts with explicit parser/validator helpers instead of widening callers.

## Verification

Validated the strengthened areas with:

- `pnpm --filter @promptscape/core test -- --runInBand components/epic1/nodes/__tests__/EnhancedBranchingNode.test.tsx`
- `pnpm --filter server test -- --runInBand __tests__/local-image-sandbox-service.test.ts`
- `pnpm run validate:active`

All of those passed after the type-strengthening changes landed.
