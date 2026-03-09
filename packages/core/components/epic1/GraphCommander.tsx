import React from 'react';
import type { AgentFragmentRecord } from '@prompt/asset-browser';
import {
  agentFragmentRecordToPreset,
  type PlannedFragmentSuggestion
} from './services/AgentFragmentSuggestionService';

interface GraphCommanderCommand {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  group?: string;
  run: () => Promise<void> | void;
}

function findSuggestionByRole(
  suggestions: PlannedFragmentSuggestion[],
  role: AgentFragmentRecord['roles'][number]
): PlannedFragmentSuggestion | null {
  return suggestions.find(suggestion => suggestion.fragment.roles.includes(role)) ?? null;
}

interface GraphCommanderProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTopSuggestion: () => Promise<AgentFragmentRecord | null>;
  onGetSuggestions: () => Promise<PlannedFragmentSuggestion[]>;
  onTogglePreview: () => void;
  onFitView: () => void;
  onExecute: () => void;
  onExportGraph: () => void;
}

function buildFragmentCommand(
  suggestion: PlannedFragmentSuggestion,
  onInsertFragment: (fragment: AgentFragmentRecord) => Promise<void>
): GraphCommanderCommand {
  const { fragment, actionLabel, insertionLabel } = suggestion;
  return {
    id: `fragment:${fragment.id}`,
    title: `Insert ${fragment.name}`,
    description: [actionLabel, insertionLabel, fragment.roles[0], fragment.domains[0]]
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
  const [suggestions, setSuggestions] = React.useState<PlannedFragmentSuggestion[]>([]);
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
      const match = matches.find(candidate => candidate.fragment.id === fragment.id);
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
      await globalInsert(agentFragmentRecordToPreset(match.fragment));
      onClose();
    },
    [onClose, onGetSuggestions]
  );

  const commands = React.useMemo<GraphCommanderCommand[]>(() => {
    const bestBranchExtension = findSuggestionByRole(suggestions, 'branch-extension');
    const bestMergeHelper = findSuggestionByRole(suggestions, 'merge-helper');
    const bestOutputFinisher = findSuggestionByRole(suggestions, 'output-finisher');

    const baseCommands: GraphCommanderCommand[] = [
      {
        id: 'insert-best-match',
        title: 'Insert Best Match',
        description: suggestions[0]
          ? `${suggestions[0].actionLabel} • ${suggestions[0].insertionLabel} • ${suggestions[0].fragment.name}`
          : 'Use the top context-aware fragment suggestion',
        keywords: ['suggestion', 'fragment', 'insert', 'best'],
        group: 'Suggestions',
        run: async () => {
          await onInsertTopSuggestion();
          onClose();
        }
      },
      {
        id: 'insert-branch-extension',
        title: 'Insert Branch Extension',
        description: bestBranchExtension
          ? `${bestBranchExtension.actionLabel} • ${bestBranchExtension.insertionLabel} • ${bestBranchExtension.fragment.name}`
          : 'No branch extension is strongly matched for this selection',
        keywords: ['branch', 'extension', 'conditional', 'lane'],
        group: 'Suggestions',
        run: async () => {
          if (!bestBranchExtension) {
            return;
          }
          await handleInsertFragment(bestBranchExtension.fragment);
        }
      },
      {
        id: 'insert-merge-helper',
        title: 'Insert Merge Helper',
        description: bestMergeHelper
          ? `${bestMergeHelper.actionLabel} • ${bestMergeHelper.insertionLabel} • ${bestMergeHelper.fragment.name}`
          : 'No merge helper is strongly matched for this selection',
        keywords: ['merge', 'join', 'combine', 'recombine'],
        group: 'Suggestions',
        run: async () => {
          if (!bestMergeHelper) {
            return;
          }
          await handleInsertFragment(bestMergeHelper.fragment);
        }
      },
      {
        id: 'insert-output-finisher',
        title: 'Insert Output Finisher',
        description: bestOutputFinisher
          ? `${bestOutputFinisher.actionLabel} • ${bestOutputFinisher.insertionLabel} • ${bestOutputFinisher.fragment.name}`
          : 'No output finisher is strongly matched for this selection',
        keywords: ['output', 'finisher', 'polish', 'final'],
        group: 'Suggestions',
        run: async () => {
          if (!bestOutputFinisher) {
            return;
          }
          await handleInsertFragment(bestOutputFinisher.fragment);
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

    const fragmentCommands = suggestions.slice(0, 5).map(suggestion =>
      buildFragmentCommand(suggestion, handleInsertFragment)
    );

    return [...baseCommands, ...fragmentCommands];
  }, [
    handleInsertFragment,
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
