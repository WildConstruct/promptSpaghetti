// Suggestions Panel for Smart Asset Recommendations
// Story 2.5a: Asset Browser Integration MVP

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'reactflow';
import {
  AssetMatcherService,
  type Asset,
  type AssetMatch,
  type NodeMetadata
} from '../../services/assetMatcher';
import {
  AdvancedMatcherService,
  type CategorizedMatches,
  type GraphContext,
  type ScoredAsset
} from '../../services/advancedMatcher';
import { DragDropHandler, type DropResult } from './DragDropHandler';
import './SuggestionsPanel.css';
import { AssetMatchIndicator } from './AssetMatchIndicator';
import {
  PreferencesService,
  type UserPreferences
} from '../../services/preferences';

interface SelectedNode {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  metadata?: NodeMetadata;
}

interface SuggestionsPanelProps {
  selectedNode?: SelectedNode;
  assets: Asset[];
  onAssetDrop?: (asset: Asset, targetNode?: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  smartModeEnabled?: boolean;
  showMatchesOnly?: boolean;
}

type CategorizedPreview = Pick<
  CategorizedMatches,
  'complementary' | 'alternatives' | 'extensions' | 'refinements'
>;

const ADVANCED_KEY = 'advancedMatching.enabled';
const SMART_MODE_KEY = 'smartMode.enabled';
const MATCHES_ONLY_KEY = 'matches.only';

const scoreToRelevance = (score: number): AssetMatch['relevance'] => {
  if (score >= 70) {
    return 'high';
  }
  if (score >= 40) {
    return 'medium';
  }
  return 'low';
};

const mapScoreToMatch = (score: ScoredAsset): AssetMatch => {
  const percentage = Math.round((score.totalScore ?? 0) * 100);
  return {
    asset: score.asset,
    score: percentage,
    relevance: scoreToRelevance(percentage),
    explanation: score.explanation
  };
};

const extractMetadataFromNodeData = (
  data?: Record<string, unknown>
): Partial<NodeMetadata> => {
  if (!data) {
    return {};
  }

  const metadata: Partial<NodeMetadata> = {};
  const text = typeof data.text === 'string' ? data.text.toLowerCase() : '';

  if (text.includes('urban') || text.includes('city')) {
    metadata.setting = 'urban';
  }
  if (text.includes('happy') || text.includes('joy')) {
    metadata.mood = 'positive';
  }
  if (text.includes('action') || text.includes('movement')) {
    metadata.theme = 'dynamic';
  }

  const choices = Array.isArray(data.choices)
    ? (data.choices as Array<Record<string, unknown>>)
    : [];
  if (choices.length > 0) {
    const keywords: string[] = [];
    choices.forEach(choice => {
      const choiceText = typeof choice.text === 'string' ? choice.text : '';
      if (choiceText) {
        keywords.push(
          ...choiceText
            .split(/\s+/)
            .map(part => part.toLowerCase())
            .slice(0, 3)
        );
      }
    });
    if (keywords.length > 0) {
      metadata.keywords = keywords;
    }
  }

  return metadata;
};

const createGraphContext = (
  node: SelectedNode,
  preferences: UserPreferences
): GraphContext => {
  const reactFlowNode: Node<Record<string, unknown>> = {
    id: node.id,
    type: node.type,
    position: { x: 0, y: 0 },
    data: (node.data ?? {}) as Record<string, unknown>
  };

  return {
    selectedNode: reactFlowNode,
    allNodes: [reactFlowNode],
    edges: [],
    userPreferences: preferences
  };
};

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  selectedNode,
  assets,
  onAssetDrop,
  isCollapsed = false,
  onToggleCollapse,
  smartModeEnabled,
  showMatchesOnly
}) => {
  const [suggestions, setSuggestions] = useState<AssetMatch[]>([]);
  const [categorizedMatches, setCategorizedMatches] =
    useState<CategorizedPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [matcherService] = useState(() => new AssetMatcherService());
  const [advancedMatcher] = useState(() => new AdvancedMatcherService());
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() =>
    PreferencesService.load()
  );
  const [smartModeSetting, setSmartModeSetting] = useState<boolean>(() => {
    try {
      const stored = window?.localStorage?.getItem(SMART_MODE_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [internalShowMatchesOnly, setInternalShowMatchesOnly] =
    useState<boolean>(() => {
      if (typeof showMatchesOnly === 'boolean') {
        return showMatchesOnly;
      }
      try {
        return window?.localStorage?.getItem(MATCHES_ONLY_KEY) === 'true';
      } catch {
        return false;
      }
    });
  const [advancedMatching, setAdvancedMatching] = useState<boolean>(() => {
    try {
      return window?.localStorage?.getItem(ADVANCED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const effectiveSmartMode =
    typeof smartModeEnabled === 'boolean'
      ? smartModeEnabled
      : smartModeSetting;
  const effectiveShowMatchesOnly =
    typeof showMatchesOnly === 'boolean'
      ? showMatchesOnly
      : internalShowMatchesOnly;

  const loadSuggestions = useCallback(async () => {
    if (!selectedNode || !effectiveSmartMode) {
      setSuggestions([]);
      setCategorizedMatches(null);
      return;
    }

    const nodeMetadata: NodeMetadata = {
      nodeType: selectedNode.type,
      nodeId: selectedNode.id,
      ...selectedNode.metadata,
      ...extractMetadataFromNodeData(selectedNode.data)
    };

    setIsLoading(true);
    const startTime = performance.now();

    try {
      if (advancedMatching) {
        const context = createGraphContext(selectedNode, userPrefs);
        const categorized = await advancedMatcher.findMatches(
          context,
          assets,
          {
            limit: 6,
            includeCategories: true,
            learningEnabled: true
          }
        );
        setCategorizedMatches({
          complementary: categorized.complementary,
          alternatives: categorized.alternatives,
          extensions: categorized.extensions,
          refinements: categorized.refinements
        });
        setSuggestions(
          categorized.all.slice(0, 3).map(entry => mapScoreToMatch(entry))
        );
      } else {
        const matches = await matcherService.findMatches(nodeMetadata, assets, {
          limit: 3,
          minScore: effectiveShowMatchesOnly ? 40 : 0
        });
        setSuggestions(matches);
        setCategorizedMatches(null);
      }

      setIsOffline(!matcherService.isSmartModeAvailable());

      const duration = performance.now() - startTime;
      if (duration > 200) {
        console.warn(
          `Suggestion generation took ${duration.toFixed(
            0
          )}ms (target: <200ms)`
        );
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      matcherService.setOfflineMode(true);
      setIsOffline(true);
      try {
        const fallbackMatches = await matcherService.findMatches(
          nodeMetadata,
          assets,
          { limit: 3, offlineOnly: true }
        );
        setSuggestions(fallbackMatches);
      } catch (fallbackError) {
        console.error('Fallback suggestion generation failed:', fallbackError);
        setSuggestions([]);
      }
      setCategorizedMatches(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    advancedMatcher,
    advancedMatching,
    assets,
    effectiveShowMatchesOnly,
    effectiveSmartMode,
    matcherService,
    selectedNode,
    userPrefs
  ]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === SMART_MODE_KEY && event.newValue !== null) {
        setSmartModeSetting(event.newValue === 'true');
      }
      if (
        event.key === MATCHES_ONLY_KEY &&
        typeof showMatchesOnly !== 'boolean' &&
        event.newValue !== null
      ) {
        setInternalShowMatchesOnly(event.newValue === 'true');
      }
      if (event.key === ADVANCED_KEY && event.newValue !== null) {
        setAdvancedMatching(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [showMatchesOnly]);

  const handleSuggestionClick = useCallback(
    (asset: Asset) => {
      if (onAssetDrop) {
        onAssetDrop(asset, selectedNode?.id);
      }
    },
    [onAssetDrop, selectedNode]
  );

  const handleDropResult = useCallback(
    (asset: Asset, result: DropResult | undefined) => {
      if (onAssetDrop) {
        onAssetDrop(asset, result?.targetNode ?? selectedNode?.id);
      }
    },
    [onAssetDrop, selectedNode]
  );

  const handleAccept = useCallback(
    (asset: Asset) => {
      if (selectedNode && onAssetDrop) {
        onAssetDrop(asset, selectedNode.id);
      }
      const nextPrefs = PreferencesService.recordAcceptance(
        asset.id,
        true,
        selectedNode?.type ?? 'unknown'
      );
      setUserPrefs(nextPrefs);
      setSuggestions(prev =>
        prev.filter(match => match.asset.id !== asset.id)
      );
      setCategorizedMatches(prev => {
        if (!prev) {
          return prev;
        }
        return {
          complementary: prev.complementary.filter(
            entry => entry.asset.id !== asset.id
          ),
          alternatives: prev.alternatives.filter(
            entry => entry.asset.id !== asset.id
          ),
          extensions: prev.extensions.filter(
            entry => entry.asset.id !== asset.id
          ),
          refinements: prev.refinements.filter(
            entry => entry.asset.id !== asset.id
          )
        };
      });
    },
    [onAssetDrop, selectedNode]
  );

  const handleReject = useCallback(
    (asset: Asset) => {
      const nextPrefs = PreferencesService.recordAcceptance(
        asset.id,
        false,
        selectedNode?.type ?? 'unknown'
      );
      setUserPrefs(nextPrefs);
      setSuggestions(prev =>
        prev.filter(match => match.asset.id !== asset.id)
      );
      setCategorizedMatches(prev => {
        if (!prev) {
          return prev;
        }
        return {
          complementary: prev.complementary.filter(
            entry => entry.asset.id !== asset.id
          ),
          alternatives: prev.alternatives.filter(
            entry => entry.asset.id !== asset.id
          ),
          extensions: prev.extensions.filter(
            entry => entry.asset.id !== asset.id
          ),
          refinements: prev.refinements.filter(
            entry => entry.asset.id !== asset.id
          )
        };
      });
    },
    [selectedNode]
  );

  if (!effectiveSmartMode) {
    return null;
  }

  const renderCategorizedSection = (
    title: string,
    entries: ScoredAsset[] | undefined
  ) => {
    if (!entries || entries.length === 0) {
      return null;
    }

    return (
      <div className="suggestions-category">
        <div className="suggestions-category-title">{title}</div>
        {entries.slice(0, 3).map(entry => {
          const match = mapScoreToMatch(entry);
          return (
            <div key={entry.asset.id} className="suggestion-item">
              <div className="suggestion-header">
                <span className="suggestion-name">{entry.asset.name}</span>
                <AssetMatchIndicator
                  score={match.score}
                  relevance={match.relevance}
                  offline={false}
                />
              </div>
              {match.explanation && (
                <div className="suggestion-explanation">
                  {match.explanation}
                </div>
              )}
              <div className="suggestion-meta">
                <span className="asset-type">{entry.asset.type}</span>
                <button
                  className="suggestion-accept"
                  type="button"
                  onClick={() => handleAccept(entry.asset)}
                >
                  Accept
                </button>
                <button
                  className="suggestion-reject"
                  type="button"
                  onClick={() => handleReject(entry.asset)}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`suggestions-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="suggestions-header" onClick={onToggleCollapse}>
        <span className="suggestions-title">
          Suggested Assets
          {isOffline && (
            <span className="offline-badge">Basic matching (offline)</span>
          )}
        </span>
        <button className="collapse-toggle" type="button">
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="suggestions-content">
          <div className="suggestions-controls">
            <label className="suggestions-toggle">
              <input
                type="checkbox"
                checked={effectiveShowMatchesOnly}
                onChange={event => {
                  const value = event.target.checked;
                  if (typeof showMatchesOnly !== 'boolean') {
                    setInternalShowMatchesOnly(value);
                    try {
                      window?.localStorage?.setItem(
                        MATCHES_ONLY_KEY,
                        String(value)
                      );
                    } catch {
                      // ignore storage errors
                    }
                  }
                }}
              />
              <span>Show Matches Only</span>
            </label>
          </div>

          {!selectedNode ? (
            <div className="suggestions-empty">
              <span className="empty-icon">💡</span>
              <span className="empty-text">
                Select a node to see suggestions
              </span>
            </div>
          ) : isLoading ? (
            <div className="suggestions-loading">
              <div className="loading-spinner" />
              <span>Finding matches...</span>
            </div>
          ) : advancedMatching && categorizedMatches ? (
            <div className="suggestions-categories">
              {renderCategorizedSection(
                'Complementary',
                categorizedMatches.complementary
              )}
              {renderCategorizedSection(
                'Alternatives',
                categorizedMatches.alternatives
              )}
              {renderCategorizedSection(
                'Extensions',
                categorizedMatches.extensions
              )}
              {renderCategorizedSection(
                'Refinements',
                categorizedMatches.refinements
              )}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="suggestions-empty">
              <span className="empty-icon">🔍</span>
              <span className="empty-text">No matching assets found</span>
              {effectiveShowMatchesOnly && (
                <span className="empty-hint">
                  Try disabling &quot;Show Matches Only&quot;
                </span>
              )}
            </div>
          ) : (
            <div className="suggestions-list">
              {suggestions.map((match, index) => (
                <SuggestionItem
                  key={match.asset.id}
                  match={match}
                  index={index}
                  onClick={() => handleSuggestionClick(match.asset)}
                  onDrop={result => handleDropResult(match.asset, result)}
                  isOffline={isOffline}
                  selectedNodeType={selectedNode.type}
                />
              ))}
            </div>
          )}

          {selectedNode?.type === 'WeightedChoice' && suggestions.length > 0 && (
            <div className="suggestions-hint">
              <span className="hint-icon">💡</span>
              <span>Drop on node to add as choice option</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SuggestionItemProps {
  match: AssetMatch;
  index: number;
  onClick: () => void;
  onDrop: (result: DropResult | undefined) => void;
  isOffline: boolean;
  selectedNodeType?: string;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  match,
  index,
  onClick,
  onDrop,
  isOffline,
  selectedNodeType
}) => {
  return (
    <DragDropHandler
      asset={{
        id: match.asset.id,
        name: match.asset.name,
        type: match.asset.type,
        metadata: match.asset.metadata,
        content: match.asset.content ?? null
      }}
      onDrop={onDrop}
    >
      <div
        className={`suggestion-item relevance-${match.relevance}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            onClick();
          }
        }}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="suggestion-header">
          <span className="suggestion-name">{match.asset.name}</span>
          <AssetMatchIndicator
            score={match.score}
            relevance={match.relevance}
            offline={isOffline}
          />
        </div>

        {match.explanation && (
          <div className="suggestion-explanation">{match.explanation}</div>
        )}

        <div className="suggestion-meta">
          <span className="asset-type">{match.asset.type}</span>
          {selectedNodeType === 'WeightedChoice' && (
            <span className="quick-add-badge">Quick Add</span>
          )}
        </div>
      </div>
    </DragDropHandler>
  );
};

export const SmartModeToggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <div className="smart-mode-toggle">
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={event => onChange(event.target.checked)}
        />
        <span>Smart Suggestions</span>
      </label>
      {enabled && (
        <span className="smart-mode-status">AI-powered matching active</span>
      )}
    </div>
  );
};
