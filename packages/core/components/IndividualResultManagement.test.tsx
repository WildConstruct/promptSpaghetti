/**
 * Individual Result Management Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 3: Individual Result Management
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreviewModal } from '../PreviewModal';
import { PreviewResultWithPath } from '../types/ExecutionPath';

// Mock fetch for testing
global.fetch = jest.fn<unknown, unknown>() as jest.MockedFunction<typeof fetch>;
const mockResults: PreviewResultWithPath = [
  { seed: 12345
  output: 'First result output'
  executionTimeMs: 100
  usedNodeIds: ['node1', 'node2']
  usedEdgeIds: []
  executionPath: {
  id: 'exec_1'
  seed: 12345
  startTime: Date.now() - 1000
  endTime: Date.now()
  totalExecutionTime: 100
  steps: []
  finalOutput: 'First result output'
  nodeExecutionOrder: ['node1', 'node2']
  randomizationPoints: [] }

  { seed: 67890
  output: 'Second result output'
  executionTimeMs: 150
  usedNodeIds: ['node1', 'node2']
  usedEdgeIds: []
  executionPath: {
  id: 'exec_2'
  seed: 67890
  startTime: Date.now() - 1000
  endTime: Date.now()
  totalExecutionTime: 150
  steps: []
  finalOutput: 'Second result output'
  nodeExecutionOrder: ['node1', 'node2']
  randomizationPoints: [] }

  { seed: 54321
  output: 'Third result output'
  executionTimeMs: 120
  usedNodeIds: ['node1', 'node2'] }
  usedEdgeIds: []];
  describe('Individual Result Management', () => { beforeEach(() => {
  (fetch as jest.MockedFunction<typeof fetch>).mockClear() });
  describe('Result Action Controls', () => {
    it('should display regenerate buttons for each result', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Should have regenerate buttons for each result
      const regenerateButtons = screen.getAllByText('⟳');
      expect(regenerateButtons).toHaveLength(3);
    });
    it('should display lock/unlock buttons for each result', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Should have lock buttons for each result (unlocked by default)
      const lockButtons = screen.getAllByText('🔓');
      expect(lockButtons).toHaveLength(3);
    });
    it('should display export buttons for each result', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Should have export buttons for each result
      const exportButtons = screen.getAllByText('💾');
      expect(exportButtons).toHaveLength(3);
    });
    it('should call onResultAction when regenerate button is clicked', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Click first regenerate button
      const regenerateButtons = screen.getAllByText('⟳');
      fireEvent.click(regenerateButtons[0]);
      expect(mockOnResultAction).toHaveBeenCalledWith({ )
  type: 'regenerate'
  resultIndex: 0 }
});
    });
    it('should call onResultAction when lock button is clicked', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Click first lock button
      const lockButtons = screen.getAllByText('🔓');
      fireEvent.click(lockButtons[0]);
      expect(mockOnResultAction).toHaveBeenCalledWith({ )
  type: 'lock'
  resultIndex: 0 }
});
    });
    it('should call onResultAction when export button is clicked', () => {
      const mockOnResultAction = jest.fn<unknown, unknown>();
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
        />
      );
      // Click first export button
      const exportButtons = screen.getAllByText('💾');
      fireEvent.click(exportButtons[0]);
      expect(mockOnResultAction).toHaveBeenCalledWith({ )
  type: 'export'
  resultIndex: 0 }
});
    });
  });
  describe('Result Locking', () => { it('should display locked results with different styling', () => {
  const lockedResults = [{
  index: 0
  seed: 12345
  lockedAt: Date.now()
  note: 'Favorite result' }
];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          lockedResults={lockedResults}
        />
      );
      // Should show locked indicator
      expect(screen.getByText('🔒 LOCKED')).toBeInTheDocument();
      // Should show locked result info
      expect(screen.getByText('🔒 This result is locked and won\'t be affected by regeneration')).toBeInTheDocument();
    });
    it('should show unlock button for locked results', () => { const lockedResults = [{
  index: 0
  seed: 12345
  lockedAt: Date.now() }
];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          lockedResults={lockedResults}
        />
      );
      // First result should show unlock button
      const unlockButtons = screen.getAllByText('🔒');
      expect(unlockButtons).toHaveLength(1);
      // Other results should show lock buttons
      const lockButtons = screen.getAllByText('🔓');
      expect(lockButtons).toHaveLength(2);
    });
    it('should disable regenerate button for locked results', () => { const lockedResults = [{
  index: 0
  seed: 12345
  lockedAt: Date.now() }
];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          lockedResults={lockedResults}
        />
      );
      // First regenerate button should be disabled
      const regenerateButtons = screen.getAllByText('⟳');
      expect(regenerateButtons[0].closest('button')).toBeDisabled();
      // Other regenerate buttons should be enabled
      expect(regenerateButtons[1].closest('button')).not.toBeDisabled();
      expect(regenerateButtons[2].closest('button')).not.toBeDisabled();
    });
    it('should call unlock action when unlock button is clicked', () => { const mockOnResultAction = jest.fn<unknown, unknown>();
  const lockedResults = [{
  index: 0
  seed: 12345
  lockedAt: Date.now() }
];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          onResultAction={mockOnResultAction}
          lockedResults={lockedResults}
        />
      );
      // Click unlock button
      const unlockButton = screen.getByText('🔒');
      fireEvent.click(unlockButton);
      expect(mockOnResultAction).toHaveBeenCalledWith({ )
  type: 'unlock'
  resultIndex: 0 }
});
    });
  });
  describe('Result Regeneration', () => {
    it('should display regenerating state for results being regenerated', () => {
      const regeneratingResults = [1];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          regeneratingResults={regeneratingResults}
        />
      );
      // Should show regenerating indicator
      expect(screen.getByText('⟳ REGENERATING')).toBeInTheDocument();
      // Should show regenerating overlay
      expect(screen.getByText('Regenerating...')).toBeInTheDocument();
    });
    it('should disable regenerate button for results being regenerated', () => {
      const regeneratingResults = [1];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          regeneratingResults={regeneratingResults}
        />
      );
      // Second regenerate button should be disabled
      const regenerateButtons = screen.getAllByText('⟳');
      expect(regenerateButtons[1].closest('button')).toBeDisabled();
      // Other regenerate buttons should be enabled
      expect(regenerateButtons[0].closest('button')).not.toBeDisabled();
      expect(regenerateButtons[2].closest('button')).not.toBeDisabled();
    });
    it('should show correct styling for regenerating results', () => {
      const regeneratingResults = [0];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          regeneratingResults={regeneratingResults}
        />
      );
      // First result should have regenerating styling
      const firstResult = screen.getByText('First result output').closest('li');
      expect(firstResult).toHaveStyle('opacity: 0.7');
    });
  });
  describe('Result Comparison', () => {
    it('should show compare mode toggle button', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('⚖️ Compare')).toBeInTheDocument();
    });
    it('should enter compare mode when compare button is clicked', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Click compare button
      const compareButton = screen.getByText('⚖️ Compare');
      fireEvent.click(compareButton);
      // Should show exit compare button
      expect(screen.getByText('⚖️ Exit Compare')).toBeInTheDocument();
      // Should show comparison selection buttons
      const checkButtons = screen.getAllByText('✓');
      expect(checkButtons).toHaveLength(3);
    });
    it('should allow selecting results for comparison', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Enter compare mode
      const compareButton = screen.getByText('⚖️ Compare');
      fireEvent.click(compareButton);
      // Select first two results
      const checkButtons = screen.getAllByText('✓');
      fireEvent.click(checkButtons[0]);
      fireEvent.click(checkButtons[1]);
      // Should show selection count
      expect(screen.getByText('2/3 selected')).toBeInTheDocument();
    });
    it('should show comparison view when 2 or more results are selected', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Enter compare mode
      const compareButton = screen.getByText('⚖️ Compare');
      fireEvent.click(compareButton);
      // Select first two results
      const checkButtons = screen.getAllByText('✓');
      fireEvent.click(checkButtons[0]);
      fireEvent.click(checkButtons[1]);
      // Should show comparison view
      expect(screen.getByText('⚖️ Result Comparison')).toBeInTheDocument();
      expect(screen.getByText('Seed 12345')).toBeInTheDocument();
      expect(screen.getByText('Seed 67890')).toBeInTheDocument();
    });
    it('should limit selection to 3 results maximum', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Enter compare mode
      const compareButton = screen.getByText('⚖️ Compare');
      fireEvent.click(compareButton);
      // Select all three results
      const checkButtons = screen.getAllByText('✓');
      fireEvent.click(checkButtons[0]);
      fireEvent.click(checkButtons[1]);
      fireEvent.click(checkButtons[2]);
      // Should show 3/3 selected
      expect(screen.getByText('3/3 selected')).toBeInTheDocument();
      // All buttons should now be in selected state or disabled
      checkButtons.forEach(button => { )
  const buttonElement = button.closest('button');
  expect(buttonElement).toHaveStyle('background: rgb(16, 185, 129)') });
    });
    it('should exit compare mode and clear selections when exit button is clicked', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Enter compare mode and select results
      const compareButton = screen.getByText('⚖️ Compare');
      fireEvent.click(compareButton);
      const checkButtons = screen.getAllByText('✓');
      fireEvent.click(checkButtons[0]);
      fireEvent.click(checkButtons[1]);
      // Exit compare mode
      const exitButton = screen.getByText('⚖️ Exit Compare');
      fireEvent.click(exitButton);
      // Should return to normal mode
      expect(screen.getByText('⚖️ Compare')).toBeInTheDocument();
      expect(screen.queryByText('⚖️ Result Comparison')).not.toBeInTheDocument();
    });
  });
  describe('Status Display', () => {
    it('should show locked results count in footer', () => {
      const lockedResults = [
        { index: 0, seed: 12345, lockedAt: Date.now() }
        { index: 2, seed: 54321, lockedAt: Date.now() }
      ];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          lockedResults={lockedResults}
        />
      );
      expect(screen.getByText('🔒 2 locked results')).toBeInTheDocument();
    });
    it('should show regenerating results count in footer', () => {
      const regeneratingResults = [0, 1];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          regeneratingResults={regeneratingResults}
        />
      );
      expect(screen.getByText('⟳ 2 regenerating')).toBeInTheDocument();
    });
    it('should show both locked and regenerating counts when present', () => {
      const lockedResults = [{ index: 2, seed: 54321, lockedAt: Date.now() }];
      const regeneratingResults = [0];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          lockedResults={lockedResults}
          regeneratingResults={regeneratingResults}
        />
      );
      expect(screen.getByText('🔒 1 locked result')).toBeInTheDocument();
      expect(screen.getByText('⟳ 1 regenerating')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('should have proper ARIA attributes for action buttons', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      // Check that buttons are focusable
      const regenerateButtons = screen.getAllByText('⟳');
      const lockButtons = screen.getAllByText('🔓');
      const exportButtons = screen.getAllByText('💾');
      [...regenerateButtons, ...lockButtons, ...exportButtons].forEach(button => { )
  expect(button.closest('button')).toHaveAttribute('type', 'button') });
    });
    it('should support keyboard navigation for action buttons', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
        />
      );
      const firstRegenerateButton = screen.getAllByText('⟳')[0].closest('button')!;
      // Should be focusable
      firstRegenerateButton.focus();
      expect(firstRegenerateButton).toHaveFocus();
    });
  });
  describe('Error Handling', () => {
    it('should handle missing onResultAction gracefully', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={mockResults}
          onClose={() => {}}
          // No onResultAction provided
        />
      );
      // Should render without errors
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
      // Clicking buttons should not throw errors
      const regenerateButton = screen.getAllByText('⟳')[0];
      expect(() => fireEvent.click(regenerateButton)).not.toThrow();
    });
    it('should handle empty results array', () => {
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={[]}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
    });
    it('should handle results without execution paths', () => { const resultsWithoutPaths = [
        {
          seed: 123
          output: 'Test output'
          executionTimeMs: 100
          usedNodeIds: ['node1'] }
          usedEdgeIds: []];
      render();
        <PreviewModal
          open={true}
          loading={false}
          error={null}
          results={resultsWithoutPaths}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Test output')).toBeInTheDocument();
      // Should still show action buttons
      expect(screen.getByText('⟳')).toBeInTheDocument();
    });
  });
});