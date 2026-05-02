# First-Pass Cruft Inventory

_Last updated: 2026-04-12_

This note captures the cleanup inventory surfaced during the first MVP wedge
polish pass.

It is implementation-facing. The point is to separate:

- what should be polished now
- what should be refactored next
- what should be pruned later

without doing repo-wide trim yet.

## Polish Now

### Launch screen and quick starts

- Keep the first three quick starts clearly primary:
  `Character Archetype`, `Vehicle Family`, `Building Family`.
- Keep `Monster Truck Branching` and `Blank Canvas`, but visually frame them as
  advanced/manual.
- Keep launch copy focused on:
  reusable archetypes, fixed DNA, allowed variation, deterministic output,
  PSG-first authoring.
- Remove or rewrite stale first-run language that sounds like a generic editor
  or generic prompt tool.

### Editor menu and side panel

- Keep `Comfy` as the clearest downstream handoff.
- Keep `PSG Scene Assets` and `Hosted Crowd Expansion`, but label them as
  advanced/hosted rather than equal peers to core document actions.
- Keep side-panel `Components`, `Search`, and `Relationships`, but frame them as
  advanced surfaces.
- Keep preview and fragment library positioned as core MVP surfaces.

## Refactor Next

### Visible UI seams

- The launch screen and editor shell still carry product framing logic in
  several places instead of one shared source.
- `SimpleMenuBar` mixes core document actions and advanced actions in one flat
  prop surface.
- `TabbedSidePanel` exposes both MVP tabs and deeper tooling tabs without a
  stronger ownership split.

### Deeper codebase seams

- Editor ownership remains split between the client shell and the core canvas.
- Asset-browser integration still spans both the dedicated package and the core
  Epic 1 bridge layer.
- Advanced surfaces such as scene assets, crowd expansion, search, and linked
  components need clearer feature-boundary ownership before any hiding or trim.

## Prune Later

### UI and product surface candidates

- Redundant or misleading labels that overstate non-MVP capabilities.
- Secondary tabs and actions that remain rarely used after the polish and
  stabilization passes.

### Repo candidates

- alternate server mains and exploratory editor variants already marked
  quarantined in source-of-truth docs
- one-off QA reports, temporary artifacts, and stale support files already
  identified in launch trim planning
- non-core docs and scripts that do not support the active runtime or the
  stabilization workflow

## Working Rule

If a surface is useful but non-core, polish and label it.

If a surface is confusing and non-essential, queue it for hiding or pruning in a
later pass.

If a surface is active but structurally messy, queue it for refactor before
deletion.
