import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PromptDissector } from './PromptDissector';
import { NodePreview } from './NodePreview';
import { QuickActions } from './QuickActions';
import type { PromptAnalysis } from '../../lib/simplePromptParser';
import type { Node, Edge } from 'reactflow';
import { quickStartTemplates } from '../../templates/quickStartTemplates';
import './LaunchScreen.css';

export type LaunchPayload =
  | { kind: 'analysis'; analysis: PromptAnalysis }
  | { kind: 'template'; graph: { nodes: Node[]; edges: Edge[] } }
  | { kind: 'empty' };

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
  const [stagedOverrides, setStagedOverrides] = useState<Record<string, { nodeType: 'Text' | 'Choice' }>>({});
  const [appliedOverrides, setAppliedOverrides] = useState<Record<string, { nodeType: 'Text' | 'Choice' }>>({});
  const isDirty = useMemo(() => JSON.stringify(stagedOverrides) !== JSON.stringify(appliedOverrides), [stagedOverrides, appliedOverrides]);

  // Handle prompt text changes
  const handlePromptChange = useCallback((text: string) => {
    const trimmed = text.trim();
    setPromptText(text);
    
    // Clear analysis when prompt is cleared
    if (trimmed.length === 0) {
      setAnalysis(null);
      setIsAnalyzing(false);
      setSelectedNodeId(null);
      setStagedOverrides({});
      setAppliedOverrides({});
    } else {
      setIsAnalyzing(true);
    }
  }, []);

  // Handle analysis results from PromptDissector
  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  // merge overrides into analysis so UI and launch use the swapped types
  const mergedAnalysis = useMemo(() => {
    if (!analysis) return null;
    const newNodes = analysis.nodes.map((gen) => {
      const ov = appliedOverrides[gen.node.id];
      if (!ov) return gen;
      return {
        node: {
          ...gen.node,
          nodeType: ov.nodeType,
        },
      };
    });
    return { ...analysis, nodes: newNodes } as PromptAnalysis;
  }, [analysis, appliedOverrides]);

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

  // Handle quick action selection
  const handleQuickAction = useCallback((templateId: string) => {
    // Launch directly with a prebuilt graph
    const tmpl = quickStartTemplates[templateId];
    if (!tmpl) return;
    setIsTransitioning(true);
    setIsAnalyzing(false);
    setSelectedNodeId(null);
    setPromptText('');
    setTimeout(() => {
      onLaunch({ kind: 'template', graph: { nodes: tmpl.nodes, edges: tmpl.edges } });
    }, 300);
  }, [onLaunch]);

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
  const applyNodeType = useCallback((type: 'Text' | 'Choice') => {
    if (!selectedNodeId) return;
    if (selectedNodeId === 'output') return; // don't edit Output node
    setStagedOverrides((prev) => ({
      ...prev,
      [selectedNodeId]: {
        nodeType: type,
      },
    }));
  }, [selectedNodeId]);

  // Variable name change handler removed - no longer supporting Variables

  const resetNodeOverride = useCallback(() => {
    if (!selectedNodeId) return;
    if (selectedNodeId === 'output') return; // don't edit Output node
    setStagedOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedNodeId!];
      return next;
    });
  }, [selectedNodeId]);

  // apply staged overrides -> preview
  const handleApplyOverrides = useCallback(() => {
    setAppliedOverrides(stagedOverrides);
  }, [stagedOverrides]);

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
              focusOnValueChange
              placeholder="Type or paste your prompt here... For example: 'A warrior with a sword and shield, wearing armor or leather clothing'"
            />
            {isDirty && (
              <div className="update-banner">
                <span className="update-indicator" aria-hidden>●</span>
                <span>Changes to node types or variables are pending.</span>
                <button className="launch-button-secondary" onClick={handleApplyOverrides}>
                  Update Prompt
                </button>
              </div>
            )}
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
          <div className={`launch-section preview-section ${isDirty ? 'needs-update' : ''}`}>
            <h2>Node Graph Preview</h2>
            <NodePreview
              analysis={mergedAnalysis}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          </div>

          {/* Node Actions for selected node */}
          {selectedNodeId && mergedAnalysis && (() => {
            const sel = mergedAnalysis.nodes.find(n => n.node.id === selectedNodeId)?.node;
            if (!sel || sel.nodeType === 'Output') return null; // hide actions for Output
            return (
            <div className="node-actions">
              <h3>Node Actions</h3>
              <div className="node-actions-row">
                <button className="launch-button-secondary" onClick={() => applyNodeType('Text')}>Make Text</button>
                <button className="launch-button-secondary" onClick={() => applyNodeType('Choice')}>Make Choice</button>
                <button className="launch-button-tertiary" onClick={resetNodeOverride}>Reset</button>
              </div>
            </div>
            );
          })()}
          
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
              <li>Add descriptors with &quot;with&quot; or &quot;wearing&quot;</li>
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