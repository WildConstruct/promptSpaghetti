# Merge prose-join default — Product Decision (B5)

_Decided: 2026-07-14 · Work-loop **B5**_

## Decision

**Natural-language join is the default for newly created Merge (Concat) nodes.**

| | |
| --- | --- |
| **New nodes** (palette / factory / `getDefaultNodeData`) | `joinStyle: 'sentence'` |
| **Existing graphs** with no `joinStyle` field | **Unchanged** — engine still uses legacy space/separator join |
| **Author control** | Merge card still exposes all join styles + legacy separator |

## Rationale

- Lab product direction is prose prompts, not tag lists (Compact / Template path).
- Tool not yet in heavy production use; safe to bias **new** authoring toward NL.
- Prior graphs are preserved by the engine contract: **omit `joinStyle` ⇒ legacy**.

## Implementation

- `packages/core/components/epic1/utils/nodeDefaults.ts` — concat defaults
- `packages/core/components/epic1/services/NodeFactory.ts` — template defaults
- UI option order prefers Sentence first; empty value still means legacy for old data
- Runtime `ConcatNode` comments clarify absent vs set `joinStyle`

## Not done (intentionally)

- Do **not** rewrite saved graphs to inject `joinStyle: 'sentence'`.
- Do **not** change engine default when field is missing (that would break determinism of demos without the field).

## Related

- Template node (B2) — skeleton/slots for sentence structure
- `packages/core/runtime/assembly.ts` — `assemble()` / join styles
- [`launch-known-limitations.md`](./launch-known-limitations.md)
