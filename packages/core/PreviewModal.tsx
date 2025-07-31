import React, { useState } from 'react';
import { PreviewResultWithPath } from './types/ExecutionPath';
import { ExecutionPathVisualization } from './components/ExecutionPathVisualization';
import { ExportOptionsDialog } from './components/ExportOptionsDialog';
import { VarianceAnalysis } from './components/VarianceAnalysis';
import { resultExportService } from './services/ResultExportService';
import { ExportFormat, ResultExportOptions } from './services/ResultExportService';
import { VarianceSuggestion } from './services/VarianceAnalysisService';
import { professionalColors } from './styles/professional-design-system';

// Individual result management for Epic 8.5 Task 3

interface ResultAction {
  type: 'regenerate' | 'lock' | 'unlock' | 'compare' | 'export';
  resultIndex: number;
  data?: Record<string, unknown>;
}

interface LockedResult {
  index: number;
  seed: number;
  lockedAt: number;
  note?: string;
}

// Legacy interface for backward compatibility
interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
}

export interface PreviewModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: PreviewResult[] | PreviewResultWithPath[];
  onClose: () => void;
  onCancel?: () => void;
  onResultHover?: (index: number) => void;
  onNodeHighlight?: (nodeIds: string) => void;
  // Epic 8.5 Task 3: Individual result management
  onResultAction?: (action: ResultAction) => void;
  lockedResults?: LockedResult[];
  regeneratingResults?: number[];
  // Epic 8.5 Task 5: Creative variance analysis
  onVarianceSuggestion?: (suggestion: VarianceSuggestion) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  loading,
  error,
  results,
  onClose,
  onCancel,
  onResultHover,
  onNodeHighlight,
  onResultAction,
  lockedResults = [],
  regeneratingResults = [],
  onVarianceSuggestion
}) => {
  const [showExecutionPaths, setShowExecutionPaths] = useState(false);
  const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [exportDialog, setExportDialog] = useState<{
  open: boolean;
  type: 'individual' | 'batch' | 'comparison';
  individualIndex?: number;
}>({ open: false, type: 'individual' });
  // Check if results have execution path data
  const hasExecutionPaths = results.length > 0 &&
    results.some(r => 'executionPath' in r && r.executionPath);
  // Helper functions for result management
  const isResultLocked = (index: number) => lockedResults.some(locked => locked.index === index);
  const isResultRegenerating = (index: number) => regeneratingResults.includes(index);
  const isResultSelected = (index: number) => selectedForComparison.includes(index);
  const handleResultAction = (type: ResultAction['type'], index: number, data?: Record<string, unknown>) => {
    if (type === 'export') {
      setExportDialog({
        open: true,
        type: 'individual',
        individualIndex: index,
      });
      return;

    onResultAction?.({ type, resultIndex: index, data });
  };
  const toggleComparisonSelection = (index: number) => {
    if (isResultSelected(index)) {
      setSelectedForComparison(prev => prev.filter(i => i !== index));
    } else if (selectedForComparison.length < 3) { // Limit to 3 results for comparison
      setSelectedForComparison(prev => [...prev, index]);

  };
  const clearComparison = () => {
    setSelectedForComparison([]);
    setCompareMode(false);
  };
  const handleExport = async (format: ExportFormat, options: ResultExportOptions) => {
    try {
      let exportResult;
      if (exportDialog.type === 'individual' && typeof exportDialog.individualIndex === 'number') {
        const result = results[exportDialog.individualIndex] as PreviewResultWithPath;
        exportResult = await resultExportService.exportIndividualResult(
          result,
          exportDialog.individualIndex,
          results.length,
          options
        );
      } else if (exportDialog.type === 'batch') {
        exportResult = await resultExportService.exportBatchResults(
          results as PreviewResultWithPath[],
          selectedForComparison,
          options
        );
      } else {
        exportResult = await resultExportService.exportComparison(
          results as PreviewResultWithPath[],
          selectedForComparison,
          options
        );
      }

      // Handle the export result
      if (exportResult.shouldDownload) {
        downloadExportResult(exportResult, format);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };
  const downloadExportResult = (exportResult: { data: string; mimeType: string }, format: ExportFormat) => {
    const blob = new Blob([exportResult.data], { type: exportResult.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Generate filename based on format and export type
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const extension = getFileExtension(format);
    let filename = `promptscape-${exportDialog.type}-${timestamp}.${extension}`;
    if (exportDialog.type === 'individual' && typeof exportDialog.individualIndex === 'number') {
      const seed = results[exportDialog.individualIndex].seed;
      filename = `promptscape-result-seed${seed}-${timestamp}.${extension}`;
    } else if (exportDialog.type === 'batch') {
      filename = `promptscape-batch-${selectedForComparison.length}results-${timestamp}.${extension}`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const getFileExtension = (format: ExportFormat): string => {
  const extensions: Record<ExportFormat, string> = {
  'plain-text': 'txt',
  'json-simple': 'json',
  'json-complete': 'json',
  'csv-analysis': 'csv',
  'fountain-script': 'fountain',
  'final-draft': 'fdx',
  'controlnet-json': 'json',
  'stable-diffusion': 'zip',
  'professional-report': 'pdf',
  'creative-brief': 'docx',
  'mars-framework': 'json',
  'zada-natural': 'md',
  'hybrid-prompting': 'json',
  'execution-timeline': 'json',
  'variance-report': 'json',
  'batch-summary': 'json',
};
    return extensions[format] || 'json'
  };
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.4)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}>
      <div style={{
  background: professionalColors.background.elevated,
  borderRadius: 12,
  padding: 24,
  minWidth: 400,
  maxWidth: hasExecutionPaths ? 800 : 600,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  color: professionalColors.text.primary,
}>
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
}>
          <h2 style={{ margin: 0 }>Generated Content</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }>
            {hasExecutionPaths && (
              <button
                onClick={() => setShowExecutionPaths(!showExecutionPaths)}
                style={{
  background: showExecutionPaths ? '#4d7cff' : '#e2e8f0',
  color: showExecutionPaths ? '#fff' : '#2d3748',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',

              >
                {showExecutionPaths ? '📊 Hide Paths' : '🔍 Show Paths'}
              </button>
            )}
            {/* Variance Analysis Toggle */}
            {results.length >= 2 && (
              <button
                onClick={() => setShowVarianceAnalysis(!showVarianceAnalysis)}
                style={{
  background: showVarianceAnalysis ? '#8b5cf6' : '#e2e8f0',
  color: showVarianceAnalysis ? '#fff' : '#2d3748',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',

              >
                {showVarianceAnalysis ? '📈 Hide Variance' : '📊 Show Variance'}
              </button>
            )}
            {/* Comparison mode toggle */}
            <button
              onClick={() => {
                if (compareMode) {
                  clearComparison();
                } else {
                  setCompareMode(true);

              style={{
  background: compareMode ? '#10b981' : '#e2e8f0',
  color: compareMode ? '#fff' : '#2d3748',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',

            >
              {compareMode ? '⚖️ Exit Compare' : '⚖️ Compare'}
            </button>
            {/* Batch Export Button */}
            {selectedForComparison.length > 0 && (
              <button
                onClick={() => setExportDialog({
  open: true,
  type: 'batch',
})}
                style={{
  background: '#8b5cf6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',

              >
                💾 Export Selected
              </button>
            )}
            {/* Export All Button */}
            {!compareMode && results.length > 1 && (
              <button
                onClick={() => setExportDialog({
  open: true,
  type: 'comparison',
})}
                style={{
  background: '#6b7280',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',

              >
                📊 Export All
              </button>
            )}
            {compareMode && selectedForComparison.length > 0 && (
              <span style={{
  fontSize: 11,
  color: '#4a5568',
  padding: '4px 8px',
  background: '#f7fafc',
  borderRadius: 4,
}>
                {selectedForComparison.length}/3 selected
              </span>
            )}
          </div>
        </div>
        {loading && <div style={{marginBottom:12}>✨ Generating content...</div>}
        {error && <div style={{ color: '#c00' }>⚠️ Something went wrong: {error}</div>}
        {!loading && !error && (
          <div>
            {/* Execution Path Visualization */}
            {showExecutionPaths && hasExecutionPaths && (
              <div style={{ marginBottom: 20 }>
                <ExecutionPathVisualization 
                  results={results as PreviewResultWithPath[]}
                  onNodeHighlight={onNodeHighlight}
                  config={{
  showExecutionOrder: true,
  showRandomChoices: true,
  showPerformanceMetrics: true,

                />
              </div>
            )}
            {/* Variance Analysis */}
            {showVarianceAnalysis && results.length >= 2 && (
              <div style={{ marginBottom: 20 }>
                <VarianceAnalysis 
                  results={results as PreviewResultWithPath[]}
                  onSuggestionClick={onVarianceSuggestion}
                />
              </div>
            )}
            {/* Comparison View */}
            {compareMode && selectedForComparison.length >= 2 && (
              <div style={{
  marginBottom: 20,
  padding: 16,
  background: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: 8,
}>
                <h3 style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: 14 }>⚖️ Result Comparison</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }>
                  {selectedForComparison.map(index => {
  const result = results[index];
                    return (
                      <div key={index} style={{
  padding: 8,
  background: '#fff',
  borderRadius: 4,
  border: '1px solid #bae6fd',
}>
                        <div style={{
  fontSize: 11,
  fontWeight: 600,
  color: '#0c4a6e',
  marginBottom: 4,
}>
                          Seed {result.seed}
                        </div>
                        <div style={{
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#374151',
  maxHeight: 60,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}>
                          {result.output?.substring(0, 100)}...
                        </div>
                        {('executionTimeMs' in result) && (
                          <div style={{
  fontSize: 10,
  color: '#6b7280',
  marginTop: 4,
}>
                            {result.executionTimeMs}ms
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Results List */}
            <ul style={{ padding: 0, listStyle: 'none' }>
              {results.map((res, i) => {
                const hasPath = 'executionPath' in res && res.executionPath;
                const locked = isResultLocked(i);
                const regenerating = isResultRegenerating(i);
                const selected = isResultSelected(i);
                return (
                  <li key={i} onMouseEnter={() => onResultHover?.(i)} style={{
  marginBottom: 16,
  padding: 12,
  border: selected ? '2px solid #10b981' : locked ? '2px solid #f59e0b' : '1px solid #e5e7eb',
  borderRadius: 8,
  position:'relative',
  cursor:'pointer',
  background: regenerating ? '#fef3c7' : locked ? '#fffbeb' : selected ? '#f0fdfa' : hasPath ? '#f8fafc' : '#fff',
  opacity: regenerating ? 0.7 : 1,
}>
                    {/* Seed badge */}
                    <span style={{
  position:'absolute',
  top:-10,
  left:-10,
  background: res.error ? '#dc2626' : locked ? '#f59e0b' : '#4d7cff',
  color:'#fff',
  fontSize:10,
  padding:'2px 6px',
  borderRadius:12,
  fontWeight:600,
}>{res.seed}</span>
                    {/* Status indicators */}
                    {locked && (
                      <span style={{
  position: 'absolute',
  top: -10,
  left: 25,
  background: '#f59e0b',
  color: '#fff',
  fontSize: 8,
  padding: '1px 4px',
  borderRadius: 8,
  fontWeight: 600,
}>
                        🔒 LOCKED
                      </span>
                    )}
                    {regenerating && (
                      <span style={{
  position: 'absolute',
  top: -10,
  left: locked ? 75 : 25,
  background: '#8b5cf6',
  color: '#fff',
  fontSize: 8,
  padding: '1px 4px',
  borderRadius: 8,
  fontWeight: 600,
  animation: 'pulse 1.5s infinite',
}>
                        ⟳ REGENERATING
                      </span>
                    )}
                    {/* Action buttons */}
                    <div style={{
  position: 'absolute',
  top: 8,
  right: 8,
  display: 'flex',
  gap: 4,
  opacity: 0.8,
}>
                      {/* Compare selection */}
                      {compareMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComparisonSelection(i);

                          disabled={!selected && selectedForComparison.length >= 3}
                          style={{
  width: 20,
  height: 20,
  border: 'none',
  borderRadius: 4,
  background: selected ? '#10b981' : '#e5e7eb',
  color: selected ? '#fff' : '#6b7280',
  fontSize: 10,
  cursor: (!selected && selectedForComparison.length >= 3) ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

                        >
                          ✓
                        </button>
                      )}
                      {/* Lock/Unlock button */}
                      <button
                        onClick={(e) => {
  e.stopPropagation();
  handleResultAction(locked ? 'unlock' : 'lock', i);

                        style={{
  width: 20,
  height: 20,
  border: 'none',
  borderRadius: 4,
  background: locked ? '#f59e0b' : '#e5e7eb',
  color: locked ? '#fff' : '#6b7280',
  fontSize: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

                      >
                        {locked ? '🔒' : '🔓'}
                      </button>
                      {/* Regenerate button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!regenerating && !locked) {
                            handleResultAction('regenerate', i);

                        disabled={regenerating || locked}
                        style={{
  width: 20,
  height: 20,
  border: 'none',
  borderRadius: 4,
  background: regenerating ? '#8b5cf6' : (locked ? '#d1d5db' : '#3b82f6'),
  color: '#fff',
  fontSize: 10,
  cursor: (regenerating || locked) ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

                      >
                        ⟳
                      </button>
                      {/* Export button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResultAction('export', i);

                        style={{
  width: 20,
  height: 20,
  border: 'none',
  borderRadius: 4,
  background: '#6b7280',
  color: '#fff',
  fontSize: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

                      >
                        💾
                      </button>
                    </div>
                    {hasPath && (
                      <div style={{
  position: 'absolute',
  top: -10,
  right: -10,
  background: '#10b981',
  color: '#fff',
  fontSize: 9,
  padding: '2px 4px',
  borderRadius: 8,
  fontWeight: 500,
}>
                        PATH
                      </div>
                    )}
                    {/* Regenerating overlay */}
                    {regenerating && (
                      <div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(139, 92, 246, 0.1)',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  color: '#8b5cf6',
  fontWeight: 600,
}>
                        <div style={{ textAlign: 'center' }>
                          <div style={{ fontSize: 20, marginBottom: 4 }>⟳</div>
                          <div>Regenerating...</div>
                        </div>
                      </div>
                    )}
                    {/* Result content */}
                    <div style={{ marginTop: 20, marginBottom: 8 }>
                      {res.error ? (
                        <div style={{ color: '#dc2626', fontSize: 14 }>⚠️ {res.error}</div>
                      ) : (
                        <div style={{
  fontFamily: 'monospace',
  whiteSpace:'pre-wrap',
  fontSize: 13,
  lineHeight: 1.4,
  color: '#374151',
}>
                          {res.output || ('output' in res ? res.output : '')}
                        </div>
                      )}
                    </div>
                    {/* Locked result info */}
                    {locked && (
                      <div style={{
  marginTop: 8,
  padding: 6,
  background: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: 4,
  fontSize: 11,
  color: '#92400e',
}>
                        🔒 This result is locked and won't be affected by regeneration
                        {lockedResults.find(l => l.index === i)?.note && (
                          <div style={{ marginTop: 2, fontStyle: 'italic' }>
                            Note: {lockedResults.find(l => l.index === i)?.note}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Execution metadata */}
                    {hasPath && 'executionTimeMs' in res && (
                      <div style={{
  marginTop: 8,
  padding: 6,
  background: '#e2e8f0',
  borderRadius: 4,
  fontSize: 11,
  color: '#4a5568',
}>
                        Execution: {res.executionTimeMs}ms
                        {res.executionPath && (
                          <span style={{ marginLeft: 8 }>
                            • {res.executionPath.steps.length} steps
                            • {res.executionPath.randomizationPoints.length} random points
                          </span>
                        )}
                      </div>
                    )}
                    {/* Epic 8.5 Task 6: Enhanced Weight Impact Visualization */}
                    {hasPath && 'weightChoices' in res && res.weightChoices && res.weightChoices.length > 0 && (
                      <div style={{
  marginTop: 8,
  padding: 10,
  background: 'rgba(77, 124, 255, 0.08)',
  border: '1px solid rgba(77, 124, 255, 0.25)',
  borderRadius: 6,
}>
                        <div style={{
  fontSize: 11,
  fontWeight: 600,
  color: '#4d7cff',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}>
                          🎬 Weight Impact Analysis
                          <span style={{
  fontSize: 9,
  fontWeight: 400,
  opacity: 0.8,
  background: 'rgba(77, 124, 255, 0.2)',
  padding: '1px 4px',
  borderRadius: 8,
}>
                            Epic 8.5
                          </span>
                        </div>
                        {res.weightChoices.map((choice, idx) => {
                          const probability = choice.selectionProbability || 0;
                          const probabilityPercent = (probability * 100).toFixed(1);
                          const isHighProbability = probability > 0.5;
                          const isMediumProbability = probability > 0.2;
                          return (
                            <div key={idx} style={{
                              fontSize: 10,
                              color: '#374151',
                              marginBottom: 4,
                              lineHeight: 1.4,
                              padding: '4px 6px',
                              background: 'rgba(255, 255, 255, 0.6)',
                              borderRadius: 3,
                              border: `1px solid ${isHighProbability ? '#10b981' : isMediumProbability ? '#f59e0b' : '#6b7280'}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }>
                              <div>
                                <span style={{ fontWeight: 600, color: '#1f2937' }>
                                  {choice.nodeId.slice(0, 12)}...
                                </span>
                                <span style={{ marginLeft: 4 }>
                                  "{choice.selectedOption}"
                                </span>
                              </div>
                              {choice.selectionProbability && (
                                <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}>
                                  <div style={{
  width: 40,
  height: 4,
  background: '#e5e7eb',
  borderRadius: 2,
  overflow: 'hidden',
}>
                                    <div style={{
                                      width: `${probability * 100}%`,
                                      height: '100%',
                                      background: isHighProbability ? '#10b981' : isMediumProbability ? '#f59e0b' : '#6b7280',
                                      transition: 'width 0.3s ease'
                                    } />
                                  </div>
                                  <span style={{
  color: isHighProbability ? '#065f46' : isMediumProbability ? '#92400e' : '#4b5563',
  fontWeight: 600,
  fontSize: 9,
}>
                                    {probabilityPercent}%
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div style={{
  marginTop: 6,
  fontSize: 9,
  color: '#6b7280',
  fontStyle: 'italic',
}>
                          Real-time weight impact from Story 8.3 controls
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 20,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
}>
          <div style={{ fontSize: 12, color: '#6b7280' }>
            {lockedResults.length > 0 && (
              <span style={{ marginRight: 16 }>
                🔒 {lockedResults.length} locked result{lockedResults.length !== 1 ? 's' : ''}
              </span>
            )}
            {regeneratingResults.length > 0 && (
              <span>
                ⟳ {regeneratingResults.length} regenerating
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }>
            {loading && onCancel && (
              <button 
                onClick={onCancel}
                style={{
  padding: '8px 16px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,

              >
                Cancel
              </button>
            )}
            <button 
              onClick={onClose}
              style={{
  padding: '8px 16px',
  background: '#4b5563',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,

            >
              Close
            </button>
          </div>
        </div>
        {/* Export Options Dialog */}
        <ExportOptionsDialog
          open={exportDialog.open}
          onClose={() => setExportDialog({ open: false, type: 'individual' })}
          results={results as PreviewResultWithPath[]}
          selectedIndices={exportDialog.type === 'batch' ? selectedForComparison : []}
          exportType={exportDialog.type}
          individualIndex={exportDialog.individualIndex}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default PreviewModal;