/**
 * Unit tests for TemplateCollaborationPanel component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock useExport hook
const mockUseExport = {
  getTemplateCollaborators: jest.fn<unknown[], unknown>(),
  getTemplateActivity: jest.fn<unknown[], unknown>(),
  getTemplateAnalytics: jest.fn<unknown[], unknown>(),
  inviteCollaborator: jest.fn<unknown[], unknown>(),
  updateCollaboratorRole: jest.fn<unknown[], unknown>(),
  removeCollaborator: jest.fn<unknown[], unknown>(),
  updateShareSettings: jest.fn<unknown[], unknown>(),
  generateShareLink: jest.fn<unknown[], unknown>(),
  forkTemplate: jest.fn<unknown[], unknown>()
};

jest.mock('../hooks/useExport', () => ({
  useExport: () => mockUseExport
}));

import { TemplateCollaborationPanel } from '../components/export/TemplateCollaborationPanel';

// Mock data
const mockTemplate = {
  id: 'template-1',
  name: 'Collaboration Test Template',
  description: 'A template for testing collaboration features',
  export_format: 'json' as const,
  template_type: 'full' as const,
  is_public: false,
  is_system_template: false,
  format_options: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user-1'
};

const mockCollaborators = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar1.jpg',
    role: 'owner' as const,
    joinedAt: '2024-01-01T00:00:00Z',
    lastActive: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'editor' as const,
    joinedAt: '2024-01-05T00:00:00Z',
    lastActive: '2024-01-14T00:00:00Z'
  },
  {
    id: 'user-3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'viewer' as const,
    joinedAt: '2024-01-10T00:00:00Z',
    lastActive: '2024-01-12T00:00:00Z'
  }
];

const mockActivities = [
  {
    id: 'activity-1',
    userId: 'user-2',
    userEmail: 'jane@example.com',
    action: 'updated' as const,
    timestamp: '2024-01-15T10:00:00Z',
    details: 'updated template parameters',
    metadata: { changes: ['format_options'] }
  },
  {
    id: 'activity-2',
    userId: 'user-1',
    userEmail: 'john@example.com',
    action: 'shared' as const,
    timestamp: '2024-01-14T09:00:00Z',
    details: 'shared template publicly',
    metadata: { visibility: 'public' }
  }
];

const mockAnalytics = {
  totalUses: 1250,
  uniqueUsers: 45,
  successRate: 0.92,
  averageRating: 4.3,
  forkCount: 8,
  usageByFormat: { json: 800, yaml: 300, xml: 150 },
  usageOverTime: [
    { date: '2024-01-01', count: 10 },
    { date: '2024-01-02', count: 15 },
    { date: '2024-01-03', count: 20 }
  ],
  topUsers: [
    { userId: 'user-1', email: 'john@example.com', uses: 50 },
    { userId: 'user-2', email: 'jane@example.com', uses: 35 }
  ]
};

const defaultProps = {
  template: mockTemplate,
  visible: true,
  onClose: jest.fn<unknown[], unknown>(),
  projectId: 'test-project'
};

describe('TemplateCollaborationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExport.getTemplateCollaborators.mockResolvedValue(mockCollaborators as unknown);
    mockUseExport.getTemplateActivity.mockResolvedValue(mockActivities as unknown);
    mockUseExport.getTemplateAnalytics.mockResolvedValue(mockAnalytics as unknown);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing when visible', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('👥 Template Collaboration')).toBeInTheDocument();
      });
    });

    it('does not render when not visible', () => {
      render(<TemplateCollaborationPanel {...defaultProps} visible={false} />);
      expect(screen.queryByText('👥 Template Collaboration')).not.toBeInTheDocument();
    });

    it('displays template information in header', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Collaboration Test Template • 3 collaborators/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('loads collaboration data on mount', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockUseExport.getTemplateCollaborators).toHaveBeenCalledWith('template-1');
        expect(mockUseExport.getTemplateActivity).toHaveBeenCalledWith('template-1');
        expect(mockUseExport.getTemplateAnalytics).toHaveBeenCalledWith('template-1');
      });
    });

    it('handles loading errors gracefully', async () => {
      mockUseExport.getTemplateCollaborators.mockRejectedValue(new Error('Network error'));
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Tabs', () => {
    it('shows all navigation tabs', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('👥 Collaborators')).toBeInTheDocument();
        expect(screen.getByText('📈 Activity')).toBeInTheDocument();
        expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
        expect(screen.getByText('🌐 Sharing')).toBeInTheDocument();
      });
    });

    it('switches between tabs', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Invite Collaborator')).toBeInTheDocument();
      });

      const activityTab = screen.getByText('📈 Activity');
      await userEvent.click(activityTab);
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('highlights active tab', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        const collaboratorsTab = screen.getByText('👥 Collaborators');
        expect(collaboratorsTab).toHaveStyle({ background: '#0ea5e9', color: 'white' });
      });
    });
  });

  describe('Collaborators Tab', () => {
    it('displays collaborator invitation form', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Invite Collaborator')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Viewer')).toBeInTheDocument();
      });
    });

    it('handles collaborator invitation', async () => {
      const newCollaborator = {
        id: 'user-4',
        name: 'New User',
        email: 'new@example.com',
        role: 'viewer' as const,
        joinedAt: '2024-01-16T00:00:00Z',
        lastActive: '2024-01-16T00:00:00Z'
      };
      
      mockUseExport.inviteCollaborator.mockResolvedValue(newCollaborator as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('colleague@company.com');
      await userEvent.type(emailInput, 'new@example.com');
      
      const inviteButton = screen.getByText(/Invite/);
      await userEvent.click(inviteButton);
      
      await waitFor(() => {
        expect(mockUseExport.inviteCollaborator).toHaveBeenCalledWith('template-1', {
          email: 'new@example.com',
          role: 'viewer'
        });
      });
    });

    it('displays list of current collaborators', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('shows collaborator roles and badges', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('OWNER')).toBeInTheDocument();
        expect(screen.getByText('EDITOR')).toBeInTheDocument();
        expect(screen.getByText('VIEWER')).toBeInTheDocument();
      });
    });

    it('allows role changes for non-owners', async () => {
      mockUseExport.updateCollaboratorRole.mockResolvedValue(undefined as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Find the role select for Jane Smith (editor)
      const roleSelects = screen.getAllByDisplayValue('editor');
      expect(roleSelects.length).toBeGreaterThan(0);
      
      await userEvent.selectOptions(roleSelects[0], 'viewer');
      
      await waitFor(() => {
        expect(mockUseExport.updateCollaboratorRole).toHaveBeenCalledWith('template-1', 'user-2', 'viewer');
      });
    });

    it('allows removing non-owner collaborators', async () => {
      mockUseExport.removeCollaborator.mockResolvedValue(undefined as unknown);
      
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText('Remove');
      await userEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(mockUseExport.removeCollaborator).toHaveBeenCalledWith('template-1', 'user-2');
      });
      
      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    it('does not show role/remove controls for owners', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Owner should not have role select or remove button
      const ownerRow = screen.getByText('John Doe').closest('div');
      expect(ownerRow).toBeInTheDocument();
      
      // Check that there are fewer role selects than total collaborators
      const roleSelects = screen.getAllByRole('combobox');
      expect(roleSelects.length).toBeLessThan(mockCollaborators.length);
    });
  });

  describe('Activity Tab', () => {
    it('displays recent activity', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const activityTab = screen.getByText('📈 Activity');
      await userEvent.click(activityTab);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText(/jane@example.com.*updated template parameters/)).toBeInTheDocument();
        expect(screen.getByText(/john@example.com.*shared template publicly/)).toBeInTheDocument();
      });
    });

    it('shows activity timestamps', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const activityTab = screen.getByText('📈 Activity');
      await userEvent.click(activityTab);
      
      await waitFor(() => {
        // Check for formatted dates (exact format may vary based on locale)
        expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 14, 2024/)).toBeInTheDocument();
      });
    });

    it('shows different activity indicators', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const activityTab = screen.getByText('📈 Activity');
      await userEvent.click(activityTab);
      
      await waitFor(() => {
        // Activity indicators are shown as colored dots
        const activityItems = screen.getAllByText(/updated template parameters|shared template publicly/);
        expect(activityItems.length).toBe(2);
      });
    });

    it('shows empty state when no activity', async () => {
      mockUseExport.getTemplateActivity.mockResolvedValue([] as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const activityTab = screen.getByText('📈 Activity');
      await userEvent.click(activityTab);
      
      await waitFor(() => {
        expect(screen.getByText('📈')).toBeInTheDocument();
        expect(screen.getByText('No activity yet. Use the template to see activity here!')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Tab', () => {
    it('displays usage analytics', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const analyticsTab = screen.getByText('📊 Analytics');
      await userEvent.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Usage Analytics')).toBeInTheDocument();
        expect(screen.getByText('1.3K')).toBeInTheDocument(); // Formatted usage count
        expect(screen.getByText('45')).toBeInTheDocument(); // Unique users
        expect(screen.getByText('92%')).toBeInTheDocument(); // Success rate
        expect(screen.getByText('8')).toBeInTheDocument(); // Fork count
      });
    });

    it('shows analytics cards with proper styling', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const analyticsTab = screen.getByText('📊 Analytics');
      await userEvent.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Total Uses')).toBeInTheDocument();
        expect(screen.getByText('Unique Users')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('Forks')).toBeInTheDocument();
      });
    });

    it('handles missing analytics gracefully', async () => {
      mockUseExport.getTemplateAnalytics.mockResolvedValue(null as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const analyticsTab = screen.getByText('📊 Analytics');
      await userEvent.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('📊')).toBeInTheDocument();
        expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
      });
    });
  });

  describe('Sharing Tab', () => {
    it('displays sharing settings', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const sharingTab = screen.getByText('🌐 Sharing');
      await userEvent.click(sharingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Public Sharing Settings')).toBeInTheDocument();
        expect(screen.getByText('Make Template Public')).toBeInTheDocument();
      });
    });

    it('handles public toggle', async () => {
      mockUseExport.updateShareSettings.mockResolvedValue(undefined as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const sharingTab = screen.getByText('🌐 Sharing');
      await userEvent.click(sharingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Make Template Public')).toBeInTheDocument();
      });

      const publicToggle = screen.getByRole('checkbox', { name: /Make Template Public/ });
      await userEvent.click(publicToggle);
      
      await waitFor(() => {
        expect(mockUseExport.updateShareSettings).toHaveBeenCalledWith('template-1', {
          isPublic: true,
          allowForks: true,
          allowComments: true,
          requireApproval: false
        });
      });
    });

    it('shows additional settings when public', async () => {
      // Start with a public template
      const publicTemplate = { ...mockTemplate, is_public: true };
      
      render(<TemplateCollaborationPanel {...defaultProps} template={publicTemplate} />);
      
      const sharingTab = screen.getByText('🌐 Sharing');
      await userEvent.click(sharingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Allow Forks')).toBeInTheDocument();
        expect(screen.getByText('Allow Comments')).toBeInTheDocument();
      });
    });

    it('generates share links', async () => {
      mockUseExport.generateShareLink.mockResolvedValue('https://example.com/template/share/abc123' as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      const sharingTab = screen.getByText('🌐 Sharing');
      await userEvent.click(sharingTab);
      
      // First make it public
      const publicToggle = screen.getByRole('checkbox', { name: /Make Template Public/ });
      await userEvent.click(publicToggle);
      
      await waitFor(() => {
        expect(screen.getByText('🔗 Generate Share Link')).toBeInTheDocument();
      });

      const generateButton = screen.getByText('🔗 Generate Share Link');
      await userEvent.click(generateButton);
      
      await waitFor(() => {
        expect(mockUseExport.generateShareLink).toHaveBeenCalledWith('template-1');
      });
    });
  });

  describe('Footer Actions', () => {
    it('handles template forking', async () => {
      mockUseExport.forkTemplate.mockResolvedValue({ id: 'forked-template' } as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🍴 Fork Template')).toBeInTheDocument();
      });

      const forkButton = screen.getByText('🍴 Fork Template');
      await userEvent.click(forkButton);
      
      await waitFor(() => {
        expect(mockUseExport.forkTemplate).toHaveBeenCalledWith('template-1');
      });
    });
  });

  describe('Dialog Controls', () => {
    it('calls onClose when close button is clicked', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('×')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      await userEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when close footer button is clicked', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not show close buttons when onClose is not provided', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} onClose={undefined} />);
      
      await waitFor(() => {
        expect(screen.queryByText('×')).not.toBeInTheDocument();
        expect(screen.queryByText('Close')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error messages', async () => {
      mockUseExport.getTemplateCollaborators.mockRejectedValue(new Error('API Error'));
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
      });
    });

    it('handles invitation errors', async () => {
      mockUseExport.inviteCollaborator.mockRejectedValue(new Error('Invitation failed'));
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('colleague@company.com');
      await userEvent.type(emailInput, 'test@example.com');
      
      const inviteButton = screen.getByText(/Invite/);
      await userEvent.click(inviteButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Invitation failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading states during operations', async () => {
      mockUseExport.inviteCollaborator.mockImplementation(() => new Promise(() => {}));
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('colleague@company.com');
      await userEvent.type(emailInput, 'test@example.com');
      
      const inviteButton = screen.getByText(/Invite/);
      await userEvent.click(inviteButton);
      
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state for no collaborators', async () => {
      mockUseExport.getTemplateCollaborators.mockResolvedValue([] as unknown);
      
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('👥')).toBeInTheDocument();
        expect(screen.getByText('No collaborators yet. Invite team members to get started!')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
      });
    });

    it('provides proper button roles', async () => {
      render(<TemplateCollaborationPanel {...defaultProps} />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
});