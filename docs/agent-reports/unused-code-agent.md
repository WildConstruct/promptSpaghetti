# Unused Code Agent Report

## Scope

Batch 1 / Agent 3 focused on unused TypeScript/JavaScript exports, imports, and dead symbols. I did not delete whole files. File-level removals below are candidates for parent confirmation only.

The worktree was already dirty at the start of this pass, with many modified, deleted, and untracked files. I treated that state as user/team-owned and kept implementation changes to two in-file export-surface reductions.

## Tooling Run

- `corepack pnpm validate:unused`
  - Passed with no findings. This script runs `knip --config knip.json --no-progress --production --files --no-config-hints`, so it is a production file-reachability gate.
- `.\node_modules\.bin\knip.cmd --config knip.json --no-progress --production`
  - Reported dependency-level noise, 3 unresolved declaration-only imports under `packages/core/types/index.d.ts`, and one duplicate declaration export in `packages/core/utils/PerformanceMonitor.d.ts`.
- `.\node_modules\.bin\knip.cmd --config knip.json --no-progress --include exports,types,enumMembers,namespaceMembers,duplicates --reporter compact --no-exit-code`
  - Reported many unused exported symbols. Most are public API surfaces, demo/onboarding modules, package barrels, generated declarations, or currently unowned legacy files and should not be removed inside this subagent.
- `.\node_modules\.bin\knip.cmd --config knip.json --no-progress --files --reporter compact --no-exit-code`
  - Reported a large file-level candidate set. I did not delete those files per subagent safety instructions.
- `rg --no-ignore ...`
  - Used to verify edited symbols had no external source references outside their defining files.

## Implemented Cleanup

These were high-confidence in-file cleanups because the symbols were only used inside the defining module:

- `client/src/Epic1Editor/localSandboxPromptDerivation.ts`
  - Removed `export` from local sandbox default constants:
    - `LOCAL_SANDBOX_TREE_NEGATIVE_PROMPT`
    - `LOCAL_SANDBOX_TREE_DEFAULT_COUNT`
    - `LOCAL_SANDBOX_TREE_DEFAULT_START_SEED`
    - `LOCAL_SANDBOX_TREE_LABEL_PREFIX`
- `client/src/Epic1Editor/editorSurfacePolicy.ts`
  - Removed `export` from internal policy types/interfaces:
    - `EditorSurfaceId`
    - `EditorSurfaceTier`
    - `EditorSurfaceAvailability`
    - `EditorSurfaceDefinition`
    - `EditorSurfacePolicy`
    - `EditorSurfacePolicyArgs`

I left `LOCAL_SANDBOX_TREE_PROMPT`, `DerivedSandboxRequest`, and `deriveLocalSandboxRequestFromGraph` exported because they have live imports from the editor container, dialog, capture code, and tests.

## Critical Assessment

The current unused-code signal is split into two very different groups:

1. Active production reachability is currently clean under the configured `validate:unused` gate.
2. Broader export and file reports still show a large legacy/demo/public-surface inventory that needs owner review before deletion.

The most important caution is that Knip reports many symbols as unused because they are exported for package boundaries, tests, docs, future compatibility, or declaration files. Removing them mechanically would risk breaking consumers or parallel cleanup work. The safe local action in this pass was to reduce accidental exports in active client files, not to prune broad package APIs.

Dependency findings from the full production Knip run look noisy in this monorepo because the configured entry/project graph does not model every workspace package boundary, config consumer, generated artifact, or runtime-loaded package. Treat dependency removals as a separate package-maintainer task.

## File-Deletion Candidates For Parent Confirmation

Do not delete these from this subagent. They are candidates because `knip --files` reported them and many appear to be legacy/demo/admin surfaces, but they need confirmation against docs, dynamic entry points, and other agents' current work.

### Client candidates

- `client/src/Epic1Editor/GraphEditorWithTray.tsx`
- `client/src/admin/ThemeCustomizer/ThemeCustomizerPage.tsx` and adjacent `ThemeCustomizer` section files
- `client/src/components/PerformanceDashboard.tsx`
- `client/src/core.tsx`
- `client/src/epic1-loader.ts`
- `client/src/services/fileService.ts`
- `client/src/services/templateService.ts`
- `client/src/shims/openai.ts`
- `client/src/types/PolicyAssignmentTypes.ts`
- `client/src/utils/clientPerformanceProfiler.ts`

### Asset browser candidates

- `packages/asset-browser/src/components/ProAssetBrowserSimple.tsx`
- `packages/asset-browser/src/hooks/useColumnResize.ts`
- `packages/asset-browser/src/hooks/usePresetLibrary.ts`
- `packages/asset-browser/src/hooks/useResizable.ts`
- `packages/asset-browser/src/services/workers/preview.worker.ts`
- `packages/asset-browser/src/services/workers/thumbnail.worker.ts`
- `packages/asset-browser/src/utils/ThumbnailLoader.tsx`
- `packages/asset-browser/src/utils/contentHash.ts`
- `packages/asset-browser/src/utils/useThumbnailCache.ts`

### Core candidates

- `packages/core/components/AssetBrowser/AssetMatchIndicator.tsx`
- `packages/core/components/AssetBrowser/DragDropHandler.tsx`
- `packages/core/components/Canvas/BatchProgressOverlay.tsx`
- `packages/core/components/Inspector/AdvancedFeatures.tsx`
- `packages/core/components/PreviewTray/VirtualResultsList.tsx`
- `packages/core/components/PromptInput/ParserToggle.tsx`
- `packages/core/components/demo/AssetBrowserMvpDemo.tsx`
- `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx`
- `packages/core/components/epic1/GraphEditorWorkspace.tsx`
- `packages/core/components/epic1/KeyboardNavigableEditor.tsx`
- `packages/core/components/epic1/_quarantined/Epic1GraphEditorFinal.quarantined.tsx`
- `packages/core/components/epic1/examples/*`
- `packages/core/runtime/nodes/epic1/examples/*`
- `packages/core/runtime/nodes/examples/WeightedAdvancedExample.ts`
- `packages/core/services/SimpleLLMService.ts`
- `packages/core/services/TreeBuilder.ts`
- `packages/core/utils/performance/example-integration.tsx`

### Server candidates

- `server/src/engine.ts`
- `server/src/exporter.ts`
- `server/src/index-cleaned.ts`
- `server/src/main-clean.ts`
- `server/src/minimal-db.ts`
- `server/src/mock-auth-server.js`
- `server/src/server-minimal.ts`
- `server/src/server-tls.ts`
- `server/src/utils/privacy.ts`

Server candidates are especially risky because several may be compatibility entry points, route smoke fixtures, or deployment recovery surfaces. Confirm against docs and package scripts before deleting.

## Remaining Recommendations

1. Keep `validate:unused` as the fast production reachability gate, but do not treat it as complete unused-symbol coverage.
2. Add a separate owner-reviewed cleanup lane for package exports and `.d.ts` declaration artifacts. Many Knip export findings are API-shape decisions rather than obvious dead code.
3. Exclude generated bundles such as `client/dist/**` from ad hoc `rg --no-ignore` verification unless intentionally inspecting build output.
4. Review `packages/core/types/index.d.ts` unresolved declaration imports for `PromotionTypes`, `TrustTypes`, and `EnforcementTypes`; these look stale but are declaration-only and outside this subagent's safe edit set.
5. Review duplicate named/default exports as a style/API cleanup after package owners decide whether default exports remain supported.

## Validation

- `corepack pnpm validate:unused`
  - Passed.
- `corepack pnpm typecheck:active`
  - Passed.
- `corepack pnpm test -- --runTestsByPath client/src/Epic1Editor/__tests__/editorSurfacePolicy.test.ts client/src/Epic1Editor/__tests__/localSandboxPromptDerivation.test.ts`
  - Failed in the sandbox with `Error: spawn EPERM` from Jest worker startup.
- Escalated retry of the same root Jest command
  - Failed with `No tests found` because the root Jest config only includes package-owned projects and does not include the client project.
- `corepack pnpm --filter client test -- --runTestsByPath src/Epic1Editor/__tests__/editorSurfacePolicy.test.ts src/Epic1Editor/__tests__/localSandboxPromptDerivation.test.ts --runInBand`
  - Passed: 2 suites, 4 tests.
