# UI Component Specifications – PromptScape Randomizer Graph

_Draft v0.1 · 2025-07-09_

> All colour variables reference the tokens defined in `ui-spec.md` section 6. For visual mocks see the accompanying Figma file: https://figma.com/file/xxxx/PromptScape-UI (will be shared separately).

## Index
1. Toolbar
2. Palette / Node Library
3. Canvas & Edge Layer
4. NodeCard (base)
5. Inspector Sidebar
6. PreviewModal
7. BundleSettingsModal
8. CorrectionsManagerDrawer
9. StatusBar
10. Mini-map

---

## 1. `<Toolbar>`
### Purpose
Global graph actions – run, preview, import/export, zoom, help.

### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zoom` | `number` | ✔︎ | Current zoom (0.25 – 2.0) |
| `onZoomChange` | `(delta:number)=>void` | ✔︎ | Callback for ± buttons |
| `onRun` | `()=>void` | ✔︎ | Execute graph once |
| `onPreview` | `()=>void` | ✔︎ | Open Preview-5 modal |
| `onExport` | `()=>void` | ✔︎ | Download JSON |
| `onImport` | `(file:File)=>void` | ✔︎ | Import JSON |
| `onUndo` / `onRedo` | `()=>void` | ✔︎ | Time-travel operations |
| `isRunning` | `boolean` | ✕ | Show spinner when true |

### States
None (stateless – controlled by props).

### Events Emitted
Correspond to callbacks above.

### Visual
Height 48 px, background `--color-bg`, icon buttons 32 px.

---

## 2. `<Palette>`
### Purpose
Drag-source library of node types.

### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `nodes` | `NodeMeta[]` | ✔︎ | Array of available node types |
| `collapsed` | `boolean` | ✔︎ | Toggle narrow mode |
| `onToggle` | `()=>void` | ✔︎ | Collapse/expand |

`NodeMeta` = `{ id:string; label:string; icon:ReactNode; category?:string }`

### States
Search string.

### Events
`onDragStart(nodeId)` – HTML5 drag data contains node meta.

---

## 3. `<Canvas>`
Wrapper around React-Flow instance.

### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `graph` | `Graph` | ✔︎ | Current graph json |
| `onChange` | `(graph:Graph)=>void` | ✔︎ | Emits diff on every edit |
| `validationErrors` | `ValidationError[]` | ✔︎ | Highlight invalid edges |

### Imperative Handle
`zoomToFit()`, `centerNode(id)`.

### Styling
Grid background (8 px), react-flow default handles coloured `--color-primary`.

---

## 4. `<NodeCard>` (Base rendered in Canvas)
### Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | `GraphNode` | ✔︎ | Node data |
| `selected` | `boolean` | ✔︎ | Selected outline |
| `hasError` | `boolean` | ✔︎ | Red border when true |
| `theme` | `'light' | 'dark'` | ✔︎ | For contrast |

### Events
`onSelect`, `onDoubleClick`, `onContextMenu`.

### Accessibility
`role="button"`, `tabIndex=0`, arrow-key move handled by Canvas.

---

## 5. `<InspectorSidebar>`
### Purpose
Dynamic form driven by Zod schema for selected node.

### Props
| Name | Type | Required |
|------|------|----------|
| `node` | `GraphNode | null` | ✔︎ |
| `onChange` | `(partial:Record<string,unknown>)=>void` | ✔︎ |

### Implementation Notes
Utilise `react-hook-form` + `@hookform/resolvers/zod` for schema-driven fields.
Field components auto-map types: string → `<Input>`, enum → `<Select>`, number → `<NumberInput>`.

---

## 6. `<PreviewModal>`
### Props
| Name | Type | Required |
|------|------|----------|
| `results` | `string[]` | ✔︎ |
| `seeds` | `number[]` | ✔︎ |
| `onClose` | `()=>void` | ✔︎ |
| `loading` | `boolean` | ✕ |
| `error` | `string | null` | ✕ |

### Interaction
Modal is escapable via `Esc`, focus trap inside.

---

## 7. `<BundleSettingsModal>`
Similar pattern to Inspector. Fields validated on save.

## 8. `<CorrectionsManagerDrawer>`
Table with editable rows; uses brand orange for highlight.

## 9. `<StatusBar>`
Displays:
• Seed badge (monospace, brand yellow background)  
• Error count (badge red if >0)  
• Autosave tick ✓ or spinner.

## 10. `<MiniMap>`
Lower-right overlay using react-flow’s MiniMap; customised node colours by type.

---

## Interaction Flows
1. **Create Node** – Drag from Palette → Canvas drop → Node auto-selected → Inspector opens.
2. **Connect Nodes** – Drag handle → target input → Edge validated; on invalid, pulse red and revert.
3. **Preview** – Click Preview → API call → modal shows loading skeleton → results → copy-all.
4. **Undo** – Ctrl+Z triggers React-Flow undo stack + custom graph history.

---

## Accessibility Details
• Focus ring uses `--color-primary`.  
• Edge creation supports keyboard: select source → press `⌥C` → arrow keys choose target.

---

End of component spec v0.1.
