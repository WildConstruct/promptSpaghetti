# Sprint Plan – PromptScape Randomizer Graph

_Date: 2025-07-14_

This plan captures Epic-2 delivery items plus the immediate **Must-Fix** actions identified in the Product-Owner validation report.  Use the check-boxes to track progress during the sprint.

---
## 1. Epic 2 – Editor MVP (Graph Authoring)
| # | Story | Owner | Status |
|---|-------|-------|--------|
| 2.1 | **Core Node Library UI** – palette shows 6 node types, drag-add to canvas | James | [x] Done |
| 2.2 | **Node Connections & Validation** – draw edges, highlight invalid wiring | James | [x] Done |
| 2.3 | **Node Inspector Forms** – schema-driven sidebar editing |  | [ ] Todo |
| 2.4 | **Preview-5 Modal** – executor runs 5 seeds, modal shows outputs |  | [ ] Todo |
| 2.5 | **Graph JSON Autosave** – draft saved to `localStorage`, restore prompt |  | [ ] Todo |

> **Note:** break each story into tasks in your issue tracker as needed (UI, backend, tests, docs).

### Story 2.1 – Core Node Library UI Subtasks
- [x] Palette sidebar displays six core node icons with tooltips
- [x] Drag-dropping a node onto the canvas instantiates it with defaults
- [x] Node card shows title and key parameter summary
- [x] Wire basic graph state store (Zustand) for node add/remove actions
- [x] Jest unit tests for palette component and drag-add logic
- [x] Update `docs/architecture/source-tree.md` with new UI component paths

### Story 2.2 – Node Connections & Validation Subtasks
- [x] Enable edge creation between node handles in React-Flow
- [x] Implement `validateConnection` util in `packages/core/validation.ts`
- [x] Highlight invalid edges red in canvas via `getEdgeStyle`
- [x] Display error count in status bar and tooltip list
- [x] Jest tests for validation util and error rendering
- [x] Update docs if new files added

### Story 2.3 – Node Inspector Forms Subtasks (Complete)
- [x] Render dynamic sidebar form from Zod schema
- [x] Two-way binding: editing updates node data & graph store
- [x] Debounce change events (300 ms) to reduce churn
- [x] Inline field validation & highlight invalid inputs
- [x] Jest tests: form renders, updates node data, validation feedback
- [x] Update docs if new files added

### Story 2.4 – Preview-5 Modal Subtasks
- [x] Design modal UI skeleton and add "Preview" button to toolbar
- [x] Implement `usePreviewSeeds` hook – runs executor on 5 random seeds
- [x] Show loading spinner while seeds execute; cancel on modal close
- [x] Display list of 5 outputs with seed number badges
- [x] Highlight nodes/edges used during execution (optional UX)
- [x] Error handling: surface executor failures per-seed and aggregate
- [x] Debounce preview trigger (500 ms after graph changes)
- [ ] Jest tests:
  - [ ] Hook returns 5 outputs for stable graph
  - [x] Modal renders outputs and loading / error states
  - [x] Button opens/closes modal via React Testing Library
- [x] Add docs: update source-tree.md and architecture notes
- [x] Mark story complete in plan when all subtasks pass CI

---
## 2. Must-Fix Items (Blockers Before Sprint-2 Kickoff)
| # | Task | Owner | Due | Status |
|---|------|-------|-----|--------|
| MF-1 | Add `.vscode/settings.json` (eslint & prettier on save) |  | 2025-07-17 | [ ] |
| MF-2 | Raise Jest line coverage ≥ 80 %; fail CI below threshold |  | 2025-07-17 | [ ] |
| MF-3 | Create `docs/api_contract.md` – lock Preview API & CLI spec |  | 2025-07-18 | [ ] |
| MF-4 | Implement golden-file determinism tests (Story 3.5) |  | 2025-07-18 | [ ] |
| MF-5 | Ship minimal graph validation engine (avoid corrupt graphs) |  | 2025-07-19 | [ ] |
| MF-6 | Draft `ops/rollback.md` – standard Windsurf rollback procedure |  | 2025-07-19 | [ ] |

---
## 3. Today’s Focus (2025-07-14)
1. Kick-off grooming session – assign owners & estimates for Epic 2 stories.  
2. Create PR for `.vscode/settings.json` and coverage gate (MF-1, MF-2).  
3. Draft API contract outline in `docs/api_contract.md` (MF-3).  
4. Spike branch for validation engine prototype (MF-5).

---
_This file is maintained by **Sarah – Product Owner**.  Please update statuses daily._
