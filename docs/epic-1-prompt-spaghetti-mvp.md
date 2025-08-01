# Epic 1: Prompt Spaghetti MVP - Demo-Ready Rebuild

## Epic Goal

Deliver a polished, demo-ready prompt manipulation tool that showcases instant prompt analysis, visual node editing with **inline editing capabilities**, and deterministic variation generation - compelling enough to secure funding in 8 weeks.

## Epic Description

### Project Context

This is a complete rebuild of Prompt Spaghetti, transforming it from a TypeScript-heavy prototype into a clean, professional tool that filmmakers and VFX artists will love. The rebuild maintains the validated node-graph concept while implementing a cleaner architecture and adding critical missing features.

### Key Innovation: Inline Node Editing

**CRITICAL REQUIREMENT**: Unlike traditional node editors that rely on side panels or inspectors, Prompt Spaghetti implements **direct inline editing within the graph itself**. This keeps users in their creative flow and makes the cause-and-effect relationships immediately visible.

**Inline Editing Features:**
- Click any node to edit its content directly
- Weighted choices show sliders right on the node
- Text fields expand in place
- Immediate visual feedback as you type
- No context switching to side panels
- See changes propagate through the graph in real-time

### Enhancement Details

**What's Being Built:**
- Core node engine with deterministic execution
- Prompt analysis with visual text-to-node mapping
- React Flow-based editor with inline editing
- Asset library with drag-and-drop presets
- Real-time preview system
- Medieval demo showcase

**Success Criteria:**
- Medieval demo generates 20 variations in <1 second
- Users can create variations within 30 seconds
- Zero side panel usage required for basic workflows
- Investor "wow" moment achieved
- Beta testers rate experience >8 NPS

## User Stories

### Story 1.1: Core Node Engine & File Format

**As a developer,**  
I want to implement the foundational node system with inline-editable data structures,  
so that all subsequent features can support direct graph manipulation.

**Acceptance Criteria:**
1. Define .psg file format schema supporting inline editing state
2. Implement base node classes with editable properties:
   - TextBlock: inline text field
   - WeightedChoice: inline sliders + text
   - Concat: inline separator field
   - Variable: inline name/value fields
3. Create deterministic execution engine with seedable random
4. Node data structure supports edit states (editing/locked/preview)
5. Validate graph execution with unit tests
6. Ensure medieval demo nodes support inline editing

**Technical Notes:**
- Each node type implements `renderInlineEditor()` method
- Node state includes `isEditing`, `editValue`, `validationErrors`
- File format preserves edit history for undo/redo

**Documentation Deliverables:**
- api/file-format.md with inline editing state
- Code: JSDoc for all node editor interfaces

---

### Story 1.2: Prompt Analysis & Node Generation

**As a VFX artist,**  
I want to paste a prompt and see it broken into inline-editable nodes,  
so that I can immediately start tweaking without leaving the canvas.

**Acceptance Criteria:**
1. Implement prompt parser that identifies semantic units
2. Create visual range indicators showing text-to-node mapping
3. Generated nodes appear in editing mode by default
4. Click anywhere on canvas to confirm all edits
5. Tab/Shift+Tab navigates between node edit fields
6. Support Escape key to cancel edits

**Technical Notes:**
- Auto-focus first generated node for immediate editing
- Smart node positioning to minimize overlap
- Maintain source text mapping during edits

**Documentation Deliverables:**
- user-guide/concepts.md (inline editing workflow)
- videos/prompt-analysis-demo.mp4 showing inline editing

---

### Story 1.3: Visual Node Editor with React Flow

**As a filmmaker,**  
I want to edit my prompts directly on the visual canvas,  
so that I can see relationships while making changes.

**Acceptance Criteria:**
1. Custom React Flow nodes with inline editing UI
2. Click node to enter edit mode
3. Visual feedback during editing (glow, expanded size)
4. Live preview updates as you type
5. Weighted choice nodes show interactive sliders
6. Connection validation prevents invalid links
7. Pan/zoom works even during editing

**Technical Notes:**
- Custom node components using React Flow's node API
- Keyboard shortcuts: Enter to confirm, Escape to cancel
- Edit mode styling via CSS classes
- Performance: debounced preview updates

**Documentation Deliverables:**
- getting-started/first-prompt.md emphasizing inline editing
- Storybook: Interactive examples of each editable node

---

### Story 1.4: Asset Library & Preset System

**As a creative professional,**  
I want to drag presets onto nodes and immediately edit them inline,  
so that I can customize presets without interrupting my flow.

**Acceptance Criteria:**
1. Drag preset onto node replaces content
2. Dropped presets enter edit mode automatically
3. Preset preview appears during hover
4. Inline editing of preset values post-drop
5. Modified presets can be saved back to library
6. Visual indication of modified vs. original presets

**Technical Notes:**
- Preset format includes default edit positions
- Smart conflict resolution for preset merging
- Inline "save as preset" option

**Documentation Deliverables:**
- user-guide/asset-library.md with inline customization
- examples/medieval-merchant/ showing editable presets

---

### Story 1.5: Execution & Preview System

**As a user,**  
I want to see variations update live as I edit nodes inline,  
so that I get immediate feedback on my changes.

**Acceptance Criteria:**
1. Preview panel updates with 300ms debounce during editing
2. Edited node highlights which preview items changed
3. Seed control accessible without leaving edit mode
4. One-click copy from preview to clipboard
5. Visual connection between edited node and affected outputs
6. Performance: smooth updates even during rapid editing

**Technical Notes:**
- Diff algorithm to highlight changed outputs
- Preview caching for unchanged branches
- WebWorker for non-blocking execution

**Documentation Deliverables:**
- user-guide/real-time-preview.md
- api/rest-api.md with execution endpoints

---

### Story 1.6: Polish & Demo Optimization

**As a founder,**  
I want the inline editing to feel magical and intuitive,  
so that investors immediately see the innovation.

**Acceptance Criteria:**
1. Smooth animations for edit mode transitions
2. Satisfying micro-interactions (magnetic snap, gentle ease)
3. Keyboard shortcuts for power users (⌘K for quick node)
4. Smart defaults reduce typing needed
5. Medieval demo showcases inline editing flow
6. "Teenage Engineering" details that delight

**Technical Notes:**
- CSS transitions for all state changes
- Haptic feedback API for future mobile
- Easter eggs in edit interactions

**Documentation Deliverables:**
- getting-started/medieval-demo.md with inline editing focus
- videos/2min-pitch.mp4 highlighting inline innovation
- user-guide/tips-tricks.md including hidden features

---

## Inline Editing Technical Architecture

### Node Component Structure
```typescript
interface EditableNode {
  id: string;
  type: NodeType;
  data: {
    value: any;
    isEditing: boolean;
    editBuffer: any;
    validationState: ValidationResult;
  };
  
  // Methods
  enterEditMode(): void;
  exitEditMode(save: boolean): void;
  updateEditBuffer(value: any): void;
  validate(): ValidationResult;
  renderInlineEditor(): ReactElement;
}
```

### Edit Mode Interaction Flow
```
User clicks node → enterEditMode() → 
Node expands → Focus input field →
User types → updateEditBuffer() → 
Debounced preview update →
User hits Enter → validate() → exitEditMode(true) →
Node contracts → Graph updates
```

### Keyboard Navigation
- **Click/Enter**: Enter edit mode
- **Tab**: Next editable field/node
- **Shift+Tab**: Previous field/node
- **Escape**: Cancel edit
- **⌘Enter**: Confirm all edits
- **⌘Z**: Undo (even during edit)

## Definition of Done

- [ ] All stories completed with inline editing fully functional
- [ ] Zero reliance on side panels for core workflows
- [ ] Medieval demo showcases inline editing advantage
- [ ] Beta testers successfully edit without instructions
- [ ] Performance: <50ms response for all interactions
- [ ] Documentation emphasizes inline editing paradigm
- [ ] Investor pitch highlights this key differentiator

## Risk Mitigation

**Primary Risk:** Inline editing complexity affects timeline  
**Mitigation:** Start with simple text editing, progressively enhance  
**Fallback:** Basic inline with advanced features in side panel

**Secondary Risk:** Performance with many editable nodes  
**Mitigation:** Virtual viewport, edit only visible nodes  
**Monitoring:** FPS counter during development

## Success Metrics

- Time to first edit: <2 seconds
- Edits without leaving canvas: >90%
- User satisfaction with inline editing: >9/10
- Preview update lag: <300ms
- Beta tester "wow" moments: >80%

## Notes for Development Team

The inline editing is our **key differentiator**. Every decision should prioritize keeping users in the flow. If you have to choose between a feature working inline vs. working perfectly, choose inline. We can always enhance later, but the core experience must demonstrate this paradigm shift from day one.

Remember: We're not building another node editor. We're building the **Teenage Engineering of prompt tools** - where the interface disappears and creation feels immediate.

---

*Epic created by Sarah (PO) based on PRD and inline editing requirement*