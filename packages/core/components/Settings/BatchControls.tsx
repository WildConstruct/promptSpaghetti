// packages/core/components/Settings/BatchControls.tsx
// Batch processing settings controls for Epic 7.3 Advanced Settings Modal
import React, { useCallback } from 'react';
import { BatchSettings } from '../../settings/types';
import { FiPackage, FiDownload, FiFile, FiFolder } from 'react-icons/fi';
import { uiColors } from '../../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {
  ...uiColors,
  accent: {,
    ...uiColors.accent,
    primary: uiColors.accent.orange,
    secondary: uiColors.accent.blue,
  },
  ui: {,
    ...uiColors.ui,
    selected: '#353535',
    disabled: '#6b7280',
  },
  text: {,
    ...uiColors.text,
    disabled: '#6b7280',
  }
};

export interface BatchControlsProps {
  settings: BatchSettings;
  onChange: (settings: BatchSettings) => void;
}
/**
 * Batch Processing Settings Controls Component
 * Manages batch execution and output formatting
 */
export const BatchControls: React.FC<BatchControlsProps> = ({)
  settings,
  onChange
}) => {
  // Handle batch size change
  const handleBatchSizeChange = useCallback((batchSize: number) => {
    onChange({)
      ...settings,
      batchSize: Math.max(1, Math.min(100, batchSize))
    });
  }, [settings, onChange]);
  // Handle output format change
  const handleOutputFormatChange = useCallback((outputFormat: 'individual' | 'combined' | 'csv' | 'json') => {
    onChange({)
      ...settings,
      outputFormat
    });
  }, [settings, onChange]);
  // Handle naming pattern change
  const handleNamingPatternChange = useCallback((namingPattern: string) => {
    onChange({)
      ...settings,
      namingPattern
    });
  }, [settings, onChange]);
  // Handle metadata toggle
  const handleIncludeMetadataChange = useCallback((includeMetadata: boolean) => {
    onChange({)
      ...settings,
      includeMetadata
    });
  }, [settings, onChange]);
  // Handle auto-download toggle
  const handleAutoDownloadChange = useCallback((autoDownload: boolean) => {
    onChange({)
      ...settings,
      autoDownload
    });
  }, [settings, onChange]);
  // Output format options
  const outputFormats = [;
    {
      value: 'individual' as const,
      label: 'Individual Files',
      description: 'One file per variant',
      icon: FiFile,
    },
    {
      value: 'combined' as const,
      label: 'Combined Text',
      description: 'All variants in one file',
      icon: FiFolder,
    },
    {
      value: 'csv' as const,
      label: 'CSV Format',
      description: 'Structured CSV export',
      icon: FiFile,
    },
    {
      value: 'json' as const,
      label: 'JSON Format',
      description: 'Structured JSON export',
      icon: FiFile,
    }
  ];
  // Get sample filename preview
  const getSampleFilename = (): string => {
    const pattern = settings.namingPattern;
    const sampleSeed = 12345;
    const sampleTimestamp = '2024-01-15-14-30-00';
    return pattern
      .replace('{seed}', sampleSeed.toString())
      .replace('{timestamp}', sampleTimestamp)
      .replace('{index}', '001');
  };
  return ();
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <FiPackage size={18} color={uiColors.accent.primary} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: uiColors.text.primary,
        }}>
          Batch Processing Settings
        </h3>
      </div>
      {/* Batch Size */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: uiColors.text.primary,
          marginBottom: '6px',
        }}>
          Batch Size
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="number"
            value={settings.batchSize}
            onChange={(e) => handleBatchSizeChange(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="100"
            style={{
              width: '100px',
              padding: '8px 12px',
              border: `1px solid ${uiColors.ui.border}`,}
              borderRadius: '6px',
              backgroundColor: uiColors.background.primary,
              color: uiColors.text.primary,
              fontSize: '14px',
              outline: 'none',
              textAlign: 'center',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = uiColors.accent.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = uiColors.ui.border;
            }}
          />
          <div style={{
            fontSize: '12px',
            color: uiColors.text.secondary,
          }}>
            variants per batch execution
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          color: uiColors.text.secondary,
          marginTop: '4px',
        }}>
          Process variants in batches to manage memory usage and performance
        </div>
      </div>
      {/* Output Format */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: uiColors.text.primary,
          marginBottom: '8px',
        }}>
          Output Format
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
        }}>
          {outputFormats.map((format) => {
            const Icon = format.icon;
            const isSelected = settings.outputFormat === format.value;
            return ();
              <button
                key={format.value}
                onClick={() => handleOutputFormatChange(format.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: isSelected,
                    ? uiColors.accent.primary + '20'
                    : uiColors.ui.hover,
                  border: isSelected,
                    ? `1px solid ${uiColors.accent.primary}`}
                    : `1px solid ${uiColors.ui.border}`,}
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                  }
                }}
              >
                <Icon 
                  size={16} 
                  color={isSelected ? uiColors.accent.primary : uiColors.text.secondary} 
                />
                <div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isSelected ? uiColors.accent.primary : uiColors.text.primary,
                    marginBottom: '2px',
                  }}>
                    {format.label}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: isSelected ? uiColors.accent.primary : uiColors.text.secondary,
                  }}>
                    {format.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Naming Pattern */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: uiColors.text.primary,
          marginBottom: '6px',
        }}>
          File Naming Pattern
        </label>
        <input
          type="text"
          value={settings.namingPattern}
          onChange={(e) => handleNamingPatternChange(e.target.value)}
          placeholder="result-{seed}-{timestamp}"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${uiColors.ui.border}`,}
            borderRadius: '6px',
            backgroundColor: uiColors.background.primary,
            color: uiColors.text.primary,
            fontSize: '14px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = uiColors.accent.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = uiColors.ui.border;
          }}
        />
        <div style={{
          fontSize: '11px',
          color: uiColors.text.secondary,
          marginTop: '4px',
        }}>
          Available variables: {'{seed}'}, {'{timestamp}'}, {'{index}'}
        </div>
        {/* Sample filename preview */}
        <div style={{
          marginTop: '6px',
          padding: '6px 10px',
          backgroundColor: uiColors.ui.hover,
          borderRadius: '4px',
          fontSize: '11px',
          color: uiColors.text.secondary,
        }}>
          <strong>Preview:</strong> {getSampleFilename()}.txt
        </div>
      </div>
      {/* Additional Options */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Include Metadata */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            <input
              type="checkbox"
              checked={settings.includeMetadata}
              onChange={(e) => handleIncludeMetadataChange(e.target.checked)}
              style={{ accentColor: uiColors.accent.primary }}
            />
            <span style={{ color: uiColors.text.primary }}>
              Include execution metadata
            </span>
          </label>
          <div style={{
            fontSize: '11px',
            color: uiColors.text.secondary,
            marginLeft: '24px',
            marginTop: '-8px',
          }}>
            Adds seed, timestamp, and execution info to output files
          </div>
          {/* Auto-Download */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            <input
              type="checkbox"
              checked={settings.autoDownload}
              onChange={(e) => handleAutoDownloadChange(e.target.checked)}
              style={{ accentColor: uiColors.accent.primary }}
            />
            <span style={{ color: uiColors.text.primary }}>
              Auto-download batch results
            </span>
          </label>
          <div style={{
            fontSize: '11px',
            color: uiColors.text.secondary,
            marginLeft: '24px',
            marginTop: '-8px',
          }}>
            Automatically trigger download when batch processing completes
          </div>
        </div>
      </div>
      {/* Current Configuration Summary */}
      <div style={{
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px',
        border: `1px solid ${uiColors.ui.border}`}
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: uiColors.text.primary,
        }}>
          <FiDownload size={14} />
          Batch Configuration Summary
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '4px 12px',
          fontSize: '11px',
          color: uiColors.text.secondary,
        }}>
          <span>Batch Size:</span>
          <span>{settings.batchSize} variants</span>
          <span>Output Format:</span>
          <span>{outputFormats.find(f => f.value === settings.outputFormat)?.label}</span>
          <span>Naming:</span>
          <span>{getSampleFilename()}.txt</span>
          <span>Metadata:</span>
          <span>{settings.includeMetadata ? 'Included' : 'Excluded'}</span>
          <span>Auto-Download:</span>
          <span>{settings.autoDownload ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  );
};