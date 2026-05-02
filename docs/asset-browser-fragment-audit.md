# Asset Browser Fragment Audit

## Purpose

This is the Phase 1 audit for the current modified fragment set under `assets/library/**`.

The goal is to decide:

- what these fragments are for
- which ones are real agent inventory
- which ones are placeholder or noisy
- what metadata the agent/suggestion system should rely on

## High-Level Read

The modified set is mostly coherent.

It is not random content churn. It is primarily a batch of:

- single-node `WeightedChoice` vocabulary fragments
- grouped by semantic domain
- suitable for deterministic insertion as graph modifiers or scenario/detail packs

That means this library is a good fit for:

- agent retrieval
- deterministic graph suggestions
- “add missing dimensions” assistance

It is **not yet** a good fit for advanced structural insertion without metadata, because folder/category alone is too weak.

## Current Shape

### Strong Pattern

Most modified fragments follow this pattern:

- one `WeightedChoice` node
- 10–12 weighted options
- minimal or zero edges
- category/domain encoded by folder
- tags sometimes present, but inconsistently

This is good for:

- attribute modifiers
- scenario enrichers
- branch-lane detail packs
- output-polish suggestions

### Weak Pattern

Some files are clearly weaker:

- placeholder content
- metadata inconsistency
- mixed naming conventions (`SIMPLE`, `ASSET_FRAGMENT`, `PLACEHOLDER`)
- region naming inconsistencies like `Region 1`

## Classification

### KEEP: Agent Inventory Now

These are already useful as deterministic fragment inventory.

#### Domain: `body-silhouette`

Recommended role:

- `modifier`
- `archetype-support`

Modified files:

- `assets/library/body-silhouette/accessory-silhouettes.psg`
- `assets/library/body-silhouette/assistive-gear.psg`
- `assets/library/body-silhouette/athletic-markers.psg`
- `assets/library/body-silhouette/body-types.psg`
- `assets/library/body-silhouette/clothing-fit.psg`
- `assets/library/body-silhouette/gesture-starters.psg`
- `assets/library/body-silhouette/movement-quality.psg`
- `assets/library/body-silhouette/posture-keys.psg`
- `assets/library/body-silhouette/scars-tattoos.psg`
- `assets/library/body-silhouette/stage-presence.psg`

Suggested usage:

- downstream of archetype selection
- add physical silhouette, posture, or performance identity

#### Domain: `emotion-mood`

Recommended role:

- `modifier`
- `branch-extension`
- `output-finisher`

Modified files:

- `assets/library/emotion-mood/affect-masks.psg`
- `assets/library/emotion-mood/conflict-escalation.psg`
- `assets/library/emotion-mood/empathetic-echoes.psg`
- `assets/library/emotion-mood/energy-levels.psg`
- `assets/library/emotion-mood/group-mood-fields.psg`
- `assets/library/emotion-mood/intensity-modifiers.psg`
- `assets/library/emotion-mood/nuanced-feels.psg`
- `assets/library/emotion-mood/primary-emotions.psg`
- `assets/library/emotion-mood/subtext-signals.psg`
- `assets/library/emotion-mood/temporal-mood-shifts.psg`

Suggested usage:

- branch-specific emotional treatment
- output polish
- crowd/group emotional tone

#### Domain: `action-dynamics`

Recommended role:

- `scenario`
- `branch-extension`
- `modifier`

Modified files:

- `assets/library/action-dynamics/aerial-motions.psg`
- `assets/library/action-dynamics/crowd-behaviors.psg`
- `assets/library/action-dynamics/facial-micro-gestures.psg`
- `assets/library/action-dynamics/group-dynamics.psg`
- `assets/library/action-dynamics/high-impact-moves.psg`
- `assets/library/action-dynamics/object-interactions.psg`
- `assets/library/action-dynamics/reaction-beats.psg`
- `assets/library/action-dynamics/stealth-movements.psg`
- `assets/library/action-dynamics/subtle-micro-actions.psg`
- `assets/library/action-dynamics/transformative-actions.psg`

Suggested usage:

- branch-lane enrichment
- scenario-specific motion or reaction layer
- “what happens next” suggestions after weighted choice nodes

#### Domain: `setting-environment`

Recommended role:

- `scenario`
- `output-finisher`
- `branch-extension`

Modified files:

- `assets/library/setting-environment/architectural-styles.psg`
- `assets/library/setting-environment/atmospherics.psg`
- `assets/library/setting-environment/backdrop-adjectives.psg`
- `assets/library/setting-environment/crowd-density.psg`
- `assets/library/setting-environment/geology-touches.psg`
- `assets/library/setting-environment/lighting-moods.psg`
- `assets/library/setting-environment/sound-snippets.psg`
- `assets/library/setting-environment/spatial-relations.psg`
- `assets/library/setting-environment/temporal-markers.psg`
- `assets/library/setting-environment/weather-snapshots.psg`

Suggested usage:

- scene finishing
- branch-lane scenario specialization
- fill missing environmental dimensions

#### Domain: `facial-features`

Recommended role:

- `modifier`
- `output-finisher`

Modified files:

- `assets/library/facial-features/eye-descriptors-multi-aspect.psg`
- `assets/library/facial-features/smile-variations-simple.psg`

Suggested usage:

- character polish
- face/detail enhancement suggestions

#### Special Case: `RomanCitizen.psg`

Recommended role:

- `archetype`
- `scene-plan seed`

File:

- `assets/library/RomanCitizen.psg`

Why it matters:

- unlike the single-fragment vocab packs, this is a fuller multi-node graph
- it is closer to a reusable demo/template than a raw fragment

Suggested usage:

- treat separately from the fragment packs
- use as archetype/demo inventory, not generic insertion fragment

## Deleted Placeholder

The placeholder below was removed from the active library so retrieval cannot
surface it as usable weapon/armor content.

File:

- `assets/library/weapons-armor-combat/complete-batch-placeholder.psg`

Reason:

- explicitly marked placeholder
- not useful for agent retrieval
- increases noise in suggestions

## Metadata Problems To Fix

### Inconsistent `metadata.type`

Observed values include:

- `ASSET_FRAGMENT`
- `SIMPLE`
- `PLACEHOLDER`

Recommendation:

- keep source `type` if useful historically
- add a new normalized retrieval field for agent/suggestions

### Inconsistent region naming

Example:

- `Lighting Moods` still has `Region 1`

Recommendation:

- region names should match the fragment name or be omitted from retrieval-facing logic

### Mixed metadata richness

Some files have:

- richer tags
- author/version metadata

Others only have:

- category and description

Recommendation:

- normalize retrieval-facing fields externally first, then decide whether to write back into each file

## Proposed Retrieval Metadata Schema

This should be the agent-facing normalized schema, whether stored inline or derived in a manifest:

```json
{
  "role": "modifier | scenario | branch-extension | output-finisher | archetype-support | archetype",
  "domain": "body | emotion | action | environment | facial | archetype",
  "nodeType": "weighted-choice | graph-template",
  "placementHints": [
    "downstream-of-choice",
    "branch-lane",
    "before-output",
    "after-archetype"
  ],
  "selectionAffinity": [
    "weighted-choice",
    "merge",
    "output",
    "archetype-lane"
  ]
}
```

## Recommended Query Behavior

### If user selects a weighted choice

Suggest:

- `branch-extension`
- `scenario`
- `modifier`

### If user selects a merge/output lane

Suggest:

- `output-finisher`
- `emotion`
- `environment`

### If user selects an archetype cluster

Suggest:

- `archetype-support`
- `modifier`
- `scenario`

## Immediate Next Step

Build a normalized manifest or inventory layer for the modified set first.

Do not immediately rewrite every fragment file.

Recommended sequence:

1. define the normalized retrieval metadata in code or manifest
2. map the modified fragment set into that schema
3. only then build deterministic `Suggested Next Nodes` logic

## Summary

The modified fragment set is mostly worth keeping.

It is already strong enough to become agent inventory, provided we:

- remove the placeholder
- normalize retrieval metadata
- stop relying only on folder/category names

This is a good foundation for:

- agent suggestions
- selection-aware fragment retrieval
- graph augmentation that feels structured rather than random
