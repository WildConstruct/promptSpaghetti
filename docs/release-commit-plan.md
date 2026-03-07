# Release Commit Plan

_Last updated: 2026-03-07_

This note defines the recommended commit slicing for the current worktree.

It intentionally excludes `docs/research/**`.

## Commit 1: Repo Cleanup

Purpose:
reduce old cruft, quarantine misleading legacy surfaces, and remove tracked generated output.

Include:

- `.gitignore`
- `ACTIVE_SURFACE.md`
- `docs/qa/legacy-quarantine-plan.md`
- `legacy/epic1-build/**`
- `legacy/maintenance-fixers/**`
- `legacy/server/index-minimal.ts`
- deletions for:
  - tracked `.turbo` log files
  - tracked `*.tsbuildinfo`
  - `test-results/.last-run.json`
  - `docs/content-authoring-handbook/_build/**`
  - `performance-test-results/**`
  - `coverage-reports/**`
  - `validation-coverage/lcov-report/**`
- deletions for old root locations now moved into `legacy/`
  - `vite.epic1.config.ts`
  - `tsconfig.epic1.json`
  - `scripts/build-epic1.js`
  - `scripts/build-epic1-simple.js`
  - `scripts/comprehensive-parsing-fix.js`
  - `scripts/fix-structural-parsing-issues.js`
  - `scripts/fix-remaining-parsing-errors.js`
  - `scripts/deprecate-non-epic1.js`
  - `scripts/maintenance/comprehensive-fix.js`
  - `scripts/maintenance/fix-priority-components.js`
  - `server/src/index-minimal.ts`

Do not include:

- active MVP code changes
- asset-library churn
- `packages/*/dist`

## Commit 2: MVP Product Surface

Purpose:
capture the actual release behavior changes for PSG-first flow, import reliability, product honesty, and launch gating.

Include:

- `client/src/Epic1Editor/**`
- `client/src/shims/**`
- `client/src/components/LaunchScreen/**`
- `packages/asset-browser/src/**`
- `packages/asset-browser/tests/**`
- `packages/core/fileFormats/**`
- `packages/core/runtime/**`
- `packages/core/components/epic1/**`
- `packages/core/utils/psgCodec.ts`
- `packages/core/index.ts`
- `packages/core/public.ts`
- `packages/core/jest.config.cjs`
- `packages/core/package.json`
- `packages/core/services/agenticGraph.ts`
- `server/src/routes/agent.ts`
- `server/src/services/AgentDraftService.ts`
- `server/__tests__/agent-draft-service.test.ts`
- `tests/performance/fragment-import-visibility.spec.ts`
- `tests/performance/age-indicator-region-resize.spec.ts`
- `playwright.config.ts`
- PSG/MVP docs:
  - `docs/asset-creation-guide.md`
  - `docs/fragment-system-architecture.md`
  - `docs/psg-weekend-mvp-contract.md`
  - `docs/mvp-task-board.md`
  - `docs/weekend-mvp-launch-readiness.md`
  - related PSG routing/audit notes

Review carefully before commit:

- `server/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `packages/core/dist/**`
- `packages/asset-browser/dist/**`
- `packages/custom-node-sdk/dist/**`

These may contain a mix of intentional release updates and older unrelated drift.

## Commit 3: Asset Starter Library

Purpose:
ship a curated starter fragment set for the asset browser.

Include only after audit:

- selected `assets/library/**`
- `assets/library/asset-fragments-manifest.json`
- mirrored public manifest or preset files if needed
- any asset-browser docs tied directly to the starter set

Exclude:

- placeholders
- low-value duplicates
- legacy-dependent fragments
- bulk churn not reviewed for release

## Hold / Later

These should not be mixed into the release push without a separate decision:

- `docs/research/**`
- metagrinder / rainy-alley prototype files
- `packages/*/dist` policy changes
- package publishing strategy changes

## Working Rule

If a file does not clearly belong to one of the three commits above, do not force it in.

That ambiguity is a signal to review it separately instead of diluting the release history.
