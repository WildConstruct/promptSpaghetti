# Legacy Quarantine Plan

Owner: QA (Quinn) / Maintainers
Status: Proposed

## Goals

- Physically isolate deprecated code in `legacy/` to improve discoverability and reduce accidental reuse.
- Keep active TS/ESLint fast by excluding legacy paths.
- Provide a clear, reversible process with roll-back.

## Scope (initial)

- Candidate paths: `client/**`, `packages/core/runtime/**`, `packages/prompt-targeting/**`, any deprecated services/tests confirmed unused.
- Already logically quarantined via `tsconfig.active.json` and pre-commit ESLint scoping.

## Release Cleanup Focus

This pass is not about research or new product direction. It is about reducing old repo cruft before a clean release cut.

Prioritize in this order:

1. Generated and disposable artifacts
   - `.turbo/`
   - `playwright-report/`
   - `test-results/`
   - `dist-epic1/`
   - `*.tsbuildinfo`
   - ad hoc debug files such as `.tmp-*`

2. Parallel or obsolete build surfaces
   - `server/src/index-minimal.ts`
   - build helpers that only target alternate Epic 1 bundles or abandoned one-off outputs
   - scripts that still reference non-active editor paths like `EnhancedGraphEditor.refactored.tsx`

3. Legacy source or maintenance paths that should not shape the release
   - `.archive/`
   - `docs/obsidian-vault/`
   - maintenance scripts that exist only for past recovery/refactor campaigns

4. Tracked compiled outputs that should be reviewed deliberately, not blindly removed
   - `packages/*/dist`
   - generated package type maps

## Initial Quarantine Candidates

These should be reviewed first because they add noise and are not part of the supported MVP surface:

- `dist-epic1/`
- `.archive/root-cleanup/`
- `playwright-report/`
- `test-results/`
- `server/src/index-minimal.ts`
- `vite.epic1.config.ts`
- `tsconfig.epic1.json`
- `scripts/build-epic1.js`
- `scripts/build-epic1-simple.js`
- maintenance scripts still targeting `client/src/components/EnhancedGraphEditor.refactored.tsx`

## Quarantined In This Pass

- `legacy/epic1-build/vite.epic1.config.ts`
- `legacy/epic1-build/tsconfig.epic1.json`
- `legacy/epic1-build/build-epic1.js`
- `legacy/epic1-build/build-epic1-simple.js`
- `legacy/server/index-minimal.ts`
- `legacy/maintenance-fixers/comprehensive-parsing-fix.js`
- `legacy/maintenance-fixers/fix-structural-parsing-issues.js`
- `legacy/maintenance-fixers/fix-remaining-parsing-errors.js`
- `legacy/maintenance-fixers/deprecate-non-epic1.js`
- `legacy/maintenance-fixers/fix-priority-components.js`
- `legacy/maintenance-fixers/comprehensive-fix.js`

## Do Not Touch In The First Cleanup Pass

- active editor/runtime paths under `client/src/Epic1Editor`
- active PSG/runtime paths under `packages/core`
- active asset browser code under `packages/asset-browser/src`
- research documents and prototype planning artifacts
- package `dist/` outputs until import/build assumptions are explicitly audited

## Steps

1. Inventory
   - Grep for imports referencing candidate paths.
   - Verify no active CI/build scripts depend on them.
2. Move
   - `git mv` candidate directories into `legacy/` preserving history.
   - Add `legacy/**` to tsconfig excludes and ESLint ignore as needed.
3. Guardrails
   - Optional path alias that throws if imported from active code.
   - CI job to ensure legacy never included in active checks.
4. Documentation
   - Update README/CONTRIBUTING with quarantine policy.
   - Link this plan and tracking issue.

## Risks and Rollback

- Risk: hidden implicit references. Mitigation: pre-move grep; post-move TS build on full repo (warn-only).
- Rollback: `git mv` back or cherry-pick revert commit.

## Acceptance Criteria

- Repo builds and pre-commit unchanged for active code.
- Legacy code isolated under `legacy/` with excludes in place.
- Documentation updated and issue closed with results.
