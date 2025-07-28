/**
 * Export Options Dialog Component Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExportOptionsDialog } from './ExportOptionsDialog';
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { ExportFormat } from '../services/ResultExportService';

// Mock the ResultExportService
jest.mock('../services/ResultExportService', () => ({)
  ResultExportService: jest.fn<unknown, unknown>().mockImplementation(() => ({,)
  getAvailableFormats: () => [,
  {
  format: 'json-simple',
  name: 'JSON (Simple)',
  description: 'Basic JSON with output and seed information',
  category: 'data',
  supportsIndividual: true,
  supportsBatch: true,
}
      {
  format: 'json-complete',
  name: 'JSON (Complete)',
  description: 'Full JSON with execution paths, metadata, and debug info',
  category: 'data',
  supportsIndividual: true,
  supportsBatch: true,
}
      {
  format: 'csv-analysis',
  name: 'CSV Analysis',
  description: 'Tabular data with performance and variance metrics',
  category: 'analysis',
  supportsIndividual: false,
  supportsBatch: true,
}
      {
  format: 'fountain-script',
  name: 'Fountain Script',
  description: 'Industry-standard screenplay format',
  category: 'film',
  supportsIndividual: true,
  supportsBatch: true,
}
      {
  format: 'controlnet-json',
  name: 'ControlNet JSON',
  description: 'VFX-ready format for Stable Diffusion ControlNet',
  category: 'vfx',
  supportsIndividual: true,
  supportsBatch: true],
  validateExportOptions: jest.fn(() => []),
  estimateExportSize: jest.fn(() => ({,)
  estimatedSize: 15,
  unit: 'KB',
  warning: undefined,
}))
  }))
}));
const mockResults: PreviewResultWithPath = [
  {
  seed: 12345,
  output: 'First test result',
  executionTimeMs: 100,
  usedNodeIds: ['node1', 'node2'],
  usedEdgeIds: [],
  executionPath: {,
  id: 'exec_1',
  seed: 12345,
  startTime: Date.now() - 1000,
  endTime: Date.now(),
  totalExecutionTime: 100,
  steps: [],
  finalOutput: 'First test result',
  nodeExecutionOrder: ['node1', 'node2'],
  randomizationPoints: [],
}
  {
  seed: 67890,
  output: 'Second test result',
  executionTimeMs: 150,
  usedNodeIds: ['node1', 'node2'],
  usedEdgeIds: [],
  executionPath: {,
  id: 'exec_2',
  seed: 67890,
  startTime: Date.now() - 1000,
  endTime: Date.now(),
  totalExecutionTime: 150,
  steps: [],
  finalOutput: 'Second test result',
  nodeExecutionOrder: ['node1', 'node2'],
  randomizationPoints: []];
  describe('ExportOptionsDialog', () => {
  const defaultProps = {
  open: true,
  onClose: jest.fn<unknown, unknown>(),
  results: mockResults,
  selectedIndices: [0, 1],
  exportType: 'batch' as const,
  onExport: jest.fn<unknown, unknown>(),
};
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Basic Rendering', () => {
    it('should render dialog when open', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('~15KB')).toBeInTheDocument();
    });
    it('should not render dialog when closed', () => {
      render(<ExportOptionsDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Export Options')).not.toBeInTheDocument();
    });
    it('should display correct result count for individual export', () => {
      render();
        <ExportOptionsDialog
          {...defaultProps}
          exportType="individual"
          individualIndex={0}
        />
      );
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });
    it('should display available export formats', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByText('JSON (Simple)')).toBeInTheDocument();
      expect(screen.getByText('JSON (Complete)')).toBeInTheDocument();
      expect(screen.getByText('CSV Analysis')).toBeInTheDocument();
      expect(screen.getByText('Fountain Script')).toBeInTheDocument();
      expect(screen.getByText('ControlNet JSON')).toBeInTheDocument();
    });
  });
  describe('Format Selection', () => {
    it('should allow selecting different formats', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Initially JSON (Simple) should be selected
      const jsonSimpleCard = screen.getByText('JSON (Simple)').closest('div');
      expect(jsonSimpleCard).toHaveStyle('border: 2px solid #4d7cff');
      // Click on JSON (Complete)
      const jsonCompleteCard = screen.getByText('JSON (Complete)').closest('div');
      fireEvent.click(jsonCompleteCard!);
      // JSON (Complete) should now be selected
      expect(jsonCompleteCard).toHaveStyle('border: 2px solid #4d7cff');
    });
    it('should filter formats based on export type', () => {
      // CSV Analysis doesn't support individual export
      render();
        <ExportOptionsDialog
          {...defaultProps}
          exportType="individual"
          individualIndex={0}
        />
      );
      expect(screen.queryByText('CSV Analysis')).not.toBeInTheDocument();
      expect(screen.getByText('JSON (Simple)')).toBeInTheDocument();
    });
    it('should show format categories', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByText('DATA')).toBeInTheDocument();
      expect(screen.getByText('ANALYSIS')).toBeInTheDocument();
      expect(screen.getByText('FILM')).toBeInTheDocument();
      expect(screen.getByText('VFX')).toBeInTheDocument();
    });
  });
  describe('Export Options', () => {
    it('should display basic export options', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByText('Include Metadata')).toBeInTheDocument();
      expect(screen.getByText('Include Execution Paths')).toBeInTheDocument();
      expect(screen.getByText('Include Debug Info')).toBeInTheDocument();
    });
    it('should toggle basic options', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      const metadataCheckbox = screen.getByLabelText('Include Metadata') as HTMLInputElement;
      expect(metadataCheckbox.checked).toBe(true);
      fireEvent.click(metadataCheckbox);
      expect(metadataCheckbox.checked).toBe(false);
    });
    it('should show film options when film format is selected', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Select fountain script format
      const fountainCard = screen.getByText('Fountain Script').closest('div');
      fireEvent.click(fountainCard!);
      expect(screen.getByText('Film Industry Options')).toBeInTheDocument();
      expect(screen.getByText('Director Notes')).toBeInTheDocument();
      expect(screen.getByText('Scene Numbering')).toBeInTheDocument();
      expect(screen.getByText('Shot Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Timing Notes')).toBeInTheDocument();
    });
    it('should show VFX options when VFX format is selected', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Select ControlNet format
      const controlNetCard = screen.getByText('ControlNet JSON').closest('div');
      fireEvent.click(controlNetCard!);
      expect(screen.getByText('VFX Pipeline Options')).toBeInTheDocument();
      expect(screen.getByText('ControlNet Compatible')).toBeInTheDocument();
      expect(screen.getByText('Scene Data Integration')).toBeInTheDocument();
      expect(screen.getByText('Camera Metadata')).toBeInTheDocument();
      expect(screen.getByText('Lighting Data')).toBeInTheDocument();
    });
    it('should show analysis options when analysis format is selected', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Select CSV Analysis format
      const csvCard = screen.getByText('CSV Analysis').closest('div');
      fireEvent.click(csvCard!);
      expect(screen.getByText('Analysis Options')).toBeInTheDocument();
      expect(screen.getByText('Variance Analysis')).toBeInTheDocument();
      expect(screen.getByText('Performance Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Creativity Metrics')).toBeInTheDocument();
      expect(screen.getByText('Comparison Matrix')).toBeInTheDocument();
    });
  });
  describe('Validation and Warnings', () => {
    it('should display validation errors when present', () => {
      const mockService = require('../services/ResultExportService').ResultExportService;
      const mockInstance = new mockService();
      mockInstance.validateExportOptions.mockReturnValue(['Test validation error'] as unknown);
      render(<ExportOptionsDialog {...defaultProps} />);
      // Change format to trigger validation
      const jsonCompleteCard = screen.getByText('JSON (Complete)').closest('div');
      fireEvent.click(jsonCompleteCard!);
      expect(screen.getByText('⚠️ Test validation error')).toBeInTheDocument();
    });
    it('should display size warnings when present', () => {
  const mockService = require('../services/ResultExportService').ResultExportService;
  const mockInstance = new mockService();
  mockInstance.estimateExportSize.mockReturnValue({)
  estimatedSize: 5000,
  unit: 'KB',
  warning: 'Large export size - consider reducing options',
} as unknown);
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByText('⚡ Large export size - consider reducing options')).toBeInTheDocument();
    });
    it('should disable export button when validation errors exist', () => {
      const mockService = require('../services/ResultExportService').ResultExportService;
      const mockInstance = new mockService();
      mockInstance.validateExportOptions.mockReturnValue(['Test error'] as unknown);
      render(<ExportOptionsDialog {...defaultProps} />);
      const exportButton = screen.getByText(/Export/);
      expect(exportButton.closest('button')).toBeDisabled();
    });
  });
  describe('Export Actions', () => {
    it('should call onExport with correct parameters', async () => {
      const mockOnExport = jest.fn<unknown, unknown>().mockResolvedValue(undefined as unknown);
      render();
        <ExportOptionsDialog
          {...defaultProps}
          onExport={mockOnExport}
        />
      );
      const exportButton = screen.getByText(/Export JSON \(Simple\)/);
      fireEvent.click(exportButton);
      await waitFor(() => {
  expect(mockOnExport).toHaveBeenCalledWith()
  'json-simple',
  expect.objectContaining({)
  format: 'json-simple',
  includeMetadata: true,
  includeExecutionPaths: false,
  includeDebugInfo: false,
}
        );
      });
    });
    it('should show loading state during export', async () => {
      const mockOnExport = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render();
        <ExportOptionsDialog
          {...defaultProps}
          onExport={mockOnExport}
        />
      );
      const exportButton = screen.getByText(/Export JSON \(Simple\)/);
      fireEvent.click(exportButton);
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      expect(exportButton.closest('button')).toBeDisabled();
      await waitFor(() => {
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
      });
    });
    it('should close dialog after successful export', async () => {
      const mockOnExport = jest.fn<unknown, unknown>().mockResolvedValue(undefined as unknown);
      const mockOnClose = jest.fn<unknown, unknown>();
      render();
        <ExportOptionsDialog
          {...defaultProps}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />
      );
      const exportButton = screen.getByText(/Export JSON \(Simple\)/);
      fireEvent.click(exportButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
    it('should handle export errors gracefully', async () => {
      const mockOnExport = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Export failed'));
      render();
        <ExportOptionsDialog
          {...defaultProps}
          onExport={mockOnExport}
        />
      );
      const exportButton = screen.getByText(/Export JSON \(Simple\)/);
      fireEvent.click(exportButton);
      await waitFor(() => {
  expect(screen.getByText('⚠️ Export failed: Export failed')).toBeInTheDocument();
});
      // Dialog should remain open
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
    it('should call onClose when cancel button is clicked', () => {
      const mockOnClose = jest.fn<unknown, unknown>();
      render();
        <ExportOptionsDialog
          {...defaultProps}
          onClose={mockOnClose}
        />
      );
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  describe('Export Type Information', () => {
    it('should show correct information for individual export', () => {
      render();
        <ExportOptionsDialog
          {...defaultProps}
          exportType="individual"
          individualIndex={0}
        />
      );
      expect(screen.getByText('Exporting result 1 of 2')).toBeInTheDocument();
    });
    it('should show correct information for batch export', () => {
      render();
        <ExportOptionsDialog
          {...defaultProps}
          exportType="batch"
          selectedIndices={[0, 1]}
        />
      );
      expect(screen.getByText('Exporting 2 selected results')).toBeInTheDocument();
    });
    it('should show correct information for comparison export', () => {
      render();
        <ExportOptionsDialog
          {...defaultProps}
          exportType="comparison"
        />
      );
      expect(screen.getByText('Exporting all 2 results for comparison')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      expect(screen.getByLabelText('Include Metadata')).toBeInTheDocument();
      expect(screen.getByLabelText('Include Execution Paths')).toBeInTheDocument();
      expect(screen.getByLabelText('Include Debug Info')).toBeInTheDocument();
    });
    it('should support keyboard navigation', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      const firstFormatCard = screen.getByText('JSON (Simple)').closest('div')!;
      // Should be focusable
      firstFormatCard.focus();
      expect(document.activeElement).toBe(firstFormatCard);
    });
    it('should have appropriate button states', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      const exportButton = screen.getByText(/Export JSON \(Simple\)/).closest('button')!;
      const cancelButton = screen.getByText('Cancel').closest('button')!;
      expect(exportButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
      expect(exportButton).toHaveAttribute('type', 'button');
    });
  });
  describe('Format-Specific Option Changes', () => {
    it('should update nested options correctly', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Select fountain script to show film options
      const fountainCard = screen.getByText('Fountain Script').closest('div');
      fireEvent.click(fountainCard!);
      // Toggle director notes option
      const directorNotesCheckbox = screen.getByLabelText('Director Notes') as HTMLInputElement;
      expect(directorNotesCheckbox.checked).toBe(true);
      fireEvent.click(directorNotesCheckbox);
      expect(directorNotesCheckbox.checked).toBe(false);
      // When exported, this change should be reflected
      const exportButton = screen.getByText(/Export Fountain Script/);
      fireEvent.click(exportButton);
      expect(defaultProps.onExport).toHaveBeenCalledWith()
        'fountain-script',
        expect.objectContaining({)
  filmOptions: expect.objectContaining({,)
  includeDirectorNotes: false,
}
  }
      );
    });
    it('should handle complex nested option paths', () => {
      render(<ExportOptionsDialog {...defaultProps} />);
      // Select ControlNet to show VFX options
      const controlNetCard = screen.getByText('ControlNet JSON').closest('div');
      fireEvent.click(controlNetCard!);
      // Toggle scene data integration
      const sceneDataCheckbox = screen.getByLabelText('Scene Data Integration') as HTMLInputElement;
      fireEvent.click(sceneDataCheckbox);
      expect(sceneDataCheckbox.checked).toBe(true);
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      render();
        <ExportOptionsDialog
          {...defaultProps}
          results={[]}
          selectedIndices={[]}
        />
      );
      expect(screen.getByText('0 results')).toBeInTheDocument();
    });
    it('should handle missing execution paths in results', () => {
  const resultsWithoutPaths = mockResults.map(result => ({)
  ...result,
  executionPath: undefined,
}));
      render();
        <ExportOptionsDialog
          {...defaultProps}
          results={resultsWithoutPaths}
        />
      );
      expect(screen.getByText('Export Options')).toBeInTheDocument();
      // Should still render without errors
    });
    it('should handle format selection for unsupported export types', () => {
      // Mock service to return no formats
      const mockService = require('../services/ResultExportService').ResultExportService;
      const mockInstance = new mockService();
      mockInstance.getAvailableFormats.mockReturnValue([] as unknown);
      render(<ExportOptionsDialog {...defaultProps} />);
      // Should render without crashing
      expect(screen.getByText('Export Options')).toBeInTheDocument();
    });
  });
});