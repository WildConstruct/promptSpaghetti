import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { PreviewEngine, PreviewState } from '../preview/PreviewEngine';
import { usePreviewTrayStore } from '../../../stores/previewTrayStore';
import { nodeDataToRuntimeNode } from '../nodes/nodeFactory';
import type { Epic1Graph } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { debugLogEpic1 } from '../../../utils/debug';

interface UseGraphPreviewOptions {
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  defaultSeeds?: number[];
  debounceDelay?: number;
  enableCache?: boolean;
  cacheMaxSize?: number;
  cacheMaxAgeMinutes?: number;
  enableWebWorker?: boolean;
  maxExecutionTime?: number;
  workerPoolSize?: number;
}

function getExecutionRelevantNodeData(
  node: Node<unknown>
): Record<string, unknown> | null {
  const data = (node.data ?? {}) as Record<string, unknown>;

  switch (node.type) {
    case 'textBlock':
      return {
        text:
          typeof data.text === 'string' && data.text.length > 0
            ? data.text
            : typeof data.value === 'string'
              ? data.value
              : ''
      };

    case 'weightedChoice':
      return {
        options: data.options ?? null
      };

    case 'concat':
      return {
        separator:
          typeof data.separator === 'string' ? data.separator : null,
        trimInputs: data.trimInputs !== false,
        requireAllInputs: data.requireAllInputs === true
      };

    case 'variable':
      return {
        mode: typeof data.mode === 'string' ? data.mode : 'both',
        variableName:
          typeof data.variableName === 'string' ? data.variableName : null,
        name: typeof data.name === 'string' ? data.name : null,
        defaultValue:
          data.defaultValue !== undefined && data.defaultValue !== null
            ? String(data.defaultValue)
            : null,
        value:
          data.value !== undefined && data.value !== null
            ? String(data.value)
            : null
      };

    case 'output':
      return {
        label: typeof data.label === 'string' ? data.label : null
      };

    default:
      return null;
  }
}

interface PreviewDebugState {
  autoUpdateCount: number;
  lastAutoUpdateAt?: number;
  lastAutoUpdateSignature?: string;
  lastSubscriptionState?: string;
  lastSubscriptionAt?: number;
  lastSeedUpdateAt?: number;
  lastSeeds?: number[];
}

declare global {
  interface Window {
    __PSG_PREVIEW_DEBUG__?: PreviewDebugState;
  }
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
  const currentSeedsRef = useRef<number[]>(defaultSeeds);

  useEffect(() => {
    currentSeedsRef.current = currentSeeds;
  }, [currentSeeds]);

  const executionGraphSignature = useMemo(
    () =>
      JSON.stringify({
        nodes: nodes
          .map(node => ({
            id: node.id,
            type: node.type,
            data: getExecutionRelevantNodeData(node)
          }))
          .filter(node => node.data !== null),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? null,
          targetHandle: edge.targetHandle ?? null
        }))
      }),
    [nodes, edges]
  );

  const updatePreviewDebug = useCallback(
    (
      updates:
        | Partial<PreviewDebugState>
        | ((current: PreviewDebugState) => Partial<PreviewDebugState>)
    ) => {
      if (typeof window === 'undefined') {
        return;
      }
      const current = window.__PSG_PREVIEW_DEBUG__ ?? {
        autoUpdateCount: 0
      };
      const nextUpdates =
        typeof updates === 'function' ? updates(current) : updates;
      window.__PSG_PREVIEW_DEBUG__ = {
        ...current,
        ...nextUpdates
      };
      console.log('[PSG_PREVIEW_DEBUG]', window.__PSG_PREVIEW_DEBUG__);
    },
    []
  );

  // Initialize preview engine
  useEffect(() => {
    const previewEngine = new PreviewEngine({
      debounceDelay,
      seeds: currentSeedsRef.current,
      enableCache,
      cacheMaxSize,
      cacheMaxAgeMinutes,
      enableWebWorker,
      workerPoolSize
    });
    previewEngineRef.current = previewEngine;

    const unsubscribe = previewEngine.subscribe(update => {
      updatePreviewDebug({
        lastSubscriptionState: update.state,
        lastSubscriptionAt: Date.now()
      });
      const isExecuting =
        update.state === PreviewState.EXECUTING ||
        update.state === PreviewState.PENDING;
      setIsPreviewExecuting(isExecuting);

      if (Array.isArray(update.results)) {
        const mappedResults = update.results.map(result => {
          const withSeed = result as typeof result & { seed?: number };
          const seedValue =
            typeof withSeed.seed === 'number'
              ? withSeed.seed
              : Array.isArray(currentSeedsRef.current)
                ? currentSeedsRef.current[0]
                : 0;
          const outputValue =
            typeof result.output === 'string'
              ? result.output
              : JSON.stringify(result.output ?? '');
          return {
            seed: seedValue,
            result: outputValue
          };
        });
        setPreviewResults(mappedResults);
      }

      if (update.error) {
        console.error('[Preview] Error:', update.error);
        setPreviewError(update.error);
      } else if (update.state !== PreviewState.ERROR) {
        setPreviewError(undefined);
      }
    });

    return () => {
      unsubscribe();
      previewEngine.dispose();
      if (previewEngineRef.current === previewEngine) {
        previewEngineRef.current = null;
      }
    };
  }, [
    debounceDelay,
    enableCache,
    cacheMaxSize,
    cacheMaxAgeMinutes,
    enableWebWorker,
    updatePreviewDebug,
    workerPoolSize
  ]);

  // Automatically update preview when nodes or edges change
  useEffect(() => {
    if (!previewEngineRef.current) {
      return;
    }

    // Always try to update preview when we have nodes
    if (nodes.length > 0) {
      const runtimeGraph = convertToRuntimeGraph(nodes, edges);
      if (runtimeGraph) {
        updatePreviewDebug(current => ({
          autoUpdateCount: current.autoUpdateCount + 1,
          lastAutoUpdateAt: Date.now(),
          lastAutoUpdateSignature: executionGraphSignature
        }));
        previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
      } else {
        // Conversion failed; avoid spamming logs in production
      }
    }
  }, [edges, executionGraphSignature, nodes, updatePreviewDebug]);

  // Toggle preview visibility
  const togglePreview = useCallback(() => {
    const store = usePreviewTrayStore.getState();
    const nextOpen = !store.isOpen;
    store.setOpen(nextOpen);
    setIsPreviewVisible(nextOpen);
    showToast?.('info', `Preview ${nextOpen ? 'shown' : 'hidden'}`);
  }, [showToast]);

  // Show preview
  const showPreview = useCallback(() => {
    const store = usePreviewTrayStore.getState();
    store.setOpen(true);
    setIsPreviewVisible(true);
    showToast?.('info', 'Preview shown');
  }, [showToast]);

  // Hide preview
  const hidePreview = useCallback(() => {
    const store = usePreviewTrayStore.getState();
    store.setOpen(false);
    setIsPreviewVisible(false);
    showToast?.('info', 'Preview hidden');
  }, [showToast]);

  // Update preview seeds
  const updateSeeds = useCallback(
    (seeds: number[]) => {
      setCurrentSeeds(seeds);
      updatePreviewDebug({
        lastSeedUpdateAt: Date.now(),
        lastSeeds: seeds
      });
      if (previewEngineRef.current) {
        previewEngineRef.current.setSeeds(seeds);
        const runtimeGraph = convertToRuntimeGraph(nodes, edges);
        if (runtimeGraph) {
          previewEngineRef.current.updatePreview(runtimeGraph, nodes, edges);
        }
      }
      showToast?.('info', `Updated ${seeds.length} preview seeds`);
    },
    [edges, nodes, showToast, updatePreviewDebug]
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
      const newSeeds = currentSeeds.filter(
        (_seed: number, i: number) => i !== index
      );
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
  const executePreview = useCallback(async () => {
    if (!previewEngineRef.current) {
      return;
    }

    const runtimeGraph = convertToRuntimeGraph(nodes, edges);
    if (runtimeGraph) {
      await previewEngineRef.current.updatePreviewImmediate(
        runtimeGraph,
        nodes,
        edges
      );
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
        debugLogEpic1('[Preview] Could not convert node:', node.id, node.type);
      }
    }

    // Return Epic1Graph format
    return {
      nodes: runtimeNodes,
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined
      }))
    };
  } catch (error) {
    console.error('Error converting to runtime graph:', error);
    return null;
  }
}
