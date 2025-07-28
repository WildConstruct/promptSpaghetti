/**
 * OptimizationControls - Interface for enabling/disabling graph optimization features
 */
import React, { useState } from 'react';

export interface OptimizationSettings {
  deadCodeElimination: boolean;
  constantPropagation: boolean;
  resultCaching: boolean;
  parallelExecution: boolean;
  memoryOptimization: boolean;
  precompilation: boolean;
  performanceMonitoring: boolean;
  debugMode: boolean;
}
interface OptimizationControlsProps {
  settings: OptimizationSettings;
  onSettingsChange: (settings: OptimizationSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}
const DEFAULT_SETTINGS: OptimizationSettings = {
  deadCodeElimination: true,
  constantPropagation: true,
  resultCaching: true,
  parallelExecution: false,
  memoryOptimization: true,
  precompilation: false,
  performanceMonitoring: true,
  debugMode: false,
};

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({)
  settings,
  onSettingsChange,
  isOpen,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<OptimizationSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const handleSettingChange = (key: keyof OptimizationSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };
  const handleApplyChanges = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(JSON.stringify(DEFAULT_SETTINGS) !== JSON.stringify(settings));
  };
  const handleCancel = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    onClose();
  };
  if (!isOpen) return null;
  const optimizationFeatures = [;
    {
      key: 'deadCodeElimination' as keyof OptimizationSettings,
      title: 'Dead Code Elimination',
      description: 'Remove nodes that have no output or are unreachable',
      icon: '🗑️',
      impact: 'High',
      impactColor: '#28a745',
      recommended: true,
    },
    {
      key: 'constantPropagation' as keyof OptimizationSettings,
      title: 'Constant Propagation',
      description: 'Pre-compute nodes that always produce the same output',
      icon: '⚡',
      impact: 'Medium',
      impactColor: '#ffc107',
      recommended: true,
    },
    {
      key: 'resultCaching' as keyof OptimizationSettings,
      title: 'Result Caching',
      description: 'Cache results to avoid recomputing identical operations',
      icon: '💾',
      impact: 'High',
      impactColor: '#28a745',
      recommended: true,
    },
    {
      key: 'parallelExecution' as keyof OptimizationSettings,
      title: 'Parallel Execution',
      description: 'Run independent nodes concurrently (experimental)',
      icon: '🔄',
      impact: 'High',
      impactColor: '#28a745',
      recommended: false,
      experimental: true,
    },
    {
      key: 'memoryOptimization' as keyof OptimizationSettings,
      title: 'Memory Optimization',
      description: 'Reduce memory usage through object pooling and cleanup',
      icon: '🧹',
      impact: 'Medium',
      impactColor: '#ffc107',
      recommended: true,
    },
    {
      key: 'precompilation' as keyof OptimizationSettings,
      title: 'Graph Precompilation',
      description: 'Compile graphs to optimized execution plans (experimental)',
      icon: '⚙️',
      impact: 'High',
      impactColor: '#28a745',
      recommended: false,
      experimental: true,
    },
    {
      key: 'performanceMonitoring' as keyof OptimizationSettings,
      title: 'Performance Monitoring',
      description: 'Collect detailed performance metrics and analytics',
      icon: '📊',
      impact: 'Low',
      impactColor: '#17a2b8',
      recommended: true,
    },
    {
      key: 'debugMode' as keyof OptimizationSettings,
      title: 'Debug Mode',
      description: 'Enable detailed logging and debugging information',
      icon: '🐛',
      impact: 'None',
      impactColor: '#6c757d',
      recommended: false,
    }
  ];
  return ();
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#333',
          }}>
            ⚙️ Optimization Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        {/* Warning for Experimental Features */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#856404',
        }}>
          ⚠️ <strong>Note:</strong> Experimental features may affect graph execution behavior. 
          Enable them only if you understand the implications.
        </div>
        {/* Optimization Features */}
        <div style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {optimizationFeatures.map((feature) => ()
            <div
              key={feature.key}
              style={{
                padding: '16px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: localSettings[feature.key] ? '#f8f9fa' : 'white',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                    }}>
                      {feature.title}
                    </h3>
                    {feature.experimental && ()
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                      }}>
                        Experimental
                      </span>
                    )}
                    {feature.recommended && ()
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                      }}>
                        Recommended
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#6c757d',
                    lineHeight: 1.4,
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    color: feature.impactColor,
                    fontWeight: '500',
                  }}>
                    Impact: {feature.impact}
                  </div>
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginLeft: '16px',
                }}>
                  <input
                    type="checkbox"
                    checked={localSettings[feature.key]}
                    onChange={(e) => handleSettingChange(feature.key, e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      margin: 0,
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        {/* Performance Impact Summary */}
        <div style={{
          padding: '16px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#0066cc',
          }}>
            📈 Current Configuration Impact
          </h4>
          <div style={{
            fontSize: '13px',
            color: '#0066cc',
            lineHeight: 1.5,
          }}>
            {(() => {
              const enabledFeatures = optimizationFeatures.filter(f => localSettings[f.key]);
              const highImpact = enabledFeatures.filter(f => f.impact === 'High').length;
              const mediumImpact = enabledFeatures.filter(f => f.impact === 'Medium').length;
              return ();
                <>
                  <div>• {highImpact} high-impact optimization{highImpact !== 1 ? 's' : ''} enabled</div>
                  <div>• {mediumImpact} medium-impact optimization{mediumImpact !== 1 ? 's' : ''} enabled</div>
                  <div>• Expected performance improvement: {highImpact * 30 + mediumImpact * 15}%</div>
                </>
              );
            })()}
          </div>
        </div>
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              border: '1px solid #6c757d',
              backgroundColor: 'white',
              color: '#6c757d',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApplyChanges}
            disabled={!hasChanges}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: hasChanges ? '#007bff' : '#ccc',
              color: 'white',
              borderRadius: '4px',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationControls;