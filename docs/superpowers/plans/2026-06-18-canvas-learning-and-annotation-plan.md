# Canvas Learning and Annotation Implementation Plan

Date: 2026-06-18

## Goal

Implement the approved learning and annotation slice for Prompt Spaghetti: tutorial completion cookies, per-sequence progress, launch tips, annotation notes, and a graph command registry.

## Work Plan

### 1. Tutorial Progress Cookies

- Extend `TutorialContext` state with per-sequence progress and completed sequences.
- Add helpers for tutorial completion cookies.
- Update progress on step changes and set the sequence cookie only on completion.
- Verify with `TutorialContext` tests.

### 2. Progress UI

- Update `ProgressWidget` or add a compact sequence progress widget that renders Basic and Advanced progress.
- Keep existing consumers compatible with `tutorialProgress`.
- Verify with a focused rendering test.

### 3. Canvas Tips

- Add a `CanvasTips` registry and `CanvasTipPanel` component.
- Store dismissal in a local cookie.
- Wire actions to tutorial start events and commander opening.
- Verify the registry and dismiss/reopen behavior.

### 4. Annotation Notes

- Add `postItNote` support to the node factory used by palette/context/commands.
- Add Note to the palette next to Region Box.
- Prefer factory-based note creation in the right-click path.
- Verify palette order and note factory defaults.

### 5. Command Registry

- Extract inline commander command construction from `Epic1GraphEditor` into `services/GraphCommandRegistry.ts`.
- Add tutorial and tip commands.
- Preserve existing command ids where possible to avoid breaking recents/usage history.
- Verify registry output and command execution callbacks.

### 6. Integration and Verification

- Run focused Jest suites for onboarding, command registry, node factory, and palette.
- Run `git diff --check`.
- Run browser sanity against `http://localhost:3000` if the local server is available.
- Re-read acceptance criteria and tidy names/copy before reporting completion.

## Notes

- Keep changes scoped; existing region-box, local-fragment, and advanced-tutorial work is already dirty and should be preserved.
- Do not commit unless the user asks for commits.
- Full client typecheck currently has unrelated repository type debt, so use focused tests plus diff check for this slice.
