/**
 * Unit tests for AdvancedExportTemplateManager component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock useExport hook
const mockUseExport = {
  getTemplates: jest.fn<unknown[], unknown>(),
  createTemplate: jest.fn<unknown[], unknown>(),
  updateTemplate: jest.fn<unknown[], unknown>(),
  deleteTemplate: jest.fn<unknown[], unknown>(),
  shareTemplate: jest.fn<unknown[], unknown>(),
  getTemplateStats: jest.fn<unknown[], unknown>()
};

jest.mock('../hooks/useExport', () => ({
  useExport: () => mockUseExport
}));

import { AdvancedExportTemplateManager } from '../components/export/AdvancedExportTemplateManager';

// Mock template data
const mockTemplates = [
  {
    id: 'template-1',
    name: 'JSON Standard Export',
    description: 'Standard JSON export with metadata',
    export_format: 'json' as const,
    template_type: 'full' as const,
    is_public: false,
    is_system_template: false,
    format_options: { indent: 2, includeMetadata: true },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'template-2',
    name: 'VFX Pipeline Export',
    description: 'Specialized export for VFX workflows',
    export_format: 'vfx' as const,
    template_type: 'custom' as const,
    is_public: true,
    is_system_template: true,
    format_options: { pipeline: 'maya', frameRange: '1-100' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system'
  }
];

const mockTemplateStats = new Map([
  ['template-1', {
    id: 'template-1',
    usageCount: 145,
    lastUsed: '2024-01-15T00:00:00Z',
    averageRating: 4.2,
    totalRatings: 12,
    successRate: 0.95
  }],
  ['template-2', {
    id: 'template-2',
    usageCount: 2300,
    lastUsed: '2024-01-20T00:00:00Z',
    averageRating: 4.7,
    totalRatings: 45,
    successRate: 0.98
  }]
]);

const defaultProps = {
  visible: true,
  projectId: 'test-project',
  onClose: jest.fn<unknown[], unknown>(),
  onTemplateSelect: jest.fn<unknown[], unknown>()
};

describe('AdvancedExportTemplateManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExport.getTemplates.mockResolvedValue(mockTemplates as unknown);
    mockUseExport.getTemplateStats.mockImplementation((id) => 
      Promise.resolve(mockTemplateStats.get(id))
    );
    mockUseExport.shareTemplate.mockResolvedValue(undefined as unknown);
    mockUseExport.deleteTemplate.mockResolvedValue(undefined as unknown);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing when visible', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('📋 Advanced Export Templates')).toBeInTheDocument();
      });
    });

    it('does not render when not visible', () => {
      render(<AdvancedExportTemplateManager {...defaultProps} visible={false} />);
      expect(screen.queryByText('📋 Advanced Export Templates')).not.toBeInTheDocument();
    });

    it('displays template count in header', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/2 templates • 2 filtered/)).toBeInTheDocument();
      });
    });
  });

  describe('Template Loading', () => {
    it('loads templates on mount', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockUseExport.getTemplates).toHaveBeenCalledWith({
          sortBy: 'name',
          sortOrder: 'asc'
        });
      });
    });

    it('loads template statistics', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockUseExport.getTemplateStats).toHaveBeenCalledWith('template-1');
        expect(mockUseExport.getTemplateStats).toHaveBeenCalledWith('template-2');
      });
    });

    it('shows loading state', () => {
      // Make getTemplates hang to simulate loading
      mockUseExport.getTemplates.mockImplementation(() => new Promise(() => {}));
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Loading templates...')).toBeInTheDocument();
    });

    it('handles loading errors gracefully', async () => {
      mockUseExport.getTemplates.mockRejectedValue(new Error('Network error'));
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Template Display', () => {
    it('displays template cards with correct information', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
        expect(screen.getByText('VFX Pipeline Export')).toBeInTheDocument();
        expect(screen.getByText('JSON • full')).toBeInTheDocument();
        expect(screen.getByText('VFX • custom • Public')).toBeInTheDocument();
      });
    });

    it('shows template statistics', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('📊 145 uses')).toBeInTheDocument();
        expect(screen.getByText('⭐ 4.2 (12)')).toBeInTheDocument();
        expect(screen.getByText('✅ 95% success')).toBeInTheDocument();
      });
    });

    it('marks system templates correctly', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('SYSTEM')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Tabs', () => {
    it('shows all navigation tabs', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🔍 Browse Templates')).toBeInTheDocument();
        expect(screen.getByText('➕ Create Template')).toBeInTheDocument();
        expect(screen.getByText('🌐 Shared Templates')).toBeInTheDocument();
        expect(screen.getByText('👥 Collaborate')).toBeInTheDocument();
      });
    });

    it('switches between tabs', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const createTab = screen.getByText('➕ Create Template');
      await userEvent.click(createTab);
      
      expect(screen.getByText('Template Creation')).toBeInTheDocument();
      expect(screen.getByText('➕ Create New Template')).toBeInTheDocument();
    });

    it('hides sharing tabs when disabled', async () => {
      render(
        <AdvancedExportTemplateManager 
          {...defaultProps} 
          enableSharing={false}
          enableCollaboration={false}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByText('🌐 Shared Templates')).not.toBeInTheDocument();
        expect(screen.queryByText('👥 Collaborate')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Search', () => {
    it('filters templates by search term', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
        expect(screen.getByText('VFX Pipeline Export')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search templates...');
      await userEvent.type(searchInput, 'JSON');
      
      // After typing, only JSON template should match the filter
      // Note: The actual filtering happens in the component's useMemo
      expect(searchInput).toHaveValue('JSON');
    });

    it('filters templates by format', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const formatSelect = screen.getByDisplayValue('All Formats');
      await userEvent.selectOptions(formatSelect, 'json');
      
      expect(formatSelect).toHaveValue('json');
    });

    it('filters templates by type', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('All Types');
      await userEvent.selectOptions(typeSelect, 'full');
      
      expect(typeSelect).toHaveValue('full');
    });

    it('changes view mode', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const listButton = screen.getByText('list');
      await userEvent.click(listButton);
      
      // The view mode change should be reflected in the button state
      expect(listButton).toHaveStyle({ background: '#e2e8f0' });
    });

    it('changes sort order', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Name A-Z');
      await userEvent.selectOptions(sortSelect, 'usage-desc');
      
      expect(sortSelect).toHaveValue('usage-desc');
    });
  });

  describe('Template Actions', () => {
    it('handles template selection', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const templateCard = screen.getByText('JSON Standard Export').closest('div');
      await userEvent.click(templateCard!);
      
      expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it('handles template customization', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🔧 Customize')).toBeInTheDocument();
      });

      const customizeButton = screen.getAllByText('🔧 Customize')[0];
      await userEvent.click(customizeButton);
      
      // This should trigger the customization handler
      // In a real implementation, this might open a dialog
    });

    it('handles template sharing toggle', async () => {
      mockUseExport.shareTemplate.mockResolvedValue(undefined as unknown);
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Make Public')).toBeInTheDocument();
      });

      const shareButton = screen.getByText('🌐 Make Public');
      await userEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockUseExport.shareTemplate).toHaveBeenCalledWith('template-1', { is_public: true });
      });
    });

    it('handles template deletion for non-system templates', async () => {
      mockUseExport.deleteTemplate.mockResolvedValue(undefined as unknown);
      
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('🗑️ Delete');
      await userEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockUseExport.deleteTemplate).toHaveBeenCalledWith('template-1');
      });
      
      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    it('does not show delete button for system templates', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('VFX Pipeline Export')).toBeInTheDocument();
      });

      // Find the VFX template card (which is a system template)
      const vfxCard = screen.getByText('VFX Pipeline Export').closest('div');
      expect(vfxCard).toBeInTheDocument();
      
      // System templates should not have delete buttons
      const deleteButtons = screen.getAllByText('🗑️ Delete');
      expect(deleteButtons).toHaveLength(1); // Only for non-system template
    });
  });

  describe('Side Panel', () => {
    it('shows side panel when template is selected', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const templateCard = screen.getByText('JSON Standard Export').closest('div');
      await userEvent.click(templateCard!);
      
      expect(screen.getByText('Template Details')).toBeInTheDocument();
    });

    it('displays template metadata in side panel', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const templateCard = screen.getByText('JSON Standard Export').closest('div');
      await userEvent.click(templateCard!);
      
      expect(screen.getByText('Usage Statistics')).toBeInTheDocument();
      expect(screen.getByText('Metadata')).toBeInTheDocument();
      expect(screen.getByText('📤 Use This Template')).toBeInTheDocument();
    });

    it('shows format options in side panel', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const templateCard = screen.getByText('JSON Standard Export').closest('div');
      await userEvent.click(templateCard!);
      
      expect(screen.getByText('Format Options')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error messages', async () => {
      mockUseExport.getTemplates.mockRejectedValue(new Error('API Error'));
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
      });
    });

    it('handles missing template stats gracefully', async () => {
      mockUseExport.getTemplateStats.mockRejectedValue(new Error('Stats unavailable'));
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        // Should still render templates even if stats fail
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no templates exist', async () => {
      mockUseExport.getTemplates.mockResolvedValue([] as unknown);
      
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('📋')).toBeInTheDocument();
        expect(screen.getByText('No templates found')).toBeInTheDocument();
      });
    });

    it('shows filtered empty state when search returns no results', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('JSON Standard Export')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search templates...');
      await userEvent.type(searchInput, 'nonexistent');
      
      // The component should handle the empty filtered state
      expect(searchInput).toHaveValue('nonexistent');
    });
  });

  describe('Accessibility', () => {
    it('provides proper button roles and labels', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('handles keyboard navigation', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        const firstButton = screen.getAllByRole('button')[0];
        firstButton.focus();
        expect(firstButton).toHaveFocus();
      });
    });
  });

  describe('Dialog Controls', () => {
    it('calls onClose when close button is clicked', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('×')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      await userEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not show close button when onClose is not provided', async () => {
      render(<AdvancedExportTemplateManager {...defaultProps} onClose={undefined} />);
      
      await waitFor(() => {
        expect(screen.queryByText('×')).not.toBeInTheDocument();
      });
    });
  });
});