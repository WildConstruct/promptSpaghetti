# Asset Browser – PO Sync One-Pager (v0.1)

## Summary
We’re proceeding with P3 scope first: Sidebar + Grid + Keyboard Navigation + Drag/Drop as a semi-independent React module (`packages/asset-browser`). We drafted Story 1.4 for P3 and Story 1.5 to scaffold preview UI and simulation hooks toward P5.

## What’s Defined (from Master Plan v2.1 + UI Architecture)
- Semi-independent module with its own package.json; embedded in main app.
- Keyboard-first experience; accessible controls and screen-reader labels.
- Tiered preview model (Icon/Cloud → Sample PNG → Snapshot → Branch Map).
- Side-car `.psglib` and `.psgmanifest` (P2) with content-hash caching.

## Open Questions for PO
1) Preset Library Sources
- What initial library paths should the Sidebar load? Local examples, server API, or both?
- Are tags curated or free-form from preset metadata?

2) Accessibility Targets
- Any specific screen reader targets (NVDA/JAWS/VoiceOver)? Priority order?
- Are focus outlines acceptable to ship as-is, or should we adopt a custom design?

3) Keyboard-Only Workflows
- Confirm keyboard alternatives for drag-drop (e.g., “Insert” action from focused card). Any preferred key?

4) Preview Behavior (P5 Planning)
- Are 3 seeds (0–2) enough for Sample preview? Do we need configurable seeds now or later?
- Branch map: prefer simplified probabilities or full path weights?

5) Performance Goals
- We target <500ms initial render for 50+ presets. Is that sufficient, or do we need a stricter goal?

6) Manifest Default
- Should npm-style manifest be the default, or keep minimal manifest as default (conversion available)?

7) Variants
- Default `lengthMode` for the engine: minimal / standard / verbose?

## Next Steps
- Approve Stories 1.4 and 1.5 for implementation.
- Provide answers to open questions to finalize P3/P5 UX.
- After Story 1.4, plan Story 1.6: P2 side-car `.psglib` ingestion and manifest scanning, if needed before full preview work.

## Attachments
- stories/1.4.asset-browser-mvp-sidebar-grid.md
- stories/1.5.asset-browser-details-previews-simulation.md
- docs/ui-architecture.md
- Master Plan v2.1 excerpt (this file)
