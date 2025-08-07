# Prompt Spaghetti Graph – Preset Library Master Plan v2.1

(Fully merged; incorporates feedback from Claude, Grok, GPT)

---

## 0 — Guiding Principles

1. Ship thin, grow iteratively – two-sprint slices; each layer validated before the next.
2. Side-car first, embedded optional – embedded presets only via “Export With Presets”; not a dual maintenance path.
3. Nesting via `PresetNode` references – cycle-safe; parent graph holds links, not inlined sub-graphs.
4. Text-centric previews & metadata – word-cloud ▶ sample-output ▶ node-snapshot ▶ branch-map.
5. Deterministic, text-only artefacts – JSON is canonical; thumbnails/branch maps cached as PNG/SVG by content-hash.
6. AI-adaptive outputs – native multi-length variants so prompts can shrink/expand per engine token budget.
7. Simulation-first QA – reproducible preview runs and branch-map visualisation for every weighted/random node chain.

---

## 1 — Files & Core Schema

| Artefact             | Extension      | Purpose                                        |
| -------------------- | -------------- | ---------------------------------------------- |
| Project graph        | `.psg`         | Full working file (unchanged).                 |
| Preset asset         | `.psglib`      | Side-car JSON: metadata + sub-graph.           |
| Library manifest     | `.psgmanifest` | Cached index. Alt npm-style manifest accepted. |

### 1.1 Minimal `.psglib` (schema v 1.0)

```json
{
  "fileType": "psglib",
  "formatVersion": "1.0.0",
  "metadata": {
    "name": "Weighted Narrative Branch",
    "tags": ["random", "narrative"],
    "nodeTypes": ["weighted_node", "concat_node"],
    "engineVersion": "2.0.0",
    "thumbnail": "d1e5c7a9",
    "lastModified": "2025-08-05T12:00:00Z",
    "author": "Studio",
    "outputType": "text_prompt"
  },
  "graph": { /* sub-graph nodes & edges */ },
  "extensions": {
    "textureLinks": []
  }
}
```

### 1.2 `PresetNode` (available Phase P4)

```json
{
  "type": "PresetNode",
  "params": {
    "presetId": "Weighted Narrative Branch",
    "lockVersion": "1.0.0",
    "dependencies": ["text_chunk@1.0.0"]
  }
}
```

### 1.3 Manifest formats

Default minimal

```json
{
  "libraryName": "core-utils",
  "version": "1.0.0",
  "presets": [
    { "id": "weighted-narrative@1.0.0",
      "path": "presets/weighted-narrative.psglib" }
  ]
}
```

npm-style (optional)

```json
{
  "name": "@studio/core-utils",
  "version": "1.0.0",
  "peerDependencies": { "psg-engine": ">=2.0.0" },
  "presets": {
    "weighted-narrative": {
      "version": "1.0.0",
      "path": "./presets/weighted-narrative.psglib"
    }
  }
}
```

CLI can convert between the two on `rebuild-manifest`.

---

## 2 — Multi-Length Variants (Phase P4)

Any text-bearing param may include:

```json
"variants": {
  "minimal":  { "text": "Early-career preacher",          "maxTokens": 30  },
  "standard": { "text": "A budding televangelist ...",    "maxTokens": 75  },
  "verbose":  { "text": "In the nascent stages ...",      "maxTokens": 200 }
}
```

Engine selects via project-level `config.lengthMode` (`minimal | standard | verbose`).
Migration: single string → `variants.standard`.
CLI helper `variant-gen` can auto-produce minimal/verbose from standard.

---

## 3 — Preview Pipeline

| Tier  | What it shows                                    | How it’s made    | Cost            |
|------ | ------------------------------------------------- | ---------------- | --------------- |
| 0 Icon       | Generic SVG per node-class                       | static asset     | zero            |
| 1 Cloud      | Word-frequency cloud across all variant texts    | text analytics   | light           |
| 2 Sample     | PNG of three sample outputs (seed 0-2)           | async engine run | medium (queued) |
| 3 Snapshot   | Node-layout screenshot                           | editor capture   | light           |
| 4 Branch Map | SVG of weighted paths (line width = probability) | graph analyser   | light           |

Files cached to `Cache/Thumbnails/<hash>.png` and `Cache/BranchMaps/<hash>.svg`; CLI `regen-thumbs` cleans orphans.

---

## 4 — Metadata Roadmap

| Version          | New fields                                                                                      |
|------------------|--------------------------------------------------------------------------------------------------|
| v 1.0 (MVP)      | name, tags, nodeTypes, engineVersion, thumbnail, lastModified, author, outputType               |
| v 1.1 (Text-Pro) | branchingDepth, variableCount, averageLength ( per variant ), simulationSeed, randomizationType |
| v 1.2 (UTDG-Link)| textureLinks                                                                                    |
| v 1.3 (Perf)     | complexityScore (see §8 open thread)                                                            |

---

## 5 — Versioning & Migration

- SemVer per preset (`1.2.3`).
- Copy-by-value until `PresetNode` arrives.
- Engine migrator auto-upgrades graphs & variants.
- Cascade: parent migrator walks `PresetNode.dependencies`.
- Deprecation: warn for 2 minor versions; retire on next major.

---

## 6 — Toolchain & UX

### 6.1 CLI – `psg-preset`

```
create          | save selection as preset
lint            | schema & style checks
simulate        | 5 sample outputs (honours lengthMode)
variant-gen     | derive minimal/verbose from standard
export-prompt   | flatten graph → plain text
branch-map      | generate Tier-4 SVG
bump            | semver helper
regen-thumbs    | refresh Tiers 1-3
rebuild-manifest
```

### 6.2 Asset Browser (Phase P3)

- Sidebar – library paths + tag filter, fully keyboard navigable (↑↓, hjkl).
- Grid – Tier-1 thumbnails; Enter toggles Details Drawer.
- Details Drawer – Tier-2 sample outputs, metadata editor, Simulate button, “Branch Viz” toggle to show Tier-4 SVG.
- Drag-drop inserts copy; E edits preset; I imports copy.

Accessibility: all actions via keyboard & screen-reader labels.

---

## 7 — Timeline (quarters, two-sprint phases)

| Phase | Focus                                                                             | Buffer                |
|------ |----------------------------------------------------------------------------------- |----------------------|
| P0    | Schema plumbing, CLI `create`/`lint`                                              | —                    |
| P1    | Embedded test presets, word-cloud thumbs                                          | +½ sprint QA         |
| P2    | Side-car `.psglib`, manifest scan                                                 | —                    |
| P3    | Browser (side-bar + grid), kb-nav, drag-drop                                      | +½ sprint UX polish  |
| P4    | `PresetNode` nesting + variants + variant-gen CLI                                 | +1 sprint cycle tests|
| P5    | Simulate previews, Tier-2 PNG, Tier-4 Branch Map                                  | —                    |
| P6    | UTDG hooks, randomizationType filters                                             | —                    |
| P7    | ComplexityScore metric, npm publish tooling, Custom-GPT preset builder (optional) | —                    |
| Beta  | After P5 – 50+ preset library & artist feedback sprint                            | —                    |

Total elapsed ≈ 6 months.

---

## 8 — Open Threads & Decisions

| # | Decision                                          | Needed by     |
| - | ------------------------------------------------- | ------------- |
| 1 | `PresetNode` update policy – auto vs manual       | before P4 dev |
| 2 | Async queue budget for `simulate` (ops/min)       | P3 UX freeze  |
| 3 | npm-style manifest default vs optional            | P2 planning   |
| 4 | Variant generation – manual vs auto (CLI default) | P4 planning   |
| 5 | UTDG stub timing – P2 or P6                       | end P2        |
| 6 | ComplexityScore formula (log₂ nodes + Σcost)      | before P7     |
| 7 | Keyboard-first acceptable for MVP?                | P3 UX freeze  |

---

## 9 — Immediate Next Steps

1. Approve artefact & minimal schema (sections 1.1–1.3).
2. Kick-off P0 tickets – Zod schema PR, CLI scaffold.
3. Spin mini-spike on ComplexityScore formula (benchmarks + draft spec).
4. Prepare Figma mockups (grid, details drawer, word-cloud thumb, branch map view).
5. Build a sample preset (televangelist career, with variants) to validate schema + CLI.

---

Attachments to deliver on approval

- `schema-draft.ts` – updated Zod definitions (.psg, .psglib, manifest).
- `televangelist.psglib` – exemplar with variants.
- PNG/SVG preview samples.
- Figma link to browser wireframes.

Master Plan v2.1 is now fully merged and production-ready.
