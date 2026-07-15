# Nested PSG / Precomp Document Plan

## Current State (vertical slice landed)

Nested PSG precomps are implemented as a first vertical slice:

| Layer | Status | Location |
| --- | --- | --- |
| File format `documents[]` | ✅ | `packages/core/fileFormats/psg.ts` (`PSGNestedDocumentSchema`) |
| Registry map SubPSG ↔ subPsg | ✅ | `packages/core/runtime/nodeRegistry.ts` |
| Runtime `SubPsgNode` + cycle guards | ✅ | `packages/core/runtime/nodes/epic1/SubPsgNode.ts`, engine |
| Document project store + tabs | ✅ | `packages/core/stores/documentProjectStore.ts`, `DocumentTabs.tsx` |
| SubPSG UI (double-click open) | ✅ | `packages/core/components/epic1/nodes/SubPsgNode.tsx` |
| Teaching graph | ✅ | `nested_psg_intro` in quick-start templates + catalog |

Follow-ups (Track D in `docs/audit-work-loop.md`):

| Item | Status |
| --- | --- |
| Create nested doc from empty SubPSG (authoring UX) | ✅ D1 — Create composition + starter Text→Output + open tab |
| Multi-doc export via project store `documents[]` | ✅ D2 + **G4** — `exportActiveProjectToPSG` flushes active tab, roots on main, embeds nested docs |
| Per-document undo stacks and viewports | ✅ D3 — history + viewport restored on composition tab switch |

Branch handles inside one graph remain a separate feature (not nested PSG).

## Product Contract

Implement nested PSGs as a precomp-like workflow:

- A parent PSG can contain a `SubPSG` node that references an embedded or linked
  PSG document.
- Double-clicking or opening the `SubPSG` node opens the child graph in a second
  document panel/tab inside the same project workspace.
- Opening a child PSG must not replace the parent graph. The user should be able
  to switch between parent and child documents, similar to After Effects
  composition tabs.
- The child graph has its own nodes, edges, regions, undo history, dirty state,
  and viewport state.
- The parent `SubPSG` node displays the child document name and can expose
  inputs/outputs according to the child document contract.

## File Format Contract

Add a nested-document layer to PSG/PSGLib while preserving the existing node and
region rules.

Recommended PSG shape:

```json
{
  "version": "psg-2",
  "nodes": [],
  "edges": [],
  "regions": [],
  "documents": [
    {
      "id": "doc-medieval-forge",
      "name": "Forge Wares",
      "nodes": [],
      "edges": [],
      "regions": []
    }
  ]
}
```

Recommended `SubPSG` node shape:

```json
{
  "id": "subpsg-forge",
  "type": "SubPSG",
  "x": 480,
  "y": 220,
  "documentId": "doc-medieval-forge",
  "inputs": ["parent-input"],
  "outputMode": "first-output"
}
```

Node naming must be registered explicitly:

| Display Name | PSG Type | React Flow Type | Class Name |
| --- | --- | --- | --- |
| Sub PSG | SubPSG | subPsg | SubPsgNode |

Update `packages/core/runtime/nodeRegistry.ts` with this mapping before any UI
or parser work uses the node.

## Implementation Plan

1. File-format schema
   - Extend PSG parser/exporter with optional `documents`.
   - Add `SubPSG` to parser repair/normalization and validation.
   - Preserve round-trip export: parent graph plus embedded child documents.

2. Runtime
   - Add a `SubPsgNode` runtime class that executes a referenced child graph.
   - Pass a child execution context with deterministic seed derivation.
   - Return the child graph's selected `Output` result to the parent node.
   - Add cycle guards for recursive document references.

3. Editor document model
   - Introduce an editor-level document store:
     `documents`, `activeDocumentId`, `openDocumentIds`, per-document
     `nodes`, `edges`, `regions`, `dirty`, and viewport state.
   - Keep parent and child documents in memory at the same time.
   - Add document tabs above the canvas or in the existing editor chrome.

4. SubPSG node UI
   - Add a visible `SubPsgNode` component.
   - Double-click or command action opens the referenced document tab.
   - Node surface shows document name, output summary, and missing-reference
     state.

5. Import/open behavior
   - Opening an Explore or saved PSG document should create or replace the
     project document set intentionally.
   - Opening a nested PSG from a node should activate a child tab, not replace
     the project.

6. Tests
   - Parser round-trip for parent plus embedded child PSG.
   - Runtime execution for parent `SubPSG` node returning child `Output`.
   - Cycle detection test for recursive document references.
   - Editor test that opening a `SubPSG` node creates/activates a second
     document tab without replacing parent nodes.
   - Export/import compatibility tests for older PSG files with no `documents`.

## Acceptance Criteria

- A PSG with no `documents` still imports/exports exactly as before. ✅
- A parent PSG can embed at least one child PSG and round-trip without losing
  child nodes, edges, or regions. ✅ (parser/export; full save path still needs store-wired documents)
- A `SubPSG` node executes deterministically and returns the child output. ✅
- Opening a nested PSG creates or activates an in-editor document tab/panel. ✅
- Switching back to the parent restores the original parent canvas instead of
  reloading from disk or replacing project state. ✅
- Missing child document references render a clear node-level error and do not
  crash preview/export. ✅

## Teaching graph

- Explore / splash entry: **`nested_psg_intro`** (“Nested PSG Intro”)
- Parent: Template `A quiet village where {wares} are traded at the market` +
  SubPSG → Output
- Child document `doc-forge-wares` (“Forge Wares”): WeightedChoice of wares → Output
- Double-click Sub PSG (or document tabs) to open the child without replacing the parent.
