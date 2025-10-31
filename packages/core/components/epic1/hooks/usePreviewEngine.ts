import { useRef, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { PreviewEngine } from '../preview/PreviewEngine';
import { Epic1Graph } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { nodeDataToRuntimeNode } from '../nodes/nodeFactory';
import type { EditableNodeData } from '../nodes';

interface UsePreviewEngineProps {
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  isPreviewVisible: boolean;
  isDragging: boolean;
}

export function usePreviewEngine({
  previewDebounceDelay = 300,
  previewSeeds,
  nodes,
  edges,
  isPreviewVisible,
  isDragging
}: UsePreviewEngineProps) {
  const previewEngineRef = useRef<PreviewEngine | null>(null);

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
  const convertToRuntimeGraph = useCallback(
    (
      flowNodes: Node<EditableNodeData>[],
      flowEdges: Edge[]
    ): Epic1Graph | null => {
      try {
        const runtimeNodes = new Map();

        for (const node of flowNodes) {
          if (!node.type || !node.position) {
            console.warn(
              'Skipping invalid node:',
              node.id,
              'type:',
              node.type,
              'position:',
              node.position
            );
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
            sourceHandle: edge.sourceHandle ?? undefined,
            targetHandle: edge.targetHandle ?? undefined
          }))
        };
      } catch (error) {
        console.error('Error converting to runtime graph:', error);
        return null;
      }
    },
    []
  );

  // Update preview when graph changes (but not during dragging)
  useEffect(() => {
    if (!isPreviewVisible || !previewEngineRef.current || isDragging) {return;}

    const runtimeGraph = convertToRuntimeGraph(nodes, edges);
    if (runtimeGraph) {
      previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
    }
  }, [nodes, edges, isPreviewVisible, convertToRuntimeGraph, isDragging]);

  // Handle seed changes from preview panel
  const handlePreviewSeedChange = useCallback(
    (seeds: (string | number)[]) => {
      if (previewEngineRef.current) {
        // Update the seeds first
        previewEngineRef.current.setSeeds(seeds);

        // Then trigger a new preview with the updated seeds
        const runtimeGraph = convertToRuntimeGraph(nodes, edges);
        if (runtimeGraph) {
          previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
        }
      }
    },
    [nodes, edges, convertToRuntimeGraph]
  );

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
