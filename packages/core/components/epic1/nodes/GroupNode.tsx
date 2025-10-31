/**
 * GroupNode component for collapsed group visualization
 * Story 1.27: Node Grouping Hierarchy
 */

import React, { useState, memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import './GroupNode.css';

interface NodeGroup {
  id: string;
  name: string;
  nodeIds: Set<string>;
  collapsed: boolean;
  parentGroupId?: string;
  metadata: {
    color?: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
}

interface GroupNodeData {
  group: NodeGroup;
  nodeCount: number;
  onToggle?: (groupId: string) => void;
  onEdit?: (groupId: string, updates: Partial<NodeGroup>) => void;
  onDelete?: (groupId: string, deleteContents: boolean) => void;
  performanceMetrics?: {
    lastOperationTime: number;
  };
}

const InvalidGroupNode: React.FC<{ id: string }> = ({ id }) => (
  <div
    className="group-node-error"
    style={{
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: '#ffebee',
      border: '2px dashed #f44336',
      minWidth: '200px',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f44336'
    }}
  >
    ⚠️ Invalid Group Node ({id})
  </div>
);

/**
 * GroupNode component with performance optimization
 */
const GroupNodeComponent = ({
  data,
  selected,
  id
}: NodeProps<GroupNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!data?.group) {
    console.warn(`[GroupNode] Missing data for node ${id}`, { data });
    return <InvalidGroupNode id={id} />;
  }

  const { group, nodeCount, onToggle, onEdit, performanceMetrics, onDelete } =
    data;

  const handleToggle = () => {
    if (!onToggle) {
      return;
    }

    setIsCalculating(true);
    Promise.resolve(onToggle(group.id)).finally(() => setIsCalculating(false));
  };

  const handleNameEdit = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!onEdit) {
      return;
    }

    const newName = event.target.value.trim();
    if (newName && newName !== group.name) {
      onEdit(group.id, { name: newName });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      event.currentTarget.value = group.name;
      setIsEditing(false);
    }
  };

    // Determine visual style based on state
    const groupStyle: React.CSSProperties = {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: group.metadata?.color || '#f0f0f0',
      border: `2px ${selected ? 'solid' : 'dashed'} ${
        selected ? '#1a73e8' : '#ccc'
      }`,
      minWidth: '200px',
        minHeight: '60px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: selected ? '0 4px 12px rgba(26, 115, 232, 0.3)' : undefined
    };

    return (
      <div
        className="group-node"
        style={groupStyle}
        onContextMenu={e => {
          e.preventDefault();
          setShowMenu(prev => !prev);
        }}
      >
        {/* Handles for connections */}
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555' }}
        />

        {/* Performance indicator */}
        {isCalculating && (
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#ffaa00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              animation: 'spin 1s linear infinite'
            }}
          >
            ⟳
          </div>
        )}

        {/* Performance badge for large groups */}
        {nodeCount > 50 && (
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '4px',
              padding: '2px 4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}
            title="Optimized with workers"
          >
            ⚡
          </div>
        )}

        {/* Group header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            paddingBottom: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Group icon */}
            <span style={{ fontSize: '16px' }}>
              {group.collapsed ? '📁' : '📂'}
            </span>

            {/* Group name */}
            {isEditing ? (
              <input
                defaultValue={group.name}
                onBlur={handleNameEdit}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  background: 'white',
                  border: '1px solid #1a73e8',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  outline: 'none'
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div
                onDoubleClick={() => setIsEditing(true)}
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'text'
                }}
              >
                {group.name}
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')
            }
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {group.collapsed ? '▶' : '▼'}
          </button>
        </div>

        {/* Group content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666'
          }}
        >
          <span>{nodeCount} nodes</span>

          {/* Nesting indicator */}
          {group.parentGroupId && (
            <span
              style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px'
              }}
            >
              nested
            </span>
          )}

          {/* Performance metric */}
          {performanceMetrics?.lastOperationTime && (
            <span
              style={{
                fontSize: '10px',
                color:
                  performanceMetrics.lastOperationTime > 50
                    ? '#ff6b6b'
                    : '#51cf66'
              }}
            >
              {performanceMetrics.lastOperationTime.toFixed(0)}ms
            </span>
          )}
        </div>

        {/* Context menu */}
        {showMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '150px'
            }}
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              onClick={() => {
                onEdit?.(group.id, { collapsed: !group.collapsed });
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {group.collapsed ? 'Expand' : 'Collapse'}
            </button>

            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Rename
            </button>

            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />

            <button
              onClick={() => {
                onDelete?.(group.id, false);
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#ff6b6b'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Ungroup
            </button>

            <button
              onClick={() => {
                onDelete?.(group.id, true);
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#ff6b6b'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Delete with contents
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

GroupNodeComponent.displayName = 'GroupNodeComponent';

export const GroupNode = memo(GroupNodeComponent);
GroupNode.displayName = 'GroupNode';

export default GroupNode;
