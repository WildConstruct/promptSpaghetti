# Prompt Spaghetti Quick Reference

## 🎯 One-Page Cheat Sheet

### Starting Out
- **First time?** Tutorial auto-starts (or press `T`)
- **Skip tutorial:** Press `Escape` 
- **Get help:** Press `?` for shortcuts or `H` for docs

### Inline Editing (The Core Feature!)
```
Double-click → Edit → Enter (save) or Escape (cancel)
```

### Essential Keyboard Shortcuts

#### Editing Mode
- `Double-click` - Start editing
- `Enter` - Save and exit edit
- `Escape` - Cancel edit
- `Tab` - Next field
- `Shift+Tab` - Previous field
- `Ctrl/Cmd+Enter` - Save and edit next node

#### Canvas Navigation  
- `Drag` - Pan view
- `Ctrl/Cmd + +/-` - Zoom in/out
- `Ctrl/Cmd + 0` - Fit all nodes
- `Space` (hold) - Quick preview

#### Node Operations
- `Click` - Select node
- `Ctrl/Cmd+Click` - Add to selection  
- `Ctrl/Cmd+A` - Select all
- `Ctrl/Cmd+D` - Duplicate selected
- `Delete` - Delete selected
- `Ctrl/Cmd+Z/Shift+Z` - Undo/Redo

#### File Operations
- `Ctrl/Cmd+S` - Save project
- `Ctrl/Cmd+P` - Generate preview
- `Ctrl/Cmd+E` - Export graph
- `Ctrl/Cmd+N` - New project

#### Help & UI
- `?` - Keyboard shortcuts overlay
- `H` - Help documentation panel
- `T` - Tutorial replay
- `Ctrl/Cmd+B` - Toggle sidebar
- `Ctrl/Cmd+K` - Command palette

### Mouse Gestures

| Gesture | Action |
|---------|--------|
| Double-click node | Edit inline |
| Click node | Select |
| Drag node | Move |
| Drag from port | Create connection |
| Drag empty space | Pan canvas |
| Scroll wheel | Zoom |
| Right-click | Context menu |

### Visual Indicators

- **Blue outline** = Selected node
- **Glowing edge** = Active connection
- **Dashed border** = Drop target
- **Red underline** = Validation error
- **Green check** = Saved successfully
- **Yellow dot** = Unsaved changes

### Pro Workflows

#### Speed Editing
1. Select multiple nodes (`Ctrl+Click`)
2. Press `E` to enter batch edit mode
3. `Tab` through all selected nodes
4. `Ctrl+Enter` to save all

#### Quick Preview
1. Hold `Space` for instant preview
2. Release to return to editing
3. No clicking required!

### Common Patterns

#### Text Variations
```
Base text {
  variant 1 | weight: 70%
  variant 2 | weight: 20%  
  variant 3 | weight: 10%
}
```

#### Weighted Choices
```
[option A (0.6) | option B (0.3) | option C (0.1)]
```

#### Variable References
```
Set: character_name = "Eleanor"
Use: The hero, {character_name}, arrived...
```

### Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Can't edit | Double-click the text area |
| Lost work | Check auto-save (every 5s) |
| Shortcuts not working | Click canvas first |
| Tutorial stuck | Press `Escape`, then `T` |
| Slow performance | Zoom out, hide tooltips |

### Settings Locations

- **Tutorial**: Settings → Help & Tutorials → Reset Tutorial
- **Tooltips**: Settings → UI → Show Tooltips
- **Shortcuts**: Settings → Keyboard → Customize
- **Auto-save**: Settings → Editor → Auto-save Interval
- **Theme**: Settings → Appearance → Color Scheme

### Easter Eggs 🥚
- Konami Code: `↑↑↓↓←→←→BA`
- Triple-click logo
- Type "spaghetti" while holding Shift
- Long-press any node for 3 seconds
- Shake device on mobile

### Need More Help?
- In-app: Press `?` or `H`
- Docs: `/docs/epic1-getting-started.md`
- Tutorial: Press `T` anytime
- Forum: community.promptspaghetti.com

---
*Version 1.0 | Epic 1 - Inline Editing MVP*