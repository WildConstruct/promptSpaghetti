# Epic1GraphEditor Split Plan

_Work-loop **C3** · 2026-07-14_  
_Target file: `packages/core/components/epic1/Epic1GraphEditor.tsx` (~2.5k+ lines)._

## Goal

Keep a thin orchestrator that owns React Flow state and wires hooks/services.
Move cohesive responsibilities into modules with clear props and zero behavior change
on the first extraction pass.

## Current structure (observed)

| Region (approx.) | Responsibility |
| --- | --- |
| Props + providers | `Epic1GraphEditorProps`, TutorialProvider wrapper, no-op Intelligence/Neaten stubs |
| State bootstrap | `useNodesState` / `useEdgesState`, persistence, history |
| Fragment / preset insertion | `presetToAgentFragmentRecord`, `executePresetWithTarget`, asset insert, suggestions |
| Drag/drop | `useDragDropHandlers` + `useGraphDragDrop` (parallel systems — don’t merge in split #1) |
| Selection / focus / view | pan-zoom, focus node, selection hooks |
| Commands / keyboard | GraphCommander, shortcuts, canvas context menus |
| Side panel / explore | TabbedSidePanel props, document open callbacks |
| Components library | save component, references, region fragment export, local fragment save |
| Auth modal / tutorial | session-adjacent UI |
| Render tree | ReactFlow + panels + modals + trays |

Hooks already extracted (do not re-inline):

- `useGraphHistory`, `useGraphPersistence`, `useNodeOperations`
- `useGraphDragDrop`, `useDragDropHandlers`, `useGraphKeyboardShortcuts`
- `usePreviewTrayLayout`, `useGraphViewControls`, `useGraphImportExport`
- `useGraphSelection`, `useGraphPreview`

## Proposed module boundaries

Extract in this order (lowest risk first):

### 1. `epic1/editor/presetAndFragmentInsertion.ts` (or hooks/)

**Move:** `presetToAgentFragmentRecord`, `executePresetWithTarget`, edge-splice helpers,
viewport fallback insertion, asset→preset bridge.

**Surface:** pure functions + one hook `usePresetInsertion({ nodes, edges, setNodes, … })`.

**Why first:** large pure-ish logic; few React Flow lifecycle ties.

### 2. `epic1/editor/useComponentLibraryActions.ts`

**Move:** component save/build, reference copy, region box fragment export + local save.

**Surface:** callbacks returned to menus/dialogs only.

### 3. `epic1/editor/Epic1GraphEditorShell.tsx`

**Move:** the big JSX `return` (ReactFlow + panels + modals).

**Keep in parent:** all state and handlers; pass a single `shellProps` object.

**Why:** visual noise out of the state file without changing data flow.

### 4. `epic1/editor/useCanvasCommandBridge.ts`

**Move:** GraphCommander open, spawn position, command registry wiring, window events
(`epic1:openCommander`, tutorial start).

### 5. Later (after product calm)

- Clarify/merge `useGraphDragDrop` vs `useDragDropHandlers` (forensic Tier 2 — separate epic).
- Kill dead no-op providers (`IntelligenceProvider`, `NeatenSettingsProvider`) if still unused.
- Split CSS imports into shell only.

## Non-goals for first extractions

- Behavior changes to insert/parenting/undo
- Rewriting React Flow controlled mode
- Moving PreviewTray ownership
- “Clean up” parallel drag systems in the same PR as a mechanical split

## Acceptance per extraction PR

- Same public export: `Epic1GraphEditor` / default export
- No prop API breaks for `Epic1EditorContainer-refactored`
- Typecheck green; targeted editor tests if present
- Diff is mostly move; functional edits called out

## Suggested PR sequence

| PR | Contents | Risk |
| --- | --- | --- |
| C3a | Extract preset/fragment pure helpers + hook | Low |
| C3b | Extract component-library actions hook | Low |
| C3c | Extract shell JSX component | Medium (merge conflicts) |
| C3d | Command/window-event bridge | Low–medium |

## Metric of success

- `Epic1GraphEditor.tsx` under **~800 lines** of orchestration
- New modules each under **~400 lines** with one responsibility
- New contributors can find insert vs render vs components without reading the whole file

## Status

| Step | Status |
| --- | --- |
| Plan | done |
| **C3a** | **done** — `services/presetAndFragmentInsertion.ts` + `hooks/usePresetInsertion.ts` |
| **C3b** | **done** — `hooks/useComponentLibraryActions.ts` |
| **C3c** | **done** — `editor/Epic1GraphEditorShell.tsx` |
| **C3d** | **done** — `hooks/useCanvasCommandBridge.ts` + `editor/buildCommandPaletteCommands.ts` |

`Epic1GraphEditor.tsx` is now the orchestrator (~1k lines) wiring hooks into the shell.
