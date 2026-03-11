import React from 'react';
import type { Edge, Node } from 'reactflow';
import {
  type Preset
} from '@prompt/asset-browser';
import type { EditableNodeData } from './nodes';
import {
  AgentFragmentSuggestionService,
  agentFragmentRecordToPreset,
  type PlannedFragmentSuggestion
} from './services/AgentFragmentSuggestionService';

interface SuggestedFragmentsPanelProps {
  selectedNode?: Node<EditableNodeData> | null;
  nodes?: Node<EditableNodeData>[];
  edges?: Edge[];
  onInsert?: (preset: Preset) => void;
}

export const SuggestedFragmentsPanel: React.FC<SuggestedFragmentsPanelProps> = ({
  selectedNode,
  nodes = [],
  edges = [],
  onInsert
}) => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isInsertingTopSuggestion, setIsInsertingTopSuggestion] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<PlannedFragmentSuggestion[]>([]);
  const [activeFragmentId, setActiveFragmentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      if (!selectedNode) {
        setSuggestions([]);
        setStatus('idle');
        return;
      }

      setStatus('loading');
      try {
        const next = await AgentFragmentSuggestionService.getSuggestions({
          selectedNode,
          nodes,
          edges
        });

        if (!active) {
          return;
        }

        setSuggestions(
          AgentFragmentSuggestionService.getPlannedSuggestions({
            selectedNode,
            nodes,
            edges,
            suggestions: next
          })
        );
        setStatus('ready');
      } catch (error) {
        console.error('[SuggestedFragmentsPanel] failed to load suggestions', error);
        if (active) {
          setSuggestions([]);
          setStatus('error');
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [selectedNode, nodes, edges]);

  if (!selectedNode) {
    return (
      <section className="suggested-fragments-panel">
        <div className="suggested-fragments-header">
          <h4>Suggested Fragments</h4>
        </div>
        <p className="suggested-fragments-empty">
          Select a node to surface useful fragment suggestions.
        </p>
      </section>
    );
  }

  const handleInsertTopSuggestion = async () => {
    if (!selectedNode || !onInsert || isInsertingTopSuggestion) {
      return;
    }

    setIsInsertingTopSuggestion(true);
    try {
      await AgentFragmentSuggestionService.insertTopSuggestion({
        selectedNode,
        nodes,
        edges,
        insertPreset: preset => onInsert(preset)
      });
    } catch (error) {
      console.error('[SuggestedFragmentsPanel] failed to insert top suggestion', error);
    } finally {
      setIsInsertingTopSuggestion(false);
    }
  };

  const handleFragmentDragStart = React.useCallback(
    (
      event: React.DragEvent<HTMLButtonElement>,
      fragment: PlannedFragmentSuggestion['fragment']
    ) => {
      const preset = agentFragmentRecordToPreset(fragment) as Preset & {
        metadata?: Record<string, unknown>;
        path?: string;
      };
      const payload = JSON.stringify({
        ...preset,
        metadata: preset.metadata ?? (preset.path ? { file: preset.path } : undefined)
      });

      event.dataTransfer.setData('application/x-preset', payload);
      event.dataTransfer.setData('preset', payload);
      event.dataTransfer.setData('application/json', payload);
      event.dataTransfer.setData('text/plain', payload);
      event.dataTransfer.effectAllowed = 'copy';

      const dragImage = document.createElement('div');
      dragImage.textContent = fragment.name;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.padding = '10px 14px';
      dragImage.style.borderRadius = '12px';
      dragImage.style.border = '2px dashed rgba(134, 239, 172, 0.88)';
      dragImage.style.background = 'rgba(15, 23, 42, 0.92)';
      dragImage.style.color = '#f8fafc';
      dragImage.style.fontSize = '12px';
      dragImage.style.fontWeight = '700';
      dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.35)';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 18, 18);
      window.setTimeout(() => {
        dragImage.remove();
      }, 0);
    },
    []
  );

  return (
    <section className="suggested-fragments-panel">
      <div className="suggested-fragments-header">
        <div className="suggested-fragments-heading">
          <h4>Suggested Fragments</h4>
          <span className="suggested-fragments-context">
            For {selectedNode.type ?? 'selection'}
          </span>
        </div>
        <button
          type="button"
          className="suggested-fragments-primary"
          onClick={() => {
            void handleInsertTopSuggestion();
          }}
          disabled={!onInsert || suggestions.length === 0 || isInsertingTopSuggestion}
        >
          {isInsertingTopSuggestion
            ? 'Inserting…'
            : suggestions[0]
              ? `Insert Best Match • ${suggestions[0].actionLabel}`
              : 'Insert Best Match'}
        </button>
      </div>

      {status === 'loading' && (
        <p className="suggested-fragments-empty">Finding context-aware fragments…</p>
      )}

      {status === 'error' && (
        <p className="suggested-fragments-empty">
          Suggestions are unavailable right now.
        </p>
      )}

      {status === 'ready' && suggestions.length === 0 && (
        <p className="suggested-fragments-empty">
          No strong matches yet for this selection.
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="suggested-fragments-list">
          {suggestions.map(({ fragment, actionLabel, insertionLabel }) => (
            <button
              key={fragment.id}
              type="button"
              className={`suggested-fragment-card ${
                activeFragmentId === fragment.id ? 'is-active' : ''
              }`}
              onClick={() => onInsert?.(agentFragmentRecordToPreset(fragment))}
              onMouseEnter={() => setActiveFragmentId(fragment.id)}
              onMouseLeave={() =>
                setActiveFragmentId(current =>
                  current === fragment.id ? null : current
                )
              }
              onFocus={() => setActiveFragmentId(fragment.id)}
              onBlur={() =>
                setActiveFragmentId(current =>
                  current === fragment.id ? null : current
                )
              }
              onDragStart={event => handleFragmentDragStart(event, fragment)}
              draggable
              title="Click to insert from the current selection, or drag into the graph to place it manually."
              aria-describedby={
                activeFragmentId === fragment.id
                  ? `suggested-fragment-tooltip-${fragment.id}`
                  : undefined
              }
            >
              <div className="suggested-fragment-title">{fragment.name}</div>
              <div className="suggested-fragment-meta">
                {fragment.roles.join(', ')}
              </div>
              <div className="suggested-fragment-tags">
                <span className="suggested-fragment-chip intent">
                  {actionLabel}
                </span>
                <span className="suggested-fragment-chip intent subtle">
                  {insertionLabel}
                </span>
                {fragment.domains.slice(0, 2).map(domain => (
                  <span key={domain} className="suggested-fragment-chip">
                    {domain}
                  </span>
                ))}
                {fragment.placementHints.slice(0, 2).map(hint => (
                  <span key={hint} className="suggested-fragment-chip subtle">
                    {hint}
                  </span>
                ))}
              </div>
              {activeFragmentId === fragment.id && (
                <div
                  id={`suggested-fragment-tooltip-${fragment.id}`}
                  className="suggested-fragment-tooltip"
                >
                  Click to insert from the current selection, or drag into the graph to place
                  it exactly where you want it.
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default SuggestedFragmentsPanel;
