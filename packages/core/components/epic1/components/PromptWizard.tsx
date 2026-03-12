import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { PromptDissector } from '../../../../../client/src/components/LaunchScreen/PromptDissector';
import { PromptAnalysis } from '../../../../../client/src/lib/simplePromptParser';
import { convertAnalysisToGraph } from '../../../../../client/src/lib/analysisToGraph';
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
  const [isTutorialTarget, setIsTutorialTarget] = useState(false);

  // Handle analysis from PromptDissector
  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      setIsTutorialTarget(false);
      return;
    }

    const checkTutorial = () => {
      const tutorialStep = document.querySelector('.tutorial-tooltip');
      const targetElement = document.querySelector('.prompt-wizard-modal');
      setIsTutorialTarget(Boolean(tutorialStep && targetElement));
    };

    checkTutorial();

    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(checkTutorial);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  // Convert analysis to nodes and complete
  const handleCreateNodes = useCallback(() => {
    if (!analysis) {
      setError('Please enter and analyze a prompt first');
      return;
    }

    try {
      const { nodes: flowNodes, edges } = convertAnalysisToGraph(analysis);

      onComplete(flowNodes, edges);
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

  if (!isOpen) {
    return null;
  }

  // Check if tutorial is active and targeting this wizard
  return (
    <div className="prompt-wizard-overlay">
      <div
        className={`prompt-wizard-modal ${isTutorialTarget ? 'tutorial-focus' : ''}`}
        data-tutorial-anchor="wizard-modal"
      >
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
              <li>Use &quot;or&quot; to create weighted choices</li>
              <li>Separate concepts with commas</li>
              <li>Add descriptors with &quot;with&quot; or &quot;wearing&quot;</li>
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
