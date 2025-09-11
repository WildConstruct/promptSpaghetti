import React from 'react';
import { Node, Edge } from 'reactflow';
import { NodeContextMenu, ContextMenuPosition } from '../nodes/NodeContextMenu';
import { CanvasContextMenu } from '../nodes/CanvasContextMenu';

interface GraphContextMenusProps {
  // Node context menu
  nodeContextMenuPosition: ContextMenuPosition | null;
  contextMenuNodeId: string | null;
  nodes: Node[];
  edges: Edge[];
  onNodeContextMenuClose: () => void;
  onNodeDuplicate: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeCopy: (nodeId: string) => void;
  onNodeCut: (nodeId: string) => void;
  onNodePaste: () => void;
  onNodeEdit: (nodeId: string) => void;
  onNodeGroup: (nodeIds: string[]) => void;
  onNodeUngroup: (nodeId: string) => void;
  onNodeLock: (nodeId: string) => void;
  onNodeUnlock: (nodeId: string) => void;
  onNodeSaveAsPreset: (nodeId: string) => void;
  
  // Canvas context menu
  canvasContextMenuPosition: ContextMenuPosition | null;
  onCanvasContextMenuClose: () => void;
  onCanvasAddNode: (type: string, position: { x: number; y: number }) => void;
  onCanvasPaste: (position: { x: number; y: number }) => void;
  onCanvasSelectAll: () => void;
  onCanvasDeselectAll: () => void;
  onCanvasUndo: () => void;
  onCanvasRedo: () => void;
  onCanvasZoomIn: () => void;
  onCanvasZoomOut: () => void;
  onCanvasZoomToFit: () => void;
  onCanvasArrange: () => void;
  
  // Shared
  canUndo: boolean;
  canRedo: boolean;
  hasClipboard: boolean;
}

/**
 * Container for all graph context menus
 */
export const GraphContextMenus: React.FC<GraphContextMenusProps> = ({
  // Node context menu props
  nodeContextMenuPosition,
  contextMenuNodeId,
  nodes,
  edges,
  onNodeContextMenuClose,
  onNodeDuplicate,
  onNodeDelete,
  onNodeCopy,
  onNodeCut,
  onNodePaste,
  onNodeEdit,
  onNodeGroup,
  onNodeUngroup,
  onNodeLock,
  onNodeUnlock,
  onNodeSaveAsPreset,
  
  // Canvas context menu props
  canvasContextMenuPosition,
  onCanvasContextMenuClose,
  onCanvasAddNode,
  onCanvasPaste,
  onCanvasSelectAll,
  onCanvasDeselectAll,
  onCanvasUndo,
  onCanvasRedo,
  onCanvasZoomIn,
  onCanvasZoomOut,
  onCanvasZoomToFit,
  onCanvasArrange,
  
  // Shared props
  canUndo,
  canRedo,
  hasClipboard
}) => {
  // Find the node for context menu
  const contextMenuNode = contextMenuNodeId 
    ? nodes.find(n => n.id === contextMenuNodeId) 
    : null;

  // Get selected nodes for group operations
  const selectedNodes = nodes.filter(n => n.selected);
  const hasSelection = selectedNodes.length > 0;
  const canGroup = selectedNodes.length > 1;

  return (
    <>
      {/* Node Context Menu */}
      {nodeContextMenuPosition && contextMenuNode && (
        <NodeContextMenu
          position={nodeContextMenuPosition}
          node={contextMenuNode}
          onClose={onNodeContextMenuClose}
          actions={[
            {
              label: 'Edit',
              icon: '✏️',
              onClick: () => {
                onNodeEdit(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              shortcut: 'Enter'
            },
            {
              label: 'Duplicate',
              icon: '📋',
              onClick: () => {
                onNodeDuplicate(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              shortcut: '⌘D'
            },
            {
              label: 'Copy',
              icon: '📄',
              onClick: () => {
                onNodeCopy(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              shortcut: '⌘C'
            },
            {
              label: 'Cut',
              icon: '✂️',
              onClick: () => {
                onNodeCut(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              shortcut: '⌘X'
            },
            {
              label: 'Paste',
              icon: '📋',
              onClick: () => {
                onNodePaste();
                onNodeContextMenuClose();
              },
              shortcut: '⌘V',
              disabled: !hasClipboard
            },
            { type: 'separator' },
            {
              label: canGroup ? 'Group Selection' : 'Group',
              icon: '📁',
              onClick: () => {
                if (canGroup) {
                  onNodeGroup(selectedNodes.map(n => n.id));
                }
                onNodeContextMenuClose();
              },
              shortcut: '⌘G',
              disabled: !canGroup
            },
            {
              label: 'Ungroup',
              icon: '📂',
              onClick: () => {
                onNodeUngroup(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              disabled: contextMenuNode.type !== 'group'
            },
            { type: 'separator' },
            {
              label: contextMenuNode.data?.locked ? 'Unlock' : 'Lock',
              icon: contextMenuNode.data?.locked ? '🔓' : '🔒',
              onClick: () => {
                if (contextMenuNode.data?.locked) {
                  onNodeUnlock(contextMenuNode.id);
                } else {
                  onNodeLock(contextMenuNode.id);
                }
                onNodeContextMenuClose();
              },
              shortcut: '⌘L'
            },
            {
              label: 'Save as Preset',
              icon: '💾',
              onClick: () => {
                onNodeSaveAsPreset(contextMenuNode.id);
                onNodeContextMenuClose();
              }
            },
            { type: 'separator' },
            {
              label: 'Delete',
              icon: '🗑️',
              onClick: () => {
                onNodeDelete(contextMenuNode.id);
                onNodeContextMenuClose();
              },
              shortcut: 'Delete',
              className: 'danger'
            }
          ]}
        />
      )}

      {/* Canvas Context Menu */}
      {canvasContextMenuPosition && (
        <CanvasContextMenu
          position={canvasContextMenuPosition}
          onClose={onCanvasContextMenuClose}
          actions={[
            {
              label: 'Add Node',
              icon: '➕',
              submenu: [
                {
                  label: 'Text Block',
                  onClick: () => {
                    onCanvasAddNode('textBlock', canvasContextMenuPosition);
                    onCanvasContextMenuClose();
                  }
                },
                {
                  label: 'Weighted Choice',
                  onClick: () => {
                    onCanvasAddNode('weightedChoice', canvasContextMenuPosition);
                    onCanvasContextMenuClose();
                  }
                },
                {
                  label: 'Concatenate',
                  onClick: () => {
                    onCanvasAddNode('concat', canvasContextMenuPosition);
                    onCanvasContextMenuClose();
                  }
                },
                {
                  label: 'Output',
                  onClick: () => {
                    onCanvasAddNode('output', canvasContextMenuPosition);
                    onCanvasContextMenuClose();
                  }
                },
                {
                  label: 'Variable',
                  onClick: () => {
                    onCanvasAddNode('variable', canvasContextMenuPosition);
                    onCanvasContextMenuClose();
                  }
                }
              ]
            },
            {
              label: 'Paste',
              icon: '📋',
              onClick: () => {
                onCanvasPaste(canvasContextMenuPosition);
                onCanvasContextMenuClose();
              },
              shortcut: '⌘V',
              disabled: !hasClipboard
            },
            { type: 'separator' },
            {
              label: 'Select All',
              icon: '⬚',
              onClick: () => {
                onCanvasSelectAll();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘A'
            },
            {
              label: 'Deselect All',
              icon: '⬜',
              onClick: () => {
                onCanvasDeselectAll();
                onCanvasContextMenuClose();
              },
              shortcut: 'Esc',
              disabled: !hasSelection
            },
            { type: 'separator' },
            {
              label: 'Undo',
              icon: '↶',
              onClick: () => {
                onCanvasUndo();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘Z',
              disabled: !canUndo
            },
            {
              label: 'Redo',
              icon: '↷',
              onClick: () => {
                onCanvasRedo();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘⇧Z',
              disabled: !canRedo
            },
            { type: 'separator' },
            {
              label: 'Zoom In',
              icon: '🔍',
              onClick: () => {
                onCanvasZoomIn();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘+'
            },
            {
              label: 'Zoom Out',
              icon: '🔍',
              onClick: () => {
                onCanvasZoomOut();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘-'
            },
            {
              label: 'Fit to View',
              icon: '⊡',
              onClick: () => {
                onCanvasZoomToFit();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘0'
            },
            { type: 'separator' },
            {
              label: 'Auto Arrange',
              icon: '📐',
              onClick: () => {
                onCanvasArrange();
                onCanvasContextMenuClose();
              },
              shortcut: '⌘⇧A'
            }
          ]}
        />
      )}
    </>
  );
};