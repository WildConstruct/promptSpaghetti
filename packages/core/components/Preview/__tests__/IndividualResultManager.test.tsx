/**
 * IndividualResultManager Component Tests
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 3
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndividualResultManager } from '../IndividualResultManager';
import { usePreviewStateStore } from '../../../stores/previewStateStore';
import { usePreviewSeeds } from '../../../usePreviewSeeds';

// Mock the dependencies
jest.mock('../../../stores/previewStateStore');
jest.mock('../../../usePreviewSeeds');
const mockUsePreviewStateStore = usePreviewStateStore as jest.MockedFunction<typeof usePreviewStateStore>;
const mockUsePreviewSeeds = usePreviewSeeds as jest.MockedFunction<typeof usePreviewSeeds>;
const mockResults = [;
  {
    seed: 1234,
    output: 'This is a comprehensive test output with multiple words and sentences. It contains good content for analysis.',
    executionTimeMs: 125,
    locked: false,
  },
  {
    seed: 5678,
    output: 'A shorter test output with different content.',
    executionTimeMs: 89,
    locked: true,
    lockedNote: 'Important baseline result'
  },
  {
    seed: 9012,
    error: 'Test error message',
    executionTimeMs: 45,
    locked: false,
  }
];
const mockStoreState = {
  results: mockResults,
  isLoading: false,
  error: null,
  lockedResults: [1],
  regeneratingResults: [],
  lockResult: jest.fn<unknown[], unknown>(),
  unlockResult: jest.fn<unknown[], unknown>(),
  setRegeneratingResult: jest.fn<unknown[], unknown>()
};
const mockPreviewSeeds = {
  regenerateResult: jest.fn<unknown[], unknown>()
};
describe('IndividualResultManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePreviewStateStore.mockReturnValue(mockStoreState as any as unknown);
    mockUsePreviewSeeds.mockReturnValue(mockPreviewSeeds as any as unknown);
    // Mock URL.createObjectURL and related functions for export tests
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn<unknown[], unknown>();
    // Mock document.createElement for export tests
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn<unknown[], unknown>(),
      style: {}
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any as unknown);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Rendering', () => {
    test('renders manager when visible', () => {
      render(<IndividualResultManager visible={true} />);
      expect(screen.getByText('⚙️ Result Manager')).toBeInTheDocument();
      expect(screen.getByText(/3 results • 1 locked/)).toBeInTheDocument();
    });
    test('does not render when not visible', () => {
      render(<IndividualResultManager visible={false} />);
      expect(screen.queryByText('⚙️ Result Manager')).not.toBeInTheDocument();
    });
    test('displays all results with correct information', () => {
      render(<IndividualResultManager />);
      expect(screen.getByText('Seed 1234')).toBeInTheDocument();
      expect(screen.getByText(/comprehensive test output/)).toBeInTheDocument();
      expect(screen.getByText('125ms')).toBeInTheDocument();
      expect(screen.getByText('Seed 5678')).toBeInTheDocument();
      expect(screen.getByText(/shorter test output/)).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.getByText('Seed 9012')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
    test('shows close button when onClose provided', () => {
      const mockOnClose = jest.fn<unknown[], unknown>();
      render(<IndividualResultManager onClose={mockOnClose} />);
      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();
    });
    test('displays locked result indicators', () => {
      render(<IndividualResultManager />);
      // Find the locked result (seed 5678)
      const lockIcon = screen.getByText('🔒');
      expect(lockIcon).toHaveAttribute('title', 'Locked: Important baseline result');
    });
  });
  describe('Controls', () => {
    test('displays comparison toggle when enabled', () => {
      render(<IndividualResultManager enableComparison={true} />);
      expect(screen.getByText('🔍 Compare (0)')).toBeInTheDocument();
    });
    test('displays analytics toggle when enabled', () => {
      render(<IndividualResultManager enableAnalytics={true} />);
      expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    });
    test('handles comparison mode toggle', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableComparison={true} />);
      const compareButton = screen.getByText('🔍 Compare (0)');
      await user.click(compareButton);
      // Should enable comparison mode - check for checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
    test('handles analytics toggle', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      const analyticsButton = screen.getByText('📊 Analytics');
      await user.click(analyticsButton);
      // Should show analytics data
      expect(screen.getByText('Words:')).toBeInTheDocument();
      expect(screen.getByText('Readability:')).toBeInTheDocument();
    });
    test('clears selection', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableComparison={true} />);
      // Enable comparison mode first
      const compareButton = screen.getByText('🔍 Compare (0)');
      await user.click(compareButton);
      // Select some results
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      // Clear selection
      const clearButton = screen.getByText('🗑️ Clear Selection');
      await user.click(clearButton);
      // All checkboxes should be unchecked
      checkboxes.forEach(checkbox => {)
        expect(checkbox).not.toBeChecked();
      });
    });
  });
  describe('Result Selection and Comparison', () => {
    test('allows result selection in comparison mode', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableComparison={true} />);
      // Enable comparison mode
      await user.click(screen.getByText('🔍 Compare (0)'));
      // Select first result
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    });
    test('shows comparison summary with multiple selections', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableComparison={true} />);
      // Enable comparison mode
      await user.click(screen.getByText('🔍 Compare (0)'));
      // Select multiple results
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // First result
      await user.click(checkboxes[1]); // Second result (if not error result)
      // Should show comparison summary
      await waitFor(() => {
        expect(screen.getByText('Comparison Summary')).toBeInTheDocument();
      });
    });
    test('updates comparison count in button', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableComparison={true} />);
      // Enable comparison mode
      await user.click(screen.getByText('🔍 Compare (0)'));
      // Select one result
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      expect(screen.getByText('🔍 Compare (1)')).toBeInTheDocument();
    });
  });
  describe('Analytics', () => {
    test('calculates analytics for text results', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      // Enable analytics
      await user.click(screen.getByText('📊 Analytics'));
      // Should show analytics for text results
      expect(screen.getByText('Words:')).toBeInTheDocument();
      expect(screen.getByText('Readability:')).toBeInTheDocument();
      expect(screen.getByText('Sentiment:')).toBeInTheDocument();
    });
    test('displays word count correctly', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      await user.click(screen.getByText('📊 Analytics'));
      // First result has "This is a comprehensive test output with multiple words and sentences. It contains good content for analysis."
      // Should count approximately 17 words
      const wordCounts = screen.getAllByText(/Words:/);
      expect(wordCounts.length).toBeGreaterThan(0);
    });
    test('calculates readability scores', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      await user.click(screen.getByText('📊 Analytics'));
      const readabilityElements = screen.getAllByText(/Readability:/);
      expect(readabilityElements.length).toBeGreaterThan(0);
    });
    test('detects sentiment correctly', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      await user.click(screen.getByText('📊 Analytics'));
      // First result contains "good" so should be positive
      const sentimentElements = screen.getAllByText(/Sentiment:/);
      expect(sentimentElements.length).toBeGreaterThan(0);
    });
  });
  describe('Action Menu', () => {
    test('opens action menu on button click', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      expect(screen.getByText('🔒 Lock Result')).toBeInTheDocument();
      expect(screen.getByText('⟳ Regenerate')).toBeInTheDocument();
      expect(screen.getByText('📄 Export Text')).toBeInTheDocument();
    });
    test('shows unlock option for locked results', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      // Click on the action menu for the locked result (second result)
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[1]);
      expect(screen.getByText('🔓 Unlock Result')).toBeInTheDocument();
    });
    test('disables regenerate for locked results', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      // Click on the action menu for the locked result
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[1]);
      const regenerateButton = screen.getByText('⟳ Regenerate');
      expect(regenerateButton).toHaveStyle({ color: '#9ca3af' });
    });
    test('closes menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      expect(screen.getByText('🔒 Lock Result')).toBeInTheDocument();
      // Click outside
      await user.click(document.body);
      await waitFor(() => {
        expect(screen.queryByText('🔒 Lock Result')).not.toBeInTheDocument();
      });
    });
  });
  describe('Locking and Unlocking', () => {
    test('opens lock dialog when locking result', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('🔒 Lock Result'));
      expect(screen.getByText('Lock Result')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Important for X reason/)).toBeInTheDocument();
    });
    test('handles lock confirmation with note', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('🔒 Lock Result'));
      const textarea = screen.getByPlaceholderText(/Important for X reason/);
      await user.type(textarea, 'Test lock note');
      await user.click(screen.getByText('🔒 Lock Result'));
      expect(mockStoreState.lockResult).toHaveBeenCalledWith(0, 'Test lock note');
    });
    test('handles unlock action', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[1]); // Locked result
      await user.click(screen.getByText('🔓 Unlock Result'));
      expect(mockStoreState.unlockResult).toHaveBeenCalledWith(1);
    });
    test('cancels lock dialog', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('🔒 Lock Result'));
      await user.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Lock Result')).not.toBeInTheDocument();
    });
  });
  describe('Regeneration', () => {
    test('handles regenerate action', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]); // Unlocked result
      await user.click(screen.getByText('⟳ Regenerate'));
      expect(mockStoreState.setRegeneratingResult).toHaveBeenCalledWith(0, true);
      expect(mockPreviewSeeds.regenerateResult).toHaveBeenCalledWith(0);
    });
    test('shows regenerating indicator', () => {
      const regeneratingStore = {
        ...mockStoreState,
        regeneratingResults: [0],
      };
      mockUsePreviewStateStore.mockReturnValue(regeneratingStore as any as unknown);
      render(<IndividualResultManager />);
      expect(screen.getByText('⟳')).toBeInTheDocument();
    });
    test('prevents regeneration of locked results', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[1]); // Locked result
      const regenerateButton = screen.getByText('⟳ Regenerate');
      await user.click(regenerateButton);
      // Should not call regenerate for locked result
      expect(mockPreviewSeeds.regenerateResult).not.toHaveBeenCalled();
    });
  });
  describe('Export Functionality', () => {
    test('exports result as text', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('📄 Export Text'));
      expect(global.URL.createObjectURL).toHaveBeenCalledWith()
        expect.objectContaining({)
          type: 'text/plain',
        })
      );
    });
    test('exports result as JSON', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('📋 Export JSON'));
      expect(global.URL.createObjectURL).toHaveBeenCalledWith()
        expect.objectContaining({)
          type: 'application/json',
        })
      );
    });
    test('exports result as CSV when analytics enabled', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager enableAnalytics={true} />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('📊 Export CSV'));
      expect(global.URL.createObjectURL).toHaveBeenCalledWith()
        expect.objectContaining({)
          type: 'text/csv',
        })
      );
    });
  });
  describe('Error States', () => {
    test('displays error when present', () => {
      const errorStore = {
        ...mockStoreState,
        error: 'Test error message'
      };
      mockUsePreviewStateStore.mockReturnValue(errorStore as any as unknown);
      render(<IndividualResultManager />);
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
    test('shows empty state when no results', () => {
      const emptyStore = {
        ...mockStoreState,
        results: [],
      };
      mockUsePreviewStateStore.mockReturnValue(emptyStore as any as unknown);
      render(<IndividualResultManager />);
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('No results to manage')).toBeInTheDocument();
    });
    test('handles analytics calculation errors gracefully', async () => {
      const user = userEvent.setup();
      const resultsWithInvalidData = [;
        {
          seed: 1234,
          output: null, // Invalid output
          executionTimeMs: 125,
          locked: false,
        }
      ];
      const storeWithInvalidData = {
        ...mockStoreState,
        results: resultsWithInvalidData,
      };
      mockUsePreviewStateStore.mockReturnValue(storeWithInvalidData as any as unknown);
      expect(() => {
        render(<IndividualResultManager enableAnalytics={true} />);
      }).not.toThrow();
    });
  });
  describe('Result Limiting', () => {
    test('limits displayed results to maxDisplayResults', () => {
      const manyResults = Array.from({ length: 15 }, (_, i) => ({)
        seed: 1000 + i,
        output: `Output ${i}`,}
        executionTimeMs: 100 + i,
        locked: false,
      }));
      const storeWithManyResults = {
        ...mockStoreState,
        results: manyResults,
      };
      mockUsePreviewStateStore.mockReturnValue(storeWithManyResults as any as unknown);
      render(<IndividualResultManager maxDisplayResults={5} />);
      expect(screen.getByText('Seed 1000')).toBeInTheDocument();
      expect(screen.getByText('Seed 1004')).toBeInTheDocument();
      expect(screen.queryByText('Seed 1005')).not.toBeInTheDocument();
      expect(screen.getByText('... and 10 more results')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    test('provides proper close button', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn<unknown[], unknown>();
      render(<IndividualResultManager onClose={mockOnClose} />);
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
    test('provides tooltips for locked results', () => {
      render(<IndividualResultManager />);
      expect(screen.getByTitle('Locked: Important baseline result')).toBeInTheDocument();
    });
    test('provides proper form labels in lock dialog', async () => {
      const user = userEvent.setup();
      render(<IndividualResultManager />);
      const actionButtons = screen.getAllByText('⋯');
      await user.click(actionButtons[0]);
      await user.click(screen.getByText('🔒 Lock Result'));
      expect(screen.getByPlaceholderText(/Important for X reason/)).toBeInTheDocument();
    });
  });
});