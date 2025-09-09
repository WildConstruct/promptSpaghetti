// Suggestions Panel for Smart Asset Recommendations
// Story 2.5a: Asset Browser Integration MVP

import React, { useState, useEffect, useCallback } from 'react';
import { AssetMatcherService, Asset, AssetMatch, NodeMetadata } from '../../services/assetMatcher';
import { AdvancedMatcherService } from '../../services/advancedMatcher';
import { DragDropHandler } from './DragDropHandler';
import './SuggestionsPanel.css';
import { AssetMatchIndicator } from './AssetMatchIndicator';
import { AdvancedMatcherService } from '../../services/advancedMatcher';
import { PreferencesService } from '../../services/preferences';

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
  smartModeEnabled,
  showMatchesOnly
}) => {
  const [suggestions, setSuggestions] = useState<AssetMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [matcherService] = useState(() => new AssetMatcherService());
  const [advMatcher] = useState(() => new AdvancedMatcherService());
  const [advancedMatching, setAdvancedMatching] = useState<boolean>(() => {
    try { const v = window?.localStorage?.getItem('advancedMatching.enabled'); return v === 'true'; } catch { return false; }
  });
  const [userPrefs, setUserPrefs] = useState(() => PreferencesService.load());
  const [categorized, setCategorized] = useState<any>(null);
  const [advMatcher] = useState(() => new AdvancedMatcherService());
  const [advancedMatching, setAdvancedMatching] = useState<boolean>(() => {
    try { const v = window?.localStorage?.getItem('advancedMatching.enabled'); return v === 'true'; } catch { return false; }
  });
  const [smartModeSetting, setSmartModeSetting] = useState<boolean>(() => {
    try { const v = window?.localStorage?.getItem('smartMode.enabled'); return v === null ? true : v === 'true'; } catch { return true; }
  });
  const [internalShowMatchesOnly, setInternalShowMatchesOnly] = useState<boolean>(() => {
    if (typeof showMatchesOnly === 'boolean') return showMatchesOnly;
    try { const v = window?.localStorage?.getItem('matches.only'); return v === 'true'; } catch { return false; }
  });

  const effectiveSmartMode = typeof smartModeEnabled === 'boolean' ? smartModeEnabled : smartModeSetting;
  const effectiveShowMatchesOnly = typeof showMatchesOnly === 'boolean' ? showMatchesOnly : internalShowMatchesOnly;

  // Load suggestions when node selection changes
  useEffect(() => {
    if (!selectedNode || !effectiveSmartMode) {
      setSuggestions([]);
      return;
    }

    loadSuggestions();
  }, [selectedNode, assets, effectiveSmartMode, effectiveShowMatchesOnly, advancedMatching]);

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
      
      // Get matches - advanced or basic\n      if (advancedMatching) {\n        const ctx: any = { selectedNode: selectedNode, allNodes: [], edges: [], userPreferences: userPrefs };\n        const categorized: any = await advMatcher.findMatches(ctx, assets as any, { limit: 6, includeCategories: true, learningEnabled: true });\n        const all = (categorized?.all || []).slice(0, 3).map((s: any) => ({ asset: s.asset, score: Math.round(((s.totalScore ?? 0) * 100)), relevance: (s.totalScore ?? 0) >= 0.7 ? 'high' : (s.totalScore ?? 0) >= 0.4 ? 'medium' : 'low', explanation: s.explanation }));\n        setSuggestions(all);\n        setCategorized(categorized);\n      } else {\n        const matches = await matcherService.findMatches(\n          nodeMetadata,\n          assets,\n          { limit: 3, minScore: effectiveShowMatchesOnly ? 40 : 0 }\n        );\n        setSuggestions(matches);\n        setCategorized(null);\n      }
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
  }, [selectedNode, assets, showMatchesOnly, matcherService, advMatcher, advancedMatching, effectiveShowMatchesOnly]);

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

    const handleAccept = (asset: Asset) => {
    if (selectedNode && onAssetDrop) {
      onAssetDrop(asset, selectedNode.id);
    }
    const prefs = PreferencesService.recordAcceptance(asset.id, true, selectedNode?.type || 'unknown');
    setUserPrefs(prefs);
  };

  const handleReject = (asset: Asset) => {
    const prefs = PreferencesService.recordAcceptance(asset.id, false, selectedNode?.type || 'unknown');
    setUserPrefs(prefs);
    setSuggestions(prev => prev.filter(m => m.asset.id !== asset.id));
  };const handleSuggestionClick = (asset: Asset) => {
    if (onAssetDrop) {
      onAssetDrop(asset, selectedNode?.id);
    }
  };

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'smartMode.enabled' && e.newValue != null) setSmartModeSetting(e.newValue === 'true');
      if (e.key === 'matches.only' && typeof showMatchesOnly !== 'boolean' && e.newValue != null) setInternalShowMatchesOnly(e.newValue === 'true');
      if (e.key === 'advancedMatching.enabled' && e.newValue != null) setAdvancedMatching(e.newValue === 'true');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [showMatchesOnly]);

  if (!effectiveSmartMode) {
    return null;
  }

  return (
    <div className={`suggestions-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="suggestions-header" onClick={onToggleCollapse}>
        <span className="suggestions-title">Suggested Assets
          {isOffline && <span className="offline-badge">Basic matching (offline)</span>}
        </span>
        <button className="collapse-toggle">
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="suggestions-content">\n          <div className="suggestions-controls" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>\n            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>\n              <input type="checkbox" checked={effectiveShowMatchesOnly} onChange={(e) => { const val = e.target.checked; if (typeof showMatchesOnly !== "boolean") { setInternalShowMatchesOnly(val); try { window?.localStorage?.setItem("matches.only", String(val)); } catch {} } }} />\n              <span>Show Matches Only</span>\n            </label>\n          </div>
          {!selectedNode ? (
            <div className="suggestions-empty">
              <span className="empty-icon">💡</span>
              <span className="empty-text">Select a node to see suggestions</span>
            </div>
          {advancedMatching && categorized ? (
            <div className=\"suggestions-categories\">
              {(categorized.complementary || []).slice(0,3).map((s: any, idx: number) => (
                <div key={(s.asset?.id || 'comp') + '-' + idx} className=\"suggestion-item\">
                  <div className=\"suggestion-header\">
                    <span className=\"suggestion-name\">{s.asset?.name}</span>
                    <AssetMatchIndicator score={Math.round(((s.totalScore ?? 0) * 100))} relevance={(s.totalScore ?? 0) >= 0.7 ? 'high' : (s.totalScore ?? 0) >= 0.4 ? 'medium' : 'low'} offline={false} />
                  </div>
                  {s.explanation && (<div className=\"suggestion-explanation\">{s.explanation}</div>)}
                  <div className=\"suggestion-meta\" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className=\"asset-type\">{s.asset?.type}</span>
                    <button className=\"suggestion-accept\" onClick={() => handleAccept(s.asset)}>Accept</button>
                    <button className=\"suggestion-reject\" onClick={() => handleReject(s.asset)}>Reject</button>
                  </div>
                </div>
              ))}
              {(categorized.alternatives || []).slice(0,3).map((s: any, idx: number) => (
                <div key={(s.asset?.id || 'alt') + '-' + idx} className=\"suggestion-item\">
                  <div className=\"suggestion-header\">
                    <span className=\"suggestion-name\">{s.asset?.name}</span>
                    <AssetMatchIndicator score={Math.round(((s.totalScore ?? 0) * 100))} relevance={(s.totalScore ?? 0) >= 0.7 ? 'high' : (s.totalScore ?? 0) >= 0.4 ? 'medium' : 'low'} offline={false} />
                  </div>
                  {s.explanation && (<div className=\"suggestion-explanation\">{s.explanation}</div>)}
                  <div className=\"suggestion-meta\" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className=\"asset-type\">{s.asset?.type}</span>
                    <button className=\"suggestion-accept\" onClick={() => handleAccept(s.asset)}>Accept</button>
                    <button className=\"suggestion-reject\" onClick={() => handleReject(s.asset)}>Reject</button>
                  </div>
                </div>
              ))}
              {(categorized.extensions || []).slice(0,3).map((s: any, idx: number) => (
                <div key={(s.asset?.id || 'ext') + '-' + idx} className=\"suggestion-item\">
                  <div className=\"suggestion-header\">
                    <span className=\"suggestion-name\">{s.asset?.name}</span>
                    <AssetMatchIndicator score={Math.round(((s.totalScore ?? 0) * 100))} relevance={(s.totalScore ?? 0) >= 0.7 ? 'high' : (s.totalScore ?? 0) >= 0.4 ? 'medium' : 'low'} offline={false} />
                  </div>
                  {s.explanation && (<div className=\"suggestion-explanation\">{s.explanation}</div>)}
                  <div className=\"suggestion-meta\" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className=\"asset-type\">{s.asset?.type}</span>
                    <button className=\"suggestion-accept\" onClick={() => handleAccept(s.asset)}>Accept</button>
                    <button className=\"suggestion-reject\" onClick={() => handleReject(s.asset)}>Reject</button>
                  </div>
                </div>
              ))}
              {(categorized.refinements || []).slice(0,3).map((s: any, idx: number) => (
                <div key={(s.asset?.id || 'ref') + '-' + idx} className=\"suggestion-item\">
                  <div className=\"suggestion-header\">
                    <span className=\"suggestion-name\">{s.asset?.name}</span>
                    <AssetMatchIndicator score={Math.round(((s.totalScore ?? 0) * 100))} relevance={(s.totalScore ?? 0) >= 0.7 ? 'high' : (s.totalScore ?? 0) >= 0.4 ? 'medium' : 'low'} offline={false} />
                  </div>
                  {s.explanation && (<div className=\"suggestion-explanation\">{s.explanation}</div>)}
                  <div className=\"suggestion-meta\" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className=\"asset-type\">{s.asset?.type}</span>
                    <button className=\"suggestion-accept\" onClick={() => handleAccept(s.asset)}>Accept</button>
                    <button className=\"suggestion-reject\" onClick={() => handleReject(s.asset)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}          ) : isLoading ? (
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
          <AssetMatchIndicator score={match.score} relevance={match.relevance} offline={isOffline} />
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






