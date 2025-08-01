/**
 * Keyboard navigation hook for Epic 1 inline editing
 * REFACTORED VERSION - Addresses memory leaks and improves performance
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { Node } from 'reactflow';

export interface KeyboardNavigationOptions {
  nodes: Node[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onEscapePress?: () => void;
  onEditCancel?: (nodeId: string) => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  nodes,
  selectedNodeId,
  onNodeSelect,
  onEscapePress,
  onEditCancel,
  enabled = true
}: KeyboardNavigationOptions) {
  const focusHistoryRef = useRef<string[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const lastFocusTimeRef = useRef<number>(0);

  // Clean up timeouts on unmount or when dependencies change
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // Memoize editable nodes to prevent unnecessary recalculations
  const getEditableNodes = useMemo(() => {
    return nodes
      .filter(node => node.data?.isEditing === true)
      .sort((a, b) => {
        // Sort by position (top to bottom, left to right)
        if (Math.abs(a.position.y - b.position.y) > 20) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });
  }, [nodes]);

  // Find next/previous node in tab order
  const getNextNode = useCallback((currentNodeId: string, reverse: boolean = false) => {
    if (getEditableNodes.length === 0) return null;

    const currentIndex = getEditableNodes.findIndex(node => node.id === currentNodeId);
    
    if (currentIndex === -1) {
      // If current node not found, return first/last based on direction
      return reverse ? getEditableNodes[getEditableNodes.length - 1] : getEditableNodes[0];
    }

    let nextIndex: number;
    if (reverse) {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = getEditableNodes.length - 1; // Wrap to last
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= getEditableNodes.length) {
        nextIndex = 0; // Wrap to first
      }
    }

    return getEditableNodes[nextIndex];
  }, [getEditableNodes]);

  // Safe focus function that manages timeouts properly
  const focusNodeInput = useCallback((nodeId: string, delay: number = 50) => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Debounce rapid focus calls
    const now = Date.now();
    if (now - lastFocusTimeRef.current < 30) {
      return;
    }
    lastFocusTimeRef.current = now;

    const timeoutId = window.setTimeout(() => {
      try {
        const inputElement = document.querySelector(
          `[data-node-id="${nodeId}"] input, [data-node-id="${nodeId}"] textarea`
        ) as HTMLElement;
        
        if (inputElement && document.contains(inputElement)) {
          inputElement.focus();
          
          // Ensure element is visible in viewport
          inputElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      } catch (error) {
        console.warn('Failed to focus element:', error);
      }
      
      // Remove this timeout from tracking
      const index = timeoutsRef.current.indexOf(timeoutId);
      if (index > -1) {
        timeoutsRef.current.splice(index, 1);
      }
    }, delay);

    // Track timeout for cleanup
    timeoutsRef.current.push(timeoutId);
  }, []);

  // Auto-focus first generated node
  const autoFocusFirstNode = useCallback(() => {
    if (getEditableNodes.length > 0 && !selectedNodeId) {
      const firstNode = getEditableNodes[0];
      onNodeSelect(firstNode.id);
      focusNodeInput(firstNode.id, 100);
    }
  }, [getEditableNodes, selectedNodeId, onNodeSelect, focusNodeInput]);

  // Handle keyboard events with improved performance
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in a non-node input
    const target = event.target as HTMLElement;
    const isNodeInput = target.closest('[data-node-id]');
    
    // Tab navigation
    if (event.key === 'Tab' && (isNodeInput || !target.matches('input, textarea'))) {
      event.preventDefault();
      
      if (!selectedNodeId) {
        autoFocusFirstNode();
        return;
      }

      const nextNode = getNextNode(selectedNodeId, event.shiftKey);
      if (nextNode) {
        onNodeSelect(nextNode.id);
        focusNodeInput(nextNode.id);
      }
    }

    // Escape key handling
    if (event.key === 'Escape' && isNodeInput) {
      event.preventDefault();
      event.stopPropagation();
      
      if (selectedNodeId && onEditCancel) {
        onEditCancel(selectedNodeId);
      }
      if (onEscapePress) {
        onEscapePress();
      }
    }

    // Enter key to confirm current edit and move to next
    if (event.key === 'Enter' && !event.shiftKey && isNodeInput) {
      // Don't interfere with textarea line breaks
      if (target.tagName === 'TEXTAREA') {
        return;
      }

      event.preventDefault();
      
      if (selectedNodeId) {
        const nextNode = getNextNode(selectedNodeId, false);
        if (nextNode) {
          onNodeSelect(nextNode.id);
          focusNodeInput(nextNode.id);
        }
      }
    }
  }, [
    enabled, 
    selectedNodeId, 
    autoFocusFirstNode, 
    getNextNode, 
    onNodeSelect, 
    onEditCancel, 
    onEscapePress,
    focusNodeInput
  ]);

  // Set up event listeners with proper cleanup
  useEffect(() => {
    if (!enabled) return;

    // Use capture phase for better control
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, handleKeyDown]);

  // Auto-focus on mount if nodes are in edit mode
  useEffect(() => {
    if (enabled && getEditableNodes.length > 0 && !selectedNodeId) {
      // Small delay to ensure DOM is ready
      const timeoutId = window.setTimeout(() => {
        autoFocusFirstNode();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, getEditableNodes.length, selectedNodeId, autoFocusFirstNode]);

  // Track focus history with size limit
  useEffect(() => {
    if (selectedNodeId && !focusHistoryRef.current.includes(selectedNodeId)) {
      focusHistoryRef.current.push(selectedNodeId);
      
      // Keep history limited to prevent memory growth
      if (focusHistoryRef.current.length > 10) {
        focusHistoryRef.current = focusHistoryRef.current.slice(-10);
      }
    }
  }, [selectedNodeId]);

  return {
    autoFocusFirstNode,
    getEditableNodes,
    getNextNode,
    focusHistory: focusHistoryRef.current,
    focusNodeInput
  };
}