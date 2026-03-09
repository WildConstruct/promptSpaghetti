import React from 'react';
import type { AgentFragmentRecord } from '@prompt/asset-browser';
import { agentFragmentRecordToPreset } from './services/AgentFragmentSuggestionService';

interface GraphCommanderCommand {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  group?: string;
  run: () => Promise<void> | void;
}

interface GraphCommanderProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTopSuggestion: () => Promise<AgentFragmentRecord | null>;
  onGetSuggestions: () => Promise<AgentFragmentRecord[]>;
  onTogglePreview: () => void;
  onFitView: () => void;
  onExecute: () => void;
  onExportGraph: () => void;
}

function buildFragmentCommand(
  fragment: AgentFragmentRecord,
  onInsertFragment: (fragment: AgentFragmentRecord) => Promise<void>
): GraphCommanderCommand {
  return {
    id: `fragment:${fragment.id}`,
    title: `Insert ${fragment.name}`,
    description: [fragment.roles[0], fragment.domains[0]]
      .filter(Boolean)
      .join(' • '),
    keywords: [
      fragment.name,
      ...fragment.tags,
      ...fragment.roles,
      ...fragment.domains,
      ...fragment.placementHints
    ],
    group: 'Suggested Fragments',
    run: () => onInsertFragment(fragment)
  };
}

export const GraphCommander: React.FC<GraphCommanderProps> = ({
  isOpen,
  onClose,
  onInsertTopSuggestion,
  onGetSuggestions,
  onTogglePreview,
  onFitView,
  onExecute,
  onExportGraph
}) => {
  const [query, setQuery] = React.useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [suggestions, setSuggestions] = React.useState<AgentFragmentRecord[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setHighlightedIndex(0);
      return;
    }

    inputRef.current?.focus();
    let active = true;
    setIsLoadingSuggestions(true);
    void onGetSuggestions()
      .then(results => {
        if (!active) {
          return;
        }
        setSuggestions(results);
      })
      .catch(error => {
        console.error('[GraphCommander] failed to load suggestions', error);
        if (active) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, onGetSuggestions]);

  const handleInsertFragment = React.useCallback(
    async (fragment: AgentFragmentRecord) => {
      const matches = await onGetSuggestions();
      const match = matches.find(candidate => candidate.id === fragment.id);
      if (!match) {
        return;
      }
      const globalInsert = (
        window as typeof window & {
          __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        }
      ).__EPIC1_INSERT_PRESET__;
      if (!globalInsert) {
        return;
      }
      await globalInsert(agentFragmentRecordToPreset(match));
      onClose();
    },
    [onClose, onGetSuggestions]
  );

  const commands = React.useMemo<GraphCommanderCommand[]>(() => {
    const baseCommands: GraphCommanderCommand[] = [
      {
        id: 'insert-best-match',
        title: 'Insert Best Match',
        description: 'Use the top context-aware fragment suggestion',
        keywords: ['suggestion', 'fragment', 'insert', 'best'],
        group: 'Suggestions',
        run: async () => {
          await onInsertTopSuggestion();
          onClose();
        }
      },
      {
        id: 'toggle-preview',
        title: 'Toggle Preview',
        description: 'Show or hide the preview tray',
        keywords: ['preview', 'panel', 'toggle'],
        group: 'Editor',
        run: () => {
          onTogglePreview();
          onClose();
        }
      },
      {
        id: 'fit-view',
        title: 'Fit View',
        description: 'Center and fit the current graph',
        keywords: ['zoom', 'fit', 'view', 'center'],
        group: 'Editor',
        run: () => {
          onFitView();
          onClose();
        }
      },
      {
        id: 'execute-graph',
        title: 'Execute Graph',
        description: 'Run the current graph',
        keywords: ['execute', 'run', 'preview'],
        group: 'Editor',
        run: () => {
          onExecute();
          onClose();
        }
      },
      {
        id: 'export-graph',
        title: 'Export Graph',
        description: 'Download the current graph as JSON',
        keywords: ['export', 'download', 'json'],
        group: 'File',
        run: () => {
          onExportGraph();
          onClose();
        }
      }
    ];

    const fragmentCommands = suggestions.slice(0, 5).map(fragment =>
      buildFragmentCommand(fragment, handleInsertFragment)
    );

    return [...baseCommands, ...fragmentCommands];
  }, [
    handleInsertFragment,
    onClose,
    onExecute,
    onExportGraph,
    onFitView,
    onInsertTopSuggestion,
    onTogglePreview,
    suggestions
  ]);

  const filteredCommands = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter(command => {
      const haystack = [
        command.title,
        command.description,
        ...(command.keywords ?? []),
        command.group
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [commands, query]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleRunCommand = async (command?: GraphCommanderCommand) => {
    if (!command) {
      return;
    }
    await command.run();
  };

  return (
    <div className="graph-commander-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="graph-commander-backdrop"
        aria-label="Close commander"
        onClick={onClose}
      />
      <div className="graph-commander">
        <div className="graph-commander-header">
          <span className="graph-commander-label">Commander</span>
          <span className="graph-commander-hint">C to open • Esc to close</span>
        </div>
        <input
          ref={inputRef}
          className="graph-commander-input"
          placeholder="Search tools and suggestions…"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault();
              onClose();
              return;
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setHighlightedIndex(index =>
                Math.min(index + 1, Math.max(filteredCommands.length - 1, 0))
              );
              return;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlightedIndex(index => Math.max(index - 1, 0));
              return;
            }

            if (event.key === 'Enter') {
              event.preventDefault();
              void handleRunCommand(filteredCommands[highlightedIndex]);
            }
          }}
        />
        <div className="graph-commander-results">
          {isLoadingSuggestions && (
            <div className="graph-commander-empty">Loading context-aware suggestions…</div>
          )}
          {!isLoadingSuggestions && filteredCommands.length === 0 && (
            <div className="graph-commander-empty">No commands match this search.</div>
          )}
          {!isLoadingSuggestions &&
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                className={`graph-commander-item ${index === highlightedIndex ? 'active' : ''}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  void handleRunCommand(command);
                }}
              >
                <div className="graph-commander-item-copy">
                  <div className="graph-commander-item-title">{command.title}</div>
                  {command.description && (
                    <div className="graph-commander-item-description">{command.description}</div>
                  )}
                </div>
                {command.group && (
                  <span className="graph-commander-item-group">{command.group}</span>
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GraphCommander;
