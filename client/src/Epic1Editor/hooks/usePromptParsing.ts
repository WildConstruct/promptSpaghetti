import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import type {
  PromptAnalysis,
  GeneratedNode
} from '../../lib/simplePromptParser';
type AnalysisEdge = {
  id?: string;
  source: string;
  target: string;
  type?: string;
};

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
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      if (promptAnalysis.nodes && promptAnalysis.nodes.length > 0) {
        // Calculate positions for new nodes in a grid layout
        const nodesPerRow = 3;
        const nodeSpacing = { x: 320, y: 200 };
        const startPosition = { x: 100, y: 100 };

        // Create React Flow nodes from analysis
        promptAnalysis.nodes.forEach(
          (genNode: GeneratedNode, index: number) => {
            const row = Math.floor(index / nodesPerRow);
            const col = index % nodesPerRow;
            const position = {
              x: startPosition.x + col * nodeSpacing.x,
              y: startPosition.y + row * nodeSpacing.y
            };

            // Extract the actual node from the wrapper
            const nodeInternal = genNode.node;
            console.log('[usePromptParsing] Processing node:', nodeInternal);

            // Map nodeType to appropriate React Flow type
            let nodeType = 'textBlock'; // default
            if (nodeInternal.nodeType === 'Choice') {
              nodeType = 'weightedChoice';
            } else if (nodeInternal.nodeType === 'Variable') {
              nodeType = 'variable';
            } else if (nodeInternal.nodeType === 'Output') {
              nodeType = 'output';
            }

            // Get the display text - check all possible sources
            let displayText = '';
            if (
              nodeInternal.getPreviewText &&
              typeof nodeInternal.getPreviewText === 'function'
            ) {
              displayText = nodeInternal.getPreviewText();
            } else if (nodeInternal.text) {
              displayText = nodeInternal.text;
            } else if (nodeInternal.content) {
              displayText = nodeInternal.content;
            } else if (nodeInternal.variableName) {
              displayText = `$${nodeInternal.variableName}`;
            }
            console.log(
              '[usePromptParsing] Display text for node:',
              displayText
            );

            const newNode: Node = {
              id: nodeInternal.id,
              type: nodeType,
              position,
              data: {
                label: displayText,
                text: displayText,
                content: displayText,
                value: displayText, // Add value for BaseEditableNode
                nodeType: nodeType,
                // For Variable nodes, include the variable name
                ...(nodeInternal.variableName && {
                  variableName: nodeInternal.variableName
                }),
                // For Choice nodes, create options
                ...(nodeInternal.nodeType === 'Choice' && {
                  options: [
                    {
                      text: displayText,
                      weight: 100,
                      hasBranch: false
                    }
                  ]
                })
              }
            };

            newNodes.push(newNode);
          }
        );

        // Create edges from analysis
        const analysisEdges = promptAnalysis.edges as
          | AnalysisEdge[]
          | undefined;

        if (analysisEdges && analysisEdges.length > 0) {
          analysisEdges.forEach(edge => {
            newEdges.push({
              id: edge.id || `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
              type: edge.type || 'default'
            });
          });
        } else if (newNodes.length > 1) {
          // If no edges provided, create a simple chain connecting the nodes
          for (let i = 0; i < newNodes.length - 1; i++) {
            newEdges.push({
              id: `edge-${i}`,
              source: newNodes[i].id,
              target: newNodes[i + 1].id,
              type: 'default'
            });
          }
        }

        // Call the callback with created nodes
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
