import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from '../../lib/simplePromptParser';
import { convertAnalysisToGraph } from '../../lib/analysisToGraph';

interface UsePromptParsingProps {
  onNodesCreated?: (nodes: Node[], edges: Edge[]) => void;
  initialAnalysis?: PromptAnalysis;
  nodeCreationMode?: 'new-project' | 'add-to-existing' | null;
}

export const usePromptParsing = ({
  onNodesCreated,
  initialAnalysis,
  nodeCreationMode: initialMode = null
}: UsePromptParsingProps = {}) => {
  const [showPromptDissector, setShowPromptDissector] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(
    initialAnalysis || null
  );
  const [nodeCreationMode, setNodeCreationMode] = useState<
    'new-project' | 'add-to-existing' | null
  >(initialMode);

  // Handle prompt analysis completion from dissector
  const handlePromptAnalysisComplete = useCallback(
    (analysis: PromptAnalysis) => {
      setPromptAnalysis(analysis);
      setShowPromptDissector(false);
    },
    []
  );

  // Process analysis into nodes when available
  useEffect(() => {
    if (!promptAnalysis || !nodeCreationMode) {return;}

    const processAnalysis = () => {
      console.log('[usePromptParsing] Processing analysis:', promptAnalysis);
      console.log('[usePromptParsing] Node creation mode:', nodeCreationMode);
      // Convert analysis nodes to React Flow nodes
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (promptAnalysis.nodes && promptAnalysis.nodes.length > 0) {
        const graph = convertAnalysisToGraph(promptAnalysis, {
          nodesPerRow: 3,
          spacing: { x: 320, y: 200 },
          start: { x: 100, y: 100 }
        });
        newNodes = graph.nodes;
        newEdges = graph.edges;

        console.log('[usePromptParsing] Created nodes:', newNodes);
        console.log('[usePromptParsing] Created edges:', newEdges);
        onNodesCreated?.(newNodes, newEdges);
      }

      // Reset state
      setPromptAnalysis(null);
      setNodeCreationMode(null);
    };

    processAnalysis();
  }, [promptAnalysis, nodeCreationMode, onNodesCreated]);

  // Open prompt dissector
  const openPromptDissector = useCallback(
    (mode: 'new-project' | 'add-to-existing') => {
      setNodeCreationMode(mode);
      setShowPromptDissector(true);
    },
    []
  );

  // Close prompt dissector
  const closePromptDissector = useCallback(() => {
    setShowPromptDissector(false);
    setPromptAnalysis(null);
    setNodeCreationMode(null);
  }, []);

  // Process existing analysis
  const processExistingAnalysis = useCallback(
    (analysis: PromptAnalysis, mode: 'new-project' | 'add-to-existing') => {
      setPromptAnalysis(analysis);
      setNodeCreationMode(mode);
    },
    []
  );

  return {
    showPromptDissector,
    promptAnalysis,
    nodeCreationMode,
    handlePromptAnalysisComplete,
    openPromptDissector,
    closePromptDissector,
    processExistingAnalysis,
    setShowPromptDissector,
    setPromptAnalysis,
    setNodeCreationMode
  };
};
