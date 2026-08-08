# Cable Management Utility

**Branch:** `feat/cable-management-062026`  
**Inspired by:** [@ggsimm — "Don't let your node UIs become spaghetti"](https://x.com/ggsimm/status/2085652324853186604)

Pure TypeScript edge-bundling for node graphs. Parallel corridors share a trunk; zip ties clamp the bundle. Drop this into the Epic1 React Flow canvas when wiring custom edges.

## Why

Prompt Spaghetti graphs get hard to read as edge count grows. Classic Bezier edges cross freely ("spaghetti"). This utility:

1. **Clusters** edges that share endpoints or travel similar corridors
2. **Bundles** them onto a shared spine with lateral offsets (colored "wires")
3. Places **zip ties** along the trunk so the managed look reads at a glance
4. Exposes a continuous **`management`** dial (0 = spaghetti, 1 = fully managed)

## Install / consume

This package lives in-repo under `tools/cable-management` (no publish step). From core/editor code:

```ts
import {
  layoutCables,
  type GraphNode,
  type GraphEdge,
  type LayoutOptions,
} from "../../tools/cable-management/src";

const layout = layoutCables(nodes, edges, {
  management: 1,
  cableSpacing: 7,
  clusterRadius: 130,
  tiesPerGroup: 2,
  fanLength: 56,
  seed: 42,
});

// layout.paths  → SVG path `d` + color per edge
// layout.ties   → zip-tie position/angle/size
// layout.groups → bundle membership
```

### Suggested React Flow integration

1. Keep node positions from React Flow (`node.position` + measured size).
2. Map RF edges → `GraphEdge` with stable colors.
3. Call `layoutCables` whenever nodes/edges/options change (memoize).
4. Render a custom edge layer (SVG) under nodes using `paths` + `ties`.
5. Optionally store `management` in PSG document meta so layouts stay consistent.

```tsx
// Sketch — custom edge overlay
{layout.paths.map((p) => (
  <path key={p.edgeId} d={p.d} stroke={p.color} fill="none" strokeWidth={2.6} />
))}
{layout.ties.map((tie) => (
  <g
    key={tie.id}
    transform={`translate(${tie.x} ${tie.y}) rotate(${(tie.angle * 180) / Math.PI + 90})`}
  >
    {/* zip-tie rects — see demo CableCanvas for full visual */}
  </g>
))}
```

## API

| Export | Role |
| --- | --- |
| `layoutCables(nodes, edges, options)` | Main layout |
| `createDemoGraph()` | Dense sample graph for demos/tests |
| `polylineToPath` / geometry helpers | SVG path utilities |
| Types: `GraphNode`, `GraphEdge`, `LayoutOptions`, `LayoutResult`, `ZipTie`, `CablePath` | Contracts |

### `LayoutOptions`

| Field | Default | Meaning |
| --- | --- | --- |
| `management` | `1` | 0–1 blend spaghetti → managed |
| `cableSpacing` | `7` | Lateral px between parallel cables |
| `clusterRadius` | `120` | How aggressively corridors merge |
| `tiesPerGroup` | `2` | Zip ties per multi-edge trunk |
| `fanLength` | `56` | Fan-out distance before trunk |
| `seed` | `42` | Deterministic spaghetti jitter |

## Files

```
tools/cable-management/
  package.json
  README.md
  src/
    index.ts
    types.ts
    geometry.ts
    layout.ts
    demo-graph.ts
```

## Demo app

An interactive workbench (strength slider, spaghetti/managed toggle, draggable nodes) was built alongside this branch for visual QA. The algorithm itself has **no React dependency** and is safe to import from `packages/core`.

## Next steps (product)

- [ ] Wire `layoutCables` into `Epic1GraphEditor` as an optional edge mode
- [ ] Persist `management` + seed in PSG document metadata
- [ ] Honor reduced-motion (skip spaghetti jitter animation if any)
- [ ] Hit-test zip ties to expand/collapse individual bundles

## Branding note

UI chrome should keep Wild Construct neutrals + gold accent (`#e6a23c`). Multi-color cable strokes are intentional (physical wire colors), not chrome accents.
