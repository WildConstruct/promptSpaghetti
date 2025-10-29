import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { GraphConverter } from '../services/GraphConverter';
import { Epic1ExecutionEngine } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';

export interface PreviewResult {
  seed: string | number;
  result: string;
  error?: string;
}

export interface PreviewContextValue {
  previewEngine: Epic1ExecutionEngine | null;
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
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [previewResults, setPreviewResults] = useState<PreviewResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewSeeds, setPreviewSeeds] = useState<(string | number)[]>(initialSeeds);

  const executePreview = useCallback(async (
    previewNodes: Node<EditableNodeData>[],
    previewEdges: Edge[]
  ) => {
    const runtimeGraph = GraphConverter.convertToRuntimeGraph(
      previewNodes,
      previewEdges
    );

    if (!runtimeGraph) {
      setPreviewResults([]);
      return;
    }

    setIsExecuting(true);
    setPreviewResults([]);

    try {
      const results: PreviewResult[] = [];
      for (const seed of previewSeeds) {
        try {
          const engine = new Epic1ExecutionEngine(runtimeGraph, seed);
          const execution = await engine.execute();
          const output =
            typeof execution.output === 'string'
              ? execution.output
              : JSON.stringify(execution.output ?? '');

          results.push({
            seed,
            result: output
          });
        } catch (error) {
          results.push({
            seed,
            result: '',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setPreviewResults(results);
    } catch (error) {
      console.error('Preview execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [previewSeeds]);

  // Auto-execute preview when nodes/edges change and preview is visible
  useEffect(() => {
    if (!isPreviewVisible || isDragging) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void executePreview(nodes, edges);
    }, previewDebounceDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [nodes, edges, isPreviewVisible, isDragging, previewDebounceDelay, executePreview]);

  const clearResults = useCallback(() => {
    setPreviewResults([]);
  }, []);

  const value: PreviewContextValue = {
    previewEngine: null,
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
