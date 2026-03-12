# Demo Checklist

_Last updated: 2026-03-08_

This is the shortest reliable walkthrough for showing the Prompt Spaghetti MVP to a teammate.

## Goal

Show that the app can:

- launch cleanly
- open useful archetype-first starter flows
- bootstrap from prompt text
- author/export flat `.psg`
- demonstrate reusable variation logic
- demonstrate the PSG sidecar without making it the headline
- emit a structured PSG API output

## Prep

Before demoing, confirm:

- the app starts
- launch screen is visible on first load
- server/API routes are available
- if cloud/demo mode is being shown, auth + Supabase are configured

Demo assets to have ready:

- [mvp-character-variation-demo.psg](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/examples/mvp-character-variation-demo.psg)
- [mvp-scene-still-demo.psg](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/examples/mvp-scene-still-demo.psg)
- [mvp-crowd-scene-demo.psg](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/examples/mvp-crowd-scene-demo.psg)

## Demo Flow

### 1. Launch Screen

Show:

- `Character Archetype`
- `Vehicle Family`
- `Building Family`
- `Blank Canvas`
- `Start Tutorial`
- `Skip to Editor`

Say:

- the launch screen supports both prompt bootstrap and quick-start graphs
- the examples are aligned to the actual MVP story: reusable archetypes with controlled variation
- the same three examples also exist as saved `.psg` demo artifacts for backup

### 2. Character Archetype Quick Start

Click:

- `Character Archetype`

Show in editor:

- starter graph opens directly
- weighted choices are visible
- graph can be read immediately without setup

Say:

- this is the cleanest first-run example of shared design DNA plus controlled variation

### 3. Prompt Bootstrap

Return to launch or refresh if needed.

Enter a short prompt in the launch prompt area.

Click:

- `Build Family Graph`

Show:

- prompt becomes a graph
- graph is editable after launch

Say:

- MVP supports one honest AI/bootstrap flow: `Prompt -> Graph Draft`

### 4. Archetype Persistence And Sidecar

Open:

- `File -> PSG Scene Assets...`

Show:

- asset refs
- placements
- crowd members section
- local attachment support
- cloud-ready promotion metadata when applicable

Say:

- flat `.psg` stays canonical
- richer scene/media state lives in the sidecar/export layer
- the sidecar supports the workflow, but the archetype graph remains the core product object

### 5. Optional Hosted PSG Surface

If cloud/hosted PSG is active:

Open:

- `File -> Hosted Crowd Expansion...`

Generate preview members and save them into the sidecar.

Then reopen:

- `PSG Scene Assets...`

Show:

- crowd members are now present
- members can create reference asset stubs

Say:

- hosted operations are explicit and separate from the core local-first archetype workflow

### 6. Tinkering Path

Inside `PSG Scene Assets...`:

- create a reference asset from a crowd member
- attach a local image file if desired
- show editability of the asset record

Say:

- this is enough for tinkering without pretending the renderer pipeline is finished

### 7. API Output

Still inside `PSG Scene Assets...`:

- click `Assemble Scene JSON`
- preview the structured output
- click `Download Assembly`

Optional:

- also show `Export Comfy Bridge...`

Say:

- the PSG/API layer emits real structured output that downstream tools can consume
- but the launch story is still archetype definition and bounded variation first

### 8. File Contract

Show:

- export flat `.psg`
- export scene manifest / sidecar

Say:

- `.psg` remains the portable graph format
- scene/media context is layered around it, not baked into it

## Minimum Success Criteria

The demo is successful if all of these work:

- launch screen actions respond correctly
- at least one quick-start opens correctly
- prompt bootstrap launches to the editor
- scene assets dialog opens
- hosted crowd expansion works when cloud mode is active
- scene assembly JSON can be previewed and downloaded

## If Cloud Mode Is Unavailable

Still demo:

- quick-start templates
- prompt bootstrap
- flat `.psg` export
- local sidecar asset editing
- local attachment flow
- Comfy bridge export if available locally

Do not fake:

- hosted crowd expansion
- real cloud uploads
- subscription-only capabilities
