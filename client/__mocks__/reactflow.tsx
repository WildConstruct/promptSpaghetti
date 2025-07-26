import React from 'react';
import { jest } from '@jest/globals';

// Very small subset of the public API that App and our tests actually use.
export interface XYPosition { x: number; y: number }
export interface Viewport extends XYPosition { zoom: number }
export interface Node<T = Record<string, unknown>> {
  id: string;
  position: XYPosition;
  data: T & { label?: string; nodeType?: string };
  selected?: boolean;
}
export interface Edge {
  id: string;
  source?: string;
  target?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Add missing enum exports
export enum ConnectionLineType {
  Bezier = 'default',
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
}

export enum MarkerType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}

// Position enum removed - using const object below instead to avoid duplication

interface ReactFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (evt: React.MouseEvent, node: Node) => void;
  onNodesChange?: (changes: unknown[]) => void;
  onEdgesChange?: (changes: unknown[]) => void;
  onConnect?: (connection: unknown) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onPaneClick?: () => void;
  nodeTypes?: Record<string, React.ComponentType>;
  connectionMode?: string;
  snapToGrid?: boolean;
  fitView?: boolean;
  style?: React.CSSProperties;
  defaultEdgeOptions?: Record<string, unknown>;
  selectNodesOnDrag?: boolean;
  selectionOnDrag?: boolean;
  nodeOrigin?: [number, number];
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown; // Allow any additional props
}

export const ReactFlow: React.FC<ReactFlowProps> = ({
  nodes,
  edges,
  onNodeClick,
  onDrop,
  onDragOver,
  onPaneClick,
  children,
  style,
  className
  // Additional props are accepted but not used in mock
}) => {
  const handleDrop = (e: React.DragEvent) => {
    // Ensure clientX and clientY are available for tests
    if (!e.clientX && !e.clientY) {
      Object.defineProperty(e, 'clientX', { value: 100, writable: true });
      Object.defineProperty(e, 'clientY', { value: 100, writable: true });
    }
    onDrop?.(e);
  };

  return (
    <div data-testid="rf__wrapper" className={className} style={style}>
      <div className="react-flow__renderer">
        <div
          className="react-flow__pane"
          data-testid="react-flow-pane"
          style={{ width: '100%', height: '100%', cursor: 'default' }}
          onDrop={handleDrop}
          onDragOver={onDragOver ?? ((e) => e.preventDefault())}
          onClick={onPaneClick}
        >
          <div data-testid="node-container">
            {nodes.map((node) => (
              <div
                key={node.id}
                data-testid={`node-${node.id}`}
                data-selected={node.selected}
                className={`react-flow__node ${node.selected ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick?.(e, node);
                }}
                style={{ 
                  cursor: 'pointer',
                  position: 'absolute',
                  left: node.position.x,
                  top: node.position.y 
                }}
              >
                {node.data?.label || node.id}
                {node.data?.nodeType && (
                  <div data-testid={`node-type-${node.id}`}>{node.data.nodeType}</div>
                )}
              </div>
            ))}
          </div>
          <div data-testid="edge-container">
            {edges.map((edge) => (
              <div key={edge.id} data-testid={`edge-${edge.id}`}>{edge.id}</div>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Background: React.FC = () => <div data-testid="reactflow-background">Background</div>;
export const MiniMap: React.FC = () => <div data-testid="reactflow-minimap">MiniMap</div>;
export const Controls: React.FC = () => <div data-testid="reactflow-controls">Controls</div>;
export const ReactFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="reactflow-provider">{children}</div>
);

export const useReactFlow = () => ({
  project: (pos: XYPosition) => pos,
  screenToFlowPosition: (pos: XYPosition) => pos,
  getNodes: () => [],
  getEdges: () => [],
  getViewport: (): Viewport => ({ x: 0, y: 0, zoom: 1 }),
  setNodes: () => {},
  setEdges: () => {},
  addNodes: () => {},
  addEdges: () => {},
  fitView: () => {},
  zoomTo: () => {},
  zoomIn: () => {},
  zoomOut: () => {}
});

export const Position = { 
  Left: 'left', 
  Right: 'right', 
  Top: 'top', 
  Bottom: 'bottom' 
} as const;

export type PositionEnum = typeof Position[keyof typeof Position];

export const Handle: React.FC<{ 
  type?: 'source' | 'target';
  position: typeof Position[keyof typeof Position]; 
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ children, type, position, style }) => (
  <div 
    data-testid={`handle-${type}-${position}`} 
    className={[
      `react-flow__handle-${position}`,
      'react-flow__handle',
      'nodrag',
      'nopan',
      type,
      'connectable',
      'connectablestart', 
      'connectableend',
      'connectionindicator'
    ].join(' ')}
    data-handlepos={position}
    data-id={`null-null-${type}`}
    style={style}
  >
    {children}
  </div>
);

// Add missing types for compatibility
export interface NodeProps {
  id: string;
  data: unknown;
  selected?: boolean;
  isConnectable?: boolean;
  xPos?: number;
  yPos?: number;
  dragging?: boolean;
  zIndex?: number;
}

// Add missing enum exports
export const ConnectionMode = {
  Strict: 'strict',
  Loose: 'loose'
} as const;

// Add utility functions
export const addEdge = jest.fn((connection: Connection, edges: Edge[]) => [
  ...edges, 
  { ...connection, id: `e-${Date.now()}` }
]);
export const useNodesState = jest.fn((initialNodes: Node[]) => [initialNodes, jest.fn<unknown[], unknown>()]);
export const useEdgesState = jest.fn((initialEdges: Edge[]) => [initialEdges, jest.fn<unknown[], unknown>()]);

// Default export fallback
export default {
  __esModule: true,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Handle,
  useReactFlow,
  Position,
  ConnectionMode,
  addEdge,
  useNodesState,
  useEdgesState
};
