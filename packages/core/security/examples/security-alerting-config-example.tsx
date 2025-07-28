/**
 * Security Alerting Configuration Integration Example
 * Task T-1752989143998-161: Build security alerting configuration UI
 * 
 * This example demonstrates how to integrate the SecurityAlertingConfigurationUI
 * component into an application with proper state management, validation,
 * and error handling.
 * 
 * Features Demonstrated:
 * - Configuration state management
 * - Real-time validation
 * - Error handling and user feedback
 * - Role-based access control
 * - Theme customization
 * - Persistence layer integration
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React, { useState, useEffect, useCallback } from 'react';
import { SecurityAlertingConfigurationUI } from '../components/SecurityAlertingConfigurationUI';
import { useSecurityAlertingConfig } from '../hooks/useSecurityAlertingConfig';
import { SecurityAlertingConfigurationService } from '../SecurityAlertingConfigurationService';
import { 
  SecurityAlertingConfig, 
  EscalationThresholds 
} from '../SecurityAlertingAnalytics';
import { ComplianceFramework } from '../SecurityLogger';

// Initialize the configuration service
const configService = new SecurityAlertingConfigurationService({)
  storageBackend: 'database',
  enableCaching: true,
  enableValidation: true,
  enableAuditLogging: true,
  requireApproval: false,
});

// Default configuration for new installations
const DEFAULT_SECURITY_CONFIG: SecurityAlertingConfig = {
  enableRealTimeAnalytics: true,
  enablePatternAnalysis: true,
  enableThreatIntelligence: true,
  enableAutomatedResponse: false,
  alertRetentionDays: 90,
  patternAnalysisWindow: 300000, // 5 minutes
  threatIntelligenceUpdate: 3600000, // 1 hour
  machinelearningEnabled: false,
  escalationThresholds: {,
    criticalAlertCount: 5,
    highAlertCount: 20,
    correlatedAlertCount: 10,
    timeWindowMinutes: 15,
    failedAccessAttempts: 5,
    dataExfiltrationThreshold: 100, // MB
    suspiciousPatternCount: 3,
    riskScoreThreshold: 75,
  },
  correlationRules: [],
  responseAutomation: {,
    enabledActions: [],
    approvalRequired: true,
    maxAutomatedActions: 5,
    cooldownPeriod: 900000, // 15 minutes
    emergencyOverride: false,
  }
};
interface SecurityConfigurationPageProps {
  userRole: 'admin' | 'security_admin' | 'security_analyst';
  userId: string;
  organizationId: string;
  theme?: 'light' | 'dark' | 'cinema';
}
/**
 * Complete security configuration page with state management and persistence
 */
export const SecurityConfigurationPage: React.FC<SecurityConfigurationPageProps> = ({)
  userRole,
  userId,
  organizationId,
  theme = 'cinema'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<SecurityAlertingConfig>(DEFAULT_SECURITY_CONFIG);
  // Compliance frameworks supported by the organization
  const complianceFrameworks: ComplianceFramework[] = [
    ComplianceFramework.SOC2,
    ComplianceFramework.GDPR,
    ComplianceFramework.ISO27001,
    ComplianceFramework.NIST
  ];
  // Load initial configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const configId = `org-${organizationId}`;}
        const config = await configService.getConfiguration(configId);
        if (config) {
          setCurrentConfig(config);
        } else {
          // Create default configuration for first-time setup
          const success = await configService.saveConfiguration(;)
            configId, 
            DEFAULT_SECURITY_CONFIG,
            {
              updatedBy: userId,
              tags: ['default', 'initial-setup'],
              classification: 'INTERNAL',
            }
          );
          if (success) {
            setCurrentConfig(DEFAULT_SECURITY_CONFIG);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    };
    loadConfiguration();
  }, [organizationId, userId]);
  // Handle configuration changes
  const handleConfigChange = useCallback(async (newConfig: SecurityAlertingConfig) => {
    try {
      setError(null);
      const configId = `org-${organizationId}`;}
      const success = await configService.saveConfiguration(;)
        configId,
        newConfig,
        {
          updatedBy: userId,
          tags: ['user-update'],
          classification: 'INTERNAL',
        }
      );
      if (success) {
        setCurrentConfig(newConfig);
        setSuccessMessage('Configuration saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  }, [organizationId, userId]);
  // Handle configuration validation
  const handleValidateConfig = useCallback(async (config: SecurityAlertingConfig) => {
    try {
      const validation = await configService.validateConfiguration(config);
      return {
        isValid: validation.isValid,
        errors: validation.errors.map(error => ({)
          field: error.field,
          message: error.message,
          severity: error.severity,
        })),
        warnings: validation.warnings.map(warning => ({)
          field: warning.field,
          message: warning.message,
          impact: warning.impact,
        })),
        securityScore: validation.securityScore,
      };
    } catch (err) {
      return {
        isValid: false,
        errors: [{,
          field: 'general',
          message: err instanceof Error ? err.message : 'Validation failed',
          severity: 'error' as const
        }],
        warnings: [],
        securityScore: 0,
      };
    }
  }, []);
  // Determine user permissions
  const isReadOnly = userRole === 'security_analyst';
  const allowAdvancedSettings = userRole === 'admin' || userRole === 'security_admin';
  // Loading state
  if (isLoading) {
    return ()
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: theme === 'light' ? '#ffffff' : '#0a0a0a',
        color: theme === 'light' ? '#334155' : '#f5f5f5',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(79, 70, 229, 0.1)',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading security configuration...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }
  return ()
    <div style={{
      minHeight: '100vh',
      background: theme === 'light' ? '#f8fafc' : '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header with breadcrumbs and organization info */}
      <div style={{
        background: theme === 'light' ? '#ffffff' : '#1e293b',
        borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,}
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <nav style={{
              fontSize: '14px',
              color: theme === 'light' ? '#64748b' : '#94a3b8',
              marginBottom: '8px',
            }}>
              Security → Configuration → Alerting
            </nav>
            <h1 style={{
              margin: '0',
              fontSize: '20px',
              fontWeight: 600,
              color: theme === 'light' ? '#1e293b' : '#f1f5f9'
            }}>
              Security Alerting Configuration
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              fontSize: '14px',
              color: theme === 'light' ? '#64748b' : '#94a3b8'
            }}>
              Org: {organizationId}
            </div>
            <div style={{
              padding: '4px 8px',
              background: userRole === 'admin' ? '#10b981' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}>
              {userRole.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
      {/* Notification area */}
      {(error || successMessage) && ()
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
          {error && ()
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #f87171',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#dc2626', fontSize: '18px' }}>⚠️</span>
              <div>
                <div style={{ 
                  color: '#dc2626', 
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: '2px',
                }}>
                  Configuration Error
                </div>
                <div style={{ color: '#b91c1c', fontSize: '13px' }}>
                  {error}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          )}
          {successMessage && ()
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #34d399',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#059669', fontSize: '18px' }}>✅</span>
              <div>
                <div style={{ 
                  color: '#059669', 
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: '2px',
                }}>
                  Success
                </div>
                <div style={{ color: '#047857', fontSize: '13px' }}>
                  {successMessage}
                </div>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
      {/* Main configuration interface */}
      <div style={{ padding: '0 24px' }}>
        <SecurityAlertingConfigurationUI
          currentConfig={currentConfig}
          onConfigChange={handleConfigChange}
          onValidateConfig={handleValidateConfig}
          userRole={userRole}
          complianceFrameworks={complianceFrameworks}
          theme={theme}
          readOnly={isReadOnly}
          allowAdvancedSettings={allowAdvancedSettings}
        />
      </div>
      {/* Footer with service information */}
      <div style={{
        background: theme === 'light' ? '#f8fafc' : '#0f172a',
        borderTop: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,}
        padding: '24px',
        marginTop: '32px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: theme === 'light' ? '#64748b' : '#94a3b8'
        }}>
          <div>
            Security Alerting Configuration v1.0.0
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Last Updated: {currentConfig ? 'Just Now' : 'Never'}</span>
            <span>•</span>
            <span>User: {userId}</span>
            <span>•</span>
            <span>Role: {userRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Simplified example for basic usage
 */
export const BasicSecurityConfigExample: React.FC = () => {
  const [config, setConfig] = useState<SecurityAlertingConfig>(DEFAULT_SECURITY_CONFIG);
  const handleConfigChange = useCallback(async (newConfig: SecurityAlertingConfig) => {
    // In a real application, this would save to your backend
    console.log('Saving configuration:', newConfig);
    setConfig(newConfig);
  }, []);
  const handleValidateConfig = useCallback(async (config: SecurityAlertingConfig) => {
    // Basic validation example
    const errors = [];
    const warnings = [];
    let score = 100;
    if (config.alertRetentionDays < 30) {
      warnings.push({)
        field: 'alertRetentionDays',
        message: 'Consider longer retention for compliance',
        impact: 'medium' as const
      });
      score -= 10;
    }
    if (!config.enableRealTimeAnalytics) {
      warnings.push({)
        field: 'enableRealTimeAnalytics',
        message: 'Real-time analytics recommended for security',
        impact: 'high' as const
      });
      score -= 15;
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      securityScore: score,
    };
  }, []);
  return ()
    <SecurityAlertingConfigurationUI
      currentConfig={config}
      onConfigChange={handleConfigChange}
      onValidateConfig={handleValidateConfig}
      userRole="admin"
      complianceFrameworks={[ComplianceFramework.SOC2]}
      theme="cinema"
    />
  );
};
/**
 * Hook-based example using the custom hook
 */
export const HookBasedExample: React.FC = () => {
  const { state, actions } = useSecurityAlertingConfig(DEFAULT_SECURITY_CONFIG, {)
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    enableAuditLogging: true,
    onSaveSuccess: () => console.log('Configuration saved successfully!'),
    onSaveError: (error) => console.error('Failed to save configuration:', error)
  });
  const handleConfigChange = useCallback(async (newConfig: SecurityAlertingConfig) => {
    // Update configuration using the hook's action
    actions.updateConfig(newConfig);
  }, [actions]);
  const handleValidateConfig = useCallback(async () => {
    // Use the hook's validation method
    const isValid = await actions.validateConfig();
    return {
      isValid,
      errors: state.validationErrors,
      warnings: state.validationWarnings,
      securityScore: state.securityScore,
    };
  }, [actions, state]);
  return ()
    <div>
      {/* Display hook state information */}
      <div style={{ 
        padding: '16px', 
        background: '#f3f4f6', 
        marginBottom: '16px',
        borderRadius: '8px',
      }}>
        <h3>Configuration State:</h3>
        <ul>
          <li>Has unsaved changes: {state.hasUnsavedChanges ? 'Yes' : 'No'}</li>
          <li>Is saving: {state.isSaving ? 'Yes' : 'No'}</li>
          <li>Last saved: {state.lastSaved?.toLocaleString() || 'Never'}</li>
          <li>Security score: {state.securityScore}/100</li>
        </ul>
      </div>
      <SecurityAlertingConfigurationUI
        currentConfig={state.config}
        onConfigChange={handleConfigChange}
        onValidateConfig={handleValidateConfig}
        userRole="security_admin"
        complianceFrameworks={[ComplianceFramework.SOC2, ComplianceFramework.GDPR]}
        theme="dark"
      />
    </div>
  );
};

export default SecurityConfigurationPage;