# Epic 3 — Executor & Integration

This document outlines the high-level scope and goals for Epic 3. A more granular task list will be maintained in **plan.md**.

## Epic Goal

Provide a deterministic executor service and CLI, export graphs to GeneratorBundles, import legacy bundles, and prove full compatibility with the existing Randomizer Engine.

## Stories & Acceptance Criteria (from PRD)

| ID  | Story                        | Key Acceptance Criteria                                                                                                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Deterministic Graph Executor | 1. DFS traversal in `server/engine.ts` using seeded RNG.<br>2. Supports runtime classes for six core node types.<br>3. ≥ 90 % branch-coverage unit tests.                |
| 3.2 | CLI Wrapper                  | 1. `npx promptgraph exec graph.json --seed 1234`.<br>2. `--seed` optional; defaults to timestamp.<br>3. Exit codes: 0 success, 1 validation error, > 1 unexpected error. |
| 3.3 | Export to GeneratorBundle    | 1. `exporter.ts` converts graph to bundle.<br>2. Bundle passes JSON-schema validation.<br>3. Integration test: bundle → Randomizer Engine generates expected prompt.     |
| 3.4 | Import Legacy Bundle         | 1. `bundleToGraph` converts bundle JSON to canvas state.<br>2. Round-trip test: graph → export → import equals original.                                                 |
| 3.5 | Determinism Test Matrix      | 1. Jest matrix over seeds 1-10 on sample graph.<br>2. Outputs snapshot-compared; mismatch fails CI.                                                                      |
| 3.6 | Preview API Endpoint         | 1. `POST /preview` executes graph `N` times.<br>2. Returns array of strings + seeds.<br>3. Runs in < 1 s for demo graph.                                                 |

---

## Next Steps

1. Open a draft pull request for this branch (**epic-3**).
2. Break down each story into granular development tasks and update **plan.md** accordingly.
