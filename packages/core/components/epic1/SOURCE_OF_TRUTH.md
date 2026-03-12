# Epic 1 Editor and Nodes — Source of Truth

To avoid ambiguity for agents and developers, this package defines a single, canonical entry for the editor and for the WeightedChoice node.

- Editor entry
  - Use `Epic1GraphEditor` from `./Epic1GraphEditor.tsx` (Monolithic).
  - `Epic1GraphEditorRefactored.tsx` is an exploratory refactor, not the active editor contract.
  - Do not import `Epic1GraphEditorFinal.tsx` — it is quarantined until repaired.
  - Treat `REFACTORING_GUIDE.md` and `ARCHITECTURE.md` as historical notes unless they are updated to match the live implementation.

- WeightedChoice node
  - Canonical implementation is `EnhancedBranchingNode`.
  - Exported alias: `WeightedChoiceNode`.
  - Node type mapping: `weightedChoice: EnhancedBranchingNode`.
  - Do not use legacy variants (`ImprovedWeightedChoiceNode`, `WeightedChoiceNodeFixed`, `EnhancedWeightedChoice`).

These constraints ensure a single source of truth and reduce integration conflicts.
