/**
 * Tests for keyboard navigation hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { Node } from 'reactflow';

describe('useKeyboardNavigation', () => {
  const createMockNode = (id: string, x: number, y: number, isEditing: boolean = true): Node => ({
    id,
    type: 'default',
    position: { x, y },
    data: { isEditing, type: 'TextBlock', value: `Node ${id}` }
  });

  const mockNodes: Node[] = [
    createMockNode('node-1', 100, 100),
    createMockNode('node-2', 350, 100),
    createMockNode('node-3', 100, 250),
    createMockNode('node-4', 350, 250, false), // Not editing
  ];

  const defaultProps = {
    nodes: mockNodes,
    selectedNodeId: null,
    onNodeSelect: jest.fn(),
    onEscapePress: jest.fn(),
    onEditCancel: jest.fn(),
    enabled: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEditableNodes', () => {
    it('should return only nodes in edit mode', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      const editableNodes = result.current.getEditableNodes();
      expect(editableNodes).toHaveLength(3);
      expect(editableNodes.map(n => n.id)).toEqual(['node-1', 'node-2', 'node-3']);
    });

    it('should sort nodes by position (top to bottom, left to right)', () => {
      const unsortedNodes = [
        createMockNode('node-a', 350, 250),
        createMockNode('node-b', 100, 100),
        createMockNode('node-c', 100, 250),
        createMockNode('node-d', 350, 100),
      ];

      const { result } = renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, nodes: unsortedNodes })
      );
      
      const editableNodes = result.current.getEditableNodes();
      expect(editableNodes.map(n => n.id)).toEqual(['node-b', 'node-d', 'node-c', 'node-a']);
    });
  });

  describe('getNextNode', () => {
    it('should get next node in tab order', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      const nextNode = result.current.getNextNode('node-1', false);
      expect(nextNode?.id).toBe('node-2');
    });

    it('should get previous node with reverse flag', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      const prevNode = result.current.getNextNode('node-2', true);
      expect(prevNode?.id).toBe('node-1');
    });

    it('should wrap around at boundaries', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      // Forward wrap
      const nextFromLast = result.current.getNextNode('node-3', false);
      expect(nextFromLast?.id).toBe('node-1');
      
      // Backward wrap
      const prevFromFirst = result.current.getNextNode('node-1', true);
      expect(prevFromFirst?.id).toBe('node-3');
    });

    it('should return first node if current node not found', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      const node = result.current.getNextNode('non-existent', false);
      expect(node?.id).toBe('node-1');
    });
  });

  describe('autoFocusFirstNode', () => {
    beforeEach(() => {
      // Mock querySelector
      document.querySelector = jest.fn().mockReturnValue({
        focus: jest.fn()
      });
    });

    it('should select and focus first editable node when no node is selected', () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      act(() => {
        result.current.autoFocusFirstNode();
      });
      
      expect(defaultProps.onNodeSelect).toHaveBeenCalledWith('node-1');
      
      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(document.querySelector).toHaveBeenCalledWith('[data-node-id="node-1"] input, [data-node-id="node-1"] textarea');
      
      jest.useRealTimers();
    });

    it('should not auto-focus if a node is already selected', () => {
      const { result } = renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-2' })
      );
      
      act(() => {
        result.current.autoFocusFirstNode();
      });
      
      expect(defaultProps.onNodeSelect).not.toHaveBeenCalled();
    });
  });

  describe('keyboard event handling', () => {
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null;

    beforeEach(() => {
      // Capture the keydown event listener
      document.addEventListener = jest.fn((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler as (event: KeyboardEvent) => void;
        }
      });
      
      document.removeEventListener = jest.fn();
      
      // Mock querySelector for focus
      document.querySelector = jest.fn().mockReturnValue({
        focus: jest.fn()
      });
    });

    it('should handle Tab key navigation', () => {
      jest.useFakeTimers();
      
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-1' })
      );
      
      // Simulate Tab key press
      act(() => {
        keydownHandler?.({
          key: 'Tab',
          shiftKey: false,
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onNodeSelect).toHaveBeenCalledWith('node-2');
      
      jest.useRealTimers();
    });

    it('should handle Shift+Tab for backward navigation', () => {
      jest.useFakeTimers();
      
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-2' })
      );
      
      // Simulate Shift+Tab key press
      act(() => {
        keydownHandler?.({
          key: 'Tab',
          shiftKey: true,
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onNodeSelect).toHaveBeenCalledWith('node-1');
      
      jest.useRealTimers();
    });

    it('should handle Escape key to cancel edit', () => {
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-1' })
      );
      
      // Simulate Escape key press
      act(() => {
        keydownHandler?.({
          key: 'Escape',
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onEditCancel).toHaveBeenCalledWith('node-1');
      expect(defaultProps.onEscapePress).toHaveBeenCalled();
    });

    it('should handle Enter key to move to next node', () => {
      jest.useFakeTimers();
      
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-1' })
      );
      
      // Simulate Enter key press on input (not textarea)
      act(() => {
        keydownHandler?.({
          key: 'Enter',
          shiftKey: false,
          target: { tagName: 'INPUT' },
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onNodeSelect).toHaveBeenCalledWith('node-2');
      
      jest.useRealTimers();
    });

    it('should not handle Enter key in textarea elements', () => {
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, selectedNodeId: 'node-1' })
      );
      
      // Simulate Enter key press in textarea
      act(() => {
        keydownHandler?.({
          key: 'Enter',
          shiftKey: false,
          target: { tagName: 'TEXTAREA' },
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onNodeSelect).not.toHaveBeenCalled();
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardNavigation(defaultProps));
      
      unmount();
      
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('focus history tracking', () => {
    it('should track focus history', () => {
      const { result, rerender } = renderHook(
        (props) => useKeyboardNavigation(props),
        { initialProps: defaultProps }
      );
      
      expect(result.current.focusHistory).toEqual([]);
      
      // Update selected node
      rerender({ ...defaultProps, selectedNodeId: 'node-1' });
      expect(result.current.focusHistory).toEqual(['node-1']);
      
      rerender({ ...defaultProps, selectedNodeId: 'node-2' });
      expect(result.current.focusHistory).toEqual(['node-1', 'node-2']);
    });

    it('should limit focus history to 10 items', () => {
      const { result, rerender } = renderHook(
        (props) => useKeyboardNavigation(props),
        { initialProps: defaultProps }
      );
      
      // Add 12 items to history
      for (let i = 1; i <= 12; i++) {
        rerender({ ...defaultProps, selectedNodeId: `node-${i}` });
      }
      
      expect(result.current.focusHistory).toHaveLength(10);
      expect(result.current.focusHistory[0]).toBe('node-3'); // First two should be removed
      expect(result.current.focusHistory[9]).toBe('node-12');
    });
  });

  describe('disabled state', () => {
    it('should not handle keyboard events when disabled', () => {
      let keydownHandler: ((event: KeyboardEvent) => void) | null = null;
      
      document.addEventListener = jest.fn((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler as (event: KeyboardEvent) => void;
        }
      });
      
      renderHook(() => 
        useKeyboardNavigation({ ...defaultProps, enabled: false, selectedNodeId: 'node-1' })
      );
      
      // Simulate Tab key press
      act(() => {
        keydownHandler?.({
          key: 'Tab',
          shiftKey: false,
          preventDefault: jest.fn()
        } as any);
      });
      
      expect(defaultProps.onNodeSelect).not.toHaveBeenCalled();
    });
  });
});