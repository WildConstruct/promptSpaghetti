# Legacy, Fallback, and Parallel Path Cleanup - Batch 2 / Agent 7

## Scope

Reviewed active code under `client/src`, `packages/core`, `packages/asset-browser`, `server/src`, and package-referenced scripts for deprecated, legacy, fallback, compatibility, stub, mock, old/replacement, and parallel implementation paths.

Primary sweeps:

- `rg -i "deprecated|legacy|fallback|compat|stub|mock|old|new implementation|replacement|TODO|temporary|refactor|backup" ...`
- script/package entrypoint checks across root, client, core, asset-browser, and server package manifests
- targeted reference checks for disabled source files and alternate server entrypoints

## Implemented Cleanup

Removed high-confidence dead historical artifacts:

- `client/src/hooks/usePerformanceProfiler.ts.disabled`
- `client/src/services/__tests__/fileService.integration.test.ts.disabled`
- `packages/core/python-executor-client.ts.disabled`
- `packages/core/runtime/nodes/PythonTransform.ts.disabled`
- `packages/core/utils/PerformanceMonitor.ts.disabled`
- `packages/core/utils/grouping.ts.disabled`
- `packages/core/utils/nodeDataUtils.ts.disabled`
- `packages/core/utils/performance.ts.disabled`
- `packages/core/utils/projectSerialization.ts.disabled`
- `packages/core/utils/workPreservation.ts.disabled`

Proof: all were tracked `.disabled` files, not package script targets, and not active import targets. Several contained malformed TypeScript from earlier repair attempts, so keeping them only preserved stale parallel implementations.

Removed stale/deprecated declaration shims:

- `packages/asset-browser/types/promptscape_core_psg.d.ts`
- `packages/asset-browser/types/promptscape_core_utils.d.ts`
- `packages/core/runtime/nodes/PythonTransform.d.ts`
- `packages/core/runtime/nodes/PythonTransform.d.ts.map`

Proof: the asset-browser shims contained comments only. `PythonTransform.d.ts` described the removed disabled implementation and was exported only by the stale source-adjacent `packages/core/runtime/index.d.ts`; that stale export was removed.

Removed unreferenced alternate server runtimes:

- `server/src/index-cleaned.ts`
- `server/src/main-clean.ts`
- `server/src/minimal-db.ts`
- `server/src/server-minimal.ts`
- `server/src/mock-auth-server.js`
- `server/src/utils/mockRuntimeGuard.js`
- `server/src/utils/mockRuntimeGuard.ts`

Proof: `server/package.json` points to `src/index.ts`; the server TypeScript config includes `src/index.ts`, `src/engine-basic.ts`, routes, services, utils, and globals, but not these alternate root entrypoints. `rg` found no package script or active import references except self-contained references among the deleted alternate files.

## Classifications

### Remove-now

- `.disabled` source/test files in client/core: historical disabled implementations, unreferenced and not build inputs.
- Empty asset-browser deprecated type shims: no declarations, no runtime value, safe to remove.
- Alternate server entrypoints and mock auth runtime: unreferenced parallel server paths outside the active server entrypoint/config.

### Supported Compatibility

- `packages/core/fileFormats/psg.ts` and `packages/core/fileFormats/psgRepair.ts`: legacy PSG normalization, edge-handle repair, and compatibility parsing preserve existing user data formats. Do not remove without a migration plan and fixture coverage.
- `packages/core/public.ts`: legacy graph-wrapper PSG codec exports are explicitly compatibility-preserving public API.
- React Flow / drag-and-drop compatibility fallbacks in Epic 1 editor hooks and nodes: these are browser/API compatibility paths, not old product paths.
- Feature fallback UI such as gated-feature fallbacks and changelog fallback content: supported safe degradation.

### Test/Mock Fixtures

- Jest mocks under `client/__mocks__`, `packages/core/tests/mocks`, and `packages/asset-browser/tests/styleMock.js` are active test harness support.
- In-test `mock*` identifiers and fixtures are not cleanup targets unless the owning test is removed by a test-focused task.

### Generated / Publish Compatibility Artifacts

- `packages/core/dist/**` and publish-compat scripts are generated/publish-compat output covered by `scripts/artifacts/generatedArtifactPolicy.mjs` and `refresh:publish-compat`.
- Source-adjacent generated declaration files under `packages/core/**/*.d.ts` remain a broader artifact-policy concern. I only touched the PythonTransform declaration because it pointed directly at the removed disabled implementation.

### Deferred

- `PythonTransform` remains in `packages/core/graphSchema.ts` and generated JS schema files. Removing schema acceptance could break saved graph data, so it should be handled as a deliberate node-format migration or explicit deprecation pass.
- `packages/core/config/python-executor.ts` still contains Python executor config/fallback settings. It is not obviously wired to an active runtime after the disabled PythonTransform cleanup; recommend a follow-up owner decide whether this is future-facing config or removable.
- `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx` is documented as historical exploratory refactor, but repo-local AGENTS/SOURCE_OF_TRUTH say not to revive it. It should be deleted only after checking public barrels/examples in the same change.
- `packages/core/components/epic1/nodes/EnhancedBoundingBox.tsx` wraps the folder implementation for compatibility. Leave as a compatibility facade unless imports are migrated in one focused pass.
- Many `scripts/maintenance/*` repair scripts are historical fixers, but they are outside package-script active paths and should be handled by a dedicated scripts archive/delete pass.

## Validation Notes

Reference checks after deletion found no references to the deleted server alternates, mock runtime guard, disabled source filenames, or empty asset-browser shim filenames.

Validation run:

- `& .\node_modules\.bin\tsc.CMD -p server\tsconfig.json --noEmit` passed.
- `& .\node_modules\.bin\tsc.CMD -p packages\asset-browser\tsconfig.json --noEmit` failed on pre-existing dirty file `packages/asset-browser/src/hooks/useSectionResize.ts(124,14)`: callback parameter type mismatch against `(...args: unknown[]) => void`.
- Targeted `rg` dangling-reference check for deleted filenames returned no matches.
- `pnpm --filter ...` validation could not run in this shell because `pnpm` was not on PATH; direct local `tsc.CMD` checks were used instead.

Remaining `PythonTransform` hits are schema/data-format compatibility only:

- `packages/core/graphSchema.ts`
- generated schema JavaScript files
- generated project serialization JavaScript

These were intentionally deferred to avoid silently rejecting existing graph data.
