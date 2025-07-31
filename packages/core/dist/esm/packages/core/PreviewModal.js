import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { ExecutionPathVisualization } from './components/ExecutionPathVisualization';
import { ExportOptionsDialog } from './components/ExportOptionsDialog';
import { VarianceAnalysis } from './components/VarianceAnalysis';
import { resultExportService } from './services/ResultExportService';
import { professionalColors } from './styles/professional-design-system';
export const PreviewModal = ({
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
  onVarianceSuggestion,
}) => {
  const [showExecutionPaths, setShowExecutionPaths] = useState(false);
  const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [exportDialog, setExportDialog] = useState({ open: false, type: 'individual' });
  // Check if results have execution path data
  const hasExecutionPaths = results.length > 0 && results.some(r => 'executionPath' in r && r.executionPath);
  // Helper functions for result management
  const isResultLocked = index => lockedResults.some(locked => locked.index === index);
  const isResultRegenerating = index => regeneratingResults.includes(index);
  const isResultSelected = index => selectedForComparison.includes(index);
  const handleResultAction = (type, index, data) => {
    if (type === 'export') {
      setExportDialog({
        open: true,
        type: 'individual',
        individualIndex: index,
      });
      return;
    }
    onResultAction?.({ type, resultIndex: index, data });
  };
  const toggleComparisonSelection = index => {
    if (isResultSelected(index)) {
      setSelectedForComparison(prev => prev.filter(i => i !== index));
    } else if (selectedForComparison.length < 3) {
      // Limit to 3 results for comparison
      setSelectedForComparison(prev => [...prev, index]);
    }
  };
  const clearComparison = () => {
    setSelectedForComparison([]);
    setCompareMode(false);
  };
  const handleExport = async (format, options) => {
    try {
      let exportResult;
      if (exportDialog.type === 'individual' && typeof exportDialog.individualIndex === 'number') {
        const result = results[exportDialog.individualIndex];
        exportResult = await resultExportService.exportIndividualResult(
          result,
          exportDialog.individualIndex,
          results.length,
          options
        );
      } else if (exportDialog.type === 'batch') {
        exportResult = await resultExportService.exportBatchResults(results, selectedForComparison, options);
      } else {
        exportResult = await resultExportService.exportComparison(results, selectedForComparison, options);
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
  const downloadExportResult = (exportResult, format) => {
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
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const getFileExtension = format => {
    const extensions = {
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
    return extensions[format] || 'json';
  };
  if (!open) return null;
  return _jsx('div', {
    role: 'dialog',
    'aria-modal': 'true',
    style: {
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
    },
    children: _jsxs('div', {
      style: {
        background: professionalColors.background.elevated,
        borderRadius: 12,
        padding: 24,
        minWidth: 400,
        maxWidth: hasExecutionPaths ? 800 : 600,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        color: professionalColors.text.primary,
      },
      children: [
        _jsxs('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          },
          children: [
            _jsx('h2', { style: { margin: 0 }, children: 'Generated Content' }),
            _jsxs('div', {
              style: { display: 'flex', gap: 8, alignItems: 'center' },
              children: [
                hasExecutionPaths &&
                  _jsx('button', {
                    onClick: () => setShowExecutionPaths(!showExecutionPaths),
                    style: {
                      background: showExecutionPaths ? '#4d7cff' : '#e2e8f0',
                      color: showExecutionPaths ? '#fff' : '#2d3748',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    },
                    children: showExecutionPaths ? '📊 Hide Paths' : '🔍 Show Paths',
                  }),
                results.length >= 2 &&
                  _jsx('button', {
                    onClick: () => setShowVarianceAnalysis(!showVarianceAnalysis),
                    style: {
                      background: showVarianceAnalysis ? '#8b5cf6' : '#e2e8f0',
                      color: showVarianceAnalysis ? '#fff' : '#2d3748',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    },
                    children: showVarianceAnalysis ? '📈 Hide Variance' : '📊 Show Variance',
                  }),
                _jsx('button', {
                  onClick: () => {
                    if (compareMode) {
                      clearComparison();
                    } else {
                      setCompareMode(true);
                    }
                  },
                  style: {
                    background: compareMode ? '#10b981' : '#e2e8f0',
                    color: compareMode ? '#fff' : '#2d3748',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  },
                  children: compareMode ? '⚖️ Exit Compare' : '⚖️ Compare',
                }),
                selectedForComparison.length > 0 &&
                  _jsx('button', {
                    onClick: () =>
                      setExportDialog({
                        open: true,
                        type: 'batch',
                      }),
                    style: {
                      background: '#8b5cf6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    },
                    children: '\uD83D\uDCBE Export Selected',
                  }),
                !compareMode &&
                  results.length > 1 &&
                  _jsx('button', {
                    onClick: () =>
                      setExportDialog({
                        open: true,
                        type: 'comparison',
                      }),
                    style: {
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    },
                    children: '\uD83D\uDCCA Export All',
                  }),
                compareMode &&
                  selectedForComparison.length > 0 &&
                  _jsxs('span', {
                    style: {
                      fontSize: 11,
                      color: '#4a5568',
                      padding: '4px 8px',
                      background: '#f7fafc',
                      borderRadius: 4,
                    },
                    children: [selectedForComparison.length, '/3 selected'],
                  }),
              ],
            }),
          ],
        }),
        loading && _jsx('div', { style: { marginBottom: 12 }, children: '\u2728 Generating content...' }),
        error && _jsxs('div', { style: { color: '#c00' }, children: ['\u26A0\uFE0F Something went wrong: ', error] }),
        !loading &&
          !error &&
          _jsxs('div', {
            children: [
              showExecutionPaths &&
                hasExecutionPaths &&
                _jsx('div', {
                  style: { marginBottom: 20 },
                  children: _jsx(ExecutionPathVisualization, {
                    results: results,
                    onNodeHighlight: onNodeHighlight,
                    config: {
                      showExecutionOrder: true,
                      showRandomChoices: true,
                      showPerformanceMetrics: true,
                    },
                  }),
                }),
              showVarianceAnalysis &&
                results.length >= 2 &&
                _jsx('div', {
                  style: { marginBottom: 20 },
                  children: _jsx(VarianceAnalysis, { results: results, onSuggestionClick: onVarianceSuggestion }),
                }),
              compareMode &&
                selectedForComparison.length >= 2 &&
                _jsxs('div', {
                  style: {
                    marginBottom: 20,
                    padding: 16,
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: 8,
                  },
                  children: [
                    _jsx('h3', {
                      style: { margin: '0 0 12px 0', color: '#0c4a6e', fontSize: 14 },
                      children: '\u2696\uFE0F Result Comparison',
                    }),
                    _jsx('div', {
                      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
                      children: selectedForComparison.map(index => {
                        const result = results[index];
                        return _jsxs(
                          'div',
                          {
                            style: {
                              padding: 8,
                              background: '#fff',
                              borderRadius: 4,
                              border: '1px solid #bae6fd',
                            },
                            children: [
                              _jsxs('div', {
                                style: {
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#0c4a6e',
                                  marginBottom: 4,
                                },
                                children: ['Seed ', result.seed],
                              }),
                              _jsxs('div', {
                                style: {
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                  color: '#374151',
                                  maxHeight: 60,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                },
                                children: [result.output?.substring(0, 100), '...'],
                              }),
                              'executionTimeMs' in result &&
                                _jsxs('div', {
                                  style: {
                                    fontSize: 10,
                                    color: '#6b7280',
                                    marginTop: 4,
                                  },
                                  children: [result.executionTimeMs, 'ms'],
                                }),
                            ],
                          },
                          index
                        );
                      }),
                    }),
                  ],
                }),
              _jsx('ul', {
                style: { padding: 0, listStyle: 'none' },
                children: results.map((res, i) => {
                  const hasPath = 'executionPath' in res && res.executionPath;
                  const locked = isResultLocked(i);
                  const regenerating = isResultRegenerating(i);
                  const selected = isResultSelected(i);
                  return _jsxs(
                    'li',
                    {
                      onMouseEnter: () => onResultHover?.(i),
                      style: {
                        marginBottom: 16,
                        padding: 12,
                        border: selected ? '2px solid #10b981' : locked ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                        borderRadius: 8,
                        position: 'relative',
                        cursor: 'pointer',
                        background: regenerating
                          ? '#fef3c7'
                          : locked
                            ? '#fffbeb'
                            : selected
                              ? '#f0fdfa'
                              : hasPath
                                ? '#f8fafc'
                                : '#fff',
                        opacity: regenerating ? 0.7 : 1,
                      },
                      children: [
                        _jsx('span', {
                          style: {
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            background: res.error ? '#dc2626' : locked ? '#f59e0b' : '#4d7cff',
                            color: '#fff',
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 12,
                            fontWeight: 600,
                          },
                          children: res.seed,
                        }),
                        locked &&
                          _jsx('span', {
                            style: {
                              position: 'absolute',
                              top: -10,
                              left: 25,
                              background: '#f59e0b',
                              color: '#fff',
                              fontSize: 8,
                              padding: '1px 4px',
                              borderRadius: 8,
                              fontWeight: 600,
                            },
                            children: '\uD83D\uDD12 LOCKED',
                          }),
                        regenerating &&
                          _jsx('span', {
                            style: {
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
                            },
                            children: '\u27F3 REGENERATING',
                          }),
                        _jsxs('div', {
                          style: {
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 4,
                            opacity: 0.8,
                          },
                          children: [
                            compareMode &&
                              _jsx('button', {
                                onClick: e => {
                                  e.stopPropagation();
                                  toggleComparisonSelection(i);
                                },
                                disabled: !selected && selectedForComparison.length >= 3,
                                style: {
                                  width: 20,
                                  height: 20,
                                  border: 'none',
                                  borderRadius: 4,
                                  background: selected ? '#10b981' : '#e5e7eb',
                                  color: selected ? '#fff' : '#6b7280',
                                  fontSize: 10,
                                  cursor: !selected && selectedForComparison.length >= 3 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                },
                                children: '\u2713',
                              }),
                            _jsx('button', {
                              onClick: e => {
                                e.stopPropagation();
                                handleResultAction(locked ? 'unlock' : 'lock', i);
                              },
                              style: {
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
                              },
                              children: locked ? '🔒' : '🔓',
                            }),
                            _jsx('button', {
                              onClick: e => {
                                e.stopPropagation();
                                if (!regenerating && !locked) {
                                  handleResultAction('regenerate', i);
                                }
                              },
                              disabled: regenerating || locked,
                              style: {
                                width: 20,
                                height: 20,
                                border: 'none',
                                borderRadius: 4,
                                background: regenerating ? '#8b5cf6' : locked ? '#d1d5db' : '#3b82f6',
                                color: '#fff',
                                fontSize: 10,
                                cursor: regenerating || locked ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                              children: '\u27F3',
                            }),
                            _jsx('button', {
                              onClick: e => {
                                e.stopPropagation();
                                handleResultAction('export', i);
                              },
                              style: {
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
                              },
                              children: '\uD83D\uDCBE',
                            }),
                          ],
                        }),
                        hasPath &&
                          _jsx('div', {
                            style: {
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              background: '#10b981',
                              color: '#fff',
                              fontSize: 9,
                              padding: '2px 4px',
                              borderRadius: 8,
                              fontWeight: 500,
                            },
                            children: 'PATH',
                          }),
                        regenerating &&
                          _jsx('div', {
                            style: {
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
                            },
                            children: _jsxs('div', {
                              style: { textAlign: 'center' },
                              children: [
                                _jsx('div', { style: { fontSize: 20, marginBottom: 4 }, children: '\u27F3' }),
                                _jsx('div', { children: 'Regenerating...' }),
                              ],
                            }),
                          }),
                        _jsx('div', {
                          style: { marginTop: 20, marginBottom: 8 },
                          children: res.error
                            ? _jsxs('div', {
                                style: { color: '#dc2626', fontSize: 14 },
                                children: ['\u26A0\uFE0F ', res.error],
                              })
                            : _jsx('div', {
                                style: {
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  fontSize: 13,
                                  lineHeight: 1.4,
                                  color: '#374151',
                                },
                                children: res.output || ('output' in res ? res.output : ''),
                              }),
                        }),
                        locked &&
                          _jsxs('div', {
                            style: {
                              marginTop: 8,
                              padding: 6,
                              background: '#fef3c7',
                              border: '1px solid #f59e0b',
                              borderRadius: 4,
                              fontSize: 11,
                              color: '#92400e',
                            },
                            children: [
                              "\uD83D\uDD12 This result is locked and won't be affected by regeneration",
                              lockedResults.find(l => l.index === i)?.note &&
                                _jsxs('div', {
                                  style: { marginTop: 2, fontStyle: 'italic' },
                                  children: ['Note: ', lockedResults.find(l => l.index === i)?.note],
                                }),
                            ],
                          }),
                        hasPath &&
                          'executionTimeMs' in res &&
                          _jsxs('div', {
                            style: {
                              marginTop: 8,
                              padding: 6,
                              background: '#e2e8f0',
                              borderRadius: 4,
                              fontSize: 11,
                              color: '#4a5568',
                            },
                            children: [
                              'Execution: ',
                              res.executionTimeMs,
                              'ms',
                              res.executionPath &&
                                _jsxs('span', {
                                  style: { marginLeft: 8 },
                                  children: [
                                    '\u2022 ',
                                    res.executionPath.steps.length,
                                    ' steps \u2022 ',
                                    res.executionPath.randomizationPoints.length,
                                    ' random points',
                                  ],
                                }),
                            ],
                          }),
                        hasPath &&
                          'weightChoices' in res &&
                          res.weightChoices &&
                          res.weightChoices.length > 0 &&
                          _jsxs('div', {
                            style: {
                              marginTop: 8,
                              padding: 10,
                              background: 'rgba(77, 124, 255, 0.08)',
                              border: '1px solid rgba(77, 124, 255, 0.25)',
                              borderRadius: 6,
                            },
                            children: [
                              _jsxs('div', {
                                style: {
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#4d7cff',
                                  marginBottom: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                },
                                children: [
                                  '\uD83C\uDFAC Weight Impact Analysis',
                                  _jsx('span', {
                                    style: {
                                      fontSize: 9,
                                      fontWeight: 400,
                                      opacity: 0.8,
                                      background: 'rgba(77, 124, 255, 0.2)',
                                      padding: '1px 4px',
                                      borderRadius: 8,
                                    },
                                    children: 'Epic 8.5',
                                  }),
                                ],
                              }),
                              res.weightChoices.map((choice, idx) => {
                                const probability = choice.selectionProbability || 0;
                                const probabilityPercent = (probability * 100).toFixed(1);
                                const isHighProbability = probability > 0.5;
                                const isMediumProbability = probability > 0.2;
                                return _jsxs(
                                  'div',
                                  {
                                    style: {
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
                                      alignItems: 'center',
                                    },
                                    children: [
                                      _jsxs('div', {
                                        children: [
                                          _jsxs('span', {
                                            style: { fontWeight: 600, color: '#1f2937' },
                                            children: [choice.nodeId.slice(0, 12), '...'],
                                          }),
                                          _jsxs('span', {
                                            style: { marginLeft: 4 },
                                            children: ['"', choice.selectedOption, '"'],
                                          }),
                                        ],
                                      }),
                                      choice.selectionProbability &&
                                        _jsxs('div', {
                                          style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                          },
                                          children: [
                                            _jsx('div', {
                                              style: {
                                                width: 40,
                                                height: 4,
                                                background: '#e5e7eb',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                              },
                                              children: _jsx('div', {
                                                style: {
                                                  width: `${probability * 100}%`,
                                                  height: '100%',
                                                  background: isHighProbability
                                                    ? '#10b981'
                                                    : isMediumProbability
                                                      ? '#f59e0b'
                                                      : '#6b7280',
                                                  transition: 'width 0.3s ease',
                                                },
                                              }),
                                            }),
                                            _jsxs('span', {
                                              style: {
                                                color: isHighProbability
                                                  ? '#065f46'
                                                  : isMediumProbability
                                                    ? '#92400e'
                                                    : '#4b5563',
                                                fontWeight: 600,
                                                fontSize: 9,
                                              },
                                              children: [probabilityPercent, '%'],
                                            }),
                                          ],
                                        }),
                                    ],
                                  },
                                  idx
                                );
                              }),
                              _jsx('div', {
                                style: {
                                  marginTop: 6,
                                  fontSize: 9,
                                  color: '#6b7280',
                                  fontStyle: 'italic',
                                },
                                children: 'Real-time weight impact from Story 8.3 controls',
                              }),
                            ],
                          }),
                      ],
                    },
                    i
                  );
                }),
              }),
            ],
          }),
        _jsxs('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
          },
          children: [
            _jsxs('div', {
              style: { fontSize: 12, color: '#6b7280' },
              children: [
                lockedResults.length > 0 &&
                  _jsxs('span', {
                    style: { marginRight: 16 },
                    children: [
                      '\uD83D\uDD12 ',
                      lockedResults.length,
                      ' locked result',
                      lockedResults.length !== 1 ? 's' : '',
                    ],
                  }),
                regeneratingResults.length > 0 &&
                  _jsxs('span', { children: ['\u27F3 ', regeneratingResults.length, ' regenerating'] }),
              ],
            }),
            _jsxs('div', {
              style: { display: 'flex', gap: 8 },
              children: [
                loading &&
                  onCancel &&
                  _jsx('button', {
                    onClick: onCancel,
                    style: {
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    },
                    children: 'Cancel',
                  }),
                _jsx('button', {
                  onClick: onClose,
                  style: {
                    padding: '8px 16px',
                    background: '#4b5563',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                  },
                  children: 'Close',
                }),
              ],
            }),
          ],
        }),
        _jsx(ExportOptionsDialog, {
          open: exportDialog.open,
          onClose: () => setExportDialog({ open: false, type: 'individual' }),
          results: results,
          selectedIndices: exportDialog.type === 'batch' ? selectedForComparison : [],
          exportType: exportDialog.type,
          individualIndex: exportDialog.individualIndex,
          onExport: handleExport,
        }),
      ],
    }),
  });
};
export default PreviewModal;
