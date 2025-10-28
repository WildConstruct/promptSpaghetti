/**
 * Tests for autosave functionality
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useAutosave } from '../hooks/useAutosave';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { persistenceStorage } from '../utils/persistenceUtils';

// Mock modules
jest.mock('../graphStore');
jest.mock('../graphStorePersisted');
jest.mock('../utils/persistenceUtils');

// Note: We opt into fake timers within specific suites to avoid cross-test leakage.

// Mock graphStore
const mockGraphStore = {
  getState: jest.fn(() => ({
    nodes: [],
    edges: []
  })),
  subscribe: jest.fn((selector, callback) => {
    // Return unsubscribe function
    return jest.fn();
  })
};

// Mock persistence functions
const mockPersistenceStorage = persistenceStorage as jest.Mocked<
  typeof persistenceStorage
>;
const mockUsePersistenceEnabled = jest.fn(() => true);

// Set up mocks
jest.mock('../graphStore', () => ({
  useGraphStore: () => mockGraphStore
}));

jest.mock('../graphStorePersisted', () => ({
  usePersistenceEnabled: () => mockUsePersistenceEnabled()
}));

describe('useAutosave Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockUsePersistenceEnabled.mockReturnValue(true);
    mockPersistenceStorage.setItem = jest.fn();
    mockPersistenceStorage.getItem = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with saved status', () => {
      const { result } = renderHook(() => useAutosave());

      expect(result.current.status).toBe('saved');
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.conflictDetected).toBe(false);
    });

    it('should respect enabled option', () => {
      const { result } = renderHook(() => useAutosave({ enabled: false }));

      expect(result.current.isEnabled).toBe(false);
      expect(mockGraphStore.subscribe).not.toHaveBeenCalled();
    });

    it('should respect persistence feature flag', () => {
      mockUsePersistenceEnabled.mockReturnValue(false);

      const { result } = renderHook(() => useAutosave());

      expect(result.current.isEnabled).toBe(false);
      expect(mockGraphStore.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('Debounced Saving', () => {
    it('should debounce save calls', async () => {
      const { result } = renderHook(() => useAutosave({ debounceMs: 1000 }));

      // Trigger multiple saves
      act(() => {
        // Simulate store changes
        const subscribeCallback = mockGraphStore.subscribe.mock.calls[0][1];
        subscribeCallback();
        subscribeCallback();
        subscribeCallback();
      });

      expect(result.current.status).toBe('unsaved');

      // Advance time but not enough to trigger save
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockPersistenceStorage.setItem).not.toHaveBeenCalled();

      // Advance time to trigger save
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockPersistenceStorage.setItem).toHaveBeenCalledTimes(1);
      });
    });

    it('should cancel pending saves when saveNow is called', async () => {
      const { result } = renderHook(() => useAutosave({ debounceMs: 5000 }));

      // Trigger debounced save
      act(() => {
        const subscribeCallback = mockGraphStore.subscribe.mock.calls[0][1];
        subscribeCallback();
      });

      expect(result.current.status).toBe('unsaved');

      // Call saveNow before debounce completes
      await act(async () => {
        await result.current.saveNow();
      });

      expect(mockPersistenceStorage.setItem).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('saved');

      // Advance timers to when debounced save would trigger
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still only have one save call
      expect(mockPersistenceStorage.setItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save Status Tracking', () => {
    it('should update status during save lifecycle', async () => {
      const { result } = renderHook(() => useAutosave());

      expect(result.current.status).toBe('saved');

      // Trigger save
      await act(async () => {
        await result.current.saveNow();
      });

      expect(result.current.status).toBe('saved');
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });

    it('should handle save errors', async () => {
      mockPersistenceStorage.setItem.mockImplementation(() => {
        throw new Error('Save failed');
      });

      const onError = jest.fn();
      const { result } = renderHook(() => useAutosave({ onError }));

      await act(async () => {
        await result.current.saveNow();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Save failed');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle quota exceeded errors', async () => {
      mockPersistenceStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => useAutosave());

      await act(async () => {
        await result.current.saveNow();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('Storage quota exceeded');
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage-quota-exceeded'
        })
      );

      dispatchEventSpy.mockRestore();
    });
  });

  describe('Multi-tab Synchronization', () => {
    it('should detect conflicts from storage events', () => {
      const onConflict = jest.fn();
      const { result } = renderHook(() => useAutosave({ onConflict }));

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'promptgraph:state:v1',
        newValue: JSON.stringify({
          nodes: [],
          edges: [],
          version: 5
        })
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.conflictDetected).toBe(true);
      expect(result.current.remoteVersion).toBe(5);
      expect(onConflict).toHaveBeenCalledWith(0, 5);
    });

    it('should resolve conflicts by accepting remote changes', () => {
      const reloadSpy = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true
      });

      const { result } = renderHook(() => useAutosave());

      act(() => {
        result.current.acceptRemoteChanges();
      });

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should resolve conflicts by keeping local changes', async () => {
      const { result } = renderHook(() => useAutosave());

      // Set up conflict state
      const storageEvent = new StorageEvent('storage', {
        key: 'promptgraph:state:v1',
        newValue: JSON.stringify({
          nodes: [],
          edges: [],
          version: 5
        })
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.conflictDetected).toBe(true);

      // Keep local changes
      await act(async () => {
        await result.current.keepLocalChanges();
      });

      expect(result.current.conflictDetected).toBe(false);
      expect(mockPersistenceStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should use requestIdleCallback for large graphs', async () => {
      const requestIdleCallbackSpy = jest.fn(callback => {
        callback({ timeRemaining: () => 50 });
        return 1;
      });

      window.requestIdleCallback = requestIdleCallbackSpy;

      mockGraphStore.getState.mockReturnValue({
        nodes: new Array(1001).fill({ id: 'node', type: 'test' }),
        edges: []
      });

      const { result } = renderHook(() =>
        useAutosave({ useIdleCallback: true })
      );

      await act(async () => {
        await result.current.saveNow();
      });

      expect(requestIdleCallbackSpy).toHaveBeenCalled();
    });

    it('should measure save performance', async () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => useAutosave());

      await act(async () => {
        await result.current.saveNow();
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'autosave-performance'
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should prevent concurrent saves', async () => {
      const { result } = renderHook(() => useAutosave());

      // Start multiple saves concurrently
      const saves = Promise.all([
        result.current.saveNow(),
        result.current.saveNow(),
        result.current.saveNow()
      ]);

      await act(async () => {
        await saves;
      });

      // Should only save once despite multiple calls
      expect(mockPersistenceStorage.setItem).toHaveBeenCalledTimes(1);
    });
  });
});

describe('AutosaveIndicator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePersistenceEnabled.mockReturnValue(true);
  });

  it('should render save status', () => {
    render(<AutosaveIndicator />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should show relative timestamp', () => {
    jest.useRealTimers(); // Use real timers for this test

    // Mock hook to return a specific lastSaved date
    const mockDate = new Date();
    mockDate.setMinutes(mockDate.getMinutes() - 5);

    jest.spyOn(require('../hooks/useAutosave'), 'useAutosave').mockReturnValue({
      status: 'saved',
      lastSaved: mockDate,
      error: null,
      conflictDetected: false,
      remoteVersion: null,
      isEnabled: true,
      saveNow: jest.fn(),
      acceptRemoteChanges: jest.fn(),
      keepLocalChanges: jest.fn()
    });

    render(<AutosaveIndicator showTimestamp={true} />);

    expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
  });

  it('should show conflict dialog when conflict detected', () => {
    jest.spyOn(require('../hooks/useAutosave'), 'useAutosave').mockReturnValue({
      status: 'saved',
      lastSaved: null,
      error: null,
      conflictDetected: true,
      remoteVersion: 5,
      isEnabled: true,
      saveNow: jest.fn(),
      acceptRemoteChanges: jest.fn(),
      keepLocalChanges: jest.fn()
    });

    render(<AutosaveIndicator />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/Changes Detected in Another Tab/)
    ).toBeInTheDocument();
    expect(screen.getByText('Use Their Changes')).toBeInTheDocument();
    expect(screen.getByText('Keep My Changes')).toBeInTheDocument();
  });

  it('should not render when autosave is disabled', () => {
    jest.spyOn(require('../hooks/useAutosave'), 'useAutosave').mockReturnValue({
      status: 'saved',
      lastSaved: null,
      error: null,
      conflictDetected: false,
      remoteVersion: null,
      isEnabled: false,
      saveNow: jest.fn(),
      acceptRemoteChanges: jest.fn(),
      keepLocalChanges: jest.fn()
    });

    const { container } = render(<AutosaveIndicator />);

    expect(container.firstChild).toBeNull();
  });

  it('should apply correct position styles', () => {
    // Ensure the indicator renders by mocking the autosave hook to be enabled
    jest.spyOn(require('../hooks/useAutosave'), 'useAutosave').mockReturnValue({
      status: 'saved',
      lastSaved: null,
      error: null,
      conflictDetected: false,
      remoteVersion: null,
      isEnabled: true,
      saveNow: jest.fn(),
      acceptRemoteChanges: jest.fn(),
      keepLocalChanges: jest.fn()
    });

    render(<AutosaveIndicator position="bottom-left" />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveStyle({
      bottom: '20px',
      left: '20px'
    });
  });
});
