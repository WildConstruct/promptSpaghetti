# Epic 8 – Catch-Up TODOs

This checklist aggregates **all stories from `epic8plan.md` that are not explicitly marked as `✅ COMPLETED`**. Each item needs verification—some deliverables may already exist but were never checked off.

| Story                                       | Verification Status                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| 8.1.1 Microservice Architecture Design      | ✅ Verified – architecture doc & python-executor service found                     |
| 8.1.2 REST API Implementation               | ✅ Verified – FastAPI server & OpenAPI spec present                                |
| 8.1.3 Sandboxed Execution Environment       | ✅ Verified – container sandbox code & resource limits implemented                 |
| 8.1.4 Main Application Integration          | ✅ Verified – `PythonTransform` node and editor components exist                   |
| 8.1.5 Performance Monitoring & Optimization | ⚠️ Partial – tracking code present, dashboard incomplete                           |
| 8.1.6 Documentation & Examples              | ⚠️ Partial – docs found, video tutorials missing                                   |
| 8.2.1 Persistent Storage Design             | ✅ Verified – database schema & migration guide present                            |
| 8.2.2 Import/Export Functionality           | ⚠️ Partial – import UI implemented, export logic pending                           |
| 8.2.3 User Interface Enhancements           | ✅ Verified – new CorrectionsManager panels & tests                                |
| 8.2.4 Statistics & Tracking                 | ⚠️ Partial – metrics tables exist, dashboard not wired                             |
| 8.2.5 Workflow Integration                  | ⚠️ Partial – lifecycle states coded, notifications missing                         |
| 8.2.6 Feature Flag Graduation               | ⚠️ Partial – feature toggle dashboard & env config exist; rollout playbook missing |
| 8.3.1 Content Compilation & Organization    | ✅ Verified – handbook outline & merged content present                            |
| 8.3.2 Interactive Examples Development      | ⚠️ Partial – framework files exist, examples sparse                                |
| 8.3.3 Search & Navigation System            | ⚠️ Partial – search index built, UI integration missing                            |
| 8.3.4 Multiple Format Publishing            | ✅ Verified – HTML/PDF build scripts present                                       |
| 8.3.5 Version Control & Updates             | ✅ Verified – git CI and changelog generator configured                            |
| 8.3.6 Update Cycle & Maintenance            | ✅ Verified – review schedule & analytics scripts exist                            |
| 8.4.5 Extension Manager UI                  | ⚠️ Partial – core UI in place, marketplace integration pending                     |

Legend:

- ⏳ Unverified – no evidence review yet
- ✅ Verified – deliverables found & complete
- ⚠️ Partial – some deliverables missing/incomplete
- ❌ Not-found – nothing found yet

## Workflow

1. For each row, locate promised deliverables (code, docs, tests).
2. Update the **Verification Status** column accordingly.
3. When a story is fully satisfied, move it to a "Verified" list or mark as complete in both this table and `epic8plan.md`.

---

> Keep this file synchronized with changes to `epic8plan.md` so both reflect accurate status.
