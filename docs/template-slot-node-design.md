# Template / Slot Node — Design Spike (B1)

_Work-loop **B1** · 2026-07-14_  
_Implementation is **B2**. This doc is design only._

## Problem

Natural-language prompts should read as sentences, not tag lists. The chosen
primary mechanism (Compact / HANDOFF) is a **sentence skeleton with `{slots}`**
filled by upstream variation:

```
a {age} {profession} wearing {outfit}
```

Runtime helpers already exist and are tested:

- `fillTemplate(template, slots, opts)` — `packages/core/runtime/assembly.ts`
- `templateSlots(template)` — ordered unique slot names

Missing: Epic1 node type, canvas UI, engine wiring, palette entry.

## Product intent

| Goal | Detail |
| --- | --- |
| Human-authored skeleton | User writes the prose frame once |
| Slots filled by graph | Upstream WeightedChoice / TextBlock / Variable / Concat feed named slots |
| Deterministic | Same seed + same graph → same filled sentence |
| Backward compatible | Existing graphs without Template nodes unchanged |

**Not in B1/B2:** LLM “naturalize” pass; nested templates; full Include composition.

---

## Naming & type identity

| Layer | Value |
| --- | --- |
| Display name | **Template** (or “Slot Template”) |
| `Epic1NodeType` | `Template` |
| React Flow type | `template` |
| PSG type | `Template` |
| Class | `TemplateNode` |
| Registry id | `template` |

Avoid overloading GraphSchema’s existing optional `BaseNode.template` /  
`extractedVariables` fields (Epic 8 leftovers on every node). Prefer a **dedicated
node type** with its own data shape.

---

## Data shape (node `data`)

```ts
type TemplateNodeData = {
  /** Sentence skeleton with {slotName} placeholders */
  template: string;
  /**
   * Optional ordered list of slot names for UI / handle layout.
   * If omitted, derived via templateSlots(template) at runtime.
   */
  slots?: string[];
  /** fillTemplate options — defaults match assembly.ts */
  capitalize?: boolean;  // default true
  terminate?: boolean;   // default false for mid-sentence templates
  /** Display label */
  label?: string;
};
```

**Default for new nodes:**

```ts
{
  template: 'a {subject} in {setting}',
  capitalize: true,
  terminate: true
}
```

Defaults must not change behavior of graphs that never include this type.

---

## I/O / handles

### Inputs (dynamic)

One **target handle per slot**, id = `slot-{name}` (e.g. `slot-subject`, `slot-setting`).

- Multiple edges into the same slot: **join with space** (or last-wins — prefer
  space-join to match Concat mental model; document clearly).
- Missing slot: fill with `''` (fillTemplate already strips empty cleanly).

### Output

Single source handle `source` (string) — filled template text.

### Engine evaluation order

1. Resolve all upstream inputs for this node (existing engine traversal).
2. Build `slots: Record<string, string>` from edges targeting `slot-*` handles
   (and/or legacy `target` if we add a single multi-input mode later — **not v1**).
3. `output = fillTemplate(data.template, slots, { capitalize, terminate })`.

Wire in:

- `Epic1NodeType.Template` enum
- `TemplateNode` class (mirror `TextBlockNode` / `ConcatNode` simplicity)
- `nodeFactory` case
- `Epic1ExecutionEngine` switch case
- Preview conversion path that already maps RF nodes → factory data

---

## UI

### Canvas card

- Header chip: **Template** (brand gold chip style)
- Collapsed body: one-line preview of skeleton (truncate)
- Expanded / edit: textarea for `template`; live list of detected slots
- Optional checkboxes: Capitalize first letter · End with period

### Handles

- Left: dynamic targets, **row-aligned** to slot list (same lesson as WeightedChoice
  branch rows) so wiring is obvious
- Right: single output

### Palette

- Add under text/flow group: “Template” — “Sentence with {slots}”
- Default skeleton as above

### Inspector (if used)

- Same fields as inline edit; no second source of truth

---

## Conversion / PSG

| Direction | Behavior |
| --- | --- |
| RF → runtime | `type: Template`, pass `template`, flags, slot map from edges |
| RF → PSG | `type: Template`, export template string + flags in node payload |
| PSG → RF | Map `Template` → `template` RF type |
| Import normalize | Add `Template` / `template` to `canonicalizeImportedNodeType` |

**GraphSchema:** When realigning (A5 follow-up), add `Template` to product enum  
**or** keep only in Epic1 until GraphSchema realign PR. B2 should at minimum update
Epic1 path; GraphSchema update can ship in same PR if tests allow.

Do **not** rely on `BaseNode.template` optional field as the product node.

---

## Determinism & tests (B2 acceptance)

1. Unit: `TemplateNode` + fixed slots → known string  
2. Integration: WeightedChoice → slots → Template → Output; seed stable  
3. Empty slots: `"a  wearing hat"` normalizes sensibly via `fillTemplate`  
4. Default graphs without Template still pass existing suites  

---

## Alternatives considered (rejected for v1)

| Idea | Why not |
| --- | --- |
| Only improve Concat joinStyle | Secondary; no skeleton control |
| TextBlock with `{slots}` magic | Collides with `{{var}}` substitution; weak handle model |
| Revive Conditional for fill | Wrong abstraction |

---

## Implementation checklist (B2)

- [x] `Epic1NodeType.Template`
- [x] `TemplateNode.ts` using `fillTemplate` / `templateSlots`
- [x] Engine + factory + graph→engine conversion (`slot-*` inputs)
- [x] RF component + palette chip/handles
- [x] Palette entry + `getDefaultNodeData('template')`
- [x] Import/export + PSG mapping (`template` ↔ `Template`)
- [x] Tests (unit + engine integration + determinism)
- [ ] Example graph or tutorial step (optional follow-up)
- [x] Update `docs/launch-known-limitations.md` when shipped

---

## Open product decisions (resolved for v1)

1. **Multi-edge same slot:** space-join (implemented).  
2. **`terminate` default:** true on new nodes (default skeleton is a full sentence).  
3. **Slot rename:** handles recompute from template string on apply; orphan edges to removed
   `slot-*` ids simply stop contributing (React Flow may show dangling connections until user cleans up).

---

## Status

**B1 design** + **B2 implementation** complete (2026-07-14).