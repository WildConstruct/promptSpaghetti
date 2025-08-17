/**
 * Tests for usePanelResize hook
 */

import { renderHook, act } from '@testing-library/react';
import { usePanelResize } from '../usePanelResize';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('usePanelResize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize with default width', () => {
    const { result } = renderHook(() => 
      usePanelResize({ defaultWidth: 300 })
    );
    
    expect(result.current.width).toBe(300);
    expect(result.current.isResizing).toBe(false);
  });
  
  it('should load saved width from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('400');
    
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        storageKey: 'testPanel',
      })
    );
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testPanel');
    expect(result.current.width).toBe(400);
  });
  
  it('should constrain width to min/max bounds', () => {
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        minWidth: 200,
        maxWidth: 500,
      })
    );
    
    act(() => {
      result.current.setWidth(100); // Below min
    });
    expect(result.current.width).toBe(200);
    
    act(() => {
      result.current.setWidth(600); // Above max
    });
    expect(result.current.width).toBe(500);
    
    act(() => {
      result.current.setWidth(350); // Within bounds
    });
    expect(result.current.width).toBe(350);
  });
  
  it('should save width to localStorage', () => {
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        storageKey: 'testPanel',
      })
    );
    
    act(() => {
      result.current.setWidth(400);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testPanel', '400');
  });
  
  it('should reset to default width', () => {
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
      })
    );
    
    act(() => {
      result.current.setWidth(400);
    });
    expect(result.current.width).toBe(400);
    
    act(() => {
      result.current.resetWidth();
    });
    expect(result.current.width).toBe(300);
  });
  
  it('should handle mouse down for resize', () => {
    const { result } = renderHook(() => 
      usePanelResize({ defaultWidth: 300 })
    );
    
    const mockEvent = {
      preventDefault: jest.fn(),
      clientX: 100,
    } as unknown as React.MouseEvent;
    
    act(() => {
      result.current.handleMouseDown(mockEvent);
    });
    
    expect(result.current.isResizing).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(document.body.style.cursor).toBe('col-resize');
  });
  
  it('should handle invalid localStorage values gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid');
    
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        storageKey: 'testPanel',
      })
    );
    
    expect(result.current.width).toBe(300); // Falls back to default
  });
  
  it('should ignore localStorage errors', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage is full');
    });
    
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        storageKey: 'testPanel',
      })
    );
    
    // Should not throw
    act(() => {
      result.current.setWidth(400);
    });
    
    expect(result.current.width).toBe(400);
  });
  
  it('should call onResize callback when width changes', () => {
    const onResize = jest.fn();
    
    const { result } = renderHook(() => 
      usePanelResize({ 
        defaultWidth: 300,
        onResize,
      })
    );
    
    act(() => {
      result.current.setWidth(400);
    });
    
    expect(onResize).toHaveBeenCalledWith(400);
  });
});