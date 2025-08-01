/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// DataAccessDashboard Tests - Epic 19.4
// Test suite for the data access dashboard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataAccessDashboard from '../DataAccessDashboard';

// Mock the useDataAccess hook
jest.mock('../../../hooks/useDataAccess', () => ({)
  useDataAccess: jest.fn<unknown, unknown>(),
}));
import { useDataAccess } from '../../../hooks/useDataAccess';
const mockUseDataAccess = useDataAccess as jest.MockedFunction<typeof useDataAccess>;
describe('DataAccessDashboard', () => {
  const mockHookReturn = {
  grants: [],
  history: [],
  loading: false,
  error: null,
  loadGrants: jest.fn<unknown, unknown>(),
  loadHistory: jest.fn<unknown, unknown>(),
  requestAccess: jest.fn<unknown, unknown>(),
  checkAccess: jest.fn<unknown, unknown>(),
  revokeAccess: jest.fn<unknown, unknown>(),
  clearError: jest.fn<unknown, unknown>(),
};
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDataAccess.mockReturnValue(mockHookReturn as unknown as unknown);
  });
  it('renders dashboard header correctly', () => {
    render(<DataAccessDashboard userId="user-123" />);
    expect(screen.getByText('Data Access Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your data access permissions and view your access history')).toBeInTheDocument();
  });
  it('renders navigation tabs', () => {
    render(<DataAccessDashboard userId="user-123" />);
    expect(screen.getByText('Current Permissions')).toBeInTheDocument();
    expect(screen.getByText('Access History')).toBeInTheDocument();
  });
  it('shows loading state', () => {
  mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  loading: true,
 as unknown as unknown);
    render(<DataAccessDashboard userId="user-123" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  it('displays error banner when error exists', () => {
  mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  error: 'Failed to load data',
 as unknown as unknown);
    render(<DataAccessDashboard userId="user-123" />);
    expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });
  it('clears error when close button is clicked', () => {
  mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  error: 'Test error',
 as unknown as unknown);
    render(<DataAccessDashboard userId="user-123" />);
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    expect(mockHookReturn.clearError).toHaveBeenCalled();
  });
  describe('Permissions Tab', () => {
    it('shows empty state when no grants exist', () => {
      render(<DataAccessDashboard userId="user-123" />);
      expect(screen.getByText('No active access grants found.')).toBeInTheDocument();
      expect(screen.getByText('Request Your First Access')).toBeInTheDocument();
    });
    it('displays grants when they exist', () => {
  const mockGrants = [{
  id: 'grant-1',
  resourceId: 'resource-123',
  resourceType: 'customer_data',
  operations: ['READ', 'WRITE'],
  classification: 'CONFIDENTIAL',
  grantedBy: 'admin@example.com',
  grantedAt: new Date('2023-12-01'),
  expiresAt: new Date('2024-01-01'),
  reason: 'Business need',
  restrictions: [],
];
      mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  grants: mockGrants,
 as unknown as unknown);
      render(<DataAccessDashboard userId="user-123" />);
      expect(screen.getByText('resource-123')).toBeInTheDocument();
      expect(screen.getByText('customer_data')).toBeInTheDocument();
      expect(screen.getByText('CONFIDENTIAL')).toBeInTheDocument();
      expect(screen.getByText('READ')).toBeInTheDocument();
      expect(screen.getByText('WRITE')).toBeInTheDocument();
    });
    it('opens request form when Request Access button is clicked', () => {
      render(<DataAccessDashboard userId="user-123" />);
      const requestButton = screen.getByText('Request Access');
      fireEvent.click(requestButton);
      expect(screen.getByText('Request Data Access')).toBeInTheDocument();
      expect(screen.getByLabelText('Resource ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Resource Type')).toBeInTheDocument();
    });
  });
  describe('History Tab', () => {
    it('switches to history tab when clicked', () => {
      render(<DataAccessDashboard userId="user-123" />);
      const historyTab = screen.getByText('Access History');
      fireEvent.click(historyTab);
      expect(screen.getByText('Access History')).toBeInTheDocument();
      expect(mockHookReturn.loadHistory).toHaveBeenCalledWith('user-123', {});
    });
    it('shows empty state when no history exists', () => {
      render(<DataAccessDashboard userId="user-123" />);
      const historyTab = screen.getByText('Access History');
      fireEvent.click(historyTab);
      expect(screen.getByText('No access history found for the selected filters.')).toBeInTheDocument();
    });
    it('displays history table when history exists', () => {
  const mockHistory = [{
  id: 'history-1',
  userId: 'user-123',
  resourceId: 'resource-456',
  operation: 'READ',
  allowed: true,
  reason: 'Access granted',
  classification: 'INTERNAL',
  accessLevel: 'GRANTED',
  timestamp: new Date('2023-12-01'),
  riskScore: 25,
];
      mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  history: mockHistory,
 as unknown as unknown);
      render(<DataAccessDashboard userId="user-123" />);
      const historyTab = screen.getByText('Access History');
      fireEvent.click(historyTab);
      expect(screen.getByText('resource-456')).toBeInTheDocument();
      expect(screen.getByText('READ')).toBeInTheDocument();
      expect(screen.getByText('GRANTED')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });
  describe('Request Form', () => {
    beforeEach(() => {
      render(<DataAccessDashboard userId="user-123" />);
      const requestButton = screen.getByText('Request Access');
      fireEvent.click(requestButton);
    });
    it('validates required fields', () => {
      const submitButton = screen.getByText('Submit Request');
      expect(submitButton).toBeDisabled();
    });
    it('enables submit button when form is valid', () => {
      const resourceIdInput = screen.getByLabelText('Resource ID');
      const resourceTypeSelect = screen.getByLabelText('Resource Type');
      const reasonTextarea = screen.getByLabelText('Business Justification');
      fireEvent.change(resourceIdInput, { target: { value: 'resource-123' } });
      fireEvent.change(resourceTypeSelect, { target: { value: 'customer_data' } });
      fireEvent.change(reasonTextarea, { target: { value: 'I need this for business purposes' } });
      const submitButton = screen.getByText('Submit Request');
      expect(submitButton).not.toBeDisabled();
    });
    it('submits form with correct data', async () => {
  mockHookReturn.requestAccess.mockResolvedValue({)
  requestId: 'req-123',
  status: 'approved',
  message: 'Request approved',
 as unknown as unknown);
      const resourceIdInput = screen.getByLabelText('Resource ID');
      const resourceTypeSelect = screen.getByLabelText('Resource Type');
      const operationSelect = screen.getByLabelText('Operation');
      const reasonTextarea = screen.getByLabelText('Business Justification');
      fireEvent.change(resourceIdInput, { target: { value: 'resource-123' } });
      fireEvent.change(resourceTypeSelect, { target: { value: 'customer_data' } });
      fireEvent.change(operationSelect, { target: { value: 'READ' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Business need for customer analysis' } });
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);
      await waitFor(() => {
  expect(mockHookReturn.requestAccess).toHaveBeenCalledWith({)
  resourceId: 'resource-123',
  resourceType: 'customer_data',
  operation: 'READ',
  reason: 'Business need for customer analysis',
});
      });
    });
    it('closes form when cancel button is clicked', () => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(screen.queryByText('Request Data Access')).not.toBeInTheDocument();
    });
    it('closes form when close button is clicked', () => {
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Request Data Access')).not.toBeInTheDocument();
    });
  });
  describe('Responsive behavior', () => {
    it('loads grants on mount', () => {
      render(<DataAccessDashboard userId="user-123" />);
      expect(mockHookReturn.loadGrants).toHaveBeenCalledWith('user-123');
    });
    it('loads history when switching to history tab', () => {
      render(<DataAccessDashboard userId="user-123" />);
      const historyTab = screen.getByText('Access History');
      fireEvent.click(historyTab);
      expect(mockHookReturn.loadHistory).toHaveBeenCalledWith('user-123', {});
    });
  });
  describe('Classification colors', () => {
  it('applies correct colors for different classifications', () => {
  const mockGrants = [
  {
  id: 'grant-1',
  resourceId: 'resource-123',
  resourceType: 'customer_data',
  operations: ['READ'],
  classification: 'PUBLIC',
  grantedBy: 'admin',
  grantedAt: new Date(),
  expiresAt: new Date(),
  reason: 'Test',
  restrictions: [],

        {
  id: 'grant-2',
  resourceId: 'resource-456',
  resourceType: 'financial_data',
  operations: ['READ'],
  classification: 'RESTRICTED',
  grantedBy: 'admin',
  grantedAt: new Date(),
  expiresAt: new Date(),
  reason: 'Test',
  restrictions: []];
  mockUseDataAccess.mockReturnValue({)
  ...mockHookReturn,
  grants: mockGrants,
 as unknown as unknown);
      render(<DataAccessDashboard userId="user-123" />);
      const publicBadge = screen.getByText('PUBLIC');
      const restrictedBadge = screen.getByText('RESTRICTED');
      expect(publicBadge).toHaveStyle('background-color: #28a745');
      expect(restrictedBadge).toHaveStyle('background-color: #dc3545');
    });
  });
});