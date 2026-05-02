# MVP Task Board

_Last updated: 2026-04-16_

This board is the working execution list for the Prompt Spaghetti MVP.

Product target:

- PSG-native visual authoring for controlled prompt variation
- reusable fragment library
- deterministic preview/export
- one real graph-aware AI bootstrap path

Reference docs:

- [psg-weekend-mvp-contract.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/psg-weekend-mvp-contract.md)
- [legacy-psg-compat-audit.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/legacy-psg-compat-audit.md)
- [prompt-spaghetti-agentic-prd.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/prompt-spaghetti-agentic-prd.md)
- [repo-recovery-strategy.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/repo-recovery-strategy.md)
- [mvp-finish-plan.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-finish-plan.md)
- [demo-checklist.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/demo-checklist.md)
- [mvp-ship-verification.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-ship-verification.md)

## P0: Contract

### P0.1 Define canonical PSG

Status: mostly complete

Must be true:

- flat top-level PSG contract is the active source format
- canonical example exists
- stale docs are corrected or annotated

Files:

- `docs/psg-weekend-mvp-contract.md`
- `docs/examples/mvp-character-archetype-demo.psg`
- `docs/psg-format-v2.md`
- `docs/asset-creation-guide.md`
- `docs/fragment-system-architecture.md`

### P0.2 Freeze node subset

Status: mostly complete

Weekend MVP node subset:

- `WeightedChoice`
- `TextBlock`
- `Concat`
- `Output`

Keep wider node support as compatibility, not authoring guidance.

### P0.3 Active tooling lane

Status: complete

Must be true:

- one canonical PR/push workflow runs the real active validation lane
- repo hygiene checks are first-class and separate from product-confidence checks
- root repo-quality commands run from the repo root, with unused-file detection
  scoped to the maintained production workspaces
- legacy enhanced CI workflow variants are retired rather than preserved as broken paths

Primary files:

- `.github/workflows/active-checks.yml`
- `knip.json`
- `package.json`
- `docs/test-script-catalog.md`

## P1: File Flow

### P1.1 PSG save/open/export/import

Status: mostly complete

Must be true:

- active editor writes flat PSG
- active editor opens flat PSG
- legacy graph-wrapper PSG is compatibility-only fallback
- local JSON is no longer the primary user-facing save contract

Primary files:

- `packages/core/fileFormats/psg.ts`
- `client/src/Epic1Editor/utils/psgDocument.ts`
- `client/src/Epic1Editor/hooks/useFileOperations.ts`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`

Notes:

- flat PSG is now the active authoring format
- legacy graph-wrapper PSG remains behind explicit compatibility boundaries documented in `docs/legacy-psg-compat-audit.md`

### P1.2 Remove fake PSG paths

Status: mostly complete

Must be true:

- asset-browser dialogs do not serialize raw JSON as `.psg`
- placeholder codec comments are removed from active surfaces
- visible open/save/import flows describe `.psg` as the MVP contract

Primary files:

- `packages/asset-browser/src/components/SaveGraphDialog.tsx`
- `packages/asset-browser/src/components/OpenGraphDialog.tsx`

## P2: Fragment Library

### P2.1 Normalize priority fragments

Status: mostly complete

Target first:

- body / silhouette
- facial features
- movement / pose
- accessories
- environment / style

Must be true:

- top-level `name`
- canonical node types
- canonical positions
- semantic `regions`
- no stale handle defaults in newly normalized files

Primary dirs:

- `assets/library/**`

Notes:

- corpus validation reports `162/162` files as safe, with `0` unsafe or ambiguous files
- the current library profile is “compatible but richer,” not strict minimal-canonical PSG
- next cleanup should target library-only compatibility branches without tightening generic external-import paths

### P2.2 Build deterministic fragment repair tool

Status: complete

Must be true:

- dry-run mode
- write mode
- single file or directory mode
- safe rewrites only
- clear report of canonical / rewritten / skipped / unsafe

Suggested location:

- `scripts/psg-repair.ts`

Related outputs:

- `scripts/validate-psg-corpus.js`
- `docs/psg-corpus-validation-note.md`

## P3: Import/Insert Reliability

### P3.1 One import interpretation path

Status: mostly complete

Must be true:

- click insert and drag insert share normalization/instantiation rules
- wrapper policy is centralized
- output retargeting is centralized
- post-insert repair is minimal and explicit

Primary files:

- `packages/core/runtime/importGraphNormalization.ts`
- `packages/core/runtime/presetInsertion.ts`
- `packages/core/components/epic1/hooks/useDragDropHandlers.ts`

### P3.2 Protect with browser regressions

Status: in progress

Must stay green:

- `tests/performance/fragment-import-visibility.spec.ts`
- `tests/performance/age-indicator-region-resize.spec.ts`

Notes:

- core runtime regression coverage now passes for:
  - `packages/core/runtime/__tests__/importGraphNormalization.test.ts`
  - `packages/core/runtime/__tests__/presetInsertion.test.ts`
  - `packages/core/fileFormats/__tests__/psg-fragment-handling.test.ts`

## P4: Preview / Export

### P4.1 Make prompt output usable

Status: in progress

Must be true:

- final emitted prompt is obvious
- rerun path is fast
- seed behavior is predictable
- copy/export path is frictionless

Notes:

- targeted button and active-lane smoke tests cover the preview/export surface
- live manual review of the final emitted prompt presentation remains useful
  before active tester handoff

### P4.2 Golden-path graph

Status: mostly complete

Build one polished demo graph around the actual origin use case:

- controlled visual variation
- modular fragments
- bounded randomization
- art-direction-ready outputs

Current demo pack:

- `docs/examples/mvp-character-archetype-demo.psg`
- `docs/examples/mvp-indy-500-crowd-card-demo.psg`
- `docs/examples/mvp-vehicle-family-demo.psg`
- `docs/examples/mvp-building-family-demo.psg`

Remaining work:

- manually verify the three demo graphs in the live editor
- use them in the final demo walkthrough

## P5: AI

### P5.1 Keep one real AI workflow

Status: mostly complete

Primary supported action:

- `Prompt -> Graph Draft`

Must be true:

- graph-native output
- PSG-compatible result
- honest unavailable/heuristic behavior when no provider is configured

Notes:

- live completion now requires an explicitly configured provider
- heuristic parse/refine/metadata helpers report `heuristic-*` model labels
- server agent-draft and LLM route tests pass for the active testing contract

### P5.2 Remove ambiguous AI surfaces

Status: mostly complete

Must be true:

- generic text-in/text-out LLM routes are hidden, retired, or clearly secondary

Notes:

- secondary LLM helpers are no longer presented as live model success in unconfigured mode
- `/admin/test-feature` is an internal deterministic diagnostic route

## P6: Product Honesty

### P6.1 Hide or remove fake surfaces

Status: mostly complete

Must be true:

- no no-op menu items
- no fake PSG save/open flows
- no visible placeholder-only features positioned as complete

Notes:

- misleading editor menu items and duplicate file actions were removed from the active shell
- asset-browser save/open dialogs now prefer explicit `.psg` behavior over generic raw-JSON flows
- old preset placeholder behavior, fabricated preview simulation, fabricated branch visualization, and synthetic thumbnails were removed or replaced with explicit unavailable states
- crowd-member reference assets now use local draft/needs-media semantics instead of placeholder media claims

## P7: Launch & Demo Polish

### P7.1 Launch screen audit and quick-start alignment

Status: mostly complete

Must be true:

- launch screen still renders the real quick-start lane
- tutorial, skip, prompt-bootstrap, and quick-start actions all launch correctly
- quick-start templates are aligned to the current product story, not generic placeholder categories
- launch copy reflects the actual local/cloud/PSG product model

Primary files:

- `client/src/components/LaunchScreen/LaunchScreen.tsx`
- `client/src/components/LaunchScreen/QuickActions.tsx`
- `client/src/templates/quickStartTemplates.ts`

Notes:

- quick-start templates still exist in the launch screen today
- the quick-start set is now demo-aligned, includes the Indy 500 active-test card, and needs final manual walkthrough verification

### P7.2 Golden-path demo pack

Status: mostly complete

Must be true:

- at least 3 polished quick-start/demo examples exist
- one example demonstrates prompt-to-graph authoring
- one example demonstrates character/extras archetype variation
- one example demonstrates a non-character archetype family
- hosted crowd expansion remains optional and secondary in the demo story
- a teammate can use the examples without explanation-heavy setup

Recommended visible categories:

- people / extras
- vehicles
- buildings

Reference:

- `docs/mvp-finish-plan.md`
- `docs/demo-checklist.md`
- `docs/examples/mvp-character-archetype-demo.psg`
- `docs/examples/mvp-indy-500-crowd-card-demo.psg`
- `docs/examples/mvp-vehicle-family-demo.psg`
- `docs/examples/mvp-building-family-demo.psg`

## Release Checklist

The MVP candidate is ready when all are true:

- `pnpm run typecheck:active` passes
- `pnpm run validate:unused` passes
- `pnpm run validate:cycles` passes
- `pnpm run validate:repo:quality` passes
- `pnpm --filter client build` passes
- `pnpm --filter server build` passes
- fragment Playwright suite passes
- resize Playwright suite passes
- PSG round-trip works on representative graphs
- launch-screen quick-start flow works end-to-end
- golden-path graph works end-to-end
- one real AI bootstrap flow works
