# Release Commit Plan

_Last updated: 2026-03-08_

This note defines the recommended commit slicing for the current MVP worktree.

It assumes:

- the branch is being prepared for MVP demo handoff
- Netlify is the practical frontend target
- Vercel remains a backend/legacy deployment surface until explicitly converged

It intentionally excludes `docs/research/**`.

## Commit 1: Architecture Truth And Repo Hygiene

Purpose:
quarantine stale source-of-truth drift and preserve only the docs that match live product reality.

Include:

- Epic 1 source-of-truth/docs cleanup
  - `packages/core/components/epic1/SOURCE_OF_TRUTH.md`
  - `packages/core/components/epic1/AGENTS.md`
  - `packages/core/components/epic1/ARCHITECTURE.md`
  - `packages/core/components/epic1/REFACTORING_GUIDE.md`
  - `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx`
- archived refactor docs
  - `docs/_archive/technical/refactoring/**`
- cleanup/handoff notes
  - `WINDSURF.md`
  - `docs/llm-stack-migration-plan.md`
  - `docs/metagrinder-main-repo-cleanup-plan.md`
  - `docs/release-commit-plan.md`
  - `server/AGENTS.md`
- Metagrinder fork-boundary preservation files
  - `docs/research/metagrinder-fork-boundary.md`
  - `docs/research/metagrinder-subproject-manifest.json`
  - `docs/research/metagrinder-worktree-prep.md`
  - `scripts/prepare-metagrinder-worktree.sh`

Exclude:

- active runtime code changes
- asset-library churn
- generated `dist/**` output

## Commit 2: LLM Runtime Convergence

Purpose:
capture the shared browser-client migration, runtime-mode work, and the core/server contract changes behind local vs cloud AI behavior.

Include:

- shared/browser LLM surface
  - `packages/core/services/ApiLLMService.ts`
  - `packages/core/services/SimpleLLMService.ts`
  - `packages/core/services/llm/**`
  - `client/src/shims/llm-service.ts`
  - `client/src/components/LaunchScreen/PromptDissector.tsx`
  - `client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts`
- runtime mode / product gating
  - `packages/core/utils/runtimeMode.ts`
  - `packages/core/hooks/useRuntimeMode.ts`
  - `packages/core/hooks/__tests__/useRuntimeMode.test.tsx`
  - `packages/core/tests/utils/runtimeMode.test.ts`
  - `packages/core/hooks/useFeatureGate.ts`
  - `packages/core/hooks/__tests__/useFeatureGate.test.tsx`
  - `packages/core/components/LLMConfigDialog/**`
  - `packages/core/components/LLMToggle/**`
  - `packages/core/components/epic1/contexts/IntelligenceContext.tsx`
- server route/runtime support
  - `server/src/routes/llm.ts`
  - `server/src/services/LLMService.ts`
  - `server/__tests__/llm-routes.test.ts`
- supporting config/tests
  - `.eslintrc.js`
  - `.eslintrc.json`
  - `client/jest.config.js`
  - `packages/core/jest.config.cjs`
  - `packages/core/tests/setupTests.ts`
  - `packages/core/tests/services/ApiLLMService.test.ts`
  - `packages/core/tests/services/BrowserLLMGuard.test.ts`
  - `packages/core/services/LLMParserShowcase.ts`

Review carefully:

- `client/vite.config.ts`
- `client/vite.config.production-safe.ts`
- `client/tsconfig.json`
- `pnpm-lock.yaml`

## Commit 3: PSG API And Demoable Product Surface

Purpose:
ship the MVP product story that people can actually tinker with.

Include:

- PSG contracts/client/services/routes
  - `packages/core/services/psg/**`
  - `packages/core/public.ts`
  - `packages/core/index.ts`
  - `server/src/routes/psg.ts`
  - `server/src/services/PsgService.ts`
  - `server/src/routes/agent.ts`
  - `server/src/services/AgentDraftService.ts`
  - `server/__tests__/psg-routes.test.ts`
  - `server/__tests__/agent-draft-service.test.ts`
- editor/UI flows
  - `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
  - `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
  - `client/src/Epic1Editor/components/SimpleMenuBar.tsx`
  - `client/src/Epic1Editor/components/ComfyExportDialog.tsx`
  - `client/src/Epic1Editor/components/PsgSceneAssetsDialog.tsx`
  - `client/src/Epic1Editor/components/PsgCrowdExpansionDialog.tsx`
  - `client/src/Epic1Editor/components/__tests__/**`
- launch/demo polish
  - `client/src/components/LaunchScreen/**`
  - `client/src/templates/quickStartTemplates.ts`
  - `client/src/components/LaunchScreen/__tests__/**`
- tutorial hardening
  - `packages/core/components/epic1/onboarding/**`
  - `packages/core/components/epic1/NodePalette.tsx`
  - `packages/core/components/epic1/components/PromptWizard.tsx`
  - `packages/core/components/epic1/Epic1GraphEditor.tsx`
- MVP/demo docs
  - `docs/demo-checklist.md`
  - `docs/mvp-finish-plan.md`
  - `docs/mvp-ship-verification.md`
  - `docs/mvp-task-board.md`
  - `docs/examples/mvp-*.psg`
  - `docs/psg-storage-architecture.md`
  - `docs/deployment-current-state.md`
  - `docs/deployment.md`
  - `docs/weekend-mvp-launch-readiness.md`
- deploy scripts
  - `package.json`

Review carefully:

- `packages/core/package.json`
- `packages/asset-browser/public/graphs/manifest.json`
- `tests/performance/fragment-import-visibility.spec.ts`

## Commit 4: Asset Starter Library

Purpose:
ship the curated starter library only after a separate audit.

Include only after review:

- selected `assets/library/**`

Exclude:

- placeholders
- low-value duplicates
- broad library churn not demo-relevant

## Generated Output Policy

Do not blindly commit generated output just because it changed.

Review case by case:

- `packages/core/dist/**`
- `packages/asset-browser/dist/**`
- `packages/custom-node-sdk/dist/**`
- `*.tsbuildinfo`

For the MVP branch, prefer committing generated files only when they are required by an existing package/runtime contract.

## Hold / Later

These should not be mixed into the MVP push without a separate decision:

- `docs/research/**` beyond the retained Metagrinder fork-boundary files
- unresolved asset-library bulk churn
- Vercel runtime migration away from legacy `api/`
- package publishing strategy changes

## Working Rule

If a file does not clearly belong to one of the four commits above, leave it out until it has a specific reason to exist in the release history.
