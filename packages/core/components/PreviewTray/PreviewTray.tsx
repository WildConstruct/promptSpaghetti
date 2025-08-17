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
  onSeedsChange?: (seeds: number[]) => void;
  onExecute?: () => void;
  onCancel?: () => void;
  onCopy?: (text: string) => void;
  onExport?: (format: 'json' | 'csv') => void;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  virtualizeThreshold?: number;
  /** If false, disable drag resizing and use fixed open/minimized heights */
  resizable?: boolean;
  /**
   * When true, render the tray as an absolute-positioned overlay at the bottom
   * of its positioned container rather than as a flex sibling that consumes
   * layout space.
   *
   * IMPORTANT: In Epic1 Graph Editor, this tray must NOT be an overlay.
   * It must remain a flex sibling that pushes the editor content up.
   * Do not pass overlay={true} in Epic1 contexts.
   */
  overlay?: boolean;
}

const TRAY_MIN_HEIGHT = 100;
const TRAY_DEFAULT_HEIGHT = 250;
const TRAY_MAX_HEIGHT_PERCENT = 0.6;
const TRAY_HEADER_HEIGHT = 40; // keep in sync with CSS

export const PreviewTray: React.FC<PreviewTrayProps> = ({
  seeds,
  results,
  isExecuting,
  error,
  onSeedsChange,
  onExecute,
  onCopy,
  onExport,
  minHeight = TRAY_MIN_HEIGHT,
  maxHeight,
  defaultHeight = TRAY_DEFAULT_HEIGHT,
  virtualizeThreshold = 100,
  resizable = true,
  overlay = false,
}) => {
  const {
    isOpen,
    height,
    activeTab,
    toggleTray,
    setHeight,
    setActiveTab,
    setOpen,
    minimized,
    toggleMinimized,
    setMinimized,
  } = usePreviewTrayStore();

  const trayRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Enable keyboard shortcuts
  usePreviewTrayKeyboardShortcuts();

  const maxHeightValue = maxHeight || window.innerHeight * TRAY_MAX_HEIGHT_PERCENT;

  // Removed minimize/maximize - using simple open/close

  const handleClose = useCallback(() => {
    toggleTray();
  }, [toggleTray]);

  const handleCopyAll = useCallback(() => {
    const allResults = results.map(r => `Seed ${r.seed}: ${r.result}`).join('\n');
    onCopy?.(allResults);
  }, [results, onCopy]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    
    requestAnimationFrame(() => {
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = Math.min(
        Math.max(dragStartHeight.current + deltaY, minHeight),
        maxHeightValue
      );
      
      setHeight(newHeight);
    });
  }, [minHeight, maxHeightValue, setHeight]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDragMove, true);
    document.removeEventListener('mouseup', handleDragEnd, true);
    document.body.style.cursor = '';
  }, [handleDragMove]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // Don't start drag if closed
    if (!isOpen || !resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    // Use capture so document receives events even if inner handlers stop propagation
    document.addEventListener('mousemove', handleDragMove, { capture: true });
    document.addEventListener('mouseup', handleDragEnd, { capture: true });
    document.body.style.cursor = 'ns-resize';
  }, [height, isOpen, resizable, handleDragMove, handleDragEnd]);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      if (isDragging.current) {
        document.removeEventListener('mousemove', handleDragMove, true);
        document.removeEventListener('mouseup', handleDragEnd, true);
        document.body.style.cursor = '';
      }
    };
  }, [handleDragMove, handleDragEnd]);

  // Auto-open when execution starts or when first results arrive
  const prevExecRef = useRef(isExecuting);
  const prevResultsCountRef = useRef(results.length);
  useEffect(() => {
    const prevExec = prevExecRef.current;
    const prevCount = prevResultsCountRef.current;
    const execStarted = !prevExec && isExecuting;
    const gotFirstResults = prevCount === 0 && results.length > 0;
    if (!isOpen && (execStarted || gotFirstResults)) {
      setOpen(true);
      setMinimized(false);
    }
    prevExecRef.current = isExecuting;
    prevResultsCountRef.current = results.length;
  }, [isExecuting, results.length, isOpen, setOpen, setMinimized]);

  const getTrayHeight = () => {
    if (!isOpen) return 0;
    if (minimized) return TRAY_HEADER_HEIGHT;
    if (!resizable) {
      // Use fixed height when not resizable
      return Math.min(Math.max(defaultHeight, minHeight), maxHeightValue);
    }
    const clamped = Math.min(
      Math.max((height || defaultHeight), minHeight),
      maxHeightValue
    );
    return clamped;
  };

  const trayClassName = `preview-tray ${isOpen ? 'open' : 'closed'} ${minimized ? 'minimized' : ''}`;

  return (
    <div 
      ref={trayRef}
      className={`${trayClassName} ${overlay ? 'overlay' : ''}`}
      style={{ height: getTrayHeight() }}
      data-testid="preview-tray"
      // Prevent event propagation to canvas behind
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        // Only stop propagation if not clicking on the drag handle/header controls
        if (!(e.target as HTMLElement).closest('.preview-tray-header')) {
          e.stopPropagation();
        }
      }}
      onMouseUp={(e) => { if (!isDragging.current) e.stopPropagation(); }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => { if (!isDragging.current) e.stopPropagation(); }}
    >
      <div 
        className="preview-tray-header"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          // Ignore clicks on handle or controls
          const t = e.target as HTMLElement;
          if (t.closest('.preview-tray-drag-handle') || t.closest('.preview-tray-controls')) return;
          toggleMinimized();
        }}
      >
        {resizable && isOpen && (
          <div className="preview-tray-drag-handle" onMouseDown={handleDragStart} />
        )}
        <div className="preview-tray-title">
          Preview Output {results.length > 0 && `(${results.length} results)`}
        </div>
        <div className="preview-tray-controls">
          <button 
            className="tray-control-btn minimize"
            onClick={(e) => { e.stopPropagation(); toggleMinimized(); }}
            title={minimized ? 'Expand' : 'Minimize'}
            aria-label={minimized ? 'Expand preview tray' : 'Minimize preview tray'}
          >
            <span className={`chevron ${!minimized ? 'open' : 'closed'}`}>⌄</span>
          </button>
          <button 
            className="tray-control-btn close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            title="Close"
            aria-label="Close preview tray"
          >
            ×
          </button>
        </div>
      </div>

      {isOpen && !minimized && onSeedsChange && (
        <div className="preview-seeds-editor" style={{
          padding: '10px',
          borderBottom: '1px solid #444',
          background: '#222',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#888', fontSize: '0.9em' }}>Seeds:</span>
          {seeds.map((seed, index) => (
            <input
              key={index}
              type="number"
              value={seed}
              onChange={(e) => {
                const newSeeds = [...seeds];
                newSeeds[index] = parseInt(e.target.value) || 0;
                onSeedsChange(newSeeds);
              }}
              style={{
                width: '80px',
                padding: '4px 8px',
                background: '#1a1a1a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.9em'
              }}
              title={`Seed ${index + 1}`}
            />
          ))}
          <button
            onClick={() => onSeedsChange([...seeds, Math.floor(Math.random() * 10000)])}
            style={{
              padding: '4px 8px',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
            title="Add seed"
          >
            + Add
          </button>
          {seeds.length > 1 && (
            <button
              onClick={() => onSeedsChange(seeds.slice(0, -1))}
              style={{
                padding: '4px 8px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
              title="Remove last seed"
            >
              − Remove
            </button>
          )}
        </div>
      )}

      {isOpen && !minimized && (
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
              ) : window.innerWidth > 1200 && results.length <= 6 ? (
                // Split view for wide screens (up to 6 results)
                <div className="seed-split-view" style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(results.length, 4)}, 1fr)`,
                  gap: '10px',
                  height: getTrayHeight() - 120,
                  overflow: 'auto',
                  padding: '10px'
                }}>
                  {results.map((result, index) => (
                    <div key={index} className="seed-column" style={{
                      border: '1px solid #444',
                      borderRadius: '4px',
                      padding: '10px',
                      overflow: 'auto',
                      background: '#1a1a1a',
                      cursor: 'pointer'
                    }} onClick={() => navigator.clipboard.writeText(result.result)}>
                      <div className="seed-label" style={{
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: '#888',
                        fontSize: '0.9em'
                      }}>Seed {result.seed}</div>
                      <div className="seed-result" style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#fff'
                      }}>{result.result}</div>
                    </div>
                  ))}
                </div>
              ) : results.length > 3 ? (
                // Tabs for narrow screens or many results
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
                // Simple list for 3 or fewer results
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

      {isOpen && !minimized && results.length > 0 && (
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