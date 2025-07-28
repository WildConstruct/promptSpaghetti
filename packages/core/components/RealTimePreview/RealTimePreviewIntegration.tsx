/**
 * Epic 8.3 - Real-time Preview Integration
 * 
 * Director-friendly real-time preview system that provides instant feedback
 * for graph modifications with professional-grade interface and controls.
 * 
 * Features:
 * - Live preview updates as directors modify weights and connections
 * - Performance-optimized with intelligent debouncing
 * - Professional cinema-appropriate UI design
 * - Multiple preview variants with seed management
 * - Integration with enhanced preview modal for detailed analysis
 */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { EnhancedPreviewModal, EnhancedPreviewResult } from '../PreviewModal/EnhancedPreviewModal';
import { useEnhancedPreview } from '../../hooks/useEnhancedPreview';
import { useRealTimePreview, PreviewVariant, RealTimePreviewConfig } from '../../hooks/useRealTimePreview';
interface RealTimePreviewIntegrationProps {
  nodes: Node[];
  edges: Edge[];
  // Director-friendly configuration
  enableRealTime?: boolean;
  previewCount?: number;
  autoRefresh?: boolean;
  showVarianceAnalysis?: boolean;
  // Callbacks
  onPreviewUpdate?: (variants: PreviewVariant[]) => void;
  onHighlightPath?: (nodeIds: string[], edgeIds: string[]) => void;
  onError?: (error: string) => void;
}

export const RealTimePreviewIntegration: React.FC<RealTimePreviewIntegrationProps> = ({)
  nodes,
  edges,
  enableRealTime = true,
  previewCount = 3,
  autoRefresh = true,
  showVarianceAnalysis = true,
  onPreviewUpdate,
  onHighlightPath,
  onError
}) => {
  // State for preview integration
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PreviewVariant | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastGraphChange = useRef<number>(Date.now());
  // Real-time preview configuration
  const realTimeConfig: RealTimePreviewConfig = useMemo(() => ({)
    maxVariants: previewCount,
    debounceMs: 200, // Fast response for directors
    maxExecutionTime: 1500,
    enablePerformanceTracking: true,
    autoRefresh
  }), [previewCount, autoRefresh]);
  // Real-time preview hook
  const {
    variants,
    isGenerating: realTimeGenerating,
    performance,
    error: realTimeError,
    generateVariants,
    clearVariants
  } = useRealTimePreview(realTimeConfig);
  // Enhanced preview for detailed analysis
  const {
    loading: enhancedLoading,
    error: enhancedError,
    results: enhancedResults,
    varianceAnalysis,
    runEnhancedPreview,
    cancelPreview
  } = useEnhancedPreview();
  // Track graph changes for real-time updates
  useEffect(() => {
    if (!enableRealTime) return;
    lastGraphChange.current = Date.now();
    // Generate real-time variants when graph changes
    const timer = setTimeout(() => {
      generateVariants(nodes, edges);
    }, realTimeConfig.debounceMs);
    return () => clearTimeout(timer);
  }, [nodes, edges, enableRealTime, generateVariants, realTimeConfig.debounceMs]);
  // Update callbacks
  useEffect(() => {
    onPreviewUpdate?.(variants);
  }, [variants, onPreviewUpdate]);
  useEffect(() => {
    if (realTimeError) {
      onError?.(realTimeError);
    }
  }, [realTimeError, onError]);
  // Handle variant selection and path highlighting
  const handleVariantClick = useCallback((variant: PreviewVariant) => {
    setSelectedVariant(variant);
    // Highlight execution path if available
    if (variant.seed && onHighlightPath) {
      // Note: This would need execution path data from backend
      // For now, we'll use placeholder logic
      const nodeIds = nodes.map(n => n.id);
      const edgeIds = edges.map(e => e.id);
      onHighlightPath(nodeIds, edgeIds);
    }
  }, [nodes, edges, onHighlightPath]);
  // Open enhanced modal for detailed analysis
  const handleOpenEnhancedModal = useCallback(async () => {
    setShowEnhancedModal(true);
    // Run enhanced preview with more comprehensive analysis
    await runEnhancedPreview({)
      nodes,
      edges,
      runCount: 8, // More results for detailed analysis
      enableVarianceAnalysis: showVarianceAnalysis,
    });
  }, [nodes, edges, runEnhancedPreview, showVarianceAnalysis]);
  // Convert real-time variants to enhanced results for modal
  const convertedResults: EnhancedPreviewResult[] = useMemo(() => {
    return variants.map((variant, index) => ({)
      id: variant.id,
      seed: variant.seed,
      output: variant.result,
      executionTimeMs: variant.executionTime,
      metadata: {,
        createdAt: new Date(variant.timestamp),
        wordCount: variant.result.split(/\s+/).length,
        characterCount: variant.result.length,
        estimatedReadingTime: Math.ceil(variant.result.split(/\s+/).length / 200), // ~200 WPM
        contentType: 'mixed' as const,
        tags: [`seed-${variant.seed}`, `variant-${index + 1}`]}
      },
      selected: variant === selectedVariant
    }));
  }, [variants, selectedVariant]);
  // Calculate display metrics for director interface
  const displayMetrics = useMemo(() => {
    if (variants.length === 0) return null;
    const avgLength = variants.reduce((sum, v) => sum + v.result.length, 0) / variants.length;
    const avgExecutionTime = performance.averageExecutionTime;
    const variance = variants.reduce((sum, v) => {
      const diff = v.result.length - avgLength;
      return sum + (diff * diff);
    }, 0) / variants.length;
    return {
      averageLength: Math.round(avgLength),
      averageExecutionTime: Math.round(avgExecutionTime),
      variance: Math.round(Math.sqrt(variance)),
      totalVariants: variants.length,
      successRate: performance.successRate,
    };
  }, [variants, performance]);
  return ()
    <div className="real-time-preview-integration">
      {/* Compact Real-time Preview Panel */}
      <div className={`preview-panel ${isExpanded ? 'expanded' : 'compact'}`}>}
        {/* Header with controls */}
        <div className="preview-header">
          <div className="header-title">
            <span className="preview-icon">⚡</span>
            <h3>Live Preview</h3>
            {realTimeGenerating && ()
              <div className="generating-indicator">
                <div className="spinner"></div>
              </div>
            )}
          </div>
          <div className="header-controls">
            <button
              className="expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <button
              className="detailed-btn"
              onClick={handleOpenEnhancedModal}
              disabled={variants.length === 0}
              title="Open Detailed Analysis"
            >
              📊 Analysis
            </button>
          </div>
        </div>
        {/* Performance metrics for directors */}
        {displayMetrics && ()
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-value">{displayMetrics.totalVariants}</span>
              <span className="metric-label">Variants</span>
            </div>
            <div className="metric">
              <span className="metric-value">{displayMetrics.averageExecutionTime}ms</span>
              <span className="metric-label">Speed</span>
            </div>
            <div className="metric">
              <span className="metric-value">{displayMetrics.successRate}%</span>
              <span className="metric-label">Success</span>
            </div>
          </div>
        )}
        {/* Real-time variants display */}
        {isExpanded && ()
          <div className="variants-container">
            {variants.length === 0 ? ()
              <div className="no-variants">
                <p>Modify your graph to see live previews</p>
              </div>
            ) : ()
              <div className="variants-list">
                {variants.map((variant, index) => ()
                  <div
                    key={variant.id}
                    className={`variant-item ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                    onClick={() => handleVariantClick(variant)}
                  >
                    <div className="variant-header">
                      <span className="variant-number">#{index + 1}</span>
                      <span className="variant-seed">Seed: {variant.seed}</span>
                      <span className="variant-time">{variant.executionTime}ms</span>
                    </div>
                    <div className="variant-content">
                      {variant.result.length > 100 
                        ? `${variant.result.substring(0, 100)}...`}
                        : variant.result
                      }
                    </div>
                    <div className="variant-stats">
                      <span>{variant.result.length} chars</span>
                      <span>{variant.result.split(/\s+/).length} words</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Error display */}
        {realTimeError && ()
          <div className="error-display">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{realTimeError}</span>
          </div>
        )}
      </div>
      {/* Enhanced Preview Modal */}
      <EnhancedPreviewModal
        open={showEnhancedModal}
        loading={enhancedLoading}
        error={enhancedError}
        results={enhancedResults.length > 0 ? enhancedResults : convertedResults}
        varianceAnalysis={varianceAnalysis}
        onClose={() => setShowEnhancedModal(false)}
        onCancel={cancelPreview}
        onResultHover={(index) => {
          const result = enhancedResults[index] || convertedResults[index];
          if (result?.usedNodeIds && result?.usedEdgeIds) {
            onHighlightPath?.(result.usedNodeIds, result.usedEdgeIds);
          }
        }}
      />
      <style>{`
        .real-time-preview-integration {
          position: relative;
          min-height: 60px;
        }
        .preview-panel {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 1px solid #444;
          border-radius: 8px;
          color: #fff;
          transition: all 0.3s ease;
        }
        .preview-panel.compact {
          height: 60px;
          overflow: hidden;
        }
        .preview-panel.expanded {
          min-height: 200px;
          max-height: 400px;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #444;
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        .preview-icon {
          font-size: 16px;
          color: #ffd700;
        }
        .generating-indicator {
          display: flex;
          align-items: center;
          margin-left: 8px;
        }
        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #444;
          border-top: 2px solid #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .header-controls {
          display: flex;
          gap: 8px;
        }
        .expand-btn, .detailed-btn {
          background: #444;
          border: none;
          color: #fff;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s ease;
        }
        .expand-btn:hover, .detailed-btn:hover {
          background: #555;
        }
        .detailed-btn:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }
        .performance-metrics {
          display: flex;
          justify-content: space-around;
          padding: 8px 16px;
          background: rgba(255, 215, 0, 0.1);
          border-bottom: 1px solid #444;
        }
        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .metric-value {
          font-weight: 600;
          font-size: 14px;
          color: #ffd700;
        }
        .metric-label {
          font-size: 10px;
          color: #aaa;
          text-transform: uppercase;
        }
        .variants-container {
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        .no-variants {
          text-align: center;
          padding: 32px;
          color: #666;
        }
        .variants-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .variant-item {
          background: #333;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .variant-item:hover {
          background: #3a3a3a;
          border-color: #555;
        }
        .variant-item.selected {
          background: #2a4a5a;
          border-color: #ffd700;
        }
        .variant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .variant-number {
          background: #ffd700;
          color: #000;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
        }
        .variant-seed {
          color: #aaa;
        }
        .variant-time {
          color: #0f0;
          font-family: monospace;
        }
        .variant-content {
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 8px;
          color: #ddd;
        }
        .variant-stats {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
        }
        .error-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 0, 0, 0.1);
          border-top: 1px solid #444;
        }
        .error-icon {
          color: #ff6b6b;
        }
        .error-text {
          color: #ff6b6b;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default RealTimePreviewIntegration;