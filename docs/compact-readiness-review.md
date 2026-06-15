# Prompt Spaghetti — Compact Readiness Review & Refactor Plan

_Working document. Reviewed against three Wild Construct source documents:_

1. **The Artist's Compact (v003)** — the public standard / design specification.
2. **Launch strategy ("The First Two Signals")** — Prompt Spaghetti as a Lab proof-of-concept, paired with Signal Rack.
3. **Riggable Production Systems Report** — internal architecture; defines PSG/Prompt Spaghetti's role inside the larger system.

The job of this document is to make the thinking legible enough to critique (per the architecture
memo's intent) **before** code moves, and then to drive the cleanup/refactor methodically.

---

## 1. The governing reframe

Two corrections shape everything below.

**A. Don't chase the EraCrowd UI.** The dense, JSON-heavy, many-typed-port node mat is closer to
the "circuit diagram" the Compact (Principle II) explicitly warns against:

> "A ComfyUI workflow is a circuit diagram. A Nuke script is a creative pipeline… exposing model
> internals as user interface is backwards."

The launch doc frames Prompt Spaghetti as a **working proof of concept** — "usefulness, structure,
and direction over polish." So we match EraCrowd's **finish** (cohesive dark theme, real panel
chrome) while staying **radically simpler** than it.

**B. "Branching" is the wrong word — the target is _constrained variation within a production
envelope._** The architecture memo never asks for control-flow branching (if/else, Markov,
expressions). It asks for bounded, art-directable randomness:

> "The randomness left inside the system should be useful randomness… the roll should happen inside
> a production envelope. The system defines what must remain stable, what may vary, what ranges are
> valid." (§5)

And it gives the exact node design — the **WCX node's three modes** (§10): **locked**,
**exposed-controls**, **constrained-variation**. That is our "proper branching node."

**C. Keep the utility fun and small; let the _format_ carry the depth.** Prompt Spaghetti the
**app** is a fun, useful utility: a person takes their own prompt, breaks it into fragments, adds
weighted/varied choices, previews variations, tweaks, and saves/shares. That is the whole product.
The **PSG file format** has heavier requirements (recipes, manifests, seeds, ranges, provenance)
because it serves the larger system — but the public editor should not surface that machinery.
Format depth ≠ UI depth. When in doubt, the utility stays simple.

**D. Fragments are a first-class feature and meant to grow.** The fragment corpus
(`assets/library/`, 161 `.psg` files, plus `.psglib` presets) is core to the tinker-tool appeal —
people grab a fragment, break their prompt apart, swap and vary pieces. We keep the corpus, make
`Include` actually compose it (Phase 3), and treat "ship more fragments" as an ongoing content
lane, not a one-time set. Nothing in the strip-out (§5) removes corpus content; only an analysis
_report about_ the corpus is deleted.

---

## 2. Compact scorecard

| # | Principle | Fit | Notes |
|---|-----------|-----|-------|
| I | Human direction | 🟢 | Graph is human-authored. Gap: no AI-assist in the loop yet. |
| II | Embodied control > prompt dependency | 🟡 | Good as a graph; at risk from orphaned plumbing-style nodes. Needs progressive disclosure. |
| III | Generate for assembly, not monolith | 🟢 | Fragments + Concat = decomposed parts. **Core strength.** Recombination is weak. |
| IV | Heritage-amplified | 🔴→🟡 | Weak today; the JSON-recipe export + WCX interop is the fix. |
| V | Iteration speed | 🟢 | Multi-seed preview, debounced. Real. |
| VI | Continuity across shots | 🟢 | Seeded determinism + Variables + reusable fragments. **Core strength.** |
| VII | Economics respect craft | 🟢 | Free, browser-native, no per-generation metering. |
| VIII | Transparency / inspectability | 🟢 | The graph _is_ the inspectable prompt logic. **Core strength.** |
| IX | Veto of lived experience | 🟡 | `mute`/`solo` on choices = lightweight veto. Lean in. |
| X | Public accountability | 🟡 | PSG as an open format supports this; not framed yet. |

**Lead the narrative on III, VI, VIII.** Fix IV via structured export. Protect II by cutting plumbing.

---

## 3. Current-state findings (what the audits found)

- **Node tiers are split.** 6 basic nodes are wired (`WeightedChoice`, `Concat`, `Output`,
  `SetVariable`, `GetVariable`, `Include`). 4 "advanced" Epic 7 nodes (`Conditional`,
  `Sequential`, `Markov`, `WeightedAdvanced`) are written and tested but **orphaned**: not in the
  node registry, not in the engine switch (`engine-basic.ts` returns `''` for them), no UI. Ghost
  features.
- **Two execution engines.** `server/src/engine-basic.ts` (API/export path) and
  `Epic1ExecutionEngine.ts` (UI path) diverge. Preview is not guaranteed to equal export — which
  violates Principle VIII and the architecture memo's "agents work against stable schemas, not
  vibes" (§22).
- **Branching is within-node only.** `WeightedChoice` picks one string; downstream runs identically.
  No real fragment-level variation.
- **`Include` returns a fixed string** — it does not compose the referenced `.psg` subgraph, so the
  161-fragment corpus is a clipart bin, not a composable system.
- **`Output` emits only a string.** The architecture memo wants recipes/manifests/seed-sets/JSON (§9).
- **UI:** functional React-Flow editor (canvas + tabbed side panel + node palette + preview tray).
  `professional-theme.css` (311 lines) is **not imported**. The "Cinema 4D CommandPalette" suite
  named in CLAUDE.md **does not exist on disk**; `client/src/core.tsx` imports a non-existent
  `ProfessionalIntegration` (dead code that would fail).
- **Repo cruft:** ~1.2 MB of removable junk, scaffolding, duplicate configs, checked-in build
  artifacts, and quarantined alternate implementations (see §5).

---

## 4. Target node model — the "proper branching"

Minimal, legible, Compact-aligned set. Every node maps to a principle and to the riggable grammar.

| Node | Role | Variation model | Principle |
|------|------|-----------------|-----------|
| **WeightedChoice** | Categorical variation | Weighted options; `solo`=lock, `mute`=veto | III, IX |
| **Variation** (new) | Bounded numeric/parametric variation | base value + range/bounds + lock flag (the WCX locked/exposed/constrained model) | III, VI |
| **Variable / Lock** | Stable-across-outputs continuity | resolve once, reuse | VI |
| **Template** (new, primary NL path) | Sentence skeleton with `{slots}` filled by variation nodes | reads as prose by construction; human authors the sentence | I, II, III |
| **Concat / Assemble** | Secondary assembly | optional smart join rules (articles, capitalization, punctuation, de-dup) for non-template flows | III |
| **Include** (fix) | Real fragment composition | inline + execute referenced `.psg` | III, X |
| **Output** | Text result (default) | renders the assembled prompt; copy/share | III, VIII |

**Output stays text-first.** The PSG _format_ may persist base state, variation rules, and seed sets
so the broader system can read recipes from a saved file — but the utility's Output node just shows
the assembled prompt the user can copy. Structured-recipe export is a format concern, not a UI
feature for launch.

**Cut:** `Conditional`, `Sequential`, `Markov`, `WeightedAdvanced` — control-flow plumbing, absent
from the architecture vocabulary, and a Principle-II liability. Park the code; remove from product.

**Defer (fast-follow, not launch):** real `.wcx` import node (public users have no `.wcx` files),
UTDG/provenance layer, structured-recipe export UI.

---

## 5. Strip-out inventory

Confirmed against `ACTIVE_SURFACE.md` (which marks the quarantined/disposable set explicitly).

### Tier 1 — zero-risk delete
- Temp/junk: `temp-validator.js`, `temp_patch.txt`, `prompt_parsing_fix.txt`, `.prettierrc.backup`,
  `tasks.db`, `server/corrections.db`, `dependency-plan-*.json`, `psg-analysis-report.json`,
  `test-enhanced-bounding-box.html`, `temp_patch.txt`.
- Backups/quarantined: `server/src/index.ts.bak`, all `*.bak`, `_quarantined/`,
  `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx`,
  `Epic1GraphEditorFinal*.tsx`, `server/src/index-cleaned.ts`, `server-minimal.ts`, `minimal-*`.
- Dead code: `client/src/core.tsx` (non-existent `ProfessionalIntegration` import) — or repair.
- Process scaffolding: `create-auth-tasks-batch.sh`, `serve-dashboard.js`, `simple-auth-server.js`,
  `start-ticket-dashboard.js`, `quality-monitoring-data/`, root `QA-*-2025-01-28.md` (7 files).
- Checked-in build artifacts: `packages/core/dist/`, `server/src/*.js` compiled outputs,
  `server/src/*.d.ts.map`, `packages/core/types/*.{d.ts.map,js.map}`, `engine.js` (broken ref),
  `exporter.js`, `exporter-standalone.ts`.

### Tier 2 — consolidate (verify CI first)
- ESLint: removed shadowed `.eslintrc.json` (ESLint already prefers `.eslintrc.js`). ✅
- Vercel: removed `vercel-minimal.json`, `vercel-full-app.json` (unreferenced). ✅
- Lint-staged: **deferred** — `.lintstagedrc.improved.js` is referenced by husky variant hooks;
  needs husky-hook consolidation first.
- TS: review `tsconfig.active.json`, `server/tsconfig.minimal.json`.

### Tier 3 — relocate
- Archive historical planning/assessment docs under `docs/archive/`.
- Decide `python-executor/` (412 KB) and `tools/` (192 KB): out of launch scope per ACTIVE_SURFACE;
  keep or move to a tooling repo.

### Deferred to Phase 2 (build pipeline)
- Untrack `packages/core/dist/` (32 files) and 77 tracked `*.d.ts.map` build artifacts. `**/dist/`
  is already gitignored but these are committed; core's `package.json` resolves `main`/`module` to
  `dist/`, and the Vercel preview is currently green with dist committed — untracking must be paired
  with a verified core build step in the deploy pipeline.

### CI health (pre-existing, not regressions)
- `build-handbook` workflow removed — it built a `content-authoring-handbook` package that does not
  exist in the repo. ✅
- `dependency-checks` fails on `pnpm audit` (129 vulns: 3 critical / 69 high). Separate
  security-debt workstream; do **not** weaken the gate to make it pass. Coordinate with the open
  dependabot PRs.

---

## 6. Phased execution plan

Each phase is independently committable and leaves the supported build/typecheck green
(Recovery Priority #1). Order chosen so prerequisites land first.

- **Phase 0 — Baseline.** ✅ `pnpm typecheck` green captured as the safety net.
- **Phase 1 — Strip-out.** ✅ Tier 1 deletions + handbook workflow + duplicate vercel/eslint configs +
  dead `usePreviewSeeds`/`node-adapter`. (Tier 3 doc archive still pending.)
- **Phase 2 — Engine unification + schema lock.** ✅ for launch. Stage 0 done: advanced/Python tier
  retired from the schema surface (`graphSchema.ts`) + schema-lock test, verified green.
  Investigation showed **preview == export is already true on the client path** (UI runs
  `Epic1ExecutionEngine` on the ReactFlow graph it also exports); the server `engine-basic` is
  unused legacy and the CLI is vestigial. Full two-engine merge deferred post-launch pending a
  canonical-file-format decision — see `engine-unification-design.md`.
- **Phase 3 — Variation node + real Include.** Implement the `Variation` node (locked / exposed /
  constrained). Make `Include` compose & execute fragment subgraphs. Confirm `solo`/`mute` =
  lock/veto. This is the heart of the fun: vary your own fragments and watch the prompt change.
- **Phase 3b — Natural-language assembly.** Prompts must read as prose, not tag lists. Today the
  runtime `ConcatNode` does `inputs.join('')` and the engine ignores the `separator` field.
  Grammar/joining is an **assembly** concern, not a **selection** concern — so it should live in the
  assembly layer, keeping `WeightedChoice` a clean "pick one" node. **Decision: a Template/slot node
  is the primary mechanism.** The human writes a sentence skeleton —
  `"a {age} {profession} with {hair} hair, wearing {outfit}, looking {mood}"` — and the connected
  variation nodes fill the slots, so output reads as prose by construction (Compact I/II; variation
  fills bounded slots, III; deterministic, V/VI). Secondary/optional layers: smart join rules on
  Concat (articles, capitalization, punctuation, de-dup) for non-template flows; optional per-choice
  affixes (progressive disclosure); optional LLM "naturalize" pass (default deterministic and off).
- **Phase 4 — Save/load + PSG persistence.** Keep the editor's save/load simple and PSG-first; the
  format may carry recipe/seed metadata for the broader system, but the UI surfaces only the
  assembled prompt and easy share. _(Structured-recipe export UI is deferred — out of scope.)_
- **Phase 5 — UI polish.** Wire the theme system; persistent inspector panel; categorized palette.
- **Phase 6 — Launch deliverables.** ~5 curated showcase templates, short tutorial, known-limitations
  note, and a PSG-format authoring guide for AI-assisted fragment creation.

---

## 7. Launch readiness checklist (maps to launch doc §15)

- [x] Repo clean enough to withstand scrutiny (Phase 1) — core cleanup done; Tier 3 doc archive pending.
- [x] Preview == export (Phase 2) — already true on the canonical client path (Epic1 engine +
      ReactFlow-graph export); server engine deprecated. Schema retired + locked.
- [x] Natural-language assembly engine (Phase 3b) — `assemble`/`fillTemplate` utilities + Concat join
      rules, tested (35 tests green).
- [ ] One legible variation story demoable end-to-end: break up a prompt, vary fragments, preview (Phase 3).
- [ ] Simple PSG save/load + share (Phase 4).
- [ ] Cohesive dark theme + inspector (Phase 5).
- [ ] Example PSG files + a few practical templates (Phase 6).
- [ ] Short tutorial + known-limitations note (Phase 6).
- [ ] AI-assistant instructions for generating PSG-compatible assets (Phase 6).

---

## 8. Explicitly out of scope for this launch

3D viewport, card-grid asset gallery, simulation timeline, command palette, WCX import, UTDG /
provenance API, and the rest of the constellation (Entropy, Ethera, Phora, Cathode, Holodeck,
Astrophage). These are flagship/constellation tier, not the Lab proof.
