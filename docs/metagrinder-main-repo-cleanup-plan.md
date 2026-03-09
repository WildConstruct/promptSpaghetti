# Metagrinder Main Repo Cleanup Plan

## Goal

Reduce MVP-branch noise in the main repo by removing Metagrinder / UTDG /
semantic-world-authoring artifacts that have already been preserved in the fork:

- worktree: `/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti-metagrinder-fork`
- branch: `exp/metagrinder-fork-staging`

This plan is intentionally about cleanup scope, not feature judgment.

## Source Of Truth

Use these two files as the preservation boundary before deleting anything from
the main repo:

- `docs/research/metagrinder-subproject-manifest.json`
- `docs/research/metagrinder-fork-boundary.md`

Do not infer scope from directory names alone if those files disagree.

## Cleanup Principle

Keep MVP/PSG work in the main repo.

Remove or quarantine only artifacts that are clearly part of the preserved
Metagrinder subproject and not required by the current MVP branch.

## Safe Cleanup Targets In Main Repo

### Research and planning docs

Remove Metagrinder-specific research docs already preserved in the fork,
especially under:

- `docs/research/`

Priority examples:

- `docs/research/metagrinder-*`
- `docs/research/utdg-*`
- `docs/research/semantic-world-authoring-*`
- `docs/research/rainy-alley-*`
- `docs/research/reverse-analysis-*`
- other manifest-listed files preserved in the fork

### Contracts, fixtures, and prototype scripts

Remove if the MVP branch does not actively depend on them:

- `packages/core/types/metagrinder.ts`
- `packages/core/types/metagrinder.runtime.js`
- `packages/core/scripts/run-rainy-alley-prototype.js`
- `packages/core/scripts/validate-metagrinder-fixtures.js`
- `packages/core/scripts/validate-rainy-alley-prototype.js`
- `packages/core/scripts/validate-rainy-alley-shot-differences.js`
- `packages/core/tests/fixtures/metagrinder/`
- `packages/core/tests/metagrinder.test.ts`

### Shared-package touchpoints

If the above files are removed, also clean the shared package surface:

- `packages/core/package.json`
- `packages/core/index.ts`

These are explicitly called out by `metagrinder-fork-boundary.md` as the two
intentional touchpoints that should be reverted or omitted for a clean MVP
branch.

## Things To Keep In Main Repo

Do not remove files just because they were useful to the Metagrinder effort if
they also serve broader PSG/MVP work.

Examples to review carefully before deletion:

- shared PSG format docs
- non-Metagrinder parser/runtime work
- general file-format implementation notes
- unrelated asset/browser/runtime stabilization work

If a file mixes MVP and Metagrinder content, split or trim it instead of
deleting it wholesale.

## Recommended Cleanup Sequence

1. Compare candidate paths against `metagrinder-subproject-manifest.json`.
2. Remove preserved research docs from `docs/research/`.
3. Remove preserved scripts, fixtures, tests, and contracts from `packages/core/`.
4. Remove Metagrinder exports/scripts from `packages/core/index.ts` and `packages/core/package.json`.
5. Re-run a narrow smoke check for any deleted import paths.
6. Leave generated outputs alone if they are already ignored.

## Current Status Snapshot

As of 2026-03-08, the manifest-listed include paths were present in the main
repo and then removed in this cleanup pass, with the following intentional
exceptions retained for boundary tracking:

- `docs/research/metagrinder-fork-boundary.md`
- `docs/research/metagrinder-subproject-manifest.json`

Also intentionally retained for review rather than automatic deletion:

- `docs/research/metagrinder-worktree-prep.md`
- `scripts/prepare-metagrinder-worktree.sh`

However, the two shared touchpoints called out by the fork-boundary note are
already partly clean:

- `packages/core/index.ts` currently has no direct `metagrinder`, `utdg`, or
  `rainy-alley` references.
- `packages/core/package.json` currently has no direct `metagrinder`, `utdg`,
  or `rainy-alley` references.

That means the highest-value cleanup is the manifest-listed docs, scripts,
types, fixtures, and tests. The shared touchpoints should still be re-checked
after deletions, but they do not appear to need dedicated cleanup first.

## Exact Candidate Inventory

These paths matched the manifest and were the intended cleanup candidates for
the main repo.

### Research docs: removed from the main repo in this pass

- `docs/research/deep-research-parser-prd.md`
- `docs/research/utdg-contribution-meat-grinder-prd.md`
- `docs/research/research-parser-utdg-system-map.md`
- `docs/research/utdg-approach-validation.md`
- `docs/research/utdg-application-profile-v1.md`
- `docs/research/utdg-rights-and-licensing-matrix.md`
- `docs/research/utdg-staging-and-curation-workflow.md`
- `docs/research/meat-grinder-artifact-contract-v1.md`
- `docs/research/utdg-prompt-vertex-paint-use-case.md`
- `docs/research/utdg-environmental-effects-smart-painter.md`
- `docs/research/world-semantic-field-spec.md`
- `docs/research/metagrinder-terminology.md`
- `docs/research/camera-query-algorithm-spec.md`
- `docs/research/metagrinder-camera-pass-service-spec.md`
- `docs/research/semantic-world-authoring-spec.md`
- `docs/research/semantic-world-authoring-prototype-scope.md`
- `docs/research/rainy-alley-demo-plan.md`
- `docs/research/metagrinder-tooling-integration-spec.md`
- `docs/research/deep-semantic-exr-spec.md`
- `docs/research/rainy-alley-phase-1-runtime-architecture.md`
- `docs/research/rainy-alley-phase-1-build-plan.md`
- `docs/research/rainy-alley-phase-1-ticket-breakdown.md`
- `docs/research/rainy-alley-phase-1-operator-note.md`
- `docs/research/reverse-prompt-analysis-spec.md`
- `docs/research/semantic-scene-package-format.md`
- `docs/research/historical-world-pack-market-note.md`
- `docs/research/progressive-scene-recovery-spec.md`
- `docs/research/perspective-witness-renderer-spec.md`
- `docs/research/semantic-extras-and-crowd-note.md`
- `docs/research/reverse-analysis-pipeline-spec.md`
- `docs/research/prompt-graph-lod-note.md`

### Boundary docs: keep until cleanup is complete, then review

- `docs/research/metagrinder-fork-boundary.md`
- `docs/research/metagrinder-subproject-manifest.json`

These should be kept until the cleanup pass is done, since they define the
preservation boundary. After the main-repo cleanup lands, you can decide whether
they remain useful in the main repo or should move with the fork context.

### Core contracts and runtime artifacts: removed from the main repo in this pass

- `packages/core/types/metagrinder.ts`
- `packages/core/types/metagrinder.runtime.js`
- `packages/core/scripts/lib/rainy-alley-prototype.js`
- `packages/core/scripts/run-rainy-alley-prototype.js`
- `packages/core/scripts/validate-metagrinder-fixtures.js`
- `packages/core/scripts/validate-rainy-alley-prototype.js`
- `packages/core/scripts/validate-rainy-alley-shot-differences.js`
- `packages/core/tests/fixtures/metagrinder/`
- `packages/core/tests/metagrinder.test.ts`

## Needs Review Before Removal

These are likely related, but are not part of the current manifest boundary and
should be reviewed instead of auto-deleted:

- `docs/research/metagrinder-worktree-prep.md`
- `scripts/prepare-metagrinder-worktree.sh`
- ignored generated output under `packages/core/tests/output/metagrinder/`

The worktree-prep note and helper script may still be useful as operational
history even if the experimental implementation is removed from the main repo.

## Review Checklist

Before deleting a path from the main repo, confirm:

- it is listed in the fork manifest or fork-boundary note
- it is not part of current MVP functionality
- removing it does not leave dead exports or package scripts behind
- it does not contain mixed PSG/MVP content that should be split instead

## Recommendation

Treat this as a separate cleanup commit or PR, not mixed into active product
feature work. The value is branch hygiene and review clarity, not behavior
change.
