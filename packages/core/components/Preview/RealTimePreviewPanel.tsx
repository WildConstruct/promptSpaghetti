/**
 * Real-Time Preview Panel Component
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 * 
 * Advanced preview panel with real-time synchronization, performance monitoring,
 * and intelligent caching for responsive graph preview updates.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGraphStore } from '../../graphStore';
import { usePreviewStateStore } from '../../stores/previewStateStore';
import { usePreviewSync } from '../../hooks/usePreviewSync';
interface RealTimePreviewPanelProps {
  visible?: boolean;
  onClose?: () => void;
  className?: string;
  enablePerformanceMonitoring?: boolean;
  maxResults?: number;
}
interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  locked?: boolean;
  lockedNote?: string;
}

export const RealTimePreviewPanel: React.FC<RealTimePreviewPanelProps> = ({)
  visible = true,
  onClose,
  className = '',
  enablePerformanceMonitoring = true,
  maxResults = 5
}) => {
  // Store hooks
  const { getGraphData } = useGraphStore();
  const {
    results,
    isLoading,
    error,
    performanceStats,
    lockedResults,
    isRealTimeEnabled,
    autoRefreshEnabled,
    lockResult,
    unlockResult,
    setAutoRefresh,
    resetState
  } = usePreviewStateStore();
  // Sync hook for real-time updates
  const {
    isEnabled: isSyncEnabled,
    isSyncing,
    lastSyncTime,
    syncCount,
    enableSync,
    forceSyncNow,
    getChangeAnalysis,
    performanceMetrics
  } = usePreviewSync({)
    enabled: isRealTimeEnabled,
    debounceMs: 1000,
    significanceThreshold: 0.2,
    enablePerformanceTracking: enablePerformanceMonitoring,
  });
  // Local state
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [lockNote, setLockNote] = useState('');
  const [showLockDialog, setShowLockDialog] = useState(false);
  // Format timestamp for display
  const formatTime = useCallback((timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  }, []);
  // Handle result selection
  const handleResultClick = useCallback((index: number) => {
    setSelectedResult(selectedResult === index ? null : index);
  }, [selectedResult]);
  // Handle lock/unlock result
  const handleToggleLock = useCallback((index: number) => {
    const result = results[index];
    if (!result) return;
    if (result.locked) {
      unlockResult(index);
    } else {
      setSelectedResult(index);
      setShowLockDialog(true);
    }
  }, [results, unlockResult]);
  // Handle lock confirmation
  const handleConfirmLock = useCallback(() => {
    if (selectedResult !== null) {
      lockResult(selectedResult, lockNote.trim() || undefined);
      setLockNote('');
      setShowLockDialog(false);
      setSelectedResult(null);
    }
  }, [selectedResult, lockNote, lockResult]);
  // Get sync status display
  const syncStatusDisplay = useMemo(() => {
    if (!isSyncEnabled) return { text: 'Disabled', color: '#9ca3af' };
    if (isSyncing) return { text: 'Syncing...', color: '#f59e0b' };
    if (syncCount > 0) return { text: 'Active', color: '#10b981' };
    return { text: 'Ready', color: '#3b82f6' };
  }, [isSyncEnabled, isSyncing, syncCount]);
  // Get change analysis display
  const changeAnalysis = useMemo(() => {
    const analysis = getChangeAnalysis();
    if (!analysis) return null;
    return {
      type: analysis.changeType,
      significance: Math.round(analysis.significance * 100),
      affectedCount: analysis.affectedNodes.length + analysis.affectedEdges.length
    };
  }, [getChangeAnalysis]);
  // Handle manual refresh
  const handleManualRefresh = useCallback(async () => {
    await forceSyncNow();
  }, [forceSyncNow]);
  // Clear all results
  const handleClearResults = useCallback(() => {
    resetState();
  }, [resetState]);
  if (!visible) return null;
  return ()
    <div
      className={`real-time-preview-panel ${className}`}
      style={{
        position: 'fixed',
        right: '20px',
        top: '20px',
        width: '400px',
        maxHeight: '80vh',
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
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              🔄 Real-Time Preview
            </h3>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              Status: <span style={{ color: syncStatusDisplay.color }}>●</span> {syncStatusDisplay.text}
            </div>
          </div>
          {onClose && ()
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
                justifyContent: 'center',
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
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={isSyncEnabled}
              onChange={(e) => enableSync(e.target.checked)}
              style={{ margin: 0 }}
            />
            Real-time sync
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ margin: 0 }}
            />
            Auto-refresh
          </label>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleManualRefresh}
            disabled={isSyncing}
            style={{
              padding: '6px 12px',
              background: isSyncing ? '#e2e8f0' : '#3b82f6',
              color: isSyncing ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: isSyncing ? 'not-allowed' : 'pointer'
            }}
          >
            {isSyncing ? 'Syncing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={handleClearResults}
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🗑️ Clear
          </button>
          {enablePerformanceMonitoring && ()
            <button
              onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
              style={{
                padding: '6px 12px',
                background: showPerformanceDetails ? '#8b5cf6' : '#e2e8f0',
                color: showPerformanceDetails ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              📊 Stats
            </button>
          )}
        </div>
      </div>
      {/* Performance Stats */}
      {showPerformanceDetails && ()
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <strong>Sync Count:</strong> {syncCount}
            </div>
            <div>
              <strong>Last Sync:</strong> {formatTime(lastSyncTime)}
            </div>
            <div>
              <strong>Avg Time:</strong> {Math.round(performanceMetrics.avgSyncTime)}ms
            </div>
            <div>
              <strong>Success Rate:</strong> {Math.round(performanceMetrics.successRate * 100)}%
            </div>
            <div>
              <strong>Cache Hit:</strong> {Math.round(performanceMetrics.cacheHitRate * 100)}%
            </div>
            {performanceStats && ()
              <div>
                <strong>Exec Time:</strong> {performanceStats.averageTime}ms
              </div>
            )}
          </div>
          {changeAnalysis && ()
            <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
              <strong>Last Change:</strong> {changeAnalysis.type} 
              ({changeAnalysis.significance}% significance, )
              {changeAnalysis.affectedCount} items affected)
            </div>
          )}
        </div>
      )}
      {/* Results */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '12px 0'
        }}
      >
        {error && ()
          <div
            style={{
              margin: '0 20px 12px',
              padding: '12px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
        {isLoading && ()
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Generating previews...</div>
          </div>
        )}
        {results.length === 0 && !isLoading && !error && ()
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>No previews yet</div>
            <div style={{ fontSize: '14px' }}>
              Enable real-time sync or click refresh to generate previews
            </div>
          </div>
        )}
        {results.slice(0, maxResults).map((result, index) => ()
          <div
            key={`${result.seed}-${index}`}
            style={{
              margin: '0 20px 8px',
              padding: '12px',
              background: selectedResult === index ? '#f0f9ff' : 'white',
              border: `1px solid ${selectedResult === index ? '#0ea5e9' : '#e2e8f0'}`,}
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleResultClick(index)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: '#e2e8f0', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontSize: '11px',
                  fontWeight: '600',
                }}>
                  Seed {result.seed}
                </span>
                {result.executionTimeMs && ()
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {result.executionTimeMs}ms
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {result.locked && ()
                  <span title={`Locked: ${result.lockedNote || 'No note'}`} style={{ fontSize: '14px' }}>}
                    🔒
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(index);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    opacity: 0.7,
                    padding: '2px',
                  }}
                  title={result.locked ? 'Unlock result' : 'Lock result'}
                >
                  {result.locked ? '🔓' : '🔒'}
                </button>
              </div>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {result.error ? ()
                <div style={{ color: '#dc2626', fontStyle: 'italic' }}>
                  {result.error}
                </div>
              ) : ()
                <div style={{ color: '#374151' }}>
                  {result.output || 'No output'}
                </div>
              )}
            </div>
          </div>
        ))}
        {results.length > maxResults && ()
          <div
            style={{
              padding: '12px 20px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            ... and {results.length - maxResults} more results
          </div>
        )}
      </div>
      {/* Lock Dialog */}
      {showLockDialog && ()
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
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
              Add an optional note for this locked result:
            </p>
            <textarea
              value={lockNote}
              onChange={(e) => setLockNote(e.target.value)}
              placeholder="Optional note..."
              style={{
                width: '100%',
                height: '60px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'none',
                marginBottom: '12px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowLockDialog(false);
                  setLockNote('');
                  setSelectedResult(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#e2e8f0',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLock}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Lock Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimePreviewPanel;