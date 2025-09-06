// Suggestions Panel for Smart Asset Recommendations
// Story 2.5a: Asset Browser Integration MVP

import React, { useState, useEffect, useCallback } from 'react';
import { AssetMatcherService, Asset, AssetMatch, NodeMetadata } from '../../services/assetMatcher';
import { DragDropHandler } from './DragDropHandler';
import './SuggestionsPanel.css';

interface SuggestionsPanelProps {
  selectedNode?: {
    id: string;
    type: string;
    data?: any;
    metadata?: NodeMetadata;
  };
  assets: Asset[];
  onAssetDrop?: (asset: Asset, targetNode?: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  smartModeEnabled?: boolean;
  showMatchesOnly?: boolean;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  selectedNode,
  assets,
  onAssetDrop,
  isCollapsed = false,
  onToggleCollapse,
  smartModeEnabled = true,
  showMatchesOnly = false
}) => {
  const [suggestions, setSuggestions] = useState<AssetMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [matcherService] = useState(() => new AssetMatcherService());

  // Load suggestions when node selection changes
  useEffect(() => {
    if (!selectedNode || !smartModeEnabled) {
      setSuggestions([]);
      return;
    }

    loadSuggestions();
  }, [selectedNode, assets, smartModeEnabled]);

  const loadSuggestions = useCallback(async () => {
    if (!selectedNode) return;
    
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      // Prepare node metadata
      const nodeMetadata: NodeMetadata = {
        nodeType: selectedNode.type,
        nodeId: selectedNode.id,
        ...selectedNode.metadata,
        ...extractMetadataFromNodeData(selectedNode.data)
      };
      
      // Get matches
      const matches = await matcherService.findMatches(
        nodeMetadata,
        assets,
        { limit: 3, minScore: showMatchesOnly ? 40 : 0 }
      );
      
      setSuggestions(matches);
      setIsOffline(!matcherService.isSmartModeAvailable());
      
      // Check performance
      const duration = performance.now() - startTime;
      if (duration > 200) {
        console.warn(`Suggestion generation took ${duration.toFixed(0)}ms (target: <200ms)`);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Fallback to offline mode
      matcherService.setOfflineMode(true);
      setIsOffline(true);
      
      // Retry with offline mode
      const nodeMetadata: NodeMetadata = {
        nodeType: selectedNode.type,
        nodeId: selectedNode.id,
        ...selectedNode.metadata
      };
      
      const offlineMatches = await matcherService.findMatches(
        nodeMetadata,
        assets,
        { limit: 3, offlineOnly: true }
      );
      
      setSuggestions(offlineMatches);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNode, assets, showMatchesOnly, matcherService]);

  const extractMetadataFromNodeData = (data: any): Partial<NodeMetadata> => {
    const metadata: Partial<NodeMetadata> = {};
    
    // Extract from text content
    if (data?.text) {
      const text = data.text.toLowerCase();
      
      // Simple keyword extraction
      if (text.includes('urban') || text.includes('city')) {
        metadata.setting = 'urban';
      }
      if (text.includes('happy') || text.includes('joy')) {
        metadata.mood = 'positive';
      }
      if (text.includes('action') || text.includes('movement')) {
        metadata.theme = 'dynamic';
      }
    }
    
    // Extract from choices (for WeightedChoice nodes)
    if (data?.choices && Array.isArray(data.choices)) {
      const keywords: string[] = [];
      data.choices.forEach((choice: any) => {
        if (choice.text) {
          keywords.push(...choice.text.split(/\s+/).slice(0, 3));
        }
      });
      metadata.keywords = keywords;
    }
    
    return metadata;
  };

  const handleSuggestionClick = (asset: Asset) => {
    if (onAssetDrop) {
      onAssetDrop(asset, selectedNode?.id);
    }
  };

  if (!smartModeEnabled) {
    return null;
  }

  return (
    <div className={`suggestions-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="suggestions-header" onClick={onToggleCollapse}>
        <span className="suggestions-title">
          Suggested Assets
          {isOffline && <span className="offline-badge">Offline</span>}
        </span>
        <button className="collapse-toggle">
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="suggestions-content">
          {!selectedNode ? (
            <div className="suggestions-empty">
              <span className="empty-icon">💡</span>
              <span className="empty-text">Select a node to see suggestions</span>
            </div>
          ) : isLoading ? (
            <div className="suggestions-loading">
              <div className="loading-spinner" />
              <span>Finding matches...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="suggestions-empty">
              <span className="empty-icon">🔍</span>
              <span className="empty-text">No matching assets found</span>
              {showMatchesOnly && (
                <span className="empty-hint">Try disabling "Show Matches Only"</span>
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
  selectedNodeType?: string;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  match,
  index,
  onClick,
  selectedNodeType
}) => {
  const getMatchIcon = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return '✓';
      case 'medium':
        return '~';
      default:
        return '';
    }
  };

  const getMatchColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return '#4CAF50';
      case 'medium':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <DragDropHandler
      asset={{
        id: match.asset.id,
        name: match.asset.name,
        type: match.asset.type,
        metadata: match.asset.metadata,
        content: match.asset.content
      }}
      onDrop={(result) => onClick()}
    >
      <div 
        className={`suggestion-item relevance-${match.relevance}`}
        onClick={onClick}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="suggestion-header">
          <span className="suggestion-name">{match.asset.name}</span>
          <span 
            className="match-indicator"
            style={{ color: getMatchColor(match.relevance) }}
            title={`${match.score}% match`}
          >
            {getMatchIcon(match.relevance)}
          </span>
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

// Smart Mode Toggle Component
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
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>Smart Suggestions</span>
      </label>
      {enabled && (
        <span className="smart-mode-status">
          AI-powered matching active
        </span>
      )}
    </div>
  );
};