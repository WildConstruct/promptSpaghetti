/**
 * Keyboard navigation hook for Epic 1 inline editing
 * Handles Tab/Shift+Tab navigation between editable nodes and Escape key handling
 */

import { useEffect, useCallback, useRef } from 'react';
import { Node } from 'reactflow';
import { InlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';

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

  // Get only editable nodes that are currently in edit mode
  const getEditableNodes = useCallback(() => {
    return nodes
      .filter(node => {
        const nodeData = node.data as any;
        return nodeData?.isEditing === true;
      })
      .sort((a, b) => {
        // Sort by position (top to bottom, left to right)
        if (Math.abs(a.position.y - b.position.y) > 20) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });
  }, [nodes]);

  // Find next/previous node in tab order
  const getNextNode = useCallback(
    (currentNodeId: string, reverse: boolean = false) => {
      const editableNodes = getEditableNodes();
      if (editableNodes.length === 0) return null;

      const currentIndex = editableNodes.findIndex(
        node => node.id === currentNodeId
      );

      if (currentIndex === -1) {
        // If current node not found, return first/last based on direction
        return reverse
          ? editableNodes[editableNodes.length - 1]
          : editableNodes[0];
      }

      let nextIndex: number;
      if (reverse) {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = editableNodes.length - 1; // Wrap to last
        }
      } else {
        nextIndex = currentIndex + 1;
        if (nextIndex >= editableNodes.length) {
          nextIndex = 0; // Wrap to first
        }
      }

      return editableNodes[nextIndex];
    },
    [getEditableNodes]
  );

  // Auto-focus first generated node
  const autoFocusFirstNode = useCallback(() => {
    const editableNodes = getEditableNodes();
    if (editableNodes.length > 0 && !selectedNodeId) {
      const firstNode = editableNodes[0];
      onNodeSelect(firstNode.id);

      // Focus the actual input element after a short delay
      setTimeout(() => {
        const inputElement = document.querySelector(
          `[data-node-id="${firstNode.id}"] input, [data-node-id="${firstNode.id}"] textarea`
        ) as HTMLElement;
        inputElement?.focus();
      }, 100);
    }
  }, [getEditableNodes, selectedNodeId, onNodeSelect]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Tab navigation
      if (event.key === 'Tab') {
        event.preventDefault();

        if (!selectedNodeId) {
          autoFocusFirstNode();
          return;
        }

        const nextNode = getNextNode(selectedNodeId, event.shiftKey);
        if (nextNode) {
          onNodeSelect(nextNode.id);

          // Focus the input element in the next node
          setTimeout(() => {
            const inputElement = document.querySelector(
              `[data-node-id="${nextNode.id}"] input, [data-node-id="${nextNode.id}"] textarea`
            ) as HTMLElement;
            inputElement?.focus();
          }, 50);
        }
      }

      // Escape key handling
      if (event.key === 'Escape') {
        if (selectedNodeId && onEditCancel) {
          onEditCancel(selectedNodeId);
        }
        if (onEscapePress) {
          onEscapePress();
        }
      }

      // Enter key to confirm current edit and move to next
      if (event.key === 'Enter' && !event.shiftKey) {
        const target = event.target as HTMLElement;

        // Don't interfere with textarea line breaks
        if (target.tagName === 'TEXTAREA') {
          return;
        }

        event.preventDefault();

        if (selectedNodeId) {
          const nextNode = getNextNode(selectedNodeId, false);
          if (nextNode) {
            onNodeSelect(nextNode.id);

            setTimeout(() => {
              const inputElement = document.querySelector(
                `[data-node-id="${nextNode.id}"] input, [data-node-id="${nextNode.id}"] textarea`
              ) as HTMLElement;
              inputElement?.focus();
            }, 50);
          }
        }
      }
    },
    [
      enabled,
      selectedNodeId,
      autoFocusFirstNode,
      getNextNode,
      onNodeSelect,
      onEditCancel,
      onEscapePress
    ]
  );

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Auto-focus on mount if nodes are in edit mode
  useEffect(() => {
    if (enabled) {
      autoFocusFirstNode();
    }
  }, [enabled, autoFocusFirstNode]);

  // Track focus history for better navigation
  useEffect(() => {
    if (selectedNodeId && !focusHistoryRef.current.includes(selectedNodeId)) {
      focusHistoryRef.current.push(selectedNodeId);

      // Keep history limited
      if (focusHistoryRef.current.length > 10) {
        focusHistoryRef.current.shift();
      }
    }
  }, [selectedNodeId]);

  return {
    autoFocusFirstNode,
    getEditableNodes,
    getNextNode,
    focusHistory: focusHistoryRef.current
  };
}
