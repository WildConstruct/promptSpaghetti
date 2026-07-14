# Nested PSG / Precomp Document Plan

## Current State

The app supports branching inside a single React Flow graph. A `WeightedChoice`
option can expose a `branch-*` handle, and that branch lane can contain more
nodes, including another branching choice. This is how the Medieval City and
other quick-start templates demonstrate "branching on branching."

That is not the same as nesting a separate PSG document.

Evidence in the current repo:

- `docs/user-guide.md` describes branched options as opening a "sub-graph," but
  the wiring section describes branch handles and merge-back behavior inside
  one graph.
- `client/src/templates/quickStartTemplates.ts` models Medieval City and other
  advanced examples as one graph with nested branch handles.
- `packages/core/runtime/index.ts` has an `IncludeNode`, but it is a string
  lookup node, not a PSG document execution node.
- `packages/core/graphSchema.ts` includes `Include`, but has no nested PSG,
  embedded document, document reference, or subgraph node type.
- `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx` opens Explore
  documents by replacing the active graph after saving a recovery snapshot.
  There is no After Effects-style document/precomp tab model yet.

Conclusion: true nested PSG documents are not implemented yet.

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

- A PSG with no `documents` still imports/exports exactly as before.
- A parent PSG can embed at least one child PSG and round-trip without losing
  child nodes, edges, or regions.
- A `SubPSG` node executes deterministically and returns the child output.
- Opening a nested PSG creates or activates an in-editor document tab/panel.
- Switching back to the parent restores the original parent canvas instead of
  reloading from disk or replacing project state.
- Missing child document references render a clear node-level error and do not
  crash preview/export.
