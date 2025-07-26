/**
 * Epic 8.5 - Enhanced Preview Modal for Film Industry Professionals
 * 
 * Professional-grade preview system with individual result management,
 * designed for the Wild Construct film industry demo.
 * 
 * Features:
 * - Individual result selection and management
 * - Professional UI suitable for cinema professionals
 * - Result persistence and organization
 * - Export integration
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ErrorFactory } from '../../errors/ErrorFactory';
import { VarianceAnalysis } from '../../hooks/useEnhancedPreview';
import { CreativeVarianceAnalyzer } from '../VarianceAnalysis/CreativeVarianceAnalyzer';
import { VarianceVisualization } from '../VarianceAnalysis/VarianceVisualization';

// Enhanced result interface for film industry use
export interface EnhancedPreviewResult {
  seed: number;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  usedNodeIds?: string[];
  usedEdgeIds?: string[];
  
  // Film industry metadata
  metadata?: {
    createdAt: Date;
    wordCount?: number;
    characterCount?: number;
    estimatedReadingTime?: number;
    contentType?: 'dialogue' | 'action' | 'description' | 'mixed';
    tags?: string[];
    rating?: 1 | 2 | 3 | 4 | 5; // Professional rating
    notes?: string;
  };
  
  // Management state
  id: string;
  selected?: boolean;
  saved?: boolean;
  exported?: boolean;
}

interface EnhancedPreviewModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: EnhancedPreviewResult[];
  varianceAnalysis?: VarianceAnalysis | null;
  onClose: () => void;
  onCancel?: () => void;
  onResultHover?: (index: number) => void;
  
  // Enhanced functionality
  onResultSelect?: (resultId: string, selected: boolean) => void;
  onResultSave?: (resultId: string, metadata?: Record<string, unknown>) => Promise<void>;
  onResultExport?: (resultIds: string[]) => Promise<void>;
  onResultRate?: (resultId: string, rating: number) => void;
  onResultTag?: (resultId: string, tags: string[]) => void;
  onResultNote?: (resultId: string, note: string) => void;
  
  // Configuration
  enableSelection?: boolean;
  enableRating?: boolean;
  enableNotes?: boolean;
  enableExport?: boolean;
  maxResults?: number;
}

export   const [activeTab, setActiveTab] = useState<'results' | 'analysis' | 'visualization'>('results');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [ratingInProgress, setRatingInProgress] = useState<string | null>(null);
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Enhanced result statistics
  const resultStats = useMemo(() => {
    if (!results.length) return null;
    
    const validResults = results.filter(r => !r.error);
    const totalWords = validResults.reduce((sum, r) => sum + (r.metadata?.wordCount || 0), 0);
    const avgReadingTime = validResults.reduce(
      (sum,
        r
      ) => sum + (r.metadata?.estimatedReadingTime || 0), 0) / validResults.length;
    const avgRating = validResults.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / validResults.length;
    
    return {
      totalResults: results.length,
      validResults: validResults.length,
      errorResults: results.length - validResults.length,
      totalWords,
      avgReadingTime: Math.round(avgReadingTime * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      selectedCount: selectedResults.size,
      savedCount: results.filter(r => r.saved).length
    };
  }, [results, selectedResults.size]);

  const handleResultSelect = useCallback((resultId: string, selected: boolean) => {
    const newSelected = new Set(selectedResults);
    if (selected) {
      newSelected.add(resultId);
    } else {
      newSelected.delete(resultId);
    }
    setSelectedResults(newSelected);
    onResultSelect?.(resultId, selected);
  }, [selectedResults, onResultSelect]);

  const handleSelectAll = useCallback(() => {
    const allResultIds = new Set(results.map(r => r.id));
    setSelectedResults(allResultIds);
    results.forEach(r => onResultSelect?.(r.id, true));
  }, [results, onResultSelect]);

  const handleClearSelection = useCallback(() => {
    selectedResults.forEach(id => onResultSelect?.(id, false));
    setSelectedResults(new Set());
  }, [selectedResults, onResultSelect]);

  const handleBatchExport = useCallback(async () => {
    if (selectedResults.size === 0) return;
    
    try {
      await onResultExport?.(Array.from(selectedResults));
    } catch (error) {
      throw ErrorFactory.createGraphExecutionError(
        'Failed to export selected results',
        error as Error,
        { operation: 'batch_export' }
      );
    }
  }, [selectedResults, onResultExport]);

  const handleRating = useCallback((resultId: string, rating: number) => {
    setRatingInProgress(resultId);
    onResultRate?.(resultId, rating);
    setTimeout(() => setRatingInProgress(null), 500);
  }, [onResultRate]);

  const handleNoteSave = useCallback((resultId: string) => {
    onResultNote?.(resultId, tempNote);
    setNoteEditing(null);
    setTempNote('');
  }, [tempNote, onResultNote]);

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
    case 'dialogue': return '💬';
    case 'action': return '🎬';
    case 'description': return '📝';
    default: return '📄';
    }
  };

  const formatExecutionTime = (timeMs?: number) => {
    if (!timeMs) return 'N/A';
    return timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`;
  };

  if (!open) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="preview-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="preview-modal-content"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: 16,
          padding: 32,
          minWidth: 900,
          maxWidth: 1200,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: 24, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎬 Preview Results
            </h2>
            {resultStats && (
              <div style={{ 
                marginTop: 8, 
                fontSize: 14, 
                color: '#b0b0b0',
                display: 'flex',
                gap: 16
              }}>
                <span>📊 {resultStats.validResults}/{resultStats.totalResults} results</span>
                <span>⏱️ Avg: {resultStats.avgReadingTime}s read time</span>
                {resultStats.avgRating > 0 && <span>⭐ {resultStats.avgRating}/5</span>}
                {resultStats.selectedCount > 0 && <span>✅ {resultStats.selectedCount} selected</span>}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #666',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s',
              ':hover': {
                borderColor: '#ffffff',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: 20
        }}>
          {[
            { id: 'results', label: '📋 Results', icon: '📋' },
            { id: 'analysis', label: '📊 Creative Analysis', icon: '📊' },
            { id: 'visualization', label: '📈 Visualization', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#b0b0b0',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  borderRadius: '2px 2px 0 0'
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        {enableSelection && (
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            padding: 16,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={handleSelectAll}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'transform 0.2s'
              }}
            >
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              disabled={selectedResults.size === 0}
              style={{
                background: selectedResults.size === 0 ? '#666' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: selectedResults.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 500,
                opacity: selectedResults.size === 0 ? 0.5 : 1
              }}
            >
              Clear ({selectedResults.size})
            </button>
            {enableExport && (
              <button
                onClick={handleBatchExport}
                disabled={selectedResults.size === 0}
                style={{
                  background: selectedResults.size === 0 ? '#666' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: selectedResults.size === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: selectedResults.size === 0 ? 0.5 : 1
                }}
              >
                📤 Export Selected
              </button>
            )}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'results' && (
          <>
            {/* Loading/Error States */}
            {loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: 40,
                color: '#b0b0b0',
                fontSize: 16
              }}>
                <div style={{ marginBottom: 12 }}>⚡ Generating professional results...</div>
                <div style={{ 
                  width: 200, 
                  height: 4, 
                  background: '#333', 
                  borderRadius: 2, 
                  margin: '0 auto',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5)',
                    animation: 'loading 2s linear infinite',
                    backgroundSize: '200% 100%'
                  }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{ 
                color: '#ef4444', 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20
              }}>
                ⚠️ Error: {error}
              </div>
            )}

            {/* Results List */}
            {!loading && !error && (
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                paddingRight: 8
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {results.slice(0, maxResults).map((result, index) => (
                    <div
                      key={result.id}
                      onMouseEnter={() => onResultHover?.(index)}
                      style={{
                        background: selectedResults.has(result.id) 
                          ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${selectedResults.has(result.id) ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: 12,
                        padding: 20,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        ':hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      {/* Result Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {enableSelection && (
                            <input
                              type="checkbox"
                              checked={selectedResults.has(result.id)}
                              onChange={(e) => handleResultSelect(result.id, e.target.checked)}
                              style={{
                                width: 16,
                                height: 16,
                                accentColor: '#4f46e5'
                              }}
                            />
                          )}
                          <span style={{
                            background: result.error ? 
                              'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 
                              'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: '#fff',
                            fontSize: 11,
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontWeight: 600
                          }}>
                        🎲 {result.seed}
                          </span>
                          {result.metadata?.contentType && (
                            <span style={{ fontSize: 16 }}>
                              {getContentTypeIcon(result.metadata.contentType)}
                            </span>
                          )}
                        </div>
                    
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#999' }}>
                            {formatExecutionTime(result.executionTimeMs)}
                          </span>
                          {result.saved && <span style={{ fontSize: 12 }}>💾</span>}
                          {result.exported && <span style={{ fontSize: 12 }}>📤</span>}
                        </div>
                      </div>

                      {/* Result Content */}
                      {result.error ? (
                        <div style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 14 }}>
                          {result.error}
                        </div>
                      ) : (
                        <div style={{ 
                          fontFamily: '\'Georgia\', \'Times New Roman\', serif', 
                          fontSize: 15,
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          color: '#e5e5e5',
                          maxHeight: expandedResult === result.id ? 'none' : 150,
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {result.output}
                          {result.output && result.output.length > 300 && expandedResult !== result.id && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 40,
                              background: 'linear-gradient(transparent, rgba(45, 45, 45, 0.9))',
                              display: 'flex',
                              alignItems: 'end',
                              justifyContent: 'center'
                            }}>
                              <button
                                onClick={() => setExpandedResult(result.id)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #666',
                                  color: '#b0b0b0',
                                  padding: '4px 12px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 12
                                }}
                              >
                            Show More
                              </button>
                            </div>
                          )}
                          {expandedResult === result.id && (
                            <button
                              onClick={() => setExpandedResult(null)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #666',
                                color: '#b0b0b0',
                                padding: '4px 12px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                                marginTop: 12
                              }}
                            >
                          Show Less
                            </button>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      {result.metadata && (
                        <div style={{ 
                          marginTop: 16,
                          display: 'flex',
                          gap: 16,
                          fontSize: 12,
                          color: '#999'
                        }}>
                          {result.metadata.wordCount && (
                            <span>📝 {result.metadata.wordCount} words</span>
                          )}
                          {result.metadata.estimatedReadingTime && (
                            <span>⏱️ {result.metadata.estimatedReadingTime}s read</span>
                          )}
                          {result.metadata.tags?.length && (
                            <span>🏷️ {result.metadata.tags.join(', ')}</span>
                          )}
                        </div>
                      )}

                      {/* Rating System */}
                      {enableRating && !result.error && (
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#b0b0b0' }}>Rate:</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleRating(result.id, star)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: (result.metadata?.rating || 0) >= star ? '#fbbf24' : '#666',
                                cursor: 'pointer',
                                fontSize: 16,
                                padding: 2
                              }}
                            >
                          ⭐
                            </button>
                          ))}
                          {ratingInProgress === result.id && (
                            <span style={{ fontSize: 12, color: '#4f46e5' }}>✓</span>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {enableNotes && !result.error && (
                        <div style={{ marginTop: 12 }}>
                          {noteEditing === result.id ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Add a note..."
                                style={{
                                  flex: 1,
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: 4,
                                  fontSize: 12
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleNoteSave(result.id)}
                                style={{
                                  background: '#4f46e5',
                                  border: 'none',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 12
                                }}
                              >
                            Save
                              </button>
                              <button
                                onClick={() => {
                                  setNoteEditing(null);
                                  setTempNote('');
                                }}
                                style={{
                                  background: '#666',
                                  border: 'none',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 12
                                }}
                              >
                            Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: 12, color: '#b0b0b0', fontStyle: 'italic' }}>
                                {result.metadata?.notes || 'No notes'}
                              </div>
                              <button
                                onClick={() => {
                                  setNoteEditing(result.id);
                                  setTempNote(result.metadata?.notes || '');
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #666',
                                  color: '#b0b0b0',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 11
                                }}
                              >
                            📝 {result.metadata?.notes ? 'Edit' : 'Add'} Note
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Creative Analysis Tab */}
        {activeTab === 'analysis' && (
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: 8
          }}>
            <CreativeVarianceAnalyzer
              results={results}
              varianceAnalysis={varianceAnalysis}
              className=""
            />
          </div>
        )}

        {/* Visualization Tab */}
        {activeTab === 'visualization' && (
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: 8
          }}>
            <VarianceVisualization
              results={results}
              varianceAnalysis={varianceAnalysis}
              className=""
            />
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};