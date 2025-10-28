/**
 * Tests for state restoration and recovery functionality
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  attemptRecovery,
  buildRecoveredState,
  restoreState,
  getStorageInfo,
  exportBackup,
  clearPersistedState
} from '../utils/stateRestoration';
import * as stateRestorationModule from '../utils/stateRestoration';
import { StateRecoveryDialog } from '../components/recovery/StateRecoveryDialog';
import { StorageInfo } from '../components/storage/StorageInfo';
import {
  RestorationLoader,
  RestorationToast
} from '../components/indicators/RestorationLoader';
import {
  persistenceStorage,
  getPersistedStateInfo
} from '../utils/persistenceUtils';

// Mock modules
jest.mock('../utils/persistenceUtils');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock navigator.storage
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: jest.fn(() =>
      Promise.resolve({
        quota: 5 * 1024 * 1024, // 5MB
        usage: 1024 * 100 // 100KB
      })
    )
  },
  writable: true
});

describe('State Recovery', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('attemptRecovery', () => {
    it('should handle completely corrupted state', () => {
      const report = attemptRecovery('not an object');

      expect(report.recommendation).toBe('reset');
      expect(report.recoverable.nodes).toBe(0);
      expect(report.recoverable.edges).toBe(0);
      expect(report.corrupted.errors).toHaveLength(1);
    });

    it('should recover valid nodes and edges', () => {
      const corruptedState = {
        nodes: [
          { id: 'node1', type: 'Output', data: {} },
          { id: 'node2', type: 'Concat', data: {} },
          { invalidNode: true } // Corrupted node
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node1' } // Missing target
        ]
      };

      const report = attemptRecovery(corruptedState);

      expect(report.recoverable.nodes).toBe(2);
      expect(report.recoverable.edges).toBe(1);
      expect(report.corrupted.nodes).toHaveLength(1);
      expect(report.corrupted.edges).toHaveLength(1);
      expect(report.recommendation).toBe('partial');
    });

    it('should detect fully recoverable state', () => {
      const validState = {
        nodes: [
          { id: 'node1', type: 'Output', data: {} },
          { id: 'node2', type: 'Concat', data: {} }
        ],
        edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
        viewport: { x: 100, y: 200, zoom: 1.5 }
      };

      const report = attemptRecovery(validState);

      expect(report.recommendation).toBe('full');
      expect(report.recoverable.viewport).toBe(true);
      expect(report.corrupted.nodes).toHaveLength(0);
      expect(report.corrupted.edges).toHaveLength(0);
    });

    it('should recommend reset for mostly corrupted data', () => {
      const corruptedState = {
        nodes: [
          { id: 'node1', type: 'Output', data: {} },
          {},
          {},
          {},
          {} // 4 corrupted nodes
        ],
        edges: []
      };

      const report = attemptRecovery(corruptedState);

      expect(report.recommendation).toBe('reset');
      expect(report.recoverable.nodes).toBe(1);
      expect(report.corrupted.nodes).toHaveLength(4);
    });
  });

  describe('buildRecoveredState', () => {
    it('should build state from recovery report', () => {
      const corrupted = {
        nodes: [
          { id: 'node1', type: 'Output', data: {} },
          { id: 'node2', type: 'Concat', data: {} },
          { id: 'node3' } // Invalid - missing type
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node1', target: 'node3' } // Will be excluded
        ],
        viewport: { x: 50, y: 100, zoom: 1 }
      };

      const report = attemptRecovery(corrupted);
      const recovered = buildRecoveredState(corrupted, report);

      expect(recovered.nodes).toHaveLength(2);
      expect(recovered.edges).toHaveLength(1);
      expect(recovered.viewport).toEqual({ x: 50, y: 100, zoom: 1 });
      expect(recovered.lastModified).toBeDefined();
    });

    it('should filter edges with missing nodes', () => {
      const corrupted = {
        nodes: [{ id: 'node1', type: 'Output', data: {} }],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' }, // node2 doesn't exist
          { id: 'edge2', source: 'node3', target: 'node1' } // node3 doesn't exist
        ]
      };

      const report = attemptRecovery(corrupted);
      const recovered = buildRecoveredState(corrupted, report);

      expect(recovered.edges).toHaveLength(0);
    });
  });

  describe('restoreState', () => {
    beforeEach(() => {
      (getPersistedStateInfo as unknown as jest.Mock).mockReturnValue({
        exists: true,
        size: 1024,
        compressed: false,
        timestamp: Date.now()
      });
      // validatePersistedState comes from mocked persistenceUtils
      const { validatePersistedState } = jest.requireMock(
        '../utils/persistenceUtils'
      );
      (validatePersistedState as jest.Mock).mockImplementation(
        (x: unknown) => x
      );
    });

    it('should return success for valid persisted state', async () => {
      const validState = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      (persistenceStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(validState)
      );

      const result = await restoreState();

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(false);
      expect(result.state).toEqual(validState);
    });

    it('should handle missing persisted state', async () => {
      (persistenceStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = await restoreState();

      expect(result.success).toBe(false);
      expect(result.error).toContain('saved state');
    });

    it('should attempt recovery for corrupted state', async () => {
      (persistenceStorage.getItem as jest.Mock).mockReturnValue('corrupted');

      const result = await restoreState();

      expect(result.success).toBe(false);
      expect(result.recovered).toBe(true);
      expect(result.report).toBeDefined();
    });
  });

  describe('getStorageInfo', () => {
    it('should calculate storage usage', async () => {
      localStorageMock.setItem('test1', 'x'.repeat(500));
      localStorageMock.setItem('test2', 'y'.repeat(300));

      const info = await getStorageInfo();

      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
      expect(info.percentage).toBeGreaterThan(0);
      expect(info.percentage).toBeLessThan(100);
      expect(info.formattedUsed).toMatch(/\d+(\.\d+)?\s*(Bytes|KB|MB)/);
    });

    it('should use navigator.storage.estimate when available', async () => {
      const info = await getStorageInfo();

      expect(navigator.storage.estimate).toHaveBeenCalled();
      expect(info.quota).toBe(5 * 1024 * 1024);
    });
  });

  describe('exportBackup', () => {
    it('should create and download backup file', () => {
      const testState = { nodes: [], edges: [] };
      (persistenceStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(testState)
      );

      const createElementSpy = jest.spyOn(document, 'createElement');
      const createObjectURLSpy = jest
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:test');
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');

      exportBackup();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should throw error when no state exists', () => {
      (persistenceStorage.getItem as jest.Mock).mockReturnValue(null);

      // Suppress expected console error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => exportBackup()).toThrow('No state to export');
      
      // Restore console
      consoleSpy.mockRestore();
    });
  });

  describe('clearPersistedState', () => {
    it('should remove all app-related localStorage keys', () => {
      localStorageMock.setItem('promptgraph:state:v1', 'state');
      localStorageMock.setItem('promptgraph:settings', 'settings');
      localStorageMock.setItem('other-app', 'data');

      const removeItemSpy = jest.spyOn(persistenceStorage, 'removeItem');
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      clearPersistedState();

      expect(removeItemSpy).toHaveBeenCalledWith('promptgraph:state:v1');
      expect(localStorageMock.getItem('promptgraph:state:v1')).toBeNull();
      expect(localStorageMock.getItem('promptgraph:settings')).toBeNull();
      expect(localStorageMock.getItem('other-app')).toBe('data'); // Should not be removed
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'state-cleared' })
      );

      removeItemSpy.mockRestore();
      dispatchEventSpy.mockRestore();
    });
  });
});

describe('StateRecoveryDialog Component', () => {
  const mockReport = {
    recoverable: { nodes: 45, edges: 30, viewport: true, selection: false },
    corrupted: {
      nodes: ['bad1', 'bad2'],
      edges: ['edge3'],
      errors: ['Parse error']
    },
    recommendation: 'partial' as const,
    details: '90% of your data can be recovered.'
  };

  it('should render recovery statistics', () => {
    render(
      <StateRecoveryDialog
        report={mockReport}
        onAttemptRecovery={jest.fn()}
        onStartFresh={jest.fn()}
        onLoadFromFile={jest.fn()}
      />
    );

    expect(screen.getByText('State Recovery Needed')).toBeInTheDocument();
    expect(screen.getByText(/90% of your data/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument(); // Recoverable nodes
    expect(screen.getByText(/2 corrupted/)).toBeInTheDocument(); // Corrupted nodes
  });

  it('should show attempt recovery button for partial recovery', () => {
    const onAttemptRecovery = jest.fn();

    render(
      <StateRecoveryDialog
        report={mockReport}
        onAttemptRecovery={onAttemptRecovery}
        onStartFresh={jest.fn()}
        onLoadFromFile={jest.fn()}
      />
    );

    const recoveryButton = screen.getByText(/Attempt Recovery/);
    expect(recoveryButton).toBeInTheDocument();

    fireEvent.click(recoveryButton);
    expect(onAttemptRecovery).toHaveBeenCalled();
  });

  it('should not show recovery button for reset recommendation', () => {
    const resetReport = {
      ...mockReport,
      recommendation: 'reset' as const
    };

    render(
      <StateRecoveryDialog
        report={resetReport}
        onAttemptRecovery={jest.fn()}
        onStartFresh={jest.fn()}
        onLoadFromFile={jest.fn()}
      />
    );

    expect(screen.queryByText(/Attempt Recovery/)).not.toBeInTheDocument();
    expect(screen.getByText(/Start Fresh/)).toBeInTheDocument();
  });
});

describe('StorageInfo Component', () => {
  beforeEach(() => {
    (persistenceStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ nodes: [], edges: [] })
    );
  });

  it('should display storage information', async () => {
    render(<StorageInfo />);

    await waitFor(() => {
      expect(screen.getByText('Storage Information')).toBeInTheDocument();
      expect(screen.getByText(/Storage used:/)).toBeInTheDocument();
      expect(screen.getByText(/Available:/)).toBeInTheDocument();
    });
  });

  it('should show reset confirmation dialog', async () => {
    render(<StorageInfo />);

    await waitFor(() => {
      const resetButton = screen.getByText('Reset Storage');
      fireEvent.click(resetButton);
    });

    const matches = screen.getAllByText(
      (_, node) =>
        node?.textContent?.includes('This will permanently delete') ?? false
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should export backup on export button click', async () => {
    const exportBackupMock = jest.fn();
    jest
      .spyOn(stateRestorationModule, 'exportBackup')
      .mockImplementation(exportBackupMock);

    // Ensure Export button is enabled by reporting that persisted state exists
    (getPersistedStateInfo as unknown as jest.Mock).mockReturnValue({
      exists: true,
      size: 123,
      compressed: false,
      timestamp: Date.now()
    });

    render(<StorageInfo />);

    await waitFor(() => {
      const exportButton = screen.getByText('Export Backup');
      fireEvent.click(exportButton);
    });

    expect(exportBackupMock).toHaveBeenCalled();
  });
});

describe('RestorationLoader Component', () => {
  it('should render loading message', () => {
    render(<RestorationLoader message="Loading your graph..." />);

    expect(screen.getByText('Loading your graph...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should use default message when not provided', () => {
    render(<RestorationLoader />);

    expect(screen.getByText('Restoring your work...')).toBeInTheDocument();
  });
});

describe('RestorationToast Component', () => {
  it('should render success toast', () => {
    render(
      <RestorationToast type="success" message="State restored successfully" />
    );

    expect(screen.getByText('State restored successfully')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    render(<RestorationToast type="error" message="Failed to restore state" />);

    expect(screen.getByText('Failed to restore state')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should auto-close after timeout', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();

    render(
      <RestorationToast type="success" message="Test" onClose={onClose} />
    );

    jest.advanceTimersByTime(3000);

    expect(onClose).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
