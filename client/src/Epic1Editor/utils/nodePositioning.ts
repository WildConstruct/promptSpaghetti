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

export type TypedNode = Node<TextBlockNodeData | WeightedChoiceNodeData | OutputNodeData>;

/**
 * Calculate viewport dimensions with sensible defaults
 */
export const calculateViewportDimensions = (): ViewportDimensions => {
  const width = Math.max(800, (window.innerWidth || 1200) - 400);
  const height = Math.max(600, (window.innerHeight || 800) - 100);
  
  if (isNaN(width) || isNaN(height)) {
    console.error('[Epic1Editor] Invalid viewport dimensions!', { width, height });
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
    draggable: false,
    selectable: true,
    data: {
      nodeType: 'textBlock',
      content: 'Generate a character for a',
      text: 'Generate a character for a',
      label: 'Prompt Start',
      frameEdge: 'top'
    } as TextBlockNodeData
  },
  {
    id: 'setting-1',
    type: 'weightedChoice',
    position: positions.rightMiddle,
    draggable: false,
    selectable: true,
    data: {
      nodeType: 'weightedChoice',
      options: [
        { text: 'medieval fantasy', weight: 40 },
        { text: 'dark medieval', weight: 30 },
        { text: 'high fantasy', weight: 30 }
      ],
      label: 'Setting',
      frameEdge: 'right'
    } as WeightedChoiceNodeData
  },
  {
    id: 'prompt-2',
    type: 'textBlock',
    position: positions.bottomRight,
    draggable: false,
    selectable: true,
    data: {
      nodeType: 'textBlock',
      content: 'story. They are a',
      text: 'story. They are a',
      label: 'Connector',
      frameEdge: 'bottom'
    } as TextBlockNodeData
  },
  {
    id: 'character-1',
    type: 'weightedChoice',
    position: positions.bottomCenter,
    draggable: false,
    selectable: true,
    data: {
      nodeType: 'weightedChoice',
      options: [
        { text: 'brave knight', weight: 25 },
        { text: 'cunning rogue', weight: 25 },
        { text: 'wise wizard', weight: 25 },
        { text: 'mysterious ranger', weight: 25 }
      ],
      label: 'Character Type',
      frameEdge: 'bottom'
    } as WeightedChoiceNodeData
  },
  {
    id: 'output-1',
    type: 'output',
    position: positions.leftMiddle,
    draggable: false,
    selectable: true,
    data: {
      nodeType: 'output',
      outputName: 'character_prompt',
      label: 'Character Prompt',
      frameEdge: 'left'
    } as OutputNodeData
  }
];

/**
 * Force frame edge nodes to stay at their designated positions
 */
export const enforceFrameEdgePositions = (
  nodes: Node[], 
  originalNodes: Node[]
): Node[] => {
  return nodes.map(node => {
    const originalNode = originalNodes.find(n => n.id === node.id);
    if (originalNode && originalNode.position && originalNode.data?.frameEdge) {
      // Force frame edge nodes back to their original positions
      return {
        ...node,
        position: originalNode.position,
        draggable: false
      };
    }
    return node;
  });
};