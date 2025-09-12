import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { PromptDissector } from '../../../../../client/src/components/LaunchScreen/PromptDissector';
import { PromptAnalysis } from '../../../../../client/src/lib/simplePromptParser';
import './PromptWizard.css';

interface PromptWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (nodes: Node[], edges: Edge[]) => void;
}

export const PromptWizard: React.FC<PromptWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle analysis from PromptDissector
  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  // Convert analysis to nodes and complete
  const handleCreateNodes = useCallback(() => {
    if (!analysis) {
      setError('Please enter and analyze a prompt first');
      return;
    }

    try {
      // Convert analysis to React Flow nodes and edges
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      // Create nodes from analysis
      let hasOutputNode = false;
      analysis.nodes.forEach((nodeGen, index) => {
        const node = nodeGen.node;
        if (node.nodeType === 'Output') {
          hasOutputNode = true;
        }
        nodes.push({
          id: node.id,
          type: node.nodeType === 'WeightedChoice' ? 'weightedChoice' : 
                node.nodeType === 'Output' ? 'output' : 'textBlock',
          position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            ...node.data,
            label: node.data.label || node.nodeType
          }
        });
      });

      // Ensure there's an Output node
      if (!hasOutputNode) {
        const outputNode = {
          id: 'output',
          type: 'output',
          position: { x: 100 + (nodes.length % 3) * 250, y: 100 + Math.floor(nodes.length / 3) * 150 },
          data: {
            label: 'Output'
          }
        };
        nodes.push(outputNode);
      }

      // Create edges from analysis
      const connectedNodes = new Set<string>();
      if (analysis.edges) {
        analysis.edges.forEach(edge => {
          edges.push({
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep'
          });
          connectedNodes.add(edge.source);
          connectedNodes.add(edge.target);
        });
      }

      // Connect any unconnected nodes to the Output node
      nodes.forEach(node => {
        if (node.type !== 'output' && !connectedNodes.has(node.id)) {
          edges.push({
            id: `${node.id}-output`,
            source: node.id,
            target: 'output',
            type: 'smoothstep'
          });
        }
      });

      onComplete(nodes, edges);
      setPromptText('');
      setAnalysis(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create nodes');
    }
  }, [analysis, onComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCreateNodes();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleCreateNodes, onClose]);

  if (!isOpen) return null;

  return (
    <div className="prompt-wizard-overlay">
      <div className="prompt-wizard-modal">
        <div className="prompt-wizard-header">
          <h2>Prompt Wizard</h2>
          <button className="prompt-wizard-close" onClick={onClose}>×</button>
        </div>
        
        <div className="prompt-wizard-content" onKeyDown={handleKeyDown}>
          <p className="prompt-wizard-description">
            Enter a prompt below. The text will be automatically parsed and highlighted to show how it will be converted into nodes.
            Click on highlighted segments to modify them.
          </p>
          
          <div className="prompt-wizard-dissector-wrapper">
            <PromptDissector
              value={promptText}
              onChange={setPromptText}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              placeholder="Example: A brave knight or wise wizard, wearing armor or robes, with a sword or staff"
              focusOnValueChange
            />
          </div>
          
          {error && (
            <div className="prompt-wizard-error">{error}</div>
          )}
          
          <div className="prompt-wizard-tips">
            <h4>Tips:</h4>
            <ul>
              <li>Use "or" to create weighted choices</li>
              <li>Separate concepts with commas</li>
              <li>Add descriptors with "with" or "wearing"</li>
              <li>Press Ctrl+Enter to analyze</li>
            </ul>
          </div>
        </div>
        
        <div className="prompt-wizard-footer">
          <button className="prompt-wizard-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="prompt-wizard-analyze" 
            onClick={handleCreateNodes}
            disabled={!analysis || !promptText.trim()}
          >
            {isAnalyzing ? 'Analyzing...' : analysis ? 'Create Nodes' : 'Enter a prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};