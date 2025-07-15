import { jest } from '@jest/globals';
import React from 'react';

/**
 * ReactFlow mock implementation for Jest tests
 * This mock simulates the behavior of ReactFlow for testing drag and drop, node selection, etc.
 */

// Define position types
export interface XYPosition {
  x: number;
  y: number;
}

export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom'
}

// Node and Edge types
export interface NodeData {
  label?: string;
  [key: string]: any;
}

export interface Node {
  id: string;
  data?: NodeData;
  position: XYPosition;
  type?: string;
  selected?: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  [key: string]: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  label?: string;
  [key: string]: any;
}

// Connection types
export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export enum ConnectionLineType {
  Bezier = 'bezier',
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
}

export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

// Node change types
export interface NodeDimensionChange {
  type: 'dimensions';
  id: string;
  dimensions: { width: number; height: number };
}

export interface NodePositionChange {
  type: 'position';
  id: string;
  position: XYPosition;
}

export interface NodeSelectionChange {
  type: 'select';
  id: string;
  selected: boolean;
}

export interface NodeRemoveChange {
  type: 'remove';
  id: string;
}

export type NodeChange = 
  | NodeDimensionChange 
  | NodePositionChange 
  | NodeSelectionChange 
  | NodeRemoveChange;

// Edge change types
export interface EdgeChange {
  id: string;
  type: string;
}

// Callback types
export type OnConnect = (connection: Connection) => void;
export type OnNodesChange = (changes: NodeChange[]) => void;
export type OnEdgesChange = (changes: EdgeChange[]) => void;

// Mock event types
export type ReactFlowMouseEvent = React.MouseEvent<Element, MouseEvent>;

// ReactFlow component props
export interface ReactFlowProps {
  nodes?: Node[];
  edges?: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  onNodeClick?: (event: ReactFlowMouseEvent, node: Node) => void;
  onNodeDragStart?: (event: ReactFlowMouseEvent, node: Node) => void;
  onNodeDrag?: (event: ReactFlowMouseEvent, node: Node) => void;
  onNodeDragStop?: (event: ReactFlowMouseEvent, node: Node) => void;
  nodeTypes?: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  onInit?: (reactFlowInstance: any) => void;
  onMove?: (event: ReactFlowMouseEvent) => void;
  onMoveStart?: (event: ReactFlowMouseEvent) => void;
  onMoveEnd?: (event: ReactFlowMouseEvent) => void;
  onSelectionChange?: (elements: { nodes: Node[]; edges: Edge[] }) => void;
  onSelectionDragStart?: (event: ReactFlowMouseEvent) => void;
  onSelectionDrag?: (event: ReactFlowMouseEvent) => void;
  onSelectionDragStop?: (event: ReactFlowMouseEvent) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  snapToGrid?: boolean;
  defaultZoom?: number;
  defaultPosition?: [number, number];
  snapGrid?: [number, number];
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  elementsSelectable?: boolean;
  selectNodesOnDrag?: boolean;
  multiSelectionKeyCode?: string;
  minZoom?: number;
  maxZoom?: number;
  translateExtent?: [[number, number], [number, number]];
  preventScrolling?: boolean;
}

// ReactFlow component props for provider
export interface ReactFlowProviderProps {
  children: React.ReactNode;
}

// Viewport type for ReactFlow
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Mock implementation of ReactFlow API
 */

// Mock helper functions for creating events
const createMockEvent = (type = 'click'): Partial<React.MouseEvent> => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  type,
  currentTarget: document.createElement('div'),
  target: document.createElement('div'),
  clientX: 100,
  clientY: 100
});

// Create mock versions of the supporting components
const BackgroundMock = (): JSX.Element => <div data-testid="rf__background" />;
const MiniMapMock = (): JSX.Element => <div data-testid="rf__minimap" />;
const ControlsMock = (): JSX.Element => <div data-testid="rf__controls" />;
const PanelMock = ({ children }: { children?: React.ReactNode }): JSX.Element => (
  <div data-testid="rf__panel">{children}</div>
);

const ReactFlowProviderMock = ({ children }: ReactFlowProviderProps): JSX.Element => (
  <div data-testid="rf__provider">{children}</div>
);

// Create mock React Flow component with proper type safety
const ReactFlowMock = (props: ReactFlowProps): JSX.Element => {
  const {
    nodes = [],
    onNodeClick,
    onDrop,
    onDragOver,
    children
  } = props;

  const handleNodeClick = (node: Node) => {
    if (onNodeClick) {
      // Cast the mock event to the expected ReactFlowMouseEvent type
      const mockEvent = createMockEvent() as unknown as ReactFlowMouseEvent;
      onNodeClick(mockEvent, node);
    }
  };

  return (
    <div data-testid="rf__wrapper">
      <div className="react-flow__renderer">
        <div 
          className="react-flow__pane"
          style={{ width: '100%', height: '100%' }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          data-testid="react-flow-pane"
        >
          {nodes.map((node) => (
            <div 
              key={node.id}
              data-testid={`node-${node.id}`}
              className={`react-flow__node ${node.selected ? 'selected' : ''}`}
              onClick={() => handleNodeClick(node)}
              style={{ 
                position: 'absolute', 
                left: node.position.x, 
                top: node.position.y 
              }}
            >
              {node.data?.label || node.id}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
};

// Define the return type for useReactFlow
interface ReactFlowInstance {
  project: (position: XYPosition) => XYPosition;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNodes: (nodes: Node[]) => void;
  addEdges: (edges: Edge[]) => void;
  toObject: () => { nodes: Node[]; edges: Edge[] };
  getNode: (id: string) => Node | null;
  getEdge: (id: string) => Edge | null;
  fitView: (options?: any) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoom: number) => void;
  setViewport: (viewport: Viewport) => void;
  getViewport: () => Viewport;
}

// Mock useReactFlow hook with type safety
const useReactFlowMock = jest.fn().mockReturnValue({
  project: jest.fn((position: XYPosition): XYPosition => ({
    x: position.x - 100,
    y: position.y - 50
  })),
  screenToFlowPosition: jest.fn((position: XYPosition): XYPosition => ({
    x: position.x - 100,
    y: position.y - 50
  })),
  getNodes: jest.fn().mockReturnValue([]),
  getEdges: jest.fn().mockReturnValue([]),
  setNodes: jest.fn(),
  setEdges: jest.fn(),
  addNodes: jest.fn(),
  addEdges: jest.fn(),
  toObject: jest.fn().mockReturnValue({ nodes: [], edges: [] }),
  getNode: jest.fn((id: string) => null),
  getEdge: jest.fn((id: string) => null),
  fitView: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  zoomTo: jest.fn(),
  setViewport: jest.fn(),
  getViewport: jest.fn().mockReturnValue({ x: 0, y: 0, zoom: 1 }),
});

// Create and export utility functions
export const addEdge = jest.fn((params: Connection, edges: Edge[]) => [
  ...edges, 
  { id: `e-${Date.now()}`, ...params }
]);

export const useNodesState = jest.fn((initialNodes: Node[]) => [initialNodes, jest.fn()]);
export const useEdgesState = jest.fn((initialEdges: Edge[]) => [initialEdges, jest.fn()]);
export const useNodeId = jest.fn().mockReturnValue("node-" + Math.floor(Math.random() * 10000));
export const getIncomers = jest.fn().mockReturnValue([]);
export const getOutgoers = jest.fn().mockReturnValue([]);
export const getConnectedEdges = jest.fn().mockReturnValue([]);

// Export all the components and hooks
export const useReactFlow = useReactFlowMock;
export const ReactFlow = ReactFlowMock;
export const Background = BackgroundMock;
export const MiniMap = MiniMapMock;
export const Controls = ControlsMock;
export const ReactFlowProvider = ReactFlowProviderMock;
export const Panel = PanelMock;

// Re-export the type for users of the mock
export type { ReactFlowInstance };

// Export default object for ES module compliance
export default {
  useReactFlow,
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  ReactFlowProvider,
  Panel,
  Position,
  useNodesState,
  useEdgesState,
  useNodeId,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  addEdge
};
