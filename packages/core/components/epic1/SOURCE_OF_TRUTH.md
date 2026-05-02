# Epic 1 Editor and Nodes - Source of Truth

To avoid ambiguity for agents and developers, this package defines the
canonical ownership split for the active editor and the WeightedChoice node.

- Application editor shell
  - The active product shell lives in `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`.
  - That shell owns launch handoff, file dialogs, runtime-mode gating, editor-adjacent dialogs, and the editor surface policy used to label and tier menu/tab surfaces.
  - Product framing for MVP-vs-advanced surfaces belongs in the client shell, not in canvas or side-panel render hosts.

- Graph editor entry inside `packages/core`
  - Use `Epic1GraphEditor` from `./Epic1GraphEditor.tsx` as the canonical graph canvas/editor implementation.
  - `Epic1GraphEditorRefactored.tsx` is exploratory and is not the supported canvas contract.
  - Do not import `Epic1GraphEditorFinal.tsx` - it is quarantined until repaired.
  - Treat `REFACTORING_GUIDE.md` and `ARCHITECTURE.md` as historical notes unless they are updated to match the live implementation.

- Side-panel and asset integration
  - `TabbedSidePanel.tsx` is the canonical side-panel host for preview, assets, and component tooling.
  - Treat `TabbedSidePanel.tsx` as a render host that consumes shell-provided tab definitions rather than deciding MVP-vs-advanced framing locally.
  - `AssetBrowserLoader.tsx` is the active bridge from Epic 1 into `@prompt/asset-browser`.
  - Standalone client-only asset panels are non-canonical unless the active shell is updated to use them.

- WeightedChoice node
  - Canonical implementation is `EnhancedBranchingNode`.
  - Exported alias: `WeightedChoiceNode`.
  - Node type mapping: `weightedChoice: EnhancedBranchingNode`.
  - Do not use legacy variants (`ImprovedWeightedChoiceNode`, `WeightedChoiceNodeFixed`, `EnhancedWeightedChoice`).

- Durable document contract
  - Durable graph state should flow through PSG helpers in `packages/core/fileFormats/psg.ts`.
  - Editor-facing APIs should treat PSG as the portable source of truth, not ad hoc graph wrappers.

These constraints keep shell ownership, canvas ownership, and durable state
boundaries aligned.
