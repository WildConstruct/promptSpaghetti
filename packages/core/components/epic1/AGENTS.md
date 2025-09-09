# Agent Guidance — Epic 1 Editor & Nodes (Source of Truth)

Scope: all files under `packages/core/components/epic1/**`

Rules for automated agents and developers:

- Editor
  - Use `Epic1GraphEditor` from `./Epic1GraphEditor.tsx` (Monolithic) as the canonical editor.
  - Do NOT import or reference `Epic1GraphEditorFinal.tsx` or anything under `_quarantined/`.

- WeightedChoice node
  - The canonical implementation is `EnhancedBranchingNode`.
  - Import via the barrel: `import { WeightedChoiceNode } from './nodes'` — this alias maps to `EnhancedBranchingNode`.
  - Do NOT use legacy variants: `ImprovedWeightedChoiceNode`, `WeightedChoiceNodeFixed`, `EnhancedWeightedChoice`.

- Node registry
  - The authoritative mapping is `epic1NodeTypes` from `./nodes/index.ts`.
  - Use `weightedChoice: EnhancedBranchingNode` as the only WeightedChoice mapping.

- If extending functionality
  - Add new behavior behind props or context in `EnhancedBranchingNode` rather than creating parallel node types.
  - Update tests and documentation accordingly.

Rationale: These constraints avoid ambiguity and regressions during development and ensure consistent behavior across the codebase and demos.
