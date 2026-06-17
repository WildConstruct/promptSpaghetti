# Node UX Audit (2026-06-16)

Pass over every **registered** React Flow node type (`packages/core/components/epic1/nodes/index.ts` → `epic1NodeTypes`), judging each on: is it usable by a human, does it align with our UX intent (deterministic, legible, low-surprise), and does it have layout/interaction bugs.

Method: read each node component (the source of truth for what renders) + in-browser spot checks for the visually-suspect ones.

## Per-node findings

### TextBlock — ✅ good
- **Display:** "Text Block" label + content (or "Click to edit text" placeholder). Clean.
- **Edit:** single-click → textarea; optional Graph-References chip picker; metadata flip.
- **Metadata flip:** meaningful here (word/char count *of the text*).
- **Verdict:** usable, on-intent. No action.

### WeightedChoice (`EnhancedBranchingNode`) — ✅ good (post-fixes)
- Branching, per-option branch handles (row-aligned), lock/pin, router semantics — all repaired earlier this cycle.
- Metadata flip present; close button restyled (see cross-cutting #1).
- **Verdict:** the flagship node. Usable. No further action beyond the metadata-flip question.

### Concat (“Merge”) — ⚠️ fixed + one open question
- **Display:** compact "Merge" label + join-style / dedupe badges. Clean.
- **Edit:** join-style `<select>`, legacy separator input, Dedupe checkbox, hint, Apply. Dynamic input handles (one per connection + a spare). Good.
- **Bugs fixed this cycle:**
  - Edit/flip faces overflowed the ~104px node (built for the 320px WeightedChoice). Node now widens to 260px while editing. *(committed `7be3f33cb`)*
  - Metadata back-face used `width:max-content` and escaped off-canvas; now fills the node, padding dropped when flipped, snug 220px width, circular red X close. *(uncommitted)*
- **Open question (cross-cutting #1):** the metadata flip shows "Word Count / Character Count" of the *separator config* — meaningless on a Merge node.

### Variable (Set/Get) — ✅ mostly good
- **Display:** "Set/Get Variable" label, `$name` / `$=name`, data-inlet badge + bottom data handle (Story 1.5 three-handle hub). Clean.
- **Edit:** name input + Graph-References picker + metadata flip.
- **Weak spot:** metadata flip counts words/chars of the *variable name* — low value, not harmful.
- **Verdict:** usable. Folds into cross-cutting #1.

### Output — ✅ good
- **Display:** "Output" label + label text or "→" icon.
- **Edit:** optional-label input + Graph-References picker. No metadata flip (correct — nothing to analyze).
- **Input handle:** hidden (`opacity:0`) until connected, BUT CSS reveals it at 0.3 on node-hover and 0.5 while dragging a connection (`!important` beats the inline style). So it *is* discoverable. Acceptable, not a bug.
- **Verdict:** usable, on-intent.

### PostItNote — ⚠️ one fix, one note
- Sticky note: color, collapse, resize, delete, Markdown body, snap-to-attach within 100px.
- **Bug fixed:** save shortcut was `Cmd+Enter` only (`e.metaKey`) → broken on Windows. Now accepts `Ctrl+Enter` too. *(uncommitted)*
- **Note:** enters edit on **double-click**, while the editable graph nodes use **single-click**. Conventional for sticky notes, so leaving as-is — documented for consistency awareness.

### EnhancedBoundingBox (“Region Box”) — ✅ fixed earlier
- Child-node-escapes-box bug fixed (`position: relative` → `absolute`) on branch `claude/fix-region-box-child-position`.

### Secondary / not in the primary loop
`componentInstance`, `boundingBox` (legacy, superseded by enhanced), `group` — not audited in depth; not part of the core authoring vocabulary (TextBlock / WeightedChoice / Concat / Variable / Output).

## Cross-cutting issues

1. **Metadata flip relevance (needs a product call).** The "Metadata Analysis" back-face (Word Count / Character Count / Last Modified) is generic and only truly meaningful on **TextBlock**. On Concat it's noise; on Variable it's weak. Options:
   - **(a)** Limit the flip to TextBlock (+ WeightedChoice), drop it from Concat/Variable.
   - **(b)** Make the back-face node-type-aware (Concat: input count / join style / separator; Variable: name / scope / resolved source; WeightedChoice: option count / weight model).
   - Recommend **(b)** — keeps the affordance, makes it earn its place. Deferred pending direction (user just polished the Concat card, so not removing unilaterally).

2. **Cross-platform keyboard shortcuts.** Two `metaKey`-only bugs found this cycle (layout cleanup, then PostItNote save). Worth a sweep for any remaining `e.metaKey` without `|| e.ctrlKey`. The metadata flip (`Ctrl/Cmd+M`) already handles both.

3. **Edit-entry consistency.** Single-click (graph nodes) vs double-click (PostItNote). Acceptable given the sticky-note convention; flagged so we make it a deliberate choice, not an accident.

## Fixes applied this cycle
| Fix | File | Status |
| --- | --- | --- |
| Concat edit/flip overflow → widen to 260px | `EnhancedBranching.css` | committed `7be3f33cb` |
| Metadata card: circular red X + edge-to-edge fill + snug width | `useMetadataFlip.tsx`, `EnhancedBranchingNode.tsx`, `EnhancedBranching.css` | uncommitted |
| PostItNote save shortcut accepts Ctrl+Enter | `PostItNote.tsx` | uncommitted |

## Resolved since this audit
- **Metadata-flip relevance** — resolved with option (b): the flip is now
  node-type-aware (Concat → join style / separator / dedupe; Variable → name /
  mode; etc.) in `useMetadataFlip.tsx`. The Concat card fixes and PostItNote
  Ctrl+Enter above also landed.
- **Right-sidebar tabs** — investigated and rebuilt; Explore is now a
  full-document browser and Graph a node-graph outline. See
  [`sidebar-tabs-investigation.md`](sidebar-tabs-investigation.md).
