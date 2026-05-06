# Metagrinder PSG Authoring Guide

This is the handoff contract for Metagrinder when it emits Prompt Spaghetti
Graph (`.psg`) files that must open in the Prompt Spaghetti app.

## The Required Shape

Metagrinder should emit a flat PSG source document. Do not emit a PSGLib file,
React Flow export, editor project wrapper, or nested `graph.nodes` shape.

Use this top-level shape:

```json
{
  "version": "1.0.0",
  "name": "Readable Graph Name",
  "description": "Optional short description",
  "metadata": {
    "type": "ASSET_FRAGMENT",
    "source": "metagrinder",
    "tags": ["optional", "tags"]
  },
  "nodes": [],
  "edges": [],
  "regions": []
}
```

Required top-level fields:

- `version`: string, currently `"1.0.0"`
- `name`: string
- `nodes`: array
- `edges`: array

Optional top-level fields:

- `description`: string
- `metadata`: object
- `regions`: array

## Node Rules

Use PSG node type names, not React Flow node type names.

| Intent | Correct PSG `type` |
| --- | --- |
| Static text | `TextBlock` |
| Weighted option list | `WeightedChoice` |
| Join two incoming text paths | `Concat` |
| Final emitted prompt | `Output` |

Every node must have:

- `id`: stable string, unique within the file
- `type`: one of the PSG types above
- `x`: number
- `y`: number

Recommended fields by node type:

```json
{
  "id": "family-dna",
  "type": "TextBlock",
  "name": "Family DNA",
  "x": 80,
  "y": 120,
  "value": "frontier ranger, grounded wardrobe, natural light"
}
```

```json
{
  "id": "role-accent",
  "type": "WeightedChoice",
  "name": "Role Accent",
  "x": 430,
  "y": 80,
  "options": [
    { "text": "trail scout with field notebook", "weight": 35 },
    { "text": "salvage runner with practical kit", "weight": 35 },
    { "text": "watch captain with stitched insignia", "weight": 30 }
  ]
}
```

```json
{
  "id": "join-prompt",
  "type": "Concat",
  "name": "Join Prompt",
  "x": 820,
  "y": 140,
  "value": ", ",
  "data": {
    "separator": ", "
  }
}
```

```json
{
  "id": "output",
  "type": "Output",
  "name": "Output",
  "x": 1140,
  "y": 140,
  "template": "{prompt}"
}
```

## Edge Rules

Every edge must have:

- `id`: stable string, unique within the file
- `source`: source node id
- `target`: target node id

Only reference node ids that exist in the same file.

Use these handles when a handle is needed:

| Case | Handle |
| --- | --- |
| Generic source | `source` |
| Generic target | `target` |
| First `Concat` input | `input1` |
| Second `Concat` input | `input2` |
| Weighted-choice main flow | `main` |
| Weighted-choice branch outputs | `branch-0`, `branch-1`, `branch-2` |
| Edge into `Output` | omit `targetHandle` |

For simple linear graphs, omit `sourceHandle` unless branch behavior matters.
For `Concat`, set `targetHandle` explicitly so the app knows which text input
each edge feeds.

Example:

```json
{
  "id": "edge-dna-to-join",
  "source": "family-dna",
  "target": "join-prompt",
  "targetHandle": "input1"
}
```

```json
{
  "id": "edge-role-to-join",
  "source": "role-accent",
  "target": "join-prompt",
  "targetHandle": "input2"
}
```

## Region Rules

Regions are semantic grouping metadata. They are not editor bounding boxes.

Use this shape:

```json
{
  "id": "region-core",
  "name": "Core Prompt",
  "color": "#22d3ee",
  "nodes": ["family-dna", "role-accent", "join-prompt", "output"],
  "description": "Optional grouping note",
  "metadata": {}
}
```

Region rules:

- `id` and `name` are required.
- `nodes` must list real node ids from the same file.
- Do not put `position`, `width`, `height`, `parentNode`, `extent`,
  `expandParent`, or collapsed/editor styling into regions.
- The app synthesizes wrapper boxes on import when needed.

## Minimal Valid PSG

Use this as the smallest safe template:

```json
{
  "version": "1.0.0",
  "name": "Metagrinder Prompt Example",
  "description": "Flat PSG emitted by Metagrinder.",
  "metadata": {
    "type": "ASSET_FRAGMENT",
    "source": "metagrinder"
  },
  "nodes": [
    {
      "id": "base",
      "type": "TextBlock",
      "name": "Base Prompt",
      "x": 80,
      "y": 120,
      "value": "documentary portrait, grounded wardrobe, natural light"
    },
    {
      "id": "variation",
      "type": "WeightedChoice",
      "name": "Variation",
      "x": 430,
      "y": 120,
      "options": [
        { "text": "trail scout with field notebook", "weight": 50 },
        { "text": "watch captain with stitched insignia", "weight": 50 }
      ]
    },
    {
      "id": "join",
      "type": "Concat",
      "name": "Join",
      "x": 780,
      "y": 120,
      "value": ", ",
      "data": { "separator": ", " }
    },
    {
      "id": "output",
      "type": "Output",
      "name": "Output",
      "x": 1120,
      "y": 120,
      "template": "{prompt}"
    }
  ],
  "edges": [
    {
      "id": "edge-base-join",
      "source": "base",
      "target": "join",
      "targetHandle": "input1"
    },
    {
      "id": "edge-variation-join",
      "source": "variation",
      "target": "join",
      "targetHandle": "input2"
    },
    {
      "id": "edge-join-output",
      "source": "join",
      "target": "output"
    }
  ],
  "regions": [
    {
      "id": "region-prompt",
      "name": "Prompt",
      "color": "#22d3ee",
      "nodes": ["base", "variation", "join", "output"]
    }
  ]
}
```

## Common Reasons Metagrinder PSGs Fail To Open

- The file uses a nested editor shape like `{ "graph": { "nodes": [] } }`.
- The file is a PSGLib file with `fileType: "psglib"` instead of a flat PSG.
- The file uses React Flow node types such as `weightedChoice` instead of PSG
  types such as `WeightedChoice`.
- Nodes use only `position: { "x": 0, "y": 0 }` instead of canonical top-level
  `x` and `y`.
- Edges reference node ids that are missing or renamed.
- `Concat` edges do not identify `input1` and `input2`.
- Weighted branch edges use arbitrary labels instead of `branch-0`,
  `branch-1`, etc.
- The file includes editor-only wrapper nodes, selection state, viewport state,
  undo history, dimensions, or React Flow parent/extent fields.
- Weighted choices put options only in unrelated prose instead of an `options`
  array of `{ "text": string, "weight": number }`.
- `nodes` or `edges` is missing, null, or an object instead of an array.

## Generation Checklist For Metagrinder

Before handing a `.psg` file to Prompt Spaghetti, verify:

- JSON parses cleanly.
- Top-level `version`, `name`, `nodes`, and `edges` exist.
- `nodes` and `edges` are arrays.
- Every node has unique `id`, PSG `type`, numeric `x`, and numeric `y`.
- Every `WeightedChoice` has non-empty `options`.
- Every option has string `text` and numeric `weight`.
- Every edge has unique `id`, `source`, and `target`.
- Every edge source/target exists in `nodes`.
- Every `Concat` input edge uses `targetHandle: "input1"` or
  `targetHandle: "input2"`.
- Edges into `Output` omit `targetHandle`.
- Regions, if present, reference only real node ids.
- The file does not contain editor-only wrapper/session fields.

## Validation Guidance

Use the current app parser as the authority:

- `packages/core/fileFormats/psg.ts`
- `docs/psg-weekend-mvp-contract.md`
- `docs/examples/mvp-character-archetype-demo.psg`
- `packages/core/fileFormats/__tests__/mvpDemoExamples.test.ts`

Do not treat `scripts/validate-asset.js` as authoritative for app-open
compatibility right now. It still contains stale guidance about Output nodes in
fragments.

When adding a new canonical example, put it under `docs/examples/` and add it
to `packages/core/fileFormats/__tests__/mvpDemoExamples.test.ts`, then run:

```powershell
corepack pnpm --filter @promptscape/core test -- --runInBand fileFormats/__tests__/mvpDemoExamples.test.ts
```

If a generated file still fails to open, compare it field-for-field against
`docs/examples/mvp-character-archetype-demo.psg` before changing the app.
