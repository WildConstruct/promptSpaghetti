import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OrganizationManager } from '../components/auth/OrganizationManager';
// Mock the icon components
jest.mock('lucide-react', () => ({
    Users: () => _jsx("div", { "data-testid": "users-icon" }),
    Settings: () => _jsx("div", { "data-testid": "settings-icon" }),
    Building2: () => _jsx("div", { "data-testid": "building-icon" }),
    Plus: () => _jsx("div", { "data-testid": "plus-icon" }),
    Edit2: () => _jsx("div", { "data-testid": "edit-icon" }),
    Trash2: () => _jsx("div", { "data-testid": "trash-icon" }),
    Globe: () => _jsx("div", { "data-testid": "globe-icon" }),
    Crown: () => _jsx("div", { "data-testid": "crown-icon" }),
    Shield: () => _jsx("div", { "data-testid": "shield-icon" }),
    BarChart3: () => _jsx("div", { "data-testid": "chart-icon" }),
    ChevronRight: () => _jsx("div", { "data-testid": "chevron-right-icon" }),
    Palette: () => _jsx("div", { "data-testid": "palette-icon" }),
}));
describe('OrganizationManager', () => {
    const mockOrganizations = [
        {
            id: 'org-1',
            name: 'Test Organization',
            slug: 'test-org',
            description: 'A test organization',
            website: 'https://test.com',
            logoUrl: null,
            branding: {},
            settings: {},
            plan: 'free',
            maxUsers: 10,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        },
        {
            id: 'org-2',
            name: 'Pro Organization',
            slug: 'pro-org',
            description: 'A pro organization',
            website: 'https://pro.com',
            logoUrl: null,
            branding: {},
            settings: {},
            plan: 'pro',
            maxUsers: 100,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02'),
        },
    ];
    const mockStats = {
        totalMembers: 15,
        totalTeams: 8,
        activeTeams: 8,
        recentActivity: 3,
        planLimits: {
            maxUsers: 10,
            maxTeams: 5,
            maxStorage: 1024,
        },
        usage: {
            users: 8,
            teams: 5,
            storage: 512,
        },
    };
    const defaultProps = {
        onCreateOrganization: jest.fn(),
        onUpdateOrganization: jest.fn(),
        onDeleteOrganization: jest.fn(),
        onViewStats: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders the organization manager interface', () => {
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        expect(screen.getByText('Organization Management')).toBeInTheDocument();
        expect(screen.getByText('Create Organization')).toBeInTheDocument();
        expect(screen.getByText('Test Organization')).toBeInTheDocument();
        expect(screen.getByText('Pro Organization')).toBeInTheDocument();
    });
    it('displays organization cards with correct information', () => {
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        // Check first organization
        expect(screen.getByText('Test Organization')).toBeInTheDocument();
        expect(screen.getByText('A test organization')).toBeInTheDocument();
        expect(screen.getByText('Free Plan')).toBeInTheDocument();
        expect(screen.getByText('10 users max')).toBeInTheDocument();
        // Check second organization
        expect(screen.getByText('Pro Organization')).toBeInTheDocument();
        expect(screen.getByText('A pro organization')).toBeInTheDocument();
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
        expect(screen.getByText('100 users max')).toBeInTheDocument();
    });
    it('opens create organization modal when create button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        expect(screen.getByText('Create New Organization')).toBeInTheDocument();
        expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Website')).toBeInTheDocument();
    });
    it('handles organization creation form submission', async () => {
        const user = userEvent.setup();
        const mockCreate = jest.fn().mockResolvedValue({});
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onCreateOrganization: mockCreate }));
        // Open create modal
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        // Fill form
        const nameInput = screen.getByLabelText('Organization Name');
        const descriptionInput = screen.getByLabelText('Description');
        const websiteInput = screen.getByLabelText('Website');
        await user.type(nameInput, 'New Organization');
        await user.type(descriptionInput, 'A new test organization');
        await user.type(websiteInput, 'https://neworg.com');
        // Submit form
        const submitButton = screen.getByText('Create Organization', { selector: 'button' });
        await user.click(submitButton);
        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith({
                name: 'New Organization',
                description: 'A new test organization',
                website: 'https://neworg.com',
                plan: 'free',
            });
        });
    });
    it('validates required fields in create form', async () => {
        const user = userEvent.setup();
        const mockCreate = jest.fn();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onCreateOrganization: mockCreate }));
        // Open create modal
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        // Try to submit without required fields
        const submitButton = screen.getByText('Create Organization', { selector: 'button' });
        await user.click(submitButton);
        expect(screen.getByText('Organization name is required')).toBeInTheDocument();
        expect(mockCreate).not.toHaveBeenCalled();
    });
    it('opens edit modal when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        // Click edit button for first organization
        const editButtons = screen.getAllByTestId('edit-icon');
        await user.click(editButtons[0].closest('button'));
        expect(screen.getByText('Edit Organization')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
        expect(screen.getByDisplayValue('A test organization')).toBeInTheDocument();
    });
    it('handles organization update form submission', async () => {
        const user = userEvent.setup();
        const mockUpdate = jest.fn().mockResolvedValue({});
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onUpdateOrganization: mockUpdate }));
        // Open edit modal
        const editButtons = screen.getAllByTestId('edit-icon');
        await user.click(editButtons[0].closest('button'));
        // Update name
        const nameInput = screen.getByDisplayValue('Test Organization');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Organization');
        // Submit form
        const submitButton = screen.getByText('Update Organization');
        await user.click(submitButton);
        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('org-1', {
                name: 'Updated Organization',
                description: 'A test organization',
                website: 'https://test.com',
                plan: 'free',
            });
        });
    });
    it('shows confirmation dialog when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        // Click delete button for first organization
        const deleteButtons = screen.getAllByTestId('trash-icon');
        await user.click(deleteButtons[0].closest('button'));
        expect(screen.getByText('Delete Organization')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    it('handles organization deletion', async () => {
        const user = userEvent.setup();
        const mockDelete = jest.fn().mockResolvedValue({});
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onDeleteOrganization: mockDelete }));
        // Open delete confirmation
        const deleteButtons = screen.getAllByTestId('trash-icon');
        await user.click(deleteButtons[0].closest('button'));
        // Confirm deletion
        const confirmButton = screen.getByText('Delete');
        await user.click(confirmButton);
        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('org-1');
        });
    });
    it('displays organization statistics when stats button is clicked', async () => {
        const user = userEvent.setup();
        const mockViewStats = jest.fn().mockResolvedValue(mockStats);
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onViewStats: mockViewStats }));
        // Click stats button for first organization
        const statsButtons = screen.getAllByTestId('chart-icon');
        await user.click(statsButtons[0].closest('button'));
        await waitFor(() => {
            expect(mockViewStats).toHaveBeenCalledWith('org-1');
        });
    });
    it('displays loading state during operations', async () => {
        const user = userEvent.setup();
        const mockCreate = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onCreateOrganization: mockCreate }));
        // Open create modal and submit
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        const nameInput = screen.getByLabelText('Organization Name');
        await user.type(nameInput, 'New Organization');
        const submitButton = screen.getByText('Create Organization', { selector: 'button' });
        await user.click(submitButton);
        expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
    it('handles form cancellation', async () => {
        const user = userEvent.setup();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps }));
        // Open create modal
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        expect(screen.getByText('Create New Organization')).toBeInTheDocument();
        // Cancel form
        const cancelButton = screen.getByText('Cancel');
        await user.click(cancelButton);
        expect(screen.queryByText('Create New Organization')).not.toBeInTheDocument();
    });
    it('displays empty state when no organizations exist', () => {
        render(_jsx(OrganizationManager, { organizations: [], ...defaultProps }));
        expect(screen.getByText('No organizations found')).toBeInTheDocument();
        expect(screen.getByText('Create your first organization to get started')).toBeInTheDocument();
    });
    it('shows proper plan badges for different organization plans', () => {
        const orgsWithDifferentPlans = [
            { ...mockOrganizations[0], plan: 'free' },
            { ...mockOrganizations[1], plan: 'pro' },
            { ...mockOrganizations[0], id: 'org-3', plan: 'enterprise', name: 'Enterprise Org' },
        ];
        render(_jsx(OrganizationManager, { organizations: orgsWithDifferentPlans, ...defaultProps }));
        expect(screen.getByText('Free Plan')).toBeInTheDocument();
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
        expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });
    it('validates website URL format', async () => {
        const user = userEvent.setup();
        const mockCreate = jest.fn();
        render(_jsx(OrganizationManager, { organizations: mockOrganizations, ...defaultProps, onCreateOrganization: mockCreate }));
        // Open create modal
        const createButton = screen.getByText('Create Organization');
        await user.click(createButton);
        // Fill form with invalid URL
        const nameInput = screen.getByLabelText('Organization Name');
        const websiteInput = screen.getByLabelText('Website');
        await user.type(nameInput, 'New Organization');
        await user.type(websiteInput, 'invalid-url');
        // Submit form
        const submitButton = screen.getByText('Create Organization', { selector: 'button' });
        await user.click(submitButton);
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
        expect(mockCreate).not.toHaveBeenCalled();
    });
});
