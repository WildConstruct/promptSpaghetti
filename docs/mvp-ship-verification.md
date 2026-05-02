# MVP Ship Verification

_Last updated: 2026-05-02_

This is the practical verification bar for calling the current branch a demoable MVP candidate.

It is intentionally narrower than full long-term product verification.

## A. Build / Typecheck

- [x] `pnpm run validate:mvp:ship` passes
- [x] `pnpm run validate:active` passes
- [x] `pnpm run validate:artifacts:active` passes
- [x] active typecheck path passes
- [x] client build passes
- [x] server build passes
- [ ] `pnpm run build:netlify` passes
- [ ] `pnpm run build:vercel-api` passes
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

## B. Launch Screen

- [ ] `Character Archetype` quick start opens a graph
- [ ] `Indy 500 Crowd Card` quick start opens an active-testing graph
- [ ] `Vehicle Family` quick start opens a graph
- [ ] `Building Family` quick start opens a graph
- [ ] `Blank Canvas` opens an empty editor
- [ ] `Start Tutorial` launches tutorial mode
- [ ] `Skip to Editor` opens editor directly
- [ ] prompt bootstrap launches into the editor
- [ ] `Example Family Member` reads like a concise in-family description, not debug output
- [ ] moving a node between fixed and variable states clearly rewrites family logic in the snapshot

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

## C. Editor Core

- [ ] editor loads after launch without obvious regressions
- [ ] save/open/import/export still work on representative graphs
- [ ] menu bar actions used in the demo path are present and non-fake

## D. PSG / Sidecar Flow

- [ ] `PSG Scene Assets...` opens
- [ ] assets can be added manually
- [ ] placements can be added manually
- [ ] crowd members render in the sidecar when present
- [ ] crowd member can create a local draft reference asset
- [ ] existing asset can be edited
- [ ] local image attachment updates the asset record
- [ ] cloud-ready promotion only appears in cloud-capable mode

Notes:

- crowd-derived reference assets use `local-draft://` URIs plus `needs-media`
  tags until a real local attachment or cloud media object replaces them
- local draft references are not cloud upload claims

Primary files:

- `client/src/Epic1Editor/components/PsgSceneAssetsDialog.tsx`
- `client/src/Epic1Editor/components/PsgCrowdExpansionDialog.tsx`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`

## E. Hosted PSG

- [ ] hosted crowd expansion is visible only when cloud PSG is active
- [ ] hosted crowd expansion generates preview members
- [ ] generated members save into the scene sidecar
- [ ] export/status UI distinguishes local vs hosted capabilities

## F. Tangible Outputs

- [ ] flat `.psg` export works
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

## G. Optional Local Sandbox Demo

- [ ] `pnpm run validate:local-sandbox:runtime` passes
- [ ] `pnpm run validate:local-sandbox:smoke` passes
- [ ] `pnpm run validate:local-sandbox:demo` passes when the local Comfy runtime is actually running
- [ ] `Local Sandbox Generation (Local Only)...` is clearly labeled as local-only
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

## H. Product Honesty

- [ ] no claims of browser access to local `.env`
- [ ] no fake cloud upload claims
- [ ] no hidden duplicate source-of-truth docs in the active flow
- [ ] admin diagnostics are internal operator tooling, not product features
- [ ] hosted-only operations are labeled as such

## I. Deferred But Acceptable For MVP

These do not block the demoable MVP if they are documented as deferred:

- real cloud media upload pipeline
- renderer-specific generation backends
- image/video orchestration
- packed asset container format
- broader client Jest harness cleanup
