import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { PreviewResult } from '../epic1/contexts/PreviewContext';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import { usePreviewTrayKeyboardShortcuts } from './useKeyboardShortcuts';
// import { VirtualResultsList } from './VirtualResultsList'; // Not used currently
import { LLMToggleInline } from '../LLMToggle/LLMToggleInline';
import { PreviewRefinement } from './PreviewRefinement';
import { useIntelligence } from '../epic1/contexts/IntelligenceContext';
import {
  OUTPUT_TEMPLATE_OPTIONS,
  formatPreviewResultsForTemplate,
} from './outputTemplates';
import type { OutputTemplateId } from './outputTemplates';
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
  /** LLM mode settings */
  llmMode?: 'standard' | 'llm-enhanced';
  onLLMModeChange?: (mode: 'standard' | 'llm-enhanced') => void;
  onLLMConfigClick?: () => void;
}

const TRAY_MIN_HEIGHT = 100;
const TRAY_DEFAULT_HEIGHT = 250;
const TRAY_MAX_HEIGHT_PERCENT = 0.6;
const TRAY_HEADER_HEIGHT = 40; // keep in sync with CSS

function getComparableSeed(seed: number | string): number | string {
  if (typeof seed !== 'string') {
    return seed;
  }

  const numericSeed = parseInt(seed, 10);
  return Number.isNaN(numericSeed) ? seed : numericSeed;
}

function previewSeedMatches(
  resultSeed: number | string,
  currentSeed: number | string
): boolean {
  return getComparableSeed(resultSeed) === getComparableSeed(currentSeed);
}

export const PreviewTray: React.FC<PreviewTrayProps> = ({
  seeds,
  results = [],
  isExecuting,
  error,
  onSeedsChange,
  onExecute,
  onCopy,
  onExport,
  minHeight = TRAY_MIN_HEIGHT,
  maxHeight,
  defaultHeight = TRAY_DEFAULT_HEIGHT,
  // virtualizeThreshold = 100, // Not used currently
  resizable = true,
  overlay = false,
  llmMode = 'standard',
  onLLMModeChange,
  onLLMConfigClick
}) => {
  // Get intelligence services from context
  const { textRefinement } = useIntelligence();

  const {
    isOpen,
    height,
    // activeTab, // Not used currently
    toggleTray,
    setHeight,
    // setActiveTab, // Not used currently
    setOpen,
    minimized,
    toggleMinimized,
    setMinimized
  } = usePreviewTrayStore();

  const trayRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State for inline seed editing
  const [editingSeedIndex, setEditingSeedIndex] = useState<number | null>(null);
  const [editingSeedValue, setEditingSeedValue] = useState<string>('');

  // Which seed's result was just copied (drives the "Copied!" confirmation).
  const [copiedSeed, setCopiedSeed] = useState<number | string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyResult = useCallback(
    (seed: number | string, text: string) => {
      const writeFallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* ignore */
        }
        document.body.removeChild(ta);
      };
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).catch(writeFallback);
        } else {
          writeFallback();
        }
      } catch {
        writeFallback();
      }
      setCopiedSeed(seed);
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = setTimeout(() => setCopiedSeed(null), 1600);
    },
    []
  );

  // State for refinement
  const [refinementStyle, setRefinementStyle] =
    useState<string>('professional');
  const [refinedResults, setRefinedResults] = useState<Map<string, string>>(
    new Map()
  );
  const [selectedOutputTemplate, setSelectedOutputTemplate] =
    useState<OutputTemplateId>('plain');
  // const [currentRefinementSeed, setCurrentRefinementSeed] = useState<
  //   number | null
  // >(null); // Not used currently

  // Enable keyboard shortcuts
  usePreviewTrayKeyboardShortcuts();

  // Open tray when component mounts (parent controls visibility through conditional rendering)
  useEffect(() => {
    setOpen(true);
    setMinimized(false);
    // Also set a default height if none exists
    if (!height) {
      setHeight(defaultHeight);
    }
  }, [setOpen, setMinimized, setHeight, height, defaultHeight]);

  // Clear refined results when switching modes
  useEffect(() => {
    if (llmMode === 'standard') {
      setRefinedResults(new Map());
    }
  }, [llmMode]);

  const maxHeightValue =
    maxHeight || window.innerHeight * TRAY_MAX_HEIGHT_PERCENT;

  // Removed minimize/maximize - using simple open/close

  const handleClose = useCallback(() => {
    toggleTray();
  }, [toggleTray]);

  const handleCopyAll = useCallback(() => {
    const resultsToCopy = results.map(r => {
      const refined = refinedResults.get(`${r.seed}`);
      const text = llmMode === 'llm-enhanced' && refined ? refined : r.result;
      return {
        ...r,
        result: text
      };
    });
    const allResults = formatPreviewResultsForTemplate(resultsToCopy, {
      templateId: selectedOutputTemplate
    });
    onCopy?.(allResults);
  }, [results, onCopy, llmMode, refinedResults, selectedOutputTemplate]);

  const handleSeedEdit = useCallback(
    (index: number) => {
      setEditingSeedIndex(index);
      setEditingSeedValue(seeds[index].toString());
    },
    [seeds]
  );

  const handleSeedSave = useCallback(() => {
    if (editingSeedIndex !== null && onSeedsChange) {
      const newSeeds = [...seeds];
      newSeeds[editingSeedIndex] = parseInt(editingSeedValue) || 0;
      onSeedsChange(newSeeds);
      setEditingSeedIndex(null);
    }
  }, [editingSeedIndex, editingSeedValue, seeds, onSeedsChange]);

  const handleRandomizeSeed = useCallback(
    (index: number) => {
      if (onSeedsChange) {
        const newSeeds = [...seeds];
        newSeeds[index] = Math.floor(Math.random() * 10000);
        onSeedsChange(newSeeds);
      }
    },
    [seeds, onSeedsChange]
  );

  const handleDeleteSeed = useCallback(
    (index: number) => {
      if (onSeedsChange && seeds.length > 1) {
        const newSeeds = seeds.filter((_, i) => i !== index);
        onSeedsChange(newSeeds);
      }
    },
    [seeds, onSeedsChange]
  );

  const handleAddSeed = useCallback(() => {
    if (onSeedsChange) {
      onSeedsChange([...seeds, Math.floor(Math.random() * 10000)]);
      // Scroll to the new seed
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft =
            scrollContainerRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [seeds, onSeedsChange]);

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }

      requestAnimationFrame(() => {
        const deltaY = dragStartY.current - e.clientY;
        const newHeight = Math.min(
          Math.max(dragStartHeight.current + deltaY, minHeight),
          maxHeightValue
        );

        setHeight(newHeight);
      });
    },
    [minHeight, maxHeightValue, setHeight]
  );

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDragMove, true);
    document.removeEventListener('mouseup', handleDragEnd, true);
    document.body.style.cursor = '';
  }, [handleDragMove]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Don't start drag if closed
      if (!isOpen || !resizable) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartHeight.current = height;
      // Use capture so document receives events even if inner handlers stop propagation
      document.addEventListener('mousemove', handleDragMove, { capture: true });
      document.addEventListener('mouseup', handleDragEnd, { capture: true });
      document.body.style.cursor = 'ns-resize';
    },
    [height, isOpen, resizable, handleDragMove, handleDragEnd]
  );

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
  const prevResultsCountRef = useRef(results?.length || 0);
  useEffect(() => {
    const prevExec = prevExecRef.current;
    const prevCount = prevResultsCountRef.current;
    const currentResultsLength = results?.length || 0;
    const execStarted = !prevExec && isExecuting;
    const gotFirstResults = prevCount === 0 && currentResultsLength > 0;
    if (!isOpen && (execStarted || gotFirstResults)) {
      setOpen(true);
      setMinimized(false);
    }
    prevExecRef.current = isExecuting;
    prevResultsCountRef.current = currentResultsLength;
  }, [isExecuting, results?.length, isOpen, setOpen, setMinimized]);

  const hasCurrentSeedResult = useMemo(
    () =>
      seeds.some(seed =>
        results.some(result => previewSeedMatches(result.seed, seed))
      ),
    [results, seeds]
  );
  const showGlobalLoading = isExecuting && !hasCurrentSeedResult;

  const getTrayHeight = () => {
    // Since parent controls visibility through conditional rendering,
    // we should always show with proper height when rendered
    if (minimized) {
      return TRAY_HEADER_HEIGHT;
    }
    if (!resizable) {
      // Use fixed height when not resizable
      return Math.min(Math.max(defaultHeight, minHeight), maxHeightValue);
    }
    const clamped = Math.min(
      Math.max(height || defaultHeight, minHeight),
      maxHeightValue
    );
    return clamped;
  };

  // Always use 'open' class since parent controls visibility through conditional rendering
  const trayClassName = `preview-tray open ${minimized ? 'minimized' : ''}`;

  return (
    <div
      ref={trayRef}
      className={`${trayClassName} ${overlay ? 'overlay' : ''}`}
      style={{ height: getTrayHeight() }}
      data-testid="preview-tray"
      // Prevent event propagation to canvas behind
      onClick={e => e.stopPropagation()}
      onMouseDown={e => {
        // Only stop propagation if not clicking on the drag handle/header controls
        if (!(e.target as HTMLElement).closest('.preview-tray-header')) {
          e.stopPropagation();
        }
      }}
      onMouseUp={e => {
        if (!isDragging.current) {
          e.stopPropagation();
        }
      }}
      onPointerDown={e => e.stopPropagation()}
      onPointerUp={e => {
        if (!isDragging.current) {
          e.stopPropagation();
        }
      }}
    >
      <div
        className="preview-tray-header"
        style={{ cursor: 'pointer' }}
        onClick={e => {
          // Ignore clicks on handle or controls
          const t = e.target as HTMLElement;
          if (
            t.closest('.preview-tray-drag-handle') ||
            t.closest('.preview-tray-controls')
          ) {
            return;
          }
          toggleMinimized();
        }}
      >
        {resizable && isOpen && (
          <div
            className="preview-tray-drag-handle"
            onMouseDown={handleDragStart}
          />
        )}
        <div
          className="preview-tray-title"
          style={{
            fontWeight: 500,
            fontSize: '14px',
            color: '#e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ textTransform: 'uppercase' }}>Preview Output</span>
          {seeds.length > 0 && (
            <span
              style={{
                fontSize: '12px',
                color: '#999',
                fontWeight: 'normal'
              }}
            >
              {seeds.length} seed{seeds.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* LLM Mode Toggle */}
        <div style={{ marginLeft: 'auto', marginRight: '12px' }}>
          <LLMToggleInline
            initialMode={llmMode}
            onModeChange={onLLMModeChange}
            onConfigClick={onLLMConfigClick}
          />
        </div>

        <div className="preview-tray-controls">
          <button
            className="tray-control-btn minimize"
            onClick={e => {
              e.stopPropagation();
              toggleMinimized();
            }}
            title={minimized ? 'Expand' : 'Minimize'}
            aria-label={
              minimized ? 'Expand preview tray' : 'Minimize preview tray'
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              style={{
                transform: minimized ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
                fill: 'currentColor'
              }}
            >
              <path d="M0 0 L8 4 L0 8 Z" />
            </svg>
          </button>
          <button
            className="tray-control-btn close"
            onClick={e => {
              e.stopPropagation();
              handleClose();
            }}
            title="Close"
            aria-label="Close preview tray"
          >
            ×
          </button>
        </div>
      </div>

      {isOpen && !minimized && (
        <div className="preview-tray-content">
          {showGlobalLoading && (
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

          {!showGlobalLoading && !error && (
            <div
              className="preview-results-container"
              style={{
                display: 'flex',
                height: '100%',
                position: 'relative'
              }}
            >
              <div
                ref={scrollContainerRef}
                className="preview-results-scroll"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: '400px', // Updated to match much wider actions panel
                  bottom: 0,
                  display: 'flex',
                  gap: '10px', // Slightly smaller gap to fit 4 boxes better
                  padding: '0 10px', // Consistent smaller padding
                  paddingRight: '10px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollBehavior: 'smooth'
                }}
              >
                {/* Show empty state if no results yet */}
                {results.length === 0 ? (
                  <div
                    className="preview-empty"
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      gap: '16px'
                    }}
                  >
                    <p>No preview results yet</p>
                    {onExecute && (
                      <button
                        onClick={onExecute}
                        className="execute-btn"
                        style={{
                          padding: '8px 16px',
                          background: '#2a2a2a',
                          border: '1px solid #444',
                          borderRadius: '6px',
                          color: '#e8e8e8',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#333';
                          e.currentTarget.style.borderColor = '#f4c64d';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#2a2a2a';
                          e.currentTarget.style.borderColor = '#444';
                        }}
                      >
                        Generate Preview
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* All seeds */}
                    {seeds.map((seed, index) => {
                      // Convert both to numbers for consistent comparison
                      const seedNum =
                        typeof seed === 'string' ? parseInt(seed, 10) : seed;
                      const result = results.find(r =>
                        previewSeedMatches(r.seed, seedNum)
                      );
                      return (
                        <div
                          key={`seed-${seed}-${index}`}
                          className="preview-result-box"
                          style={{
                            flex: '0 0 440px', // Wider boxes to better fill space
                            minWidth: '440px',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            background: '#1a1a1a',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Copy affordance / confirmation (bottom-right) */}
                          {result && (
                            <div
                              className={
                                copiedSeed === seed
                                  ? 'preview-copy-chip copied'
                                  : 'preview-copy-chip'
                              }
                              style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                zIndex: 5,
                                pointerEvents: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                transition: 'all 0.18s ease',
                                background:
                                  copiedSeed === seed ? '#10b981' : 'rgba(0,0,0,0.55)',
                                color:
                                  copiedSeed === seed ? '#ffffff' : 'rgba(255,255,255,0.55)',
                                border:
                                  copiedSeed === seed
                                    ? '1px solid #10b981'
                                    : '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              {copiedSeed === seed ? '✓ Copied' : '⧉ Click to copy'}
                            </div>
                          )}

                          {/* Delete button */}
                          {seeds.length > 1 && (
                            <button
                              className="preview-delete-seed"
                              onClick={() => handleDeleteSeed(index)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '20px',
                                height: '20px',
                                border: 'none',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#888',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                lineHeight: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                transition: 'background 0.2s, color 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background =
                                  'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background =
                                  'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.color = '#888';
                              }}
                              title="Delete seed"
                            >
                              ×
                            </button>
                          )}

                          {/* Seed label with inline edit */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span
                              style={{
                                color: '#666',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Seed
                            </span>
                            {editingSeedIndex === index ? (
                              <input
                                type="number"
                                value={editingSeedValue}
                                onChange={e =>
                                  setEditingSeedValue(e.target.value)
                                }
                                onBlur={handleSeedSave}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handleSeedSave();
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingSeedIndex(null);
                                  }
                                }}
                                autoFocus
                                style={{
                                  width: '60px',
                                  padding: '1px 4px',
                                  background: '#1a1a1a',
                                  border: '1px solid #f4c64d',
                                  borderRadius: '3px',
                                  color: '#fff',
                                  fontSize: '12px',
                                  outline: 'none'
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => handleSeedEdit(index)}
                                style={{
                                  padding: '1px 4px',
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  borderRadius: '3px',
                                  color: '#e8e8e8',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'border-color 0.2s'
                                }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.borderColor = '#444')
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.borderColor =
                                    'transparent')
                                }
                              >
                                {seed}
                              </button>
                            )}
                            <button
                              onClick={() => handleRandomizeSeed(index)}
                              style={{
                                width: '20px',
                                height: '20px',
                                border: 'none',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={e =>
                                (e.currentTarget.style.background =
                                  'rgba(248, 200, 74, 0.16)')
                              }
                              onMouseLeave={e =>
                                (e.currentTarget.style.background =
                                  'rgba(255, 255, 255, 0.05)')
                              }
                              title="Randomize seed"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <circle cx="15.5" cy="15.5" r="1.5" />
                              </svg>
                            </button>
                          </div>

                          {/* Result content */}
                          <div
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              paddingTop: '26px', // Just enough space for seed label
                              overflow: 'auto',
                              cursor: 'pointer'
                            }}
                            title="Click to copy this result"
                            onClick={() => {
                              if (result) {
                                // Copy refined text if available, otherwise original
                                const refined = refinedResults.get(`${seed}`);
                                const textToCopy =
                                  llmMode === 'llm-enhanced' && refined
                                    ? refined
                                    : result.result;
                                handleCopyResult(seed, textToCopy);
                              }
                            }}
                          >
                            {result ? (
                              <>
                                {/* Show refinement UI when in LLM mode */}
                                {llmMode === 'llm-enhanced' && (
                                  <PreviewRefinement
                                    originalText={result.result}
                                    refinementService={textRefinement}
                                    onRefined={refined => {
                                      const newRefined = new Map(
                                        refinedResults
                                      );
                                      newRefined.set(`${seed}`, refined);
                                      setRefinedResults(newRefined);
                                    }}
                                    isActive={llmMode === 'llm-enhanced'}
                                    selectedStyle={refinementStyle}
                                    onStyleChange={setRefinementStyle}
                                  />
                                )}

                                {/* Show the text - refined if available, otherwise original */}
                                <div
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    color: '#e8e8e8',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    marginTop:
                                      llmMode === 'llm-enhanced' ? '8px' : '0'
                                  }}
                                >
                                  {(() => {
                                    const refined = refinedResults.get(
                                      `${seed}`
                                    );
                                    if (llmMode === 'llm-enhanced' && refined) {
                                      return refined;
                                    }
                                    return result.result;
                                  })()}
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  color: '#666',
                                  fontSize: '14px',
                                  fontStyle: 'italic'
                                }}
                              >
                                No result yet
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add new seed button */}
                    <div
                      className="preview-add-seed-box"
                      style={{
                        flex: '0 0 60px',
                        minWidth: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <button
                        onClick={handleAddSeed}
                        style={{
                          width: '40px',
                          height: '40px',
                          border: '2px dashed #444',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#666',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#f4c64d';
                          e.currentTarget.style.color = '#f4c64d';
                          e.currentTarget.style.background =
                            'rgba(248, 200, 74, 0.12)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#444';
                          e.currentTarget.style.color = '#666';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Add new seed"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Actions panel on the right - like Asset Browser */}
              <div
                className="preview-actions-panel"
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  bottom: '0',
                  width: '400px', // Doubled the width
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  paddingLeft: '28px', // More padding for divider space
                  background: '#2a2a2a',
                  boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Vertical divider line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '0',
                    bottom: '0',
                    width: '3px',
                    background: '#3a3a3a'
                  }}
                />
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    color: '#b8b8b8',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  Output template
                  <select
                    value={selectedOutputTemplate}
                    onChange={event =>
                      setSelectedOutputTemplate(
                        event.target.value as OutputTemplateId
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      background: '#1a1a1a',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#e8e8e8',
                      fontSize: '13px'
                    }}
                    title={
                      OUTPUT_TEMPLATE_OPTIONS.find(
                        o => o.id === selectedOutputTemplate
                      )?.description
                    }
                  >
                    {OUTPUT_TEMPLATE_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedOutputTemplate === 'three-up-image-prompt' &&
                    results.length < 3 && (
                      <span
                        style={{
                          color: '#a08040',
                          fontSize: '11px',
                          fontWeight: 400,
                          lineHeight: 1.35
                        }}
                      >
                        Needs at least 3 seed results (incomplete triples are
                        skipped).
                      </span>
                    )}
                </label>
                <button
                  onClick={handleCopyAll}
                  style={{
                    padding: '10px 12px',
                    background: '#1a1a1a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#e8e8e8',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.borderColor = '#f4c64d';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#444';
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy All
                </button>

                {onExport && (
                  <button
                    onClick={() => onExport('json')}
                    style={{
                      padding: '10px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#e8e8e8',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#333';
                      e.currentTarget.style.borderColor = '#f4c64d';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.borderColor = '#444';
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export JSON
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
