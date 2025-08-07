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
