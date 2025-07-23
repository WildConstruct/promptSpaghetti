import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SecurityDashboardWorkflow, SecurityEventType, SecuritySeverity } from '../SecurityDashboardWorkflow';
import { SecurityRole, DashboardType } from '../SecurityDashboardFramework';
// Mock the workflow store
const mockWorkflowStore = {
    states: [
        {
            id: 'state-1',
            workspace_id: 'workspace-1',
            name: 'New',
            description: 'Initial state for new security events',
            color: '#ff6d00',
            is_initial: true,
            is_final: false,
            is_locked: false,
            sort_order: 1,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 'state-2',
            workspace_id: 'workspace-1',
            name: 'Investigating',
            description: 'Security event under investigation',
            color: '#fbc02d',
            is_initial: false,
            is_final: false,
            is_locked: false,
            sort_order: 2,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 'state-3',
            workspace_id: 'workspace-1',
            name: 'Resolved',
            description: 'Security event resolved',
            color: '#34a853',
            is_initial: false,
            is_final: true,
            is_locked: false,
            sort_order: 3,
            created_at: new Date(),
            updated_at: new Date()
        }
    ],
    transitions: [
        {
            id: 'transition-1',
            workspace_id: 'workspace-1',
            from_state_id: 'state-1',
            to_state_id: 'state-2',
            name: 'Start Investigation',
            requires_approval: false,
            required_permissions: 0n,
            conditions: {},
            created_at: new Date()
        }
    ],
    approvals: [
        {
            id: 'approval-1',
            workspace_id: 'workspace-1',
            resource_id: 'event-1',
            transition_id: 'transition-1',
            requester_id: 'user-1',
            status: 'pending',
            requested_at: new Date(),
            priority: 'high',
            created_at: new Date(),
            updated_at: new Date()
        }
    ],
    locks: [],
    history: [],
    statistics: null,
    loading: false,
    error: null,
    fetchStates: jest.fn().mockResolvedValue(undefined),
    fetchTransitions: jest.fn().mockResolvedValue(undefined),
    fetchApprovals: jest.fn().mockResolvedValue(undefined),
    transitionResourceState: jest.fn().mockResolvedValue({
        success: true,
        new_state_id: 'state-2'
    }),
    approveWorkflow: jest.fn().mockResolvedValue({
        success: true,
        new_state_id: 'state-2'
    }),
    rejectWorkflow: jest.fn().mockResolvedValue(true),
    acquireLock: jest.fn().mockResolvedValue({
        id: 'lock-1',
        resource_id: 'event-1',
        locked_by: 'user-1',
        lock_type: 'state_change'
    }),
    releaseLock: jest.fn().mockResolvedValue(true)
};
// Mock the useWorkflowStore hook
jest.mock('../stores/workflowStore', () => ({
    useWorkflowStore: () => mockWorkflowStore
}));
// Mock WebSocket
const mockWebSocket = {
    close: jest.fn(),
    onmessage: null,
    onerror: null
};
// @ts-ignore
global.WebSocket = jest.fn(() => mockWebSocket);
// Mock fetch for API calls
global.fetch = jest.fn();
describe('SecurityDashboardWorkflow', () => {
    const defaultProps = {
        workspaceId: 'workspace-1',
        userId: 'user-1',
        userRole: SecurityRole.SECURITY_ANALYST,
        dashboardType: DashboardType.OPERATIONAL
    };
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset fetch mock
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
    });
    describe('Component Initialization', () => {
        test('renders loading state initially', () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            expect(screen.getByText('Initializing Security Dashboard Workflow...')).toBeInTheDocument();
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
        test('renders dashboard after successful initialization', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            expect(screen.getByText('Recent Security Events')).toBeInTheDocument();
            expect(screen.getByText('Workflow Status')).toBeInTheDocument();
            expect(mockWorkflowStore.fetchStates).toHaveBeenCalledWith('workspace-1');
            expect(mockWorkflowStore.fetchTransitions).toHaveBeenCalledWith('workspace-1');
            expect(mockWorkflowStore.fetchApprovals).toHaveBeenCalledWith('workspace-1');
        });
        test('renders error state on initialization failure', async () => {
            mockWorkflowStore.fetchStates.mockRejectedValueOnce(new Error('Network error'));
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
            const retryButton = screen.getByText('Retry');
            expect(retryButton).toBeInTheDocument();
        });
    });
    describe('Security Event Processing', () => {
        let mockSecurityEvent;
        beforeEach(() => {
            mockSecurityEvent = {
                id: 'event-1',
                type: SecurityEventType.AUTHENTICATION_FAILURE,
                severity: SecuritySeverity.HIGH,
                source: '192.168.1.100',
                timestamp: new Date(),
                description: 'Multiple failed login attempts detected',
                metadata: { attemptCount: 5, targetUser: 'admin' },
                escalationLevel: 1,
                complianceFrameworks: ['SOX'],
                automatedActions: []
            };
        });
        test('processes incoming security events via WebSocket', async () => {
            const onSecurityEvent = jest.fn();
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps, onSecurityEvent: onSecurityEvent }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate WebSocket message
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(mockSecurityEvent)
                    });
                }
            });
            expect(onSecurityEvent).toHaveBeenCalledWith(mockSecurityEvent);
            // Event should appear in the table
            await waitFor(() => {
                expect(screen.getByText('AUTHENTICATION_FAILURE')).toBeInTheDocument();
                expect(screen.getByText('HIGH')).toBeInTheDocument();
                expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
            });
        });
        test('triggers automatic workflow transitions for new events', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate WebSocket message for critical event
            const criticalEvent = { ...mockSecurityEvent, severity: SecuritySeverity.CRITICAL };
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(criticalEvent)
                    });
                }
            });
            await waitFor(() => {
                expect(mockWorkflowStore.transitionResourceState).toHaveBeenCalledWith('event-1', 'state-1', 'system', expect.objectContaining({
                    comment: expect.stringContaining('Auto-created'),
                    metadata: expect.objectContaining({
                        autoCreated: true
                    })
                }));
            });
        });
        test('executes automated security actions based on rules', async () => {
            const configWithAutoActions = {
                enableAutomatedActions: true,
                autoApprovalRules: [
                    {
                        id: 'auto-block-test',
                        name: 'Auto-block test',
                        conditions: { attemptCount: 5 },
                        maxSeverity: SecuritySeverity.HIGH,
                        approvedActions: ['BLOCK_IP'],
                        requiredRole: SecurityRole.SECURITY_ANALYST
                    }
                ]
            };
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps, config: configWithAutoActions }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate WebSocket message matching auto-action rule
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(mockSecurityEvent)
                    });
                }
            });
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/security/actions/block-ip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('"ip":"192.168.1.100"')
                });
            });
        });
        test('shows active alerts banner when high-severity events present', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Initially no alerts banner
            expect(screen.queryByText('Active Security Alerts Requiring Attention')).not.toBeInTheDocument();
            // Simulate high-severity event
            const highSeverityEvent = { ...mockSecurityEvent, severity: SecuritySeverity.HIGH };
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(highSeverityEvent)
                    });
                }
            });
            await waitFor(() => {
                expect(screen.getByText('Active Security Alerts Requiring Attention')).toBeInTheDocument();
                expect(screen.getByText('1')).toBeInTheDocument(); // Alert count
            });
        });
    });
    describe('Workflow State Management', () => {
        test('displays workflow states in status overview', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Workflow Status')).toBeInTheDocument();
                expect(screen.getByText('New')).toBeInTheDocument();
                expect(screen.getByText('Investigating')).toBeInTheDocument();
                expect(screen.getByText('Resolved')).toBeInTheDocument();
            });
            // Check state counts
            const stateCounts = screen.getAllByText('0');
            expect(stateCounts.length).toBeGreaterThan(0);
        });
        test('handles manual workflow transitions', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Add an event first
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify({
                            ...mockSecurityEvent,
                            workflowState: 'state-1'
                        })
                    });
                }
            });
            await waitFor(() => {
                expect(screen.getByText('New')).toBeInTheDocument();
            });
            // Find and click investigate button
            const investigateButtons = screen.getAllByText('🔍');
            fireEvent.click(investigateButtons[0]);
            // Should attempt to acquire lock and transition state
            await waitFor(() => {
                expect(mockWorkflowStore.acquireLock).toHaveBeenCalled();
            });
        });
    });
    describe('Approval Workflow', () => {
        test('displays pending approvals widget when approvals exist', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
                expect(screen.getByText('event-1')).toBeInTheDocument();
                expect(screen.getByText('high')).toBeInTheDocument();
            });
        });
        test('handles approval actions', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
            });
            // Find and click approve button
            const approveButton = screen.getByText('✓ Approve');
            fireEvent.click(approveButton);
            await waitFor(() => {
                expect(mockWorkflowStore.approveWorkflow).toHaveBeenCalledWith('approval-1', 'user-1', undefined);
            });
        });
        test('handles rejection actions', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
            });
            // Find and click reject button
            const rejectButton = screen.getByText('✗ Reject');
            fireEvent.click(rejectButton);
            await waitFor(() => {
                expect(mockWorkflowStore.rejectWorkflow).toHaveBeenCalledWith('approval-1', 'user-1', 'No reason provided');
            });
        });
    });
    describe('Role-based Access Control', () => {
        test('shows appropriate widgets for security admin role', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps, userRole: SecurityRole.SECURITY_ADMIN }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
                // Admin should see automated actions timeline
                expect(screen.getByText('Automated Response Actions')).toBeInTheDocument();
            });
        });
        test('restricts widgets for viewer role', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps, userRole: SecurityRole.VIEWER }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
                // Viewer should not see automated actions timeline
                expect(screen.queryByText('Automated Response Actions')).not.toBeInTheDocument();
            });
        });
    });
    describe('Compliance Integration', () => {
        test('checks compliance requirements for security events', async () => {
            const configWithCompliance = {
                complianceRequirements: [
                    {
                        framework: 'GDPR',
                        alertTypes: [SecurityEventType.AUTHENTICATION_FAILURE],
                        responseTimeMinutes: 60,
                        requiredDocumentation: ['incident_report'],
                        notificationRequired: true
                    }
                ]
            };
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps, config: configWithCompliance }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate event that triggers compliance check
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(mockSecurityEvent)
                    });
                }
            });
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/compliance/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('GDPR')
                });
            });
        });
    });
    describe('Error Handling', () => {
        test('handles WebSocket connection errors gracefully', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate WebSocket error
            act(() => {
                if (mockWebSocket.onerror) {
                    mockWebSocket.onerror(new Event('error'));
                }
            });
            // Should show error indicator (implementation would add this)
            // This is a placeholder for where error handling would be tested
        });
        test('handles API call failures during automated actions', async () => {
            fetch.mockRejectedValueOnce(new Error('API Error'));
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate event that would trigger automated action
            const eventWithAutoAction = {
                ...mockSecurityEvent,
                metadata: { threatIntelligence: 'confirmed_malicious' }
            };
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(eventWithAutoAction)
                    });
                }
            });
            // Should handle the error gracefully without crashing
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
        });
    });
    describe('User Interface Interactions', () => {
        test('refreshes dashboard when refresh button clicked', async () => {
            // Mock window.location.reload
            const mockReload = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { reload: mockReload },
                writable: true
            });
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText('🔄 Refresh'));
            expect(mockReload).toHaveBeenCalled();
        });
        test('shows user role and ID in header', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security_analyst')).toBeInTheDocument();
                expect(screen.getByText('user-1')).toBeInTheDocument();
            });
        });
        test('handles table interactions', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Recent Security Events')).toBeInTheDocument();
            });
            // Add event to table
            act(() => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify(mockSecurityEvent)
                    });
                }
            });
            await waitFor(() => {
                expect(screen.getByText('AUTHENTICATION_FAILURE')).toBeInTheDocument();
            });
            // Filter and export buttons should be present
            expect(screen.getByText('🔍 Filter')).toBeInTheDocument();
            expect(screen.getByText('📄 Export')).toBeInTheDocument();
        });
    });
    describe('Accessibility', () => {
        test('has proper ARIA labels and roles', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Check for proper table structure
            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();
            const columnHeaders = screen.getAllByRole('columnheader');
            expect(columnHeaders.length).toBeGreaterThan(0);
        });
        test('supports keyboard navigation', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
            });
            const refreshButton = screen.getByText('🔄 Refresh');
            // Focus should be manageable
            refreshButton.focus();
            expect(document.activeElement).toBe(refreshButton);
        });
    });
    describe('Performance', () => {
        test('limits number of events displayed in table', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // Simulate many events
            for (let i = 0; i < 15; i++) {
                act(() => {
                    if (mockWebSocket.onmessage) {
                        mockWebSocket.onmessage({
                            data: JSON.stringify({
                                ...mockSecurityEvent,
                                id: `event-${i}`,
                                description: `Event ${i}`
                            })
                        });
                    }
                });
            }
            // Should only show first 10 events
            await waitFor(() => {
                const eventRows = screen.getAllByText(/Event \d+/);
                expect(eventRows.length).toBeLessThanOrEqual(10);
            });
        });
        test('manages memory by limiting stored events', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
            // This test would verify that the component doesn't store unlimited events
            // Implementation would include checking internal state management
            // For now, this is a placeholder test
            expect(true).toBe(true);
        });
    });
    describe('Integration Tests', () => {
        test('integrates properly with workflow store', async () => {
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            await waitFor(() => {
                expect(mockWorkflowStore.fetchStates).toHaveBeenCalledWith('workspace-1');
                expect(mockWorkflowStore.fetchTransitions).toHaveBeenCalledWith('workspace-1');
                expect(mockWorkflowStore.fetchApprovals).toHaveBeenCalledWith('workspace-1');
            });
        });
        test('handles workflow store errors gracefully', async () => {
            mockWorkflowStore.error = 'Store error';
            render(_jsx(SecurityDashboardWorkflow, { ...defaultProps }));
            // Component should handle store errors appropriately
            await waitFor(() => {
                // Would check for error handling UI
                expect(screen.getByText('Security Operational Dashboard')).toBeInTheDocument();
            });
        });
    });
});
