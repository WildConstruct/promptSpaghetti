/**
 * Complete mobile app layout
 */

import React, { useState } from 'react';
import { GraphDocument, GraphNode } from '@prompt-spaghetti/graph-core';
import { 
  MobileHeader, 
  BottomNavigation, 
  SlideMenu,
  HamburgerMenu
} from '../components/MobileNavigation';
import { MobileGraphCanvas } from '../components/MobileGraphCanvas';
import { MobileNodeEditor } from '../components/MobileNodeEditor';
import { MobileButton } from '../components/MobileButton';
import { mobileStyles, getSafeAreaPadding, MOBILE_SPACING } from '../design-system';
import { cn } from '../../utils';

export interface MobileAppLayoutProps {
  graph: GraphDocument;
  onGraphUpdate?: (graph: GraphDocument) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileAppLayout: React.FC<MobileAppLayoutProps> = ({
  graph,
  onGraphUpdate,
  className,
  style
}) => {
  const [activeView, setActiveView] = useState<'canvas' | 'nodes' | 'preview' | 'settings'>('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const selectedNode = selectedNodeId ? graph.nodes.find(n => n.id === selectedNodeId) : null;
  
  // Bottom navigation items
  const bottomNavItems = [
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'nodes', label: 'Nodes', icon: '📦' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];
  
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };
  
  const handleNodeEdit = (nodeId: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
    }
  };
  
  const handleNodeUpdate = (nodeId: string, updates: Partial<GraphNode>) => {
    const updatedNodes = graph.nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    );
    onGraphUpdate?.({ ...graph, nodes: updatedNodes });
  };
  
  const handleNodeDelete = (nodeId: string) => {
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
  
  return (
    <div
      className={cn('mobile-app-layout', className)}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
        ...mobileStyles.fullHeight,
        ...style
      }}
    >
      {/* Header */}
      <MobileHeader
        title="Prompt Graph Editor"
        leftAction={{
          icon: <HamburgerMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />,
          onClick: () => setMenuOpen(!menuOpen),
          label: 'Menu'
        }}
        rightActions={[
          {
            icon: '💾',
            onClick: () => console.log('Save'),
            label: 'Save'
          }
        ]}
      />
      
      {/* Main content */}
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Canvas View */}
        {activeView === 'canvas' && (
          <MobileGraphCanvas
            graph={graph}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            onNodeEdit={handleNodeEdit}
            onAddNode={handleAddNode}
          />
        )}
        
        {/* Nodes List View */}
        {activeView === 'nodes' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: MOBILE_SPACING.md,
              ...mobileStyles.smoothScroll
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: MOBILE_SPACING.lg }}>Nodes</h2>
            
            {/* Add node button */}
            <MobileButton
              variant="primary"
              mobileFullWidth
              onClick={() => console.log('Add node')}
              style={{ marginBottom: MOBILE_SPACING.lg }}
            >
              + Add New Node
            </MobileButton>
            
            {/* Nodes list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: MOBILE_SPACING.sm }}>
              {graph.nodes.map(node => (
                <NodeListItem
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedNodeId}
                  onSelect={() => handleNodeSelect(node.id)}
                  onEdit={() => handleNodeEdit(node.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Preview View */}
        {activeView === 'preview' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: MOBILE_SPACING.md,
              ...mobileStyles.smoothScroll
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: MOBILE_SPACING.lg }}>Preview</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Preview functionality coming soon...
            </p>
          </div>
        )}
        
        {/* Settings View */}
        {activeView === 'settings' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: MOBILE_SPACING.md,
              ...mobileStyles.smoothScroll
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: MOBILE_SPACING.lg }}>Settings</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Settings coming soon...
            </p>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation
        items={bottomNavItems}
        activeId={activeView}
        onItemClick={(id) => setActiveView(id as any)}
      />
      
      {/* Side Menu */}
      <SlideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        position="left"
      >
        <div style={{ padding: MOBILE_SPACING.lg }}>
          <h2>Menu</h2>
          <nav>
            <MenuItem onClick={() => { console.log('New'); setMenuOpen(false); }}>
              📄 New Graph
            </MenuItem>
            <MenuItem onClick={() => { console.log('Open'); setMenuOpen(false); }}>
              📂 Open
            </MenuItem>
            <MenuItem onClick={() => { console.log('Export'); setMenuOpen(false); }}>
              📤 Export
            </MenuItem>
            <MenuItem onClick={() => { console.log('Help'); setMenuOpen(false); }}>
              ❓ Help
            </MenuItem>
          </nav>
        </div>
      </SlideMenu>
      
      {/* Node Editor Modal */}
      {editingNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-background)',
            zIndex: 1002
          }}
        >
          <MobileNodeEditor
            node={editingNode}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onClose={() => setEditingNode(null)}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Node list item component
 */
interface NodeListItemProps {
  node: GraphNode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

const NodeListItem: React.FC<NodeListItemProps> = ({ node, isSelected, onSelect, onEdit }) => {
  const nodeIcons: Record<string, string> = {
    subject: '👤',
    action: '⚡',
    attribute: '🏷️',
    weightedChoice: '🎲',
    output: '📤',
    concat: '🔗',
    variable: '📦'
  };
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: MOBILE_SPACING.md,
        backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
        color: isSelected ? 'white' : 'var(--color-text)',
        borderRadius: 8,
        cursor: 'pointer',
        ...mobileStyles.tapHighlight
      }}
      onClick={onSelect}
    >
      <div style={{ fontSize: 24, marginRight: MOBILE_SPACING.md }}>
        {nodeIcons[node.type] || '📦'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{node.type}</div>
        <div style={{ 
          fontSize: 12, 
          opacity: 0.8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {node.id}
        </div>
      </div>
      <MobileButton
        size="sm"
        variant={isSelected ? 'secondary' : 'ghost'}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        Edit
      </MobileButton>
    </div>
  );
};

/**
 * Menu item component
 */
const MenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
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
      ...mobileStyles.tapHighlight
    }}
  >
    {children}
  </button>
);