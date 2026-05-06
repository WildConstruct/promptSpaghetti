# Launch Repo Trim Plan

## Purpose

This plan defines what should remain in the launch repo, what can be removed
immediately, and what needs one review pass before removal.

The goal is to turn the current broad development repo into a smaller
deploy-focused launch repo for Prompt Spaghetti v0.0.1.

This trim is motivated by three concrete problems:

- Netlify secret scanning keeps failing on non-runtime files
- the repo contains large amounts of historical, generated, and internal-only material
- the public launch branch should reflect the shipped product, not the entire
  research and task-orchestration history

## Project 9 Trim Status

First reviewed deletion batch completed:

- root one-off QA/status/report files listed below, except
  `/performance-test-runner.js`
- obsolete root helper scripts listed below
- root temporary/generated analysis outputs listed below
- obsolete alternate deploy config files listed below
- one generated server performance report:
  `/server/performance-report-2025-07-23T03-09-11-472Z.html`

Deferred from this batch:

- `/performance-test-runner.js` remains because
  `/scripts/run-performance-tests.js` and
  `/tests/performance/PerformanceTestSuite.ts` still reference it. Review the
  performance harness ownership before deleting it.

Docs review batch 1 completed:

- removed `/docs/agent-reports` after confirming it had no surviving repo
  references
- preserved the actionable technical-debt themes in
  `/docs/mvp-recovery-backlog.md`

Docs review batch 2 completed:

- promoted current project handoff, validation, local sandbox, agent retrieval,
  test harness, generated artifact, and example PSG docs into the launch keep
  list
- removed superseded historical context docs after preserving current decisions
  in active backlog and retrieval handoff docs

## Keep For Launch

These paths are part of the active MVP product, current deploy model, or active
handoff/security posture.

### Product and deploy surfaces

- `/client`
- `/api`
- `/server`
- `/packages/core`
- `/packages/asset-browser`
- `/package.json`
- `/pnpm-workspace.yaml`
- `/pnpm-lock.yaml`
- `/netlify.toml`
- `/vercel.json`
- `/scripts/build/vercel-api-placeholder.js`

### Root config files

- `/.gitignore`
- `/.nvmrc`
- `/.node-version`
- `/.npmrc`
- `/.editorconfig`
- `/.eslintrc.js`
- `/.eslintrc.json`
- `/.eslintignore`
- `/.prettierrc`
- `/.prettierignore`
- `/tsconfig.json`
- `/tsconfig.active.json`
- `/tsconfig.paths.json`
- `/turbo.json`
- `/LICENSE`
- `/README.md`
- `/SECURITY.md`

### MVP, deploy, and security docs to keep

- `/docs/mvp-alignment.md`
- `/docs/mvp-finish-plan.md`
- `/docs/demo-checklist.md`
- `/docs/mvp-ship-verification.md`
- `/docs/mvp-task-board.md`
- `/docs/mvp-security-handoff.md`
- `/docs/security-posture-pre-beta.md`
- `/docs/server-route-access-policy.md`
- `/docs/server-logging-review.md`
- `/docs/object-access-review-matrix.md`
- `/docs/supabase-external-verification-checklist.md`
- `/docs/deployment-current-state.md`
- `/docs/new-repo-bootstrap-checklist.md`
- `/docs/vercel-convergence-decision.md`
- `/docs/psg-storage-architecture.md`
- `/docs/psg-weekend-mvp-contract.md`
- `/docs/metagrinder-psg-authoring-guide.md`
- `/docs/active-validation-lane.md`
- `/docs/active-deploy-packaging-lane.md`
- `/docs/generated-artifact-policy.md`
- `/docs/local-sandbox-tree-demo.md`
- `/docs/epic-auth-billing-cloud-psg-readiness.md`
- `/docs/deferred-image-generation-review.md`
- `/docs/agent-fragment-index-implementation.md`
- `/docs/asset-browser-agent-suggestions-plan.md`
- `/docs/test-harness-canonical-layers.md`
- `/docs/test-harness-repair-epic.md`
- `/docs/test-script-catalog.md`
- `/docs/mvp-recovery-backlog.md`
- `/docs/mvp-handoff-status.md`
- `/docs/ralph-roadmap-progress.md`
- `/docs/examples/*.psg`
- `/docs/launch-repo-trim-plan.md`

## Safe To Remove Now

These paths are not part of the launch product or current deployment model and
can be removed from the launch repo without affecting the MVP build path.

### Historical / experimental / internal-only top-level trees

- `/.archive`
- `/legacy`
- `/load-tests`
- `/reports`
- `/sandboxes`
- `/web-bundles`
- `/examples`
- `/src`

Rationale:

- `/src` is mostly internal task orchestration, dashboards, state archives, and
  tooling unrelated to the shipped app. `src/data` alone is the single biggest
  repo-weight problem.
- the other directories are historical, internal, or non-product demo surfaces
  that actively increase deploy and scanner noise

### Generated and temporary artifacts

- `/client/dist`
- `/server/dist`
- `/src/dist`
- `/coverage`
- `/playwright-report`
- `/test-reports`
- `/test-results`
- `/temp-build`
- `/validation-coverage`
- `/public` if it only contains generated placeholder output

### Generated lock/build state that should not be committed in the launch repo

- `/client/package-lock.json`
- `/src/package-lock.json`
- any `*.tsbuildinfo`

### Root one-off files with no launch value

Project 9 first batch status: removed all listed files except
`/performance-test-runner.js`, which is deferred while referenced by the
performance test harness.

- `/QA-FINAL-REPORT-2025-01-28.md`
- `/QA-PHASE2-COMPLETE-2025-01-28.md`
- `/QA-PHASE3-PROGRESS-2025-01-28.md`
- `/QA-PHASE4-FINAL-2025-01-28.md`
- `/QA-PHASE5-COVERAGE-2025-01-28.md`
- `/QA-REPORT-2025-01-28.md`
- `/QA-SESSION-COMPLETE-2025-01-28.md`
- `/EPIC-2-INTEGRATION-STATUS.md`
- `/dependency-plan-1757297539122.json`
- `/performance-test-runner.js`
- `/prompt_parsing_fix.txt`
- `/psg-analysis-report.json`
- `/remove-deprecated-files.js`
- `/run-prompt-parser-tests.sh`
- `/serve-dashboard.js`
- `/setup-supabase.sh` if the live setup path is now documented elsewhere
- `/simple-auth-server.js`
- `/start-ticket-dashboard.js`
- `/tasks.db`
- `/temp-validator.js`
- `/temp_patch.txt`
- `/test-enhanced-bounding-box.html`
- `/update-epic1-task.js`
- `/vercel-full-app.json`
- `/vercel-minimal.json`

## Review Once, Then Remove

These paths are likely removable, but they should get one quick dependency and
handoff review before deletion.

### Docs

Project 9 docs batch 1 status: removed `/docs/agent-reports` as historical
internal assessment material after preserving the actionable backlog themes in
`/docs/mvp-recovery-backlog.md`.

Project 9 docs batch 2 status: removed these unreferenced or superseded
historical context docs after preserving their active decisions elsewhere:

- `/docs/brownfield-architecture-map.md`
- `/docs/brownfield-risk-register.md`
- `/docs/asset-browser-fragment-audit.md`
- `/docs/first-pass-cruft-inventory.md`

Review the full `/docs` tree and keep only the MVP, deploy, security, and PSG
contract docs listed above.

Likely remove after review:

- broad architecture history docs
- old QA/code review notes
- old performance/testing guides not tied to current launch
- archived story and research docs that have already been preserved elsewhere
- historical Netlify/Vercel troubleshooting docs once the deploy is stable

Examples of likely removal candidates:

- `/docs/AGENT-WORKFLOW-ISSUES.md`
- `/docs/INTEGRATION_ARCHITECTURE_DIAGRAMS.md`
- `/docs/LINTING-GUIDE.md`
- `/docs/QA-AUTOMATION-GUIDE.md`
- `/docs/TASK-COMPLETION-WORKFLOW.md`
- `/docs/TASK-MANAGEMENT-IMPROVEMENTS.md`
- `/docs/TESTING-GUIDELINES.md`
- `/docs/architecture.md`
- `/docs/asset-browser-audit-results.md`
- `/docs/build-validation.md`
- `/docs/code-review-*`
- `/docs/compliance-*`
- `/docs/core-runtime-jest-runner-note.md`
- `/docs/github-actions-integration-guide.md`
- `/docs/importGraphNormalization-phase2-implementation-checklist.md`
- `/docs/llm-stack-migration-plan.md`
- `/docs/manual-code-review-checklist.md`
- `/docs/netlifylog_9102025.txt`
- `/docs/qa-*`
- `/docs/regression-test-suite.md`
- `/docs/release-commit-plan.md`
- `/docs/repo-recovery-strategy.md`
- `/docs/runtime-normalization-helper-export-audit.md`
- `/docs/security-*` that are broad reference material rather than active launch/security posture docs
- `/docs/weekend-mvp-launch-readiness.md`
- `/docs/windsurf-next-tasks.md`

### Scripts

Keep only scripts that support:

- current build/deploy
- manifest generation
- explicitly active validation needed for MVP handoff

Likely keep:

- `/scripts/build/**`
- `/scripts/validate-build.js`
- `/scripts/validate-psg-corpus.js` only if still part of an active quality gate
- `/scripts/validate-psg-fragments.js` only if still part of an active quality gate
- `/scripts/prepare-metagrinder-worktree.sh` only if you still need boundary maintenance

Likely remove after review:

- most `fix-*`, `demo-*`, `epic*`, `perf*`, `test-*`, `lint-*`, and task-orchestration scripts

### Tests

Keep:

- package-local tests that validate the active MVP surfaces
- server route tests tied to security and PSG/LLM contracts
- active client/package tests tied to the launch experience

Likely remove after review:

- broad root `/tests` surfaces unrelated to current MVP confidence
- infrastructure/performance/documentation harnesses that are not currently gating release

## Keep But Trim Internally

These directories stay, but should be cleaned of generated or stale material.

### `/client`

Keep:

- active app source
- public assets used by the app

Remove from git:

- `/client/dist`
- `/client/package-lock.json`
- `/client/tsconfig.tsbuildinfo`

### `/server`

Keep:

- source
- route tests
- package config

Remove from git:

- `/server/dist`
- stale generated declaration maps and test build output

### `/packages/core`

Keep:

- active runtime/components/services/types needed by the app
- active tests tied to launch

Remove from git:

- `dist/**`
- `*.tsbuildinfo`
- historical docs under `/packages/core/docs` that are not part of the MVP story

### `/packages/asset-browser`

Keep:

- source, package config, and manifest generation path

Remove from git:

- generated dist output
- `*.tsbuildinfo`
- stale tests not tied to the launch path

## Secret Scanner Impact

The current Netlify scanner failures are largely being caused by the presence of:

- old tests
- internal tooling
- historical docs
- generated artifacts
- orchestration/state archives under `/src`

The trim will materially reduce secret-scan noise by removing exactly the kinds
of files that keep being flagged:

- non-runtime source in `/src`
- generated reports
- historical test and diagnostics surfaces
- broad archive/history directories

## Recommended Execution Order

### Commit 1: obvious dead weight

- remove `/src`
- remove `/reports`
- remove `/load-tests`
- remove `/sandboxes`
- remove `/legacy`
- remove `/web-bundles`
- remove generated artifacts and stale lock/build files

### Commit 2: docs trim

- keep only launch/MVP/security/deploy/PSG contract docs
- remove or move broad historical docs

### Commit 3: scripts and tests trim

- keep only deploy/build/active-validation scripts
- remove broad root test and internal tooling surfaces

## Decision Rule

Before keeping any path in the launch repo, ask:

1. Does the Netlify build use it?
2. Does the Vercel API deployment use it?
3. Does the shipped app use it?
4. Does the MVP/security handoff require it?

If the answer is no to all four, it should leave the launch repo.
