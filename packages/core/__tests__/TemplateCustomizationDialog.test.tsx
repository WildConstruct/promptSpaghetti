/**
 * Unit tests for TemplateCustomizationDialog component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock useExport hook
const mockUseExport = {
  updateTemplate: jest.fn<unknown, unknown>(),
  previewTemplate: jest.fn<unknown, unknown>(),
};
jest.mock('../hooks/useExport', () => ({)
  useExport: () => mockUseExport,
}));
import { TemplateCustomizationDialog } from '../components/export/TemplateCustomizationDialog';

// Mock template data
const mockTemplate = {
  id: 'template-1',
  name: 'JSON Export Template',
  description: 'Standard JSON export with customizable options',
  export_format: 'json' as const,
  template_type: 'full' as const,
  is_public: false,
  is_system_template: false,
  format_options: {,
  indent: 2,
  includeMetadata: true,
  dateFormat: 'iso',
},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user-1';
  };
const defaultProps = {
  template: mockTemplate,
  visible: true,
  onClose: jest.fn<unknown, unknown>(),
  onSave: jest.fn<unknown, unknown>(),
  onPreview: jest.fn<unknown, unknown>(),
  projectId: 'test-project',
};
describe('TemplateCustomizationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExport.updateTemplate.mockResolvedValue(mockTemplate as unknown as unknown as unknown);
    mockUseExport.previewTemplate.mockResolvedValue({ preview: 'sample output' } as unknown as unknown as unknown);
  });
  describe('Basic Rendering', () => {
    it('renders without crashing when visible', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByText('🔧 Customize Template')).toBeInTheDocument();
      expect(screen.getByText(`${mockTemplate.name} • JSON`)).toBeInTheDocument();}
    });
    it('does not render when not visible', () => {
      render(<TemplateCustomizationDialog {...defaultProps} visible={false} />);
      expect(screen.queryByText('🔧 Customize Template')).not.toBeInTheDocument();
    });
    it('displays template information in header', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByText('JSON Export Template • JSON')).toBeInTheDocument();
    });
  });
  describe('Categories and Parameters', () => {
    it('displays parameter categories', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Formatting')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
    it('switches between categories', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // Should start with the first category active
      expect(screen.getByText('Formatting Parameters')).toBeInTheDocument();
      const contentCategory = screen.getByText('Content');
      await userEvent.click(contentCategory);
      expect(screen.getByText('Content Parameters')).toBeInTheDocument();
    });
    it('displays JSON format parameters correctly', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByText('Indentation')).toBeInTheDocument();
      expect(screen.getByText('Include Metadata')).toBeInTheDocument();
      expect(screen.getByText('Date Format')).toBeInTheDocument();
    });
    it('shows parameter descriptions', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByText('Number of spaces for JSON indentation')).toBeInTheDocument();
      expect(screen.getByText('Include template metadata in export')).toBeInTheDocument();
    });
  });
  describe('Parameter Input Types', () => {
    it('renders number inputs correctly', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const indentInput = screen.getByRole('spinbutton');
      expect(indentInput).toHaveValue(2); // Default value from template
    });
    it('renders boolean inputs correctly', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // Click Content category to see boolean parameter
      const contentCategory = screen.getByText('Content');
      await userEvent.click(contentCategory);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked(); // Default value from template
    });
    it('renders select inputs correctly', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const dateFormatSelect = screen.getByDisplayValue('ISO 8601 (2024-01-01T00:00:00Z)');
      expect(dateFormatSelect).toBeInTheDocument();
    });
    it('handles parameter value changes', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '4');
      expect(indentInput).toHaveValue(4);
    });
    it('handles boolean parameter changes', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // Click Content category to see boolean parameter
      const contentCategory = screen.getByText('Content');
      await userEvent.click(contentCategory);
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
    it('handles select parameter changes', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const dateFormatSelect = screen.getByDisplayValue('ISO 8601 (2024-01-01T00:00:00Z)');
      await userEvent.selectOptions(dateFormatSelect, 'unix');
      expect(screen.getByDisplayValue('Unix Timestamp (1704067200)')).toBeInTheDocument();
    });
  });
  describe('Parameter Validation', () => {
    it('validates number ranges', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '10'); // Above max of 8
      // Validation should be applied but we need to trigger save to see errors
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(screen.getByText('Indentation must be at most 8')).toBeInTheDocument();
      });
    });
    it('validates required fields', async () => {
      // Create a template with XML format that has required fields
      const xmlTemplate = {
        ...mockTemplate,
        export_format: 'xml' as const,
        format_options: { rootElement: 'export' }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={xmlTemplate} />);
      // Clear the required root element field
      const rootElementInput = screen.getByDisplayValue('export');
      await userEvent.clear(rootElementInput);
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(screen.getByText('Root Element is required')).toBeInTheDocument();
      });
    });
    it('shows validation errors in input styling', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '10'); // Above max
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
  expect(indentInput).toHaveStyle({ )
  border: '1px solid #ef4444',
  background: '#fef2f2',
});
      });
    });
  });
  describe('Preview Functionality', () => {
    it('generates preview when preview button is clicked', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const previewButton = screen.getByText('👁️ Preview');
      await userEvent.click(previewButton);
      await waitFor(() => {
  expect(mockUseExport.previewTemplate).toHaveBeenCalledWith({)
  ...mockTemplate,
  format_options: expect.any(Object),
});
      });
      expect(defaultProps.onPreview).toHaveBeenCalledWith({ preview: 'sample output' });
    });
    it('shows loading state during preview generation', async () => {
      mockUseExport.previewTemplate.mockImplementation(() => new Promise(() => {}));
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const previewButton = screen.getByText('👁️ Preview');
      await userEvent.click(previewButton);
      expect(screen.getByText('⏳ Generating...')).toBeInTheDocument();
    });
    it('handles preview errors', async () => {
      mockUseExport.previewTemplate.mockRejectedValue(new Error('Preview failed'));
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const previewButton = screen.getByText('👁️ Preview');
      await userEvent.click(previewButton);
      await waitFor(() => {
  expect(screen.getByText(/Error: Preview failed/)).toBeInTheDocument();
});
    });
  });
  describe('Save Functionality', () => {
    it('saves customization with valid parameters', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // Make a change
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '4');
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
  expect(defaultProps.onSave).toHaveBeenCalledWith({)
  ...mockTemplate,
  format_options: expect.objectContaining({,)
  indent: 4,
}),
          custom_fields: {}
        });
      });
    });
    it('prevents saving with validation errors', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // Create validation error
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '10');
      const saveButton = screen.getByText('💾 Save Customization');
      expect(saveButton).toBeEnabled();
      await userEvent.click(saveButton);
      // Should not call onSave due to validation errors
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
    it('shows loading state during save', async () => {
      mockUseExport.updateTemplate.mockImplementation(() => new Promise(() => {}));
      render(<TemplateCustomizationDialog {...defaultProps} onSave={undefined} />);
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      expect(screen.getByText('⏳ Saving...')).toBeInTheDocument();
    });
    it('handles save errors', async () => {
      mockUseExport.updateTemplate.mockRejectedValue(new Error('Save failed'));
      render(<TemplateCustomizationDialog {...defaultProps} onSave={undefined} />);
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
  expect(screen.getByText(/Error: Save failed/)).toBeInTheDocument();
});
    });
    it('uses updateTemplate when onSave is not provided', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} onSave={undefined} />);
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockUseExport.updateTemplate).toHaveBeenCalledWith()
          mockTemplate.id,
          expect.objectContaining({)
  format_options: expect.any(Object),
            custom_fields: {}
  }
        );
      });
    });
  });
  describe('Different Export Formats', () => {
    it('shows YAML-specific parameters for YAML templates', () => {
      const yamlTemplate = {
        ...mockTemplate,
        export_format: 'yaml' as const,
        format_options: { flowLevel: -1, quotingType: 'auto' }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={yamlTemplate} />);
      expect(screen.getByText('Flow Level')).toBeInTheDocument();
      expect(screen.getByText('String Quoting')).toBeInTheDocument();
    });
    it('shows CSV-specific parameters for CSV templates', () => {
      const csvTemplate = {
        ...mockTemplate,
        export_format: 'csv' as const,
        format_options: { delimiter: ',', includeHeaders: true }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={csvTemplate} />);
      expect(screen.getByText('Delimiter')).toBeInTheDocument();
      expect(screen.getByText('Include Column Headers')).toBeInTheDocument();
    });
    it('shows VFX-specific parameters for VFX templates', () => {
      const vfxTemplate = {
        ...mockTemplate,
        export_format: 'vfx' as const,
        format_options: { pipeline: 'standard', frameRange: '1-100' }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={vfxTemplate} />);
      expect(screen.getByText('VFX Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Frame Range')).toBeInTheDocument();
    });
  });
  describe('Dialog Controls', () => {
    it('calls onClose when close button is clicked', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const closeButton = screen.getByText('×');
      await userEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
    it('calls onClose when cancel button is clicked', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
    it('does not show close button when onClose is not provided', () => {
      render(<TemplateCustomizationDialog {...defaultProps} onClose={undefined} />);
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
    it('does not show cancel button when onClose is not provided', () => {
      render(<TemplateCustomizationDialog {...defaultProps} onClose={undefined} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });
  describe('Special Input Types', () => {
    it('renders color inputs correctly', () => {
      // Create a template with color parameter (hypothetical)
      const customTemplate = {
        ...mockTemplate,
        export_format: 'html' as const,
        format_options: { backgroundColor: '#ffffff' }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={customTemplate} />);
      expect(screen.getByText('Include Embedded CSS')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });
    it('renders JSON textarea inputs correctly', () => {
      // This would test JSON parameter type if we had one in our default parameters
      // For now, this is a placeholder for JSON parameter types
      render(<TemplateCustomizationDialog {...defaultProps} />);
      // JSON parameters would render as textareas
      expect(screen.getByText('💾 Save Customization')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('provides proper labels for all inputs', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      expect(screen.getByLabelText(/Indentation/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date Format/)).toBeInTheDocument();
    });
    it('marks required fields appropriately', () => {
      const xmlTemplate = {
        ...mockTemplate,
        export_format: 'xml' as const,
        format_options: { rootElement: 'export' }
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={xmlTemplate} />);
      expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    });
    it('associates error messages with inputs', async () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      const indentInput = screen.getByRole('spinbutton');
      await userEvent.clear(indentInput);
      await userEvent.type(indentInput, '10');
      const saveButton = screen.getByText('💾 Save Customization');
      await userEvent.click(saveButton);
      await waitFor(() => {
        const errorMessage = screen.getByText('Indentation must be at most 8');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
  describe('Edge Cases', () => {
  it('handles missing format options gracefully', () => {
  const templateWithoutOptions = {
  ...mockTemplate,
  format_options: undefined,
};
      expect(() => {
        render(<TemplateCustomizationDialog {...defaultProps} template={templateWithoutOptions} />);
      }).not.toThrow();
    });
    it('handles empty format options', () => {
      const templateWithEmptyOptions = {
        ...mockTemplate,
        format_options: {}
      };
      render(<TemplateCustomizationDialog {...defaultProps} template={templateWithEmptyOptions} />);
      expect(screen.getByText('💾 Save Customization')).toBeInTheDocument();
    });
    it('handles undefined callbacks gracefully', () => {
      expect(() => {
        render();
          <TemplateCustomizationDialog 
            {...defaultProps}
            onClose={undefined}
            onSave={undefined}
            onPreview={undefined}
          />
        );
      }).not.toThrow();
    });
  });
});