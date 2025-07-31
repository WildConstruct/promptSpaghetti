# Professional Features - Quick Reference

## 🚀 Quick Start

### Basic Integration

```typescript
import { ProfessionalIntegration } from './components/CommandPalette/ProfessionalIntegration';
import './professional-theme.css';

<ProfessionalIntegration
  nodes={nodes}
  edges={edges}
  selectedNodes={selectedNodes}
  selectedEdges={selectedEdges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onNodesSelect={onNodesSelect}
  onEdgesSelect={onEdgesSelect}
  onNodeCreate={onNodeCreate}
  onNodeDelete={onNodeDelete}
  onExport={onExport}
  onSave={onSave}
  onLoad={onLoad}
  theme="cinema"
/>
```

## ⌨️ Keyboard Shortcuts

| Action                 | Shortcut                | Description                |
| ---------------------- | ----------------------- | -------------------------- |
| **Command Palette**    | `⌘K`                    | Open command palette       |
| **Undo**               | `⌘Z`                    | Undo last action           |
| **Redo**               | `⌘⇧Z` or `⌘Y`           | Redo last undone action    |
| **Save**               | `⌘S`                    | Save project               |
| **Load**               | `⌘O`                    | Load project               |
| **Export**             | `⌘E`                    | Export graph               |
| **Select All**         | `⌘A`                    | Select all nodes           |
| **Delete**             | `Delete` or `Backspace` | Delete selected items      |
| **Duplicate**          | `⌘D`                    | Duplicate selected nodes   |
| **Fit View**           | `⌘0`                    | Fit all nodes in view      |
| **Zoom In**            | `⌘+`                    | Zoom in                    |
| **Zoom Out**           | `⌘-`                    | Zoom out                   |
| **Generate Character** | `⌘G`                    | Quick character generation |
| **Toggle Fullscreen**  | `Alt+F`                 | Toggle fullscreen mode     |
| **Help**               | `?` or `F1`             | Show keyboard shortcuts    |

## 🎨 Theme Colors (Cinema 4D Style)

```css
/* Background Colors */
--color-bg-primary: #2c2c2c;
--color-bg-secondary: #383838;
--color-bg-tertiary: #404040;
--color-bg-quaternary: #4a4a4a;

/* Accent Colors */
--color-accent-orange: #ff7800; /* Primary */
--color-accent-blue: #0ea5e9; /* Secondary */
--color-accent-green: #10b981; /* Success */
--color-accent-red: #ef4444; /* Error */

/* Text Colors */
--color-text-primary: #e5e7eb;
--color-text-secondary: #9ca3af;
--color-text-tertiary: #6b7280;
```

## 🛠️ Component API

### Command Palette

```typescript
<CommandPalette
  isOpen={boolean}
  onClose={() => void}
  nodes={Node[]}
  edges={Edge[]}
  selectedNodes={Node[]}
  onGenerationStart={(flow, params) => Promise<void>}
  theme="cinema" | "light" | "dark"
/>
```

### Undo/Redo Manager

```typescript
<UndoRedoManager
  onStateChange={(state) => void}
  maxHistorySize={50}
  theme="cinema"
/>
```

### Multi-Selection Manager

```typescript
<MultiSelectionManager
  nodes={Node[]}
  edges={Edge[]}
  selectedNodes={Node[]}
  selectedEdges={Edge[]}
  onNodesSelect={(nodes) => void}
  onEdgesSelect={(edges) => void}
  onSelectionChange={(selection) => void}
  theme="cinema"
/>
```

### Autosave Manager

```typescript
<AutosaveManager
  nodes={Node[]}
  edges={Edge[]}
  onRestore={(state) => void}
  interval={30000}
  maxVersions={10}
  theme="cinema"
/>
```

## 🎯 Selection Modes

| Method         | Action         | Result                    |
| -------------- | -------------- | ------------------------- |
| **Single**     | Click node     | Select single node        |
| **Toggle**     | `⌘+Click`      | Add/remove from selection |
| **Range**      | `⇧+Click`      | Select range of nodes     |
| **Rectangle**  | Drag on canvas | Select nodes in rectangle |
| **Select All** | `⌘A`           | Select all nodes          |
| **Clear**      | `Esc`          | Clear selection           |

## 🎬 Generation Flows

### Character Development

```typescript
// Triggered via Command Palette or ⌘G
{
  id: 'character-development',
  steps: [
    'Character Basics',      // Name, role, genre
    'Character Traits',      // Personality, flaws
    'Generation Settings'    // Complexity, options
  ]
}
```

### Story Structure

```typescript
{
  id: 'story-structure',
  steps: [
    'Story Premise',         // Logline, audience
    'Act Structure',         // Three-act breakdown
    'Character Arcs'         // Development paths
  ]
}
```

### Scene Dialogue

```typescript
{
  id: 'dialogue-generator',
  steps: [
    'Scene Setup',           // Context, characters
    'Tone Settings',         // Dramatic, comedic
    'Style Options'          // Voice, format
  ]
}
```

## 💾 Autosave System

### Configuration

```typescript
const autosaveSystem = new AutosaveSystem('project-id', 10);

// Save current state
autosaveSystem.save(nodes, edges, 'User added new node');

// Restore from version
const state = autosaveSystem.restore(versionNumber);

// Check for conflicts
if (autosaveSystem.hasConflict()) {
  // Show recovery dialog
}
```

### Data Structure

```typescript
interface AutosaveState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  version: number;
  checksum: string;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    lastModified: string;
    sessionId: string;
  };
}
```

## 🔍 Professional Status Indicators

### Status Messages

- `Professional Mode Active` - All features enabled
- `Saved` - Autosave successful
- `Error` - Operation failed
- `Ready` - System ready for input

### Visual Indicators

- 🟢 Green dot - System healthy
- 🟡 Yellow dot - Warning state
- 🔴 Red dot - Error state
- 📋 History icon - Access undo/redo
- 💾 Save icon - Manual save
- ⌨️ Keyboard icon - Shortcuts active

## 🚨 Troubleshooting

### Common Issues

**Command Palette Not Opening**

- Check if `⌘K` is bound by browser/OS
- Verify component is properly integrated
- Check theme CSS is loaded

**Undo/Redo Not Working**

- Ensure UndoRedoManager is mounted
- Check if state changes are being tracked
- Verify keyboard shortcuts are active

**Autosave Not Functioning**

- Check localStorage permissions
- Verify interval setting (default 30s)
- Check browser storage limits

**Selection Issues**

- Ensure MultiSelectionManager is active
- Check for event conflicts
- Verify mouse event handlers

### Performance Tips

**Large Graphs (100+ nodes)**

- Enable performance monitoring
- Reduce animation complexity
- Increase autosave interval
- Use viewport-based rendering

**Memory Management**

- Limit undo history (default 50 states)
- Clear autosave versions periodically
- Monitor browser memory usage
- Use efficient data structures

## 📦 File Structure

```
packages/core/components/CommandPalette/
├── CommandPalette.tsx              # Main command interface
├── UndoRedoManager.tsx             # History management
├── MultiSelectionManager.tsx       # Selection system
├── AutosaveManager.tsx             # Autosave system
├── KeyboardShortcutsManager.tsx    # Shortcuts system
└── ProfessionalIntegration.tsx     # Unified integration
```

## 🎨 CSS Classes

### Professional Components

```css
.professional-mode-active {
  /* Status indicator */
}
.command-palette-overlay {
  /* Palette backdrop */
}
.selection-rectangle {
  /* Drag selection */
}
.undo-redo-toolbar {
  /* History controls */
}
.autosave-indicator {
  /* Save status */
}
.keyboard-help-overlay {
  /* Shortcuts help */
}
```

### Animation Classes

```css
.fade-in {
  /* Smooth appearance */
}
.slide-up {
  /* Upward animation */
}
.scale-in {
  /* Scale animation */
}
.professional-transition {
  /* Standard transition */
}
```

## 🔧 Development Mode

### Performance Monitor

```typescript
// Automatically shows in development
{
  fps: number,
  visibleNodes: number,
  totalNodes: number,
  quality: 'High' | 'Optimized'
}
```

### Debug Information

- Node/edge counts
- Selection state
- Performance metrics
- Memory usage
- Event tracking

---

## 📚 Related Documentation

- [Complete Features Documentation](./professional-features.md)
- [UX Audit Results](./ux-audit-results.md)
- [Implementation Guide](./implementation-guide.md)
- [API Reference](./api-reference.md)
