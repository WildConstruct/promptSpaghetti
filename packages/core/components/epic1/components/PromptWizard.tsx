import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { simplePromptParser } from '../../../../../client/src/lib/simplePromptParser';
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
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!promptText.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = simplePromptParser.parse(promptText);
      
      if (analysis && analysis.nodes) {
        // Convert analysis to React Flow nodes and edges
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        
        // Create nodes from analysis
        analysis.nodes.forEach((nodeGen, index) => {
          const node = nodeGen.node;
          nodes.push({
            id: node.id,
            type: node.nodeType === 'WeightedChoice' ? 'weightedChoice' : 
                  node.nodeType === 'Output' ? 'output' : 'textBlock',
            position: { x: 100 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
            data: {
              ...node.data,
              label: node.data.label || node.nodeType
            }
          });
        });

        // Create edges from analysis
        if (analysis.edges) {
          analysis.edges.forEach(edge => {
            edges.push({
              id: `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
              type: 'smoothstep'
            });
          });
        }

        onComplete(nodes, edges);
        setPromptText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze prompt');
    } finally {
      setIsAnalyzing(false);
    }
  }, [promptText, onComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAnalyze();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleAnalyze, onClose]);

  if (!isOpen) return null;

  return (
    <div className="prompt-wizard-overlay">
      <div className="prompt-wizard-modal">
        <div className="prompt-wizard-header">
          <h2>Prompt Wizard</h2>
          <button className="prompt-wizard-close" onClick={onClose}>×</button>
        </div>
        
        <div className="prompt-wizard-content">
          <p className="prompt-wizard-description">
            Enter a prompt and the wizard will automatically create nodes based on the structure.
            Use "or" for variations, commas for separating concepts.
          </p>
          
          <textarea
            className="prompt-wizard-input"
            placeholder="Example: A brave knight or wise wizard, wearing armor or robes, with a sword or staff"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={6}
          />
          
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
            onClick={handleAnalyze}
            disabled={isAnalyzing || !promptText.trim()}
          >
            {isAnalyzing ? 'Analyzing...' : 'Create Nodes'}
          </button>
        </div>
      </div>
    </div>
  );
};