import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Complete mobile app layout
 */
import { useState } from 'react';
import { MobileHeader, BottomNavigation, SlideMenu, HamburgerMenu } from '../components/MobileNavigation';
import { MobileGraphCanvas } from '../components/MobileGraphCanvas';
import { MobileNodeEditor } from '../components/MobileNodeEditor';
import { MobileButton } from '../components/MobileButton';
import { mobileStyles, MOBILE_SPACING } from '../design-system';
import { cn } from '../../utils';
export const MobileAppLayout = ({ graph, onGraphUpdate, className, style }) => {
  const [activeView, setActiveView] = useState('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedNode = selectedNodeId ? graph.nodes.find(n => n.id === selectedNodeId) : null;
  // Bottom navigation items
  const bottomNavItems = [
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'nodes', label: 'Nodes', icon: '📦' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  const handleNodeSelect = nodeId => {
    setSelectedNodeId(nodeId);
  };
  const handleNodeEdit = nodeId => {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
    }
  };
  const handleNodeUpdate = (nodeId, updates) => {
    const updatedNodes = graph.nodes.map(node => (node.id === nodeId ? { ...node, ...updates } : node));
    onGraphUpdate?.({ ...graph, nodes: updatedNodes });
  };
  const handleNodeDelete = nodeId => {
    const updatedNodes = graph.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = graph.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    onGraphUpdate?.({ ...graph, nodes: updatedNodes, edges: updatedEdges });
    setSelectedNodeId(null);
    setEditingNode(null);
  };
  const handleAddNode = () => {
    // Open node palette or add node dialog
    setActiveView('nodes');
  };
  return _jsxs('div', {
    className: cn('mobile-app-layout', className),
    style: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-background)',
      ...mobileStyles.fullHeight,
      ...style,
    },
    children: [
      _jsx(MobileHeader, {
        title: 'Prompt Graph Editor',
        leftAction: {
          icon: _jsx(HamburgerMenu, { isOpen: menuOpen, onToggle: () => setMenuOpen(!menuOpen) }),
          onClick: () => setMenuOpen(!menuOpen),
          label: 'Menu',
        },
        rightActions: [
          {
            icon: '💾',
            onClick: () => console.log('Save'),
            label: 'Save',
          },
        ],
      }),
      _jsxs('main', {
        style: {
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        },
        children: [
          activeView === 'canvas' &&
            _jsx(MobileGraphCanvas, {
              graph: graph,
              selectedNodeId: selectedNodeId,
              onNodeSelect: handleNodeSelect,
              onNodeEdit: handleNodeEdit,
              onAddNode: handleAddNode,
            }),
          activeView === 'nodes' &&
            _jsxs('div', {
              style: {
                height: '100%',
                overflowY: 'auto',
                padding: MOBILE_SPACING.md,
                ...mobileStyles.smoothScroll,
              },
              children: [
                _jsx('h2', { style: { marginTop: 0, marginBottom: MOBILE_SPACING.lg }, children: 'Nodes' }),
                _jsx(MobileButton, {
                  variant: 'primary',
                  mobileFullWidth: true,
                  onClick: () => console.log('Add node'),
                  style: { marginBottom: MOBILE_SPACING.lg },
                  children: '+ Add New Node',
                }),
                _jsx('div', {
                  style: { display: 'flex', flexDirection: 'column', gap: MOBILE_SPACING.sm },
                  children: graph.nodes.map(node =>
                    _jsx(
                      NodeListItem,
                      {
                        node: node,
                        isSelected: node.id === selectedNodeId,
                        onSelect: () => handleNodeSelect(node.id),
                        onEdit: () => handleNodeEdit(node.id),
                      },
                      node.id
                    )
                  ),
                }),
              ],
            }),
          activeView === 'preview' &&
            _jsxs('div', {
              style: {
                height: '100%',
                overflowY: 'auto',
                padding: MOBILE_SPACING.md,
                ...mobileStyles.smoothScroll,
              },
              children: [
                _jsx('h2', { style: { marginTop: 0, marginBottom: MOBILE_SPACING.lg }, children: 'Preview' }),
                _jsx('p', {
                  style: { color: 'var(--color-text-secondary)' },
                  children: 'Preview functionality coming soon...',
                }),
              ],
            }),
          activeView === 'settings' &&
            _jsxs('div', {
              style: {
                height: '100%',
                overflowY: 'auto',
                padding: MOBILE_SPACING.md,
                ...mobileStyles.smoothScroll,
              },
              children: [
                _jsx('h2', { style: { marginTop: 0, marginBottom: MOBILE_SPACING.lg }, children: 'Settings' }),
                _jsx('p', { style: { color: 'var(--color-text-secondary)' }, children: 'Settings coming soon...' }),
              ],
            }),
        ],
      }),
      _jsx(BottomNavigation, { items: bottomNavItems, activeId: activeView, onItemClick: id => setActiveView(id) }),
      _jsx(SlideMenu, {
        isOpen: menuOpen,
        onClose: () => setMenuOpen(false),
        position: 'left',
        children: _jsxs('div', {
          style: { padding: MOBILE_SPACING.lg },
          children: [
            _jsx('h2', { children: 'Menu' }),
            _jsxs('nav', {
              children: [
                _jsx(MenuItem, {
                  onClick: () => {
                    console.log('New');
                    setMenuOpen(false);
                  },
                  children: '\uD83D\uDCC4 New Graph',
                }),
                _jsx(MenuItem, {
                  onClick: () => {
                    console.log('Open');
                    setMenuOpen(false);
                  },
                  children: '\uD83D\uDCC2 Open',
                }),
                _jsx(MenuItem, {
                  onClick: () => {
                    console.log('Export');
                    setMenuOpen(false);
                  },
                  children: '\uD83D\uDCE4 Export',
                }),
                _jsx(MenuItem, {
                  onClick: () => {
                    console.log('Help');
                    setMenuOpen(false);
                  },
                  children: '\u2753 Help',
                }),
              ],
            }),
          ],
        }),
      }),
      editingNode &&
        _jsx('div', {
          style: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-background)',
            zIndex: 1002,
          },
          children: _jsx(MobileNodeEditor, {
            node: editingNode,
            onUpdate: handleNodeUpdate,
            onDelete: handleNodeDelete,
            onClose: () => setEditingNode(null),
          }),
        }),
    ],
  });
};
const NodeListItem = ({ node, isSelected, onSelect, onEdit }) => {
  const nodeIcons = {
    subject: '👤',
    action: '⚡',
    attribute: '🏷️',
    weightedChoice: '🎲',
    output: '📤',
    concat: '🔗',
    variable: '📦',
  };
  return _jsxs('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: MOBILE_SPACING.md,
      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
      color: isSelected ? 'white' : 'var(--color-text)',
      borderRadius: 8,
      cursor: 'pointer',
      ...mobileStyles.tapHighlight,
    },
    onClick: onSelect,
    children: [
      _jsx('div', { style: { fontSize: 24, marginRight: MOBILE_SPACING.md }, children: nodeIcons[node.type] || '📦' }),
      _jsxs('div', {
        style: { flex: 1 },
        children: [
          _jsx('div', { style: { fontWeight: 500 }, children: node.type }),
          _jsx('div', {
            style: {
              fontSize: 12,
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            children: node.id,
          }),
        ],
      }),
      _jsx(MobileButton, {
        size: 'sm',
        variant: isSelected ? 'secondary' : 'ghost',
        onClick: e => {
          e.stopPropagation();
          onEdit();
        },
        children: 'Edit',
      }),
    ],
  });
};
/**
 * Menu item component
 */
const MenuItem = ({ onClick, children }) =>
  _jsx('button', {
    onClick: onClick,
    style: {
      display: 'block',
      width: '100%',
      padding: MOBILE_SPACING.md,
      marginBottom: MOBILE_SPACING.sm,
      background: 'none',
      border: 'none',
      textAlign: 'left',
      fontSize: 16,
      cursor: 'pointer',
      borderRadius: 8,
      transition: 'background-color 0.2s',
      ...mobileStyles.tapHighlight,
    },
    children: children,
  });
//# sourceMappingURL=MobileAppLayout.js.map
