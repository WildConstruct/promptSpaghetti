import React, { useState, useCallback, useEffect } from 'react';
import { PromptDissector } from './PromptDissector';
import { NodePreview } from './NodePreview';
import { QuickActions } from './QuickActions';
import type { PromptAnalysis } from '../../../../packages/core/runtime/nodes/epic1/PromptParser';
import './LaunchScreen.css';

interface LaunchScreenProps {
  onLaunch: (promptAnalysis?: PromptAnalysis) => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onLaunch }) => {
  const [promptText, setPromptText] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle prompt text changes
  const handlePromptChange = useCallback((text: string) => {
    setPromptText(text);
  }, []);

  // Handle analysis results from PromptDissector
  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  // Handle launching the editor
  const handleLaunchEditor = useCallback(() => {
    setIsTransitioning(true);
    
    // Delay to allow animation
    setTimeout(() => {
      onLaunch(analysis || undefined);
    }, 300);
  }, [analysis, onLaunch]);

  // Handle quick action selection
  const handleQuickAction = useCallback((template: string) => {
    setPromptText(template);
    // Trigger analysis of template
  }, []);

  // Handle node selection in preview
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to launch
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && analysis) {
        handleLaunchEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analysis, handleLaunchEditor]);

  return (
    <div className={`launch-screen ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Header */}
      <header className="launch-header">
        <div className="launch-logo">
          <h1>Prompt Spaghetti</h1>
          <p className="launch-tagline">Transform your prompts into powerful node graphs</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="launch-content">
        {/* Left Column - Prompt Input & Dissector */}
        <div className="launch-column launch-column-left">
          <div className="launch-section">
            <h2>Enter Your Prompt</h2>
            <PromptDissector
              value={promptText}
              onChange={handlePromptChange}
              onAnalysisComplete={handleAnalysisComplete}
              selectedNodeId={selectedNodeId}
              placeholder="Type or paste your prompt here... For example: 'A warrior with a sword and shield, wearing armor or leather clothing'"
            />
          </div>
          
          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="analysis-status">
              <div className="analysis-spinner" />
              <span>Analyzing prompt...</span>
            </div>
          )}
        </div>

        {/* Center Column - Node Preview */}
        <div className="launch-column launch-column-center">
          <div className="launch-section">
            <h2>Node Graph Preview</h2>
            <NodePreview
              analysis={analysis}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          </div>
          
          {/* Launch Button */}
          <div className="launch-actions">
            <button
              className="launch-button-primary"
              onClick={handleLaunchEditor}
              disabled={!analysis || analysis.nodes.length === 0}
            >
              {analysis && analysis.nodes.length > 0
                ? `Launch Editor with ${analysis.nodes.length} Nodes`
                : 'Enter a prompt to begin'}
            </button>
            <span className="launch-hint">
              or press <kbd>⌘</kbd> + <kbd>Enter</kbd>
            </span>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="launch-column launch-column-right">
          <div className="launch-section">
            <h2>Quick Start Templates</h2>
            <QuickActions onSelectTemplate={handleQuickAction} />
          </div>
          
          {/* Tips */}
          <div className="launch-tips">
            <h3>Pro Tips</h3>
            <ul>
              <li>Use "or" to create variations</li>
              <li>Separate concepts with commas</li>
              <li>Add descriptors with "with" or "wearing"</li>
              <li>Drag nodes in the preview to rearrange</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="launch-footer">
        <button
          className="skip-button"
          onClick={() => onLaunch()}
        >
          Skip to Editor →
        </button>
      </footer>
    </div>
  );
};