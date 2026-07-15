# Fragment Dissection and Swap Flow

_Last updated: 2026-07-14_

Product design for review-first Prompt Wizard enrichment:

**Paste prompt → dissect into semantic slots → review fragment matches → swap alternatives → create graph.**

Grok proposes classifications and matches; the user approves every substitution. Unmatched text stays as Text Blocks. No silent replacement of user text.

## Implementation phases

| Phase | Scope | Status |
| --- | --- | --- |
| **P0** | Audit all library `.psg` files; expand agent manifest beyond curated 43; add `slotTypes` facets; generate audit report + indexes | **Done** (161 indexed; 0 invalid) |
| **P1** | Draft-graph additive slot metadata + heuristic fallback | **Done** (`slots[]` on draft response) |
| **P2** | Deterministic top-3 slot→fragment matching | **Done** (library util; ready for review UI) |
| **P2b** | Enrich thin single-node fragments where warranted | **Done** (Output + prefix on high-value cats; thin→0) |
| **P3** | Review UI (swap / restore / live preview) in Prompt Wizard | **Done** (`FragmentSlotReview` in wizard) |
| **P4** | Create Graph from approved selections (full fragment insert) | **Done** — expand PSG on Create; Add vs Replace when canvas dirty |

## Facets (retrieval contract)

| Facet | Values |
| --- | --- |
| **Slot** | `subject`, `appearance`, `action`, `setting`, `composition`, `camera`, `lighting`, `style-medium`, `mood`, `constraint` |
| **Domain** | existing + `object`, `abstract` |
| **Graph role** | `roles`, `placementHints`, insertion / boundary metadata |
| **Descriptive** | `tone`, freeform `tags` |

## Canonical artifacts

| Artifact | Role |
| --- | --- |
| `assets/library/**/*.psg` | Canonical fragment files (not moved in v1) |
| `assets/library/agent-fragment-manifest.json` | Authoritative retrieval metadata (curated + expanded) |
| `assets/library/index/*` | Generated / disposable indexes (rebuild with scripts) |
| `assets/library/index/fragment-audit-report.json` | Audit: path, facets, quality, duplicates, eligibility |

## Commands

```bash
pnpm audit:agent-fragments          # scan library, expand manifest, write audit, rebuild index
pnpm enrich:thin-fragments          # add Output (+ prefix when warranted), then re-audit
pnpm generate:agent-fragment-index  # rebuild index/shards from manifest only
```

### Thin → multi-node enrichment policy

| Rule | Action |
| --- | --- |
| Thin fragment missing Output | Add Output + edge (all categories) |
| High-value category + ≥12 options | Also add TextBlock grammatical prefix (`set in` / `while` / `with` / …) |
| `weapons-armor-combat` | Output only (high volume) |

After enrichment, quality audit reported **0 thin / 160 ok** (plus 1 already rich).

## Assumptions (v1)

- Audit + stable retrieval contract first; UI after.
- Grok proposes; user approves.
- Source prompt text never discarded for retrieval failure.
- Wild Construct charcoal/gold + existing PromptDissector patterns.
- Executable Epic1 vocabulary only on Create Graph.

## Fast-follows (out of v1)

Library-first packs, “make this variable”, coverage heatmap, opt-in new user fragment from unmatched slot, local learn-from-accept/reject.

## Related code

- `packages/asset-browser/src/services/AgentFragmentRetrieval.ts` — record types + scoring
- `scripts/build/audit-and-expand-agent-fragments.mjs` — P0 audit/expand
- `scripts/build/generate-agent-fragment-index.mjs` — index + by-slot / by-domain shards
- Mounted AI path: `POST /api/agent/draft-graph` (see route policy)
- Wizard: `PromptWizard` → `PromptDissector`
