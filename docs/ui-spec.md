# PromptScape Randomizer Graph – UI / UX Specification (Draft v0.1)

_Last updated: 2025-07-09_

## 1. Product Context

This UI spec expands Section 3 of the PRD and translates high-level goals into concrete interface guidelines, component definitions, and flows for designers & developers.

## 2. Overall UX Principles

1. **Flow-state friendly** – minimal chrome, keyboard shortcuts, instant feedback.
2. **Deterministic confidence** – always show active seed, validation status, and any locking indicators.
3. **Progressive disclosure** – advanced options (e.g. Corrections Manager) gated behind feature flags or secondary menus.
4. **Accessibility first** – WCAG 2.1 AA colour contrast, full keyboard support, scalable font sizes.

## 3. Information Architecture

```
├── Canvas Editor (/)  ──┬─ Toolbar (top)
│                        ├─ Palette / Node Library (left, collapsible)
│                        ├─ Canvas (center)  ──┬─ Nodes & Edges
│                        │                     └─ Mini-map (bottom-right)
│                        └─ Inspector Sidebar (right)
├── Batch Preview Modal (overlay)
├── Bundle Settings Modal (overlay)
├── Corrections Manager (right drawer | flag)
└── Help / Shortcuts Dialog
```

## 4. Core Screens & Wireframe Notes

### 4.1 Canvas Editor

![Canvas Wireframe](wireframes/canvas.png)

| Zone       | Purpose                                                         | Key Interactions                                    |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------- |
| Toolbar    | Run (▶︎), Preview-5, Export, Import, Undo/Redo, Zoom %, Help ⓘ | Icons + labels, tooltips on hover.                  |
| Palette    | List node types with search filter; drag from item to canvas.   | Resize via drag handle; collapses to icons.         |
| Canvas     | Pan (mouse drag), Zoom (wheel/±), Multi-select (shift-drag)     | Snap-to-grid (8 px), context menu (⌘/Ctrl-click).   |
| Inspector  | Auto-generated form from Zod schema; groups params by section.  | Debounced autosave; error badges on invalid fields. |
| Status Bar | Seed badge, Validation errors count, Autosave indicator         | Error count clickable → opens validation panel.     |

### 4.2 Batch Preview Modal

```
┌───────────────────────────────┐
│ Preview ✕                      │
│ Seed start: 42   Runs: 5       │
│ ───────────────────────────── │
│ 42 ➜ "A dark cathedral ..."    │
│ 43 ➜ "A bright cathedral ..."  │
│ 44 ➜ "A misty cathedral ..."   │
│ ...                            │
│ Copy All  |  Close             │
└───────────────────────────────┘
```

### 4.3 Bundle Settings Modal

Simple form: Name, Version (readonly), Author, Tags, Cover Image URL, Primary Entry Node dropdown.

### 4.4 Corrections Manager (Alpha)

Right-side drawer with table listing pattern → replacement, context, hits. Add, Edit, Delete buttons; Import/Export JSON.

## 5. Component Specifications

| Component          | Props                    | States          | Events                     |
| ------------------ | ------------------------ | --------------- | -------------------------- |
| `<NodeCard>`       | id, type, title, summary | selected, error | onSelect, onDrag, onDelete |
| `<InspectorField>` | fieldSchema, value       | error           | onChange                   |
| `<PreviewModal>`   | results[], seeds[]       | loading, error  | onClose, onCopy            |

(Full Figma component list to follow.)

## 6. Visual Design Tokens

| Token                  | Value     | Notes                       |
| ---------------------- | --------- | --------------------------- |
| `--color-bg`           | `#F3F4F6` | Light gray panel background |
| `--color-primary`      | `#2563EB` | Windsurf primary blue       |
| `--color-danger`       | `#DC2626` | Errors / invalid edges      |
| `--radius-sm`          | `4px`     | Node card, buttons          |
| `--color-brand-yellow` | `#EECF3D` | Brand accent yellow         |
| `--color-brand-gray`   | `#A8AFAF` | Brand secondary gray        |
| `--color-brand-orange` | `#FF7E00` | Brand orange highlight      |
| `--color-brand-black`  | `#010100` | Rich black text/contrast    |

Typography: Inter, 14 px base, 1.4 line-height.

## 7. Accessibility Checklist

- All interactive elements reachable via Tab in logical order.
- High-contrast theme switch (prefers-contrast dark/light).
- ARIA roles: `application` for canvas, `dialog` for modals.
- Colour contrast ≥ 4.5:1 for text and interactive icons.

## 8. Keyboard Shortcuts (MVP)

| Shortcut      | Action                                  |
| ------------- | --------------------------------------- |
| `⌘N / Ctrl+N` | Add selected node type (last used)      |
| `⌘S / Ctrl+S` | Save JSON / Download                    |
| `⌘Z` / `⌘⇧Z`  | Undo / Redo                             |
| `⌘E`          | Open Corrections inline editor (future) |

## 9. Stakeholder Decisions (2025-07-09)

1. **Branding Palette** – Adopt brand accents: `#EECF3D`, `#A8AFAF`, `#FF7E00`, `#010100`. Added to design tokens for use in highlights and marketing surfaces.
2. **Palette Size** – Category tabs in Node Library are **not required** for MVP (< 12 node types).
3. **Autosave Interval** – 5 s autosave cadence is confirmed sufficient.
4. **Preview Seeds Display** – Show **top-level seed only** in Preview-5 modal.
5. **Accessibility Testing** – Use **Lighthouse** in CI; failing threshold set to an accessibility score < 90.

All open questions resolved – proceeding to detailed component specs and Figma assets.

---

Once confirmed, I’ll produce component-by-component design assets (Figma links) and detailed interaction flows.
