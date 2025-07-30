/**
 * Export Options Dialog Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 * 
 * Professional export dialog with format selection, options configuration,
 * and size estimation for individual and batch result exports.
 */
import React, { useState, useMemo } from 'react';
import { ResultExportService, ExportFormat, ResultExportOptions } from '../services/ResultExportService';
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { professionalColors } from '../styles/professional-design-system';
interface ExportOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  results: PreviewResultWithPath;
  selectedIndices?: number;
  exportType: 'individual' | 'batch' | 'comparison';
  individualIndex?: number;
  onExport: (format: ExportFormat, options: ResultExportOptions) => Promise<void>;
  sourceGraph?: unknown;
}

export const ExportOptionsDialog: React.FC<ExportOptionsDialogProps> = ({
  open,
  onClose,
  results,
  selectedIndices = [],
  exportType,
  individualIndex,
  onExport,
  sourceGraph
}) => {
  const exportService = new ResultExportService();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json-simple');
  const [options, setOptions] = useState<ResultExportOptions>({
    format: 'json-simple',
    includeMetadata: true,
    includeExecutionPaths: false,
    includeDebugInfo: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const availableFormats = useMemo(() => {
    return exportService.getAvailableFormats().filter(format => {
      if (exportType === 'individual') {
        return format.supportsIndividual;
      } else if (exportType === 'batch') {
        return format.supportsBatch;
      }
      return format.supportsBatch; // comparison uses batch support
    });
  }, [exportType]);
  const exportResults = useMemo(() => {
    if (exportType === 'individual' && typeof individualIndex === 'number') {
      return [results[individualIndex]].filter(Boolean);
    } else if (exportType === 'batch') {
      return selectedIndices.map(index => results[index]).filter(Boolean);
    }
    return results;
  }, [results, exportType, individualIndex, selectedIndices]);
  const sizeEstimate = useMemo(() => {
    if (exportResults.length === 0) return null;
    return exportService.estimateExportSize(exportResults, selectedFormat, options);
  }, [exportResults, selectedFormat, options]);
  const formatInfo = useMemo(() => {
    return availableFormats.find(f => f.format === selectedFormat);
  }, [availableFormats, selectedFormat]);
  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
    setOptions(prev => ({ ...prev, format }));
    // Validate new format
    const errors = exportService.validateExportOptions(format, { ...options, format });
    setValidationErrors(errors);
  };
  const handleOptionChange = (path: string, value: Error) => {
    setOptions(prev => {
  const newOptions = { ...prev };
      const keys = path.split('.');
      let current: unknown = newOptions;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newOptions;
    });
  };
  const handleExport = async () => {
    const errors = exportService.validateExportOptions(selectedFormat, options);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    setIsExporting(true);
    try {
      await onExport(selectedFormat, options);
      onClose();
    } catch (error) {
  console.error('Export failed:', error);
  setValidationErrors(['Export failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
} finally {
      setIsExporting(false);
  };
  if (!open) return null;
  return;
    <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
      <div style={{
  background: professionalColors.background.elevated,
  borderRadius: 12,
  padding: 24,
  minWidth: 600,
  maxWidth: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  color: professionalColors.text.primary,
}}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${professionalColors.border.subtle}`,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Export Options
          </h2>
          <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontSize: 12,
  color: professionalColors.text.secondary,
}}>
            <span>📊 {exportType === 'individual' ? '1 result' : `${exportResults.length} results`}</span>
            {sizeEstimate && (
              <span>💾 ~{sizeEstimate.estimatedSize}{sizeEstimate.unit}</span>
            )}
          </div>
        </div>
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div style={{
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 6,
  padding: 12,
  marginBottom: 16,
}}>
            {validationErrors.map((error, index) => (
              <div key={index} style={{
  color: '#dc2626',
  fontSize: 12,
  marginBottom: index < validationErrors.length - 1 ? 6 : 0,
}}>
                ⚠️ {error}
              </div>
            ))}
          </div>
        )}
        {/* Size Warning */}
        {sizeEstimate?.warning && (
          <div style={{
  background: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: 6,
  padding: 12,
  marginBottom: 16,
  color: '#92400e',
  fontSize: 12,
}}>
            ⚡ {sizeEstimate.warning}
          </div>
        )}
        {/* Format Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
  display: 'block',
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 500,
  color: professionalColors.text.primary,
}}>
            Export Format
          </label>
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 8,
}}>
            {availableFormats.map((format) => (
              <div
                key={format.format}
                onClick={() => handleFormatChange(format.format)}
                style={{
  padding: 12,
  border: selectedFormat === format.format
    ? '2px solid #4d7cff'
    : '1px solid #e5e7eb',
  borderRadius: 6,
  cursor: 'pointer',
  background: selectedFormat === format.format ? '#f0f4ff' : '#fff',
  transition: 'all 0.2s',
}}
              >
                <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 4,
}}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{format.name}</div>
                  <div style={{
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 4,
  background: {
  text: '#e5e7eb',
  data: '#dbeafe',
  film: '#fef3c7',
  vfx: '#f3e8ff',
  analysis: '#ecfdf5',
}[format.category],
                    color: {
  text: '#374151',
  data: '#1e40af',
  film: '#92400e',
  vfx: '#7c3aed',
  analysis: '#065f46',
}[format.category]
                  }}>
                    {format.category.toUpperCase()}
                  </div>
                </div>
                <div style={{
  fontSize: 11,
  color: professionalColors.text.secondary,
  lineHeight: 1.4,
}}>
                  {format.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Format-specific Options */}
        {formatInfo && (
          <div style={{
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  padding: 16,
  marginBottom: 20,
}}>
            <h3 style={{
  margin: '0 0 12px 0',
  fontSize: 14,
  fontWeight: 500,
}}>
              {formatInfo.name} Options
            </h3>
            {/* Basic Options */}
            <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginBottom: 16,
}}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={options.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                />
                Include Metadata
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={options.includeExecutionPaths}
                  onChange={(e) => handleOptionChange('includeExecutionPaths', e.target.checked)}
                />
                Include Execution Paths
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={options.includeDebugInfo}
                  onChange={(e) => handleOptionChange('includeDebugInfo', e.target.checked)}
                />
                Include Debug Info
              </label>
            </div>
            {/* Film Options */}
            {formatInfo.category === 'film' && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }}>Film Industry Options</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.filmOptions?.includeDirectorNotes}
                      onChange={(e) => handleOptionChange('filmOptions.includeDirectorNotes', e.target.checked)}
                    />
                    Director Notes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.filmOptions?.sceneNumbering}
                      onChange={(e) => handleOptionChange('filmOptions.sceneNumbering', e.target.checked)}
                    />
                    Scene Numbering
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.filmOptions?.shotBreakdown}
                      onChange={(e) => handleOptionChange('filmOptions.shotBreakdown', e.target.checked)}
                    />
                    Shot Breakdown
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.filmOptions?.timingNotes}
                      onChange={(e) => handleOptionChange('filmOptions.timingNotes', e.target.checked)}
                    />
                    Timing Notes
                  </label>
                </div>
              </div>
            )}
            {/* VFX Options */}
            {formatInfo.category === 'vfx' && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }}>VFX Pipeline Options</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.vfxOptions?.controlNetCompatible}
                      onChange={(e) => handleOptionChange('vfxOptions.controlNetCompatible', e.target.checked)}
                    />
                    ControlNet Compatible
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.vfxOptions?.sceneDataIntegration}
                      onChange={(e) => handleOptionChange('vfxOptions.sceneDataIntegration', e.target.checked)}
                    />
                    Scene Data Integration
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.vfxOptions?.cameraMetadata}
                      onChange={(e) => handleOptionChange('vfxOptions.cameraMetadata', e.target.checked)}
                    />
                    Camera Metadata
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.vfxOptions?.lightingData}
                      onChange={(e) => handleOptionChange('vfxOptions.lightingData', e.target.checked)}
                    />
                    Lighting Data
                  </label>
                </div>
              </div>
            )}
            {/* Analysis Options */}
            {formatInfo.category === 'analysis' && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 500 }}>Analysis Options</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.analysisOptions?.varianceAnalysis}
                      onChange={(e) => handleOptionChange('analysisOptions.varianceAnalysis', e.target.checked)}
                    />
                    Variance Analysis
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.analysisOptions?.performanceBreakdown}
                      onChange={(e) => handleOptionChange('analysisOptions.performanceBreakdown', e.target.checked)}
                    />
                    Performance Breakdown
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.analysisOptions?.creativityMetrics}
                      onChange={(e) => handleOptionChange('analysisOptions.creativityMetrics', e.target.checked)}
                    />
                    Creativity Metrics
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={options.analysisOptions?.comparisonMatrix}
                      onChange={(e) => handleOptionChange('analysisOptions.comparisonMatrix', e.target.checked)}
                    />
                    Comparison Matrix
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: `1px solid ${professionalColors.border.subtle}`}
        }}>
          <div style={{
  fontSize: 11,
  color: professionalColors.text.secondary,
}}>
            {exportType === 'individual' 
              ? `Exporting result ${(individualIndex || 0) + 1} of ${results.length}`}
              : exportType === 'batch'
              ? `Exporting ${selectedIndices.length} selected results`}
              : `Exporting all ${results.length} results for comparison`}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              disabled={isExporting}
              style={{
  padding: '8px 16px',
  background: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  cursor: isExporting ? 'not-allowed' : 'pointer',
  fontSize: 12,
  color: professionalColors.text.secondary,
}}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || validationErrors.length > 0}
              style={{
  padding: '8px 16px',
  background: isExporting || validationErrors.length > 0 ? '#9ca3af' : '#4d7cff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: isExporting || validationErrors.length > 0 ? 'not-allowed' : 'pointer',
  fontSize: 12,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}}
            >
              {isExporting ? (
                <>
                  <div style={{
  width: 12,
  height: 12,
  border: '2px solid transparent',
  borderTop: '2px solid #fff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
}} />
                  Exporting...
                </>
              ) : ()
                <>
                  💾 Export {formatInfo?.name}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      `}</style>
    </div>
  );
};