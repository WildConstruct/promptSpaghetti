// Integration Bridge: Metadata-Enhanced Asset Browser for Epic 2
// Connects metadata extraction with smart asset filtering

import React, { useState, useEffect, useCallback } from 'react';
import { SmartAssetBrowser, Asset } from './SmartAssetBrowser';
import { useMetadataExtraction } from '../../hooks/useMetadataExtraction';
import { SegmentMetadata } from '../../services/llm/MetadataExtractor';
import { LLMService } from '../../services/llm/LLMService';
import './MetadataAssetBridge.css';

interface MetadataAssetBridgeProps {
  // Asset Browser props
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  searchQuery?: string;
  
  // Metadata integration props
  currentSegmentId?: string;
  currentSegmentContent?: string;
  llmService?: LLMService;
  
  // Optional callbacks
  onMetadataExtracted?: (segmentId: string, metadata: SegmentMetadata) => void;
}

export const MetadataAssetBridge: React.FC<MetadataAssetBridgeProps> = ({
  assets,
  onAssetSelect,
  searchQuery,
  currentSegmentId,
  currentSegmentContent,
  llmService,
  onMetadataExtracted
}) => {
  const [currentMetadata, setCurrentMetadata] = useState<SegmentMetadata | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);

  // Set up metadata extraction hook
  const { extractMetadata } = useMetadataExtraction({
    enabled: !!llmService,
    debounceMs: 1000,
    llmService,
    onMetadataExtracted: useCallback((nodeId: string, metadata: SegmentMetadata) => {
      if (nodeId === currentSegmentId) {
        setCurrentMetadata(metadata);
        setIsExtracting(false);
        onMetadataExtracted?.(nodeId, metadata);
      }
    }, [currentSegmentId, onMetadataExtracted])
  });

  // Extract metadata when segment content changes
  useEffect(() => {
    if (currentSegmentId && currentSegmentContent && llmService) {
      setIsExtracting(true);
      extractMetadata(currentSegmentId, currentSegmentContent);
    }
  }, [currentSegmentId, currentSegmentContent, llmService, extractMetadata]);

  // Enhanced asset selection with metadata tracking
  const handleAssetSelect = useCallback((asset: Asset) => {
    // Track asset selection for learning
    if (currentMetadata && currentSegmentId) {
      // Log the selection for future improvements
      console.debug('Asset selected with metadata context:', {
        segmentId: currentSegmentId,
        assetId: asset.id,
        metadata: currentMetadata,
        matchScore: calculateMatchScore(asset, currentMetadata)
      });
    }
    
    onAssetSelect(asset);
  }, [onAssetSelect, currentMetadata, currentSegmentId]);

  return (
    <div className="metadata-asset-bridge">
      {/* Metadata extraction indicator */}
      {isExtracting && (
        <div className="metadata-extracting-indicator">
          <span className="loading-spinner" />
          Analyzing content for smart suggestions...
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && currentMetadata && (
        <div className="metadata-debug-info">
          <details>
            <summary>Extracted Metadata (Debug)</summary>
            <pre>{JSON.stringify(currentMetadata, null, 2)}</pre>
          </details>
        </div>
      )}
      
      {/* Smart Asset Browser with metadata context */}
      <SmartAssetBrowser
        assets={assets}
        currentSegmentMetadata={currentMetadata}
        onAssetSelect={handleAssetSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
};

// Helper function to calculate asset-metadata match score
function calculateMatchScore(asset: Asset, metadata: SegmentMetadata): number {
  let score = 0;
  
  // Theme matching
  if (asset.metadata?.themes && metadata.themes) {
    const assetThemes = new Set(asset.metadata.themes.map(t => t.name?.toLowerCase()));
    const segmentThemes = new Set(metadata.themes.map(t => t.name?.toLowerCase()));
    const intersection = new Set([...assetThemes].filter(x => segmentThemes.has(x)));
    score += (intersection.size / Math.max(assetThemes.size, segmentThemes.size)) * 0.4;
  }
  
  // Entity matching
  if (asset.metadata?.entities && metadata.entities) {
    const assetEntities = new Set(asset.metadata.entities.map(e => e.name?.toLowerCase()));
    const segmentEntities = new Set(metadata.entities.map(e => e.name?.toLowerCase()));
    const intersection = new Set([...assetEntities].filter(x => segmentEntities.has(x)));
    score += (intersection.size / Math.max(assetEntities.size, segmentEntities.size)) * 0.3;
  }
  
  // Style matching
  if (asset.metadata?.style && metadata.style) {
    const styleMatches = asset.metadata.style.filter(s => 
      metadata.style.some(ms => ms.toLowerCase().includes(s.toLowerCase()))
    );
    score += (styleMatches.length / Math.max(asset.metadata.style.length, metadata.style.length)) * 0.3;
  }
  
  return Math.min(score, 1.0); // Cap at 1.0
}

export default MetadataAssetBridge;