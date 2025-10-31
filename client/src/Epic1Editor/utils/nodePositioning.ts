import { Node } from 'reactflow';
import {
  TextBlockNodeData,
  WeightedChoiceNodeData,
  OutputNodeData
} from '../types';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface NodePositions {
  topCenter: { x: number; y: number };
  rightMiddle: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomCenter: { x: number; y: number };
  leftMiddle: { x: number; y: number };
}

export type TypedNode = Node<
  TextBlockNodeData | WeightedChoiceNodeData | OutputNodeData
>;

/**
 * Calculate viewport dimensions with sensible defaults
 */
export const calculateViewportDimensions = (): ViewportDimensions => {
  const width = Math.max(800, (window.innerWidth || 1200) - 400);
  const height = Math.max(600, (window.innerHeight || 800) - 100);

  if (isNaN(width) || isNaN(height)) {
    console.error('[Epic1Editor] Invalid viewport dimensions!', {
      width,
      height
    });
    return { width: 1200, height: 800 }; // Fallback dimensions
  }

  return { width, height };
};

/**
 * Calculate node positions for frame edge placement
 */
export const calculateNodePositions = (
  viewport: ViewportDimensions,
  nodeDimensions: NodeDimensions = { width: 280, height: 140 },
  edgePadding: number = 20
): NodePositions => {
  const { width: viewportWidth, height: viewportHeight } = viewport;
  const { width: nodeWidth, height: nodeHeight } = nodeDimensions;

  return {
    topCenter: {
      x: (viewportWidth - nodeWidth) / 2,
      y: edgePadding
    },
    rightMiddle: {
      x: viewportWidth - nodeWidth - edgePadding,
      y: (viewportHeight - nodeHeight) / 2
    },
    bottomRight: {
      x: viewportWidth - nodeWidth - edgePadding,
      y: viewportHeight - nodeHeight - edgePadding
    },
    bottomCenter: {
      x: (viewportWidth - nodeWidth) / 2,
      y: viewportHeight - nodeHeight - edgePadding
    },
    leftMiddle: {
      x: edgePadding,
      y: (viewportHeight - nodeHeight) / 2
    }
  };
};

/**
 * Create demo nodes with proper positioning
 */
export const createDemoNodes = (positions: NodePositions): TypedNode[] => [
  {
    id: 'prompt-1',
    type: 'textBlock',
    position: positions.topCenter,
    width: 280,
    height: 140,
    draggable: true,
    selectable: true,
    data: {
      nodeType: 'textBlock',
      content: 'Generate a character for a',
      text: 'Generate a character for a',
      label: 'Prompt Start'
    } as TextBlockNodeData
  },
  {
    id: 'setting-1',
    type: 'weightedChoice',
    position: positions.rightMiddle,
    width: 280,
    height: 140,
    draggable: true,
    selectable: true,
    data: {
      nodeType: 'weightedChoice',
      options: [
        { id: 'opt-1', text: 'medieval fantasy', weight: 40, hasBranch: true },
        { id: 'opt-2', text: 'dark medieval', weight: 30, hasBranch: true },
        { id: 'opt-3', text: 'high fantasy', weight: 30, hasBranch: true }
      ],
      label: 'Setting'
    } as WeightedChoiceNodeData
  },
  {
    id: 'prompt-2',
    type: 'textBlock',
    position: positions.bottomRight,
    width: 280,
    height: 140,
    draggable: true,
    selectable: true,
    data: {
      nodeType: 'textBlock',
      content: 'story. They are a',
      text: 'story. They are a',
      label: 'Connector'
    } as TextBlockNodeData
  },
  {
    id: 'character-1',
    type: 'weightedChoice',
    position: positions.bottomCenter,
    width: 280,
    height: 140,
    draggable: true,
    selectable: true,
    data: {
      nodeType: 'weightedChoice',
      options: [
        { id: 'char-1', text: 'brave knight', weight: 25, hasBranch: true },
        { id: 'char-2', text: 'cunning rogue', weight: 25, hasBranch: true },
        { id: 'char-3', text: 'wise wizard', weight: 25, hasBranch: true },
        { id: 'char-4', text: 'mysterious ranger', weight: 25, hasBranch: true }
      ],
      label: 'Character Type'
    } as WeightedChoiceNodeData
  },
  {
    id: 'output-1',
    type: 'output',
    position: positions.leftMiddle,
    width: 280,
    height: 140,
    draggable: true,
    selectable: true,
    data: {
      nodeType: 'output',
      outputName: 'character_prompt',
      label: 'Character Prompt'
    } as OutputNodeData
  }
];

/**
 * Allow all nodes to be draggable - no longer enforcing frame edge positions
 */
export const enforceFrameEdgePositions = (nodes: Node[]): Node[] => {
  // Simply return nodes as-is, allowing them to be dragged freely
  return nodes;
};
