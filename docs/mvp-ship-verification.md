# MVP Ship Verification

_Last updated: 2026-03-08_

This is the practical verification bar for calling the current branch a demoable MVP candidate.

It is intentionally narrower than full long-term product verification.

## A. Build / Typecheck

- [ ] active typecheck path passes
- [ ] client build passes
- [ ] server build passes
- [ ] `pnpm run build:netlify` passes
- [ ] `pnpm run build:vercel-api` passes
- [ ] core/server targeted PSG tests remain green

Notes:

- the client Jest harness is still noisy/hang-prone in places
- use focused tests plus manual walkthroughs where the harness is unreliable

## B. Launch Screen

- [ ] `Character Archetype` quick start opens a graph
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

- `docs/examples/mvp-character-variation-demo.psg`
- `docs/examples/mvp-scene-still-demo.psg`
- `docs/examples/mvp-crowd-scene-demo.psg`

## C. Editor Core

- [ ] editor loads after launch without obvious regressions
- [ ] save/open/import/export still work on representative graphs
- [ ] menu bar actions used in the demo path are present and non-fake

## D. PSG / Sidecar Flow

- [ ] `PSG Scene Assets...` opens
- [ ] assets can be added manually
- [ ] placements can be added manually
- [ ] crowd members render in the sidecar when present
- [ ] crowd member can create a reference asset stub
- [ ] existing asset can be edited
- [ ] local image attachment updates the asset record
- [ ] cloud-ready promotion only appears in cloud-capable mode

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

## G. Product Honesty

- [ ] no claims of browser access to local `.env`
- [ ] no fake cloud upload claims
- [ ] no hidden duplicate source-of-truth docs in the active flow
- [ ] hosted-only operations are labeled as such

## H. Deferred But Acceptable For MVP

These do not block the demoable MVP if they are documented as deferred:

- real cloud media upload pipeline
- renderer-specific generation backends
- image/video orchestration
- packed asset container format
- broader client Jest harness cleanup
