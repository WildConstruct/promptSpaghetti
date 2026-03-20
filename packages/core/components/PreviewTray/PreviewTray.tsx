import React, { useEffect, useCallback, useRef, useState } from 'react';
import { PreviewResult } from '../epic1/contexts/PreviewContext';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import { usePreviewTrayKeyboardShortcuts } from './useKeyboardShortcuts';
// import { VirtualResultsList } from './VirtualResultsList'; // Not used currently
import { LLMToggleInline } from '../LLMToggle/LLMToggleInline';
import { PreviewRefinement } from './PreviewRefinement';
import { useIntelligence } from '../epic1/contexts/IntelligenceContext';
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

  // State for refinement
  const [refinementStyle, setRefinementStyle] =
    useState<string>('professional');
  const [refinedResults, setRefinedResults] = useState<Map<string, string>>(
    new Map()
  );
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
    const allResults = results
      .map(r => {
        const refined = refinedResults.get(`${r.seed}`);
        const text = llmMode === 'llm-enhanced' && refined ? refined : r.result;
        return `Seed ${r.seed}: ${text}`;
      })
      .join('\n');
    onCopy?.(allResults);
  }, [results, onCopy, llmMode, refinedResults]);

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
        className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[rgba(15,23,42,0.94)] relative shrink-0 cursor-pointer"
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
            className="absolute top-0 left-0 right-0 h-1.5 -mt-0.5 cursor-ns-resize z-20 hover:bg-white/10 transition-colors preview-tray-drag-handle"
            onMouseDown={handleDragStart}
          />
        )}
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-text uppercase flex items-center gap-2">
            Preview Output
            {seeds.length > 0 && (
              <span className="text-xs font-normal text-text-muted normal-case flex items-center">
                {seeds.length} seed{seeds.length === 1 ? '' : 's'}
              </span>
            )}
          </h2>
        </div>

        {/* Controls Container */}
        <div className="flex items-center gap-3 preview-tray-controls pr-2">
          {/* LLM Mode Toggle */}
          <div className="flex items-center mr-2">
            <LLMToggleInline
              initialMode={llmMode}
              onModeChange={onLLMModeChange}
              onConfigClick={onLLMConfigClick}
            />
          </div>

          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
            onClick={e => {
              e.stopPropagation();
              toggleMinimized();
            }}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className={`transition-transform duration-200 ${minimized ? '-rotate-90' : ''}`}
            >
              <path d="M1 2.5 L5 6.5 L9 2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
            onClick={e => {
              e.stopPropagation();
              handleClose();
            }}
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

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

          {!isExecuting && !error && (
            <div
              className="flex-1 overflow-x-auto custom-scrollbar p-4 flex gap-4 bg-black/20 relative min-h-0"
            >
              <div
                ref={scrollContainerRef}
                className="flex gap-4 min-w-max h-full pb-2"
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
                      color: '#94a3b8',
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
                          background: 'linear-gradient(180deg, #22d3ee, #0891b2)',
                          border: '1px solid rgba(103, 232, 249, 0.24)',
                          borderRadius: '999px',
                          color: '#ecfeff',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background =
                            'linear-gradient(180deg, #67e8f9, #0891b2)';
                          e.currentTarget.style.borderColor =
                            'rgba(103, 232, 249, 0.32)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background =
                            'linear-gradient(180deg, #22d3ee, #0891b2)';
                          e.currentTarget.style.borderColor =
                            'rgba(103, 232, 249, 0.24)';
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
                      const result = results.find(r => {
                        const resultSeedNum =
                          typeof r.seed === 'string'
                            ? parseInt(r.seed, 10)
                            : r.seed;
                        return resultSeedNum === seedNum;
                      });
                      return (
                        <div
                          key={`seed-${seed}-${index}`}
                          className="w-96 shrink-0 surface-panel rounded-xl border border-white/10 flex flex-col hover:border-white/20 transition-colors bg-[rgba(15,23,42,0.94)] relative overflow-hidden shadow-lg h-full"
                        >
                          {/* Seed label with inline edit */}
                          <div
                            className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-white/[0.02]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-text-muted">Seed</span>
                              {editingSeedIndex === index ? (
                                <input
                                  type="number"
                                  value={editingSeedValue}
                                  onChange={e => setEditingSeedValue(e.target.value)}
                                  onBlur={handleSeedSave}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSeedSave();
                                    if (e.key === 'Escape') setEditingSeedIndex(null);
                                  }}
                                  autoFocus
                                  className="w-16 px-1.5 py-0.5 bg-black/40 border border-primary/30 rounded text-xs text-text focus:outline-none focus:border-primary/60"
                                />
                              ) : (
                                <button
                                  onClick={() => handleSeedEdit(index)}
                                  className="text-xs font-mono text-text hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
                                >
                                  {seed}
                                </button>
                              )}
                              <button
                                onClick={() => handleRandomizeSeed(index)}
                                className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
                                title="Randomize seed"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                              </button>
                            </div>

                            {/* Delete button moved inside header */}
                            {seeds.length > 1 && (
                              <button
                                className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                onClick={() => handleDeleteSeed(index)}
                                title="Delete seed"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Result content */}
                          <div
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              paddingTop: '26px',
                              overflow: 'auto',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              if (result) {
                                // Copy refined text if available, otherwise original
                                const refined = refinedResults.get(`${seed}`);
                                const textToCopy =
                                  llmMode === 'llm-enhanced' && refined
                                    ? refined
                                    : result.result;
                                navigator.clipboard.writeText(textToCopy);
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
                                    color: '#e2e8f0',
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
                                  color: '#64748b',
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
                          border: '1px dashed rgba(103, 232, 249, 0.24)',
                          borderRadius: '14px',
                          background: 'transparent',
                          color: '#7dd3fc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#22d3ee';
                          e.currentTarget.style.color = '#67e8f9';
                          e.currentTarget.style.background =
                            'rgba(34, 211, 238, 0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor =
                            'rgba(103, 232, 249, 0.24)';
                          e.currentTarget.style.color = '#7dd3fc';
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
                  width: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  paddingLeft: '24px',
                  background:
                    'linear-gradient(180deg, rgba(8, 12, 20, 0.96), rgba(10, 16, 28, 0.9))',
                  boxShadow: '-12px 0 24px rgba(2, 6, 23, 0.24)'
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
                    background: 'rgba(103, 232, 249, 0.14)'
                  }}
                />
                <button
                  onClick={handleCopyAll}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.58)',
                    border: '1px solid rgba(103, 232, 249, 0.12)',
                    borderRadius: '12px',
                    color: '#e8f7ff',
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
                    e.currentTarget.style.background = 'rgba(34, 211, 238, 0.1)';
                    e.currentTarget.style.borderColor =
                      'rgba(103, 232, 249, 0.24)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.58)';
                    e.currentTarget.style.borderColor =
                      'rgba(103, 232, 249, 0.12)';
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
                      background: 'rgba(15, 23, 42, 0.58)',
                      border: '1px solid rgba(103, 232, 249, 0.12)',
                      borderRadius: '12px',
                      color: '#e8f7ff',
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
                      e.currentTarget.style.background =
                        'rgba(34, 211, 238, 0.1)';
                      e.currentTarget.style.borderColor =
                        'rgba(103, 232, 249, 0.24)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background =
                        'rgba(15, 23, 42, 0.58)';
                      e.currentTarget.style.borderColor =
                        'rgba(103, 232, 249, 0.12)';
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
