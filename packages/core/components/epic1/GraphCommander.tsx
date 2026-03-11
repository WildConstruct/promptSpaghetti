import React from 'react';

const COMMANDER_RECENTS_KEY = 'epic1.commander.recents';
const COMMANDER_COUNTS_KEY = 'epic1.commander.counts';
const MAX_RECENT_COMMANDS = 12;

export interface GraphCommanderCommand {
  id: string;
  label: string;
  aliases?: string[];
  category?: string;
  shortcut?: string;
  description?: string;
  execute: () => Promise<void> | void;
}

type RankedCommandEntry = {
  command: GraphCommanderCommand;
  score: number;
};

interface GraphCommanderProps {
  isOpen: boolean;
  onClose: () => void;
  commands: GraphCommanderCommand[];
}

function normalize(value: string | undefined | null) {
  return (value ?? '').trim().toLowerCase();
}

function readRecentCommands() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(COMMANDER_RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function readCommandCounts() {
  if (typeof window === 'undefined') {
    return {} as Record<string, number>;
  }

  try {
    const raw = window.localStorage.getItem(COMMANDER_COUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object'
      ? Object.fromEntries(
          Object.entries(parsed).filter(
            (entry): entry is [string, number] =>
              typeof entry[0] === 'string' && typeof entry[1] === 'number'
          )
        )
      : {};
  } catch {
    return {};
  }
}

function persistUsage(commandId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const nextRecent = [
      commandId,
      ...readRecentCommands().filter(id => id !== commandId)
    ].slice(0, MAX_RECENT_COMMANDS);
    const counts = readCommandCounts();
    counts[commandId] = (counts[commandId] ?? 0) + 1;
    window.localStorage.setItem(COMMANDER_RECENTS_KEY, JSON.stringify(nextRecent));
    window.localStorage.setItem(COMMANDER_COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // no-op
  }
}

function scoreCommand(params: {
  command: GraphCommanderCommand;
  query: string;
  recentIds: string[];
  usageCounts: Record<string, number>;
}) {
  const { command, query, recentIds, usageCounts } = params;
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    const recentIndex = recentIds.indexOf(command.id);
    return (recentIndex >= 0 ? 400 - recentIndex * 10 : 0) + (usageCounts[command.id] ?? 0);
  }

  const label = normalize(command.label);
  const category = normalize(command.category);
  const aliases = (command.aliases ?? []).map(alias => normalize(alias));
  const description = normalize(command.description);

  let score = 0;

  if (label === normalizedQuery) {
    score += 1000;
  }
  if (label.startsWith(normalizedQuery)) {
    score += 700;
  }
  if (label.includes(normalizedQuery)) {
    score += 450;
  }
  if (aliases.some(alias => alias === normalizedQuery)) {
    score += 800;
  }
  if (aliases.some(alias => alias.startsWith(normalizedQuery))) {
    score += 500;
  }
  if (aliases.some(alias => alias.includes(normalizedQuery))) {
    score += 320;
  }
  if (category.includes(normalizedQuery)) {
    score += 140;
  }
  if (description.includes(normalizedQuery)) {
    score += 80;
  }

  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    if (label.includes(token)) {
      score += 45;
    }
    if (aliases.some(alias => alias.includes(token))) {
      score += 30;
    }
    if (category.includes(token)) {
      score += 15;
    }
  }

  const recentIndex = recentIds.indexOf(command.id);
  if (recentIndex >= 0) {
    score += 150 - recentIndex * 10;
  }
  score += Math.min(usageCounts[command.id] ?? 0, 20) * 6;

  return score;
}

export const GraphCommander: React.FC<GraphCommanderProps> = ({
  isOpen,
  onClose,
  commands
}) => {
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [usageVersion, setUsageVersion] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setHighlightedIndex(0);
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  const rankedCommands = React.useMemo(() => {
    const recentIds = readRecentCommands();
    const usageCounts = readCommandCounts();
    return commands
      .map((command): RankedCommandEntry => ({
        command,
        score: scoreCommand({
          command,
          query,
          recentIds,
          usageCounts
        })
      }))
      .filter((entry: RankedCommandEntry) => !query.trim() || entry.score > 0)
      .sort((left: RankedCommandEntry, right: RankedCommandEntry) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.command.label.localeCompare(right.command.label);
      })
      .map((entry: RankedCommandEntry) => entry.command);
  }, [commands, query, usageVersion]);

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

    persistUsage(command.id);
    setUsageVersion(version => version + 1);
    await command.execute();
    onClose();
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
          <span className="graph-commander-label">Command Palette</span>
          <span className="graph-commander-hint">C to open • Esc to close</span>
        </div>
        <input
          ref={inputRef}
          className="graph-commander-input"
          placeholder="Type a command"
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
                Math.min(index + 1, Math.max(rankedCommands.length - 1, 0))
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
              void handleRunCommand(rankedCommands[highlightedIndex]);
            }
          }}
        />
        <div className="graph-commander-results">
          {rankedCommands.length === 0 && (
            <div className="graph-commander-empty">No commands match this search.</div>
          )}
          {rankedCommands.map((command: GraphCommanderCommand, index: number) => (
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
                <div className="graph-commander-item-title">{command.label}</div>
                <div className="graph-commander-item-meta">
                  {command.category && (
                    <span className="graph-commander-item-category">{command.category}</span>
                  )}
                  {command.description && (
                    <span className="graph-commander-item-description">{command.description}</span>
                  )}
                </div>
              </div>
              {command.shortcut && (
                <span className="graph-commander-item-shortcut">{command.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphCommander;
