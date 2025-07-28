// packages/core/components/Settings/PerformanceControls.tsx
// Performance settings controls for Epic 7.3 Advanced Settings Modal
import React, { useCallback } from 'react';
import { PerformanceSettings } from '../../settings/types';
import { FiMonitor, FiActivity, FiCpu, FiEye, FiEyeOff, FiDatabase, FiFileText } from 'react-icons/fi';
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

export interface PerformanceControlsProps {
  settings: PerformanceSettings;
  onChange: (settings: PerformanceSettings) => void;
}
/**
 * Performance Settings Controls Component
 * Manages performance monitoring and debugging options
 */
export const PerformanceControls: React.FC<PerformanceControlsProps> = ({)
  settings,
  onChange
}) => {
  // Handle execution times toggle
  const handleShowExecutionTimesChange = useCallback((showExecutionTimes: boolean) => {
    onChange({)
      ...settings,
      showExecutionTimes
    });
  }, [settings, onChange]);
  // Handle caching toggle
  const handleEnableCachingChange = useCallback((enableCaching: boolean) => {
    onChange({)
      ...settings,
      enableCaching
    });
  }, [settings, onChange]);
  // Handle memory usage toggle
  const handleShowMemoryUsageChange = useCallback((showMemoryUsage: boolean) => {
    onChange({)
      ...settings,
      showMemoryUsage
    });
  }, [settings, onChange]);
  // Handle execution logging toggle
  const handleLogExecutionStepsChange = useCallback((logExecutionSteps: boolean) => {
    onChange({)
      ...settings,
      logExecutionSteps
    });
  }, [settings, onChange]);
  // Performance setting sections
  const performanceSections = [;
    {
      id: 'monitoring',
      title: 'Performance Monitoring',
      icon: FiActivity,
      settings: [,
        {
          key: 'showExecutionTimes' as const,
          label: 'Show execution times',
          description: 'Display timing information for graph execution',
          enabled: settings.showExecutionTimes,
          handler: handleShowExecutionTimesChange,
          icon: FiCpu,
          impact: 'Low performance impact',
        },
        {
          key: 'showMemoryUsage' as const,
          label: 'Show memory usage',
          description: 'Monitor memory consumption during execution',
          enabled: settings.showMemoryUsage,
          handler: handleShowMemoryUsageChange,
          icon: FiDatabase,
          impact: 'Medium performance impact',
        }
      ]
    },
    {
      id: 'optimization',
      title: 'Performance Optimization',
      icon: FiMonitor,
      settings: [,
        {
          key: 'enableCaching' as const,
          label: 'Enable result caching',
          description: 'Cache node execution results to improve performance',
          enabled: settings.enableCaching,
          handler: handleEnableCachingChange,
          icon: FiDatabase,
          impact: 'High performance benefit',
        }
      ]
    },
    {
      id: 'debugging',
      title: 'Debug & Logging',
      icon: FiFileText,
      settings: [,
        {
          key: 'logExecutionSteps' as const,
          label: 'Log execution steps',
          description: 'Log detailed execution information to console',
          enabled: settings.logExecutionSteps,
          handler: handleLogExecutionStepsChange,
          icon: FiFileText,
          impact: 'High performance impact',
        }
      ]
    }
  ];
  // Get performance impact color
  const getImpactColor = (impact: string): string => {
    if (impact.includes('Low')) return '#10b981';
    if (impact.includes('Medium')) return '#f59e0b';
    if (impact.includes('High') && impact.includes('benefit')) return '#3b82f6';
    if (impact.includes('High') && impact.includes('impact')) return '#ef4444';
    return uiColors.text.primary;
  };
  // Get enabled settings count
  const enabledCount = Object.values(settings).filter(Boolean).length;
  const totalCount = Object.keys(settings).length;
  return ();
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <FiMonitor size={18} color={uiColors.accent.primary} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: uiColors.text.primary,
        }}>
          Performance & Debug Settings
        </h3>
      </div>
      {/* Performance Overview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '8px',
        border: `1px solid ${uiColors.ui.border}`}
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 500,
          color: uiColors.text.primary,
        }}>
          <FiActivity size={16} />
          Performance Profile
        </div>
        <div style={{
          fontSize: '12px',
          color: uiColors.text.secondary,
          marginLeft: 'auto',
        }}>
          {enabledCount}/{totalCount} settings enabled
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: enabledCount <= 2 ,
            ? '#10b981' + '20'
            : enabledCount <= 3 
            ? '#f59e0b' + '20'
            : '#ef4444' + '20',
          color: enabledCount <= 2 ,
            ? '#10b981'
            : enabledCount <= 3 
            ? '#f59e0b'
            : '#ef4444'
        }}>
          {enabledCount <= 2 ? ()
            <>
              <FiEye size={12} />
              Optimized
            </>
          ) : enabledCount <= 3 ? ()
            <>
              <FiActivity size={12} />
              Balanced
            </>
          ) : ()
            <>
              <FiEyeOff size={12} />
              Debug Mode
            </>
          )}
        </div>
      </div>
      {/* Performance Settings Sections */}
      {performanceSections.map((section) => {
        const SectionIcon = section.icon;
        return ();
          <div key={section.id} style={{ marginBottom: '24px' }}>
            {/* Section Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}>
              <SectionIcon size={16} color={uiColors.accent.primary} />
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: uiColors.text.primary,
              }}>
                {section.title}
              </h4>
            </div>
            {/* Section Settings */}
            <div style={{
              marginLeft: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {section.settings.map((setting) => {
                const SettingIcon = setting.icon;
                return ();
                  <div key={setting.key} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: setting.enabled ,
                      ? uiColors.accent.primary + '10'
                      : uiColors.ui.hover,
                    border: setting.enabled,
                      ? `1px solid ${uiColors.accent.primary}`}
                      : `1px solid ${uiColors.ui.border}`,}
                    borderRadius: '6px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {/* Setting Icon */}
                    <SettingIcon 
                      size={16} 
                      color={setting.enabled 
                        ? uiColors.accent.primary 
                        : uiColors.text.secondary
                      } 
                      style={{ marginTop: '2px' }}
                    />
                    {/* Setting Content */}
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}>
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={(e) => setting.handler(e.target.checked)}
                          style={{ accentColor: uiColors.accent.primary }}
                        />
                        <span style={{ 
                          color: setting.enabled ,
                            ? uiColors.accent.primary 
                            : uiColors.text.primary 
                        }}>
                          {setting.label}
                        </span>
                      </label>
                      <div style={{
                        fontSize: '11px',
                        color: uiColors.text.secondary,
                        marginBottom: '6px',
                        marginLeft: '24px',
                      }}>
                        {setting.description}
                      </div>
                      {/* Performance Impact Indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '24px',
                        fontSize: '10px',
                        color: getImpactColor(setting.impact),
                        fontWeight: 500,
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: getImpactColor(setting.impact),
                        }} />
                        {setting.impact}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Performance Recommendations */}
      {enabledCount > 2 && ()
        <div style={{
          padding: '12px',
          backgroundColor: '#f59e0b' + '10',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          marginTop: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#f59e0b',
            marginBottom: '6px',
          }}>
            <FiActivity size={14} />
            Performance Recommendation
          </div>
          <div style={{
            fontSize: '11px',
            color: uiColors.text.secondary,
            lineHeight: 1.4,
          }}>
            {enabledCount > 3 ? ()
              'Multiple debug options are enabled. This may significantly impact execution performance. Consider disabling some options for production use.'
            ) : ()
              'Some performance monitoring options are enabled. This may have a moderate impact on execution speed.'
            )}
          </div>
        </div>
      )}
      {/* Current Configuration Summary */}
      <div style={{
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px',
        border: `1px solid ${uiColors.ui.border}`,}
        marginTop: '16px',
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
          <FiMonitor size={14} />
          Performance Configuration Summary
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '4px 12px',
          fontSize: '11px',
          color: uiColors.text.secondary,
        }}>
          <span>Execution Timing:</span>
          <span>{settings.showExecutionTimes ? 'Enabled' : 'Disabled'}</span>
          <span>Memory Monitoring:</span>
          <span>{settings.showMemoryUsage ? 'Enabled' : 'Disabled'}</span>
          <span>Result Caching:</span>
          <span>{settings.enableCaching ? 'Enabled' : 'Disabled'}</span>
          <span>Debug Logging:</span>
          <span>{settings.logExecutionSteps ? 'Enabled' : 'Disabled'}</span>
          <span>Profile:</span>
          <span style={{
            color: enabledCount <= 2 ,
              ? '#10b981'
              : enabledCount <= 3 
              ? '#f59e0b'
              : '#ef4444',
            fontWeight: 500,
          }}>
            {enabledCount <= 2 ? 'Optimized' : enabledCount <= 3 ? 'Balanced' : 'Debug Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};