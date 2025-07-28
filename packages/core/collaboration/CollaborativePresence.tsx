/**
 * Collaborative Presence Overlay - Epic 9.1.2
 * Shows user cursors, selections, and presence indicators
 */
import React from 'react';
import { useReactFlow } from 'reactflow';
import { UserPresence } from './collaborativeGraphStore';
interface UserCursorProps {
  user: UserPresence;
  position: { x: number; y: number };
  nodeId?: string;
}
/**
 * Individual user cursor component
 */
const UserCursor: React.FC<UserCursorProps> = ({ user, position, nodeId }) => {
  const cursorStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    pointerEvents: 'none',
    zIndex: 1000,
    transform: 'translate(-2px, -2px)'
  };
  return ()
    <div style={cursorStyle}>
      {/* Cursor pointer */}
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path
          d="M0 0L0 13L4 9L6 11L8 9L0 0Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      {/* User name label */}
      <div
        style={{
          marginTop: 2,
          marginLeft: 16,
          padding: '2px 6px',
          backgroundColor: user.color,
          color: 'white',
          borderRadius: 3,
          fontSize: '11px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      >
        {user.name}
      </div>
    </div>
  );
};
interface NodeSelectionOverlayProps {
  nodeId: string;
  users: UserPresence[];
  nodePosition: { x: number; y: number };
  nodeWidth: number;
  nodeHeight: number;
}
/**
 * Selection overlay for nodes being edited by other users
 */
const NodeSelectionOverlay: React.FC<NodeSelectionOverlayProps> = ({)
  nodeId,
  users,
  nodePosition,
  nodeWidth,
  nodeHeight
}) => {
  const primaryUser = users[0]; // Use first user's color;
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    left: nodePosition.x - 2,
    top: nodePosition.y - 2,
    width: nodeWidth + 4,
    height: nodeHeight + 4,
    border: `2px solid ${primaryUser.color}`,}
    borderRadius: 6,
    pointerEvents: 'none',
    zIndex: 999,
    backgroundColor: `${primaryUser.color}20`, // 20% opacity}
    boxShadow: `0 0 0 1px ${primaryUser.color}40`}
  };
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    top: -24,
    left: 0,
    padding: '2px 6px',
    backgroundColor: primaryUser.color,
    color: 'white',
    borderRadius: 3,
    fontSize: '10px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  };
  const userNames = users.map(u => u.name).join(', ');
  const isMultiple = users.length > 1;
  return ()
    <div style={overlayStyle}>
      <div style={labelStyle}>
        {isMultiple ? `${users.length} users` : userNames}
      </div>
    </div>
  );
};
interface CollaborativePresenceProps {
  userCursors: Array<{,
    userId: string;
    user: UserPresence;
    position: { x: number; y: number };
    nodeId?: string;
  }>;
  remoteSelections: Map<string, UserPresence[]>;
  className?: string;
}
/**
 * Main collaborative presence overlay component
 */
export const CollaborativePresence: React.FC<CollaborativePresenceProps> = ({)
  userCursors,
  remoteSelections,
  className
}) => {
  const reactFlow = useReactFlow();
  // Get node positions for selection overlays
  const getNodeRect = (nodeId: string) => {
    const node = reactFlow.getNode(nodeId);
    if (!node) return null;
    return {
      x: node.position.x,
      y: node.position.y,
      width: node.width || 200, // Default width
      height: node.height || 100 // Default height
    };
  };
  return ()
    <div 
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Render user cursors */}
      {userCursors.map(({ userId, user, position }) => ()
        <UserCursor
          key={userId}
          user={user}
          position={position}
        />
      ))}
      {/* Render node selection overlays */}
      {Array.from(remoteSelections.entries()).map(([nodeId, users]) => {
        const nodeRect = getNodeRect(nodeId);
        if (!nodeRect) return null;
        return ()
          <NodeSelectionOverlay
            key={nodeId}
            nodeId={nodeId}
            users={users}
            nodePosition={{ x: nodeRect.x, y: nodeRect.y }}
            nodeWidth={nodeRect.width}
            nodeHeight={nodeRect.height}
          />
        );
      })}
    </div>
  );
};
interface CollaborationStatusProps {
  isCollaborative: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connectedUserCount: number;
  className?: string;
}
/**
 * Connection status indicator component
 */
export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({)
  isCollaborative,
  connectionStatus,
  connectedUserCount,
  className
}) => {
  if (!isCollaborative) return null;
  const getStatusColor = () => {
    switch (connectionStatus) {
    case 'connected': return '#10b981';
    case 'connecting': return '#f59e0b';
    case 'disconnected': return '#6b7280';
    case 'error': return '#ef4444';
    default: return '#6b7280';
    }
  };
  const getStatusText = () => {
    switch (connectionStatus) {
    case 'connected': return `Connected • ${connectedUserCount} user${connectedUserCount !== 1 ? 's' : ''}`;}
    case 'connecting': return 'Connecting...';
    case 'disconnected': return 'Disconnected';
    case 'error': return 'Connection error';
    default: return 'Unknown';
    }
  };
  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#1f2937',
    color: 'white',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #374151'
  };
  const dotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(),
    ...(connectionStatus === 'connecting' && {)
      animation: 'pulse 2s infinite'
    })
  };
  return ()
    <div className={className} style={statusStyle}>
      <div style={dotStyle} />
      <span>{getStatusText()}</span>
    </div>
  );
};
interface UserAvatarsProps {
  connectedUsers: Map<string, UserPresence>;
  localUserId?: string;
  maxVisible?: number;
  className?: string;
}
/**
 * Connected users avatar list
 */
export const UserAvatars: React.FC<UserAvatarsProps> = ({)
  connectedUsers,
  localUserId,
  maxVisible = 5,
  className
}) => {
  const users = Array.from(connectedUsers.values());
    .filter(user => user.userId !== localUserId)
    .slice(0, maxVisible);
  const extraCount = Math.max(0, connectedUsers.size - maxVisible - 1); // -1 for local user;
  if (users.length === 0) return null;
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };
  const avatarStyle = (color: string): React.CSSProperties => ({)
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: color,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    border: '2px solid white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  });
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return ()
    <div className={className} style={containerStyle}>
      {users.map(user => ()
        <div
          key={user.userId}
          style={avatarStyle(user.color)}
          title={user.name}
        >
          {getInitials(user.name)}
        </div>
      ))}
      {extraCount > 0 && ()
        <div
          style={avatarStyle('#6b7280')}
          title={`${extraCount} more user${extraCount !== 1 ? 's' : ''}`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
};