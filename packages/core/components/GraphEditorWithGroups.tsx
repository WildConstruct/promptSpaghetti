/**
 * Example GraphEditor integration with grouping functionality
 * Story 1.27: Node Grouping Hierarchy
 * Shows how to integrate grouping with React Flow
 */

import type { Connection, Edge, Node, NodeTypes } from 'reactflow';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState
} from 'reactflow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import 'reactflow/dist/style.css';

import GroupNode from './nodes/GroupNode';
import { useGroupedNodes, useGroupKeyboardShortcuts } from '../hooks/useGroupedNodes';
import { usePerformance } from '../hooks/usePerformance';
import { GroupingSlice } from '../stores/groupingSlice';
import { NodeGroup } from '../types/groups';

// Extract styles to constants for better maintainability
const CONTAINER_STYLE = { width: '100%', height: '100%' };

const STATS_PANEL_STYLE = {
  padding: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace'
};

const ACTIONS_PANEL_STYLE = {
  padding: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '4px'
};

const BUTTON_STYLE = {
  padding: '6px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  marginBottom: '4px',
  width: '100%'
};

const PERFORMANCE_PANEL_STYLE = {
  padding: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#00ff00',
  borderRadius: '4px',
  fontSize: '10px',
  fontFamily: 'monospace'
};

// Define node types including our custom GroupNode
const nodeTypes: NodeTypes = {
  groupNode: GroupNode
  // Add other custom node types here
};

interface GraphEditorWithGroupsProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  groupingStore: GroupingSlice; // Pass the grouping store slice
}

/**
 * GraphEditor with full grouping support
 */
const GraphEditorWithGroups: React.FC<GraphEditorWithGroupsProps> = ({
  initialNodes = [],
  initialEdges = [],
  groupingStore
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { perfMonitor } = usePerformance();

  // Get grouped nodes with performance optimization
  const { groupedNodes, isCalculating, stats } = useGroupedNodes(
    nodes,
    groupingStore.groups,
    {
      enableCaching: true,
      enableWorkers: true
    }
  );

  // Update React Flow nodes when grouping changes
  useEffect(() => {
    setNodes(groupedNodes);
  }, [groupedNodes, setNodes]);

  // Handle node selection
  const onSelectionChange = useCallback((selection: { nodes: Node[] }) => {
    setSelectedNodes(selection.nodes.map(node => node.id));
  }, []);

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection) => {
      perfMonitor?.measure('edge:connect', () => {
        setEdges(eds => addEdge(params, eds));
      });
    },
    [setEdges, perfMonitor]
  );

  // Group operations
  const handleCreateGroup = useCallback(
    async (nodeIds: string[]) => {
      perfMonitor?.mark('group:create:start');

      try {
        await groupingStore.createGroup(nodeIds);

        // Clear selection after grouping
        setSelectedNodes([]);
      } catch (error) {
        // TODO: Show error to user via toast or notification
        // eslint-disable-next-line no-console
        console.error('Failed to create group:', error);
      } finally {
        perfMonitor?.mark('group:create:end');
        perfMonitor?.measureMarks('group:create:start', 'group:create:end');
      }
    },
    [groupingStore, perfMonitor]
  );

  const handleToggleGroup = useCallback(
    async (groupId: string) => {
      await groupingStore.toggleGroup(groupId);
    },
    [groupingStore]
  );

  const handleEditGroup = useCallback(
    async (groupId: string, updates: Partial<NodeGroup>) => {
      await groupingStore.updateGroup(groupId, updates);
    },
    [groupingStore]
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string, deleteContents: boolean) => {
      await groupingStore.deleteGroup(groupId, deleteContents);
    },
    [groupingStore]
  );

  // Setup keyboard shortcuts
  useGroupKeyboardShortcuts(
    selectedNodes,
    handleCreateGroup,
    groupId => handleDeleteGroup(groupId, false),
    handleToggleGroup
  );

  // Prepare node data with group callbacks
  const nodesWithCallbacks = useMemo(() => {
    return groupedNodes.map(node => {
      if (node.type === 'groupNode') {
        return {
          ...node,
          data: {
            ...node.data,
            onToggle: handleToggleGroup,
            onEdit: handleEditGroup,
            onDelete: handleDeleteGroup,
            performanceMetrics: groupingStore.performanceMetrics
          }
        };
      }
      return node;
    });
  }, [
    groupedNodes,
    handleToggleGroup,
    handleEditGroup,
    handleDeleteGroup,
    groupingStore.performanceMetrics
  ]);

  // Context menu for grouping
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();

      if (selectedNodes.length > 1 && selectedNodes.includes(node.id)) {
        handleCreateGroup(selectedNodes);
      }
    },
    [selectedNodes, handleCreateGroup]
  );

  const handleValidateHierarchy = useCallback(async () => {
    const validation = await groupingStore.validateHierarchy();
    if (!validation.valid) {
      setValidationMessage(
        `Hierarchy validation failed:\n${validation.errors.join('\n')}`
      );
      return;
    }
    setValidationMessage('Hierarchy is valid!');
  }, [groupingStore]);

  return (
    <div style={CONTAINER_STYLE}>
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* Group Statistics Panel */}
        <Panel position="top-left">
          <div style={STATS_PANEL_STYLE}>
            <div>Total Nodes: {stats.totalNodes}</div>
            <div>Visible Nodes: {stats.visibleNodes}</div>
            <div>Groups: {stats.totalGroups}</div>
            <div>Collapsed: {stats.collapsedGroups}</div>
            <div>Hidden: {stats.hiddenNodes}</div>
            {isCalculating && (
              <div style={{ color: '#ff6b6b' }}>Calculating...</div>
            )}
          </div>
        </Panel>

        {/* Group Actions Panel */}
        <Panel position="top-right">
          <div style={ACTIONS_PANEL_STYLE}>
            <button
              onClick={() => {
                if (selectedNodes.length > 1) {
                  handleCreateGroup(selectedNodes);
                }
              }}
              disabled={selectedNodes.length < 2}
              style={{
                ...BUTTON_STYLE,
                backgroundColor: selectedNodes.length > 1 ? '#1a73e8' : '#ccc',
                cursor: selectedNodes.length > 1 ? 'pointer' : 'not-allowed'
              }}
            >
              Group Selected ({selectedNodes.length})
            </button>

            <button
              onClick={handleValidateHierarchy}
              style={{
                ...BUTTON_STYLE,
                backgroundColor: '#4CAF50'
              }}
            >
              Validate Hierarchy
            </button>

            <button
              onClick={() => groupingStore.invalidateCaches()}
              style={{
                ...BUTTON_STYLE,
                backgroundColor: '#ff9800',
                marginBottom: 0
              }}
            >
              Clear Cache
            </button>

            {validationMessage && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  color: validationMessage.startsWith('Hierarchy is valid')
                    ? '#0f9d58'
                    : '#d93025'
                }}
              >
                {validationMessage}
              </div>
            )}
          </div>
        </Panel>

        {/* Performance Metrics (if available) */}
        {groupingStore.performanceMetrics.lastOperationTime > 0 && (
          <Panel position="bottom-right">
            <div style={PERFORMANCE_PANEL_STYLE}>
              Last Op:{' '}
              {groupingStore.performanceMetrics.lastOperationTime.toFixed(0)}ms
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default GraphEditorWithGroups;

/**
 * Example usage with Zustand store
 *
 * ```typescript
 * import { create } from 'zustand';
 * import { createGroupingSlice } from '@/packages/core/stores/groupingSlice';
 *
 * const useStore = create(createGroupingSlice);
 *
 * function App() {
 *   const groupingStore = useStore();
 *
 *   return (
 *     <GraphEditorWithGroups
 *       initialNodes={nodes}
 *       initialEdges={edges}
 *       groupingStore={groupingStore}
 *     />
 *   );
 * }
 * ```
 */
