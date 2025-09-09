# Weighted Choice: Pixel-Perfect Handle Alignment

This document captures the decisions, techniques, and final tuning that made the Weighted Choice node’s main (green) and branch (orange) output handles align perfectly in both Edit and Display modes.

## Goals

- Horizontally straddle the node border with both main and branch handles.
- Vertically center:
  - Green main handle on the title row center.
  - Orange branch handles on their corresponding option row centers.
- Dynamically update positions on mode toggles, option changes, reorders, and resize.
- Eliminate redraw/timing glitches so changes are visible immediately.

## Key Insights (External Review)

What made this work in practice:

- CSS variable positioning: drive vertical alignment through `--handle-top` with targeted selectors and `!important` to win specificity battles.
- Proper DOM measurement: use `getBoundingClientRect()` and compute positions relative to the node container, not magic numbers.
- Reliable mode detection: check `classList.contains('enhanced-branching-editor')` on the container ref.
- Multiple recalculation triggers: `useLayoutEffect`, `requestAnimationFrame`, zero `setTimeout`, `ResizeObserver`, and `MutationObserver` to handle layout churn.
- Tunable parameters: `vNudge` (baseline), `branchFineTune` (per-branch), `compress` (spacing slope), `extraLift` (uniform orange shift).
- Measure the right elements: anchor to the entire option row container, not just text spans.

> “This is a much more robust solution than using fixed pixel values. The combination of DOM measurement, CSS variables, and multiple recalculation triggers keeps handles aligned as the node switches modes or content updates.” — External review

For the exact numbers, see “Final Tuned Values” below.

## Core Approach

1. Measure DOM in `useLayoutEffect` to ensure measurements are taken after layout but before paint.
2. Anchor vertical centers to the actual visual boxes:
   - Main handle → title section container.
   - Branch handles → entire option row container (not just inner text), matching the rounded dark background.
3. Compute absolute tops relative to the node container using `getBoundingClientRect()` differences.
4. Apply small per-mode offsets for visual fine tuning, exposed as parameters in code.
5. Set the final vertical position via a CSS variable `--handle-top` (inlined style) and force the handle to use it with a targeted CSS override.

## Key Implementation Details

Files:

- `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx`
- `packages/core/components/epic1/nodes/BaseEditableNode.css`

### CSS

We rely on a CSS variable for vertical position and explicit right offsets for precise horizontal alignment.

```css
/* Vertical positioning from TS/JS via inline CSS var */
.epic1-editable-node.weighted-choice.enhanced-branching
  .epic1-handle.branch-output,
.epic1-editable-node.weighted-choice.enhanced-branching
  .epic1-handle.main-output {
  top: var(--handle-top, 50%) !important;
  transform: translateY(-50%) !important;
}

/* Horizontal offsets so the dots hug the border */
.epic1-editable-node.weighted-choice.enhanced-branching
  .epic1-handle.branch-output {
  right: -26px !important;
}
.epic1-editable-node.weighted-choice.enhanced-branching
  .epic1-handle.main-output {
  right: -27px !important;
}
```

### Measuring and Positioning (TSX)

- Maintain refs:
  - `nodeRef` for the edit/display container
  - `optionRefs[]` for each option row
- Calculate tops:
  - `nodeRect` = container rect
  - For main handle: center of title container + `vNudge`
  - For each branch: center of option row + `vNudge` + `branchFineTune`
- Adjust branch stack with:
  - `compress`: compresses distances between rows relative to the first row
  - `extraLift`: uniform offset to bias the entire orange stack up or down relative to the main baseline
- Write positions via `style={{ '--handle-top': '<px>' }}` on each handle node.

### Robust Recalculation

To prevent stale positions or missed redraws (common with mode toggles and ref churn):

- Recalculate immediately in `useLayoutEffect`.
- Recalculate on the next animation frame.
- Recalculate via a zero-timeout.
- Observe size and DOM mutations with `ResizeObserver` and `MutationObserver` and trigger recalcs (again, sometimes multiple times) to ride out layout stabilization.

## Mode Detection Bug (Important)

We previously inferred edit mode via `querySelector('.enhanced-branching-editor')`. This could return truthy even when not pointing at the correct element, causing edit-mode offsets to not apply. Fix:

```ts
const isEditingMode = editorEl.classList.contains('enhanced-branching-editor');
```

After this fix, all edit-specific offsets took effect as intended.

## Final Tuned Values

These are the values that yielded the confirmed alignment.

- Display mode
  - `vNudge = -30`
  - `branchFineTune = 1`
  - `compress = 0.77`
  - `extraLift = -21`

- Edit mode (final)
  - `vNudge = -36` // uniform baseline used by both green/orange
  - `branchFineTune = -2` // small per-branch bias
  - `compress = 0.77` // spacing maintained
  - `extraLift = -40` // uniform shift of all orange handles

Notes:

- `vNudge` mainly affects the main/green baseline but is shared in the branch calc.
- Use `extraLift` to move all orange handles together without altering their spacing.
- Use `compress` to slightly tighten or loosen lower rows (e.g., 0.76 raises lower rows a touch; 1.0 = no compression).

## Tuning Strategy (What Worked)

1. Start with accurate DOM centers (title and option boxes).
2. Apply small nudges in this order:
   - Establish a good main baseline with `vNudge`.
   - Use `branchFineTune` for a gentle per-branch offset.
   - Use `extraLift` for a uniform orange shift relative to green.
   - If lower rows lag, reduce `compress` slightly (e.g., 0.78 → 0.77 → 0.76).
3. Make changes visible by scheduling multiple recalculations after structural changes.

## Pitfalls We Hit (and Avoid Now)

- Mode detection via querying the subtree led to wrong offsets. Always check the class on the container ref.
- Measuring inner text instead of the entire row caused misalignment with rounded backgrounds.
- Single recalculation after DOM churn was not enough; we now re-run on frame and timeout, and use observers.
- Horizontal dot position fought generic `.epic1-handle` styles; we override with a more specific selector and `!important`.

## Maintenance Checklist

- When altering layout, confirm the edit container remains `.enhanced-branching-editor` and display container `.enhanced-branching-display`.
- Verify CSS selectors haven’t lost specificity (handles should read `--handle-top`).
- If adding option row padding/margins, expect to re-check `vNudge`, `branchFineTune`, and possibly `extraLift`.
- After mode toggles or option add/remove/reorder, ensure recalculation fires (observers enabled) and visually updates.

## Quick Adjust Cheatsheet

- All orange too high/low: tweak `extraLift` (±2–6 px steps).
- Green baseline off vs title: tweak `vNudge` (±2 px steps).
- Lower rows drifting vs upper: tweak `compress` by ~0.01.
- Per-row center subtly off: tweak `branchFineTune` by ~2 px.

## Current Source of Truth

- `EnhancedBranchingNode.tsx`: contains the measurement, mode detection, observers, and final constants.
- `BaseEditableNode.css`: contains the handle CSS var usage and horizontal offsets.

With these conventions and knobs, the handles maintain pixel-perfect alignment across edits, display, and dynamic changes.
