# Overview Panel Color Map Plan

## Goal

Make the overview panel/minimap readable on the dark React Flow canvas by rendering every node as a solid, high-contrast type color. Text Block/subject nodes should be visibly brighter than the background so the map reads at a glance instead of collapsing into black-on-black silhouettes.

## Current Findings

- The live editor path is `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx` -> `packages/core/components/epic1/Epic1GraphEditor.tsx`.
- `Epic1GraphEditor.tsx` currently renders React Flow's default `<MiniMap pannable zoomable />`.
- `packages/core/components/epic1/Epic1GraphEditor.css` has minimap rules that force node fills toward a single purple/dark treatment, which defeats type-level color readability.
- `packages/core/components/epic1/CustomMinimap.tsx` has a separate inline node-type color switch, so the extracted GraphCanvas path can drift from the live editor path.

## Implementation Plan

1. Add `packages/core/components/epic1/nodeVisualTheme.ts` with a single `getMinimapNodeColor(node)` helper.
2. Map known node types to solid readable colors:
   - `textBlock`: bright subject color such as `#a3a5ff`
   - `weightedChoice`: `#f6a723`
   - `concat`: `#22c493`
   - `variable`, `setVariable`, `getVariable`: `#9d70f7`
   - `output`: `#22d3ee` unless red output semantics are intentionally preferred
   - `enhancedBoundingBox`, `boundingBox`: `#4ecdc4`
   - fallback: `#94a3b8`
3. Wire `getMinimapNodeColor` into `Epic1GraphEditor.tsx` via React Flow MiniMap's `nodeColor` prop.
4. Update minimap CSS so it preserves opacity, border, and viewport styling without overriding each node's fill.
5. Replace `CustomMinimap.tsx`'s inline color switch with the same shared helper.
6. Add focused unit tests for the helper under `packages/core/components/epic1/__tests__/nodeVisualTheme.test.ts`.

## Acceptance Checks

- The overview panel shows distinct solid colors for Text Block, Weighted Choice, Concat, Variable, Output, and region/bounding-box nodes.
- Text Block/subject nodes are bright enough to stand clearly above the dark minimap background.
- No minimap CSS rule forces all nodes to one fill color.
- The custom minimap and React Flow minimap use the same color mapping.
- Unknown node types fall back to a visible neutral color instead of black.

## Suggested Verification

Run:

```powershell
pnpm --filter core test -- nodeVisualTheme
pnpm --filter client test
```

Manual check:

- Start the editor and load a mixed graph.
- Confirm the minimap is readable on the dark canvas without the black/negative-color effect shown in the screenshot.
