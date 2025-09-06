// Smart Asset Browser with Metadata-based Filtering for Story 2.3a
// Provides intelligent asset discovery based on segment metadata

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MetadataExtractor, SegmentMetadata } from '../../services/llm/MetadataExtractor';
import './SmartAssetBrowser.css';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'fragment' | 'preset';
  path: string;
  thumbnail?: string;
  metadata?: SegmentMetadata;
  tags?: string[];
}

interface SmartAssetBrowserProps {
  assets: Asset[];
  currentSegmentMetadata?: SegmentMetadata;
  onAssetSelect: (asset: Asset) => void;
  metadataExtractor?: MetadataExtractor;
  searchQuery?: string;
}

export const SmartAssetBrowser: React.FC<SmartAssetBrowserProps> = ({
  assets,
  currentSegmentMetadata,
  onAssetSelect,
  metadataExtractor,
  searchQuery = ''
}) => {
  const [smartMatchEnabled, setSmartMatchEnabled] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCounts, setMatchCounts] = useState<Map<string, number>>(new Map());

  // Parse search query for metadata filters
  const searchFilters = useMemo(() => {
    if (!metadataExtractor || !searchInput) {
      return { filters: {}, keywords: [] };
    }
    return metadataExtractor.parseSearchQuery(searchInput);
  }, [searchInput, metadataExtractor]);

  // Filter and sort assets based on metadata matching
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];
    
    // Text search (if no smart match or as fallback)
    if (searchInput && !smartMatchEnabled) {
      const keywords = searchInput.toLowerCase().split(/\s+/);
      filtered = filtered.filter(asset => {
        const searchableText = `${asset.name} ${asset.tags?.join(' ') || ''}`.toLowerCase();
        return keywords.every(keyword => searchableText.includes(keyword));
      });
    }
    
    // Smart metadata filtering
    if (smartMatchEnabled && (currentSegmentMetadata || searchFilters.filters)) {
      const targetMetadata = currentSegmentMetadata || searchFilters.filters;
      
      // Calculate relevance scores
      const scoredAssets = filtered.map(asset => {
        let score = 0;
        
        if (asset.metadata && metadataExtractor) {
          score = metadataExtractor.calculateRelevance(
            asset.metadata,
            targetMetadata as Partial<SegmentMetadata>
          );
        } else if (asset.tags && targetMetadata.tags) {
          // Fallback to simple tag matching
          const matchingTags = asset.tags.filter(tag => 
            targetMetadata.tags?.includes(tag)
          );
          score = matchingTags.length / Math.max(asset.tags.length, targetMetadata.tags.length);
        }
        
        return { asset, score };
      });
      
      // Filter out zero matches and sort by score
      filtered = scoredAssets
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.asset);
      
      // Update match count
      setMatchCounts(new Map([['smart', filtered.length]]));
    }
    
    return filtered;
  }, [assets, searchInput, smartMatchEnabled, currentSegmentMetadata, searchFilters, metadataExtractor]);

  // Extract metadata for assets without it (background process)
  useEffect(() => {
    if (!metadataExtractor || !smartMatchEnabled) return;
    
    const extractMissingMetadata = async () => {
      for (const asset of assets) {
        if (!asset.metadata && asset.name) {
          // Fire and forget
          metadataExtractor.extractInBackground(asset.name);
        }
      }
    };
    
    extractMissingMetadata();
  }, [assets, metadataExtractor, smartMatchEnabled]);

  const handleAssetClick = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    onAssetSelect(asset);
  }, [onAssetSelect]);

  const handleSmartMatchToggle = useCallback(() => {
    setSmartMatchEnabled(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'fragment': return '📄';
      case 'preset': return '📦';
      default: return '📁';
    }
  };

  return (
    <div className="smart-asset-browser" data-testid="smart-asset-browser">
      <div className="browser-header">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search assets (try: 'urban scenes' or 'intense action')"
            value={searchInput}
            onChange={handleSearchChange}
          />
          {searchInput && (
            <span className="search-hint">
              {smartMatchEnabled ? 'Using smart filters' : 'Text search'}
            </span>
          )}
        </div>
        
        <div className="controls-section">
          <label className="smart-match-toggle">
            <input
              type="checkbox"
              checked={smartMatchEnabled}
              onChange={handleSmartMatchToggle}
            />
            <span className="toggle-label">Smart Match</span>
            {smartMatchEnabled && currentSegmentMetadata && (
              <span className="match-badge">
                {matchCounts.get('smart') || 0} matches
              </span>
            )}
          </label>
        </div>
      </div>

      {smartMatchEnabled && !currentSegmentMetadata && (
        <div className="info-message">
          💡 Select a segment to enable smart matching
        </div>
      )}

      <div className="assets-grid">
        {filteredAssets.length === 0 ? (
          <div className="no-results">
            {smartMatchEnabled 
              ? 'No matching assets found. Try disabling Smart Match.'
              : 'No assets found matching your search.'}
          </div>
        ) : (
          filteredAssets.map(asset => (
            <div
              key={asset.id}
              className={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
              onClick={() => handleAssetClick(asset)}
              title={asset.name}
            >
              {asset.thumbnail ? (
                <img 
                  src={asset.thumbnail} 
                  alt={asset.name}
                  className="asset-thumbnail"
                />
              ) : (
                <div className="asset-icon">
                  {getAssetIcon(asset.type)}
                </div>
              )}
              <div className="asset-info">
                <div className="asset-name">{asset.name}</div>
                {asset.tags && asset.tags.length > 0 && (
                  <div className="asset-tags">
                    {asset.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                {smartMatchEnabled && asset.metadata && (
                  <div className="metadata-indicator" title="Has metadata">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAsset && (
        <div className="asset-preview">
          <h3>{selectedAsset.name}</h3>
          <div className="preview-details">
            <div>Type: {selectedAsset.type}</div>
            {selectedAsset.metadata && (
              <div className="metadata-preview">
                {selectedAsset.metadata.subject && (
                  <div>Subject: {selectedAsset.metadata.subject}</div>
                )}
                {selectedAsset.metadata.mood && (
                  <div>Mood: {selectedAsset.metadata.mood}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};