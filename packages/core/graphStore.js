"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGraphStore = void 0;
const zustand_1 = require("zustand");
const nodeDataUtils_1 = require("./utils/nodeDataUtils");
exports.useGraphStore = (0, zustand_1.create)((set) => ({
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    updateNode: (nodeId, partial) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...partial } } : n),
    })),
    addVariation: (nodeId, variation) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === nodeId
            ? { ...n, data: (0, nodeDataUtils_1.addVariationToNode)(n.data, variation) }
            : n),
    })),
    removeVariation: (nodeId, variationIndex) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === nodeId
            ? { ...n, data: (0, nodeDataUtils_1.removeVariationFromNode)(n.data, variationIndex) }
            : n),
    })),
    updateVariation: (nodeId, variationIndex, newValue) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === nodeId
            ? { ...n, data: (0, nodeDataUtils_1.updateVariationInNode)(n.data, variationIndex, newValue) }
            : n),
    })),
    reorderVariations: (nodeId, fromIndex, toIndex) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === nodeId
            ? { ...n, data: (0, nodeDataUtils_1.reorderVariationsInNode)(n.data, fromIndex, toIndex) }
            : n),
    })),
    duplicateNode: (nodeId) => set((state) => {
        const nodeToClone = state.nodes.find((n) => n.id === nodeId);
        if (!nodeToClone)
            return state;
        const newNode = {
            ...nodeToClone,
            id: `${nodeToClone.id}-copy-${Date.now()}`,
            position: {
                x: nodeToClone.position.x + 100,
                y: nodeToClone.position.y + 100,
            },
            data: {
                ...nodeToClone.data,
                label: `${nodeToClone.data.label} (Copy)`,
            },
        };
        return { nodes: [...state.nodes, newNode] };
    }),
    deleteNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),
}));
//# sourceMappingURL=graphStore.js.map