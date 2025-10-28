# Technical Design: Graph Annotation and Visualization System

## Overview

This document outlines the technical architecture for a comprehensive annotation and visualization system that transforms the graph editor into a professional design tool with advanced documentation, organization, and routing capabilities.

## System Architecture

### 1. Annotation Layer Architecture

```typescript
// packages/core/annotations/AnnotationLayer.ts
interface AnnotationLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  annotations: Annotation[];
}

type Annotation =
  | PostItNote
  | BoundingBox
  | Connector
  | Shape
  | FreehandDrawing;

interface AnnotationManager {
  layers: Map<string, AnnotationLayer>;
  activeLayer: string;

  // Layer management
  createLayer(name: string): AnnotationLayer;
  deleteLayer(id: string): void;
  setActiveLayer(id: string): void;
  toggleLayerVisibility(id: string): void;

  // Annotation operations
  addAnnotation(annotation: Annotation): void;
  updateAnnotation(id: string, updates: Partial<Annotation>): void;
  deleteAnnotation(id: string): void;

  // Bulk operations
  selectAnnotations(ids: string[]): void;
  moveAnnotations(ids: string[], delta: { x: number; y: number }): void;
  duplicateAnnotations(ids: string[]): void;

  // Z-index management
  bringToFront(id: string): void;
  sendToBack(id: string): void;
  bringForward(id: string): void;
  sendBackward(id: string): void;
}
```

### 2. Post-It Notes System

```typescript
// packages/core/annotations/PostItNote.ts
interface PostItNote {
  id: string
  type: 'post-it'
  content: string
  position: XYPosition
  size: Size
  color: NoteColor
  fontSize: number
  fontFamily: string

  // State
  collapsed: boolean
  locked: boolean

  // Relationships
  attachedTo?: string // nodeId
  linkedNotes?: string[] // other note ids

  // Metadata
  author?: string
  createdAt: number
  updatedAt: number
  tags?: string[]
}

interface NoteStyle {
  backgroundColor: string
  borderColor: string
  textColor: string
  shadowColor: string
  shadowBlur: number
}

class PostItNoteRenderer {
  private noteStyles: Map<NoteColor, NoteStyle> = new Map([
    ['yellow', {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      textColor: '#78350f',
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 4
    }],
    // ... other colors
  ])

  render(note: PostItNote): React.ReactElement {
    const style = this.noteStyles.get(note.color)

    return (
      <foreignObject
        x={note.position.x}
        y={note.position.y}
        width={note.size.width}
        height={note.collapsed ? 40 : note.size.height}
        className="post-it-note"
      >
        <div
          style={{
            ...style,
            width: '100%',
            height: '100%',
            padding: '12px',
            boxSizing: 'border-box',
            borderRadius: '4px',
            boxShadow: `0 2px ${style.shadowBlur}px ${style.shadowColor}`
          }}
        >
          {note.collapsed ? (
            <div className="note-collapsed">
              {note.content.split('\n')[0]}...
            </div>
          ) : (
            <div className="note-expanded">
              <MarkdownRenderer content={note.content} />
            </div>
          )}
        </div>
      </foreignObject>
    )
  }
}
```

### 3. Bounding Boxes and Regions

```typescript
// packages/core/annotations/BoundingBox.ts
interface BoundingBox {
  id: string;
  type: 'bounding-box';
  bounds: Bounds;
  title: string;
  description?: string;

  // Visual properties
  style: {
    fill: string;
    fillOpacity: number;
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
    cornerRadius: number;
  };

  // Behavior
  locked: boolean;
  selectable: boolean;

  // Node relationships
  containedNodes: string[]; // cached for performance
  lockContents: boolean; // move nodes with box
}

class BoundingBoxManager {
  private spatialIndex: SpatialIndex<BoundingBox>;

  constructor() {
    this.spatialIndex = new RTree();
  }

  addBox(box: BoundingBox): void {
    this.spatialIndex.insert(box.bounds, box);
    this.updateContainedNodes(box);
  }

  updateContainedNodes(box: BoundingBox): void {
    const nodes = this.getNodesInBounds(box.bounds);
    box.containedNodes = nodes.map(n => n.id);

    if (box.lockContents) {
      this.createNodeLocks(box.id, box.containedNodes);
    }
  }

  getBoxesAtPoint(x: number, y: number): BoundingBox[] {
    return this.spatialIndex.search({ x, y, width: 1, height: 1 });
  }

  getOverlappingBoxes(bounds: Bounds): BoundingBox[] {
    return this.spatialIndex.search(bounds);
  }

  moveBox(boxId: string, delta: { x: number; y: number }): void {
    const box = this.getBox(boxId);
    if (!box) return;

    // Update spatial index
    this.spatialIndex.remove(box.bounds, box);
    box.bounds.x += delta.x;
    box.bounds.y += delta.y;
    this.spatialIndex.insert(box.bounds, box);

    // Move locked nodes
    if (box.lockContents) {
      this.moveLockedNodes(box.containedNodes, delta);
    }
  }
}
```

### 4. Node Grouping System

```typescript
// packages/core/grouping/GroupManager.ts
interface GroupManager {
  groups: Map<string, NodeGroup>;
  hierarchy: GroupHierarchy;

  // Group operations
  createGroup(nodeIds: string[], options?: GroupOptions): NodeGroup;
  dissolveGroup(groupId: string): void;

  // Hierarchy management
  nestGroup(childId: string, parentId: string): void;
  unnestGroup(groupId: string): void;
  getGroupDepth(groupId: string): number;
  getGroupAncestors(groupId: string): string[];

  // Visual operations
  collapseGroup(groupId: string): void;
  expandGroup(groupId: string): void;
  toggleGroup(groupId: string): void;

  // Node operations
  addNodeToGroup(nodeId: string, groupId: string): void;
  removeNodeFromGroup(nodeId: string): void;
  moveNodeBetweenGroups(nodeId: string, fromId: string, toId: string): void;
}

class HierarchicalGroupManager implements GroupManager {
  private maxNestingDepth = 3;

  createGroup(nodeIds: string[], options?: GroupOptions): NodeGroup {
    // Validate nodes aren't in different groups at different levels
    const validation = this.validateGrouping(nodeIds);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const group: NodeGroup = {
      id: generateId(),
      name: options?.name || `Group ${this.groups.size + 1}`,
      nodeIds,
      collapsed: false,
      parentGroupId: validation.commonParent,
      style: options?.style || this.getDefaultStyle(),
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    };

    this.groups.set(group.id, group);
    this.updateHierarchy(group);

    return group;
  }

  private validateGrouping(nodeIds: string[]): ValidationResult {
    const nodeGroups = nodeIds.map(id => this.getNodeGroup(id));
    const uniqueGroups = new Set(nodeGroups.filter(Boolean));

    if (uniqueGroups.size > 1) {
      return {
        valid: false,
        error: 'Cannot group nodes from different groups'
      };
    }

    const commonParent = nodeGroups[0] || null;
    const depth = commonParent ? this.getGroupDepth(commonParent.id) : 0;

    if (depth >= this.maxNestingDepth) {
      return {
        valid: false,
        error: `Maximum nesting depth (${this.maxNestingDepth}) exceeded`
      };
    }

    return {
      valid: true,
      commonParent: commonParent?.id
    };
  }

  collapseGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    // Calculate collapsed representation
    const bounds = this.calculateGroupBounds(group);
    const collapsedNode: Node = {
      id: `group-${groupId}`,
      type: 'groupNode',
      position: { x: bounds.x, y: bounds.y },
      data: {
        group,
        nodeCount: group.nodeIds.length,
        isExpanded: false
      },
      style: {
        width: Math.min(bounds.width, 300),
        height: 80,
        ...group.style
      }
    };

    // Update group state
    group.collapsed = true;
    group.collapsedPosition = collapsedNode.position;
    group.collapsedSize = {
      width: collapsedNode.style.width,
      height: collapsedNode.style.height
    };

    // Hide contained nodes
    this.hideGroupNodes(group.nodeIds);

    // Show collapsed representation
    this.addCollapsedNode(collapsedNode);
  }
}
```

### 5. Advanced Edge Routing

```typescript
// packages/core/routing/EdgeRouter.ts
interface EdgeRouter {
  route(edge: Edge, nodes: Node[], options?: RoutingOptions): RoutedEdge;
  routeAll(edges: Edge[], nodes: Node[]): RoutedEdge[];
  optimizeRoute(edge: RoutedEdge, obstacles: Obstacle[]): RoutedEdge;
}

interface RoutedEdge extends Edge {
  path: PathSegment[];
  controlPoints: ControlPoint[];
  routingStyle: RoutingStyle;
  pathString: string; // SVG path data
}

interface PathSegment {
  type: 'move' | 'line' | 'curve' | 'arc';
  points: Point[];
  controlPoints?: Point[];
}

class SmartEdgeRouter implements EdgeRouter {
  private algorithms: Map<RoutingStyle, RoutingAlgorithm> = new Map([
    ['orthogonal', new OrthogonalRouter()],
    ['smooth', new BezierRouter()],
    ['step', new StepRouter()],
    ['straight', new StraightRouter()],
    ['auto', new AutoRouter()]
  ]);

  route(edge: Edge, nodes: Node[], options?: RoutingOptions): RoutedEdge {
    const style = edge.data?.routingStyle || 'auto';
    const algorithm = this.algorithms.get(style)!;

    // Get source and target positions
    const source = this.getNodeConnection(
      edge.source,
      edge.sourceHandle,
      nodes
    );
    const target = this.getNodeConnection(
      edge.target,
      edge.targetHandle,
      nodes
    );

    // Calculate obstacles
    const obstacles = this.getObstacles(nodes, edge);

    // Generate path
    const path = algorithm.calculatePath(source, target, obstacles, options);

    return {
      ...edge,
      path,
      controlPoints: this.extractControlPoints(path),
      routingStyle: style,
      pathString: this.generateSVGPath(path)
    };
  }

  private getObstacles(nodes: Node[], edge: Edge): Obstacle[] {
    return nodes
      .filter(node => node.id !== edge.source && node.id !== edge.target)
      .map(node => ({
        x: node.position.x - 10,
        y: node.position.y - 10,
        width: (node.width || 150) + 20,
        height: (node.height || 50) + 20
      }));
  }
}

class OrthogonalRouter implements RoutingAlgorithm {
  calculatePath(
    source: ConnectionPoint,
    target: ConnectionPoint,
    obstacles: Obstacle[],
    options?: RoutingOptions
  ): PathSegment[] {
    // Use A* pathfinding with Manhattan distance
    const grid = this.createGrid(source, target, obstacles);
    const path = this.astar(
      grid,
      this.pointToGrid(source.point),
      this.pointToGrid(target.point)
    );

    // Simplify path to minimize turns
    const simplified = this.simplifyPath(path);

    // Convert to path segments
    return this.toPathSegments(simplified);
  }

  private createGrid(
    source: ConnectionPoint,
    target: ConnectionPoint,
    obstacles: Obstacle[]
  ): Grid {
    const bounds = this.calculateBounds(source, target, obstacles);
    const resolution = 10; // 10px grid cells

    const grid = new Grid(
      Math.ceil(bounds.width / resolution),
      Math.ceil(bounds.height / resolution)
    );

    // Mark obstacles in grid
    obstacles.forEach(obstacle => {
      const startX = Math.floor((obstacle.x - bounds.x) / resolution);
      const startY = Math.floor((obstacle.y - bounds.y) / resolution);
      const endX = Math.ceil(
        (obstacle.x + obstacle.width - bounds.x) / resolution
      );
      const endY = Math.ceil(
        (obstacle.y + obstacle.height - bounds.y) / resolution
      );

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          grid.setWalkable(x, y, false);
        }
      }
    });

    return grid;
  }
}
```

### 6. Interaction System

```typescript
// packages/core/annotations/InteractionManager.ts
interface InteractionManager {
  mode: InteractionMode;
  activeTool: AnnotationTool;

  // Mode management
  setMode(mode: InteractionMode): void;
  toggleAnnotationMode(): void;

  // Tool selection
  selectTool(tool: AnnotationTool): void;
  configureTool(config: ToolConfig): void;

  // Interaction handlers
  handleCanvasClick(event: CanvasEvent): void;
  handleCanvasDrag(event: CanvasEvent): void;
  handleKeyboard(event: KeyboardEvent): void;

  // Selection
  selectAnnotations(ids: string[]): void;
  clearSelection(): void;
}

type InteractionMode = 'edit' | 'annotate' | 'view';
type AnnotationTool =
  | 'select'
  | 'note'
  | 'box'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pen';

class AnnotationInteractionManager implements InteractionManager {
  private tools: Map<AnnotationTool, Tool> = new Map([
    ['note', new PostItNoteTool()],
    ['box', new BoundingBoxTool()],
    ['line', new LineTool()],
    ['arrow', new ArrowTool()],
    ['text', new TextTool()],
    ['pen', new PenTool()]
  ]);

  handleCanvasClick(event: CanvasEvent): void {
    if (this.mode !== 'annotate') return;

    const tool = this.tools.get(this.activeTool);
    if (!tool) return;

    if (tool.requiresDrag) {
      tool.startInteraction(event);
    } else {
      const annotation = tool.createAnnotation(event);
      this.annotationManager.addAnnotation(annotation);
    }
  }

  handleCanvasDrag(event: CanvasEvent): void {
    const tool = this.tools.get(this.activeTool);
    if (!tool || !tool.isInteracting) return;

    tool.updateInteraction(event);

    if (event.type === 'dragend') {
      const annotation = tool.finishInteraction();
      if (annotation) {
        this.annotationManager.addAnnotation(annotation);
      }
    }
  }
}
```

### 7. Performance Optimization

```typescript
// packages/core/annotations/PerformanceOptimizer.ts
class AnnotationPerformanceOptimizer {
  private visibleAnnotations = new Set<string>();
  private renderQueue: RenderTask[] = [];
  private frameId: number | null = null;

  // Viewport culling
  updateViewport(viewport: Viewport): void {
    const newVisible = this.getVisibleAnnotations(viewport);

    // Find annotations to add/remove
    const toAdd = difference(newVisible, this.visibleAnnotations);
    const toRemove = difference(this.visibleAnnotations, newVisible);

    // Queue render tasks
    toRemove.forEach(id => this.queueHide(id));
    toAdd.forEach(id => this.queueShow(id));

    this.visibleAnnotations = newVisible;
    this.processRenderQueue();
  }

  private getVisibleAnnotations(viewport: Viewport): Set<string> {
    const bounds = {
      x: viewport.x - 100, // Add buffer
      y: viewport.y - 100,
      width: viewport.width + 200,
      height: viewport.height + 200
    };

    return new Set(this.spatialIndex.search(bounds).map(a => a.id));
  }

  // Batch rendering
  private processRenderQueue(): void {
    if (this.frameId) return;

    this.frameId = requestAnimationFrame(() => {
      const batch = this.renderQueue.splice(0, 10); // Process 10 at a time

      batch.forEach(task => {
        switch (task.type) {
          case 'show':
            this.renderer.showAnnotation(task.id);
            break;
          case 'hide':
            this.renderer.hideAnnotation(task.id);
            break;
          case 'update':
            this.renderer.updateAnnotation(task.id, task.updates);
            break;
        }
      });

      this.frameId = null;

      if (this.renderQueue.length > 0) {
        this.processRenderQueue();
      }
    });
  }

  // Level of detail
  getAnnotationLOD(annotation: Annotation, zoom: number): LODLevel {
    if (zoom < 0.5) return 'minimal';
    if (zoom < 0.75) return 'reduced';
    if (zoom < 1.5) return 'normal';
    return 'detailed';
  }
}
```

### 8. Data Persistence

```typescript
// packages/core/annotations/AnnotationPersistence.ts
interface AnnotationData {
  version: number;
  layers: AnnotationLayer[];
  groups: NodeGroup[];
  routingConfigs: Map<string, EdgeRoutingConfig>;
}

class AnnotationPersistence {
  private currentVersion = 1;

  serialize(annotations: AnnotationData): string {
    const data = {
      version: this.currentVersion,
      layers: Array.from(annotations.layers).map(layer => ({
        ...layer,
        annotations: this.serializeAnnotations(layer.annotations)
      })),
      groups: Array.from(annotations.groups.values()),
      routingConfigs: Object.fromEntries(annotations.routingConfigs)
    };

    return JSON.stringify(data);
  }

  deserialize(data: string): AnnotationData {
    const parsed = JSON.parse(data);

    // Handle version migration
    const migrated = this.migrate(parsed);

    return {
      version: migrated.version,
      layers: migrated.layers.map(layer => ({
        ...layer,
        annotations: this.deserializeAnnotations(layer.annotations)
      })),
      groups: new Map(migrated.groups.map(g => [g.id, g])),
      routingConfigs: new Map(Object.entries(migrated.routingConfigs))
    };
  }

  private migrate(data: any): any {
    if (data.version === this.currentVersion) return data;

    // Apply migrations
    let migrated = data;

    if (data.version < 1) {
      migrated = this.migrateV0ToV1(migrated);
    }

    return migrated;
  }
}
```

## React Integration

### Custom Hooks

```typescript
// packages/core/hooks/useAnnotations.ts
export function useAnnotations() {
  const annotationManager = useAnnotationManager();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Subscribe to annotation changes
  useEffect(() => {
    const unsubscribe = annotationManager.subscribe(state => {
      setAnnotations(state.annotations);
      setSelectedIds(state.selectedIds);
    });

    return unsubscribe;
  }, [annotationManager]);

  const actions = useMemo(
    () => ({
      addNote: (position: XYPosition) => {
        const note = createPostItNote(position);
        annotationManager.addAnnotation(note);
        return note.id;
      },

      addBoundingBox: (bounds: Bounds) => {
        const box = createBoundingBox(bounds);
        annotationManager.addAnnotation(box);
        return box.id;
      },

      updateAnnotation: (id: string, updates: Partial<Annotation>) => {
        annotationManager.updateAnnotation(id, updates);
      },

      deleteAnnotation: (id: string) => {
        annotationManager.deleteAnnotation(id);
      },

      selectAnnotation: (id: string, multi?: boolean) => {
        if (multi) {
          annotationManager.toggleSelection(id);
        } else {
          annotationManager.selectAnnotation(id);
        }
      }
    }),
    [annotationManager]
  );

  return {
    annotations,
    selectedIds,
    ...actions
  };
}

// Hook for grouping
export function useNodeGroups() {
  const groupManager = useGroupManager();
  const [groups, setGroups] = useState<NodeGroup[]>([]);

  return {
    groups,
    createGroup: groupManager.createGroup.bind(groupManager),
    toggleGroup: groupManager.toggleGroup.bind(groupManager),
    dissolveGroup: groupManager.dissolveGroup.bind(groupManager)
  };
}

// Hook for edge routing
export function useEdgeRouting() {
  const router = useEdgeRouter();

  return {
    routeEdge: router.route.bind(router),
    autoRouteAll: router.routeAll.bind(router),
    addControlPoint: (edgeId: string, point: Point) => {
      router.addControlPoint(edgeId, point);
    }
  };
}
```

## Keyboard Shortcuts

```typescript
const annotationShortcuts: ShortcutMap = {
  // Mode switching
  'cmd+shift+a': () => toggleAnnotationMode(),
  escape: () => exitAnnotationMode(),

  // Tools
  v: () => selectTool('select'),
  n: () => selectTool('note'),
  b: () => selectTool('box'),
  l: () => selectTool('line'),

  // Annotations
  'cmd+shift+n': () => createNoteAtCursor(),
  delete: () => deleteSelectedAnnotations(),
  'cmd+d': () => duplicateSelectedAnnotations(),

  // Grouping
  'cmd+g': () => groupSelectedNodes(),
  'cmd+shift+g': () => ungroupSelectedNodes(),
  'cmd+alt+g': () => toggleGroupCollapse(),

  // Z-index
  'cmd+]': () => bringForward(),
  'cmd+[': () => sendBackward(),
  'cmd+shift+]': () => bringToFront(),
  'cmd+shift+[': () => sendToBack(),

  // Edge routing
  'cmd+r': () => autoRouteSelectedEdges(),
  'cmd+shift+r': () => resetEdgeRouting()
};
```

## Testing Strategy

### Unit Tests

- Annotation CRUD operations
- Spatial indexing accuracy
- Routing algorithm correctness
- Group hierarchy validation
- Z-index management

### Integration Tests

- React Flow integration
- Persistence round-trip
- Multi-layer interactions
- Performance with 1000+ annotations

### Performance Tests

- Render performance with many annotations
- Viewport culling effectiveness
- Routing calculation speed
- Memory usage monitoring

## Implementation Checklist

- [ ] Core annotation data models
- [ ] Annotation manager and state
- [ ] Post-it note component and interactions
- [ ] Bounding box system
- [ ] Node grouping and hierarchy
- [ ] Advanced edge routing algorithms
- [ ] Interaction system and tools
- [ ] Performance optimizations
- [ ] React integration and hooks
- [ ] Keyboard shortcuts
- [ ] Persistence layer
- [ ] Testing suite
- [ ] Documentation
