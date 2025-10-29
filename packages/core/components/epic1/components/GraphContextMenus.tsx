import React from 'react';
import type { Node, Edge } from 'reactflow';
import { NodeContextMenu, ContextMenuPosition } from '../nodes/NodeContextMenu';
import { CanvasContextMenu } from '../nodes/CanvasContextMenu';

interface GraphContextMenusProps {
  // Node context menu
  nodeContextMenuPosition?: ContextMenuPosition | null;
  contextMenuNodeId?: string | null;
  nodes?: Node[];
  edges?: Edge[];
  onNodeContextMenuClose?: () => void;
  onNodeDuplicate?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeCopy?: (nodeId: string) => void;
  onNodeCut?: (nodeId: string) => void;
  onNodePaste?: () => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeGroup?: (nodeIds: string[]) => void;
  onNodeUngroup?: (nodeId: string) => void;
  onNodeLock?: (nodeId: string) => void;
  onNodeUnlock?: (nodeId: string) => void;
  onNodeSaveAsPreset?: (nodeId: string | null) => void;
  
  // Canvas context menu
  canvasContextMenuPosition?: ContextMenuPosition | null;
  onCanvasContextMenuClose?: () => void;
  onCanvasAddNode?: (type: string, position: { x: number; y: number }) => void;
  onCanvasPaste?: (position: { x: number; y: number }) => void;
  onCanvasSelectAll?: () => void;
  onCanvasDeselectAll?: () => void;
  onCanvasUndo?: () => void;
  onCanvasRedo?: () => void;
  onCanvasZoomIn?: () => void;
  onCanvasZoomOut?: () => void;
  onCanvasZoomToFit?: () => void;
  onCanvasArrange?: () => void;
  
  // Shared
  canUndo?: boolean;
  canRedo?: boolean;
  hasClipboard?: boolean;
  fallbackPositionSetter?: (pos: ContextMenuPosition | null) => void;
}

/**
 * Container for all graph context menus
 */
export const GraphContextMenus: React.FC<GraphContextMenusProps> = ({
  // Node context menu props
  nodeContextMenuPosition = null,
  contextMenuNodeId = null,
  nodes = [],
  edges = [],
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
  canvasContextMenuPosition = null,
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
  canUndo = false,
  canRedo = false,
  hasClipboard = false,
  fallbackPositionSetter
}) => {
  // Find the node for context menu
  const contextMenuNode = contextMenuNodeId 
    ? nodes.find(n => n.id === contextMenuNodeId) 
    : null;

  // Get selected nodes for group operations
  const selectedNodes = nodes.filter(n => n.selected);
  const hasSelection = selectedNodes.length > 0;
  const canGroup = selectedNodes.length > 1;

  const closeNodeMenu = () => {
    onNodeContextMenuClose?.();
    fallbackPositionSetter?.(null);
  };

  return (
    <>
      {/* Node Context Menu */}
      {nodeContextMenuPosition && contextMenuNode && (
        <NodeContextMenu
          position={nodeContextMenuPosition}
          node={contextMenuNode}
          onClose={closeNodeMenu}
          actions={[
            {
              label: 'Edit',
              icon: '✏️',
              onClick: () => {
                onNodeEdit?.(contextMenuNode.id);
                closeNodeMenu();
              },
              shortcut: 'Enter'
            },
            {
              label: 'Duplicate',
              icon: '📋',
              onClick: () => {
                onNodeDuplicate?.(contextMenuNode.id);
                closeNodeMenu();
              },
              shortcut: '⌘D'
            },
            {
              label: 'Copy',
              icon: '📄',
              onClick: () => {
                onNodeCopy?.(contextMenuNode.id);
                closeNodeMenu();
              },
              shortcut: '⌘C'
            },
            {
              label: 'Cut',
              icon: '✂️',
              onClick: () => {
                onNodeCut?.(contextMenuNode.id);
                closeNodeMenu();
              },
              shortcut: '⌘X'
            },
            {
              label: 'Paste',
              icon: '📋',
              onClick: () => {
                onNodePaste?.();
                closeNodeMenu();
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
                  onNodeGroup?.(selectedNodes.map(n => n.id));
                }
                closeNodeMenu();
              },
              shortcut: '⌘G',
              disabled: !canGroup
            },
            {
              label: 'Ungroup',
              icon: '📂',
              onClick: () => {
                onNodeUngroup?.(contextMenuNode.id);
                closeNodeMenu();
              },
              disabled: contextMenuNode.type !== 'group'
            },
            { type: 'separator' },
            {
              label: contextMenuNode.data?.locked ? 'Unlock' : 'Lock',
              icon: contextMenuNode.data?.locked ? '🔓' : '🔒',
              onClick: () => {
                if (contextMenuNode.data?.locked) {
                  onNodeUnlock?.(contextMenuNode.id);
                } else {
                  onNodeLock?.(contextMenuNode.id);
                }
                closeNodeMenu();
              },
              shortcut: '⌘L'
            },
            {
              label: 'Save as Preset',
              icon: '💾',
              onClick: () => {
                onNodeSaveAsPreset?.(contextMenuNode.id);
                closeNodeMenu();
              }
            },
            { type: 'separator' },
            {
              label: 'Delete',
              icon: '🗑️',
              onClick: () => {
                onNodeDelete?.(contextMenuNode.id);
                closeNodeMenu();
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
          onClose={closeCanvasMenu}
          actions={[
            {
              label: 'Add Node',
              icon: '➕',
              submenu: [
                {
                  label: 'Text Block',
                  onClick: () => {
                    onCanvasAddNode?.('textBlock', canvasContextMenuPosition);
                    closeCanvasMenu();
                  }
                },
                {
                  label: 'Weighted Choice',
                  onClick: () => {
                    onCanvasAddNode?.('weightedChoice', canvasContextMenuPosition);
                    closeCanvasMenu();
                  }
                },
                {
                  label: 'Concatenate',
                  onClick: () => {
                    onCanvasAddNode?.('concat', canvasContextMenuPosition);
                    closeCanvasMenu();
                  }
                },
                {
                  label: 'Output',
                  onClick: () => {
                    onCanvasAddNode?.('output', canvasContextMenuPosition);
                    closeCanvasMenu();
                  }
                },
                {
                  label: 'Variable',
                  onClick: () => {
                    onCanvasAddNode?.('variable', canvasContextMenuPosition);
                    closeCanvasMenu();
                  }
                }
              ]
            },
            {
              label: 'Paste',
              icon: '📋',
              onClick: () => {
                onCanvasPaste?.(canvasContextMenuPosition);
                closeCanvasMenu();
              },
              shortcut: '⌘V',
              disabled: !hasClipboard
            },
            { type: 'separator' },
            {
              label: 'Select All',
              icon: '⬚',
              onClick: () => {
                onCanvasSelectAll?.();
                closeCanvasMenu();
              },
              shortcut: '⌘A'
            },
            {
              label: 'Deselect All',
              icon: '⬜',
              onClick: () => {
                onCanvasDeselectAll?.();
                closeCanvasMenu();
              },
              shortcut: 'Esc',
              disabled: !hasSelection
            },
            { type: 'separator' },
            {
              label: 'Undo',
              icon: '↶',
              onClick: () => {
                onCanvasUndo?.();
                closeCanvasMenu();
              },
              shortcut: '⌘Z',
              disabled: !canUndo
            },
            {
              label: 'Redo',
              icon: '↷',
              onClick: () => {
                onCanvasRedo?.();
                closeCanvasMenu();
              },
              shortcut: '⌘⇧Z',
              disabled: !canRedo
            },
            { type: 'separator' },
            {
              label: 'Zoom In',
              icon: '🔍',
              onClick: () => {
                onCanvasZoomIn?.();
                closeCanvasMenu();
              },
              shortcut: '⌘+'
            },
            {
              label: 'Zoom Out',
              icon: '🔍',
              onClick: () => {
                onCanvasZoomOut?.();
                closeCanvasMenu();
              },
              shortcut: '⌘-'
            },
            {
              label: 'Fit to View',
              icon: '⊡',
              onClick: () => {
                onCanvasZoomToFit?.();
                closeCanvasMenu();
              },
              shortcut: '⌘0'
            },
            { type: 'separator' },
            {
              label: 'Auto Arrange',
              icon: '📐',
              onClick: () => {
                onCanvasArrange?.();
                closeCanvasMenu();
              },
              shortcut: '⌘⇧A'
            }
          ]}
        />
      )}
    </>
  );
};
