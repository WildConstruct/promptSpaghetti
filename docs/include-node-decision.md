# Include Node — Product Decision (B4)

_Decided: 2026-07-14 · Work-loop **B4**_

## Decision

**Option B — Format-only honesty.**

| | |
| --- | --- |
| **PSG / GraphSchema** | May still carry `Include` for forward-compat and legacy fixtures |
| **Epic1 engine** | Does **not** execute `Include` |
| **Canvas / palette** | No Include node on the product surface |
| **Runtime conversion** | React Flow `include` → skip (null), same as UI-only nodes |
| **Registry** | `isExecutable: false` |

Fragment reuse today is **authoring-time**: Library drag/drop, Explore open, region→fragment save — not execute-time subgraph expansion.

## Why not implement execute-time Include now

Full Include needs product answers that B4 does not invent:

1. **Resolution source** — named library fragment? absolute path? inline embedded PSG?
2. **Cycle / depth limits** — Include of Include
3. **Variable / seed scope** — does the child share context?
4. **Handles** — what inputs/outputs does an Include expose?

Related but distinct: **nested PSG / precomp tabs** (`docs/nested-psg-precomp-plan.md`) is a document-workspace model, not the same as a string-lookup `IncludeNode` from the old runtime.

## Why not delete from schema (Option C)

- Old assets / tests may still mention the type
- Format can grow without forcing a half-baked executor
- Deletion can follow a deliberate migration later

## Thin slice delivered with this decision

1. Decision record (this file)
2. Registry copy + `isExecutable: false` (already set; docs aligned)
3. `nodeFactory` explicit `include` skip
4. GraphSchema / nodeSchemas comments mark format-only
5. Limitations + vocabulary inventory updated

## When to reopen (future epic)

Reopen as **native Epic1 Include** only with:

- Written resolution contract (where fragments live)
- Determinism + cycle tests
- Palette + inspector UX that does not feel like a circuit-diagram precomp unless that is the product intent

Until then: **do not** port `packages/core/runtime/index.ts` `IncludeNode` (legacy lookup) into Epic1.

## Related

- [`schema-epic1-vocabulary-inventory.md`](./schema-epic1-vocabulary-inventory.md)
- [`nested-psg-precomp-plan.md`](./nested-psg-precomp-plan.md)
- [`launch-known-limitations.md`](./launch-known-limitations.md)
