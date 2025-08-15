import React, { useEffect, useCallback, useRef } from 'react';
import { PreviewResult } from '../epic1/contexts/PreviewContext';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import { usePreviewTrayKeyboardShortcuts } from './useKeyboardShortcuts';
import { VirtualResultsList } from './VirtualResultsList';
import './PreviewTray.css';

export interface PreviewTrayProps {
  seeds: number[];
  results: PreviewResult[];
  isExecuting: boolean;
  error?: Error;
  onExecute?: () => void;
  onCancel?: () => void;
  onCopy?: (text: string) => void;
  onExport?: (format: 'json' | 'csv') => void;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  virtualizeThreshold?: number;
}

const TRAY_MIN_HEIGHT = 100;
const TRAY_DEFAULT_HEIGHT = 250;
const TRAY_MAX_HEIGHT_PERCENT = 0.6;

export const PreviewTray: React.FC<PreviewTrayProps> = ({
  seeds,
  results,
  isExecuting,
  error,
  onExecute,
  onCancel,
  onCopy,
  onExport,
  minHeight = TRAY_MIN_HEIGHT,
  maxHeight,
  defaultHeight = TRAY_DEFAULT_HEIGHT,
  virtualizeThreshold = 100,
}) => {
  const {
    isOpen,
    height,
    mode,
    isPinned,
    activeTab,
    toggleTray,
    setHeight,
    setMode,
    togglePin,
    setActiveTab,
  } = usePreviewTrayStore();

  const trayRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Enable keyboard shortcuts
  usePreviewTrayKeyboardShortcuts();

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      if (isDragging.current) {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = '';
      }
    };
  }, [handleDragMove, handleDragEnd]);

  const maxHeightValue = maxHeight || window.innerHeight * TRAY_MAX_HEIGHT_PERCENT;

  const handleToggle = useCallback(() => {
    toggleTray();
  }, [toggleTray]);

  const handleMinimize = useCallback(() => {
    setMode('minimized');
  }, [setMode]);

  const handleMaximize = useCallback(() => {
    setMode(mode === 'maximized' ? 'normal' : 'maximized');
  }, [mode, setMode]);

  const handleClose = useCallback(() => {
    toggleTray();
  }, [toggleTray]);

  const handleCopyAll = useCallback(() => {
    const allResults = results.map(r => `Seed ${r.seed}: ${r.result}`).join('\n');
    onCopy?.(allResults);
  }, [results, onCopy]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'ns-resize';
  }, [height]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = dragStartY.current - e.clientY;
    const newHeight = Math.min(
      Math.max(dragStartHeight.current + deltaY, minHeight),
      maxHeightValue
    );
    
    setHeight(newHeight);
  }, [minHeight, maxHeightValue, setHeight]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = '';
  }, [handleDragMove]);

  const getTrayHeight = () => {
    if (!isOpen) return 0;
    if (mode === 'minimized') return 40;
    if (mode === 'maximized') return maxHeightValue;
    return height;
  };

  const trayClassName = `preview-tray ${isOpen ? 'open' : 'closed'} ${mode}`;

  return (
    <div 
      ref={trayRef}
      className={trayClassName}
      style={{ height: getTrayHeight() }}
      data-testid="preview-tray"
    >
      <div 
        className="preview-tray-header"
        onMouseDown={handleDragStart}
      >
        <div className="preview-tray-drag-handle" />
        <div className="preview-tray-title">
          Preview Output {results.length > 0 && `(${results.length} results)`}
        </div>
        <div className="preview-tray-controls">
          <button 
            className="tray-control-btn minimize"
            onClick={handleMinimize}
            title="Minimize"
            aria-label="Minimize preview tray"
          >
            −
          </button>
          <button 
            className="tray-control-btn maximize"
            onClick={handleMaximize}
            title={mode === 'maximized' ? 'Restore' : 'Maximize'}
            aria-label={mode === 'maximized' ? 'Restore preview tray' : 'Maximize preview tray'}
          >
            {mode === 'maximized' ? '↓' : '↑'}
          </button>
          <button 
            className="tray-control-btn close"
            onClick={handleClose}
            title="Close"
            aria-label="Close preview tray"
          >
            ×
          </button>
        </div>
      </div>

      {mode !== 'minimized' && (
        <div className="preview-tray-content">
          {isExecuting && (
            <div className="preview-loading">
              <div className="loading-spinner" />
              <span>Generating preview...</span>
            </div>
          )}

          {error && (
            <div className="preview-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error.message}</span>
              <button onClick={onExecute} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!isExecuting && !error && results.length > 0 && (
            <div className="preview-results">
              {results.length > virtualizeThreshold ? (
                <VirtualResultsList 
                  results={results}
                  height={getTrayHeight() - 120} // Account for header and footer
                />
              ) : results.length > 3 ? (
                <>
                  <div className="seed-tab-buttons">
                    {results.map((result, index) => (
                      <button
                        key={index}
                        className={`seed-tab-button ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                        aria-selected={activeTab === index}
                        role="tab"
                      >
                        Seed {result.seed}
                      </button>
                    ))}
                  </div>
                  <div className="seed-tab-content" role="tabpanel">
                    <div className="seed-result">
                      {results[activeTab]?.result || ''}
                    </div>
                  </div>
                </>
              ) : (
                <div className="seed-tabs">
                  {results.map((result, index) => (
                    <div key={index} className="seed-tab">
                      <div className="seed-label">Seed {result.seed}</div>
                      <div className="seed-result">{result.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isExecuting && !error && results.length === 0 && (
            <div className="preview-empty">
              <p>No preview results yet</p>
              {onExecute && (
                <button onClick={onExecute} className="execute-btn">
                  Generate Preview
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {mode !== 'minimized' && results.length > 0 && (
        <div className="preview-tray-footer">
          <button onClick={handleCopyAll} className="action-btn">
            Copy All
          </button>
          <button onClick={() => onExport?.('json')} className="action-btn">
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
};