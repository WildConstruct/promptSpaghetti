# MVP Task Board

_Last updated: 2026-03-16_

This board is the working execution list for the Prompt Spaghetti MVP.

Product target:

- PSG-native visual authoring for controlled prompt variation
- reusable fragment library
- deterministic preview/export
- one real graph-aware AI bootstrap path
- one beta-critical preview path for graph comprehension

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
- `docs/examples/psg-weekend-mvp-canonical-example.psg`
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

Status: pending

Must be true:

- final emitted prompt is obvious
- rerun path is fast
- seed behavior is predictable
- copy/export path is frictionless

### P4.2 Preview Backend Abstraction

Status: complete

Must be true:

- image-bootstrap graphs can request preview generation through one abstract
  interface
- backend choice is not hardcoded into product truth
- preview responses preserve provenance:
  - backend
  - model
  - seed
  - prompt/hash or equivalent request identity

Primary files:

- `packages/core/services/psg/contracts.ts`
- `packages/core/services/psg/client.ts`
- `server/src/services/PsgService.ts`
- `server/src/routes/psg.ts`

### P4.3 First Preview Path

Status: complete

Must be true:

- a reviewed bootstrap graph can produce at least one lightweight preview
- preview is callable from the hosted editor flow
- failure and retry states are explicit
- initial implementation can be mocked or vendor-backed, but must respect the
  abstraction

### P4.4 Preview UX For Graph Comprehension

Status: in progress

Must be true:

- users can see what a selected bootstrap graph produces
- previews are easy to compare against source refs
- preview provenance is visible enough to debug and trust
- `scene-preview-v1` can be enabled behind a feature flag as the precursor
  scene-surface test inside mainline

### P4.5 Golden-path graph

Status: mostly complete

Build one polished demo graph around the actual origin use case:

- controlled visual variation
- modular fragments
- bounded randomization
- art-direction-ready outputs

Current demo pack:

- `docs/examples/mvp-character-variation-demo.psg`
- `docs/examples/mvp-scene-still-demo.psg`
- `docs/examples/mvp-crowd-scene-demo.psg`

Remaining work:

- manually verify the three demo graphs in the live editor
- use them in the final demo walkthrough

## P5: AI

### P5.1 Keep one real AI workflow

Status: in progress

Primary supported action:

- `Prompt -> Graph Draft`
- `Reference Image -> Reviewed Graph Draft`

Must be true:

- graph-native output
- PSG-compatible result
- honest fallback behavior

Current progress:

- image bootstrap contracts and routes exist
- staged analysis/review/draft service exists
- hosted editor flow exists
- explicit human review is real

Remaining:

- real preview-backed comprehension path
- production analysis backend beyond deterministic fixtures
- clearer retrieval explanation surfaces

### P5.2 Remove ambiguous AI surfaces

Status: pending

Must be true:

- generic text-in/text-out LLM routes are hidden, retired, or clearly secondary

## P6: Product Honesty

### P6.1 Hide or remove fake surfaces

Status: mostly complete

Must be true:

- no no-op menu items
- no fake PSG save/open flows
- no visible stub-only features positioned as complete

Notes:

- misleading editor menu items and duplicate file actions were removed from the active shell
- asset-browser save/open dialogs now prefer explicit `.psg` behavior over generic raw-JSON flows
- stub preset fallback, fabricated preview simulation, fabricated branch visualization, and synthetic thumbnails were removed or replaced with explicit unavailable states

## P7: Image Bootstrap Beta

### P7.1 Canonical Epic Scope

Status: complete

Must be true:

- canonical scope says preview is beta-critical
- PSD export and vendor-specific depth are not beta-critical
- launch narrative is separated from implementation truth

Primary files:

- `docs/README.md`
- `docs/PromptSpaghetti-Dev-Brief.md`
- `docs/Launch-Narrative.md`
- `docs/Implementation-Appendices.md`

### P7.2 Bootstrap Spine

Status: complete

Must be true:

- analyze -> review -> draft is available in the hosted editor
- refinement replaces existing bootstrap groups in place
- provenance persists back into asset/library state

Primary files:

- `server/src/services/ImageBootstrapAnalysisService.ts`
- `server/src/services/PsgService.ts`
- `client/src/Epic1Editor/components/PsgImageBootstrapDialog.tsx`
- `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`

### P7.3 Retrieval Reuse Signals

Status: in progress

Must be true:

- explicit fixture choices persist onto assets
- browser/search surfaces can consume those signals
- future exact/comparable ranking can explain why something matched

Primary files:

- `client/src/Epic1Editor/utils/imageBootstrapAssetSignals.ts`
- `client/src/Epic1Editor/utils/imageBootstrapAssetRegistry.ts`
- `client/src/Epic1Editor/components/PsgSceneAssetsDialog.tsx`

### P7.4 Beta Hardening

Status: pending

Must be true:

- props-first workflow is dependable enough for demo and paid beta
- crowd workflow is only promoted if quality holds
- real-server and browser coverage includes preview once implemented

## P8: Parallel Validation

### P8.1 ArtCraft Comprehension Spike

Status: in progress

Must be true:

- Track A mainline work is unaffected
- the spike is limited to one click-to-populate props flow
- Prompt Spaghetti graph, review, and provenance logic remain the source of
  truth
- the spike stays timeboxed through April 2
- success and failure are evaluated against the explicit gate doc

Primary files:

- `docs/artcraft-validation-spike.md`
- `docs/artcraft-phase2-gate-criteria-2026-04-02.md`

### P8.2 Scene Preview V1 Precursor

Status: in progress

Must be true:

- the mainline editor has one feature-flagged scene-surface precursor
- it is narrow enough to stay inside Track A
- it uses existing graph/bootstrap metadata instead of inventing a second logic path
- it creates a clean seam for later R3F substitution

Primary files:

- `client/src/utils/featureFlags.ts`
- `client/src/Epic1Editor/components/ScenePreviewV1Panel.tsx`
- `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`

## P7: Image-Native Bootstrap

### P7.1 Define image analysis and retrieval contracts

Status: pending

Must be true:

- image analysis results have canonical contracts
- comparable retrieval has explicit provenance and confidence
- graph bootstrap payloads are PSG-aligned
- batch generation requests are typed and mockable

Primary files:

- `docs/epic-image-reference-graph-bootstrap.md`
- `packages/core/services/psg/contracts.ts`
- `server/src/services/PsgService.ts`

### P7.2 Add image ingest and analysis backbone

Status: pending

Must be true:

- reference images can be registered as first-class assets
- subject and region analysis records can be attached to assets
- mocked analysis can stand in for real segmentation early on

### P7.3 Add comparable retrieval and browser expansion

Status: pending

Must be true:

- the system can return exact matches separately from comparable matches
- the browser shows `Exact Matches`, `Comparable References`, and `Generate From Scratch`
- provenance remains visible in retrieval and insertion flows

Primary files:

- `docs/asset-browser-agent-suggestions-plan.md`
- `packages/core/components/epic1/services/AgentFragmentSuggestionService.ts`
- `packages/core/components/epic1/SuggestedFragmentsPanel.tsx`

### P7.4 Draft graph and generate comparable batches

Status: pending

Must be true:

- image analysis can draft an editable weighted-choice graph
- the graph separates locked world traits from randomized person traits
- the user can request a batch such as 20 comparable people
- preview export uses the existing Comfy bridge

Primary files:

- `docs/epic-image-reference-graph-bootstrap.md`
- `packages/core/components/epic1/Epic1GraphEditor.tsx`
- `server/src/services/PsgService.ts`

## P8: Launch & Demo Polish

### P8.1 Launch screen audit and quick-start alignment

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
- the quick-start set is now demo-aligned and needs final manual walkthrough verification

### P8.2 Golden-path demo pack

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
- `docs/examples/mvp-character-variation-demo.psg`
- `docs/examples/mvp-scene-still-demo.psg`
- `docs/examples/mvp-crowd-scene-demo.psg`

## Release Checklist

The MVP candidate is ready when all are true:

- `pnpm run typecheck:active` passes
- `pnpm --filter client build` passes
- `pnpm --filter server build` passes
- fragment Playwright suite passes
- resize Playwright suite passes
- PSG round-trip works on representative graphs
- launch-screen quick-start flow works end-to-end
- golden-path graph works end-to-end
- one real AI bootstrap flow works
