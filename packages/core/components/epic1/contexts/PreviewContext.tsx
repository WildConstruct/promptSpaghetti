import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { PreviewEngine } from '../preview/PreviewEngine';
import type { EditableNodeData } from '../nodes';

export interface PreviewResult {
  seed: string | number;
  result: string;
  error?: string;
}

export interface PreviewContextValue {
  previewEngine: PreviewEngine | null;
  isPreviewVisible: boolean;
  setPreviewVisible: (visible: boolean) => void;
  executePreview: (nodes: Node<EditableNodeData>[], edges: Edge[]) => Promise<void>;
  previewResults: PreviewResult[];
  isExecuting: boolean;
  previewSeeds: (string | number)[];
  setPreviewSeeds: (seeds: (string | number)[]) => void;
  clearResults: () => void;
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined);

export interface PreviewProviderProps {
  children: React.ReactNode;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  isDragging: boolean;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
}

export const PreviewProvider: React.FC<PreviewProviderProps> = ({
  children,
  nodes,
  edges,
  isDragging,
  previewDebounceDelay = 300,
  previewSeeds: initialSeeds = ['seed1', 'seed2', 'seed3'],
}) => {
  const [previewEngine] = useState(() => new PreviewEngine());
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [previewResults, setPreviewResults] = useState<PreviewResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewSeeds, setPreviewSeeds] = useState<(string | number)[]>(initialSeeds);
  
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-execute preview when nodes/edges change and preview is visible
  useEffect(() => {
    if (!isPreviewVisible || isDragging) {
      return;
    }

    // Clear existing timeout
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
    }

    // Debounce execution
    executionTimeoutRef.current = setTimeout(() => {
      executePreview(nodes, edges);
    }, previewDebounceDelay);

    return () => {
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
    };
  }, [nodes, edges, isPreviewVisible, isDragging, previewDebounceDelay]);

  const executePreview = useCallback(async (
    previewNodes: Node<EditableNodeData>[],
    previewEdges: Edge[]
  ) => {
    // Cancel any existing execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsExecuting(true);
    setPreviewResults([]);

    try {
      const results: PreviewResult[] = [];

      for (const seed of previewSeeds) {
        // Check if aborted
        if (abortController.signal.aborted) {
          break;
        }

        try {
          const result = await previewEngine.execute(
            previewNodes,
            previewEdges,
            seed
          );

          // Check if aborted after execution
          if (!abortController.signal.aborted) {
            results.push({
              seed,
              result: result || 'No output',
            });
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            results.push({
              seed,
              result: '',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      // Only update results if not aborted
      if (!abortController.signal.aborted) {
        setPreviewResults(results);
      }
    } catch (error) {
      console.error('Preview execution error:', error);
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsExecuting(false);
        abortControllerRef.current = null;
      }
    }
  }, [previewEngine, previewSeeds]);

  const clearResults = useCallback(() => {
    setPreviewResults([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value: PreviewContextValue = {
    previewEngine,
    isPreviewVisible,
    setPreviewVisible,
    executePreview,
    previewResults,
    isExecuting,
    previewSeeds,
    setPreviewSeeds,
    clearResults,
  };

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};