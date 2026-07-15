import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { PromptDissector } from '../../../../../client/src/components/LaunchScreen/PromptDissector';
import {
  FragmentSlotReview,
  type SlotReviewRow
} from '../../../../../client/src/components/LaunchScreen/FragmentSlotReview';
import type { DraftSlotAnalysis } from '../../../../../client/src/components/LaunchScreen/fragmentSlotTypes';
import { applySlotSelectionsToAnalysis } from '../../../../../client/src/components/LaunchScreen/applySlotSelections';
import { expandFragmentSwapsInGraph } from '../../../../../client/src/components/LaunchScreen/expandFragmentSwaps';
import { PromptAnalysis } from '../../../../../client/src/lib/simplePromptParser';
import { convertAnalysisToGraph } from '../../../../../client/src/lib/analysisToGraph';
import './PromptWizard.css';

export type WizardCompleteMode = 'add' | 'replace';

/** Fragment expand outcome for user-visible status (G3). */
export type WizardFragmentLoadStatus = {
  /** Placeholders that requested a library fragment. */
  attempted: number;
  /** Successfully spliced into the graph. */
  expandedCount: number;
  /** Paths that failed to fetch/parse (left as text). */
  failedPaths: string[];
};

interface PromptWizardProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with graph payload and whether to add to or replace the canvas. */
  onComplete: (
    nodes: Node[],
    edges: Edge[],
    mode: WizardCompleteMode,
    fragmentStatus?: WizardFragmentLoadStatus
  ) => void;
  /** When true, show Add vs Replace instead of a single Create. */
  hasExistingGraph?: boolean;
}

export const PromptWizard: React.FC<PromptWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  hasExistingGraph = false
}) => {
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTutorialTarget, setIsTutorialTarget] = useState(false);
  const [slotRows, setSlotRows] = useState<SlotReviewRow[]>([]);
  const [assembledPreview, setAssembledPreview] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
    setStatusMessage(null);
  }, []);

  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  const draftSlots = useMemo((): DraftSlotAnalysis[] | null => {
    const meta = analysis?.llmMetadata as
      | { slots?: DraftSlotAnalysis[] }
      | undefined;
    return Array.isArray(meta?.slots) ? meta.slots : null;
  }, [analysis]);

  const handleSlotSelectionsChange = useCallback(
    (rows: SlotReviewRow[], preview: string) => {
      setSlotRows(rows);
      setAssembledPreview(preview);
    },
    []
  );

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

  const fragmentSwapAttempted = useMemo(
    () => slotRows.filter(row => row.selection.kind === 'fragment').length,
    [slotRows]
  );

  const buildGraphFromReview = useCallback(async () => {
    if (!analysis) {
      throw new Error('Please enter and analyze a prompt first');
    }

    const reviewed = applySlotSelectionsToAnalysis(analysis, slotRows);
    const { nodes: flowNodes, edges } = convertAnalysisToGraph(reviewed);

    const expanded = await expandFragmentSwapsInGraph(
      flowNodes as Node<Record<string, unknown>>[],
      edges
    );

    if (expanded.failedPaths.length > 0) {
      console.warn(
        '[PromptWizard] Some fragments failed to load and stayed as text:',
        expanded.failedPaths
      );
    }

    const fragmentStatus: WizardFragmentLoadStatus = {
      attempted: fragmentSwapAttempted,
      expandedCount: expanded.expandedCount,
      failedPaths: expanded.failedPaths
    };

    return {
      nodes: expanded.nodes as Node[],
      edges: expanded.edges,
      fragmentStatus
    };
  }, [analysis, fragmentSwapAttempted, slotRows]);

  const formatFragmentStatus = (
    status: WizardFragmentLoadStatus
  ): { type: 'success' | 'warning' | 'error' | 'info'; text: string } | null => {
    if (status.attempted === 0) {
      return {
        type: 'success',
        text: 'Graph created from your prompt (no library fragments selected).'
      };
    }
    if (status.expandedCount > 0 && status.failedPaths.length === 0) {
      return {
        type: 'success',
        text: `Loaded ${status.expandedCount} library fragment${
          status.expandedCount === 1 ? '' : 's'
        } into the graph.`
      };
    }
    if (status.expandedCount > 0 && status.failedPaths.length > 0) {
      const sample = status.failedPaths
        .slice(0, 2)
        .map(p => p.split('/').pop() || p)
        .join(', ');
      return {
        type: 'warning',
        text: `Loaded ${status.expandedCount} fragment(s); ${status.failedPaths.length} failed and stayed as text (${sample}).`
      };
    }
    // attempted > 0, expanded 0
    const sample = status.failedPaths
      .slice(0, 3)
      .map(p => p.split('/').pop() || p)
      .join(', ');
    return {
      type: 'error',
      text: `Could not load selected fragment file(s). Graph uses text placeholders${
        sample ? `: ${sample}` : ''
      }.`
    };
  };

  const finishWithMode = useCallback(
    async (mode: WizardCompleteMode) => {
      if (!analysis) {
        setError('Please enter and analyze a prompt first');
        setStatusMessage(null);
        return;
      }

      setIsCreating(true);
      setError(null);
      setStatusMessage({
        type: 'info',
        text:
          fragmentSwapAttempted > 0
            ? `Building graph and loading ${fragmentSwapAttempted} fragment${
                fragmentSwapAttempted === 1 ? '' : 's'
              }…`
            : 'Building graph…'
      });
      try {
        const result = await buildGraphFromReview();
        const statusUi = formatFragmentStatus(result.fragmentStatus);
        if (statusUi) {
          setStatusMessage(statusUi);
        }

        // Always apply the graph; surface load outcome via status + parent toast.
        onComplete(result.nodes, result.edges, mode, result.fragmentStatus);

        setPromptText('');
        setAnalysis(null);
        setSlotRows([]);
        setAssembledPreview('');
        setStatusMessage(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create nodes');
        setStatusMessage(null);
      } finally {
        setIsCreating(false);
      }
    },
    [analysis, buildGraphFromReview, fragmentSwapAttempted, onComplete]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        void finishWithMode(hasExistingGraph ? 'add' : 'replace');
      }
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [finishWithMode, hasExistingGraph, onClose]
  );

  if (!isOpen) {
    return null;
  }

  const canCreate = Boolean(analysis && promptText.trim() && !isCreating);

  return (
    <div className="prompt-wizard-overlay">
      <div
        className={`prompt-wizard-modal ${isTutorialTarget ? 'tutorial-focus' : ''}`}
        data-tutorial-anchor="wizard-modal"
      >
        <div className="prompt-wizard-header">
          <h2>Prompt Wizard</h2>
          <button className="prompt-wizard-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="prompt-wizard-content" onKeyDown={handleKeyDown}>
          <p className="prompt-wizard-description">
            Enter a prompt below. Review fragment matches, then create a graph.
            Original text stays selected until you swap a library fragment.
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

          {analysis && promptText.trim() && (
            <FragmentSlotReview
              prompt={promptText}
              draftSlots={draftSlots}
              onSelectionsChange={handleSlotSelectionsChange}
            />
          )}

          {assembledPreview && analysis && (
            <p className="prompt-wizard-assembled-hint">
              Graph will expand selected library fragments into real nodes when
              possible.
            </p>
          )}

          {error && (
            <div className="prompt-wizard-error" role="alert">
              {error}
            </div>
          )}

          {statusMessage && !error && (
            <div
              className={`prompt-wizard-status prompt-wizard-status--${statusMessage.type}`}
              role="status"
              data-testid="wizard-fragment-status"
            >
              {statusMessage.text}
            </div>
          )}

          {fragmentSwapAttempted > 0 && analysis && !isCreating && (
            <p className="prompt-wizard-assembled-hint">
              {fragmentSwapAttempted} library fragment
              {fragmentSwapAttempted === 1 ? '' : 's'} selected — Create will
              load their .psg files from the asset library.
            </p>
          )}

          <div className="prompt-wizard-tips">
            <h4>Tips:</h4>
            <ul>
              <li>Use &quot;or&quot; to create weighted choices</li>
              <li>Separate concepts with commas</li>
              <li>
                Swap fragments in the review list — Create loads their PSG graphs
              </li>
              {hasExistingGraph && (
                <li>
                  Canvas has content: choose <strong>Add</strong> or{' '}
                  <strong>Replace</strong>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="prompt-wizard-footer">
          <button className="prompt-wizard-cancel" onClick={onClose}>
            Cancel
          </button>
          {hasExistingGraph ? (
            <>
              <button
                className="prompt-wizard-secondary"
                onClick={() => void finishWithMode('add')}
                disabled={!canCreate}
              >
                {isCreating ? 'Building…' : 'Add to Graph'}
              </button>
              <button
                className="prompt-wizard-analyze"
                onClick={() => void finishWithMode('replace')}
                disabled={!canCreate}
              >
                {isCreating ? 'Building…' : 'Replace Graph'}
              </button>
            </>
          ) : (
            <button
              className="prompt-wizard-analyze"
              onClick={() => void finishWithMode('replace')}
              disabled={!canCreate}
            >
              {isCreating
                ? 'Building…'
                : isAnalyzing
                  ? 'Analyzing...'
                  : analysis
                    ? 'Create Graph'
                    : 'Enter a prompt'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
