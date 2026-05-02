# Unused Code Assessment

## Scope

I checked for unused code with `knip` first, then verified candidates with repository-wide `rg` searches before deleting anything. I avoided generated or runtime-artifact paths such as `packages/core/dist`, `.local-output`, `.local-runtime`, and `node_modules`.

The root `knip` pass could not be used directly because it failed on an unrelated YAML parse error in `.github/workflows/enhanced-ci.yml`, so I ran `knip` per workspace instead:

- `client`
- `server`
- `packages/core`

That was enough to separate dead legacy surfaces from active runtime code.

## Assessment

The unused-code burden is concentrated in older launcher, demo, and recovery surfaces, not in the active editor/server flow. The live surfaces that matter for the MVP lane remain well connected:

- `client/src/Epic1Editor/...`
- `server/src/index.ts` and its route/service graph
- `packages/core/components/epic1/...`
- the local sandbox lane added during the earlier cleanup work

The strongest unused-code signals were files that:

- had no `knip` owners
- had no non-self references in `rg` across runtime, tests, scripts, and docs
- were clear legacy copies or one-off recovery artifacts
- were not part of the active validation lane

## High-Confidence Removals

I removed these files because they were unreferenced and not needed by the active runtime:

### `client/`

- `client/temp-test.ts`
- `client/vite.config.production-safe.ts`
- `client/vite.config.production.js`
- `client/vite.config.production.ts`
- `client/src/boot/BootProgressContext.tsx`
- `client/src/components/Admin/LLMMonitor.tsx`
- `client/src/components/ConsentModal/ConsentModal.tsx`
- `client/src/Epic1Editor/FixEdgeRendering.tsx`
- `client/src/Epic1Editor/hooks/testSupabase.ts`
- `client/src/Epic1Editor/utils/arrayOptimizations.ts`
- `client/src/Epic1Editor/utils/styleUtils.ts`
- `client/src/Epic1Editor/components/AssetLibraryPanel.tsx`
- `client/src/components/LaunchScreen/CompactLaunchDialog.tsx`
- `client/src/components/LaunchScreen/index.ts`
- `client/src/components/LaunchScreen/ParsingLoader.tsx`
- `client/src/components/LaunchScreen/SegmentMarker.tsx`
- `client/src/components/LaunchScreen/PromptDissector/index.tsx`
- `client/src/components/LaunchScreen/PromptDissector/components/TextEditor.tsx`
- `client/src/components/LaunchScreen/PromptDissector/components/Toolbar.tsx`
- `client/src/components/LaunchScreen/PromptDissector/hooks/useHighlightManager.ts`
- `client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts`

### `server/`

- `server/src/admin-panel.ts`
- `server/src/core-bridge.js`
- `server/src/engine-stub.ts`
- `server/src/engine.d.ts`
- `server/src/exporter-clean.ts`
- `server/src/exporter.d.ts`
- `server/src/fileStorage.ts`
- `server/src/minimal-server.js`
- `server/src/minimal-test.ts`
- `server/src/minimal-auth-server.ts`
- `server/src/simple-mock-auth.js`
- `server/src/theme.test.ts`
- `server/src/config/evidence-mapping-config.ts`
- `server/src/exporter/index.ts`
- `server/src/exporter/scene-exporter.ts`
- `server/src/exporter/schemas.ts`
- `server/src/exporter/vfx-exporter.ts`

### `packages/core/`

- `packages/core/components/GraphEditorWithGroups.tsx`
- `packages/core/components/GraphEditorWithRouting.tsx`
- `packages/core/components/StorageErrorBoundary.tsx`

## What I Left Alone

I intentionally did not remove several files that `knip` surfaced because they still have live references in runtime code, tests, or docs:

- `server/src/engine.ts`
- `server/src/exporter.ts`
- `server/src/server-minimal.ts`
- `server/src/index-cleaned.ts`
- `server/src/main-clean.ts`
- `server/src/minimal-db.ts`
- `server/src/mock-auth-server.js`
- `server/src/simple-auth-server.js`
- `server/src/utils/mockRuntimeGuard.ts`
- `server/src/utils/privacy.ts`
- `client/src/components/PerformanceDashboard.tsx`
- `packages/core/components/epic1/preview/PreviewEngine.ts`
- `packages/core/components/epic1/preview/WorkerPool.ts`
- `packages/core/components/epic1/ConnectionToast.tsx`
- `packages/core/components/epic1/EdgeRoutingControls.tsx`
- `packages/core/components/epic1/onboarding/TutorialContext.tsx`

These are either active compatibility surfaces or still documented in repository guidance, so removing them would have been a broader architecture cleanup rather than a safe unused-code deletion.

## Type-Safety Follow-Up

While validating the removals, the stricter weighted-choice typing exposed a real contract mismatch in the branch-node path. I fixed that by aligning the shared option model and normalizing a few call sites:

- `packages/core/components/epic1/nodes/BaseEditableNode.tsx`
- `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx`
- `packages/core/components/epic1/asset-library/presetUtils.ts`
- `packages/core/components/epic1/hooks/useGraphDragDrop.ts`
- `packages/core/components/epic1/hooks/useNodeOperations.ts`

That was not an unused-code removal, but it was necessary to keep the active typecheck green after the cleanup.

## Recommendations

1. Keep using `knip` per workspace until the malformed workflow YAML is fixed or excluded, because the root pass is currently noisy.
2. Treat the legacy `client/` launcher and `server/` recovery files as the next best cleanup cluster, but only after confirming docs and compatibility notes no longer point at them.
3. Continue favoring file-level removals only when both `knip` and repository-wide reference searches agree the code is truly orphaned.
4. Re-run `knip` after the next cleanup wave; there are still more low-value legacy/demo surfaces, but they need a separate review because several are intentionally retained for compatibility or documentation.

## Validation

I ran these checks after the deletions and type-safety fix:

- `pnpm run typecheck:active`
- `pnpm run validate:active`

Both passed.
