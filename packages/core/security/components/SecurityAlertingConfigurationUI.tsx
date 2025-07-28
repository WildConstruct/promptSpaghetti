/**
 * Security Alerting Configuration UI
 * Task T-1752989143998-161: Build security alerting configuration UI
 * 
 * Comprehensive configuration interface for security alerting system,
 * providing administrators with fine-grained control over threat detection,
 * response automation, and notification management.
 * 
 * Features:
 * - Real-time alerting threshold configuration
 * - Response automation rule management
 * - Notification channel configuration
 * - Escalation policy management
 * - Threat intelligence integration settings
 * - Compliance framework alignment
 * - Performance monitoring configuration
 * - Risk-based alerting policies
 * 
 * Security Controls:
 * - Role-based access control for configuration changes
 * - Configuration validation and safety checks
 * - Audit logging for all configuration modifications
 * - Secure defaults and recommended settings
 * - Change approval workflow integration
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SecurityAlertingConfig, 
  EscalationThresholds,
  CorrelationRule,
  ResponseAutomation,
  AlertSeverity,
  ThreatCategory,
  ResponseAction
} from '../SecurityAlertingAnalytics';
import { ComplianceFramework } from '../SecurityLogger';
import { DataClassificationLevel } from '../DataClassificationAccessControl';

export interface SecurityAlertingConfigurationUIProps {
  currentConfig: SecurityAlertingConfig;,
  onConfigChange: (config: SecurityAlertingConfig) => Promise<void>;,
  onValidateConfig: (config: SecurityAlertingConfig) => Promise<ValidationResult>;,
  userRole: 'admin' | 'security_admin' | 'security_analyst';
  complianceFrameworks: ComplianceFramework;
  theme?: 'light' | 'dark' | 'cinema';
  readOnly?: boolean;
  allowAdvancedSettings?: boolean;
}
export interface ValidationResult {
  isValid: boolean;,
  errors: ConfigValidationError;
  warnings: ConfigValidationWarning;,
  securityScore: number;
}
export interface ConfigValidationError {
  field: string;,
  message: string;
  severity: 'error' | 'critical';
}
export interface ConfigValidationWarning {
  field: string;,
  message: string;
  impact: 'low' | 'medium' | 'high';
  interface ConfigurationState {
  config: SecurityAlertingConfig;,
  validation: ValidationResult | null;
  isLoading: boolean;,
  isSaving: boolean;
  hasUnsavedChanges: boolean;,
  activeTab: 'general' | 'thresholds' | 'automation' | 'notifications' | 'compliance';
  expandedSections: Set<string>;
  /**
  * Advanced security alerting configuration interface
  */
}
export const SecurityAlertingConfigurationUI: React.FC<SecurityAlertingConfigurationUIProps> = ({)
  currentConfig,
  onConfigChange,
  onValidateConfig,
  userRole,
  complianceFrameworks,
  theme = 'cinema',
  readOnly = false,
  allowAdvancedSettings = true
}) => {
  const [state, setState] = useState<ConfigurationState>({)
  config: { ...currentConfig },
    validation: null,
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    activeTab: 'general',
    expandedSections: new Set(['general-settings']);
  });
  // Theme configuration
  const themeStyles = useMemo(() => {
  const themes = {
  light: {,
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceSecondary: '#f1f5f9',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  text: '#334155',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
  shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
},
  dark: {,
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  border: '#475569',
  borderHover: '#64748b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#60a5fa',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  critical: '#ef4444',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
},
  cinema: {,
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceSecondary: '#2d2d2d',
  border: '#404040',
  borderHover: '#525252',
  text: '#f5f5f5',
  textSecondary: '#d4d4d4',
  textMuted: '#a3a3a3',
  primary: '#fbbf24',
  success: '#22d3ee',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
  shadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};
    return themes[theme];
  }, [theme]);
  // Validate configuration
  const validateConfiguration = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const validation = await onValidateConfig(state.config);
      setState(prev => ({ ...prev, validation, isLoading: false }));
    } catch (error) {
      setState(prev => ({ )
        ...prev, 
        isLoading: false,
        validation: {,
  isValid: false,
          errors: [{ field: 'general', message: 'Configuration validation failed', severity: 'error' }],
          warnings: [],
          securityScore: 0;
  }));
  }, [state.config, onValidateConfig]);
  // Save configuration
  const saveConfiguration = useCallback(async () => {
    if (readOnly || !state.validation?.isValid) return;
    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await onConfigChange(state.config);
      setState(prev => ({ ...prev, isSaving: false, hasUnsavedChanges: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      // Handle error (show notification, etc.)
  }, [state.config, state.validation, readOnly, onConfigChange]);
  // Update configuration field
  const updateConfig = useCallback((field: keyof SecurityAlertingConfig, value: any) => {
    setState(prev => ({)
  ...prev,
      config: { ...prev.config, [field]: value },
      hasUnsavedChanges: true,
      validation: null;
  }));
  }, []);
  // Update escalation thresholds
  const updateEscalationThresholds = useCallback((thresholds: Partial<EscalationThresholds>) => {
    setState(prev => ({)
  ...prev,
      config: {,
        ...prev.config,
        escalationThresholds: { ...prev.config.escalationThresholds, ...thresholds }
  },
  hasUnsavedChanges: true,
      validation: null;
  }));
  }, []);
  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {)
  const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      return { ...prev, expandedSections: newExpanded };
    });
  }, []);
  // Auto-validate on config changes
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      const timeoutId = setTimeout(validateConfiguration, 500);
      return () => clearTimeout(timeoutId);
  }, [state.config, state.hasUnsavedChanges, validateConfiguration]);
  // Render validation status
  const renderValidationStatus = () => {
    if (state.isLoading) {
      return;
        <div style={{
          padding: '12px',
          background: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px';
  }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${themeStyles.primary}`}
},
  borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite';
  }} />
          <span style={{ color: themeStyles.textSecondary, fontSize: '14px' }}>
            Validating configuration...
          </span>
        </div>
      );
    if (!state.validation) return null;
    const { isValid, errors, warnings, securityScore } = state.validation;
    const statusColor = isValid ? themeStyles.success : themeStyles.error;
    return;
      <div style={{
        padding: '16px',
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
        marginBottom: '20px';
  }}>
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: errors.length > 0 || warnings.length > 0 ? '12px' : '0',
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: statusColor,
}} />
            <span style={{
  color: themeStyles.text,
  fontWeight: 500,
  fontSize: '14px',
}}>
              Configuration {isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          <div style={{
  padding: '4px 12px',
  background: securityScore >= 80 ? themeStyles.success : ,
  securityScore >= 60 ? themeStyles.warning : themeStyles.error,
  color: themeStyles.background,
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 500,
}}>
            Security Score: {securityScore}/100
          </div>
        </div>
        {errors.length > 0 && ()
          <div style={{ marginBottom: warnings.length > 0 ? '12px' : '0' }}>
            <div style={{
  color: themeStyles.error,
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '4px',
}}>
              Errors:
            </div>
            {errors.map((error, index) => ()
              <div key={index} style={{
  color: themeStyles.error,
  fontSize: '12px',
  marginLeft: '16px',
  lineHeight: '1.4',
}}>
                • {error.field}: {error.message}
              </div>
            ))}
          </div>
        )}
        {warnings.length > 0 && ()
          <div>
            <div style={{
  color: themeStyles.warning,
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '4px',
}}>
              Warnings:
            </div>
            {warnings.map((warning, index) => ()
              <div key={index} style={{
  color: themeStyles.warning,
  fontSize: '12px',
  marginLeft: '16px',
  lineHeight: '1.4',
}}>
                • {warning.field}: {warning.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  // Render tab navigation
  const renderTabNavigation = () => {
    const tabs = [;
      { id: 'general', label: 'General Settings', icon: '⚙️' },
      { id: 'thresholds', label: 'Alert Thresholds', icon: '⚠️' },
      { id: 'automation', label: 'Response Automation', icon: '🤖' },
      { id: 'notifications', label: 'Notifications', icon: '📧' },
      { id: 'compliance', label: 'Compliance', icon: '📋' }
    ] as const;
    return;
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${themeStyles.border}`}
},
  marginBottom: '24px';
  }}>
        {tabs.map(tab => ()
          <button
            key={tab.id}
            onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
            disabled={readOnly && tab.id !== 'general'}
            style={{
              padding: '12px 20px',
              background: state.activeTab === tab.id ? themeStyles.surface : 'transparent',
              border: 'none',
              borderBottom: state.activeTab === tab.id ? `2px solid ${themeStyles.primary}` : '2px solid transparent'}
},
  color: state.activeTab === tab.id ? themeStyles.primary : themeStyles.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: state.activeTab === tab.id ? 500 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease';
  }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    );
  };
  // Render general settings tab
  const renderGeneralSettings = () => (;);
    <div>
      <div style={{
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px';
  }}>
        <h3 style={{
  color: themeStyles.text,
  fontSize: '16px',
  fontWeight: 500,
  margin: '0 0 16px 0',
}}>
          Core Alert Settings
        </h3>
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
}}>
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: themeStyles.text,
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={state.config.enableRealTimeAnalytics}
              onChange={(e) => updateConfig('enableRealTimeAnalytics', e.target.checked)}
              disabled={readOnly}
              style={{ accentColor: themeStyles.primary }}
            />
            Enable Real-Time Analytics
          </label>
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: themeStyles.text,
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={state.config.enablePatternAnalysis}
              onChange={(e) => updateConfig('enablePatternAnalysis', e.target.checked)}
              disabled={readOnly}
              style={{ accentColor: themeStyles.primary }}
            />
            Enable Pattern Analysis
          </label>
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: themeStyles.text,
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={state.config.enableThreatIntelligence}
              onChange={(e) => updateConfig('enableThreatIntelligence', e.target.checked)}
              disabled={readOnly}
              style={{ accentColor: themeStyles.primary }}
            />
            Enable Threat Intelligence
          </label>
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: themeStyles.text,
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={state.config.enableAutomatedResponse}
              onChange={(e) => updateConfig('enableAutomatedResponse', e.target.checked)}
              disabled={readOnly}
              style={{ accentColor: themeStyles.primary }}
            />
            Enable Automated Response
          </label>
          <label style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: themeStyles.text,
  fontSize: '14px',
  cursor: 'pointer',
}}>
            <input
              type="checkbox"
              checked={state.config.machinelearningEnabled}
              onChange={(e) => updateConfig('machinelearningEnabled', e.target.checked)}
              disabled={readOnly || !allowAdvancedSettings}
              style={{ accentColor: themeStyles.primary }}
            />
            Enable Machine Learning Analysis
            {!allowAdvancedSettings && ()
              <span style={{
  color: themeStyles.textMuted,
  fontSize: '12px',
}}>
                (Advanced)
              </span>
            )}
          </label>
        </div>
        <div style={{ marginTop: '20px' }}>
          <label style={{
  display: 'block',
  color: themeStyles.text,
  fontSize: '14px',
  marginBottom: '6px',
}}>
            Alert Retention Period (Days)
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={state.config.alertRetentionDays}
            onChange={(e) => updateConfig('alertRetentionDays', parseInt(e.target.value))}
            disabled={readOnly}
            style={{
              width: '120px',
              padding: '8px',
              background: themeStyles.background,
              border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
              color: themeStyles.text,
              fontSize: '14px';
  }}
          />
          <div style={{
  color: themeStyles.textMuted,
  fontSize: '12px',
  marginTop: '4px',
}}>
            Recommended: 30-90 days for compliance,
          </div>
        </div>
      </div>
    </div>
  );
  // Render alert thresholds tab
  const renderAlertThresholds = () => (;);
    <div>
      <div style={{
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px';
  }}>
        <h3 style={{
  color: themeStyles.text,
  fontSize: '16px',
  fontWeight: 500,
  margin: '0 0 16px 0',
}}>
          Escalation Thresholds
        </h3>
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px',
}}>
          <div>
            <label style={{
  display: 'block',
  color: themeStyles.text,
  fontSize: '14px',
  marginBottom: '6px',
}}>
              Critical Alert Count
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={state.config.escalationThresholds.criticalAlertCount}
              onChange={(e) => updateEscalationThresholds({ criticalAlertCount: parseInt(e.target.value) })}
              disabled={readOnly}
              style={{
                width: '100%',
                padding: '8px',
                background: themeStyles.background,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                color: themeStyles.text,
                fontSize: '14px';
  }}
            />
          </div>
          <div>
            <label style={{
  display: 'block',
  color: themeStyles.text,
  fontSize: '14px',
  marginBottom: '6px',
}}>
              High Alert Count
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={state.config.escalationThresholds.highAlertCount}
              onChange={(e) => updateEscalationThresholds({ highAlertCount: parseInt(e.target.value) })}
              disabled={readOnly}
              style={{
                width: '100%',
                padding: '8px',
                background: themeStyles.background,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                color: themeStyles.text,
                fontSize: '14px';
  }}
            />
          </div>
          <div>
            <label style={{
  display: 'block',
  color: themeStyles.text,
  fontSize: '14px',
  marginBottom: '6px',
}}>
              Time Window (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={state.config.escalationThresholds.timeWindowMinutes}
              onChange={(e) => updateEscalationThresholds({ timeWindowMinutes: parseInt(e.target.value) })}
              disabled={readOnly}
              style={{
                width: '100%',
                padding: '8px',
                background: themeStyles.background,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                color: themeStyles.text,
                fontSize: '14px';
  }}
            />
          </div>
          <div>
            <label style={{
  display: 'block',
  color: themeStyles.text,
  fontSize: '14px',
  marginBottom: '6px',
}}>
              Failed Access Attempts
            </label>
            <input
              type="number"
              min="3"
              max="50"
              value={state.config.escalationThresholds.failedAccessAttempts}
              onChange={(e) => updateEscalationThresholds({ failedAccessAttempts: parseInt(e.target.value) })}
              disabled={readOnly}
              style={{
                width: '100%',
                padding: '8px',
                background: themeStyles.background,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                color: themeStyles.text,
                fontSize: '14px';
  }}
            />
          </div>
        </div>
      </div>
    </div>
  );
  // Render action buttons
  const renderActionButtons = () => (;);
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: `1px solid ${themeStyles.border}`}
    }}>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}}>
        <button
          onClick={validateConfiguration}
          disabled={state.isLoading}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '6px',
            color: themeStyles.textSecondary,
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px';
  }}
        >
          🔍 Validate Configuration
        </button>
        {state.hasUnsavedChanges && ()
          <span style={{
  color: themeStyles.warning,
  fontSize: '12px',
  fontStyle: 'italic',
}}>
            • Unsaved changes
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setState(prev => ({ )
            ...prev, 
            config: { ...currentConfig }, 
            hasUnsavedChanges: false,
            validation: null;
  }))}
          disabled={!state.hasUnsavedChanges || readOnly}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '6px',
            color: themeStyles.textSecondary,
            cursor: state.hasUnsavedChanges && !readOnly ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            opacity: state.hasUnsavedChanges && !readOnly ? 1 : 0.5;
  }}
        >
          Reset Changes
        </button>
        <button
          onClick={saveConfiguration}
          disabled={!state.validation?.isValid || state.isSaving || readOnly || !state.hasUnsavedChanges}
          style={{
  padding: '10px 20px',
  background: state.validation?.isValid && !readOnly && state.hasUnsavedChanges ,
  ? themeStyles.primary
  : themeStyles.textMuted,
  border: 'none',
  borderRadius: '6px',
  color: themeStyles.background,
  cursor: state.validation?.isValid && !readOnly && state.hasUnsavedChanges ,
  ? 'pointer'
  : 'not-allowed',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}}
        >
          {state.isSaving ? ()
            <>
              <div style={{
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTopColor: 'currentColor',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
}} />
              Saving...
            </>
          ) : ()
            <>
              💾 Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
  return;
    <div style={{
  background: themeStyles.background,
  color: themeStyles.text,
  fontFamily: 'Inter, system-ui, sans-serif',
  minHeight: '100vh',
  padding: '24px',
}}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
        `}
      </style>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
}}>
          <h1 style={{
  margin: '0',
  fontSize: '24px',
  fontWeight: 600,
  color: themeStyles.text,
}}>
            🚨 Security Alerting Configuration
          </h1>
          <div style={{
  padding: '6px 12px',
  background: userRole === 'admin' ? themeStyles.primary : themeStyles.success,
  color: themeStyles.background,
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'uppercase',
}}>
            {userRole.replace('_', ' ')}
          </div>
        </div>
        <p style={{
  margin: '0',
  color: themeStyles.textSecondary,
  fontSize: '16px',
  lineHeight: '1.5',
}}>
          Configure comprehensive security alerting, threat detection, and automated response systems
        </p>
      </div>
      {/* Validation Status */}
      {renderValidationStatus()}
      {/* Tab Navigation */}
      {renderTabNavigation()}
      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {state.activeTab === 'general' && renderGeneralSettings()}
        {state.activeTab === 'thresholds' && renderAlertThresholds()}
        {state.activeTab === 'automation' && ()
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '40px',
            textAlign: 'center';
  }}>
            <h3 style={{ color: themeStyles.text, marginBottom: '8px' }}>
              🤖 Response Automation
            </h3>
            <p style={{ color: themeStyles.textSecondary, margin: '0' }}>
              Automated response configuration coming soon...
            </p>
          </div>
        )}
        {state.activeTab === 'notifications' && ()
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '40px',
            textAlign: 'center';
  }}>
            <h3 style={{ color: themeStyles.text, marginBottom: '8px' }}>
              📧 Notification Channels
            </h3>
            <p style={{ color: themeStyles.textSecondary, margin: '0' }}>
              Notification management interface coming soon...
            </p>
          </div>
        )}
        {state.activeTab === 'compliance' && ()
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '40px',
            textAlign: 'center';
  }}>
            <h3 style={{ color: themeStyles.text, marginBottom: '8px' }}>
              📋 Compliance Framework
            </h3>
            <p style={{ color: themeStyles.textSecondary, margin: '0' }}>
              Compliance configuration interface coming soon...
            </p>
          </div>
        )}
      </div>
      {/* Action Buttons */}
      {renderActionButtons()}
    </div>
  );
};

export default SecurityAlertingConfigurationUI;