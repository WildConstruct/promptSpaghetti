import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { PreviewEngine } from '../preview/PreviewEngine';
import { usePreviewTrayStore } from '../../../stores/previewTrayStore';
import { nodeDataToRuntimeNode } from '../nodes/nodeFactory';
import type { Epic1Graph } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';

interface UseGraphPreviewOptions {
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  defaultSeeds?: number[];
  debounceDelay?: number;
  enableCache?: boolean;
  cacheMaxSize?: number;
  cacheMaxAgeMinutes?: number;
  enableWebWorker?: boolean;
  workerPoolSize?: number;
}

/**
 * Custom hook for managing graph preview functionality
 */
export function useGraphPreview<NodeData = unknown>(
  nodes: Node<NodeData>[],
  edges: Edge[],
  options: UseGraphPreviewOptions = {}
) {
  const {
    showToast,
    defaultSeeds = [1234, 5678, 9012],
    debounceDelay = 300,
    enableCache = true,
    cacheMaxSize = 100,
    cacheMaxAgeMinutes = 30,
    enableWebWorker = true,
    workerPoolSize = 4
  } = options;

  // Preview state
  const [previewResults, setPreviewResults] = useState<
    Array<{
      seed: number;
      result: string;
    }>
  >([]);
  const [isPreviewExecuting, setIsPreviewExecuting] = useState(false);
  const [previewError, setPreviewError] = useState<Error | undefined>();
  const [currentSeeds, setCurrentSeeds] = useState<number[]>(defaultSeeds);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Preview engine reference
  const previewEngineRef = useRef<PreviewEngine | null>(null);

  // Initialize preview engine
  useEffect(() => {
    if (!previewEngineRef.current) {
      previewEngineRef.current = new PreviewEngine({
        debounceDelay,
        seeds: currentSeeds,
        enableCache,
        cacheMaxSize,
        cacheMaxAgeMinutes,
        enableWebWorker,
        workerPoolSize
      });

      // Subscribe to preview updates
      const unsubscribe = previewEngineRef.current.subscribe(update => {
        console.log('[Preview] Got update:', update);

        if (update.loading !== undefined) {
          setIsPreviewExecuting(update.loading);
        }

        if (update.results) {
          const mappedResults = update.results.map(
            (r: { seed: number; output?: string }) => ({
              seed: r.seed,
              result: r.output || ''
            })
          );
          setPreviewResults(mappedResults);
        }

        if (update.error) {
          console.error('[Preview] Error:', update.error);
          setPreviewError(update.error);
        } else {
          setPreviewError(undefined);
        }
      });

      return () => {
        unsubscribe();
        previewEngineRef.current?.dispose();
      };
    }
  }, [
    debounceDelay,
    currentSeeds,
    enableCache,
    cacheMaxSize,
    cacheMaxAgeMinutes,
    enableWebWorker,
    workerPoolSize
  ]);

  // Automatically update preview when nodes or edges change
  useEffect(() => {
    if (!previewEngineRef.current) {
      console.log('[Preview] No preview engine available');
      return;
    }

    // Always try to update preview when we have nodes
    if (nodes.length > 0) {
      const runtimeGraph = convertToRuntimeGraph(nodes, edges);
      if (runtimeGraph) {
        console.log(
          '[Preview] Updating preview with graph changes - nodes:',
          nodes.length,
          'edges:',
          edges.length
        );
        previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
      } else {
        console.log('[Preview] Failed to convert graph');
      }
    }
  }, [nodes, edges]);

  // Toggle preview visibility
  const togglePreview = useCallback(() => {
    const { toggleTray, isOpen } = usePreviewTrayStore.getState();
    toggleTray();
    setIsPreviewVisible(!isOpen);
    showToast?.('info', `Preview ${!isOpen ? 'shown' : 'hidden'}`);
  }, [showToast]);

  // Show preview
  const showPreview = useCallback(() => {
    const { openTray } = usePreviewTrayStore.getState();
    openTray();
    setIsPreviewVisible(true);
    showToast?.('info', 'Preview shown');
  }, [showToast]);

  // Hide preview
  const hidePreview = useCallback(() => {
    const { closeTray } = usePreviewTrayStore.getState();
    closeTray();
    setIsPreviewVisible(false);
    showToast?.('info', 'Preview hidden');
  }, [showToast]);

  // Update preview seeds
  const updateSeeds = useCallback(
    (seeds: number[]) => {
      setCurrentSeeds(seeds);
      if (previewEngineRef.current) {
        previewEngineRef.current.setSeeds(seeds);
        // Trigger re-execution with new seeds
        previewEngineRef.current.updatePreview(
          convertToRuntimeGraph(nodes, edges),
          nodes,
          edges
        );
      }
      showToast?.('info', `Updated ${seeds.length} preview seeds`);
    },
    [nodes, edges, showToast]
  );

  // Add a seed
  const addSeed = useCallback(
    (seed: number) => {
      const newSeeds = [...currentSeeds, seed];
      updateSeeds(newSeeds);
    },
    [currentSeeds, updateSeeds]
  );

  // Remove a seed
  const removeSeed = useCallback(
    (index: number) => {
      const newSeeds = currentSeeds.filter((_, i) => i !== index);
      updateSeeds(newSeeds);
    },
    [currentSeeds, updateSeeds]
  );

  // Generate random seeds
  const generateRandomSeeds = useCallback(
    (count = 3) => {
      const seeds = Array.from({ length: count }, () =>
        Math.floor(Math.random() * 10000)
      );
      updateSeeds(seeds);
    },
    [updateSeeds]
  );

  // Execute preview manually
  const executePreview = useCallback(() => {
    if (!previewEngineRef.current) return;

    const runtimeGraph = convertToRuntimeGraph(nodes, edges);
    if (runtimeGraph) {
      previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
      showToast?.('info', 'Executing preview...');
    } else {
      showToast?.('error', 'Failed to convert graph for preview');
    }
  }, [nodes, edges, showToast]);

  // Clear preview results
  const clearPreview = useCallback(() => {
    setPreviewResults([]);
    setPreviewError(undefined);
    showToast?.('info', 'Preview cleared');
  }, [showToast]);

  // Export preview results
  const exportPreviewResults = useCallback(
    (format: 'json' | 'csv' | 'txt' = 'json') => {
      if (previewResults.length === 0) {
        showToast?.('info', 'No preview results to export');
        return;
      }

      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'csv':
          content = 'Seed,Result\n';
          content += previewResults
            .map(r => `${r.seed},"${r.result.replace(/"/g, '""')}"`)
            .join('\n');
          mimeType = 'text/csv';
          extension = 'csv';
          break;

        case 'txt':
          content = previewResults
            .map(r => `Seed ${r.seed}:\n${r.result}\n`)
            .join('\n---\n\n');
          mimeType = 'text/plain';
          extension = 'txt';
          break;

        default:
          content = JSON.stringify(previewResults, null, 2);
          mimeType = 'application/json';
          extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview-results-${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      showToast?.(
        'success',
        `Preview results exported as ${extension.toUpperCase()}`
      );
    },
    [previewResults, showToast]
  );

  // Get preview info
  const getPreviewInfo = useCallback(() => {
    return {
      resultCount: previewResults.length,
      seedCount: currentSeeds.length,
      isExecuting: isPreviewExecuting,
      hasError: !!previewError,
      isVisible: isPreviewVisible
    };
  }, [
    previewResults,
    currentSeeds,
    isPreviewExecuting,
    previewError,
    isPreviewVisible
  ]);

  return {
    // State
    previewResults,
    isPreviewExecuting,
    previewError,
    currentSeeds,
    isPreviewVisible,

    // Actions
    togglePreview,
    showPreview,
    hidePreview,
    updateSeeds,
    addSeed,
    removeSeed,
    generateRandomSeeds,
    executePreview,
    clearPreview,
    exportPreviewResults,

    // Utilities
    getPreviewInfo,
    previewEngine: previewEngineRef.current
  };
}

// Helper function to convert nodes/edges to runtime graph
function convertToRuntimeGraph<NodeData>(
  nodes: Node<NodeData>[],
  edges: Edge[]
): Epic1Graph | null {
  try {
    // Convert React Flow nodes to runtime nodes
    const runtimeNodes = new Map();

    for (const node of nodes) {
      const runtimeNode = nodeDataToRuntimeNode(node as Node);
      if (runtimeNode) {
        runtimeNodes.set(node.id, runtimeNode);
      } else {
        console.warn('[Preview] Could not convert node:', node.id, node.type);
      }
    }

    // Return Epic1Graph format
    return {
      nodes: runtimeNodes,
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      }))
    };
  } catch (error) {
    console.error('Error converting to runtime graph:', error);
    return null;
  }
}
