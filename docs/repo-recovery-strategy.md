# Prompt Spaghetti Repo Recovery Strategy

_Last updated: 2026-03-06_

## Goal

Recover this repository into a usable base layer for the product defined in [prompt-spaghetti-agentic-prd.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/prompt-spaghetti-agentic-prd.md).

The purpose of this plan is not to preserve all historical work. It is to identify:

- what is part of the active product
- what should be quarantined
- what should be deleted or ignored
- what needs to be made reliable first

## 1. Current Assessment

The repo already contains a workable seed:

- client build passes
- server build passes
- local editor path is real
- deterministic preview/runtime exists
- PSG parsing and PSG conversion logic exist

The repo also contains substantial confusion:

- multiple parallel product definitions
- stubbed AI routes exposed through active code paths
- menu and UI actions that are not fully wired
- cloud, auth, and admin paths that are inconsistent or optional but visible
- many archived, backup, generated, and experimental files in the main tree

This is a recovery problem, not a greenfield problem.

## 2. Recommendation on New Repo

### Do Not Split Yet

Do not create a new repo immediately.

Reason:

- the current repo still contains real working code worth preserving
- a split now would likely duplicate uncertainty
- the architecture should be proven in place first

### Decision Gate for Future Split

Revisit the new-repo question only after Phase 1 and Phase 2 below are complete.

Create a new repo only if at least one of these remains true:

1. Active code cannot be isolated cleanly from legacy paths.
2. CI cannot be made trustworthy without extreme exclusion logic.
3. Package boundaries remain too entangled to support PSG-first development.

## 3. Define the Active Surface

The active product surface should be treated as:

- `client/`
- `server/`
- `packages/core/`
- `packages/asset-browser/`
- selected root config and build files
- selected PSG docs that support the current architecture

Everything else should be assumed inactive until explicitly justified.

## 4. Keep / Quarantine / Remove

### Keep

These are likely part of the active base layer:

- `client/src/App.tsx`
- `client/src/Epic1Editor/**`
- `client/src/components/LaunchScreen/**`
- `server/src/index.ts`
- `server/src/routes/**`
- `packages/core/components/epic1/**`
- `packages/core/runtime/**`
- `packages/core/fileFormats/**`
- `packages/core/utils/psg*`
- `packages/asset-browser/src/**`
- current workspace/package/build configs

### Quarantine

These should move out of the main decision path or be explicitly marked non-active:

- `.archive/`
- `docs/archive/`, `docs/_archive/`, `docs/obsidian-vault/`
- `temp-build/`
- ad hoc root scripts that were used for one-off debugging or migrations
- backup files like `.bak`, `-original`, `-backup`, `-cleaned`, `-minimal` where not active
- generated reports and local output directories checked into the tree

Quarantine means one of:

- move under a single `archive/` or `legacy/` boundary
- exclude from active discovery and CI
- add a top-level note that they are not part of the supported app surface

### Remove or Gitignore if Re-generated

- `.turbo/`
- `playwright-report/`
- `test-results/` outputs
- generated `dist/` outputs that should not be committed
- transient debug files like `.tmp-*`

This should be done carefully because the worktree is currently dirty, but the end state should be much cleaner than it is now.

## 5. P0 Recovery Work

### P0.1: Establish One Supported Build Lane

Required outcome:

- `pnpm --filter client build` passes
- `pnpm --filter server build` passes
- one root validation command is defined and documented

### P0.2: Fix Typecheck

The repo currently fails a basic client typecheck due to test typing configuration.

Required outcome:

- one supported typecheck command passes cleanly

### P0.3: Make PSG the Default Document Contract

Required outcome:

- local save writes PSG by default
- local open reads PSG by default
- autosave remains recoverable to PSG-backed state
- JSON becomes compatibility tooling, not the primary file format

### P0.4: Remove Stub-Only Product Claims

Required outcome:

- AI buttons and flows are hidden, disabled, or replaced until a real graph-aware AI contract exists
- menu items with no implementation are hidden or wired

### P0.5: Active Surface Documentation

Required outcome:

- a short doc defines the supported app surface
- contributors know which directories are active

## 6. P1 Product Stabilization

### P1.1: Editor and Runtime Parity

Ensure preview, execution, import/export, and persistence all agree on the supported node model.

### P1.2: File Workflow Consistency

Ensure:

- new document
- open
- save
- save as
- import
- export

all operate on the same canonical PSG document model.

### P1.3: Asset Insertion Consistency

Asset insertion should create valid graph structures that round-trip into PSG cleanly.

### P1.4: Minimal UX Honesty

The app should stop pretending to be a broader platform than it is.

That means:

- no dead menu items
- no fake quit behavior
- no visible stub endpoints framed as intelligent features

## 7. P2 Agentic AI Integration

### AI Should Be Product-Bound

Do not wire AI as a loose family of generic endpoints.

Instead define a small set of assistant operations such as:

- `draftGraphFromPrompt`
- `refineSelection`
- `expandChoices`
- `explainGraph`
- `auditGraph`

### Structured Contract

Each operation should consume PSG context and return structured results:

- PSG patch
- node insertions
- field updates
- warnings
- explanation text

### First AI Milestone

The first real AI feature should be `Prompt -> Graph Draft`.

Reason:

- it has obvious user value
- it fits the launch surface already present
- it can produce structured output
- it naturally reinforces PSG as source-of-truth

## 8. Proposed Execution Order

1. Fix typecheck and define one green validation lane.
2. Define and document the active app surface.
3. Convert default local save/export flow to PSG.
4. Remove or hide dead menu items and stub-only actions.
5. Quarantine legacy and generated cruft from the active tree.
6. Normalize preview/runtime/document flow around PSG.
7. Replace placeholder AI routes with a narrow graph-aware assistant boundary.
8. Implement the first real AI workflow.

## 9. Success Metrics

The repo recovery is successful when:

1. New contributors can identify the active app surface in under five minutes.
2. The default document workflow is PSG-first.
3. The app does not expose stubbed capabilities as if they were production-ready.
4. One build path and one typecheck path are green and documented.
5. One real AI workflow exists and operates on PSG-aware structures.

## 10. Next Concrete Tasks

Recommended first implementation batch:

1. Fix the client typecheck failure.
2. Add an `ACTIVE_SURFACE.md` doc and quarantine note for legacy paths.
3. Replace default local JSON save with PSG export in the editor file operations.
4. Audit the menu and remove or wire every visible no-op action.
5. Design the server/client contract for `draftGraphFromPrompt`.
