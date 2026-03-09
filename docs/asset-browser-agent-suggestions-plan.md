# Asset Browser Agent Suggestions Plan

## Purpose

Turn the asset browser from a mostly manual fragment library into:

- structured inventory for the agent
- deterministic graph-context suggestion source
- reusable prompt-grammar building blocks

The core idea is simple:

- the user selects a node or subgraph
- the system infers what role that graph section is playing
- the system suggests useful fragments or nodes to add next

This should start deterministic and metadata-driven, not LLM-first.

## Product Goal

The asset browser should become more useful to the agent than to the casual user.

That means:

- fragments need reliable metadata
- suggestions should come from graph context first
- LLM reasoning should be a second layer, not the retrieval layer

## Current Problem

Right now the fragment library can contain useful material, but it is too opaque for:

- clean automated retrieval
- role-aware suggestions
- safe graph augmentation

Without normalized metadata, the agent has to guess too much.

## Desired Flow

### User Flow

1. User selects a node, region, or short chain of nodes.
2. The system infers the local graph role.
3. The UI shows `Suggested Next Nodes` or `Suggested Fragments`.
4. The user clicks one suggestion to insert it near the selection.

### Agent Flow

1. The agent reads the selected graph context.
2. The agent queries the fragment inventory by role and domain tags.
3. The agent proposes additions based on structured matches.
4. Only after retrieval does the agent use LLM reasoning to rank or adapt.

## Required Metadata

Each fragment should eventually carry normalized metadata like:

- `role`
  - `archetype`
  - `modifier`
  - `scenario`
  - `branch-extension`
  - `merge-helper`
  - `output-finisher`
- `domains`
  - `vehicle`
  - `building`
  - `character`
  - `creature`
  - `environment`
- `nodeTypes`
  - `weighted-choice`
  - `text`
  - `variable`
  - `merge`
- `placementHints`
  - `downstream-of-choice`
  - `branch-lane`
  - `before-output`
  - `inside-region`
- `tone`
  - optional descriptive tags like `gritty`, `comic`, `cinematic`

## Suggested Context Inference

The first deterministic pass should infer a local role from:

- selected node type
- inbound/outbound degree
- handles in use
- whether the node sits on a branch lane
- whether the selection already leads to output
- whether the selection is missing a merge or output finisher

Examples:

- selected `Weighted Choice`
  - suggest branch extensions, scenario fragments, merge helpers
- selected `Merge`
  - suggest output finishers or missing detail layers
- selected `Output`
  - suggest sweetening or finish-polish fragments
- selected archetype lane
  - suggest missing dimensions like damage, lighting, scenario, props

## Implementation Phases

### Phase 1: Inventory Audit

Audit the modified `assets/library/**/*.psg` set and classify fragments into:

- keep
- merge/normalize
- delete/archive
- missing metadata

Deliverable:

- one inventory sheet with fragment path, role, domain, and action

### Phase 2: Metadata Normalization

Add or normalize metadata so fragments can be queried reliably.

Deliverable:

- one canonical metadata schema
- fragments tagged consistently enough for deterministic lookup

### Phase 3: Deterministic Suggestions

Build selection-aware suggestions without LLM dependence.

Deliverable:

- `getSuggestedFragmentsForSelection(...)`
- small UI surface for `Suggested Next Nodes`

### Phase 4: Agent Retrieval Path

Expose the same metadata/query layer to the agent.

Deliverable:

- agent uses fragment retrieval before freeform reasoning

### Phase 5: Topology-Aware Insertion

Make fragment suggestions and drag-insert actions land in the graph in a
structurally clear way instead of dropping everything at a generic position.

Deliverables:

- insertion planning service that understands graph topology
- unified drop-target service that can classify drag intent as:
  - replace hovered node
  - insert on hovered edge
  - free-place on canvas
- hover affordance for manual drag insertion
- consistent placement logic for both user-driven and agent-driven insertion

Required behaviors:

- when dragging directly over a compatible node, the UI should prefer a node
  replacement affordance instead of ambiguous free placement
- when dragging a fragment, hovering near a line or valid insertion lane should
  show a clear insertion affordance
- when clicking a suggested fragment, the system should place it near the
  selected node or lane in a sensible downstream position
- branch-lane inserts should stay visually aligned with the branch they extend
- merge/output finishers should be placed near the path they complete
- the same planner should be usable later by the agent

Recommended implementation:

- infer drop target from selected node, nearby edges, hovered nodes, and local
  layout
- support edge-adjacent insertion hints for branch lanes and merge points
- support node replacement when a dragged fragment is dropped directly on a
  compatible node
- keep the planner deterministic and local-first

## Why This Matters

This is one of the strongest “agentic but not sloppy” features available in the repo.

It makes the product feel:

- smart
- context-aware
- reusable
- less dependent on vague LLM output

And it turns the asset browser into infrastructure rather than clutter.

## Recommended Next Step

Start with Phase 1:

- audit the current modified fragment set
- classify role and domain
- define the metadata schema before writing suggestion code

After deterministic suggestions exist, the next important step is Phase 5:

- build the topology-aware insertion planner
- use it for both suggested-fragment clicks and manual drag insertion
