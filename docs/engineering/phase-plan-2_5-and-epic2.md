# Implementation Plan — 2.5 (MVP + Advanced) and Epic 2 Integration

This plan summarizes what is implemented, what remains, and the step-by-step work to complete Epic 2 and finish integrations spawned by 2.5.

## Summary of What’s Implemented (Key Highlights)

- 2.5a/2.5b integrations
  - Drag-and-drop (DnD) with overlays, ghost preview, 50px boundary rule.
  - Replacement modal with type change + deterministic prune (compat matrix).
  - Bridge suggestion bar: inserts Concat bridges for pruned edges (optional).
  - WeightedChoice quick add; suggestions (top-3), indicators (High/Medium), offline fallback.
  - Actionable toasts (exact copy, W/? hotkeys), 2s persistence, ARIA.
  - Performance monitor emits `drag_performance` and `perf_violation`.
  - Consent check default ON; File → Settings toggle; audit log stub.
  - Build Tree mode: preview modal + accept with undo snapshot.
  - Advanced replacement options: Merge Choices, Create Variant, Smart Swap, Replace All Similar (with progress overlay, cancel + rollback). Replace All Selected supported.
  - Search tab: NL search with query, exclude, similar-to-selected, stream results.
  - Relations tab: clusters by type and common pairs from acceptance history.
  - Consistency checks: overlay (Apply fix, Fix All) + node severity badges; strictness toggle.
  - Batch ops (stubs): Apply metadata to selection; Disconnect selected nodes; Undo Last button.

- Cross-cutting
  - Global asset registry: `window.assetRegistry.update(assets)` broadcasts to Search and Relations.
  - Manifest bootstrap: AssetBrowserLoader attempts to publish assets from `/presets/manifest.json` or `/asset-browser/presets/manifest.json`.
  - Autosave/restore + Download JSON (Phase 1 planned to implement first in the new session).

## Settings & Storage Keys (Keep Stable)

- Consent: `consent.require` (true/false)
- Smart Mode: `smartMode.enabled` (true/false)
- Build Tree: `buildTree.enabled` (true/false)
- Advanced Matching: `advancedMatching.enabled` (true/false)
- Matches Only: `matches.only` (true/false)
- Consistency Checks: `consistency.enabled` (true/false)
- Consistency Strictness: `consistency.strictness` ('standard' | 'strict')
- Graph autosave/history: GraphPersistence uses `epic1-graph-autosave`, `epic1-graph-history`

## Registry & APIs (Keep These Interfaces)

- Asset registry (global):

  ```js
  // publish asset list
  window.assetRegistry.update([{ id, name, type: 'psglib'|'psg', metadata: {...} }, ...])
  // consumed by: AssetSearchPanel, RelationshipView
  // event: 'assetRegistry:update' detail { assets }
  ```

- DnD/Canvas:
  - CanvasDropArea props include hooks for create/replace/quick-add/batch/insert tree
  - Replacement flows use compatibility matrix for prune, optional bridge suggestion.

## AC Status (Condensed)

- 2.5a MVP: Core DnD (Pass), Replacement (Partial — undo stack integration to confirm), Matching (Pass), Suggestions (Pass), Invalid Drops (Pass), Offline (Pass), Smart Mode (Pass), Perf monitoring (Partial — CI perf gate later), Consent (Pass)
- 2.5b Advanced: Build Tree (Partial; preview/accept/undo implemented), Advanced Replacement (Partial; menu + batch ops done), AC3 Advanced Matching (Pass; toggle, fallback), AC4 Categories & Learning (Pass), AC5 Bulk Ops (Pass), AC6 Consistency Engine (Pass; overlays, badges, strictness), AC7 NL Search (Pass; Search tab + features), AC8 Relations (Partial; clusters + pairs list)

## Plan — Phases to Finish Epic 2 + Integrations

1. Autosave/Restore + Download JSON (Phase 1)
   - Add autosave on node/edge change (throttled).
   - On init, prompt to restore autosave.
   - Add “Download JSON” in GraphControls.

2. Node Library UI polish (Phase 2)
   - Palette tooltips and param summaries (nodeTypes metadata extended: title, summary, params).
   - Display summary/params in inspector headers.

3. Connections & Validation (Phase 3)
   - `useValidation` hook scans edges/nodes for basic type/required-input errors.
   - Edge/node error highlights; status bar with error/warning counters.

4. Inspector Forms (Phase 4)
   - Schema registry (zod/json-schema) for node types.
   - `SchemaForm` component with debounced onChange and inline validation.
   - Hook validation results into status bar.

5. Preview-5 Modal (Phase 5)
   - Preview button (Ctrl/Cmd+P) opens PreviewModal.
   - Wire to preview engine stub or mock `/preview`; degrade gracefully.

6. AC7/AC8 Enhancements (Phase 6)
   - Integrated browser feeds real assets via `assetRegistry.update` (hook onAssetsLoaded if available in ProAssetBrowser).
   - RelationshipView: add simple adjacency (SVG) for top pairs.

## Risks & Decisions

- Asset dataset: until ProAssetBrowser exposes dataset, we rely on manifest bootstrap; registry remains the standard surface.
- Undo strategy: lightweight snapshots via GraphPersistence; acceptable for MVP.
- Consistency rules: current rules are heuristic; strictness provides a simple tuning, but future thresholds may be added.

## Handoff Notes (Memory to Keep)

- Use the following toggles consistently in Settings: consent.require, smartMode.enabled, buildTree.enabled, advancedMatching.enabled, matches.only, consistency.enabled, consistency.strictness.
- Asset registry is the contract for Search/Relations. Keep `assetRegistry.update()` stable.
- DnD flows and Replacement use compatibility matrix; `BridgeSuggestionBar` provides on-demand Concat adapters.
- Batch ops save snapshots before changes; Cancel and Undo revert correctly.
- Consistency overlay and badges depend on `useConsistency`; strictness may upgrade severity.

## After Epic 2

- Once Epic 2 items are complete, review AC9 performance gating (CI perf job) and add a minimal perf regression test suite.
