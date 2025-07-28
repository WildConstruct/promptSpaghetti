/**
 * Security Alerting Configuration UI Tests
 * Task T-1752989143998-161: Build security alerting configuration UI
 * 
 * Comprehensive test suite for the security alerting configuration interface,
 * ensuring proper functionality, security validation, and user experience.
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecurityAlertingConfigurationUI } from '../components/SecurityAlertingConfigurationUI';
import { 
  SecurityAlertingConfig, 
  EscalationThresholds,
  ResponseAutomation 
} from '../SecurityAlertingAnalytics';
import { ComplianceFramework } from '../SecurityLogger';

// Mock data
const mockConfig: SecurityAlertingConfig = {,
  enableRealTimeAnalytics: true,
  enablePatternAnalysis: true,
  enableThreatIntelligence: true,
  enableAutomatedResponse: false,
  alertRetentionDays: 90,
  patternAnalysisWindow: 300000,
  threatIntelligenceUpdate: 3600000,
  machinelearningEnabled: false,
  escalationThresholds: {,
  criticalAlertCount: 5,
  highAlertCount: 20,
  correlatedAlertCount: 10,
  timeWindowMinutes: 15,
  failedAccessAttempts: 5,
  dataExfiltrationThreshold: 100,
  suspiciousPatternCount: 3,
  riskScoreThreshold: 75,
},
  correlationRules: [],
  responseAutomation: {,
  enabledActions: [],
  approvalRequired: true,
  maxAutomatedActions: 5,
  cooldownPeriod: 900000,
  emergencyOverride: false,
};
const mockValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
  securityScore: 85,
};
const mockComplianceFrameworks: ComplianceFramework = [
  ComplianceFramework.SOC2,
  ComplianceFramework.GDPR,
  ComplianceFramework.HIPAA
];

// Mock functions
const mockOnConfigChange = jest.fn();
const mockOnValidateConfig = jest.fn();
describe('SecurityAlertingConfigurationUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnValidateConfig.mockResolvedValue(mockValidationResult);
  });
  describe('Rendering', () => {
    it('renders the main configuration interface', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      expect(screen.getByText('🚨 Security Alerting Configuration')).toBeInTheDocument();
      expect(screen.getByText('Configure comprehensive security alerting, threat detection, and automated response systems')).toBeInTheDocument();
    });
    it('displays user role badge correctly', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="security_admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      expect(screen.getByText('SECURITY ADMIN')).toBeInTheDocument();
    });
    it('renders all navigation tabs', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
      expect(screen.getByText('Response Automation')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Compliance')).toBeInTheDocument();
    });
    it('shows general settings tab as active by default', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      expect(screen.getByText('Core Alert Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Real-Time Analytics')).toBeInTheDocument();
    });
  });
  describe('General Settings Tab', () => {
    it('displays all core alert settings checkboxes', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      expect(screen.getByLabelText('Enable Real-Time Analytics')).toBeChecked();
      expect(screen.getByLabelText('Enable Pattern Analysis')).toBeChecked();
      expect(screen.getByLabelText('Enable Threat Intelligence')).toBeChecked();
      expect(screen.getByLabelText('Enable Automated Response')).not.toBeChecked();
      expect(screen.getByLabelText('Enable Machine Learning Analysis')).not.toBeChecked();
    });
    it('displays alert retention period input with correct value', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const retentionInput = screen.getByDisplayValue('90');
      expect(retentionInput).toBeInTheDocument();
      expect(retentionInput).toHaveAttribute('type', 'number');
      expect(retentionInput).toHaveAttribute('min', '7');
      expect(retentionInput).toHaveAttribute('max', '365');
    });
    it('handles checkbox changes correctly', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const automatedResponseCheckbox = screen.getByLabelText('Enable Automated Response');
      await user.click(automatedResponseCheckbox);
      // Should show unsaved changes indicator
      await waitFor(() => {
        expect(screen.getByText('• Unsaved changes')).toBeInTheDocument();
      });
      expect(automatedResponseCheckbox).toBeChecked();
    });
    it('handles retention period changes', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const retentionInput = screen.getByDisplayValue('90');
      await user.clear(retentionInput);
      await user.type(retentionInput, '120');
      await waitFor(() => {
        expect(screen.getByText('• Unsaved changes')).toBeInTheDocument();
      });
    });
  });
  describe('Alert Thresholds Tab', () => {
    it('switches to thresholds tab and displays threshold inputs', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const thresholdsTab = screen.getByText('Alert Thresholds');
      await user.click(thresholdsTab);
      expect(screen.getByText('Escalation Thresholds')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Critical Alert Count
      expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // High Alert Count
      expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Time Window
      expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Failed Access Attempts
    });
    it('handles threshold value changes', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Switch to thresholds tab
      await user.click(screen.getByText('Alert Thresholds'));
      // Find and change critical alert count
      const criticalAlertInput = screen.getByDisplayValue('5');
      await user.clear(criticalAlertInput);
      await user.type(criticalAlertInput, '10');
      await waitFor(() => {
        expect(screen.getByText('• Unsaved changes')).toBeInTheDocument();
      });
    });
  });
  describe('Validation', () => {
    it('triggers validation automatically after changes', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const retentionInput = screen.getByDisplayValue('90');
      await user.clear(retentionInput);
      await user.type(retentionInput, '30');
      // Wait for debounced validation
      await waitFor(() => {
        expect(mockOnValidateConfig).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
    it('displays validation results', async () => {
  const validationWithWarnings = {
  isValid: true,
  errors: [],
  warnings: [,
  {
  field: 'enableRealTimeAnalytics',
  message: 'Real-time analytics disabled - may impact threat detection',
  impact: 'high' as const,
  code: 'REALTIME_DISABLED'],
  securityScore: 70,
};
      mockOnValidateConfig.mockResolvedValue(validationWithWarnings);
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={{
  ...mockConfig,
  enableRealTimeAnalytics: false,
}}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Trigger validation
      const validateButton = screen.getByText('🔍 Validate Configuration');
      fireEvent.click(validateButton);
      await waitFor(() => {
  expect(screen.getByText('Configuration Valid')).toBeInTheDocument();
  expect(screen.getByText('Security Score: 70/100')).toBeInTheDocument();
  expect(screen.getByText('Warnings:')).toBeInTheDocument();
});
    });
    it('displays validation errors', async () => {
  const validationWithErrors = {
  isValid: false,
  errors: [,
  {
  field: 'alertRetentionDays',
  message: 'Alert retention period exceeds maximum allowed',
  severity: 'error' as const],
  warnings: [],
  securityScore: 20,
};
      mockOnValidateConfig.mockResolvedValue(validationWithErrors);
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Trigger validation
      const validateButton = screen.getByText('🔍 Validate Configuration');
      fireEvent.click(validateButton);
      await waitFor(() => {
  expect(screen.getByText('Configuration Invalid')).toBeInTheDocument();
  expect(screen.getByText('Errors:')).toBeInTheDocument();
  expect(screen.getByText(/Alert retention period exceeds maximum/)).toBeInTheDocument();
});
    });
  });
  describe('Save and Reset Actions', () => {
    it('enables save button only when configuration is valid and has changes', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const saveButton = screen.getByText('💾 Save Configuration');
      expect(saveButton).toBeDisabled();
      // Make a change
      const retentionInput = screen.getByDisplayValue('90');
      await user.clear(retentionInput);
      await user.type(retentionInput, '120');
      // Wait for validation
      await waitFor(() => {
        expect(mockOnValidateConfig).toHaveBeenCalled();
      });
      // Save button should be enabled after validation
      await waitFor(() => {
        expect(saveButton).toBeEnabled();
      });
    });
    it('calls onConfigChange when save is clicked', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Make a change
      const checkbox = screen.getByLabelText('Enable Automated Response');
      await user.click(checkbox);
      // Wait for validation
      await waitFor(() => {
        expect(mockOnValidateConfig).toHaveBeenCalled();
      });
      // Click save
      const saveButton = screen.getByText('💾 Save Configuration');
      await user.click(saveButton);
      expect(mockOnConfigChange).toHaveBeenCalled();
    });
    it('resets configuration when reset button is clicked', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Make a change
      const retentionInput = screen.getByDisplayValue('90');
      await user.clear(retentionInput);
      await user.type(retentionInput, '120');
      // Verify unsaved changes indicator
      await waitFor(() => {
        expect(screen.getByText('• Unsaved changes')).toBeInTheDocument();
      });
      // Click reset
      const resetButton = screen.getByText('Reset Changes');
      await user.click(resetButton);
      // Should revert to original value
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();
      expect(screen.queryByText('• Unsaved changes')).not.toBeInTheDocument();
    });
  });
  describe('Read-Only Mode', () => {
    it('disables all inputs when readOnly is true', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="security_analyst"
          complianceFrameworks={mockComplianceFrameworks}
          readOnly={true}
        />
      );
      expect(screen.getByLabelText('Enable Real-Time Analytics')).toBeDisabled();
      expect(screen.getByLabelText('Enable Pattern Analysis')).toBeDisabled();
      expect(screen.getByDisplayValue('90')).toBeDisabled();
    });
    it('disables save and reset buttons when readOnly is true', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="security_analyst"
          complianceFrameworks={mockComplianceFrameworks}
          readOnly={true}
        />
      );
      expect(screen.getByText('💾 Save Configuration')).toBeDisabled();
      expect(screen.getByText('Reset Changes')).toBeDisabled();
    });
  });
  describe('Advanced Settings', () => {
    it('hides advanced settings when allowAdvancedSettings is false', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="security_analyst"
          complianceFrameworks={mockComplianceFrameworks}
          allowAdvancedSettings={false}
        />
      );
      const mlCheckbox = screen.getByLabelText(/Enable Machine Learning Analysis/);
      expect(mlCheckbox).toBeDisabled();
      expect(screen.getByText('(Advanced)')).toBeInTheDocument();
    });
    it('enables advanced settings when allowAdvancedSettings is true', () => {
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
          allowAdvancedSettings={true}
        />
      );
      const mlCheckbox = screen.getByLabelText('Enable Machine Learning Analysis');
      expect(mlCheckbox).toBeEnabled();
    });
  });
  describe('Theme Support', () => {
    it('applies cinema theme styles correctly', () => {
      const { container } = render()
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
          theme="cinema"
        />
      );
      // Check if cinema theme colors are applied (background should be dark)
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle('background: #0a0a0a');
    });
    it('applies light theme styles correctly', () => {
      const { container } = render()
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
          theme="light"
        />
      );
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle('background: #ffffff');
    });
    it('applies dark theme styles correctly', () => {
      const { container } = render()
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
          theme="dark"
        />
      );
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle('background: #0f172a');
    });
  });
  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      const user = userEvent.setup();
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Initially on general tab
      expect(screen.getByText('Core Alert Settings')).toBeInTheDocument();
      // Switch to automation tab
      await user.click(screen.getByText('Response Automation'));
      expect(screen.getByText('🤖 Response Automation')).toBeInTheDocument();
      // Switch to notifications tab
      await user.click(screen.getByText('Notifications'));
      expect(screen.getByText('📧 Notification Channels')).toBeInTheDocument();
      // Switch to compliance tab
      await user.click(screen.getByText('Compliance'));
      expect(screen.getByText('📋 Compliance Framework')).toBeInTheDocument();
    });
  });
  describe('Loading States', () => {
    it('shows validation loading state', async () => {
      const user = userEvent.setup();
      // Mock slow validation
      mockOnValidateConfig.mockImplementation()
        () => new Promise(resolve => setTimeout(() => resolve(mockValidationResult), 1000))
      );
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      const validateButton = screen.getByText('🔍 Validate Configuration');
      await user.click(validateButton);
      expect(screen.getByText('Validating configuration...')).toBeInTheDocument();
    });
    it('shows saving loading state', async () => {
      const user = userEvent.setup();
      // Mock slow save
      mockOnConfigChange.mockImplementation()
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      render();
        <SecurityAlertingConfigurationUI
          currentConfig={mockConfig}
          onConfigChange={mockOnConfigChange}
          onValidateConfig={mockOnValidateConfig}
          userRole="admin"
          complianceFrameworks={mockComplianceFrameworks}
        />
      );
      // Make a change to enable save
      const checkbox = screen.getByLabelText('Enable Automated Response');
      await user.click(checkbox);
      // Wait for validation
      await waitFor(() => {
        expect(mockOnValidateConfig).toHaveBeenCalled();
      });
      // Click save
      const saveButton = screen.getByText('💾 Save Configuration');
      await user.click(saveButton);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
describe('SecurityAlertingConfigurationUI Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    render();
      <SecurityAlertingConfigurationUI
        currentConfig={mockConfig}
        onConfigChange={mockOnConfigChange}
        onValidateConfig={mockOnValidateConfig}
        userRole="admin"
        complianceFrameworks={mockComplianceFrameworks}
      />
    );
    // Check for proper form labels
    expect(screen.getByLabelText('Enable Real-Time Analytics')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Pattern Analysis')).toBeInTheDocument();
    expect(screen.getByLabelText('Alert Retention Period (Days)')).toBeInTheDocument();
  });
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render();
      <SecurityAlertingConfigurationUI
        currentConfig={mockConfig}
        onConfigChange={mockOnConfigChange}
        onValidateConfig={mockOnValidateConfig}
        userRole="admin"
        complianceFrameworks={mockComplianceFrameworks}
      />
    );
    // Test tab navigation
    await user.tab();
    expect(screen.getByText('Alert Thresholds')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Response Automation')).toHaveFocus();
  });
  it('provides meaningful help text and descriptions', () => {
    render();
      <SecurityAlertingConfigurationUI
        currentConfig={mockConfig}
        onConfigChange={mockOnConfigChange}
        onValidateConfig={mockOnValidateConfig}
        userRole="admin"
        complianceFrameworks={mockComplianceFrameworks}
      />
    );
    expect(screen.getByText('Recommended: 30-90 days for compliance')).toBeInTheDocument();
    expect(screen.getByText('Configure comprehensive security alerting, threat detection, and automated response systems')).toBeInTheDocument();
  });
});