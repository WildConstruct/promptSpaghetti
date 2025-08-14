import { useRef, useEffect, useCallback } from 'react';
import { PreviewEngine } from '../preview/PreviewEngine';
import { nodeDataToRuntimeNode } from '../nodes/nodeFactory';
export function usePreviewEngine({ previewDebounceDelay = 300, previewSeeds, nodes, edges, isPreviewVisible, isDragging }) {
    const previewEngineRef = useRef(null);
    // Initialize preview engine
    if (!previewEngineRef.current) {
        previewEngineRef.current = new PreviewEngine({
            debounceDelay: previewDebounceDelay,
            seeds: previewSeeds,
            enableCache: true,
            cacheMaxSize: 100,
            cacheMaxAgeMinutes: 30,
            enableWebWorker: true,
            workerPoolSize: 4
        });
    }
    // Convert React Flow graph to runtime graph format
    const convertToRuntimeGraph = useCallback((flowNodes, flowEdges) => {
        try {
            const runtimeNodes = new Map();
            for (const node of flowNodes) {
                if (!node.type || !node.position) {
                    console.warn('Skipping invalid node:', node.id, 'type:', node.type, 'position:', node.position);
                    continue;
                }
                const runtimeNode = nodeDataToRuntimeNode(node);
                if (runtimeNode) {
                    runtimeNodes.set(node.id, runtimeNode);
                }
            }
            return {
                nodes: runtimeNodes,
                edges: flowEdges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle
                }))
            };
        }
        catch (error) {
            console.error('Error converting to runtime graph:', error);
            return null;
        }
    }, []);
    // Update preview when graph changes (but not during dragging)
    useEffect(() => {
        if (!isPreviewVisible || !previewEngineRef.current || isDragging)
            return;
        const runtimeGraph = convertToRuntimeGraph(nodes, edges);
        if (runtimeGraph) {
            previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
        }
    }, [nodes, edges, isPreviewVisible, convertToRuntimeGraph, isDragging]);
    // Handle seed changes from preview panel
    const handlePreviewSeedChange = useCallback((seeds) => {
        if (previewEngineRef.current) {
            const runtimeGraph = convertToRuntimeGraph(nodes, edges);
            if (runtimeGraph) {
                previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
            }
        }
    }, [nodes, edges, convertToRuntimeGraph]);
    // Cleanup preview engine on unmount
    useEffect(() => {
        return () => {
            previewEngineRef.current?.dispose();
        };
    }, []);
    return {
        previewEngine: previewEngineRef.current,
        convertToRuntimeGraph,
        handlePreviewSeedChange
    };
}
