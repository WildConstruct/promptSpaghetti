// Epic 19.4 - Security Dashboard Component Tests
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SecurityDashboard } from '../SecurityDashboard';

// Mock date-fns
jest.mock('date-fns', () => ({)
  formatDistanceToNow: jest.fn(() => '5 minutes'),
}));
describe('SecurityDashboard', () => {
  const mockOnIncidentClick = jest.fn<unknown, unknown>();
  const mockOnThreatClick = jest.fn<unknown, unknown>();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders security dashboard with metrics', async () => {
    render();
      <SecurityDashboard 
        onIncidentClick={mockOnIncidentClick}
        onThreatClick={mockOnThreatClick}
      />
    );
    // Check loading state first
    expect(screen.getByText('Loading security dashboard...')).toBeInTheDocument();
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Security Monitoring Dashboard')).toBeInTheDocument();
    }, { timeout: 2000 });
    // Check metrics are displayed
    expect(screen.getByText('Total Threats Detected')).toBeInTheDocument();
    expect(screen.getByText('Threats Blocked')).toBeInTheDocument();
    expect(screen.getByText('Active Incidents')).toBeInTheDocument();
    expect(screen.getByText('Risk Score')).toBeInTheDocument();
  });
  it('displays security alerts', async () => {
    render(<SecurityDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Recent Security Alerts')).toBeInTheDocument();
    }, { timeout: 2000 });
    // Check for sample alerts
    expect(screen.getByText('Multiple Failed Login Attempts')).toBeInTheDocument();
    expect(screen.getByText('Suspicious API Usage Pattern')).toBeInTheDocument();
  });
  it('handles incident click callback', async () => {
    render(<SecurityDashboard onIncidentClick={mockOnIncidentClick} />);
    await waitFor(() => {
      expect(screen.getByText('Recent Security Alerts')).toBeInTheDocument();
    }, { timeout: 2000 });
    // Find and click an investigate button
    const investigateButtons = screen.getAllByText('Investigate');
    fireEvent.click(investigateButtons[0]);
    expect(mockOnIncidentClick).toHaveBeenCalledWith('alert-1');
  });
  it('shows appropriate alert indicators', async () => {
    render(<SecurityDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Recent Security Alerts')).toBeInTheDocument();
    }, { timeout: 2000 });
    // Check for status badges
    expect(screen.getByText('Investigating')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });
  it('displays last scan time', async () => {
  render(<SecurityDashboard />);
  await waitFor(() => {
  expect(screen.getByText(/Last scan:/)).toBeInTheDocument();
}, { timeout: 2000 });
  });
  it('shows quick actions section', async () => {
    render(<SecurityDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('Security Policies')).toBeInTheDocument();
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });
});