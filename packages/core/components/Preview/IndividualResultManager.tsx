/**
 * Individual Result Manager Component
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 3
 * 
 * Advanced component for managing individual preview results with locking,
 * regeneration, comparison, and detailed analysis capabilities.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePreviewStateStore } from '../../stores/previewStateStore';
import { usePreviewSeeds } from '../../usePreviewSeeds';

interface IndividualResultManagerProps {
  visible?: boolean;
  onClose?: () => void;
  className?: string;
  enableComparison?: boolean;
  enableAnalytics?: boolean;
  maxDisplayResults?: number;
}

interface ResultAction {
  type: 'lock' | 'unlock' | 'regenerate' | 'delete' | 'compare' | 'analyze' | 'export';
  resultIndex: number;
  data?: unknown;
}

interface ComparisonMode {
  enabled: boolean;
  selectedResults: number[];
  viewMode: 'side-by-side' | 'overlay' | 'diff';
}

interface ResultAnalytics {
  resultIndex: number;
  wordCount: number;
  sentenceCount: number;
  uniqueWords: number;
  averageWordLength: number;
  readabilityScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  similarity: number; // Compared to other results
}

export const IndividualResultManager: React.FC<IndividualResultManagerProps> = ({
  visible = true,
  onClose,
  className = '',
  enableComparison = true,
  enableAnalytics = true,
  maxDisplayResults = 10
}) => {
  // Store hooks
  const {
    results,
    isLoading,
    error,
    lockedResults,
    regeneratingResults,
    lockResult,
    unlockResult,
    setRegeneratingResult
  } = usePreviewStateStore();

  // Preview seeds hook for regeneration
  const { regenerateResult } = usePreviewSeeds();

  // Local state
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>({
    enabled: false,
    selectedResults: [],
    viewMode: 'side-by-side'
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [resultAnalytics, setResultAnalytics] = useState<Map<number, ResultAnalytics>>(new Map());
  const [actionMenuIndex, setActionMenuIndex] = useState<number | null>(null);
  const [lockDialog, setLockDialog] = useState<{
    visible: boolean;
    resultIndex: number;
    note: string;
  }>({
    visible: false,
    resultIndex: -1,
    note: ''
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate analytics for a result
  const calculateAnalytics = useCallback((content: string, index: number): ResultAnalytics => {
    if (!content || typeof content !== 'string') {
      return {
        resultIndex: index,
        wordCount: 0,
        sentenceCount: 0,
        uniqueWords: 0,
        averageWordLength: 0,
        readabilityScore: 0,
        sentiment: 'neutral',
        topics: [],
        similarity: 0
      };
    }

    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueWords = new Set(words).size;
    const averageWordLength = words.length > 0 
      ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
      : 0;

    // Simple readability score (Flesch-like)
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * averageWordLength)
    ));

    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';

    // Extract potential topics (simple approach)
    const topics = words
      .filter(word => word.length > 4)
      .reduce((acc: Record<string, number>, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    
    const topTopics = Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    // Calculate similarity to other results (simple Jaccard similarity)
    const otherResults = results.filter((_, i) => i !== index && !results[i].error);
    const similarity = otherResults.length > 0 
      ? otherResults.reduce((sum, result) => {
          const otherWords = new Set((result.output || '').toLowerCase().match(/\b\w+\b/g) || []);
          const currentWords = new Set(words);
          const intersection = new Set([...currentWords].filter(x => otherWords.has(x)));
          const union = new Set([...currentWords, ...otherWords]);
          return sum + (union.size > 0 ? intersection.size / union.size : 0);
        }, 0) / otherResults.length
      : 0;

    return {
      resultIndex: index,
      wordCount: words.length,
      sentenceCount: sentences.length,
      uniqueWords,
      averageWordLength: Math.round(averageWordLength * 100) / 100,
      readabilityScore: Math.round(readabilityScore),
      sentiment,
      topics: topTopics,
      similarity: Math.round(similarity * 100) / 100
    };
  }, [results]);

  // Update analytics when results change
  useEffect(() => {
    if (enableAnalytics) {
      const newAnalytics = new Map<number, ResultAnalytics>();
      results.forEach((result, index) => {
        if (result.output && !result.error) {
          newAnalytics.set(index, calculateAnalytics(result.output, index));
        }
      });
      setResultAnalytics(newAnalytics);
    }
  }, [results, enableAnalytics, calculateAnalytics]);

  // Handle result action
  const handleResultAction = useCallback(async (action: ResultAction) => {
    const { type, resultIndex, data } = action;

    switch (type) {
      case 'lock':
        setLockDialog({
          visible: true,
          resultIndex,
          note: ''
        });
        break;

      case 'unlock':
        unlockResult(resultIndex);
        break;

      case 'regenerate':
        if (results[resultIndex] && !results[resultIndex].locked) {
          setRegeneratingResult(resultIndex, true);
          try {
            await regenerateResult(resultIndex);
          } catch (error) {
            console.error('Failed to regenerate result:', error);
          } finally {
            setRegeneratingResult(resultIndex, false);
          }
        }
        break;

      case 'delete':
        // Remove result from selection if selected
        setSelectedResults(prev => {
          const newSet = new Set(prev);
          newSet.delete(resultIndex);
          return newSet;
        });
        break;

      case 'compare':
        if (enableComparison) {
          setSelectedResults(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resultIndex)) {
              newSet.delete(resultIndex);
            } else {
              newSet.add(resultIndex);
            }
            return newSet;
          });
        }
        break;

      case 'export':
        exportResult(resultIndex, data?.format || 'text');
        break;
    }

    setActionMenuIndex(null);
  }, [results, unlockResult, setRegeneratingResult, regenerateResult, enableComparison]);

  // Export result functionality
  const exportResult = useCallback((index: number, format: 'text' | 'json' | 'csv') => {
    const result = results[index];
    if (!result) return;

    const analytics = resultAnalytics.get(index);
    let content = '';
    let filename = `result_${result.seed}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'text':
        content = result.output || result.error || '';
        filename += '.txt';
        break;

      case 'json':
        content = JSON.stringify({
          ...result,
          analytics: analytics || null
        }, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;

      case 'csv':
        const csvData = [
          ['Field', 'Value'],
          ['Seed', result.seed],
          ['Output', result.output || ''],
          ['Error', result.error || ''],
          ['Execution Time', result.executionTimeMs || ''],
          ['Locked', result.locked ? 'Yes' : 'No'],
          ['Word Count', analytics?.wordCount || ''],
          ['Readability Score', analytics?.readabilityScore || ''],
          ['Sentiment', analytics?.sentiment || '']
        ];
        content = csvData.map(row => row.join(',')).join('\n');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results, resultAnalytics]);

  // Handle lock confirmation
  const handleLockConfirmation = useCallback(() => {
    const { resultIndex, note } = lockDialog;
    lockResult(resultIndex, note.trim() || undefined);
    setLockDialog({ visible: false, resultIndex: -1, note: '' });
  }, [lockDialog, lockResult]);

  // Toggle comparison mode
  const toggleComparisonMode = useCallback(() => {
    if (comparisonMode.enabled) {
      setComparisonMode({ enabled: false, selectedResults: [], viewMode: 'side-by-side' });
      setSelectedResults(new Set());
    } else {
      setComparisonMode(prev => ({ ...prev, enabled: true }));
    }
  }, [comparisonMode.enabled]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuIndex(null);
      }
    };

    if (actionMenuIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [actionMenuIndex]);

  // Get comparison summary
  const comparisonSummary = useMemo(() => {
    if (!comparisonMode.enabled || selectedResults.size < 2) return null;

    const selected = Array.from(selectedResults);
    const analytics = selected.map(i => resultAnalytics.get(i)).filter(Boolean) as ResultAnalytics[];
    
    if (analytics.length < 2) return null;

    const avgWordCount = analytics.reduce((sum, a) => sum + a.wordCount, 0) / analytics.length;
    const avgReadability = analytics.reduce((sum, a) => sum + a.readabilityScore, 0) / analytics.length;
    const sentiments = analytics.map(a => a.sentiment);
    const dominantSentiment = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      count: selected.length,
      avgWordCount: Math.round(avgWordCount),
      avgReadability: Math.round(avgReadability),
      dominantSentiment: Object.keys(dominantSentiment).reduce((a, b) => 
        dominantSentiment[a] > dominantSentiment[b] ? a : b
      ),
      topics: [...new Set(analytics.flatMap(a => a.topics))]
    };
  }, [comparisonMode.enabled, selectedResults, resultAnalytics]);

  if (!visible) return null;

  return (
    <div
      className={`individual-result-manager ${className}`}
      style={{
        position: 'fixed',
        left: '20px',
        top: '20px',
        width: '600px',
        maxHeight: '85vh',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              ⚙️ Result Manager
            </h3>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              {results.length} results • {lockedResults.length} locked
              {comparisonMode.enabled && selectedResults.size > 0 && (
                <span> • {selectedResults.size} selected</span>
              )}
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {enableComparison && (
            <button
              onClick={toggleComparisonMode}
              style={{
                padding: '6px 12px',
                background: comparisonMode.enabled ? '#8b5cf6' : '#e2e8f0',
                color: comparisonMode.enabled ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🔍 Compare ({selectedResults.size})
            </button>
          )}
          
          {enableAnalytics && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{
                padding: '6px 12px',
                background: showAnalytics ? '#10b981' : '#e2e8f0',
                color: showAnalytics ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📊 Analytics
            </button>
          )}
          
          <button
            onClick={() => setSelectedResults(new Set())}
            disabled={selectedResults.size === 0}
            style={{
              padding: '6px 12px',
              background: selectedResults.size > 0 ? '#ef4444' : '#e2e8f0',
              color: selectedResults.size > 0 ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: selectedResults.size > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            🗑️ Clear Selection
          </button>
        </div>
      </div>

      {/* Comparison Summary */}
      {comparisonMode.enabled && comparisonSummary && (
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f0f9ff',
            fontSize: '12px'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Comparison Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            <div><strong>Results:</strong> {comparisonSummary.count}</div>
            <div><strong>Avg Words:</strong> {comparisonSummary.avgWordCount}</div>
            <div><strong>Readability:</strong> {comparisonSummary.avgReadability}</div>
            <div><strong>Sentiment:</strong> {comparisonSummary.dominantSentiment}</div>
          </div>
          {comparisonSummary.topics.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <strong>Common Topics:</strong> {comparisonSummary.topics.slice(0, 5).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div
        style={{
          maxHeight: comparisonMode.enabled ? '400px' : '500px',
          overflowY: 'auto',
          padding: '12px 0'
        }}
      >
        {error && (
          <div
            style={{
              margin: '0 20px 12px',
              padding: '12px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px'
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {results.length === 0 && !isLoading && (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <div>No results to manage</div>
          </div>
        )}

        {results.slice(0, maxDisplayResults).map((result, index) => {
          const analytics = resultAnalytics.get(index);
          const isSelected = selectedResults.has(index);
          const isRegenerating = regeneratingResults.includes(index);

          return (
            <div
              key={`${result.seed}-${index}`}
              style={{
                margin: '0 20px 12px',
                padding: '16px',
                background: isSelected ? '#f0f9ff' : 'white',
                border: `2px solid ${isSelected ? '#0ea5e9' : result.locked ? '#f59e0b' : '#e2e8f0'}`,
                borderRadius: '8px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Result Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {comparisonMode.enabled && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleResultAction({ type: 'compare', resultIndex: index })}
                      style={{ margin: 0 }}
                    />
                  )}
                  
                  <span style={{ 
                    background: result.locked ? '#fbbf24' : '#e2e8f0', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    fontWeight: '600',
                    color: result.locked ? '#92400e' : '#374151'
                  }}>
                    Seed {result.seed}
                  </span>
                  
                  {result.executionTimeMs && (
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {result.executionTimeMs}ms
                    </span>
                  )}
                  
                  {result.locked && (
                    <span title={`Locked: ${result.lockedNote || 'No note'}`} style={{ fontSize: '14px' }}>
                      🔒
                    </span>
                  )}
                  
                  {isRegenerating && (
                    <span style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>
                      ⟳
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setActionMenuIndex(actionMenuIndex === index ? null : index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    color: '#6b7280'
                  }}
                >
                  ⋯
                </button>
              </div>
              
              {/* Result Content */}
              <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: showAnalytics ? '12px' : '0' }}>
                {result.error ? (
                  <div style={{ color: '#dc2626', fontStyle: 'italic' }}>
                    {result.error}
                  </div>
                ) : (
                  <div style={{ color: '#374151' }}>
                    {result.output || 'No output'}
                  </div>
                )}
              </div>
              
              {/* Analytics */}
              {showAnalytics && analytics && (
                <div
                  style={{
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(
                    auto-fit,
                    minmax(80px,
                    1fr
                  ))', gap: '8px' }}>
                    <div><strong>Words:</strong> {analytics.wordCount}</div>
                    <div><strong>Unique:</strong> {analytics.uniqueWords}</div>
                    <div><strong>Readability:</strong> {analytics.readabilityScore}</div>
                    <div><strong>Sentiment:</strong> {analytics.sentiment}</div>
                    <div><strong>Similarity:</strong> {Math.round(analytics.similarity * 100)}%</div>
                  </div>
                  {analytics.topics.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>Topics:</strong> {analytics.topics.join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Menu */}
              {actionMenuIndex === index && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '10px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1001,
                    minWidth: '160px'
                  }}
                >
                  {!result.locked ? (
                    <button
                      onClick={() => handleResultAction({ type: 'lock', resultIndex: index })}
                      style={menuButtonStyle}
                    >
                      🔒 Lock Result
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResultAction({ type: 'unlock', resultIndex: index })}
                      style={menuButtonStyle}
                    >
                      🔓 Unlock Result
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleResultAction({ type: 'regenerate', resultIndex: index })}
                    disabled={result.locked || isRegenerating}
                    style={{
                      ...menuButtonStyle,
                      color: result.locked || isRegenerating ? '#9ca3af' : '#374151',
                      cursor: result.locked || isRegenerating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⟳ Regenerate
                  </button>
                  
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 8px' }} />
                  
                  <button
                    onClick={() => handleResultAction({ type: 'export', resultIndex: index, data: { format: 'text' } })}
                    style={menuButtonStyle}
                  >
                    📄 Export Text
                  </button>
                  
                  <button
                    onClick={() => handleResultAction({ type: 'export', resultIndex: index, data: { format: 'json' } })}
                    style={menuButtonStyle}
                  >
                    📋 Export JSON
                  </button>
                  
                  {enableAnalytics && analytics && (
                    <button
                      onClick={() => handleResultAction({ type: 'export', resultIndex: index, data: { format: 'csv' } })}
                      style={menuButtonStyle}
                    >
                      📊 Export CSV
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {results.length > maxDisplayResults && (
          <div
            style={{
              padding: '12px 20px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}
          >
            ... and {results.length - maxDisplayResults} more results
          </div>
        )}
      </div>

      {/* Lock Dialog */}
      {lockDialog.visible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              width: '300px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h4 style={{ margin: '0 0 12px', fontSize: '16px' }}>Lock Result</h4>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6b7280' }}>
              Add a note to explain why this result is locked:
            </p>
            
            <textarea
              value={lockDialog.note}
              onChange={(e) => setLockDialog(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Important for X reason..."
              style={{
                width: '100%',
                height: '80px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'none',
                marginBottom: '16px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setLockDialog({ visible: false, resultIndex: -1, note: '' })}
                style={{
                  padding: '8px 16px',
                  background: '#e2e8f0',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleLockConfirmation}
                style={{
                  padding: '8px 16px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔒 Lock Result
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Shared menu button style
const menuButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  ':hover': {
    background: '#f3f4f6'
  }
};

export default IndividualResultManager;