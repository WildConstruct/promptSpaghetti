/**
 * Collaborative Presence Overlay - Epic 9.1.2
 * Shows user cursors, selections, and presence indicators
 */
import React from 'react';
import { UserPresence } from './collaborativeGraphStore';
interface CollaborativePresenceProps {
    userCursors: Array<{}, userId>;
    string: any;
    user: UserPresence;
    position: {
        x: number;
        y: number;
    };
    nodeId?: string;
}
/**
 * Main collaborative presence overlay component
 */
export declare const CollaborativePresence: React.FC<CollaborativePresenceProps>;
export {};
//# sourceMappingURL=CollaborativePresence.d.ts.map