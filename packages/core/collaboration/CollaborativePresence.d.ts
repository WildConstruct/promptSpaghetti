/**
 * Collaborative Presence Overlay - Epic 9.1.2
 * Shows user cursors, selections, and presence indicators
 */
import React from 'react';
import { UserPresence } from './collaborativeGraphStore';
}
interface CollaborativePresenceProps {
    userCursors: Array<{
        userId: string;
        user: UserPresence;
        position: {
            x: number;
            y: number;
}
        };
        nodeId?: string;
    }>;
    remoteSelections: Map<string, UserPresence[]>;
    className?: string;
/**
 * Main collaborative presence overlay component
 */
export declare const CollaborativePresence: React.FC<CollaborativePresenceProps>;
}
interface CollaborationStatusProps {
    isCollaborative: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    connectedUserCount: number;
    className?: string;
/**
 * Connection status indicator component
 */
export declare const CollaborationStatus: React.FC<CollaborationStatusProps>;
}
interface UserAvatarsProps {
    connectedUsers: Map<string, UserPresence>;
    localUserId?: string;
    maxVisible?: number;
    className?: string;
/**
 * Connected users avatar list
 */
export declare const UserAvatars: React.FC<UserAvatarsProps>;
}
export {};
//# sourceMappingURL=CollaborativePresence.d.ts.map