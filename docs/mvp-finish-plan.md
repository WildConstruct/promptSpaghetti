# MVP Finish Plan

_Last updated: 2026-04-12_

This note defines the remaining architecture and delivery scope required to call
Prompt Spaghetti "finished enough" for an MVP demo.

It is intentionally not a long-range roadmap.

The goal is:

- one coherent, demoable product story
- one stable file contract
- one stable editor surface
- one honest AI/bootstrap path
- one clear local-vs-cloud product split
- one launch flow that helps a new user succeed quickly

## Product Definition

The MVP is:

- a PSG-native visual archetype and variation editor
- with save/open/import/export around flat `.psg`
- with one real prompt-to-graph bootstrap path
- with deterministic graph-driven variation authoring
- with a small but clear local/cloud product model
- with enough launch/demo scaffolding to make the product understandable in one sitting

The MVP is not:

- a full renderer platform
- a complete image/video generation studio
- a full asset-management SaaS
- a fully generalized workflow engine
- a packed media-container file format

## Ship-Now Architecture

### 1. Canonical Source Formats

Must stay true:

- flat `.psg` remains the canonical portable graph file
- PSG API document envelopes remain JSON and may carry richer sidecar context
- media stays external and is referenced by metadata/provenance, not embedded into `.psg`

Current direction:

- flat `.psg` for graph authoring
- `.psg.scene.json`-style sidecar/export documents for richer scene/media state

Do not change for MVP:

- do not introduce a blob-packed PSG variant
- do not replace `.psg` with a new container format

### 2. Active Product Surfaces

Canonical surfaces:

- launch screen
- Epic 1 editor shell in `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
- shell-owned editor surface policy in `client/src/Epic1Editor/editorSurfacePolicy.ts`
- Epic 1 graph canvas in `packages/core/components/epic1/Epic1GraphEditor.tsx`
- flat PSG import/export
- preview/export path
- one primary AI bootstrap path via `draft-graph`
- secondary authenticated LLM helper routes for parsing/refinement/metadata work
- archetype-first quick-start/demo pack
- one PSG sidecar path for scene/media references

Non-goals for MVP:

- alternate editor architecture
- duplicate AI clients
- multiple server mains

Source-of-truth companions for this section:

- `ACTIVE_SURFACE.md`
- `packages/core/components/epic1/SOURCE_OF_TRUTH.md`
- `docs/deployment-current-state.md`

### 3. Local vs Cloud Split

The MVP cloud model should be honest and simple:

- local mode:
  - editor works
  - flat `.psg` works
  - local reference attachments work
  - local PSG export works
- cloud mode:
  - auth + Supabase sync
  - authenticated hosted PSG operations
  - hosted crowd expansion
  - cloud-ready asset promotion path
  - secondary authenticated LLM helper routes

The MVP should not claim:

- browser access to a user's local `.env`
- finished cloud media upload pipeline if it is not implemented

### 4. AI Surface

MVP AI should stay narrow:

- primary supported action: `Prompt -> Graph Draft`
- secondary supported helpers: parse, refine, metadata, analyze, optimize, populate, suggest, complete

Everything else should be clearly secondary or hidden.

### 5. PSG Sidecar Scope

The current sidecar/scene layer is enough for MVP if it supports:

- asset refs
- provenance
- placements
- crowd members
- local attachment metadata
- cloud-ready promotion state

That is enough to demonstrate where the system is going without forcing full
renderer integration now.

### 6. Visible Product Framing

The launch story should lead with:

- reusable archetypes
- locked versus variable traits
- deterministic variation
- portable production assets

The launch story should not lead with:

- scene assembly
- crowd planning
- renderer orchestration

Those can stay in the repo and architecture, but they should read as supporting
infrastructure rather than the MVP headline.

## Current State Audit

### What already exists and is strong enough

- canonical flat `.psg` direction
- active launch screen and prompt bootstrap path
- active editor shell plus monolithic graph canvas split
- tutorial system is less brittle and more deterministic
- shared LLM/browser client migration
- PSG API routes for validate/normalize/expand/export
- Comfy bridge export path
- scene-sidecar asset flow
- hosted crowd expansion into the sidecar
- local attachment and cloud-ready promotion metadata
- launch-screen quick-start set is now aligned to the demo story
- scene assembly API output is previewable/downloadable

### What still feels unfinished for MVP

- manual verification/build confidence still needs a practical ship bar
- some client test harness behavior remains noisy
- the brownfield repo still needs stronger source-of-truth boundaries around active vs support-only vs quarantined surfaces

Current ownership rule:

- the client shell owns surface labels, menu grouping, tab ordering, and capability wording
- the core canvas owns graph mechanics and rendering

## MVP Finish Line

We should call the MVP finished when all of these are true.

### A. Core Product

- launch screen works cleanly
- quick-start templates are useful and aligned with real demo scenarios
- prompt bootstrap launches into the editor reliably
- tutorial starts reliably
- editor save/open/export/import flows are coherent
- preview/export story is understandable

### B. Demo Story

- at least 3 polished quick-start/demo examples exist
- at least 1 example demonstrates people/extras variation
- at least 1 example demonstrates a non-character archetype family
- hosted crowd/scene features remain optional and clearly secondary in the pitch
- at least 1 example demonstrates local-first authoring/export
- the same examples exist as saved `.psg` artifacts for backup demo use

### C. Cloud/Product Honesty

- local vs cloud capabilities are visible in the UI
- hosted-only actions are labeled as such
- no fake "cloud upload" claims exist
- sidecar asset promotion is clearly staged if upload is not done

### D. Build/Test Bar

- active typecheck passes on the intended ship surfaces
- client build passes
- server build passes
- representative launch-screen and editor flows are manually exercised
- targeted route/tests for PSG and runtime-mode remain green

## Final MVP Epics

Only these epics should be considered in-scope for MVP closure.

### Epic A: Launch & Quick-Start Polish

Goal:

- make the splash/launch screen feel intentional and demo-ready

Stories:

- audit launch-screen flows end to end
- keep Quick Start Templates visible and working
- replace generic templates with demo-aligned examples
- ensure tutorial, skip, quick-start, and prompt-bootstrap paths all launch correctly
- tighten launch copy so it reflects the actual product

### Epic B: Golden-Path Demo Pack

Goal:

- one crisp demo story a teammate can run without explanation

Stories:

- ship 3 polished quick-start templates
- ship 3 saved demo graphs aligned to the quick-start set
- add one short demo script/checklist for the team

### Epic C: MVP Verification & Button-Up

Goal:

- reduce ambiguity and ship with confidence

Stories:

- confirm active build/typecheck path
- run focused smoke tests on launch + editor + PSG export + crowd expansion
- document known non-MVP deferrals
- remove or quarantine any last misleading UI paths

### Epic D: Source-Of-Truth Hardening

Goal:

- make the repo legible enough that follow-on build and deploy work lands in the right surface

Stories:

- refresh `ACTIVE_SURFACE.md` to match the actual runtime path
- align the Epic 1 source-of-truth note with the live shell-plus-canvas split
- publish one brownfield architecture map and one prioritized risk register
- publish one ordered MVP recovery backlog before deeper stabilization

## Quick-Start Audit

The quick-start system still exists in code:

- `client/src/components/LaunchScreen/LaunchScreen.tsx`
- `client/src/components/LaunchScreen/QuickActions.tsx`
- `client/src/templates/quickStartTemplates.ts`

Current issue:

- the launch flow now has demo-aligned quick-start entries, but it still needs a final manual polish pass
- the examples need one explicit golden-path walkthrough for the team

Current demo pack:

- [mvp-character-archetype-demo.psg](examples/mvp-character-archetype-demo.psg)
- [mvp-vehicle-family-demo.psg](examples/mvp-vehicle-family-demo.psg)
- [mvp-building-family-demo.psg](examples/mvp-building-family-demo.psg)

MVP recommendation:

replace or tighten the quick-start set to three examples:

1. Character Archetype
- simple, understandable, graph-native
- good first-run example of locked versus variable traits

2. Vehicle Family
- demonstrates that the pattern applies beyond people
- reinforces reusable design DNA and bounded variation

3. Building Family
- demonstrates the same logic on environment-facing assets
- keeps the pitch on reusable archetypes instead of scene assembly

Optional fourth:

4. Empty Graph
- explicit "start from scratch" path

## What To Defer

Do not let these expand MVP scope:

- real renderer backend integration beyond export-ready contracts
- image/video generation orchestration
- media upload pipeline beyond clean architecture hooks
- packed asset container format
- broad architecture churn
- alternate editor migration

## Recommended Immediate Work Order

1. Finish Source-Of-Truth Hardening
2. Finish Launch & Quick-Start Polish
3. Build the Golden-Path Demo Pack
4. Run MVP verification/button-up pass
