/**
 * Review-first fragment swap panel for Prompt Wizard.
 * Grok/heuristic proposes slots; user picks original text or a library candidate.
 * Does not mutate the canvas until Create Graph.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  matchFragmentsForSlots,
  type FragmentMatchCandidate,
  type MatchableFragment
} from '@promptscape/core/runtime/prompting/slotFragmentMatch';
import {
  slotsFromSegments,
  type SlotType
} from '@promptscape/core/runtime/prompting/slotClassification';
import { segmentPrompt } from '@promptscape/core/runtime/prompting/PromptSegmentation';
import { AgentFragmentRetrievalService } from '@prompt/asset-browser';
import type { DraftSlotAnalysis } from './fragmentSlotTypes';
import './FragmentSlotReview.css';

export type SlotSelection =
  | { kind: 'original' }
  | { kind: 'fragment'; candidate: FragmentMatchCandidate }
  | { kind: 'none' };

export type SlotReviewRow = {
  slot: DraftSlotAnalysis;
  candidates: FragmentMatchCandidate[];
  selection: SlotSelection;
};

export type FragmentSlotReviewProps = {
  prompt: string;
  /** Slots from draft-graph response when present. */
  draftSlots?: DraftSlotAnalysis[] | null;
  onSelectionsChange?: (
    rows: SlotReviewRow[],
    assembledPreview: string
  ) => void;
};

function normalizeDraftSlots(
  prompt: string,
  draftSlots?: DraftSlotAnalysis[] | null
): DraftSlotAnalysis[] {
  if (Array.isArray(draftSlots) && draftSlots.length > 0) {
    return draftSlots.map((slot, index) => ({
      id: slot.id || `slot-${index + 1}`,
      sourceText: slot.sourceText,
      startIndex: slot.startIndex,
      endIndex: slot.endIndex,
      slotType: (slot.slotType || 'unknown') as SlotType,
      domainHints: slot.domainHints || [],
      toneHints: slot.toneHints || [],
      classificationConfidence:
        typeof slot.classificationConfidence === 'number'
          ? slot.classificationConfidence
          : 0.5,
      segmentKind: slot.segmentKind
    }));
  }

  // Client-side heuristic fallback when draft omitted slots
  const { segments } = segmentPrompt(prompt);
  return slotsFromSegments(segments) as DraftSlotAnalysis[];
}

function selectionLabel(selection: SlotSelection, original: string): string {
  if (selection.kind === 'fragment') {
    return selection.candidate.name;
  }
  if (selection.kind === 'none') {
    return '';
  }
  return original;
}

export const FragmentSlotReview: React.FC<FragmentSlotReviewProps> = ({
  prompt,
  draftSlots,
  onSelectionsChange
}) => {
  const [library, setLibrary] = useState<MatchableFragment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingLib, setLoadingLib] = useState(true);
  const [rows, setRows] = useState<SlotReviewRow[]>([]);
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>(
    {}
  );

  const slots = useMemo(
    () => normalizeDraftSlots(prompt, draftSlots),
    [prompt, draftSlots]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingLib(true);
    AgentFragmentRetrievalService.loadIndex()
      .then(records => {
        if (cancelled) return;
        setLibrary(
          records.map(r => ({
            id: r.id,
            name: r.name,
            path: r.path,
            slotTypes: r.slotTypes,
            domains: r.domains,
            tone: r.tone,
            tags: r.tags,
            roles: r.roles,
            category: r.category,
            userCreated: r.userCreated,
            suggestionWeight: r.suggestionWeight,
            priority: r.priority
          }))
        );
        setLoadError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load fragment library'
        );
        setLibrary([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLib(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Rebuild rows when slots or library change (preserve selections by slot id)
  useEffect(() => {
    setRows(prev => {
      const prevById = new Map(prev.map(r => [r.slot.id, r.selection]));
      const matchMap = matchFragmentsForSlots(
        slots.map(s => ({
          id: s.id,
          slotType: s.slotType,
          sourceText: s.sourceText,
          domainHints: s.domainHints,
          toneHints: s.toneHints
        })),
        library,
        3
      );

      return slots.map(slot => {
        const candidates = matchMap[slot.id] || [];
        const previous = prevById.get(slot.id);
        let selection: SlotSelection = { kind: 'original' };
        if (previous?.kind === 'fragment') {
          const stillThere = candidates.find(
            c => c.fragmentId === previous.candidate.fragmentId
          );
          selection = stillThere
            ? { kind: 'fragment', candidate: stillThere }
            : { kind: 'original' };
        } else if (previous?.kind === 'none') {
          selection = { kind: 'none' };
        }
        return { slot, candidates, selection };
      });
    });
  }, [slots, library]);

  const assembledPreview = useMemo(() => {
    return rows
      .map(row => selectionLabel(row.selection, row.slot.sourceText))
      .filter(Boolean)
      .join(', ');
  }, [rows]);

  useEffect(() => {
    onSelectionsChange?.(rows, assembledPreview);
  }, [rows, assembledPreview, onSelectionsChange]);

  const setSelection = useCallback((slotId: string, selection: SlotSelection) => {
    setRows(current =>
      current.map(row =>
        row.slot.id === slotId ? { ...row, selection } : row
      )
    );
  }, []);

  const toggleReasons = useCallback((slotId: string) => {
    setExpandedReasons(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  }, []);

  if (!prompt.trim()) {
    return null;
  }

  return (
    <div className="fragment-slot-review" data-testid="fragment-slot-review">
      <div className="fragment-slot-review__header">
        <h3>Fragment review</h3>
        <p>
          Original text stays selected by default. Swap a library fragment only
          when you want to replace that slot — nothing hits the canvas until you
          create the graph.
        </p>
      </div>

      <div className="fragment-slot-review__prompt" aria-label="Source prompt">
        {prompt}
      </div>

      {loadingLib && (
        <div className="fragment-slot-review__status">Loading fragment library…</div>
      )}
      {loadError && (
        <div className="fragment-slot-review__status fragment-slot-review__status--error">
          {loadError} — you can still create the graph from original text.
        </div>
      )}

      <div className="fragment-slot-review__rows" role="list">
        {rows.map(row => {
          const { slot, candidates, selection } = row;
          const confPct = Math.round(
            (slot.classificationConfidence || 0) * 100
          );
          return (
            <div
              key={slot.id}
              className="fragment-slot-row"
              role="listitem"
              data-slot-id={slot.id}
            >
              <div className="fragment-slot-row__meta">
                <span className="fragment-slot-row__type">{slot.slotType}</span>
                {slot.domainHints && slot.domainHints.length > 0 && (
                  <span className="fragment-slot-row__domains">
                    {slot.domainHints.join(' · ')}
                  </span>
                )}
                <span className="fragment-slot-row__conf">{confPct}%</span>
              </div>

              <div className="fragment-slot-row__source">{slot.sourceText}</div>

              <div
                className="fragment-slot-row__choices"
                role="radiogroup"
                aria-label={`Choices for ${slot.slotType}`}
              >
                <label
                  className={`fragment-slot-choice${
                    selection.kind === 'original' ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`slot-${slot.id}`}
                    checked={selection.kind === 'original'}
                    onChange={() =>
                      setSelection(slot.id, { kind: 'original' })
                    }
                  />
                  <span className="fragment-slot-choice__label">
                    Original
                    <em>{slot.sourceText}</em>
                  </span>
                </label>

                {candidates.length === 0 && (
                  <div className="fragment-slot-row__no-match">
                    No library match
                  </div>
                )}

                {candidates.map(candidate => {
                  const selected =
                    selection.kind === 'fragment' &&
                    selection.candidate.fragmentId === candidate.fragmentId;
                  return (
                    <label
                      key={candidate.fragmentId}
                      className={`fragment-slot-choice${
                        selected ? ' is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`slot-${slot.id}`}
                        checked={selected}
                        onChange={() =>
                          setSelection(slot.id, {
                            kind: 'fragment',
                            candidate
                          })
                        }
                      />
                      <span className="fragment-slot-choice__label">
                        {candidate.name}
                        {candidate.userCreated && (
                          <span className="fragment-slot-choice__user">user</span>
                        )}
                        <button
                          type="button"
                          className="fragment-slot-choice__why"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleReasons(`${slot.id}:${candidate.fragmentId}`);
                          }}
                        >
                          why?
                        </button>
                      </span>
                      {expandedReasons[`${slot.id}:${candidate.fragmentId}`] && (
                        <ul className="fragment-slot-choice__reasons">
                          {candidate.reasons.map(reason => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </label>
                  );
                })}

                <label
                  className={`fragment-slot-choice fragment-slot-choice--mute${
                    selection.kind === 'none' ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`slot-${slot.id}`}
                    checked={selection.kind === 'none'}
                    onChange={() => setSelection(slot.id, { kind: 'none' })}
                  />
                  <span className="fragment-slot-choice__label">
                    Skip slot
                  </span>
                </label>
              </div>

              {selection.kind === 'fragment' && (
                <button
                  type="button"
                  className="fragment-slot-row__restore"
                  onClick={() => setSelection(slot.id, { kind: 'original' })}
                >
                  Restore original
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="fragment-slot-review__preview">
        <div className="fragment-slot-review__preview-label">
          Live assembled preview
        </div>
        <div
          className="fragment-slot-review__preview-body"
          data-testid="fragment-slot-preview"
        >
          {assembledPreview || (
            <span className="fragment-slot-review__preview-empty">
              (all slots skipped)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
