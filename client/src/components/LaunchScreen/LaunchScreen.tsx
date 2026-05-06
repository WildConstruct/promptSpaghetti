import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getSupabase } from '@promptscape/core/utils/supabaseClient';
import { AuthModal } from '../AuthModal';

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
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFamilyPreviewOpen, setIsFamilyPreviewOpen] = useState(false);

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

  // Supabase auth session
  useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      setAuthEmail(data.session?.user?.email ?? null);
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthEmail(session?.user?.email ?? null);
      });
      unsub = listener.data as { subscription: { unsubscribe: () => void } };
    })();
    return () => {
      try {
        unsub?.subscription?.unsubscribe();
      } catch {
        return;
      }
    };
  }, []);

  const hasSupabase = useMemo(() => Boolean(getSupabase()), []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  }, []);

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

  const selectedPreviewRole = useMemo(() => {
    const selectedNode = mergedAnalysis?.nodes.find(
      node => node.node.id === selectedNodeId
    )?.node;

    if (!selectedNode) {
      return null;
    }

    if (
      selectedNode.nodeType === 'Choice' ||
      selectedNode.nodeType === 'Variable'
    ) {
      return 'Allowed variation';
    }

    if (selectedNode.nodeType === 'Output') {
      return 'Resolved result';
    }

    return 'Fixed DNA';
  }, [mergedAnalysis, selectedNodeId]);

  const familySnapshot = useMemo(() => {
    if (!mergedAnalysis) {
      return null;
    }

    const cleanPart = (value: string): string =>
      value
        .replace(/\s+/g, ' ')
        .replace(/\s+([,./])/g, '$1')
        .trim();

    const pushUnique = (target: string[], value: string) => {
      const cleaned = cleanPart(value);
      if (!cleaned) {
        return;
      }
      if (!target.includes(cleaned)) {
        target.push(cleaned);
      }
    };

    const fixedTraits: string[] = [];
    const variableTraits: string[] = [];
    const resolvedParts: string[] = [];

    const naturalJoin = (parts: string[]): string => {
      if (parts.length === 0) {
        return '';
      }
      if (parts.length === 1) {
        return parts[0];
      }
      if (parts.length === 2) {
        return `${parts[0]} and ${parts[1]}`;
      }
      return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
    };

    mergedAnalysis.nodes.forEach(({ node }) => {
      if (node.nodeType === 'Output') {
        return;
      }

      const data =
        typeof node.data === 'object' && node.data !== null
          ? (node.data as Record<string, unknown>)
          : {};
      const preview =
        typeof node.getPreviewText === 'function'
          ? node.getPreviewText()
          : typeof data.label === 'string'
            ? data.label
            : '';

      if (node.nodeType === 'Choice') {
        const options = Array.isArray(data.options)
          ? data.options
              .map(option =>
                typeof option === 'string'
                  ? option
                  : typeof option === 'object' &&
                      option !== null &&
                      typeof (option as Record<string, unknown>).text ===
                        'string'
                    ? ((option as Record<string, unknown>).text as string)
                    : null
              )
              .filter((option): option is string => Boolean(option))
          : [];
        const example = options[0] || preview;
        pushUnique(variableTraits, preview);
        if (example) {
          pushUnique(resolvedParts, example);
        }
        return;
      }

      if (node.nodeType === 'Variable') {
        pushUnique(variableTraits, preview);
        if (preview) {
          pushUnique(resolvedParts, preview);
        }
        return;
      }

      if (preview) {
        pushUnique(fixedTraits, preview);
        pushUnique(resolvedParts, preview);
      }
    });

    const anchor = fixedTraits[0] || resolvedParts[0] || '';
    const supportingFixed = fixedTraits.slice(1);
    const supportingVariable = variableTraits.slice(0, 2);
    const supportingResolved = resolvedParts.filter(part => part !== anchor);

    let exampleMember = '';

    if (anchor) {
      const clauses: string[] = [];
      const fixedClause = naturalJoin(supportingFixed);
      const variableClause = naturalJoin(supportingVariable);

      if (fixedClause) {
        clauses.push(fixedClause);
      }
      if (variableClause) {
        clauses.push(`with ${variableClause}`);
      } else if (supportingResolved.length > 0) {
        clauses.push(`with ${naturalJoin(supportingResolved.slice(0, 2))}`);
      }

      exampleMember =
        clauses.length > 0 ? `${anchor}, ${clauses.join(', ')}.` : `${anchor}.`;
    }

    return {
      fixedTraits,
      variableTraits,
      resolvedPreview: exampleMember
    };
  }, [mergedAnalysis]);

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
      if (templateId === 'empty') {
        setIsTransitioning(true);
        setIsAnalyzing(false);
        setSelectedNodeId(null);
        setPromptText('');
        setTimeout(() => {
          onLaunch({ kind: 'empty' });
        }, 300);
        return;
      }

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
          <span
            className="launch-logo-mark"
            role="img"
            aria-label="Prompt Spaghetti"
          />
          <p className="launch-tagline">
            PSG-first authoring for reusable archetypes, locked design DNA, and
            controlled variation.
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
          {/* Auth Controls */}
          {hasSupabase ? (
            authEmail ? (
              <button
                className="tutorial-button"
                onClick={signOut}
                title={`Signed in as ${authEmail}`}
              >
                Sign out
              </button>
            ) : (
              <button
                className="tutorial-button"
                onClick={() => setIsAuthModalOpen(true)}
                title="Sign in"
              >
                Sign in
              </button>
            )
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <div
        className={`launch-content ${
          isFamilyPreviewOpen
            ? 'family-preview-open'
            : 'family-preview-collapsed'
        }`}
      >
        {/* Left Column - Prompt Input & Dissector */}
        <div className="launch-column launch-column-left">
          <div className="launch-section">
            <h2>Define The Archetype DNA</h2>
            <p className="launch-section-copy">
              Start from a reusable family idea, then let Prompt Spaghetti break
              it into stable DNA and bounded variation.
            </p>
            <PromptDissectorErrorBoundary>
              <PromptDissector
                value={promptText}
                onChange={handlePromptChange}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisStart={() => setIsAnalyzing(true)}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleNodeSelect}
                focusOnValueChange
                placeholder="Type or paste an archetype prompt... For example: 'A late-70s compact sedan with practical trim, fixed era cues, and controlled variation in color, wheels, and wear level'"
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
          <div
            className={`launch-section preview-section ${
              isFamilyPreviewOpen ? 'expanded' : 'collapsed'
            }`}
          >
            <div className="preview-section-header">
              <div>
                <h2>Family Logic Preview</h2>
                {!isFamilyPreviewOpen && (
                  <p className="launch-section-copy compact">
                    Hidden until you need to inspect the generated graph pass.
                  </p>
                )}
              </div>
              <button
                type="button"
                className="launch-button-secondary preview-toggle-button"
                onClick={() => setIsFamilyPreviewOpen(open => !open)}
              >
                {isFamilyPreviewOpen ? 'Collapse' : 'Show Preview'}
              </button>
            </div>
            {isFamilyPreviewOpen && (
              <>
                <p className="launch-section-copy">
                  Review the first pass of graph logic before you enter the
                  editor, then decide what stays fixed and what can vary.
                </p>
                <NodePreview
                  analysis={mergedAnalysis}
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNodeId}
                />
              </>
            )}
          </div>

          {/* Node Actions are now persistent and placed near Launch Editor */}

          {/* Launch Button */}
          <div className="launch-actions">
            <button
              className="launch-button-primary"
              onClick={handleLaunchEditor}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Build PSG Family Graph'}
            </button>
            <span className="launch-hint">
              or press <kbd>Ctrl/Cmd</kbd> + <kbd>Enter</kbd>
            </span>

            <div className="launch-inline-actions">
              <div className="launch-inline-instruction">
                Select a trait in the preview, then decide whether it stays
                fixed DNA or becomes allowed variation.
              </div>
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
                      title="Keep this trait stable across the whole family"
                    >
                      Mark Fixed
                    </button>
                    <button
                      className="launch-button-secondary"
                      onClick={() => applyNodeType('Choice')}
                      disabled={disabled}
                      title="Let this trait vary within the family"
                    >
                      Allow Variation
                    </button>
                    <button
                      className="launch-button-tertiary"
                      onClick={resetNodeOverride}
                      disabled={disabled}
                    >
                      Reset
                    </button>
                    {selectedPreviewRole && (
                      <span className="launch-selection-role">
                        Selected node: {selectedPreviewRole}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {selectedPreviewRole && selectedNodeId && (
            <div className="launch-role-helper" aria-live="polite">
              {selectedPreviewRole === 'Fixed DNA'
                ? 'This trait now reads as part of the stable family DNA.'
                : selectedPreviewRole === 'Allowed variation'
                  ? 'This trait now reads as something that can change across in-family outputs.'
                  : 'This node resolves a deterministic family member preview.'}
            </div>
          )}

          {familySnapshot && (
            <div
              className="launch-family-snapshot"
              aria-label="Family snapshot"
            >
              <div className="launch-family-column">
                <span className="launch-family-heading">Fixed DNA</span>
                <div className="launch-family-tags">
                  {familySnapshot.fixedTraits.length > 0 ? (
                    familySnapshot.fixedTraits.map(trait => (
                      <span
                        key={`fixed-${trait}`}
                        className="launch-family-tag fixed"
                      >
                        {trait}
                      </span>
                    ))
                  ) : (
                    <span className="launch-family-empty">
                      Mark a node as fixed to lock the family identity.
                    </span>
                  )}
                </div>
              </div>
              <div className="launch-family-column">
                <span className="launch-family-heading">Allowed Variation</span>
                <div className="launch-family-tags">
                  {familySnapshot.variableTraits.length > 0 ? (
                    familySnapshot.variableTraits.map(trait => (
                      <span
                        key={`variable-${trait}`}
                        className="launch-family-tag variable"
                      >
                        {trait}
                      </span>
                    ))
                  ) : (
                    <span className="launch-family-empty">
                      Move traits here when you want bounded family variation.
                    </span>
                  )}
                </div>
              </div>
              <div className="launch-family-column resolved">
                <span className="launch-family-heading">
                  Example Family Member
                </span>
                <span className="launch-family-kicker">
                  One believable in-family output
                </span>
                <p className="launch-family-preview">
                  {familySnapshot.resolvedPreview ||
                    'Your resolved family member will appear here once the archetype is parsed.'}
                </p>
                <p className="launch-family-subtle">
                  Move a trait between fixed DNA and allowed variation, then
                  watch this rewrite as one in-family output.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="launch-column launch-column-right">
          <div className="launch-section">
            <h2>Quick Start Family Graphs</h2>
            <p className="launch-section-copy">
              Use the primary demos for the cleanest archetype-first
              walkthrough, then reach for advanced or manual starts only when
              you need them.
            </p>
            <QuickActions onSelectTemplate={handleQuickAction} />
          </div>

          {/* Tips */}
          <div className="launch-tips">
            <h3>Pro Tips</h3>
            <ul>
              <li>
                Start with a quick-start family graph when you want the cleanest
                MVP walkthrough
              </li>
              <li>
                Use prompt bootstrap when you want a first PSG graph drafted
                from text
              </li>
              <li>
                Lock shared traits first, then make only the details you want
                variable
              </li>
              <li>
                Treat Comfy export as the main downstream handoff and sidecar
                tools as advanced follow-on work
              </li>
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
          Open Blank Editor -&gt;
        </button>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
