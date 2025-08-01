# Epic 3 – Catch-Up TODOs

Executor & Integration features are only partially present. Node executor exists for core nodes, but export/import and CLI integration appear missing.

| Story                            | Verification Status | Notes                                                                                |
| -------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| 3.1 Deterministic Graph Executor | ⚠️ Partial          | `server/engine.ts` exists and executes simple graphs; seed determinism tests missing |
| 3.2 CLI Wrapper                  | ❌ Not found        | No `promptgraph` CLI script in repo                                                  |
| 3.3 Export to GeneratorBundle    | ❌ Not found        | No exporter converting graph → bundle                                                |
| 3.4 Import Legacy Bundle         | ❌ Not found        | No `bundleToGraph` util                                                              |
| 3.5 Determinism Test Matrix      | ❌ Not started      | No Jest matrix tests                                                                 |
| 3.6 Preview API Endpoint         | ❌ Not found        | `/preview` route missing in server                                                   |

Legend: ✅ Verified ⚠️ Partial ❌ Not found / Not started

## Next Steps

1. Confirm executor coverage & add seed-determinism tests.
2. Scope CLI wrapper and export/import utilities.
3. Design preview API route aligning with Epic 2 UI.
