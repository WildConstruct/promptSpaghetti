/**
 * PreviewPanel - Displays execution results for Epic 1
 * 
 * Shows multiple variations generated from different seeds with
 * loading states, error handling, and seed controls.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PreviewEngine, PreviewState, PreviewUpdate } from './PreviewEngine';
import { ExecutionResult } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { DiffEngine, ChangeSet } from './DiffEngine';
import { DiffViewer, DiffIndicator, ChangeHighlight } from './DiffViewer';
import './PreviewPanel.css';

export interface PreviewPanelProps {
  previewEngine: PreviewEngine;
  className?: string;
  onSeedChange?: (seeds: (string | number)[]) => void;
  onClose?: () => void;
}

interface SeedConfig {
  value: string | number;
  isCustom: boolean;
}

/**
 * PreviewPanel Component
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewEngine,
  className = '',
  onSeedChange,
  onClose
}) => {
  const [previewUpdate, setPreviewUpdate] = useState<PreviewUpdate | null>(null);
  const [seeds, setSeeds] = useState<SeedConfig[]>([]);
  const [showSeedControls, setShowSeedControls] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Diff tracking
  const diffEngine = useRef(new DiffEngine());
  const [changeSet, setChangeSet] = useState<ChangeSet | null>(null);
  const previousResults = useRef<string[]>([]);

  // Subscribe to preview engine updates
  useEffect(() => {
    const unsubscribe = previewEngine.subscribe((update) => {
      setPreviewUpdate(update);
      
      // Track changes when we have results
      if (update.state === PreviewState.IDLE && update.results) {
        const currentOutputs = update.results.map(r => r.output || '');
        
        if (previousResults.current.length > 0) {
          const changes = diffEngine.current.trackChanges(
            previousResults.current,
            currentOutputs
          );
          setChangeSet(changes);
          
          // Clear change highlights after animation
          setTimeout(() => setChangeSet(null), 3000);
        }
        
        previousResults.current = currentOutputs;
      }
    });

    // Initialize seeds from engine
    const engineSeeds = previewEngine.getSeeds();
    setSeeds(engineSeeds.map(s => ({ value: s, isCustom: false })));

    return unsubscribe;
  }, [previewEngine]);

  // Handle seed changes
  const handleSeedChange = useCallback((index: number, value: string) => {
    const newSeeds = [...seeds];
    newSeeds[index] = { value: value || 1234, isCustom: true };
    setSeeds(newSeeds);

    const seedValues = newSeeds.map(s => s.value);
    previewEngine.setSeeds(seedValues);
    onSeedChange?.(seedValues);
  }, [seeds, previewEngine, onSeedChange]);

  // Add new seed
  const handleAddSeed = useCallback(() => {
    const newSeed = { value: Math.floor(Math.random() * 10000), isCustom: true };
    const newSeeds = [...seeds, newSeed];
    setSeeds(newSeeds);

    const seedValues = newSeeds.map(s => s.value);
    previewEngine.setSeeds(seedValues);
    onSeedChange?.(seedValues);
  }, [seeds, previewEngine, onSeedChange]);

  // Remove seed
  const handleRemoveSeed = useCallback((index: number) => {
    if (seeds.length <= 1) return; // Keep at least one seed

    const newSeeds = seeds.filter((_, i) => i !== index);
    setSeeds(newSeeds);

    const seedValues = newSeeds.map(s => s.value);
    previewEngine.setSeeds(seedValues);
    onSeedChange?.(seedValues);
  }, [seeds, previewEngine, onSeedChange]);

  // Copy result to clipboard
  const handleCopyResult = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  }, []);

  // Render loading state
  const renderLoading = () => (
    <div className="preview-loading">
      <div className="preview-spinner" />
      <div className="preview-loading-text">
        {previewUpdate?.state === PreviewState.PENDING ? 'Waiting...' : 'Executing...'}
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="preview-error">
      <div className="preview-error-icon">⚠️</div>
      <div className="preview-error-message">
        {previewUpdate?.error?.message || 'An error occurred during execution'}
      </div>
    </div>
  );

  // Render single result
  const renderResult = (result: ExecutionResult, index: number) => {
    const hasError = !result.success;
    const output = result.output || '';
    const seed = seeds[index]?.value || 'Unknown';
    
    // Check if this result has changes
    const isChanged = changeSet?.changedIndices.includes(index) || false;
    const diffData = changeSet?.diffs.find(d => d.index === index);

    return (
      <ChangeHighlight key={index} isChanged={isChanged} className={`preview-result ${hasError ? 'has-error' : ''}`}>
        <div className="preview-result-header">
          <span className="preview-seed">Seed: {seed}</span>
          {diffData && (
            <DiffIndicator 
              hasChanges={true}
              addedCount={diffData.diff.addedCount}
              removedCount={diffData.diff.removedCount}
            />
          )}
          <div className="preview-result-actions">
            <button
              className={`preview-copy-btn ${copiedIndex === index ? 'copied' : ''}`}
              onClick={() => handleCopyResult(output, index)}
              disabled={hasError}
              title="Copy to clipboard"
            >
              {copiedIndex === index ? '✓' : '📋'}
            </button>
          </div>
        </div>
        
        <div className="preview-result-content">
          {hasError ? (
            <div className="preview-result-error">
              {result.stats.errors[0]?.error.message || 'Execution failed'}
            </div>
          ) : (
            <>
              {diffData ? (
                <DiffViewer diff={diffData.diff} className="preview-result-text" />
              ) : (
                <div className="preview-result-text">{output}</div>
              )}
            </>
          )}
        </div>

        {result.stats.warnings.length > 0 && (
          <div className="preview-result-warnings">
            {result.stats.warnings.map((warning, i) => (
              <div key={i} className="preview-warning">
                ⚠️ {warning.message}
              </div>
            ))}
          </div>
        )}
      </ChangeHighlight>
    );
  };

  // Render results
  const renderResults = () => {
    if (!previewUpdate?.results || previewUpdate.results.length === 0) {
      return (
        <div className="preview-empty">
          <div className="preview-empty-icon">📝</div>
          <div className="preview-empty-text">
            Edit your graph to see preview results
          </div>
        </div>
      );
    }

    return (
      <div className="preview-results">
        {previewUpdate.results.map((result, index) => renderResult(result, index))}
      </div>
    );
  };

  // Render seed controls
  const renderSeedControls = () => (
    <div className="preview-seed-controls">
      <div className="preview-seed-header">
        <h4>Seeds</h4>
        <button 
          className="preview-seed-add"
          onClick={handleAddSeed}
          title="Add seed"
        >
          +
        </button>
      </div>
      
      <div className="preview-seed-list">
        {seeds.map((seed, index) => (
          <div key={index} className="preview-seed-item">
            <input
              type="text"
              value={seed.value}
              onChange={(e) => handleSeedChange(index, e.target.value)}
              className="preview-seed-input"
              placeholder="Enter seed"
            />
            {seeds.length > 1 && (
              <button
                className="preview-seed-remove"
                onClick={() => handleRemoveSeed(index)}
                title="Remove seed"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Main render
  const isLoading = previewUpdate?.state === PreviewState.PENDING || 
                   previewUpdate?.state === PreviewState.EXECUTING;
  const hasError = previewUpdate?.state === PreviewState.ERROR;

  return (
    <div className={`preview-panel ${className}`}>
      <div className="preview-header">
        <h3 className="preview-title">Preview</h3>
        <div className="preview-header-actions">
          <button
            className="preview-seed-toggle"
            onClick={() => setShowSeedControls(!showSeedControls)}
            title="Toggle seed controls"
          >
            🎲
          </button>
          {onClose && (
            <button
              className="preview-close"
              onClick={onClose}
              title="Close preview"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {showSeedControls && renderSeedControls()}

      <div className="preview-content">
        {isLoading && renderLoading()}
        {hasError && !isLoading && renderError()}
        {!isLoading && !hasError && renderResults()}
      </div>

      {previewUpdate && (
        <div className="preview-footer">
          <div className="preview-stats">
            {previewUpdate.results && (
              <>
                <span>{previewUpdate.results.length} variations</span>
                {previewUpdate.state === PreviewState.IDLE && (
                  <span className="preview-timing">
                    {Math.max(...previewUpdate.results.map(r => r.stats.totalDuration))}ms
                  </span>
                )}
                {changeSet && changeSet.changedIndices.length > 0 && (
                  <span className="preview-change-summary">
                    {diffEngine.current.summarizeChanges(changeSet)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};