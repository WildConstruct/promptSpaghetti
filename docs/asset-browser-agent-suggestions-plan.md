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

Each fragment should now carry or derive normalized metadata like:

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
- `preferredInsertion`
  - `replace-node`
  - `insert-edge`
  - `free-place`
- `entryStrategy` / `exitStrategy`
  - `single-node`
  - `auto-boundary`
  - `manual`
- `suggestionWeight`
- `requiresBranchLane`
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

Status: done

Audit the modified `assets/library/**/*.psg` set and classify fragments into:

- keep
- merge/normalize
- delete/archive
- missing metadata

Deliverable:

- one inventory sheet with fragment path, role, domain, and action

### Phase 2: Metadata Normalization

Status: done for generated retrieval/index layer, with room for richer curated overrides later

Add or normalize metadata so fragments can be queried reliably.

Deliverable:

- one canonical metadata schema
- fragments tagged consistently enough for deterministic lookup

### Phase 3: Deterministic Suggestions

Status: done

Build selection-aware suggestions without LLM dependence.

Deliverable:

- `getSuggestedFragmentsForSelection(...)`
- small UI surface for `Suggested Next Nodes`

### Phase 4: Agent Retrieval Path

Status: done for local service + editor/commander consumers

Expose the same metadata/query layer to the agent.

Deliverable:

- agent uses fragment retrieval before freeform reasoning

### Phase 5: Topology-Aware Insertion

Status: mostly done for active suggestion/drag paths; richer boundary metadata still deferred

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

Implemented so far:

- selection-aware insertion planner
- explicit planner intent:
  - `replace-node`
  - `insert-edge`
  - `inside-container`
  - `free-place`
- shared drop-target classifier:
  - `replace-node`
  - `insert-edge`
  - `free-place`
- edge `+` affordance during drag
- node replacement outline during drag
- initial edge splice execution:
  - single-node fragments
  - simple multi-node fragments with one clear entry/exit
- metadata-aware splice gating:
  - `preferredInsertion`
  - `entryStrategy`
  - `exitStrategy`
- suggested-fragment click/top-insert path now passes the shared insertion plan
  into editor execution instead of relying on label heuristics
- future agent hook `window.__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__` uses the
  same suggestion service, planner, and editor insertion seam

Still missing:

- richer multi-node splice for fragments with ambiguous boundaries
- explicit boundary IDs in curated metadata for ambiguous multi-node fragments
- live agent consumer beyond the current deterministic editor hook

### Phase 6: Retrieval Commander

Status: done

Implemented:

- `C` opens the editor commander
- retrieval-backed commands exist for:
  - `Insert Best Match`
  - `Extend Selected Branch`
  - `Add Missing Merge`
  - `Finish Output Lane`
  - `Fill Downstream Gap`

### Phase 7: Graph-Need Ranking

Status: done for first pass

Current structural signals:

- `isBranchLane`
- `needsMerge`
- `leadsToOutput`
- `hasNoOutgoing`
- `outputDistance`
- `branchDepth`
- `insideRegion`

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

The next meaningful step is boundary-guided fragment execution:

- add explicit entry/exit boundary metadata for fragments that cannot be inferred
  from one clear source/sink pair
- use that metadata in `splicePresetIntoEdge` and `replacePresetAtNode`
- wire the live agent consumer to the existing suggestion/planner/editor seam
