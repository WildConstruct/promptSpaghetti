import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PromptDissector } from './PromptDissector';
import { PromptDissectorErrorBoundary } from './PromptDissectorErrorBoundary';
import { NodePreview } from './NodePreview';
import { QuickActions } from './QuickActions';
import type { PromptAnalysis } from '../../lib/simplePromptParser';
import type { Node, Edge } from 'reactflow';
import { quickStartTemplates } from '../../templates/quickStartTemplates';
import './LaunchScreen.css';

export type LaunchPayload =
  | { kind: 'analysis'; analysis: PromptAnalysis }
  | { kind: 'template'; graph: { nodes: Node[]; edges: Edge[] } }
  | { kind: 'empty' }
  | { kind: 'tutorial' };

interface LaunchScreenProps {
  onLaunch: (payload: LaunchPayload) => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onLaunch }) => {
  const [promptText, setPromptText] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // node overrides
  const [nodeOverrides, setNodeOverrides] = useState<
    Record<string, { nodeType: 'Text' | 'Choice' }>
  >({});

  // Handle prompt text changes
  const handlePromptChange = useCallback((text: string) => {
    const trimmed = text.trim();
    setPromptText(text);

    // Clear analysis when prompt is cleared
    if (trimmed.length === 0) {
      setAnalysis(null);
      setIsAnalyzing(false);
      setSelectedNodeId(null);
      setNodeOverrides({});
    }
    // Don't automatically set isAnalyzing - let PromptDissector control when analysis starts
  }, []);

  // Handle analysis results from PromptDissector
  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  // merge overrides into analysis so UI and launch use the swapped types
  const mergedAnalysis = useMemo(() => {
    if (!analysis) {
      return null;
    }
    const newNodes = analysis.nodes.map(gen => {
      const ov = nodeOverrides[gen.node.id];
      if (!ov) {
        return gen;
      }
      return {
        node: {
          ...gen.node,
          nodeType: ov.nodeType
        }
      };
    });
    return { ...analysis, nodes: newNodes } as PromptAnalysis;
  }, [analysis, nodeOverrides]);

  // Handle launching the editor
  const handleLaunchEditor = useCallback(() => {
    setIsTransitioning(true);

    // Delay to allow animation
    setTimeout(() => {
      if (mergedAnalysis) {
        onLaunch({ kind: 'analysis', analysis: mergedAnalysis });
      } else {
        onLaunch({ kind: 'empty' });
      }
    }, 300);
  }, [mergedAnalysis, onLaunch]);

  // Handle launching with tutorial
  const handleLaunchTutorial = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      onLaunch({ kind: 'tutorial' });
    }, 300);
  }, [onLaunch]);

  // Handle quick action selection
  const handleQuickAction = useCallback(
    (templateId: string) => {
      // Launch directly with a prebuilt graph
      const tmpl = quickStartTemplates[templateId];
      if (!tmpl) {
        return;
      }
      setIsTransitioning(true);
      setIsAnalyzing(false);
      setSelectedNodeId(null);
      setPromptText('');
      setTimeout(() => {
        onLaunch({
          kind: 'template',
          graph: { nodes: tmpl.nodes, edges: tmpl.edges }
        });
      }, 300);
    },
    [onLaunch]
  );

  // Handle node selection in preview
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to launch
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && mergedAnalysis) {
        handleLaunchEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mergedAnalysis, handleLaunchEditor]);

  // node actions: swap type helpers
  const applyNodeType = useCallback(
    (type: 'Text' | 'Choice') => {
      if (!selectedNodeId) {
        return;
      }
      if (selectedNodeId === 'output') {
        return; // don't edit Output node
      }
      setNodeOverrides(prev => ({
        ...prev,
        [selectedNodeId]: {
          nodeType: type
        }
      }));
    },
    [selectedNodeId]
  );

  // Variable name change handler removed - no longer supporting Variables

  const resetNodeOverride = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }
    if (selectedNodeId === 'output') {
      return; // don't edit Output node
    }
    setNodeOverrides(prev => {
      const next = { ...prev };
      const nodeId = selectedNodeId;
      if (nodeId) {
        delete next[nodeId];
      }
      return next;
    });
  }, [selectedNodeId]);

  return (
    <div className={`launch-screen ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Header */}
      <header className="launch-header">
        <div className="launch-logo">
          <img
            src="/images/PromptSpaghettiLogo.png"
            alt="Prompt Spaghetti"
            className="launch-logo-image"
          />
          <p className="launch-tagline">
            Transform your prompts into powerful node graphs
          </p>
        </div>
        <div className="launch-header-actions">
          <button
            className="tutorial-button"
            onClick={handleLaunchTutorial}
            title="Start the interactive tutorial"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ marginRight: '8px' }}
            >
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z" />
            </svg>
            Start Tutorial
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="launch-content">
        {/* Left Column - Prompt Input & Dissector */}
        <div className="launch-column launch-column-left">
          <div className="launch-section">
            <h2>Enter Your Prompt</h2>
            <PromptDissectorErrorBoundary>
              <PromptDissector
                value={promptText}
                onChange={handlePromptChange}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisStart={() => setIsAnalyzing(true)}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleNodeSelect}
                focusOnValueChange
                placeholder="Type or paste your prompt here... For example: 'A warrior with a sword and shield, wearing armor or leather clothing'"
              />
            </PromptDissectorErrorBoundary>
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="analysis-status" role="status" aria-live="polite">
              <div className="analysis-spinner" />
              <span>Analyzing prompt...</span>
            </div>
          )}
        </div>

        {/* Center Column - Node Preview */}
        <div className="launch-column launch-column-center">
          <div className="launch-section preview-section">
            <h2>Node Graph Preview</h2>
            <NodePreview
              analysis={mergedAnalysis}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          </div>

          {/* Node Actions are now persistent and placed near Launch Editor */}

          {/* Launch Button */}
          <div className="launch-actions">
            <button
              className="launch-button-primary"
              onClick={handleLaunchEditor}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing…' : 'Launch Editor'}
            </button>
            <span className="launch-hint">
              or press <kbd>⌘</kbd> + <kbd>Enter</kbd>
            </span>

            <div className="launch-inline-actions">
              {(() => {
                const selNode = mergedAnalysis?.nodes.find(
                  n => n.node.id === selectedNodeId
                )?.node;
                const disabled =
                  !selectedNodeId || !selNode || selNode.nodeType === 'Output';
                return (
                  <div className="launch-inline-actions-row">
                    <button
                      className="launch-button-secondary"
                      onClick={() => applyNodeType('Text')}
                      disabled={disabled}
                    >
                      Make Text
                    </button>
                    <button
                      className="launch-button-secondary"
                      onClick={() => applyNodeType('Choice')}
                      disabled={disabled}
                    >
                      Make Choice
                    </button>
                    <button
                      className="launch-button-tertiary"
                      onClick={resetNodeOverride}
                      disabled={disabled}
                    >
                      Reset
                    </button>
                  </div>
                );
              })()}
            </div>
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
              <li>Use &quot;or&quot; to create variations</li>
              <li>Separate concepts with commas</li>
              <li>
                Add descriptors with &quot;with&quot; or &quot;wearing&quot;
              </li>
              <li>Drag nodes in the preview to rearrange</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="launch-footer">
        <button
          className="skip-button"
          onClick={() => onLaunch({ kind: 'empty' })}
        >
          Skip to Editor →
        </button>
      </footer>
    </div>
  );
};
