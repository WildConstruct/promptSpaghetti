# Metagrinder Fork Boundary

_Last updated: 2026-03-08_

## Purpose

This note defines the quarantine boundary for the Metagrinder / UTDG / semantic
world authoring subproject so it can be excluded from the weekend MVP commit or
lifted into a fork cleanly.

Status note:

- the preserved implementation slice now lives in the separate worktree/fork
- the manifest-listed implementation files were removed from the main repo in
  the cleanup pass on 2026-03-08
- this document remains as a preservation boundary reference, not as a claim
  that all listed paths still exist in the main repo checkout

## Current Isolation Strategy

The subproject is treated as an experimental slice with three boundaries:

- research and planning live in `docs/research/`
- contract, fixture, and prototype runtime work live under `packages/core/` in Metagrinder-specific files
- generated prototype outputs under `packages/core/tests/output/metagrinder/` are ignored by git

## Forkable Path Set

These are the primary paths that define the subproject in preserved form. They
should be interpreted as the fork boundary, not as a guarantee that each path is
still present in the main repo:

- [packages/core/types/metagrinder.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/types/metagrinder.ts)
- [packages/core/types/metagrinder.runtime.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/types/metagrinder.runtime.js)
- [packages/core/scripts/lib/rainy-alley-prototype.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/lib/rainy-alley-prototype.js)
- [packages/core/scripts/run-rainy-alley-prototype.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/run-rainy-alley-prototype.js)
- [packages/core/scripts/validate-metagrinder-fixtures.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/validate-metagrinder-fixtures.js)
- [packages/core/scripts/validate-rainy-alley-prototype.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/validate-rainy-alley-prototype.js)
- [packages/core/scripts/validate-rainy-alley-shot-differences.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/validate-rainy-alley-shot-differences.js)
- [packages/core/tests/fixtures/metagrinder](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/fixtures/metagrinder)
- [packages/core/tests/metagrinder.test.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/metagrinder.test.ts)
- [docs/research](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/research)

## Minimal Coupling To Main Core Package

There were only two intentional integration touchpoints into the broader package
surface:

- [packages/core/package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/package.json)
  Adds Metagrinder runtime and validation scripts.
- [packages/core/index.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/index.ts)
  Re-exports Metagrinder types.

At cleanup time, both shared touchpoints were already effectively clean in the
main repo, with no direct `metagrinder`, `utdg`, or `rainy-alley` references.

## Recommended MVP Exclusion Rule

For the MVP branch, exclude:

- all `docs/research/metagrinder*` and related semantic-world-authoring docs
- all `packages/core/tests/fixtures/metagrinder/**`
- all `packages/core/scripts/*metagrinder*`
- [packages/core/scripts/lib/rainy-alley-prototype.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/scripts/lib/rainy-alley-prototype.js)
- [packages/core/tests/metagrinder.test.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/metagrinder.test.ts)
- [packages/core/types/metagrinder.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/types/metagrinder.ts)
- [packages/core/types/metagrinder.runtime.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/types/metagrinder.runtime.js)

Then also review the two shared-package touchpoints listed above if they still
carry subproject-specific edits.

## Recommended Fork Inclusion Rule

For a fork, include:

- all Metagrinder contract files
- all Metagrinder fixtures
- all rainy alley prototype scripts
- all research docs that define the architecture and business logic

This is enough to preserve the subproject as a coherent independent branch of work.

## Generated Output Policy

Generated prototype outputs are intentionally not part of the fork boundary.

They live under:

- [packages/core/tests/output/metagrinder](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/output/metagrinder)

and are now ignored in `.gitignore`.

## Recommendation

Treat this subproject as an experimental branchable module, not part of the
weekend MVP baseline.

When using this boundary reference after cleanup:

1. use the listed path set to verify what was preserved in the fork
2. reapply shared-package touchpoints only if desired in the forked branch
3. leave generated outputs behind
