import React, { createContext, useContext, ReactNode } from 'react';
import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { usePreviewEngine } from '../hooks/usePreviewEngine';
import { PreviewEngine } from '../preview/PreviewEngine';

interface PreviewContextType {
  previewEngine: PreviewEngine | null;
  isPreviewVisible: boolean;
  setPreviewVisible: (visible: boolean) => void;
  previewResults: any[];
  isExecuting: boolean;
  error: Error | null;
  updatePreview: () => void;
  handleSeedChange: (seeds: (string | number)[]) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

interface PreviewProviderProps {
  children: ReactNode;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  isDragging: boolean;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
}

/**
 * PreviewProvider - Manages preview engine state and execution
 * Provides preview functionality to all child components
 */
export const PreviewProvider: React.FC<PreviewProviderProps> = ({
  children,
  nodes,
  edges,
  isDragging,
  previewDebounceDelay = 300,
  previewSeeds,
}) => {
  const [isPreviewVisible, setPreviewVisible] = React.useState(true);
  const [previewResults, setPreviewResults] = React.useState<any[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { previewEngine, handlePreviewSeedChange } = usePreviewEngine({
    previewDebounceDelay,
    previewSeeds,
    nodes,
    edges,
    isPreviewVisible,
    isDragging,
  });

  // Subscribe to preview engine events
  React.useEffect(() => {
    if (!previewEngine) return;

    const handleResults = (results: any[]) => {
      setPreviewResults(results);
      setIsExecuting(false);
      setError(null);
    };

    const handleError = (err: Error) => {
      setError(err);
      setIsExecuting(false);
    };

    const handleStart = () => {
      setIsExecuting(true);
      setError(null);
    };

    // Add event listeners (assuming PreviewEngine has these methods)
    // You might need to implement these in PreviewEngine
    const unsubscribeResults = previewEngine.onResults?.(handleResults);
    const unsubscribeError = previewEngine.onError?.(handleError);
    const unsubscribeStart = previewEngine.onStart?.(handleStart);

    return () => {
      unsubscribeResults?.();
      unsubscribeError?.();
      unsubscribeStart?.();
    };
  }, [previewEngine]);

  const updatePreview = React.useCallback(() => {
    if (previewEngine && !isDragging) {
      // Trigger preview update
      setIsExecuting(true);
      // The actual update happens through the usePreviewEngine hook
    }
  }, [previewEngine, isDragging]);

  const value: PreviewContextType = {
    previewEngine,
    isPreviewVisible,
    setPreviewVisible,
    previewResults,
    isExecuting,
    error,
    updatePreview,
    handleSeedChange: handlePreviewSeedChange,
  };

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};

/**
 * usePreview - Hook to access preview context
 */
export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }
  return context;
};