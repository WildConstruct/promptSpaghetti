# Examples catalog & branching patterns

The example library lives in `client/src/templates/quickStartTemplates.ts` (the
executable graphs) with display metadata in `client/src/templates/templateCatalog.ts`.
Examples surface in two places: the splash launcher (`QuickActions`) and the
in-editor **Explore** tab (`DocumentLibraryPanel`), both keyed by the same id.

## Template format
Built from helpers in `quickStartTemplates.ts`:
- `textNode(id, x, y, label, value)` — fixed text.
- `weightedChoiceNode(id, x, y, label, options[])` — a branch point. Each option
  is `{ id, text, weight, locked?, hasBranch? }`.
- `concatNode(id, x, y, label)` — "Merge"; assembles inputs (`input1`, `input2`, …).
- `outputNode(id, x, y, name)` — the prompt output.

## How branching wiring works
A `WeightedChoice` exposes:
- a default `source` output → carries the **selected option's text** to a merge.
- a `branch-N` output **per branched option** (N = the option's 0-based index),
  active only when that option is selected (`Epic1ExecutionEngine` gates inactive
  branch edges).

So a branch is: `choice.branch-N → subNode.target`. The sub-node's own `source`
flows into a merge alongside the parent, and a sub-node can itself be a
`WeightedChoice` with its own `branch-M` — that's how nesting goes arbitrarily
deep. `locked: true` pins one option (fixed DNA) so it is always selected.

## Branching-on-branching (skill trees)
`underworld_skilltree` ("Chicago Underworld — Skill Trees") is the reference for
deep nesting — **three levels**:

1. **Trade** (`uw-trade`): every option branches — docks / bank-robbing / bootleg.
2. **Per-trade skill tree**: each trade's `branch-N` opens its own role choice
   (`uw-dock-role` / `uw-heist-role` / `uw-boot-role`). Only the selected trade's
   tree contributes; the others are gated off.
3. **Nested specialty**: a role can branch again — e.g. dock-role
   "pier union enforcer" → `uw-dock-spec` ("two dockside goons at his back"),
   heist-role "safecracker" → `uw-heist-spec` (cracking method), bootleg-role
   "speakeasy fixer" → `uw-boot-spec` (payoff).

Each trade tree merges (role + nested specialty) into a Trade Merge, and the
active trade flows to the main assembler with the shared traits (build / attire /
scene). One graph randomizes the whole cast of a Prohibition-era underworld.

Determinism holds throughout: same graph + seed ⇒ identical prompt.

## Branching examples (catalog)
| id | title | depth |
| --- | --- | --- |
| `gangsters` | 1930s Chicago Gangsters | nested (role → weapon → drum-mag) |
| `underworld_skilltree` | Chicago Underworld — Skill Trees | **3 levels** (trade → role → specialty) |
| `tech_panel` | Anachronistic Tech Panel | nested (screen → phosphor) |
| `tile_builder` | Modular Tile Builder | nested (structure → decay) |
| `baseball_fans`, `punk_fans`, `diner_patrons`, `spaghetti_western`, `medieval_village` | themed crowds/characters | nested (one sub-branch each) |

Non-branching reference families: `character_variation`, `vehicle_family`,
`building_family`, `indy_500_crowd_card`.
