/**
 * Tests for useUnsavedChanges hook - Story 6.1 (AC: 5)
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn<unknown[], unknown>();
const mockRemoveEventListener = jest.fn<unknown[], unknown>();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener
});

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sets up beforeunload event listener when hasUnsavedChanges is true', () => {
    renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  test('removes beforeunload event listener on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  test('beforeunload handler prevents default when hasUnsavedChanges is true', () => {
    renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    // Get the registered beforeunload handler
    const beforeUnloadHandler = mockAddEventListener.mock.calls
      .find(call => call[0] === 'beforeunload')?.[1];

    expect(beforeUnloadHandler).toBeDefined();

    // Create a mock event
    const mockEvent = {
      preventDefault: jest.fn<unknown[], unknown>(),
      returnValue: undefined
    };

    // Call the handler
    const result = beforeUnloadHandler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?');
    expect(result).toBe('You have unsaved changes. Are you sure you want to leave?');
  });

  test('beforeunload handler does not prevent default when hasUnsavedChanges is false', () => {
    renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: false,
      projectName: 'Test Project'
    }));

    // Get the registered beforeunload handler
    const beforeUnloadHandler = mockAddEventListener.mock.calls
      .find(call => call[0] === 'beforeunload')?.[1];

    expect(beforeUnloadHandler).toBeDefined();

    // Create a mock event
    const mockEvent = {
      preventDefault: jest.fn<unknown[], unknown>(),
      returnValue: undefined
    };

    // Call the handler
    const result = beforeUnloadHandler(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.returnValue).toBeUndefined();
    expect(result).toBeUndefined();
  });

  test('confirmNavigation executes callback immediately when no unsaved changes', () => {
    const callback = jest.fn<unknown[], unknown>();
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: false,
      projectName: 'Test Project'
    }));

    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.showUnsavedDialog).toBe(false);
  });

  test('confirmNavigation shows dialog when hasUnsavedChanges is true', () => {
    const callback = jest.fn<unknown[], unknown>();
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    act(() => {
      result.current.confirmNavigation('creating a new project', callback);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.showUnsavedDialog).toBe(true);
    expect(result.current.dialogAction).toBe('creating a new project');
  });

  test('handleSave calls onSave and executes callback on success', async () => {
    const callback = jest.fn<unknown[], unknown>();
    const onSave = jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown);
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project',
      onSave
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle save
    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.showUnsavedDialog).toBe(false);
  });

  test('handleSave keeps dialog open when save fails', async () => {
    const callback = jest.fn<unknown[], unknown>();
    const onSave = jest.fn<unknown[], unknown>().mockResolvedValue(false as unknown);
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project',
      onSave
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle save
    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.showUnsavedDialog).toBe(true);
  });

  test('handleSave handles save errors gracefully', async () => {
    const callback = jest.fn<unknown[], unknown>();
    const onSave = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Save failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project',
      onSave
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle save
    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.showUnsavedDialog).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Error during save operation:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  test('handleSave executes callback when no onSave provided', async () => {
    const callback = jest.fn<unknown[], unknown>();
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle save
    await act(async () => {
      await result.current.handleSave();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.showUnsavedDialog).toBe(false);
  });

  test('handleDontSave executes callback and closes dialog', () => {
    const callback = jest.fn<unknown[], unknown>();
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle don't save
    act(() => {
      result.current.handleDontSave();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.showUnsavedDialog).toBe(false);
  });

  test('handleCancel closes dialog without executing callback', () => {
    const callback = jest.fn<unknown[], unknown>();
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    // First show the dialog
    act(() => {
      result.current.confirmNavigation('test action', callback);
    });

    // Then handle cancel
    act(() => {
      result.current.handleCancel();
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.showUnsavedDialog).toBe(false);
  });

  test('multiple confirmNavigation calls override each other', () => {
    const callback1 = jest.fn<unknown[], unknown>();
    const callback2 = jest.fn<unknown[], unknown>();
    
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: true,
      projectName: 'Test Project'
    }));

    // First navigation
    act(() => {
      result.current.confirmNavigation('action 1', callback1);
    });

    expect(result.current.dialogAction).toBe('action 1');

    // Second navigation (should override first)
    act(() => {
      result.current.confirmNavigation('action 2', callback2);
    });

    expect(result.current.dialogAction).toBe('action 2');

    // Handle don't save - should execute only the second callback
    act(() => {
      result.current.handleDontSave();
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('initial state is correct', () => {
    const { result } = renderHook(() => useUnsavedChanges({
      hasUnsavedChanges: false,
      projectName: 'Test Project'
    }));

    expect(result.current.showUnsavedDialog).toBe(false);
    expect(result.current.dialogAction).toBe('');
    expect(typeof result.current.confirmNavigation).toBe('function');
    expect(typeof result.current.handleSave).toBe('function');
    expect(typeof result.current.handleDontSave).toBe('function');
    expect(typeof result.current.handleCancel).toBe('function');
  });
});