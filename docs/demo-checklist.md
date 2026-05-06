# Demo Checklist

_Last updated: 2026-05-05_

This is the shortest reliable walkthrough for showing the Prompt Spaghetti MVP to a teammate.

## Prep

Before demoing, confirm:

- `pnpm run validate:mvp:ship` passes
- `pnpm run validate:local-sandbox:runtime` passes if you plan to show the local tree demo
- the launch screen is visible on first load
- the canonical demo artifacts plus the Indy active-testing artifact are available in `docs/examples/`
- if you plan to show hosted PSG helpers, auth + Supabase are configured

2026-05-02 active-testing proof:

- `pnpm run validate:mvp:ship` passed after escalation for the local esbuild
  spawn restriction in this Codex sandbox
- `pnpm run validate:repo:quality`, `pnpm run validate:cycles`, and
  `pnpm run validate:artifacts:active` passed
- focused launch, PSG sidecar, Comfy export, hosted crowd, LLM/server route,
  tutorial, and demo PSG parser tests passed
- live browser smoke used `http://localhost:3001/` because `3000` was already
  occupied; the Indy quick start reached the editor without a runtime overlay

2026-05-05 integration-branch proof:

- branch: `codex/integrate-stabilize-baseline-to-main`
- `validate:active`, `validate:mvp:ship`, `validate:deploy:active`,
  `validate:artifacts:active`, `build:netlify`, and `build:vercel-api` passed
  after the branch-biased merge
- live browser smoke used the existing app at `http://localhost:3000/`
- Character, Indy 500, Vehicle, Building, Blank Canvas, Tutorial, prompt
  bootstrap, parsed family preview, local PSG import, and flat PSG export paths
  passed
- `Advanced PSG Scene Assets...` opened from the Indy quick start and exposed
  crowd-sidecar surfaces
- Comfy export, Local Sandbox Generation, and Hosted Crowd Expansion were
  visible but runtime/capability gated in the local environment

Canonical demo artifacts:

- [mvp-character-archetype-demo.psg](examples/mvp-character-archetype-demo.psg)
- [mvp-indy-500-crowd-card-demo.psg](examples/mvp-indy-500-crowd-card-demo.psg)
- [mvp-vehicle-family-demo.psg](examples/mvp-vehicle-family-demo.psg)
- [mvp-building-family-demo.psg](examples/mvp-building-family-demo.psg)
- [mvp-tree-family-sandbox-demo.psg](examples/mvp-tree-family-sandbox-demo.psg)

Branching pedagogy artifact:

- [mvp-tree-branch-direction-demo.psg](examples/mvp-tree-branch-direction-demo.psg)

## Core Walkthrough

### 1. Frame the launch screen

Show:

- `Character Archetype`
- `Indy 500 Crowd Card`
- `Vehicle Family`
- `Building Family`
- `Build PSG Family Graph`

Say:

- the MVP is about reusable archetypes, locked DNA, and controlled variation
- the three primary quick starts are the canonical golden-path examples
- the Indy quick start is the active-testing bridge for the EraCrowd Indianapolis 500 work
- the same examples also exist as saved flat `.psg` demo files

### 2. Open the character quick start

Click:

- `Character Archetype`

Show:

- family DNA is visible immediately
- weighted choices clearly read as allowed variation
- the graph already looks like a usable family archetype, not a blank scaffold

### 3. Show prompt bootstrap

Return to launch or refresh.

Enter a short archetype prompt, then click:

- `Build PSG Family Graph`

Say:

- MVP supports one honest AI/bootstrap path: `Prompt -> Graph Draft`
- the result is still a graph you can edit, save, and export as flat `.psg`

### 4. Show the sidecar as support, not headline

Open:

- `File -> Advanced PSG Scene Assets...`

Show:

- asset refs
- placements
- local attachment metadata
- crowd members when present
- local draft references marked as media still needed

Say:

- flat `.psg` stays canonical
- sidecar assets support the workflow, but the archetype graph remains the core product object
- local draft references are placeholders for actual media work, not cloud uploads

### 5. Show one tangible downstream output

From the editor or sidecar flow, show one of:

- `Export For Comfy...`
- `Assemble Scene JSON`

Say:

- Comfy export is the primary downstream handoff
- structured PSG-sidecar output exists, but it is still secondary to archetype authoring

## Optional Local Sandbox Branch

Only if a local Comfy-compatible runtime is configured:

- set `ENABLE_LOCAL_IMAGE_SANDBOX=true`
- set `LOCAL_IMAGE_COMFY_CHECKPOINT` to a checkpoint available in the local Comfy runtime
- run `pnpm run validate:local-sandbox:runtime`
- open `docs/examples/mvp-tree-family-sandbox-demo.psg`
- open `File -> Local Sandbox Generation (Local Only)...`
- show that the dialog derives the request from the active tree graph
- generate a batch of `20`
- capture the returned images into `PSG Scene Assets`
- show the returned images, seeds, local output folder, and captured render assets

Say:

- this is a local demo lane, not a hosted MVP promise
- the tree batch shares family DNA, inherits bounded variation from the graph, and varies deterministically by seed
- Comfy export remains the primary downstream handoff; local sandbox generation sits beside it as an execution demo

## Optional Branching Tree Check

Use this when you want to explicitly teach branch handles and direction lanes:

- open `docs/examples/mvp-tree-branch-direction-demo.psg`
- keep Preview visible
- run at least `5` preview seeds
- confirm outputs stay in-family while splitting into oak, cedar, and fig directions
- then open `File -> Local Sandbox Generation (Local Only)...`
- confirm the dialog derives from the branched graph before running a local batch

Say:

- one branch choice changes the family direction without changing the shared tree DNA
- branch lanes add detail and context before everything resolves back into one output
- Preview is the first output check; Local Sandbox Generation is the second

## Optional Hosted Branch

Only if hosted PSG is configured:

- open `Hosted Crowd Expansion (Cloud)...`
- generate preview members
- save them back into the scene sidecar
- reopen `Advanced PSG Scene Assets...` and confirm the members are present

Say:

- hosted helpers are real, but optional
- the MVP stays honest about local-first authoring versus hosted upgrades

## Minimum Success Criteria

The walkthrough is successful if all of these work:

- the three primary launch examples are visible
- `Character Archetype` opens cleanly
- prompt bootstrap lands in the editor
- sidecar assets dialog opens and saves
- one downstream output path works
- optional local sandbox generation is clearly labeled local-only when shown
- hosted crowd expansion is shown only as an optional branch when cloud mode is active

## If Cloud Mode Is Unavailable

Still demo:

- the three quick-start family graphs
- prompt bootstrap
- flat `.psg` export
- local sidecar editing
- Comfy export if locally available

Do not fake:

- hosted crowd expansion
- real cloud upload behavior
- subscription-only capabilities
