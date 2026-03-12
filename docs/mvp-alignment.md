# MVP Alignment

_Last updated: 2026-03-08_

This note defines the launch wedge for the current MVP branch.

## Product thesis

Prompt Spaghetti should launch as a visual system for defining reusable visual archetypes and generating tuned, repeatable variations that stay on-model.

The user value is not generic prompt storage or generic randomization.

The user value is:

- turning messy prompts into structured reusable creative logic
- preserving shared design DNA while allowing controlled variation
- making that logic portable across downstream workflows
- treating prompt logic as a reusable production asset instead of a text blob

## Launch wedge

The launch problem is:

`I need many variations of the same kind of thing without losing the core design DNA.`

Examples:

- people and extras
- vehicles
- buildings
- props

## Primary object model

The MVP should revolve around the archetype, not the scene.

- `Archetype`
  The reusable family definition.
- `Instance`
  A generated or resolved member of that family.
- `Scene`
  A later-stage container that composes archetypes and instances.

## What the MVP must make obvious

Users should be able to:

1. define a reusable archetype
2. lock what must stay consistent
3. vary what is allowed to change
4. preview deterministic outputs
5. save the result as a reusable production asset
6. export or hand it off downstream

## Launch-center features

- visual graph authoring
- prompt-to-graph scaffolding
- reusable archetypes/fragments/presets
- locked vs variable trait handling
- deterministic preview behavior
- reliable save/load persistence
- one credible downstream handoff
- PSG validation and normalization

## Fragment sizing guardrail

Fragments should be semantic chunks, not single-word atoms and not whole prompt paragraphs.

Good fragment units look like:

- archetype identity
- wardrobe clause
- material treatment
- silhouette modifier
- environment clause
- camera/style rule

Practical rule:

- if a fragment is too large to reuse across families, it is too large
- if a fragment is too small to read as a meaningful unit, it is too small
- if combining fragments regularly breaks grammar, the answer is conditional resolution, not endlessly smaller fragments

Future direction:

- PSG should grow toward conditional fragments with grammar-aware resolution
- that includes article choice, singular/plural agreement, pronoun/gender agreement, and similar context-sensitive phrasing
- the point is readable reusable authoring, not POS parsing for its own sake

## Keep in architecture, not in launch story

These can remain in the repo and API groundwork without dominating the MVP explanation:

- scene assembly
- crowd expansion
- asset derivation
- deeper orchestration workflows
- broader multi-document PSG strategies

## Positioning

Prompt Spaghetti should not lead as:

- a prompt randomizer
- a prompt registry
- a chatbot
- a generic AI copilot
- a scene assembly platform

It should lead as:

`a local-first visual tool for defining reusable archetypes and generating controlled variations that preserve design family resemblance.`
