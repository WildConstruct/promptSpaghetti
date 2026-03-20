# ArtCraft Validation Spike

_Status: Narrative / Non-Authoritative_  
_Date: 2026-03-16_  
_Branch label: `validation-spike-artcraft`_

## Purpose

This spike exists to answer one question only:

- does a real scene or canvas surface make the Prompt Spaghetti
  graph-and-preview loop materially easier for pre-viz users to understand?

This is a validation harness, not a product pivot.

## Operating Split

### Track A: Prompt Spaghetti Mainline

Track A remains authoritative and must not slow down.

Current protected work:

- preview abstraction and first real preview path
- props-first beta hardening
- retrieval explanation surfaces

### Track B: ArtCraft Validation Spike

Track B runs in parallel as a separate branch or fork.

It is scoped to:

- one click-to-populate flow
- one props or set-dressing scenario
- our existing graph, reconciliation, and review logic as the source of truth
- ArtCraft as the scene-surface and output adapter only

## Timebox

- start: immediately
- duration: 2 weeks maximum
- decision deadline: April 2, 2026

## Scope Constraints

The spike is intentionally narrow.

Allowed:

- `agent_populate_scene` command path
- one prop-focused dogfood flow
- minimal scene-state read/write adapter work
- internal and external comprehension testing

Not allowed:

- changing Prompt Spaghetti core contracts to fit ArtCraft
- expanding into crowds, full scene-editor productization, or broad mesh work
- replacing Prompt Spaghetti preview ownership
- treating the spike as a committed roadmap change

## Integration Surface

Initial integration should stay limited to:

- `crates/desktop/artcraft/src/core/commands/`
- `crates/desktop/artcraft/src/core/state/`
- one frontend invoke path for the context-menu action

Preview generation stays owned by Prompt Spaghetti. ArtCraft is used only as
the interactive scene surface and compositing context.

## Success Criteria

The spike is successful only if users can:

- explain what the system is doing in their own words
- identify the graph or intelligence layer, not just the 3D novelty
- see immediate relevance to blocking or dressing a scene
- complete a prop-dressing task faster or with higher confidence than in the
  graph-plus-preview-only flow

Evaluation plan:

- 5 internal dogfood users
- 5 external pre-viz users
- scripted 10-minute task
- explicit explain-back interview question after both flows

## Failure Criteria

The spike fails if any of the following are true:

- the integration burden is high enough to threaten Track A velocity
- our graph logic has to be distorted to fit ArtCraft
- user feedback is mostly about the 3D surface, not our graph intelligence
- there is no clear comprehension uplift over the Prompt Spaghetti graph-plus-preview path

## Decision Rule

- If uplift is real and integration burden is containable, move ArtCraft into
  Phase 2 implementation planning as the leading expression-layer candidate.
- That promotion still requires architecture review and a second validation
  pass.
- If uplift is not real, archive the spike as R&D and remain fully committed to
  Prompt Spaghetti mainline.

## Guardrails

- the branch must remain labeled `validation-spike-artcraft`
- the branch README must clearly state that it is not the product path unless
  the April 2 decision says otherwise
- Track A remains the default product reality throughout the spike
