// packages/core/__tests__/TemplateDialogs.test.tsx
// Epic 8.7 Task 6: Template Library - Component Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveTemplateDialog } from '../components/TemplateDialogs/SaveTemplateDialog';
import { TemplateBrowser } from '../components/TemplateDialogs/TemplateBrowser';
import { TemplateSaveData, Template } from '../types/TemplateTypes';

// Mock the template service
jest.mock('../services/TemplateService', () => ({)
  templateService: {,
    searchTemplates: jest.fn<unknown[], unknown>(),
    instantiateTemplate: jest.fn<unknown[], unknown>(),
    deleteTemplate: jest.fn<unknown[], unknown>()
  }
}));
describe('SaveTemplateDialog', () => {
  const mockOnSave = jest.fn<unknown[], unknown>();
  const mockOnClose = jest.fn<unknown[], unknown>();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render when open', () => {
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText('Save Template')).toBeInTheDocument();
    expect(screen.getByLabelText(/Template Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
  });
  it('should not render when closed', () => {
    render()
      <SaveTemplateDialog
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.queryByText('Save Template')).not.toBeInTheDocument();
  });
  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const categorySelect = screen.getByLabelText(/Category/);
    await user.type(nameInput, 'My Test Template');
    await user.type(descriptionInput, 'A template for testing');
    await user.selectOptions(categorySelect, 'character');
    expect(nameInput).toHaveValue('My Test Template');
    expect(descriptionInput).toHaveValue('A template for testing');
    expect(categorySelect).toHaveValue('character');
  });
  it('should handle tag addition', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const tagInput = screen.getByPlaceholderText('Add tags (press Enter)');
    const addButton = screen.getByText('Add');
    await user.type(tagInput, 'test-tag');
    await user.click(addButton);
    expect(screen.getByText('test-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });
  it('should handle tag addition with Enter key', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const tagInput = screen.getByPlaceholderText('Add tags (press Enter)');
    await user.type(tagInput, 'enter-tag{enter}');
    expect(screen.getByText('enter-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });
  it('should handle tag removal', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const tagInput = screen.getByPlaceholderText('Add tags (press Enter)');
    await user.type(tagInput, 'removable-tag{enter}');
    const removeButton = screen.getByText('×');
    await user.click(removeButton);
    expect(screen.queryByText('removable-tag')).not.toBeInTheDocument();
  });
  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const saveButton = screen.getByText('Save Template');
    await user.click(saveButton);
    expect(screen.getByText('Template name is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  it('should validate name length', async () => {
    const user = userEvent.setup();
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const saveButton = screen.getByText('Save Template');
    await user.type(nameInput, 'ab'); // Too short
    await user.type(descriptionInput, 'Valid description');
    await user.click(saveButton);
    expect(screen.getByText('Template name must be at least 3 characters')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  it('should call onSave with correct data', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue({ success: true } as unknown as unknown);
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const categorySelect = screen.getByLabelText(/Category/);
    const tagInput = screen.getByPlaceholderText('Add tags (press Enter)');
    const publicCheckbox = screen.getByLabelText(/Make template public/);
    const annotationsCheckbox = screen.getByLabelText(/Include annotations/);
    const saveButton = screen.getByText('Save Template');
    await user.type(nameInput, 'Complete Template');
    await user.type(descriptionInput, 'A complete test template');
    await user.selectOptions(categorySelect, 'narrative');
    await user.type(tagInput, 'complete{enter}test{enter}');
    await user.click(publicCheckbox);
    await user.click(annotationsCheckbox); // Uncheck it
    await user.click(saveButton);
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({)
        name: 'Complete Template',
        description: 'A complete test template',
        category: 'narrative',
        tags: ['complete', 'test'],
        isPublic: true,
        includeAnnotations: false,
      });
    });
  });
  it('should handle save errors', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue({ success: false, error: 'Save failed' } as unknown as unknown);
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const saveButton = screen.getByText('Save Template');
    await user.type(nameInput, 'Error Template');
    await user.type(descriptionInput, 'This will fail');
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });
  it('should disable form during save', async () => {
    const user = userEvent.setup();
    mockOnSave.mockImplementation(() => new Promise(() => {})); // Never resolves
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const saveButton = screen.getByText('Save Template');
    await user.type(nameInput, 'Loading Template');
    await user.type(descriptionInput, 'This will show loading');
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
    // Form should be disabled
    expect(nameInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });
  it('should close dialog on successful save', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue({ success: true } as unknown as unknown);
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const saveButton = screen.getByText('Save Template');
    await user.type(nameInput, 'Success Template');
    await user.type(descriptionInput, 'This will succeed');
    await user.click(saveButton);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  it('should reset form on successful save', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue({ success: true } as unknown as unknown);
    const { rerender } = render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    const nameInput = screen.getByLabelText(/Template Name/);
    await user.type(nameInput, 'Reset Test');
    const saveButton = screen.getByText('Save Template');
    await user.click(saveButton);
    // Wait for save to complete, then reopen dialog
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    rerender()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    // Form should be reset
    expect(screen.getByLabelText(/Template Name/)).toHaveValue('');
  });
  it('should populate initial data', () => {
    const initialData: Partial<TemplateSaveData> = {
      name: 'Pre-filled Template',
      description: 'Pre-filled description',
      category: 'character',
      tags: ['pre-filled', 'test'],
      isPublic: true,
      includeAnnotations: false,
    };
    render()
      <SaveTemplateDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialData={initialData}
      />
    );
    expect(screen.getByLabelText(/Template Name/)).toHaveValue('Pre-filled Template');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Pre-filled description');
    expect(screen.getByLabelText(/Category/)).toHaveValue('character');
    expect(screen.getByText('pre-filled')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByLabelText(/Make template public/)).toBeChecked();
    expect(screen.getByLabelText(/Include annotations/)).not.toBeChecked();
  });
});
describe('TemplateBrowser', () => {
  const mockOnClose = jest.fn<unknown[], unknown>();
  const mockOnApplyTemplate = jest.fn<unknown[], unknown>();
  const sampleTemplates: Template[] = [
    {
      id: 'template-1',
      name: 'Character Generator',
      description: 'Generates fantasy characters',
      category: 'character',
      version: '1.0.0',
      author: 'author1',
      rating: 4.5,
      reviews: [,
        {
          id: 'review-1',
          author: 'user1',
          rating: 5,
          comment: 'Great template!',
          timestamp: '2023-01-01T00:00:00.000Z',
          helpful: 3,
        }
      ],
      graph: {,
        nodes: [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        edges: [],
        annotations: {,
          stickyNotes: [],
          nodeLabels: {},
          regionGroups: [],
          connectionLabels: {},
          metadata: {,
            author: 'test',
            created: '2023-01-01',
            modified: '2023-01-01',
            version: '1.0.0',
          }
        }
      },
      metadata: {,
        created: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
        usageCount: 10,
        tags: ['fantasy', 'rpg'],
        complexity: 'simple',
        nodeCount: 1,
        estimatedOutputLength: 100,
        isPublic: true,
        language: 'en',
      }
    },
    {
      id: 'template-2',
      name: 'Setting Builder',
      description: 'Creates detailed settings',
      category: 'setting',
      version: '1.0.0',
      author: 'author2',
      rating: 3.8,
      reviews: [],
      graph: {,
        nodes: [,
          { id: 'n1', type: 'WeightedChoice', position: { x: 0, y: 0 }, data: {} },
          { id: 'n2', type: 'Output', position: { x: 100, y: 0 }, data: {} }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2', type: 'step' }],
        annotations: {,
          stickyNotes: [],
          nodeLabels: {},
          regionGroups: [],
          connectionLabels: {},
          metadata: {,
            author: 'test',
            created: '2023-01-01',
            modified: '2023-01-01',
            version: '1.0.0',
          }
        }
      },
      metadata: {,
        created: '2023-01-02T00:00:00.000Z',
        lastModified: '2023-01-02T00:00:00.000Z',
        usageCount: 5,
        tags: ['worldbuilding'],
        complexity: 'medium',
        nodeCount: 2,
        estimatedOutputLength: 200,
        isPublic: true,
        language: 'en',
      }
    }
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    const { templateService } = require('../services/TemplateService');
    templateService.searchTemplates.mockResolvedValue(sampleTemplates as unknown as unknown);
  });
  it('should render when open', async () => {
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    expect(screen.getByText('Template Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
      expect(screen.getByText('Setting Builder')).toBeInTheDocument();
    });
  });
  it('should not render when closed', () => {
    render()
      <TemplateBrowser
        isOpen={false}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    expect(screen.queryByText('Template Library')).not.toBeInTheDocument();
  });
  it('should handle search', async () => {
    const user = userEvent.setup();
    const { templateService } = require('../services/TemplateService');
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'character');
    await waitFor(() => {
      expect(templateService.searchTemplates).toHaveBeenCalledWith()
        expect.objectContaining({)
          searchTerm: 'character',
        })
      );
    });
  });
  it('should handle category filter', async () => {
    const user = userEvent.setup();
    const { templateService } = require('../services/TemplateService');
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    const categorySelect = screen.getByLabelText(/Category/);
    await user.selectOptions(categorySelect, 'character');
    await waitFor(() => {
      expect(templateService.searchTemplates).toHaveBeenCalledWith()
        expect.objectContaining({)
          category: 'character',
        })
      );
    });
  });
  it('should handle sort options', async () => {
    const user = userEvent.setup();
    const { templateService } = require('../services/TemplateService');
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    const sortSelect = screen.getByLabelText(/Sort By/);
    await user.selectOptions(sortSelect, 'rating');
    await waitFor(() => {
      expect(templateService.searchTemplates).toHaveBeenCalledWith()
        expect.objectContaining({)
          sortBy: 'rating',
        })
      );
    });
  });
  it('should show loading state', () => {
    const { templateService } = require('../services/TemplateService');
    templateService.searchTemplates.mockImplementation(() => new Promise(() => {})); // Never resolves
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });
  it('should show empty state', async () => {
    const { templateService } = require('../services/TemplateService');
    templateService.searchTemplates.mockResolvedValue([] as unknown as unknown);
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('No templates found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or create a new template')).toBeInTheDocument();
    });
  });
  it('should handle template application', async () => {
    const user = userEvent.setup();
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
    });
    const applyButtons = screen.getAllByText('Apply Template');
    await user.click(applyButtons[0]);
    expect(mockOnApplyTemplate).toHaveBeenCalledWith()
      'template-1',
      expect.objectContaining({)
        preservePositions: false,
        mergeWithCurrent: false,
        offsetX: 100,
        offsetY: 100,
      })
    );
  });
  it('should handle instantiation options', async () => {
    const user = userEvent.setup();
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
    });
    // Change instantiation options
    const preservePositionsCheckbox = screen.getByLabelText('Preserve positions');
    const mergeWithCurrentCheckbox = screen.getByLabelText('Merge with current');
    await user.click(preservePositionsCheckbox);
    await user.click(mergeWithCurrentCheckbox);
    const applyButtons = screen.getAllByText('Apply Template');
    await user.click(applyButtons[0]);
    expect(mockOnApplyTemplate).toHaveBeenCalledWith()
      'template-1',
      expect.objectContaining({)
        preservePositions: true,
        mergeWithCurrent: true,
      })
    );
  });
  it('should handle view mode switch', async () => {
    const user = userEvent.setup();
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
    });
    // Switch to list view
    const listButton = screen.getByText('List');
    await user.click(listButton);
    // Should still show templates but in different layout
    expect(screen.getByText('Character Generator')).toBeInTheDocument();
    expect(screen.getByText('Setting Builder')).toBeInTheDocument();
  });
  it('should handle template preview', async () => {
    const user = userEvent.setup();
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
    });
    // Click on template card to open preview
    const templateCard = screen.getByText('Character Generator').closest('div');
    await user.click(templateCard!);
    // Preview modal should open
    await waitFor(() => {
      expect(screen.getByText('Generates fantasy characters')).toBeInTheDocument();
      expect(screen.getByText('author1')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });
  it('should handle template deletion for owned templates', async () => {
    const user = userEvent.setup();
    const { templateService } = require('../services/TemplateService');
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
        currentAuthor="author1"
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Character Generator')).toBeInTheDocument();
    });
    // Find delete button (should only appear for templates by current author)
    const deleteButton = screen.getByTitle('Delete template');
    // Mock window.confirm
    window.confirm = jest.fn<unknown[], unknown>().mockReturnValue(true as unknown as unknown);
    await user.click(deleteButton);
    expect(window.confirm).toHaveBeenCalledWith()
      'Are you sure you want to delete this template? This action cannot be undone.'
    );
    expect(templateService.deleteTemplate).toHaveBeenCalledWith('template-1');
  });
  it('should handle error states', async () => {
    const { templateService } = require('../services/TemplateService');
    templateService.searchTemplates.mockRejectedValue(new Error('Network error'));
    render()
      <TemplateBrowser
        isOpen={true}
        onClose={mockOnClose}
        onApplyTemplate={mockOnApplyTemplate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});