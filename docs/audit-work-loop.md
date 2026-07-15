# Audit Work Loop

_Last updated: 2026-07-14_

Operational loop for executing the [codebase vs documentation audit](./) recommendations
section by section. One section is **active** at a time. Complete it, log evidence, then
advance the cursor.

## How the loop works

1. Read **Current cursor** below.
2. Execute only that section’s acceptance criteria.
3. Mark the section `done`, append a short evidence line under **Session log**.
4. Move the cursor to the next `pending` section (same track unless a blocker requires a jump).
5. Stop after each section for a human check-in unless the user said “keep going.”

**Commands for the human:**

| Say | Effect |
| --- | --- |
| `continue work loop` / `next section` | Advance and execute the next pending section |
| `skip section` | Mark current section `skipped` with reason; advance |
| `pause loop` | Leave cursor where it is; do not start the next section |
| `status` | Report cursor + table only |
| `run track A` / `B` / `C` | Prefer that track when picking the next section |

**Rules:**

- Do **not** commit or push unless the user explicitly asks.
- Prefer `CLAUDE.md` + engine + mounted routes over stale agent docs.
- Keep changes reversible and scoped to the active section.
- If a section needs a product decision, mark it `blocked` and move to the next unblocked item.

## Current cursor

| Field | Value |
| --- | --- |
| **Active section** | *(Track F complete)* |
| **Status** | `pending` (paused for check-in) |
| **Track** | F — Fragment dissection / swap flow |
| **Started** | 2026-07-14 |

## Section board

### Track A — Trust & truth (docs + surface honesty)

| ID | Section | Status | Acceptance criteria |
| --- | --- | --- | --- |
| **A1** | Rewrite `AGENTS.md` to match reality | `done` | No phantom systems; points at Epic1 engine, real packages, real commands; aligns with `CLAUDE.md` |
| **A2** | Align route catalog + `ACTIVE_SURFACE.md` | `done` | No `/preview` claim unless mounted; no `packages/cli`; public surface matches `server/src/index.ts` |
| **A3** | Refresh `docs/launch-known-limitations.md` | `done` | Concat `joinStyle` UI reality; cli/engine wording accurate; date stamp |
| **A4** | Local-route sandbox hardening | `done` | Loopback bind default and/or path allowlist for `local-fragments` + document local-image exposure |
| **A5** | Schema ↔ Epic1 vocabulary inventory | `done` | Written gap table (schema types vs `Epic1NodeType` vs PSG); recommend implement vs drop for `Include` / Set-Get; no silent schema rewrite without decision |
| **A6** | Server route policy doc sync | `done` | `docs/server-route-access-policy.md` matches catalog after A2 (completed with A4 local notes + preview removal) |

### Track B — Product wedge

| ID | Section | Status | Acceptance criteria |
| --- | --- | --- | --- |
| **B1** | Template/slot node design spike | `done` | Short design note: node data shape, palette, engine case, defaults; no full impl unless user expands scope |
| **B2** | Template/slot node implementation | `done` | Epic1 node + factory + engine + UI + deterministic tests; defaults backward-compatible |
| **B3** | Output template exports finish | `done` | PreviewTray multi-seed → plain / 3-up copy path verified; tests green |
| **B4** | Include product decision + thin slice | `done` | Decision recorded (resolve from where?); either schema note “format-only” or first Epic1 stub with clear non-goals |
| **B5** | Prose-join default product call | `done` | Decision: keep opt-in default vs NL default; update limitations doc |

### Track C — Brownfield debt (background)

| ID | Section | Status | Acceptance criteria |
| --- | --- | --- | --- |
| **C1** | Parked advanced-tier disposition plan | `done` | Keep/move/delete table for Conditional/Sequential/Markov/WeightedAdvanced/io-system/ImageGen; protect `advanced.ts` |
| **C2** | Shared `createNodeId` + node defaults | `done` | Single util; call sites updated; no behavior change |
| **C3** | Epic1GraphEditor split plan | `done` | Module boundary plan only (or first extraction if small) |
| **C4** | Supabase RLS verification checklist runbook | `done` | Runnable steps from existing checklist; no fake “verified” claim without evidence |
| **C5** | Deploy convergence note refresh | `done` | `deployment-current-state.md` / vercel decision still accurate |

### Track D — Nested PSG product follow-ups

Vertical slice landed (format, runtime, tabs, teaching graph). Remaining product depth:

| ID | Section | Status | Acceptance criteria |
| --- | --- | --- | --- |
| **D1** | Author new nested doc from empty SubPSG | `done` | Create composition on empty SubPSG; bind `documentId`; open child tab with starter Text→Output; name editable |
| **D2** | Multi-document export/open path | `done` | Local + Supabase export embed `documents[]` from project store; open seeds store |
| **D3** | Per-document undo / viewport | `done` | Undo stack + viewport saved/restored per composition on tab switch; suppress cross-doc snapshot bleed |
| **D4** | Nested PSG docs + work-loop log | `done` | Plan + work-loop reflect shipped vs deferred |

### Track F — Fragment dissection & swap flow

Design: `docs/fragment-dissection-swap-flow.md`. Review-first wizard: paste → slots → match → swap → graph.

| ID | Section | Status | Acceptance criteria |
| --- | --- | --- | --- |
| **F0** | Library audit + manifest expand | `done` | All library `.psg` audited; agent index 43→161; `slotTypes` on records; audit report generated; indexes rebuildable |
| **F1** | Draft-graph slot metadata | `done` | Additive `slots[]` on draft response; heuristic classification; model optional fields |
| **F2** | Deterministic top-3 matching | `done` | `matchFragmentsForSlot` with reasons; empty = no library match |
| **F2b** | Enrich thin fragments | `done` | Output (+ prefix when warranted); re-audit 0 thin |
| **F3** | Review UI in Prompt Wizard | `done` | FragmentSlotReview: rows, swap/restore/skip, live preview; wizard Create Graph applies selections |
| **F4** | Create Graph from approvals | `done` | Expand selected fragments via PSG load; Add vs Replace when canvas dirty; mirror library to public |

## Session log

| When | Section | Result | Evidence |
| --- | --- | --- | --- |
| 2026-07-14 | (bootstrap) | created | This file; cursor set to A1 |
| 2026-07-14 | A1 | done | Rewrote root `AGENTS.md`: Epic1-only path, no Command Palette / finish-task / server engine / cli; schema vs engine note; points at work loop + CLAUDE.md |
| 2026-07-14 | A2 | done | Removed phantom `/preview` from `routeSurfaceCatalog.ts`; updated catalog test + health checkEndpoints; rewrote `ACTIVE_SURFACE.md` (no cli, client-side preview, local-fragments) |
| 2026-07-14 | A3 | done | Refreshed `docs/launch-known-limitations.md`: joinStyle UI exists, no cli/preview server, cloud RLS note, work-loop links |
| 2026-07-14 | A4 | done | `localSandboxAccess.ts`: HOST default 127.0.0.1; loopback preHandler on local-image + local-fragments; optional LOCAL_FRAGMENT_ROOTS; .env.example + policy notes; 25 server tests green |
| 2026-07-14 | A6 | done | Synced `server-route-access-policy.md` (no /preview; local loopback notes) with catalog |
| 2026-07-14 | A5 | done | Added `docs/schema-epic1-vocabulary-inventory.md`; clarified graphSchema + lock-test comments; linked from AGENTS/CLAUDE. No enum rewrite. Recommend: Epic1 SoT; Include format-only until B4; Variable over Set/Get |
| 2026-07-14 | (pause) | — | **Track A complete.** Next **B1** (Template/slot design spike). Say `continue work loop` to proceed. |
| 2026-07-14 | C1 | done | `docs/parked-tier-disposition.md` — KEEP advanced.ts; P1 delete batch for parked nodes/io-system; no files deleted |
| 2026-07-14 | C2 | done | Confirmed `utils/nodeDefaults.ts`; wired NodeFactory + useGraphKeyboardShortcuts paste path to shared `createNodeId` |
| 2026-07-14 | C3 | done | `docs/epic1-graph-editor-split-plan.md` — ordered extractions C3a–d; no code split yet |
| 2026-07-14 | C4 | done | `docs/supabase-rls-verification-runbook.md` — phases + verdict; isolation still NOT RUN |
| 2026-07-14 | C5 | done | Refreshed deployment-current-state + vercel-convergence-decision (loopback Fastify, no /preview, dual api surface) |
| 2026-07-14 | (pause) | — | **Track C complete.** Default next **B1**. Optional: `execute parked-tier delete` or `execute C3a`. |
| 2026-07-14 | C1 P1 | done | Deleted parked nodes + io-system + multimodal orphans; stripped nodeSchemas advanced/Subject/Action; registry Subject/Action removed; Include isExecutable false; removed broken perf tests; docs updated |
| 2026-07-14 | C3a | done | Extracted preset/fragment insertion → `presetAndFragmentInsertion.ts` + `usePresetInsertion`; Epic1GraphEditor slimmed; unit tests |
| 2026-07-14 | B1 | done | `docs/template-slot-node-design.md` — Template node data, handles, engine, UI, B2 checklist |
| 2026-07-14 | (pause) | — | Next **B2** (implement Template node). Say `continue work loop` / implement B2. |
| 2026-07-14 | C3b | done | `useComponentLibraryActions` — component save/insert/refresh/region fragment |
| 2026-07-14 | C3c | done | `Epic1GraphEditorShell` — presentation tree |
| 2026-07-14 | C3d | done | `useCanvasCommandBridge` + `buildCommandPaletteCommands` |
| 2026-07-14 | (pause) | — | C3 complete. Next default **B2** Template implementation. |
| 2026-07-14 | B2 | done | Template node: runtime + engine slot inputs + RF UI + palette + PSG/import + 5 tests green |
| 2026-07-14 | (pause) | — | Next **B3** (output template exports) or product smoke of Template node. |
| 2026-07-14 | B3 | done | Verified outputTemplates + PreviewTray selector/Copy All already wired; 5 tray tests green; UX hint when &lt;3 seeds for 3-up |
| 2026-07-14 | (pause) | — | Next **B4** (Include product decision). Say `continue work loop` to proceed. |
| 2026-07-14 | B4 | done | Option B format-only Include: `docs/include-node-decision.md`; factory skip; registry/docs honesty; tests |
| 2026-07-14 | (pause) | — | Next **B5** (prose-join default product call). Say `continue work loop` to proceed. |
| 2026-07-14 | B5 | done | New Merge defaults to joinStyle sentence; engine keeps legacy when field absent; decision doc |
| 2026-07-14 | (pause) | — | **Track B complete** (B1–B5). Optional: smoke UI, commit, or pick next epic. |
| 2026-07-14 | Nested PSG | done (vertical) | documents[] + SubPsg + tabs + nested_psg_intro; stacked PRs #23–#26; #27 → stabilize |
| 2026-07-14 | (resume) | — | **Track D** opened for Nested PSG product follow-ups; active **D1** authoring UX |
| 2026-07-14 | D1 | done | SubPSG Create composition; store.createNestedDocument; starter Text→Output; open child tab |
| 2026-07-14 | D2 | done | Local export + Supabase createPsgDocument + bug-report export pass documents[] from store |
| 2026-07-14 | D4 | done | audit-work-loop Track D + nested-psg plan follow-up table |
| 2026-07-14 | (pause) | — | **D3 deferred** (per-doc undo/viewport). Smoke Create composition or commit when ready. |
| 2026-07-14 | D3 | done | Per-doc history + viewport on ProjectDocument; useGraphHistory export/import/suppress; Epic1GraphEditor switch restore |
| 2026-07-14 | (pause) | — | **Track D complete** (D1–D4). Smoke Nested PSG tabs/undo or structured commit. |
| 2026-07-14 | F0 | done | 161 scanned, 161 indexed (was 43), 0 invalid; slotTypes + by-slot/by-domain shards; design doc |
| 2026-07-14 | (pause) | — | Next **F1** draft-graph additive slot metadata. Retrieval contract stable for review UI. |
| 2026-07-14 | F1 | done | slots[] on AgentDraftService + agenticGraph schema; PromptDissector preserves slots |
| 2026-07-14 | F2 | done | slotClassification + slotFragmentMatch utils + tests |
| 2026-07-14 | F2b | done | enrich-thin-fragments: 160 enriched (Output; 48 with prefix); thin→0 |
| 2026-07-14 | (pause) | — | Next **F3** review UI (swap candidates against stable match API). |
| 2026-07-14 | F3 | done | FragmentSlotReview + PromptWizard wiring; applySlotSelections tests; Create Graph uses choices |
| 2026-07-14 | (pause) | — | Next **F4** full PSG expand for fragment swaps + dirty-canvas Add/Replace. |
| 2026-07-14 | F4 | done | expandFragmentSwaps load+splice; wizard async Create; GraphModals Add/Replace; public library mirror |
| 2026-07-14 | (pause) | — | **Track F complete** (F0–F4). Smoke Wizard review → swap → Create; structured commits optional. |

## Notes from the audit (context)

Priority “five things” mapped into sections:

1. Local-route exposure → **A4**
2. Rewrite `AGENTS.md` → **A1**
3. One vocabulary epic → **A5** (+ later B4)
4. Template node → **B1** then **B2**
5. Supabase RLS verification → **C4**

Canonical product path remains:

- Client: `Epic1ExecutionEngine` + `Epic1GraphEditor` + shell container
- Server: `server/src/index.ts` (local/dev Fastify)
- Hosted backend: legacy `api/**` on Vercel until convergence
- Do not reintroduce server graph engine or Professional Command Palette
