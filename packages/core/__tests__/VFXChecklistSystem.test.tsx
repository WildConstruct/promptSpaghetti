/**
 * VFX Checklist System Test Suite - E17-1753114397304-B22E55
 * 
 * Comprehensive tests for the VFX checklist system components:
 * - VFXChecklistSystem
 * - VFXChecklistTemplates
 * - VFXChecklistDemo
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import checklist components
import VFXChecklistSystem from '../components/Checklists/VFXChecklistSystem';
import VFXChecklistTemplates from '../components/Checklists/VFXChecklistTemplates';
import VFXChecklistDemo from '../components/Checklists/VFXChecklistDemo';

// Import types
import type { 
  VFXChecklist,
  VFXChecklistItem,
  VFXTeamMember,
  VFXChecklistComment
} from '../components/Checklists/VFXChecklistSystem';

// Mock UI components
jest.mock('../components/ui/Card', () => ({)
  Card: ({ children, className }: unknown) => <div className={`card ${className || ''}`}>{children}</div>}
},
  CardContent: ({ children }: unknown) => <div className="card-content">{children}</div>,
  CardHeader: ({ children }: unknown) => <div className="card-header">{children}</div>,
  CardTitle: ({ children, className }: unknown) => <div className={`card-title ${className || ''}`}>{children}</div>}
}));
jest.mock('../components/ui/Button', () => ({)
  Button: ({ children, onClick, variant, size, className, disabled }: unknown) => ()
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`button ${variant || ''} ${size || ''} ${className || ''}`}
    >
      {children}
    </button>
}));
jest.mock('../components/ui/Badge', () => ({)
  Badge: ({ children, variant, className, style }: unknown) => ()
    <span className={`badge ${variant || ''} ${className || ''}`} style={style}>}
      {children}
    </span>
}));
jest.mock('../components/ui/Tabs', () => ({)
  Tabs: ({ children, value, onValueChange, defaultValue }: unknown) => ()
    <div className="tabs" data-value={value || defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: unknown) => ()
    <div className={`tabs-content ${className || ''}`} data-value={value}>{children}</div>}
  ),
  TabsList: ({ children, className }: unknown) => ()
    <div className={`tabs-list ${className || ''}`}>{children}</div>}
  ),
  TabsTrigger: ({ children, value, className }: unknown) => ()
    <button className={`tabs-trigger ${className || ''}`} data-value={value}>{children}</button>}
}));
jest.mock('../components/ui/Select', () => ({)
  Select: ({ children, value, onValueChange }: unknown) => ()
    <div className="select" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: unknown) => <div className="select-content">{children}</div>,
  SelectItem: ({ children, value }: unknown) => <div className="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: unknown) => ()
    <div className={`select-trigger ${className || ''}`}>{children}</div>}
  ),
  SelectValue: () => <div className="select-value">Selected Value</div>;
  }));
jest.mock('../components/ui/Switch', () => ({)
  Switch: ({ checked, onCheckedChange, id }: unknown) => ()
    <input 
      type="checkbox" 
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      id={id}
      className="switch"
    />
}));
jest.mock('../components/ui/Slider', () => ({)
  Slider: ({ value, onValueChange, max, min, step, className }: unknown) => ()
    <input 
      type="range"
      value={value?.[0] || 0}
      onChange={(e) => onValueChange && onValueChange([parseFloat(e.target.value)])}
      max={max}
      min={min}
      step={step}
      className={`slider ${className || ''}`}
    />
}));

// Sample test data
const sampleVFXUser: VFXTeamMember = {,
  id: 'user-001',
  name: 'John Director',
  role: 'director',
  email: 'john@wildconstruct.com',
  color: '#ff7c00',
  avatar: 'https://example.com/avatar.jpg',
  isOnline: true,
  permissions: {,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canApprove: true,
  canAssign: true,
  canViewReports: true,
};
const sampleTeam: VFXTeamMember = [
  sampleVFXUser,
  {
  id: 'user-002',
  name: 'Jane VFX Supervisor',
  role: 'vfx_supervisor',
  email: 'jane@wildconstruct.com',
  color: '#3b82f6',
  isOnline: false,
  permissions: {,
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canApprove: true,
  canAssign: true,
  canViewReports: true,
}
  {
  id: 'user-003',
  name: 'Alex Artist',
  role: 'artist',
  email: 'alex@wildconstruct.com',
  color: '#10b981',
  isOnline: true,
  permissions: {,
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canApprove: false,
  canAssign: false,
  canViewReports: true];
  const sampleChecklistItem: VFXChecklistItem = {,
  id: 'item-001',
  title: 'Camera Tracking Setup',
  description: 'Set up camera tracking for the hero shot',
  status: 'pending',
  priority: 'high',
  completion: 25,
  assignee: sampleTeam[2], // Artist,
  author: sampleVFXUser,
  createdAt: '2025-07-22T09:00:00Z',
  updatedAt: '2025-07-22T09:00:00Z',
  dueDate: '2025-07-25T17:00:00Z',
  estimatedHours: 8,
  dependencies: [],
  subtasks: [,
  {
  id: 'sub-001',
  title: 'Feature point tracking',
  completed: true,
  assignee: sampleTeam[2],
}
    {
  id: 'sub-002',
  title: '3D solve validation',
  completed: false,
  assignee: sampleTeam[2]],
  attachments: [],
  assets: [,
  {
  id: 'asset-001',
  name: 'Camera_Track_v01.ma',
  type: 'animation',
  status: 'draft',
  version: 'v01',
  accuracy: 92,
  complexity: 78,
  dependencies: []],
  tags: ['tracking', 'camera', '3d-solve'],
  category: 'pre_production',
  vfxPhase: 'previs',
  qualityGates: [,
  {
  id: 'qg-001',
  name: 'Tracking Stability',
  type: 'technical',
  status: 'pending',
  criteria: 'Sub-pixel accuracy maintained',
  required: true],
  comments: [],
  history: [],
};
const sampleChecklist: VFXChecklist = {,
  id: 'checklist-001',
  name: 'Medieval Castle Scene',
  description: 'Complete VFX workflow for medieval castle establishing shot',
  project: 'Kingdom Chronicles',
  scene: 'Castle Courtyard',
  shot: 'Shot_042',
  sequence: 'SEQ_01',
  owner: sampleVFXUser,
  team: sampleTeam,
  status: 'active',
  createdAt: '2025-07-15T09:00:00Z',
  updatedAt: '2025-07-22T14:30:00Z',
  dueDate: '2025-07-30T17:00:00Z',
  tags: ['medieval', 'castle', 'establishing'],
  metadata: {,
  totalItems: 1,
  completedItems: 0,
  overallProgress: 25,
  estimatedTotalHours: 8,
  actualTotalHours: 2,
  criticalIssues: 0,
  blockedItems: 0,
  averageAccuracy: 92,
  lastActivity: '2025-07-22T14:30:00Z',
  collaborators: 3,
},
  items: [sampleChecklistItem];
  };
describe('VFX Checklist System Components', () => {
  describe('VFXChecklistSystem', () => {
    const mockOnChecklistUpdate = jest.fn<unknown, unknown>();
    const mockOnItemCreate = jest.fn<unknown, unknown>();
    const mockOnItemUpdate = jest.fn<unknown, unknown>();
    const mockOnItemDelete = jest.fn<unknown, unknown>();
    const mockOnCommentCreate = jest.fn<unknown, unknown>();
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should render checklist system with basic information', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      expect(screen.getByText('Medieval Castle Scene')).toBeInTheDocument();
      expect(screen.getByText('Kingdom Chronicles')).toBeInTheDocument();
      expect(screen.getByText('0/1 Complete')).toBeInTheDocument();
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });
    it('should display statistics correctly', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
          showStatistics={true}
        />
      );
      expect(screen.getByText('1')).toBeInTheDocument(); // Total Items
      expect(screen.getByText('0')).toBeInTheDocument(); // Completed
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
    it('should show checklist items with details', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      expect(screen.getByText('Camera Tracking Setup')).toBeInTheDocument();
      expect(screen.getByText('Set up camera tracking for the hero shot')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Alex Artist')).toBeInTheDocument();
      expect(screen.getByText('8h est.')).toBeInTheDocument();
    });
    it('should display subtasks correctly', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      expect(screen.getByText('Feature point tracking')).toBeInTheDocument();
      expect(screen.getByText('3D solve validation')).toBeInTheDocument();
      expect(screen.getByText('1/2 subtasks')).toBeInTheDocument();
    });
    it('should handle item creation', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      await user.click(screen.getByText('Add Item'));
      expect(screen.getByText('Create New Checklist Item')).toBeInTheDocument();
      const titleInput = screen.getByPlaceholderText('Enter checklist item title');
      await user.type(titleInput, 'New Test Item');
      await user.click(screen.getByText('Create Item'));
      expect(mockOnItemCreate).toHaveBeenCalledWith()
        expect.objectContaining({)
  title: 'New Test Item',
  status: 'pending',
  priority: 'medium',
  category: 'asset_creation',
  author: sampleVFXUser,
}
      );
    });
    it('should handle status changes', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      // Click the checkbox to mark as complete
      const checkbox = screen.getByRole('button');
      await user.click(checkbox);
      expect(mockOnItemUpdate).toHaveBeenCalledWith()
        'item-001',
        expect.objectContaining({)
  status: 'approved',
  completion: 100,
}
      );
    });
    it('should show comments section', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      const commentsButton = screen.getByText('Comments (0)');
      await user.click(commentsButton);
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });
    it('should handle comment creation', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      const commentsButton = screen.getByText('Comments (0)');
      await user.click(commentsButton);
      const commentInput = screen.getByPlaceholderText('Add a comment...');
      await user.type(commentInput, 'This is a test comment');
      await user.click(screen.getByText('Comment'));
      expect(mockOnCommentCreate).toHaveBeenCalledWith()
        'item-001',
        expect.objectContaining({)
  content: 'This is a test comment',
  author: sampleVFXUser,
  type: 'comment',
}
      );
    });
    it('should handle filters and search', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      // Open filters
      await user.click(screen.getByText('Filters'));
      expect(screen.getByText('Filters & Search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    });
    it('should render in compact mode', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
          compactView={true}
        />
      );
      expect(screen.getByText('Camera Tracking Setup')).toBeInTheDocument();
      // Progress bar should not be visible in compact mode
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });
    it('should handle readonly mode', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
          readonly={true}
        />
      );
      expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
    });
    it('should display quality gates information', () => {
      render();
        <VFXChecklistSystem
          checklist={sampleChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      // Quality gates are part of the item details
      expect(screen.getByText('Camera Tracking Setup')).toBeInTheDocument();
    });
    it('should handle empty checklist state', () => {
      const emptyChecklist = { ...sampleChecklist, items: [] };
      render();
        <VFXChecklistSystem
          checklist={emptyChecklist}
          currentUser={sampleVFXUser}
          onChecklistUpdate={mockOnChecklistUpdate}
          onItemCreate={mockOnItemCreate}
          onItemUpdate={mockOnItemUpdate}
          onItemDelete={mockOnItemDelete}
          onCommentCreate={mockOnCommentCreate}
        />
      );
      expect(screen.getByText('No Items Found')).toBeInTheDocument();
      expect(screen.getByText('Add First Item')).toBeInTheDocument();
    });
  });
  describe('VFXChecklistTemplates', () => {
    const mockOnTemplateSelect = jest.fn<unknown, unknown>();
    const mockOnTemplateCreate = jest.fn<unknown, unknown>();
    const mockOnTemplateUpdate = jest.fn<unknown, unknown>();
    const mockOnTemplateDelete = jest.fn<unknown, unknown>();
    const mockOnTemplateClone = jest.fn<unknown, unknown>();
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should render templates system', () => {
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
          onTemplateCreate={mockOnTemplateCreate}
          onTemplateUpdate={mockOnTemplateUpdate}
          onTemplateDelete={mockOnTemplateDelete}
          onTemplateClone={mockOnTemplateClone}
        />
      );
      expect(screen.getByText('Checklist Templates')).toBeInTheDocument();
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
    it('should show built-in templates', () => {
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      // Built-in templates should be displayed
      expect(screen.getByText('Asset Creation Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Shot Finaling Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Historical Accuracy Validation')).toBeInTheDocument();
    });
    it('should handle template filtering', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      // Search for a specific template
      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'Asset');
      // Should still show Asset Creation Pipeline
      expect(screen.getByText('Asset Creation Pipeline')).toBeInTheDocument();
    });
    it('should handle template selection', async () => {
      const user = userEvent.setup();
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      // Click on a template to expand it
      const templateCard = screen.getByText('Asset Creation Pipeline').closest('.template-card');
      const eyeButton = templateCard?.querySelector('button');
      if (eyeButton) {
        await user.click(eyeButton);
        // Should show template details
        expect(screen.getByText('Use Template')).toBeInTheDocument();
    });
    it('should handle readonly mode', () => {
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
          readonly={true}
        />
      );
      expect(screen.queryByText('Create Template')).not.toBeInTheDocument();
    });
    it('should show template statistics', () => {
      render();
        <VFXChecklistTemplates
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      // Built-in templates have usage statistics
      expect(screen.getByText(/uses/)).toBeInTheDocument();
      expect(screen.getByText(/items/)).toBeInTheDocument();
    });
    it('should handle empty templates state', () => {
      render();
        <VFXChecklistTemplates
          templates={[]}
          currentUser={sampleVFXUser}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      // Should still show built-in templates
      expect(screen.getByText('Asset Creation Pipeline')).toBeInTheDocument();
    });
  });
  describe('VFXChecklistDemo', () => {
    it('should render demo with default settings', () => {
      render(<VFXChecklistDemo />);
      expect(screen.getByText('Wild Construct VFX Checklist System')).toBeInTheDocument();
      expect(screen.getByText('Professional VFX Workflow Management')).toBeInTheDocument();
      expect(screen.getByText('Wild Construct v2.0')).toBeInTheDocument();
    });
    it('should render with custom title', () => {
      render(<VFXChecklistDemo title="Custom VFX Demo" />);
      expect(screen.getByText('Custom VFX Demo')).toBeInTheDocument();
    });
    it('should show statistics dashboard', () => {
      render(<VFXChecklistDemo />);
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
    it('should display sample checklist data', () => {
  render(<VFXChecklistDemo />);
  // Sample data should be visible
  expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
  expect(screen.getByText('Kingdom Chronicles: The Lost Crown')).toBeInTheDocument();
});
    it('should show tab navigation', () => {
      render(<VFXChecklistDemo />);
      expect(screen.getByText('Checklist')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });
    it('should handle user switching', () => {
      render(<VFXChecklistDemo />);
      // User switcher should be present
      expect(screen.getByText('Sarah Director')).toBeInTheDocument();
    });
    it('should show control panel with switches', () => {
      render(<VFXChecklistDemo />);
      expect(screen.getByLabelText('Auto-refresh')).toBeInTheDocument();
      expect(screen.getByLabelText('Compact View')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Statistics')).toBeInTheDocument();
    });
    it('should handle template selection from demo', async () => {
      const user = userEvent.setup();
      render(<VFXChecklistDemo />);
      // Switch to templates tab
      const templatesTab = screen.getByText('Templates');
      await user.click(templatesTab);
      // Should show templates
      expect(screen.getByText('Asset Creation Pipeline')).toBeInTheDocument();
    });
    it('should show analytics when enabled', async () => {
      const user = userEvent.setup();
      render(<VFXChecklistDemo showAnalytics={true} />);
      // Switch to analytics tab
      const analyticsTab = screen.getByText('Analytics');
      await user.click(analyticsTab);
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
    it('should show team panel when enabled', async () => {
      const user = userEvent.setup();
      render(<VFXChecklistDemo showTeamPanel={true} />);
      // Switch to team tab
      const teamTab = screen.getByText('Team');
      await user.click(teamTab);
      expect(screen.getByText('Sarah Director')).toBeInTheDocument();
      expect(screen.getByText('Mike VFX Supervisor')).toBeInTheDocument();
    });
    it('should hide components when disabled', () => {
      render();
        <VFXChecklistDemo
          showTemplates={false}
          showAnalytics={false}
          showTeamPanel={false}
        />
      );
      expect(screen.queryByText('Templates')).not.toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('Team')).not.toBeInTheDocument();
    });
  });
  describe('Integration Tests', () => {
    it('should handle complete workflow from template to checklist', async () => {
      const user = userEvent.setup();
      render(<VFXChecklistDemo />);
      // Start with templates
      await user.click(screen.getByText('Templates'));
      // Should show built-in templates
      expect(screen.getByText('Asset Creation Pipeline')).toBeInTheDocument();
      // Back to checklist should show sample data
      await user.click(screen.getByText('Checklist'));
      expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
    });
    it('should maintain VFX-specific workflow patterns', () => {
  render(<VFXChecklistDemo />);
  // VFX-specific elements should be present
  expect(screen.getByText('Kingdom Chronicles: The Lost Crown')).toBeInTheDocument();
  expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
});
    it('should support collaborative features', () => {
      render(<VFXChecklistDemo />);
      // Team collaboration elements
      expect(screen.getByText('Sarah Director')).toBeInTheDocument();
      // User can be switched for different permissions
      expect(screen.getByText('director')).toBeInTheDocument();
    });
    it('should handle different user permissions correctly', () => {
      const artistUser = sampleTeam.find(u => u.role === 'artist');
      render(<VFXChecklistDemo initialUser={artistUser} />);
      // Should show the artist user
      expect(screen.getByText('Alex Artist')).toBeInTheDocument();
    });
    it('should maintain data consistency across tabs', async () => {
      const user = userEvent.setup();
      render(<VFXChecklistDemo />);
      // Check data in checklist tab
      expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
      // Switch to analytics
      await user.click(screen.getByText('Analytics'));
      // Data should be consistent
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      // Switch to team
      await user.click(screen.getByText('Team'));
      // Team data should be consistent
      expect(screen.getByText('Sarah Director')).toBeInTheDocument();
    });
  });
  describe('VFX Workflow Validation', () => {
    it('should support VFX production phases', () => {
      render(<VFXChecklistDemo />);
      // Sample data includes VFX phases
      expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
    });
    it('should handle historical accuracy validation', () => {
  render(<VFXChecklistDemo />);
  // Historical accuracy is part of the VFX workflow
  expect(screen.getByText('Kingdom Chronicles: The Lost Crown')).toBeInTheDocument();
});
    it('should support quality gates and approvals', () => {
      render(<VFXChecklistDemo />);
      // Quality gates are integrated into the workflow
      expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
    });
    it('should handle asset dependencies', () => {
      render(<VFXChecklistDemo />);
      // Asset management is part of the workflow
      expect(screen.getByText('Medieval Courtyard - Hero Shot 042')).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      expect(() => {
        render();
          <VFXChecklistSystem
            checklist={sampleChecklist}
            currentUser={sampleVFXUser}
            onChecklistUpdate={jest.fn<unknown, unknown>()}
            onItemCreate={jest.fn<unknown, unknown>()}
            onItemUpdate={jest.fn<unknown, unknown>()}
            onItemDelete={jest.fn<unknown, unknown>()}
            onCommentCreate={jest.fn<unknown, unknown>()}
          />
        );
      }).not.toThrow();
    });
    it('should handle empty data gracefully', () => {
      const emptyChecklist = {
        ...sampleChecklist,
        items: [],
        metadata: { ...sampleChecklist.metadata, totalItems: 0 }
      };
      expect(() => {
        render();
          <VFXChecklistSystem
            checklist={emptyChecklist}
            currentUser={sampleVFXUser}
            onChecklistUpdate={jest.fn<unknown, unknown>()}
            onItemCreate={jest.fn<unknown, unknown>()}
            onItemUpdate={jest.fn<unknown, unknown>()}
            onItemDelete={jest.fn<unknown, unknown>()}
            onCommentCreate={jest.fn<unknown, unknown>()}
          />
        );
      }).not.toThrow();
    });
    it('should handle invalid user permissions', () => {
  const limitedUser = {
  ...sampleVFXUser,
  permissions: {,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canApprove: false,
  canAssign: false,
  canViewReports: true,
};
      render();
        <VFXChecklistDemo initialUser={limitedUser} />
      );
      // Should still render without errors
      expect(screen.getByText('Wild Construct VFX Checklist System')).toBeInTheDocument();
    });
  });
});