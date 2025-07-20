import { create } from 'zustand';
import { Edge, Node } from 'reactflow';
import { NodeData } from './types/NodeTypes';
import { 
  addVariationToNode, 
  removeVariationFromNode, 
  updateVariationInNode, 
  reorderVariationsInNode,
  mergeNodeData
} from './utils/nodeDataUtils';

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (nodeId: string, partial: Record<string, unknown>) => void;
  addVariation: (nodeId: string, variation: string) => void;
  removeVariation: (nodeId: string, variationIndex: number) => void;
  updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
  reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateNode: (nodeId, partial) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...partial } } : n
      )
    })),
  
  addVariation: (nodeId, variation) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: addVariationToNode(n.data as NodeData, variation) }
          : n
      )
    })),
  
  removeVariation: (nodeId, variationIndex) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: removeVariationFromNode(n.data as NodeData, variationIndex) }
          : n
      )
    })),
  
  updateVariation: (nodeId, variationIndex, newValue) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: updateVariationInNode(n.data as NodeData, variationIndex, newValue) }
          : n
      )
    })),
  
  reorderVariations: (nodeId, fromIndex, toIndex) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: reorderVariationsInNode(n.data as NodeData, fromIndex, toIndex) }
          : n
      )
    })),
  
  duplicateNode: (nodeId) =>
    set((state) => {
      const nodeToClone = state.nodes.find((n) => n.id === nodeId);
      if (!nodeToClone) return state;
      
      const newNode = {
        ...nodeToClone,
        id: `${nodeToClone.id}-copy-${Date.now()}`,
        position: {
          x: nodeToClone.position.x + 100,
          y: nodeToClone.position.y + 100
        },
        data: {
          ...nodeToClone.data,
          label: `${nodeToClone.data.label} (Copy)`
        }
      };
      
      return { nodes: [...state.nodes, newNode] };
    }),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
    }))
}));
