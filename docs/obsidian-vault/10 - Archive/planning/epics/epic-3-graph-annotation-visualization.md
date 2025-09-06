# Epic 3: Graph Annotation and Visualization Enhancement

## Epic Goal
Transform the graph editor into a professional design tool with advanced annotation capabilities, visual organization features, and refined edge routing, enabling users to create clear, well-documented, and visually appealing graph structures.

## Epic Description

### Existing System Context
- Current functionality: Basic React Flow graph editor with nodes and edges
- Technology stack: React 18, React Flow, TypeScript, Zustand
- Current limitations: No annotation tools, basic edge routing, no visual grouping

### Enhancement Vision
This epic introduces professional-grade annotation and visualization tools inspired by design applications like Figma, Miro, and Cinema 4D. Users will be able to:
- Add contextual annotations (post-it notes, comments)
- Draw bounding boxes to highlight regions
- Group nodes visually and logically
- Refine edge routing with control points
- Create a more organized and documented workspace

### Success Criteria
- Users can annotate graphs with notes and visual markers
- Node grouping improves graph organization
- Edge routing creates cleaner visual flows
- All annotations persist with the graph
- Performance remains smooth with many annotations

## User Stories

### Story 1.25: Post-it Notes and Comments System
**Priority: High**
- Implement floating post-it note components
- Support markdown in notes
- Color coding for different note types
- Attach notes to nodes or float freely
- Collapsible/expandable note states

### Story 1.26: Bounding Boxes and Visual Regions
**Priority: High**
- Draw rectangular bounding boxes around node groups
- Label boxes with titles and descriptions
- Semi-transparent backgrounds with customizable colors
- Resize and reposition boxes
- Boxes render behind nodes (z-index layering)

### Story 1.27: Node Grouping and Hierarchy
**Priority: Medium**
- Select multiple nodes to create groups
- Collapse/expand groups to simplify view
- Move groups as single units
- Nested group support
- Visual indicators for grouped nodes

### Story 1.28: Advanced Edge Routing and Control Points
**Priority: Medium**
- Add control points to edges for custom routing
- Smooth bezier curves between points
- Edge labels with better positioning
- Orthogonal routing option (right angles)
- Auto-routing to avoid node overlaps

## Technical Approach

### Architecture Changes
- Extend graph data model for annotations
- New Zustand slices for annotation state
- Custom React Flow node types for groups
- Enhanced edge rendering with control points
- Layer management system for z-ordering

### Data Model Extensions
```typescript
interface GraphAnnotations {
  notes: PostItNote[]
  boundingBoxes: BoundingBox[]
  groups: NodeGroup[]
  edgeRouting: EdgeRoutingConfig[]
}

interface PostItNote {
  id: string
  content: string
  position: { x: number; y: number }
  color: string
  attachedTo?: string // nodeId or null for floating
  collapsed: boolean
  createdAt: number
  updatedAt: number
}

interface BoundingBox {
  id: string
  title: string
  description?: string
  bounds: { x: number; y: number; width: number; height: number }
  color: string
  opacity: number
  zIndex: number
}

interface NodeGroup {
  id: string
  name: string
  nodeIds: string[]
  collapsed: boolean
  position?: { x: number; y: number } // when collapsed
  parentGroup?: string // for nested groups
}

interface EdgeRoutingConfig {
  edgeId: string
  controlPoints: Array<{ x: number; y: number }>
  routingType: 'smooth' | 'orthogonal' | 'straight'
}
```

### UI/UX Patterns
- **Annotation Mode**: Toggle between edit and annotate modes
- **Context Menus**: Right-click to add annotations
- **Drag & Drop**: For notes and bounding boxes
- **Keyboard Shortcuts**: Quick annotation creation
- **Toolbar**: Annotation tools palette

## Compatibility Requirements
- [x] Backward compatible with existing graphs
- [x] Annotations are optional (can be hidden)
- [x] Export includes annotation data
- [x] Performance optimized for 100+ annotations
- [x] Works with existing save/load infrastructure

## Risk Mitigation
- **Primary Risk**: Performance impact with many annotations
- **Mitigation**: Virtual rendering for off-screen annotations, debounced updates
- **Secondary Risk**: Complex UI overwhelming users
- **Mitigation**: Progressive disclosure, annotation mode toggle

## Definition of Done
- [ ] All 4 stories completed with tests
- [ ] Annotations persist with graph saves
- [ ] No performance regression (< 60fps with 100 annotations)
- [ ] Keyboard shortcuts documented
- [ ] Accessibility support for annotations
- [ ] Documentation and examples created

## Dependencies
- Stories 1.19-1.21 (persistence layer for saving annotations)
- React Flow library capabilities
- Potential new libraries: markdown renderer, color picker

## Estimation
**Epic Total**: L (5-7 days)
- Story 1.25: M (1.5 days)
- Story 1.26: M (1.5 days)
- Story 1.27: M (1.5 days)
- Story 1.28: L (2 days)

## Success Metrics
- Annotation usage rate > 40% of active users
- Average annotations per graph: 3-5
- User satisfaction score increase: +15%
- Support tickets for graph organization: -30%