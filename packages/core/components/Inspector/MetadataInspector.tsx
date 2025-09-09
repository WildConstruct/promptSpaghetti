// Metadata Inspector for Developer Mode - Story 2.3a
// Shows extracted metadata and provides manual re-extraction controls

import React, { useState, useCallback, useEffect } from 'react';
import {
  SegmentMetadata,
  MetadataExtractor
} from '../../services/llm/MetadataExtractor';
import './MetadataInspector.css';

interface MetadataInspectorProps {
  metadata?: SegmentMetadata;
  text: string;
  nodeId: string;
  metadataExtractor?: MetadataExtractor;
  onMetadataUpdate?: (metadata: SegmentMetadata) => void;
  developerMode?: boolean;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({
  metadata,
  text,
  nodeId,
  metadataExtractor,
  onMetadataUpdate,
  developerMode = false
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionLog, setExtractionLog] = useState<string[]>([]);
  const [showRawJson, setShowRawJson] = useState(false);
  const [cacheStats, setCacheStats] = useState({ size: 0, hitRate: 0 });

  // Update cache stats periodically
  useEffect(() => {
    if (!metadataExtractor || !developerMode) return;

    const updateStats = () => {
      const stats = metadataExtractor.getCacheStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [metadataExtractor, developerMode]);

  const handleManualExtraction = useCallback(async () => {
    if (!metadataExtractor || !text) return;

    setIsExtracting(true);
    const startTime = performance.now();

    try {
      setExtractionLog(prev => [
        ...prev,
        `[${new Date().toISOString()}] Starting extraction for node ${nodeId}`
      ]);

      const result = await metadataExtractor.extract(text);
      const extractionTime = performance.now() - startTime;

      setExtractionLog(prev => [
        ...prev,
        `[${new Date().toISOString()}] Extraction completed in ${extractionTime.toFixed(2)}ms`,
        `[${new Date().toISOString()}] From cache: ${result.fromCache}`,
        `[${new Date().toISOString()}] Tags extracted: ${result.metadata.tags.join(', ') || 'none'}`
      ]);

      if (onMetadataUpdate) {
        onMetadataUpdate(result.metadata);
      }
    } catch (error) {
      setExtractionLog(prev => [
        ...prev,
        `[${new Date().toISOString()}] Extraction failed: ${error}`
      ]);
    } finally {
      setIsExtracting(false);
    }
  }, [metadataExtractor, text, nodeId, onMetadataUpdate]);

  const handleClearMetadata = useCallback(() => {
    if (onMetadataUpdate) {
      onMetadataUpdate({ tags: [] });
    }
    setExtractionLog(prev => [
      ...prev,
      `[${new Date().toISOString()}] Metadata cleared for node ${nodeId}`
    ]);
  }, [nodeId, onMetadataUpdate]);

  const handleClearCache = useCallback(() => {
    if (metadataExtractor) {
      metadataExtractor.clearCache();
      setExtractionLog(prev => [
        ...prev,
        `[${new Date().toISOString()}] Cache cleared`
      ]);
      setCacheStats({ size: 0, hitRate: 0 });
    }
  }, [metadataExtractor]);

  if (!developerMode) {
    return null; // Hidden in normal mode
  }

  return (
    <div className="metadata-inspector">
      <div className="inspector-header">
        <h3>Metadata Debug</h3>
        <div className="cache-stats">
          <span className="stat">Cache: {cacheStats.size} items</span>
          <span className="stat">
            Hit Rate: {(cacheStats.hitRate * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {metadata && (
        <div className="metadata-content">
          <div className="metadata-summary">
            {metadata.subject && (
              <div className="metadata-field">
                <span className="field-label">Subject:</span>
                <span className="field-value">{metadata.subject}</span>
              </div>
            )}
            {metadata.action && (
              <div className="metadata-field">
                <span className="field-label">Action:</span>
                <span className="field-value">{metadata.action}</span>
              </div>
            )}
            {metadata.location && (
              <div className="metadata-field">
                <span className="field-label">Location:</span>
                <span className="field-value">{metadata.location}</span>
              </div>
            )}
            {metadata.mood && (
              <div className="metadata-field">
                <span className="field-label">Mood:</span>
                <span className="field-value">{metadata.mood}</span>
              </div>
            )}
            {metadata.intensity !== undefined && (
              <div className="metadata-field">
                <span className="field-label">Intensity:</span>
                <span className="field-value">
                  <div className="intensity-bar">
                    <div
                      className="intensity-fill"
                      style={{ width: `${metadata.intensity * 10}%` }}
                    />
                  </div>
                  <span className="intensity-value">
                    {metadata.intensity}/10
                  </span>
                </span>
              </div>
            )}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="metadata-field">
                <span className="field-label">Tags:</span>
                <div className="tags-list">
                  {metadata.tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {metadata.extracted_by && (
              <div className="metadata-field extraction-info">
                <span className="field-label">Extracted by:</span>
                <span className="field-value">{metadata.extracted_by}</span>
              </div>
            )}
            {metadata.extraction_date && (
              <div className="metadata-field extraction-info">
                <span className="field-label">Date:</span>
                <span className="field-value">
                  {new Date(metadata.extraction_date).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="metadata-actions">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="action-btn"
            >
              {showRawJson ? 'Hide' : 'Show'} Raw JSON
            </button>
            <button
              onClick={handleManualExtraction}
              disabled={isExtracting || !metadataExtractor}
              className="action-btn primary"
            >
              {isExtracting ? 'Extracting...' : 'Re-extract'}
            </button>
            <button onClick={handleClearMetadata} className="action-btn danger">
              Clear Metadata
            </button>
            <button
              onClick={handleClearCache}
              disabled={!metadataExtractor}
              className="action-btn"
            >
              Clear Cache
            </button>
          </div>

          {showRawJson && (
            <div className="raw-json">
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {!metadata && (
        <div className="no-metadata">
          <p>No metadata extracted yet</p>
          <button
            onClick={handleManualExtraction}
            disabled={isExtracting || !metadataExtractor || !text}
            className="action-btn primary"
          >
            {isExtracting ? 'Extracting...' : 'Extract Metadata'}
          </button>
        </div>
      )}

      {extractionLog.length > 0 && (
        <div className="extraction-log">
          <h4>Extraction Log</h4>
          <div className="log-content">
            {extractionLog.slice(-10).map((log, i) => (
              <div key={i} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
