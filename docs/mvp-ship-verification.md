# MVP Ship Verification

_Last updated: 2026-05-05_

This is the practical verification bar for calling the current branch a demoable MVP candidate.

It is intentionally narrower than full long-term product verification.

## A. Build / Typecheck

- [x] `pnpm run validate:mvp:ship` passes
- [x] `pnpm run validate:active` passes
- [x] `pnpm run validate:artifacts:active` passes
- [x] active typecheck path passes
- [x] client build passes
- [x] server build passes
- [x] `pnpm run build:netlify` passes
- [x] `pnpm run build:vercel-api` passes
- [x] core/server targeted PSG tests remain green

Notes:

- `validate:mvp:ship` is the canonical MVP ship subset
- `validate:active` is the canonical local MVP confidence lane
- `validate:artifacts:active` is the canonical generated-artifact hygiene check
- `refresh:publish-compat` is optional compatibility maintenance, not a release gate
- the client Jest harness is still noisy/hang-prone in places outside the
  focused active-lane smoke slice
- use focused tests plus manual walkthroughs where the broader harness is
  unreliable
- 2026-05-02: active/MVP validation and client build require running outside
  the sandbox in this Codex environment because esbuild process spawning fails
  with `EPERM` inside the sandbox; the same commands passed after escalation
- 2026-05-05 on `codex/integrate-stabilize-baseline-to-main`:
  `validate:active`, `validate:mvp:ship`, `validate:deploy:active`,
  `validate:artifacts:active`, `build:netlify`, and `build:vercel-api`
  passed after the branch-biased merge

## B. Launch Screen

- [x] `Character Archetype` quick start opens a graph
- [x] `Indy 500 Crowd Card` quick start opens an active-testing graph
- [x] `Vehicle Family` quick start opens a graph
- [x] `Building Family` quick start opens a graph
- [x] `Blank Canvas` opens an empty editor
- [x] `Start Tutorial` launches tutorial mode
- [x] `Open Blank Editor ->` opens editor directly
- [x] prompt bootstrap launches into the editor
- [x] `Example Family Member` reads like a concise in-family description, not debug output
- [x] moving a node between fixed and variable states clearly rewrites family logic in the snapshot

Primary files:

- `client/src/components/LaunchScreen/LaunchScreen.tsx`
- `client/src/components/LaunchScreen/QuickActions.tsx`
- `client/src/templates/quickStartTemplates.ts`

Reference demo files:

- `docs/examples/mvp-character-archetype-demo.psg`
- `docs/examples/mvp-indy-500-crowd-card-demo.psg`
- `docs/examples/mvp-vehicle-family-demo.psg`
- `docs/examples/mvp-building-family-demo.psg`

Automated proof:

- `client/src/components/LaunchScreen/__tests__/LaunchScreenQuickActions.test.tsx`
  confirms every visible quick action maps to a template or explicit empty
  editor launch
- `packages/core/fileFormats/__tests__/mvpDemoExamples.test.ts` confirms the
  Indy active-testing demo parses as a flat PSG artifact
- 2026-05-02 live smoke on `http://localhost:3001/` confirmed launch cards
  render and the Indy quick start reaches the editor without a runtime overlay;
  port `3000` was already occupied by an older dev server in this workspace
- 2026-05-05 live smoke used the existing app on `http://localhost:3000/`.
  `Character Archetype`, `Indy 500 Crowd Card`, `Vehicle Family`,
  `Building Family`, and `Blank Canvas` all reached `.epic1-graph-editor`.
  `Start Tutorial` reached the editor with tutorial UI present. Prompt
  bootstrap reached the editor after parsing with `OK` and then clicking
  `Build PSG Family Graph`.
- 2026-05-05 preview note: opening `Show Preview` before parsing prompt text
  correctly shows the empty state. The verified prompt-preview path is:
  enter prompt, click `OK`, click `Show Preview`, then select a preview trait.
  Moving `wheels` to allowed variation updated the snapshot and example member.
  The example text still has a minor grammar edge when source segments include
  leading conjunctions, but this did not block the demo flow.

## C. Editor Core

- [x] editor loads after launch without obvious regressions
- [x] save/open/import/export still work on representative graphs
- [x] menu bar actions used in the demo path are present and non-fake

2026-05-05 smoke:

- `Save PSG` opened the save/cloud surface
- `Open PSG...` opened the PSG document/open surface
- `Open Local PSG...` accepted `docs/examples/mvp-vehicle-family-demo.psg`
  and kept the editor loaded with vehicle content visible
- `Export PSG...` downloaded `prompt_spaghetti_graph.psg`
- File menu exposed `Open PSG...`, `Save`, `Save PSG As...`,
  `Open Local PSG...`, `Export PSG...`, `Export For Comfy...`,
  `Advanced PSG Scene Assets...`, `Local Sandbox Generation (Local Only)...`,
  and `Hosted Crowd Expansion (Cloud Only)...`

## D. PSG / Sidecar Flow

- [x] `Advanced PSG Scene Assets...` opens
- [x] assets can be added manually
- [x] placements can be added manually
- [x] crowd members render in the sidecar when present
- [x] crowd member can create a local draft reference asset
- [x] existing asset can be edited
- [x] local image attachment updates the asset record
- [x] cloud-ready promotion only appears in cloud-capable mode

Notes:

- crowd-derived reference assets use `local-draft://` URIs plus `needs-media`
  tags until a real local attachment or cloud media object replaces them
- local draft references are not cloud upload claims
- 2026-05-05 live smoke confirmed the scene-assets dialog opens from the File
  menu and exposes asset, placement, and crowd-sidecar surfaces. The Indy quick
  start path exposed crowd/member/draft-reference language in that sidecar.
- Manual add/edit/attachment details are covered by
  `PsgSceneAssetsDialog.test.tsx`; no live local media file attachment was run
  in this closeout slice.

Primary files:

- `client/src/Epic1Editor/components/PsgSceneAssetsDialog.tsx`
- `client/src/Epic1Editor/components/PsgCrowdExpansionDialog.tsx`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`

## E. Hosted PSG

- [ ] hosted crowd expansion is visible only when cloud PSG is active
- [ ] hosted crowd expansion generates preview members
- [ ] generated members save into the scene sidecar
- [x] export/status UI distinguishes local vs hosted capabilities

2026-05-05 smoke:

- `Hosted Crowd Expansion (Cloud Only)...` was visible but disabled in the
  local runtime with copy that identifies it as hosted-only and currently
  unavailable

## F. Tangible Outputs

- [x] flat `.psg` export works
- [ ] scene manifest export works
- [ ] Comfy bridge preview/download works
- [ ] scene assembly preview/download works

This section is the real "people can tinker" bar.

Automated proof:

- `client/src/Epic1Editor/components/__tests__/ComfyExportDialog.test.tsx`
  covers Comfy workflow preview/download
- `client/src/Epic1Editor/components/__tests__/PsgSceneAssetsDialog.test.tsx`
  covers scene manifest state, local draft references, local attachments, and
  scene assembly preview/download
- 2026-05-05 live smoke downloaded `prompt_spaghetti_graph.psg` through
  `Export PSG...`.
- 2026-05-05 local runtime note: `Export For Comfy...` and the `Comfy Handoff`
  button were visible but disabled with the tooltip "Primary downstream
  handoff, currently unavailable in this runtime mode." Keep the full
  preview/download item unchecked until a runtime-capable manual pass exercises
  the dialog.

## G. Optional Local Sandbox Demo

- [ ] `pnpm run validate:local-sandbox:runtime` passes
- [ ] `pnpm run validate:local-sandbox:smoke` passes
- [ ] `pnpm run validate:local-sandbox:demo` passes when the local Comfy runtime is actually running
- [x] `Local Sandbox Generation (Local Only)...` is clearly labeled as local-only
- [ ] the tree-family graph pre-fills a graph-derived request for `20` outputs
- [ ] returned results show distinct seeds, local output paths, and manifest path
- [ ] a completed tree batch can be captured back into `PSG Scene Assets`

Reference demo file:

- `docs/examples/mvp-tree-family-sandbox-demo.psg`
- `docs/examples/mvp-tree-branch-direction-demo.psg`
- `docs/local-sandbox-tree-demo.md`

Branching tree acceptance:

- [ ] the branching tree demo parses with `main` plus `branch-0..2` handles
- [ ] at least `5` preview seeds on the branching tree demo produce readable oak / cedar / fig direction outputs
- [ ] the local sandbox dialog derives a graph summary from the branching tree demo before generation

Automated proof:

- `server/__tests__/local-image-routes.test.ts` and
  `server/__tests__/local-image-sandbox-service.test.ts` passed for the
  unavailable/configured service contract; runtime demo remains optional
- 2026-05-05 local runtime note: `Local Sandbox Generation (Local Only)...`
  was visible but disabled in the local app, with copy that says a local
  runtime must be configured.

## H. Product Honesty

- [x] no claims of browser access to local `.env`
- [x] no fake cloud upload claims
- [x] no hidden duplicate source-of-truth docs in the active flow
- [x] admin diagnostics are internal operator tooling, not product features
- [x] hosted-only operations are labeled as such

2026-05-05 smoke confirmed hosted crowd, local sandbox, and Comfy handoff
controls are visible with runtime/capability gating rather than fake-success
behavior in the local app.

## I. Deferred But Acceptable For MVP

These do not block the demoable MVP if they are documented as deferred:

- real cloud media upload pipeline
- renderer-specific generation backends
- image/video orchestration
- packed asset container format
- broader client Jest harness cleanup
