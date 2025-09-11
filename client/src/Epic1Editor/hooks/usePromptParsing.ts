import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import type {
  PromptAnalysis,
  GeneratedNode
} from '../../lib/simplePromptParser';
import {
  calculateViewportDimensions,
  calculateNodePositions,
  createDemoNodes
} from '../utils/nodePositioning';

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
    if (!promptAnalysis || !nodeCreationMode) return;

    const processAnalysis = () => {
      const { width: viewportWidth } = calculateViewportDimensions();

      // Convert analysis nodes to React Flow nodes
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      if (promptAnalysis.nodes && promptAnalysis.nodes.length > 0) {
        // Calculate positions for new nodes
        const positions = calculateNodePositions(
          promptAnalysis.nodes.length,
          viewportWidth
        );

        // Create React Flow nodes from analysis
        promptAnalysis.nodes.forEach(
          (genNode: GeneratedNode, index: number) => {
            const position = positions[index] || {
              x: 100,
              y: 100 + index * 150
            };

            const newNode: Node = {
              id: genNode.id,
              type: genNode.type || 'BaseEditableNode',
              position,
              data: {
                ...genNode.data,
                label: genNode.name || genNode.id,
                content: genNode.content || '',
                nodeType: genNode.nodeType || genNode.type || 'default'
              }
            };

            newNodes.push(newNode);
          }
        );

        // Create edges from analysis
        if (promptAnalysis.edges) {
          promptAnalysis.edges.forEach((edge: any) => {
            newEdges.push({
              id: edge.id || `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
              type: edge.type || 'default'
            });
          });
        }

        // Call the callback with created nodes
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
