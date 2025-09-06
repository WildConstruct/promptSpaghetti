# Product Requirements Document (PRD) – Asset Browser (v0.1)

Status: Draft
Owner: PO (Sarah)
Scrum Master: Bob
Last Updated: 2025-08-07

## 1. Problem Statement
Describe the user problem and the need for a preset Asset Browser within the Prompt Spaghetti editor.

## 2. Goals & Non-Goals
- Goals
  - G1: Enable discovery and insertion of presets via sidebar and grid
  - G2: Provide keyboard-first accessible workflows
  - G3: Prepare preview scaffolding for sample outputs and branch visualization
- Non-Goals
  - NG1: Full preview generation engine (covered later)
  - NG2: Publishing to npm (later phase)

## 3. Users & Scenarios
- Primary User: Graph editor users creating prompt graphs
- Scenarios
  - S1: Browse by tags; navigate with keyboard; open Details Drawer
  - S2: Insert preset (drag or keyboard alternative)
  - S3: Trigger simulate (stub now); view sample output placeholders

## 4. Requirements
### Functional
- F1: Sidebar with library paths and tag filter
- F2: Grid with Tier-1 thumbnails, virtual scrolling
- F3: Details Drawer with simulate and branch viz stubs
- F4: `.psglib` ingestion and manifest scan (P2)

### Non-Functional
- NF1: <500ms initial render for 50+ presets
- NF2: Keyboard accessibility; screen-reader labeling
- NF3: Async, non-blocking scans; progress indicator

## 5. Acceptance Criteria (summary)
List A/C aligned with Stories 1.4–1.6.

## 6. Information Architecture & Data
- `.psglib` schema v1.0 (metadata)
- `.psgmanifest` minimal/npm-style formats

## 7. Open Questions
- Library source locations
- Accessibility targets and keyboard details
- Preview seed count; branch map preference
- Manifest default (minimal vs npm-style)
- Default `lengthMode`

## 8. Dependencies & Risks
- React/React Flow versions; Zustand
- Worker setup with Comlink later
- Potential performance regressions in main app

## 9. Out of Scope (for now)
- Real engine previews
- ComplexityScore metrics
- UTDG integrations

## 10. Milestones
- P2: Ingestion & manifest scan
- P3: Sidebar, grid, kb-nav, drag/drop
- P5: Preview simulate + branch map

## 11. Appendix
- Master Plan: `docs/preset-library-master-plan.md`
- UI Architecture: `docs/ui-architecture.md`
- Stories: `docs/stories/1.4`, `1.5`, `1.6`
