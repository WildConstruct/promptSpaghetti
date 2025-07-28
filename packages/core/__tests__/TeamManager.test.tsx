// Epic 11.4 Team Manager Component Tests
// Comprehensive test suite for team management React component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TeamManager } from '../components/auth/TeamManager';

// Mock the icon components
jest.mock('lucide-react', () => ({)
  Users: () => <div data-testid="users-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Edit2: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Crown: () => <div data-testid="crown-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  User: () => <div data-testid="user-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
}));
describe('TeamManager', () => {
  const mockTeams = [;
    {
      id: 'team-1',
      organizationId: 'org-1',
      parentTeamId: null,
      name: 'Engineering',
      description: 'Engineering team',
      settings: {},
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      level: 0,
      path: ['Engineering'];
  }
    {
      id: 'team-2',
      organizationId: 'org-1',
      parentTeamId: 'team-1',
      name: 'Frontend',
      description: 'Frontend development team',
      settings: {},
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      level: 1,
      path: ['Engineering', 'Frontend']
  }
    {
      id: 'team-3',
      organizationId: 'org-1',
      parentTeamId: 'team-1',
      name: 'Backend',
      description: 'Backend development team',
      settings: {},
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
      level: 1,
      path: ['Engineering', 'Backend']
  ];
  const mockMembers = [;
    {
  id: 'member-1',
  userId: 'user-1',
  role: 'owner' as const,
  joinedAt: new Date('2023-01-01'),
  invitedBy: 'user-1',
  user: {,
  id: 'user-1',
  email: 'owner@example.com',
  displayName: 'Team Owner',
  firstName: 'Team',
  lastName: 'Owner',
  avatarUrl: null,
}
    {
  id: 'member-2',
  userId: 'user-2',
  role: 'member' as const,
  joinedAt: new Date('2023-01-02'),
  invitedBy: 'user-1',
  user: {,
  id: 'user-2',
  email: 'member@example.com',
  displayName: 'Team Member',
  firstName: 'Team',
  lastName: 'Member',
  avatarUrl: null];
  const defaultProps = {
  organizationId: 'org-1',
  onCreateTeam: jest.fn(),
  onUpdateTeam: jest.fn(),
  onDeleteTeam: jest.fn(),
  onAddMember: jest.fn(),
  onRemoveMember: jest.fn(),
  onUpdateMemberRole: jest.fn(),
  onLoadMembers: jest.fn(),
};
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders the team manager interface', () => {
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Create Team')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });
  it('displays hierarchical team structure correctly', () => {
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    // Check that teams are displayed with proper hierarchy
    const engineeringTeam = screen.getByText('Engineering').closest('.team-card');
    const frontendTeam = screen.getByText('Frontend').closest('.team-card');
    const backendTeam = screen.getByText('Backend').closest('.team-card');
    expect(engineeringTeam).toBeInTheDocument();
    expect(frontendTeam).toBeInTheDocument();
    expect(backendTeam).toBeInTheDocument();
    // Frontend and Backend should be indented as children of Engineering
    expect(frontendTeam).toHaveClass('ml-6');
    expect(backendTeam).toHaveClass('ml-6');
  });
  it('opens create team modal when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    const createButton = screen.getByText('Create Team');
    await user.click(createButton);
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    expect(screen.getByLabelText('Team Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Parent Team')).toBeInTheDocument();
  });
  it('handles team creation form submission', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onCreateTeam={mockCreate}
      />
    );
    // Open create modal
    const createButton = screen.getByText('Create Team');
    await user.click(createButton);
    // Fill form
    const nameInput = screen.getByLabelText('Team Name');
    const descriptionInput = screen.getByLabelText('Description');
    await user.type(nameInput, 'DevOps Team');
    await user.type(descriptionInput, 'DevOps and infrastructure team');
    // Select parent team
    const parentSelect = screen.getByLabelText('Parent Team');
    await user.selectOptions(parentSelect, 'team-1');
    // Submit form
    const submitButton = screen.getByText('Create Team', { selector: 'button' });
    await user.click(submitButton);
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({)
  name: 'DevOps Team',
        description: 'DevOps and infrastructure team',
        parentTeamId: 'team-1',
        settings: {}
      });
    });
  });
  it('validates required fields in create form', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onCreateTeam={mockCreate}
      />
    );
    // Open create modal
    const createButton = screen.getByText('Create Team');
    await user.click(createButton);
    // Try to submit without required fields
    const submitButton = screen.getByText('Create Team', { selector: 'button' });
    await user.click(submitButton);
    expect(screen.getByText('Team name is required')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });
  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    // Click edit button for first team
    const editButtons = screen.getAllByTestId('edit-icon');
    await user.click(editButtons[0].closest('button')!);
    expect(screen.getByText('Edit Team')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineering team')).toBeInTheDocument();
  });
  it('handles team update form submission', async () => {
    const user = userEvent.setup();
    const mockUpdate = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onUpdateTeam={mockUpdate}
      />
    );
    // Open edit modal
    const editButtons = screen.getAllByTestId('edit-icon');
    await user.click(editButtons[0].closest('button')!);
    // Update name
    const nameInput = screen.getByDisplayValue('Engineering');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Engineering');
    // Submit form
    const submitButton = screen.getByText('Update Team');
    await user.click(submitButton);
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('team-1', {)
  name: 'Updated Engineering',
        description: 'Engineering team',
        parentTeamId: null,
        settings: {}
      });
    });
  });
  it('shows confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    // Click delete button for first team
    const deleteButtons = screen.getAllByTestId('trash-icon');
    await user.click(deleteButtons[0].closest('button')!);
    expect(screen.getByText('Delete Team')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  it('handles team deletion', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onDeleteTeam={mockDelete}
      />
    );
    // Open delete confirmation
    const deleteButtons = screen.getAllByTestId('trash-icon');
    await user.click(deleteButtons[0].closest('button')!);
    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('team-1');
    });
  });
  it('expands team to show members when clicked', async () => {
    const user = userEvent.setup();
    const mockLoadMembers = jest.fn().mockResolvedValue(mockMembers);
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onLoadMembers={mockLoadMembers}
      />
    );
    // Click on a team to expand it
    const teamCard = screen.getByText('Engineering').closest('.team-card');
    const expandButton = teamCard?.querySelector('.expand-button');
    if (expandButton) {
      await user.click(expandButton);
    await waitFor(() => {
      expect(mockLoadMembers).toHaveBeenCalledWith('team-1');
    });
  });
  it('displays team members when team is expanded', async () => {
    const user = userEvent.setup();
    const mockLoadMembers = jest.fn().mockResolvedValue(mockMembers);
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
        onLoadMembers={mockLoadMembers}
      />
    );
    // Simulate team being expanded (members are already loaded)
    expect(screen.getByText('Team Owner')).toBeInTheDocument();
    expect(screen.getByText('Team Member')).toBeInTheDocument();
    expect(screen.getByText('owner@example.com')).toBeInTheDocument();
    expect(screen.getByText('member@example.com')).toBeInTheDocument();
  });
  it('shows add member modal when add member button is clicked', async () => {
    const user = userEvent.setup();
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
      />
    );
    // Click add member button
    const addMemberButtons = screen.getAllByTestId('user-plus-icon');
    await user.click(addMemberButtons[0].closest('button')!);
    expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    expect(screen.getByLabelText('User Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });
  it('handles add member form submission', async () => {
    const user = userEvent.setup();
    const mockAddMember = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
        onAddMember={mockAddMember}
      />
    );
    // Open add member modal
    const addMemberButtons = screen.getAllByTestId('user-plus-icon');
    await user.click(addMemberButtons[0].closest('button')!);
    // Fill form
    const emailInput = screen.getByLabelText('User Email');
    const roleSelect = screen.getByLabelText('Role');
    await user.type(emailInput, 'newmember@example.com');
    await user.selectOptions(roleSelect, 'member');
    // Submit form
    const submitButton = screen.getByText('Add Member');
    await user.click(submitButton);
    await waitFor(() => {
  expect(mockAddMember).toHaveBeenCalledWith('team-1', {)
  userEmail: 'newmember@example.com',
  role: 'member',
});
    });
  });
  it('shows role update dropdown when member role is clicked', async () => {
    const user = userEvent.setup();
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
      />
    );
    // Click on member role
    const memberRole = screen.getByText('member');
    await user.click(memberRole);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });
  it('handles member role update', async () => {
    const user = userEvent.setup();
    const mockUpdateRole = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
        onUpdateMemberRole={mockUpdateRole}
      />
    );
    // Click on member role and select new role
    const memberRole = screen.getByText('member');
    await user.click(memberRole);
    const adminOption = screen.getByText('admin');
    await user.click(adminOption);
    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith('team-1', 'user-2', 'admin');
    });
  });
  it('handles member removal', async () => {
    const user = userEvent.setup();
    const mockRemoveMember = jest.fn().mockResolvedValue({});
    render();
      <TeamManager 
        teams={mockTeams} 
        members={{ 'team-1': mockMembers }}
        {...defaultProps}
        onRemoveMember={mockRemoveMember}
      />
    );
    // Click remove member button
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);
    // Confirm removal in dialog
    const confirmButton = screen.getByText('Remove Member');
    await user.click(confirmButton);
    await waitFor(() => {
      expect(mockRemoveMember).toHaveBeenCalledWith('team-1', 'user-2');
    });
  });
  it('displays empty state when no teams exist', () => {
    render(<TeamManager teams={[]} {...defaultProps} />);
    expect(screen.getByText('No teams found')).toBeInTheDocument();
    expect(screen.getByText('Create your first team to get started')).toBeInTheDocument();
  });
  it('shows loading state during operations', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn().mockImplementation(;);
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    render();
      <TeamManager 
        teams={mockTeams} 
        {...defaultProps}
        onCreateTeam={mockCreate}
      />
    );
    // Open create modal and submit
    const createButton = screen.getByText('Create Team');
    await user.click(createButton);
    const nameInput = screen.getByLabelText('Team Name');
    await user.type(nameInput, 'New Team');
    const submitButton = screen.getByText('Create Team', { selector: 'button' });
    await user.click(submitButton);
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });
  it('handles form cancellation', async () => {
    const user = userEvent.setup();
    render(<TeamManager teams={mockTeams} {...defaultProps} />);
    // Open create modal
    const createButton = screen.getByText('Create Team');
    await user.click(createButton);
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    // Cancel form
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(screen.queryByText('Create New Team')).not.toBeInTheDocument();
  });
});