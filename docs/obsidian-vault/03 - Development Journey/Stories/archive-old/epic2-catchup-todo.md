# Epic 2 – Catch-Up TODOs

Editor MVP features are partially in place; several core UX items remain incomplete.

| Story                             | Verification Status | Notes                                                                                                   |
| --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| 2.1 Core Node Library UI          | ⚠️ Partial          | Palette shows 6 core nodes and drag-drop works, but tooltips & param summaries need polish              |
| 2.2 Node Connections & Validation | ⚠️ Partial          | Edges connect; basic validation exists but error highlighting & status bar counts missing               |
| 2.3 Node Inspector Forms          | ⚠️ Partial          | Inspector sidebar renders for nodes, but schemas not fully wired; debounce & live validation incomplete |
| 2.4 Preview-5 Modal               | ❌ Not found        | No Preview button or modal; server `/preview` API absent                                                |
| 2.5 Graph JSON Autosave           | ❌ Not found        | No LocalStorage autosave or restore prompt                                                              |

Legend: ✅ Verified ⚠️ Partial ❌ Not found / Not started

## Next Steps

1. Complete validation messaging & status bar.
2. Implement Preview-5 modal and backend route (dependency: Epic 3 story 3.6).
3. Add autosave/restore logic and download menu item.
