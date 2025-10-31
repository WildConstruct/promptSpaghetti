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
  const shouldExtract = Boolean(
    llmService && currentSegmentId && currentSegmentContent?.trim()
  );
  const [currentMetadata, setCurrentMetadata] = useState<
    SegmentMetadata | undefined
  >();
  const [hasPendingExtraction, setHasPendingExtraction] =
    useState<boolean>(shouldExtract);

  // Set up metadata extraction hook
  const {
    extractMetadata,
    getNodeMetadata,
    isExtracting: isNodeExtracting
  } = useMetadataExtraction({
    enabled: !!llmService,
    debounceMs: 250,
    llmService,
    onMetadataExtracted: useCallback(
      (nodeId: string, metadata: SegmentMetadata) => {
        if (nodeId === currentSegmentId) {
          setCurrentMetadata(metadata);
          onMetadataExtracted?.(nodeId, metadata);
          setHasPendingExtraction(false);
        }
      },
      [currentSegmentId, onMetadataExtracted]
    )
  });

  // Extract metadata when segment content changes
  useEffect(() => {
    if (shouldExtract && currentSegmentId && currentSegmentContent) {
      setHasPendingExtraction(true);
      extractMetadata(currentSegmentId, currentSegmentContent);
    } else {
      setHasPendingExtraction(false);
    }
  }, [
    currentSegmentId,
    currentSegmentContent,
    extractMetadata,
    llmService,
    shouldExtract
  ]);

  // Keep local metadata in sync with extractor cache
  useEffect(() => {
    if (!currentSegmentId) {
      setCurrentMetadata(undefined);
      return;
    }
    setCurrentMetadata(getNodeMetadata(currentSegmentId));
  }, [currentSegmentId, getNodeMetadata]);

  useEffect(() => {
    if (!shouldExtract) {
      setHasPendingExtraction(false);
    } else if (!isNodeExtracting(currentSegmentId || '') && currentMetadata) {
      setHasPendingExtraction(false);
    }
  }, [shouldExtract, currentMetadata, currentSegmentId, isNodeExtracting]);

  const isExtracting = currentSegmentId
    ? isNodeExtracting(currentSegmentId)
    : false;

  const showExtractionIndicator =
    shouldExtract &&
    (isExtracting || (!currentMetadata && hasPendingExtraction));

  // Enhanced asset selection with metadata tracking
  const handleAssetSelect = useCallback(
    (asset: Asset) => {
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
    },
    [onAssetSelect, currentMetadata, currentSegmentId]
  );

  return (
    <div className="metadata-asset-bridge">
      {/* Metadata extraction indicator */}
      {showExtractionIndicator && (
        <div data-testid="metadata-extraction-indicator" className="metadata-extracting-indicator">
          <span className="loading-spinner" />
          Analyzing content for smart suggestions...
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && currentMetadata && (
        <div data-testid="metadata-debug-info" className="metadata-debug-info">
          <details>
            <summary>Extracted Metadata (Debug)</summary>
            <pre>{JSON.stringify(currentMetadata, null, 2)}</pre>
          </details>
        </div>
      )}

      {/* Smart Asset Browser with metadata context */}
      <SmartAssetBrowser
        data-testid="smart-asset-browser"
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
    const assetThemes = new Set(
      asset.metadata.themes.map(t => t.name?.toLowerCase())
    );
    const segmentThemes = new Set(
      metadata.themes.map(t => t.name?.toLowerCase())
    );
    const intersection = new Set(
      [...assetThemes].filter(x => segmentThemes.has(x))
    );
    score +=
      (intersection.size / Math.max(assetThemes.size, segmentThemes.size)) *
      0.4;
  }

  // Entity matching
  if (asset.metadata?.entities && metadata.entities) {
    const assetEntities = new Set(
      asset.metadata.entities.map(e => e.name?.toLowerCase())
    );
    const segmentEntities = new Set(
      metadata.entities.map(e => e.name?.toLowerCase())
    );
    const intersection = new Set(
      [...assetEntities].filter(x => segmentEntities.has(x))
    );
    score +=
      (intersection.size / Math.max(assetEntities.size, segmentEntities.size)) *
      0.3;
  }

  // Style matching
  if (asset.metadata?.style && metadata.style) {
    const styleMatches = asset.metadata.style.filter(s =>
      metadata.style.some(ms => ms.toLowerCase().includes(s.toLowerCase()))
    );
    score +=
      (styleMatches.length /
        Math.max(asset.metadata.style.length, metadata.style.length)) *
      0.3;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

export default MetadataAssetBridge;
