# First-Run Walkthrough Note

_Last updated: 2026-03-08_

This note captures the current manual-walkthrough validation standard for the launch surface.

It is intentionally focused on the archetype/family wedge, not broader PSG platform behavior.

## Walkthrough target

The first-run surface should prove:

- Prompt Spaghetti is for defining reusable design families
- fixed DNA versus allowed variation is understandable without a tutorial
- the resolved preview feels like one believable in-family instance

## Recommended walkthrough order

1. Open the launch screen
2. Read only the headline, quick starts, and empty-state preview copy
3. Enter or paste one short archetype prompt
4. Inspect the family logic preview and the family snapshot
5. Select one obvious trait and move it between fixed and variable
6. Repeat with:
   - `Character Archetype`
   - `Vehicle Family`
   - `Building Family`

## Validation questions

### 1. Click point

At what exact moment does the family model become obvious?

Current expected click point:

- when the user sees `Fixed DNA`, `Allowed Variation`, and `Example Family Member` updating together
- especially after moving one visible trait between fixed and variable states

If the model is not obvious by that moment, the first-run surface is still too abstract.

### 2. Snapshot quality

Does `Example Family Member` read like a concise production-ready in-family description?

Pass:

- it sounds like one believable instance from a reusable family
- it preserves recognizable archetype identity
- it does not feel like a debug listing

Fail:

- diagnostic tone
- tag soup
- flattened attribute list
- weak family resemblance

### 3. Causality

When a trait moves between fixed and variable, is the effect immediate enough to feel causal?

Pass:

- the user sees both the role badge and the family snapshot respond in the same interaction window
- the helper copy reinforces what changed

Fail:

- the role appears to change but the output feels unchanged
- the output changes but the reason feels opaque

### 4. Cross-domain consistency

Do `Character Archetype`, `Vehicle Family`, and `Building Family` feel like the same product model applied to different domains?

Pass:

- the user can infer one reusable system
- only the domain vocabulary changes

Fail:

- one template feels like the “real” product and the others feel bolted on
- one domain reads as scene planning rather than bounded family variation

## Current likely click point

Based on the current launch surface, the strongest click point should be:

- selecting a trait in the preview
- clicking `Mark Fixed` or `Allow Variation`
- seeing the role label and `Example Family Member` update together

That is where the product stops reading like a graph editor and starts reading like a family-definition tool.

## Current likely failure points

These are the areas most likely to weaken the walkthrough:

- `Example Family Member` may still read as lightly normalized assembled text in some prompts
- some users may not immediately infer why a specific parsed segment belongs in fixed DNA versus variation
- the graph preview can still read as “node editor” before the family snapshot ties it back to the wedge

## Fix policy

If the walkthrough reveals problems, fix only:

- natural-language assembly
- emphasis
- labeling
- ordering
- presentation-level cause-and-effect cues

Do not respond by:

- changing the underlying family model
- adding new launch features
- reopening broader scene/crowd/platform work
