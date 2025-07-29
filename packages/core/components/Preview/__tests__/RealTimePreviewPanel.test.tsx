/**
 * RealTimePreviewPanel Component Tests
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RealTimePreviewPanel } from '../RealTimePreviewPanel';
import { usePreviewStateStore } from '../../../stores/previewStateStore';
import { usePreviewSync } from '../../../hooks/usePreviewSync';

// Mock the stores and hooks
jest.mock('../../../stores/previewStateStore');
jest.mock('../../../hooks/usePreviewSync');
jest.mock('../../../graphStore', () => ({)
  useGraphStore: () => ({,)
  getGraphData: jest.fn(() => ({ nodes: [], edges: [] }))
  }
}));
const mockUsePreviewStateStore = usePreviewStateStore as jest.MockedFunction<typeof usePreviewStateStore>;
const mockUsePreviewSync = usePreviewSync as jest.MockedFunction<typeof usePreviewSync>;
const mockPreviewResults = [;
  {
  seed: 1234,
  output: 'Test output 1',
  executionTimeMs: 125,
  locked: false,
}
  {
  seed: 5678,
  output: 'Test output 2',
  executionTimeMs: 89,
  locked: false,
}
  {
  seed: 9012,
  error: 'Test error',
  executionTimeMs: 45,
  locked: true,
  lockedNote: 'Important result'];
  const mockStoreState = {
  results: mockPreviewResults,
  isLoading: false,
  error: null,
  performanceStats: {
  totalTime: 1500,
  averageTime: 86,
},
  lockedResults: [2],
  isRealTimeEnabled: true,
  autoRefreshEnabled: false,
  lockResult: jest.fn<unknown, unknown>(),
  unlockResult: jest.fn<unknown, unknown>(),
  setAutoRefresh: jest.fn<unknown, unknown>(),
  resetState: jest.fn<unknown, unknown>()
};
const mockSyncState = {
  isEnabled: true,
  isSyncing: false,
  lastSyncTime: Date.now() - 30000,
  syncCount: 5,
  enableSync: jest.fn<unknown, unknown>(),
  forceSyncNow: jest.fn<unknown, unknown>(),
  getChangeAnalysis: jest.fn(() => ({,)
  changeType: 'content',
  significance: 0.6,
  affectedNodes: ['node-1'],
  affectedEdges: [],
})),
  performanceMetrics: {
  avgSyncTime: 250,
  successRate: 0.95,
  cacheHitRate: 0.75,
};
describe('RealTimePreviewPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePreviewStateStore.mockReturnValue(mockStoreState as any as unknown);
    mockUsePreviewSync.mockReturnValue(mockSyncState as any as unknown);
  });
  describe('Rendering', () => {
    test('renders panel when visible', () => {
      render(<RealTimePreviewPanel visible={true} />);
      expect(screen.getByText('🔄 Real-Time Preview')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
    });
    test('does not render when not visible', () => {
      render(<RealTimePreviewPanel visible={false} />);
      expect(screen.queryByText('🔄 Real-Time Preview')).not.toBeInTheDocument();
    });
    test('displays close button when onClose provided', () => {
      const mockOnClose = jest.fn<unknown, unknown>();
      render(<RealTimePreviewPanel onClose={mockOnClose} />);
      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();
    });
    test('shows sync status correctly', () => {
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
    test('displays preview results', () => {
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Seed 1234')).toBeInTheDocument();
      expect(screen.getByText('Test output 1')).toBeInTheDocument();
      expect(screen.getByText('125ms')).toBeInTheDocument();
      expect(screen.getByText('Seed 5678')).toBeInTheDocument();
      expect(screen.getByText('Test output 2')).toBeInTheDocument();
      expect(screen.getByText('Seed 9012')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
    test('shows locked indicator for locked results', () => {
      render(<RealTimePreviewPanel />);
      const lockIcons = screen.getAllByText('🔒');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });
  describe('Controls', () => {
    test('displays real-time sync checkbox', () => {
      render(<RealTimePreviewPanel />);
      const syncCheckbox = screen.getByLabelText('Real-time sync');
      expect(syncCheckbox).toBeInTheDocument();
      expect(syncCheckbox).toBeChecked();
    });
    test('displays auto-refresh checkbox', () => {
      render(<RealTimePreviewPanel />);
      const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh');
      expect(autoRefreshCheckbox).toBeInTheDocument();
    });
    test('handles sync toggle', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      const syncCheckbox = screen.getByLabelText('Real-time sync');
      await user.click(syncCheckbox);
      expect(mockSyncState.enableSync).toHaveBeenCalledWith(false);
    });
    test('handles auto-refresh toggle', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh');
      await user.click(autoRefreshCheckbox);
      expect(mockStoreState.setAutoRefresh).toHaveBeenCalledWith(true);
    });
    test('handles manual refresh', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      const refreshButton = screen.getByText('🔄 Refresh');
      await user.click(refreshButton);
      expect(mockSyncState.forceSyncNow).toHaveBeenCalled();
    });
    test('handles clear results', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      const clearButton = screen.getByText('🗑️ Clear');
      await user.click(clearButton);
      expect(mockStoreState.resetState).toHaveBeenCalled();
    });
    test('toggles performance stats', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel enablePerformanceMonitoring={true} />);
      const statsButton = screen.getByText('📊 Stats');
      await user.click(statsButton);
      expect(screen.getByText('Sync Count:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
  describe('Performance Stats', () => {
    test('shows performance details when enabled', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel enablePerformanceMonitoring={true} />);
      const statsButton = screen.getByText('📊 Stats');
      await user.click(statsButton);
      expect(screen.getByText('Sync Count:')).toBeInTheDocument();
      expect(screen.getByText('Last Sync:')).toBeInTheDocument();
      expect(screen.getByText('Avg Time:')).toBeInTheDocument();
      expect(screen.getByText('Success Rate:')).toBeInTheDocument();
      expect(screen.getByText('Cache Hit:')).toBeInTheDocument();
      expect(screen.getByText('Exec Time:')).toBeInTheDocument();
    });
    test('displays change analysis when available', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel enablePerformanceMonitoring={true} />);
      const statsButton = screen.getByText('📊 Stats');
      await user.click(statsButton);
      expect(screen.getByText('Last Change:')).toBeInTheDocument();
      expect(screen.getByText(/content/)).toBeInTheDocument();
      expect(screen.getByText(/60% significance/)).toBeInTheDocument();
    });
    test('formats performance metrics correctly', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel enablePerformanceMonitoring={true} />);
      const statsButton = screen.getByText('📊 Stats');
      await user.click(statsButton);
      expect(screen.getByText('250ms')).toBeInTheDocument(); // avgSyncTime
      expect(screen.getByText('95%')).toBeInTheDocument(); // successRate
      expect(screen.getByText('75%')).toBeInTheDocument(); // cacheHitRate
      expect(screen.getByText('86ms')).toBeInTheDocument(); // execution time
    });
  });
  describe('Result Interactions', () => {
  test('handles result selection', async () => {
  const user = userEvent.setup();
  render(<RealTimePreviewPanel />);
  const firstResult = screen.getByText('Seed 1234').closest('div')?.closest('div');
  if (firstResult) {
  await user.click(firstResult);
  // Should highlight the selected result
  expect(firstResult).toHaveStyle({)
  background: '#f0f9ff',
  borderColor: '#0ea5e9',
});
    });
    test('handles lock/unlock toggle', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      // Find unlock button for locked result
      const lockButtons = screen.getAllByTitle(/Lock result|Unlock result/);
      await user.click(lockButtons[2]); // Third result is locked
      expect(mockStoreState.unlockResult).toHaveBeenCalledWith(2);
    });
    test('opens lock dialog for unlocked result', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      // Find lock button for unlocked result
      const lockButtons = screen.getAllByTitle('Lock result');
      await user.click(lockButtons[0]);
      expect(screen.getByText('Lock Result')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Optional note...')).toBeInTheDocument();
    });
    test('handles lock confirmation with note', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      // Open lock dialog
      const lockButtons = screen.getAllByTitle('Lock result');
      await user.click(lockButtons[0]);
      // Enter note and confirm
      const noteInput = screen.getByPlaceholderText('Optional note...');
      await user.type(noteInput, 'Test lock note');
      const confirmButton = screen.getByText('Lock Result');
      await user.click(confirmButton);
      expect(mockStoreState.lockResult).toHaveBeenCalledWith(0, 'Test lock note');
    });
    test('handles lock dialog cancellation', async () => {
      const user = userEvent.setup();
      render(<RealTimePreviewPanel />);
      // Open lock dialog
      const lockButtons = screen.getAllByTitle('Lock result');
      await user.click(lockButtons[0]);
      // Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      expect(screen.queryByText('Lock Result')).not.toBeInTheDocument();
    });
  });
  describe('Loading and Error States', () => {
  test('shows loading state', () => {
  const loadingState = {
  ...mockStoreState,
  isLoading: true,
  results: [],
};
      mockUsePreviewStateStore.mockReturnValue(loadingState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Generating previews...')).toBeInTheDocument();
    });
    test('shows error state', () => {
  const errorState = {
  ...mockStoreState,
  error: 'Test error message',
  results: [],
};
      mockUsePreviewStateStore.mockReturnValue(errorState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
    test('shows empty state', () => {
  const emptyState = {
  ...mockStoreState,
  results: [],
  isLoading: false,
  error: null,
};
      mockUsePreviewStateStore.mockReturnValue(emptyState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('No previews yet')).toBeInTheDocument();
      expect(screen.getByText(/Enable real-time sync/)).toBeInTheDocument();
    });
    test('disables refresh button when syncing', () => {
  const syncingState = {
  ...mockSyncState,
  isSyncing: true,
};
      mockUsePreviewSync.mockReturnValue(syncingState as any as unknown);
      render(<RealTimePreviewPanel />);
      const refreshButton = screen.getByText('Syncing...');
      expect(refreshButton).toBeDisabled();
    });
  });
  describe('Result Limiting', () => {
    test('limits displayed results to maxResults', () => {
      const manyResults = Array.from({ length: 10 }, (_, i) => ({)
  seed: 1000 + i,
        output: `Output ${i}`}
},
  executionTimeMs: 100 + i,
        locked: false;
  }));
      const stateWithManyResults = {
  ...mockStoreState,
  results: manyResults,
};
      mockUsePreviewStateStore.mockReturnValue(stateWithManyResults as any as unknown);
      render(<RealTimePreviewPanel maxResults={3} />);
      expect(screen.getByText('Seed 1000')).toBeInTheDocument();
      expect(screen.getByText('Seed 1001')).toBeInTheDocument();
      expect(screen.getByText('Seed 1002')).toBeInTheDocument();
      expect(screen.queryByText('Seed 1003')).not.toBeInTheDocument();
      expect(screen.getByText('... and 7 more results')).toBeInTheDocument();
    });
  });
  describe('Sync Status Display', () => {
  test('shows disabled status when sync disabled', () => {
  const disabledSyncState = {
  ...mockSyncState,
  isEnabled: false,
  syncCount: 0,
};
      mockUsePreviewSync.mockReturnValue(disabledSyncState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
    test('shows syncing status during sync', () => {
  const syncingState = {
  ...mockSyncState,
  isSyncing: true,
};
      mockUsePreviewSync.mockReturnValue(syncingState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });
    test('shows ready status when enabled but no syncs', () => {
  const readyState = {
  ...mockSyncState,
  syncCount: 0,
  isSyncing: false,
};
      mockUsePreviewSync.mockReturnValue(readyState as any as unknown);
      render(<RealTimePreviewPanel />);
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    test('provides proper labels for form controls', () => {
      render(<RealTimePreviewPanel />);
      expect(screen.getByLabelText('Real-time sync')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto-refresh')).toBeInTheDocument();
    });
    test('provides tooltips for lock buttons', () => {
      render(<RealTimePreviewPanel />);
      expect(screen.getByTitle('Lock result')).toBeInTheDocument();
      expect(screen.getByTitle('Unlock result')).toBeInTheDocument();
    });
    test('provides lock note tooltip for locked results', () => {
  render(<RealTimePreviewPanel />);
  expect(screen.getByTitle('Locked: Important result')).toBeInTheDocument();
});
  });
  describe('Event Handling', () => {
    test('handles close button click', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn<unknown, unknown>();
      render(<RealTimePreviewPanel onClose={mockOnClose} />);
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
    test('prevents event propagation on lock button clicks', async () => {
  const user = userEvent.setup();
  render(<RealTimePreviewPanel />);
  const lockButtons = screen.getAllByTitle('Lock result');
  const resultContainer = lockButtons[0].closest('[style*="cursor: pointer"]');
  let resultClicked = false;
  if (resultContainer) {
  resultContainer.addEventListener('click', () => {
  resultClicked = true;
});
      await user.click(lockButtons[0]);
      // Lock dialog should open, but result should not be selected
      expect(screen.getByText('Lock Result')).toBeInTheDocument();
      expect(resultClicked).toBe(false);
    });
  });
});