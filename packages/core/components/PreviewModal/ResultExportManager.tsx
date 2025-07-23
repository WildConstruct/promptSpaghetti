/**
 * Epic 8.5 - Result Export Manager
 * 
 * Professional export system for film industry workflows.
 * Integrates with existing export infrastructure for VFX-ready outputs.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { EnhancedPreviewResult } from './EnhancedPreviewModal';
import { useResultManagementStore } from '../../stores/resultManagementStore';
import { ErrorFactory } from '../../errors/ErrorFactory';

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  category: 'script' | 'vfx' | 'data' | 'report';
  vfxCompatible?: boolean;
  controlNetReady?: boolean;
  icon: string;
}

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeExecutionPath?: boolean;
  includeVarianceAnalysis?: boolean;
  compressOutput?: boolean;
  
  // VFX-specific options
  vfxOptions?: {
    targetPipeline?: 'stable-diffusion' | 'midjourney' | 'dalle' | 'custom';
    includeControlNet?: boolean;
    includeSceneData?: boolean;
    frameRate?: number;
    resolution?: [number, number];
  };
  
  // Film industry options
  filmOptions?: {
    scriptFormat?: 'fountain' | 'final-draft' | 'writerpro';
    includeCharacterNotes?: boolean;
    includeDirectorNotes?: boolean;
    includeSceneBreakdowns?: boolean;
    watermark?: string;
  };
}

export interface ResultExportManagerProps {
  results: EnhancedPreviewResult[];
  selectedResultIds: string[];
  onExportComplete?: (exportedResultIds: string[], format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
  className?: string;
}

// Professional export formats for film industry
const EXPORT_FORMATS: ExportFormat[] = [
  // Script Formats
  {
    id: 'fountain',
    name: 'Fountain Script',
    description: 'Industry-standard screenplay format',
    extension: 'fountain',
    category: 'script',
    icon: '📄'
  },
  {
    id: 'final-draft',
    name: 'Final Draft',
    description: 'Final Draft compatible XML format',
    extension: 'fdx',
    category: 'script',
    icon: '🎬'
  },
  {
    id: 'pdf-script',
    name: 'PDF Script',
    description: 'Professional screenplay PDF',
    extension: 'pdf',
    category: 'script',
    icon: '📋'
  },
  
  // VFX Formats
  {
    id: 'controlnet-json',
    name: 'ControlNet JSON',
    description: 'ControlNet-compatible export for AI generation',
    extension: 'json',
    category: 'vfx',
    vfxCompatible: true,
    controlNetReady: true,
    icon: '🤖'
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion Bundle',
    description: 'Complete Stable Diffusion pipeline export',
    extension: 'zip',
    category: 'vfx',
    vfxCompatible: true,
    controlNetReady: true,
    icon: '🎨'
  },
  {
    id: 'scene-data',
    name: 'Scene Data JSON',
    description: 'Camera, lighting, and environment data',
    extension: 'json',
    category: 'vfx',
    vfxCompatible: true,
    icon: '🎥'
  },
  
  // Data Formats
  {
    id: 'csv-analysis',
    name: 'CSV Analysis',
    description: 'Spreadsheet-ready analytics data',
    extension: 'csv',
    category: 'data',
    icon: '📊'
  },
  {
    id: 'json-complete',
    name: 'Complete JSON',
    description: 'Full result data with metadata',
    extension: 'json',
    category: 'data',
    icon: '💾'
  },
  
  // Reports
  {
    id: 'professional-report',
    name: 'Professional Report',
    description: 'Executive summary with variance analysis',
    extension: 'pdf',
    category: 'report',
    icon: '📈'
  },
  {
    id: 'creative-brief',
    name: 'Creative Brief',
    description: 'Director-focused creative document',
    extension: 'docx',
    category: 'report',
    icon: '📝'
  }
];

export const ResultExportManager: React.FC<ResultExportManagerProps> = ({
  results,
  selectedResultIds,
  onExportComplete,
  onExportError,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const resultManagement = useResultManagementStore();

  // Filter results to selected ones
  const selectedResults = useMemo(() => {
    return results.filter(result => selectedResultIds.includes(result.id));
  }, [results, selectedResultIds]);

  // Group formats by category
  const formatsByCategory = useMemo(() => {
    return EXPORT_FORMATS.reduce((acc, format) => {
      if (!acc[format.category]) {
        acc[format.category] = [];
      }
      acc[format.category].push(format);
      return acc;
    }, {} as Record<string, ExportFormat[]>);
  }, []);

  const categoryLabels = {
    script: '🎬 Screenplay Formats',
    vfx: '🤖 VFX Pipeline',
    data: '📊 Data Exports',
    report: '📈 Professional Reports'
  };

  // Handle format selection
  const handleFormatSelect = useCallback((format: ExportFormat) => {
    setSelectedFormat(format);
    
    // Set default options based on format
    const defaultOptions: ExportOptions = {
      format,
      includeMetadata: true,
      includeExecutionPath: format.vfxCompatible,
      includeVarianceAnalysis: format.category === 'report',
      compressOutput: format.extension === 'zip'
    };

    // Add VFX-specific defaults
    if (format.vfxCompatible) {
      defaultOptions.vfxOptions = {
        targetPipeline: 'stable-diffusion',
        includeControlNet: format.controlNetReady,
        includeSceneData: true,
        frameRate: 24,
        resolution: [1920, 1080]
      };
    }

    // Add film-specific defaults
    if (format.category === 'script') {
      defaultOptions.filmOptions = {
        scriptFormat: format.id.includes('fountain') ? 'fountain' : 'final-draft',
        includeCharacterNotes: true,
        includeDirectorNotes: true,
        includeSceneBreakdowns: false
      };
    }

    setExportOptions(defaultOptions);
  }, []);

  // Handle export execution
  const handleExport = useCallback(async () => {
    if (!selectedFormat || !exportOptions || selectedResults.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      // Prepare export payload based on format
      const exportPayload = await prepareExportPayload(
        selectedResults,
        exportOptions
      );

      // Call the export API endpoint
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: selectedFormat.id,
          data: exportPayload,
          options: exportOptions,
          filename: generateFilename(selectedFormat, selectedResults.length)
        })
      });

      if (!response.ok) {
        throw ErrorFactory.createAPIError(
          response.status,
          `Export failed: ${response.statusText}`,
          '/api/export'
        );
      }

      // Handle different response types
      let exportResult;
      if (selectedFormat.extension === 'zip' || selectedFormat.extension === 'pdf') {
        // Binary formats - trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFilename(selectedFormat, selectedResults.length);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        exportResult = { success: true, downloadTriggered: true };
      } else {
        // Text formats - return data
        exportResult = await response.json();
      }

      // Mark results as exported
      await resultManagement.bulkExport(selectedResultIds, selectedFormat.id);

      // Notify parent component
      onExportComplete?.(selectedResultIds, selectedFormat);

      // Reset state
      setSelectedFormat(null);
      setExportOptions(null);
      setShowAdvancedOptions(false);

    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Export failed');
      onExportError?.(exportError);
      
      throw ErrorFactory.createGraphExecutionError(
        'Result export failed',
        exportError,
        { operation: 'export_results', format: selectedFormat.id }
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat, exportOptions, selectedResults, selectedResultIds, resultManagement, onExportComplete, onExportError]);

  // Generate appropriate filename
  const generateFilename = (format: ExportFormat, resultCount: number): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const prefix = resultCount === 1 ? 'result' : `results-${resultCount}`;
    return `${prefix}-${timestamp}.${format.extension}`;
  };

  if (selectedResults.length === 0) {
    return (
      <div className={className}>
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📤</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
            No Results Selected
          </div>
          <div style={{ fontSize: 14 }}>
            Select results to enable professional export options
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`result-export-manager ${className}`} style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 20,
        borderBottom: '1px solid #e2e8f0',
        background: 'rgba(255, 255, 255, 0.8)'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📤 Export {selectedResults.length} Result{selectedResults.length !== 1 ? 's' : ''}
        </h3>
        <div style={{
          fontSize: 14,
          color: '#64748b',
          marginTop: 4
        }}>
          Choose professional export format for film industry workflows
        </div>
      </div>

      {/* Format Selection */}
      {!selectedFormat ? (
        <div style={{ padding: 20 }}>
          {Object.entries(formatsByCategory).map(([category, formats]) => (
            <div key={category} style={{ marginBottom: 24 }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151'
              }}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12
              }}>
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatSelect(format)}
                    style={{
                      padding: 16,
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      ':hover': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6
                    }}>
                      <span style={{ fontSize: 20 }}>{format.icon}</span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1f2937'
                      }}>
                        {format.name}
                      </span>
                      {format.vfxCompatible && (
                        <span style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                          color: 'white',
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 4,
                          fontWeight: 500
                        }}>
                          VFX
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280',
                      lineHeight: 1.4
                    }}>
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Export Options */
        <div style={{ padding: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            padding: 16,
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 8
          }}>
            <span style={{ fontSize: 24 }}>{selectedFormat.icon}</span>
            <div>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {selectedFormat.name}
              </div>
              <div style={{
                fontSize: 14,
                color: '#64748b'
              }}>
                {selectedFormat.description}
              </div>
            </div>
          </div>

          {/* Basic Options */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 14
              }}>
                <input
                  type="checkbox"
                  checked={exportOptions?.includeMetadata || false}
                  onChange={(e) => setExportOptions(prev => prev ? {
                    ...prev,
                    includeMetadata: e.target.checked
                  } : null)}
                  style={{ accentColor: '#3b82f6' }}
                />
                Include Metadata
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 14
              }}>
                <input
                  type="checkbox"
                  checked={exportOptions?.includeExecutionPath || false}
                  onChange={(e) => setExportOptions(prev => prev ? {
                    ...prev,
                    includeExecutionPath: e.target.checked
                  } : null)}
                  style={{ accentColor: '#3b82f6' }}
                />
                Include Execution Path
              </label>

              {selectedFormat.category === 'report' && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontSize: 14
                }}>
                  <input
                    type="checkbox"
                    checked={exportOptions?.includeVarianceAnalysis || false}
                    onChange={(e) => setExportOptions(prev => prev ? {
                      ...prev,
                      includeVarianceAnalysis: e.target.checked
                    } : null)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  Include Variance Analysis
                </label>
              )}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 13,
              color: '#374151',
              cursor: 'pointer',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{showAdvancedOptions ? '▼' : '▶'}</span>
            Advanced Options
          </button>

          {/* Advanced Options Panel */}
          {showAdvancedOptions && (
            <div style={{
              background: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20
            }}>
              {/* VFX Options */}
              {selectedFormat.vfxCompatible && (
                <div style={{ marginBottom: 16 }}>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    🤖 VFX Pipeline Settings
                  </h5>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 12
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#6b7280',
                        marginBottom: 4
                      }}>
                        Target Pipeline
                      </label>
                      <select
                        value={exportOptions?.vfxOptions?.targetPipeline || 'stable-diffusion'}
                        onChange={(e) => setExportOptions(prev => prev ? {
                          ...prev,
                          vfxOptions: {
                            ...prev.vfxOptions,
                            targetPipeline: e.target.value as any
                          }
                        } : null)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          fontSize: 13
                        }}
                      >
                        <option value="stable-diffusion">Stable Diffusion</option>
                        <option value="midjourney">Midjourney</option>
                        <option value="dalle">DALL-E</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#6b7280',
                        marginBottom: 4
                      }}>
                        Resolution
                      </label>
                      <select
                        value={`${exportOptions?.vfxOptions?.resolution?.[0]}x${exportOptions?.vfxOptions?.resolution?.[1]}`}
                        onChange={(e) => {
                          const [width, height] = e.target.value.split('x').map(Number);
                          setExportOptions(prev => prev ? {
                            ...prev,
                            vfxOptions: {
                              ...prev.vfxOptions,
                              resolution: [width, height]
                            }
                          } : null);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          fontSize: 13
                        }}
                      >
                        <option value="1920x1080">1920×1080 (HD)</option>
                        <option value="2560x1440">2560×1440 (QHD)</option>
                        <option value="3840x2160">3840×2160 (4K)</option>
                        <option value="1024x1024">1024×1024 (Square)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Film Options */}
              {selectedFormat.category === 'script' && (
                <div>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    🎬 Script Format Settings
                  </h5>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      fontSize: 13
                    }}>
                      <input
                        type="checkbox"
                        checked={exportOptions?.filmOptions?.includeCharacterNotes || false}
                        onChange={(e) => setExportOptions(prev => prev ? {
                          ...prev,
                          filmOptions: {
                            ...prev.filmOptions,
                            includeCharacterNotes: e.target.checked
                          }
                        } : null)}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      Character Notes
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      fontSize: 13
                    }}>
                      <input
                        type="checkbox"
                        checked={exportOptions?.filmOptions?.includeDirectorNotes || false}
                        onChange={(e) => setExportOptions(prev => prev ? {
                          ...prev,
                          filmOptions: {
                            ...prev.filmOptions,
                            includeDirectorNotes: e.target.checked
                          }
                        } : null)}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      Director Notes
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <button
              onClick={() => {
                setSelectedFormat(null);
                setExportOptions(null);
                setShowAdvancedOptions(false);
              }}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                padding: '12px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ← Back to Formats
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                background: isExporting 
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {isExporting ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Exporting...
                </>
              ) : (
                <>
                  📤 Export {selectedResults.length} Result{selectedResults.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Helper function to prepare export payload
async function prepareExportPayload(
  results: EnhancedPreviewResult[],
  options: ExportOptions
): Promise<unknown> {
  const { format, includeMetadata, includeExecutionPath, includeVarianceAnalysis } = options;

  const basePayload = {
    results: results.map(result => ({
      id: result.id,
      seed: result.seed,
      output: result.output,
      ...(includeMetadata && { metadata: result.metadata }),
      ...(includeExecutionPath && { executionPath: result.executionPath || null })
    })),
    exportOptions: options,
    timestamp: new Date().toISOString()
  };

  // Add format-specific data
  switch (format.category) {
  case 'vfx':
    return {
      ...basePayload,
      vfxData: {
        pipeline: options.vfxOptions?.targetPipeline,
        resolution: options.vfxOptions?.resolution,
        controlNetCompatible: format.controlNetReady
      }
    };
      
  case 'script':
    return {
      ...basePayload,
      scriptData: {
        format: options.filmOptions?.scriptFormat,
        includeNotes: options.filmOptions?.includeCharacterNotes || options.filmOptions?.includeDirectorNotes
      }
    };
      
  case 'report':
    // Add variance analysis if requested
    if (includeVarianceAnalysis) {
      // This would calculate variance analysis across results
      // Implementation would depend on the specific analytics needed
    }
    return basePayload;
      
  default:
    return basePayload;
  }
}