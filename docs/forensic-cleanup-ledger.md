# Prompt Spaghetti — Prioritized Cleanup Ledger

> Generated 2026-06-15 by an 8-dimension forensic crawl (read-only) + synthesis pass.
> Evidence-gathering only — nothing was modified to produce this. Deletions happen per-tier, on approval.

## Executive Summary

Eight forensic crawlers produced 99 raw findings across debug scaffolding, dead code, duplication, build artifacts, stale docs, abandoned tooling, test cruft, and orphaned dependencies. After de-duplication and cross-validation, the surviving items bucket into **6 Tier-0**, **9 Tier-1**, **6 Tier-2**, and **2 Tier-3** actions.

**Headline (Tier 0):** `useDragDropHandlers.ts` lines 524-549 contain a two-pass `setTimeout`-based node insertion hack. Parents are added synchronously, then children are appended inside `setTimeout(…, 50)`. This split across event-loop turns is the confirmed cause of the **live fragment-drag bug** where a child node renders **detached below its region box**. Confirmed by direct read. This same block carries three unconditional `console.log` debug statements (the `[DragDrop VERIFY]` and `[DOM CHECK]` traces). Fixing the insertion model (single atomic `setNodes` with children ordered after parents — React Flow requires parent-before-child *in the same array*, not in a later tick) removes both the bug and the debug noise.

**Key cross-validations that changed verdicts:**
- **Dimension B flagged ~5,100 lines of "advanced node tier" as dead code.** Cross-checking against `graphSchema.ts:64-68` (read & confirmed) shows this tier was **intentionally retired** ("never registered, never executed by either engine… implementations remain parked… see docs/engine-unification-design.md"). → Downgraded from "delete" to **Tier 2 (human call)**. Parked-by-design, not accidental cruft.
- **Dimension E flagged CLAUDE.md as claiming Epic 7 "COMPLETE."** Directly contradicts `graphSchema.ts` ("retired"). Resolves in favor of the schema (source of truth) → **Tier 3 doc rewrite**, not a code change.
- **`src/` directory and `packages/core/components/CommandPalette/` do not exist** (confirmed via `ls`), validating Dimensions E & F: the multi-agent task scripts (`finish-task.js` etc.) and "Professional Features" docs are phantom references. → Tier 3 doc cleanup.
- **`scratch_trace.ts` exists** (confirmed) — flagged by A, B, and G; de-duped into one Tier-0 delete.
- **Parked test suites (G) and parked target code (B) overlap.** Tests are in `jest.config.cjs testPathIgnorePatterns`; broken-but-ignored test files are Tier-0 deletes, but their *target modules* (advanced.ts, io-system.ts) inherit the Tier-2 "parked-by-design" caution.

---

## Tier 0 — Zero-risk deletes & the headline bug fix

| Path:Lines | Category | Evidence | Confidence | Action |
|---|---|---|---|---|
| `packages/core/components/epic1/hooks/useDragDropHandlers.ts:524-549` | **Live bug — two-pass setTimeout insert hack** | `setNodes(nds=>nds.concat(parentNodes))` then `setTimeout(()=>setNodes(nds=>nds.concat(childNodes)),50)` — confirmed by direct read. Children added a turn late → child renders detached below region box. Block also holds `[DragDrop VERIFY]` + `[DOM CHECK]` console.logs (527-531, 536-549). | **High (verified)** | **HEADLINE FIX.** Replace two-pass setTimeout with a single atomic `setNodes` that concatenates parents-then-children in one update. Remove the two debug `setTimeout` blocks entirely. |
| `scratch_trace.ts` (whole file) | Scratch/throwaway diagnostic | Confirmed present at repo root. ~72 lines, eslint-disabled, traces PSG fragment positioning. No build/test/import references. Flagged by A, B, G. | **High (verified)** | Delete. |
| `packages/core/components/epic1/nodes/EnhancedBoundingBox/index.tsx:728-735` | Debug useEffect, no dep array | `useEffect(()=>{… console.log(\`[EBB DOM …]\`)})` fires every render with DOM-measure side effects. | High | Delete the entire useEffect. |
| `packages/core/components/epic1/nodes/EnhancedBoundingBox/index.tsx:85-86` | Unconditional debug log | `console.log(\`[EBB ${id}] data.w=…\`)` in shipping component. | High | Delete log + comment. |
| `packages/core/components/epic1/hooks/useDragDropHandlers.ts:483-486` | Unconditional debug log in forEach | `nodesToAdd.forEach(node => console.log(\`[DragDrop DEBUG]…\`))` — confirmed by direct read. | High | Delete; use `debugLogEpic1` if needed. |
| 9 broken parked test files (whole files) | Broken parked test suites | `Conditional/Sequential/Markov/WeightedAdvanced.test.ts`, `advanced/runtime/runtime-comprehensive/expression-evaluator/io-system.test.ts`. All in `jest.config.cjs testPathIgnorePatterns`; 1,100+ compile errors; never run. | High | Delete the 9 ignored test files (and prune their `testPathIgnorePatterns` entries). Target *modules* are Tier 2 — see below. |

---

## Tier 1 — Low-risk cleanup

| Path:Lines | Category | Evidence | Confidence | Action |
|---|---|---|---|---|
| `client/vite.config.js` (whole file) | Duplicate config | `.ts` version is superset (worker config, proxy, env, enhanced onwarn); Vite resolves `.ts` first; `tsconfig.node.json` references only `.ts`. Flagged by C and H. | High | Delete `vite.config.js`; keep `vite.config.ts`. |
| `package.json:226` / `:247` | Orphaned devDeps | `fido2-lib`, `react-grid-heatmap` — zero imports anywhere. | High | Remove from root devDependencies. |
| `packages/core/package.json:60-61` | Orphaned deps | `@stripe/react-stripe-js`, `@stripe/stripe-js` — zero imports; payment never integrated. | High | Remove (and `VITE_STRIPE_PUBLISHABLE_KEY` from `client/.env.example:10`). |
| `client/package.json:35` | Orphaned dep | `webfontloader` — zero imports. | High | Remove from client deps. |
| `**/*.d.ts.map`, `**/*.js.map` outside `dist/` (~89 files) | Tracked source maps not in artifact policy | 89 `.map` files under `packages/core/runtime/`, `config/`, `types/`; not covered by `generatedArtifactPolicy.mjs`; cause CRLF/LF drift. | High | Add `*.d.ts.map`/`*.js.map` to `.gitignore`; `git rm --cached`. Verify with `git check-ignore` first. |
| `.env.example:18-26` | Dead env vars | `LLM_DAILY_LIMIT`, `LLM_COST_LIMIT`, `LLM_CACHE_ENABLED`, `ENABLE_MODEL_INTERPRETATION` — zero code references. | High | Remove unimplemented LLM rate-limit vars. |
| `useNodeOperations.ts:421-440` + `useGraphDragDrop.ts:539-574` | Verbatim duplicate helper | `getDefaultNodeData(type)` identical in both; code comment admits "duplicate from useNodeOperations - could be shared". | High | Extract to shared `utils/nodeDefaults.ts`. |
| 3× `createNodeId` (`useNodeOperations.ts:42-48`, `useDragDropHandlers.ts:140-147`, `useGraphKeyboardShortcuts.ts`) | Divergent ID generators | Three variants differ (`substr` vs `substring`, lengths, ±counter); deprecated `.substr` in one. | Med-High | Consolidate to one shared `createNodeId` utility. |
| `scripts/maintenance/` (~60 files, esp. `fix-role-clone-*.js` ×12) | Historical one-off repair scripts | Iterative `fix-*-syntax.js` / `fix-role-clone-{manual,precise-v2,systematic,final-v3,…}.js`; none wired into `package.json`, CI, or hooks. | High | Archive/delete the maintenance graveyard; note rationale in a `DEPRECATED_SCRIPTS.md` if retention wanted. |

---

## Tier 2 — Needs a human call

| Path:Lines | Category | Evidence | Confidence | Action |
|---|---|---|---|---|
| `runtime/io-system.ts`, `runtime/advanced.ts`, `runtime/nodes/{Conditional,Sequential,Markov,WeightedAdvanced}.ts` (~2,300 lines) | Parked advanced-node tier | **Cross-validated:** `graphSchema.ts:64-68` (read & confirmed) says this tier was intentionally retired and "remain[s] parked under runtime/ for potential future use." Not accidental dead code. Tests already ignored. | High that it's unused; **Low that deletion is wanted** | Human decision: keep parked in place, or move to `docs/parked-implementations/` with a README. Do NOT free-delete — it is architected parked code. |
| `nodeSchemas.ts:72-132` | Unreachable parked schemas | `WeightedAdvancedSchema/ConditionalSchema/SequentialSchema/MarkovSchema` exported but absent from `AnyNodeSchema`. Tied to the parked tier above. | High | Decide alongside the parked tier (move or keep). |
| `useGraphDragDrop` vs `useDragDropHandlers` (parallel hook systems) | Overlapping drag-drop responsibility | Both imported in `Epic1GraphEditor.tsx` (359, 513-527); both expose `onDrop/onDragOver`. Overlapping preset+node drop logic. | Med-High | Clarify boundary or consolidate. Touches the Tier-0 hot path — sequence *after* the headline fix lands. |
| `useNodeOperations.ts` unused methods (`handleNodeEdit`, `duplicateNodes`, `deleteSelectedNodes`, `alignNodes`, `distributeNodes`) | Exported-but-unused, possibly dup of keyboard hook | Editor imports only `createNode/createNodeId/onConnect/onNodesDelete/onEdgesDelete`. Rest may duplicate `useGraphKeyboardShortcuts`. | Med | Verify wiring (toolbar/shortcuts) before removing — may be intended future hooks. |
| `packages/core/services/NodeFactory.ts` | Parallel node-creation system | Class-based `createNode/createNodeId/cloneNode` vs hook-based creation. Usage unconfirmed by crawler. | Med | Grep for `NodeFactory` imports; unify or remove if abandoned. |
| `scripts/build/` shell scripts (~11) + `packages/asset-browser/scripts/build/lib.*` | Build scripts: source vs stale artifact | `scripts/build/README.md` says "not invoked by CI by default"; no workflow references. `lib.cjs` *is* used by `verifyGeneratedArtifacts.mjs:17` — keep that one. | Med | Audit `.github/workflows/*`; archive truly-dead build scripts; keep `lib.cjs` (in use). |

---

## Tier 3 — Docs / large rewrites

| Path:Lines | Category | Evidence | Confidence | Action |
|---|---|---|---|---|
| `CLAUDE.md` (66-106, 145-156, 195-230, 402-453) + `AGENTS.md`, `CLAUDE-TICKETS.md` | False/phantom claims | **Cross-validated:** `src/` and `CommandPalette/` confirmed non-existent via `ls`. Docs claim Epic 7 "✅ COMPLETE" (contradicts `graphSchema.ts` "retired"), reference missing `finish-task.js`/`grab-tasks.js` and deleted `docs/professional-features*.md`, and cite a phantom "Database v2.0.0 / 5,906 tasks" system not present in repo. | High (key claims verified) | Rewrite: drop the multi-agent task-coordination section, the Professional Features section, and the Epic-7-complete claims. State reality: canonical path is client-side `Epic1ExecutionEngine`; advanced tier is parked; real orchestration is `scripts/automation-orchestrator.js`. |
| `CLAUDE.md:58-64`, `:101-105`, `:145-146` | Broken doc file references | Points to non-existent `docs/technical-specs/file-format-specification.md`, `fileFormats/psg.ts`, `fileFormats/psglib.ts`, `docs/agent-tips/`, deleted `docs/professional-features*.md`. | High | Remove dead references or repoint to real files; verify `nodeRegistry.ts` is the current canonical pointer. |

---

## Tier C — Config & docs (executed `claude/cleanup-tier-c-config`)

**knip.json:** collapsed 49 self-reported config hints to a clean minimal config.
Removed redundant default ignores, harmful source-extension ignores
(`*.ts/*.cjs/*.mjs`), all recognized `ignoreBinaries`, and no-match/redundant
entry+project globs. Kept an explicit `packages/core` entry because that package's
`package.json` exports map is broken (points at non-existent built `.d.ts`/`.js`
under `components/epic1` and `components/MenuBar`) so knip can't auto-detect it.
**Residual, out of scope:** that broken core exports map is a real packaging bug —
fixing it needs a deliberate exports rewrite + rebuild and risks consumers, so it's
left noted, not touched.

**Stray deps (server):** removed `base32` (zero usages) and `express` (only
consumer was the self-referential `APIErrorScenarios.test.ts`). Culled the orphaned
Epic 18 error-scenario harness with it: `tests/integration/*`,
`tests/utils/globalTestSetup.ts`, `scripts/run-error-scenarios.sh`, and the
`test:integration` script.

**Tier B loose ends (package.json scripts):** removed `test:regression*` and
`test:performance-benchmarks` entries pointing at files deleted in Tier B (verified
gone); dropped the benchmarks step from `test:performance-full`. Kept
`test:performance-scenarios` (target survives).

**CLAUDE.md rewrite (resolves the Tier 3 rows above):** replaced ~70% fiction with
verified reality. Removed the Professional Features / Command Palette section
(`CommandPalette/` doesn't exist), the `src/`-based multi-agent task system
(`finish-task.js`/`grab-tasks.js`/`fix-system.js`/… all missing), cost tracking,
"Database v2.0.0", and every "Epic 7 ✅ COMPLETE" claim (contradicted by
`graphSchema.ts` + the parked tier). Removed references to the deleted
`server/src/engine.ts` and `/preview` route and the non-existent `packages/cli`.
Repointed to what's real: `Epic1ExecutionEngine` as canonical, the parked tiers,
`nodeRegistry.ts`, `fileFormats/psg(lib).ts`, `assetValidator.ts`, and the actual
`scripts/` automation. Every path in the new file was existence-checked.

---

## Tier C — Test-cruft trim (executed `claude/cleanup-tier-c-tests`)

Follow-up to the "how many of the ~1,000 tests do useful work?" analysis. Scope was
**never-run / rotted test files only** — no live-running test was deleted.

**Deleted — 14 orphaned files (outside `jest.config.cjs` roots → Jest never ran them):**
- 5 stale duplicates of live `tests/services/llm/` suites: `LLMService`, `ModelSelector`,
  `PrivacyFilter` (×2), `TokenTracker`.
- 7 unique-but-rotted (fail against current code — drift caught only because they were
  finally run): `node-groups`, `LRUCache`, `edge-routing`, `assetValidator`,
  `AuthUserProvider`, `PerformanceMonitor`, `NodeIntelligence`.

**Relocated into the live root (passed + unique → preserve real coverage):**
- `services/llm/__tests__/SimilarityEngine.test.ts` → `tests/services/llm/`
- `services/__tests__/assetTypeMapping.test.ts` → `tests/services/`
  (imports repointed to the `tests/` depth convention; both now actually execute).

**Deleted — low-value live suite:** `demos/__tests__/MedievalDemoShowcase.test.tsx`
(asserted emoji/literal strings on an unshipped demo).

**Kept deliberately (flagged "revisit" but cover real/coherent code):**
- `interactions/__tests__/MicroInteractions.test.tsx` — covers **wired** code
  (`triggerHaptic`, `useMagneticSnap`, `NodeInteractionEnhancer`). Real coverage.
- `delightful/__tests__/DelightfulFeatures.test.tsx` — the parked `delightful/*` UX
  layer's executable spec; documented in
  [`docs/parked-implementations/README.md`](parked-implementations/README.md#parked-ux-subsystem--delightful-features).

**Result:** core suite `97 suites / 1006` → `98 suites / 996`, all green. The 2 relocated
suites now run for the first time; net test-count drop is the removed showcase test.

---

### Notes on lowered-confidence / conflict items
- **B's "dead code" ↔ E/graphSchema "intentionally parked":** resolved as parked-by-design → Tier 2, not a free delete.
- **E's "Epic 7 COMPLETE" claim ↔ graphSchema "retired":** schema wins → Tier 3 doc fix.
- **F's `automation-orchestrator.js`:** real and wired — it is the *actual* orchestrator; docs should point here instead of phantom `src/workflow-orchestrator.js`.
- **D's `packages/core/dist/` (32 files):** correctly KEPT — covered by `generatedArtifactPolicy.mjs` (`expectedCheckedIn: true`); only the line-ending drift needs `.gitattributes` normalization.
