# Schema ↔ Epic1 Vocabulary Inventory

_Last updated: 2026-07-14_  
_Work-loop section: **A5** — inventory only; no silent schema rewrites._

## Purpose

Several “sources of truth” disagree about which node types exist and which run in
preview. This document freezes the gap analysis so later work (B2 Template, B4
Include, schema-lock repair) can decide deliberately.

**Executable truth for product preview/export today:**

`packages/core/runtime/nodes/epic1/Epic1NodeType` + `Epic1ExecutionEngine` switch
+ `nodeFactory.createNodeFromData`.

Everything else is format, UI chrome, legacy schema, or aspiration.

---

## Layer map

| Layer | File(s) | Role today |
| --- | --- | --- |
| **Epic1 engine types** | `runtime/nodes/epic1/nodeTypes.ts` | What the executor can run |
| **Epic1 factory** | `runtime/nodes/epic1/nodeFactory.ts` | Builds runtime nodes from UI/import data |
| **React Flow registry** | `components/epic1/nodes/index.ts` → `epic1NodeTypes` | What the canvas can render |
| **Node type registry** | `runtime/nodeRegistry.ts` | PSG ↔ React Flow display mapping |
| **PSG I/O** | `fileFormats/psg.ts` | Portable file types on disk |
| **Import normalize** | `runtime/importGraphNormalization.ts` | Alias collapse on import |
| **`graphSchema.ts`** | root of core package | Zod graph shape (legacy / alternate path) |
| **Schema lock test** | `runtime/__tests__/graphSchema.lock.test.ts` | Pins `graphSchema` enum (misleading “executable” wording) |
| **`nodeSchemas.ts`** | UI form schemas | Includes parked + orphan product types |

---

## Crosswalk table

Legend: **Y** = present · **N** = absent · **P** = parked / non-product · **A** = alias only · **V** = visual-only (not prompt graph)

| Concept | Epic1 engine | RF `epic1NodeTypes` | `graphSchema` | PSG export map | `nodeRegistry` | `nodeSchemas` | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TextBlock | **Y** | Y (`textBlock`) | **N** | Y | Y | **N** | Core product text source; **missing from GraphSchema** |
| WeightedChoice | **Y** | Y (`weightedChoice` → EnhancedBranching) | Y | Y | Y | Y | Aligns |
| Concat / Merge | **Y** | Y (`concat`) | Y | Y | Y | Y | Aligns; joinStyle lives on RF data + runtime, thin in GraphSchema |
| Variable (unified) | **Y** | Y (`variable`) | **N** | Y | Y | **N** | Product model: set/get/`both` on one node |
| SetVariable | **N** | **A** → VariableNode | Y | Y | **N** as own id | Y | Legacy split type |
| GetVariable | **N** | **A** → VariableNode | Y | Y | **N** as own id | Y | Legacy split type |
| Output | **Y** | Y | Y | Y | Y | Y | Aligns |
| Include | **N** | **N** | Y | Y | Y (`isExecutable: true` **false claim**) | Y | Format/schema only; not executed |
| Template / slot | **N** | **N** | Partial (`template` on BaseNode only) | **N** | **N** | **N** | Runtime helper `fillTemplate` exists; no node (B1/B2) |
| PostItNote | N | Y | N | (region/visual) | Y visual | N | Annotation only |
| Bounding box / group | N | Y | N | regions | Y visual | N | Layout chrome |
| componentInstance | N | Y | N | N | N | N | Linked components UI |
| Subject / Action | N | N | N | N | Y (!!) | Y | Registry ghosts; not Epic1 |
| WeightedAdvanced / Conditional / Sequential / Markov | N | N | N (retired) | N | N | **Y (stale)** | Parked tier; strip from `nodeSchemas` in C1 |
| PythonTransform | N | N | N | N | N | N | Retired |

### Epic1 executable set (authoritative for preview)

```
TextBlock | WeightedChoice | Concat | Variable | Output
```

### `graphSchema` enum (authoritative only for GraphSchema.safeParse)

```
WeightedChoice | Concat | Output | Include | SetVariable | GetVariable
```

**Intersection with Epic1:** `WeightedChoice`, `Concat`, `Output` only.  
**In GraphSchema but not Epic1-executable:** `Include`, `SetVariable`, `GetVariable`.  
**In Epic1 but not GraphSchema:** `TextBlock`, `Variable`.

This is the core inconsistency. The schema-lock test name/comments claim the
GraphSchema enum is the “executable node vocabulary”; that is **incorrect** relative
to `Epic1ExecutionEngine`.

---

## Detailed findings

### 1. TextBlock

- Canvas + engine + PSG + registry: **first-class**.
- `graphSchema.ts`: **omitted**. A pure GraphSchema validation path would reject
  every real product graph that uses text blocks.
- **Implication:** Do not treat GraphSchema as the product validation gate until
  TextBlock (and Variable) are added or GraphSchema is demoted to “legacy bundle”
  only.

### 2. Variable vs SetVariable / GetVariable

| Aspect | Reality |
| --- | --- |
| Product UI | Unified `variable` with mode set/get/both (`VariableNode`) |
| Engine | `Epic1NodeType.Variable` only |
| React Flow | `setVariable` / `getVariable` **aliases** map to `VariableNode` |
| PSG | Can emit `Variable`, `SetVariable`, or `GetVariable` depending on editor type |
| GraphSchema | Only Set/Get, **no** `Variable` |
| Import | Canonicalizes all three spellings to RF types |

**Recommendation (decision, not implemented here):**

- **Canonical product type:** `Variable` (PSG + RF + engine).
- **Compat:** On load, map `SetVariable`/`GetVariable` → `Variable` with mode
  `set` / `get`. On save, prefer `Variable` (optionally still accept old types).
- **GraphSchema:** When updated, prefer `Variable` + mode field; keep optional
  Set/Get as deprecated aliases *or* drop after a migration window.
- **Do not** silently delete Set/Get from GraphSchema without a load-path migration
  test (could break old fixtures).

### 3. Include — **DECIDED (B4): Option B, format-only**

| Aspect | Reality |
| --- | --- |
| Engine | Not executed |
| Canvas | No `include` in `epic1NodeTypes` |
| GraphSchema / nodeSchemas / PSG map / registry | Present, format-only |
| Registry `isExecutable` | **false** |
| RF conversion | Explicit skip in `nodeFactory` |

Fragment composition is **authoring-time** (Library / Explore / region fragments).

Full decision record: [`include-node-decision.md`](./include-node-decision.md).

### 4. Template / slot node

- `fillTemplate` in `runtime/assembly.ts` is tested and exported.
- GraphSchema `BaseNode.template` / `extractedVariables` look like Epic 8 leftovers
  on *every* node, not a first-class Template type.
- **Recommendation:** New Epic1 type (B1/B2); do not overload TextBlock silently
  without product sign-off. BaseNode template fields are **not** the Template node.

### 5. nodeSchemas.ts drift

Still lists Subject, Action, and full Epic 7 advanced schemas. Those are **not**
on GraphSchema’s retired surface and **not** Epic1. Cleanup belongs with **C1**
(parked tier disposition), not a silent mid-feature delete.

### 6. nodeRegistry Subject / Action / Include isExecutable

Registry advertises Subject/Action as executable and Include as executable without
engine cases. Treat registry as **UI/catalog helper**, not execution authority,
until cleaned.

### 7. Visual / non-executable canvas types

`postItNote`, `boundingBox`, `enhancedBoundingBox`, `group`, `componentInstance`
are intentional non-prompt nodes. They should never appear in GraphSchema’s
executable union.

---

## Who should own “truth” going forward

| Concern | Owner |
| --- | --- |
| Does preview run this node? | `Epic1NodeType` + engine + factory |
| Can the user place this on the canvas? | `epic1NodeTypes` + palette |
| Does PSG round-trip this type? | `fileFormats/psg.ts` + import normalize |
| Does Zod GraphSchema accept this? | `graphSchema.ts` (needs realignment) |
| Agent docs | `AGENTS.md` / `CLAUDE.md` (already note divergence) |

**Proposed rule for agents and future PRs:**

> If a type is not in `Epic1NodeType`, it does not execute in product preview.
> Do not describe it as executable without an engine `case`.

---

## Decision record (A5 — recommendations only)

| Topic | Recommendation | Implement when | Blocked on |
| --- | --- | --- | --- |
| Executable SoT | Epic1 enum/engine | Immediate (docs) | — |
| GraphSchema realign | Add `TextBlock` + `Variable`; demote or alias Set/Get; Include format-only or implement | Dedicated PR after decisions | Product + migration tests |
| Schema-lock test | Rename intent: “GraphSchema enum lock” **or** retarget to Epic1 vocabulary | With GraphSchema PR | A5 inventory (this doc) |
| Include | Prefer format-only honesty now; full Epic1 Include later | B4 | Fragment resolution design |
| Set/Get → Variable | Canonical Variable + load-time normalize | With GraphSchema / PSG PR | Compat fixtures |
| Template node | New Epic1 type | B1 → B2 | Product design spike |
| nodeSchemas advanced/Subject/Action | Remove or quarantine | C1 | Human delete call |
| Registry isExecutable for Include | Set `false` until implemented | Small follow-up PR OK | Optional; does not need full B4 |

**Explicit non-goals of A5 (not done):**

- No edits to `graphSchema.ts` enum
- No engine changes
- No deletion of parked files

---

## Suggested follow-up PR slices (for later loop turns)

1. **Docs-only (done here):** this inventory + work-loop links.
2. **Honesty PR:** `nodeRegistry` Include `isExecutable: false`; fix schema-lock
   test description; optional GraphSchema comment block pointing here.
3. **GraphSchema realign PR:** TextBlock + Variable + migration tests (product
   decision on Include B vs C).
4. **B2 Template node** after B1 design.
5. **B4 Include** if option A chosen.

---

## Related docs

- [`docs/audit-work-loop.md`](./audit-work-loop.md) — execution loop
- [`docs/parked-implementations/README.md`](./parked-implementations/README.md)
- [`docs/engine-unification-design.md`](./engine-unification-design.md)
- [`docs/launch-known-limitations.md`](./launch-known-limitations.md)
- [`docs/nested-psg-precomp-plan.md`](./nested-psg-precomp-plan.md) — nested docs ≠ Include
- `packages/core/runtime/nodes/epic1/nodeTypes.ts`
- `packages/core/graphSchema.ts`
